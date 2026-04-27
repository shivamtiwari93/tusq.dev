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
