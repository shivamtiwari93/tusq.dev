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

async function runPiiFieldHintScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await copyFixture(scenario.fixture, project);

  runCli(['init'], { cwd: project });

  const repeatRuns = scenario.repeat_runs || 3;
  let referenceResults = null;

  for (let i = 0; i < repeatRuns; i++) {
    runCli(['scan', '.', '--framework', scenario.framework], { cwd: project });
    runCli(['manifest'], { cwd: project });

    const manifestPath = path.join(project, 'tusq.manifest.json');
    const manifest = await readJson(manifestPath);

    const runResults = {};
    for (const expected of scenario.expected_routes) {
      const capability = manifest.capabilities.find(
        (c) => c.method === expected.method && c.path === expected.path
      );
      if (!capability) {
        fail(`${scenario.id}: run ${i + 1}: expected capability ${expected.method} ${expected.path} not found`);
      }
      const actualPiiFields = capability.redaction && Array.isArray(capability.redaction.pii_fields)
        ? capability.redaction.pii_fields
        : [];
      if (JSON.stringify(actualPiiFields) !== JSON.stringify(expected.expected_pii_fields)) {
        fail(
          `${scenario.id}: run ${i + 1}: ${expected.method} ${expected.path}: ` +
          `expected pii_fields=${JSON.stringify(expected.expected_pii_fields)}, ` +
          `got ${JSON.stringify(actualPiiFields)}`
        );
      }
      runResults[`${expected.method} ${expected.path}`] = JSON.stringify(actualPiiFields);
    }

    if (referenceResults === null) {
      referenceResults = runResults;
    } else {
      for (const [key, value] of Object.entries(runResults)) {
        if (value !== referenceResults[key]) {
          fail(`${scenario.id}: non-deterministic pii_fields for ${key}. Run 1: ${referenceResults[key]}, run ${i + 1}: ${value}`);
        }
      }
    }
  }
}

async function runPiiCategoryLabelScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await copyFixture(scenario.fixture, project);

  runCli(['init'], { cwd: project });

  const repeatRuns = scenario.repeat_runs || 3;
  let referenceResults = null;

  for (let i = 0; i < repeatRuns; i++) {
    runCli(['scan', '.', '--framework', scenario.framework], { cwd: project });
    runCli(['manifest'], { cwd: project });

    const manifestPath = path.join(project, 'tusq.manifest.json');
    const manifest = await readJson(manifestPath);

    const runResults = {};
    for (const expected of scenario.expected_routes) {
      const capability = manifest.capabilities.find(
        (c) => c.method === expected.method && c.path === expected.path
      );
      if (!capability) {
        fail(`${scenario.id}: run ${i + 1}: expected capability ${expected.method} ${expected.path} not found`);
      }

      const redaction = capability.redaction || {};
      const actualPiiFields = Array.isArray(redaction.pii_fields) ? redaction.pii_fields : [];
      const actualPiiCategories = Array.isArray(redaction.pii_categories) ? redaction.pii_categories : null;

      if (actualPiiCategories === null) {
        fail(`${scenario.id}: run ${i + 1}: ${expected.method} ${expected.path}: expected pii_categories array`);
      }
      if (JSON.stringify(actualPiiFields) !== JSON.stringify(expected.expected_pii_fields)) {
        fail(
          `${scenario.id}: run ${i + 1}: ${expected.method} ${expected.path}: ` +
          `expected pii_fields=${JSON.stringify(expected.expected_pii_fields)}, ` +
          `got ${JSON.stringify(actualPiiFields)}`
        );
      }
      if (JSON.stringify(actualPiiCategories) !== JSON.stringify(expected.expected_pii_categories)) {
        fail(
          `${scenario.id}: run ${i + 1}: ${expected.method} ${expected.path}: ` +
          `expected pii_categories=${JSON.stringify(expected.expected_pii_categories)}, ` +
          `got ${JSON.stringify(actualPiiCategories)}`
        );
      }
      if (actualPiiFields.length !== actualPiiCategories.length) {
        fail(`${scenario.id}: run ${i + 1}: ${expected.method} ${expected.path}: pii_fields/pii_categories length mismatch`);
      }
      const expectedSensitivity = expected.expected_sensitivity_class || 'unknown';
      if (capability.sensitivity_class !== expectedSensitivity) {
        fail(`${scenario.id}: run ${i + 1}: ${expected.method} ${expected.path}: expected sensitivity_class=${expectedSensitivity}, got ${capability.sensitivity_class}`);
      }
      if (redaction.retention_days !== null || redaction.log_level !== 'full' || redaction.mask_in_traces !== false) {
        fail(`${scenario.id}: run ${i + 1}: ${expected.method} ${expected.path}: M26 must not alter redaction policy defaults`);
      }

      runResults[`${expected.method} ${expected.path}`] = JSON.stringify({
        pii_fields: actualPiiFields,
        pii_categories: actualPiiCategories
      });
    }

    if (referenceResults === null) {
      referenceResults = runResults;
    } else {
      for (const [key, value] of Object.entries(runResults)) {
        if (value !== referenceResults[key]) {
          fail(`${scenario.id}: non-deterministic pii_categories for ${key}. Run 1: ${referenceResults[key]}, run ${i + 1}: ${value}`);
        }
      }
    }
  }
}

async function runRedactionReviewDeterminismScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await copyFixture(scenario.fixture, project);

  runCli(['init'], { cwd: project });
  runCli(['scan', '.', '--framework', scenario.framework], { cwd: project });
  runCli(['manifest'], { cwd: project });

  const manifestPath = path.join(project, 'tusq.manifest.json');
  const manifest = await readJson(manifestPath);

  const repeatRuns = scenario.repeat_runs || 3;
  let referenceStdout = null;

  for (let i = 0; i < repeatRuns; i++) {
    const result = runCli(['redaction', 'review', '--manifest', manifestPath, '--json'], { cwd: project });
    if (referenceStdout === null) {
      referenceStdout = result.stdout;
    } else if (result.stdout !== referenceStdout) {
      fail(`${scenario.id}: non-deterministic JSON output on run ${i + 1}`);
    }
  }

  const report = JSON.parse(referenceStdout);

  for (const expected of scenario.expected_routes) {
    const manifestCap = manifest.capabilities.find(
      (c) => c.method === expected.method && c.path === expected.path
    );
    if (!manifestCap) {
      fail(`${scenario.id}: expected capability ${expected.method} ${expected.path} not found in manifest`);
    }
    const reportCap = report.capabilities.find((c) => c.name === manifestCap.name);
    if (!reportCap) {
      fail(`${scenario.id}: expected capability ${manifestCap.name} not found in report`);
    }
    if (JSON.stringify(reportCap.pii_fields) !== JSON.stringify(expected.expected_pii_fields)) {
      fail(
        `${scenario.id}: ${expected.method} ${expected.path}: ` +
        `expected pii_fields=${JSON.stringify(expected.expected_pii_fields)}, ` +
        `got ${JSON.stringify(reportCap.pii_fields)}`
      );
    }
    if (JSON.stringify(reportCap.pii_categories) !== JSON.stringify(expected.expected_pii_categories)) {
      fail(
        `${scenario.id}: ${expected.method} ${expected.path}: ` +
        `expected pii_categories=${JSON.stringify(expected.expected_pii_categories)}, ` +
        `got ${JSON.stringify(reportCap.pii_categories)}`
      );
    }
    const actualAdvisoryOrder = reportCap.advisories.map((a) => a.category);
    if (JSON.stringify(actualAdvisoryOrder) !== JSON.stringify(expected.expected_advisory_order)) {
      fail(
        `${scenario.id}: ${expected.method} ${expected.path}: ` +
        `expected advisory order=${JSON.stringify(expected.expected_advisory_order)}, ` +
        `got ${JSON.stringify(actualAdvisoryOrder)}`
      );
    }
    if (reportCap.advisories.length !== new Set(expected.expected_pii_categories).size) {
      fail(
        `${scenario.id}: ${expected.method} ${expected.path}: ` +
        `expected ${new Set(expected.expected_pii_categories).size} distinct advisories, ` +
        `got ${reportCap.advisories.length}`
      );
    }
  }
}

async function runSensitivityClassSyntheticScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(project, { recursive: true });
  await fs.mkdir(path.join(project, '.tusq'), { recursive: true });

  runCli(['init'], { cwd: project });

  const scanData = {
    generated_at: new Date().toISOString(),
    framework: 'express',
    routes: scenario.synthetic_routes.map((route) => ({
      method: route.method,
      path: route.path,
      handler: route.handler,
      domain: route.path ? route.path.split('/').filter(Boolean)[0] || '' : '',
      auth_hints: [],
      confidence: 0.7,
      input_schema: { type: 'object', properties: {}, required: [], additionalProperties: true },
      output_schema: { type: 'object', additionalProperties: true },
      provenance: { file: 'src/app.ts', line: 1, handler: route.handler, framework: 'express' }
    }))
  };
  await writeJson(path.join(project, '.tusq', 'scan.json'), scanData);
  runCli(['manifest'], { cwd: project });

  const manifest = await readJson(path.join(project, 'tusq.manifest.json'));

  for (const expected of scenario.synthetic_routes) {
    const cap = manifest.capabilities.find(
      (c) => c.method === (expected.method || '').toUpperCase() && c.path === (expected.path || '/')
    ) || manifest.capabilities.find(
      (c) => c.method === (expected.method || '').toUpperCase()
    );
    if (!cap && expected.expected_sensitivity_class === 'unknown' && expected.method === '') {
      // Zero-evidence: empty method maps to '' in manifest
      const zeroCap = manifest.capabilities.find((c) => c.method === '');
      if (!zeroCap) {
        fail(`${scenario.id}: expected zero-evidence capability not found`);
      }
      if (zeroCap.sensitivity_class !== expected.expected_sensitivity_class) {
        fail(`${scenario.id}: ${expected.method} ${expected.path}: expected sensitivity_class=${expected.expected_sensitivity_class}, got ${zeroCap.sensitivity_class}`);
      }
      continue;
    }
    if (!cap) {
      fail(`${scenario.id}: expected capability ${expected.method} ${expected.path} not found in manifest`);
    }
    if (cap.sensitivity_class !== expected.expected_sensitivity_class) {
      fail(`${scenario.id}: ${expected.method} ${expected.path}: expected sensitivity_class=${expected.expected_sensitivity_class}, got ${cap.sensitivity_class}`);
    }
  }
}

async function runSensitivityClassPreserveScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(project, { recursive: true });
  await fs.mkdir(path.join(project, '.tusq'), { recursive: true });

  runCli(['init'], { cwd: project });

  const scanData = {
    generated_at: new Date().toISOString(),
    framework: 'express',
    routes: [
      {
        method: scenario.route.method,
        path: scenario.route.path,
        handler: scenario.route.handler,
        domain: scenario.route.path.split('/').filter(Boolean)[0] || '',
        auth_hints: [],
        confidence: 0.7,
        input_schema: {
          type: 'object',
          properties: { [scenario.route.pii_field]: { type: 'string' } },
          required: [],
          additionalProperties: false
        },
        output_schema: { type: 'object', additionalProperties: true },
        provenance: { file: 'src/app.ts', line: 1, handler: scenario.route.handler, framework: 'express' }
      }
    ]
  };
  await writeJson(path.join(project, '.tusq', 'scan.json'), scanData);

  // First manifest run: expect confidential (R3 — PII, no preserve)
  runCli(['manifest'], { cwd: project });
  let manifest = await readJson(path.join(project, 'tusq.manifest.json'));
  const capBefore = manifest.capabilities.find(
    (c) => c.method === scenario.route.method.toUpperCase() && c.path === scenario.route.path
  );
  if (!capBefore) {
    fail(`${scenario.id}: capability ${scenario.route.method} ${scenario.route.path} not found in manifest (before preserve)`);
  }
  if (capBefore.sensitivity_class !== scenario.expected_before_preserve) {
    fail(`${scenario.id}: before preserve=true: expected sensitivity_class=${scenario.expected_before_preserve}, got ${capBefore.sensitivity_class}`);
  }

  // Set preserve=true and re-run manifest: expect restricted (R1 beats R3)
  manifest.capabilities[0].preserve = true;
  await writeJson(path.join(project, 'tusq.manifest.json'), manifest);
  runCli(['manifest'], { cwd: project });
  manifest = await readJson(path.join(project, 'tusq.manifest.json'));
  const capAfter = manifest.capabilities.find(
    (c) => c.method === scenario.route.method.toUpperCase() && c.path === scenario.route.path
  );
  if (!capAfter) {
    fail(`${scenario.id}: capability ${scenario.route.method} ${scenario.route.path} not found in manifest (after preserve)`);
  }
  if (capAfter.sensitivity_class !== scenario.expected_after_preserve) {
    fail(`${scenario.id}: after preserve=true: expected sensitivity_class=${scenario.expected_after_preserve}, got ${capAfter.sensitivity_class}`);
  }
  if (capAfter.preserve !== true) {
    fail(`${scenario.id}: preserve=true flag must be carried forward in manifest`);
  }
}

async function runAuthRequirementsSyntheticScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(project, { recursive: true });
  await fs.mkdir(path.join(project, '.tusq'), { recursive: true });

  runCli(['init'], { cwd: project });

  const scanData = {
    generated_at: new Date().toISOString(),
    framework: 'express',
    routes: scenario.synthetic_routes.map((route) => ({
      method: route.method,
      path: route.path || '/',
      handler: route.handler,
      domain: route.path ? route.path.split('/').filter(Boolean)[0] || 'general' : 'general',
      auth_hints: route.middleware || [],
      confidence: 0.7,
      input_schema: { type: 'object', properties: {}, required: [], additionalProperties: true },
      output_schema: { type: 'object', additionalProperties: true },
      provenance: { file: 'src/app.ts', line: 1, handler: route.handler, framework: 'express' }
    }))
  };
  await writeJson(path.join(project, '.tusq', 'scan.json'), scanData);
  runCli(['manifest'], { cwd: project });

  const manifest = await readJson(path.join(project, 'tusq.manifest.json'));

  for (const expected of scenario.synthetic_routes) {
    const cap = manifest.capabilities.find(
      (c) => c.method === (expected.method || '').toUpperCase() && c.path === (expected.path || '/')
    ) || manifest.capabilities.find(
      (c) => c.method === (expected.method || '').toUpperCase()
    );

    if (!cap) {
      if (expected.method === '' && expected.path === '') {
        const zeroCap = manifest.capabilities[0];
        if (!zeroCap || !zeroCap.auth_requirements) {
          fail(`${scenario.id}: zero-evidence capability missing auth_requirements`);
        }
        if (zeroCap.auth_requirements.auth_scheme !== (expected.expected_auth_scheme || 'unknown')) {
          fail(`${scenario.id}: zero-evidence: expected auth_scheme=${expected.expected_auth_scheme || 'unknown'}, got ${zeroCap.auth_requirements.auth_scheme}`);
        }
        continue;
      }
      fail(`${scenario.id}: expected capability ${expected.method} ${expected.path} not found`);
    }

    if (!cap.auth_requirements) {
      fail(`${scenario.id}: ${expected.method} ${expected.path}: missing auth_requirements field`);
    }
    if (expected.expected_auth_scheme !== undefined && cap.auth_requirements.auth_scheme !== expected.expected_auth_scheme) {
      fail(`${scenario.id}: ${expected.method} ${expected.path}: expected auth_scheme=${expected.expected_auth_scheme}, got ${cap.auth_requirements.auth_scheme}`);
    }
    if (expected.expected_evidence_source !== undefined && cap.auth_requirements.evidence_source !== expected.expected_evidence_source) {
      fail(`${scenario.id}: ${expected.method} ${expected.path}: expected evidence_source=${expected.expected_evidence_source}, got ${cap.auth_requirements.evidence_source}`);
    }
    if (expected.expected_auth_scopes !== undefined) {
      if (JSON.stringify(cap.auth_requirements.auth_scopes) !== JSON.stringify(expected.expected_auth_scopes)) {
        fail(`${scenario.id}: ${expected.method} ${expected.path}: expected auth_scopes=${JSON.stringify(expected.expected_auth_scopes)}, got ${JSON.stringify(cap.auth_requirements.auth_scopes)}`);
      }
    }
    if (expected.expected_auth_roles !== undefined) {
      if (JSON.stringify(cap.auth_requirements.auth_roles) !== JSON.stringify(expected.expected_auth_roles)) {
        fail(`${scenario.id}: ${expected.method} ${expected.path}: expected auth_roles=${JSON.stringify(expected.expected_auth_roles)}, got ${JSON.stringify(cap.auth_requirements.auth_roles)}`);
      }
    }
    if (!Array.isArray(cap.auth_requirements.auth_scopes)) {
      fail(`${scenario.id}: ${expected.method} ${expected.path}: auth_scopes MUST be an array`);
    }
    if (!Array.isArray(cap.auth_requirements.auth_roles)) {
      fail(`${scenario.id}: ${expected.method} ${expected.path}: auth_roles MUST be an array`);
    }
  }
}

async function runSurfacePlanDeterminismScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(project, { recursive: true });

  // Build a synthetic manifest from the scenario's capabilities
  const capabilities = scenario.synthetic_capabilities.map((cap) => ({
    name: cap.name,
    description: cap.description || cap.name,
    method: cap.method || 'GET',
    path: cap.path || '/',
    side_effect_class: cap.side_effect_class || 'read',
    sensitivity_class: cap.sensitivity_class || 'unknown',
    approved: cap.approved === true,
    auth_requirements: {
      auth_scheme: cap.auth_scheme || 'unknown',
      auth_scopes: [],
      auth_roles: [],
      evidence_source: cap.auth_scheme && cap.auth_scheme !== 'unknown' ? 'middleware_name' : 'none'
    },
    redaction: { pii_fields: [], pii_categories: [] }
  }));

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-26T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq surface plan --json three times and assert byte-identical output
  const run1 = runCli(['surface', 'plan', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['surface', 'plan', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['surface', 'plan', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: surface plan --json output is not byte-identical across three runs`);
  }

  // Assert gated_reason enum is closed — every reason is one of the valid six
  const plan = JSON.parse(run1.stdout);
  const validReasons = new Set(scenario.expected_valid_gated_reasons);
  for (const surfacePlan of plan.surfaces) {
    for (const gated of surfacePlan.gated_capabilities) {
      if (!validReasons.has(gated.reason)) {
        fail(`${scenario.id}: gated reason '${gated.reason}' is outside the closed six-value enum`);
      }
    }
  }

  // Assert plan has four surfaces in frozen order
  const surfaceOrder = plan.surfaces.map((s) => s.surface).join(',');
  if (surfaceOrder !== 'chat,palette,widget,voice') {
    fail(`${scenario.id}: surfaces must appear in frozen order chat,palette,widget,voice; got: ${surfaceOrder}`);
  }

  // Assert manifest is not mutated
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  if (JSON.stringify(JSON.parse(manifestAfter)) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by surface plan`);
  }
}

async function runDomainIndexDeterminismScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(project, { recursive: true });

  // Build a synthetic manifest from the scenario's capabilities
  const capabilities = scenario.synthetic_capabilities.map((cap) => ({
    name: cap.name,
    description: cap.description || cap.name,
    method: cap.method || 'GET',
    path: cap.path || '/',
    domain: Object.prototype.hasOwnProperty.call(cap, 'domain') ? cap.domain : null,
    side_effect_class: cap.side_effect_class || 'read',
    sensitivity_class: cap.sensitivity_class || 'unknown',
    approved: cap.approved === true,
    auth_requirements: {
      auth_scheme: cap.auth_scheme || 'unknown',
      auth_scopes: [],
      auth_roles: [],
      evidence_source: cap.auth_scheme && cap.auth_scheme !== 'unknown' ? 'middleware_name' : 'none'
    }
  }));

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-26T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq domain index --json three times and assert byte-identical output
  const run1 = runCli(['domain', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['domain', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['domain', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: domain index --json output is not byte-identical across three runs`);
  }

  // Assert aggregation_key enum is closed — every key is one of the two valid values
  const index = JSON.parse(run1.stdout);
  const validKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.domains) {
    if (!validKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed two-value enum for domain '${entry.domain}'`);
    }
  }

  // Assert domains appear in manifest first-appearance order (not alphabetized)
  const domainOrder = index.domains.map((d) => d.domain).join(',');
  if (domainOrder !== scenario.expected_domain_order) {
    fail(`${scenario.id}: domains must appear in manifest first-appearance order '${scenario.expected_domain_order}'; got: ${domainOrder}`);
  }

  // Assert manifest is not mutated
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  if (JSON.stringify(JSON.parse(manifestAfter)) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by domain index`);
  }
}

async function runEffectIndexDeterminismScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(project, { recursive: true });

  // Build a synthetic manifest from the scenario's capabilities
  const capabilities = scenario.synthetic_capabilities.map((cap) => ({
    name: cap.name,
    description: cap.description || cap.name,
    method: cap.method || 'GET',
    path: cap.path || '/',
    domain: Object.prototype.hasOwnProperty.call(cap, 'domain') ? cap.domain : null,
    side_effect_class: Object.prototype.hasOwnProperty.call(cap, 'side_effect_class') ? cap.side_effect_class : null,
    sensitivity_class: cap.sensitivity_class || 'unknown',
    approved: cap.approved === true,
    auth_requirements: {
      auth_scheme: cap.auth_scheme || 'unknown',
      auth_scopes: [],
      auth_roles: [],
      evidence_source: cap.auth_scheme && cap.auth_scheme !== 'unknown' ? 'middleware_name' : 'none'
    }
  }));

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-26T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq effect index --json three times and assert byte-identical output
  const run1 = runCli(['effect', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['effect', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['effect', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: effect index --json output is not byte-identical across three runs`);
  }

  // Assert side_effect_class bucket-key enum is closed — every key is one of the four valid values
  const index = JSON.parse(run1.stdout);
  const validSideEffectClasses = new Set(scenario.expected_valid_side_effect_classes);
  for (const entry of index.effects) {
    if (!validSideEffectClasses.has(entry.side_effect_class)) {
      fail(`${scenario.id}: side_effect_class '${entry.side_effect_class}' is outside the closed four-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the two valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.effects) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed two-value enum for effect '${entry.side_effect_class}'`);
    }
  }

  // Assert effects appear in closed-enum order (read → write → destructive → unknown)
  const effectOrder = index.effects.map((e) => e.side_effect_class).join(',');
  if (effectOrder !== scenario.expected_effect_order) {
    fail(`${scenario.id}: effects must appear in closed-enum order '${scenario.expected_effect_order}'; got: ${effectOrder}`);
  }

  // Assert manifest is not mutated
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  if (JSON.stringify(JSON.parse(manifestAfter)) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by effect index`);
  }
}

async function runSensitivityIndexDeterminismScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(project, { recursive: true });

  // Build a synthetic manifest from the scenario's capabilities
  const capabilities = scenario.synthetic_capabilities.map((cap) => ({
    name: cap.name,
    description: cap.description || cap.name,
    method: cap.method || 'GET',
    path: cap.path || '/',
    domain: Object.prototype.hasOwnProperty.call(cap, 'domain') ? cap.domain : null,
    side_effect_class: Object.prototype.hasOwnProperty.call(cap, 'side_effect_class') ? cap.side_effect_class : null,
    sensitivity_class: Object.prototype.hasOwnProperty.call(cap, 'sensitivity_class') ? cap.sensitivity_class : null,
    approved: cap.approved === true,
    auth_requirements: {
      auth_scheme: cap.auth_scheme || 'unknown',
      auth_scopes: [],
      auth_roles: [],
      evidence_source: cap.auth_scheme && cap.auth_scheme !== 'unknown' ? 'middleware_name' : 'none'
    }
  }));

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-26T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq sensitivity index --json three times and assert byte-identical output
  const run1 = runCli(['sensitivity', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['sensitivity', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['sensitivity', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: sensitivity index --json output is not byte-identical across three runs`);
  }

  // Assert sensitivity_class bucket-key enum is closed — every key is one of the five valid values
  const index = JSON.parse(run1.stdout);
  const validSensitivityClasses = new Set(scenario.expected_valid_sensitivity_classes);
  for (const entry of index.sensitivities) {
    if (!validSensitivityClasses.has(entry.sensitivity_class)) {
      fail(`${scenario.id}: sensitivity_class '${entry.sensitivity_class}' is outside the closed five-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the two valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.sensitivities) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed two-value enum for sensitivity '${entry.sensitivity_class}'`);
    }
  }

  // Assert sensitivities appear in closed-enum order (public → internal → confidential → restricted → unknown)
  const sensitivityOrder = index.sensitivities.map((e) => e.sensitivity_class).join(',');
  if (sensitivityOrder !== scenario.expected_sensitivity_order) {
    fail(`${scenario.id}: sensitivities must appear in closed-enum order '${scenario.expected_sensitivity_order}'; got: ${sensitivityOrder}`);
  }

  // Assert manifest is not mutated
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  if (JSON.stringify(JSON.parse(manifestAfter)) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by sensitivity index`);
  }
}

async function runMethodIndexDeterminismScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(project, { recursive: true });

  // Build a synthetic manifest from the scenario's capabilities
  const capabilities = scenario.synthetic_capabilities.map((cap) => ({
    name: cap.name,
    description: cap.description || cap.name,
    method: Object.prototype.hasOwnProperty.call(cap, 'method') ? cap.method : null,
    path: cap.path || '/',
    domain: Object.prototype.hasOwnProperty.call(cap, 'domain') ? cap.domain : null,
    side_effect_class: Object.prototype.hasOwnProperty.call(cap, 'side_effect_class') ? cap.side_effect_class : null,
    sensitivity_class: Object.prototype.hasOwnProperty.call(cap, 'sensitivity_class') ? cap.sensitivity_class : null,
    approved: cap.approved === true,
    auth_requirements: {
      auth_scheme: cap.auth_scheme || 'unknown',
      auth_scopes: [],
      auth_roles: [],
      evidence_source: cap.auth_scheme && cap.auth_scheme !== 'unknown' ? 'middleware_name' : 'none'
    }
  }));

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-26T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq method index --json three times and assert byte-identical output
  const run1 = runCli(['method', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['method', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['method', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: method index --json output is not byte-identical across three runs`);
  }

  // Assert http_method bucket-key enum is closed — every key is one of the six valid values
  const index = JSON.parse(run1.stdout);
  const validHttpMethods = new Set(scenario.expected_valid_http_methods);
  for (const entry of index.methods) {
    if (!validHttpMethods.has(entry.http_method)) {
      fail(`${scenario.id}: http_method '${entry.http_method}' is outside the closed six-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the two valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.methods) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed two-value enum for method '${entry.http_method}'`);
    }
  }

  // Assert methods appear in closed-enum order (GET → POST → PUT → PATCH → DELETE → unknown)
  const methodOrder = index.methods.map((e) => e.http_method).join(',');
  if (methodOrder !== scenario.expected_method_order) {
    fail(`${scenario.id}: methods must appear in closed-enum order '${scenario.expected_method_order}'; got: ${methodOrder}`);
  }

  // Assert manifest is not mutated
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  if (JSON.stringify(JSON.parse(manifestAfter)) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by method index`);
  }
}

async function runAuthSchemeIndexDeterminismScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(project, { recursive: true });

  // Build a synthetic manifest from the scenario's capabilities
  const capabilities = scenario.synthetic_capabilities.map((cap) => ({
    name: cap.name,
    description: cap.description || cap.name,
    method: Object.prototype.hasOwnProperty.call(cap, 'method') ? cap.method : null,
    path: cap.path || '/',
    domain: Object.prototype.hasOwnProperty.call(cap, 'domain') ? cap.domain : null,
    side_effect_class: Object.prototype.hasOwnProperty.call(cap, 'side_effect_class') ? cap.side_effect_class : null,
    sensitivity_class: Object.prototype.hasOwnProperty.call(cap, 'sensitivity_class') ? cap.sensitivity_class : null,
    approved: cap.approved === true,
    auth_requirements: {
      auth_scheme: cap.auth_scheme || 'unknown',
      auth_scopes: [],
      auth_roles: [],
      evidence_source: cap.auth_scheme && cap.auth_scheme !== 'unknown' ? 'middleware_name' : 'none'
    }
  }));

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-26T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq auth index --json three times and assert byte-identical output
  const run1 = runCli(['auth', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['auth', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['auth', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: auth index --json output is not byte-identical across three runs`);
  }

  // Assert auth_scheme bucket-key enum is closed — every key is one of the seven valid values
  const index = JSON.parse(run1.stdout);
  const validAuthSchemes = new Set(scenario.expected_valid_auth_schemes);
  for (const entry of index.schemes) {
    if (!validAuthSchemes.has(entry.auth_scheme)) {
      fail(`${scenario.id}: auth_scheme '${entry.auth_scheme}' is outside the closed seven-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the two valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.schemes) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed two-value enum for scheme '${entry.auth_scheme}'`);
    }
  }

  // Assert schemes appear in closed-enum order (bearer → api_key → session → basic → oauth → none → unknown)
  const schemeOrder = index.schemes.map((e) => e.auth_scheme).join(',');
  if (schemeOrder !== scenario.expected_scheme_order) {
    fail(`${scenario.id}: schemes must appear in closed-enum order '${scenario.expected_scheme_order}'; got: ${schemeOrder}`);
  }

  // Assert manifest is not mutated
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  if (JSON.stringify(JSON.parse(manifestAfter)) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by auth index`);
  }
}

async function runConfidenceTierIndexDeterminismScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(project, { recursive: true });

  // Build a synthetic manifest from the scenario's capabilities
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      description: cap.description || cap.name,
      method: Object.prototype.hasOwnProperty.call(cap, 'method') ? cap.method : null,
      path: cap.path || '/',
      domain: Object.prototype.hasOwnProperty.call(cap, 'domain') ? cap.domain : null,
      side_effect_class: Object.prototype.hasOwnProperty.call(cap, 'side_effect_class') ? cap.side_effect_class : null,
      sensitivity_class: Object.prototype.hasOwnProperty.call(cap, 'sensitivity_class') ? cap.sensitivity_class : null,
      approved: cap.approved === true,
      auth_requirements: {
        auth_scheme: cap.auth_scheme || 'unknown',
        auth_scopes: [],
        auth_roles: [],
        evidence_source: cap.auth_scheme && cap.auth_scheme !== 'unknown' ? 'middleware_name' : 'none'
      }
    };
    // Include confidence field (null is explicitly valid; undefined means missing)
    if (Object.prototype.hasOwnProperty.call(cap, 'confidence')) {
      obj.confidence = cap.confidence;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-26T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq confidence index --json three times and assert byte-identical output
  const run1 = runCli(['confidence', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['confidence', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['confidence', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: confidence index --json output is not byte-identical across three runs`);
  }

  // Assert confidence_tier bucket-key enum is closed — every key is one of the four valid values
  const index = JSON.parse(run1.stdout);
  const validTiers = new Set(scenario.expected_valid_confidence_tiers);
  for (const entry of index.tiers) {
    if (!validTiers.has(entry.confidence_tier)) {
      fail(`${scenario.id}: confidence_tier '${entry.confidence_tier}' is outside the closed four-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the two valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.tiers) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed two-value enum for tier '${entry.confidence_tier}'`);
    }
  }

  // Assert tiers appear in closed-enum order (high → medium → low → unknown)
  const tierOrder = index.tiers.map((e) => e.confidence_tier).join(',');
  if (tierOrder !== scenario.expected_tier_order) {
    fail(`${scenario.id}: tiers must appear in closed-enum order '${scenario.expected_tier_order}'; got: ${tierOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (confidence_tier must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by confidence index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'confidence_tier')) {
      fail(`${scenario.id}: confidence_tier must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }
}

async function runPiiFieldCountTierIndexDeterminismScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(project, { recursive: true });

  // Build a synthetic manifest from the scenario's capabilities
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      description: cap.description || cap.name,
      method: Object.prototype.hasOwnProperty.call(cap, 'method') ? cap.method : null,
      path: cap.path || '/',
      domain: Object.prototype.hasOwnProperty.call(cap, 'domain') ? cap.domain : null,
      side_effect_class: Object.prototype.hasOwnProperty.call(cap, 'side_effect_class') ? cap.side_effect_class : null,
      sensitivity_class: Object.prototype.hasOwnProperty.call(cap, 'sensitivity_class') ? cap.sensitivity_class : null,
      approved: cap.approved === true,
      auth_requirements: {
        auth_scheme: cap.auth_scheme || 'unknown',
        auth_scopes: [],
        auth_roles: [],
        evidence_source: cap.auth_scheme && cap.auth_scheme !== 'unknown' ? 'middleware_name' : 'none'
      },
      redaction: {
        pii_fields: Object.prototype.hasOwnProperty.call(cap, 'pii_fields') ? cap.pii_fields : [],
        pii_categories: []
      }
    };
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-27T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq pii index --json three times and assert byte-identical output
  const run1 = runCli(['pii', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['pii', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['pii', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: pii index --json output is not byte-identical across three runs`);
  }

  // Assert pii_field_count_tier bucket-key enum is closed — every key is one of the five valid values
  const index = JSON.parse(run1.stdout);
  const validTiers = new Set(scenario.expected_valid_pii_tiers);
  for (const entry of index.tiers) {
    if (!validTiers.has(entry.pii_field_count_tier)) {
      fail(`${scenario.id}: pii_field_count_tier '${entry.pii_field_count_tier}' is outside the closed five-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the two valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.tiers) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed two-value enum for tier '${entry.pii_field_count_tier}'`);
    }
  }

  // Assert tiers appear in closed-enum order (none → low → medium → high → unknown)
  const tierOrder = index.tiers.map((e) => e.pii_field_count_tier).join(',');
  if (tierOrder !== scenario.expected_tier_order) {
    fail(`${scenario.id}: tiers must appear in closed-enum order '${scenario.expected_tier_order}'; got: ${tierOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (pii_field_count_tier must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by pii index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'pii_field_count_tier')) {
      fail(`${scenario.id}: pii_field_count_tier must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }
}

async function runExamplesCountTierIndexDeterminismScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(project, { recursive: true });

  // Build a synthetic manifest from the scenario's capabilities
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      description: cap.description || cap.name,
      method: Object.prototype.hasOwnProperty.call(cap, 'method') ? cap.method : null,
      path: cap.path || '/',
      domain: Object.prototype.hasOwnProperty.call(cap, 'domain') ? cap.domain : null,
      side_effect_class: Object.prototype.hasOwnProperty.call(cap, 'side_effect_class') ? cap.side_effect_class : null,
      sensitivity_class: Object.prototype.hasOwnProperty.call(cap, 'sensitivity_class') ? cap.sensitivity_class : null,
      approved: cap.approved === true,
      auth_requirements: {
        auth_scheme: cap.auth_scheme || 'unknown',
        auth_scopes: [],
        auth_roles: [],
        evidence_source: cap.auth_scheme && cap.auth_scheme !== 'unknown' ? 'middleware_name' : 'none'
      },
      redaction: {
        pii_fields: [],
        pii_categories: []
      }
    };
    // Propagate examples field only if present in cap (missing → undefined → unknown tier)
    if (Object.prototype.hasOwnProperty.call(cap, 'examples')) {
      obj.examples = cap.examples;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-27T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq examples index --json three times and assert byte-identical output
  const run1 = runCli(['examples', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['examples', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['examples', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: examples index --json output is not byte-identical across three runs`);
  }

  // Assert examples_count_tier bucket-key enum is closed — every key is one of the five valid values
  const index = JSON.parse(run1.stdout);
  const validTiers = new Set(scenario.expected_valid_examples_tiers);
  for (const entry of index.tiers) {
    if (!validTiers.has(entry.examples_count_tier)) {
      fail(`${scenario.id}: examples_count_tier '${entry.examples_count_tier}' is outside the closed five-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the two valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.tiers) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed two-value enum for tier '${entry.examples_count_tier}'`);
    }
  }

  // Assert tiers appear in closed-enum order (none → low → medium → high → unknown)
  const tierOrder = index.tiers.map((e) => e.examples_count_tier).join(',');
  if (tierOrder !== scenario.expected_tier_order) {
    fail(`${scenario.id}: tiers must appear in closed-enum order '${scenario.expected_tier_order}'; got: ${tierOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (examples_count_tier must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by examples index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'examples_count_tier')) {
      fail(`${scenario.id}: examples_count_tier must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }
}

async function runPathSegmentCountTierIndexDeterminismScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(project, { recursive: true });

  // Build a synthetic manifest from the scenario's capabilities
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      description: cap.description || cap.name,
      method: Object.prototype.hasOwnProperty.call(cap, 'method') ? cap.method : null,
      domain: Object.prototype.hasOwnProperty.call(cap, 'domain') ? cap.domain : null,
      side_effect_class: Object.prototype.hasOwnProperty.call(cap, 'side_effect_class') ? cap.side_effect_class : null,
      sensitivity_class: Object.prototype.hasOwnProperty.call(cap, 'sensitivity_class') ? cap.sensitivity_class : null,
      approved: cap.approved === true,
      auth_requirements: {
        auth_scheme: cap.auth_scheme || 'unknown',
        auth_scopes: [],
        auth_roles: [],
        evidence_source: cap.auth_scheme && cap.auth_scheme !== 'unknown' ? 'middleware_name' : 'none'
      },
      redaction: {
        pii_fields: [],
        pii_categories: []
      }
    };
    // Propagate path field only if present in cap (missing → undefined → unknown tier)
    if (Object.prototype.hasOwnProperty.call(cap, 'path')) {
      obj.path = cap.path;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-27T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq path index --json three times and assert byte-identical output
  const run1 = runCli(['path', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['path', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['path', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: path index --json output is not byte-identical across three runs`);
  }

  // Assert path_segment_count_tier bucket-key enum is closed — every key is one of the five valid values
  const index = JSON.parse(run1.stdout);
  const validTiers = new Set(scenario.expected_valid_path_segment_count_tiers);
  for (const entry of index.tiers) {
    if (!validTiers.has(entry.path_segment_count_tier)) {
      fail(`${scenario.id}: path_segment_count_tier '${entry.path_segment_count_tier}' is outside the closed five-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the two valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.tiers) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed two-value enum for tier '${entry.path_segment_count_tier}'`);
    }
  }

  // Assert tiers appear in closed-enum order (none → low → medium → high → unknown)
  const tierOrder = index.tiers.map((e) => e.path_segment_count_tier).join(',');
  if (tierOrder !== scenario.expected_tier_order) {
    fail(`${scenario.id}: tiers must appear in closed-enum order '${scenario.expected_tier_order}'; got: ${tierOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (path_segment_count_tier must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by path index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'path_segment_count_tier')) {
      fail(`${scenario.id}: path_segment_count_tier must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }
}

async function runOutputSchemaPropertyCountTierIndexDeterminismScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(project, { recursive: true });

  // Build a synthetic manifest from the scenario's capabilities
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      description: cap.description || cap.name,
      method: Object.prototype.hasOwnProperty.call(cap, 'method') ? cap.method : null,
      path: cap.path || '/',
      domain: Object.prototype.hasOwnProperty.call(cap, 'domain') ? cap.domain : null,
      side_effect_class: Object.prototype.hasOwnProperty.call(cap, 'side_effect_class') ? cap.side_effect_class : null,
      sensitivity_class: Object.prototype.hasOwnProperty.call(cap, 'sensitivity_class') ? cap.sensitivity_class : null,
      approved: cap.approved === true,
      auth_requirements: {
        auth_scheme: cap.auth_scheme || 'unknown',
        auth_scopes: [],
        auth_roles: [],
        evidence_source: cap.auth_scheme && cap.auth_scheme !== 'unknown' ? 'middleware_name' : 'none'
      },
      redaction: {
        pii_fields: [],
        pii_categories: []
      }
    };
    // Propagate output_schema field only if present in cap (missing → undefined → unknown tier)
    if (Object.prototype.hasOwnProperty.call(cap, 'output_schema')) {
      obj.output_schema = cap.output_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-27T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq output index --json three times and assert byte-identical output
  const run1 = runCli(['output', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['output', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['output', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: output index --json output is not byte-identical across three runs`);
  }

  // Assert output_schema_property_count_tier bucket-key enum is closed — every key is one of the five valid values
  const index = JSON.parse(run1.stdout);
  const validTiers = new Set(scenario.expected_valid_output_schema_tiers);
  for (const entry of index.tiers) {
    if (!validTiers.has(entry.output_schema_property_count_tier)) {
      fail(`${scenario.id}: output_schema_property_count_tier '${entry.output_schema_property_count_tier}' is outside the closed five-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the two valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.tiers) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed two-value enum for tier '${entry.output_schema_property_count_tier}'`);
    }
  }

  // Assert tiers appear in closed-enum order (none → low → medium → high → unknown)
  const tierOrder = index.tiers.map((e) => e.output_schema_property_count_tier).join(',');
  if (tierOrder !== scenario.expected_tier_order) {
    fail(`${scenario.id}: tiers must appear in closed-enum order '${scenario.expected_tier_order}'; got: ${tierOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (output_schema_property_count_tier must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by output index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'output_schema_property_count_tier')) {
      fail(`${scenario.id}: output_schema_property_count_tier must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }
}

async function runRequiredInputFieldCountTierIndexDeterminismScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(project, { recursive: true });

  // Build a synthetic manifest from the scenario's capabilities
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      description: cap.description || cap.name,
      method: Object.prototype.hasOwnProperty.call(cap, 'method') ? cap.method : null,
      path: cap.path || '/',
      domain: Object.prototype.hasOwnProperty.call(cap, 'domain') ? cap.domain : null,
      side_effect_class: Object.prototype.hasOwnProperty.call(cap, 'side_effect_class') ? cap.side_effect_class : null,
      sensitivity_class: Object.prototype.hasOwnProperty.call(cap, 'sensitivity_class') ? cap.sensitivity_class : null,
      approved: cap.approved === true,
      auth_requirements: {
        auth_scheme: cap.auth_scheme || 'unknown',
        auth_scopes: [],
        auth_roles: [],
        evidence_source: cap.auth_scheme && cap.auth_scheme !== 'unknown' ? 'middleware_name' : 'none'
      },
      redaction: {
        pii_fields: [],
        pii_categories: []
      }
    };
    // Propagate input_schema field only if present in cap (missing → undefined → unknown tier)
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-27T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq input index --json three times and assert byte-identical output
  const run1 = runCli(['input', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['input', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['input', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: input index --json output is not byte-identical across three runs`);
  }

  // Assert required_input_field_count_tier bucket-key enum is closed — every key is one of the five valid values
  const index = JSON.parse(run1.stdout);
  const validTiers = new Set(scenario.expected_valid_required_input_tiers);
  for (const entry of index.tiers) {
    if (!validTiers.has(entry.required_input_field_count_tier)) {
      fail(`${scenario.id}: required_input_field_count_tier '${entry.required_input_field_count_tier}' is outside the closed five-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the two valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.tiers) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed two-value enum for tier '${entry.required_input_field_count_tier}'`);
    }
  }

  // Assert tiers appear in closed-enum order (none → low → medium → high → unknown)
  const tierOrder = index.tiers.map((e) => e.required_input_field_count_tier).join(',');
  if (tierOrder !== scenario.expected_tier_order) {
    fail(`${scenario.id}: tiers must appear in closed-enum order '${scenario.expected_tier_order}'; got: ${tierOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (required_input_field_count_tier must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by input index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'required_input_field_count_tier')) {
      fail(`${scenario.id}: required_input_field_count_tier must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }
}

async function runInputSchemaPrimaryParameterSourceIndexDeterminismScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(project, { recursive: true });

  // Build a synthetic manifest from the scenario's capabilities
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      description: cap.description || cap.name,
      method: Object.prototype.hasOwnProperty.call(cap, 'method') ? cap.method : null,
      path: cap.path || '/',
      domain: Object.prototype.hasOwnProperty.call(cap, 'domain') ? cap.domain : null,
      side_effect_class: Object.prototype.hasOwnProperty.call(cap, 'side_effect_class') ? cap.side_effect_class : null,
      sensitivity_class: Object.prototype.hasOwnProperty.call(cap, 'sensitivity_class') ? cap.sensitivity_class : null,
      approved: cap.approved === true,
      auth_requirements: {
        auth_scheme: cap.auth_scheme || 'unknown',
        auth_scopes: [],
        auth_roles: [],
        evidence_source: cap.auth_scheme && cap.auth_scheme !== 'unknown' ? 'middleware_name' : 'none'
      },
      redaction: {
        pii_fields: [],
        pii_categories: []
      }
    };
    // Propagate input_schema field only if present in cap (missing → undefined → unknown source)
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-27T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq request index --json three times and assert byte-identical output
  const run1 = runCli(['request', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['request', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['request', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: request index --json output is not byte-identical across three runs`);
  }

  // Assert input_schema_primary_parameter_source bucket-key enum is closed — every key is one of the seven valid values
  const index = JSON.parse(run1.stdout);
  const validSources = new Set(scenario.expected_valid_input_schema_primary_parameter_sources);
  for (const entry of index.sources) {
    if (!validSources.has(entry.input_schema_primary_parameter_source)) {
      fail(`${scenario.id}: input_schema_primary_parameter_source '${entry.input_schema_primary_parameter_source}' is outside the closed seven-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the two valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.sources) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed two-value enum for source '${entry.input_schema_primary_parameter_source}'`);
    }
  }

  // Assert sources appear in closed-enum order (path → request_body → query → header → mixed → none → unknown)
  const sourceOrder = index.sources.map((e) => e.input_schema_primary_parameter_source).join(',');
  if (sourceOrder !== scenario.expected_source_order) {
    fail(`${scenario.id}: sources must appear in closed-enum order '${scenario.expected_source_order}'; got: ${sourceOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (input_schema_primary_parameter_source must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by request index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema_primary_parameter_source')) {
      fail(`${scenario.id}: input_schema_primary_parameter_source must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }
}

async function runOutputSchemaTopLevelTypeIndexDeterminismScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(project, { recursive: true });

  // Build a synthetic manifest from the scenario's capabilities
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      description: cap.description || cap.name,
      method: Object.prototype.hasOwnProperty.call(cap, 'method') ? cap.method : null,
      path: cap.path || '/',
      domain: Object.prototype.hasOwnProperty.call(cap, 'domain') ? cap.domain : null,
      side_effect_class: Object.prototype.hasOwnProperty.call(cap, 'side_effect_class') ? cap.side_effect_class : null,
      sensitivity_class: Object.prototype.hasOwnProperty.call(cap, 'sensitivity_class') ? cap.sensitivity_class : null,
      approved: cap.approved === true,
      auth_requirements: {
        auth_scheme: cap.auth_scheme || 'unknown',
        auth_scopes: [],
        auth_roles: [],
        evidence_source: cap.auth_scheme && cap.auth_scheme !== 'unknown' ? 'middleware_name' : 'none'
      },
      redaction: {
        pii_fields: [],
        pii_categories: []
      }
    };
    // Propagate output_schema field only if present in cap (missing → undefined → unknown type)
    if (Object.prototype.hasOwnProperty.call(cap, 'output_schema')) {
      obj.output_schema = cap.output_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-27T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq response index --json three times and assert byte-identical output
  const run1 = runCli(['response', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['response', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['response', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: response index --json output is not byte-identical across three runs`);
  }

  // Assert output_schema_top_level_type bucket-key enum is closed — every key is one of the seven valid values
  const index = JSON.parse(run1.stdout);
  const validTypes = new Set(scenario.expected_valid_output_schema_top_level_types);
  for (const entry of index.types) {
    if (!validTypes.has(entry.output_schema_top_level_type)) {
      fail(`${scenario.id}: output_schema_top_level_type '${entry.output_schema_top_level_type}' is outside the closed seven-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the two valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.types) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed two-value enum for type '${entry.output_schema_top_level_type}'`);
    }
  }

  // Assert types appear in closed-enum order (object → array → string → number → boolean → null → unknown)
  const typeOrder = index.types.map((e) => e.output_schema_top_level_type).join(',');
  if (typeOrder !== scenario.expected_type_order) {
    fail(`${scenario.id}: types must appear in closed-enum order '${scenario.expected_type_order}'; got: ${typeOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (output_schema_top_level_type must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by response index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'output_schema_top_level_type')) {
      fail(`${scenario.id}: output_schema_top_level_type must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
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
    } else if (scenario.id === 'pii-field-hint-extraction-determinism') {
      await runPiiFieldHintScenario(tmpRoot, scenario);
    } else if (scenario.id === 'pii-category-label-determinism') {
      await runPiiCategoryLabelScenario(tmpRoot, scenario);
    } else if (scenario.id === 'redaction-review-determinism') {
      await runRedactionReviewDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'sensitivity_class_synthetic') {
      await runSensitivityClassSyntheticScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'sensitivity_class_preserve') {
      await runSensitivityClassPreserveScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'auth_requirements_synthetic') {
      await runAuthRequirementsSyntheticScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'surface_plan_determinism') {
      await runSurfacePlanDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'domain_index_determinism') {
      await runDomainIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'effect_index_determinism') {
      await runEffectIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'sensitivity_index_determinism') {
      await runSensitivityIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'method_index_determinism') {
      await runMethodIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'auth_scheme_index_determinism') {
      await runAuthSchemeIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'confidence_tier_index_determinism') {
      await runConfidenceTierIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'pii_field_count_tier_index_determinism') {
      await runPiiFieldCountTierIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'examples_count_tier_index_determinism') {
      await runExamplesCountTierIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'required_input_field_count_tier_index_determinism') {
      await runRequiredInputFieldCountTierIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'output_schema_property_count_tier_index_determinism') {
      await runOutputSchemaPropertyCountTierIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'path_segment_count_tier_index_determinism') {
      await runPathSegmentCountTierIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'output_schema_top_level_type_index_determinism') {
      await runOutputSchemaTopLevelTypeIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'input_schema_primary_parameter_source_index_determinism') {
      await runInputSchemaPrimaryParameterSourceIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'description_word_count_tier_index_determinism') {
      await runDescriptionWordCountTierIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'output_schema_items_type_index_determinism') {
      await runOutputSchemaItemsTypeIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'output_schema_strictness_index_determinism') {
      await runOutputSchemaStrictnessIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'input_schema_property_count_tier_index_determinism') {
      await runInputSchemaPropertyCountTierIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'output_schema_first_property_type_index_determinism') {
      await runOutputSchemaFirstPropertyTypeIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'input_schema_first_property_type_index_determinism') {
      await runInputSchemaFirstPropertyTypeIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'input_schema_first_property_required_status_index_determinism') {
      await runInputSchemaFirstPropertyRequiredStatusIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'input_schema_first_property_source_index_determinism') {
      await runInputSchemaFirstPropertySourceIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'input_schema_first_property_description_presence_index_determinism') {
      await runInputSchemaFirstPropertyDescriptionPresenceIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'input_schema_first_property_format_hint_index_determinism') {
      await runInputSchemaFirstPropertyFormatHintIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'input_schema_first_property_enum_constraint_index_determinism') {
      await runInputSchemaFirstPropertyEnumConstraintIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'input_schema_first_property_default_value_presence_index_determinism') {
      await runInputSchemaFirstPropertyDefaultValuePresenceIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'input_schema_first_property_examples_index_determinism') {
      await runInputSchemaFirstPropertyExamplesIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'input_schema_first_property_title_presence_index_determinism') {
      await runInputSchemaFirstPropertyTitlePresenceIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'input_schema_first_property_deprecated_index_determinism') {
      await runInputSchemaFirstPropertyDeprecatedIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'input_schema_first_property_pattern_index_determinism') {
      await runInputSchemaFirstPropertyPatternIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'input_schema_first_property_read_only_index_determinism') {
      await runInputSchemaFirstPropertyReadOnlyIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'input_schema_first_property_write_only_index_determinism') {
      await runInputSchemaFirstPropertyWriteOnlyIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'input_schema_first_property_min_length_index_determinism') {
      await runInputSchemaFirstPropertyMinLengthIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'input_schema_first_property_max_length_index_determinism') {
      await runInputSchemaFirstPropertyMaxLengthIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'input_schema_first_property_multiple_of_index_determinism') {
      await runInputSchemaFirstPropertyMultipleOfIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'input_schema_first_property_minimum_index_determinism') {
      await runInputSchemaFirstPropertyMinimumIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'input_schema_first_property_maximum_index_determinism') {
      await runInputSchemaFirstPropertyMaximumIndexDeterminismScenario(tmpRoot, scenario);
    } else if (scenario.scenario_type === 'input_schema_first_property_exclusive_minimum_index_determinism') {
      await runInputSchemaFirstPropertyExclusiveMinimumIndexDeterminismScenario(tmpRoot, scenario);
    } else {
      fail(`Unknown eval scenario: ${scenario.id}`);
    }
  }

  process.stdout.write(`Eval regression harness passed (${suite.scenarios.length} scenarios)\n`);
}

async function runDescriptionWordCountTierIndexDeterminismScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(project, { recursive: true });

  // Build a synthetic manifest from the scenario's capabilities
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: Object.prototype.hasOwnProperty.call(cap, 'method') ? cap.method : null,
      path: cap.path || '/',
      domain: Object.prototype.hasOwnProperty.call(cap, 'domain') ? cap.domain : null,
      side_effect_class: Object.prototype.hasOwnProperty.call(cap, 'side_effect_class') ? cap.side_effect_class : null,
      sensitivity_class: Object.prototype.hasOwnProperty.call(cap, 'sensitivity_class') ? cap.sensitivity_class : null,
      approved: cap.approved === true,
      auth_requirements: {
        auth_scheme: cap.auth_scheme || 'unknown',
        auth_scopes: [],
        auth_roles: [],
        evidence_source: cap.auth_scheme && cap.auth_scheme !== 'unknown' ? 'middleware_name' : 'none'
      },
      redaction: {
        pii_fields: [],
        pii_categories: []
      }
    };
    // Propagate description field only if present in cap (missing → unknown tier)
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-27T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq description index --json three times and assert byte-identical output
  const run1 = runCli(['description', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['description', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['description', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: description index --json output is not byte-identical across three runs`);
  }

  // Assert description_word_count_tier bucket-key enum is closed — every key is one of the four valid values
  const index = JSON.parse(run1.stdout);
  const validTiers = new Set(scenario.expected_valid_description_word_count_tiers);
  for (const entry of index.tiers) {
    if (!validTiers.has(entry.description_word_count_tier)) {
      fail(`${scenario.id}: description_word_count_tier '${entry.description_word_count_tier}' is outside the closed four-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the two valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.tiers) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed two-value enum for tier '${entry.description_word_count_tier}'`);
    }
  }

  // Assert tiers appear in closed-enum order (low → medium → high → unknown)
  const tierOrder = index.tiers.map((e) => e.description_word_count_tier).join(',');
  if (tierOrder !== scenario.expected_tier_order) {
    fail(`${scenario.id}: tiers must appear in closed-enum order '${scenario.expected_tier_order}'; got: ${tierOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (description_word_count_tier must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by description index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'description_word_count_tier')) {
      fail(`${scenario.id}: description_word_count_tier must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }
}

async function runOutputSchemaItemsTypeIndexDeterminismScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(project, { recursive: true });

  // Build a synthetic manifest from the scenario's capabilities
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: Object.prototype.hasOwnProperty.call(cap, 'method') ? cap.method : null,
      path: cap.path || '/',
      domain: Object.prototype.hasOwnProperty.call(cap, 'domain') ? cap.domain : null,
      side_effect_class: Object.prototype.hasOwnProperty.call(cap, 'side_effect_class') ? cap.side_effect_class : null,
      sensitivity_class: Object.prototype.hasOwnProperty.call(cap, 'sensitivity_class') ? cap.sensitivity_class : null,
      approved: cap.approved === true,
      auth_requirements: {
        auth_scheme: cap.auth_scheme || 'unknown',
        auth_scopes: [],
        auth_roles: [],
        evidence_source: cap.auth_scheme && cap.auth_scheme !== 'unknown' ? 'middleware_name' : 'none'
      },
      redaction: {
        pii_fields: [],
        pii_categories: []
      }
    };
    // Propagate description field only if present in cap
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    // Propagate output_schema field only if present in cap
    if (Object.prototype.hasOwnProperty.call(cap, 'output_schema')) {
      obj.output_schema = cap.output_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-27T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq items index --json three times and assert byte-identical output
  const run1 = runCli(['items', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['items', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['items', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: items index --json output is not byte-identical across three runs`);
  }

  // Assert output_schema_items_type bucket-key enum is closed — every key is one of the nine valid values
  const index = JSON.parse(run1.stdout);
  const validItemsTypes = new Set(scenario.expected_valid_output_schema_items_types);
  for (const entry of index.items_types) {
    if (!validItemsTypes.has(entry.output_schema_items_type)) {
      fail(`${scenario.id}: output_schema_items_type '${entry.output_schema_items_type}' is outside the closed nine-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.items_types) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for items_type '${entry.output_schema_items_type}'`);
    }
  }

  // Assert items_types appear in closed-enum order
  const itemsTypeOrder = index.items_types.map((e) => e.output_schema_items_type).join(',');
  if (itemsTypeOrder !== scenario.expected_items_type_order) {
    fail(`${scenario.id}: items_types must appear in closed-enum order '${scenario.expected_items_type_order}'; got: ${itemsTypeOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (output_schema_items_type must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by items index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'output_schema_items_type')) {
      fail(`${scenario.id}: output_schema_items_type must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }
}

async function runOutputSchemaStrictnessIndexDeterminismScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(project, { recursive: true });

  // Build a synthetic manifest from the scenario's capabilities
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: Object.prototype.hasOwnProperty.call(cap, 'method') ? cap.method : null,
      path: cap.path || '/',
      domain: Object.prototype.hasOwnProperty.call(cap, 'domain') ? cap.domain : null,
      side_effect_class: Object.prototype.hasOwnProperty.call(cap, 'side_effect_class') ? cap.side_effect_class : null,
      sensitivity_class: Object.prototype.hasOwnProperty.call(cap, 'sensitivity_class') ? cap.sensitivity_class : null,
      approved: cap.approved === true,
      auth_requirements: {
        auth_scheme: cap.auth_scheme || 'unknown',
        auth_scopes: [],
        auth_roles: [],
        evidence_source: cap.auth_scheme && cap.auth_scheme !== 'unknown' ? 'middleware_name' : 'none'
      },
      redaction: {
        pii_fields: [],
        pii_categories: []
      }
    };
    // Propagate description field only if present in cap
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    // Propagate output_schema field only if present in cap
    if (Object.prototype.hasOwnProperty.call(cap, 'output_schema')) {
      obj.output_schema = cap.output_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-27T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq strictness index --json three times and assert byte-identical output
  const run1 = runCli(['strictness', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['strictness', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['strictness', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: strictness index --json output is not byte-identical across three runs`);
  }

  // Assert output_schema_strictness bucket-key enum is closed — every key is one of the four valid values
  const index = JSON.parse(run1.stdout);
  const validStrictnesses = new Set(scenario.expected_valid_output_schema_strictnesses);
  for (const entry of index.strictnesses) {
    if (!validStrictnesses.has(entry.output_schema_strictness)) {
      fail(`${scenario.id}: output_schema_strictness '${entry.output_schema_strictness}' is outside the closed four-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.strictnesses) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for strictness '${entry.output_schema_strictness}'`);
    }
  }

  // Assert strictnesses appear in closed-enum order (strict → permissive → not_applicable → unknown)
  const strictnessOrder = index.strictnesses.map((e) => e.output_schema_strictness).join(',');
  if (strictnessOrder !== scenario.expected_strictness_order) {
    fail(`${scenario.id}: strictnesses must appear in closed-enum order '${scenario.expected_strictness_order}'; got: ${strictnessOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (output_schema_strictness must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by strictness index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'output_schema_strictness')) {
      fail(`${scenario.id}: output_schema_strictness must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert schema-as-additionalProperties buckets as unknown (no_schema_cap has missing output_schema → unknown)
  const unknownEntry = index.strictnesses.find((e) => e.output_schema_strictness === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing output_schema) must be in unknown bucket`);
  }
}

async function runInputSchemaPropertyCountTierIndexDeterminismScenario(tmpRoot, scenario) {
  const project = path.join(tmpRoot, scenario.id);
  await fs.mkdir(project, { recursive: true });

  // Build a synthetic manifest from the scenario's capabilities
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: Object.prototype.hasOwnProperty.call(cap, 'method') ? cap.method : null,
      path: cap.path || '/',
      domain: Object.prototype.hasOwnProperty.call(cap, 'domain') ? cap.domain : null,
      side_effect_class: Object.prototype.hasOwnProperty.call(cap, 'side_effect_class') ? cap.side_effect_class : null,
      sensitivity_class: Object.prototype.hasOwnProperty.call(cap, 'sensitivity_class') ? cap.sensitivity_class : null,
      approved: cap.approved === true,
      auth_requirements: {
        auth_scheme: cap.auth_scheme || 'unknown',
        auth_scopes: [],
        auth_roles: [],
        evidence_source: cap.auth_scheme && cap.auth_scheme !== 'unknown' ? 'middleware_name' : 'none'
      },
      redaction: {
        pii_fields: [],
        pii_categories: []
      }
    };
    // Propagate description field only if present in cap
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    // Propagate input_schema field only if present in cap
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-27T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq parameter index --json three times and assert byte-identical output
  const run1 = runCli(['parameter', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['parameter', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['parameter', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: parameter index --json output is not byte-identical across three runs`);
  }

  // Assert input_schema_property_count_tier bucket-key enum is closed — every key is one of the five valid values
  const index = JSON.parse(run1.stdout);
  const validTiers = new Set(scenario.expected_valid_input_schema_property_count_tiers);
  for (const entry of index.tiers) {
    if (!validTiers.has(entry.input_schema_property_count_tier)) {
      fail(`${scenario.id}: input_schema_property_count_tier '${entry.input_schema_property_count_tier}' is outside the closed five-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the two valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.tiers) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed two-value enum for tier '${entry.input_schema_property_count_tier}'`);
    }
  }

  // Assert tiers appear in closed-enum order (ascending-numeric-tier: none → low → medium → high → unknown)
  const tierOrder = index.tiers.map((e) => e.input_schema_property_count_tier).join(',');
  if (tierOrder !== scenario.expected_tier_order) {
    fail(`${scenario.id}: tiers must appear in closed-enum order '${scenario.expected_tier_order}'; got: ${tierOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (input_schema_property_count_tier must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by parameter index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema_property_count_tier')) {
      fail(`${scenario.id}: input_schema_property_count_tier must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert no_schema_cap (missing input_schema) is in unknown bucket
  const unknownEntry = index.tiers.find((e) => e.input_schema_property_count_tier === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing input_schema) must be in unknown bucket`);
  }
}

async function runOutputSchemaFirstPropertyTypeIndexDeterminismScenario(tmpRoot, scenario) {
  const project = await fs.mkdtemp(path.join(tmpRoot, 'output-schema-first-property-type-'));

  // Build capabilities from synthetic_capabilities descriptors
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: cap.method,
      path: cap.path,
      domain: cap.domain,
      side_effect_class: cap.side_effect_class,
      sensitivity_class: cap.sensitivity_class,
      approved: cap.approved
    };
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    if (Object.prototype.hasOwnProperty.call(cap, 'output_schema')) {
      obj.output_schema = cap.output_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-27T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq shape index --json three times and assert byte-identical output
  const run1 = runCli(['shape', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['shape', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['shape', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: shape index --json output is not byte-identical across three runs`);
  }

  // Assert output_schema_first_property_type bucket-key enum is closed — every key is one of the nine valid values
  const index = JSON.parse(run1.stdout);
  const validTypes = new Set(scenario.expected_valid_output_schema_first_property_types);
  for (const entry of index.first_property_types) {
    if (!validTypes.has(entry.output_schema_first_property_type)) {
      fail(`${scenario.id}: output_schema_first_property_type '${entry.output_schema_first_property_type}' is outside the closed nine-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.first_property_types) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for bucket '${entry.output_schema_first_property_type}'`);
    }
  }

  // Assert buckets appear in closed-enum order (string → number → integer → boolean → null → object → array → not_applicable → unknown)
  const bucketOrder = index.first_property_types.map((e) => e.output_schema_first_property_type).join(',');
  if (bucketOrder !== scenario.expected_bucket_order) {
    fail(`${scenario.id}: buckets must appear in closed-enum order '${scenario.expected_bucket_order}'; got: ${bucketOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (output_schema_first_property_type must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by shape index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'output_schema_first_property_type')) {
      fail(`${scenario.id}: output_schema_first_property_type must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert no_schema_cap (missing output_schema) is in unknown bucket
  const unknownEntry = index.first_property_types.find((e) => e.output_schema_first_property_type === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing output_schema) must be in unknown bucket`);
  }

  // Assert array_type_cap (output_schema.type='array') is in not_applicable bucket with no warning
  const naEntry = index.first_property_types.find((e) => e.output_schema_first_property_type === 'not_applicable');
  if (!naEntry || !naEntry.capabilities.includes('array_type_cap')) {
    fail(`${scenario.id}: array_type_cap (output_schema.type='array') must be in not_applicable bucket`);
  }
  if (index.warnings.some((w) => w.capability === 'array_type_cap')) {
    fail(`${scenario.id}: array_type_cap (not_applicable bucket) must NOT produce a warning`);
  }
}

async function runInputSchemaFirstPropertyTypeIndexDeterminismScenario(tmpRoot, scenario) {
  const project = await fs.mkdtemp(path.join(tmpRoot, 'input-schema-first-property-type-'));

  // Build capabilities from synthetic_capabilities descriptors
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: cap.method,
      path: cap.path,
      domain: cap.domain,
      side_effect_class: cap.side_effect_class,
      sensitivity_class: cap.sensitivity_class,
      approved: cap.approved
    };
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-28T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq signature index --json three times and assert byte-identical output
  const run1 = runCli(['signature', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['signature', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['signature', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: signature index --json output is not byte-identical across three runs`);
  }

  // Assert input_schema_first_property_type bucket-key enum is closed — every key is one of the nine valid values
  const index = JSON.parse(run1.stdout);
  const validTypes = new Set(scenario.expected_valid_input_schema_first_property_types);
  for (const entry of index.first_property_types) {
    if (!validTypes.has(entry.input_schema_first_property_type)) {
      fail(`${scenario.id}: input_schema_first_property_type '${entry.input_schema_first_property_type}' is outside the closed nine-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.first_property_types) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for bucket '${entry.input_schema_first_property_type}'`);
    }
  }

  // Assert buckets appear in closed-enum order (string → number → integer → boolean → null → object → array → not_applicable → unknown)
  const bucketOrder = index.first_property_types.map((e) => e.input_schema_first_property_type).join(',');
  if (bucketOrder !== scenario.expected_bucket_order) {
    fail(`${scenario.id}: buckets must appear in closed-enum order '${scenario.expected_bucket_order}'; got: ${bucketOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (input_schema_first_property_type must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by signature index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema_first_property_type')) {
      fail(`${scenario.id}: input_schema_first_property_type must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert no_schema_cap (missing input_schema) is in unknown bucket
  const unknownEntry = index.first_property_types.find((e) => e.input_schema_first_property_type === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing input_schema) must be in unknown bucket`);
  }

  // Assert array_input_cap (input_schema.type='array') is in not_applicable bucket with no warning
  const naEntry = index.first_property_types.find((e) => e.input_schema_first_property_type === 'not_applicable');
  if (!naEntry || !naEntry.capabilities.includes('array_input_cap')) {
    fail(`${scenario.id}: array_input_cap (input_schema.type='array') must be in not_applicable bucket`);
  }
  if (index.warnings.some((w) => w.capability === 'array_input_cap')) {
    fail(`${scenario.id}: array_input_cap (not_applicable bucket) must NOT produce a warning`);
  }
}

async function runInputSchemaFirstPropertyRequiredStatusIndexDeterminismScenario(tmpRoot, scenario) {
  const project = await fs.mkdtemp(path.join(tmpRoot, 'input-schema-first-property-required-status-'));

  // Build capabilities from synthetic_capabilities descriptors
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: cap.method,
      path: cap.path,
      domain: cap.domain,
      side_effect_class: cap.side_effect_class,
      sensitivity_class: cap.sensitivity_class,
      approved: cap.approved
    };
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-28T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq obligation index --json three times and assert byte-identical output
  const run1 = runCli(['obligation', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['obligation', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['obligation', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: obligation index --json output is not byte-identical across three runs`);
  }

  // Assert input_schema_first_property_required_status bucket-key enum is closed — every key is one of the four valid values
  const index = JSON.parse(run1.stdout);
  const validStatuses = new Set(scenario.expected_valid_required_statuses);
  for (const entry of index.required_statuses) {
    if (!validStatuses.has(entry.input_schema_first_property_required_status)) {
      fail(`${scenario.id}: input_schema_first_property_required_status '${entry.input_schema_first_property_required_status}' is outside the closed four-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.required_statuses) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for bucket '${entry.input_schema_first_property_required_status}'`);
    }
  }

  // Assert buckets appear in closed-enum order (required → optional → not_applicable → unknown)
  const bucketOrder = index.required_statuses.map((e) => e.input_schema_first_property_required_status).join(',');
  if (bucketOrder !== scenario.expected_bucket_order) {
    fail(`${scenario.id}: buckets must appear in closed-enum order '${scenario.expected_bucket_order}'; got: ${bucketOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (input_schema_first_property_required_status must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by obligation index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema_first_property_required_status')) {
      fail(`${scenario.id}: input_schema_first_property_required_status must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert no_schema_cap (missing input_schema) is in unknown bucket
  const unknownEntry = index.required_statuses.find((e) => e.input_schema_first_property_required_status === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing input_schema) must be in unknown bucket`);
  }

  // Assert array_input_cap (input_schema.type='array') is in not_applicable bucket with no warning
  const naEntry = index.required_statuses.find((e) => e.input_schema_first_property_required_status === 'not_applicable');
  if (!naEntry || !naEntry.capabilities.includes('array_input_cap')) {
    fail(`${scenario.id}: array_input_cap (input_schema.type='array') must be in not_applicable bucket`);
  }
  if (index.warnings.some((w) => w.capability === 'array_input_cap')) {
    fail(`${scenario.id}: array_input_cap (not_applicable bucket) must NOT produce a warning`);
  }

  // Assert insertion_order_cap uses Object.keys insertion order: keys={c,a,b}, required=['a'] → firstKey='c' → optional
  const optionalEntry = index.required_statuses.find((e) => e.input_schema_first_property_required_status === 'optional');
  if (!optionalEntry || !optionalEntry.capabilities.includes('insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap must be in optional bucket (firstKey='c' not in required=['a']); Object.keys insertion-order must be preserved, not sorted`);
  }

  // Assert required_cap is in required bucket
  const requiredEntry = index.required_statuses.find((e) => e.input_schema_first_property_required_status === 'required');
  if (!requiredEntry || !requiredEntry.capabilities.includes('required_cap')) {
    fail(`${scenario.id}: required_cap (firstKey='id' ∈ required=['id']) must be in required bucket`);
  }
}

async function runInputSchemaFirstPropertySourceIndexDeterminismScenario(tmpRoot, scenario) {
  const project = await fs.mkdtemp(path.join(tmpRoot, 'input-schema-first-property-source-'));

  // Build capabilities from synthetic_capabilities descriptors
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: cap.method,
      path: cap.path,
      domain: cap.domain,
      side_effect_class: cap.side_effect_class,
      sensitivity_class: cap.sensitivity_class,
      approved: cap.approved
    };
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-28T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq binding index --json three times and assert byte-identical output
  const run1 = runCli(['binding', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['binding', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['binding', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: binding index --json output is not byte-identical across three runs`);
  }

  // Assert input_schema_first_property_source bucket-key enum is closed — every key is one of the six valid values
  const index = JSON.parse(run1.stdout);
  const validSources = new Set(scenario.expected_valid_sources);
  for (const entry of index.first_property_sources) {
    if (!validSources.has(entry.input_schema_first_property_source)) {
      fail(`${scenario.id}: input_schema_first_property_source '${entry.input_schema_first_property_source}' is outside the closed six-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.first_property_sources) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for bucket '${entry.input_schema_first_property_source}'`);
    }
  }

  // Assert buckets appear in closed-enum order (path → request_body → query → header → not_applicable → unknown)
  const bucketOrder = index.first_property_sources.map((e) => e.input_schema_first_property_source).join(',');
  if (bucketOrder !== scenario.expected_bucket_order) {
    fail(`${scenario.id}: buckets must appear in closed-enum order '${scenario.expected_bucket_order}'; got: ${bucketOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (input_schema_first_property_source must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by binding index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema_first_property_source')) {
      fail(`${scenario.id}: input_schema_first_property_source must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert no_schema_cap (missing input_schema) is in unknown bucket
  const unknownEntry = index.first_property_sources.find((e) => e.input_schema_first_property_source === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing input_schema) must be in unknown bucket`);
  }

  // Assert array_input_cap (input_schema.type='array') is in not_applicable bucket with no warning
  const naEntry = index.first_property_sources.find((e) => e.input_schema_first_property_source === 'not_applicable');
  if (!naEntry || !naEntry.capabilities.includes('array_input_cap')) {
    fail(`${scenario.id}: array_input_cap (input_schema.type='array') must be in not_applicable bucket`);
  }
  if (index.warnings.some((w) => w.capability === 'array_input_cap')) {
    fail(`${scenario.id}: array_input_cap (not_applicable bucket) must NOT produce a warning`);
  }

  // Assert path_cap is in path bucket
  const pathEntry = index.first_property_sources.find((e) => e.input_schema_first_property_source === 'path');
  if (!pathEntry || !pathEntry.capabilities.includes('path_cap')) {
    fail(`${scenario.id}: path_cap (firstKey.source='path') must be in path bucket`);
  }

  // Assert request_body_cap is in request_body bucket
  const requestBodyEntry = index.first_property_sources.find((e) => e.input_schema_first_property_source === 'request_body');
  if (!requestBodyEntry || !requestBodyEntry.capabilities.includes('request_body_cap')) {
    fail(`${scenario.id}: request_body_cap (firstKey.source='request_body') must be in request_body bucket`);
  }

  // Assert query_cap is in query bucket
  const queryEntry = index.first_property_sources.find((e) => e.input_schema_first_property_source === 'query');
  if (!queryEntry || !queryEntry.capabilities.includes('query_cap')) {
    fail(`${scenario.id}: query_cap (firstKey.source='query') must be in query bucket`);
  }

  // Assert header_cap is in header bucket
  const headerEntry = index.first_property_sources.find((e) => e.input_schema_first_property_source === 'header');
  if (!headerEntry || !headerEntry.capabilities.includes('header_cap')) {
    fail(`${scenario.id}: header_cap (firstKey.source='header') must be in header bucket`);
  }
}

async function runInputSchemaFirstPropertyDescriptionPresenceIndexDeterminismScenario(tmpRoot, scenario) {
  const project = await fs.mkdtemp(path.join(tmpRoot, 'input-schema-first-property-description-presence-'));

  // Build capabilities from synthetic_capabilities descriptors
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: cap.method,
      path: cap.path,
      domain: cap.domain,
      side_effect_class: cap.side_effect_class,
      sensitivity_class: cap.sensitivity_class,
      approved: cap.approved
    };
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-28T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq gloss index --json three times and assert byte-identical output
  const run1 = runCli(['gloss', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['gloss', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['gloss', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: gloss index --json output is not byte-identical across three runs`);
  }

  // Assert input_schema_first_property_description_presence bucket-key enum is closed — every key is one of the four valid values
  const index = JSON.parse(run1.stdout);
  const validPresences = new Set(scenario.expected_valid_presences);
  for (const entry of index.first_property_description_presences) {
    if (!validPresences.has(entry.input_schema_first_property_description_presence)) {
      fail(`${scenario.id}: input_schema_first_property_description_presence '${entry.input_schema_first_property_description_presence}' is outside the closed four-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.first_property_description_presences) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for bucket '${entry.input_schema_first_property_description_presence}'`);
    }
  }

  // Assert buckets appear in closed-enum order (described → undescribed → not_applicable → unknown)
  const bucketOrder = index.first_property_description_presences.map((e) => e.input_schema_first_property_description_presence).join(',');
  if (bucketOrder !== scenario.expected_bucket_order) {
    fail(`${scenario.id}: buckets must appear in closed-enum order '${scenario.expected_bucket_order}'; got: ${bucketOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (input_schema_first_property_description_presence must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by gloss index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema_first_property_description_presence')) {
      fail(`${scenario.id}: input_schema_first_property_description_presence must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert no_schema_cap (missing input_schema) is in unknown bucket
  const unknownEntry = index.first_property_description_presences.find((e) => e.input_schema_first_property_description_presence === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing input_schema) must be in unknown bucket`);
  }

  // Assert not_applicable_cap (input_schema.type='array') is in not_applicable bucket with no warning
  const naEntry = index.first_property_description_presences.find((e) => e.input_schema_first_property_description_presence === 'not_applicable');
  if (!naEntry || !naEntry.capabilities.includes('not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (input_schema.type='array') must be in not_applicable bucket`);
  }
  if (index.warnings.some((w) => w.capability === 'not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (not_applicable bucket) must NOT produce a warning`);
  }

  // Assert described_cap is in described bucket
  const describedEntry = index.first_property_description_presences.find((e) => e.input_schema_first_property_description_presence === 'described');
  if (!describedEntry || !describedEntry.capabilities.includes('described_cap')) {
    fail(`${scenario.id}: described_cap (firstKey.description='The user identifier') must be in described bucket`);
  }

  // Assert undescribed_cap is in undescribed bucket
  const undescribedEntry = index.first_property_description_presences.find((e) => e.input_schema_first_property_description_presence === 'undescribed');
  if (!undescribedEntry || !undescribedEntry.capabilities.includes('undescribed_cap')) {
    fail(`${scenario.id}: undescribed_cap (firstKey.description missing) must be in undescribed bucket`);
  }

  // Assert insertion_order_cap is in undescribed bucket (firstKey='c', no description) NOT described (sorted 'a' would be described)
  if (!undescribedEntry || !undescribedEntry.capabilities.includes('insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (keys={c,a,b}, firstKey=c has no description) must be in undescribed bucket (insertion-order, NOT sorted)`);
  }
  if (index.warnings.some((w) => w.capability === 'insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (undescribed bucket) must NOT produce a warning`);
  }
}

async function runInputSchemaFirstPropertyFormatHintIndexDeterminismScenario(tmpRoot, scenario) {
  const project = await fs.mkdtemp(path.join(tmpRoot, 'input-schema-first-property-format-hint-'));

  // Build capabilities from synthetic_capabilities descriptors
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: cap.method,
      path: cap.path,
      domain: cap.domain,
      side_effect_class: cap.side_effect_class,
      sensitivity_class: cap.sensitivity_class,
      approved: cap.approved
    };
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-28T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq hint index --json three times and assert byte-identical output
  const run1 = runCli(['hint', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['hint', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['hint', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: hint index --json output is not byte-identical across three runs`);
  }

  // Assert input_schema_first_property_format_hint bucket-key enum is closed — every key is one of the four valid values
  const index = JSON.parse(run1.stdout);
  const validHints = new Set(scenario.expected_valid_hints);
  for (const entry of index.first_property_format_hints) {
    if (!validHints.has(entry.input_schema_first_property_format_hint)) {
      fail(`${scenario.id}: input_schema_first_property_format_hint '${entry.input_schema_first_property_format_hint}' is outside the closed four-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.first_property_format_hints) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for bucket '${entry.input_schema_first_property_format_hint}'`);
    }
  }

  // Assert buckets appear in closed-enum order (hinted → unhinted → not_applicable → unknown)
  const bucketOrder = index.first_property_format_hints.map((e) => e.input_schema_first_property_format_hint).join(',');
  if (bucketOrder !== scenario.expected_bucket_order) {
    fail(`${scenario.id}: buckets must appear in closed-enum order '${scenario.expected_bucket_order}'; got: ${bucketOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (input_schema_first_property_format_hint must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by hint index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema_first_property_format_hint')) {
      fail(`${scenario.id}: input_schema_first_property_format_hint must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert no_schema_cap (missing input_schema) is in unknown bucket
  const unknownEntry = index.first_property_format_hints.find((e) => e.input_schema_first_property_format_hint === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing input_schema) must be in unknown bucket`);
  }

  // Assert not_applicable_cap (input_schema.type='array') is in not_applicable bucket with no warning
  const naEntry = index.first_property_format_hints.find((e) => e.input_schema_first_property_format_hint === 'not_applicable');
  if (!naEntry || !naEntry.capabilities.includes('not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (input_schema.type='array') must be in not_applicable bucket`);
  }
  if (index.warnings.some((w) => w.capability === 'not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (not_applicable bucket) must NOT produce a warning`);
  }

  // Assert hinted_cap is in hinted bucket
  const hintedEntry = index.first_property_format_hints.find((e) => e.input_schema_first_property_format_hint === 'hinted');
  if (!hintedEntry || !hintedEntry.capabilities.includes('hinted_cap')) {
    fail(`${scenario.id}: hinted_cap (firstKey.format='email') must be in hinted bucket`);
  }

  // Assert unhinted_cap is in unhinted bucket
  const unhintedEntry = index.first_property_format_hints.find((e) => e.input_schema_first_property_format_hint === 'unhinted');
  if (!unhintedEntry || !unhintedEntry.capabilities.includes('unhinted_cap')) {
    fail(`${scenario.id}: unhinted_cap (firstKey.format missing) must be in unhinted bucket`);
  }

  // Assert insertion_order_cap is in hinted bucket (firstKey='z', format='email') NOT unhinted (sorted 'a' would be unhinted)
  if (!hintedEntry || !hintedEntry.capabilities.includes('insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (keys={z,a,b}, firstKey=z has format='email') must be in hinted bucket (insertion-order, NOT sorted)`);
  }
  if (index.warnings.some((w) => w.capability === 'insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (hinted bucket) must NOT produce a warning`);
  }
}

async function runInputSchemaFirstPropertyEnumConstraintIndexDeterminismScenario(tmpRoot, scenario) {
  const project = await fs.mkdtemp(path.join(tmpRoot, 'input-schema-first-property-enum-constraint-'));

  // Build capabilities from synthetic_capabilities descriptors
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: cap.method,
      path: cap.path,
      domain: cap.domain,
      side_effect_class: cap.side_effect_class,
      sensitivity_class: cap.sensitivity_class,
      approved: cap.approved
    };
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-28T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq choice index --json three times and assert byte-identical output
  const run1 = runCli(['choice', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['choice', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['choice', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: choice index --json output is not byte-identical across three runs`);
  }

  // Assert input_schema_first_property_enum_constraint bucket-key enum is closed — every key is one of the four valid values
  const index = JSON.parse(run1.stdout);
  const validEnumConstraints = new Set(scenario.expected_valid_enum_constraints);
  for (const entry of index.first_property_enum_constraints) {
    if (!validEnumConstraints.has(entry.input_schema_first_property_enum_constraint)) {
      fail(`${scenario.id}: input_schema_first_property_enum_constraint '${entry.input_schema_first_property_enum_constraint}' is outside the closed four-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.first_property_enum_constraints) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for bucket '${entry.input_schema_first_property_enum_constraint}'`);
    }
  }

  // Assert buckets appear in closed-enum order (enumerated → unenumerated → not_applicable → unknown)
  const bucketOrder = index.first_property_enum_constraints.map((e) => e.input_schema_first_property_enum_constraint).join(',');
  if (bucketOrder !== scenario.expected_bucket_order) {
    fail(`${scenario.id}: buckets must appear in closed-enum order '${scenario.expected_bucket_order}'; got: ${bucketOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (input_schema_first_property_enum_constraint must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by choice index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema_first_property_enum_constraint')) {
      fail(`${scenario.id}: input_schema_first_property_enum_constraint must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert no_schema_cap (missing input_schema) is in unknown bucket
  const unknownEntry = index.first_property_enum_constraints.find((e) => e.input_schema_first_property_enum_constraint === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing input_schema) must be in unknown bucket`);
  }

  // Assert not_applicable_cap (input_schema.type='array') is in not_applicable bucket with no warning
  const naEntry = index.first_property_enum_constraints.find((e) => e.input_schema_first_property_enum_constraint === 'not_applicable');
  if (!naEntry || !naEntry.capabilities.includes('not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (input_schema.type='array') must be in not_applicable bucket`);
  }
  if (index.warnings.some((w) => w.capability === 'not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (not_applicable bucket) must NOT produce a warning`);
  }

  // Assert enumerated_cap is in enumerated bucket
  const enumeratedEntry = index.first_property_enum_constraints.find((e) => e.input_schema_first_property_enum_constraint === 'enumerated');
  if (!enumeratedEntry || !enumeratedEntry.capabilities.includes('enumerated_cap')) {
    fail(`${scenario.id}: enumerated_cap (firstKey.enum=['active','inactive','pending']) must be in enumerated bucket`);
  }

  // Assert unenumerated_cap is in unenumerated bucket
  const unenumeratedEntry = index.first_property_enum_constraints.find((e) => e.input_schema_first_property_enum_constraint === 'unenumerated');
  if (!unenumeratedEntry || !unenumeratedEntry.capabilities.includes('unenumerated_cap')) {
    fail(`${scenario.id}: unenumerated_cap (firstKey.enum missing) must be in unenumerated bucket`);
  }

  // Assert insertion_order_cap is in enumerated bucket (firstKey='z', enum=['x','y']) NOT unenumerated (sorted 'a' would be unenumerated)
  if (!enumeratedEntry || !enumeratedEntry.capabilities.includes('insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (keys={z,a,b}, firstKey=z has enum=['x','y']) must be in enumerated bucket (insertion-order, NOT sorted)`);
  }
  if (index.warnings.some((w) => w.capability === 'insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (enumerated bucket) must NOT produce a warning`);
  }
}

async function runInputSchemaFirstPropertyDefaultValuePresenceIndexDeterminismScenario(tmpRoot, scenario) {
  const project = await fs.mkdtemp(path.join(tmpRoot, 'input-schema-first-property-default-value-'));

  // Build capabilities from synthetic_capabilities descriptors
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: cap.method,
      path: cap.path,
      domain: cap.domain,
      side_effect_class: cap.side_effect_class,
      sensitivity_class: cap.sensitivity_class,
      approved: cap.approved
    };
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-28T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq preset index --json three times and assert byte-identical output
  const run1 = runCli(['preset', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['preset', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['preset', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: preset index --json output is not byte-identical across three runs`);
  }

  // Assert input_schema_first_property_default_value bucket-key enum is closed — every key is one of the four valid values
  const index = JSON.parse(run1.stdout);
  const validDefaultValues = new Set(scenario.expected_valid_default_values);
  for (const entry of index.first_property_default_values) {
    if (!validDefaultValues.has(entry.input_schema_first_property_default_value)) {
      fail(`${scenario.id}: input_schema_first_property_default_value '${entry.input_schema_first_property_default_value}' is outside the closed four-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.first_property_default_values) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for bucket '${entry.input_schema_first_property_default_value}'`);
    }
  }

  // Assert buckets appear in closed-enum order (defaulted → undefaulted → not_applicable → unknown)
  const bucketOrder = index.first_property_default_values.map((e) => e.input_schema_first_property_default_value).join(',');
  if (bucketOrder !== scenario.expected_bucket_order) {
    fail(`${scenario.id}: buckets must appear in closed-enum order '${scenario.expected_bucket_order}'; got: ${bucketOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (input_schema_first_property_default_value must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by preset index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema_first_property_default_value')) {
      fail(`${scenario.id}: input_schema_first_property_default_value must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert no_schema_cap (missing input_schema) is in unknown bucket
  const unknownEntry = index.first_property_default_values.find((e) => e.input_schema_first_property_default_value === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing input_schema) must be in unknown bucket`);
  }

  // Assert not_applicable_cap (input_schema.type='array') is in not_applicable bucket with no warning
  const naEntry = index.first_property_default_values.find((e) => e.input_schema_first_property_default_value === 'not_applicable');
  if (!naEntry || !naEntry.capabilities.includes('not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (input_schema.type='array') must be in not_applicable bucket`);
  }
  if (index.warnings.some((w) => w.capability === 'not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (not_applicable bucket) must NOT produce a warning`);
  }

  // Assert defaulted_cap is in defaulted bucket
  const defaultedEntry = index.first_property_default_values.find((e) => e.input_schema_first_property_default_value === 'defaulted');
  if (!defaultedEntry || !defaultedEntry.capabilities.includes('defaulted_cap')) {
    fail(`${scenario.id}: defaulted_cap (firstKey.default='active') must be in defaulted bucket`);
  }

  // Assert undefaulted_cap is in undefaulted bucket
  const undefaultedEntry = index.first_property_default_values.find((e) => e.input_schema_first_property_default_value === 'undefaulted');
  if (!undefaultedEntry || !undefaultedEntry.capabilities.includes('undefaulted_cap')) {
    fail(`${scenario.id}: undefaulted_cap (firstKey.default missing) must be in undefaulted bucket`);
  }

  // Assert insertion_order_cap is in defaulted bucket (firstKey='z', default='seed') NOT undefaulted (sorted 'a' would be undefaulted)
  if (!defaultedEntry || !defaultedEntry.capabilities.includes('insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (keys={z,a,b}, firstKey=z has default='seed') must be in defaulted bucket (insertion-order, NOT sorted)`);
  }
  if (index.warnings.some((w) => w.capability === 'insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (defaulted bucket) must NOT produce a warning`);
  }
}

async function runInputSchemaFirstPropertyExamplesIndexDeterminismScenario(tmpRoot, scenario) {
  const project = await fs.mkdtemp(path.join(tmpRoot, 'input-schema-first-property-examples-'));

  // Build capabilities from synthetic_capabilities descriptors
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: cap.method,
      path: cap.path,
      domain: cap.domain,
      side_effect_class: cap.side_effect_class,
      sensitivity_class: cap.sensitivity_class,
      approved: cap.approved
    };
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-28T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq sample index --json three times and assert byte-identical output
  const run1 = runCli(['sample', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['sample', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['sample', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: sample index --json output is not byte-identical across three runs`);
  }

  // Assert input_schema_first_property_examples bucket-key enum is closed — every key is one of the four valid values
  const index = JSON.parse(run1.stdout);
  const validExamplesValues = new Set(scenario.expected_valid_examples_values);
  for (const entry of index.first_property_examples) {
    if (!validExamplesValues.has(entry.input_schema_first_property_examples)) {
      fail(`${scenario.id}: input_schema_first_property_examples '${entry.input_schema_first_property_examples}' is outside the closed four-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.first_property_examples) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for bucket '${entry.input_schema_first_property_examples}'`);
    }
  }

  // Assert buckets appear in closed-enum order (exampled → unexampled → not_applicable → unknown)
  const bucketOrder = index.first_property_examples.map((e) => e.input_schema_first_property_examples).join(',');
  if (bucketOrder !== scenario.expected_bucket_order) {
    fail(`${scenario.id}: buckets must appear in closed-enum order '${scenario.expected_bucket_order}'; got: ${bucketOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (input_schema_first_property_examples must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by sample index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema_first_property_examples')) {
      fail(`${scenario.id}: input_schema_first_property_examples must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert no_schema_cap (missing input_schema) is in unknown bucket
  const unknownEntry = index.first_property_examples.find((e) => e.input_schema_first_property_examples === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing input_schema) must be in unknown bucket`);
  }

  // Assert not_applicable_cap (input_schema.type='array') is in not_applicable bucket with no warning
  const naEntry = index.first_property_examples.find((e) => e.input_schema_first_property_examples === 'not_applicable');
  if (!naEntry || !naEntry.capabilities.includes('not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (input_schema.type='array') must be in not_applicable bucket`);
  }
  if (index.warnings.some((w) => w.capability === 'not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (not_applicable bucket) must NOT produce a warning`);
  }

  // Assert exampled_cap is in exampled bucket
  const exampledEntry = index.first_property_examples.find((e) => e.input_schema_first_property_examples === 'exampled');
  if (!exampledEntry || !exampledEntry.capabilities.includes('exampled_cap')) {
    fail(`${scenario.id}: exampled_cap (firstKey.examples=['active','inactive']) must be in exampled bucket`);
  }

  // Assert unexampled_cap is in unexampled bucket
  const unexampledEntry = index.first_property_examples.find((e) => e.input_schema_first_property_examples === 'unexampled');
  if (!unexampledEntry || !unexampledEntry.capabilities.includes('unexampled_cap')) {
    fail(`${scenario.id}: unexampled_cap (firstKey.examples missing) must be in unexampled bucket`);
  }

  // Assert insertion_order_cap is in exampled bucket (firstKey='z', examples=['seed']) NOT unexampled (sorted 'a' has no examples)
  if (!exampledEntry || !exampledEntry.capabilities.includes('insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (keys={z,a,b}, firstKey=z has examples=['seed']) must be in exampled bucket (insertion-order, NOT sorted)`);
  }
  // insertion_order_cap's 'b' property has examples=[] which would be unknown, but firstKey='z' is exampled — no warning for cap
  if (index.warnings.some((w) => w.capability === 'insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (exampled bucket via firstKey=z) must NOT produce a warning`);
  }

  // Assert exampled bucket has aggregation_key 'example_set'
  if (exampledEntry.aggregation_key !== 'example_set') {
    fail(`${scenario.id}: exampled bucket must have aggregation_key 'example_set'; got '${exampledEntry.aggregation_key}'`);
  }

  // Assert not_applicable bucket has aggregation_key 'not_applicable'
  if (naEntry.aggregation_key !== 'not_applicable') {
    fail(`${scenario.id}: not_applicable bucket must have aggregation_key 'not_applicable'; got '${naEntry.aggregation_key}'`);
  }

  // Assert unknown bucket has aggregation_key 'unknown'
  if (unknownEntry.aggregation_key !== 'unknown') {
    fail(`${scenario.id}: unknown bucket must have aggregation_key 'unknown'; got '${unknownEntry.aggregation_key}'`);
  }
}

async function runInputSchemaFirstPropertyTitlePresenceIndexDeterminismScenario(tmpRoot, scenario) {
  const project = await fs.mkdtemp(path.join(tmpRoot, 'input-schema-first-property-title-'));

  // Build capabilities from synthetic_capabilities descriptors
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: cap.method,
      path: cap.path,
      domain: cap.domain,
      side_effect_class: cap.side_effect_class,
      sensitivity_class: cap.sensitivity_class,
      approved: cap.approved
    };
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-28T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq caption index --json three times and assert byte-identical output
  const run1 = runCli(['caption', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['caption', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['caption', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: caption index --json output is not byte-identical across three runs`);
  }

  // Assert input_schema_first_property_title bucket-key enum is closed — every key is one of the four valid values
  const index = JSON.parse(run1.stdout);
  const validTitleValues = new Set(scenario.expected_valid_title_values);
  for (const entry of index.first_property_titles) {
    if (!validTitleValues.has(entry.input_schema_first_property_title)) {
      fail(`${scenario.id}: input_schema_first_property_title '${entry.input_schema_first_property_title}' is outside the closed four-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.first_property_titles) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for bucket '${entry.input_schema_first_property_title}'`);
    }
  }

  // Assert buckets appear in closed-enum order (titled → untitled → not_applicable → unknown)
  const bucketOrder = index.first_property_titles.map((e) => e.input_schema_first_property_title).join(',');
  if (bucketOrder !== scenario.expected_bucket_order) {
    fail(`${scenario.id}: buckets must appear in closed-enum order '${scenario.expected_bucket_order}'; got: ${bucketOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (input_schema_first_property_title must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by caption index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema_first_property_title')) {
      fail(`${scenario.id}: input_schema_first_property_title must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert no_schema_cap (missing input_schema) is in unknown bucket
  const unknownEntry = index.first_property_titles.find((e) => e.input_schema_first_property_title === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing input_schema) must be in unknown bucket`);
  }

  // Assert not_applicable_cap (input_schema.type='array') is in not_applicable bucket with no warning
  const naEntry = index.first_property_titles.find((e) => e.input_schema_first_property_title === 'not_applicable');
  if (!naEntry || !naEntry.capabilities.includes('not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (input_schema.type='array') must be in not_applicable bucket`);
  }
  if (index.warnings.some((w) => w.capability === 'not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (not_applicable bucket) must NOT produce a warning`);
  }

  // Assert titled_cap is in titled bucket
  const titledEntry = index.first_property_titles.find((e) => e.input_schema_first_property_title === 'titled');
  if (!titledEntry || !titledEntry.capabilities.includes('titled_cap')) {
    fail(`${scenario.id}: titled_cap (firstKey.title='Subscription ID') must be in titled bucket`);
  }

  // Assert untitled_cap is in untitled bucket
  const untitledEntry = index.first_property_titles.find((e) => e.input_schema_first_property_title === 'untitled');
  if (!untitledEntry || !untitledEntry.capabilities.includes('untitled_cap')) {
    fail(`${scenario.id}: untitled_cap (firstKey.title missing) must be in untitled bucket`);
  }

  // Assert insertion_order_cap is in titled bucket (firstKey='z', title='Subscription ID') NOT untitled (sorted 'a' has no title)
  if (!titledEntry || !titledEntry.capabilities.includes('insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (keys={z,a,b}, firstKey=z has title='Subscription ID') must be in titled bucket (insertion-order, NOT sorted)`);
  }
  // insertion_order_cap's 'b' property has title='' which would be unknown, but firstKey='z' is titled — no warning for cap
  if (index.warnings.some((w) => w.capability === 'insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (titled bucket via firstKey=z) must NOT produce a warning`);
  }

  // Assert titled bucket has aggregation_key 'title_label'
  if (titledEntry.aggregation_key !== 'title_label') {
    fail(`${scenario.id}: titled bucket must have aggregation_key 'title_label'; got '${titledEntry.aggregation_key}'`);
  }

  // Assert untitled bucket has aggregation_key 'title_label'
  if (untitledEntry.aggregation_key !== 'title_label') {
    fail(`${scenario.id}: untitled bucket must have aggregation_key 'title_label'; got '${untitledEntry.aggregation_key}'`);
  }

  // Assert not_applicable bucket has aggregation_key 'not_applicable'
  if (naEntry.aggregation_key !== 'not_applicable') {
    fail(`${scenario.id}: not_applicable bucket must have aggregation_key 'not_applicable'; got '${naEntry.aggregation_key}'`);
  }

  // Assert unknown bucket has aggregation_key 'unknown'
  if (unknownEntry.aggregation_key !== 'unknown') {
    fail(`${scenario.id}: unknown bucket must have aggregation_key 'unknown'; got '${unknownEntry.aggregation_key}'`);
  }
}

async function runInputSchemaFirstPropertyDeprecatedIndexDeterminismScenario(tmpRoot, scenario) {
  const project = await fs.mkdtemp(path.join(tmpRoot, 'input-schema-first-property-deprecated-'));

  // Build capabilities from synthetic_capabilities descriptors
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: cap.method,
      path: cap.path,
      domain: cap.domain,
      side_effect_class: cap.side_effect_class,
      sensitivity_class: cap.sensitivity_class,
      approved: cap.approved
    };
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-28T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq legacy index --json three times and assert byte-identical output
  const run1 = runCli(['legacy', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['legacy', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['legacy', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: legacy index --json output is not byte-identical across three runs`);
  }

  // Assert input_schema_first_property_deprecated bucket-key enum is closed — every key is one of the four valid values
  const index = JSON.parse(run1.stdout);
  const validDeprecatedValues = new Set(scenario.expected_valid_deprecated_values);
  for (const entry of index.first_property_deprecation_states) {
    if (!validDeprecatedValues.has(entry.input_schema_first_property_deprecated)) {
      fail(`${scenario.id}: input_schema_first_property_deprecated '${entry.input_schema_first_property_deprecated}' is outside the closed four-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.first_property_deprecation_states) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for bucket '${entry.input_schema_first_property_deprecated}'`);
    }
  }

  // Assert buckets appear in closed-enum order (deprecated → active → not_applicable → unknown)
  const bucketOrder = index.first_property_deprecation_states.map((e) => e.input_schema_first_property_deprecated).join(',');
  if (bucketOrder !== scenario.expected_bucket_order) {
    fail(`${scenario.id}: buckets must appear in closed-enum order '${scenario.expected_bucket_order}'; got: ${bucketOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (input_schema_first_property_deprecated must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by legacy index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema_first_property_deprecated')) {
      fail(`${scenario.id}: input_schema_first_property_deprecated must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert no_schema_cap (missing input_schema) is in unknown bucket
  const unknownEntry = index.first_property_deprecation_states.find((e) => e.input_schema_first_property_deprecated === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing input_schema) must be in unknown bucket`);
  }

  // Assert not_applicable_cap (input_schema.type='array') is in not_applicable bucket with no warning
  const naEntry = index.first_property_deprecation_states.find((e) => e.input_schema_first_property_deprecated === 'not_applicable');
  if (!naEntry || !naEntry.capabilities.includes('not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (input_schema.type='array') must be in not_applicable bucket`);
  }
  if (index.warnings.some((w) => w.capability === 'not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (not_applicable bucket) must NOT produce a warning`);
  }

  // Assert deprecated_cap is in deprecated bucket
  const deprecatedEntry = index.first_property_deprecation_states.find((e) => e.input_schema_first_property_deprecated === 'deprecated');
  if (!deprecatedEntry || !deprecatedEntry.capabilities.includes('deprecated_cap')) {
    fail(`${scenario.id}: deprecated_cap (firstKey.deprecated=true) must be in deprecated bucket`);
  }

  // Assert active_absent_cap is in active bucket
  const activeEntry = index.first_property_deprecation_states.find((e) => e.input_schema_first_property_deprecated === 'active');
  if (!activeEntry || !activeEntry.capabilities.includes('active_absent_cap')) {
    fail(`${scenario.id}: active_absent_cap (firstKey.deprecated absent) must be in active bucket`);
  }

  // Assert active_false_cap is in active bucket (EXPLICIT-FALSE-IS-ACTIVE)
  if (!activeEntry || !activeEntry.capabilities.includes('active_false_cap')) {
    fail(`${scenario.id}: active_false_cap (firstKey.deprecated=false) must be in active bucket (EXPLICIT-FALSE-IS-ACTIVE)`);
  }

  // Assert insertion_order_cap is in deprecated bucket (firstKey='z', deprecated=true) NOT active (sorted 'a' has no deprecated)
  if (!deprecatedEntry || !deprecatedEntry.capabilities.includes('insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (keys={z,a,b}, firstKey=z has deprecated=true) must be in deprecated bucket (insertion-order, NOT sorted)`);
  }
  // insertion_order_cap's 'b' property has deprecated='true' which would be unknown, but firstKey='z' is deprecated — no warning for cap
  if (index.warnings.some((w) => w.capability === 'insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (deprecated bucket via firstKey=z) must NOT produce a warning`);
  }

  // Assert deprecated bucket has aggregation_key 'lifecycle_stage'
  if (deprecatedEntry.aggregation_key !== 'lifecycle_stage') {
    fail(`${scenario.id}: deprecated bucket must have aggregation_key 'lifecycle_stage'; got '${deprecatedEntry.aggregation_key}'`);
  }

  // Assert active bucket has aggregation_key 'lifecycle_stage'
  if (activeEntry.aggregation_key !== 'lifecycle_stage') {
    fail(`${scenario.id}: active bucket must have aggregation_key 'lifecycle_stage'; got '${activeEntry.aggregation_key}'`);
  }

  // Assert not_applicable bucket has aggregation_key 'not_applicable'
  if (naEntry.aggregation_key !== 'not_applicable') {
    fail(`${scenario.id}: not_applicable bucket must have aggregation_key 'not_applicable'; got '${naEntry.aggregation_key}'`);
  }

  // Assert unknown bucket has aggregation_key 'unknown'
  if (unknownEntry.aggregation_key !== 'unknown') {
    fail(`${scenario.id}: unknown bucket must have aggregation_key 'unknown'; got '${unknownEntry.aggregation_key}'`);
  }
}

async function runInputSchemaFirstPropertyPatternIndexDeterminismScenario(tmpRoot, scenario) {
  const project = await fs.mkdtemp(path.join(tmpRoot, 'input-schema-first-property-pattern-'));

  // Build capabilities from synthetic_capabilities descriptors
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: cap.method,
      path: cap.path,
      domain: cap.domain,
      side_effect_class: cap.side_effect_class,
      sensitivity_class: cap.sensitivity_class,
      approved: cap.approved
    };
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-28T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq regex index --json three times and assert byte-identical output
  const run1 = runCli(['regex', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['regex', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['regex', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: regex index --json output is not byte-identical across three runs`);
  }

  // Assert input_schema_first_property_pattern bucket-key enum is closed — every key is one of the four valid values
  const index = JSON.parse(run1.stdout);
  const validPatternValues = new Set(scenario.expected_valid_pattern_values);
  for (const entry of index.first_property_pattern_constraints) {
    if (!validPatternValues.has(entry.input_schema_first_property_pattern)) {
      fail(`${scenario.id}: input_schema_first_property_pattern '${entry.input_schema_first_property_pattern}' is outside the closed four-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.first_property_pattern_constraints) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for bucket '${entry.input_schema_first_property_pattern}'`);
    }
  }

  // Assert buckets appear in closed-enum order (patterned → unpatterned → not_applicable → unknown)
  const bucketOrder = index.first_property_pattern_constraints.map((e) => e.input_schema_first_property_pattern).join(',');
  if (bucketOrder !== scenario.expected_bucket_order) {
    fail(`${scenario.id}: buckets must appear in closed-enum order '${scenario.expected_bucket_order}'; got: ${bucketOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (input_schema_first_property_pattern must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by regex index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema_first_property_pattern')) {
      fail(`${scenario.id}: input_schema_first_property_pattern must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert no_schema_cap (missing input_schema) is in unknown bucket
  const unknownEntry = index.first_property_pattern_constraints.find((e) => e.input_schema_first_property_pattern === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing input_schema) must be in unknown bucket`);
  }

  // Assert not_applicable_cap (input_schema.type='array') is in not_applicable bucket with no warning
  const naEntry = index.first_property_pattern_constraints.find((e) => e.input_schema_first_property_pattern === 'not_applicable');
  if (!naEntry || !naEntry.capabilities.includes('not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (input_schema.type='array') must be in not_applicable bucket`);
  }
  if (index.warnings.some((w) => w.capability === 'not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (not_applicable bucket) must NOT produce a warning`);
  }

  // Assert patterned_cap is in patterned bucket
  const patternedEntry = index.first_property_pattern_constraints.find((e) => e.input_schema_first_property_pattern === 'patterned');
  if (!patternedEntry || !patternedEntry.capabilities.includes('patterned_cap')) {
    fail(`${scenario.id}: patterned_cap (firstKey.pattern='^foo$') must be in patterned bucket`);
  }

  // Assert unpatterned_cap is in unpatterned bucket
  const unpatteredEntry = index.first_property_pattern_constraints.find((e) => e.input_schema_first_property_pattern === 'unpatterned');
  if (!unpatteredEntry || !unpatteredEntry.capabilities.includes('unpatterned_cap')) {
    fail(`${scenario.id}: unpatterned_cap (firstKey.pattern absent) must be in unpatterned bucket`);
  }

  // Assert null_pattern_cap is in unpatterned bucket (NULL-AS-ABSENT)
  if (!unpatteredEntry || !unpatteredEntry.capabilities.includes('null_pattern_cap')) {
    fail(`${scenario.id}: null_pattern_cap (firstKey.pattern=null) must be in unpatterned bucket (null-as-absent)`);
  }
  if (index.warnings.some((w) => w.capability === 'null_pattern_cap')) {
    fail(`${scenario.id}: null_pattern_cap (null-as-absent → unpatterned) must NOT produce a warning`);
  }

  // Assert insertion_order_cap is in patterned bucket (firstKey='z', pattern='^foo$') NOT unpatterned (sorted 'a' has no pattern)
  if (!patternedEntry || !patternedEntry.capabilities.includes('insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (keys={z,a,b}, firstKey=z has pattern='^foo$') must be in patterned bucket (insertion-order, NOT sorted)`);
  }
  // insertion_order_cap's 'b' property has pattern='' which would be unknown, but firstKey='z' is patterned — no warning for cap
  if (index.warnings.some((w) => w.capability === 'insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (patterned bucket via firstKey=z) must NOT produce a warning`);
  }

  // Assert patterned bucket has aggregation_key 'pattern_constraint'
  if (patternedEntry.aggregation_key !== 'pattern_constraint') {
    fail(`${scenario.id}: patterned bucket must have aggregation_key 'pattern_constraint'; got '${patternedEntry.aggregation_key}'`);
  }

  // Assert unpatterned bucket has aggregation_key 'pattern_constraint'
  if (unpatteredEntry.aggregation_key !== 'pattern_constraint') {
    fail(`${scenario.id}: unpatterned bucket must have aggregation_key 'pattern_constraint'; got '${unpatteredEntry.aggregation_key}'`);
  }

  // Assert not_applicable bucket has aggregation_key 'not_applicable'
  if (naEntry.aggregation_key !== 'not_applicable') {
    fail(`${scenario.id}: not_applicable bucket must have aggregation_key 'not_applicable'; got '${naEntry.aggregation_key}'`);
  }

  // Assert unknown bucket has aggregation_key 'unknown'
  if (unknownEntry.aggregation_key !== 'unknown') {
    fail(`${scenario.id}: unknown bucket must have aggregation_key 'unknown'; got '${unknownEntry.aggregation_key}'`);
  }
}

async function runInputSchemaFirstPropertyReadOnlyIndexDeterminismScenario(tmpRoot, scenario) {
  const project = await fs.mkdtemp(path.join(tmpRoot, 'input-schema-first-property-read-only-'));

  // Build capabilities from synthetic_capabilities descriptors
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: cap.method,
      path: cap.path,
      domain: cap.domain,
      side_effect_class: cap.side_effect_class,
      sensitivity_class: cap.sensitivity_class,
      approved: cap.approved
    };
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-28T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq seal index --json three times and assert byte-identical output
  const run1 = runCli(['seal', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['seal', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['seal', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: seal index --json output is not byte-identical across three runs`);
  }

  // Assert input_schema_first_property_read_only bucket-key enum is closed — every key is one of the four valid values
  const index = JSON.parse(run1.stdout);
  const validReadOnlyValues = new Set(scenario.expected_valid_read_only_values);
  for (const entry of index.first_property_read_only_states) {
    if (!validReadOnlyValues.has(entry.input_schema_first_property_read_only)) {
      fail(`${scenario.id}: input_schema_first_property_read_only '${entry.input_schema_first_property_read_only}' is outside the closed four-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.first_property_read_only_states) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for bucket '${entry.input_schema_first_property_read_only}'`);
    }
  }

  // Assert buckets appear in closed-enum order (readonly → mutable → not_applicable → unknown)
  const bucketOrder = index.first_property_read_only_states.map((e) => e.input_schema_first_property_read_only).join(',');
  if (bucketOrder !== scenario.expected_bucket_order) {
    fail(`${scenario.id}: buckets must appear in closed-enum order '${scenario.expected_bucket_order}'; got: ${bucketOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (input_schema_first_property_read_only must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by seal index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema_first_property_read_only')) {
      fail(`${scenario.id}: input_schema_first_property_read_only must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert no_schema_cap (missing input_schema) is in unknown bucket
  const unknownEntry = index.first_property_read_only_states.find((e) => e.input_schema_first_property_read_only === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing input_schema) must be in unknown bucket`);
  }

  // Assert not_applicable_cap (input_schema.type='array') is in not_applicable bucket with no warning
  const naEntry = index.first_property_read_only_states.find((e) => e.input_schema_first_property_read_only === 'not_applicable');
  if (!naEntry || !naEntry.capabilities.includes('not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (input_schema.type='array') must be in not_applicable bucket`);
  }
  if (index.warnings.some((w) => w.capability === 'not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (not_applicable bucket) must NOT produce a warning`);
  }

  // Assert readonly_cap is in readonly bucket
  const readonlyEntry = index.first_property_read_only_states.find((e) => e.input_schema_first_property_read_only === 'readonly');
  if (!readonlyEntry || !readonlyEntry.capabilities.includes('readonly_cap')) {
    fail(`${scenario.id}: readonly_cap (firstKey.readOnly=true) must be in readonly bucket`);
  }

  // Assert mutable_cap is in mutable bucket
  const mutableEntry = index.first_property_read_only_states.find((e) => e.input_schema_first_property_read_only === 'mutable');
  if (!mutableEntry || !mutableEntry.capabilities.includes('mutable_cap')) {
    fail(`${scenario.id}: mutable_cap (firstKey.readOnly absent) must be in mutable bucket`);
  }

  // Assert null_readonly_cap is in mutable bucket (NULL-AS-ABSENT)
  if (!mutableEntry || !mutableEntry.capabilities.includes('null_readonly_cap')) {
    fail(`${scenario.id}: null_readonly_cap (firstKey.readOnly=null) must be in mutable bucket (null-as-absent)`);
  }
  if (index.warnings.some((w) => w.capability === 'null_readonly_cap')) {
    fail(`${scenario.id}: null_readonly_cap (null-as-absent → mutable) must NOT produce a warning`);
  }

  // Assert false_readonly_cap is in mutable bucket (EXPLICIT-FALSE-IS-MUTABLE)
  if (!mutableEntry || !mutableEntry.capabilities.includes('false_readonly_cap')) {
    fail(`${scenario.id}: false_readonly_cap (firstKey.readOnly=false) must be in mutable bucket (EXPLICIT-FALSE-IS-MUTABLE)`);
  }
  if (index.warnings.some((w) => w.capability === 'false_readonly_cap')) {
    fail(`${scenario.id}: false_readonly_cap (EXPLICIT-FALSE-IS-MUTABLE → mutable) must NOT produce a warning`);
  }

  // Assert insertion_order_cap is in readonly bucket (firstKey='z', readOnly=true) NOT mutable (sorted 'a' has no readOnly)
  if (!readonlyEntry || !readonlyEntry.capabilities.includes('insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (keys={z,a,b}, firstKey=z has readOnly=true) must be in readonly bucket (insertion-order, NOT sorted)`);
  }
  if (index.warnings.some((w) => w.capability === 'insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (readonly bucket via firstKey=z) must NOT produce a warning`);
  }

  // Assert readonly bucket has aggregation_key 'mutability_state'
  if (readonlyEntry.aggregation_key !== 'mutability_state') {
    fail(`${scenario.id}: readonly bucket must have aggregation_key 'mutability_state'; got '${readonlyEntry.aggregation_key}'`);
  }

  // Assert mutable bucket has aggregation_key 'mutability_state'
  if (mutableEntry.aggregation_key !== 'mutability_state') {
    fail(`${scenario.id}: mutable bucket must have aggregation_key 'mutability_state'; got '${mutableEntry.aggregation_key}'`);
  }

  // Assert not_applicable bucket has aggregation_key 'not_applicable'
  if (naEntry.aggregation_key !== 'not_applicable') {
    fail(`${scenario.id}: not_applicable bucket must have aggregation_key 'not_applicable'; got '${naEntry.aggregation_key}'`);
  }

  // Assert unknown bucket has aggregation_key 'unknown'
  if (unknownEntry.aggregation_key !== 'unknown') {
    fail(`${scenario.id}: unknown bucket must have aggregation_key 'unknown'; got '${unknownEntry.aggregation_key}'`);
  }
}

async function runInputSchemaFirstPropertyWriteOnlyIndexDeterminismScenario(tmpRoot, scenario) {
  const project = await fs.mkdtemp(path.join(tmpRoot, 'input-schema-first-property-write-only-'));

  // Build capabilities from synthetic_capabilities descriptors
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: cap.method,
      path: cap.path,
      domain: cap.domain,
      side_effect_class: cap.side_effect_class,
      sensitivity_class: cap.sensitivity_class,
      approved: cap.approved
    };
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-28T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq secret index --json three times and assert byte-identical output
  const run1 = runCli(['secret', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['secret', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['secret', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: secret index --json output is not byte-identical across three runs`);
  }

  // Assert input_schema_first_property_write_only bucket-key enum is closed — every key is one of the four valid values
  const index = JSON.parse(run1.stdout);
  const validWriteOnlyValues = new Set(scenario.expected_valid_write_only_values);
  for (const entry of index.first_property_write_only_states) {
    if (!validWriteOnlyValues.has(entry.input_schema_first_property_write_only)) {
      fail(`${scenario.id}: input_schema_first_property_write_only '${entry.input_schema_first_property_write_only}' is outside the closed four-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.first_property_write_only_states) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for bucket '${entry.input_schema_first_property_write_only}'`);
    }
  }

  // Assert buckets appear in closed-enum order (write_only → not_write_only → not_applicable → unknown)
  const bucketOrder = index.first_property_write_only_states.map((e) => e.input_schema_first_property_write_only).join(',');
  if (bucketOrder !== scenario.expected_bucket_order) {
    fail(`${scenario.id}: buckets must appear in closed-enum order '${scenario.expected_bucket_order}'; got: ${bucketOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (input_schema_first_property_write_only must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by secret index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema_first_property_write_only')) {
      fail(`${scenario.id}: input_schema_first_property_write_only must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert no_schema_cap (missing input_schema) is in unknown bucket
  const unknownEntry = index.first_property_write_only_states.find((e) => e.input_schema_first_property_write_only === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing input_schema) must be in unknown bucket`);
  }

  // Assert not_applicable_cap (input_schema.type='array') is in not_applicable bucket with no warning
  const naEntry = index.first_property_write_only_states.find((e) => e.input_schema_first_property_write_only === 'not_applicable');
  if (!naEntry || !naEntry.capabilities.includes('not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (input_schema.type='array') must be in not_applicable bucket`);
  }
  if (index.warnings.some((w) => w.capability === 'not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (not_applicable bucket) must NOT produce a warning`);
  }

  // Assert write_only_cap is in write_only bucket
  const writeOnlyEntry = index.first_property_write_only_states.find((e) => e.input_schema_first_property_write_only === 'write_only');
  if (!writeOnlyEntry || !writeOnlyEntry.capabilities.includes('write_only_cap')) {
    fail(`${scenario.id}: write_only_cap (firstKey.writeOnly=true) must be in write_only bucket`);
  }

  // Assert not_write_only_cap is in not_write_only bucket
  const notWriteOnlyEntry = index.first_property_write_only_states.find((e) => e.input_schema_first_property_write_only === 'not_write_only');
  if (!notWriteOnlyEntry || !notWriteOnlyEntry.capabilities.includes('not_write_only_cap')) {
    fail(`${scenario.id}: not_write_only_cap (firstKey.writeOnly absent) must be in not_write_only bucket`);
  }

  // Assert null_write_only_cap is in not_write_only bucket (NULL-AS-ABSENT)
  if (!notWriteOnlyEntry || !notWriteOnlyEntry.capabilities.includes('null_write_only_cap')) {
    fail(`${scenario.id}: null_write_only_cap (firstKey.writeOnly=null) must be in not_write_only bucket (null-as-absent)`);
  }
  if (index.warnings.some((w) => w.capability === 'null_write_only_cap')) {
    fail(`${scenario.id}: null_write_only_cap (null-as-absent → not_write_only) must NOT produce a warning`);
  }

  // Assert false_write_only_cap is in not_write_only bucket (EXPLICIT-FALSE-IS-NOT-WRITE-ONLY)
  if (!notWriteOnlyEntry || !notWriteOnlyEntry.capabilities.includes('false_write_only_cap')) {
    fail(`${scenario.id}: false_write_only_cap (firstKey.writeOnly=false) must be in not_write_only bucket (EXPLICIT-FALSE-IS-NOT-WRITE-ONLY)`);
  }
  if (index.warnings.some((w) => w.capability === 'false_write_only_cap')) {
    fail(`${scenario.id}: false_write_only_cap (EXPLICIT-FALSE-IS-NOT-WRITE-ONLY → not_write_only) must NOT produce a warning`);
  }

  // Assert insertion_order_cap is in write_only bucket (firstKey='z', writeOnly=true) NOT not_write_only (sorted 'a' has no writeOnly)
  if (!writeOnlyEntry || !writeOnlyEntry.capabilities.includes('insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (keys={z,a,b}, firstKey=z has writeOnly=true) must be in write_only bucket (insertion-order, NOT sorted)`);
  }
  if (index.warnings.some((w) => w.capability === 'insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (write_only bucket via firstKey=z) must NOT produce a warning`);
  }

  // Assert write_only bucket has aggregation_key 'output_visibility'
  if (writeOnlyEntry.aggregation_key !== 'output_visibility') {
    fail(`${scenario.id}: write_only bucket must have aggregation_key 'output_visibility'; got '${writeOnlyEntry.aggregation_key}'`);
  }

  // Assert not_write_only bucket has aggregation_key 'output_visibility'
  if (notWriteOnlyEntry.aggregation_key !== 'output_visibility') {
    fail(`${scenario.id}: not_write_only bucket must have aggregation_key 'output_visibility'; got '${notWriteOnlyEntry.aggregation_key}'`);
  }

  // Assert not_applicable bucket has aggregation_key 'not_applicable'
  if (naEntry.aggregation_key !== 'not_applicable') {
    fail(`${scenario.id}: not_applicable bucket must have aggregation_key 'not_applicable'; got '${naEntry.aggregation_key}'`);
  }

  // Assert unknown bucket has aggregation_key 'unknown'
  if (unknownEntry.aggregation_key !== 'unknown') {
    fail(`${scenario.id}: unknown bucket must have aggregation_key 'unknown'; got '${unknownEntry.aggregation_key}'`);
  }
}

async function runInputSchemaFirstPropertyMinLengthIndexDeterminismScenario(tmpRoot, scenario) {
  const project = await fs.mkdtemp(path.join(tmpRoot, 'input-schema-first-property-min-length-'));

  // Build capabilities from synthetic_capabilities descriptors
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: cap.method,
      path: cap.path,
      domain: cap.domain,
      side_effect_class: cap.side_effect_class,
      sensitivity_class: cap.sensitivity_class,
      approved: cap.approved
    };
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-28T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq floor index --json three times and assert byte-identical output
  const run1 = runCli(['floor', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['floor', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['floor', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: floor index --json output is not byte-identical across three runs`);
  }

  // Assert input_schema_first_property_min_length bucket-key enum is closed — every key is one of the four valid values
  const index = JSON.parse(run1.stdout);
  const validMinLengthValues = new Set(scenario.expected_valid_min_length_values);
  for (const entry of index.first_property_min_length_states) {
    if (!validMinLengthValues.has(entry.input_schema_first_property_min_length)) {
      fail(`${scenario.id}: input_schema_first_property_min_length '${entry.input_schema_first_property_min_length}' is outside the closed four-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.first_property_min_length_states) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for bucket '${entry.input_schema_first_property_min_length}'`);
    }
  }

  // Assert buckets appear in closed-enum order (length_floored → length_unfloored → not_applicable → unknown)
  const bucketOrder = index.first_property_min_length_states.map((e) => e.input_schema_first_property_min_length).join(',');
  if (bucketOrder !== scenario.expected_bucket_order) {
    fail(`${scenario.id}: buckets must appear in closed-enum order '${scenario.expected_bucket_order}'; got: ${bucketOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (input_schema_first_property_min_length must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by floor index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema_first_property_min_length')) {
      fail(`${scenario.id}: input_schema_first_property_min_length must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert no_schema_cap (missing input_schema) is in unknown bucket
  const unknownEntry = index.first_property_min_length_states.find((e) => e.input_schema_first_property_min_length === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing input_schema) must be in unknown bucket`);
  }

  // Assert not_applicable_cap (input_schema.type='array') is in not_applicable bucket with no warning
  const naEntry = index.first_property_min_length_states.find((e) => e.input_schema_first_property_min_length === 'not_applicable');
  if (!naEntry || !naEntry.capabilities.includes('not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (input_schema.type='array') must be in not_applicable bucket`);
  }
  if (index.warnings.some((w) => w.capability === 'not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (not_applicable bucket) must NOT produce a warning`);
  }

  // Assert floored_cap is in length_floored bucket
  const flooredEntry = index.first_property_min_length_states.find((e) => e.input_schema_first_property_min_length === 'length_floored');
  if (!flooredEntry || !flooredEntry.capabilities.includes('floored_cap')) {
    fail(`${scenario.id}: floored_cap (firstKey.minLength=1) must be in length_floored bucket`);
  }

  // Assert zero_floored_cap is in length_floored bucket (EXPLICIT-ZERO-IS-FLOORED)
  if (!flooredEntry || !flooredEntry.capabilities.includes('zero_floored_cap')) {
    fail(`${scenario.id}: zero_floored_cap (firstKey.minLength=0) must be in length_floored bucket (EXPLICIT-ZERO-IS-FLOORED)`);
  }
  if (index.warnings.some((w) => w.capability === 'zero_floored_cap')) {
    fail(`${scenario.id}: zero_floored_cap (EXPLICIT-ZERO-IS-FLOORED → length_floored) must NOT produce a warning`);
  }

  // Assert unfloored_cap is in length_unfloored bucket
  const unflooredEntry = index.first_property_min_length_states.find((e) => e.input_schema_first_property_min_length === 'length_unfloored');
  if (!unflooredEntry || !unflooredEntry.capabilities.includes('unfloored_cap')) {
    fail(`${scenario.id}: unfloored_cap (firstKey.minLength absent) must be in length_unfloored bucket`);
  }

  // Assert null_min_length_cap is in length_unfloored bucket (NULL-AS-ABSENT)
  if (!unflooredEntry || !unflooredEntry.capabilities.includes('null_min_length_cap')) {
    fail(`${scenario.id}: null_min_length_cap (firstKey.minLength=null) must be in length_unfloored bucket (null-as-absent)`);
  }
  if (index.warnings.some((w) => w.capability === 'null_min_length_cap')) {
    fail(`${scenario.id}: null_min_length_cap (null-as-absent → length_unfloored) must NOT produce a warning`);
  }

  // Assert insertion_order_cap is in length_floored bucket (firstKey='z', minLength=5) NOT length_unfloored (sorted 'a' has no minLength)
  if (!flooredEntry || !flooredEntry.capabilities.includes('insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (keys={z,a,b}, firstKey=z has minLength=5) must be in length_floored bucket (insertion-order, NOT sorted)`);
  }
  if (index.warnings.some((w) => w.capability === 'insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (length_floored bucket via firstKey=z) must NOT produce a warning`);
  }

  // Assert length_floored bucket has aggregation_key 'string_length_floor_constraint'
  if (flooredEntry.aggregation_key !== 'string_length_floor_constraint') {
    fail(`${scenario.id}: length_floored bucket must have aggregation_key 'string_length_floor_constraint'; got '${flooredEntry.aggregation_key}'`);
  }

  // Assert length_unfloored bucket has aggregation_key 'string_length_floor_constraint'
  if (unflooredEntry.aggregation_key !== 'string_length_floor_constraint') {
    fail(`${scenario.id}: length_unfloored bucket must have aggregation_key 'string_length_floor_constraint'; got '${unflooredEntry.aggregation_key}'`);
  }

  // Assert not_applicable bucket has aggregation_key 'not_applicable'
  if (naEntry.aggregation_key !== 'not_applicable') {
    fail(`${scenario.id}: not_applicable bucket must have aggregation_key 'not_applicable'; got '${naEntry.aggregation_key}'`);
  }

  // Assert unknown bucket has aggregation_key 'unknown'
  if (unknownEntry.aggregation_key !== 'unknown') {
    fail(`${scenario.id}: unknown bucket must have aggregation_key 'unknown'; got '${unknownEntry.aggregation_key}'`);
  }
}

async function runInputSchemaFirstPropertyMaxLengthIndexDeterminismScenario(tmpRoot, scenario) {
  const project = await fs.mkdtemp(path.join(tmpRoot, 'input-schema-first-property-max-length-'));

  // Build capabilities from synthetic_capabilities descriptors
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: cap.method,
      path: cap.path,
      domain: cap.domain,
      side_effect_class: cap.side_effect_class,
      sensitivity_class: cap.sensitivity_class,
      approved: cap.approved
    };
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-28T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq ceiling index --json three times and assert byte-identical output
  const run1 = runCli(['ceiling', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['ceiling', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['ceiling', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: ceiling index --json output is not byte-identical across three runs`);
  }

  // Assert input_schema_first_property_max_length bucket-key enum is closed — every key is one of the four valid values
  const index = JSON.parse(run1.stdout);
  const validMaxLengthValues = new Set(scenario.expected_valid_max_length_values);
  for (const entry of index.first_property_max_length_states) {
    if (!validMaxLengthValues.has(entry.input_schema_first_property_max_length)) {
      fail(`${scenario.id}: input_schema_first_property_max_length '${entry.input_schema_first_property_max_length}' is outside the closed four-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.first_property_max_length_states) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for bucket '${entry.input_schema_first_property_max_length}'`);
    }
  }

  // Assert buckets appear in closed-enum order (length_capped → length_uncapped → not_applicable → unknown)
  const bucketOrder = index.first_property_max_length_states.map((e) => e.input_schema_first_property_max_length).join(',');
  if (bucketOrder !== scenario.expected_bucket_order) {
    fail(`${scenario.id}: buckets must appear in closed-enum order '${scenario.expected_bucket_order}'; got: ${bucketOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (input_schema_first_property_max_length must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by ceiling index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema_first_property_max_length')) {
      fail(`${scenario.id}: input_schema_first_property_max_length must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert no_schema_cap (missing input_schema) is in unknown bucket
  const unknownEntry = index.first_property_max_length_states.find((e) => e.input_schema_first_property_max_length === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing input_schema) must be in unknown bucket`);
  }

  // Assert not_applicable_cap (input_schema.type='array') is in not_applicable bucket with no warning
  const naEntry = index.first_property_max_length_states.find((e) => e.input_schema_first_property_max_length === 'not_applicable');
  if (!naEntry || !naEntry.capabilities.includes('not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (input_schema.type='array') must be in not_applicable bucket`);
  }
  if (index.warnings.some((w) => w.capability === 'not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (not_applicable bucket) must NOT produce a warning`);
  }

  // Assert capped_cap is in length_capped bucket
  const cappedEntry = index.first_property_max_length_states.find((e) => e.input_schema_first_property_max_length === 'length_capped');
  if (!cappedEntry || !cappedEntry.capabilities.includes('capped_cap')) {
    fail(`${scenario.id}: capped_cap (firstKey.maxLength=200) must be in length_capped bucket`);
  }

  // Assert zero_capped_cap is in length_capped bucket (EXPLICIT-ZERO-IS-CAPPED)
  if (!cappedEntry || !cappedEntry.capabilities.includes('zero_capped_cap')) {
    fail(`${scenario.id}: zero_capped_cap (firstKey.maxLength=0) must be in length_capped bucket (EXPLICIT-ZERO-IS-CAPPED)`);
  }
  if (index.warnings.some((w) => w.capability === 'zero_capped_cap')) {
    fail(`${scenario.id}: zero_capped_cap (EXPLICIT-ZERO-IS-CAPPED → length_capped) must NOT produce a warning`);
  }

  // Assert uncapped_cap is in length_uncapped bucket
  const uncappedEntry = index.first_property_max_length_states.find((e) => e.input_schema_first_property_max_length === 'length_uncapped');
  if (!uncappedEntry || !uncappedEntry.capabilities.includes('uncapped_cap')) {
    fail(`${scenario.id}: uncapped_cap (firstKey.maxLength absent) must be in length_uncapped bucket`);
  }

  // Assert null_max_length_cap is in length_uncapped bucket (NULL-AS-ABSENT)
  if (!uncappedEntry || !uncappedEntry.capabilities.includes('null_max_length_cap')) {
    fail(`${scenario.id}: null_max_length_cap (firstKey.maxLength=null) must be in length_uncapped bucket (null-as-absent)`);
  }
  if (index.warnings.some((w) => w.capability === 'null_max_length_cap')) {
    fail(`${scenario.id}: null_max_length_cap (null-as-absent → length_uncapped) must NOT produce a warning`);
  }

  // Assert insertion_order_cap is in length_capped bucket (firstKey='z', maxLength=200) NOT length_uncapped (sorted 'a' has no maxLength)
  if (!cappedEntry || !cappedEntry.capabilities.includes('insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (keys={z,a,b}, firstKey=z has maxLength=200) must be in length_capped bucket (insertion-order, NOT sorted)`);
  }
  if (index.warnings.some((w) => w.capability === 'insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (length_capped bucket via firstKey=z) must NOT produce a warning`);
  }

  // Assert length_capped bucket has aggregation_key 'string_length_ceiling_constraint'
  if (cappedEntry.aggregation_key !== 'string_length_ceiling_constraint') {
    fail(`${scenario.id}: length_capped bucket must have aggregation_key 'string_length_ceiling_constraint'; got '${cappedEntry.aggregation_key}'`);
  }

  // Assert length_uncapped bucket has aggregation_key 'string_length_ceiling_constraint'
  if (uncappedEntry.aggregation_key !== 'string_length_ceiling_constraint') {
    fail(`${scenario.id}: length_uncapped bucket must have aggregation_key 'string_length_ceiling_constraint'; got '${uncappedEntry.aggregation_key}'`);
  }

  // Assert not_applicable bucket has aggregation_key 'not_applicable'
  if (naEntry.aggregation_key !== 'not_applicable') {
    fail(`${scenario.id}: not_applicable bucket must have aggregation_key 'not_applicable'; got '${naEntry.aggregation_key}'`);
  }

  // Assert unknown bucket has aggregation_key 'unknown'
  if (unknownEntry.aggregation_key !== 'unknown') {
    fail(`${scenario.id}: unknown bucket must have aggregation_key 'unknown'; got '${unknownEntry.aggregation_key}'`);
  }
}

async function runInputSchemaFirstPropertyMultipleOfIndexDeterminismScenario(tmpRoot, scenario) {
  const project = await fs.mkdtemp(path.join(tmpRoot, 'input-schema-first-property-multiple-of-'));

  // Build capabilities from synthetic_capabilities descriptors
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: cap.method,
      path: cap.path,
      domain: cap.domain,
      side_effect_class: cap.side_effect_class,
      sensitivity_class: cap.sensitivity_class,
      approved: cap.approved
    };
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-28T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq divisor index --json three times and assert byte-identical output
  const run1 = runCli(['divisor', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['divisor', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['divisor', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: divisor index --json output is not byte-identical across three runs`);
  }

  // Assert input_schema_first_property_multiple_of bucket-key enum is closed — every key is one of the four valid values
  const index = JSON.parse(run1.stdout);
  const validMultipleOfValues = new Set(scenario.expected_valid_multiple_of_values);
  for (const entry of index.first_property_multiple_of_states) {
    if (!validMultipleOfValues.has(entry.input_schema_first_property_multiple_of)) {
      fail(`${scenario.id}: input_schema_first_property_multiple_of '${entry.input_schema_first_property_multiple_of}' is outside the closed four-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.first_property_multiple_of_states) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for bucket '${entry.input_schema_first_property_multiple_of}'`);
    }
  }

  // Assert buckets appear in closed-enum order (multiple_constrained → multiple_unconstrained → not_applicable → unknown)
  const bucketOrder = index.first_property_multiple_of_states.map((e) => e.input_schema_first_property_multiple_of).join(',');
  if (bucketOrder !== scenario.expected_bucket_order) {
    fail(`${scenario.id}: buckets must appear in closed-enum order '${scenario.expected_bucket_order}'; got: ${bucketOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (input_schema_first_property_multiple_of must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by divisor index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema_first_property_multiple_of')) {
      fail(`${scenario.id}: input_schema_first_property_multiple_of must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert no_schema_cap (missing input_schema) is in unknown bucket
  const unknownEntry = index.first_property_multiple_of_states.find((e) => e.input_schema_first_property_multiple_of === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing input_schema) must be in unknown bucket`);
  }

  // Assert not_applicable_cap (input_schema.type='array') is in not_applicable bucket with no warning
  const naEntry = index.first_property_multiple_of_states.find((e) => e.input_schema_first_property_multiple_of === 'not_applicable');
  if (!naEntry || !naEntry.capabilities.includes('not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (input_schema.type='array') must be in not_applicable bucket`);
  }
  if (index.warnings.some((w) => w.capability === 'not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (not_applicable bucket) must NOT produce a warning`);
  }

  // Assert constrained_cap is in multiple_constrained bucket
  const constrainedEntry = index.first_property_multiple_of_states.find((e) => e.input_schema_first_property_multiple_of === 'multiple_constrained');
  if (!constrainedEntry || !constrainedEntry.capabilities.includes('constrained_cap')) {
    fail(`${scenario.id}: constrained_cap (firstKey.multipleOf=5) must be in multiple_constrained bucket`);
  }

  // Assert frac_constrained_cap is in multiple_constrained bucket (FRACTIONAL-DIVISORS-ARE-VALID)
  if (!constrainedEntry || !constrainedEntry.capabilities.includes('frac_constrained_cap')) {
    fail(`${scenario.id}: frac_constrained_cap (firstKey.multipleOf=0.5) must be in multiple_constrained bucket (FRACTIONAL-DIVISORS-ARE-VALID)`);
  }
  if (index.warnings.some((w) => w.capability === 'frac_constrained_cap')) {
    fail(`${scenario.id}: frac_constrained_cap (FRACTIONAL-DIVISORS-ARE-VALID → multiple_constrained) must NOT produce a warning`);
  }

  // Assert unconstrained_cap is in multiple_unconstrained bucket
  const unconstrainedEntry = index.first_property_multiple_of_states.find((e) => e.input_schema_first_property_multiple_of === 'multiple_unconstrained');
  if (!unconstrainedEntry || !unconstrainedEntry.capabilities.includes('unconstrained_cap')) {
    fail(`${scenario.id}: unconstrained_cap (firstKey.multipleOf absent) must be in multiple_unconstrained bucket`);
  }

  // Assert null_multiple_of_cap is in multiple_unconstrained bucket (NULL-AS-ABSENT)
  if (!unconstrainedEntry || !unconstrainedEntry.capabilities.includes('null_multiple_of_cap')) {
    fail(`${scenario.id}: null_multiple_of_cap (firstKey.multipleOf=null) must be in multiple_unconstrained bucket (null-as-absent)`);
  }
  if (index.warnings.some((w) => w.capability === 'null_multiple_of_cap')) {
    fail(`${scenario.id}: null_multiple_of_cap (null-as-absent → multiple_unconstrained) must NOT produce a warning`);
  }

  // Assert insertion_order_cap is in multiple_constrained bucket (firstKey='z', multipleOf=5) NOT multiple_unconstrained (sorted 'a' has no multipleOf)
  if (!constrainedEntry || !constrainedEntry.capabilities.includes('insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (keys={z,a,b}, firstKey=z has multipleOf=5) must be in multiple_constrained bucket (insertion-order, NOT sorted)`);
  }
  if (index.warnings.some((w) => w.capability === 'insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (multiple_constrained bucket via firstKey=z) must NOT produce a warning`);
  }

  // Assert multiple_constrained bucket has aggregation_key 'numeric_divisibility_constraint'
  if (constrainedEntry.aggregation_key !== 'numeric_divisibility_constraint') {
    fail(`${scenario.id}: multiple_constrained bucket must have aggregation_key 'numeric_divisibility_constraint'; got '${constrainedEntry.aggregation_key}'`);
  }

  // Assert multiple_unconstrained bucket has aggregation_key 'numeric_divisibility_constraint'
  if (unconstrainedEntry.aggregation_key !== 'numeric_divisibility_constraint') {
    fail(`${scenario.id}: multiple_unconstrained bucket must have aggregation_key 'numeric_divisibility_constraint'; got '${unconstrainedEntry.aggregation_key}'`);
  }

  // Assert not_applicable bucket has aggregation_key 'not_applicable'
  if (naEntry.aggregation_key !== 'not_applicable') {
    fail(`${scenario.id}: not_applicable bucket must have aggregation_key 'not_applicable'; got '${naEntry.aggregation_key}'`);
  }

  // Assert unknown bucket has aggregation_key 'unknown'
  if (unknownEntry.aggregation_key !== 'unknown') {
    fail(`${scenario.id}: unknown bucket must have aggregation_key 'unknown'; got '${unknownEntry.aggregation_key}'`);
  }
}

async function runInputSchemaFirstPropertyMinimumIndexDeterminismScenario(tmpRoot, scenario) {
  const project = await fs.mkdtemp(path.join(tmpRoot, 'input-schema-first-property-minimum-'));

  // Build capabilities from synthetic_capabilities descriptors
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: cap.method,
      path: cap.path,
      domain: cap.domain,
      side_effect_class: cap.side_effect_class,
      sensitivity_class: cap.sensitivity_class,
      approved: cap.approved
    };
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-28T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq lower index --json three times and assert byte-identical output
  const run1 = runCli(['lower', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['lower', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['lower', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: lower index --json output is not byte-identical across three runs`);
  }

  // Assert input_schema_first_property_minimum bucket-key enum is closed — every key is one of the four valid values
  const index = JSON.parse(run1.stdout);
  const validMinimumValues = new Set(scenario.expected_valid_minimum_values);
  for (const entry of index.first_property_minimum_states) {
    if (!validMinimumValues.has(entry.input_schema_first_property_minimum)) {
      fail(`${scenario.id}: input_schema_first_property_minimum '${entry.input_schema_first_property_minimum}' is outside the closed four-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.first_property_minimum_states) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for bucket '${entry.input_schema_first_property_minimum}'`);
    }
  }

  // Assert buckets appear in closed-enum order (lower_bounded → lower_unbounded → not_applicable → unknown)
  const bucketOrder = index.first_property_minimum_states.map((e) => e.input_schema_first_property_minimum).join(',');
  if (bucketOrder !== scenario.expected_bucket_order) {
    fail(`${scenario.id}: buckets must appear in closed-enum order '${scenario.expected_bucket_order}'; got: ${bucketOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (input_schema_first_property_minimum must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by lower index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema_first_property_minimum')) {
      fail(`${scenario.id}: input_schema_first_property_minimum must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert no_schema_cap (missing input_schema) is in unknown bucket
  const unknownEntry = index.first_property_minimum_states.find((e) => e.input_schema_first_property_minimum === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing input_schema) must be in unknown bucket`);
  }

  // Assert not_applicable_cap (input_schema.type='array') is in not_applicable bucket with no warning
  const naEntry = index.first_property_minimum_states.find((e) => e.input_schema_first_property_minimum === 'not_applicable');
  if (!naEntry || !naEntry.capabilities.includes('not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (input_schema.type='array') must be in not_applicable bucket`);
  }
  if (index.warnings.some((w) => w.capability === 'not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (not_applicable bucket) must NOT produce a warning`);
  }

  // Assert lower_bounded_cap is in lower_bounded bucket
  const lowerBoundedEntry = index.first_property_minimum_states.find((e) => e.input_schema_first_property_minimum === 'lower_bounded');
  if (!lowerBoundedEntry || !lowerBoundedEntry.capabilities.includes('lower_bounded_cap')) {
    fail(`${scenario.id}: lower_bounded_cap (firstKey.minimum=1) must be in lower_bounded bucket`);
  }

  // Assert zero_bounded_cap is in lower_bounded bucket (ZERO-IS-VALID-LOWER-BOUND)
  if (!lowerBoundedEntry || !lowerBoundedEntry.capabilities.includes('zero_bounded_cap')) {
    fail(`${scenario.id}: zero_bounded_cap (firstKey.minimum=0) must be in lower_bounded bucket (ZERO-IS-VALID-LOWER-BOUND)`);
  }
  if (index.warnings.some((w) => w.capability === 'zero_bounded_cap')) {
    fail(`${scenario.id}: zero_bounded_cap (ZERO-IS-VALID-LOWER-BOUND → lower_bounded) must NOT produce a warning`);
  }

  // Assert neg_bounded_cap is in lower_bounded bucket (NEGATIVE-IS-VALID-LOWER-BOUND)
  if (!lowerBoundedEntry || !lowerBoundedEntry.capabilities.includes('neg_bounded_cap')) {
    fail(`${scenario.id}: neg_bounded_cap (firstKey.minimum=-273.15) must be in lower_bounded bucket (NEGATIVE-IS-VALID-LOWER-BOUND)`);
  }
  if (index.warnings.some((w) => w.capability === 'neg_bounded_cap')) {
    fail(`${scenario.id}: neg_bounded_cap (NEGATIVE-IS-VALID-LOWER-BOUND → lower_bounded) must NOT produce a warning`);
  }

  // Assert unbounded_cap is in lower_unbounded bucket
  const lowerUnboundedEntry = index.first_property_minimum_states.find((e) => e.input_schema_first_property_minimum === 'lower_unbounded');
  if (!lowerUnboundedEntry || !lowerUnboundedEntry.capabilities.includes('unbounded_cap')) {
    fail(`${scenario.id}: unbounded_cap (firstKey.minimum absent) must be in lower_unbounded bucket`);
  }

  // Assert null_minimum_cap is in lower_unbounded bucket (NULL-AS-ABSENT)
  if (!lowerUnboundedEntry || !lowerUnboundedEntry.capabilities.includes('null_minimum_cap')) {
    fail(`${scenario.id}: null_minimum_cap (firstKey.minimum=null) must be in lower_unbounded bucket (null-as-absent)`);
  }
  if (index.warnings.some((w) => w.capability === 'null_minimum_cap')) {
    fail(`${scenario.id}: null_minimum_cap (null-as-absent → lower_unbounded) must NOT produce a warning`);
  }

  // Assert insertion_order_cap is in lower_bounded bucket (firstKey='z', minimum=5) NOT lower_unbounded (sorted 'a' has no minimum)
  if (!lowerBoundedEntry || !lowerBoundedEntry.capabilities.includes('insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (keys={z,a,b}, firstKey=z has minimum=5) must be in lower_bounded bucket (insertion-order, NOT sorted)`);
  }
  if (index.warnings.some((w) => w.capability === 'insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (lower_bounded bucket via firstKey=z) must NOT produce a warning`);
  }

  // Assert lower_bounded bucket has aggregation_key 'numeric_lower_bound_constraint'
  if (lowerBoundedEntry.aggregation_key !== 'numeric_lower_bound_constraint') {
    fail(`${scenario.id}: lower_bounded bucket must have aggregation_key 'numeric_lower_bound_constraint'; got '${lowerBoundedEntry.aggregation_key}'`);
  }

  // Assert lower_unbounded bucket has aggregation_key 'numeric_lower_bound_constraint'
  if (lowerUnboundedEntry.aggregation_key !== 'numeric_lower_bound_constraint') {
    fail(`${scenario.id}: lower_unbounded bucket must have aggregation_key 'numeric_lower_bound_constraint'; got '${lowerUnboundedEntry.aggregation_key}'`);
  }

  // Assert not_applicable bucket has aggregation_key 'not_applicable'
  if (naEntry.aggregation_key !== 'not_applicable') {
    fail(`${scenario.id}: not_applicable bucket must have aggregation_key 'not_applicable'; got '${naEntry.aggregation_key}'`);
  }

  // Assert unknown bucket has aggregation_key 'unknown'
  if (unknownEntry.aggregation_key !== 'unknown') {
    fail(`${scenario.id}: unknown bucket must have aggregation_key 'unknown'; got '${unknownEntry.aggregation_key}'`);
  }
}

async function runInputSchemaFirstPropertyMaximumIndexDeterminismScenario(tmpRoot, scenario) {
  const project = await fs.mkdtemp(path.join(tmpRoot, 'input-schema-first-property-maximum-'));

  // Build capabilities from synthetic_capabilities descriptors
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: cap.method,
      path: cap.path,
      domain: cap.domain,
      side_effect_class: cap.side_effect_class,
      sensitivity_class: cap.sensitivity_class,
      approved: cap.approved
    };
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-28T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq upper index --json three times and assert byte-identical output
  const run1 = runCli(['upper', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['upper', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['upper', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: upper index --json output is not byte-identical across three runs`);
  }

  // Assert input_schema_first_property_maximum bucket-key enum is closed — every key is one of the four valid values
  const index = JSON.parse(run1.stdout);
  const validMaximumValues = new Set(scenario.expected_valid_maximum_values);
  for (const entry of index.first_property_maximum_states) {
    if (!validMaximumValues.has(entry.input_schema_first_property_maximum)) {
      fail(`${scenario.id}: input_schema_first_property_maximum '${entry.input_schema_first_property_maximum}' is outside the closed four-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.first_property_maximum_states) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for bucket '${entry.input_schema_first_property_maximum}'`);
    }
  }

  // Assert buckets appear in closed-enum order (upper_bounded → upper_unbounded → not_applicable → unknown)
  const bucketOrder = index.first_property_maximum_states.map((e) => e.input_schema_first_property_maximum).join(',');
  if (bucketOrder !== scenario.expected_bucket_order) {
    fail(`${scenario.id}: buckets must appear in closed-enum order '${scenario.expected_bucket_order}'; got: ${bucketOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (input_schema_first_property_maximum must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by upper index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema_first_property_maximum')) {
      fail(`${scenario.id}: input_schema_first_property_maximum must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert no_schema_cap (missing input_schema) is in unknown bucket
  const unknownEntry = index.first_property_maximum_states.find((e) => e.input_schema_first_property_maximum === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing input_schema) must be in unknown bucket`);
  }

  // Assert not_applicable_cap (input_schema.type='array') is in not_applicable bucket with no warning
  const naEntry = index.first_property_maximum_states.find((e) => e.input_schema_first_property_maximum === 'not_applicable');
  if (!naEntry || !naEntry.capabilities.includes('not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (input_schema.type='array') must be in not_applicable bucket`);
  }
  if (index.warnings.some((w) => w.capability === 'not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (not_applicable bucket) must NOT produce a warning`);
  }

  // Assert upper_bounded_cap is in upper_bounded bucket
  const upperBoundedEntry = index.first_property_maximum_states.find((e) => e.input_schema_first_property_maximum === 'upper_bounded');
  if (!upperBoundedEntry || !upperBoundedEntry.capabilities.includes('upper_bounded_cap')) {
    fail(`${scenario.id}: upper_bounded_cap (firstKey.maximum=100) must be in upper_bounded bucket`);
  }

  // Assert zero_bounded_cap is in upper_bounded bucket (ZERO-IS-VALID-UPPER-BOUND)
  if (!upperBoundedEntry || !upperBoundedEntry.capabilities.includes('zero_bounded_cap')) {
    fail(`${scenario.id}: zero_bounded_cap (firstKey.maximum=0) must be in upper_bounded bucket (ZERO-IS-VALID-UPPER-BOUND)`);
  }
  if (index.warnings.some((w) => w.capability === 'zero_bounded_cap')) {
    fail(`${scenario.id}: zero_bounded_cap (ZERO-IS-VALID-UPPER-BOUND → upper_bounded) must NOT produce a warning`);
  }

  // Assert neg_bounded_cap is in upper_bounded bucket (NEGATIVE-IS-VALID-UPPER-BOUND)
  if (!upperBoundedEntry || !upperBoundedEntry.capabilities.includes('neg_bounded_cap')) {
    fail(`${scenario.id}: neg_bounded_cap (firstKey.maximum=-273.15) must be in upper_bounded bucket (NEGATIVE-IS-VALID-UPPER-BOUND)`);
  }
  if (index.warnings.some((w) => w.capability === 'neg_bounded_cap')) {
    fail(`${scenario.id}: neg_bounded_cap (NEGATIVE-IS-VALID-UPPER-BOUND → upper_bounded) must NOT produce a warning`);
  }

  // Assert unbounded_cap is in upper_unbounded bucket
  const upperUnboundedEntry = index.first_property_maximum_states.find((e) => e.input_schema_first_property_maximum === 'upper_unbounded');
  if (!upperUnboundedEntry || !upperUnboundedEntry.capabilities.includes('unbounded_cap')) {
    fail(`${scenario.id}: unbounded_cap (firstKey.maximum absent) must be in upper_unbounded bucket`);
  }

  // Assert null_maximum_cap is in upper_unbounded bucket (NULL-AS-ABSENT)
  if (!upperUnboundedEntry || !upperUnboundedEntry.capabilities.includes('null_maximum_cap')) {
    fail(`${scenario.id}: null_maximum_cap (firstKey.maximum=null) must be in upper_unbounded bucket (null-as-absent)`);
  }
  if (index.warnings.some((w) => w.capability === 'null_maximum_cap')) {
    fail(`${scenario.id}: null_maximum_cap (null-as-absent → upper_unbounded) must NOT produce a warning`);
  }

  // Assert insertion_order_cap is in upper_bounded bucket (firstKey='z', maximum=5) NOT upper_unbounded (sorted 'a' has no maximum)
  if (!upperBoundedEntry || !upperBoundedEntry.capabilities.includes('insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (keys={z,a,b}, firstKey=z has maximum=5) must be in upper_bounded bucket (insertion-order, NOT sorted)`);
  }
  if (index.warnings.some((w) => w.capability === 'insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (upper_bounded bucket via firstKey=z) must NOT produce a warning`);
  }

  // Assert upper_bounded bucket has aggregation_key 'numeric_upper_bound_constraint'
  if (upperBoundedEntry.aggregation_key !== 'numeric_upper_bound_constraint') {
    fail(`${scenario.id}: upper_bounded bucket must have aggregation_key 'numeric_upper_bound_constraint'; got '${upperBoundedEntry.aggregation_key}'`);
  }

  // Assert upper_unbounded bucket has aggregation_key 'numeric_upper_bound_constraint'
  if (upperUnboundedEntry.aggregation_key !== 'numeric_upper_bound_constraint') {
    fail(`${scenario.id}: upper_unbounded bucket must have aggregation_key 'numeric_upper_bound_constraint'; got '${upperUnboundedEntry.aggregation_key}'`);
  }

  // Assert not_applicable bucket has aggregation_key 'not_applicable'
  if (naEntry.aggregation_key !== 'not_applicable') {
    fail(`${scenario.id}: not_applicable bucket must have aggregation_key 'not_applicable'; got '${naEntry.aggregation_key}'`);
  }

  // Assert unknown bucket has aggregation_key 'unknown'
  if (unknownEntry.aggregation_key !== 'unknown') {
    fail(`${scenario.id}: unknown bucket must have aggregation_key 'unknown'; got '${unknownEntry.aggregation_key}'`);
  }
}

async function runInputSchemaFirstPropertyExclusiveMinimumIndexDeterminismScenario(tmpRoot, scenario) {
  const project = await fs.mkdtemp(path.join(tmpRoot, 'input-schema-first-property-exclusive-minimum-'));

  // Build capabilities from synthetic_capabilities descriptors
  const capabilities = scenario.synthetic_capabilities.map((cap) => {
    const obj = {
      name: cap.name,
      method: cap.method,
      path: cap.path,
      domain: cap.domain,
      side_effect_class: cap.side_effect_class,
      sensitivity_class: cap.sensitivity_class,
      approved: cap.approved
    };
    if (Object.prototype.hasOwnProperty.call(cap, 'description')) {
      obj.description = cap.description;
    }
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema')) {
      obj.input_schema = cap.input_schema;
    }
    return obj;
  });

  const manifest = {
    schema_version: '1.0',
    manifest_version: 1,
    generated_at: '2026-04-28T12:00:00.000Z',
    capabilities
  };
  const manifestPath = path.join(project, 'tusq.manifest.json');
  await writeJson(manifestPath, manifest);

  // Run tusq above index --json three times and assert byte-identical output
  const run1 = runCli(['above', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run2 = runCli(['above', 'index', '--manifest', manifestPath, '--json'], { cwd: project });
  const run3 = runCli(['above', 'index', '--manifest', manifestPath, '--json'], { cwd: project });

  if (run1.stdout !== run2.stdout || run2.stdout !== run3.stdout) {
    fail(`${scenario.id}: above index --json output is not byte-identical across three runs`);
  }

  // Assert input_schema_first_property_exclusive_minimum bucket-key enum is closed — every key is one of the four valid values
  const index = JSON.parse(run1.stdout);
  const validExclusiveMinimumValues = new Set(scenario.expected_valid_exclusive_minimum_values);
  for (const entry of index.first_property_exclusive_minimum_states) {
    if (!validExclusiveMinimumValues.has(entry.input_schema_first_property_exclusive_minimum)) {
      fail(`${scenario.id}: input_schema_first_property_exclusive_minimum '${entry.input_schema_first_property_exclusive_minimum}' is outside the closed four-value enum`);
    }
  }

  // Assert aggregation_key enum is closed — every key is one of the three valid values
  const validAggregationKeys = new Set(scenario.expected_valid_aggregation_keys);
  for (const entry of index.first_property_exclusive_minimum_states) {
    if (!validAggregationKeys.has(entry.aggregation_key)) {
      fail(`${scenario.id}: aggregation_key '${entry.aggregation_key}' is outside the closed three-value enum for bucket '${entry.input_schema_first_property_exclusive_minimum}'`);
    }
  }

  // Assert buckets appear in closed-enum order (lower_exclusive_bounded → lower_exclusive_unbounded → not_applicable → unknown)
  const bucketOrder = index.first_property_exclusive_minimum_states.map((e) => e.input_schema_first_property_exclusive_minimum).join(',');
  if (bucketOrder !== scenario.expected_bucket_order) {
    fail(`${scenario.id}: buckets must appear in closed-enum order '${scenario.expected_bucket_order}'; got: ${bucketOrder}`);
  }

  // Assert warnings[] is always present in JSON output
  if (!Object.prototype.hasOwnProperty.call(index, 'warnings') || !Array.isArray(index.warnings)) {
    fail(`${scenario.id}: JSON output must have top-level warnings[] array`);
  }

  // Assert manifest is not mutated (input_schema_first_property_exclusive_minimum must NOT be written into manifest)
  const manifestAfter = await fs.readFile(manifestPath, 'utf8');
  const manifestParsed = JSON.parse(manifestAfter);
  if (JSON.stringify(manifestParsed) !== JSON.stringify(manifest)) {
    fail(`${scenario.id}: manifest must not be mutated by above index`);
  }
  for (const cap of manifestParsed.capabilities) {
    if (Object.prototype.hasOwnProperty.call(cap, 'input_schema_first_property_exclusive_minimum')) {
      fail(`${scenario.id}: input_schema_first_property_exclusive_minimum must NOT be written into tusq.manifest.json; found on capability '${cap.name}'`);
    }
  }

  // Assert no_schema_cap (missing input_schema) is in unknown bucket
  const unknownEntry = index.first_property_exclusive_minimum_states.find((e) => e.input_schema_first_property_exclusive_minimum === 'unknown');
  if (!unknownEntry || !unknownEntry.capabilities.includes('no_schema_cap')) {
    fail(`${scenario.id}: no_schema_cap (missing input_schema) must be in unknown bucket`);
  }

  // Assert not_applicable_cap (input_schema.type='array') is in not_applicable bucket with no warning
  const naEntry = index.first_property_exclusive_minimum_states.find((e) => e.input_schema_first_property_exclusive_minimum === 'not_applicable');
  if (!naEntry || !naEntry.capabilities.includes('not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (input_schema.type='array') must be in not_applicable bucket`);
  }
  if (index.warnings.some((w) => w.capability === 'not_applicable_cap')) {
    fail(`${scenario.id}: not_applicable_cap (not_applicable bucket) must NOT produce a warning`);
  }

  // Assert lower_exclusive_bounded_cap is in lower_exclusive_bounded bucket
  const lowerExclusiveBoundedEntry = index.first_property_exclusive_minimum_states.find((e) => e.input_schema_first_property_exclusive_minimum === 'lower_exclusive_bounded');
  if (!lowerExclusiveBoundedEntry || !lowerExclusiveBoundedEntry.capabilities.includes('lower_exclusive_bounded_cap')) {
    fail(`${scenario.id}: lower_exclusive_bounded_cap (firstKey.exclusiveMinimum=5) must be in lower_exclusive_bounded bucket`);
  }

  // Assert zero_bounded_cap is in lower_exclusive_bounded bucket (ZERO-IS-VALID-EXCLUSIVE-LOWER-BOUND)
  if (!lowerExclusiveBoundedEntry || !lowerExclusiveBoundedEntry.capabilities.includes('zero_bounded_cap')) {
    fail(`${scenario.id}: zero_bounded_cap (firstKey.exclusiveMinimum=0) must be in lower_exclusive_bounded bucket (ZERO-IS-VALID-EXCLUSIVE-LOWER-BOUND)`);
  }
  if (index.warnings.some((w) => w.capability === 'zero_bounded_cap')) {
    fail(`${scenario.id}: zero_bounded_cap (ZERO-IS-VALID-EXCLUSIVE-LOWER-BOUND → lower_exclusive_bounded) must NOT produce a warning`);
  }

  // Assert neg_bounded_cap is in lower_exclusive_bounded bucket (NEGATIVE-IS-VALID-EXCLUSIVE-LOWER-BOUND)
  if (!lowerExclusiveBoundedEntry || !lowerExclusiveBoundedEntry.capabilities.includes('neg_bounded_cap')) {
    fail(`${scenario.id}: neg_bounded_cap (firstKey.exclusiveMinimum=-273.15) must be in lower_exclusive_bounded bucket (NEGATIVE-IS-VALID-EXCLUSIVE-LOWER-BOUND)`);
  }
  if (index.warnings.some((w) => w.capability === 'neg_bounded_cap')) {
    fail(`${scenario.id}: neg_bounded_cap (NEGATIVE-IS-VALID-EXCLUSIVE-LOWER-BOUND → lower_exclusive_bounded) must NOT produce a warning`);
  }

  // Assert unbounded_cap is in lower_exclusive_unbounded bucket
  const lowerExclusiveUnboundedEntry = index.first_property_exclusive_minimum_states.find((e) => e.input_schema_first_property_exclusive_minimum === 'lower_exclusive_unbounded');
  if (!lowerExclusiveUnboundedEntry || !lowerExclusiveUnboundedEntry.capabilities.includes('unbounded_cap')) {
    fail(`${scenario.id}: unbounded_cap (firstKey.exclusiveMinimum absent) must be in lower_exclusive_unbounded bucket`);
  }

  // Assert null_exclusive_minimum_cap is in lower_exclusive_unbounded bucket (NULL-AS-ABSENT)
  if (!lowerExclusiveUnboundedEntry || !lowerExclusiveUnboundedEntry.capabilities.includes('null_exclusive_minimum_cap')) {
    fail(`${scenario.id}: null_exclusive_minimum_cap (firstKey.exclusiveMinimum=null) must be in lower_exclusive_unbounded bucket (null-as-absent)`);
  }
  if (index.warnings.some((w) => w.capability === 'null_exclusive_minimum_cap')) {
    fail(`${scenario.id}: null_exclusive_minimum_cap (null-as-absent → lower_exclusive_unbounded) must NOT produce a warning`);
  }

  // Assert insertion_order_cap is in lower_exclusive_bounded bucket (firstKey='z', exclusiveMinimum=5) NOT lower_exclusive_unbounded (sorted 'a' has no exclusiveMinimum)
  if (!lowerExclusiveBoundedEntry || !lowerExclusiveBoundedEntry.capabilities.includes('insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (keys={z,a,b}, firstKey=z has exclusiveMinimum=5) must be in lower_exclusive_bounded bucket (insertion-order, NOT sorted)`);
  }
  if (index.warnings.some((w) => w.capability === 'insertion_order_cap')) {
    fail(`${scenario.id}: insertion_order_cap (lower_exclusive_bounded bucket via firstKey=z) must NOT produce a warning`);
  }

  // Assert lower_exclusive_bounded bucket has aggregation_key 'numeric_lower_exclusive_bound_constraint'
  if (lowerExclusiveBoundedEntry.aggregation_key !== 'numeric_lower_exclusive_bound_constraint') {
    fail(`${scenario.id}: lower_exclusive_bounded bucket must have aggregation_key 'numeric_lower_exclusive_bound_constraint'; got '${lowerExclusiveBoundedEntry.aggregation_key}'`);
  }

  // Assert lower_exclusive_unbounded bucket has aggregation_key 'numeric_lower_exclusive_bound_constraint'
  if (lowerExclusiveUnboundedEntry.aggregation_key !== 'numeric_lower_exclusive_bound_constraint') {
    fail(`${scenario.id}: lower_exclusive_unbounded bucket must have aggregation_key 'numeric_lower_exclusive_bound_constraint'; got '${lowerExclusiveUnboundedEntry.aggregation_key}'`);
  }

  // Assert not_applicable bucket has aggregation_key 'not_applicable'
  if (naEntry.aggregation_key !== 'not_applicable') {
    fail(`${scenario.id}: not_applicable bucket must have aggregation_key 'not_applicable'; got '${naEntry.aggregation_key}'`);
  }

  // Assert unknown bucket has aggregation_key 'unknown'
  if (unknownEntry.aggregation_key !== 'unknown') {
    fail(`${scenario.id}: unknown bucket must have aggregation_key 'unknown'; got '${unknownEntry.aggregation_key}'`);
  }
}

run().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});
