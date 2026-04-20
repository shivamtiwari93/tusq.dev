const fs = require('fs');
const http = require('http');
const path = require('path');
const crypto = require('crypto');

const VERSION = '0.1.0';
const SUPPORTED_FRAMEWORKS = ['express', 'fastify', 'nestjs'];
const SENSITIVITY_CLASSES = ['unknown', 'public', 'internal', 'confidential', 'restricted'];
const REDACTION_LOG_LEVELS = ['full', 'redacted', 'silent'];
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
    port: 'value'
  });

  if (opts.help) {
    printCommandHelp('serve');
    return;
  }

  if (positionals.length > 0) {
    throw new CliError('Usage: tusq serve [--port <n>]', 1);
  }

  const port = opts.port ? Number(opts.port) : 3100;
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new CliError('Invalid --port value.', 1);
  }

  const root = process.cwd();
  const config = readProjectConfig(root);
  const toolsDir = path.resolve(root, (config.output && config.output.tools_dir) || 'tusq-tools');

  if (!fs.existsSync(toolsDir)) {
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
    process.stdout.write(`MCP describe-only server listening on http://127.0.0.1:${port}\n`);
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
    format: 'value'
  });

  if (opts.help) {
    printCommandHelp('review');
    return;
  }

  if (positionals.length > 0) {
    throw new CliError('Usage: tusq review [--format json]', 1);
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

  if (opts.format === 'json') {
    process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
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

  let unapproved = 0;
  let lowConfidence = 0;

  for (const [domain, capabilities] of grouped.entries()) {
    process.stdout.write(`\n[${domain}]\n`);
    for (const capability of capabilities) {
      const approved = capability.approved ? 'x' : ' ';
      if (!capability.approved) {
        unapproved += 1;
      }
      if (capability.review_needed) {
        lowConfidence += 1;
      }
      const lowFlag = capability.review_needed ? ' LOW_CONFIDENCE' : '';
      process.stdout.write(
        `- [${approved}] ${capability.name} (${capability.method} ${capability.path}) confidence=${capability.confidence}${lowFlag}\n`
      );
    }
  }

  process.stdout.write(`\nSummary: ${manifest.capabilities.length} total, ${unapproved} unapproved, ${lowConfidence} low confidence.\n`);
  process.stdout.write('Approve capabilities by editing tusq.manifest.json and setting approved=true.\n');
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
  process.stdout.write('  version            Print version and exit\n');
  process.stdout.write('  help               Print this help\n');
}

function printCommandHelp(command) {
  const entries = {
    init: 'Usage: tusq init [--framework <express|fastify|nestjs>] [--verbose]',
    scan: 'Usage: tusq scan <path> [--framework <name>] [--format json] [--verbose]',
    manifest: 'Usage: tusq manifest [--out <path>] [--format json] [--verbose]',
    compile: 'Usage: tusq compile [--out <path>] [--dry-run] [--verbose]',
    serve: 'Usage: tusq serve [--port <n>] [--verbose]',
    review: 'Usage: tusq review [--format json] [--verbose]'
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

    routes.push({
      framework: 'express',
      method,
      path: routePath,
      handler,
      domain: inferDomain(routePath),
      auth_hints: inferAuthHints([handlerExpr, nearby]),
      provenance: {
        file: filePath,
        line: i + 1
      },
      schema_hint: /\bzod\b|\bz\.object\b|\bjoi\b|\bschema\b/i.test(nearby),
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
        line: i + 1
      },
      schema_hint: /\bschema\s*:/i.test(nearby),
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
        line: lineFromIndex(content, match.index)
      },
      schema_hint: /\bschema\s*:/i.test(block),
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

    routes.push({
      framework: 'nestjs',
      method,
      path: normalizeRoutePath(fullPath),
      handler,
      domain: inferDomain(fullPath, controllerPrefix),
      auth_hints: dedupe([...classGuards, ...pendingGuards, ...inferAuthHints([nearby])]),
      provenance: {
        file: filePath,
        line: i + 1
      },
      schema_hint: /dto|schema|zod|class-validator/i.test(nearby),
      middleware: dedupe([...classGuards, ...pendingGuards])
    });

    pendingGuards = [];
  }

  return routes;
}

function finalizeRouteInference(route) {
  const confidence = scoreConfidence(route);
  const hasSchema = Boolean(route.schema_hint);

  return {
    framework: route.framework,
    method: route.method,
    path: normalizeRoutePath(route.path),
    handler: route.handler,
    domain: route.domain || inferDomain(route.path),
    auth_hints: dedupe(route.auth_hints || []),
    provenance: route.provenance,
    confidence,
    input_schema: hasSchema
      ? {
        type: 'object',
        additionalProperties: true,
        description: 'Inferred from framework/type schema hints.'
      }
      : {
        type: 'object',
        additionalProperties: true,
        description: 'Schema inference unavailable; review required.'
      },
    output_schema: hasSchema
      ? {
        type: 'object',
        additionalProperties: true,
        description: 'Inferred response shape from available schema hints.'
      }
      : {
        type: 'object',
        additionalProperties: true,
        description: 'Response schema not confidently inferred.'
      }
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
  }

  if (route.path && route.path !== '/') {
    score += 0.04;
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
  if (controllerHint) {
    const clean = sanitizeName(controllerHint).replace(/^_+|_+$/g, '');
    if (clean) {
      return clean;
    }
  }

  const parts = String(routePath || '')
    .split('/')
    .map((part) => part.trim())
    .filter((part) => part && !part.startsWith(':') && !part.startsWith('{'));

  if (parts.length === 0) {
    return 'general';
  }

  return sanitizeName(parts[0]).replace(/^_+|_+$/g, '') || 'general';
}

function capabilityName(route) {
  const method = String(route.method || '').toLowerCase();
  const domain = String(route.domain || inferDomain(route.path)).toLowerCase();
  const pathPart = sanitizeName(route.path || 'root').replace(/^_+|_+$/g, '');
  return `${method}_${domain}_${pathPart}`;
}

function describeCapability(route) {
  return `${route.method.toUpperCase()} ${route.path} capability in ${route.domain} domain`;
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
