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
  if (!helpResult.stdout.includes('docs')) {
    throw new Error(`Expected help output to include docs command:\n${helpResult.stdout}`);
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
    pii_fields: [],
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

  const docsResult = runCli(['docs', '--manifest', manifestPath], { cwd: expressProject });
  if (!docsResult.stdout.includes('# Capability Documentation')) {
    throw new Error(`Expected docs output to include title:\n${docsResult.stdout}`);
  }
  for (const expected of [
    '## Manifest',
    '## Capabilities',
    'Side effect class',
    'Sensitivity class',
    'Auth hints',
    '#### Examples',
    '#### Constraints',
    '#### Redaction',
    '#### Provenance'
  ]) {
    if (!docsResult.stdout.includes(expected)) {
      throw new Error(`Expected docs output to include ${expected}:\n${docsResult.stdout}`);
    }
  }
  if (!docsResult.stdout.includes('Approved: yes') || !docsResult.stdout.includes('Manifest version')) {
    throw new Error(`Expected docs output to include approval and manifest version metadata:\n${docsResult.stdout}`);
  }
  const docsOutPath = path.join(expressProject, 'capability-docs.md');
  runCli(['docs', '--manifest', manifestPath, '--out', docsOutPath], { cwd: expressProject });
  const docsOut = await fs.readFile(docsOutPath, 'utf8');
  if (docsOut !== docsResult.stdout) {
    throw new Error('Expected tusq docs --out to write the same deterministic Markdown emitted to stdout');
  }

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
  if (fastifyScan.route_count !== 5) {
    throw new Error(`Expected 5 Fastify routes (2 original + 3 M24 additions), got ${fastifyScan.route_count}`);
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

  // ─── M24: Fastify schema body field extraction ───────────────────────────────

  // (a) Fastify routes without a literal schema.body block are byte-identical to pre-M24 behavior.
  //     GET /orders has schema: { response: ... } (no body key) → falls back to M15.
  if (fastifyGet.input_schema.source !== undefined) {
    throw new Error(`M24(a): GET /orders should have no top-level source (M15 fall-back), got source=${fastifyGet.input_schema.source}`);
  }
  if (fastifyGet.input_schema.additionalProperties !== true) {
    throw new Error(`M24(a): GET /orders should have additionalProperties: true (M15 fall-back), got ${fastifyGet.input_schema.additionalProperties}`);
  }
  //     POST /orders has schema.body but no properties → M15 fall-back
  if (fastifyPost.input_schema.source !== undefined) {
    throw new Error(`M24(a): POST /orders (no properties block) should have no top-level source, got source=${fastifyPost.input_schema.source}`);
  }
  if (fastifyPost.input_schema.additionalProperties !== true) {
    throw new Error(`M24(a): POST /orders should have additionalProperties: true (M15 fall-back), got ${fastifyPost.input_schema.additionalProperties}`);
  }

  // (b) POST /items has a literal schema.body.properties → M24 extraction.
  //     Asserts: properties with declared field names in declaration order,
  //              additionalProperties: false, source: 'fastify_schema_body'.
  const fastifyPostItems = fastifyScan.routes.find((r) => r.method === 'POST' && r.path === '/items');
  if (!fastifyPostItems) {
    throw new Error('M24(b): Expected POST /items route in Fastify scan');
  }
  if (fastifyPostItems.input_schema.source !== 'fastify_schema_body') {
    throw new Error(`M24(b): Expected input_schema.source='fastify_schema_body', got '${fastifyPostItems.input_schema.source}'`);
  }
  if (fastifyPostItems.input_schema.additionalProperties !== false) {
    throw new Error(`M24(b): Expected additionalProperties: false on extracted schema, got ${fastifyPostItems.input_schema.additionalProperties}`);
  }
  const m24ItemsProps = fastifyPostItems.input_schema.properties;
  if (!m24ItemsProps || !m24ItemsProps.name || !m24ItemsProps.price || !m24ItemsProps.active) {
    throw new Error(`M24(b): Expected name/price/active in input_schema.properties: ${JSON.stringify(m24ItemsProps)}`);
  }
  if (m24ItemsProps.name.type !== 'string' || m24ItemsProps.price.type !== 'number' || m24ItemsProps.active.type !== 'boolean') {
    throw new Error(`M24(b): Type mismatch in extracted properties: ${JSON.stringify(m24ItemsProps)}`);
  }
  // Declaration order must be preserved: name < price < active
  const m24ItemsKeys = Object.keys(m24ItemsProps);
  if (m24ItemsKeys[0] !== 'name' || m24ItemsKeys[1] !== 'price' || m24ItemsKeys[2] !== 'active') {
    throw new Error(`M24(b): Expected declaration order [name, price, active], got [${m24ItemsKeys.join(', ')}]`);
  }
  // required array: ['name', 'price']
  if (!fastifyPostItems.input_schema.required.includes('name') || !fastifyPostItems.input_schema.required.includes('price')) {
    throw new Error(`M24(b): Expected required to include name and price: ${JSON.stringify(fastifyPostItems.input_schema.required)}`);
  }

  // (c) GET /catalog uses schema: sharedSchema (non-literal) → M15 fall-back
  const fastifyCatalog = fastifyScan.routes.find((r) => r.method === 'GET' && r.path === '/catalog');
  if (!fastifyCatalog) {
    throw new Error('M24(c): Expected GET /catalog route in Fastify scan');
  }
  if (fastifyCatalog.input_schema.source !== undefined) {
    throw new Error(`M24(c): GET /catalog (non-literal schema) should have no top-level source, got source=${fastifyCatalog.input_schema.source}`);
  }
  if (fastifyCatalog.input_schema.additionalProperties !== true) {
    throw new Error(`M24(c): GET /catalog should have additionalProperties: true (M15 fall-back), got ${fastifyCatalog.input_schema.additionalProperties}`);
  }

  // (d) PUT /items/:id has a body schema with 'id' colliding with path param :id — path param wins.
  const fastifyPutItems = fastifyScan.routes.find((r) => r.method === 'PUT' && r.path === '/items/:id');
  if (!fastifyPutItems) {
    throw new Error('M24(d): Expected PUT /items/:id route in Fastify scan');
  }
  if (fastifyPutItems.input_schema.source !== 'fastify_schema_body') {
    throw new Error(`M24(d): Expected source='fastify_schema_body' on PUT /items/:id, got '${fastifyPutItems.input_schema.source}'`);
  }
  const m24PutProps = fastifyPutItems.input_schema.properties;
  // Path param :id must be present with source: 'path' (path parameter wins)
  if (!m24PutProps.id || m24PutProps.id.source !== 'path') {
    throw new Error(`M24(d): Path param id should win and have source:'path', got: ${JSON.stringify(m24PutProps.id)}`);
  }
  // Body 'name' field must be present (not a collision)
  if (!m24PutProps.name || m24PutProps.name.type !== 'string') {
    throw new Error(`M24(d): Expected name field from body schema: ${JSON.stringify(m24PutProps)}`);
  }
  // Body's duplicate 'id' field (type: 'number') must NOT be present (path param wins)
  if (m24PutProps.id.type !== 'string') {
    throw new Error(`M24(d): Path param id should retain type: 'string', got type='${m24PutProps.id.type}'`);
  }

  // (e) Express fixture manifests are byte-identical pre/post-M24 (no source changes for Express)
  //     The express manifest was already generated above; read it from disk
  const expressM24ManifestPath = path.join(expressProject, 'tusq.manifest.json');
  const expressM24ManifestContent = JSON.parse(await fs.readFile(expressM24ManifestPath, 'utf8'));
  for (const cap of expressM24ManifestContent.capabilities || []) {
    if (cap.input_schema && cap.input_schema.source === 'fastify_schema_body') {
      throw new Error(`M24(e): Express manifest must NOT have source='fastify_schema_body', found it on capability ${cap.name}`);
    }
  }

  // (f) NestJS fixture assertion is below after nestScan (no fastify_schema_body in NestJS output)

  // (g) Repeated manifest generations on the Fastify fixture produce byte-identical property ordering
  runCli(['manifest'], { cwd: fastifyProject });
  const fastifyManifestPath = path.join(fastifyProject, 'tusq.manifest.json');
  const fastifyManifest1 = await fs.readFile(fastifyManifestPath, 'utf8');
  runCli(['manifest'], { cwd: fastifyProject });
  const fastifyManifest2 = await fs.readFile(fastifyManifestPath, 'utf8');
  // The manifest_version increments on each call, so compare only the capabilities shape
  const m24Cap1 = JSON.parse(fastifyManifest1).capabilities.find((c) => c.path === '/items' && c.method === 'POST');
  const m24Cap2 = JSON.parse(fastifyManifest2).capabilities.find((c) => c.path === '/items' && c.method === 'POST');
  if (JSON.stringify(m24Cap1.input_schema.properties) !== JSON.stringify(m24Cap2.input_schema.properties)) {
    throw new Error(`M24(g): Non-deterministic property ordering across runs:\nRun1: ${JSON.stringify(m24Cap1.input_schema.properties)}\nRun2: ${JSON.stringify(m24Cap2.input_schema.properties)}`);
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

  // M24(f): NestJS fixture must not produce any fastify_schema_body source tags
  for (const nestRoute of nestScan.routes) {
    if (nestRoute.input_schema && nestRoute.input_schema.source === 'fastify_schema_body') {
      throw new Error(`M24(f): NestJS manifest must NOT have source='fastify_schema_body', found it on ${nestRoute.method} ${nestRoute.path}`);
    }
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

  // REQ-058: M20 policy startup failure — missing policy file exits 1
  const missingPolicyResult = runCli(
    ['serve', '--port', '32170', '--policy', '/nonexistent/policy.json'],
    { cwd: expressProject, expectedStatus: 1 }
  );
  if (!missingPolicyResult.stderr.includes('Policy file not found:')) {
    throw new Error(`Expected 'Policy file not found:' on missing policy: ${missingPolicyResult.stderr}`);
  }

  // REQ-058: invalid JSON policy exits 1
  const badPolicyPath = path.join(expressProject, '.tusq', 'bad-policy.json');
  await fs.mkdir(path.join(expressProject, '.tusq'), { recursive: true });
  await fs.writeFile(badPolicyPath, 'not json', 'utf8');
  const badJsonResult = runCli(
    ['serve', '--port', '32170', '--policy', badPolicyPath],
    { cwd: expressProject, expectedStatus: 1 }
  );
  if (!badJsonResult.stderr.includes('Invalid policy JSON at:')) {
    throw new Error(`Expected 'Invalid policy JSON at:' on bad JSON policy: ${badJsonResult.stderr}`);
  }

  // REQ-058: unsupported schema_version exits 1
  const badVersionPolicyPath = path.join(expressProject, '.tusq', 'version-policy.json');
  await fs.writeFile(badVersionPolicyPath, JSON.stringify({ schema_version: '99.0', mode: 'dry-run' }), 'utf8');
  const badVersionResult = runCli(
    ['serve', '--port', '32170', '--policy', badVersionPolicyPath],
    { cwd: expressProject, expectedStatus: 1 }
  );
  if (!badVersionResult.stderr.includes('Unsupported policy schema_version:')) {
    throw new Error(`Expected 'Unsupported policy schema_version:' on bad version: ${badVersionResult.stderr}`);
  }

  // REQ-058: unknown mode exits 1
  const badModePolicyPath = path.join(expressProject, '.tusq', 'mode-policy.json');
  await fs.writeFile(badModePolicyPath, JSON.stringify({ schema_version: '1.0', mode: 'live-fire' }), 'utf8');
  const badModeResult = runCli(
    ['serve', '--port', '32170', '--policy', badModePolicyPath],
    { cwd: expressProject, expectedStatus: 1 }
  );
  if (!badModeResult.stderr.includes('Unknown policy mode:')) {
    throw new Error(`Expected 'Unknown policy mode:' on bad mode: ${badModeResult.stderr}`);
  }

  // Re-compile now that all capabilities are approved so dry-run tests have full tool set with method+path
  runCli(['compile', '--verbose'], { cwd: expressProject });

  // REQ-059: policy-on dry-run mode — describe-only policy is a no-op
  const describeOnlyPolicyPath = path.join(expressProject, '.tusq', 'describe-only-policy.json');
  await fs.writeFile(describeOnlyPolicyPath, JSON.stringify({
    schema_version: '1.0',
    mode: 'describe-only',
    reviewer: 'ops@example.com',
    approved_at: '2026-04-22T05:20:21Z'
  }, null, 2), 'utf8');

  const describeOnlyPort = 32171;
  const describeOnlyProc = spawn('node', [cli, 'serve', '--port', String(describeOnlyPort), '--policy', describeOnlyPolicyPath], {
    cwd: expressProject,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await waitForReady(describeOnlyProc);

  const describeOnlyCall = await requestRpc(describeOnlyPort, {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: { name: 'get_users_users' }
  });
  if (!describeOnlyCall.result || !describeOnlyCall.result.schema) {
    throw new Error(`Expected describe-only policy to return V1 schema response: ${JSON.stringify(describeOnlyCall)}`);
  }
  if ('executed' in describeOnlyCall.result) {
    throw new Error(`Expected describe-only policy to not include executed field: ${JSON.stringify(describeOnlyCall.result)}`);
  }

  const describeOnlyStop = new Promise((resolve, reject) => {
    describeOnlyProc.on('exit', (code) => { if (code === 0) resolve(); else reject(new Error(`serve exited with code ${code}`)); });
  });
  describeOnlyProc.kill('SIGINT');
  await describeOnlyStop;

  // REQ-059 + REQ-060: policy-on dry-run mode with valid arguments returns plan with executed:false
  const dryRunPolicyPath = path.join(expressProject, '.tusq', 'dry-run-policy.json');
  await fs.writeFile(dryRunPolicyPath, JSON.stringify({
    schema_version: '1.0',
    mode: 'dry-run',
    reviewer: 'ops@example.com',
    approved_at: '2026-04-22T05:20:21Z'
  }, null, 2), 'utf8');

  const dryRunPort = 32172;
  const dryRunProc = spawn('node', [cli, 'serve', '--port', String(dryRunPort), '--policy', dryRunPolicyPath], {
    cwd: expressProject,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await waitForReady(dryRunProc);

  // tools/list must be identical under dry-run policy (V1 behavior unchanged)
  const dryRunList = await requestRpc(dryRunPort, { jsonrpc: '2.0', id: 1, method: 'tools/list' });
  if (!dryRunList.result || !Array.isArray(dryRunList.result.tools) || dryRunList.result.tools.length === 0) {
    throw new Error(`Expected tools/list to work under dry-run policy: ${JSON.stringify(dryRunList)}`);
  }

  // tools/call with valid path param argument returns dry-run plan
  const dryRunCallResponse = await requestRpc(dryRunPort, {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'get_users_api_v1_users_id',
      arguments: { id: '42' }
    }
  });
  if (!dryRunCallResponse.result) {
    throw new Error(`Expected dry-run tools/call to succeed: ${JSON.stringify(dryRunCallResponse)}`);
  }
  if (dryRunCallResponse.result.executed !== false) {
    throw new Error(`Expected executed:false in dry-run response: ${JSON.stringify(dryRunCallResponse.result)}`);
  }
  if (!dryRunCallResponse.result.dry_run_plan) {
    throw new Error(`Expected dry_run_plan in dry-run response: ${JSON.stringify(dryRunCallResponse.result)}`);
  }
  if (dryRunCallResponse.result.dry_run_plan.path !== '/api/v1/users/42') {
    throw new Error(`Expected path param substitution /api/v1/users/42, got ${dryRunCallResponse.result.dry_run_plan.path}`);
  }
  if (dryRunCallResponse.result.dry_run_plan.method !== 'GET') {
    throw new Error(`Expected method=GET in dry_run_plan: ${JSON.stringify(dryRunCallResponse.result.dry_run_plan)}`);
  }
  if (!dryRunCallResponse.result.dry_run_plan.plan_hash || !/^[a-f0-9]{64}$/.test(dryRunCallResponse.result.dry_run_plan.plan_hash)) {
    throw new Error(`Expected plan_hash to be a 64-char SHA-256 hex: ${JSON.stringify(dryRunCallResponse.result.dry_run_plan)}`);
  }
  if (!dryRunCallResponse.result.policy || dryRunCallResponse.result.policy.mode !== 'dry-run') {
    throw new Error(`Expected policy echo in dry-run response: ${JSON.stringify(dryRunCallResponse.result)}`);
  }
  if (dryRunCallResponse.result.policy.reviewer !== 'ops@example.com') {
    throw new Error(`Expected policy.reviewer echo: ${JSON.stringify(dryRunCallResponse.result.policy)}`);
  }
  if (dryRunCallResponse.result.dry_run_plan.path_params.id !== '42') {
    throw new Error(`Expected path_params.id='42': ${JSON.stringify(dryRunCallResponse.result.dry_run_plan)}`);
  }

  // REQ-061: plan_hash determinism — same arguments produce same hash
  const dryRunCallResponse2 = await requestRpc(dryRunPort, {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'get_users_api_v1_users_id',
      arguments: { id: '42' }
    }
  });
  if (dryRunCallResponse2.result.dry_run_plan.plan_hash !== dryRunCallResponse.result.dry_run_plan.plan_hash) {
    throw new Error(`Expected plan_hash to be deterministic for identical inputs: got ${dryRunCallResponse.result.dry_run_plan.plan_hash} vs ${dryRunCallResponse2.result.dry_run_plan.plan_hash}`);
  }

  // Different argument value must produce a different hash
  const dryRunCallResponse3 = await requestRpc(dryRunPort, {
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'get_users_api_v1_users_id',
      arguments: { id: '99' }
    }
  });
  if (dryRunCallResponse3.result.dry_run_plan.plan_hash === dryRunCallResponse.result.dry_run_plan.plan_hash) {
    throw new Error(`Expected different plan_hash for different arguments`);
  }

  // REQ-062: validation failure — missing required argument returns -32602 with validation_errors
  const validationFailResponse = await requestRpc(dryRunPort, {
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: {
      name: 'get_users_api_v1_users_id',
      arguments: {}
    }
  });
  if (!validationFailResponse.error || validationFailResponse.error.code !== -32602) {
    throw new Error(`Expected -32602 for missing required argument: ${JSON.stringify(validationFailResponse)}`);
  }
  if (!validationFailResponse.error.data || !Array.isArray(validationFailResponse.error.data.validation_errors)) {
    throw new Error(`Expected data.validation_errors array: ${JSON.stringify(validationFailResponse.error)}`);
  }
  const idError = validationFailResponse.error.data.validation_errors.find((e) => e.path === '/id');
  if (!idError || idError.reason !== 'required field missing') {
    throw new Error(`Expected validation_errors entry for /id: ${JSON.stringify(validationFailResponse.error.data.validation_errors)}`);
  }

  // REQ-063: allowed_capabilities filter — capability not in list returns -32602
  const allowedPolicyPath = path.join(expressProject, '.tusq', 'allowed-policy.json');
  await fs.writeFile(allowedPolicyPath, JSON.stringify({
    schema_version: '1.0',
    mode: 'dry-run',
    allowed_capabilities: ['get_users_users'],
    reviewer: 'ops@example.com',
    approved_at: '2026-04-22T05:20:21Z'
  }, null, 2), 'utf8');

  const allowedPort = 32173;
  const allowedProc = spawn('node', [cli, 'serve', '--port', String(allowedPort), '--policy', allowedPolicyPath], {
    cwd: expressProject,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await waitForReady(allowedProc);

  const notPermittedResponse = await requestRpc(allowedPort, {
    jsonrpc: '2.0',
    id: 6,
    method: 'tools/call',
    params: {
      name: 'get_users_api_v1_users_id',
      arguments: { id: '42' }
    }
  });
  if (!notPermittedResponse.error || notPermittedResponse.error.code !== -32602) {
    throw new Error(`Expected -32602 for capability not in allowed_capabilities: ${JSON.stringify(notPermittedResponse)}`);
  }
  if (!notPermittedResponse.error.data || notPermittedResponse.error.data.reason !== 'capability not permitted under current policy') {
    throw new Error(`Expected data.reason for not-permitted capability: ${JSON.stringify(notPermittedResponse.error)}`);
  }

  // Permitted capability still works under allowed policy
  const permittedResponse = await requestRpc(allowedPort, {
    jsonrpc: '2.0',
    id: 7,
    method: 'tools/call',
    params: {
      name: 'get_users_users',
      arguments: {}
    }
  });
  if (!permittedResponse.result || permittedResponse.result.executed !== false) {
    throw new Error(`Expected dry-run plan for permitted capability: ${JSON.stringify(permittedResponse)}`);
  }

  const allowedStop = new Promise((resolve, reject) => {
    allowedProc.on('exit', (code) => { if (code === 0) resolve(); else reject(new Error(`serve exited with code ${code}`)); });
  });
  allowedProc.kill('SIGINT');
  await allowedStop;

  const dryRunStop = new Promise((resolve, reject) => {
    dryRunProc.on('exit', (code) => { if (code === 0) resolve(); else reject(new Error(`serve exited with code ${code}`)); });
  });
  dryRunProc.kill('SIGINT');
  await dryRunStop;

  // ─── M21: tusq policy init ────────────────────────────────────────────────

  // REQ-064: help surface is reachable
  const policyHelpResult = runCli(['policy', 'init', '--help'], { cwd: expressProject });
  if (!policyHelpResult.stdout.includes('tusq policy init')) {
    throw new Error(`Expected policy init usage in help: ${policyHelpResult.stdout}`);
  }

  // REQ-064: default generation — file written with schema_version, mode:describe-only, reviewer
  const defaultPolicyOut = path.join(expressProject, '.tusq', 'generated-default-policy.json');
  if (await fs.access(defaultPolicyOut).then(() => true).catch(() => false)) {
    await fs.unlink(defaultPolicyOut);
  }
  const defaultGenResult = runCli(['policy', 'init', '--out', defaultPolicyOut], { cwd: expressProject });
  if (!defaultGenResult.stdout.includes('Policy file written:')) {
    throw new Error(`Expected 'Policy file written:' in output: ${defaultGenResult.stdout}`);
  }
  const defaultGenPolicy = await readJson(defaultPolicyOut);
  if (defaultGenPolicy.schema_version !== '1.0') {
    throw new Error(`Expected schema_version:'1.0', got ${defaultGenPolicy.schema_version}`);
  }
  if (defaultGenPolicy.mode !== 'describe-only') {
    throw new Error(`Expected mode:'describe-only' by default, got ${defaultGenPolicy.mode}`);
  }
  if (!defaultGenPolicy.reviewer || typeof defaultGenPolicy.reviewer !== 'string') {
    throw new Error(`Expected non-empty reviewer string, got ${JSON.stringify(defaultGenPolicy.reviewer)}`);
  }
  if (!defaultGenPolicy.approved_at || !/^\d{4}-\d{2}-\d{2}T/.test(defaultGenPolicy.approved_at)) {
    throw new Error(`Expected ISO-8601 approved_at, got ${defaultGenPolicy.approved_at}`);
  }
  if ('allowed_capabilities' in defaultGenPolicy) {
    throw new Error('Expected no allowed_capabilities in default policy');
  }

  // REQ-065: --mode dry-run sets mode field
  const dryRunGenOut = path.join(expressProject, '.tusq', 'generated-dryrun-policy.json');
  runCli(['policy', 'init', '--mode', 'dry-run', '--out', dryRunGenOut], { cwd: expressProject });
  const dryRunGenPolicy = await readJson(dryRunGenOut);
  if (dryRunGenPolicy.mode !== 'dry-run') {
    throw new Error(`Expected mode:'dry-run', got ${dryRunGenPolicy.mode}`);
  }

  // REQ-065: --allowed-capabilities a,b produces exact array
  const allowedCapGenOut = path.join(expressProject, '.tusq', 'generated-allowed-policy.json');
  runCli(['policy', 'init', '--mode', 'dry-run', '--allowed-capabilities', 'get_users_users,post_users_users', '--out', allowedCapGenOut], { cwd: expressProject });
  const allowedCapGenPolicy = await readJson(allowedCapGenOut);
  if (JSON.stringify(allowedCapGenPolicy.allowed_capabilities) !== JSON.stringify(['get_users_users', 'post_users_users'])) {
    throw new Error(`Expected allowed_capabilities=['get_users_users','post_users_users'], got ${JSON.stringify(allowedCapGenPolicy.allowed_capabilities)}`);
  }

  // REQ-066: exit-1 on pre-existing file without --force
  const preExistingPolicyOut = path.join(expressProject, '.tusq', 'generated-force-policy.json');
  runCli(['policy', 'init', '--out', preExistingPolicyOut], { cwd: expressProject });
  const noForceResult = runCli(['policy', 'init', '--out', preExistingPolicyOut], { cwd: expressProject, expectedStatus: 1 });
  if (!noForceResult.stderr.includes('Policy file already exists:') || !noForceResult.stderr.includes('--force')) {
    throw new Error(`Expected 'Policy file already exists:' and '--force' in stderr: ${noForceResult.stderr}`);
  }

  // REQ-066: --force overwrites without error
  runCli(['policy', 'init', '--out', preExistingPolicyOut, '--force'], { cwd: expressProject });
  const forcedPolicy = await readJson(preExistingPolicyOut);
  if (forcedPolicy.schema_version !== '1.0') {
    throw new Error(`Expected valid overwritten policy: ${JSON.stringify(forcedPolicy)}`);
  }

  // REQ-067: --dry-run prints to stdout, does NOT write target file
  const dryRunNoWriteOut = path.join(expressProject, '.tusq', 'should-not-exist-policy.json');
  if (await fs.access(dryRunNoWriteOut).then(() => true).catch(() => false)) {
    await fs.unlink(dryRunNoWriteOut);
  }
  const dryRunNoWriteResult = runCli(['policy', 'init', '--dry-run', '--out', dryRunNoWriteOut], { cwd: expressProject });
  let dryRunNoWriteParsed;
  try {
    dryRunNoWriteParsed = JSON.parse(dryRunNoWriteResult.stdout);
  } catch (e) {
    throw new Error(`Expected valid JSON on stdout from --dry-run: ${dryRunNoWriteResult.stdout}`);
  }
  if (dryRunNoWriteParsed.schema_version !== '1.0') {
    throw new Error(`Expected schema_version:'1.0' in --dry-run stdout: ${dryRunNoWriteResult.stdout}`);
  }
  if (await fs.access(dryRunNoWriteOut).then(() => true).catch(() => false)) {
    throw new Error(`Expected --dry-run to NOT create file at ${dryRunNoWriteOut}`);
  }

  // REQ-065: unknown --mode exits 1 with actionable message
  const badModeGenResult = runCli(['policy', 'init', '--mode', 'live-fire', '--out', '/tmp/bad.json'], { cwd: expressProject, expectedStatus: 1 });
  if (!badModeGenResult.stderr.includes('Unknown policy mode: live-fire')) {
    throw new Error(`Expected 'Unknown policy mode:' message: ${badModeGenResult.stderr}`);
  }

  // REQ-065: empty --allowed-capabilities exits 1
  const emptyCapResult = runCli(['policy', 'init', '--allowed-capabilities', ',', '--out', '/tmp/bad2.json'], { cwd: expressProject, expectedStatus: 1 });
  if (!emptyCapResult.stderr.includes('Invalid allowed-capabilities:')) {
    throw new Error(`Expected 'Invalid allowed-capabilities:' message: ${emptyCapResult.stderr}`);
  }

  // REQ-068: round-trip — generated dry-run policy passes loadAndValidatePolicy (tusq serve --policy starts successfully)
  const roundTripPolicyOut = path.join(expressProject, '.tusq', 'round-trip-policy.json');
  runCli(['policy', 'init', '--mode', 'dry-run', '--reviewer', 'smoke@test.local', '--out', roundTripPolicyOut, '--force'], { cwd: expressProject });
  const roundTripProc = spawn('node', [cli, 'serve', '--port', '32175', '--policy', roundTripPolicyOut], {
    cwd: expressProject,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await waitForReady(roundTripProc);
  const roundTripStop = new Promise((resolve, reject) => {
    roundTripProc.on('exit', (code) => { if (code === 0) resolve(); else reject(new Error(`round-trip serve exited with code ${code}`)); });
  });
  roundTripProc.kill('SIGINT');
  await roundTripStop;

  // ─── M22: tusq policy verify ─────────────────────────────────────────────

  // REQ-070: help surface is reachable
  const policyVerifyHelpResult = runCli(['policy', 'verify', '--help'], { cwd: expressProject });
  if (!policyVerifyHelpResult.stdout.includes('tusq policy verify')) {
    throw new Error(`Expected policy verify usage in help: ${policyVerifyHelpResult.stdout}`);
  }

  // REQ-070: round-trip init → verify (success path, exit 0)
  const verifyTargetPath = path.join(expressProject, '.tusq', 'verify-target-policy.json');
  runCli(['policy', 'init', '--mode', 'dry-run', '--reviewer', 'smoke-verify@test.local', '--out', verifyTargetPath, '--force'], { cwd: expressProject });
  const verifySuccessResult = runCli(['policy', 'verify', '--policy', verifyTargetPath], { cwd: expressProject });
  if (!verifySuccessResult.stdout.includes('Policy valid:')) {
    throw new Error(`Expected 'Policy valid:' in stdout on success: ${verifySuccessResult.stdout}`);
  }
  if (!verifySuccessResult.stdout.includes('mode: dry-run')) {
    throw new Error(`Expected mode:dry-run in success summary: ${verifySuccessResult.stdout}`);
  }

  // REQ-071: --json success shape: {valid:true, path, policy{schema_version,mode,reviewer,approved_at,allowed_capabilities}}
  const verifyJsonSuccessResult = runCli(['policy', 'verify', '--policy', verifyTargetPath, '--json'], { cwd: expressProject });
  let verifyJsonSuccess;
  try {
    verifyJsonSuccess = JSON.parse(verifyJsonSuccessResult.stdout);
  } catch (e) {
    throw new Error(`Expected valid JSON from --json success: ${verifyJsonSuccessResult.stdout}`);
  }
  if (verifyJsonSuccess.valid !== true) {
    throw new Error(`Expected valid:true in JSON success: ${JSON.stringify(verifyJsonSuccess)}`);
  }
  if (verifyJsonSuccess.path !== verifyTargetPath) {
    throw new Error(`Expected path to match in JSON success: ${verifyJsonSuccess.path}`);
  }
  if (!verifyJsonSuccess.policy || verifyJsonSuccess.policy.schema_version !== '1.0') {
    throw new Error(`Expected policy.schema_version:'1.0' in JSON success: ${JSON.stringify(verifyJsonSuccess)}`);
  }
  if (verifyJsonSuccess.policy.mode !== 'dry-run') {
    throw new Error(`Expected policy.mode:'dry-run' in JSON success: ${JSON.stringify(verifyJsonSuccess)}`);
  }
  if (verifyJsonSuccess.policy.reviewer !== 'smoke-verify@test.local') {
    throw new Error(`Expected policy.reviewer in JSON success: ${JSON.stringify(verifyJsonSuccess)}`);
  }

  // REQ-072: exit-1 on missing file
  const missingPolicyPath = path.join(expressProject, '.tusq', 'does-not-exist-policy.json');
  const missingResult = runCli(['policy', 'verify', '--policy', missingPolicyPath], { cwd: expressProject, expectedStatus: 1 });
  if (!missingResult.stderr.includes('Policy file not found:')) {
    throw new Error(`Expected 'Policy file not found:' in stderr: ${missingResult.stderr}`);
  }

  // REQ-072: --json failure shape: {valid:false, path, error}
  const missingJsonResult = runCli(['policy', 'verify', '--policy', missingPolicyPath, '--json'], { cwd: expressProject, expectedStatus: 1 });
  let missingJsonParsed;
  try {
    missingJsonParsed = JSON.parse(missingJsonResult.stdout);
  } catch (e) {
    throw new Error(`Expected valid JSON from --json failure: ${missingJsonResult.stdout}`);
  }
  if (missingJsonParsed.valid !== false) {
    throw new Error(`Expected valid:false in JSON failure: ${JSON.stringify(missingJsonParsed)}`);
  }
  if (!missingJsonParsed.error || !missingJsonParsed.error.includes('Policy file not found:')) {
    throw new Error(`Expected 'Policy file not found:' in JSON error field: ${JSON.stringify(missingJsonParsed)}`);
  }

  // REQ-073: exit-1 on malformed JSON — write a bad file then verify
  const m22BadJsonPolicyPath = path.join(expressProject, '.tusq', 'v22-bad-json-policy.json');
  await fs.writeFile(m22BadJsonPolicyPath, '{not valid json', 'utf8');
  const badJsonVerifyResult = runCli(['policy', 'verify', '--policy', m22BadJsonPolicyPath], { cwd: expressProject, expectedStatus: 1 });
  if (!badJsonVerifyResult.stderr.includes('Invalid policy JSON at:')) {
    throw new Error(`Expected 'Invalid policy JSON at:' in stderr: ${badJsonVerifyResult.stderr}`);
  }

  // REQ-073: exit-1 on unsupported schema_version
  const m22BadVersionPolicyPath = path.join(expressProject, '.tusq', 'v22-bad-version-policy.json');
  await fs.writeFile(m22BadVersionPolicyPath, JSON.stringify({ schema_version: '9.9', mode: 'describe-only', reviewer: 'x', approved_at: '2026-01-01T00:00:00Z' }, null, 2), 'utf8');
  const badVersionVerifyResult = runCli(['policy', 'verify', '--policy', m22BadVersionPolicyPath], { cwd: expressProject, expectedStatus: 1 });
  if (!badVersionVerifyResult.stderr.includes('Unsupported policy schema_version:')) {
    throw new Error(`Expected 'Unsupported policy schema_version:' in stderr: ${badVersionVerifyResult.stderr}`);
  }

  // REQ-073: exit-1 on unknown mode
  const m22BadModePolicyPath = path.join(expressProject, '.tusq', 'v22-bad-mode-policy.json');
  await fs.writeFile(m22BadModePolicyPath, JSON.stringify({ schema_version: '1.0', mode: 'live-fire', reviewer: 'x', approved_at: '2026-01-01T00:00:00Z' }, null, 2), 'utf8');
  const badModeVerifyResult = runCli(['policy', 'verify', '--policy', m22BadModePolicyPath], { cwd: expressProject, expectedStatus: 1 });
  if (!badModeVerifyResult.stderr.includes('Unknown policy mode:')) {
    throw new Error(`Expected 'Unknown policy mode:' in stderr: ${badModeVerifyResult.stderr}`);
  }

  // REQ-073: exit-1 on non-array allowed_capabilities
  const m22BadCapPolicyPath = path.join(expressProject, '.tusq', 'v22-bad-cap-policy.json');
  await fs.writeFile(m22BadCapPolicyPath, JSON.stringify({ schema_version: '1.0', mode: 'dry-run', reviewer: 'x', approved_at: '2026-01-01T00:00:00Z', allowed_capabilities: 'not-an-array' }, null, 2), 'utf8');
  const badCapVerifyResult = runCli(['policy', 'verify', '--policy', m22BadCapPolicyPath], { cwd: expressProject, expectedStatus: 1 });
  if (!badCapVerifyResult.stderr.includes('Invalid allowed_capabilities in policy:')) {
    throw new Error(`Expected 'Invalid allowed_capabilities in policy:' in stderr: ${badCapVerifyResult.stderr}`);
  }

  // REQ-074: parity — every failure fixture exits 1 under BOTH tusq policy verify and tusq serve --policy with identical messages
  const parityFixtures = [
    { path: m22BadJsonPolicyPath, expectedMsg: 'Invalid policy JSON at:' },
    { path: m22BadVersionPolicyPath, expectedMsg: 'Unsupported policy schema_version:' },
    { path: m22BadModePolicyPath, expectedMsg: 'Unknown policy mode:' },
    { path: m22BadCapPolicyPath, expectedMsg: 'Invalid allowed_capabilities in policy:' }
  ];
  for (const fixture of parityFixtures) {
    const verifyR = runCli(['policy', 'verify', '--policy', fixture.path], { cwd: expressProject, expectedStatus: 1 });
    const serveR = runCli(['serve', '--port', '39999', '--policy', fixture.path], { cwd: expressProject, expectedStatus: 1 });
    if (!verifyR.stderr.includes(fixture.expectedMsg)) {
      throw new Error(`Parity check: verify missing '${fixture.expectedMsg}' in stderr: ${verifyR.stderr}`);
    }
    if (!serveR.stderr.includes(fixture.expectedMsg)) {
      throw new Error(`Parity check: serve missing '${fixture.expectedMsg}' in stderr: ${serveR.stderr}`);
    }
    if (verifyR.stderr.trim() !== serveR.stderr.trim()) {
      throw new Error(`Parity check: verify and serve stderr differ for ${fixture.path}:\nverify: ${verifyR.stderr}\nserve:  ${serveR.stderr}`);
    }
  }

  // ─── M23: tusq policy verify --strict (manifest-aware) ──────────────────────

  // Build strict-mode fixtures in a temp subdir
  const m23TmpDir = path.join(os.tmpdir(), `tusq-m23-smoke-${Date.now()}`);
  await fs.mkdir(path.join(m23TmpDir, '.tusq'), { recursive: true });

  // Minimal manifest with three capabilities:
  //   cap_approved     : approved: true,  review_needed: false  → strict PASS
  //   cap_unapproved   : approved: false, review_needed: false  → strict FAIL (not_approved)
  //   cap_needs_review : approved: true,  review_needed: true   → strict FAIL (requires_review)
  const m23ManifestContent = JSON.stringify({
    schema_version: '1.0',
    manifest_version: 3,
    capabilities: [
      { name: 'cap_approved',     approved: true,  review_needed: false },
      { name: 'cap_unapproved',   approved: false, review_needed: false },
      { name: 'cap_needs_review', approved: true,  review_needed: true  }
    ]
  }, null, 2);
  const m23ManifestPath = path.join(m23TmpDir, 'tusq.manifest.json');
  await fs.writeFile(m23ManifestPath, m23ManifestContent, 'utf8');

  const m23BasePolicy = { schema_version: '1.0', mode: 'describe-only', reviewer: 'ci@example.com', approved_at: '2026-01-01T00:00:00Z' };

  const m23PassPolicyPath = path.join(m23TmpDir, '.tusq', 'm23-pass-policy.json');
  await fs.writeFile(m23PassPolicyPath, JSON.stringify({ ...m23BasePolicy, allowed_capabilities: ['cap_approved'] }, null, 2), 'utf8');

  const m23MissingCapPolicyPath = path.join(m23TmpDir, '.tusq', 'm23-missing-cap-policy.json');
  await fs.writeFile(m23MissingCapPolicyPath, JSON.stringify({ ...m23BasePolicy, allowed_capabilities: ['cap_does_not_exist'] }, null, 2), 'utf8');

  const m23UnapprovedCapPolicyPath = path.join(m23TmpDir, '.tusq', 'm23-unapproved-cap-policy.json');
  await fs.writeFile(m23UnapprovedCapPolicyPath, JSON.stringify({ ...m23BasePolicy, allowed_capabilities: ['cap_unapproved'] }, null, 2), 'utf8');

  const m23ReviewCapPolicyPath = path.join(m23TmpDir, '.tusq', 'm23-review-cap-policy.json');
  await fs.writeFile(m23ReviewCapPolicyPath, JSON.stringify({ ...m23BasePolicy, allowed_capabilities: ['cap_needs_review'] }, null, 2), 'utf8');

  const m23UnsetCapPolicyPath = path.join(m23TmpDir, '.tusq', 'm23-unset-cap-policy.json');
  await fs.writeFile(m23UnsetCapPolicyPath, JSON.stringify(m23BasePolicy, null, 2), 'utf8');

  const m23BadManifestPath = path.join(m23TmpDir, 'tusq.manifest.bad.json');
  await fs.writeFile(m23BadManifestPath, '{not: valid json', 'utf8');

  // (a) Default tusq policy verify (no --strict) must not read the manifest even when it exists
  const m23DefaultVerifyResult = runCli(
    ['policy', 'verify', '--policy', m23PassPolicyPath],
    { cwd: m23TmpDir, expectedStatus: 0 }
  );
  if (!m23DefaultVerifyResult.stdout.includes('Policy valid:')) {
    throw new Error(`M23(a): expected 'Policy valid:' in stdout (no --strict): ${m23DefaultVerifyResult.stdout}`);
  }
  if (m23DefaultVerifyResult.stdout.includes('strict') || m23DefaultVerifyResult.stdout.includes('manifest')) {
    throw new Error(`M23(a): default verify leaked manifest/strict output: ${m23DefaultVerifyResult.stdout}`);
  }

  // (b) --strict exit 0 on a policy whose allowed_capabilities are approved in the manifest
  const m23StrictPassResult = runCli(
    ['policy', 'verify', '--policy', m23PassPolicyPath, '--strict', '--manifest', m23ManifestPath],
    { cwd: m23TmpDir, expectedStatus: 0 }
  );
  if (!m23StrictPassResult.stdout.includes('Policy valid (strict):')) {
    throw new Error(`M23(b): expected 'Policy valid (strict):' in stdout: ${m23StrictPassResult.stdout}`);
  }

  // (c) --strict exit 1 when an allowed capability is absent from the manifest
  const m23MissingCapResult = runCli(
    ['policy', 'verify', '--policy', m23MissingCapPolicyPath, '--strict', '--manifest', m23ManifestPath],
    { cwd: m23TmpDir, expectedStatus: 1 }
  );
  if (!m23MissingCapResult.stderr.includes('Strict policy verify failed: allowed capability not found in manifest: cap_does_not_exist')) {
    throw new Error(`M23(c): expected not-found message in stderr: ${m23MissingCapResult.stderr}`);
  }

  // (d) --strict exit 1 when an allowed capability is present but not approved
  const m23UnapprovedResult = runCli(
    ['policy', 'verify', '--policy', m23UnapprovedCapPolicyPath, '--strict', '--manifest', m23ManifestPath],
    { cwd: m23TmpDir, expectedStatus: 1 }
  );
  if (!m23UnapprovedResult.stderr.includes('Strict policy verify failed: allowed capability not approved: cap_unapproved')) {
    throw new Error(`M23(d): expected not-approved message in stderr: ${m23UnapprovedResult.stderr}`);
  }

  // (e) --strict exit 1 when an allowed capability has review_needed: true
  const m23ReviewResult = runCli(
    ['policy', 'verify', '--policy', m23ReviewCapPolicyPath, '--strict', '--manifest', m23ManifestPath],
    { cwd: m23TmpDir, expectedStatus: 1 }
  );
  if (!m23ReviewResult.stderr.includes('Strict policy verify failed: allowed capability requires review: cap_needs_review')) {
    throw new Error(`M23(e): expected requires-review message in stderr: ${m23ReviewResult.stderr}`);
  }

  // (f) --strict exit 1 when the manifest file is missing
  const m23MissingManifestPath = path.join(m23TmpDir, 'nonexistent.manifest.json');
  const m23MissingManifestResult = runCli(
    ['policy', 'verify', '--policy', m23PassPolicyPath, '--strict', '--manifest', m23MissingManifestPath],
    { cwd: m23TmpDir, expectedStatus: 1 }
  );
  if (!m23MissingManifestResult.stderr.includes(`Manifest not found: ${m23MissingManifestPath}`)) {
    throw new Error(`M23(f): expected 'Manifest not found:' in stderr: ${m23MissingManifestResult.stderr}`);
  }

  // (g) --strict --json success shape
  const m23JsonSuccessResult = runCli(
    ['policy', 'verify', '--policy', m23PassPolicyPath, '--strict', '--manifest', m23ManifestPath, '--json'],
    { cwd: m23TmpDir, expectedStatus: 0 }
  );
  let m23JsonSuccess;
  try {
    m23JsonSuccess = JSON.parse(m23JsonSuccessResult.stdout);
  } catch {
    throw new Error(`M23(g): --strict --json success output is not valid JSON: ${m23JsonSuccessResult.stdout}`);
  }
  if (!m23JsonSuccess.valid || !m23JsonSuccess.strict || m23JsonSuccess.manifest_path !== m23ManifestPath
      || m23JsonSuccess.manifest_version !== 3 || m23JsonSuccess.approved_allowed_capabilities !== 1) {
    throw new Error(`M23(g): --strict --json success shape mismatch: ${JSON.stringify(m23JsonSuccess)}`);
  }

  // (g) --strict --json failure shape
  const m23JsonFailResult = runCli(
    ['policy', 'verify', '--policy', m23MissingCapPolicyPath, '--strict', '--manifest', m23ManifestPath, '--json'],
    { cwd: m23TmpDir, expectedStatus: 1 }
  );
  let m23JsonFail;
  try {
    m23JsonFail = JSON.parse(m23JsonFailResult.stdout);
  } catch {
    throw new Error(`M23(g): --strict --json failure output is not valid JSON: ${m23JsonFailResult.stdout}`);
  }
  if (m23JsonFail.valid !== false || !m23JsonFail.strict || !Array.isArray(m23JsonFail.strict_errors)
      || m23JsonFail.strict_errors.length !== 1 || m23JsonFail.strict_errors[0].reason !== 'not_in_manifest') {
    throw new Error(`M23(g): --strict --json failure shape mismatch: ${JSON.stringify(m23JsonFail)}`);
  }

  // (h) --strict with allowed_capabilities unset passes on a populated manifest
  const m23UnsetCapStrictResult = runCli(
    ['policy', 'verify', '--policy', m23UnsetCapPolicyPath, '--strict', '--manifest', m23ManifestPath],
    { cwd: m23TmpDir, expectedStatus: 0 }
  );
  if (!m23UnsetCapStrictResult.stdout.includes('Policy valid (strict):')) {
    throw new Error(`M23(h): expected 'Policy valid (strict):' for unset allowed_capabilities: ${m23UnsetCapStrictResult.stdout}`);
  }

  // (i) --strict exit 1 when manifest is malformed JSON
  const m23BadManifestResult = runCli(
    ['policy', 'verify', '--policy', m23PassPolicyPath, '--strict', '--manifest', m23BadManifestPath],
    { cwd: m23TmpDir, expectedStatus: 1 }
  );
  if (!m23BadManifestResult.stderr.includes(`Invalid manifest JSON at: ${m23BadManifestPath}`)) {
    throw new Error(`M23(i): expected 'Invalid manifest JSON at:' in stderr: ${m23BadManifestResult.stderr}`);
  }

  // (j) --manifest without --strict exits 1 with '--manifest requires --strict'
  const m23ManifestWithoutStrictResult = runCli(
    ['policy', 'verify', '--policy', m23PassPolicyPath, '--manifest', m23ManifestPath],
    { cwd: m23TmpDir, expectedStatus: 1 }
  );
  if (!m23ManifestWithoutStrictResult.stderr.includes('--manifest requires --strict')) {
    throw new Error(`M23(j): expected '--manifest requires --strict' in stderr: ${m23ManifestWithoutStrictResult.stderr}`);
  }

  // (k) M22 parity under --strict: every M22 failure fixture produces identical messages
  //     under 'tusq policy verify' and 'tusq policy verify --strict'
  const m22ParityWithStrictFixtures = [
    { path: m22BadJsonPolicyPath, expectedMsg: 'Invalid policy JSON at:' },
    { path: m22BadVersionPolicyPath, expectedMsg: 'Unsupported policy schema_version:' },
    { path: m22BadModePolicyPath, expectedMsg: 'Unknown policy mode:' },
    { path: m22BadCapPolicyPath, expectedMsg: 'Invalid allowed_capabilities in policy:' }
  ];
  for (const fixture of m22ParityWithStrictFixtures) {
    const withoutStrict = runCli(['policy', 'verify', '--policy', fixture.path], { cwd: expressProject, expectedStatus: 1 });
    const withStrict = runCli(
      ['policy', 'verify', '--policy', fixture.path, '--strict', '--manifest', m23ManifestPath],
      { cwd: expressProject, expectedStatus: 1 }
    );
    if (!withoutStrict.stderr.includes(fixture.expectedMsg)) {
      throw new Error(`M23(k): verify (no --strict) missing '${fixture.expectedMsg}': ${withoutStrict.stderr}`);
    }
    if (!withStrict.stderr.includes(fixture.expectedMsg)) {
      throw new Error(`M23(k): verify --strict missing '${fixture.expectedMsg}': ${withStrict.stderr}`);
    }
    if (withoutStrict.stderr.trim() !== withStrict.stderr.trim()) {
      throw new Error(`M23(k): M22 parity broken under --strict for ${fixture.path}:\nno-strict: ${withoutStrict.stderr}\n--strict:   ${withStrict.stderr}`);
    }
  }

  // Cleanup m23 temp dir
  await fs.rm(m23TmpDir, { recursive: true, force: true });

  console.log('Smoke tests passed');
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
