import { spawn, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';

const root = process.cwd();
const cli = path.join(root, 'bin', 'tusq.js');

function runCli(args, { cwd, expectedStatus = 0 } = {}) {
  const result = spawnSync('node', [cli, ...args], {
    cwd,
    encoding: 'utf8'
  });

  if (result.status !== expectedStatus) {
    const details = [
      `Command failed: node ${cli} ${args.join(' ')}`,
      `Expected status: ${expectedStatus}`,
      `Actual status: ${result.status}`,
      `STDOUT:\n${result.stdout}`,
      `STDERR:\n${result.stderr}`
    ].join('\n\n');
    throw new Error(details);
  }

  return result;
}

async function copyFixture(name, destination) {
  const source = path.join(root, 'tests', 'fixtures', name);
  await fs.cp(source, destination, { recursive: true });
}

async function readJson(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

function sha256Hex(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function sortKeysDeep(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sortKeysDeep(item));
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      out[key] = sortKeysDeep(value[key]);
    }
    return out;
  }
  return value;
}

function stableStringify(value) {
  return JSON.stringify(sortKeysDeep(value));
}

function capabilityDigestPayload(capability) {
  return {
    name: capability.name,
    description: capability.description,
    method: capability.method,
    path: capability.path,
    input_schema: capability.input_schema,
    output_schema: capability.output_schema,
    side_effect_class: capability.side_effect_class,
    sensitivity_class: capability.sensitivity_class,
    auth_hints: capability.auth_hints || [],
    examples: capability.examples,
    constraints: capability.constraints,
    redaction: capability.redaction,
    provenance: capability.provenance,
    confidence: capability.confidence,
    domain: capability.domain
  };
}

function computeExpectedCapabilityDigest(capability) {
  return sha256Hex(stableStringify(capabilityDigestPayload(capability)));
}

function requestRpc(port, payload) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        method: 'POST',
        host: '127.0.0.1',
        port,
        path: '/',
        headers: {
          'content-type': 'application/json'
        }
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

async function waitForReady(proc, timeoutMs = 6000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (Date.now() - started > timeoutMs) {
        clearInterval(timer);
        reject(new Error('Timed out waiting for serve command to start'));
      }
    }, 100);

    proc.stdout.on('data', (chunk) => {
      if (String(chunk).includes('server listening')) {
        clearInterval(timer);
        resolve();
      }
    });

    proc.on('exit', (code) => {
      clearInterval(timer);
      reject(new Error(`serve exited early with code ${code}`));
    });
  });
}

async function run() {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'tusq-smoke-'));
  const expressProject = path.join(tmpRoot, 'express');
  const fastifyProject = path.join(tmpRoot, 'fastify');
  const nestProject = path.join(tmpRoot, 'nest');

  await copyFixture('express-sample', expressProject);
  await copyFixture('fastify-sample', fastifyProject);
  await copyFixture('nest-sample', nestProject);

  runCli(['help'], { cwd: root });
  const helpResult = runCli(['help'], { cwd: root });
  if (!helpResult.stdout.includes('approve')) {
    throw new Error(`Expected help output to include approve command:\n${helpResult.stdout}`);
  }
  runCli(['version'], { cwd: root });
  runCli(['does-not-exist'], { cwd: root, expectedStatus: 1 });
  const invalidFlag = runCli(['scan', '--bad-flag'], { cwd: root, expectedStatus: 1 });
  if (!invalidFlag.stdout.includes('Usage: tusq scan')) {
    throw new Error('Expected command usage help for invalid flag');
  }

  runCli(['scan', '.', '--framework', 'express'], { cwd: tmpRoot, expectedStatus: 1 });

  runCli(['init'], { cwd: expressProject });
  runCli(['init'], { cwd: expressProject });

  const scanResult = runCli(['scan', '.', '--format', 'json'], { cwd: expressProject });
  const scanJson = JSON.parse(scanResult.stdout);
  if (!scanJson.route_count || scanJson.route_count < 3) {
    throw new Error('Expected at least three routes in express scan output');
  }

  const prefixedRoute = scanJson.routes.find((route) => route.method === 'GET' && route.path === '/api/v1/users/:id');
  if (!prefixedRoute) {
    throw new Error('Expected Express GET /api/v1/users/:id route in scan output');
  }
  if (prefixedRoute.domain !== 'users') {
    throw new Error(`Expected smart domain inference to skip API prefixes and infer users, got ${prefixedRoute.domain}`);
  }
  if (!prefixedRoute.input_schema || !prefixedRoute.input_schema.properties || !prefixedRoute.input_schema.properties.id) {
    throw new Error(`Expected path parameter extraction for /api/v1/users/:id: ${JSON.stringify(prefixedRoute.input_schema)}`);
  }
  if (!Array.isArray(prefixedRoute.input_schema.required) || !prefixedRoute.input_schema.required.includes('id')) {
    throw new Error(`Expected path parameter id to be marked as required: ${JSON.stringify(prefixedRoute.input_schema)}`);
  }
  if (prefixedRoute.confidence >= 0.8) {
    throw new Error(`Expected schema-less route confidence below 0.8 after penalty, got ${prefixedRoute.confidence}`);
  }

  const manifestPath = path.join(expressProject, 'tusq.manifest.json');
  let previousManifestRaw = null;
  let previousManifestJson = null;
  try {
    previousManifestRaw = await fs.readFile(manifestPath, 'utf8');
    previousManifestJson = JSON.parse(previousManifestRaw);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  runCli(['manifest', '--verbose'], { cwd: expressProject });
  const manifest = await readJson(manifestPath);
  const prefixedCapability = manifest.capabilities.find((capability) => capability.path === '/api/v1/users/:id');
  if (!prefixedCapability) {
    throw new Error('Expected manifest capability for GET /api/v1/users/:id');
  }
  if (!prefixedCapability.description.includes('handler: getUser') || !prefixedCapability.description.includes('requires requireAuth')) {
    throw new Error(`Expected rich capability description with handler and auth context: ${prefixedCapability.description}`);
  }
  if (prefixedCapability.review_needed !== true) {
    throw new Error(`Expected schema-less route to require review (confidence=${prefixedCapability.confidence})`);
  }
  const defaultConstraints = {
    rate_limit: null,
    max_payload_bytes: null,
    required_headers: [],
    idempotent: null,
    cacheable: null
  };
  const defaultRedaction = {
    pii_fields: [],
    log_level: 'full',
    mask_in_traces: false,
    retention_days: null
  };
  const customExamples = [
    {
      input: {
        limit: 25
      },
      output: {
        users: []
      }
    }
  ];
  const customConstraints = {
    rate_limit: '60/minute',
    max_payload_bytes: 2048,
    required_headers: ['X-Request-Id'],
    idempotent: true,
    cacheable: true
  };
  const customRedaction = {
    pii_fields: ['email', 'ssn'],
    log_level: 'redacted',
    mask_in_traces: true,
    retention_days: 30
  };
  if (!manifest.capabilities.every((capability) => capability.sensitivity_class === 'unknown')) {
    throw new Error('Expected manifest capabilities to include sensitivity_class=unknown in V1');
  }
  if (!manifest.capabilities.every((capability) => JSON.stringify(capability.constraints) === JSON.stringify(defaultConstraints))) {
    throw new Error('Expected manifest capabilities to include default constraints in V1');
  }
  if (!manifest.capabilities.every((capability) => JSON.stringify(capability.redaction) === JSON.stringify(defaultRedaction))) {
    throw new Error('Expected manifest capabilities to include default redaction settings in V1');
  }
  if (!manifest.capabilities.every((capability) => Array.isArray(capability.examples) && capability.examples.length > 0)) {
    throw new Error('Expected manifest capabilities to include examples array in V1');
  }
  const expressGetUsers = manifest.capabilities.find((capability) => capability.method === 'GET' && capability.path === '/users');
  const expressPostUsers = manifest.capabilities.find((capability) => capability.method === 'POST' && capability.path === '/users');
  if (!expressGetUsers || !expressPostUsers) {
    throw new Error('Expected express manifest to include GET /users and POST /users capabilities');
  }
  if (!expressGetUsers.output_schema || expressGetUsers.output_schema.type !== 'array') {
    throw new Error(`Expected GET /users output_schema.type=array, got ${JSON.stringify(expressGetUsers && expressGetUsers.output_schema)}`);
  }
  if (!expressPostUsers.input_schema || !expressPostUsers.input_schema.properties || !expressPostUsers.input_schema.properties.body) {
    throw new Error(`Expected POST /users input_schema to include body property: ${JSON.stringify(expressPostUsers && expressPostUsers.input_schema)}`);
  }
  if (!expressPostUsers.output_schema || expressPostUsers.output_schema.properties?.ok?.type !== 'boolean') {
    throw new Error(`Expected POST /users output_schema to infer ok:boolean, got ${JSON.stringify(expressPostUsers && expressPostUsers.output_schema)}`);
  }
  for (const capability of [expressGetUsers, expressPostUsers]) {
    if (!capability.provenance || capability.provenance.framework !== 'express' || capability.provenance.handler === undefined) {
      throw new Error(`Expected capability provenance to include framework and handler: ${JSON.stringify(capability.provenance)}`);
    }
  }
  if (!manifest.capabilities.every((capability) => capability.approved_by === null && capability.approved_at === null)) {
    throw new Error('Expected manifest capabilities to include null approval metadata in V1');
  }
  const expectedManifestVersion = Number.isInteger(previousManifestJson && previousManifestJson.manifest_version)
    && previousManifestJson.manifest_version >= 1
    ? previousManifestJson.manifest_version + 1
    : 1;
  if (manifest.manifest_version !== expectedManifestVersion) {
    throw new Error(`Expected manifest_version=${expectedManifestVersion}, got ${manifest.manifest_version}`);
  }
  const expectedPreviousManifestHash = previousManifestRaw === null ? null : sha256Hex(previousManifestRaw);
  if (manifest.previous_manifest_hash !== expectedPreviousManifestHash) {
    throw new Error(
      `Expected previous_manifest_hash=${expectedPreviousManifestHash}, got ${manifest.previous_manifest_hash}`
    );
  }
  for (const capability of manifest.capabilities) {
    if (!/^[a-f0-9]{64}$/.test(String(capability.capability_digest || ''))) {
      throw new Error(`Expected capability_digest to be a 64-char lowercase SHA-256 hex string: ${JSON.stringify(capability)}`);
    }
    const expectedDigest = computeExpectedCapabilityDigest(capability);
    if (capability.capability_digest !== expectedDigest) {
      throw new Error(
        `Expected capability_digest=${expectedDigest}, got ${capability.capability_digest} for ${capability.name}`
      );
    }
  }
  const baselineDigest = manifest.capabilities[0].capability_digest;

  manifest.capabilities[0].approved = true;
  manifest.capabilities[0].approved_by = 'alice@company.com';
  manifest.capabilities[0].approved_at = '2026-04-19T10:30:00.000Z';
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  runCli(['manifest', '--verbose'], { cwd: expressProject });
  const manifestAfterApprovalEdit = await readJson(manifestPath);
  const digestAfterApprovalEdit = manifestAfterApprovalEdit.capabilities[0].capability_digest;
  if (digestAfterApprovalEdit !== baselineDigest) {
    throw new Error('Expected capability_digest to ignore approval metadata fields');
  }

  manifestAfterApprovalEdit.capabilities[0].examples = customExamples;
  manifestAfterApprovalEdit.capabilities[0].constraints = customConstraints;
  manifestAfterApprovalEdit.capabilities[0].redaction = customRedaction;
  await fs.writeFile(manifestPath, `${JSON.stringify(manifestAfterApprovalEdit, null, 2)}\n`, 'utf8');

  runCli(['manifest', '--verbose'], { cwd: expressProject });
  const manifestWithCustomFields = await readJson(manifestPath);
  if (manifestWithCustomFields.capabilities[0].capability_digest === baselineDigest) {
    throw new Error('Expected capability_digest to change when capability content fields change');
  }
  for (const capability of manifestWithCustomFields.capabilities) {
    const expectedDigest = computeExpectedCapabilityDigest(capability);
    if (capability.capability_digest !== expectedDigest) {
      throw new Error(
        `Expected capability_digest=${expectedDigest}, got ${capability.capability_digest} after regeneration`
      );
    }
  }

  runCli(['compile', '--dry-run', '--verbose'], { cwd: expressProject });
  runCli(['compile', '--verbose'], { cwd: expressProject });
  const compiledToolPath = path.join(
    expressProject,
    'tusq-tools',
    `${manifestWithCustomFields.capabilities[0].name}.json`
  );
  const compiledTool = await readJson(compiledToolPath);
  if (compiledTool.sensitivity_class !== 'unknown') {
    throw new Error('Expected compiled tool to include sensitivity_class=unknown');
  }
  if (JSON.stringify(compiledTool.examples) !== JSON.stringify(customExamples)) {
    throw new Error('Expected compiled tool examples to preserve manifest values');
  }
  if (JSON.stringify(compiledTool.constraints) !== JSON.stringify(customConstraints)) {
    throw new Error('Expected compiled tool constraints to preserve manifest values');
  }
  if (JSON.stringify(compiledTool.redaction) !== JSON.stringify(customRedaction)) {
    throw new Error('Expected compiled tool redaction to preserve manifest values');
  }
  if ('approved_by' in compiledTool || 'approved_at' in compiledTool || 'approved' in compiledTool || 'review_needed' in compiledTool) {
    throw new Error('Expected compiled tool to exclude approval metadata fields');
  }
  if ('capability_digest' in compiledTool || 'manifest_version' in compiledTool || 'previous_manifest_hash' in compiledTool) {
    throw new Error('Expected compiled tool to exclude manifest version history metadata');
  }
  const reviewResult = runCli(['review', '--verbose'], { cwd: expressProject });
  if (!reviewResult.stdout.includes('returns=array<object>') || !reviewResult.stdout.includes('inputs=body:request_body')) {
    throw new Error(`Expected review output to summarize inferred input/output shapes:\n${reviewResult.stdout}`);
  }
  if (!reviewResult.stdout.includes('source=src/app.ts') || !reviewResult.stdout.includes('handler=listUsers') || !reviewResult.stdout.includes('framework=express')) {
    throw new Error(`Expected review output to summarize provenance:\n${reviewResult.stdout}`);
  }
  const strictReviewFailure = runCli(['review', '--strict'], { cwd: expressProject, expectedStatus: 1 });
  if (!strictReviewFailure.stderr.includes('Review gate failed')) {
    throw new Error(`Expected strict review mode to fail with governance gate message:\n${strictReviewFailure.stderr}`);
  }

  const approvalCandidateManifest = await readJson(manifestPath);
  const approvalCandidate = approvalCandidateManifest.capabilities.find((capability) => capability.approved !== true);
  if (!approvalCandidate) {
    throw new Error('Expected at least one unapproved capability before tusq approve coverage');
  }

  const dryRunApproval = runCli(['approve', approvalCandidate.name, '--reviewer', 'qa@example.com', '--dry-run', '--json'], { cwd: expressProject });
  const dryRunJson = JSON.parse(dryRunApproval.stdout);
  if (dryRunJson.dry_run !== true || dryRunJson.approved_count !== 1 || dryRunJson.approvals[0].name !== approvalCandidate.name) {
    throw new Error(`Expected tusq approve dry-run JSON to identify one candidate: ${dryRunApproval.stdout}`);
  }
  const afterDryRunManifest = await readJson(manifestPath);
  const afterDryRunCandidate = afterDryRunManifest.capabilities.find((capability) => capability.name === approvalCandidate.name);
  if (afterDryRunCandidate.approved === true || afterDryRunCandidate.approved_by !== null || afterDryRunCandidate.approved_at !== null) {
    throw new Error('Expected tusq approve --dry-run to leave manifest approval metadata unchanged');
  }

  const singleApproval = runCli(['approve', approvalCandidate.name, '--reviewer', 'qa@example.com', '--json'], { cwd: expressProject });
  const singleApprovalJson = JSON.parse(singleApproval.stdout);
  if (singleApprovalJson.dry_run !== false || singleApprovalJson.approved_count !== 1 || singleApprovalJson.reviewer !== 'qa@example.com') {
    throw new Error(`Expected tusq approve JSON to record reviewer and one approval: ${singleApproval.stdout}`);
  }
  const afterSingleApproval = await readJson(manifestPath);
  const approvedCandidate = afterSingleApproval.capabilities.find((capability) => capability.name === approvalCandidate.name);
  if (approvedCandidate.approved !== true || approvedCandidate.review_needed !== false || approvedCandidate.approved_by !== 'qa@example.com') {
    throw new Error(`Expected tusq approve to update selected capability: ${JSON.stringify(approvedCandidate)}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}T/.test(String(approvedCandidate.approved_at || ''))) {
    throw new Error(`Expected tusq approve to record approved_at timestamp: ${JSON.stringify(approvedCandidate)}`);
  }

  const allApproval = runCli(['approve', '--all', '--reviewer', 'qa@example.com', '--json'], { cwd: expressProject });
  const allApprovalJson = JSON.parse(allApproval.stdout);
  if (allApprovalJson.approved_count < 1) {
    throw new Error(`Expected tusq approve --all to approve remaining capabilities: ${allApproval.stdout}`);
  }
  const reviewReadyManifest = await readJson(manifestPath);
  if (!reviewReadyManifest.capabilities.every((capability) => capability.approved === true && capability.review_needed === false)) {
    throw new Error('Expected tusq approve --all to approve every remaining review-needed/unapproved capability');
  }
  runCli(['review', '--strict'], { cwd: expressProject });

  // REQ-039 through REQ-043: manifest diff and review queue
  const oldDiffManifest = JSON.parse(JSON.stringify(reviewReadyManifest));
  const newDiffManifest = JSON.parse(JSON.stringify(reviewReadyManifest));
  const changedCapability = newDiffManifest.capabilities[0];
  changedCapability.description = `${changedCapability.description} with pagination`;
  changedCapability.approved = false;
  changedCapability.review_needed = true;
  changedCapability.capability_digest = computeExpectedCapabilityDigest(changedCapability);
  const addedCapability = JSON.parse(JSON.stringify(newDiffManifest.capabilities[1]));
  addedCapability.name = 'post_users_bulk_import';
  addedCapability.path = '/users/bulk-import';
  addedCapability.description = 'Import users in bulk - state-modifying, requires requireAuth';
  addedCapability.approved = false;
  addedCapability.review_needed = false;
  addedCapability.capability_digest = computeExpectedCapabilityDigest(addedCapability);
  newDiffManifest.capabilities = [
    changedCapability,
    newDiffManifest.capabilities[1],
    addedCapability
  ];
  newDiffManifest.manifest_version = oldDiffManifest.manifest_version + 1;

  const oldManifestPath = path.join(expressProject, 'old.manifest.json');
  const newManifestPath = path.join(expressProject, 'new.manifest.json');
  await fs.writeFile(oldManifestPath, `${JSON.stringify(oldDiffManifest, null, 2)}\n`, 'utf8');
  await fs.writeFile(newManifestPath, `${JSON.stringify(newDiffManifest, null, 2)}\n`, 'utf8');

  const diffResult = runCli(['diff', '--from', oldManifestPath, '--to', newManifestPath, '--review-queue'], { cwd: expressProject });
  if (!diffResult.stdout.includes('Summary: 1 added, 1 removed, 1 changed, 1 unchanged.')) {
    throw new Error(`Expected manifest diff summary counts, got:\n${diffResult.stdout}`);
  }
  if (!diffResult.stdout.includes('changed') || !diffResult.stdout.includes('fields=approved,description,review_needed')) {
    throw new Error(`Expected changed capability field summary, got:\n${diffResult.stdout}`);
  }
  if (!diffResult.stdout.includes('Review queue: 2 capability(s)')) {
    throw new Error(`Expected diff review queue with added and changed capabilities, got:\n${diffResult.stdout}`);
  }

  const diffJsonResult = runCli(['diff', '--json', '--from', oldManifestPath, '--to', newManifestPath, '--review-queue'], { cwd: expressProject });
  const diffJson = JSON.parse(diffJsonResult.stdout);
  if (diffJson.summary.added !== 1 || diffJson.summary.removed !== 1 || diffJson.summary.changed !== 1 || diffJson.summary.unchanged !== 1) {
    throw new Error(`Expected JSON diff summary counts, got ${JSON.stringify(diffJson.summary)}`);
  }
  const jsonChanged = diffJson.changes.find((change) => change.type === 'changed');
  if (!jsonChanged || !jsonChanged.fields_changed.includes('description')) {
    throw new Error(`Expected JSON changed record with fields_changed, got ${JSON.stringify(diffJson.changes)}`);
  }
  if (!Array.isArray(diffJson.review_queue) || diffJson.review_queue.length !== 2) {
    throw new Error(`Expected JSON review_queue with 2 items, got ${JSON.stringify(diffJson.review_queue)}`);
  }

  const diffGateFailure = runCli(
    ['diff', '--from', oldManifestPath, '--to', newManifestPath, '--fail-on-unapproved-changes'],
    { cwd: expressProject, expectedStatus: 1 }
  );
  if (!diffGateFailure.stderr.includes('Review gate failed')) {
    throw new Error(`Expected diff gate failure for unapproved changes, got:\n${diffGateFailure.stderr}`);
  }
  const missingFromFailure = runCli(['diff', '--to', newManifestPath], { cwd: expressProject, expectedStatus: 1 });
  if (!missingFromFailure.stderr.includes('Pass --from <path>')) {
    throw new Error(`Expected diff to ask for --from when no predecessor is resolvable, got:\n${missingFromFailure.stderr}`);
  }
  const missingPathFailure = runCli(
    ['diff', '--from', path.join(expressProject, 'missing.manifest.json'), '--to', newManifestPath],
    { cwd: expressProject, expectedStatus: 1 }
  );
  if (!missingPathFailure.stderr.includes('from manifest not found')) {
    throw new Error(`Expected diff to report missing manifest path, got:\n${missingPathFailure.stderr}`);
  }

  for (const capability of newDiffManifest.capabilities) {
    capability.approved = true;
    capability.review_needed = false;
  }
  await fs.writeFile(newManifestPath, `${JSON.stringify(newDiffManifest, null, 2)}\n`, 'utf8');
  runCli(['diff', '--from', oldManifestPath, '--to', newManifestPath, '--fail-on-unapproved-changes'], { cwd: expressProject });

  // REQ-036: Framework-specific deep extraction assertions
  runCli(['init'], { cwd: fastifyProject });
  const fastifyScanResult = runCli(['scan', '.', '--format', 'json'], { cwd: fastifyProject });
  const fastifyScan = JSON.parse(fastifyScanResult.stdout);
  if (fastifyScan.route_count !== 2) {
    throw new Error(`Expected 2 Fastify routes (inline GET + route-object POST), got ${fastifyScan.route_count}`);
  }
  const fastifyGet = fastifyScan.routes.find((r) => r.method === 'GET' && r.path === '/orders');
  if (!fastifyGet) {
    throw new Error('Expected Fastify GET /orders from 3-argument inline fastify.get(path, options, handler) form');
  }
  if (fastifyGet.handler !== 'listOrders') {
    throw new Error(`Expected Fastify GET /orders handler=listOrders, got ${fastifyGet.handler}`);
  }
  if (!fastifyGet.input_schema || !fastifyGet.input_schema.description.includes('schema hints')) {
    throw new Error('Expected Fastify GET /orders input_schema to reflect schema hints from options block schema: property');
  }
  const fastifyPost = fastifyScan.routes.find((r) => r.method === 'POST' && r.path === '/orders');
  if (!fastifyPost) {
    throw new Error('Expected Fastify POST /orders from fastify.route({}) form');
  }
  if (!fastifyPost.auth_hints.includes('requireAuth')) {
    throw new Error(`Expected Fastify POST /orders auth_hints to include requireAuth, got ${JSON.stringify(fastifyPost.auth_hints)}`);
  }

  runCli(['init'], { cwd: nestProject });
  const nestScanResult = runCli(['scan', '.', '--format', 'json'], { cwd: nestProject });
  const nestScan = JSON.parse(nestScanResult.stdout);
  if (nestScan.route_count !== 2) {
    throw new Error(`Expected 2 NestJS routes, got ${nestScan.route_count}`);
  }
  const nestGet = nestScan.routes.find((r) => r.method === 'GET' && r.path === '/users');
  if (!nestGet) {
    throw new Error('Expected NestJS GET /users with controller prefix composition');
  }
  if (!nestGet.auth_hints.includes('AuthGuard')) {
    throw new Error(`Expected NestJS GET /users to inherit class-level AuthGuard, got ${JSON.stringify(nestGet.auth_hints)}`);
  }
  const nestPost = nestScan.routes.find((r) => r.method === 'POST' && r.path === '/users/:id/disable');
  if (!nestPost) {
    throw new Error('Expected NestJS POST /users/:id/disable with composed path (controller prefix + method decorator)');
  }
  if (!nestPost.auth_hints.includes('AuthGuard') || !nestPost.auth_hints.includes('AdminGuard')) {
    throw new Error(`Expected NestJS POST to have both AuthGuard (inherited) and AdminGuard (method-level), got ${JSON.stringify(nestPost.auth_hints)}`);
  }
  if (!nestPost.input_schema?.properties?.id || nestPost.input_schema.properties.id.source !== 'path') {
    throw new Error(`Expected NestJS POST path parameter id to be represented in input_schema: ${JSON.stringify(nestPost.input_schema)}`);
  }

  const port = 32155;
  const serveProc = spawn('node', [cli, 'serve', '--port', String(port)], {
    cwd: expressProject,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  await waitForReady(serveProc);

  const listResponse = await requestRpc(port, {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
  });

  if (!listResponse.result || !Array.isArray(listResponse.result.tools) || listResponse.result.tools.length === 0) {
    throw new Error(`tools/list did not return tools: ${JSON.stringify(listResponse)}`);
  }

  const firstTool = listResponse.result.tools[0];
  if (firstTool.sensitivity_class !== 'unknown') {
    throw new Error(`Expected tools/list sensitivity_class=unknown: ${JSON.stringify(firstTool)}`);
  }
  if (!Array.isArray(firstTool.auth_hints)) {
    throw new Error(`Expected tools/list auth_hints array: ${JSON.stringify(firstTool)}`);
  }
  if ('redaction' in firstTool) {
    throw new Error(`Expected tools/list to exclude redaction metadata: ${JSON.stringify(firstTool)}`);
  }
  const callResponse = await requestRpc(port, {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: firstTool.name
    }
  });

  if (!callResponse.result || !callResponse.result.schema) {
    throw new Error(`tools/call did not return schema: ${JSON.stringify(callResponse)}`);
  }
  if (callResponse.result.sensitivity_class !== 'unknown') {
    throw new Error(`Expected tools/call sensitivity_class=unknown: ${JSON.stringify(callResponse)}`);
  }
  if (!Array.isArray(callResponse.result.auth_hints)) {
    throw new Error(`Expected tools/call auth_hints array: ${JSON.stringify(callResponse)}`);
  }
  if (JSON.stringify(callResponse.result.examples) !== JSON.stringify(customExamples)) {
    throw new Error(`Expected tools/call examples to preserve manifest values: ${JSON.stringify(callResponse)}`);
  }
  if (JSON.stringify(callResponse.result.constraints) !== JSON.stringify(customConstraints)) {
    throw new Error(`Expected tools/call constraints to preserve manifest values: ${JSON.stringify(callResponse)}`);
  }
  if (JSON.stringify(callResponse.result.redaction) !== JSON.stringify(customRedaction)) {
    throw new Error(`Expected tools/call redaction to preserve manifest values: ${JSON.stringify(callResponse)}`);
  }
  if ('approved_by' in callResponse.result || 'approved_at' in callResponse.result || 'approved' in callResponse.result || 'review_needed' in callResponse.result) {
    throw new Error(`Expected tools/call to exclude approval metadata fields: ${JSON.stringify(callResponse)}`);
  }
  if ('capability_digest' in callResponse.result || 'manifest_version' in callResponse.result || 'previous_manifest_hash' in callResponse.result) {
    throw new Error(`Expected tools/call to exclude manifest version history metadata: ${JSON.stringify(callResponse)}`);
  }

  const stop = new Promise((resolve, reject) => {
    serveProc.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`serve exited with non-zero code ${code}`));
      }
    });
  });

  serveProc.kill('SIGINT');
  await stop;

  console.log('Smoke tests passed');
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
