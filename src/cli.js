const fs = require('fs');
const http = require('http');
const path = require('path');
const crypto = require('crypto');

const VERSION = '0.1.0';
const SUPPORTED_FRAMEWORKS = ['express', 'fastify', 'nestjs'];
const SENSITIVITY_CLASSES = ['unknown', 'public', 'internal', 'confidential', 'restricted'];
const REDACTION_LOG_LEVELS = ['full', 'redacted', 'silent'];
const DOMAIN_PREFIX_SEGMENTS = new Set(['api', 'v1', 'v2', 'v3', 'v4', 'v5', 'rest', 'graphql', 'internal', 'public', 'external']);
const V1_DESCRIBE_ONLY_NOTE = 'Describe-only mode in V1. Live execution is deferred to V1.1.';

class CliError extends Error {
  constructor(message, exitCode) {
    super(message);
    this.exitCode = exitCode;
  }
}

function runCli(argv) {
  try {
    dispatch(argv);
  } catch (error) {
    if (error instanceof CliError) {
      if (error.message) {
        process.stderr.write(`${error.message}\n`);
      }
      process.exit(error.exitCode);
      return;
    }
    process.stderr.write(`Internal error: ${error.message}\n`);
    process.exit(2);
  }
}

function dispatch(argv) {
  if (argv.length === 0) {
    printHelp();
    return;
  }

  const command = argv[0];
  const args = argv.slice(1);

  if (command === 'help' || command === '--help' || command === '-h') {
    printHelp();
    return;
  }
  if (command === 'version' || command === '--version' || command === '-v') {
    process.stdout.write(`${VERSION}\n`);
    return;
  }

  switch (command) {
    case 'init':
      cmdInit(args);
      return;
    case 'scan':
      cmdScan(args);
      return;
    case 'manifest':
      cmdManifest(args);
      return;
    case 'compile':
      cmdCompile(args);
      return;
    case 'serve':
      cmdServe(args);
      return;
    case 'review':
      cmdReview(args);
      return;
    case 'docs':
      cmdDocs(args);
      return;
    case 'approve':
      cmdApprove(args);
      return;
    case 'diff':
      cmdDiff(args);
      return;
    case 'policy':
      cmdPolicy(args);
      return;
    default:
      printHelp();
      throw new CliError(`Unknown command: ${command}`, 1);
  }
}

function parseArgs(rawArgs, spec) {
  const opts = {};
  const positionals = [];

  for (let i = 0; i < rawArgs.length; i += 1) {
    const token = rawArgs[i];

    if (token === '--') {
      positionals.push(...rawArgs.slice(i + 1));
      break;
    }

    if (token === '--help' || token === '-h') {
      opts.help = true;
      continue;
    }

    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }

    const raw = token.slice(2);
    const eq = raw.indexOf('=');
    const key = eq === -1 ? raw : raw.slice(0, eq);
    let value = eq === -1 ? undefined : raw.slice(eq + 1);

    if (!Object.prototype.hasOwnProperty.call(spec, key)) {
      throw new CliError(`Invalid flag: --${key}`, 1);
    }

    if (spec[key] === 'boolean') {
      if (value !== undefined && value !== 'true' && value !== 'false') {
        throw new CliError(`Invalid boolean value for --${key}: ${value}`, 1);
      }
      opts[key] = value === undefined ? true : value === 'true';
      continue;
    }

    if (value === undefined) {
      const next = rawArgs[i + 1];
      if (!next || next.startsWith('--')) {
        throw new CliError(`Missing value for --${key}`, 1);
      }
      value = next;
      i += 1;
    }
    opts[key] = value;
  }

  return { opts, positionals };
}

function parseCommandArgs(command, rawArgs, spec) {
  const mergedSpec = Object.assign({}, spec);
  if (!Object.prototype.hasOwnProperty.call(mergedSpec, 'verbose')) {
    mergedSpec.verbose = 'boolean';
  }

  try {
    return parseArgs(rawArgs, mergedSpec);
  } catch (error) {
    if (error instanceof CliError && error.exitCode === 1) {
      printCommandHelp(command);
    }
    throw error;
  }
}

function cmdInit(args) {
  const { opts, positionals } = parseCommandArgs('init', args, {
    framework: 'value',
    verbose: 'boolean'
  });

  if (opts.help || positionals.length > 0) {
    printCommandHelp('init');
    return;
  }

  const root = process.cwd();
  const configPath = path.join(root, 'tusq.config.json');

  if (fs.existsSync(configPath)) {
    process.stderr.write('tusq.config.json already exists. Skipping initialization.\n');
    return;
  }

  let framework = opts.framework;
  const warnings = [];

  if (!framework) {
    const detected = detectFramework(root);
    framework = detected.framework || 'unknown';
    warnings.push(...detected.warnings);
  }

  if (framework !== 'unknown' && !SUPPORTED_FRAMEWORKS.includes(framework)) {
    throw new CliError(
      `Framework ${framework} not yet supported. Supported: Express, Fastify, NestJS.`,
      1
    );
  }

  const config = {
    version: 1,
    framework,
    scan: {
      include: ['**/*.js', '**/*.ts'],
      exclude: ['node_modules', '.git', '.tusq', 'dist', 'build', 'coverage']
    },
    output: {
      scan_file: '.tusq/scan.json',
      manifest_file: 'tusq.manifest.json',
      tools_dir: 'tusq-tools'
    }
  };

  writeJson(configPath, config);

  for (const warning of warnings) {
    process.stderr.write(`Warning: ${warning}\n`);
  }

  process.stdout.write(`Created ${configPath}\n`);
}

function cmdScan(args) {
  const { opts, positionals } = parseCommandArgs('scan', args, {
    framework: 'value',
    format: 'value',
    verbose: 'boolean'
  });

  if (opts.help) {
    printCommandHelp('scan');
    return;
  }

  if (positionals.length !== 1) {
    throw new CliError('Usage: tusq scan <path>', 1);
  }

  if (opts.format && opts.format !== 'json') {
    throw new CliError('Invalid --format value. Supported: json', 1);
  }

  const projectRoot = path.resolve(positionals[0]);
  const config = readProjectConfig(projectRoot);
  const warnings = [];

  let framework = opts.framework || config.framework;
  if (!framework || framework === 'unknown') {
    const detected = detectFramework(projectRoot);
    framework = detected.framework;
    warnings.push(...detected.warnings);
  }

  if (!framework || !SUPPORTED_FRAMEWORKS.includes(framework)) {
    throw new CliError(
      `Framework ${framework || 'unknown'} not yet supported. Supported: Express, Fastify, NestJS.`,
      1
    );
  }

  const files = collectSourceFiles(projectRoot, config.scan && config.scan.exclude);
  const routes = [];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relPath = path.relative(projectRoot, filePath);

    if (framework === 'express') {
      routes.push(...extractExpressRoutes(content, relPath));
    } else if (framework === 'fastify') {
      routes.push(...extractFastifyRoutes(content, relPath));
    } else if (framework === 'nestjs') {
      routes.push(...extractNestRoutes(content, relPath));
    }
  }

  if (routes.length === 0) {
    throw new CliError(`No API routes found in ${projectRoot}. Check framework detection.`, 1);
  }

  const scan = {
    generated_at: new Date().toISOString(),
    target_path: projectRoot,
    framework,
    warnings,
    route_count: routes.length,
    routes: routes.map((route) => finalizeRouteInference(route))
  };

  const scanPath = path.join(projectRoot, '.tusq', 'scan.json');
  fs.mkdirSync(path.dirname(scanPath), { recursive: true });
  writeJson(scanPath, scan);

  if (opts.format === 'json') {
    process.stdout.write(`${JSON.stringify(scan, null, 2)}\n`);
    return;
  }

  process.stdout.write(`Scanned ${projectRoot}\n`);
  process.stdout.write(`Framework: ${framework}\n`);
  process.stdout.write(`Routes discovered: ${routes.length}\n`);
  if (warnings.length > 0) {
    process.stderr.write(`${warnings.length} warning(s) emitted.\n`);
  }
}

function cmdManifest(args) {
  const { opts, positionals } = parseCommandArgs('manifest', args, {
    format: 'value',
    out: 'value'
  });

  if (opts.help) {
    printCommandHelp('manifest');
    return;
  }

  if (positionals.length > 0) {
    throw new CliError('Usage: tusq manifest [--out <path>] [--format json]', 1);
  }

  if (opts.format && opts.format !== 'json') {
    throw new CliError('Invalid --format value. Supported: json', 1);
  }

  const root = process.cwd();
  const config = readProjectConfig(root);
  const scanPath = path.resolve(root, config.output && config.output.scan_file ? config.output.scan_file : '.tusq/scan.json');

  if (!fs.existsSync(scanPath)) {
    throw new CliError('No scan data found. Run `tusq scan` first.', 1);
  }

  const scan = readJson(scanPath);
  const outPath = path.resolve(
    root,
    opts.out || (config.output && config.output.manifest_file) || 'tusq.manifest.json'
  );

  let existing = null;
  let previousManifestRaw = null;
  if (fs.existsSync(outPath)) {
    previousManifestRaw = fs.readFileSync(outPath, 'utf8');
    existing = readJson(outPath);
  }

  const approvalMap = new Map();
  const sensitivityMap = new Map();
  const examplesMap = new Map();
  const constraintsMap = new Map();
  const redactionMap = new Map();
  const approvedByMap = new Map();
  const approvedAtMap = new Map();
  if (existing && Array.isArray(existing.capabilities)) {
    for (const capability of existing.capabilities) {
      const key = capabilityKey(capability.method, capability.path);
      approvalMap.set(key, Boolean(capability.approved));
      sensitivityMap.set(key, normalizeSensitivityClass(capability.sensitivity_class));
      examplesMap.set(key, normalizeExamples(capability.examples));
      constraintsMap.set(key, normalizeConstraints(capability.constraints));
      redactionMap.set(key, normalizeRedaction(capability.redaction));
      approvedByMap.set(key, normalizeApprovedBy(capability.approved_by));
      approvedAtMap.set(key, normalizeApprovedAt(capability.approved_at));
    }
  }

  const capabilities = scan.routes.map((route) => {
    const method = route.method.toUpperCase();
    const key = capabilityKey(method, route.path);
    const confidence = route.confidence;
    const capability = {
      name: capabilityName(route),
      description: describeCapability(route),
      method,
      path: route.path,
      input_schema: route.input_schema,
      output_schema: route.output_schema,
      side_effect_class: classifySideEffect(method, route.path, route.handler),
      sensitivity_class: sensitivityMap.get(key) || classifySensitivity(method, route.path, route.handler, route.auth_hints),
      auth_hints: route.auth_hints,
      examples: examplesMap.has(key) ? examplesMap.get(key) : defaultExamples(),
      constraints: constraintsMap.has(key) ? constraintsMap.get(key) : defaultConstraints(),
      redaction: redactionMap.has(key) ? redactionMap.get(key) : defaultRedaction(),
      provenance: route.provenance,
      confidence,
      review_needed: confidence < 0.8,
      approved: approvalMap.get(key) || false,
      approved_by: approvedByMap.has(key) ? approvedByMap.get(key) : null,
      approved_at: approvedAtMap.has(key) ? approvedAtMap.get(key) : null,
      domain: route.domain
    };
    capability.capability_digest = computeCapabilityDigest(capability);
    return capability;
  });

  const previousManifestVersion = normalizeManifestVersion(existing && existing.manifest_version);
  const manifestVersion = previousManifestVersion === null ? 1 : previousManifestVersion + 1;
  const previousManifestHash = previousManifestRaw === null ? null : sha256Hex(previousManifestRaw);

  const manifest = {
    schema_version: '1.0',
    manifest_version: manifestVersion,
    previous_manifest_hash: previousManifestHash,
    generated_at: new Date().toISOString(),
    source_scan: path.relative(root, scanPath),
    capabilities
  };

  writeJson(outPath, manifest);

  if (opts.format === 'json') {
    process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
    return;
  }

  const approvedCount = capabilities.filter((c) => c.approved).length;
  process.stdout.write(`Wrote ${outPath}\n`);
  process.stdout.write(
    `Capabilities: ${capabilities.length} total, ${approvedCount} approved, ${capabilities.length - approvedCount} pending\n`
  );
}

function cmdCompile(args) {
  const { opts, positionals } = parseCommandArgs('compile', args, {
    out: 'value',
    'dry-run': 'boolean'
  });

  if (opts.help) {
    printCommandHelp('compile');
    return;
  }

  if (positionals.length > 0) {
    throw new CliError('Usage: tusq compile [--out <path>] [--dry-run]', 1);
  }

  const root = process.cwd();
  const config = readProjectConfig(root);
  const manifestPath = path.resolve(
    root,
    (config.output && config.output.manifest_file) || 'tusq.manifest.json'
  );

  if (!fs.existsSync(manifestPath)) {
    throw new CliError('No manifest found. Run `tusq manifest` first.', 1);
  }

  const manifest = readJson(manifestPath);
  const approved = (manifest.capabilities || []).filter((capability) => capability.approved);

  if (approved.length === 0) {
    process.stderr.write('No approved capabilities. Run `tusq review` to approve.\n');
    return;
  }

  const outDir = path.resolve(
    root,
    opts.out || (config.output && config.output.tools_dir) || 'tusq-tools'
  );

  const tools = approved.map((capability) => ({
    name: capability.name,
    description: capability.description,
    method: capability.method || null,
    path: capability.path || null,
    parameters: capability.input_schema || { type: 'object', additionalProperties: true },
    returns: capability.output_schema || { type: 'object', additionalProperties: true },
    side_effect_class: capability.side_effect_class,
    sensitivity_class: normalizeSensitivityClass(capability.sensitivity_class),
    auth_hints: capability.auth_hints || [],
    examples: normalizeExamples(capability.examples),
    constraints: normalizeConstraints(capability.constraints),
    redaction: normalizeRedaction(capability.redaction),
    provenance: capability.provenance
  }));

  if (opts['dry-run']) {
    process.stdout.write(`Dry run: ${tools.length} tool(s) would be generated.\n`);
    for (const tool of tools) {
      process.stdout.write(`- ${tool.name}\n`);
    }
    return;
  }

  fs.mkdirSync(outDir, { recursive: true });

  for (const tool of tools) {
    const fileName = `${sanitizeName(tool.name)}.json`;
    writeJson(path.join(outDir, fileName), tool);
  }

  writeJson(path.join(outDir, 'index.json'), {
    generated_at: new Date().toISOString(),
    tool_count: tools.length,
    tools: tools.map((tool) => tool.name)
  });

  process.stdout.write(`Compiled ${tools.length} tool(s) into ${outDir}\n`);
}

function cmdServe(args) {
  const { opts, positionals } = parseCommandArgs('serve', args, {
    port: 'value',
    policy: 'value'
  });

  if (opts.help) {
    printCommandHelp('serve');
    return;
  }

  if (positionals.length > 0) {
    throw new CliError('Usage: tusq serve [--port <n>] [--policy <path>] [--verbose]', 1);
  }

  const port = opts.port ? Number(opts.port) : 3100;
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new CliError('Invalid --port value.', 1);
  }

  const root = process.cwd();
  const config = readProjectConfig(root);
  const toolsDir = path.resolve(root, (config.output && config.output.tools_dir) || 'tusq-tools');

  const policy = opts.policy ? loadAndValidatePolicy(path.resolve(root, opts.policy)) : null;

  if (!fs.existsSync(toolsDir)) {
    const manifestPath = path.resolve(root, (config.output && config.output.manifest_file) || 'tusq.manifest.json');
    if (policy && !fs.existsSync(manifestPath)) {
      throw new CliError('Missing manifest: run `tusq manifest` first, then `tusq compile`.', 1);
    }
    throw new CliError('No compiled tools found. Run `tusq compile` first.', 1);
  }

  const toolFiles = fs.readdirSync(toolsDir)
    .filter((name) => name.endsWith('.json') && name !== 'index.json');

  const tools = new Map();
  for (const fileName of toolFiles) {
    const toolPath = path.join(toolsDir, fileName);
    const tool = readJson(toolPath);
    if (tool && tool.name) {
      tools.set(tool.name, tool);
    }
  }

  if (opts.verbose && policy) {
    process.stderr.write(`Policy loaded: mode=${policy.mode}${policy.allowed_capabilities ? `, allowed=${policy.allowed_capabilities.join(',')}` : ''}\n`);
  }

  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
      respondJson(res, 200, { ok: true, tool_count: tools.size });
      return;
    }

    if (req.method !== 'POST') {
      respondJson(res, 405, { error: 'Method not allowed' });
      return;
    }

    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      let payload;
      try {
        payload = body ? JSON.parse(body) : {};
      } catch (_error) {
        respondJson(res, 400, { error: 'Invalid JSON payload' });
        return;
      }

      const method = payload.method;
      const id = payload.id;
      process.stderr.write(`MCP call: ${method || 'unknown'}\n`);

      if (method === 'tools/list') {
        const result = {
          tools: Array.from(tools.values()).map((tool) => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
            returns: tool.returns,
            side_effect_class: tool.side_effect_class,
            sensitivity_class: normalizeSensitivityClass(tool.sensitivity_class),
            auth_hints: tool.auth_hints || []
          }))
        };
        respondRpcJson(res, id, result);
        return;
      }

      if (method === 'tools/call') {
        const params = payload.params || {};
        const tool = tools.get(params.name);
        if (!tool) {
          respondRpcJson(res, id, null, {
            code: -32602,
            message: `Unknown tool: ${params.name}`
          });
          return;
        }

        if (policy && policy.mode === 'dry-run') {
          if (policy.allowed_capabilities && !policy.allowed_capabilities.includes(params.name)) {
            respondRpcJson(res, id, null, {
              code: -32602,
              message: `Tool not permitted: ${params.name}`,
              data: { reason: 'capability not permitted under current policy' }
            });
            return;
          }

          const callArgs = params.arguments && typeof params.arguments === 'object' ? params.arguments : {};
          const validation = validateArguments(callArgs, tool.parameters);
          if (!validation.valid) {
            respondRpcJson(res, id, null, {
              code: -32602,
              message: `Invalid arguments for tool: ${params.name}`,
              data: { validation_errors: validation.errors }
            });
            return;
          }

          const rawPath = tool.path || '/';
          const resolvedPath = substitutePathParams(rawPath, callArgs, tool.parameters);
          const pathParams = extractPathParams(callArgs, tool.parameters);
          const bodyArgs = extractBodyArgs(callArgs, tool.parameters);
          const planFields = {
            method: tool.method || 'GET',
            path: resolvedPath,
            path_params: pathParams,
            query: {},
            body: Object.keys(bodyArgs).length > 0 ? bodyArgs : null,
            headers: { Accept: 'application/json' }
          };
          const planHash = computePlanHash(planFields);
          const authHints = tool.auth_hints || [];

          const dryRunResult = {
            name: tool.name,
            description: tool.description,
            executed: false,
            policy: {
              mode: policy.mode,
              reviewer: policy.reviewer || null,
              approved_at: policy.approved_at || null
            },
            dry_run_plan: {
              method: planFields.method,
              path: planFields.path,
              path_params: planFields.path_params,
              query: planFields.query,
              body: planFields.body,
              headers: planFields.headers,
              auth_context: { hints: authHints, required: authHints.length > 0 },
              side_effect_class: tool.side_effect_class,
              sensitivity_class: normalizeSensitivityClass(tool.sensitivity_class),
              redaction: normalizeRedaction(tool.redaction),
              plan_hash: planHash,
              evaluated_at: new Date().toISOString()
            },
            schema: {
              parameters: tool.parameters,
              returns: tool.returns
            }
          };
          respondRpcJson(res, id, dryRunResult);
          return;
        }

        const result = {
          name: tool.name,
          description: tool.description,
          schema: {
            parameters: tool.parameters,
            returns: tool.returns
          },
          side_effect_class: tool.side_effect_class,
          sensitivity_class: normalizeSensitivityClass(tool.sensitivity_class),
          auth_hints: tool.auth_hints || [],
          examples: normalizeExamples(tool.examples),
          constraints: normalizeConstraints(tool.constraints),
          redaction: normalizeRedaction(tool.redaction)
        };
        respondRpcJson(res, id, result);
        return;
      }

      respondRpcJson(res, id, null, {
        code: -32601,
        message: `Method not found: ${method}`
      });
    });
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      process.stderr.write(`Port ${port} already in use.\n`);
      process.exit(1);
      return;
    }

    process.stderr.write(`Internal error: ${error.message}\n`);
    process.exit(2);
  });

  server.listen(port, '127.0.0.1', () => {
    const modeLabel = policy && policy.mode === 'dry-run' ? 'dry-run policy' : 'describe-only';
    process.stdout.write(`MCP ${modeLabel} server listening on http://127.0.0.1:${port}\n`);
  });

  process.on('SIGINT', () => {
    server.close(() => {
      process.stdout.write('Server stopped.\n');
      process.exit(0);
    });
  });
}

function cmdReview(args) {
  const { opts, positionals } = parseCommandArgs('review', args, {
    format: 'value',
    strict: 'boolean'
  });

  if (opts.help) {
    printCommandHelp('review');
    return;
  }

  if (positionals.length > 0) {
    throw new CliError('Usage: tusq review [--format json] [--strict]', 1);
  }

  if (opts.format && opts.format !== 'json') {
    throw new CliError('Invalid --format value. Supported: json', 1);
  }

  const root = process.cwd();
  const config = readProjectConfig(root);
  const manifestPath = path.resolve(
    root,
    (config.output && config.output.manifest_file) || 'tusq.manifest.json'
  );

  if (!fs.existsSync(manifestPath)) {
    throw new CliError('No manifest found. Run `tusq manifest` first.', 1);
  }

  const manifest = readJson(manifestPath);
  const reviewStats = getReviewStats(manifest);

  if (opts.format === 'json') {
    process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
    enforceStrictReviewIfRequested(opts.strict, reviewStats);
    return;
  }

  const grouped = new Map();
  for (const capability of manifest.capabilities || []) {
    const domain = capability.domain || 'general';
    if (!grouped.has(domain)) {
      grouped.set(domain, []);
    }
    grouped.get(domain).push(capability);
  }

  process.stdout.write(`Capability review for ${manifestPath}\n`);

  for (const [domain, capabilities] of grouped.entries()) {
    process.stdout.write(`\n[${domain}]\n`);
    for (const capability of capabilities) {
      const approved = capability.approved ? 'x' : ' ';
      const lowFlag = capability.review_needed ? ' LOW_CONFIDENCE' : '';
      const inputSummary = summarizeInputSchemaForReview(capability.input_schema);
      const outputSummary = summarizeOutputSchemaForReview(capability.output_schema);
      const provenanceSummary = summarizeProvenanceForReview(capability.provenance);
      process.stdout.write(
        `- [${approved}] ${capability.name} (${capability.method} ${capability.path}) confidence=${capability.confidence}${lowFlag} inputs=${inputSummary} returns=${outputSummary} source=${provenanceSummary}\n`
      );
    }
  }

  process.stdout.write(`\nSummary: ${reviewStats.total} total, ${reviewStats.unapproved} unapproved, ${reviewStats.lowConfidence} low confidence.\n`);
  process.stdout.write('Approve capabilities by editing tusq.manifest.json and setting approved=true.\n');
  enforceStrictReviewIfRequested(opts.strict, reviewStats);
}

function cmdDocs(args) {
  const { opts, positionals } = parseCommandArgs('docs', args, {
    manifest: 'value',
    out: 'value'
  });

  if (opts.help) {
    printCommandHelp('docs');
    return;
  }

  if (positionals.length > 0) {
    throw new CliError('Usage: tusq docs [--manifest <path>] [--out <path>]', 1);
  }

  const root = process.cwd();
  const config = readOptionalProjectConfig(root);
  const manifestPath = path.resolve(
    root,
    opts.manifest || (config.output && config.output.manifest_file) || 'tusq.manifest.json'
  );

  const manifest = readManifestForDocs(manifestPath);
  const markdown = renderCapabilityDocs(manifest, manifestPath);

  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, markdown, 'utf8');
    process.stdout.write(`Wrote ${outPath}\n`);
    return;
  }

  process.stdout.write(markdown);
}

function cmdApprove(args) {
  const { opts, positionals } = parseCommandArgs('approve', args, {
    all: 'boolean',
    reviewer: 'value',
    manifest: 'value',
    'dry-run': 'boolean',
    json: 'boolean'
  });

  if (opts.help) {
    printCommandHelp('approve');
    return;
  }

  if (positionals.length > 1) {
    throw new CliError('Usage: tusq approve [capability-name] [--all] [--reviewer <id>] [--manifest <path>] [--dry-run] [--json]', 1);
  }

  if (opts.all && positionals.length > 0) {
    throw new CliError('Use either a capability name or --all, not both.', 1);
  }

  if (!opts.all && positionals.length === 0) {
    throw new CliError('Pass a capability name or --all.', 1);
  }

  const root = process.cwd();
  const config = readProjectConfig(root);
  const manifestPath = path.resolve(
    root,
    opts.manifest || (config.output && config.output.manifest_file) || 'tusq.manifest.json'
  );

  if (!fs.existsSync(manifestPath)) {
    throw new CliError('No manifest found. Run `tusq manifest` first.', 1);
  }

  const manifest = readJson(manifestPath);
  const capabilities = Array.isArray(manifest.capabilities) ? manifest.capabilities : [];
  const reviewer = normalizeReviewer(opts.reviewer || process.env.TUSQ_REVIEWER || process.env.USER || process.env.LOGNAME);
  const approvedAt = new Date().toISOString();
  const dryRun = Boolean(opts['dry-run']);
  const targetName = positionals[0];
  const selected = opts.all
    ? capabilities.filter((capability) => capability.approved !== true || capability.review_needed === true)
    : capabilities.filter((capability) => capability.name === targetName);

  if (!opts.all && selected.length === 0) {
    throw new CliError(`Capability not found: ${targetName}`, 1);
  }

  const approvals = selected.map((capability) => ({
    name: capability.name,
    method: capability.method || null,
    path: capability.path || null,
    previously_approved: capability.approved === true,
    previously_review_needed: capability.review_needed === true
  }));

  if (!dryRun) {
    for (const capability of selected) {
      capability.approved = true;
      capability.review_needed = false;
      capability.approved_by = reviewer;
      capability.approved_at = approvedAt;
    }
    writeJson(manifestPath, manifest);
  }

  const payload = {
    manifest: manifestPath,
    dry_run: dryRun,
    reviewer,
    approved_at: dryRun ? null : approvedAt,
    approved_count: approvals.length,
    approvals
  };

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }

  if (approvals.length === 0) {
    process.stdout.write(`No capabilities required approval in ${manifestPath}.\n`);
    return;
  }

  process.stdout.write(`${dryRun ? 'Would approve' : 'Approved'} ${approvals.length} capability(s) in ${manifestPath}\n`);
  process.stdout.write(`Reviewer: ${reviewer}\n`);
  for (const approval of approvals) {
    process.stdout.write(`- ${approval.name}`);
    if (approval.method && approval.path) {
      process.stdout.write(` (${approval.method} ${approval.path})`);
    }
    process.stdout.write('\n');
  }
}

function cmdDiff(args) {
  const { opts, positionals } = parseCommandArgs('diff', args, {
    from: 'value',
    to: 'value',
    json: 'boolean',
    'review-queue': 'boolean',
    'fail-on-unapproved-changes': 'boolean'
  });

  if (opts.help) {
    printCommandHelp('diff');
    return;
  }

  if (positionals.length > 0) {
    throw new CliError('Usage: tusq diff [--from <path>] [--to <path>] [--json] [--review-queue] [--fail-on-unapproved-changes]', 1);
  }

  const root = process.cwd();
  if (!opts.from) {
    throw new CliError('No predecessor manifest could be resolved. Pass --from <path> for a deterministic comparison.', 1);
  }

  const fromPath = path.resolve(root, opts.from);
  const toPath = path.resolve(root, opts.to || 'tusq.manifest.json');
  const fromManifest = readManifestForDiff(fromPath, 'from');
  const toManifest = readManifestForDiff(toPath, 'to');
  const includeReviewQueue = Boolean(opts['review-queue'] || opts['fail-on-unapproved-changes']);
  const diff = buildManifestDiff(fromManifest, toManifest, fromPath, toPath, includeReviewQueue);
  const gateFailures = getUnapprovedChangeFailures(diff);

  if (opts.json) {
    const payload = Object.assign({}, diff, {
      gate: {
        fail_on_unapproved_changes: Boolean(opts['fail-on-unapproved-changes']),
        passed: gateFailures.length === 0,
        failures: gateFailures.map((item) => item.capability)
      }
    });
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  } else {
    printManifestDiff(diff, Boolean(opts['review-queue']));
  }

  if (opts['fail-on-unapproved-changes'] && gateFailures.length > 0) {
    throw new CliError(
      `Review gate failed: ${gateFailures.length} added or changed capability change(s) require approval: ${gateFailures.map((item) => item.capability).join(', ')}`,
      1
    );
  }
}

function readManifestForDiff(manifestPath, label) {
  if (!fs.existsSync(manifestPath)) {
    throw new CliError(`${label} manifest not found: ${manifestPath}`, 1);
  }

  const manifest = readJson(manifestPath);
  validateManifestForDiff(manifest, manifestPath, label);
  return manifest;
}

function validateManifestForDiff(manifest, manifestPath, label) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new CliError(`${label} manifest is not an object: ${manifestPath}`, 1);
  }

  if (!Array.isArray(manifest.capabilities)) {
    throw new CliError(`${label} manifest missing capabilities array: ${manifestPath}`, 1);
  }

  const seen = new Set();
  for (const capability of manifest.capabilities) {
    if (!capability || typeof capability !== 'object' || Array.isArray(capability)) {
      throw new CliError(`${label} manifest contains an invalid capability object: ${manifestPath}`, 1);
    }
    if (typeof capability.name !== 'string' || capability.name.trim() === '') {
      throw new CliError(`${label} manifest capability missing required field: name`, 1);
    }
    if (seen.has(capability.name)) {
      throw new CliError(`${label} manifest contains duplicate capability name: ${capability.name}`, 1);
    }
    seen.add(capability.name);
  }
}

function readManifestForDocs(manifestPath) {
  if (!fs.existsSync(manifestPath)) {
    throw new CliError(`Manifest not found: ${manifestPath}`, 1);
  }

  const manifest = readJson(manifestPath);
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new CliError(`Manifest is not an object: ${manifestPath}`, 1);
  }
  if (!Array.isArray(manifest.capabilities)) {
    throw new CliError(`Manifest missing capabilities array: ${manifestPath}`, 1);
  }
  return manifest;
}

function renderCapabilityDocs(manifest, manifestPath) {
  const capabilities = manifest.capabilities
    .slice()
    .sort((left, right) => String(left.name || '').localeCompare(String(right.name || '')));
  const lines = [];

  lines.push('# Capability Documentation');
  lines.push('');
  lines.push('Generated from a local tusq manifest. This document is review/adoption material only; it does not enable live execution.');
  lines.push('');
  lines.push('## Manifest');
  lines.push('');
  lines.push(`- Source: ${markdownInline(path.basename(manifestPath))}`);
  lines.push(`- Schema version: ${formatScalar(manifest.schema_version)}`);
  lines.push(`- Manifest version: ${formatScalar(manifest.manifest_version)}`);
  lines.push(`- Previous manifest hash: ${formatScalar(manifest.previous_manifest_hash)}`);
  lines.push(`- Source scan: ${formatScalar(manifest.source_scan)}`);
  lines.push(`- Capability count: ${capabilities.length}`);
  lines.push('');
  lines.push('## Capabilities');
  lines.push('');

  for (const capability of capabilities) {
    lines.push(`### ${markdownText(capability.name || 'unnamed_capability')}`);
    lines.push('');
    lines.push(`- Description: ${formatText(capability.description)}`);
    lines.push(`- Route: ${formatScalar(capability.method)} ${formatScalar(capability.path)}`);
    lines.push(`- Approved: ${capability.approved === true ? 'yes' : 'no'}`);
    lines.push(`- Review needed: ${capability.review_needed === true ? 'yes' : 'no'}`);
    lines.push(`- Approved by: ${formatScalar(capability.approved_by)}`);
    lines.push(`- Approved at: ${formatScalar(capability.approved_at)}`);
    lines.push(`- Side effect class: ${formatScalar(capability.side_effect_class)}`);
    lines.push(`- Sensitivity class: ${formatScalar(normalizeSensitivityClass(capability.sensitivity_class))}`);
    lines.push(`- Auth hints: ${formatArray(capability.auth_hints)}`);
    lines.push(`- Domain: ${formatScalar(capability.domain)}`);
    lines.push(`- Confidence: ${formatScalar(capability.confidence)}`);
    lines.push(`- Capability digest: ${formatScalar(capability.capability_digest)}`);
    lines.push('');
    appendJsonSection(lines, 'Input schema', capability.input_schema);
    appendJsonSection(lines, 'Output schema', capability.output_schema);
    appendJsonSection(lines, 'Examples', normalizeExamples(capability.examples));
    appendJsonSection(lines, 'Constraints', normalizeConstraints(capability.constraints));
    appendJsonSection(lines, 'Redaction', normalizeRedaction(capability.redaction));
    appendJsonSection(lines, 'Provenance', capability.provenance || null);
  }

  return `${lines.join('\n')}\n`;
}

function appendJsonSection(lines, title, value) {
  lines.push(`#### ${title}`);
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(sortKeysDeep(value === undefined ? null : value), null, 2));
  lines.push('```');
  lines.push('');
}

function markdownText(value) {
  return String(value).replace(/([\\`*_{}[\]()#+.!|-])/g, '\\$1');
}

function markdownInline(value) {
  return `\`${String(value).replace(/`/g, '\\`')}\``;
}

function formatScalar(value) {
  if (value === null || value === undefined || value === '') {
    return '`none`';
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return `\`${value}\``;
  }
  return markdownInline(value);
}

function formatText(value) {
  if (value === null || value === undefined || value === '') {
    return '`none`';
  }
  return markdownText(value);
}

function formatArray(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return '`none`';
  }
  return value.map((item) => markdownInline(item)).join(', ');
}

function buildManifestDiff(fromManifest, toManifest, fromPath, toPath, includeReviewQueue) {
  const fromCapabilities = new Map(fromManifest.capabilities.map((capability) => [capability.name, capability]));
  const toCapabilities = new Map(toManifest.capabilities.map((capability) => [capability.name, capability]));
  const names = Array.from(new Set([...fromCapabilities.keys(), ...toCapabilities.keys()])).sort();
  const changes = [];

  for (const name of names) {
    const previous = fromCapabilities.get(name);
    const current = toCapabilities.get(name);

    if (!previous && current) {
      changes.push({
        type: 'added',
        capability: name,
        digest: normalizeDigest(current.capability_digest)
      });
      continue;
    }

    if (previous && !current) {
      changes.push({
        type: 'removed',
        capability: name,
        previous_digest: normalizeDigest(previous.capability_digest)
      });
      continue;
    }

    const previousDigest = normalizeDigest(previous.capability_digest);
    const currentDigest = normalizeDigest(current.capability_digest);
    if (previousDigest !== currentDigest) {
      changes.push({
        type: 'changed',
        capability: name,
        previous_digest: previousDigest,
        current_digest: currentDigest,
        fields_changed: getChangedCapabilityFields(previous, current),
        approval_invalidated: current.approved !== true || current.review_needed === true
      });
      continue;
    }

    changes.push({
      type: 'unchanged',
      capability: name,
      digest: currentDigest
    });
  }

  const summary = {
    added: changes.filter((change) => change.type === 'added').length,
    removed: changes.filter((change) => change.type === 'removed').length,
    changed: changes.filter((change) => change.type === 'changed').length,
    unchanged: changes.filter((change) => change.type === 'unchanged').length
  };

  const diff = {
    from_version: normalizeManifestVersion(fromManifest.manifest_version),
    to_version: normalizeManifestVersion(toManifest.manifest_version),
    from_hash: sha256Hex(JSON.stringify(fromManifest)),
    to_hash: sha256Hex(JSON.stringify(toManifest)),
    from_path: fromPath,
    to_path: toPath,
    generated_at: new Date().toISOString(),
    summary,
    changes
  };

  if (includeReviewQueue) {
    diff.review_queue = buildReviewQueue(changes, toCapabilities);
  }

  return diff;
}

function getChangedCapabilityFields(previous, current) {
  const excluded = new Set(['capability_digest']);
  const fields = new Set([...Object.keys(previous || {}), ...Object.keys(current || {})]);
  const changed = [];

  for (const field of Array.from(fields).sort()) {
    if (excluded.has(field)) {
      continue;
    }
    if (stableStringify(previous[field]) !== stableStringify(current[field])) {
      changed.push(field);
    }
  }

  return changed;
}

function buildReviewQueue(changes, toCapabilities) {
  const changeByName = new Map(changes.map((change) => [change.capability, change]));
  const queue = [];

  for (const [name, capability] of Array.from(toCapabilities.entries()).sort(([left], [right]) => left.localeCompare(right))) {
    const change = changeByName.get(name);
    const changeType = change ? change.type : 'unchanged';
    const requiresReview = changeType === 'added'
      || changeType === 'changed'
      || capability.approved !== true
      || capability.review_needed === true;

    if (!requiresReview) {
      continue;
    }

    queue.push({
      capability: name,
      change_type: changeType,
      approved: capability.approved === true,
      review_needed: capability.review_needed === true,
      side_effect_class: capability.side_effect_class || 'unknown',
      sensitivity_class: normalizeSensitivityClass(capability.sensitivity_class),
      confidence: typeof capability.confidence === 'number' ? capability.confidence : null,
      provenance: capability.provenance || null
    });
  }

  return queue;
}

function getUnapprovedChangeFailures(diff) {
  const reviewQueue = Array.isArray(diff.review_queue) ? diff.review_queue : [];
  if (reviewQueue.length > 0) {
    return reviewQueue.filter((item) => {
      return (item.change_type === 'added' || item.change_type === 'changed')
        && (item.approved !== true || item.review_needed === true);
    });
  }

  const changedNames = new Set(diff.changes
    .filter((change) => change.type === 'added' || change.type === 'changed')
    .map((change) => change.capability));
  return Array.from(changedNames).map((capability) => ({ capability }));
}

function printManifestDiff(diff, includeReviewQueue) {
  process.stdout.write(`Manifest diff: ${diff.from_path} -> ${diff.to_path}\n`);
  process.stdout.write(`Versions: ${diff.from_version || 'unknown'} -> ${diff.to_version || 'unknown'}\n`);
  process.stdout.write(
    `Summary: ${diff.summary.added} added, ${diff.summary.removed} removed, ${diff.summary.changed} changed, ${diff.summary.unchanged} unchanged.\n`
  );

  const interestingChanges = diff.changes.filter((change) => change.type !== 'unchanged');
  if (interestingChanges.length > 0) {
    process.stdout.write('\nChanges:\n');
    for (const change of interestingChanges) {
      if (change.type === 'changed') {
        process.stdout.write(`- changed ${change.capability} fields=${change.fields_changed.join(',') || 'unknown'}\n`);
      } else {
        process.stdout.write(`- ${change.type} ${change.capability}\n`);
      }
    }
  }

  if (includeReviewQueue) {
    const queue = Array.isArray(diff.review_queue) ? diff.review_queue : [];
    process.stdout.write(`\nReview queue: ${queue.length} capability(s)\n`);
    for (const item of queue) {
      const provenance = item.provenance && item.provenance.file
        ? ` source=${item.provenance.file}${item.provenance.line ? `:${item.provenance.line}` : ''}`
        : '';
      process.stdout.write(
        `- ${item.capability} change=${item.change_type} approved=${item.approved} review_needed=${item.review_needed} side_effect=${item.side_effect_class} sensitivity=${item.sensitivity_class} confidence=${item.confidence}${provenance}\n`
      );
    }
  }
}

function normalizeDigest(value) {
  return typeof value === 'string' && value ? value : null;
}

function getReviewStats(manifest) {
  const capabilities = Array.isArray(manifest.capabilities) ? manifest.capabilities : [];
  return {
    total: capabilities.length,
    unapproved: capabilities.filter((capability) => !capability.approved).length,
    lowConfidence: capabilities.filter((capability) => capability.review_needed).length
  };
}

function enforceStrictReviewIfRequested(strict, reviewStats) {
  if (!strict) {
    return;
  }

  if (reviewStats.unapproved > 0 || reviewStats.lowConfidence > 0) {
    throw new CliError(
      `Review gate failed: ${reviewStats.unapproved} unapproved, ${reviewStats.lowConfidence} low confidence.`,
      1
    );
  }
}

function normalizeReviewer(value) {
  const reviewer = String(value || '').trim();
  if (!reviewer) {
    throw new CliError('Reviewer identity is required. Pass --reviewer <id> or set TUSQ_REVIEWER.', 1);
  }
  return reviewer;
}

function summarizeInputSchemaForReview(schema) {
  const properties = schema && typeof schema === 'object' && schema.properties && typeof schema.properties === 'object'
    ? Object.entries(schema.properties)
    : [];

  if (properties.length === 0) {
    return 'none';
  }

  return properties
    .map(([name, meta]) => {
      const source = meta && typeof meta === 'object' && meta.source ? `:${meta.source}` : '';
      return `${name}${source}`;
    })
    .join(',');
}

function summarizeOutputSchemaForReview(schema) {
  if (!schema || typeof schema !== 'object') {
    return 'unknown';
  }

  if (schema.type === 'array') {
    const itemType = schema.items && schema.items.type ? schema.items.type : 'unknown';
    return `array<${itemType}>`;
  }

  if (schema.type === 'object') {
    const properties = schema.properties && typeof schema.properties === 'object'
      ? Object.entries(schema.properties)
      : [];
    if (properties.length === 0) {
      return 'object';
    }
    const fields = properties
      .map(([name, meta]) => `${name}:${meta && meta.type ? meta.type : 'unknown'}`)
      .join(',');
    return `object{${fields}}`;
  }

  return String(schema.type || 'unknown');
}

function summarizeProvenanceForReview(provenance) {
  if (!provenance || typeof provenance !== 'object') {
    return 'unknown';
  }

  const location = provenance.file
    ? `${provenance.file}${provenance.line ? `:${provenance.line}` : ''}`
    : 'unknown';
  const handler = provenance.handler ? ` handler=${provenance.handler}` : '';
  const framework = provenance.framework ? ` framework=${provenance.framework}` : '';
  return `${location}${handler}${framework}`;
}

function loadAndValidatePolicy(policyPath) {
  if (!fs.existsSync(policyPath)) {
    throw new CliError(`Policy file not found: ${policyPath}`, 1);
  }

  let raw;
  try {
    raw = fs.readFileSync(policyPath, 'utf8');
  } catch (e) {
    throw new CliError(`Could not read policy file: ${policyPath}: ${e.message}`, 1);
  }

  let policy;
  try {
    policy = JSON.parse(raw);
  } catch (e) {
    throw new CliError(`Invalid policy JSON at: ${policyPath}: ${e.message}`, 1);
  }

  if (!policy || typeof policy !== 'object' || Array.isArray(policy)) {
    throw new CliError(`Invalid policy JSON at: ${policyPath}: expected object`, 1);
  }

  const SUPPORTED_POLICY_VERSIONS = ['1.0'];
  if (!SUPPORTED_POLICY_VERSIONS.includes(policy.schema_version)) {
    throw new CliError(
      `Unsupported policy schema_version: ${policy.schema_version}. Supported: ${SUPPORTED_POLICY_VERSIONS.join(', ')}`,
      1
    );
  }

  const ALLOWED_POLICY_MODES = ['describe-only', 'dry-run'];
  if (!ALLOWED_POLICY_MODES.includes(policy.mode)) {
    throw new CliError(
      `Unknown policy mode: ${policy.mode}. Allowed: ${ALLOWED_POLICY_MODES.join(', ')}`,
      1
    );
  }

  if (policy.allowed_capabilities !== undefined && policy.allowed_capabilities !== null) {
    if (!Array.isArray(policy.allowed_capabilities) ||
        !policy.allowed_capabilities.every((c) => typeof c === 'string')) {
      throw new CliError(
        `Invalid allowed_capabilities in policy: ${JSON.stringify(policy.allowed_capabilities)}`,
        1
      );
    }
  }

  return policy;
}

function cmdPolicy(args) {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printCommandHelp('policy');
    return;
  }
  const sub = args[0];
  const subArgs = args.slice(1);
  if (sub === 'init') {
    cmdPolicyInit(subArgs);
    return;
  }
  if (sub === 'verify') {
    cmdPolicyVerify(subArgs);
    return;
  }
  printCommandHelp('policy');
  throw new CliError(`Unknown policy subcommand: ${sub}`, 1);
}

function cmdPolicyVerify(args) {
  const { opts, positionals } = parseCommandArgs('policy verify', args, {
    policy: 'value',
    strict: 'boolean',
    manifest: 'value',
    json: 'boolean'
  });

  if (opts.help || positionals.length > 0) {
    printCommandHelp('policy verify');
    return;
  }

  // Constraint 11: --manifest without --strict exits 1 before any file is read
  if (opts.manifest && !opts.strict) {
    const msg = '--manifest requires --strict';
    if (opts.json) {
      process.stdout.write(`${JSON.stringify({ valid: false, error: msg }, null, 2)}\n`);
    } else {
      process.stderr.write(`${msg}\n`);
    }
    process.exit(1);
    return;
  }

  const root = process.cwd();
  const policyPath = opts.policy
    ? path.resolve(root, opts.policy)
    : path.join(root, '.tusq', 'execution-policy.json');

  if (opts.verbose) {
    process.stderr.write(`Resolved policy path: ${policyPath}\n`);
  }

  let policy;
  try {
    policy = loadAndValidatePolicy(policyPath);
  } catch (e) {
    const message = e instanceof CliError ? e.message : String(e);
    if (opts.json) {
      const out = { valid: false, path: policyPath, error: message };
      if (opts.strict) {
        out.strict = true;
        out.strict_errors = [];
      }
      process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
    } else {
      process.stderr.write(`${message}\n`);
    }
    process.exit(1);
    return;
  }

  // Strict mode: manifest-aware cross-reference (M23)
  if (opts.strict) {
    const manifestPath = opts.manifest
      ? path.resolve(root, opts.manifest)
      : path.join(root, 'tusq.manifest.json');

    if (opts.verbose) {
      process.stderr.write(`Resolved manifest path: ${manifestPath}\n`);
    }

    let manifestRaw;
    try {
      manifestRaw = require('fs').readFileSync(manifestPath, 'utf8');
    } catch (e) {
      if (e.code === 'ENOENT') {
        const msg = `Manifest not found: ${manifestPath}`;
        if (opts.json) {
          process.stdout.write(`${JSON.stringify({ valid: false, strict: true, path: policyPath, manifest_path: manifestPath, error: msg, strict_errors: [] }, null, 2)}\n`);
        } else {
          process.stderr.write(`${msg}\n`);
        }
        process.exit(1);
        return;
      }
      const msg = `Could not read manifest file: ${manifestPath}: ${e.message}`;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify({ valid: false, strict: true, path: policyPath, manifest_path: manifestPath, error: msg, strict_errors: [] }, null, 2)}\n`);
      } else {
        process.stderr.write(`${msg}\n`);
      }
      process.exit(1);
      return;
    }

    let manifest;
    try {
      manifest = JSON.parse(manifestRaw);
    } catch (e) {
      const msg = `Invalid manifest JSON at: ${manifestPath}: ${e.message}`;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify({ valid: false, strict: true, path: policyPath, manifest_path: manifestPath, error: msg, strict_errors: [] }, null, 2)}\n`);
      } else {
        process.stderr.write(`${msg}\n`);
      }
      process.exit(1);
      return;
    }

    if (!Array.isArray(manifest.capabilities)) {
      const msg = `Invalid manifest shape at: ${manifestPath}: missing capabilities array`;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify({ valid: false, strict: true, path: policyPath, manifest_path: manifestPath, error: msg, strict_errors: [] }, null, 2)}\n`);
      } else {
        process.stderr.write(`${msg}\n`);
      }
      process.exit(1);
      return;
    }

    // Build lookup map: name → capability entry
    const capabilityMap = new Map();
    for (const cap of manifest.capabilities) {
      capabilityMap.set(cap.name, cap);
    }

    // strict check: allowed_capabilities null/unset passes trivially
    const allowedCaps = policy.allowed_capabilities;
    const strictErrors = [];

    if (Array.isArray(allowedCaps) && allowedCaps.length > 0) {
      for (const name of allowedCaps) {
        const cap = capabilityMap.get(name);
        if (!cap) {
          strictErrors.push({ name, reason: 'not_in_manifest' });
        } else if (!cap.approved) {
          strictErrors.push({ name, reason: 'not_approved' });
        } else if (cap.review_needed) {
          strictErrors.push({ name, reason: 'requires_review' });
        }
      }
    }

    if (strictErrors.length > 0) {
      const firstMsg = strictErrorMessage(strictErrors[0]);
      if (opts.json) {
        process.stdout.write(`${JSON.stringify({
          valid: false,
          strict: true,
          path: policyPath,
          manifest_path: manifestPath,
          error: firstMsg,
          strict_errors: strictErrors
        }, null, 2)}\n`);
      } else {
        for (const se of strictErrors) {
          process.stderr.write(`${strictErrorMessage(se)}\n`);
        }
      }
      process.exit(1);
      return;
    }

    // Strict success
    const approvedAllowedCapabilities = Array.isArray(allowedCaps) ? allowedCaps.length : null;
    if (opts.json) {
      const out = {
        valid: true,
        strict: true,
        path: policyPath,
        manifest_path: manifestPath,
        manifest_version: manifest.manifest_version !== undefined ? manifest.manifest_version : null,
        policy: {
          schema_version: policy.schema_version,
          mode: policy.mode,
          reviewer: policy.reviewer,
          approved_at: policy.approved_at,
          allowed_capabilities: policy.allowed_capabilities !== undefined ? policy.allowed_capabilities : null
        },
        approved_allowed_capabilities: approvedAllowedCapabilities
      };
      process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
    } else {
      const capCount = Array.isArray(allowedCaps) ? String(allowedCaps.length) : 'unset';
      process.stdout.write(`Policy valid (strict): ${policyPath} (mode: ${policy.mode}, reviewer: ${policy.reviewer}, allowed_capabilities: ${capCount}, manifest: ${manifestPath})\n`);
    }
    return;
  }

  // Default M22 path (no --strict)
  const capCount = Array.isArray(policy.allowed_capabilities)
    ? String(policy.allowed_capabilities.length)
    : 'unset';

  if (opts.json) {
    const out = {
      valid: true,
      path: policyPath,
      policy: {
        schema_version: policy.schema_version,
        mode: policy.mode,
        reviewer: policy.reviewer,
        approved_at: policy.approved_at,
        allowed_capabilities: policy.allowed_capabilities !== undefined ? policy.allowed_capabilities : null
      }
    };
    process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  } else {
    process.stdout.write(`Policy valid: ${policyPath} (mode: ${policy.mode}, reviewer: ${policy.reviewer}, allowed_capabilities: ${capCount})\n`);
  }
}

function strictErrorMessage(se) {
  if (se.reason === 'not_in_manifest') {
    return `Strict policy verify failed: allowed capability not found in manifest: ${se.name}`;
  }
  if (se.reason === 'not_approved') {
    return `Strict policy verify failed: allowed capability not approved: ${se.name}`;
  }
  return `Strict policy verify failed: allowed capability requires review: ${se.name}`;
}

function cmdPolicyInit(args) {
  const { opts, positionals } = parseCommandArgs('policy init', args, {
    mode: 'value',
    reviewer: 'value',
    'allowed-capabilities': 'value',
    out: 'value',
    force: 'boolean',
    'dry-run': 'boolean',
    json: 'boolean'
  });

  if (opts.help || positionals.length > 0) {
    printCommandHelp('policy init');
    return;
  }

  const ALLOWED_MODES = ['describe-only', 'dry-run'];
  const mode = opts.mode || 'describe-only';
  if (!ALLOWED_MODES.includes(mode)) {
    process.stderr.write(`Unknown policy mode: ${mode}. Allowed: describe-only, dry-run\n`);
    process.exit(1);
    return;
  }

  let reviewer;
  if (opts.reviewer !== undefined) {
    if (!opts.reviewer || !opts.reviewer.trim()) {
      process.stderr.write('Invalid reviewer: reviewer identity cannot be empty\n');
      process.exit(1);
      return;
    }
    reviewer = opts.reviewer.trim();
  } else {
    reviewer = process.env.TUSQ_REVIEWER || process.env.USER || process.env.LOGNAME || 'unknown';
  }

  let allowedCapabilities;
  if (opts['allowed-capabilities'] !== undefined) {
    const parts = opts['allowed-capabilities'].split(',').map((s) => s.trim());
    if (parts.length === 0 || parts.some((p) => p === '')) {
      process.stderr.write('Invalid allowed-capabilities: list cannot be empty or contain empty names\n');
      process.exit(1);
      return;
    }
    const seen = new Set();
    allowedCapabilities = [];
    for (const p of parts) {
      if (!seen.has(p)) {
        seen.add(p);
        allowedCapabilities.push(p);
      }
    }
  }

  const root = process.cwd();
  const outPath = opts.out
    ? path.resolve(root, opts.out)
    : path.join(root, '.tusq', 'execution-policy.json');

  if (!opts['dry-run'] && fs.existsSync(outPath) && !opts.force) {
    process.stderr.write(`Policy file already exists: ${outPath}. Re-run with --force to overwrite.\n`);
    process.exit(1);
    return;
  }

  const approvedAt = new Date().toISOString();
  const policy = { schema_version: '1.0', mode, reviewer, approved_at: approvedAt };
  if (allowedCapabilities !== undefined) {
    policy.allowed_capabilities = allowedCapabilities;
  }

  const content = `${JSON.stringify(policy, null, 2)}\n`;

  if (opts['dry-run']) {
    process.stdout.write(content);
    if (opts.verbose) {
      process.stderr.write(`Would write: ${outPath}\n`);
    }
    return;
  }

  try {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, content, 'utf8');
  } catch (e) {
    process.stderr.write(`Could not write policy file: ${outPath}: ${e.message}\n`);
    process.exit(1);
    return;
  }

  if (opts.json) {
    process.stdout.write(`${JSON.stringify({ written: outPath, policy }, null, 2)}\n`);
  } else {
    process.stdout.write(`Policy file written: ${outPath}\n`);
    if (opts.verbose) {
      process.stderr.write(content);
    }
  }
}

function validateArguments(args, schema) {
  if (!schema || typeof schema !== 'object') {
    return { valid: true, errors: [] };
  }

  const errors = [];
  const properties = schema.properties || {};
  const required = Array.isArray(schema.required) ? schema.required : [];

  for (const field of required) {
    if (!Object.prototype.hasOwnProperty.call(args, field) || args[field] === undefined) {
      errors.push({ path: `/${field}`, reason: 'required field missing' });
    }
  }

  for (const [field, value] of Object.entries(args)) {
    const propSchema = properties[field];
    if (!propSchema) {
      if (schema.additionalProperties === false) {
        errors.push({ path: `/${field}`, reason: 'unknown property' });
      }
      continue;
    }
    if (propSchema.type && value !== null && value !== undefined) {
      if (!checkPrimitiveType(value, propSchema.type)) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        errors.push({ path: `/${field}`, reason: `expected ${propSchema.type}, got ${actualType}` });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

function checkPrimitiveType(value, type) {
  if (type === 'string') return typeof value === 'string';
  if (type === 'number') return typeof value === 'number';
  if (type === 'integer') return Number.isInteger(value);
  if (type === 'boolean') return typeof value === 'boolean';
  return true;
}

function substitutePathParams(rawPath, args, schema) {
  const properties = (schema && schema.properties) || {};
  let result = rawPath;
  for (const [field, propSchema] of Object.entries(properties)) {
    if (propSchema && propSchema.source === 'path') {
      const value = args[field];
      if (value !== undefined) {
        result = result.replace(`:${field}`, String(value));
      }
    }
  }
  return result;
}

function extractPathParams(args, schema) {
  const properties = (schema && schema.properties) || {};
  const out = {};
  for (const [field, propSchema] of Object.entries(properties)) {
    if (propSchema && propSchema.source === 'path' && Object.prototype.hasOwnProperty.call(args, field)) {
      out[field] = String(args[field]);
    }
  }
  return out;
}

function extractBodyArgs(args, schema) {
  const properties = (schema && schema.properties) || {};
  const out = {};
  for (const [field, value] of Object.entries(args)) {
    const propSchema = properties[field];
    if (!propSchema || propSchema.source !== 'path') {
      out[field] = value;
    }
  }
  return out;
}

function computePlanHash(planFields) {
  const payload = {
    body: planFields.body,
    headers: planFields.headers,
    method: planFields.method,
    path: planFields.path,
    path_params: planFields.path_params,
    query: planFields.query
  };
  return crypto.createHash('sha256').update(JSON.stringify(sortKeysDeep(payload))).digest('hex');
}

function printHelp() {
  process.stdout.write(`tusq ${VERSION}\n\n`);
  process.stdout.write('Usage: tusq <command> [options]\n\n');
  process.stdout.write('Commands:\n');
  process.stdout.write('  init               Initialize tusq.config.json\n');
  process.stdout.write('  scan <path>        Scan a codebase and create .tusq/scan.json\n');
  process.stdout.write('  manifest           Generate tusq.manifest.json from the latest scan\n');
  process.stdout.write('  compile            Compile approved capabilities into tool definitions\n');
  process.stdout.write('  serve              Start describe-only local MCP endpoint\n');
  process.stdout.write('  review             Print manifest summary for human review\n');
  process.stdout.write('  docs               Generate Markdown capability documentation\n');
  process.stdout.write('  approve            Approve manifest capabilities with audit metadata\n');
  process.stdout.write('  diff               Compare manifest versions and generate a review queue\n');
  process.stdout.write('  policy             Manage execution policy artifacts\n');
  process.stdout.write('  version            Print version and exit\n');
  process.stdout.write('  help               Print this help\n');
}

function printCommandHelp(command) {
  const entries = {
    init: 'Usage: tusq init [--framework <express|fastify|nestjs>] [--verbose]',
    scan: 'Usage: tusq scan <path> [--framework <name>] [--format json] [--verbose]',
    manifest: 'Usage: tusq manifest [--out <path>] [--format json] [--verbose]',
    compile: 'Usage: tusq compile [--out <path>] [--dry-run] [--verbose]',
    serve: 'Usage: tusq serve [--port <n>] [--policy <path>] [--verbose]',
    review: 'Usage: tusq review [--format json] [--strict] [--verbose]',
    docs: 'Usage: tusq docs [--manifest <path>] [--out <path>] [--verbose]',
    approve: 'Usage: tusq approve [capability-name] [--all] [--reviewer <id>] [--manifest <path>] [--dry-run] [--json] [--verbose]',
    diff: 'Usage: tusq diff [--from <path>] [--to <path>] [--json] [--review-queue] [--fail-on-unapproved-changes] [--verbose]',
    policy: 'Usage: tusq policy <subcommand>\n  Subcommands: init, verify',
    'policy init': 'Usage: tusq policy init [--mode <describe-only|dry-run>] [--reviewer <id>] [--allowed-capabilities <name,...>] [--out <path>] [--force] [--dry-run] [--json] [--verbose]',
    'policy verify': 'Usage: tusq policy verify [--policy <path>] [--strict [--manifest <path>]] [--json] [--verbose]'
  };
  process.stdout.write(`${entries[command] || 'Usage: tusq help'}\n`);
}

function readProjectConfig(projectRoot) {
  const configPath = path.join(projectRoot, 'tusq.config.json');
  if (!fs.existsSync(configPath)) {
    throw new CliError('No tusq config found. Run `tusq init` first.', 1);
  }
  return readJson(configPath);
}

function readOptionalProjectConfig(projectRoot) {
  const configPath = path.join(projectRoot, 'tusq.config.json');
  if (!fs.existsSync(configPath)) {
    return {};
  }
  return readJson(configPath);
}

function collectSourceFiles(root, extraExcludes) {
  const defaultExcludes = new Set(['node_modules', '.git', '.tusq', 'dist', 'build', 'coverage']);
  if (Array.isArray(extraExcludes)) {
    for (const item of extraExcludes) {
      defaultExcludes.add(String(item));
    }
  }

  const files = [];

  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      if (defaultExcludes.has(entry.name)) {
        continue;
      }
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && /\.(c|m)?(j|t)sx?$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    }
  }

  walk(root);
  return files;
}

function detectFramework(projectRoot) {
  const warnings = [];
  const packagePath = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(packagePath)) {
    return { framework: null, warnings: ['package.json not found; could not auto-detect framework.'] };
  }

  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  } catch (_error) {
    return { framework: null, warnings: ['package.json is not valid JSON; could not auto-detect framework.'] };
  }

  const deps = Object.assign({}, pkg.dependencies || {}, pkg.devDependencies || {});
  const found = [];

  if (deps.express) {
    found.push('express');
  }
  if (deps.fastify) {
    found.push('fastify');
  }
  if (deps['@nestjs/core'] || deps['@nestjs/common']) {
    found.push('nestjs');
  }

  if (found.length === 0) {
    return { framework: null, warnings: ['No supported framework detected from package.json.'] };
  }

  if (found.length > 1) {
    warnings.push(`Multiple frameworks detected (${found.join(', ')}). Using ${found[0]}.`);
  }

  return { framework: found[0], warnings };
}

function extractExpressRoutes(content, filePath) {
  const routes = [];
  const lines = content.split(/\r?\n/);
  const pattern = /\b(?:app|router)\.(get|post|put|patch|delete|options|head)\s*\(\s*(['"`])([^'"`]+)\2\s*,\s*(.+)\)\s*;?/;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const match = line.match(pattern);
    if (!match) {
      continue;
    }

    const method = match[1].toUpperCase();
    const routePath = normalizeRoutePath(match[3]);
    const handlerExpr = match[4];
    const tokens = extractIdentifiers(handlerExpr);
    const isInline = /=>|function\s*\(/.test(handlerExpr);
    const handler = isInline ? 'inline_handler' : (tokens[tokens.length - 1] || 'unknown_handler');
    const middleware = isInline ? tokens : tokens.slice(0, Math.max(0, tokens.length - 1));
    const nearby = nearbySnippet(lines, i, 3);
    const handlerSource = isInline ? handlerExpr : findNamedHandlerSource(content, handler);

    routes.push({
      framework: 'express',
      method,
      path: routePath,
      handler,
      domain: inferDomain(routePath),
      auth_hints: inferAuthHints([handlerExpr, nearby]),
      provenance: {
        file: filePath,
        line: i + 1,
        handler,
        framework: 'express'
      },
      schema_hint: /\bzod\b|\bz\.object\b|\bjoi\b|\bschema\b/i.test(nearby),
      response_hint: inferResponseHint(handlerSource || nearby),
      middleware
    });
  }

  return routes;
}

function extractFastifyRoutes(content, filePath) {
  const routes = [];
  const lines = content.split(/\r?\n/);
  const inlinePattern = /\bfastify\.(get|post|put|patch|delete|options|head)\s*\(\s*(['"`])([^'"`]+)\2\s*,\s*(.+)\)\s*;?/;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const match = line.match(inlinePattern);
    if (!match) {
      continue;
    }

    const method = match[1].toUpperCase();
    const routePath = normalizeRoutePath(match[3]);
    const handlerExpr = match[4];
    const tokens = extractIdentifiers(handlerExpr);
    const isInline = /=>|function\s*\(/.test(handlerExpr);
    const handler = isInline ? 'inline_handler' : (tokens[tokens.length - 1] || 'unknown_handler');
    const nearby = nearbySnippet(lines, i, 5);

    routes.push({
      framework: 'fastify',
      method,
      path: routePath,
      handler,
      domain: inferDomain(routePath),
      auth_hints: inferAuthHints([handlerExpr, nearby]),
      provenance: {
        file: filePath,
        line: i + 1,
        handler,
        framework: 'fastify'
      },
      schema_hint: /\bschema\s*:/i.test(nearby),
      response_hint: inferResponseHint(nearby),
      middleware: tokens
    });
  }

  // 3-argument inline form: fastify.verb(path, {options...}, handler)
  const inlineWithOptionsPattern = /\bfastify\.(get|post|put|patch|delete|options|head)\s*\(\s*(['"`])([^'"`]+)\2\s*,\s*\{([\s\S]*?)\}\s*,\s*([^)]+)\)/g;
  let optMatch;
  while ((optMatch = inlineWithOptionsPattern.exec(content)) !== null) {
    const method = optMatch[1].toUpperCase();
    const routePath = normalizeRoutePath(optMatch[3]);
    const optionsBlock = optMatch[4];
    const handlerExpr = optMatch[5].trim();
    const tokens = extractIdentifiers(handlerExpr);
    const isInline = /=>|function\s*\(/.test(handlerExpr);
    const handler = isInline ? 'inline_handler' : (tokens[tokens.length - 1] || 'unknown_handler');
    routes.push({
      framework: 'fastify',
      method,
      path: routePath,
      handler,
      domain: inferDomain(routePath),
      auth_hints: inferAuthHints([handlerExpr]),
      provenance: {
        file: filePath,
        line: lineFromIndex(content, optMatch.index),
        handler,
        framework: 'fastify'
      },
      schema_hint: /\bschema\s*:/i.test(optionsBlock),
      response_hint: inferResponseHint(`${optionsBlock}\n${handlerExpr}`),
      middleware: tokens
    });
  }

  const routePattern = /fastify\.route\s*\(\s*\{([\s\S]*?)\}\s*\)/g;
  let match;
  while ((match = routePattern.exec(content)) !== null) {
    const block = match[1];
    const methodMatch = block.match(/method\s*:\s*['"`]?(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)['"`]?/i);
    const pathMatch = block.match(/(?:url|path)\s*:\s*['"`]([^'"`]+)['"`]/i);
    if (!methodMatch || !pathMatch) {
      continue;
    }

    const handlerMatch = block.match(/handler\s*:\s*([A-Za-z_][A-Za-z0-9_]*)/);
    const authTokens = extractIdentifiers(block).filter((token) => /auth|guard|role|permission|admin|jwt/i.test(token));

    routes.push({
      framework: 'fastify',
      method: methodMatch[1].toUpperCase(),
      path: normalizeRoutePath(pathMatch[1]),
      handler: handlerMatch ? handlerMatch[1] : 'inline_handler',
      domain: inferDomain(pathMatch[1]),
      auth_hints: dedupe(authTokens),
      provenance: {
        file: filePath,
        line: lineFromIndex(content, match.index),
        handler: handlerMatch ? handlerMatch[1] : 'inline_handler',
        framework: 'fastify'
      },
      schema_hint: /\bschema\s*:/i.test(block),
      response_hint: inferResponseHint(block),
      middleware: []
    });
  }

  return dedupeRoutes(routes);
}

function extractNestRoutes(content, filePath) {
  const routes = [];
  const lines = content.split(/\r?\n/);
  let controllerPrefix = '';
  let classGuards = [];
  let pendingGuards = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();

    const controllerMatch = line.match(/^@Controller\((.*)\)/);
    if (controllerMatch) {
      controllerPrefix = extractFirstStringLiteral(controllerMatch[1]) || '';
      continue;
    }

    if (line.startsWith('@UseGuards(') || line.startsWith('@Roles(') || line.startsWith('@SetMetadata(')) {
      pendingGuards = dedupe([...pendingGuards, ...extractIdentifiers(line)]);
      continue;
    }

    if (/^(export\s+)?class\s+/.test(line) && pendingGuards.length > 0) {
      classGuards = dedupe([...classGuards, ...pendingGuards]);
      pendingGuards = [];
      continue;
    }

    const methodMatch = line.match(/^@(Get|Post|Put|Patch|Delete)\((.*)\)/);
    if (!methodMatch) {
      continue;
    }

    const method = methodMatch[1].toUpperCase();
    const routePart = extractFirstStringLiteral(methodMatch[2]) || '';
    const fullPath = joinPaths(controllerPrefix, routePart);
    const signature = findNextMethodSignature(lines, i + 1);
    const handler = signature || 'unknown_handler';
    const nearby = nearbySnippet(lines, i, 4);
    const methodBody = signature ? findClassMethodSource(lines, i + 1, signature) : nearby;

    routes.push({
      framework: 'nestjs',
      method,
      path: normalizeRoutePath(fullPath),
      handler,
      domain: inferDomain(fullPath, controllerPrefix),
      auth_hints: dedupe([...classGuards, ...pendingGuards, ...inferAuthHints([nearby])]),
      provenance: {
        file: filePath,
        line: i + 1,
        handler,
        framework: 'nestjs'
      },
      schema_hint: /dto|schema|zod|class-validator/i.test(nearby),
      response_hint: inferResponseHint(methodBody),
      middleware: dedupe([...classGuards, ...pendingGuards])
    });

    pendingGuards = [];
  }

  return routes;
}

function finalizeRouteInference(route) {
  const confidence = scoreConfidence(route);
  const hasSchema = Boolean(route.schema_hint);
  const normalizedPath = normalizeRoutePath(route.path);
  const pathParameters = extractPathParameters(normalizedPath);

  return {
    framework: route.framework,
    method: route.method,
    path: normalizedPath,
    handler: route.handler,
    domain: route.domain || inferDomain(normalizedPath),
    auth_hints: dedupe(route.auth_hints || []),
    provenance: route.provenance,
    confidence,
    input_schema: buildInputSchema(route, hasSchema, pathParameters),
    output_schema: buildOutputSchema(route, hasSchema)
  };
}

function scoreConfidence(route) {
  let score = 0.62;

  if (route.handler && route.handler !== 'unknown_handler' && route.handler !== 'inline_handler') {
    score += 0.12;
  }

  if (route.auth_hints && route.auth_hints.length > 0) {
    score += 0.08;
  }

  if (route.schema_hint) {
    score += 0.14;
  } else {
    score -= 0.10;
  }

  if (route.path && route.path !== '/') {
    score += 0.04;
  }

  if (score < 0) {
    score = 0;
  }

  if (score > 0.95) {
    score = 0.95;
  }

  return Number(score.toFixed(2));
}

function classifySideEffect(method, routePath, handler) {
  const upper = String(method || '').toUpperCase();
  const hint = `${routePath || ''} ${handler || ''}`.toLowerCase();

  if (upper === 'DELETE' || /(delete|destroy|remove|revoke)/.test(hint)) {
    return 'destructive';
  }

  if (upper === 'GET' || upper === 'HEAD' || upper === 'OPTIONS') {
    return 'read';
  }

  return 'write';
}

function classifySensitivity(_method, _routePath, _handler, _authHints) {
  return 'unknown';
}

function normalizeSensitivityClass(value) {
  if (typeof value !== 'string') {
    return 'unknown';
  }

  const normalized = value.trim().toLowerCase();
  return SENSITIVITY_CLASSES.includes(normalized) ? normalized : 'unknown';
}

function defaultExamples() {
  return [
    {
      input: {},
      output: {
        note: V1_DESCRIBE_ONLY_NOTE
      }
    }
  ];
}

function normalizeExamples(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return defaultExamples();
  }

  return cloneJson(value, defaultExamples());
}

function defaultConstraints() {
  return {
    rate_limit: null,
    max_payload_bytes: null,
    required_headers: [],
    idempotent: null,
    cacheable: null
  };
}

function normalizeConstraints(value) {
  const defaults = defaultConstraints();
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return defaults;
  }

  const out = {
    rate_limit: null,
    max_payload_bytes: null,
    required_headers: [],
    idempotent: null,
    cacheable: null
  };

  if (typeof value.rate_limit === 'string' && value.rate_limit.trim()) {
    out.rate_limit = value.rate_limit.trim();
  }

  if (Number.isInteger(value.max_payload_bytes) && value.max_payload_bytes >= 0) {
    out.max_payload_bytes = value.max_payload_bytes;
  }

  if (Array.isArray(value.required_headers)) {
    out.required_headers = dedupe(
      value.required_headers
        .filter((entry) => typeof entry === 'string')
        .map((entry) => entry.trim())
        .filter(Boolean)
    );
  }

  if (typeof value.idempotent === 'boolean') {
    out.idempotent = value.idempotent;
  }

  if (typeof value.cacheable === 'boolean') {
    out.cacheable = value.cacheable;
  }

  return out;
}

function defaultRedaction() {
  return {
    pii_fields: [],
    log_level: 'full',
    mask_in_traces: false,
    retention_days: null
  };
}

function normalizeRedaction(value) {
  const defaults = defaultRedaction();
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return defaults;
  }

  const out = defaultRedaction();

  if (Array.isArray(value.pii_fields)) {
    out.pii_fields = dedupe(
      value.pii_fields
        .filter((entry) => typeof entry === 'string')
        .map((entry) => entry.trim())
        .filter(Boolean)
    );
  }

  if (typeof value.log_level === 'string') {
    const normalizedLogLevel = value.log_level.trim().toLowerCase();
    if (REDACTION_LOG_LEVELS.includes(normalizedLogLevel)) {
      out.log_level = normalizedLogLevel;
    }
  }

  if (typeof value.mask_in_traces === 'boolean') {
    out.mask_in_traces = value.mask_in_traces;
  }

  if (Number.isInteger(value.retention_days) && value.retention_days >= 0) {
    out.retention_days = value.retention_days;
  }

  return out;
}

function normalizeApprovedBy(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

function normalizeApprovedAt(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const parsed = Date.parse(normalized);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return normalized;
}

function cloneJson(value, fallback) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_error) {
    return fallback;
  }
}

function normalizeManifestVersion(value) {
  if (!Number.isInteger(value) || value < 1) {
    return null;
  }
  return value;
}

function computeCapabilityDigest(capability) {
  const payload = {
    name: capability.name,
    description: capability.description,
    method: capability.method,
    path: capability.path,
    input_schema: capability.input_schema,
    output_schema: capability.output_schema,
    side_effect_class: capability.side_effect_class,
    sensitivity_class: normalizeSensitivityClass(capability.sensitivity_class),
    auth_hints: dedupe(capability.auth_hints || []),
    examples: normalizeExamples(capability.examples),
    constraints: normalizeConstraints(capability.constraints),
    redaction: normalizeRedaction(capability.redaction),
    provenance: capability.provenance,
    confidence: capability.confidence,
    domain: capability.domain
  };

  return sha256Hex(stableStringify(payload));
}

function sha256Hex(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function stableStringify(value) {
  return JSON.stringify(sortKeysDeep(value));
}

function sortKeysDeep(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sortKeysDeep(item));
  }

  if (value && typeof value === 'object') {
    const out = {};
    const keys = Object.keys(value).sort();
    for (const key of keys) {
      out[key] = sortKeysDeep(value[key]);
    }
    return out;
  }

  return value;
}

function inferDomain(routePath, controllerHint) {
  const candidates = [
    ...extractDomainSegments(routePath),
    ...extractDomainSegments(controllerHint)
  ];
  return candidates[0] || 'general';
}

function capabilityName(route) {
  const method = String(route.method || '').toLowerCase();
  const domain = String(route.domain || inferDomain(route.path)).toLowerCase();
  const pathPart = sanitizeName(route.path || 'root').replace(/^_+|_+$/g, '');
  return `${method}_${domain}_${pathPart}`;
}

function describeCapability(route) {
  const method = String(route.method || '').toUpperCase();
  const domain = String(route.domain || inferDomain(route.path) || 'general').toLowerCase();
  const pathParameters = extractPathParameters(route.path);
  const noun = pathParameters.length > 0 ? singularizeWord(domain) : domain;
  const qualifier = describePathQualifier(pathParameters);
  const sideEffect = describeSideEffect(classifySideEffect(method, route.path, route.handler));
  const authHints = dedupe(route.auth_hints || []);
  const authContext = authHints.length > 0
    ? `requires ${authHints.join(', ')}`
    : 'no authentication detected';
  const handlerSuffix = route.handler && route.handler !== 'inline_handler' && route.handler !== 'unknown_handler'
    ? ` (handler: ${route.handler})`
    : '';
  const verb = describeVerb(method);
  const target = qualifier ? `${noun} ${qualifier}` : noun;

  return `${verb} ${target} - ${sideEffect}, ${authContext}${handlerSuffix}`;
}

function capabilityKey(method, routePath) {
  return `${String(method).toUpperCase()} ${normalizeRoutePath(routePath)}`;
}

function normalizeRoutePath(routePath) {
  if (!routePath) {
    return '/';
  }

  const normalized = String(routePath).trim();
  if (normalized.startsWith('/')) {
    return normalized;
  }

  return `/${normalized}`;
}

function joinPaths(prefix, routePath) {
  const left = String(prefix || '').trim();
  const right = String(routePath || '').trim();

  if (!left && !right) {
    return '/';
  }

  const slashLeft = left.startsWith('/') ? left : (left ? `/${left}` : '');
  const slashRight = right.startsWith('/') ? right : (right ? `/${right}` : '');

  return normalizeRoutePath(`${slashLeft}${slashRight}`);
}

function buildInputSchema(route, hasSchema, pathParameters) {
  const method = String(route.method || '').toUpperCase();
  const properties = {};
  const required = [];

  for (const name of pathParameters) {
    properties[name] = {
      type: 'string',
      source: 'path',
      description: `Path parameter: ${name}`
    };
    required.push(name);
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    properties.body = {
      type: 'object',
      additionalProperties: true,
      source: hasSchema ? 'framework_schema_hint' : 'request_body'
    };
  }

  return {
    type: 'object',
    properties,
    required,
    additionalProperties: true,
    description: describeInputSchema(route, hasSchema, pathParameters.length)
  };
}

function buildOutputSchema(route, hasSchema) {
  const hint = route.response_hint || {};

  if (hint.kind === 'array') {
    return {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: true
      },
      description: hasSchema
        ? 'Inferred array response from framework schema hints.'
        : 'Inferred array response from handler return/json usage.'
    };
  }

  if (hint.kind === 'object') {
    return {
      type: 'object',
      additionalProperties: true,
      properties: hint.properties || {},
      description: hasSchema
        ? 'Inferred object response from framework schema hints.'
        : 'Inferred object response from handler return/json usage.'
    };
  }

  return {
    type: 'object',
    additionalProperties: true,
    description: hasSchema
      ? 'Inferred response shape from available schema hints.'
      : 'Response schema not confidently inferred.'
  };
}

function describeInputSchema(route, hasSchema, pathParameterCount) {
  const method = String(route.method || '').toUpperCase();
  const parts = [];

  if (pathParameterCount > 0) {
    parts.push('path parameters inferred from route pattern');
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    parts.push(hasSchema ? 'request body inferred from framework schema hints' : 'request body expected for write operation');
  }

  if (parts.length === 0) {
    return hasSchema
      ? 'Inferred from framework/type schema hints.'
      : 'No required input detected; review optional query/body fields manually.';
  }

  return `${parts.join('; ')}.`;
}

function extractPathParameters(routePath) {
  const value = String(routePath || '');
  const pattern = /:([A-Za-z_][A-Za-z0-9_]*)|\{([A-Za-z_][A-Za-z0-9_]*)\}/g;
  const seen = new Set();
  const params = [];
  let match;
  while ((match = pattern.exec(value)) !== null) {
    const param = match[1] || match[2];
    if (!seen.has(param)) {
      seen.add(param);
      params.push(param);
    }
  }
  return params;
}

function extractDomainSegments(value) {
  const raw = String(value || '')
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean);

  const segments = [];
  for (const segment of raw) {
    if (isPathParameterToken(segment)) {
      continue;
    }
    const normalized = sanitizeName(segment).replace(/^_+|_+$/g, '');
    if (!normalized || DOMAIN_PREFIX_SEGMENTS.has(normalized)) {
      continue;
    }
    segments.push(normalized);
  }

  return segments;
}

function isPathParameterToken(segment) {
  return /^:[A-Za-z_][A-Za-z0-9_]*$/.test(segment) || /^\{[A-Za-z_][A-Za-z0-9_]*\}$/.test(segment);
}

function singularizeWord(word) {
  const value = String(word || '').trim();
  if (!value) {
    return 'resource';
  }
  if (value.endsWith('ies') && value.length > 3) {
    return `${value.slice(0, -3)}y`;
  }
  if (value.endsWith('ss')) {
    return value;
  }
  if (value.endsWith('s') && value.length > 1) {
    return value.slice(0, -1);
  }
  return value;
}

function describePathQualifier(pathParameters) {
  if (!Array.isArray(pathParameters) || pathParameters.length === 0) {
    return '';
  }
  return `by ${joinWithAnd(pathParameters)}`;
}

function joinWithAnd(items) {
  if (items.length === 1) {
    return items[0];
  }
  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function describeVerb(method) {
  switch (String(method || '').toUpperCase()) {
    case 'GET':
      return 'Retrieve';
    case 'POST':
      return 'Create';
    case 'PUT':
      return 'Replace';
    case 'PATCH':
      return 'Update';
    case 'DELETE':
      return 'Delete';
    case 'OPTIONS':
      return 'Check options for';
    case 'HEAD':
      return 'Check';
    default:
      return 'Handle';
  }
}

function describeSideEffect(sideEffectClass) {
  if (sideEffectClass === 'read') {
    return 'read-only';
  }
  if (sideEffectClass === 'destructive') {
    return 'destructive';
  }
  if (sideEffectClass === 'write') {
    return 'state-modifying';
  }
  return 'unknown side effects';
}

function findNextMethodSignature(lines, startIndex) {
  for (let i = startIndex; i < Math.min(lines.length, startIndex + 6); i += 1) {
    const line = lines[i].trim();
    if (!line || line.startsWith('@')) {
      continue;
    }

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
    if (match) {
      return match[1];
    }
    break;
  }
  return null;
}

function findNamedHandlerSource(content, handlerName) {
  if (!handlerName || handlerName === 'unknown_handler' || handlerName === 'inline_handler') {
    return null;
  }

  const escaped = escapeRegExp(handlerName);
  const patterns = [
    new RegExp(`(?:const|let|var)\\s+${escaped}\\s*=\\s*([^;]+);`, 'm'),
    new RegExp(`function\\s+${escaped}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)\\n\\}`, 'm')
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return null;
}

function findClassMethodSource(lines, startIndex, methodName) {
  const escaped = escapeRegExp(methodName);
  const signaturePattern = new RegExp(`^\\s*${escaped}\\s*\\(`);

  for (let i = startIndex; i < Math.min(lines.length, startIndex + 8); i += 1) {
    if (!signaturePattern.test(lines[i])) {
      continue;
    }

    const collected = [];
    let depth = 0;
    let opened = false;
    for (let j = i; j < lines.length; j += 1) {
      const line = lines[j];
      collected.push(line);
      for (const char of line) {
        if (char === '{') {
          depth += 1;
          opened = true;
        } else if (char === '}') {
          depth -= 1;
        }
      }
      if (opened && depth <= 0) {
        break;
      }
    }
    return collected.join('\n');
  }

  return null;
}

function inferResponseHint(source) {
  if (!source) {
    return null;
  }

  const text = String(source);
  if (/\b(?:return|json)\s*\(\s*\[/.test(text) || /\breturn\s+\[/.test(text) || /\btype\s*:\s*['"`]array['"`]/i.test(text)) {
    return { kind: 'array' };
  }

  const objectLiteral = extractResponseObjectLiteral(text);
  if (objectLiteral) {
    return {
      kind: 'object',
      properties: inferObjectProperties(objectLiteral)
    };
  }

  if (/\btype\s*:\s*['"`]object['"`]/i.test(text)) {
    return { kind: 'object', properties: {} };
  }

  return null;
}

function extractResponseObjectLiteral(text) {
  const patterns = [
    /\bjson\s*\(\s*(\{[^)]*\})\s*\)/m,
    /\breturn\s+(\{[^;]*\})\s*;?/m
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

function inferObjectProperties(objectLiteral) {
  const properties = {};
  const pairs = String(objectLiteral).matchAll(/([A-Za-z_][A-Za-z0-9_]*)\s*:\s*([^,}\n]+)/g);

  for (const match of pairs) {
    const key = match[1];
    properties[key] = {
      type: inferJsonLiteralType(match[2])
    };
  }

  return properties;
}

function inferJsonLiteralType(rawValue) {
  const value = String(rawValue || '').trim();
  if (/^['"`]/.test(value)) {
    return 'string';
  }
  if (/^(true|false)\b/.test(value)) {
    return 'boolean';
  }
  if (/^-?\d+(?:\.\d+)?\b/.test(value)) {
    return 'number';
  }
  if (/^\[/.test(value)) {
    return 'array';
  }
  if (/^\{/.test(value)) {
    return 'object';
  }
  if (/^null\b/.test(value)) {
    return 'null';
  }
  return 'unknown';
}

function extractIdentifiers(text) {
  if (!text) {
    return [];
  }

  const tokens = String(text).match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];
  const blocked = new Set([
    'app', 'router', 'fastify', 'req', 'res', 'next', 'return', 'async', 'await',
    'const', 'let', 'var', 'function', 'if', 'else', 'new', 'Promise', 'true',
    'false', 'null', 'undefined', 'schema', 'method', 'url', 'path', 'handler',
    'class', 'export', 'public', 'private', 'protected'
  ]);

  return tokens.filter((token) => !blocked.has(token));
}

function inferAuthHints(chunks) {
  const values = [];
  for (const chunk of chunks) {
    const ids = extractIdentifiers(chunk);
    for (const id of ids) {
      if (/auth|guard|role|permission|admin|jwt|acl|rbac/i.test(id)) {
        values.push(id);
      }
    }
  }
  return dedupe(values);
}

function dedupeRoutes(routes) {
  const seen = new Set();
  const result = [];

  for (const route of routes) {
    const key = `${route.method} ${route.path} ${route.provenance.file}:${route.provenance.line}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(route);
    }
  }

  return result;
}

function dedupe(items) {
  return Array.from(new Set((items || []).map((item) => String(item)))).filter(Boolean);
}

function sanitizeName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_');
}

function extractFirstStringLiteral(raw) {
  if (!raw) {
    return null;
  }

  const match = String(raw).match(/['"`]([^'"`]+)['"`]/);
  return match ? match[1] : null;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function nearbySnippet(lines, index, radius) {
  const start = Math.max(0, index - radius);
  const end = Math.min(lines.length, index + radius + 1);
  return lines.slice(start, end).join('\n');
}

function lineFromIndex(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new CliError(`Failed to parse JSON at ${filePath}: ${error.message}`, 2);
  }
}

function writeJson(filePath, value) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function respondJson(res, statusCode, payload) {
  const data = JSON.stringify(payload);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', String(Buffer.byteLength(data)));
  res.end(data);
}

function respondRpcJson(res, id, result, error) {
  const payload = {
    jsonrpc: '2.0',
    id: id === undefined ? null : id
  };

  if (error) {
    payload.error = error;
  } else {
    payload.result = result;
  }

  respondJson(res, 200, payload);
}

module.exports = {
  runCli
};
