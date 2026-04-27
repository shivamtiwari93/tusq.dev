const fs = require('fs');
const http = require('http');
const path = require('path');
const crypto = require('crypto');

const VERSION = '0.1.0';
const SUPPORTED_FRAMEWORKS = ['express', 'fastify', 'nestjs'];
const SENSITIVITY_CLASSES = ['unknown', 'public', 'internal', 'confidential', 'restricted'];
const AUTH_SCHEMES = ['unknown', 'bearer', 'api_key', 'session', 'basic', 'oauth', 'none'];
const REDACTION_LOG_LEVELS = ['full', 'redacted', 'silent'];
const DOMAIN_PREFIX_SEGMENTS = new Set(['api', 'v1', 'v2', 'v3', 'v4', 'v5', 'rest', 'graphql', 'internal', 'public', 'external']);
const V1_DESCRIBE_ONLY_NOTE = 'Describe-only mode in V1. Live execution is deferred to V1.1.';

// M25/M26: frozen canonical PII field-name set and category labels.
// Expansion is a material governance event requiring its own ROADMAP milestone.
const PII_CATEGORY_BY_NAME = Object.freeze({
  // Email
  email: 'email',
  emailaddress: 'email',
  useremail: 'email',
  // Phone
  phone: 'phone',
  phonenumber: 'phone',
  mobile: 'phone',
  mobilephone: 'phone',
  telephone: 'phone',
  // Government ID
  ssn: 'government_id',
  socialsecuritynumber: 'government_id',
  taxid: 'government_id',
  nationalid: 'government_id',
  // Name
  firstname: 'name',
  lastname: 'name',
  fullname: 'name',
  middlename: 'name',
  // Address
  streetaddress: 'address',
  zipcode: 'address',
  postalcode: 'address',
  // Date of birth
  dateofbirth: 'date_of_birth',
  dob: 'date_of_birth',
  birthdate: 'date_of_birth',
  // Payment
  creditcard: 'payment',
  cardnumber: 'payment',
  cvv: 'payment',
  cvc: 'payment',
  bankaccount: 'payment',
  iban: 'payment',
  // Secrets
  password: 'secrets',
  passphrase: 'secrets',
  apikey: 'secrets',
  accesstoken: 'secrets',
  refreshtoken: 'secrets',
  authtoken: 'secrets',
  secret: 'secrets',
  // Network
  ipaddress: 'network'
});
const PII_CANONICAL_NAMES = new Set(Object.keys(PII_CATEGORY_BY_NAME));

// M30: frozen four-value surface enum. Immutable once M30 ships.
// Expansion is a material governance event requiring its own ROADMAP milestone.
const SURFACE_ENUM = Object.freeze(['chat', 'palette', 'widget', 'voice']);

// M31: frozen two-value aggregation_key enum. Immutable once M31 ships.
// Expansion is a material governance event requiring its own ROADMAP milestone.
// An implementation-time guard fires if buildDomainIndex produces a key outside this set.
const DOMAIN_INDEX_AGGREGATION_KEY_ENUM = Object.freeze(new Set(['domain', 'unknown']));

// M32: frozen four-value side_effect_class bucket-key enum. Immutable once M32 ships.
// Expansion is a material governance event requiring its own ROADMAP milestone.
// An implementation-time guard fires if buildEffectIndex produces a key outside this set.
const EFFECT_INDEX_SIDE_EFFECT_CLASS_ENUM = Object.freeze(new Set(['read', 'write', 'destructive', 'unknown']));

// M32: frozen two-value aggregation_key enum (parallel to M31's domain|unknown). Immutable once M32 ships.
// An implementation-time guard fires if buildEffectIndex produces a key outside this set.
const EFFECT_INDEX_AGGREGATION_KEY_ENUM = Object.freeze(new Set(['class', 'unknown']));

// M32: closed-enum bucket iteration order (read → write → destructive). NOT risk-precedence — deterministic stable-output convention only.
// The unknown bucket is always appended last. Empty buckets MUST NOT appear.
const EFFECT_INDEX_BUCKET_ORDER = Object.freeze(['read', 'write', 'destructive']);

// M34: frozen two-value aggregation_key enum (parallel to M31/M32/M33). Immutable once M34 ships.
// An implementation-time guard fires if buildMethodIndex produces a key outside this set.
const METHOD_INDEX_AGGREGATION_KEY_ENUM = Object.freeze(new Set(['method', 'unknown']));

// M34: closed-enum bucket iteration order (GET → POST → PUT → PATCH → DELETE). NOT risk-precedence —
// matches the conventional REST CRUD reading order (read, create, replace, update, delete) but carries
// no risk semantic. The unknown bucket is always appended last. Empty buckets MUST NOT appear.
const METHOD_INDEX_BUCKET_ORDER = Object.freeze(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

// M34: valid canonical REST method values that map to named buckets (verbatim uppercase from manifest).
// Any other value (null, empty-string, HEAD, OPTIONS, TRACE, CONNECT, non-canonical) maps to unknown.
const METHOD_INDEX_VALID_METHODS = Object.freeze(new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']));

// M35: frozen two-value aggregation_key enum (parallel to M31/M32/M33/M34). Immutable once M35 ships.
// An implementation-time guard fires if buildAuthIndex produces a key outside this set.
const AUTH_SCHEME_INDEX_AGGREGATION_KEY_ENUM = Object.freeze(new Set(['scheme', 'unknown']));

// M35: closed-enum bucket iteration order (bearer → api_key → session → basic → oauth → none). NOT IAM-strength-precedence —
// deterministic stable-output convention only (mirrors M29 AUTH_SCHEMES decision table ordering, not a trust ladder).
// The unknown bucket is always appended last. Empty buckets MUST NOT appear.
// Derived from AUTH_SCHEMES (M29, line 9): filter out 'unknown' (appended last by convention); preserves AUTH_SCHEMES ordering.
// A module-init guard below fires synchronously if AUTH_SCHEME_INDEX_BUCKET_ORDER ∪ {'unknown'} ever diverges from AUTH_SCHEMES.
const AUTH_SCHEME_INDEX_BUCKET_ORDER = Object.freeze(AUTH_SCHEMES.filter((s) => s !== 'unknown'));

// M35: module-init alignment guard — throws synchronously if AUTH_SCHEME_INDEX_BUCKET_ORDER ∪ {'unknown'} diverges from AUTH_SCHEMES.
// Ensures any future M29 AUTH_SCHEMES extension (e.g., 'mtls', 'aws_sigv4') surfaces as an immediate startup error rather than
// silent drift between the M29 classifier and the M35 bucket-key enum. ROADMAP milestone required for any AUTH_SCHEMES change.
;(function _guardAuthSchemeBucketAlignment() {
  const expected = new Set([...AUTH_SCHEME_INDEX_BUCKET_ORDER, 'unknown']);
  const actual = new Set(AUTH_SCHEMES);
  const missing = [...actual].filter((s) => !expected.has(s));
  const extra = [...expected].filter((s) => !actual.has(s));
  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      'M35 bucket alignment broken: AUTH_SCHEME_INDEX_BUCKET_ORDER \u222a {unknown} diverges from AUTH_SCHEMES. ' +
      'Update M35 bucket order or M29 AUTH_SCHEMES under a fresh ROADMAP milestone. ' +
      'Missing from bucket set: [' + missing.join(', ') + ']. Extra in bucket set: [' + extra.join(', ') + '].'
    );
  }
}());

// M36: frozen four-value confidence_tier bucket-key enum. Immutable once M36 ships.
// Tier function thresholds (0.85 for high, 0.6 for medium/low boundary) are immutable once M36 ships.
// Expansion is a material governance event requiring its own ROADMAP milestone.
const CONFIDENCE_TIER_ENUM = Object.freeze(new Set(['high', 'medium', 'low', 'unknown']));

// M36: frozen two-value aggregation_key enum (parallel to M31–M35). Immutable once M36 ships.
// An implementation-time guard fires if buildConfidenceIndex produces a key outside this set.
const CONFIDENCE_TIER_AGGREGATION_KEY_ENUM = Object.freeze(new Set(['tier', 'unknown']));

// M36: closed-enum bucket iteration order (high → medium → low). NOT evidence-strength-ranked nor trust-ranked —
// deterministic stable-output convention only. MUST NOT be described as "evidence-strength-ranked," "trust-ranked,"
// or "highest-quality-first." The unknown bucket is always appended last. Empty buckets MUST NOT appear.
const CONFIDENCE_TIER_BUCKET_ORDER = Object.freeze(['high', 'medium', 'low']);

// M37: frozen five-value pii_field_count_tier bucket-key enum. Immutable once M37 ships.
// Tier function thresholds (0/2/5/6) are immutable once M37 ships. Any addition or threshold change is a governance event.
// Expansion is a material governance event requiring its own ROADMAP milestone.
const PII_FIELD_COUNT_TIER_ENUM = Object.freeze(new Set(['none', 'low', 'medium', 'high', 'unknown']));

// M37: frozen two-value aggregation_key enum (parallel to M31–M36). Immutable once M37 ships.
// An implementation-time guard fires if buildPiiFieldCountTierIndex produces a key outside this set.
const PII_FIELD_COUNT_TIER_AGGREGATION_KEY_ENUM = Object.freeze(new Set(['tier', 'unknown']));

// M37: closed-enum bucket iteration order (none → low → medium → high). NOT leakage-risk-precedence —
// deterministic stable-output convention only. MUST NOT be described as "leakage-ranked" or "exposure-ordered."
// The unknown bucket is always appended last. Empty buckets MUST NOT appear.
const PII_FIELD_COUNT_TIER_BUCKET_ORDER = Object.freeze(['none', 'low', 'medium', 'high']);

// M38: frozen five-value examples_count_tier bucket-key enum. Immutable once M38 ships.
// Tier function thresholds (0/2/5/6) are immutable once M38 ships. Any addition or threshold change is a governance event.
// Expansion is a material governance event requiring its own ROADMAP milestone.
const EXAMPLES_COUNT_TIER_ENUM = Object.freeze(new Set(['none', 'low', 'medium', 'high', 'unknown']));

// M38: frozen two-value aggregation_key enum (parallel to M31–M37). Immutable once M38 ships.
// An implementation-time guard fires if buildExamplesCountTierIndex produces a key outside this set.
const EXAMPLES_COUNT_TIER_AGGREGATION_KEY_ENUM = Object.freeze(new Set(['tier', 'unknown']));

// M38: closed-enum bucket iteration order (none → low → medium → high). NOT coverage-quality-ranked —
// deterministic stable-output convention only. MUST NOT be described as "coverage-quality-ranked,"
// "test-strength-ranked," or "eval-readiness-ranked."
// The unknown bucket is always appended last. Empty buckets MUST NOT appear.
const EXAMPLES_COUNT_TIER_BUCKET_ORDER = Object.freeze(['none', 'low', 'medium', 'high']);

// M39: frozen five-value required_input_field_count_tier bucket-key enum. Immutable once M39 ships.
// Tier function thresholds (0/2/5/6) are immutable once M39 ships. Any addition or threshold change is a governance event.
// Expansion is a material governance event requiring its own ROADMAP milestone.
const REQUIRED_INPUT_FIELD_COUNT_TIER_ENUM = Object.freeze(new Set(['none', 'low', 'medium', 'high', 'unknown']));

// M39: frozen two-value aggregation_key enum (parallel to M31–M38). Immutable once M39 ships.
// An implementation-time guard fires if buildRequiredInputFieldCountTierIndex produces a key outside this set.
const REQUIRED_INPUT_FIELD_COUNT_TIER_AGGREGATION_KEY_ENUM = Object.freeze(new Set(['tier', 'unknown']));

// M39: closed-enum bucket iteration order (none → low → medium → high). NOT exposure-risk-ranked —
// deterministic stable-output convention only. MUST NOT be described as "exposure-risk-ranked,"
// "blast-radius-ranked," "easy-call-ranked," or "input-complexity-ranked."
// The unknown bucket is always appended last. Empty buckets MUST NOT appear.
const REQUIRED_INPUT_FIELD_COUNT_TIER_BUCKET_ORDER = Object.freeze(['none', 'low', 'medium', 'high']);

// M40: frozen five-value output_schema_property_count_tier bucket-key enum. Immutable once M40 ships.
// Tier function thresholds (0/2/5/6) are immutable once M40 ships. Any addition or threshold change is a governance event.
// Expansion is a material governance event requiring its own ROADMAP milestone.
const OUTPUT_SCHEMA_PROPERTY_COUNT_TIER_ENUM = Object.freeze(new Set(['none', 'low', 'medium', 'high', 'unknown']));

// M40: frozen two-value aggregation_key enum (parallel to M31–M39). Immutable once M40 ships.
// An implementation-time guard fires if buildOutputSchemaPropertyCountTierIndex produces a key outside this set.
const OUTPUT_SCHEMA_PROPERTY_COUNT_TIER_AGGREGATION_KEY_ENUM = Object.freeze(new Set(['tier', 'unknown']));

// M40: closed-enum bucket iteration order (none → low → medium → high). NOT doc-drift-risk-ranked —
// deterministic stable-output convention only. MUST NOT be described as "doc-drift-risk-ranked,"
// "staleness-ranked," "contract-surface-area-ranked," or "drift-blast-radius-ranked."
// The unknown bucket is always appended last. Empty buckets MUST NOT appear.
const OUTPUT_SCHEMA_PROPERTY_COUNT_TIER_BUCKET_ORDER = Object.freeze(['none', 'low', 'medium', 'high']);

// M41: frozen five-value path_segment_count_tier bucket-key enum. Immutable once M41 ships.
// Tier function thresholds (0/2/4/5) are immutable once M41 ships. Any addition or threshold change is a governance event.
// Expansion is a material governance event requiring its own ROADMAP milestone.
const PATH_SEGMENT_COUNT_TIER_ENUM = Object.freeze(new Set(['none', 'low', 'medium', 'high', 'unknown']));

// M41: frozen two-value aggregation_key enum (parallel to M31–M40). Immutable once M41 ships.
// An implementation-time guard fires if buildPathSegmentCountTierIndex produces a key outside this set.
const PATH_SEGMENT_COUNT_TIER_AGGREGATION_KEY_ENUM = Object.freeze(new Set(['tier', 'unknown']));

// M41: closed-enum bucket iteration order (none → low → medium → high). NOT sprawl-risk-ranked —
// deterministic stable-output convention only. MUST NOT be described as "sprawl-risk-ranked,"
// "blast-radius-ranked," "depth-ranked," or "operator-visibility-ranked."
// The unknown bucket is always appended last. Empty buckets MUST NOT appear.
const PATH_SEGMENT_COUNT_TIER_BUCKET_ORDER = Object.freeze(['none', 'low', 'medium', 'high']);

// M42: frozen seven-value output_schema_top_level_type bucket-key enum. Immutable once M42 ships.
// The six spec primitives are the JSON Schema 2020-12 core type values (object, array, string, number, boolean, null).
// 'integer' is intentionally NOT a separate bucket — per JSON Schema spec, 'integer' is a subset of 'number';
// capabilities with type:'integer' are bucketed as 'unknown' with reason output_schema_type_field_value_not_in_json_schema_primitive_set.
// Expansion is a material governance event requiring its own ROADMAP milestone.
const OUTPUT_SCHEMA_TOP_LEVEL_TYPE_ENUM = Object.freeze(new Set(['object', 'array', 'string', 'number', 'boolean', 'null', 'unknown']));

// M42: frozen two-value aggregation_key enum (parallel to M31–M41). Immutable once M42 ships.
// An implementation-time guard fires if buildOutputSchemaTopLevelTypeIndex produces a key outside this set.
const OUTPUT_SCHEMA_TOP_LEVEL_TYPE_AGGREGATION_KEY_ENUM = Object.freeze(new Set(['type', 'unknown']));

// M42: closed-enum bucket iteration order (object → array → string → number → boolean → null). NOT data-contract-completeness-ranked —
// deterministic stable-output convention only (matches JSON Schema 2020-12 spec primitive enumeration order but carries
// no semantic claim about contract richness, blast radius, or shape complexity).
// The unknown bucket is always appended last. Empty buckets MUST NOT appear.
// MUST NOT be described as "data-contract-completeness-ranked," "shape-complexity-ranked," "data-lineage-blast-radius-ranked,"
// "DTO-richness-ranked," or "JSON-Schema-spec-precedence-ranked."
const OUTPUT_SCHEMA_TOP_LEVEL_TYPE_BUCKET_ORDER = Object.freeze(['object', 'array', 'string', 'number', 'boolean', 'null']);

// M33: frozen two-value aggregation_key enum (parallel to M31/M32). Immutable once M33 ships.
// An implementation-time guard fires if buildSensitivityIndex produces a key outside this set.
const SENSITIVITY_INDEX_AGGREGATION_KEY_ENUM = Object.freeze(new Set(['class', 'unknown']));

// M33: closed-enum bucket iteration order (public → internal → confidential → restricted). NOT risk-precedence — deterministic stable-output convention only.
// The unknown bucket is always appended last. Empty buckets MUST NOT appear.
// NOTE: bucket-key enum reuses SENSITIVITY_CLASSES (M28, line 8) directly — no independent enum declared (M33 Key Risk).
const SENSITIVITY_INDEX_BUCKET_ORDER = Object.freeze(['public', 'internal', 'confidential', 'restricted']);

// M30: frozen six-value gated_reason enum. Immutable once M30 ships.
// An implementation-time guard fires if classifyGating returns a value outside this set.
const GATED_REASON_ENUM = Object.freeze(new Set([
  'unapproved',
  'restricted_sensitivity',
  'confidential_sensitivity',
  'destructive_side_effect',
  'auth_scheme_unknown',
  'auth_scheme_oauth_pending_v2'
]));

// M30: frozen brand_inputs_required named-lists (names only; no values).
// Immutable once M30 ships — adding a name is a material governance event.
const BRAND_INPUTS_REQUIRED = Object.freeze({
  chat: Object.freeze(['brand.tone', 'brand.color_primary', 'brand.color_secondary', 'brand.font_family']),
  palette: Object.freeze(['brand.color_primary', 'brand.font_family']),
  widget: Object.freeze(['brand.color_primary', 'brand.color_accent', 'brand.layout_density', 'brand.radius']),
  voice: Object.freeze(['brand.tone', 'voice.persona', 'voice.greeting'])
});

// M27: frozen reviewer advisory set for tusq redaction review.
// Wording and em-dash usage are part of the governance contract.
const PII_REVIEW_ADVISORY_BY_CATEGORY = Object.freeze({
  email: "Contact-PII field detected — reviewer: choose retention window, log masking, and trace redaction aligned with your org's contact-data policy.",
  phone: "Contact-PII field detected — reviewer: choose retention window, log masking, and trace redaction aligned with your org's contact-data policy.",
  government_id: "High-sensitivity government-ID field detected — reviewer: apply your org's strictest retention, logging, and trace-redaction defaults.",
  name: "Personal-name field detected — reviewer: decide whether the field should be logged in plaintext, masked, or redacted; retention follows your org's contact-data policy.",
  address: "Physical-address field detected — reviewer: choose retention window, log masking, and trace redaction aligned with your org's contact-data policy.",
  date_of_birth: "Date-of-birth field detected — reviewer: apply age-sensitive retention and redaction defaults; some jurisdictions treat DOB as higher-risk PII.",
  payment: "Payment-data field detected — reviewer: apply your org's payment-data retention, logging, and masking rules (e.g., PCI-aligned defaults owned by your team).",
  secrets: "Secret or credential field detected — reviewer: this field SHOULD NOT be logged in plaintext; apply trace redaction and minimal retention at your org's standard.",
  network: "Network-identifier field detected — reviewer: choose retention and masking aligned with your org's logging policy; some jurisdictions treat IP addresses as PII."
});

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
    case 'auth':
      cmdAuth(args);
      return;
    case 'confidence':
      cmdConfidence(args);
      return;
    case 'diff':
      cmdDiff(args);
      return;
    case 'domain':
      cmdDomain(args);
      return;
    case 'effect':
      cmdEffect(args);
      return;
    case 'examples':
      cmdExamples(args);
      return;
    case 'input':
      cmdInput(args);
      return;
    case 'method':
      cmdMethod(args);
      return;
    case 'output':
      cmdOutput(args);
      return;
    case 'path':
      cmdPath(args);
      return;
    case 'pii':
      cmdPii(args);
      return;
    case 'policy':
      cmdPolicy(args);
      return;
    case 'redaction':
      cmdRedaction(args);
      return;
    case 'response':
      cmdResponse(args);
      return;
    case 'sensitivity':
      cmdSensitivity(args);
      return;
    case 'surface':
      cmdSurface(args);
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
  const preserveMap = new Map();
  const examplesMap = new Map();
  const constraintsMap = new Map();
  const redactionMap = new Map();
  const approvedByMap = new Map();
  const approvedAtMap = new Map();
  if (existing && Array.isArray(existing.capabilities)) {
    for (const capability of existing.capabilities) {
      const key = capabilityKey(capability.method, capability.path);
      approvalMap.set(key, Boolean(capability.approved));
      // M28: preserve flag is human-editable; carry it forward when set to true
      if (capability.preserve === true) {
        preserveMap.set(key, true);
      }
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
      sensitivity_class: 'unknown', // M28: computed below after pii_categories are populated
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
    // M28: preserve flag carried forward from existing manifest (human-editable)
    if (preserveMap.has(key)) {
      capability.preserve = true;
    }
    // M25: auto-extract PII field-name hints from the scanned input_schema.properties
    capability.redaction.pii_fields = extractPiiFieldHints(
      capability.input_schema && capability.input_schema.properties
    );
    capability.redaction.pii_categories = extractPiiFieldCategories(capability.redaction.pii_fields);
    // M28: compute sensitivity_class as a pure function of the full manifest evidence
    capability.sensitivity_class = classifySensitivity(capability);
    // M29: compute auth_requirements as a pure function of manifest evidence
    capability.auth_requirements = classifyAuthRequirements(capability);
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
  // M28: pre-check for --sensitivity without a value before parseCommandArgs
  const sensIdx = args.indexOf('--sensitivity');
  if (sensIdx !== -1) {
    const nextArg = args[sensIdx + 1];
    if (!nextArg || nextArg.startsWith('--')) {
      throw new CliError('--sensitivity requires a value', 1);
    }
  }

  // M29: pre-check for --auth-scheme without a value
  const authSchemeIdx = args.indexOf('--auth-scheme');
  if (authSchemeIdx !== -1) {
    const nextArg = args[authSchemeIdx + 1];
    if (!nextArg || nextArg.startsWith('--')) {
      throw new CliError('--auth-scheme requires a value', 1);
    }
  }

  const { opts, positionals } = parseCommandArgs('review', args, {
    format: 'value',
    strict: 'boolean',
    sensitivity: 'value',
    'auth-scheme': 'value'
  });

  if (opts.help) {
    printCommandHelp('review');
    return;
  }

  if (positionals.length > 0) {
    throw new CliError('Usage: tusq review [--format json] [--strict] [--sensitivity <class>] [--auth-scheme <scheme>]', 1);
  }

  if (opts.format && opts.format !== 'json') {
    throw new CliError('Invalid --format value. Supported: json', 1);
  }

  // M28: validate --sensitivity filter value
  if (opts.sensitivity !== undefined && !SENSITIVITY_CLASSES.includes(opts.sensitivity)) {
    throw new CliError(
      `Unknown sensitivity class: ${opts.sensitivity}. Legal values: ${SENSITIVITY_CLASSES.join(', ')}`,
      1
    );
  }

  // M29: validate --auth-scheme filter value
  if (opts['auth-scheme'] !== undefined && !AUTH_SCHEMES.includes(opts['auth-scheme'])) {
    throw new CliError(
      `Unknown auth scheme: ${opts['auth-scheme']}. Legal values: ${AUTH_SCHEMES.join(', ')}`,
      1
    );
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
  // M28: exit code based on ALL capabilities regardless of --sensitivity filter
  const reviewStats = getReviewStats(manifest);

  if (opts.format === 'json') {
    process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
    enforceStrictReviewIfRequested(opts.strict, reviewStats);
    return;
  }

  // M28/M29: apply display filters (do not affect exit code)
  const allCapabilities = manifest.capabilities || [];
  let displayCapabilities = allCapabilities;
  if (opts.sensitivity !== undefined) {
    displayCapabilities = displayCapabilities.filter((c) => normalizeSensitivityClass(c.sensitivity_class) === opts.sensitivity);
  }
  if (opts['auth-scheme'] !== undefined) {
    displayCapabilities = displayCapabilities.filter((c) => {
      const scheme = (c.auth_requirements && normalizeAuthScheme(c.auth_requirements.auth_scheme)) || 'unknown';
      return scheme === opts['auth-scheme'];
    });
  }

  const grouped = new Map();
  for (const capability of displayCapabilities) {
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
      const sensitivityLabel = normalizeSensitivityClass(capability.sensitivity_class);
      const authSchemeLabel = (capability.auth_requirements && normalizeAuthScheme(capability.auth_requirements.auth_scheme)) || 'unknown';
      const inputSummary = summarizeInputSchemaForReview(capability.input_schema);
      const outputSummary = summarizeOutputSchemaForReview(capability.output_schema);
      const provenanceSummary = summarizeProvenanceForReview(capability.provenance);
      process.stdout.write(
        `- [${approved}] ${capability.name} (${capability.method} ${capability.path}) confidence=${capability.confidence}${lowFlag} sensitivity=${sensitivityLabel} auth=${authSchemeLabel} inputs=${inputSummary} returns=${outputSummary} source=${provenanceSummary}\n`
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
    lines.push(`- Auth scheme: ${formatScalar(capability.auth_requirements ? normalizeAuthScheme(capability.auth_requirements.auth_scheme) : 'unknown')}`);
    lines.push(`- Domain: ${formatScalar(capability.domain)}`);
    lines.push(`- Confidence: ${formatScalar(capability.confidence)}`);
    lines.push(`- Capability digest: ${formatScalar(capability.capability_digest)}`);
    lines.push('');
    appendJsonSection(lines, 'Input schema', capability.input_schema);
    appendJsonSection(lines, 'Output schema', capability.output_schema);
    appendJsonSection(lines, 'Auth requirements', capability.auth_requirements || null);
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

function cmdRedaction(args) {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printCommandHelp('redaction');
    return;
  }

  const sub = args[0];
  const rest = args.slice(1);
  if (sub === 'review') {
    cmdRedactionReview(rest);
    return;
  }

  throw new CliError(`Unknown subcommand: ${sub}`, 1);
}

// M30: tusq surface — dispatcher
function cmdSurface(args) {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printCommandHelp('surface');
    return;
  }

  const sub = args[0];
  const rest = args.slice(1);
  if (sub === 'plan') {
    cmdSurfacePlan(rest);
    return;
  }

  throw new CliError(`Unknown subcommand: ${sub}`, 1);
}

// M30: tusq surface plan — handler
function cmdSurfacePlan(args) {
  const { opts, positionals } = parseSurfacePlanArgs(args);

  if (opts.help) {
    printCommandHelp('surface plan');
    return;
  }
  if (positionals.length > 0) {
    throw new CliError(`Unknown subcommand: ${positionals[0]}`, 1);
  }

  const surfaceFilter = opts.surface || 'all';
  const VALID_SURFACE_TOKENS = new Set([...SURFACE_ENUM, 'all']);
  if (!VALID_SURFACE_TOKENS.has(surfaceFilter)) {
    throw new CliError(`Unknown surface: ${surfaceFilter}`, 1);
  }

  const root = process.cwd();
  const manifestPath = opts.manifest
    ? path.resolve(root, opts.manifest)
    : path.join(root, 'tusq.manifest.json');

  // Validate --out path before reading the manifest (detection-before-output)
  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    // Reject any path whose resolved components include '.tusq' (governance directory guard)
    if (outPath.split(path.sep).includes('.tusq')) {
      throw new CliError('--out path must not be inside .tusq/', 1);
    }
    // Validate writable (attempt mkdir of parent; actual write happens after plan is built)
    try {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
    } catch (e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
  }

  let raw;
  try {
    raw = fs.readFileSync(manifestPath, 'utf8');
  } catch (_e) {
    throw new CliError(`Manifest not found: ${manifestPath}`, 1);
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (_e) {
    throw new CliError(`Invalid manifest JSON: ${manifestPath}`, 1);
  }

  if (!manifest || typeof manifest !== 'object' || !Array.isArray(manifest.capabilities)) {
    throw new CliError('Invalid manifest: missing capabilities array', 1);
  }

  const plan = buildSurfacePlan(manifest, manifestPath, surfaceFilter);

  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    try {
      fs.writeFileSync(outPath, `${JSON.stringify(plan, null, 2)}\n`, 'utf8');
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
    return;
  }

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatSurfacePlan(plan));
}

function parseSurfacePlanArgs(args) {
  const opts = {};
  const positionals = [];

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
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

    const knownFlags = new Set(['surface', 'manifest', 'out', 'json']);
    if (!knownFlags.has(key)) {
      throw new CliError(`Unknown flag: --${key}`, 1);
    }

    if (key === 'json') {
      opts.json = true;
      continue;
    }

    if (value === undefined) {
      const next = args[i + 1];
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

// M30: classifyGating(capability, surface) → gated_reason | null
// Returns the first failing gate's reason (first-match-wins), or null if eligible.
// Throws synchronously if the returned reason would be outside the closed six-value set.
function classifyGating(capability, surface) {
  const approved = capability.approved === true;
  const sensitivityClass = capability.sensitivity_class || 'unknown';
  const sideEffectClass = capability.side_effect_class || 'read';
  const authScheme = (capability.auth_requirements && capability.auth_requirements.auth_scheme) || 'unknown';

  // Gate 1 (all surfaces): approved === true
  if (!approved) return _guardGatedReason('unapproved');

  // Gate 2 (chat, palette, voice; NOT widget): sensitivity_class !== 'restricted'
  if (surface !== 'widget') {
    if (sensitivityClass === 'restricted') return _guardGatedReason('restricted_sensitivity');
  }

  // Gate 3 (chat, palette, voice; NOT widget): sensitivity_class !== 'confidential'
  if (surface !== 'widget') {
    if (sensitivityClass === 'confidential') return _guardGatedReason('confidential_sensitivity');
  }

  // Gate 4 (palette, voice; NOT chat, NOT widget): destructive side effect forbidden
  if (surface === 'palette' || surface === 'voice') {
    if (sideEffectClass === 'destructive') return _guardGatedReason('destructive_side_effect');
  }

  // Gate 5 (all surfaces): auth_scheme !== 'unknown'
  if (authScheme === 'unknown') return _guardGatedReason('auth_scheme_unknown');

  // Gate 6 (all surfaces): auth_scheme !== 'oauth' (deferred to V2)
  if (authScheme === 'oauth') return _guardGatedReason('auth_scheme_oauth_pending_v2');

  return null;
}

function _guardGatedReason(reason) {
  if (!GATED_REASON_ENUM.has(reason)) {
    throw new Error(`Internal error: classifyGating returned unknown reason: ${reason}`);
  }
  return reason;
}

// M30: derive deterministic intent/action label from capability
function _deriveSurfaceLabel(capability) {
  const desc = typeof capability.description === 'string' && capability.description.trim();
  if (desc) return desc;
  return String(capability.name || '').replace(/[_-]/g, ' ');
}

// M30: buildSurfacePlan(manifest, manifestPath, surfaceFilter) → plan object
function buildSurfacePlan(manifest, manifestPath, surfaceFilter) {
  const manifestVersion = typeof manifest.manifest_version === 'number' ? manifest.manifest_version : null;
  const generatedAt = typeof manifest.generated_at === 'string' ? manifest.generated_at : null;
  const capabilities = manifest.capabilities;

  if (capabilities.length === 0) {
    return {
      manifest_path: manifestPath,
      manifest_version: manifestVersion,
      generated_at: generatedAt,
      surfaces: []
    };
  }

  const surfacesToPlan = surfaceFilter === 'all' ? SURFACE_ENUM.slice() : [surfaceFilter];

  const surfaces = surfacesToPlan.map((surface) => {
    const eligibleCapabilities = [];
    const gatedCapabilities = [];

    for (const capability of capabilities) {
      const reason = classifyGating(capability, surface);
      if (reason === null) {
        eligibleCapabilities.push(capability.name);
      } else {
        gatedCapabilities.push({ name: capability.name, reason });
      }
    }

    // entry_points: derived deterministically from capability data
    let entryPoints;
    if (surface === 'chat') {
      entryPoints = {
        intents: eligibleCapabilities.map((name) => {
          const cap = capabilities.find((c) => c.name === name);
          return { capability: name, intent_label: _deriveSurfaceLabel(cap) };
        })
      };
    } else if (surface === 'palette') {
      entryPoints = {
        actions: eligibleCapabilities.map((name) => {
          const cap = capabilities.find((c) => c.name === name);
          return { capability: name, action_label: _deriveSurfaceLabel(cap) };
        })
      };
    } else if (surface === 'widget') {
      const actionWidgets = [];
      const insightWidgets = [];
      for (const name of eligibleCapabilities) {
        const cap = capabilities.find((c) => c.name === name);
        const sideEffect = (cap && cap.side_effect_class) || 'read';
        if (sideEffect === 'read') {
          insightWidgets.push({ capability: name });
        } else {
          actionWidgets.push({ capability: name });
        }
      }
      entryPoints = { action_widgets: actionWidgets, insight_widgets: insightWidgets };
    } else {
      // voice
      entryPoints = {
        voice_intents: eligibleCapabilities.map((name) => {
          const cap = capabilities.find((c) => c.name === name);
          return { capability: name, intent_label: _deriveSurfaceLabel(cap) };
        })
      };
    }

    // redaction_posture: copy-forward of M27 advisory set verbatim per eligible capability
    const redactionPosture = {};
    for (const name of eligibleCapabilities) {
      const cap = capabilities.find((c) => c.name === name);
      const redaction = (cap && cap.redaction && typeof cap.redaction === 'object') ? cap.redaction : {};
      const piiFields = Array.isArray(redaction.pii_fields) ? redaction.pii_fields.slice() : [];
      const piiCategories = Array.isArray(redaction.pii_categories) ? redaction.pii_categories.slice() : [];
      redactionPosture[name] = {
        pii_fields: piiFields,
        pii_categories: piiCategories,
        advisories: buildPiiReviewAdvisories(piiCategories)
      };
    }

    // auth_posture: copy-forward of M29 auth_requirements record verbatim per eligible capability
    const authPosture = {};
    for (const name of eligibleCapabilities) {
      const cap = capabilities.find((c) => c.name === name);
      authPosture[name] = (cap && cap.auth_requirements && typeof cap.auth_requirements === 'object')
        ? cap.auth_requirements
        : { auth_scheme: 'unknown', auth_scopes: [], auth_roles: [], evidence_source: 'none' };
    }

    return {
      surface,
      eligible_capabilities: eligibleCapabilities,
      gated_capabilities: gatedCapabilities,
      entry_points: entryPoints,
      redaction_posture: redactionPosture,
      auth_posture: authPosture,
      brand_inputs_required: BRAND_INPUTS_REQUIRED[surface].slice()
    };
  });

  return {
    manifest_path: manifestPath,
    manifest_version: manifestVersion,
    generated_at: generatedAt,
    surfaces
  };
}

// M30: format surface plan as human-readable text
function formatSurfacePlan(plan) {
  if (plan.surfaces.length === 0) {
    return 'No capabilities in manifest — nothing to plan.\n';
  }

  const version = plan.manifest_version === null ? 'unknown' : String(plan.manifest_version);
  const generatedAt = plan.generated_at === null ? 'unknown' : plan.generated_at;
  const lines = [
    `Surface Plan: ${plan.manifest_path}`,
    `manifest_version: ${version}`,
    `generated_at: ${generatedAt}`,
    'Note: This is a planning aid, not a runtime surface generator.',
    ''
  ];

  for (const surfacePlan of plan.surfaces) {
    lines.push(`[${surfacePlan.surface}]`);
    lines.push(`  eligible: ${surfacePlan.eligible_capabilities.join(', ') || '(none)'}`);
    if (surfacePlan.gated_capabilities.length > 0) {
      lines.push('  gated:');
      for (const gated of surfacePlan.gated_capabilities) {
        lines.push(`    - ${gated.name}: ${gated.reason}`);
      }
    } else {
      lines.push('  gated: (none)');
    }
    lines.push(`  brand_inputs_required: ${surfacePlan.brand_inputs_required.join(', ')}`);
    lines.push('');
  }

  return lines.join('\n');
}

// M31: tusq domain — enumerator (mirrors cmdSurface, cmdPolicy, cmdRedaction)
function cmdDomain(args) {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printCommandHelp('domain');
    return;
  }

  const sub = args[0];
  const rest = args.slice(1);
  if (sub === 'index') {
    cmdDomainIndex(rest);
    return;
  }

  throw new CliError(`Unknown subcommand: ${sub}`, 1);
}

// M31: tusq domain index — handler
function cmdDomainIndex(args) {
  const { opts, positionals } = parseDomainIndexArgs(args);

  if (opts.help) {
    printCommandHelp('domain index');
    return;
  }
  if (positionals.length > 0) {
    throw new CliError(`Unknown subcommand: ${positionals[0]}`, 1);
  }

  const root = process.cwd();
  const manifestPath = opts.manifest
    ? path.resolve(root, opts.manifest)
    : path.join(root, 'tusq.manifest.json');

  // Validate --out path before reading the manifest (detection-before-output)
  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    if (outPath.split(path.sep).includes('.tusq')) {
      throw new CliError('--out path must not be inside .tusq/', 1);
    }
    try {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
  }

  let raw;
  try {
    raw = fs.readFileSync(manifestPath, 'utf8');
  } catch (_e) {
    throw new CliError(`Manifest not found: ${manifestPath}`, 1);
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (_e) {
    throw new CliError(`Invalid manifest JSON: ${manifestPath}`, 1);
  }

  if (!manifest || typeof manifest !== 'object' || !Array.isArray(manifest.capabilities)) {
    throw new CliError('Invalid manifest: missing capabilities array', 1);
  }

  const fullIndex = buildDomainIndex(manifest, manifestPath);

  const domainFilter = opts.domain || null;
  let outputIndex;
  if (domainFilter !== null) {
    const matchedEntry = fullIndex.domains.find((e) => e.domain === domainFilter);
    if (!matchedEntry) {
      throw new CliError(`Unknown domain: ${domainFilter}`, 1);
    }
    outputIndex = Object.assign({}, fullIndex, { domains: [matchedEntry] });
  } else {
    outputIndex = fullIndex;
  }

  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    try {
      fs.writeFileSync(outPath, `${JSON.stringify(outputIndex, null, 2)}\n`, 'utf8');
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
    return;
  }

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(outputIndex, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatDomainIndex(outputIndex));
}

function parseDomainIndexArgs(args) {
  const opts = {};
  const positionals = [];

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
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

    const knownFlags = new Set(['domain', 'manifest', 'out', 'json']);
    if (!knownFlags.has(key)) {
      throw new CliError(`Unknown flag: --${key}`, 1);
    }

    if (key === 'json') {
      opts.json = true;
      continue;
    }

    if (value === undefined) {
      const next = args[i + 1];
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

function _guardAggregationKey(key) {
  if (!DOMAIN_INDEX_AGGREGATION_KEY_ENUM.has(key)) {
    throw new Error(`Internal error: aggregation_key outside closed two-value enum: ${key}`);
  }
  return key;
}

// M31: buildDomainIndex(manifest, manifestPath) → index object
// Builds a full unfiltered domain index from the manifest's capabilities[].
// Per-domain iteration order is manifest first-appearance order; unknown bucket is appended last.
function buildDomainIndex(manifest, manifestPath) {
  const manifestVersion = typeof manifest.manifest_version === 'number' ? manifest.manifest_version : null;
  const generatedAt = typeof manifest.generated_at === 'string' ? manifest.generated_at : null;
  const capabilities = manifest.capabilities;

  if (capabilities.length === 0) {
    return {
      manifest_path: manifestPath,
      manifest_version: manifestVersion,
      generated_at: generatedAt,
      domains: []
    };
  }

  // Track domain buckets in manifest first-appearance order.
  // 'unknown' bucket is tracked separately and always appended last.
  const domainOrder = []; // first-appearance order of named (non-unknown) domain keys
  const buckets = Object.create(null); // domainKey → capability[]
  let hasUnknownBucket = false;

  for (const capability of capabilities) {
    const rawDomain = capability.domain;
    const isUnknown = rawDomain === null || rawDomain === undefined || rawDomain === '';
    const bucketKey = isUnknown ? '__unknown__' : String(rawDomain);

    if (isUnknown) {
      if (!hasUnknownBucket) {
        hasUnknownBucket = true;
        buckets['__unknown__'] = [];
      }
      buckets['__unknown__'].push(capability);
    } else {
      if (!buckets[bucketKey]) {
        domainOrder.push(bucketKey);
        buckets[bucketKey] = [];
      }
      buckets[bucketKey].push(capability);
    }
  }

  const allBucketKeys = [...domainOrder, ...(hasUnknownBucket ? ['__unknown__'] : [])];

  const domains = allBucketKeys.map((bucketKey) => {
    const isUnknownBucket = bucketKey === '__unknown__';
    const domainName = isUnknownBucket ? 'unknown' : bucketKey;
    const aggregationKey = isUnknownBucket ? _guardAggregationKey('unknown') : _guardAggregationKey('domain');
    const caps = buckets[bucketKey];
    const capabilityNames = caps.map((c) => c.name);
    const approvedCount = caps.filter((c) => c.approved === true).length;
    const gatedCount = caps.length - approvedCount;
    const hasDestructiveSideEffect = caps.some((c) => c.side_effect_class === 'destructive');
    const hasRestrictedOrConfidential = caps.some((c) =>
      c.sensitivity_class === 'restricted' || c.sensitivity_class === 'confidential'
    );
    const hasUnknownAuth = caps.some((c) => {
      if (!c.auth_requirements || typeof c.auth_requirements !== 'object') return true;
      return c.auth_requirements.auth_scheme === 'unknown';
    });

    return {
      domain: domainName,
      aggregation_key: aggregationKey,
      capability_count: caps.length,
      capabilities: capabilityNames,
      approved_count: approvedCount,
      gated_count: gatedCount,
      has_destructive_side_effect: hasDestructiveSideEffect,
      has_restricted_or_confidential_sensitivity: hasRestrictedOrConfidential,
      has_unknown_auth: hasUnknownAuth
    };
  });

  return {
    manifest_path: manifestPath,
    manifest_version: manifestVersion,
    generated_at: generatedAt,
    domains
  };
}

// M31: format domain index as human-readable text
function formatDomainIndex(index) {
  if (index.domains.length === 0) {
    return 'No capabilities in manifest — nothing to index.\n';
  }

  const version = index.manifest_version === null ? 'unknown' : String(index.manifest_version);
  const generatedAt = index.generated_at === null ? 'unknown' : index.generated_at;
  const lines = [
    `Domain Index: ${index.manifest_path}`,
    `manifest_version: ${version}`,
    `generated_at: ${generatedAt}`,
    'Note: This is a planning aid, not a skill-pack/rollout/workflow generator.',
    ''
  ];

  for (const entry of index.domains) {
    lines.push(`[${entry.domain}]`);
    lines.push(`  aggregation_key: ${entry.aggregation_key}`);
    lines.push(`  capabilities (${entry.capability_count}): ${entry.capabilities.join(', ') || '(none)'}`);
    lines.push(`  approved: ${entry.approved_count}  gated: ${entry.gated_count}`);
    lines.push(`  has_destructive_side_effect: ${entry.has_destructive_side_effect}`);
    lines.push(`  has_restricted_or_confidential_sensitivity: ${entry.has_restricted_or_confidential_sensitivity}`);
    lines.push(`  has_unknown_auth: ${entry.has_unknown_auth}`);
    lines.push('');
  }

  return lines.join('\n');
}

// M32: tusq effect — enumerator (mirrors cmdDomain, cmdSurface, cmdPolicy, cmdRedaction)
function cmdEffect(args) {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printCommandHelp('effect');
    return;
  }

  const sub = args[0];
  const rest = args.slice(1);
  if (sub === 'index') {
    cmdEffectIndex(rest);
    return;
  }

  throw new CliError(`Unknown subcommand: ${sub}`, 1);
}

// M32: tusq effect index — handler
function cmdEffectIndex(args) {
  const { opts, positionals } = parseEffectIndexArgs(args);

  if (opts.help) {
    printCommandHelp('effect index');
    return;
  }
  if (positionals.length > 0) {
    throw new CliError(`Unknown subcommand: ${positionals[0]}`, 1);
  }

  const root = process.cwd();
  const manifestPath = opts.manifest
    ? path.resolve(root, opts.manifest)
    : path.join(root, 'tusq.manifest.json');

  // Validate --out path before reading the manifest (detection-before-output)
  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    if (outPath.split(path.sep).includes('.tusq')) {
      throw new CliError('--out path must not be inside .tusq/', 1);
    }
    try {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
  }

  let raw;
  try {
    raw = fs.readFileSync(manifestPath, 'utf8');
  } catch (_e) {
    throw new CliError(`Manifest not found: ${manifestPath}`, 1);
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (_e) {
    throw new CliError(`Invalid manifest JSON: ${manifestPath}`, 1);
  }

  if (!manifest || typeof manifest !== 'object' || !Array.isArray(manifest.capabilities)) {
    throw new CliError('Invalid manifest: missing capabilities array', 1);
  }

  const fullIndex = buildEffectIndex(manifest, manifestPath);

  const effectFilter = opts.effect || null;
  let outputIndex;
  if (effectFilter !== null) {
    if (!EFFECT_INDEX_SIDE_EFFECT_CLASS_ENUM.has(effectFilter)) {
      throw new CliError(`Unknown effect: ${effectFilter}`, 1);
    }
    const matchedEntry = fullIndex.effects.find((e) => e.side_effect_class === effectFilter);
    if (!matchedEntry) {
      throw new CliError(`Unknown effect: ${effectFilter}`, 1);
    }
    outputIndex = Object.assign({}, fullIndex, { effects: [matchedEntry] });
  } else {
    outputIndex = fullIndex;
  }

  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    try {
      fs.writeFileSync(outPath, `${JSON.stringify(outputIndex, null, 2)}\n`, 'utf8');
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
    return;
  }

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(outputIndex, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatEffectIndex(outputIndex));
}

function parseEffectIndexArgs(args) {
  const opts = {};
  const positionals = [];

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
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

    const knownFlags = new Set(['effect', 'manifest', 'out', 'json']);
    if (!knownFlags.has(key)) {
      throw new CliError(`Unknown flag: --${key}`, 1);
    }

    if (key === 'json') {
      opts.json = true;
      continue;
    }

    if (value === undefined) {
      const next = args[i + 1];
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

function _guardEffectBucketKey(key) {
  if (!EFFECT_INDEX_SIDE_EFFECT_CLASS_ENUM.has(key)) {
    throw new Error(`Internal error: side_effect_class outside closed four-value enum: ${key}`);
  }
  return key;
}

function _guardEffectAggregationKey(key) {
  if (!EFFECT_INDEX_AGGREGATION_KEY_ENUM.has(key)) {
    throw new Error(`Internal error: aggregation_key outside closed two-value enum: ${key}`);
  }
  return key;
}

// M32: buildEffectIndex(manifest, manifestPath) → index object
// Builds a full unfiltered effect index from the manifest's capabilities[].
// Bucket iteration order: read → write → destructive (closed-enum order), then unknown last.
// Empty buckets MUST NOT appear.
function buildEffectIndex(manifest, manifestPath) {
  const manifestVersion = typeof manifest.manifest_version === 'number' ? manifest.manifest_version : null;
  const generatedAt = typeof manifest.generated_at === 'string' ? manifest.generated_at : null;
  const capabilities = manifest.capabilities;

  if (capabilities.length === 0) {
    return {
      manifest_path: manifestPath,
      manifest_version: manifestVersion,
      generated_at: generatedAt,
      effects: []
    };
  }

  // Collect capabilities into buckets keyed by their side_effect_class.
  // The three named classes follow manifest declared order within each bucket.
  // The unknown bucket collects capabilities with null/missing/empty-string/invalid side_effect_class.
  const validNamedClasses = new Set(['read', 'write', 'destructive']);
  const buckets = Object.create(null); // bucketKey → capability[]
  let hasUnknownBucket = false;

  for (const capability of capabilities) {
    const rawClass = capability.side_effect_class;
    const isValid = validNamedClasses.has(rawClass);
    const bucketKey = isValid ? rawClass : '__unknown__';

    if (!isValid) {
      if (!hasUnknownBucket) {
        hasUnknownBucket = true;
        buckets['__unknown__'] = [];
      }
      buckets['__unknown__'].push(capability);
    } else {
      if (!buckets[bucketKey]) {
        buckets[bucketKey] = [];
      }
      buckets[bucketKey].push(capability);
    }
  }

  // Iterate in closed-enum order: read → write → destructive, then unknown last.
  // Empty buckets MUST NOT appear.
  const orderedBucketKeys = [
    ...EFFECT_INDEX_BUCKET_ORDER.filter((k) => buckets[k]),
    ...(hasUnknownBucket ? ['__unknown__'] : [])
  ];

  const effects = orderedBucketKeys.map((bucketKey) => {
    const isUnknownBucket = bucketKey === '__unknown__';
    const sideEffectClass = isUnknownBucket ? _guardEffectBucketKey('unknown') : _guardEffectBucketKey(bucketKey);
    const aggregationKey = isUnknownBucket ? _guardEffectAggregationKey('unknown') : _guardEffectAggregationKey('class');
    const caps = buckets[bucketKey];
    const capabilityNames = caps.map((c) => c.name);
    const approvedCount = caps.filter((c) => c.approved === true).length;
    const gatedCount = caps.length - approvedCount;
    const hasRestrictedOrConfidential = caps.some((c) =>
      c.sensitivity_class === 'restricted' || c.sensitivity_class === 'confidential'
    );
    const hasUnknownAuth = caps.some((c) => {
      if (!c.auth_requirements || typeof c.auth_requirements !== 'object') return true;
      return c.auth_requirements.auth_scheme === 'unknown';
    });

    return {
      side_effect_class: sideEffectClass,
      aggregation_key: aggregationKey,
      capability_count: caps.length,
      capabilities: capabilityNames,
      approved_count: approvedCount,
      gated_count: gatedCount,
      has_restricted_or_confidential_sensitivity: hasRestrictedOrConfidential,
      has_unknown_auth: hasUnknownAuth
    };
  });

  return {
    manifest_path: manifestPath,
    manifest_version: manifestVersion,
    generated_at: generatedAt,
    effects
  };
}

// M32: format effect index as human-readable text
function formatEffectIndex(index) {
  if (index.effects.length === 0) {
    return 'No capabilities in manifest — nothing to index.\n';
  }

  const version = index.manifest_version === null ? 'unknown' : String(index.manifest_version);
  const generatedAt = index.generated_at === null ? 'unknown' : index.generated_at;
  const lines = [
    `Side-Effect Index: ${index.manifest_path}`,
    `manifest_version: ${version}`,
    `generated_at: ${generatedAt}`,
    'Note: This is a planning aid, not a runtime side-effect enforcer or risk-tier classifier.',
    ''
  ];

  for (const entry of index.effects) {
    lines.push(`[${entry.side_effect_class}]`);
    lines.push(`  aggregation_key: ${entry.aggregation_key}`);
    lines.push(`  capabilities (${entry.capability_count}): ${entry.capabilities.join(', ') || '(none)'}`);
    lines.push(`  approved: ${entry.approved_count}  gated: ${entry.gated_count}`);
    lines.push(`  has_restricted_or_confidential_sensitivity: ${entry.has_restricted_or_confidential_sensitivity}`);
    lines.push(`  has_unknown_auth: ${entry.has_unknown_auth}`);
    lines.push('');
  }

  return lines.join('\n');
}

// M35: tusq auth — top-level noun dispatcher
function cmdAuth(args) {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printCommandHelp('auth');
    return;
  }

  const sub = args[0];
  const rest = args.slice(1);
  if (sub === 'index') {
    cmdAuthIndex(rest);
    return;
  }

  throw new CliError(`Unknown subcommand: ${sub}`, 1);
}

// M35: tusq auth index — handler
function cmdAuthIndex(args) {
  const { opts, positionals } = parseAuthIndexArgs(args);

  if (opts.help) {
    printCommandHelp('auth index');
    return;
  }
  if (positionals.length > 0) {
    throw new CliError(`Unknown subcommand: ${positionals[0]}`, 1);
  }

  const root = process.cwd();
  const manifestPath = opts.manifest
    ? path.resolve(root, opts.manifest)
    : path.join(root, 'tusq.manifest.json');

  // Validate --out path before reading the manifest (detection-before-output)
  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    if (outPath.split(path.sep).includes('.tusq')) {
      throw new CliError('--out path must not be inside .tusq/', 1);
    }
    try {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
  }

  let raw;
  try {
    raw = fs.readFileSync(manifestPath, 'utf8');
  } catch (_e) {
    throw new CliError(`Manifest not found: ${manifestPath}`, 1);
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (_e) {
    throw new CliError(`Invalid manifest JSON: ${manifestPath}`, 1);
  }

  if (!manifest || typeof manifest !== 'object' || !Array.isArray(manifest.capabilities)) {
    throw new CliError('Invalid manifest: missing capabilities array', 1);
  }

  const fullIndex = buildAuthIndex(manifest, manifestPath);

  const schemeFilter = opts.scheme || null;
  let outputIndex;
  if (schemeFilter !== null) {
    // Case-sensitive: lowercase canonical auth scheme values; anything else exits 1
    const validSchemeFilterValues = new Set([...AUTH_SCHEME_INDEX_BUCKET_ORDER, 'unknown']);
    if (!validSchemeFilterValues.has(schemeFilter)) {
      throw new CliError(`Unknown auth scheme: ${schemeFilter}`, 1);
    }
    const matchedEntry = fullIndex.schemes.find((e) => e.auth_scheme === schemeFilter);
    if (!matchedEntry) {
      throw new CliError(`Unknown auth scheme: ${schemeFilter}`, 1);
    }
    outputIndex = Object.assign({}, fullIndex, { schemes: [matchedEntry] });
  } else {
    outputIndex = fullIndex;
  }

  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    try {
      fs.writeFileSync(outPath, `${JSON.stringify(outputIndex, null, 2)}\n`, 'utf8');
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
    return;
  }

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(outputIndex, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatAuthIndex(outputIndex));
}

function parseAuthIndexArgs(args) {
  const opts = {};
  const positionals = [];

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
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

    const knownFlags = new Set(['scheme', 'manifest', 'out', 'json']);
    if (!knownFlags.has(key)) {
      throw new CliError(`Unknown flag: --${key}`, 1);
    }

    if (key === 'json') {
      opts.json = true;
      continue;
    }

    if (value === undefined) {
      const next = args[i + 1];
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

function _guardAuthSchemeBucketKey(key) {
  const validKeys = new Set([...AUTH_SCHEME_INDEX_BUCKET_ORDER, 'unknown']);
  if (!validKeys.has(key)) {
    throw new Error(`Internal error: auth_scheme outside closed seven-value enum: ${key}`);
  }
  return key;
}

function _guardAuthAggregationKey(key) {
  if (!AUTH_SCHEME_INDEX_AGGREGATION_KEY_ENUM.has(key)) {
    throw new Error(`Internal error: aggregation_key outside closed two-value enum: ${key}`);
  }
  return key;
}

// M35: buildAuthIndex(manifest, manifestPath) → index object
// Builds a full unfiltered auth scheme index from the manifest's capabilities[].
// Bucket iteration order: bearer → api_key → session → basic → oauth → none (closed-enum order), then unknown last.
// Empty buckets MUST NOT appear.
function buildAuthIndex(manifest, manifestPath) {
  const manifestVersion = typeof manifest.manifest_version === 'number' ? manifest.manifest_version : null;
  const generatedAt = typeof manifest.generated_at === 'string' ? manifest.generated_at : null;
  const capabilities = manifest.capabilities;

  if (capabilities.length === 0) {
    return {
      manifest_path: manifestPath,
      manifest_version: manifestVersion,
      generated_at: generatedAt,
      schemes: []
    };
  }

  // Named (non-unknown) auth scheme values — the six ordered bucket keys.
  const namedSchemes = new Set(AUTH_SCHEME_INDEX_BUCKET_ORDER);

  // Collect capabilities into buckets keyed by their auth_scheme value.
  // auth_requirements.auth_scheme: one of the six named values → named bucket.
  // auth_requirements.auth_scheme: 'unknown', null/missing, or invalid → __unknown__ bucket.
  const buckets = Object.create(null); // bucketKey → capability[]
  let hasUnknownBucket = false;

  for (const capability of capabilities) {
    const authReq = capability.auth_requirements;
    const authSchemeValue = (authReq && typeof authReq === 'object' && typeof authReq.auth_scheme === 'string')
      ? authReq.auth_scheme
      : null;
    const isNamedBucket = authSchemeValue !== null && namedSchemes.has(authSchemeValue);
    const bucketKey = isNamedBucket ? authSchemeValue : '__unknown__';

    if (!isNamedBucket) {
      if (!hasUnknownBucket) {
        hasUnknownBucket = true;
        buckets['__unknown__'] = [];
      }
      buckets['__unknown__'].push(capability);
    } else {
      if (!buckets[bucketKey]) {
        buckets[bucketKey] = [];
      }
      buckets[bucketKey].push(capability);
    }
  }

  // Iterate in closed-enum order: bearer → api_key → session → basic → oauth → none, then unknown last.
  // Empty buckets MUST NOT appear.
  const orderedBucketKeys = [
    ...AUTH_SCHEME_INDEX_BUCKET_ORDER.filter((k) => buckets[k]),
    ...(hasUnknownBucket ? ['__unknown__'] : [])
  ];

  const schemes = orderedBucketKeys.map((bucketKey) => {
    const isUnknownBucket = bucketKey === '__unknown__';
    const authScheme = isUnknownBucket ? _guardAuthSchemeBucketKey('unknown') : _guardAuthSchemeBucketKey(bucketKey);
    const aggregationKey = isUnknownBucket ? _guardAuthAggregationKey('unknown') : _guardAuthAggregationKey('scheme');
    const caps = buckets[bucketKey];
    const capabilityNames = caps.map((c) => c.name);
    const approvedCount = caps.filter((c) => c.approved === true).length;
    const gatedCount = caps.length - approvedCount;
    const hasDestructiveSideEffect = caps.some((c) => c.side_effect_class === 'destructive');
    const hasRestrictedOrConfidentialSensitivity = caps.some(
      (c) => c.sensitivity_class === 'restricted' || c.sensitivity_class === 'confidential'
    );

    return {
      auth_scheme: authScheme,
      aggregation_key: aggregationKey,
      capability_count: caps.length,
      capabilities: capabilityNames,
      approved_count: approvedCount,
      gated_count: gatedCount,
      has_destructive_side_effect: hasDestructiveSideEffect,
      has_restricted_or_confidential_sensitivity: hasRestrictedOrConfidentialSensitivity
    };
  });

  return {
    manifest_path: manifestPath,
    manifest_version: manifestVersion,
    generated_at: generatedAt,
    schemes
  };
}

// M35: format auth scheme index as human-readable text
function formatAuthIndex(index) {
  if (index.schemes.length === 0) {
    return 'No capabilities in manifest — nothing to index.\n';
  }

  const version = index.manifest_version === null ? 'unknown' : String(index.manifest_version);
  const generatedAt = index.generated_at === null ? 'unknown' : index.generated_at;
  const lines = [
    `Auth Scheme Index: ${index.manifest_path}`,
    `manifest_version: ${version}`,
    `generated_at: ${generatedAt}`,
    'Note: This is a planning aid, not a runtime authentication enforcer or OAuth/OIDC/SAML/SOC2 compliance certifier.',
    ''
  ];

  for (const entry of index.schemes) {
    lines.push(`[${entry.auth_scheme}]`);
    lines.push(`  aggregation_key: ${entry.aggregation_key}`);
    lines.push(`  capabilities (${entry.capability_count}): ${entry.capabilities.join(', ') || '(none)'}`);
    lines.push(`  approved: ${entry.approved_count}  gated: ${entry.gated_count}`);
    lines.push(`  has_destructive_side_effect: ${entry.has_destructive_side_effect}`);
    lines.push(`  has_restricted_or_confidential_sensitivity: ${entry.has_restricted_or_confidential_sensitivity}`);
    lines.push('');
  }

  return lines.join('\n');
}

// M36: tusq confidence — top-level noun dispatcher
function cmdConfidence(args) {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printCommandHelp('confidence');
    return;
  }

  const sub = args[0];
  const rest = args.slice(1);
  if (sub === 'index') {
    cmdConfidenceIndex(rest);
    return;
  }

  throw new CliError(`Unknown subcommand: ${sub}`, 1);
}

// M36: tusq confidence index — handler
function cmdConfidenceIndex(args) {
  const { opts, positionals } = parseConfidenceIndexArgs(args);

  if (opts.help) {
    printCommandHelp('confidence index');
    return;
  }
  if (positionals.length > 0) {
    throw new CliError(`Unknown subcommand: ${positionals[0]}`, 1);
  }

  const root = process.cwd();
  const manifestPath = opts.manifest
    ? path.resolve(root, opts.manifest)
    : path.join(root, 'tusq.manifest.json');

  // Validate --out path before reading the manifest (detection-before-output)
  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    if (outPath.split(path.sep).includes('.tusq')) {
      throw new CliError('--out path must not be inside .tusq/', 1);
    }
    try {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
  }

  let raw;
  try {
    raw = fs.readFileSync(manifestPath, 'utf8');
  } catch (_e) {
    throw new CliError(`Manifest not found: ${manifestPath}`, 1);
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (_e) {
    throw new CliError(`Invalid manifest JSON: ${manifestPath}`, 1);
  }

  if (!manifest || typeof manifest !== 'object' || !Array.isArray(manifest.capabilities)) {
    throw new CliError('Invalid manifest: missing capabilities array', 1);
  }

  const fullIndex = buildConfidenceIndex(manifest, manifestPath);

  const tierFilter = opts.tier || null;
  let outputIndex;
  if (tierFilter !== null) {
    // Case-sensitive: lowercase canonical confidence tier values; anything else exits 1
    if (!CONFIDENCE_TIER_ENUM.has(tierFilter)) {
      throw new CliError(`Unknown confidence tier: ${tierFilter}`, 1);
    }
    const matchedEntry = fullIndex.tiers.find((e) => e.confidence_tier === tierFilter);
    if (!matchedEntry) {
      throw new CliError(`Unknown confidence tier: ${tierFilter}`, 1);
    }
    outputIndex = Object.assign({}, fullIndex, { tiers: [matchedEntry] });
  } else {
    outputIndex = fullIndex;
  }

  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    // Emit warnings to stderr before writing file
    for (const w of fullIndex.warnings) {
      process.stderr.write(`Warning: ${w}\n`);
    }
    try {
      fs.writeFileSync(outPath, `${JSON.stringify(outputIndex, null, 2)}\n`, 'utf8');
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
    return;
  }

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(outputIndex, null, 2)}\n`);
    return;
  }

  // Human mode: emit warnings to stderr, then write text to stdout
  for (const w of fullIndex.warnings) {
    process.stderr.write(`Warning: ${w}\n`);
  }
  process.stdout.write(formatConfidenceIndex(outputIndex));
}

function parseConfidenceIndexArgs(args) {
  const opts = {};
  const positionals = [];

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
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

    const knownFlags = new Set(['tier', 'manifest', 'out', 'json']);
    if (!knownFlags.has(key)) {
      throw new CliError(`Unknown flag: --${key}`, 1);
    }

    if (key === 'json') {
      opts.json = true;
      continue;
    }

    if (value === undefined) {
      const next = args[i + 1];
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

function _guardConfidenceTierBucketKey(key) {
  if (!CONFIDENCE_TIER_ENUM.has(key)) {
    throw new Error(`Internal error: confidence_tier outside closed four-value enum: ${key}`);
  }
  return key;
}

function _guardConfidenceTierAggregationKey(key) {
  if (!CONFIDENCE_TIER_AGGREGATION_KEY_ENUM.has(key)) {
    throw new Error(`Internal error: aggregation_key outside closed two-value enum: ${key}`);
  }
  return key;
}

// M36: classifyConfidenceTier(conf) → 'high' | 'medium' | 'low' | 'unknown'
// Tier function thresholds (0.85/0.6) are immutable once M36 ships — any change is a governance event.
// null/undefined/missing → unknown (no warning); non-numeric/NaN/Infinity/out-of-[0,1] → unknown + warning.
function classifyConfidenceTier(conf) {
  if (conf === null || conf === undefined || typeof conf !== 'number' || isNaN(conf) || !isFinite(conf) || conf < 0 || conf > 1) {
    return 'unknown';
  }
  if (conf >= 0.85) return 'high';
  if (conf < 0.6) return 'low';
  return 'medium';
}

// M36: buildConfidenceIndex(manifest, manifestPath) → index object
// Builds a full unfiltered confidence tier index from the manifest's capabilities[].
// Bucket iteration order: high → medium → low (closed-enum order), then unknown last.
// Empty buckets MUST NOT appear.
// confidence_tier MUST NOT be written into tusq.manifest.json (non-persistence rule).
function buildConfidenceIndex(manifest, manifestPath) {
  const manifestVersion = typeof manifest.manifest_version === 'number' ? manifest.manifest_version : null;
  const generatedAt = typeof manifest.generated_at === 'string' ? manifest.generated_at : null;
  const capabilities = manifest.capabilities;
  const warnings = [];

  if (capabilities.length === 0) {
    return {
      manifest_path: manifestPath,
      manifest_version: manifestVersion,
      generated_at: generatedAt,
      tiers: [],
      warnings
    };
  }

  // Named (non-unknown) tier values — the three ordered bucket keys.
  const namedTiers = new Set(CONFIDENCE_TIER_BUCKET_ORDER);

  // Collect capabilities into buckets keyed by their confidence_tier.
  const buckets = Object.create(null); // bucketKey → capability[]
  let hasUnknownBucket = false;

  for (const capability of capabilities) {
    const conf = Object.prototype.hasOwnProperty.call(capability, 'confidence') ? capability.confidence : undefined;
    const isNullOrMissing = conf === null || conf === undefined;

    // Detect warning-worthy values: non-null/undefined but non-numeric, NaN, Infinity, or out-of-[0,1]
    if (!isNullOrMissing) {
      const isNonNumericType = typeof conf !== 'number';
      const isNaNValue = typeof conf === 'number' && isNaN(conf);
      const isInfinity = typeof conf === 'number' && !isFinite(conf);
      const isOutOfRange = typeof conf === 'number' && isFinite(conf) && !isNaN(conf) && (conf < 0 || conf > 1);
      if (isNonNumericType || isNaNValue || isInfinity || isOutOfRange) {
        warnings.push(
          `capability '${capability.name}' has confidence ${JSON.stringify(conf)} which is out-of-range or non-numeric; bucketed as 'unknown'`
        );
      }
    }

    const tier = classifyConfidenceTier(conf);
    const isNamedBucket = namedTiers.has(tier);
    const bucketKey = isNamedBucket ? tier : '__unknown__';

    if (!isNamedBucket) {
      if (!hasUnknownBucket) {
        hasUnknownBucket = true;
        buckets['__unknown__'] = [];
      }
      buckets['__unknown__'].push(capability);
    } else {
      if (!buckets[bucketKey]) {
        buckets[bucketKey] = [];
      }
      buckets[bucketKey].push(capability);
    }
  }

  // Iterate in closed-enum order: high → medium → low, then unknown last.
  // Empty buckets MUST NOT appear.
  const orderedBucketKeys = [
    ...CONFIDENCE_TIER_BUCKET_ORDER.filter((k) => buckets[k]),
    ...(hasUnknownBucket ? ['__unknown__'] : [])
  ];

  const tiers = orderedBucketKeys.map((bucketKey) => {
    const isUnknownBucket = bucketKey === '__unknown__';
    const confidenceTier = isUnknownBucket ? _guardConfidenceTierBucketKey('unknown') : _guardConfidenceTierBucketKey(bucketKey);
    const aggregationKey = isUnknownBucket ? _guardConfidenceTierAggregationKey('unknown') : _guardConfidenceTierAggregationKey('tier');
    const caps = buckets[bucketKey];
    const capabilityNames = caps.map((c) => c.name);
    const approvedCount = caps.filter((c) => c.approved === true).length;
    const gatedCount = caps.length - approvedCount;
    const hasDestructiveSideEffect = caps.some((c) => c.side_effect_class === 'destructive');
    const hasRestrictedOrConfidentialSensitivity = caps.some(
      (c) => c.sensitivity_class === 'restricted' || c.sensitivity_class === 'confidential'
    );

    return {
      confidence_tier: confidenceTier,
      aggregation_key: aggregationKey,
      capability_count: caps.length,
      capabilities: capabilityNames,
      approved_count: approvedCount,
      gated_count: gatedCount,
      has_destructive_side_effect: hasDestructiveSideEffect,
      has_restricted_or_confidential_sensitivity: hasRestrictedOrConfidentialSensitivity
    };
  });

  return {
    manifest_path: manifestPath,
    manifest_version: manifestVersion,
    generated_at: generatedAt,
    tiers,
    warnings
  };
}

// M36: format confidence tier index as human-readable text
function formatConfidenceIndex(index) {
  if (index.tiers.length === 0) {
    return 'No capabilities in manifest — nothing to index.\n';
  }

  const version = index.manifest_version === null ? 'unknown' : String(index.manifest_version);
  const generatedAt = index.generated_at === null ? 'unknown' : index.generated_at;
  const lines = [
    `Confidence Tier Index: ${index.manifest_path}`,
    `manifest_version: ${version}`,
    `generated_at: ${generatedAt}`,
    'Note: This is a planning aid, not a runtime confidence enforcement engine, evidence-quality scoring engine, or automated re-classifier.',
    ''
  ];

  for (const entry of index.tiers) {
    lines.push(`[${entry.confidence_tier}]`);
    lines.push(`  aggregation_key: ${entry.aggregation_key}`);
    lines.push(`  capabilities (${entry.capability_count}): ${entry.capabilities.join(', ') || '(none)'}`);
    lines.push(`  approved: ${entry.approved_count}  gated: ${entry.gated_count}`);
    lines.push(`  has_destructive_side_effect: ${entry.has_destructive_side_effect}`);
    lines.push(`  has_restricted_or_confidential_sensitivity: ${entry.has_restricted_or_confidential_sensitivity}`);
    lines.push('');
  }

  return lines.join('\n');
}

// M37: tusq pii — top-level noun dispatcher
function cmdPii(args) {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printCommandHelp('pii');
    return;
  }

  const sub = args[0];
  const rest = args.slice(1);
  if (sub === 'index') {
    cmdPiiIndex(rest);
    return;
  }

  throw new CliError(`Unknown subcommand: ${sub}`, 1);
}

// M37: tusq pii index — handler
function cmdPiiIndex(args) {
  const { opts, positionals } = parsePiiIndexArgs(args);

  if (opts.help) {
    printCommandHelp('pii index');
    return;
  }
  if (positionals.length > 0) {
    throw new CliError(`Unknown subcommand: ${positionals[0]}`, 1);
  }

  const root = process.cwd();
  const manifestPath = opts.manifest
    ? path.resolve(root, opts.manifest)
    : path.join(root, 'tusq.manifest.json');

  // Validate --out path before reading the manifest (detection-before-output)
  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    if (outPath.split(path.sep).includes('.tusq')) {
      throw new CliError('--out path must not be inside .tusq/', 1);
    }
    try {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
  }

  let raw;
  try {
    raw = fs.readFileSync(manifestPath, 'utf8');
  } catch (_e) {
    throw new CliError(`Manifest not found: ${manifestPath}`, 1);
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (_e) {
    throw new CliError(`Invalid manifest JSON: ${manifestPath}`, 1);
  }

  if (!manifest || typeof manifest !== 'object' || !Array.isArray(manifest.capabilities)) {
    throw new CliError('Invalid manifest: missing capabilities array', 1);
  }

  const fullIndex = buildPiiFieldCountTierIndex(manifest, manifestPath);

  const tierFilter = opts.tier || null;
  let outputIndex;
  if (tierFilter !== null) {
    // Case-sensitive: lowercase canonical pii_field_count_tier values; anything else exits 1
    if (!PII_FIELD_COUNT_TIER_ENUM.has(tierFilter)) {
      throw new CliError(`Unknown pii field count tier: ${tierFilter}`, 1);
    }
    const matchedEntry = fullIndex.tiers.find((e) => e.pii_field_count_tier === tierFilter);
    if (!matchedEntry) {
      throw new CliError(`Unknown pii field count tier: ${tierFilter}`, 1);
    }
    outputIndex = Object.assign({}, fullIndex, { tiers: [matchedEntry] });
  } else {
    outputIndex = fullIndex;
  }

  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    // Emit warnings to stderr before writing file
    for (const w of fullIndex.warnings) {
      process.stderr.write(`Warning: ${w}\n`);
    }
    try {
      fs.writeFileSync(outPath, `${JSON.stringify(outputIndex, null, 2)}\n`, 'utf8');
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
    return;
  }

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(outputIndex, null, 2)}\n`);
    return;
  }

  // Human mode: emit warnings to stderr, then write text to stdout
  for (const w of fullIndex.warnings) {
    process.stderr.write(`Warning: ${w}\n`);
  }
  process.stdout.write(formatPiiFieldCountTierIndex(outputIndex));
}

function parsePiiIndexArgs(args) {
  const opts = {};
  const positionals = [];

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
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

    const knownFlags = new Set(['tier', 'manifest', 'out', 'json']);
    if (!knownFlags.has(key)) {
      throw new CliError(`Unknown flag: --${key}`, 1);
    }

    if (key === 'json') {
      opts.json = true;
      continue;
    }

    if (value === undefined) {
      const next = args[i + 1];
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

function _guardPiiFieldCountTierBucketKey(key) {
  if (!PII_FIELD_COUNT_TIER_ENUM.has(key)) {
    throw new Error(`Internal error: pii_field_count_tier outside closed five-value enum: ${key}`);
  }
  return key;
}

function _guardPiiFieldCountTierAggregationKey(key) {
  if (!PII_FIELD_COUNT_TIER_AGGREGATION_KEY_ENUM.has(key)) {
    throw new Error(`Internal error: aggregation_key outside closed two-value enum: ${key}`);
  }
  return key;
}

// M37: classifyPiiFieldCountTier(piiFields) → 'none' | 'low' | 'medium' | 'high' | 'unknown'
// Tier function thresholds (0/2/5/6) are immutable once M37 ships — any change is a governance event.
// Valid pii_fields: array of non-empty strings.
// null/undefined/missing/not-an-array/non-string-element/empty-string → 'unknown' (with warning).
function classifyPiiFieldCountTier(piiFields) {
  if (!Array.isArray(piiFields)) {
    return 'unknown';
  }
  for (const el of piiFields) {
    if (typeof el !== 'string' || el === '') {
      return 'unknown';
    }
  }
  const len = piiFields.length;
  if (len === 0) return 'none';
  if (len <= 2) return 'low';
  if (len <= 5) return 'medium';
  return 'high';
}

// M37: buildPiiFieldCountTierIndex(manifest, manifestPath) → index object
// Builds a full unfiltered PII field count tier index from the manifest's capabilities[].
// Bucket iteration order: none → low → medium → high (closed-enum order), then unknown last.
// Empty buckets MUST NOT appear.
// pii_field_count_tier MUST NOT be written into tusq.manifest.json (non-persistence rule).
function buildPiiFieldCountTierIndex(manifest, manifestPath) {
  const manifestVersion = typeof manifest.manifest_version === 'number' ? manifest.manifest_version : null;
  const generatedAt = typeof manifest.generated_at === 'string' ? manifest.generated_at : null;
  const capabilities = manifest.capabilities;
  const warnings = [];

  if (capabilities.length === 0) {
    return {
      manifest_path: manifestPath,
      manifest_version: manifestVersion,
      generated_at: generatedAt,
      tiers: [],
      warnings
    };
  }

  // Named (non-unknown) tier values — the four ordered bucket keys.
  const namedTiers = new Set(PII_FIELD_COUNT_TIER_BUCKET_ORDER);

  // Collect capabilities into buckets keyed by their pii_field_count_tier.
  const buckets = Object.create(null); // bucketKey → capability[]
  let hasUnknownBucket = false;

  for (const capability of capabilities) {
    const piiFields = Object.prototype.hasOwnProperty.call(capability, 'redaction') &&
      capability.redaction !== null &&
      typeof capability.redaction === 'object' &&
      Object.prototype.hasOwnProperty.call(capability.redaction, 'pii_fields')
      ? capability.redaction.pii_fields
      : Object.prototype.hasOwnProperty.call(capability, 'pii_fields')
        ? capability.pii_fields
        : undefined;

    // Determine warning reason if pii_fields is malformed
    let warningReason = null;
    if (piiFields === null) {
      warningReason = 'pii_fields is null';
    } else if (piiFields === undefined) {
      warningReason = 'pii_fields is missing';
    } else if (!Array.isArray(piiFields)) {
      warningReason = `pii_fields is not an array (got ${typeof piiFields})`;
    } else {
      for (let i = 0; i < piiFields.length; i += 1) {
        const el = piiFields[i];
        if (typeof el !== 'string') {
          warningReason = `pii_fields contains a non-string element at index ${i}`;
          break;
        }
        if (el === '') {
          warningReason = `pii_fields contains an empty string at index ${i}`;
          break;
        }
      }
    }

    if (warningReason !== null) {
      warnings.push(`capability '${capability.name}' has malformed pii_fields: ${warningReason}`);
    }

    const tier = classifyPiiFieldCountTier(piiFields);
    const isNamedBucket = namedTiers.has(tier);
    const bucketKey = isNamedBucket ? tier : '__unknown__';

    if (!isNamedBucket) {
      if (!hasUnknownBucket) {
        hasUnknownBucket = true;
        buckets['__unknown__'] = [];
      }
      buckets['__unknown__'].push(capability);
    } else {
      if (!buckets[bucketKey]) {
        buckets[bucketKey] = [];
      }
      buckets[bucketKey].push(capability);
    }
  }

  // Iterate in closed-enum order: none → low → medium → high, then unknown last.
  // Empty buckets MUST NOT appear.
  const orderedBucketKeys = [
    ...PII_FIELD_COUNT_TIER_BUCKET_ORDER.filter((k) => buckets[k]),
    ...(hasUnknownBucket ? ['__unknown__'] : [])
  ];

  const tiers = orderedBucketKeys.map((bucketKey) => {
    const isUnknownBucket = bucketKey === '__unknown__';
    const piiTier = isUnknownBucket ? _guardPiiFieldCountTierBucketKey('unknown') : _guardPiiFieldCountTierBucketKey(bucketKey);
    const aggregationKey = isUnknownBucket ? _guardPiiFieldCountTierAggregationKey('unknown') : _guardPiiFieldCountTierAggregationKey('tier');
    const caps = buckets[bucketKey];
    const capabilityNames = caps.map((c) => c.name);
    const approvedCount = caps.filter((c) => c.approved === true).length;
    const gatedCount = caps.length - approvedCount;
    const hasDestructiveSideEffect = caps.some((c) => c.side_effect_class === 'destructive');
    const hasRestrictedOrConfidentialSensitivity = caps.some(
      (c) => c.sensitivity_class === 'restricted' || c.sensitivity_class === 'confidential'
    );

    return {
      pii_field_count_tier: piiTier,
      aggregation_key: aggregationKey,
      capability_count: caps.length,
      capabilities: capabilityNames,
      approved_count: approvedCount,
      gated_count: gatedCount,
      has_destructive_side_effect: hasDestructiveSideEffect,
      has_restricted_or_confidential_sensitivity: hasRestrictedOrConfidentialSensitivity
    };
  });

  return {
    manifest_path: manifestPath,
    manifest_version: manifestVersion,
    generated_at: generatedAt,
    tiers,
    warnings
  };
}

// M37: format PII field count tier index as human-readable text
function formatPiiFieldCountTierIndex(index) {
  if (index.tiers.length === 0) {
    return 'No capabilities in manifest — nothing to index.\n';
  }

  const version = index.manifest_version === null ? 'unknown' : String(index.manifest_version);
  const generatedAt = index.generated_at === null ? 'unknown' : index.generated_at;
  const lines = [
    `PII Field Count Tier Index: ${index.manifest_path}`,
    `manifest_version: ${version}`,
    `generated_at: ${generatedAt}`,
    'Note: This is a planning aid, not a runtime PII detector, data-leakage prevention engine, runtime redaction enforcer, or compliance certifier.',
    ''
  ];

  for (const entry of index.tiers) {
    lines.push(`[${entry.pii_field_count_tier}]`);
    lines.push(`  aggregation_key: ${entry.aggregation_key}`);
    lines.push(`  capabilities (${entry.capability_count}): ${entry.capabilities.join(', ') || '(none)'}`);
    lines.push(`  approved: ${entry.approved_count}  gated: ${entry.gated_count}`);
    lines.push(`  has_destructive_side_effect: ${entry.has_destructive_side_effect}`);
    lines.push(`  has_restricted_or_confidential_sensitivity: ${entry.has_restricted_or_confidential_sensitivity}`);
    lines.push('');
  }

  return lines.join('\n');
}

// M38: tusq examples — top-level noun dispatcher
function cmdExamples(args) {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printCommandHelp('examples');
    return;
  }

  const sub = args[0];
  const rest = args.slice(1);
  if (sub === 'index') {
    cmdExamplesIndex(rest);
    return;
  }

  throw new CliError(`Unknown subcommand: ${sub}`, 1);
}

// M38: tusq examples index — handler
function cmdExamplesIndex(args) {
  const { opts, positionals } = parseExamplesIndexArgs(args);

  if (opts.help) {
    printCommandHelp('examples index');
    return;
  }
  if (positionals.length > 0) {
    throw new CliError(`Unknown subcommand: ${positionals[0]}`, 1);
  }

  const root = process.cwd();
  const manifestPath = opts.manifest
    ? path.resolve(root, opts.manifest)
    : path.join(root, 'tusq.manifest.json');

  // Validate --out path before reading the manifest (detection-before-output)
  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    if (outPath.split(path.sep).includes('.tusq')) {
      throw new CliError('--out path must not be inside .tusq/', 1);
    }
    try {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
  }

  let raw;
  try {
    raw = fs.readFileSync(manifestPath, 'utf8');
  } catch (_e) {
    throw new CliError(`Manifest not found: ${manifestPath}`, 1);
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (_e) {
    throw new CliError(`Invalid manifest JSON: ${manifestPath}`, 1);
  }

  if (!manifest || typeof manifest !== 'object' || !Array.isArray(manifest.capabilities)) {
    throw new CliError('Invalid manifest: missing capabilities array', 1);
  }

  const fullIndex = buildExamplesCountTierIndex(manifest, manifestPath);

  const tierFilter = opts.tier || null;
  let outputIndex;
  if (tierFilter !== null) {
    // Case-sensitive: lowercase canonical examples_count_tier values; anything else exits 1
    if (!EXAMPLES_COUNT_TIER_ENUM.has(tierFilter)) {
      throw new CliError(`Unknown examples count tier: ${tierFilter}`, 1);
    }
    const matchedEntry = fullIndex.tiers.find((e) => e.examples_count_tier === tierFilter);
    if (!matchedEntry) {
      throw new CliError(`No capabilities found for examples count tier: ${tierFilter}`, 1);
    }
    outputIndex = Object.assign({}, fullIndex, { tiers: [matchedEntry] });
  } else {
    outputIndex = fullIndex;
  }

  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    // Emit warnings to stderr before writing file
    for (const w of fullIndex.warnings) {
      process.stderr.write(`Warning: capability '${w.capability}' has malformed examples (${w.reason})\n`);
    }
    try {
      fs.writeFileSync(outPath, `${JSON.stringify(outputIndex, null, 2)}\n`, 'utf8');
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
    return;
  }

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(outputIndex, null, 2)}\n`);
    return;
  }

  // Human mode: emit warnings to stderr, then write text to stdout
  for (const w of fullIndex.warnings) {
    process.stderr.write(`Warning: capability '${w.capability}' has malformed examples (${w.reason})\n`);
  }
  process.stdout.write(formatExamplesCountTierIndex(outputIndex));
}

function parseExamplesIndexArgs(args) {
  const opts = {};
  const positionals = [];

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
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

    const knownFlags = new Set(['tier', 'manifest', 'out', 'json']);
    if (!knownFlags.has(key)) {
      throw new CliError(`Unknown flag: --${key}`, 1);
    }

    if (key === 'json') {
      opts.json = true;
      continue;
    }

    if (value === undefined) {
      const next = args[i + 1];
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

function _guardExamplesCountTierBucketKey(key) {
  if (!EXAMPLES_COUNT_TIER_ENUM.has(key)) {
    throw new Error(`Internal error: examples_count_tier outside closed five-value enum: ${key}`);
  }
  return key;
}

function _guardExamplesCountTierAggregationKey(key) {
  if (!EXAMPLES_COUNT_TIER_AGGREGATION_KEY_ENUM.has(key)) {
    throw new Error(`Internal error: aggregation_key outside closed two-value enum: ${key}`);
  }
  return key;
}

// M38: classifyExamplesCountTier(examples) → 'none' | 'low' | 'medium' | 'high' | 'unknown'
// Tier function thresholds (0/2/5/6) are immutable once M38 ships — any change is a governance event.
// Valid examples: array of plain non-null non-array objects.
// null/undefined/missing/not-an-array/non-object-element/null-element/array-element → 'unknown' (with warning).
function classifyExamplesCountTier(examples) {
  if (!Array.isArray(examples)) {
    return 'unknown';
  }
  for (const el of examples) {
    if (el === null || Array.isArray(el) || typeof el !== 'object') {
      return 'unknown';
    }
  }
  const len = examples.length;
  if (len === 0) return 'none';
  if (len <= 2) return 'low';
  if (len <= 5) return 'medium';
  return 'high';
}

// M38: buildExamplesCountTierIndex(manifest, manifestPath) → index object
// Builds a full unfiltered examples count tier index from the manifest's capabilities[].
// Bucket iteration order: none → low → medium → high (closed-enum order), then unknown last.
// Empty buckets MUST NOT appear.
// examples_count_tier MUST NOT be written into tusq.manifest.json (non-persistence rule).
function buildExamplesCountTierIndex(manifest, manifestPath) {
  const manifestVersion = typeof manifest.manifest_version === 'number' ? manifest.manifest_version : null;
  const generatedAt = typeof manifest.generated_at === 'string' ? manifest.generated_at : null;
  const capabilities = manifest.capabilities;
  const warnings = [];

  if (capabilities.length === 0) {
    return {
      manifest_path: manifestPath,
      manifest_version: manifestVersion,
      generated_at: generatedAt,
      tiers: [],
      warnings
    };
  }

  // Named (non-unknown) tier values — the four ordered bucket keys.
  const namedTiers = new Set(EXAMPLES_COUNT_TIER_BUCKET_ORDER);

  // Collect capabilities into buckets keyed by their examples_count_tier.
  const buckets = Object.create(null); // bucketKey → capability[]
  let hasUnknownBucket = false;

  for (const capability of capabilities) {
    const examples = Object.prototype.hasOwnProperty.call(capability, 'examples')
      ? capability.examples
      : undefined;

    // Determine warning reason if examples is malformed
    let warningReason = null;
    if (examples === undefined || examples === null) {
      warningReason = examples === null ? 'examples_field_missing' : 'examples_field_missing';
    } else if (!Array.isArray(examples)) {
      warningReason = 'examples_field_not_array';
    } else {
      for (let i = 0; i < examples.length; i += 1) {
        const el = examples[i];
        if (el === null) {
          warningReason = 'examples_array_contains_null_element';
          break;
        }
        if (Array.isArray(el)) {
          warningReason = 'examples_array_contains_array_element';
          break;
        }
        if (typeof el !== 'object') {
          warningReason = 'examples_array_contains_non_object_element';
          break;
        }
      }
    }

    if (warningReason !== null) {
      warnings.push({ capability: capability.name, reason: warningReason });
    }

    const tier = classifyExamplesCountTier(examples);
    const isNamedBucket = namedTiers.has(tier);
    const bucketKey = isNamedBucket ? tier : '__unknown__';

    if (!isNamedBucket) {
      if (!hasUnknownBucket) {
        hasUnknownBucket = true;
        buckets['__unknown__'] = [];
      }
      buckets['__unknown__'].push(capability);
    } else {
      if (!buckets[bucketKey]) {
        buckets[bucketKey] = [];
      }
      buckets[bucketKey].push(capability);
    }
  }

  // Iterate in closed-enum order: none → low → medium → high, then unknown last.
  // Empty buckets MUST NOT appear.
  const orderedBucketKeys = [
    ...EXAMPLES_COUNT_TIER_BUCKET_ORDER.filter((k) => buckets[k]),
    ...(hasUnknownBucket ? ['__unknown__'] : [])
  ];

  const tiers = orderedBucketKeys.map((bucketKey) => {
    const isUnknownBucket = bucketKey === '__unknown__';
    const examplesTier = isUnknownBucket ? _guardExamplesCountTierBucketKey('unknown') : _guardExamplesCountTierBucketKey(bucketKey);
    const aggregationKey = isUnknownBucket ? _guardExamplesCountTierAggregationKey('unknown') : _guardExamplesCountTierAggregationKey('tier');
    const caps = buckets[bucketKey];
    const capabilityNames = caps.map((c) => c.name);
    const approvedCount = caps.filter((c) => c.approved === true).length;
    const gatedCount = caps.length - approvedCount;
    const hasDestructiveSideEffect = caps.some((c) => c.side_effect_class === 'destructive');
    const hasRestrictedOrConfidentialSensitivity = caps.some(
      (c) => c.sensitivity_class === 'restricted' || c.sensitivity_class === 'confidential'
    );

    return {
      examples_count_tier: examplesTier,
      aggregation_key: aggregationKey,
      capability_count: caps.length,
      capabilities: capabilityNames,
      approved_count: approvedCount,
      gated_count: gatedCount,
      has_destructive_side_effect: hasDestructiveSideEffect,
      has_restricted_or_confidential_sensitivity: hasRestrictedOrConfidentialSensitivity
    };
  });

  return {
    manifest_path: manifestPath,
    manifest_version: manifestVersion,
    generated_at: generatedAt,
    tiers,
    warnings
  };
}

// M38: format examples count tier index as human-readable text
function formatExamplesCountTierIndex(index) {
  if (index.tiers.length === 0) {
    return 'No capabilities in manifest — nothing to index.\n';
  }

  const version = index.manifest_version === null ? 'unknown' : String(index.manifest_version);
  const generatedAt = index.generated_at === null ? 'unknown' : index.generated_at;
  const lines = [
    `Examples Count Tier Index: ${index.manifest_path}`,
    `manifest_version: ${version}`,
    `generated_at: ${generatedAt}`,
    'Note: This is a planning aid, not a runtime example executor, schema validator, example generator, or eval-readiness certifier. Tiers are deterministic stable-output ordering only (NOT coverage-quality-ranked, NOT test-strength-ranked, NOT eval-readiness-ranked).',
    ''
  ];

  for (const entry of index.tiers) {
    lines.push(`[${entry.examples_count_tier}]`);
    lines.push(`  aggregation_key: ${entry.aggregation_key}`);
    lines.push(`  capabilities (${entry.capability_count}): ${entry.capabilities.join(', ') || '(none)'}`);
    lines.push(`  approved: ${entry.approved_count}  gated: ${entry.gated_count}`);
    lines.push(`  has_destructive_side_effect: ${entry.has_destructive_side_effect}`);
    lines.push(`  has_restricted_or_confidential_sensitivity: ${entry.has_restricted_or_confidential_sensitivity}`);
    lines.push('');
  }

  lines.push('Tier function: none if examples.length === 0; low if 1-2; medium if 3-5; high if >= 6; unknown if missing/not-array/non-object-element/null-element/array-element.');
  lines.push('Bucket order: none → low → medium → high → unknown');

  return lines.join('\n') + '\n';
}

// M39: tusq input — top-level noun dispatcher
function cmdInput(args) {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printCommandHelp('input');
    return;
  }

  const sub = args[0];
  const rest = args.slice(1);
  if (sub === 'index') {
    cmdInputIndex(rest);
    return;
  }

  throw new CliError(`Unknown subcommand: ${sub}`, 1);
}

// M39: tusq input index — handler
function cmdInputIndex(args) {
  const { opts, positionals } = parseInputIndexArgs(args);

  if (opts.help) {
    printCommandHelp('input index');
    return;
  }
  if (positionals.length > 0) {
    throw new CliError(`Unknown subcommand: ${positionals[0]}`, 1);
  }

  const root = process.cwd();
  const manifestPath = opts.manifest
    ? path.resolve(root, opts.manifest)
    : path.join(root, 'tusq.manifest.json');

  // Validate --out path before reading the manifest (detection-before-output)
  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    if (outPath.split(path.sep).includes('.tusq')) {
      throw new CliError('--out path must not be inside .tusq/', 1);
    }
    try {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
  }

  let raw;
  try {
    raw = fs.readFileSync(manifestPath, 'utf8');
  } catch (_e) {
    throw new CliError(`Manifest not found: ${manifestPath}`, 1);
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (_e) {
    throw new CliError(`Invalid manifest JSON: ${manifestPath}`, 1);
  }

  if (!manifest || typeof manifest !== 'object' || !Array.isArray(manifest.capabilities)) {
    throw new CliError('Invalid manifest: missing capabilities array', 1);
  }

  const fullIndex = buildRequiredInputFieldCountTierIndex(manifest, manifestPath);

  const tierFilter = opts.tier || null;
  let outputIndex;
  if (tierFilter !== null) {
    // Case-sensitive: lowercase canonical required_input_field_count_tier values; anything else exits 1
    if (!REQUIRED_INPUT_FIELD_COUNT_TIER_ENUM.has(tierFilter)) {
      throw new CliError(`Unknown required input field count tier: ${tierFilter}`, 1);
    }
    const matchedEntry = fullIndex.tiers.find((e) => e.required_input_field_count_tier === tierFilter);
    if (!matchedEntry) {
      throw new CliError(`No capabilities found for required input field count tier: ${tierFilter}`, 1);
    }
    outputIndex = Object.assign({}, fullIndex, { tiers: [matchedEntry] });
  } else {
    outputIndex = fullIndex;
  }

  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    // Emit warnings to stderr before writing file
    for (const w of fullIndex.warnings) {
      process.stderr.write(`Warning: capability '${w.capability}' has malformed input_schema (${w.reason})\n`);
    }
    try {
      fs.writeFileSync(outPath, `${JSON.stringify(outputIndex, null, 2)}\n`, 'utf8');
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
    return;
  }

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(outputIndex, null, 2)}\n`);
    return;
  }

  // Human mode: emit warnings to stderr, then write text to stdout
  for (const w of fullIndex.warnings) {
    process.stderr.write(`Warning: capability '${w.capability}' has malformed input_schema (${w.reason})\n`);
  }
  process.stdout.write(formatRequiredInputFieldCountTierIndex(outputIndex));
}

function parseInputIndexArgs(args) {
  const opts = {};
  const positionals = [];

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
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

    const knownFlags = new Set(['tier', 'manifest', 'out', 'json']);
    if (!knownFlags.has(key)) {
      throw new CliError(`Unknown flag: --${key}`, 1);
    }

    if (key === 'json') {
      opts.json = true;
      continue;
    }

    if (value === undefined) {
      const next = args[i + 1];
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

function _guardRequiredInputFieldCountTierBucketKey(key) {
  if (!REQUIRED_INPUT_FIELD_COUNT_TIER_ENUM.has(key)) {
    throw new Error(`Internal error: required_input_field_count_tier outside closed five-value enum: ${key}`);
  }
  return key;
}

function _guardRequiredInputFieldCountTierAggregationKey(key) {
  if (!REQUIRED_INPUT_FIELD_COUNT_TIER_AGGREGATION_KEY_ENUM.has(key)) {
    throw new Error(`Internal error: aggregation_key outside closed two-value enum: ${key}`);
  }
  return key;
}

// M39: classifyRequiredInputFieldCountTier(input_schema) → 'none' | 'low' | 'medium' | 'high' | 'unknown'
// Tier function thresholds (0/2/5/6) are immutable once M39 ships — any change is a governance event.
// Valid: input_schema is a plain non-null object; required is a non-empty-string array.
// null/undefined/missing/not-plain-object input_schema → 'unknown' (reason: input_schema_field_missing or input_schema_field_not_object)
// null/undefined/missing/not-an-array required → 'unknown' (reason: required_field_missing or required_field_not_array)
// array containing non-string or empty-string element → 'unknown' (reason: required_array_contains_non_string_or_empty_element)
function classifyRequiredInputFieldCountTier(inputSchema) {
  if (inputSchema === null || inputSchema === undefined) {
    return 'unknown';
  }
  if (typeof inputSchema !== 'object' || Array.isArray(inputSchema)) {
    return 'unknown';
  }
  if (!Object.prototype.hasOwnProperty.call(inputSchema, 'required')) {
    return 'unknown';
  }
  const required = inputSchema.required;
  if (!Array.isArray(required)) {
    return 'unknown';
  }
  for (const el of required) {
    if (typeof el !== 'string' || el === '') {
      return 'unknown';
    }
  }
  const len = required.length;
  if (len === 0) return 'none';
  if (len <= 2) return 'low';
  if (len <= 5) return 'medium';
  return 'high';
}

// M39: buildRequiredInputFieldCountTierIndex(manifest, manifestPath) → index object
// Builds a full unfiltered required input field count tier index from the manifest's capabilities[].
// Bucket iteration order: none → low → medium → high (closed-enum order), then unknown last.
// Empty buckets MUST NOT appear.
// required_input_field_count_tier MUST NOT be written into tusq.manifest.json (non-persistence rule).
function buildRequiredInputFieldCountTierIndex(manifest, manifestPath) {
  const manifestVersion = typeof manifest.manifest_version === 'number' ? manifest.manifest_version : null;
  const generatedAt = typeof manifest.generated_at === 'string' ? manifest.generated_at : null;
  const capabilities = manifest.capabilities;
  const warnings = [];

  if (capabilities.length === 0) {
    return {
      manifest_path: manifestPath,
      manifest_version: manifestVersion,
      generated_at: generatedAt,
      tiers: [],
      warnings
    };
  }

  // Named (non-unknown) tier values — the four ordered bucket keys.
  const namedTiers = new Set(REQUIRED_INPUT_FIELD_COUNT_TIER_BUCKET_ORDER);

  // Collect capabilities into buckets keyed by their required_input_field_count_tier.
  const buckets = Object.create(null); // bucketKey → capability[]
  let hasUnknownBucket = false;

  for (const capability of capabilities) {
    const inputSchema = Object.prototype.hasOwnProperty.call(capability, 'input_schema')
      ? capability.input_schema
      : undefined;

    // Determine warning reason if input_schema or required is malformed
    let warningReason = null;
    if (inputSchema === undefined || inputSchema === null) {
      warningReason = 'input_schema_field_missing';
    } else if (typeof inputSchema !== 'object' || Array.isArray(inputSchema)) {
      warningReason = 'input_schema_field_not_object';
    } else if (!Object.prototype.hasOwnProperty.call(inputSchema, 'required')) {
      warningReason = 'required_field_missing';
    } else if (!Array.isArray(inputSchema.required)) {
      warningReason = 'required_field_not_array';
    } else {
      for (const el of inputSchema.required) {
        if (typeof el !== 'string' || el === '') {
          warningReason = 'required_array_contains_non_string_or_empty_element';
          break;
        }
      }
    }

    if (warningReason !== null) {
      warnings.push({ capability: capability.name, reason: warningReason });
    }

    const tier = classifyRequiredInputFieldCountTier(inputSchema);
    const isNamedBucket = namedTiers.has(tier);
    const bucketKey = isNamedBucket ? tier : '__unknown__';

    if (!isNamedBucket) {
      if (!hasUnknownBucket) {
        hasUnknownBucket = true;
        buckets['__unknown__'] = [];
      }
      buckets['__unknown__'].push(capability);
    } else {
      if (!buckets[bucketKey]) {
        buckets[bucketKey] = [];
      }
      buckets[bucketKey].push(capability);
    }
  }

  // Iterate in closed-enum order: none → low → medium → high, then unknown last.
  // Empty buckets MUST NOT appear.
  const orderedBucketKeys = [
    ...REQUIRED_INPUT_FIELD_COUNT_TIER_BUCKET_ORDER.filter((k) => buckets[k]),
    ...(hasUnknownBucket ? ['__unknown__'] : [])
  ];

  const tiers = orderedBucketKeys.map((bucketKey) => {
    const isUnknownBucket = bucketKey === '__unknown__';
    const inputTier = isUnknownBucket ? _guardRequiredInputFieldCountTierBucketKey('unknown') : _guardRequiredInputFieldCountTierBucketKey(bucketKey);
    const aggregationKey = isUnknownBucket ? _guardRequiredInputFieldCountTierAggregationKey('unknown') : _guardRequiredInputFieldCountTierAggregationKey('tier');
    const caps = buckets[bucketKey];
    const capabilityNames = caps.map((c) => c.name);
    const approvedCount = caps.filter((c) => c.approved === true).length;
    const gatedCount = caps.length - approvedCount;
    const hasDestructiveSideEffect = caps.some((c) => c.side_effect_class === 'destructive');
    const hasRestrictedOrConfidentialSensitivity = caps.some(
      (c) => c.sensitivity_class === 'restricted' || c.sensitivity_class === 'confidential'
    );

    return {
      required_input_field_count_tier: inputTier,
      aggregation_key: aggregationKey,
      capability_count: caps.length,
      capabilities: capabilityNames,
      approved_count: approvedCount,
      gated_count: gatedCount,
      has_destructive_side_effect: hasDestructiveSideEffect,
      has_restricted_or_confidential_sensitivity: hasRestrictedOrConfidentialSensitivity
    };
  });

  return {
    manifest_path: manifestPath,
    manifest_version: manifestVersion,
    generated_at: generatedAt,
    tiers,
    warnings
  };
}

// M39: format required input field count tier index as human-readable text
function formatRequiredInputFieldCountTierIndex(index) {
  if (index.tiers.length === 0) {
    return 'No capabilities in manifest — nothing to index.\n';
  }

  const version = index.manifest_version === null ? 'unknown' : String(index.manifest_version);
  const generatedAt = index.generated_at === null ? 'unknown' : index.generated_at;
  const lines = [
    `Required Input Field Count Tier Index: ${index.manifest_path}`,
    `manifest_version: ${version}`,
    `generated_at: ${generatedAt}`,
    'Note: This is a planning aid, not a runtime input executor, input-schema validator, input generator, or exposure-safety certifier. Tiers are deterministic stable-output ordering only (NOT exposure-risk-ranked, NOT blast-radius-ranked, NOT easy-call-ranked, NOT input-complexity-ranked).',
    ''
  ];

  for (const entry of index.tiers) {
    lines.push(`[${entry.required_input_field_count_tier}]`);
    lines.push(`  aggregation_key: ${entry.aggregation_key}`);
    lines.push(`  capabilities (${entry.capability_count}): ${entry.capabilities.join(', ') || '(none)'}`);
    lines.push(`  approved: ${entry.approved_count}  gated: ${entry.gated_count}`);
    lines.push(`  has_destructive_side_effect: ${entry.has_destructive_side_effect}`);
    lines.push(`  has_restricted_or_confidential_sensitivity: ${entry.has_restricted_or_confidential_sensitivity}`);
    lines.push('');
  }

  lines.push('Tier function: none if required.length === 0; low if 1-2; medium if 3-5; high if >= 6; unknown if input_schema/required missing or malformed.');
  lines.push('Bucket order: none → low → medium → high → unknown');

  return lines.join('\n') + '\n';
}

// M40: tusq output — top-level noun dispatcher
function cmdOutput(args) {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printCommandHelp('output');
    return;
  }

  const sub = args[0];
  const rest = args.slice(1);
  if (sub === 'index') {
    cmdOutputIndex(rest);
    return;
  }

  throw new CliError(`Unknown subcommand: ${sub}`, 1);
}

// M40: tusq output index — handler
function cmdOutputIndex(args) {
  const { opts, positionals } = parseOutputIndexArgs(args);

  if (opts.help) {
    printCommandHelp('output index');
    return;
  }
  if (positionals.length > 0) {
    throw new CliError(`Unknown subcommand: ${positionals[0]}`, 1);
  }

  const root = process.cwd();
  const manifestPath = opts.manifest
    ? path.resolve(root, opts.manifest)
    : path.join(root, 'tusq.manifest.json');

  // Validate --out path before reading the manifest (detection-before-output)
  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    if (outPath.split(path.sep).includes('.tusq')) {
      throw new CliError('--out path must not be inside .tusq/', 1);
    }
    try {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
  }

  let raw;
  try {
    raw = fs.readFileSync(manifestPath, 'utf8');
  } catch (_e) {
    throw new CliError(`Manifest not found: ${manifestPath}`, 1);
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (_e) {
    throw new CliError(`Invalid manifest JSON: ${manifestPath}`, 1);
  }

  if (!manifest || typeof manifest !== 'object' || !Array.isArray(manifest.capabilities)) {
    throw new CliError('Invalid manifest: missing capabilities array', 1);
  }

  const fullIndex = buildOutputSchemaPropertyCountTierIndex(manifest, manifestPath);

  const tierFilter = opts.tier || null;
  let outputIndex;
  if (tierFilter !== null) {
    // Case-sensitive: lowercase canonical output_schema_property_count_tier values; anything else exits 1
    if (!OUTPUT_SCHEMA_PROPERTY_COUNT_TIER_ENUM.has(tierFilter)) {
      throw new CliError(`Unknown output schema property count tier: ${tierFilter}`, 1);
    }
    const matchedEntry = fullIndex.tiers.find((e) => e.output_schema_property_count_tier === tierFilter);
    if (!matchedEntry) {
      throw new CliError(`No capabilities found for output schema property count tier: ${tierFilter}`, 1);
    }
    outputIndex = Object.assign({}, fullIndex, { tiers: [matchedEntry] });
  } else {
    outputIndex = fullIndex;
  }

  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    // Emit warnings to stderr before writing file
    for (const w of fullIndex.warnings) {
      process.stderr.write(`Warning: capability '${w.capability}' has malformed output_schema (${w.reason})\n`);
    }
    try {
      fs.writeFileSync(outPath, `${JSON.stringify(outputIndex, null, 2)}\n`, 'utf8');
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
    return;
  }

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(outputIndex, null, 2)}\n`);
    return;
  }

  // Human mode: emit warnings to stderr, then write text to stdout
  for (const w of fullIndex.warnings) {
    process.stderr.write(`Warning: capability '${w.capability}' has malformed output_schema (${w.reason})\n`);
  }
  process.stdout.write(formatOutputSchemaPropertyCountTierIndex(outputIndex));
}

function parseOutputIndexArgs(args) {
  const opts = {};
  const positionals = [];

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
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

    const knownFlags = new Set(['tier', 'manifest', 'out', 'json']);
    if (!knownFlags.has(key)) {
      throw new CliError(`Unknown flag: --${key}`, 1);
    }

    if (key === 'json') {
      opts.json = true;
      continue;
    }

    if (value === undefined) {
      const next = args[i + 1];
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

function _guardOutputSchemaPropertyCountTierBucketKey(key) {
  if (!OUTPUT_SCHEMA_PROPERTY_COUNT_TIER_ENUM.has(key)) {
    throw new Error(`Internal error: output_schema_property_count_tier outside closed five-value enum: ${key}`);
  }
  return key;
}

function _guardOutputSchemaPropertyCountTierAggregationKey(key) {
  if (!OUTPUT_SCHEMA_PROPERTY_COUNT_TIER_AGGREGATION_KEY_ENUM.has(key)) {
    throw new Error(`Internal error: aggregation_key outside closed two-value enum: ${key}`);
  }
  return key;
}

// M40: classifyOutputSchemaPropertyCountTier(output_schema) → 'none' | 'low' | 'medium' | 'high' | 'unknown'
// Tier function thresholds (0/2/5/6) are immutable once M40 ships — any change is a governance event.
// Valid: output_schema is a plain non-null object; properties is a plain non-null object with all values being plain non-null objects.
// null/undefined/missing/not-plain-object output_schema → 'unknown'
// null/undefined/missing/not-plain-object output_schema.properties → 'unknown'
// properties containing any non-object descriptor (null, primitive, array, function) → 'unknown'
// length === 0 → 'none'; 1-2 → 'low'; 3-5 → 'medium'; >= 6 → 'high'
function classifyOutputSchemaPropertyCountTier(outputSchema) {
  if (outputSchema === null || outputSchema === undefined) {
    return 'unknown';
  }
  if (typeof outputSchema !== 'object' || Array.isArray(outputSchema)) {
    return 'unknown';
  }
  if (!Object.prototype.hasOwnProperty.call(outputSchema, 'properties')) {
    return 'unknown';
  }
  const properties = outputSchema.properties;
  if (properties === null || properties === undefined || typeof properties !== 'object' || Array.isArray(properties)) {
    return 'unknown';
  }
  // Check that all property descriptors are plain non-null objects
  for (const val of Object.values(properties)) {
    if (val === null || typeof val !== 'object' || Array.isArray(val) || typeof val === 'function') {
      return 'unknown';
    }
  }
  const len = Object.keys(properties).length;
  if (len === 0) return 'none';
  if (len <= 2) return 'low';
  if (len <= 5) return 'medium';
  return 'high';
}

// M40: buildOutputSchemaPropertyCountTierIndex(manifest, manifestPath) → index object
// Builds a full unfiltered output schema property count tier index from the manifest's capabilities[].
// Bucket iteration order: none → low → medium → high (closed-enum order), then unknown last.
// Empty buckets MUST NOT appear.
// output_schema_property_count_tier MUST NOT be written into tusq.manifest.json (non-persistence rule).
function buildOutputSchemaPropertyCountTierIndex(manifest, manifestPath) {
  const manifestVersion = typeof manifest.manifest_version === 'number' ? manifest.manifest_version : null;
  const generatedAt = typeof manifest.generated_at === 'string' ? manifest.generated_at : null;
  const capabilities = manifest.capabilities;
  const warnings = [];

  if (capabilities.length === 0) {
    return {
      manifest_path: manifestPath,
      manifest_version: manifestVersion,
      generated_at: generatedAt,
      tiers: [],
      warnings
    };
  }

  // Named (non-unknown) tier values — the four ordered bucket keys.
  const namedTiers = new Set(OUTPUT_SCHEMA_PROPERTY_COUNT_TIER_BUCKET_ORDER);

  // Collect capabilities into buckets keyed by their output_schema_property_count_tier.
  const buckets = Object.create(null); // bucketKey → capability[]
  let hasUnknownBucket = false;

  for (const capability of capabilities) {
    const outputSchema = Object.prototype.hasOwnProperty.call(capability, 'output_schema')
      ? capability.output_schema
      : undefined;

    // Determine warning reason if output_schema or properties is malformed
    let warningReason = null;
    if (outputSchema === undefined || outputSchema === null) {
      warningReason = 'output_schema_field_missing';
    } else if (typeof outputSchema !== 'object' || Array.isArray(outputSchema)) {
      warningReason = 'output_schema_field_not_object';
    } else if (!Object.prototype.hasOwnProperty.call(outputSchema, 'properties')) {
      warningReason = 'output_schema_properties_field_missing';
    } else if (outputSchema.properties === null || outputSchema.properties === undefined || typeof outputSchema.properties !== 'object' || Array.isArray(outputSchema.properties)) {
      warningReason = 'output_schema_properties_field_not_object';
    } else {
      for (const val of Object.values(outputSchema.properties)) {
        if (val === null || typeof val !== 'object' || Array.isArray(val)) {
          warningReason = 'output_schema_properties_object_contains_non_object_property_descriptor';
          break;
        }
      }
    }

    if (warningReason !== null) {
      warnings.push({ capability: capability.name, reason: warningReason });
    }

    const tier = classifyOutputSchemaPropertyCountTier(outputSchema);
    const isNamedBucket = namedTiers.has(tier);
    const bucketKey = isNamedBucket ? tier : '__unknown__';

    if (!isNamedBucket) {
      if (!hasUnknownBucket) {
        hasUnknownBucket = true;
        buckets['__unknown__'] = [];
      }
      buckets['__unknown__'].push(capability);
    } else {
      if (!buckets[bucketKey]) {
        buckets[bucketKey] = [];
      }
      buckets[bucketKey].push(capability);
    }
  }

  // Iterate in closed-enum order: none → low → medium → high, then unknown last.
  // Empty buckets MUST NOT appear.
  const orderedBucketKeys = [
    ...OUTPUT_SCHEMA_PROPERTY_COUNT_TIER_BUCKET_ORDER.filter((k) => buckets[k]),
    ...(hasUnknownBucket ? ['__unknown__'] : [])
  ];

  const tiers = orderedBucketKeys.map((bucketKey) => {
    const isUnknownBucket = bucketKey === '__unknown__';
    const outputTier = isUnknownBucket ? _guardOutputSchemaPropertyCountTierBucketKey('unknown') : _guardOutputSchemaPropertyCountTierBucketKey(bucketKey);
    const aggregationKey = isUnknownBucket ? _guardOutputSchemaPropertyCountTierAggregationKey('unknown') : _guardOutputSchemaPropertyCountTierAggregationKey('tier');
    const caps = buckets[bucketKey];
    const capabilityNames = caps.map((c) => c.name);
    const approvedCount = caps.filter((c) => c.approved === true).length;
    const gatedCount = caps.length - approvedCount;
    const hasDestructiveSideEffect = caps.some((c) => c.side_effect_class === 'destructive');
    const hasRestrictedOrConfidentialSensitivity = caps.some(
      (c) => c.sensitivity_class === 'restricted' || c.sensitivity_class === 'confidential'
    );

    return {
      output_schema_property_count_tier: outputTier,
      aggregation_key: aggregationKey,
      capability_count: caps.length,
      capabilities: capabilityNames,
      approved_count: approvedCount,
      gated_count: gatedCount,
      has_destructive_side_effect: hasDestructiveSideEffect,
      has_restricted_or_confidential_sensitivity: hasRestrictedOrConfidentialSensitivity
    };
  });

  return {
    manifest_path: manifestPath,
    manifest_version: manifestVersion,
    generated_at: generatedAt,
    tiers,
    warnings
  };
}

// M40: format output schema property count tier index as human-readable text
function formatOutputSchemaPropertyCountTierIndex(index) {
  if (index.tiers.length === 0) {
    return 'No capabilities in manifest — nothing to index.\n';
  }

  const version = index.manifest_version === null ? 'unknown' : String(index.manifest_version);
  const generatedAt = index.generated_at === null ? 'unknown' : index.generated_at;
  const lines = [
    `Output Schema Property Count Tier Index: ${index.manifest_path}`,
    `manifest_version: ${version}`,
    `generated_at: ${generatedAt}`,
    'Note: This is a planning aid, not a runtime output executor, output-schema validator, doc-contradiction detector, output generator, or doc-accuracy certifier. Tiers are deterministic stable-output ordering only (NOT doc-drift-risk-ranked, NOT staleness-ranked, NOT contract-surface-area-ranked).',
    ''
  ];

  for (const entry of index.tiers) {
    lines.push(`[${entry.output_schema_property_count_tier}]`);
    lines.push(`  aggregation_key: ${entry.aggregation_key}`);
    lines.push(`  capabilities (${entry.capability_count}): ${entry.capabilities.join(', ') || '(none)'}`);
    lines.push(`  approved: ${entry.approved_count}  gated: ${entry.gated_count}`);
    lines.push(`  has_destructive_side_effect: ${entry.has_destructive_side_effect}`);
    lines.push(`  has_restricted_or_confidential_sensitivity: ${entry.has_restricted_or_confidential_sensitivity}`);
    lines.push('');
  }

  lines.push('Tier function: none if Object.keys(output_schema.properties).length === 0; low if 1-2; medium if 3-5; high if >= 6; unknown if output_schema/properties missing or malformed (e.g., type:array schemas where properties legitimately does not apply).');
  lines.push('Bucket order: none → low → medium → high → unknown');

  return lines.join('\n') + '\n';
}

// M41: tusq path — top-level noun dispatcher
function cmdPath(args) {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printCommandHelp('path');
    return;
  }

  const sub = args[0];
  const rest = args.slice(1);
  if (sub === 'index') {
    cmdPathIndex(rest);
    return;
  }

  throw new CliError(`Unknown subcommand: ${sub}`, 1);
}

// M41: tusq path index — handler
function cmdPathIndex(args) {
  const { opts, positionals } = parsePathIndexArgs(args);

  if (opts.help) {
    printCommandHelp('path index');
    return;
  }
  if (positionals.length > 0) {
    throw new CliError(`Unknown subcommand: ${positionals[0]}`, 1);
  }

  const root = process.cwd();
  const manifestPath = opts.manifest
    ? path.resolve(root, opts.manifest)
    : path.join(root, 'tusq.manifest.json');

  // Validate --out path before reading the manifest (detection-before-output)
  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    if (outPath.split(path.sep).includes('.tusq')) {
      throw new CliError('--out path must not be inside .tusq/', 1);
    }
    try {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
  }

  let raw;
  try {
    raw = fs.readFileSync(manifestPath, 'utf8');
  } catch (_e) {
    throw new CliError(`Manifest not found: ${manifestPath}`, 1);
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (_e) {
    throw new CliError(`Invalid manifest JSON: ${manifestPath}`, 1);
  }

  if (!manifest || typeof manifest !== 'object' || !Array.isArray(manifest.capabilities)) {
    throw new CliError('Invalid manifest: missing capabilities array', 1);
  }

  const fullIndex = buildPathSegmentCountTierIndex(manifest, manifestPath);

  const tierFilter = opts.tier || null;
  let outputIndex;
  if (tierFilter !== null) {
    // Case-sensitive: lowercase canonical path_segment_count_tier values; anything else exits 1
    if (!PATH_SEGMENT_COUNT_TIER_ENUM.has(tierFilter)) {
      throw new CliError(`Unknown path segment count tier: ${tierFilter}`, 1);
    }
    const matchedEntry = fullIndex.tiers.find((e) => e.path_segment_count_tier === tierFilter);
    if (!matchedEntry) {
      throw new CliError(`No capabilities found for path segment count tier: ${tierFilter}`, 1);
    }
    outputIndex = Object.assign({}, fullIndex, { tiers: [matchedEntry] });
  } else {
    outputIndex = fullIndex;
  }

  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    // Emit warnings to stderr before writing file
    for (const w of fullIndex.warnings) {
      process.stderr.write(`Warning: capability '${w.capability}' has malformed path (${w.reason})\n`);
    }
    try {
      fs.writeFileSync(outPath, `${JSON.stringify(outputIndex, null, 2)}\n`, 'utf8');
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
    return;
  }

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(outputIndex, null, 2)}\n`);
    return;
  }

  // Human mode: emit warnings to stderr, then write text to stdout
  for (const w of fullIndex.warnings) {
    process.stderr.write(`Warning: capability '${w.capability}' has malformed path (${w.reason})\n`);
  }
  process.stdout.write(formatPathSegmentCountTierIndex(outputIndex));
}

function parsePathIndexArgs(args) {
  const opts = {};
  const positionals = [];

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
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

    const knownFlags = new Set(['tier', 'manifest', 'out', 'json']);
    if (!knownFlags.has(key)) {
      throw new CliError(`Unknown flag: --${key}`, 1);
    }

    if (key === 'json') {
      opts.json = true;
      continue;
    }

    if (value === undefined) {
      const next = args[i + 1];
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

function _guardPathSegmentCountTierBucketKey(key) {
  if (!PATH_SEGMENT_COUNT_TIER_ENUM.has(key)) {
    throw new Error(`Internal error: path_segment_count_tier outside closed five-value enum: ${key}`);
  }
  return key;
}

function _guardPathSegmentCountTierAggregationKey(key) {
  if (!PATH_SEGMENT_COUNT_TIER_AGGREGATION_KEY_ENUM.has(key)) {
    throw new Error(`Internal error: aggregation_key outside closed two-value enum: ${key}`);
  }
  return key;
}

// M41: classifyPathSegmentCountTier(pathStr) → 'none' | 'low' | 'medium' | 'high' | 'unknown'
// Tier function thresholds (0/2/4/5) are immutable once M41 ships — any change is a governance event.
// Valid: path is a non-empty string starting with '/' with no empty interior segments after split-on-'/'.
// null/undefined/not-a-string → 'unknown'
// empty string → 'unknown'
// does not start with '/' → 'unknown'
// contains empty interior segment (// or trailing slash other than path='/') → 'unknown'
// path='/' → segment count 0 → 'none'; 1-2 segments → 'low'; 3-4 → 'medium'; >= 5 → 'high'
// Path parameters (:id, :orgId) count as one segment each — NOT unwrapped or downscaled.
function classifyPathSegmentCountTier(pathStr) {
  if (pathStr === null || pathStr === undefined) {
    return 'unknown';
  }
  if (typeof pathStr !== 'string') {
    return 'unknown';
  }
  if (pathStr === '') {
    return 'unknown';
  }
  if (!pathStr.startsWith('/')) {
    return 'unknown';
  }
  // Check for empty interior segments (from // or trailing slash, but not path='/' itself)
  const segments = pathStr.split('/');
  if (pathStr !== '/' && segments.slice(1).some((s) => s === '')) {
    return 'unknown';
  }
  const count = segments.filter(Boolean).length;
  if (count === 0) return 'none';
  if (count <= 2) return 'low';
  if (count <= 4) return 'medium';
  return 'high';
}

// M41: buildPathSegmentCountTierIndex(manifest, manifestPath) → index object
// Builds a full unfiltered path segment count tier index from the manifest's capabilities[].
// Bucket iteration order: none → low → medium → high (closed-enum order), then unknown last.
// Empty buckets MUST NOT appear.
// path_segment_count_tier MUST NOT be written into tusq.manifest.json (non-persistence rule).
function buildPathSegmentCountTierIndex(manifest, manifestPath) {
  const manifestVersion = typeof manifest.manifest_version === 'number' ? manifest.manifest_version : null;
  const generatedAt = typeof manifest.generated_at === 'string' ? manifest.generated_at : null;
  const capabilities = manifest.capabilities;
  const warnings = [];

  if (capabilities.length === 0) {
    return {
      manifest_path: manifestPath,
      manifest_version: manifestVersion,
      generated_at: generatedAt,
      tiers: [],
      warnings
    };
  }

  // Named (non-unknown) tier values — the four ordered bucket keys.
  const namedTiers = new Set(PATH_SEGMENT_COUNT_TIER_BUCKET_ORDER);

  // Collect capabilities into buckets keyed by their path_segment_count_tier.
  const buckets = Object.create(null); // bucketKey → capability[]
  let hasUnknownBucket = false;

  for (const capability of capabilities) {
    const pathVal = Object.prototype.hasOwnProperty.call(capability, 'path')
      ? capability.path
      : undefined;

    // Determine warning reason if path is malformed
    let warningReason = null;
    if (pathVal === undefined || pathVal === null) {
      warningReason = 'path_field_missing';
    } else if (typeof pathVal !== 'string') {
      warningReason = 'path_field_not_string';
    } else if (pathVal === '') {
      warningReason = 'path_field_empty_string';
    } else if (!pathVal.startsWith('/')) {
      warningReason = 'path_field_does_not_start_with_forward_slash';
    } else if (pathVal !== '/' && pathVal.split('/').slice(1).some((s) => s === '')) {
      warningReason = 'path_field_contains_empty_interior_segment';
    }

    if (warningReason !== null) {
      warnings.push({ capability: capability.name, reason: warningReason });
    }

    const tier = classifyPathSegmentCountTier(pathVal);
    const isNamedBucket = namedTiers.has(tier);
    const bucketKey = isNamedBucket ? tier : '__unknown__';

    if (!isNamedBucket) {
      if (!hasUnknownBucket) {
        hasUnknownBucket = true;
        buckets['__unknown__'] = [];
      }
      buckets['__unknown__'].push(capability);
    } else {
      if (!buckets[bucketKey]) {
        buckets[bucketKey] = [];
      }
      buckets[bucketKey].push(capability);
    }
  }

  // Iterate in closed-enum order: none → low → medium → high, then unknown last.
  // Empty buckets MUST NOT appear.
  const orderedBucketKeys = [
    ...PATH_SEGMENT_COUNT_TIER_BUCKET_ORDER.filter((k) => buckets[k]),
    ...(hasUnknownBucket ? ['__unknown__'] : [])
  ];

  const tiers = orderedBucketKeys.map((bucketKey) => {
    const isUnknownBucket = bucketKey === '__unknown__';
    const pathTier = isUnknownBucket ? _guardPathSegmentCountTierBucketKey('unknown') : _guardPathSegmentCountTierBucketKey(bucketKey);
    const aggregationKey = isUnknownBucket ? _guardPathSegmentCountTierAggregationKey('unknown') : _guardPathSegmentCountTierAggregationKey('tier');
    const caps = buckets[bucketKey];
    const capabilityNames = caps.map((c) => c.name);
    const approvedCount = caps.filter((c) => c.approved === true).length;
    const gatedCount = caps.length - approvedCount;
    const hasDestructiveSideEffect = caps.some((c) => c.side_effect_class === 'destructive');
    const hasRestrictedOrConfidentialSensitivity = caps.some(
      (c) => c.sensitivity_class === 'restricted' || c.sensitivity_class === 'confidential'
    );

    return {
      path_segment_count_tier: pathTier,
      aggregation_key: aggregationKey,
      capability_count: caps.length,
      capabilities: capabilityNames,
      approved_count: approvedCount,
      gated_count: gatedCount,
      has_destructive_side_effect: hasDestructiveSideEffect,
      has_restricted_or_confidential_sensitivity: hasRestrictedOrConfidentialSensitivity
    };
  });

  return {
    manifest_path: manifestPath,
    manifest_version: manifestVersion,
    generated_at: generatedAt,
    tiers,
    warnings
  };
}

// M41: format path segment count tier index as human-readable text
function formatPathSegmentCountTierIndex(index) {
  if (index.tiers.length === 0) {
    return 'No capabilities in manifest — nothing to index.\n';
  }

  const version = index.manifest_version === null ? 'unknown' : String(index.manifest_version);
  const generatedAt = index.generated_at === null ? 'unknown' : index.generated_at;
  const lines = [
    `Path Segment Count Tier Index: ${index.manifest_path}`,
    `manifest_version: ${version}`,
    `generated_at: ${generatedAt}`,
    'Note: This is a planning aid, not a runtime URL router, path validator, route registry, artifact sprawl executor, or path-depth certifier. Tiers are deterministic stable-output ordering only (NOT sprawl-risk-ranked, NOT blast-radius-ranked, NOT depth-ranked, NOT operator-visibility-ranked).',
    ''
  ];

  for (const entry of index.tiers) {
    lines.push(`[${entry.path_segment_count_tier}]`);
    lines.push(`  aggregation_key: ${entry.aggregation_key}`);
    lines.push(`  capabilities (${entry.capability_count}): ${entry.capabilities.join(', ') || '(none)'}`);
    lines.push(`  approved: ${entry.approved_count}  gated: ${entry.gated_count}`);
    lines.push(`  has_destructive_side_effect: ${entry.has_destructive_side_effect}`);
    lines.push(`  has_restricted_or_confidential_sensitivity: ${entry.has_restricted_or_confidential_sensitivity}`);
    lines.push('');
  }

  lines.push("Tier function: none if path.split('/').filter(Boolean).length === 0 (path is '/'); low if 1-2; medium if 3-4; high if >= 5; unknown if path missing, null, not-a-string, empty, no leading '/', or contains empty interior segment (// or trailing /).");
  lines.push('Bucket order: none → low → medium → high → unknown');

  return lines.join('\n') + '\n';
}

// M42: tusq response — top-level noun dispatcher
function cmdResponse(args) {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printCommandHelp('response');
    return;
  }

  const sub = args[0];
  const rest = args.slice(1);
  if (sub === 'index') {
    cmdResponseIndex(rest);
    return;
  }

  throw new CliError(`Unknown subcommand: ${sub}`, 1);
}

// M42: tusq response index — handler
function cmdResponseIndex(args) {
  const { opts, positionals } = parseResponseIndexArgs(args);

  if (opts.help) {
    printCommandHelp('response index');
    return;
  }
  if (positionals.length > 0) {
    throw new CliError(`Unknown subcommand: ${positionals[0]}`, 1);
  }

  const root = process.cwd();
  const manifestPath = opts.manifest
    ? path.resolve(root, opts.manifest)
    : path.join(root, 'tusq.manifest.json');

  // Validate --out path before reading the manifest (detection-before-output)
  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    if (outPath.split(path.sep).includes('.tusq')) {
      throw new CliError('--out path must not be inside .tusq/', 1);
    }
    try {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
  }

  let raw;
  try {
    raw = fs.readFileSync(manifestPath, 'utf8');
  } catch (_e) {
    throw new CliError(`Manifest not found: ${manifestPath}`, 1);
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (_e) {
    throw new CliError(`Invalid manifest JSON: ${manifestPath}`, 1);
  }

  if (!manifest || typeof manifest !== 'object' || !Array.isArray(manifest.capabilities)) {
    throw new CliError('Invalid manifest: missing capabilities array', 1);
  }

  const fullIndex = buildOutputSchemaTopLevelTypeIndex(manifest, manifestPath);

  const typeFilter = opts.type || null;
  let outputIndex;
  if (typeFilter !== null) {
    // Case-sensitive: lowercase canonical output_schema_top_level_type values; anything else exits 1
    if (!OUTPUT_SCHEMA_TOP_LEVEL_TYPE_ENUM.has(typeFilter)) {
      throw new CliError(`Unknown output schema top-level type: ${typeFilter}`, 1);
    }
    const matchedEntry = fullIndex.types.find((e) => e.output_schema_top_level_type === typeFilter);
    if (!matchedEntry) {
      throw new CliError(`No capabilities found for output schema top-level type: ${typeFilter}`, 1);
    }
    outputIndex = Object.assign({}, fullIndex, { types: [matchedEntry] });
  } else {
    outputIndex = fullIndex;
  }

  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    // Emit warnings to stderr before writing file
    for (const w of fullIndex.warnings) {
      process.stderr.write(`Warning: capability '${w.capability}' has malformed output_schema (${w.reason})\n`);
    }
    try {
      fs.writeFileSync(outPath, `${JSON.stringify(outputIndex, null, 2)}\n`, 'utf8');
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
    return;
  }

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(outputIndex, null, 2)}\n`);
    return;
  }

  // Human mode: emit warnings to stderr, then write text to stdout
  for (const w of fullIndex.warnings) {
    process.stderr.write(`Warning: capability '${w.capability}' has malformed output_schema (${w.reason})\n`);
  }
  process.stdout.write(formatOutputSchemaTopLevelTypeIndex(outputIndex));
}

function parseResponseIndexArgs(args) {
  const opts = {};
  const positionals = [];

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
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

    const knownFlags = new Set(['type', 'manifest', 'out', 'json']);
    if (!knownFlags.has(key)) {
      throw new CliError(`Unknown flag: --${key}`, 1);
    }

    if (key === 'json') {
      opts.json = true;
      continue;
    }

    if (value === undefined) {
      const next = args[i + 1];
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

function _guardOutputSchemaTopLevelTypeBucketKey(key) {
  if (!OUTPUT_SCHEMA_TOP_LEVEL_TYPE_ENUM.has(key)) {
    throw new Error(`Internal error: output_schema_top_level_type outside closed seven-value enum: ${key}`);
  }
  return key;
}

function _guardOutputSchemaTopLevelTypeAggregationKey(key) {
  if (!OUTPUT_SCHEMA_TOP_LEVEL_TYPE_AGGREGATION_KEY_ENUM.has(key)) {
    throw new Error(`Internal error: aggregation_key outside closed two-value enum: ${key}`);
  }
  return key;
}

// M42: classifyOutputSchemaTopLevelType(output_schema) → 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' | 'unknown'
// Tier function is a literal exact-string match against the closed six-value JSON Schema 2020-12 spec primitive set.
// 'integer' and any other non-spec-primitive value bucket as 'unknown'.
// null/undefined/not-plain-object output_schema → 'unknown'
// null/undefined/missing/not-a-string output_schema.type → 'unknown'
// output_schema.type is an array → 'unknown' (array-of-types: type: ['object', 'null'] → unknown, typeof array !== 'string')
// output_schema.type is a string but not in the closed six-value set → 'unknown'
// No oneOf/anyOf/allOf walking, no items walking, no properties walking.
function classifyOutputSchemaTopLevelType(outputSchema) {
  if (outputSchema === null || outputSchema === undefined) {
    return 'unknown';
  }
  if (typeof outputSchema !== 'object' || Array.isArray(outputSchema)) {
    return 'unknown';
  }
  if (!Object.prototype.hasOwnProperty.call(outputSchema, 'type')) {
    return 'unknown';
  }
  const typeVal = outputSchema.type;
  if (typeVal === null || typeVal === undefined || typeof typeVal !== 'string') {
    return 'unknown';
  }
  // OUTPUT_SCHEMA_TOP_LEVEL_TYPE_BUCKET_ORDER is the closed six-value JSON Schema 2020-12 spec primitive set
  if (OUTPUT_SCHEMA_TOP_LEVEL_TYPE_BUCKET_ORDER.includes(typeVal)) {
    return typeVal;
  }
  return 'unknown';
}

// M42: buildOutputSchemaTopLevelTypeIndex(manifest, manifestPath) → index object
// Builds a full unfiltered output schema top-level type index from the manifest's capabilities[].
// Bucket iteration order: object → array → string → number → boolean → null (closed-enum order), then unknown last.
// Empty buckets MUST NOT appear.
// output_schema_top_level_type MUST NOT be written into tusq.manifest.json (non-persistence rule).
function buildOutputSchemaTopLevelTypeIndex(manifest, manifestPath) {
  const manifestVersion = typeof manifest.manifest_version === 'number' ? manifest.manifest_version : null;
  const generatedAt = typeof manifest.generated_at === 'string' ? manifest.generated_at : null;
  const capabilities = manifest.capabilities;
  const warnings = [];

  if (capabilities.length === 0) {
    return {
      manifest_path: manifestPath,
      manifest_version: manifestVersion,
      generated_at: generatedAt,
      types: [],
      warnings
    };
  }

  // Named (non-unknown) type values — the six ordered bucket keys.
  const namedTypes = new Set(OUTPUT_SCHEMA_TOP_LEVEL_TYPE_BUCKET_ORDER);

  // Collect capabilities into buckets keyed by their output_schema_top_level_type.
  const buckets = Object.create(null); // bucketKey → capability[]
  let hasUnknownBucket = false;

  for (const capability of capabilities) {
    const outputSchema = Object.prototype.hasOwnProperty.call(capability, 'output_schema')
      ? capability.output_schema
      : undefined;

    // Determine warning reason if output_schema or type is malformed
    let warningReason = null;
    if (outputSchema === undefined || outputSchema === null) {
      warningReason = 'output_schema_field_missing';
    } else if (typeof outputSchema !== 'object' || Array.isArray(outputSchema)) {
      warningReason = 'output_schema_field_not_object';
    } else if (!Object.prototype.hasOwnProperty.call(outputSchema, 'type')) {
      warningReason = 'output_schema_type_field_missing';
    } else if (outputSchema.type === null || outputSchema.type === undefined || typeof outputSchema.type !== 'string') {
      warningReason = 'output_schema_type_field_not_string';
    } else if (!OUTPUT_SCHEMA_TOP_LEVEL_TYPE_BUCKET_ORDER.includes(outputSchema.type)) {
      warningReason = 'output_schema_type_field_value_not_in_json_schema_primitive_set';
    }

    if (warningReason !== null) {
      warnings.push({ capability: capability.name, reason: warningReason });
    }

    const typeBucket = classifyOutputSchemaTopLevelType(outputSchema);
    const isNamedBucket = namedTypes.has(typeBucket);
    const bucketKey = isNamedBucket ? typeBucket : '__unknown__';

    if (!isNamedBucket) {
      if (!hasUnknownBucket) {
        hasUnknownBucket = true;
        buckets['__unknown__'] = [];
      }
      buckets['__unknown__'].push(capability);
    } else {
      if (!buckets[bucketKey]) {
        buckets[bucketKey] = [];
      }
      buckets[bucketKey].push(capability);
    }
  }

  // Iterate in closed-enum order: object → array → string → number → boolean → null, then unknown last.
  // Empty buckets MUST NOT appear.
  const orderedBucketKeys = [
    ...OUTPUT_SCHEMA_TOP_LEVEL_TYPE_BUCKET_ORDER.filter((k) => buckets[k]),
    ...(hasUnknownBucket ? ['__unknown__'] : [])
  ];

  const types = orderedBucketKeys.map((bucketKey) => {
    const isUnknownBucket = bucketKey === '__unknown__';
    const typeKey = isUnknownBucket ? _guardOutputSchemaTopLevelTypeBucketKey('unknown') : _guardOutputSchemaTopLevelTypeBucketKey(bucketKey);
    const aggregationKey = isUnknownBucket ? _guardOutputSchemaTopLevelTypeAggregationKey('unknown') : _guardOutputSchemaTopLevelTypeAggregationKey('type');
    const caps = buckets[bucketKey];
    const capabilityNames = caps.map((c) => c.name);
    const approvedCount = caps.filter((c) => c.approved === true).length;
    const gatedCount = caps.length - approvedCount;
    const hasDestructiveSideEffect = caps.some((c) => c.side_effect_class === 'destructive');
    const hasRestrictedOrConfidentialSensitivity = caps.some(
      (c) => c.sensitivity_class === 'restricted' || c.sensitivity_class === 'confidential'
    );

    return {
      output_schema_top_level_type: typeKey,
      aggregation_key: aggregationKey,
      capability_count: caps.length,
      capabilities: capabilityNames,
      approved_count: approvedCount,
      gated_count: gatedCount,
      has_destructive_side_effect: hasDestructiveSideEffect,
      has_restricted_or_confidential_sensitivity: hasRestrictedOrConfidentialSensitivity
    };
  });

  return {
    manifest_path: manifestPath,
    manifest_version: manifestVersion,
    generated_at: generatedAt,
    types,
    warnings
  };
}

// M42: format output schema top-level type index as human-readable text
function formatOutputSchemaTopLevelTypeIndex(index) {
  if (index.types.length === 0) {
    return 'No capabilities in manifest — nothing to index.\n';
  }

  const version = index.manifest_version === null ? 'unknown' : String(index.manifest_version);
  const generatedAt = index.generated_at === null ? 'unknown' : index.generated_at;
  const lines = [
    `Output Schema Top-Level Type Index: ${index.manifest_path}`,
    `manifest_version: ${version}`,
    `generated_at: ${generatedAt}`,
    'Note: This is a planning aid, not a runtime response executor, response-payload validator, data-contract conformance detector, response generator, or data-contract certifier. Types are deterministic stable-output ordering only (NOT data-contract-completeness-ranked, NOT shape-complexity-ranked).',
    ''
  ];

  for (const entry of index.types) {
    lines.push(`[${entry.output_schema_top_level_type}]`);
    lines.push(`  aggregation_key: ${entry.aggregation_key}`);
    lines.push(`  capabilities (${entry.capability_count}): ${entry.capabilities.join(', ') || '(none)'}`);
    lines.push(`  approved: ${entry.approved_count}  gated: ${entry.gated_count}`);
    lines.push(`  has_destructive_side_effect: ${entry.has_destructive_side_effect}`);
    lines.push(`  has_restricted_or_confidential_sensitivity: ${entry.has_restricted_or_confidential_sensitivity}`);
    lines.push('');
  }

  lines.push("Type rule: bucket key is the literal output_schema.type value if it is one of the six JSON Schema 2020-12 spec primitives (object, array, string, number, boolean, null); unknown if output_schema or output_schema.type is missing/malformed or the type string is not in the spec primitive set (e.g., 'integer', 'tuple', or compositional schemas without a top-level type).");
  lines.push('Bucket order: object → array → string → number → boolean → null → unknown');

  return lines.join('\n') + '\n';
}

// M34: tusq method — top-level noun dispatcher
function cmdMethod(args) {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printCommandHelp('method');
    return;
  }

  const sub = args[0];
  const rest = args.slice(1);
  if (sub === 'index') {
    cmdMethodIndex(rest);
    return;
  }

  throw new CliError(`Unknown subcommand: ${sub}`, 1);
}

// M34: tusq method index — handler
function cmdMethodIndex(args) {
  const { opts, positionals } = parseMethodIndexArgs(args);

  if (opts.help) {
    printCommandHelp('method index');
    return;
  }
  if (positionals.length > 0) {
    throw new CliError(`Unknown subcommand: ${positionals[0]}`, 1);
  }

  const root = process.cwd();
  const manifestPath = opts.manifest
    ? path.resolve(root, opts.manifest)
    : path.join(root, 'tusq.manifest.json');

  // Validate --out path before reading the manifest (detection-before-output)
  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    if (outPath.split(path.sep).includes('.tusq')) {
      throw new CliError('--out path must not be inside .tusq/', 1);
    }
    try {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
  }

  let raw;
  try {
    raw = fs.readFileSync(manifestPath, 'utf8');
  } catch (_e) {
    throw new CliError(`Manifest not found: ${manifestPath}`, 1);
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (_e) {
    throw new CliError(`Invalid manifest JSON: ${manifestPath}`, 1);
  }

  if (!manifest || typeof manifest !== 'object' || !Array.isArray(manifest.capabilities)) {
    throw new CliError('Invalid manifest: missing capabilities array', 1);
  }

  const fullIndex = buildMethodIndex(manifest, manifestPath);

  const methodFilter = opts.method || null;
  let outputIndex;
  if (methodFilter !== null) {
    // Case-sensitive: uppercase canonical methods + literal 'unknown'; anything else exits 1
    const validMethodFilterValues = new Set([...METHOD_INDEX_BUCKET_ORDER, 'unknown']);
    if (!validMethodFilterValues.has(methodFilter)) {
      throw new CliError(`Unknown method: ${methodFilter}`, 1);
    }
    const matchedEntry = fullIndex.methods.find((e) => e.http_method === methodFilter);
    if (!matchedEntry) {
      throw new CliError(`Unknown method: ${methodFilter}`, 1);
    }
    outputIndex = Object.assign({}, fullIndex, { methods: [matchedEntry] });
  } else {
    outputIndex = fullIndex;
  }

  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    try {
      fs.writeFileSync(outPath, `${JSON.stringify(outputIndex, null, 2)}\n`, 'utf8');
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
    return;
  }

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(outputIndex, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatMethodIndex(outputIndex));
}

function parseMethodIndexArgs(args) {
  const opts = {};
  const positionals = [];

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
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

    const knownFlags = new Set(['method', 'manifest', 'out', 'json']);
    if (!knownFlags.has(key)) {
      throw new CliError(`Unknown flag: --${key}`, 1);
    }

    if (key === 'json') {
      opts.json = true;
      continue;
    }

    if (value === undefined) {
      const next = args[i + 1];
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

function _guardMethodBucketKey(key) {
  const validKeys = new Set([...METHOD_INDEX_BUCKET_ORDER, 'unknown']);
  if (!validKeys.has(key)) {
    throw new Error(`Internal error: http_method outside closed six-value enum: ${key}`);
  }
  return key;
}

function _guardMethodAggregationKey(key) {
  if (!METHOD_INDEX_AGGREGATION_KEY_ENUM.has(key)) {
    throw new Error(`Internal error: aggregation_key outside closed two-value enum: ${key}`);
  }
  return key;
}

// M34: buildMethodIndex(manifest, manifestPath) → index object
// Builds a full unfiltered HTTP method index from the manifest's capabilities[].
// Bucket iteration order: GET → POST → PUT → PATCH → DELETE (closed-enum order), then unknown last.
// Empty buckets MUST NOT appear.
function buildMethodIndex(manifest, manifestPath) {
  const manifestVersion = typeof manifest.manifest_version === 'number' ? manifest.manifest_version : null;
  const generatedAt = typeof manifest.generated_at === 'string' ? manifest.generated_at : null;
  const capabilities = manifest.capabilities;

  if (capabilities.length === 0) {
    return {
      manifest_path: manifestPath,
      manifest_version: manifestVersion,
      generated_at: generatedAt,
      methods: []
    };
  }

  // Collect capabilities into buckets keyed by their method value (verbatim uppercase from manifest).
  // The five named methods follow manifest declared order within each bucket.
  // The unknown bucket collects capabilities with null/missing/empty-string/non-canonical method.
  const buckets = Object.create(null); // bucketKey → capability[]
  let hasUnknownBucket = false;

  for (const capability of capabilities) {
    const methodValue = typeof capability.method === 'string' ? capability.method : null;
    const isValid = methodValue !== null && METHOD_INDEX_VALID_METHODS.has(methodValue);
    const bucketKey = isValid ? methodValue : '__unknown__';

    if (!isValid) {
      if (!hasUnknownBucket) {
        hasUnknownBucket = true;
        buckets['__unknown__'] = [];
      }
      buckets['__unknown__'].push(capability);
    } else {
      if (!buckets[bucketKey]) {
        buckets[bucketKey] = [];
      }
      buckets[bucketKey].push(capability);
    }
  }

  // Iterate in closed-enum order: GET → POST → PUT → PATCH → DELETE, then unknown last.
  // Empty buckets MUST NOT appear.
  const orderedBucketKeys = [
    ...METHOD_INDEX_BUCKET_ORDER.filter((k) => buckets[k]),
    ...(hasUnknownBucket ? ['__unknown__'] : [])
  ];

  const methods = orderedBucketKeys.map((bucketKey) => {
    const isUnknownBucket = bucketKey === '__unknown__';
    const httpMethod = isUnknownBucket ? _guardMethodBucketKey('unknown') : _guardMethodBucketKey(bucketKey);
    const aggregationKey = isUnknownBucket ? _guardMethodAggregationKey('unknown') : _guardMethodAggregationKey('method');
    const caps = buckets[bucketKey];
    const capabilityNames = caps.map((c) => c.name);
    const approvedCount = caps.filter((c) => c.approved === true).length;
    const gatedCount = caps.length - approvedCount;
    const hasDestructiveSideEffect = caps.some((c) => c.side_effect_class === 'destructive');
    const hasUnknownAuth = caps.some((c) => {
      if (!c.auth_requirements || typeof c.auth_requirements !== 'object') return true;
      return c.auth_requirements.auth_scheme === 'unknown';
    });

    return {
      http_method: httpMethod,
      aggregation_key: aggregationKey,
      capability_count: caps.length,
      capabilities: capabilityNames,
      approved_count: approvedCount,
      gated_count: gatedCount,
      has_destructive_side_effect: hasDestructiveSideEffect,
      has_unknown_auth: hasUnknownAuth
    };
  });

  return {
    manifest_path: manifestPath,
    manifest_version: manifestVersion,
    generated_at: generatedAt,
    methods
  };
}

// M34: format method index as human-readable text
function formatMethodIndex(index) {
  if (index.methods.length === 0) {
    return 'No capabilities in manifest — nothing to index.\n';
  }

  const version = index.manifest_version === null ? 'unknown' : String(index.manifest_version);
  const generatedAt = index.generated_at === null ? 'unknown' : index.generated_at;
  const lines = [
    `HTTP Method Index: ${index.manifest_path}`,
    `manifest_version: ${version}`,
    `generated_at: ${generatedAt}`,
    'Note: This is a planning aid, not a runtime HTTP-method router, REST-convention validator, or idempotency classifier.',
    ''
  ];

  for (const entry of index.methods) {
    lines.push(`[${entry.http_method}]`);
    lines.push(`  aggregation_key: ${entry.aggregation_key}`);
    lines.push(`  capabilities (${entry.capability_count}): ${entry.capabilities.join(', ') || '(none)'}`);
    lines.push(`  approved: ${entry.approved_count}  gated: ${entry.gated_count}`);
    lines.push(`  has_destructive_side_effect: ${entry.has_destructive_side_effect}`);
    lines.push(`  has_unknown_auth: ${entry.has_unknown_auth}`);
    lines.push('');
  }

  return lines.join('\n');
}

function cmdSensitivity(args) {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printCommandHelp('sensitivity');
    return;
  }

  const sub = args[0];
  const rest = args.slice(1);
  if (sub === 'index') {
    cmdSensitivityIndex(rest);
    return;
  }

  throw new CliError(`Unknown subcommand: ${sub}`, 1);
}

// M33: tusq sensitivity index — handler
function cmdSensitivityIndex(args) {
  const { opts, positionals } = parseSensitivityIndexArgs(args);

  if (opts.help) {
    printCommandHelp('sensitivity index');
    return;
  }
  if (positionals.length > 0) {
    throw new CliError(`Unknown subcommand: ${positionals[0]}`, 1);
  }

  const root = process.cwd();
  const manifestPath = opts.manifest
    ? path.resolve(root, opts.manifest)
    : path.join(root, 'tusq.manifest.json');

  // Validate --out path before reading the manifest (detection-before-output)
  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    if (outPath.split(path.sep).includes('.tusq')) {
      throw new CliError('--out path must not be inside .tusq/', 1);
    }
    try {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
  }

  let raw;
  try {
    raw = fs.readFileSync(manifestPath, 'utf8');
  } catch (_e) {
    throw new CliError(`Manifest not found: ${manifestPath}`, 1);
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (_e) {
    throw new CliError(`Invalid manifest JSON: ${manifestPath}`, 1);
  }

  if (!manifest || typeof manifest !== 'object' || !Array.isArray(manifest.capabilities)) {
    throw new CliError('Invalid manifest: missing capabilities array', 1);
  }

  const fullIndex = buildSensitivityIndex(manifest, manifestPath);

  const sensitivityFilter = opts.sensitivity || null;
  let outputIndex;
  if (sensitivityFilter !== null) {
    if (!SENSITIVITY_CLASSES.includes(sensitivityFilter)) {
      throw new CliError(`Unknown sensitivity: ${sensitivityFilter}`, 1);
    }
    const matchedEntry = fullIndex.sensitivities.find((e) => e.sensitivity_class === sensitivityFilter);
    if (!matchedEntry) {
      throw new CliError(`Unknown sensitivity: ${sensitivityFilter}`, 1);
    }
    outputIndex = Object.assign({}, fullIndex, { sensitivities: [matchedEntry] });
  } else {
    outputIndex = fullIndex;
  }

  if (opts.out) {
    const outPath = path.resolve(root, opts.out);
    try {
      fs.writeFileSync(outPath, `${JSON.stringify(outputIndex, null, 2)}\n`, 'utf8');
    } catch (_e) {
      throw new CliError(`Cannot write to --out path: ${outPath}`, 1);
    }
    return;
  }

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(outputIndex, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatSensitivityIndex(outputIndex));
}

function parseSensitivityIndexArgs(args) {
  const opts = {};
  const positionals = [];

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
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

    const knownFlags = new Set(['sensitivity', 'manifest', 'out', 'json']);
    if (!knownFlags.has(key)) {
      throw new CliError(`Unknown flag: --${key}`, 1);
    }

    if (key === 'json') {
      opts.json = true;
      continue;
    }

    if (value === undefined) {
      const next = args[i + 1];
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

function _guardSensitivityBucketKey(key) {
  if (!SENSITIVITY_CLASSES.includes(key)) {
    throw new Error(`Internal error: sensitivity_class outside closed five-value enum: ${key}`);
  }
  return key;
}

function _guardSensitivityAggregationKey(key) {
  if (!SENSITIVITY_INDEX_AGGREGATION_KEY_ENUM.has(key)) {
    throw new Error(`Internal error: aggregation_key outside closed two-value enum: ${key}`);
  }
  return key;
}

// M33: buildSensitivityIndex(manifest, manifestPath) → index object
// Builds a full unfiltered sensitivity index from the manifest's capabilities[].
// Bucket iteration order: public → internal → confidential → restricted (closed-enum order), then unknown last.
// Empty buckets MUST NOT appear.
// NOTE: bucket-key enum uses SENSITIVITY_CLASSES (M28 constant) directly — no independent enum declared.
function buildSensitivityIndex(manifest, manifestPath) {
  const manifestVersion = typeof manifest.manifest_version === 'number' ? manifest.manifest_version : null;
  const generatedAt = typeof manifest.generated_at === 'string' ? manifest.generated_at : null;
  const capabilities = manifest.capabilities;

  if (capabilities.length === 0) {
    return {
      manifest_path: manifestPath,
      manifest_version: manifestVersion,
      generated_at: generatedAt,
      sensitivities: []
    };
  }

  // Collect capabilities into buckets keyed by their sensitivity_class.
  // The four named classes follow manifest declared order within each bucket.
  // The unknown bucket collects capabilities with null/missing/empty-string/invalid sensitivity_class.
  const validNamedClasses = new Set(SENSITIVITY_INDEX_BUCKET_ORDER);
  const buckets = Object.create(null); // bucketKey → capability[]
  let hasUnknownBucket = false;

  for (const capability of capabilities) {
    const normalizedClass = normalizeSensitivityClass(capability.sensitivity_class);
    const isValid = normalizedClass !== 'unknown' && validNamedClasses.has(normalizedClass);
    const bucketKey = isValid ? normalizedClass : '__unknown__';

    if (!isValid) {
      if (!hasUnknownBucket) {
        hasUnknownBucket = true;
        buckets['__unknown__'] = [];
      }
      buckets['__unknown__'].push(capability);
    } else {
      if (!buckets[bucketKey]) {
        buckets[bucketKey] = [];
      }
      buckets[bucketKey].push(capability);
    }
  }

  // Iterate in closed-enum order: public → internal → confidential → restricted, then unknown last.
  // Empty buckets MUST NOT appear.
  const orderedBucketKeys = [
    ...SENSITIVITY_INDEX_BUCKET_ORDER.filter((k) => buckets[k]),
    ...(hasUnknownBucket ? ['__unknown__'] : [])
  ];

  const sensitivities = orderedBucketKeys.map((bucketKey) => {
    const isUnknownBucket = bucketKey === '__unknown__';
    const sensitivityClass = isUnknownBucket ? _guardSensitivityBucketKey('unknown') : _guardSensitivityBucketKey(bucketKey);
    const aggregationKey = isUnknownBucket ? _guardSensitivityAggregationKey('unknown') : _guardSensitivityAggregationKey('class');
    const caps = buckets[bucketKey];
    const capabilityNames = caps.map((c) => c.name);
    const approvedCount = caps.filter((c) => c.approved === true).length;
    const gatedCount = caps.length - approvedCount;
    const hasDestructiveSideEffect = caps.some((c) => c.side_effect_class === 'destructive');
    const hasUnknownAuth = caps.some((c) => {
      if (!c.auth_requirements || typeof c.auth_requirements !== 'object') return true;
      return c.auth_requirements.auth_scheme === 'unknown';
    });

    return {
      sensitivity_class: sensitivityClass,
      aggregation_key: aggregationKey,
      capability_count: caps.length,
      capabilities: capabilityNames,
      approved_count: approvedCount,
      gated_count: gatedCount,
      has_destructive_side_effect: hasDestructiveSideEffect,
      has_unknown_auth: hasUnknownAuth
    };
  });

  return {
    manifest_path: manifestPath,
    manifest_version: manifestVersion,
    generated_at: generatedAt,
    sensitivities
  };
}

// M33: format sensitivity index as human-readable text
function formatSensitivityIndex(index) {
  if (index.sensitivities.length === 0) {
    return 'No capabilities in manifest — nothing to index.\n';
  }

  const version = index.manifest_version === null ? 'unknown' : String(index.manifest_version);
  const generatedAt = index.generated_at === null ? 'unknown' : index.generated_at;
  const lines = [
    `Sensitivity Index: ${index.manifest_path}`,
    `manifest_version: ${version}`,
    `generated_at: ${generatedAt}`,
    'Note: This is a planning aid, not a runtime sensitivity enforcer or compliance certifier.',
    ''
  ];

  for (const entry of index.sensitivities) {
    lines.push(`[${entry.sensitivity_class}]`);
    lines.push(`  aggregation_key: ${entry.aggregation_key}`);
    lines.push(`  capabilities (${entry.capability_count}): ${entry.capabilities.join(', ') || '(none)'}`);
    lines.push(`  approved: ${entry.approved_count}  gated: ${entry.gated_count}`);
    lines.push(`  has_destructive_side_effect: ${entry.has_destructive_side_effect}`);
    lines.push(`  has_unknown_auth: ${entry.has_unknown_auth}`);
    lines.push('');
  }

  return lines.join('\n');
}

function cmdRedactionReview(args) {
  const { opts, positionals } = parseRedactionReviewArgs(args);

  if (opts.help) {
    printCommandHelp('redaction review');
    return;
  }
  if (positionals.length > 0) {
    throw new CliError(`Unknown subcommand: ${positionals[0]}`, 1);
  }

  assertPiiReviewAdvisorySetComplete();

  const root = process.cwd();
  const manifestPath = opts.manifest
    ? path.resolve(root, opts.manifest)
    : path.join(root, 'tusq.manifest.json');

  let raw;
  try {
    raw = fs.readFileSync(manifestPath, 'utf8');
  } catch (e) {
    throw new CliError(`Manifest not found: ${manifestPath}`, 1);
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (_e) {
    throw new CliError(`Invalid manifest JSON: ${manifestPath}`, 1);
  }

  if (!manifest || typeof manifest !== 'object' || !Array.isArray(manifest.capabilities)) {
    throw new CliError('Invalid manifest: missing capabilities array', 1);
  }

  let capabilities = manifest.capabilities;
  if (opts.capability) {
    capabilities = capabilities.filter((capability) => capability && capability.name === opts.capability);
    if (capabilities.length === 0) {
      throw new CliError(`Capability not found: ${opts.capability}`, 1);
    }
  }

  const report = buildRedactionReviewReport(manifestPath, manifest, capabilities);
  if (opts.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatRedactionReviewReport(report));
}

function parseRedactionReviewArgs(args) {
  const opts = {};
  const positionals = [];

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (token === '--help' || token === '-h') {
      opts.help = true;
      continue;
    }
    if (token === '--json') {
      opts.json = true;
      continue;
    }
    if (token === '--manifest' || token === '--capability') {
      const next = args[i + 1];
      if (!next || next.startsWith('--')) {
        throw new CliError(`Missing value for ${token}`, 1);
      }
      opts[token.slice(2)] = next;
      i += 1;
      continue;
    }
    if (token.startsWith('--manifest=')) {
      opts.manifest = token.slice('--manifest='.length);
      continue;
    }
    if (token.startsWith('--capability=')) {
      opts.capability = token.slice('--capability='.length);
      continue;
    }
    if (token.startsWith('--')) {
      throw new CliError(`Unknown flag: ${token}`, 1);
    }
    positionals.push(token);
  }

  return { opts, positionals };
}

function buildRedactionReviewReport(manifestPath, manifest, capabilities) {
  return {
    manifest_path: manifestPath,
    manifest_version: typeof manifest.manifest_version === 'number' ? manifest.manifest_version : null,
    generated_at: typeof manifest.generated_at === 'string' ? manifest.generated_at : null,
    capabilities: capabilities.map((capability) => {
      const redaction = capability && capability.redaction && typeof capability.redaction === 'object'
        ? capability.redaction
        : {};
      const piiFields = Array.isArray(redaction.pii_fields) ? redaction.pii_fields.slice() : [];
      const piiCategories = Array.isArray(redaction.pii_categories) ? redaction.pii_categories.slice() : [];
      return {
        name: capability && capability.name,
        approved: capability ? capability.approved : undefined,
        sensitivity_class: capability ? capability.sensitivity_class : undefined,
        pii_fields: piiFields,
        pii_categories: piiCategories,
        advisories: buildPiiReviewAdvisories(piiCategories)
      };
    })
  };
}

function buildPiiReviewAdvisories(piiCategories) {
  const seen = new Set();
  const advisories = [];
  for (const category of piiCategories) {
    if (typeof category !== 'string' || seen.has(category)) {
      continue;
    }
    seen.add(category);
    const text = PII_REVIEW_ADVISORY_BY_CATEGORY[category];
    if (text) {
      advisories.push({ category, text });
    }
  }
  return advisories;
}

function formatRedactionReviewReport(report) {
  if (report.capabilities.length === 0) {
    return 'No capabilities in manifest — nothing to review.\n';
  }

  const version = report.manifest_version === null ? 'unknown' : String(report.manifest_version);
  const generatedAt = report.generated_at === null ? 'unknown' : report.generated_at;
  const lines = [
    `Manifest: ${report.manifest_path}`,
    `manifest_version: ${version}`,
    `generated_at: ${generatedAt}`,
    ''
  ];

  for (let i = 0; i < report.capabilities.length; i += 1) {
    const capability = report.capabilities[i];
    lines.push(`Capability: ${capability.name}`);
    lines.push(`  approved: ${String(capability.approved)}`);
    lines.push(`  sensitivity_class: ${String(capability.sensitivity_class)}`);
    lines.push('  Redaction:');
    lines.push(`    pii_fields:     ${JSON.stringify(capability.pii_fields)}`);
    lines.push(`    pii_categories: ${JSON.stringify(capability.pii_categories)}`);
    if (capability.pii_fields.length === 0) {
      lines.push('    No canonical PII field-name matches — reviewer action: none required from M27.');
    } else {
      lines.push('    Advisories:');
      for (const advisory of capability.advisories) {
        lines.push(`      - ${advisory.category}: ${advisory.text}`);
      }
    }
    if (i < report.capabilities.length - 1) {
      lines.push('');
    }
  }

  lines.push('');
  return lines.join('\n');
}

function assertPiiReviewAdvisorySetComplete() {
  const categories = [
    'email',
    'phone',
    'government_id',
    'name',
    'address',
    'date_of_birth',
    'payment',
    'secrets',
    'network'
  ];
  for (const category of categories) {
    if (typeof PII_REVIEW_ADVISORY_BY_CATEGORY[category] !== 'string') {
      throw new CliError(`Missing PII review advisory for category: ${category}`, 2);
    }
  }
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
  process.stdout.write('  auth               Index capabilities by auth scheme for planning review\n');
  process.stdout.write('  confidence         Index capabilities by confidence tier for planning review\n');
  process.stdout.write('  diff               Compare manifest versions and generate a review queue\n');
  process.stdout.write('  domain             Index capabilities by domain for planning review\n');
  process.stdout.write('  effect             Index capabilities by side-effect class for planning review\n');
  process.stdout.write('  examples           Index capabilities by examples count tier for planning review\n');
  process.stdout.write('  input              Index capabilities by required input field count tier for planning review\n');
  process.stdout.write('  method             Index capabilities by HTTP method for planning review\n');
  process.stdout.write('  output             Index capabilities by output schema property count tier for planning review\n');
  process.stdout.write('  path               Index capabilities by path segment count tier for planning review\n');
  process.stdout.write('  pii                Index capabilities by PII field count tier for planning review\n');
  process.stdout.write('  policy             Manage execution policy artifacts\n');
  process.stdout.write('  redaction          Review redaction field-name hints and categories\n');
  process.stdout.write('  response           Index capabilities by output schema top-level type for planning review\n');
  process.stdout.write('  sensitivity        Index capabilities by sensitivity class for planning review\n');
  process.stdout.write('  surface            Plan embeddable surfaces from manifest capabilities\n');
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
    review: 'Usage: tusq review [--format json] [--strict] [--sensitivity <class>] [--auth-scheme <scheme>] [--verbose]',
    docs: 'Usage: tusq docs [--manifest <path>] [--out <path>] [--verbose]',
    approve: 'Usage: tusq approve [capability-name] [--all] [--reviewer <id>] [--manifest <path>] [--dry-run] [--json] [--verbose]',
    auth: 'Usage: tusq auth <subcommand>\n  Subcommands: index',
    'auth index': [
      'Usage: tusq auth index [--scheme <bearer|api_key|session|basic|oauth|none|unknown>] [--manifest <path>] [--out <path>] [--json]',
      '',
      'Flags:',
      '  --scheme <bearer|api_key|session|basic|oauth|none|unknown>  Filter to a single auth scheme bucket (default: all schemes; case-sensitive lowercase)',
      '  --manifest <path>                                            Manifest file to read (default: tusq.manifest.json)',
      '  --out <path>                                                 Write index to file (no stdout on success)',
      '  --json                                                       Emit machine-readable JSON',
      '',
      'Bucket iteration order: bearer → api_key → session → basic → oauth → none → unknown (closed-enum order, not manifest first-appearance)',
      '',
      'Exit codes:',
      '  0  Index produced (or empty-capabilities manifest)',
      '  1  Missing/invalid manifest, unknown flag, unknown auth scheme, --out path error, or unknown subcommand',
      '',
      'This is a planning aid, not a runtime authentication enforcer or OAuth/OIDC/SAML/SOC2 compliance certifier.'
    ].join('\n'),
    confidence: 'Usage: tusq confidence <subcommand>\n  Subcommands: index',
    'confidence index': [
      'Usage: tusq confidence index [--tier <high|medium|low|unknown>] [--manifest <path>] [--out <path>] [--json]',
      '',
      'Flags:',
      '  --tier <high|medium|low|unknown>  Filter to a single confidence tier bucket (default: all tiers; case-sensitive lowercase)',
      '  --manifest <path>                 Manifest file to read (default: tusq.manifest.json)',
      '  --out <path>                      Write index to file (no stdout on success)',
      '  --json                            Emit machine-readable JSON (includes warnings[] for out-of-range confidence values)',
      '',
      'Tier function: high if confidence >= 0.85; medium if 0.6 <= confidence < 0.85; low if confidence < 0.6; unknown if null/missing/non-numeric/out-of-[0,1]',
      'Bucket iteration order: high → medium → low → unknown (closed-enum order, not manifest first-appearance)',
      '',
      'Exit codes:',
      '  0  Index produced (or empty-capabilities manifest)',
      '  1  Missing/invalid manifest, unknown flag, unknown tier, --out path error, or unknown subcommand',
      '',
      'This is a planning aid, not a runtime confidence enforcement engine, evidence-quality scoring engine, or automated re-classifier.'
    ].join('\n'),
    diff: 'Usage: tusq diff [--from <path>] [--to <path>] [--json] [--review-queue] [--fail-on-unapproved-changes] [--verbose]',
    domain: 'Usage: tusq domain <subcommand>\n  Subcommands: index',
    'domain index': [
      'Usage: tusq domain index [--domain <name>] [--manifest <path>] [--out <path>] [--json]',
      '',
      'Flags:',
      '  --domain <name>    Filter to a single domain bucket (default: all domains)',
      '  --manifest <path>  Manifest file to read (default: tusq.manifest.json)',
      '  --out <path>       Write index to file (no stdout on success)',
      '  --json             Emit machine-readable JSON',
      '',
      'Exit codes:',
      '  0  Index produced (or empty-capabilities manifest)',
      '  1  Missing/invalid manifest, unknown flag, unknown domain, --out path error, or unknown subcommand',
      '',
      'This is a planning aid, not a skill-pack/rollout/workflow generator.'
    ].join('\n'),
    effect: 'Usage: tusq effect <subcommand>\n  Subcommands: index',
    'effect index': [
      'Usage: tusq effect index [--effect <read|write|destructive|unknown>] [--manifest <path>] [--out <path>] [--json]',
      '',
      'Flags:',
      '  --effect <read|write|destructive|unknown>  Filter to a single side-effect class bucket (default: all classes)',
      '  --manifest <path>                          Manifest file to read (default: tusq.manifest.json)',
      '  --out <path>                               Write index to file (no stdout on success)',
      '  --json                                     Emit machine-readable JSON',
      '',
      'Bucket iteration order: read → write → destructive → unknown (closed-enum order, not manifest first-appearance)',
      '',
      'Exit codes:',
      '  0  Index produced (or empty-capabilities manifest)',
      '  1  Missing/invalid manifest, unknown flag, unknown effect, --out path error, or unknown subcommand',
      '',
      'This is a planning aid, not a runtime side-effect enforcer or risk-tier classifier.'
    ].join('\n'),
    examples: 'Usage: tusq examples <subcommand>\n  Subcommands: index',
    'examples index': [
      'Usage: tusq examples index [--tier <none|low|medium|high|unknown>] [--manifest <path>] [--out <path>] [--json]',
      '',
      'Flags:',
      '  --tier <none|low|medium|high|unknown>  Filter to a single examples count tier bucket (default: all tiers; case-sensitive lowercase)',
      '  --manifest <path>                      Manifest file to read (default: tusq.manifest.json)',
      '  --out <path>                           Write index to file (no stdout on success)',
      '  --json                                 Emit machine-readable JSON (includes warnings[] for malformed examples)',
      '',
      'Tier function (applied to examples[] array length):',
      '  none    if length === 0',
      '  low     if 1 <= length <= 2',
      '  medium  if 3 <= length <= 5',
      '  high    if length >= 6',
      '  unknown if examples is null/missing/not-an-array, contains a null element, an array element, or a non-object element',
      '',
      'Bucket iteration order: none → low → medium → high → unknown (closed-enum order, not manifest first-appearance)',
      '',
      'Exit codes:',
      '  0  Index produced (or empty-capabilities manifest)',
      '  1  Missing/invalid manifest, unknown flag, unknown tier, --out path error, or unknown subcommand',
      '',
      'This is a planning aid, not a runtime example executor, schema validator, example generator, or eval-readiness certifier; tiers are deterministic stable-output ordering only (NOT coverage-quality-ranked).'
    ].join('\n'),
    input: 'Usage: tusq input <subcommand>\n  Subcommands: index',
    'input index': [
      'Usage: tusq input index [--tier <none|low|medium|high|unknown>] [--manifest <path>] [--out <path>] [--json]',
      '',
      'Flags:',
      '  --tier <none|low|medium|high|unknown>  Filter to a single required input field count tier bucket (default: all tiers; case-sensitive lowercase)',
      '  --manifest <path>                      Manifest file to read (default: tusq.manifest.json)',
      '  --out <path>                           Write index to file (no stdout on success)',
      '  --json                                 Emit machine-readable JSON (includes warnings[] for malformed input_schema)',
      '',
      'Tier function (applied to input_schema.required[] array length):',
      '  none    if length === 0',
      '  low     if 1 <= length <= 2',
      '  medium  if 3 <= length <= 5',
      '  high    if length >= 6',
      '  unknown if input_schema is null/missing/not-a-plain-object, required is null/missing/not-an-array, or required contains a non-string or empty-string element',
      '',
      'Bucket iteration order: none → low → medium → high → unknown (closed-enum order, not manifest first-appearance)',
      '',
      'Exit codes:',
      '  0  Index produced (or empty-capabilities manifest)',
      '  1  Missing/invalid manifest, unknown flag, unknown tier, --out path error, or unknown subcommand',
      '',
      'This is a planning aid, not a runtime input executor, input-schema validator, input generator, or exposure-safety certifier; tiers are deterministic stable-output ordering only (NOT exposure-risk-ranked).'
    ].join('\n'),
    method: 'Usage: tusq method <subcommand>\n  Subcommands: index',
    'method index': [
      'Usage: tusq method index [--method <GET|POST|PUT|PATCH|DELETE|unknown>] [--manifest <path>] [--out <path>] [--json]',
      '',
      'Flags:',
      '  --method <GET|POST|PUT|PATCH|DELETE|unknown>  Filter to a single HTTP method bucket (default: all methods; case-sensitive uppercase)',
      '  --manifest <path>                             Manifest file to read (default: tusq.manifest.json)',
      '  --out <path>                                  Write index to file (no stdout on success)',
      '  --json                                        Emit machine-readable JSON',
      '',
      'Bucket iteration order: GET → POST → PUT → PATCH → DELETE → unknown (closed-enum order, not manifest first-appearance)',
      '',
      'Exit codes:',
      '  0  Index produced (or empty-capabilities manifest)',
      '  1  Missing/invalid manifest, unknown flag, unknown method, --out path error, or unknown subcommand',
      '',
      'This is a planning aid, not a runtime HTTP-method router, REST-convention validator, or idempotency classifier.'
    ].join('\n'),
    output: 'Usage: tusq output <subcommand>\n  Subcommands: index',
    'output index': [
      'Usage: tusq output index [--tier <none|low|medium|high|unknown>] [--manifest <path>] [--out <path>] [--json]',
      '',
      'Flags:',
      '  --tier <none|low|medium|high|unknown>  Filter to a single output schema property count tier bucket (default: all tiers; case-sensitive lowercase)',
      '  --manifest <path>                      Manifest file to read (default: tusq.manifest.json)',
      '  --out <path>                           Write index to file (no stdout on success)',
      '  --json                                 Emit machine-readable JSON (includes warnings[] for malformed output_schema)',
      '',
      'Tier function (applied to Object.keys(output_schema.properties).length):',
      '  none    if length === 0',
      '  low     if 1 <= length <= 2',
      '  medium  if 3 <= length <= 5',
      '  high    if length >= 6',
      '  unknown if output_schema is null/missing/not-a-plain-object, output_schema.properties is null/missing/not-a-plain-object,',
      '          or output_schema.properties contains any non-object property descriptor (null, primitive, array, or function)',
      '          Note: type:array schemas (where properties legitimately does not apply) are bucketed as unknown — informative, not a defect.',
      '',
      'Bucket iteration order: none → low → medium → high → unknown (closed-enum order, not manifest first-appearance)',
      '',
      'Exit codes:',
      '  0  Index produced (or empty-capabilities manifest)',
      '  1  Missing/invalid manifest, unknown flag, unknown tier, --out path error, or unknown subcommand',
      '',
      'This is a planning aid, not a runtime output executor, output-schema validator, doc-contradiction detector, output generator, or doc-accuracy certifier; tiers are deterministic stable-output ordering only (NOT doc-drift-risk-ranked).'
    ].join('\n'),
    path: 'Usage: tusq path <subcommand>\n  Subcommands: index',
    'path index': [
      'Usage: tusq path index [--tier <none|low|medium|high|unknown>] [--manifest <path>] [--out <path>] [--json]',
      '',
      'Flags:',
      '  --tier <none|low|medium|high|unknown>  Filter to a single path segment count tier bucket (default: all tiers; case-sensitive lowercase)',
      '  --manifest <path>                      Manifest file to read (default: tusq.manifest.json)',
      '  --out <path>                           Write index to file (no stdout on success)',
      "  --json                                 Emit machine-readable JSON (includes warnings[] for malformed path fields)",
      '',
      "Tier function (applied to path.split('/').filter(Boolean).length):",
      "  none    if length === 0 (path is '/')",
      '  low     if 1 <= length <= 2',
      '  medium  if 3 <= length <= 4',
      '  high    if length >= 5',
      "  unknown if path is null/missing/not-a-string, empty string, does not start with '/',",
      "          or contains an empty interior segment (double slash or trailing slash other than '/')",
      '          Path parameters (e.g., :id, :orgId) count as one segment each — not unwrapped.',
      '',
      'Bucket iteration order: none → low → medium → high → unknown (closed-enum order, not manifest first-appearance)',
      '',
      'Exit codes:',
      '  0  Index produced (or empty-capabilities manifest)',
      '  1  Missing/invalid manifest, unknown flag, unknown tier, --out path error, or unknown subcommand',
      '',
      "This is a planning aid, not a runtime URL router, path validator, route registry, artifact sprawl executor, or path-depth certifier; tiers are deterministic stable-output ordering only (NOT sprawl-risk-ranked)."
    ].join('\n'),
    pii: 'Usage: tusq pii <subcommand>\n  Subcommands: index',
    'pii index': [
      'Usage: tusq pii index [--tier <none|low|medium|high|unknown>] [--manifest <path>] [--out <path>] [--json]',
      '',
      'Flags:',
      '  --tier <none|low|medium|high|unknown>  Filter to a single PII field count tier bucket (default: all tiers; case-sensitive lowercase)',
      '  --manifest <path>                      Manifest file to read (default: tusq.manifest.json)',
      '  --out <path>                           Write index to file (no stdout on success)',
      '  --json                                 Emit machine-readable JSON (includes warnings[] for malformed pii_fields)',
      '',
      'Tier function (applied to pii_fields[] array length):',
      '  none    if length === 0',
      '  low     if 1 <= length <= 2',
      '  medium  if 3 <= length <= 5',
      '  high    if length >= 6',
      '  unknown if pii_fields is null/missing/not-an-array, contains a non-string element, or contains the empty string',
      '',
      'Bucket iteration order: none → low → medium → high → unknown (closed-enum order, not manifest first-appearance)',
      '',
      'Exit codes:',
      '  0  Index produced (or empty-capabilities manifest)',
      '  1  Missing/invalid manifest, unknown flag, unknown tier, --out path error, or unknown subcommand',
      '',
      'This is a planning aid, not a runtime PII detector, data-leakage prevention engine, runtime redaction enforcer, or compliance certifier; PII field counts are reviewer-aid metadata derived from M25 source-literal name hints, not validated PII presence.'
    ].join('\n'),
    policy: 'Usage: tusq policy <subcommand>\n  Subcommands: init, verify',
    'policy init': 'Usage: tusq policy init [--mode <describe-only|dry-run>] [--reviewer <id>] [--allowed-capabilities <name,...>] [--out <path>] [--force] [--dry-run] [--json] [--verbose]',
    'policy verify': 'Usage: tusq policy verify [--policy <path>] [--strict [--manifest <path>]] [--json] [--verbose]',
    redaction: 'Usage: tusq redaction <subcommand>\n  Subcommands: review',
    response: 'Usage: tusq response <subcommand>\n  Subcommands: index',
    'response index': [
      'Usage: tusq response index [--type <object|array|string|number|boolean|null|unknown>] [--manifest <path>] [--out <path>] [--json]',
      '',
      'Flags:',
      '  --type <object|array|string|number|boolean|null|unknown>  Filter to a single output schema top-level type bucket (default: all types; case-sensitive lowercase)',
      '  --manifest <path>                                         Manifest file to read (default: tusq.manifest.json)',
      '  --out <path>                                              Write index to file (no stdout on success)',
      '  --json                                                    Emit machine-readable JSON (includes warnings[] for malformed output_schema)',
      '',
      'Type rule (literal match against JSON Schema 2020-12 spec primitives):',
      "  object   if output_schema.type === 'object'",
      "  array    if output_schema.type === 'array'",
      "  string   if output_schema.type === 'string'",
      "  number   if output_schema.type === 'number'",
      "  boolean  if output_schema.type === 'boolean'",
      "  null     if output_schema.type === 'null'",
      '  unknown  if output_schema or output_schema.type is missing/malformed, or the type string is not in the spec primitive set',
      "           Note: 'integer' is bucketed as unknown (per JSON Schema spec, integer is a subset of number — not a separate primitive).",
      '           Compositional schemas (oneOf/anyOf/allOf without top-level type) are bucketed as unknown.',
      "           Array-of-types (type: ['object', 'null']) are bucketed as unknown (output_schema.type is an array not a string).",
      '',
      'Bucket iteration order: object → array → string → number → boolean → null → unknown (closed-enum order, not manifest first-appearance)',
      '',
      'Exit codes:',
      '  0  Index produced (or empty-capabilities manifest)',
      '  1  Missing/invalid manifest, unknown flag, unknown type, --out path error, or unknown subcommand',
      '',
      'This is a planning aid, not a runtime response executor, response-payload validator, data-contract conformance detector, response generator, or data-contract certifier; types are deterministic stable-output ordering only (NOT data-contract-completeness-ranked).'
    ].join('\n'),
    sensitivity: 'Usage: tusq sensitivity <subcommand>\n  Subcommands: index',
    'sensitivity index': [
      'Usage: tusq sensitivity index [--sensitivity <public|internal|confidential|restricted|unknown>] [--manifest <path>] [--out <path>] [--json]',
      '',
      'Flags:',
      '  --sensitivity <public|internal|confidential|restricted|unknown>  Filter to a single sensitivity class bucket (default: all classes)',
      '  --manifest <path>                                                 Manifest file to read (default: tusq.manifest.json)',
      '  --out <path>                                                      Write index to file (no stdout on success)',
      '  --json                                                            Emit machine-readable JSON',
      '',
      'Bucket iteration order: public → internal → confidential → restricted → unknown (closed-enum order, not manifest first-appearance)',
      '',
      'Exit codes:',
      '  0  Index produced (or empty-capabilities manifest)',
      '  1  Missing/invalid manifest, unknown flag, unknown sensitivity, --out path error, or unknown subcommand',
      '',
      'This is a planning aid, not a runtime sensitivity enforcer or compliance certifier.'
    ].join('\n'),
    surface: 'Usage: tusq surface <subcommand>\n  Subcommands: plan',
    'surface plan': [
      'Usage: tusq surface plan [--surface <chat|palette|widget|voice|all>] [--manifest <path>] [--out <path>] [--json]',
      '',
      'Flags:',
      '  --surface <chat|palette|widget|voice|all>  Surface filter (default: all)',
      '  --manifest <path>                          Manifest file to read (default: tusq.manifest.json)',
      '  --out <path>                               Write plan to file (no stdout on success)',
      '  --json                                     Emit machine-readable JSON',
      '',
      'Exit codes:',
      '  0  Plan produced (or empty-capabilities manifest)',
      '  1  Missing/invalid manifest, unknown flag, unknown surface, --out path error, or unknown subcommand',
      '',
      'This is a planning aid, not a runtime surface generator.'
    ].join('\n'),
    'redaction review': [
      'Usage: tusq redaction review [--manifest <path>] [--capability <name>] [--json]',
      '',
      'Flags:',
      '  --manifest <path>    Manifest file to read (default: tusq.manifest.json)',
      '  --capability <name>  Filter to one exact capability name',
      '  --json               Emit machine-readable JSON',
      '',
      'Exit codes:',
      '  0  Manifest was read and the report was emitted',
      '  1  Missing/invalid manifest, unknown flag, unknown capability, or unknown subcommand',
      '',
      'This is a reviewer aid, not a runtime enforcement gate.'
    ].join('\n')
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

// M24: extract the content between a matching pair of open/close chars starting at startIndex.
// Skips over single/double/backtick string literals to avoid counting delimiters inside strings.
// Returns the inner content (excluding the open/close chars), or null if the block is unbalanced.
function extractBalancedBlock(source, startIndex, openChar, closeChar) {
  if (source[startIndex] !== openChar) return null;
  let depth = 0;
  let i = startIndex;
  while (i < source.length) {
    const ch = source[i];
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      i += 1;
      while (i < source.length) {
        if (source[i] === '\\') { i += 2; continue; }
        if (source[i] === quote) { i += 1; break; }
        i += 1;
      }
      continue;
    }
    if (ch === openChar) depth += 1;
    else if (ch === closeChar) {
      depth -= 1;
      if (depth === 0) return source.slice(startIndex + 1, i);
    }
    i += 1;
  }
  return null;
}

// M24: given an options block string (content between the outer {}), attempt to extract
// a structured schema_fields record from a literal `schema: { body: { properties: {...} } }` pattern.
// Returns { body: { properties: {...}, required: [...] } } on success, or null on any parse failure.
// Partial extraction is forbidden: any failed step returns null and the caller falls back to M15.
function extractFastifySchemaBody(optionsBlock) {
  // Step 1: locate schema: { (literal brace — variable references like schema: mySchema won't match)
  const schemaMatch = /\bschema\s*:\s*\{/.exec(optionsBlock);
  if (!schemaMatch) return null;
  const schemaBraceIdx = schemaMatch.index + schemaMatch[0].length - 1;

  // Step 2: balanced-brace-match the schema block
  const schemaBlock = extractBalancedBlock(optionsBlock, schemaBraceIdx, '{', '}');
  if (!schemaBlock) return null;

  // Step 3: locate body: { inside schema block
  const bodyMatch = /\bbody\s*:\s*\{/.exec(schemaBlock);
  if (!bodyMatch) return null;
  const bodyBraceIdx = bodyMatch.index + bodyMatch[0].length - 1;

  // Step 4: balanced-brace-match the body block
  const bodyBlock = extractBalancedBlock(schemaBlock, bodyBraceIdx, '{', '}');
  if (!bodyBlock) return null;

  // Step 5: locate properties: { inside body block
  const propertiesMatch = /\bproperties\s*:\s*\{/.exec(bodyBlock);
  if (!propertiesMatch) return null;
  const propertiesBraceIdx = propertiesMatch.index + propertiesMatch[0].length - 1;

  // Step 6: balanced-brace-match the properties block
  const propertiesBlock = extractBalancedBlock(bodyBlock, propertiesBraceIdx, '{', '}');
  if (!propertiesBlock) return null;

  // Step 7: iterate top-level property entries in source (declaration) order
  const properties = {};
  let pos = 0;
  while (pos < propertiesBlock.length) {
    // Skip whitespace and commas
    const wsMatch = /^[\s,]+/.exec(propertiesBlock.slice(pos));
    if (wsMatch) { pos += wsMatch[0].length; continue; }

    // Try to match a top-level property name followed by : {
    const propMatch = /^([A-Za-z_$][A-Za-z0-9_$]*)\s*:\s*\{/.exec(propertiesBlock.slice(pos));
    if (!propMatch) { pos += 1; continue; }

    const fieldName = propMatch[1];
    const braceOffset = propMatch[0].lastIndexOf('{');
    const braceAbsIdx = pos + braceOffset;

    const fieldBlock = extractBalancedBlock(propertiesBlock, braceAbsIdx, '{', '}');
    if (!fieldBlock) return null; // fail safe — drop entire schema_fields

    // Extract the type string literal; default to 'string' if absent (Fastify default)
    const typeMatch = /\btype\s*:\s*(['"`])(string|number|integer|boolean|object|array)\1/.exec(fieldBlock);
    properties[fieldName] = { type: typeMatch ? typeMatch[2] : 'string' };

    // Advance pos past the closing brace of this field entry
    let depth = 0;
    let j = braceAbsIdx;
    while (j < propertiesBlock.length) {
      const ch = propertiesBlock[j];
      if (ch === '{') depth += 1;
      else if (ch === '}') {
        depth -= 1;
        if (depth === 0) { pos = j + 1; break; }
      }
      j += 1;
    }
    if (depth !== 0) return null;
  }

  if (Object.keys(properties).length === 0) return null;

  // Step 8: locate required: [ inside body block and parse string items
  const required = [];
  const requiredMatch = /\brequired\s*:\s*\[/.exec(bodyBlock);
  if (requiredMatch) {
    const bracketIdx = requiredMatch.index + requiredMatch[0].length - 1;
    const bracketContent = extractBalancedBlock(bodyBlock, bracketIdx, '[', ']');
    if (!bracketContent) return null; // fail safe
    const itemRegex = /['"`]([^'"`\n]+)['"`]/g;
    let itemMatch;
    while ((itemMatch = itemRegex.exec(bracketContent)) !== null) {
      required.push(itemMatch[1]);
    }
  }

  return { body: { properties, required } };
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
      schema_fields: extractFastifySchemaBody(optionsBlock),
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
      schema_fields: extractFastifySchemaBody(block),
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

  if (route.schema_fields) {
    score += 0.04;
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

function classifySensitivity(cap) {
  // M28: six-rule first-match-wins decision table (frozen — any rule change is a governance event)
  const verb = (cap.method || '').toLowerCase();
  const route = cap.path || '';
  const piiCats = cap.redaction && cap.redaction.pii_categories;
  const preserve = cap.preserve === true;
  const authRequired = !!(cap.auth_hints && cap.auth_hints.length > 0);

  // Zero-evidence guard: no verb, no route, no PII, no preserve, no auth → unknown
  if (!verb && !route && !(piiCats && piiCats.length) && !preserve && !authRequired) {
    return 'unknown';
  }

  // R1: preserve flag signals irreversible or destructive-by-intent semantics
  if (preserve) return 'restricted';

  // R2: admin/destructive verb or admin-namespaced route
  const RESTRICTED_VERBS = new Set(['delete', 'drop', 'truncate', 'admin', 'destroy', 'purge', 'wipe']);
  if (RESTRICTED_VERBS.has(verb)) return 'restricted';
  if (/^(admin|root|superuser)(\/|$)/i.test(route)) return 'restricted';

  // R3: confirmed PII-category evidence from M26 static labels
  if (piiCats && piiCats.length) return 'confidential';

  // R4: write verb into financial or regulated context
  const WRITE_VERBS = new Set(['create', 'update', 'write', 'post', 'put', 'patch']);
  const FINANCIAL_RE = /payment|invoice|charge|billing|ssn|tax|account_number/i;
  if (WRITE_VERBS.has(verb)) {
    const props = (cap.input_schema && cap.input_schema.properties) || {};
    if (FINANCIAL_RE.test(route) || Object.keys(props).some((k) => FINANCIAL_RE.test(k))) {
      return 'confidential';
    }
  }

  // R5: auth gate or narrow write that does not meet R3/R4 threshold
  if (authRequired) return 'internal';
  if (WRITE_VERBS.has(verb)) return 'internal';

  // R6: default — evidence is present and no stronger rule matched
  return 'public';
}

function normalizeSensitivityClass(value) {
  if (typeof value !== 'string') {
    return 'unknown';
  }

  const normalized = value.trim().toLowerCase();
  return SENSITIVITY_CLASSES.includes(normalized) ? normalized : 'unknown';
}

// M29: extract a list of quoted string items from the first match of pattern in annotations.
// Order-preserving, case-sensitive dedup, empty-array on zero matches (never null).
function extractFrozenList(annotations, pattern) {
  const seen = new Set();
  const result = [];
  for (const annotation of annotations) {
    const m = pattern.exec(String(annotation));
    if (m) {
      const items = m[1].split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
      for (const item of items) {
        if (item && !seen.has(item)) {
          seen.add(item);
          result.push(item);
        }
      }
    }
  }
  return result;
}

function classifyAuthRequirements(cap) {
  // M29: six-rule first-match-wins decision table (frozen — any rule change is a governance event)
  const middlewareList = cap.auth_hints || [];
  const annotations = cap.auth_hints || [];

  // Zero-evidence guard (FIRST check — before R1 runs)
  const hasMiddleware = middlewareList.length > 0;
  const hasRoute = !!(cap.path);
  const hasAuthFlag = typeof cap.auth_required === 'boolean';
  const hasSensitivitySignal = cap.sensitivity_class && cap.sensitivity_class !== 'unknown';
  if (!hasMiddleware && !hasRoute && !hasAuthFlag && !hasSensitivitySignal) {
    return { auth_scheme: 'unknown', auth_scopes: [], auth_roles: [], evidence_source: 'none' };
  }

  // Scope/role extraction (frozen patterns — order-preserving, case-sensitive dedup)
  const scopes = extractFrozenList(annotations, /scopes?:\s*\[([^\]]+)\]/);
  const roles = extractFrozenList(annotations, /role[s]?:\s*\[([^\]]+)\]/);

  // R1..R5: middleware-name first-match-wins
  const RULES = [
    [/bearer|jwt|access[_-]?token/i, 'bearer'],
    [/api[_-]?key|x-api-key/i, 'api_key'],
    [/session|cookie|passport-local/i, 'session'],
    [/basic[_-]?auth/i, 'basic'],
    [/oauth|oidc|openid/i, 'oauth']
  ];

  for (const [re, scheme] of RULES) {
    if (middlewareList.some((name) => re.test(name))) {
      return { auth_scheme: scheme, auth_scopes: scopes, auth_roles: roles, evidence_source: 'middleware_name' };
    }
  }

  // R6: explicit auth_required=false on non-admin route
  const isAdminRoute = /^\/(admin|root|superuser)(\/|$)/i.test(cap.path || '');
  if (cap.auth_required === false && !isAdminRoute) {
    return { auth_scheme: 'none', auth_scopes: scopes, auth_roles: roles, evidence_source: 'auth_required_flag' };
  }

  // Default: evidence present but no rule matched
  return { auth_scheme: 'unknown', auth_scopes: scopes, auth_roles: roles, evidence_source: 'none' };
}

function normalizeAuthScheme(value) {
  if (typeof value !== 'string') return 'unknown';
  const normalized = value.trim().toLowerCase();
  return AUTH_SCHEMES.includes(normalized) ? normalized : 'unknown';
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

// M25: pure extractor — whole-key normalized match against PII_CANONICAL_NAMES.
// Normalization: toLowerCase() then strip '_' and '-'. No partial/tail/substring match.
// Returns matched source-literal keys in input_schema.properties iteration order.
function extractPiiFieldHints(properties) {
  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) {
    return [];
  }
  const matched = [];
  for (const key of Object.keys(properties)) {
    const normalized = key.toLowerCase().replace(/[_-]/g, '');
    if (PII_CANONICAL_NAMES.has(normalized)) {
      matched.push(key);
    }
  }
  return matched;
}

// M26: pure extractor — one category label for each M25-emitted pii_fields entry.
// Categories preserve pii_fields order and use the same whole-key normalization rule.
function extractPiiFieldCategories(piiFields) {
  if (!Array.isArray(piiFields) || piiFields.length === 0) {
    return [];
  }
  const categories = [];
  for (const field of piiFields) {
    if (typeof field !== 'string') {
      continue;
    }
    const normalized = field.toLowerCase().replace(/[_-]/g, '');
    const category = PII_CATEGORY_BY_NAME[normalized];
    if (!category) {
      throw new CliError(`PII field '${field}' does not map to a known category`, 1);
    }
    categories.push(category);
  }
  return categories;
}

function defaultRedaction() {
  return {
    pii_fields: [],
    pii_categories: [],
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

  if (Array.isArray(value.pii_categories)) {
    out.pii_categories = value.pii_categories
      .filter((entry) => typeof entry === 'string')
      .map((entry) => entry.trim())
      .filter(Boolean);
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
    auth_requirements: capability.auth_requirements || null,
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

  // Path parameters are always authoritative for the URL shape
  for (const name of pathParameters) {
    properties[name] = {
      type: 'string',
      source: 'path',
      description: `Path parameter: ${name}`
    };
    required.push(name);
  }

  // M24: when schema_fields were successfully extracted from a literal Fastify schema.body block,
  // merge the declared field shapes. Path params win on name collision (path is authoritative).
  const schemaFields = route.schema_fields;
  if (schemaFields && schemaFields.body && schemaFields.body.properties) {
    const pathParamSet = new Set(pathParameters);
    for (const [fieldName, fieldDef] of Object.entries(schemaFields.body.properties)) {
      if (!pathParamSet.has(fieldName)) {
        properties[fieldName] = { type: fieldDef.type };
      }
    }
    // Merge required entries from the body schema, skipping path params already listed
    for (const req of (schemaFields.body.required || [])) {
      if (!pathParamSet.has(req) && !required.includes(req)) {
        required.push(req);
      }
    }
    return {
      type: 'object',
      properties,
      required,
      additionalProperties: false,
      source: 'fastify_schema_body',
      description: describeInputSchema(route, hasSchema, pathParameters.length)
    };
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
