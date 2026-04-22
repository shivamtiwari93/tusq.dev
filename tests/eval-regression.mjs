import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
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

async function run() {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'tusq-eval-'));
  const suite = await readJson(scenarioPath);

  for (const scenario of suite.scenarios) {
    if (scenario.id === 'express-governed-workflow') {
      await runGovernedWorkflowScenario(tmpRoot, scenario);
    } else if (scenario.id === 'manifest-diff-review-queue') {
      await runDiffScenario(tmpRoot, scenario);
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
