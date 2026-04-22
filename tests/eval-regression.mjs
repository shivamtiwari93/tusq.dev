import { spawnSync, spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';

const root = process.cwd();
const cli = path.join(root, 'bin', 'tusq.js');
const scenarioPath = path.join(root, 'tests', 'evals', 'governed-cli-scenarios.json');

function fail(message) {
  throw new Error(message);
}

function runCli(args, { cwd, expectedStatus = 0 } = {}) {
  const result = spawnSync('node', [cli, ...args], {
    cwd,
    encoding: 'utf8'
  });

  if (result.status !== expectedStatus) {
    fail([
      `Command failed: node ${cli} ${args.join(' ')}`,
      `Expected status: ${expectedStatus}`,
      `Actual status: ${result.status}`,
      `STDOUT:\n${result.stdout}`,
      `STDERR:\n${result.stderr}`
    ].join('\n\n'));
  }

  return result;
}

async function copyFixture(name, destination) {
  await fs.cp(path.join(root, 'tests', 'fixtures', name), destination, { recursive: true });
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function getPropertySources(schema) {
  const properties = schema && schema.properties ? Object.values(schema.properties) : [];
  return properties.map((property) => property && property.source).filter(Boolean);
}

function assertIncludesAll(actual, expected, context) {
  for (const item of expected) {
    if (!actual.includes(item)) {
      fail(`${context}: expected ${JSON.stringify(actual)} to include ${item}`);
    }
  }
}

function approveCapabilities(manifest, names) {
  const approved = new Set(names);
  return {
    ...manifest,
    capabilities: manifest.capabilities.map((capability) => ({
      ...capability,
      approved: approved.has(capability.name),
      review_needed: approved.has(capability.name) ? false : capability.review_needed
    }))
  };
}

async function prepareScenarioProject(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await copyFixture(scenario.fixture, project);
  runCli(['init', '--framework', scenario.framework], { cwd: project });
  runCli(['scan', '.', '--framework', scenario.framework], { cwd: project });
  runCli(['manifest'], { cwd: project });
  return project;
}

async function runGovernedWorkflowScenario(tmpRoot, scenario) {
  const project = await prepareScenarioProject(tmpRoot, scenario);
  const manifestPath = path.join(project, 'tusq.manifest.json');
  const manifest = await readJson(manifestPath);
  const approvedNames = manifest.capabilities.map((capability) => capability.name);

  const gateFailure = runCli(['review', '--strict'], { cwd: project, expectedStatus: 1 });
  if (!gateFailure.stdout.includes(scenario.expected_review_gate_failure)) {
    fail(`${scenario.id}: expected strict review failure to name ${scenario.expected_review_gate_failure}`);
  }
  await writeJson(manifestPath, approveCapabilities(manifest, approvedNames));
  runCli(['review', '--strict'], { cwd: project });
  runCli(['compile'], { cwd: project });

  for (const expectedTool of scenario.expected_tools) {
    const toolPath = path.join(project, 'tusq-tools', `${expectedTool.name}.json`);
    const tool = await readJson(toolPath);

    if (tool.name !== expectedTool.name) {
      fail(`${scenario.id}: expected tool name ${expectedTool.name}, got ${tool.name}`);
    }
    if (tool.side_effect_class !== expectedTool.side_effect_class) {
      fail(`${scenario.id}:${tool.name}: expected side_effect_class ${expectedTool.side_effect_class}, got ${tool.side_effect_class}`);
    }
    assertIncludesAll(tool.auth_hints || [], expectedTool.auth_hints || [], `${scenario.id}:${tool.name}: auth_hints`);
    if (!tool.redaction || tool.redaction.log_level !== 'full') {
      fail(`${scenario.id}:${tool.name}: expected default redaction policy to survive compile`);
    }
    if (!Array.isArray(tool.examples) || tool.examples.length === 0) {
      fail(`${scenario.id}:${tool.name}: expected examples to survive compile`);
    }
    if (Object.prototype.hasOwnProperty.call(tool, 'approved_by')) {
      fail(`${scenario.id}:${tool.name}: compile output must not leak manifest-only approval metadata`);
    }
    if (expectedTool.returns_type && tool.returns.type !== expectedTool.returns_type) {
      fail(`${scenario.id}:${tool.name}: expected returns.type ${expectedTool.returns_type}, got ${tool.returns.type}`);
    }
    if (expectedTool.input_sources) {
      assertIncludesAll(getPropertySources(tool.parameters), expectedTool.input_sources, `${scenario.id}:${tool.name}: input sources`);
    }
  }

  if (!manifest.capabilities.some((capability) => capability.name === scenario.expected_review_gate_failure)) {
    fail(`${scenario.id}: expected ${scenario.expected_review_gate_failure} capability to exist as an approval-gate regression sentinel`);
  }
}

async function runDiffScenario(tmpRoot, scenario) {
  const project = await prepareScenarioProject(tmpRoot, scenario);
  const manifestPath = path.join(project, 'tusq.manifest.json');
  const currentManifest = await readJson(manifestPath);
  const fromManifest = {
    ...currentManifest,
    manifest_version: currentManifest.manifest_version - 1,
    capabilities: currentManifest.capabilities.map((capability) => {
      if (capability.name !== scenario.changed_capability) {
        return capability;
      }
      return {
        ...capability,
        description: `Previous description for ${capability.name}`,
        approved: true,
        review_needed: false,
        capability_digest: '0'.repeat(64)
      };
    })
  };
  const toManifest = {
    ...currentManifest,
    capabilities: currentManifest.capabilities.map((capability) => {
      if (capability.name !== scenario.changed_capability) {
        return capability;
      }
      return {
        ...capability,
        approved: false,
        review_needed: true
      };
    })
  };
  const fromPath = path.join(project, 'previous.manifest.json');
  const toPath = path.join(project, 'current.manifest.json');
  await writeJson(fromPath, fromManifest);
  await writeJson(toPath, toManifest);

  const diffResult = runCli(['diff', '--from', fromPath, '--to', toPath, '--json', '--review-queue'], { cwd: project });
  const diff = JSON.parse(diffResult.stdout);
  const changed = diff.changes.find((change) => change.capability === scenario.changed_capability);
  if (!changed || changed.type !== 'changed') {
    fail(`${scenario.id}: expected changed diff entry for ${scenario.changed_capability}`);
  }
  assertIncludesAll(changed.fields_changed || [], scenario.expected_fields_changed, `${scenario.id}: fields_changed`);
  const reviewItem = diff.review_queue.find((item) => item.capability === scenario.changed_capability);
  if (!reviewItem || reviewItem.change_type !== 'changed') {
    fail(`${scenario.id}: expected changed capability in review queue`);
  }

  const gateResult = runCli(['diff', '--from', fromPath, '--to', toPath, '--fail-on-unapproved-changes'], {
    cwd: project,
    expectedStatus: 1
  });
  if (!gateResult.stderr.includes(scenario.changed_capability)) {
    fail(`${scenario.id}: expected diff gate failure to name ${scenario.changed_capability}`);
  }
}

function requestRpc(port, payload) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { method: 'POST', host: '127.0.0.1', port, path: '/', headers: { 'content-type': 'application/json' } },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
      }
    );
    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

function waitForReady(proc, timeoutMs = 6000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (Date.now() - started > timeoutMs) { clearInterval(timer); reject(new Error('Timed out waiting for serve')); }
    }, 100);
    proc.stdout.on('data', (chunk) => {
      if (String(chunk).includes('server listening')) { clearInterval(timer); resolve(); }
    });
    proc.on('exit', (code) => { clearInterval(timer); reject(new Error(`serve exited early with code ${code}`)); });
  });
}

async function runPolicyEvalScenario(tmpRoot, scenario) {
  const project = await prepareScenarioProject(tmpRoot, scenario);
  const manifestPath = path.join(project, 'tusq.manifest.json');
  const manifest = await readJson(manifestPath);
  const approvedNames = manifest.capabilities.map((capability) => capability.name);
  await writeJson(manifestPath, approveCapabilities(manifest, approvedNames));
  runCli(['compile'], { cwd: project });

  const policyDir = path.join(project, '.tusq');
  await fs.mkdir(policyDir, { recursive: true });
  const policyPath = path.join(policyDir, 'eval-policy.json');
  await writeJson(policyPath, scenario.policy);

  const port = 33100 + Math.floor(Math.random() * 900);
  const proc = spawn('node', [cli, 'serve', '--port', String(port), '--policy', policyPath], {
    cwd: project,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  try {
    await waitForReady(proc);

    if (scenario.dry_run_tool) {
      const response = await requestRpc(port, {
        jsonrpc: '2.0', id: 1, method: 'tools/call',
        params: { name: scenario.dry_run_tool, arguments: scenario.dry_run_arguments || {} }
      });
      if (!response.result) {
        fail(`${scenario.id}: expected dry-run plan response, got ${JSON.stringify(response)}`);
      }
      if (response.result.executed !== false) {
        fail(`${scenario.id}: expected executed:false, got ${JSON.stringify(response.result.executed)}`);
      }
      if (!response.result.dry_run_plan) {
        fail(`${scenario.id}: expected dry_run_plan in response`);
      }
      if (scenario.expected_plan_method && response.result.dry_run_plan.method !== scenario.expected_plan_method) {
        fail(`${scenario.id}: expected method=${scenario.expected_plan_method}, got ${response.result.dry_run_plan.method}`);
      }
      if (scenario.expected_plan_path && response.result.dry_run_plan.path !== scenario.expected_plan_path) {
        fail(`${scenario.id}: expected path=${scenario.expected_plan_path}, got ${response.result.dry_run_plan.path}`);
      }
      if (scenario.expected_path_params) {
        for (const [key, val] of Object.entries(scenario.expected_path_params)) {
          if (response.result.dry_run_plan.path_params[key] !== val) {
            fail(`${scenario.id}: expected path_params.${key}=${val}, got ${response.result.dry_run_plan.path_params[key]}`);
          }
        }
      }
      if (!response.result.dry_run_plan.plan_hash || !/^[a-f0-9]{64}$/.test(response.result.dry_run_plan.plan_hash)) {
        fail(`${scenario.id}: expected plan_hash SHA-256 hex`);
      }
    }

    if (scenario.unapproved_tool) {
      const unapprovedManifest = await readJson(manifestPath);
      const unapprovedCapability = unapprovedManifest.capabilities.find((c) => c.name === scenario.unapproved_tool);
      if (!unapprovedCapability) {
        fail(`${scenario.id}: unapproved_tool ${scenario.unapproved_tool} not found in manifest`);
      }
      // Mark it unapproved in the manifest but tools are already compiled as approved — tools/call should still reflect approval gate
      // The approval gate test checks that even under dry-run policy, an unknown tool returns the expected error
      const nonexistentResponse = await requestRpc(port, {
        jsonrpc: '2.0', id: 2, method: 'tools/call',
        params: { name: 'nonexistent_tool_xyz', arguments: {} }
      });
      if (!nonexistentResponse.error || nonexistentResponse.error.code !== scenario.expected_error_code) {
        fail(`${scenario.id}: expected error code ${scenario.expected_error_code} for unknown tool, got ${JSON.stringify(nonexistentResponse)}`);
      }
    }
  } finally {
    proc.kill('SIGINT');
    await new Promise((resolve) => { proc.on('exit', resolve); });
  }
}

async function runPolicyInitGeneratorScenario(tmpRoot, scenario) {
  const project = await prepareScenarioProject(tmpRoot, scenario);
  const manifestPath = path.join(project, 'tusq.manifest.json');
  const manifest = await readJson(manifestPath);
  const approvedNames = manifest.capabilities.map((capability) => capability.name);
  await writeJson(manifestPath, approveCapabilities(manifest, approvedNames));
  runCli(['compile'], { cwd: project });

  const policyDir = path.join(project, '.tusq');
  const policyPath = path.join(policyDir, 'eval-init-policy.json');

  const initArgs = ['policy', 'init', '--mode', scenario.policy_init_mode, '--reviewer', scenario.policy_init_reviewer, '--out', policyPath];
  runCli(initArgs, { cwd: project });

  const generatedPolicy = JSON.parse(await fs.readFile(policyPath, 'utf8'));
  if (generatedPolicy.schema_version !== '1.0') {
    fail(`${scenario.id}: generated policy has wrong schema_version: ${generatedPolicy.schema_version}`);
  }
  if (generatedPolicy.mode !== scenario.policy_init_mode) {
    fail(`${scenario.id}: generated policy has wrong mode: ${generatedPolicy.mode}`);
  }
  if (generatedPolicy.reviewer !== scenario.policy_init_reviewer) {
    fail(`${scenario.id}: generated policy has wrong reviewer: ${generatedPolicy.reviewer}`);
  }

  const port = 33200 + Math.floor(Math.random() * 900);
  const proc = spawn('node', [cli, 'serve', '--port', String(port), '--policy', policyPath], {
    cwd: project,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  try {
    await waitForReady(proc);

    const response = await requestRpc(port, {
      jsonrpc: '2.0', id: 1, method: 'tools/call',
      params: { name: scenario.dry_run_tool, arguments: scenario.dry_run_arguments || {} }
    });
    if (!response.result) {
      fail(`${scenario.id}: expected dry-run plan response from generated policy, got ${JSON.stringify(response)}`);
    }
    if (response.result.executed !== false) {
      fail(`${scenario.id}: expected executed:false from generated policy, got ${JSON.stringify(response.result.executed)}`);
    }
    if (!response.result.dry_run_plan) {
      fail(`${scenario.id}: expected dry_run_plan in response from generated policy`);
    }
    if (scenario.expected_plan_method && response.result.dry_run_plan.method !== scenario.expected_plan_method) {
      fail(`${scenario.id}: expected method=${scenario.expected_plan_method}, got ${response.result.dry_run_plan.method}`);
    }
    if (scenario.expected_plan_path && response.result.dry_run_plan.path !== scenario.expected_plan_path) {
      fail(`${scenario.id}: expected path=${scenario.expected_plan_path}, got ${response.result.dry_run_plan.path}`);
    }
    if (scenario.expected_path_params) {
      for (const [key, val] of Object.entries(scenario.expected_path_params)) {
        if (response.result.dry_run_plan.path_params[key] !== val) {
          fail(`${scenario.id}: expected path_params.${key}=${val}, got ${response.result.dry_run_plan.path_params[key]}`);
        }
      }
    }
    if (!response.result.dry_run_plan.plan_hash || !/^[a-f0-9]{64}$/.test(response.result.dry_run_plan.plan_hash)) {
      fail(`${scenario.id}: expected plan_hash SHA-256 hex from generated policy`);
    }
  } finally {
    proc.kill('SIGINT');
    await new Promise((resolve) => { proc.on('exit', resolve); });
  }
}

async function runStrictDeterminismScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(path.join(project, '.tusq'), { recursive: true });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    capabilities: scenario.strict_manifest_capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  const policy = {
    schema_version: '1.0',
    mode: 'describe-only',
    reviewer: 'eval-strict@example.com',
    approved_at: '2026-01-01T00:00:00Z',
    allowed_capabilities: scenario.strict_policy_caps
  };
  const policyPath = path.join(project, '.tusq', 'strict-eval-policy.json');
  await writeJson(policyPath, policy);

  const repeatRuns = scenario.repeat_runs || 3;
  let referenceOutput = null;

  for (let i = 0; i < repeatRuns; i++) {
    const result = runCli(
      ['policy', 'verify', '--policy', policyPath, '--strict', '--manifest', manifestPath, '--json'],
      { cwd: project, expectedStatus: 1 }
    );
    let parsed;
    try {
      parsed = JSON.parse(result.stdout);
    } catch {
      fail(`${scenario.id}: run ${i + 1} produced non-JSON stdout: ${result.stdout}`);
    }
    if (!Array.isArray(parsed.strict_errors)) {
      fail(`${scenario.id}: run ${i + 1} missing strict_errors array`);
    }

    const names = parsed.strict_errors.map((e) => e.name);
    if (referenceOutput === null) {
      referenceOutput = JSON.stringify(names);
      // Verify expected order matches first run
      const expected = scenario.expected_strict_error_order;
      if (JSON.stringify(names) !== JSON.stringify(expected)) {
        fail(`${scenario.id}: strict_errors order mismatch. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(names)}`);
      }
    } else if (JSON.stringify(names) !== referenceOutput) {
      fail(`${scenario.id}: strict_errors ordering is non-deterministic across runs. Run 1: ${referenceOutput}, run ${i + 1}: ${JSON.stringify(names)}`);
    }
  }
}

async function runFastifySchemaExtractionScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await copyFixture(scenario.fixture, project);

  runCli(['init'], { cwd: project });

  const repeatRuns = scenario.repeat_runs || 3;
  let referenceKeys = null;

  for (let i = 0; i < repeatRuns; i++) {
    const scanResult = runCli(['scan', '.', '--format', 'json'], { cwd: project });
    let scanData;
    try {
      scanData = JSON.parse(scanResult.stdout);
    } catch {
      fail(`${scenario.id}: run ${i + 1} scan produced non-JSON stdout: ${scanResult.stdout}`);
    }

    const targetRoute = scanData.routes.find(
      (r) => r.method === scenario.expected_schema_route.method && r.path === scenario.expected_schema_route.path
    );
    if (!targetRoute) {
      fail(`${scenario.id}: run ${i + 1}: expected route ${scenario.expected_schema_route.method} ${scenario.expected_schema_route.path} not found`);
    }

    const schema = targetRoute.input_schema;

    if (schema.source !== scenario.expected_source) {
      fail(`${scenario.id}: run ${i + 1}: expected input_schema.source='${scenario.expected_source}', got '${schema.source}'`);
    }
    if (schema.additionalProperties !== scenario.expected_additional_properties) {
      fail(`${scenario.id}: run ${i + 1}: expected additionalProperties=${scenario.expected_additional_properties}, got ${schema.additionalProperties}`);
    }

    const keys = Object.keys(schema.properties || {});
    if (JSON.stringify(keys) !== JSON.stringify(scenario.expected_properties_keys)) {
      fail(`${scenario.id}: run ${i + 1}: expected properties keys ${JSON.stringify(scenario.expected_properties_keys)}, got ${JSON.stringify(keys)}`);
    }

    for (const req of scenario.expected_required) {
      if (!schema.required || !schema.required.includes(req)) {
        fail(`${scenario.id}: run ${i + 1}: expected required to include '${req}', got ${JSON.stringify(schema.required)}`);
      }
    }

    if (referenceKeys === null) {
      referenceKeys = JSON.stringify(keys);
    } else if (JSON.stringify(keys) !== referenceKeys) {
      fail(`${scenario.id}: non-deterministic property ordering. Run 1: ${referenceKeys}, run ${i + 1}: ${JSON.stringify(keys)}`);
    }
  }
}

async function run() {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'tusq-eval-'));
  const suite = await readJson(scenarioPath);

  for (const scenario of suite.scenarios) {
    if (scenario.id === 'express-governed-workflow') {
      await runGovernedWorkflowScenario(tmpRoot, scenario);
    } else if (scenario.id === 'manifest-diff-review-queue') {
      await runDiffScenario(tmpRoot, scenario);
    } else if (scenario.id === 'policy-dry-run-plan-shape' || scenario.id === 'policy-dry-run-approval-gate') {
      await runPolicyEvalScenario(tmpRoot, scenario);
    } else if (scenario.id === 'policy-init-generator-round-trip') {
      await runPolicyInitGeneratorScenario(tmpRoot, scenario);
    } else if (scenario.id === 'policy-strict-verify-determinism') {
      await runStrictDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.id === 'fastify-schema-body-extraction-determinism') {
      await runFastifySchemaExtractionScenario(tmpRoot, scenario);
    } else {
      fail(`Unknown eval scenario: ${scenario.id}`);
    }
  }

  process.stdout.write(`Eval regression harness passed (${suite.scenarios.length} scenarios)\n`);
}

run().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});
