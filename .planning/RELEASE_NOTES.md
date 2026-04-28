# Release Notes — tusq v0.1.0

## QA Verification — M54 (turn_03155e38972d94a4, run_ca31318ae2693a36, 2026-04-28, HEAD e3c08a2)

**Milestone:** M54 — Static Capability Input Schema First Property Enum Constraint Presence Index Export from Manifest Evidence (~0.5 day) — V1.35

**Turn context:** Formal qa-phase verification turn challenging the prior accepted dev turn (turn_bb0592709e7268f5, role=dev). HEAD e3c08a2 = M54 implementation checkpoint. All M54 implementation (src/cli.js, tests/smoke.mjs, 45 eval scenarios) confirmed at this HEAD.

**Verification summary (run this turn):** `npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (45 scenarios)`. `node -e "require('./src/cli.js')"` → exit 0 (guards `_guardInputSchemaFirstPropertyEnumConstraintBucketKey` at src/cli.js:7775 and `_guardInputSchemaFirstPropertyEnumConstraintAggregationKey` at src/cli.js:7782 pass). `node bin/tusq.js help | grep -c '^  [a-z]'` → 38. `node bin/tusq.js choice index --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, `first_property_enum_constraints[]` with `unenumerated` bucket (get_users_api_v1_users_id AND post_users_users; aggregation_key `"enum_constraint"`), `not_applicable` bucket (get_users_users; aggregation_key `"not_applicable"`); `enumerated` bucket absent; `warnings: []`. `node bin/tusq.js choice index --manifest tests/fixtures/express-sample/tusq.manifest.json --choice ENUMERATED` → exit 1 (case-sensitive). `node bin/tusq.js choice index --manifest tests/fixtures/express-sample/tusq.manifest.json --choice enumerated` → exit 1, absent-bucket. `git diff --quiet HEAD -- package.json package-lock.json` → exit 0 (zero package drift). `git diff --quiet HEAD -- tests/fixtures/` → exit 0 (zero fixture mutation).

**New capability:** `tusq choice index` — indexes capabilities by `input_schema.properties[firstKey].enum` JSON-Schema-enum-constraint presence classification. Four-value bucket-key enum: `enumerated | unenumerated | not_applicable | unknown`. Three-value aggregation_key enum: `enum_constraint | not_applicable | unknown`. Classifier: enumerated (non-empty Array enum present on first property — including single-value degenerate `enum: ['x']`), unenumerated (enum missing/null/undefined — semantically absent), not_applicable (non-object input_schema or zero-property object), unknown (malformed input_schema, firstVal not a plain object, or firstVal.enum present-but-non-array-or-empty-array). **M54-specific divergence from M52/M53:** `enum: []` (empty array) → unknown WITH warning (NOT unenumerated) — because empty enum is malformed JSON-Schema (requires ≥1 allowed value); `enum: null` → unenumerated (absent). Warning code `input_schema_properties_first_property_enum_invalid_when_present` spans both non-array and empty-array malformations (single frozen code for both paths). Bucket iteration order: `enumerated → unenumerated → not_applicable → unknown`. Case-sensitive lowercase-only `--choice` filter. Non-persistent (does NOT write `input_schema_first_property_enum_constraint` into tusq.manifest.json). Planning aid: surfaces enum-constraint presence exposure per capability to help governance reviewers assess command-palette readiness, widget composition surfaces, and closed-vocabulary coverage. First milestone to use § Embeddable Widgets And Command Surfaces as primary VISION aggregation source.

**OBJ-006 (low, non-blocking):** M54 code emits undeclared 6th warning reason code `input_schema_properties_first_property_descriptor_invalid` (for firstVal-not-a-plain-object malformation path at src/cli.js:7905), beyond the 5 PM-frozen codes. Same pattern as M52's OBJ-004 and M53's OBJ-005. Functionally correct; does not affect classification outcomes. Carried forward for next PM cycle.

**Acceptance criteria:** 739 total (REQ-001–REQ-739). Added REQ-715–REQ-739 (25 new M54 criteria) this turn. All 739 pass. Ship verdict: SHIP.

## QA Verification — M53 (turn_7c5f41d07c7e67e1, run_e05bf49856cd2880, 2026-04-28, HEAD 7659122)

**Milestone:** M53 — Static Capability Input Schema First Property Format Hint Presence Index Export from Manifest Evidence (~0.5 day) — V1.34

**Turn context:** Formal qa-phase verification turn challenging the prior accepted dev turn (turn_3bd0b034cb7c2180, role=dev). HEAD 7659122 = M53 implementation checkpoint. All M53 implementation (src/cli.js, tests/smoke.mjs, 44 eval scenarios) confirmed at this HEAD.

**Verification summary (run this turn):** `npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (44 scenarios)`. `node -e "require('./src/cli.js')"` → exit 0 (guards `_guardInputSchemaFirstPropertyFormatHintBucketKey` at src/cli.js:7355 and `_guardInputSchemaFirstPropertyFormatHintAggregationKey` at src/cli.js:7362 pass). `node bin/tusq.js help | grep -c '^  [a-z]'` → 37. `node bin/tusq.js hint index --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, `first_property_format_hints[]` with `unhinted` bucket (get_users_api_v1_users_id AND post_users_users; aggregation_key `"format_hint"`), `not_applicable` bucket (get_users_users; aggregation_key `"not_applicable"`); `hinted` bucket absent; `warnings: []`. `node bin/tusq.js hint index --manifest tests/fixtures/express-sample/tusq.manifest.json --hint HINTED` → exit 1 (case-sensitive). `node bin/tusq.js hint index --manifest tests/fixtures/express-sample/tusq.manifest.json --hint hinted` → exit 1, absent-bucket. `git diff --quiet HEAD -- package.json package-lock.json` → exit 0 (zero package drift). `git diff --quiet HEAD -- tests/fixtures/` → exit 0 (zero fixture mutation).

**New capability:** `tusq hint index` — indexes capabilities by `input_schema.properties[firstKey].format` JSON-Schema-format-hint presence classification. Four-value bucket-key enum: `hinted | unhinted | not_applicable | unknown`. Three-value aggregation_key enum: `format_hint | not_applicable | unknown`. Classifier: hinted (non-empty trimmed format string present on first property — any JSON-Schema format hint such as `email`, `date`, `uri`, `uuid`), unhinted (format missing/null/undefined or empty/whitespace-only string — knowledge-artifact-rendering gap signal, not a typing failure), not_applicable (non-object input_schema or zero-property object), unknown (malformed input_schema or firstVal not a plain object or firstVal.format present-but-non-string). Bucket iteration order: `hinted → unhinted → not_applicable → unknown`. Case-sensitive lowercase-only `--hint` filter. Non-persistent (does NOT write `input_schema_first_property_format_hint` into tusq.manifest.json). Planning aid: surfaces format-hint presence exposure per capability to help governance reviewers assess knowledge-artifact rendering gaps (help flows, troubleshooting trees, RAG retrieval manifests, SDK-call-site widgets). First milestone to use § Knowledge Artifacts as primary VISION aggregation source.

**OBJ-005 (low, non-blocking):** M53 code emits undeclared 6th warning reason code `input_schema_properties_first_property_descriptor_invalid` (for firstVal-not-a-plain-object malformation path), beyond the 5 PM-frozen codes. Same pattern as M52's OBJ-004. Functionally correct; does not affect classification outcomes. Carried forward for next PM cycle.

**Acceptance criteria:** 714 total (REQ-001–REQ-714). Added REQ-690–REQ-714 (25 new M53 criteria) this turn. All 714 pass. Ship verdict: SHIP.

## QA Verification — M52 (turn_dfcb56e6034f88b5, run_3f128359168988b4, 2026-04-28, HEAD c4aee92)

**Milestone:** M52 — Static Capability Input Schema First Property Description Presence Index Export from Manifest Evidence (~0.5 day) — V1.33

**Turn context:** Formal qa-phase verification turn challenging the prior accepted dev turn (turn_09c7bb9f6448bf1a, role=dev). HEAD c4aee92 = M52 implementation checkpoint. All M52 implementation (src/cli.js, tests/smoke.mjs, 43 eval scenarios) confirmed at this HEAD.

**Verification summary (run this turn):** `npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (43 scenarios)`. `node -e "require('./src/cli.js')"` → exit 0 (guards `_guardInputSchemaFirstPropertyDescriptionPresenceBucketKey` at src/cli.js:6936 and `_guardInputSchemaFirstPropertyDescriptionPresenceAggregationKey` at src/cli.js:6943 pass). `node bin/tusq.js help | grep -c '^  [a-z]'` → 36. `node bin/tusq.js gloss index --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, `first_property_description_presences[]` with `described` bucket (get_users_api_v1_users_id; aggregation_key `"description_presence"`), `undescribed` bucket (post_users_users; aggregation_key `"description_presence"`), and `not_applicable` bucket (get_users_users; aggregation_key `"not_applicable"`); `warnings: []`. `node bin/tusq.js gloss index --manifest tests/fixtures/express-sample/tusq.manifest.json --presence DESCRIBED` → exit 1 (case-sensitive). `node bin/tusq.js gloss index --manifest tests/fixtures/express-sample/tusq.manifest.json --presence unknown` → exit 1, absent-bucket. `git diff --quiet HEAD -- package.json package-lock.json` → exit 0 (zero package drift). `git diff --quiet HEAD -- tests/fixtures/` → exit 0 (zero fixture mutation).

**New capability:** `tusq gloss index` — indexes capabilities by `input_schema.properties[firstKey].description` docstring-presence classification. Four-value bucket-key enum: `described | undescribed | not_applicable | unknown`. Three-value aggregation_key enum: `description_presence | not_applicable | unknown`. Classifier: described (non-empty trimmed description string), undescribed (missing/null/undefined or empty/whitespace-only description — documentation-completeness signal, not a typing failure), not_applicable (non-object input_schema or zero-property object), unknown (malformed input_schema or firstVal not a plain object or firstVal.description present-but-non-string). Bucket iteration order: `described → undescribed → not_applicable → unknown`. Case-sensitive lowercase-only `--presence` filter. Non-persistent (does NOT write `input_schema_first_property_description_presence` into tusq.manifest.json). Planning aid: surfaces docstring-presence exposure per capability to help governance reviewers assess documentation coverage gaps.

**OBJ-004 (low, non-blocking):** M52 code emits undeclared 6th warning reason code `input_schema_properties_first_property_descriptor_invalid` (src/cli.js:7064) for the firstVal-not-a-plain-object malformation path, beyond the 5 PM-frozen codes. Functionally correct; does not affect classification outcomes. Carried forward for next PM cycle.

**Acceptance criteria:** 689 total (REQ-001–REQ-689). Added REQ-665–REQ-689 (25 new M52 criteria) this turn. All 689 pass. Ship verdict: SHIP.

## QA Verification — M51 (turn_b92a6c6bfa23b2bb, run_c39bd102a520411b, 2026-04-28, HEAD 9502125)

**Milestone:** M51 — Static Capability Input Schema First Property Source Index Export from Manifest Evidence (~0.5 day) — V1.32

**Turn context:** Formal qa-phase verification turn challenging the prior accepted dev turn (turn_b129a6090e6226ec, role=dev). HEAD 9502125 = M51 implementation checkpoint. All M51 implementation (src/cli.js, tests/smoke.mjs, 42 eval scenarios) confirmed at this HEAD.

**Verification summary (run this turn):** `npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (42 scenarios)`. `node -e "require('./src/cli.js')"` → exit 0 (guards `_guardInputSchemaFirstPropertySourceBucketKey` at src/cli.js:6535 and `_guardInputSchemaFirstPropertySourceAggregationKey` at src/cli.js:6542 pass). `node bin/tusq.js help | grep -c '^  [a-z]'` → 35. `node bin/tusq.js binding index --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, `first_property_sources[]` with `path` bucket (get_users_api_v1_users_id; aggregation_key `"source"`), `request_body` bucket (post_users_users; aggregation_key `"source"`), and `not_applicable` bucket (get_users_users; aggregation_key `"not_applicable"`); `warnings: []`. `node bin/tusq.js binding index --manifest tests/fixtures/express-sample/tusq.manifest.json --source PATH` → exit 1 (case-sensitive). `node bin/tusq.js binding index --manifest tests/fixtures/express-sample/tusq.manifest.json --source query` → exit 1, absent-bucket. `git diff --quiet HEAD -- package.json package-lock.json` → exit 0 (zero package drift). `git diff --quiet HEAD -- tests/fixtures/` → exit 0 (zero fixture mutation).

**New command:** `tusq binding index` — indexes capabilities by `input_schema.properties[firstKey].source` HTTP-request-anatomy locus. Six-value closed-enum bucket-key (path | request_body | query | header | not_applicable | unknown). Bucket iteration order: path → request_body → query → header → not_applicable → unknown (matching M43's first-four locus ordering). Result field: `first_property_sources[]`. Aggregation key: `source` for the four locus buckets; `not_applicable` for not_applicable; `unknown` for unknown. Non-persistent: `input_schema_first_property_source` MUST NOT appear in tusq.manifest.json.

**Acceptance:** 664 acceptance criteria pass (REQ-001–REQ-664; 25 new M51 REQs: REQ-640–REQ-664). Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA Verification — M50 (turn_6d5b4b79eaf3ab7b, run_6e53e7b50cd2c457, 2026-04-28, HEAD 1a99caf)

**Milestone:** M50 — Static Capability Input Schema First Property Required Status Index Export from Manifest Evidence (~0.5 day) — V1.31

**Turn context:** Formal qa-phase verification turn challenging the prior accepted dev turn (turn_99050f1349379e99, role=dev). HEAD 1a99caf = M50 implementation checkpoint. All M50 implementation (src/cli.js, tests/smoke.mjs, 41 eval scenarios) confirmed at this HEAD.

**Verification summary (run this turn):** `npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (41 scenarios)`. `node -e "require('./src/cli.js')"` → exit 0 (guards `_guardInputSchemaFirstPropertyRequiredStatusBucketKey` at src/cli.js:6118 and `_guardInputSchemaFirstPropertyRequiredStatusAggregationKey` at src/cli.js:6125 pass). `node bin/tusq.js help | grep -c '^  [a-z]'` → 34. `node bin/tusq.js obligation index --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, `required_statuses[]` with `required` bucket (get_users_api_v1_users_id; aggregation_key `"required_status"`), `optional` bucket (post_users_users; aggregation_key `"required_status"`), and `not_applicable` bucket (get_users_users; aggregation_key `"not_applicable"`); `warnings: []`. `node bin/tusq.js obligation index --manifest tests/fixtures/express-sample/tusq.manifest.json --status REQUIRED` → exit 1 (case-sensitive). `node bin/tusq.js obligation index --manifest tests/fixtures/express-sample/tusq.manifest.json --status unknown` → exit 1, absent-bucket. `git diff --quiet HEAD -- package.json package-lock.json` → exit 0 (zero package drift). `git diff --quiet HEAD -- tests/fixtures/` → exit 0 (zero fixture mutation).

**Acceptance criteria:** 639 total (REQ-001–REQ-639). Added REQ-615–REQ-639 (25 new M50 criteria) this turn. All PASS.

**Prior dev turn challenge:** turn_99050f1349379e99 upheld — 9 dev-owned files correctly modified (`git diff 2d191b6..1a99caf --name-only`; no manifest-format.md change because M50 is non-persistent), all 5 dev decisions sound, M50 implementation complete and correct.

**Key M50 features:** `tusq obligation index` command added (34th CLI command); `required_statuses[]` result field (plural-categorical, distinct from all prior index commands); four-value bucket-key enum (required/optional/not_applicable/unknown); three-value aggregation_key enum (required_status/not_applicable/unknown) — both `required` and `optional` buckets share aggregation_key `"required_status"` distinguishing M50 from all prior milestones; per-bucket field name `input_schema_first_property_required_status` (distinct from M49's `input_schema_first_property_type`); `not_applicable` bucket covers both non-object inputs (input_schema.type !== 'object') and zero-property object inputs — emits NO warning; `optional` bucket covers cases where required[] is absent/empty or first property is not in required[] — emits NO warning; five frozen warning reason codes including `input_schema_required_field_invalid_when_type_is_object` (distinct from M49's `input_schema_properties_first_property_descriptor_invalid`); bucket order required→optional→not_applicable→unknown; `obligation` noun inserted alphabetically between `method` and `output`; eval count 40→41; `INPUT_SCHEMA_FIRST_PROPERTY_REQUIRED_STATUS_BUCKET_ORDER` frozen array has 3 values (required/optional/not_applicable); unknown appended dynamically last. VISION source: § Action Execution Policy (lines 409–422) — first milestone to cite this section as primary aggregation source.

**Carried-forward objections (non-blocking):** OBJ-001 (medium): R6 auth_required dead code. OBJ-002 (low): surface-plan-determinism eval uses synthetic_capabilities. OBJ-003 (low): M31 per-domain flag value assertions.

---

## QA Verification — M49 (turn_cbc4204c2b1db778, run_9a2f6448e2199cda, 2026-04-28, HEAD 8801282)

**Milestone:** M49 — Static Capability Input Schema First Property Type Index Export from Manifest Evidence (~0.5 day) — V1.30

**Turn context:** Formal qa-phase verification turn challenging the prior accepted dev turn (turn_a71ef526db35c329, role=dev). HEAD 8801282 = M49 implementation checkpoint. All M49 implementation (src/cli.js, tests/smoke.mjs, 40 eval scenarios) confirmed at this HEAD.

**Verification summary (run this turn):** `npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (40 scenarios)`. `node -e "require('./src/cli.js')"` → exit 0 (guards `_guardInputSchemaFirstPropertyTypeBucketKey` at src/cli.js:5718 and `_guardInputSchemaFirstPropertyTypeAggregationKey` at src/cli.js:5725 pass). `node bin/tusq.js help | grep -c '^  [a-z]'` → 33. `node bin/tusq.js signature index --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, `first_property_types[]` with `string` bucket (get_users_api_v1_users_id; aggregation_key `"first_property_type"`), `object` bucket (post_users_users; aggregation_key `"first_property_type"`), and `not_applicable` bucket (get_users_users; aggregation_key `"not_applicable"`); `warnings: []`. `node bin/tusq.js signature index --first-type STRING --manifest tests/fixtures/express-sample/tusq.manifest.json` → exit 1 (case-sensitive). `node bin/tusq.js signature index --first-type boolean --manifest tests/fixtures/express-sample/tusq.manifest.json` → exit 1, absent-bucket. `git diff --quiet HEAD -- package.json package-lock.json` → exit 0 (zero package drift). `git diff --quiet HEAD -- tests/fixtures/` → exit 0 (zero fixture mutation).

**Acceptance criteria:** 614 total (REQ-001–REQ-614). Added REQ-590–REQ-614 (25 new M49 criteria) this turn. All PASS.

**Prior dev turn challenge:** turn_a71ef526db35c329 upheld — 9 dev-owned files correctly modified (`git diff f0fea4b..8801282 --name-only`; no manifest-format.md change because M49 is non-persistent), all 5 dev decisions sound, M49 implementation complete and correct.

**Key M49 features:** `tusq signature index` command added (33rd CLI command); `first_property_types[]` result field (matches M48 verbatim); nine-value bucket-key enum (string/number/integer/boolean/null/object/array/not_applicable/unknown); three-value aggregation_key enum (first_property_type/not_applicable/unknown) matching M48 precedent; per-bucket field name `input_schema_first_property_type` (distinct from M48's `output_schema_first_property_type`); `not_applicable` bucket covers both non-object inputs (input_schema.type !== 'object') and zero-property object inputs — emits NO warning; five frozen warning reason codes including `input_schema_properties_first_property_descriptor_invalid`; bucket order string→number→integer→boolean→null→object→array→not_applicable→unknown (scalar-primitives-first convention matching M48); eval count 39→40; `INPUT_SCHEMA_FIRST_PROPERTY_TYPE_BUCKET_ORDER` frozen array excludes `unknown` (always appended last dynamically). Critical distinction from M48 (shape): post_users_users lands in `object` bucket for input (body param type) vs `boolean` bucket for output (M48 response first property type) — confirms correct input-vs-output side separation.

**Carried-forward objections (non-blocking):** OBJ-001 (medium): R6 auth_required dead code. OBJ-002 (low): surface-plan-determinism eval uses synthetic_capabilities. OBJ-003 (low): M31 per-domain flag value assertions.

---

## QA Verification — M48 (turn_3795b2905fff720e, run_f61946531dda2fe6, 2026-04-28, HEAD c5eef25)

**Milestone:** M48 — Static Capability Output Schema First Property Type Index Export from Manifest Evidence (~0.5 day) — V1.29

**Turn context:** Formal qa-phase verification turn challenging the prior accepted dev turn (turn_7aca0e4acba46509, role=dev). HEAD c5eef25 = M48 implementation checkpoint. All M48 implementation (src/cli.js, tests/smoke.mjs, 39 eval scenarios) confirmed at this HEAD.

**Verification summary (run this turn):** `npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (39 scenarios)`. `node -e "require('./src/cli.js')"` → exit 0 (guards `_guardOutputSchemaFirstPropertyTypeBucketKey` at src/cli.js:5310 and `_guardOutputSchemaFirstPropertyTypeAggregationKey` at src/cli.js:5317 pass). `node bin/tusq.js help | grep -c '^  [a-z]'` → 32. `node bin/tusq.js shape index --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, `first_property_types[]` with `string` bucket (get_users_api_v1_users_id; aggregation_key `"first_property_type"`), `boolean` bucket (post_users_users; aggregation_key `"first_property_type"`), and `not_applicable` bucket (get_users_users; aggregation_key `"not_applicable"`); `warnings: []`. `node bin/tusq.js shape index --first-type STRING --manifest tests/fixtures/express-sample/tusq.manifest.json` → exit 1 (case-sensitive). `node bin/tusq.js shape index --first-type number --manifest tests/fixtures/express-sample/tusq.manifest.json` → exit 1, absent-bucket (no number-typed first properties in express fixture). `git diff --quiet HEAD -- package.json package-lock.json` → exit 0 (zero package drift).

**Acceptance criteria:** 589 total (REQ-001–REQ-589). Added REQ-565–REQ-589 (25 new M48 criteria) this turn. All PASS.

**Prior dev turn challenge:** turn_7aca0e4acba46509 upheld — 9 dev-owned files correctly modified (`git diff a381730..HEAD --name-only`; no manifest-format.md change because M48 is non-persistent), all 5 dev decisions sound, M48 implementation complete and correct.

**Key M48 features:** `tusq shape index` command added (32nd CLI command); `first_property_types[]` result field (matches M42 `types`, M45 `items_types` plural-categorical precedent); nine-value bucket-key enum (string/number/integer/boolean/null/object/array/not_applicable/unknown); three-value aggregation_key enum (first_property_type/not_applicable/unknown) matching M46 precedent; `not_applicable` bucket covers both non-object responses (output_schema.type !== 'object') and zero-property object responses — emits NO warning; five frozen warning reason codes including `output_schema_properties_first_property_descriptor_invalid` (distinct from M46's additionalProperties codes); bucket order string→number→integer→boolean→null→object→array→not_applicable→unknown (scalar-primitives-first convention); eval count 38→39; `OUTPUT_SCHEMA_FIRST_PROPERTY_TYPE_BUCKET_ORDER` frozen array excludes `unknown` (always appended last dynamically).

**Carried-forward objections (non-blocking):** OBJ-001 (medium): R6 auth_required dead code. OBJ-002 (low): surface-plan-determinism eval uses synthetic_capabilities. OBJ-003 (low): M31 per-domain flag value assertions.

---

## QA Verification — M47 (turn_c84e2118f26b5b7c, run_240679669ee78f0b, 2026-04-27, HEAD a0dc519)

**Milestone:** M47 — Static Capability Input Schema Property Count Tier Index Export from Manifest Evidence (~0.5 day) — V1.28

**Turn context:** Formal qa-phase verification turn challenging the prior accepted dev turn (turn_cc1f4a9f48f528e8, role=dev). HEAD a0dc519 = M47 implementation checkpoint. All M47 implementation (src/cli.js, tests/smoke.mjs, 38 eval scenarios) confirmed at this HEAD.

**Verification summary (run this turn):** `npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (38 scenarios)`. `node -e "require('./src/cli.js')"` → exit 0 (guards `_guardInputSchemaPropertyCountTierBucketKey` and `_guardInputSchemaPropertyCountTierAggregationKey` pass). `node bin/tusq.js help | grep -c '^  [a-z]'` → 31. `node bin/tusq.js parameter index --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, `tiers[]` with `none` bucket (get_users_users; aggregation_key `"tier"`) and `low` bucket (get_users_api_v1_users_id, post_users_users; aggregation_key `"tier"`); `warnings: []`. `node bin/tusq.js parameter index --tier LOW --manifest tests/fixtures/express-sample/tusq.manifest.json` → exit 1 (case-sensitive). `node bin/tusq.js parameter index --tier high --manifest tests/fixtures/express-sample/tusq.manifest.json` → exit 1, absent-bucket (no high-cardinality caps in express fixture). `git diff --quiet HEAD -- package.json package-lock.json` → exit 0 (zero package drift).

**Acceptance criteria:** 564 total (REQ-001–REQ-564). Added REQ-540–REQ-564 (25 new M47 criteria) this turn. All PASS.

**Prior dev turn challenge:** turn_cc1f4a9f48f528e8 upheld — 10 dev-owned files correctly modified, all 7 dev decisions sound, M47 implementation complete and correct.

**Key M47 features:** `tusq parameter index` command added (31st CLI command); `tiers[]` result field (matches M40/M44); five-value bucket-key enum (none/low/medium/high/unknown) matching M40 verbatim; two-value aggregation_key enum (tier/unknown) matching M40 verbatim; frozen tier thresholds 0/2/5/6; `none` bucket emits NO warning (valid named bucket for zero-property capabilities); five frozen warning reason codes; eval count 37→38.

**Carried-forward objections (non-blocking):** OBJ-001 (medium): R6 auth_required dead code. OBJ-002 (low): surface-plan-determinism eval uses synthetic_capabilities. OBJ-003 (low): M31 per-domain flag value assertions.

---

## QA Verification — M46 (turn_c650f5bf0046eb83, run_7c4036f0eba4cde3, 2026-04-27, HEAD 52e827b)

**Milestone:** M46 — Static Capability Output Schema additionalProperties Strictness Index Export from Manifest Evidence (~0.5 day) — V1.27

**Turn context:** Formal qa-phase verification turn challenging the prior accepted dev turn (turn_c5d62ccd1c2a4bcd, role=dev). HEAD 52e827b = M46 implementation checkpoint. All M46 implementation (src/cli.js, tests/smoke.mjs, 37 eval scenarios) confirmed at this HEAD.

**Verification summary (run this turn):** `npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (37 scenarios)`. `node -e "require('./src/cli.js')"` → exit 0 (guards `_guardOutputSchemaStrictnessBucketKey` and `_guardOutputSchemaStrictnessAggregationKey` pass). `node bin/tusq.js help | grep -c '^  [a-z]'` → 30. `node bin/tusq.js strictness index --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, `strictnesses[]` with `permissive` bucket (get_users_api_v1_users_id, post_users_users; aggregation_key `"strictness"`) and `not_applicable` bucket (get_users_users; aggregation_key `"not_applicable"`); `warnings: []`. `node bin/tusq.js strictness index --strictness STRICT --manifest tests/fixtures/express-sample/tusq.manifest.json` → exit 1 (case-sensitive). `node bin/tusq.js strictness index --strictness strict --manifest tests/fixtures/express-sample/tusq.manifest.json` → exit 1, absent-bucket (no strict caps in express fixture). `git diff --quiet HEAD -- package.json package-lock.json` → exit 0 (zero package drift).

**Acceptance criteria:** 539 total (REQ-001–REQ-539). Added REQ-515–REQ-539 (25 new M46 criteria) this turn. All PASS.

**Prior dev turn challenge:** turn_c5d62ccd1c2a4bcd upheld — 10 dev-owned files correctly modified (git diff d82d53d..52e827b), all 5 dev decisions sound, M46 implementation complete and correct.

**Key M46 features:** `tusq strictness index` command added (30th CLI command); `strictnesses[]` result field; four-value bucket-key enum (strict/permissive/not_applicable/unknown); three-value aggregation_key enum (strictness/not_applicable/unknown); boolean-only additionalProperties contract (schema-as-additionalProperties → unknown); not_applicable bucket emits NO warning; five frozen warning reason codes including output_schema_type_missing_or_invalid (new vs M45).

**Carried-forward objections (non-blocking):** OBJ-001 (medium): R6 auth_required dead code. OBJ-002 (low): surface-plan-determinism eval uses synthetic_capabilities. OBJ-003 (low): M31 per-domain flag value assertions.

---

## QA Verification — M45 (turn_3fb041fa0224ce63, run_79db9c1f34791188, 2026-04-27, HEAD cb9d730)

**Milestone:** M45 — Static Capability Output Schema Items Type Index Export from Manifest Evidence (~0.5 day) — V1.26

**Turn context:** Formal qa-phase verification turn challenging the prior accepted dev turn (turn_beac02a98d4b562d, role=dev). HEAD cb9d730 = M45 implementation checkpoint. All M45 implementation (src/cli.js, tests/smoke.mjs, 36 eval scenarios) confirmed at this HEAD.

**Verification summary (run this turn):** `npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (36 scenarios)`. `node -e "require('./src/cli.js')"` → exit 0 (guards `_guardOutputSchemaItemsTypeBucketKey` and `_guardOutputSchemaItemsTypeAggregationKey` pass). `node bin/tusq.js help | grep -c '^  [a-z]'` → 29. `node bin/tusq.js items index --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, `items_types[]` with `object` bucket (get_users_users; aggregation_key `"items_type"`) and `not_applicable` bucket (get_users_api_v1_users_id, post_users_users; aggregation_key `"not_applicable"`); `warnings: []`. `node bin/tusq.js items index --items-type OBJECT --manifest tests/fixtures/express-sample/tusq.manifest.json` → exit 1 (case-sensitive). `node bin/tusq.js items index --items-type array --manifest tests/fixtures/express-sample/tusq.manifest.json` → exit 1, absent-bucket (no array-typed items in express fixture). `git diff --quiet HEAD -- package.json package-lock.json` → exit 0 (zero package drift).

**Acceptance criteria:** 514 total (REQ-001–REQ-514). Added REQ-490–REQ-514 (25 new M45 criteria) this turn. All PASS.

**Prior dev turn challenge:** turn_beac02a98d4b562d upheld — 10 dev-owned files correctly modified (git diff 87e60d9..cb9d730), all 5 dev decisions sound, M45 implementation complete and correct.

**Key M45 features:** `tusq items index` command added (29th CLI command); `items_types[]` result field; nine-value bucket-key enum (object/array/string/number/integer/boolean/null/not_applicable/unknown); three-value aggregation_key enum (items_type/not_applicable/unknown); integer NOT collapsed to number (first-class bucket); not_applicable bucket emits NO warning; five frozen warning reason codes for malformed output_schema.

**Carried-forward objections (non-blocking):** OBJ-001 (medium): R6 auth_required dead code. OBJ-002 (low): surface-plan-determinism eval uses synthetic_capabilities. OBJ-003 (low): M31 per-domain flag value assertions.

---

## QA Re-verification — M44 (turn_57eb341ae6421d17, run_d309bfeea0f99431, 2026-04-27, HEAD f365674)

**Milestone:** M44 — Static Capability Description Word Count Tier Index Export from Manifest Evidence (~0.5 day) — V1.25

**Turn context:** Formal qa-phase re-verification turn challenging the prior accepted QA turn (turn_c640f6d66166bb52). HEAD f365674 = M44 QA checkpoint. All M44 implementation (src/cli.js, tests/smoke.mjs, 35 eval scenarios) confirmed at this HEAD.

**Verification summary (re-run this turn):** `npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (35 scenarios)`. `node -e "require('./src/cli.js')"` → exit 0 (guards `_guardDescriptionWordCountTierBucketKey` and `_guardDescriptionWordCountTierAggregationKey` pass). `node bin/tusq.js help | grep -c '^  [a-z]'` → 28. `node bin/tusq.js description index --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, `tiers[]` single `medium` bucket (capability_count 3, aggregation_key `"tier"`, warnings: []). `node bin/tusq.js description index --tier MEDIUM --manifest tests/fixtures/express-sample/tusq.manifest.json` → exit 1 (case-sensitive). `node bin/tusq.js description index --tier low --manifest tests/fixtures/express-sample/tusq.manifest.json` → exit 1, absent-tier (per REQ-467). `git diff --quiet HEAD -- package.json package-lock.json` → exit 0 (zero package drift).

**Acceptance criteria:** 489 total (REQ-001–REQ-489). All PASS. No new REQs added (REQ-465–REQ-489 registered by prior QA turn).

**Prior QA turn challenge:** turn_c640f6d66166bb52 upheld — 3 QA-owned files correctly modified, all 5 QA decisions sound, REQ registrations accurate, carried objections correctly scoped.

**Carried-forward objections (non-blocking):** OBJ-001 (medium): R6 auth_required dead code. OBJ-002 (low): surface-plan-determinism eval uses synthetic_capabilities. OBJ-003 (low): M31 per-domain flag value assertions.

---

## QA Re-verification — M44 (turn_c640f6d66166bb52, run_d309bfeea0f99431, 2026-04-27, HEAD 2021751)

**Milestone:** M44 — Static Capability Description Word Count Tier Index Export from Manifest Evidence (~0.5 day) — V1.25

**Command added:** `tusq description index` (CLI surface: 27 → 28 commands; new noun `description` with single subcommand `index`, inserted alphabetically between `confidence` and `diff`)

**Key spec distinctions vs M43 (sources[]) and M42 (types[]):** (1) Result array field is `tiers[]` (consistent with M37/M38/M39/M40/M41 numeric-band-tier convention; NOT `sources[]` from M43, NOT `types[]` from M42). (2) `aggregation_key` values are `"tier"` for known buckets and `"unknown"` for the unknown bucket (same as M37–M41; NOT `"source"` from M43, NOT `"type"` from M42). (3) Flag is `--tier` (case-sensitive lowercase-only; identical name to M37–M41). (4) Four-value closed bucket enum: `low | medium | high | unknown` (strictly fewer values than M43's seven). (5) Tier function is `description.trim().split(/\s+/u).length` — purely whitespace-based token count; no markdown/HTML/punctuation stripping; no sub-schema walking; no per-language handling. (6) Three frozen warning reason codes: `description_field_missing | description_field_not_string | description_field_empty_after_trim`. (7) Thresholds `7` and `14` are post-ship-frozen inline integer literals. (8) Bucket order is ascending tier numeric span: `low → medium → high → unknown`. (9) `description_word_count_tier` MUST NOT be written into `tusq.manifest.json`.

**Notable fixture observation:** All three express fixture capabilities have 8-10 description tokens and fall in the `medium` bucket. PM DEC-002 predicted a low/medium split (incorrectly estimating 7 and 6 tokens for two capabilities). Actual counts: get_users_users 8 tokens, post_users_users 8 tokens, get_users_api_v1_users_id 10 tokens. The implementation is correct per frozen thresholds. The smoke test suite correctly uses a synthetic M44 fixture (not the express fixture) to exercise all four tiers.

**Verification summary:** `npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (35 scenarios)`. `node -e "require('./src/cli.js')"` → exit 0 (guards `_guardDescriptionWordCountTierBucketKey` and `_guardDescriptionWordCountTierAggregationKey` pass). `node bin/tusq.js help` → 28-command surface confirmed (`grep -c '^  [a-z]'` → 28). `node bin/tusq.js description index --help` → planning-aid framing, tier function (whitespace-token-count; no markdown stripping; sub-schema descriptions NOT walked), bucket order (`low → medium → high → unknown`) confirmed. `node bin/tusq.js description index --tier MEDIUM --manifest tests/fixtures/express-sample/tusq.manifest.json` → exit 1, case-sensitive enforcement confirmed. `node bin/tusq.js description index --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, valid JSON with `tiers[]` array (single `medium` bucket: capability_count 3, all three express capabilities, aggregation_key `"tier"`) and `warnings: []`. `node bin/tusq.js description index --tier medium --manifest ... --json` → exit 0, single `medium` bucket. `git diff --quiet HEAD -- package.json package-lock.json` → exit 0 (zero dependency drift). All 18 M44 ROADMAP checkboxes `[x]`. Boundary values 7→low, 8→medium, 14→medium, 15→high independently confirmed.

**Acceptance criteria:** 25 new criteria added (REQ-465–REQ-489). Total: 489 (REQ-001–REQ-489). All PASS.

**Dev turn challenge:** `git diff 17b6a3d..2021751 --name-only` → exactly 10 dev-owned files; zero reserved state / QA-owned / launch-owned files modified. All five dev decisions upheld. No objections.

**Carried-forward objections (non-blocking):** OBJ-001 (medium): R6 auth_required dead code. OBJ-002 (low): surface-plan-determinism eval uses synthetic_capabilities. OBJ-003 (low): M31 per-domain flag value assertions.

---

## QA Re-verification — M43 (turn_d6b242db408a1312, run_3df735753a5adcb3, 2026-04-27, HEAD 0ec18b8)

**Milestone:** M43 — Static Capability Input Schema Primary Parameter Source Index Export from Manifest Evidence (~0.5 day) — V1.24

**Command added:** `tusq request index` (CLI surface: 26 → 27 commands; new noun `request` with single subcommand `index`, inserted alphabetically between `redaction` and `response`)

**Key spec distinctions vs M35–M42:** (1) Result array field is `sources[]` (NOT `tiers[]`, NOT `types[]`) — the axis is a HTTP-anatomy locus class, not a numeric tier or schema type. (2) `aggregation_key` values are `"source"` (not `"tier"`, not `"type"`) for known buckets and `"unknown"` for the unknown bucket. (3) Flag is `--source` (not `--tier`, not `--type`). (4) Seven-value closed bucket enum: `path | request_body | query | header | mixed | none | unknown`. (5) Separate `INPUT_SCHEMA_PROPERTY_SOURCE_VALUE_SET` (closed four-value: path/request_body/query/header) for per-property source validation. (6) `none` bucket (empty properties object) is a valid named bucket that does NOT emit a warning — distinct from M40/M41/M42 where the no-properties case produced unknown+warning. (7) `mixed` bucket is the catchall for capabilities with two or more distinct closed-set source values. (8) Cookie/file/multipart/form-data source values map to `unknown` (not silently coerced to `request_body`). (9) Bucket order matches HTTP request anatomy reading order: `path → request_body → query → header → mixed → none → unknown`.

**Verification summary:** `npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (34 scenarios)`. `node -e "require('./src/cli.js')"` → exit 0 (guards `_guardInputSchemaPrimaryParameterSourceBucketKey` and `_guardInputSchemaPrimaryParameterSourceAggregationKey` pass). `node bin/tusq.js help` → 27-command surface confirmed (`grep -c '^  [a-z]'` → 27). `node bin/tusq.js request index --help` → planning-aid framing, source rule (closed four-value property-source set; none for empty properties; mixed for multiple loci; unknown for cookie/file/multipart/malformed), bucket order (`path → request_body → query → header → mixed → none → unknown`) confirmed. `node bin/tusq.js request index --source REQUEST_BODY --manifest tests/fixtures/express-sample/tusq.manifest.json` → exit 1, case-sensitive enforcement confirmed. `node bin/tusq.js request index --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, valid JSON with `sources[]` array (`path` bucket: 1 capability [get_users_api_v1_users_id], aggregation_key `"source"`, approved_count 0, gated_count 1; `request_body` bucket: 1 capability [post_users_users], aggregation_key `"source"`, approved_count 1, gated_count 0; `none` bucket: 1 capability [get_users_users], aggregation_key `"source"`, approved_count 1, gated_count 0) and `warnings: []`. `node bin/tusq.js request index --source path --manifest ... --json` → exit 0, single `path` bucket. `node bin/tusq.js request index --source request_body --manifest ... --json` → exit 0, single `request_body` bucket. `git diff --quiet HEAD -- package.json package-lock.json` → exit 0 (zero dependency drift). All 18 M43 ROADMAP checkboxes `[x]`.

**Acceptance criteria:** 25 new criteria added (REQ-440–REQ-464). Total: 464 (REQ-001–REQ-464). All PASS.

**Dev turn challenge:** `git diff 9702941..0ec18b8 --name-only` → exactly 10 dev-owned files; zero reserved state / QA-owned / launch-owned files modified. All five dev decisions upheld. No objections.

**Carried-forward objections (non-blocking):** OBJ-001 (medium): R6 auth_required dead code. OBJ-002 (low): surface-plan-determinism eval uses synthetic_capabilities. OBJ-003 (low): M31 per-domain flag value assertions.

---

## QA Re-verification — M42 (turn_bb74bbc5f03f0d87, run_f33f485bb7998de9, 2026-04-27, HEAD 5583b8d)

**Milestone:** M42 — Static Capability Output Schema Top-Level Type Index Export from Manifest Evidence (~0.5 day) — V1.23

**Command added:** `tusq response index` (CLI surface: 25 → 26 commands; new noun `response` with single subcommand `index`, inserted alphabetically between `redaction` and `sensitivity`)

**Key spec distinctions vs M35–M41:** (1) Result array field is `types[]` (NOT `tiers[]`) — the axis is a categorical primitive type, not a numeric tier. (2) `aggregation_key` values are `"type"` (not `"tier"`) for known buckets and `"unknown"` for the unknown bucket. (3) Flag is `--type` (not `--tier`). (4) Seven-value closed enum vs five-value (adds `string`, `number`, `boolean`, `null` as distinct buckets). (5) Bucket order matches JSON Schema 2020-12 spec primitive enumeration order: `object → array → string → number → boolean → null → unknown`. (6) `'integer'` → `unknown` (per JSON Schema spec, integer is a subset of number; no coercion).

**Verification summary:** `npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (33 scenarios)`. `node -e "require('./src/cli.js')"` → exit 0 (guards `_guardOutputSchemaTopLevelTypeBucketKey` and `_guardOutputSchemaTopLevelTypeAggregationKey` pass). `node bin/tusq.js help` → 26-command surface confirmed (`grep -c '^  [a-z]'` → 26). `node bin/tusq.js response index --help` → planning-aid framing (`This is a planning aid, not a runtime response executor, response-payload validator, data-contract conformance detector, response generator, or data-contract certifier; types are deterministic stable-output ordering only (NOT data-contract-completeness-ranked).`), type rule (literal exact-string match; `'integer'` → unknown; compositional schemas → unknown; array-of-types → unknown), bucket order (`object → array → string → number → boolean → null → unknown`) confirmed. `node bin/tusq.js response index --type OBJECT --manifest tests/fixtures/express-sample/tusq.manifest.json` → exit 1, case-sensitive enforcement confirmed. `node bin/tusq.js response index --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, valid JSON with `types[]` array (`object` bucket: 2 capabilities [get_users_api_v1_users_id, post_users_users], aggregation_key `"type"`, approved_count 1, gated_count 1; `array` bucket: 1 capability [get_users_users], aggregation_key `"type"`, approved_count 1, gated_count 0) and `warnings: []`. `node bin/tusq.js response index --type object --manifest ... --json` → exit 0, single `object` bucket. `git diff --quiet HEAD -- package.json package-lock.json` → exit 0 (zero dependency drift). All 18 M42 ROADMAP checkboxes `[x]`.

**Acceptance criteria:** 25 new criteria added (REQ-415–REQ-439). Total: 439 (REQ-001–REQ-439). All PASS.

**Dev turn challenge:** `git diff 2890573..5583b8d --name-only` → exactly 10 dev-owned files; zero reserved state / QA-owned / launch-owned files modified. All five dev decisions upheld. No objections.

**Carried-forward objections (non-blocking):** OBJ-001 (medium): R6 auth_required dead code. OBJ-002 (low): surface-plan-determinism eval uses synthetic_capabilities. OBJ-003 (low): M31 per-domain flag value assertions.

---

## QA Re-verification — M41 (turn_17fc87e4651eb033, run_7bad406d9ea95ce5, 2026-04-27, HEAD f7009bb)

**Milestone:** M41 — Static Capability Path Segment Count Tier Index Export from Manifest Evidence (~0.5 day) — V1.22

**Command added:** `tusq path index` (CLI surface: 24 → 25 commands; `path` inserted alphabetically between `output` and `pii`)

**Verification summary:** `npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (32 scenarios)`. `node -e "require('./src/cli.js')"` → exit 0 (guards `_guardPathSegmentCountTierBucketKey` and `_guardPathSegmentCountTierAggregationKey` pass). `node bin/tusq.js help` → 25-command surface confirmed (`grep -c '^  [a-z]'` → 25). `node bin/tusq.js path index --help` → planning-aid framing (`This is a planning aid, not a runtime URL router, path validator, route registry, artifact sprawl executor, or path-depth certifier; tiers are deterministic stable-output ordering only (NOT sprawl-risk-ranked).`), tier function (`none if path is "/" (0 segments); low if 1-2; medium if 3-4; high if >= 5; unknown if path missing or malformed`), path-parameter-counts-as-one-segment note, and bucket order (`none → low → medium → high → unknown`) confirmed. `node bin/tusq.js path index --tier HIGH --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 1, case-sensitive enforcement confirmed. `node bin/tusq.js path index --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, valid JSON with `tiers[]` array (`low` bucket: 2 capabilities [get_users_users, post_users_users], approved_count 2, gated_count 0; `medium` bucket: 1 capability [get_users_api_v1_users_id], approved_count 0, gated_count 1) and `warnings: []`. `node bin/tusq.js path index --tier low --manifest ... --json` → exit 0, single `low` bucket. `git diff --quiet HEAD -- package.json package-lock.json` → exit 0 (zero dependency drift). All 18 M41 ROADMAP checkboxes `[x]`.

**New acceptance criteria:** REQ-390–REQ-414 (25 criteria) — CLI surface 25, closed 5-value tier enum (none|low|medium|high|unknown), closed 2-value aggregation_key enum (tier|unknown), frozen tier-function thresholds (0/2/4/5), five frozen warning reason codes, per-bucket 8-field shape, determinism, non-persistence, empty-capabilities, --out, case-sensitive filter, unknown bucket warnings, eval 32 scenarios.

**Closed enums shipped (immutable):** `path_segment_count_tier` (none|low|medium|high|unknown), `aggregation_key` (tier|unknown), tier thresholds (0/2/4/5), warning reason codes (path_field_missing|path_field_not_string|path_field_empty_string|path_field_does_not_start_with_forward_slash|path_field_contains_empty_interior_segment).

**Non-breaking:** every existing command's stdout, stderr, and exit code is byte-identical pre/post M41.

## QA Re-verification — M40 (turn_63c7cc83d4a3e120, run_0ce75469bde80380, 2026-04-27, HEAD aa81869)

**Milestone:** M40 — Static Capability Output Schema Property Count Tier Index Export from Manifest Evidence (~0.5 day) — V1.21

**Command added:** `tusq output index` (CLI surface: 23 → 24 commands; `output` inserted alphabetically between `method` and `pii`)

**Verification summary:** `npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (31 scenarios)`. `node -e "require('./src/cli.js')"` → exit 0 (guards `_guardOutputSchemaPropertyCountTierBucketKey` and `_guardOutputSchemaPropertyCountTierAggregationKey` pass). `node bin/tusq.js help` → 24-command surface confirmed (`grep -c '^  [a-z]'` → 24). `node bin/tusq.js output index --help` → planning-aid framing (`This is a planning aid, not a runtime output executor, output-schema validator, doc-contradiction detector, output generator, or doc-accuracy certifier`), tier function (`none if Object.keys(output_schema.properties).length === 0; low if 1-2; medium if 3-5; high if >= 6; unknown if output_schema/properties missing or malformed`), type:array informative note, and bucket order (`none → low → medium → high → unknown`) confirmed. `node bin/tusq.js output index --tier HIGH --manifest tests/fixtures/express-sample/tusq.manifest.json` → exit 1, case-sensitive enforcement confirmed. `node bin/tusq.js output index --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, valid JSON with `tiers[]` array (`low` bucket: 2 capabilities; `unknown` bucket: 1 capability with reason `output_schema_properties_field_missing`) and `warnings: [{capability: "get_users_users", reason: "output_schema_properties_field_missing"}]`. `node bin/tusq.js output index --tier low --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, single `low` bucket. `git diff --quiet HEAD -- package.json package-lock.json` → exit 0 (zero dependency drift). All 18 M40 ROADMAP checkboxes `[x]`.

**New acceptance criteria:** REQ-365–REQ-389 (25 criteria) — CLI surface 24, closed 5-value tier enum (none|low|medium|high|unknown), closed 2-value aggregation_key enum (tier|unknown), frozen tier-function thresholds (0/2/5/6), five frozen warning reason codes, per-bucket 8-field shape, determinism, non-persistence, empty-capabilities, --out, case-sensitive filter, unknown bucket warnings (including type:array informative bucketing), eval 31 scenarios.

**Closed enums shipped (immutable):** `output_schema_property_count_tier` (none|low|medium|high|unknown), `aggregation_key` (tier|unknown), tier thresholds (0/2/5/6), warning reason codes (output_schema_field_missing|output_schema_field_not_object|output_schema_properties_field_missing|output_schema_properties_field_not_object|output_schema_properties_object_contains_non_object_property_descriptor).

**Non-breaking:** every existing command's stdout, stderr, and exit code is byte-identical pre/post M40.

## QA Re-verification — M39 (turn_b7f84e0d69dcabf6, run_533b2f8c47cc0bf0, 2026-04-27, HEAD 52c5e56)

**Milestone:** M39 — Static Capability Required Input Field Count Tier Index Export from Manifest Evidence (~0.5 day) — V1.20

**Command added:** `tusq input index` (CLI surface: 22 → 23 commands; `input` inserted alphabetically between `examples` and `method`)

**Verification summary:** `npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (30 scenarios)`. `node -e "require('./src/cli.js')"` → exit 0 (guards `_guardRequiredInputFieldCountTierBucketKey` and `_guardRequiredInputFieldCountTierAggregationKey` pass). `node bin/tusq.js help` → 23-command surface confirmed (`grep -c '^  [a-z]'` → 23). `node bin/tusq.js input index --help` → planning-aid framing (`This is a planning aid, not a runtime input executor, input-schema validator, input generator, or exposure-safety certifier`), tier function (`none if required.length === 0; low if 1-2; medium if 3-5; high if >= 6; unknown if input_schema/required missing or malformed`), and bucket order (`none → low → medium → high → unknown`) confirmed. `node bin/tusq.js input index --tier HIGH --manifest tests/fixtures/express-sample/tusq.manifest.json` → exit 1, case-sensitive enforcement confirmed. `node bin/tusq.js input index --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, valid JSON with `tiers[]` array (`none` and `low` buckets) and `warnings: []`. `git diff --quiet HEAD -- package.json package-lock.json` → exit 0 (zero dependency drift). All 18 M39 ROADMAP checkboxes `[x]`.

**New acceptance criteria:** REQ-340–REQ-364 (25 criteria) — CLI surface 23, closed 5-value tier enum (none|low|medium|high|unknown), closed 2-value aggregation_key enum (tier|unknown), frozen tier-function thresholds (0/2/5/6), five frozen warning reason codes, per-bucket 8-field shape, determinism, non-persistence, empty-capabilities, --out, case-sensitive filter, unknown bucket warnings, eval 30 scenarios.

**Closed enums shipped (immutable):** `required_input_field_count_tier` (none|low|medium|high|unknown), `aggregation_key` (tier|unknown), tier thresholds (0/2/5/6), warning reason codes (input_schema_field_missing|input_schema_field_not_object|required_field_missing|required_field_not_array|required_array_contains_non_string_or_empty_element).

**Non-breaking:** every existing command's stdout, stderr, and exit code is byte-identical pre/post M39.

## QA Re-verification — M38 (turn_6d4662cdbbeeb118, run_0c5145f830f5940e, 2026-04-27, HEAD 71d5474)

**Milestone:** M38 — Static Capability Examples Count Tier Index Export from Manifest Evidence (~0.5 day) — V1.19

**Command added:** `tusq examples index` (CLI surface: 21 → 22 commands; `examples` inserted alphabetically between `effect` and `method`)

**Verification summary:** `npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (29 scenarios)`. `node -e "require('./src/cli.js'); console.log('Module loaded OK');"` → exit 0 (guards `_guardExamplesCountTierBucketKey` and `_guardExamplesCountTierAggregationKey` pass). `node bin/tusq.js help` → 22-command surface confirmed (`grep -c '^  [a-z]'` → 22). `node bin/tusq.js examples index --help` → planning-aid framing, tier function (`none if length === 0; low if 1-2; medium if 3-5; high if >= 6; unknown if missing/non-array/null-element/non-object/array-element`), and bucket order (`none → low → medium → high → unknown`) confirmed. `node bin/tusq.js examples index --tier HIGH --manifest tests/fixtures/express-sample/tusq.manifest.json` → exit 1, case-sensitive enforcement confirmed. `node bin/tusq.js examples index --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, valid JSON with `tiers[]` array and `warnings: []`. `git diff --quiet HEAD -- package.json package-lock.json` → exit 0 (zero dependency drift). All 18 M38 ROADMAP checkboxes `[x]`.

**New acceptance criteria:** REQ-315–REQ-339 (25 criteria) — CLI surface 22, closed 5-value tier enum (none|low|medium|high|unknown), closed 2-value aggregation_key enum (tier|unknown), frozen tier-function thresholds (0/2/5/6), five frozen warning reason codes, per-bucket 8-field shape, determinism, non-persistence, empty-capabilities, --out, case-sensitive filter, unknown bucket warnings, eval 29 scenarios.

**Closed enums shipped (immutable):** `examples_count_tier` (none|low|medium|high|unknown), `aggregation_key` (tier|unknown), tier thresholds (0/2/5/6), warning reason codes (examples_field_missing|examples_field_not_array|examples_array_contains_non_object_element|examples_array_contains_null_element|examples_array_contains_array_element).

**Non-breaking:** every existing command's stdout, stderr, and exit code is byte-identical pre/post M38.

## QA Re-verification — M37 (turn_c47096d9b37000b3, run_0b366d58febc99be, 2026-04-27, HEAD 9a9118b)

**Milestone:** M37 — Static Capability PII Field Count Tier Index Export from Manifest Evidence (~0.5 day) — V1.18

**Command added:** `tusq pii index` (CLI surface: 20 → 21 commands; `pii` inserted alphabetically between `method` and `policy`)

**Verification summary:** `npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (28 scenarios)`. `node -e "require('./src/cli.js'); console.log('Module loaded OK');"` → exit 0 (guards `_guardPiiFieldCountTierBucketKey` and `_guardPiiFieldCountTierAggregationKey` pass). `node bin/tusq.js help` → 21-command surface confirmed (`grep -c '^  [a-z]'` → 21). `node bin/tusq.js pii index --help` → planning-aid framing, tier function (`none if length === 0; low if 1-2; medium if 3-5; high if >= 6; unknown if missing/non-array/non-string-element`), and bucket order (`none → low → medium → high → unknown`) confirmed. `node bin/tusq.js pii index --tier HIGH` → exit 1, case-sensitive enforcement confirmed. `node bin/tusq.js pii index --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, valid JSON with `tiers[]` array and `warnings: []`. `git diff --quiet HEAD -- src/ bin/ tests/ website/ package.json package-lock.json` → exit 0 (zero source drift). All 20 M37 ROADMAP checkboxes `[x]`.

**New acceptance criteria:** REQ-290–REQ-314 (25 criteria) — CLI surface 21, closed 5-value tier enum, closed 2-value aggregation_key enum, frozen tier-function thresholds (0/2/5/6), per-bucket 8-field shape, determinism, non-persistence, empty-capabilities, --out, case-sensitive filter, unknown bucket warnings, eval 28 scenarios.

**Closed enums shipped (immutable):** `pii_field_count_tier` (none|low|medium|high|unknown), `aggregation_key` (tier|unknown), tier thresholds (0/2/5/6).

**Non-breaking:** every existing command's stdout, stderr, and exit code is byte-identical pre/post M37.

## QA Re-verification — M36 (turn_9fd0a8b165ae91e5, run_8580d828f0e1cc1e, 2026-04-27, HEAD 310c55a)

**Milestone:** M36 — Static Capability Confidence Tier Index Export from Manifest Evidence (~0.5 day) — V1.17

**Command added:** `tusq confidence index` (CLI surface: 19 → 20 commands; `confidence` inserted alphabetically between `auth` and `diff`)

**Verification summary:** `npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (27 scenarios)`. `node -e "require('./src/cli.js'); console.log('Module loaded OK');"` → exit 0. `node bin/tusq.js help` → 20-command surface confirmed. `node bin/tusq.js confidence index --help` → planning-aid framing, tier function (`high >= 0.85; medium if 0.6 <= confidence < 0.85; low < 0.6; unknown if null/missing/non-numeric/out-of-[0,1]`), and bucket order (`high → medium → low → unknown`) confirmed. `node bin/tusq.js confidence index --tier HIGH` → exit 1, case-sensitive enforcement confirmed. `node bin/tusq.js confidence index --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, valid JSON with `tiers[]` array and `warnings: []`. `git diff --quiet HEAD -- src/ bin/ tests/ website/ package.json package-lock.json` → exit 0 (zero source drift). All 20 M36 ROADMAP checkboxes `[x]`.

**Key contracts verified:** Four-value `confidence_tier` enum (`high | medium | low | unknown`) frozen; two-value `aggregation_key` enum (`tier | unknown`) frozen; closed-enum bucket order (`high → medium → low → unknown`) enforced; 8-field per-bucket entry shape present; empty buckets absent; `confidence_tier` NOT persisted into `tusq.manifest.json`; `tusq compile` / `tusq auth index` / all M31–M35 index outputs byte-identical pre/post-M36; 22-case smoke matrix (cases a-v) + `confidence-tier-index-determinism` eval (27th scenario) pass.

**Acceptance criteria:** Added REQ-265–REQ-289 (25 new M36 criteria). Total: 289 REQs (REQ-001–REQ-289), all PASS. Ship verdict: SHIP.

## User Impact

tusq v0.1.0 is the first public release of the tusq capability compiler CLI. It gives Node.js developers a repeatable pipeline to:

1. **Scan** their Express, Fastify, or NestJS codebase and extract API routes automatically.
2. **Generate a manifest** (`tusq.manifest.json`) that lists discovered capabilities with confidence scores and domain grouping.
3. **Approve capabilities** by editing the manifest directly, then **compile** them into structured tool-definition JSON files.
4. **Expose** those tools over a describe-only MCP HTTP endpoint (`tusq serve`) that clients can inspect through `tools/list` and describe-only `tools/call`.
5. **Review** the current manifest summary at any time without re-scanning.

This release is intentionally narrow: it gives SaaS teams a governed, review-first way to expose a supported slice of their backend capability surface to MCP-aware tooling without claiming live execution, runtime learning, or broad framework coverage.

## Launch Framing

The broader repository narrative describes where tusq.dev is headed over time. The shipped v0.1.0 product is narrower. For launch messaging, the source of truth is the current `website/` experience plus these release notes, not the longer-horizon README roadmap.

The defendable v0.1.0 position is:

- open-source capability compiler CLI
- Node.js SaaS backends using Express, Fastify, or NestJS
- manual review and approval through `tusq.manifest.json`
- compile approved capabilities into JSON tool definitions
- expose those definitions through a local describe-only MCP endpoint by default
- optional opt-in governance track: scaffold a policy with `tusq policy init`, validate it with `tusq policy verify`, then run `tusq serve --policy` for dry-run plan emission (never live execution)

The shortest accurate launch story is: repo to reviewed manifest to approved tool definitions to inspectable describe-only MCP, with an optional one-command governance track (`tusq policy init` → `tusq policy verify` → `tusq serve --policy`) for teams that want CI-verifiable dry-run plans.

Homepage hero copy, homepage shipped-surface copy, site metadata, and these release notes now all use that same describe-only framing so the first skim and the detailed read make the same promise.

This release should not be described as a live execution engine, hosted platform, plugin ecosystem, runtime learning system, or shipped skill/agent generator.

The prior QA pass proved build and behavior, but it did not by itself validate every launch CTA. One important messaging correction for launch is install-path discipline: until package distribution is confirmed, external copy should not promise a public global install command.

## Website Consolidation

The public tusq.dev surface is now consolidated onto the Docusaurus app in `website/`. This was a migration of the existing live website into the canonical docs/blog app, not the introduction of a parallel third site. The legacy live-site structure from `websites/` was migrated over rather than replaced with template content:

1. The homepage keeps the same hero proposition, three-card explanation band, workflow steps, and V1 shipped-surface grid from the former live site.
2. The not-found experience preserves the legacy recovery pattern by sending users back to the homepage instead of dropping them onto a default Docusaurus error state.
3. The warm gradient, editorial typography, and paper-card styling cues were carried into the Docusaurus theme so docs, blog, and homepage read as one canonical product surface.
4. Site metadata now points to a tusq-specific social share card instead of the Docusaurus default asset, so off-site previews carry the same v0.1.0 positioning as the homepage and release notes.

`websites/` may remain in-repo temporarily for cleanup, but it is no longer the active website that release messaging or deployment readiness depends on.

## Capability Provenance

Each compiled tool definition in `tusq-tools/` carries a `provenance` field that links back to the originating source file and line number where the route was declared:

```json
{
  "name": "get_users_users",
  "provenance": { "file": "src/app.ts", "line": 12 },
  ...
}
```

This provenance chain is preserved end-to-end: `tusq scan` records it in `.tusq/scan.json`, `tusq manifest` carries it into `tusq.manifest.json`, and `tusq compile` writes it into the final tool definition files. The canonical artifact (the compiled tool) is therefore traceable back to the exact line of source code that defines the capability.

## Verification Summary

- Smoke test suite (`node tests/smoke.mjs`) passes end-to-end: scenarios covering all 6 commands, all 3 frameworks, approval persistence, dry-run compile, MCP RPC (including examples/constraints/redaction propagation), and SIGINT shutdown. Includes new framework-specific assertions for Fastify route count, named handler, schema-inferred input_schema, auth_hints, and NestJS guard inheritance and path composition.
- Manual CLI audit confirms correct UX for help, version, invalid commands, invalid flags, and missing-prerequisite errors.
- All 87 acceptance criteria in `.planning/acceptance-matrix.md` have status PASS (25 prior + 3 provenance-chain checks REQ-026–REQ-028 + REQ-029 roadmap page + REQ-030 manifest-format doc + REQ-031 sensitivity_class pipeline + REQ-032 auth_hints MCP runtime + REQ-033 examples/constraints pipeline + REQ-034 redaction/approval-audit pipeline + REQ-035 version-history/digest manifest-only fields + REQ-036 framework-specific deep extraction + REQ-037 first-pass manifest usability + REQ-038 review governance and schema inference + REQ-039–REQ-044 manifest diff and review queue + REQ-045–REQ-049 governed CLI eval regression harness + REQ-050–REQ-053 governed manifest approval CLI + REQ-054–REQ-057 repo-local capability documentation generator + REQ-058–REQ-063 opt-in execution policy / dry-run mode + REQ-064–REQ-069 policy scaffold generator / tusq policy init + REQ-070–REQ-074 policy verify command / tusq policy verify + REQ-075–REQ-080 policy strict verify / tusq policy verify --strict + REQ-081–REQ-087 Fastify schema body-field extraction).
- Website consolidation checks pass: homepage structure, 404 behavior, styling cues, and canonical `website/` ownership are explicitly covered in the QA acceptance matrix and ship verdict.
- Provenance chain verified: scan.json, tusq.manifest.json, and tusq-tools/*.json all carry `provenance.{file,line}` on the express fixture end-to-end.
- Fastify scanner defect fixed: `fastify.get(path, {options}, handler)` 3-argument inline form was silently dropped; fix adds a multiline pattern to handle this form before the existing `fastify.route()` block.

## Upgrade Notes

This is an initial release. No migration required.

**Prerequisites:**
- Node.js ≥ 18
- Run from your project root (the directory containing `package.json`)

**Current try path:**
- Clone the repo and run the CLI locally against a supported project
- If you want a shell command during local evaluation, use the repo-local Node workflow rather than assuming a published package exists
- Publish a public package-manager install step only after distribution is confirmed

**Typical workflow:**
```
tusq init
tusq scan .
tusq manifest
tusq approve --all --reviewer you@example.com
tusq compile
tusq serve
```

## Governance Dimensions Shipped

Every compiled capability carries five governance fields through the pipeline (manifest → compile → MCP `tools/call`):

- **`side_effect_class`**: mutation type — `read`, `write`, or `destructive` (inferred from HTTP method and path/handler signals); also in `tools/list`
- **`sensitivity_class`**: data sensitivity — `unknown`, `public`, `internal`, `confidential`, or `restricted` (defaults to `unknown` in V1; manual overrides survive regeneration); also in `tools/list`
- **`auth_hints`**: detected auth/middleware identifiers — string array (empty array means no signal found, not that the endpoint is public); also in `tools/list`
- **`examples`**: usage examples — defaults to a single describe-only placeholder in V1; human-editable in `tusq.manifest.json`; propagates unchanged through compile to `tools/call`
- **`constraints`**: operational limits — five-field object (`rate_limit`, `max_payload_bytes`, `required_headers`, `idempotent`, `cacheable`); all null/empty defaults in V1; human-editable in manifest; propagates to `tools/call`
- **`redaction`**: operational masking/retention policy — four-field object (`pii_fields`, `log_level`, `mask_in_traces`, `retention_days`); permissive V1 defaults (empty pii_fields, full log_level, no masking, no retention limit); human-editable in manifest; propagates to compiled tools and `tools/call`

`side_effect_class`, `sensitivity_class`, and `auth_hints` appear in both `tools/list` and `tools/call` MCP responses. `examples`, `constraints`, and `redaction` appear in `tools/call` only (by design — they are per-capability operational detail, not listing metadata).

Approval audit fields (`approved_by`, `approved_at`) are manifest-only. They are preserved across manifest regeneration and provide a human-readable audit trail for the approval gate, but they are intentionally excluded from compiled tool definitions and all MCP responses.

## Version History and Capability Digest

`tusq.manifest.json` now carries three manifest-only version-history fields that enable change tracking across regenerations:

- **`manifest_version`** (manifest root, integer): starts at 1 and increments by 1 each time `tusq manifest` runs. Provides a monotonic counter for manifest lineage.
- **`previous_manifest_hash`** (manifest root, SHA-256 hex or null): SHA-256 hash of the entire prior manifest file bytes. `null` on first generation. Enables byte-level comparison between manifest generations without storing the full history.
- **`capability_digest`** (per capability, SHA-256 hex): deterministic SHA-256 of the capability's content fields only — name, description, method, path, schemas, all governance fields, provenance, confidence, domain. Explicitly excludes `approved`, `approved_by`, `approved_at`, `review_needed`, and `capability_digest` itself so approval-only edits do not change the digest. Stable key ordering (recursive alphabetical sort) makes the hash deterministic across runs.

These fields are manifest-only. They are not propagated to compiled tool definitions (`tusq-tools/*.json`) or MCP responses (`tools/list`, `tools/call`). They are V1 groundwork for a V2 diff CLI and history store.

## First-Pass Manifest Usability

The v0.1.0 manifest is designed to be usable by an LLM (or a human reviewer) on first pass without manual rewriting:

- **Path parameters are extracted** from route paths (`:id`, `{id}`) into `input_schema.properties` as required string fields tagged with `source: "path"`.
- **Domain inference skips well-known API prefixes** (`api`, `v1`–`v5`, `rest`, `graphql`, `internal`, `public`, `external`) before selecting the first meaningful path segment, so `GET /api/v1/users/:id` infers `domain="users"` rather than `api`.
- **Capability descriptions are generated from a template** (verb + target + side_effect + auth_context + handler) instead of a static `METHOD /path capability in domain domain` string, e.g. `Retrieve user by id - read-only, requires requireAuth (handler: getUser)`.
- **Schema-less routes take a confidence penalty** of `-0.10` in `scoreConfidence`, pushing schema-less named-handler routes with auth below the `0.8` review threshold so they surface as `review_needed=true` instead of silently auto-approving.

## Review Governance

`tusq review` is the approval gate and ships with governance-oriented output:

- **`tusq review --strict`** exits `1` with `Review gate failed: N unapproved, M low confidence.` on stderr when any capability is unapproved or flagged as low confidence. Exits `0` once every capability is approved and not flagged. Intended for CI use between manifest generation and compile.
- **`tusq review --verbose`** prints one line per capability with inferred `inputs=…`, `returns=…`, and `source=<file>, handler=<fn>, framework=<framework>` so reviewers see the inferred shape and provenance before approving.
- **Inferred input and output schemas** fill in obvious shapes so the manifest is not empty for first-pass consumers: write methods get `input_schema.properties.body` with `source: "request_body"`; handlers that return `res.json([…])` or `res.json({…})` produce `output_schema.type="array"` or an object schema with inferred primitive types for simple literal returns (e.g. `{ ok: true }` → `properties.ok.type="boolean"`).
- **Provenance carries `framework` and `handler`** through scan, manifest, and compiled tools so the review output and downstream tooling can show where a capability came from.

## Repo-Local Capability Documentation

`tusq docs` generates a Markdown document from your `tusq.manifest.json` without network access, execution, or external dependencies:

- Reads any manifest file (default `tusq.manifest.json`; override with `--manifest <path>`)
- Writes to stdout by default; use `--out <path>` to write a file instead
- Covers manifest metadata (`manifest_version`, `previous_manifest_hash`, `source_scan`) and per-capability sections (approval status, governance fields, input/output schemas, examples, constraints, redaction, and provenance)
- Capabilities are sorted deterministically by name so output is stable across repeated runs on the same manifest

Intended use: drop the generated Markdown into a wiki, PR description, or review ticket so stakeholders can read capability contracts without running the CLI.

## Opt-In Execution Policy (M20 — V1.1)

`tusq serve` now accepts an optional `--policy <path>` flag that loads a governance policy file from `.tusq/execution-policy.json` (or any explicit path). Without `--policy`, behavior is byte-for-byte identical to V1 describe-only. With `--policy`, the server enforces the declared mode:

- **`mode: "describe-only"`** — No change to `tools/call` behavior. Identical to running without `--policy`. Useful for attaching reviewer/audit metadata to describe-only deployments.
- **`mode: "dry-run"`** — `tools/call` returns a dry-run plan instead of the live schema response. The plan includes argument validation, path parameter substitution, method and path echoed from the compiled tool, a `plan_hash` (SHA-256 over canonical `{body, headers, method, path, path_params, query}`, sorted), and a `policy` echo (`mode`, `reviewer`, `approved_at`). `executed: false` is always present — no live API execution occurs under any policy mode.

**Policy file format** (`.tusq/execution-policy.json`):
```json
{
  "schema_version": "1.0",
  "mode": "dry-run",
  "allowed_capabilities": ["get_users_api_v1_users_id"],
  "reviewer": "ops@example.com",
  "approved_at": "2026-04-22T00:00:00Z"
}
```

**Startup failure UX** — `tusq serve --policy <path>` exits 1 with actionable messages for: missing file, invalid JSON, unsupported `schema_version`, unknown `mode`, and invalid `allowed_capabilities` type.

**Argument validation (V1.1 scope)** — Required field enforcement, primitive type checks (string/number/integer/boolean), and `additionalProperties: false` rejection. Returns JSON-RPC `-32602` with `data.validation_errors: [{path, reason}]` on failure. Object, array, and null typed parameters are not strictly validated in V1.1.

**Approval gate invariant preserved** — `allowed_capabilities` is a strict subset filter on top of the existing approval gate. Only approved capabilities appear in `tools/list`; `allowed_capabilities` cannot bypass that requirement.

**New eval scenarios** — Two new `tests/evals/governed-cli-scenarios.json` scenarios (`policy-dry-run-plan-shape`, `policy-dry-run-approval-gate`) extend the regression harness to 4 scenarios.

## Policy Scaffold Generator (M21 — V1.2)

`tusq policy init` generates a valid `.tusq/execution-policy.json` file that passes the M20 `loadAndValidatePolicy()` validator without any manual JSON authoring:

```
tusq policy init [--mode <describe-only|dry-run>] [--reviewer <id>] \
  [--allowed-capabilities <name,...>] [--out <path>] [--force] [--dry-run]
```

**Default behavior** — Running `tusq policy init` without flags produces a `mode:"describe-only"` policy (SYSTEM_SPEC Constraint 8: describe-only is always the safe default). The `approved_at` field is stamped at generation time as ISO-8601 and is not overridable from the CLI. The `reviewer` field is resolved from the `TUSQ_REVIEWER` environment variable, then `TUSQ_REVIEWER_ID`, then falls back to `"unknown"`.

**Flag surface:**
- `--mode dry-run` — generates a dry-run policy instead of describe-only
- `--allowed-capabilities a,b` — comma-separated list; trimmed, deduplicated, and validated (exits 1 on empty result)
- `--out <path>` — output path (defaults to `.tusq/execution-policy.json`)
- `--force` — overwrite an existing file; without this flag, exits 1 with `Policy file already exists:` if the target already exists
- `--dry-run` — prints the generated JSON to stdout and does NOT write the file
- `--json` / `--verbose` — standard output format flags

**Generator/validator alignment** (SYSTEM_SPEC Constraint 7) — Generated files pass `loadAndValidatePolicy()` byte-for-byte. The M21 round-trip smoke test (REQ-068) confirms this invariant: it generates a dry-run policy then starts `tusq serve --policy <generated>` to verify the server accepts the output.

**New eval scenario** — `policy-init-generator-round-trip` extends the governed-cli eval harness to 5 scenarios, asserting that a generated dry-run policy produces the same `tools/call dry_run_plan` shape as a hand-authored policy.

## Policy Verify Command (M22 — V1.3)

`tusq policy verify` validates an execution policy file against the same `loadAndValidatePolicy()` validator used by `tusq serve --policy`. It provides a fast, CI-friendly pre-flight check without starting a server.

**Why it matters** — Before M22, the only way to confirm a policy would be accepted by `tusq serve --policy` was to start the server. That is slow in CI and conflates policy validity with server startup failures. `tusq policy verify` closes the loop between `tusq policy init` (M21, scaffold) and `tusq serve --policy` (M20, enforce) with a dedicated, non-server validation step that fails fast in CI, returns a machine-readable JSON result under `--json`, and — critically — shares the exact same validator as the server (REQ-074 parity), so a `verify` PASS is a provable guarantee that `serve --policy` will accept the same file.

**Usage:**
```
tusq policy verify [--policy <path>] [--json] [--verbose]
```

Default policy path is `.tusq/execution-policy.json`; override with `--policy <path>`.

**Exit behavior:**
- Exit 0: policy is valid. Human-readable output: `Policy valid: <path> (mode: <mode>, reviewer: <reviewer>, allowed_capabilities: <unset|N>)`
- Exit 1: policy is invalid. Error message goes to stderr (or stdout under `--json`).

**Error conditions** (all exit 1, messages match `tusq serve --policy` exactly — shared validator):
- `Policy file not found: <path>` — file does not exist
- `Invalid policy JSON at: <path>` — file is not valid JSON
- `Unsupported policy schema_version: <v>. Supported: 1.0` — unknown schema version
- `Unknown policy mode: <mode>. Allowed: describe-only, dry-run` — unknown mode
- `Invalid allowed_capabilities in policy: must be an array of strings` — non-array type

**`--json` output shape:**

Success:
```json
{
  "valid": true,
  "path": "/path/to/execution-policy.json",
  "policy": {
    "schema_version": "1.0",
    "mode": "dry-run",
    "reviewer": "ops@example.com",
    "approved_at": "2026-04-22T07:43:59.949Z",
    "allowed_capabilities": null
  }
}
```

Failure:
```json
{
  "valid": false,
  "path": "/path/to/execution-policy.json",
  "error": "Unsupported policy schema_version: 9.9. Supported: 1.0"
}
```

**Parity guarantee** (REQ-074) — `tusq policy verify` and `tusq serve --policy` call `loadAndValidatePolicy()` without modification. Every error message emitted by `verify` is byte-identical to the error emitted by `serve --policy` for the same bad fixture. There is no standalone re-implementation of validation logic.

## Policy Strict Verify (M23 — V1.4)

`tusq policy verify --strict` adds an opt-in, manifest-aware capability cross-reference layer on top of the M22 validator. It is a CI/review-layer gate, not a server-startup gate — `tusq serve --policy` is not affected by this flag.

**Why it matters** — M22 `tusq policy verify` confirms the policy file is structurally valid. It does not confirm that the capabilities named in `allowed_capabilities` are actually present and approved in `tusq.manifest.json`. M23 closes that gap: `--strict` reads the manifest and cross-references each `allowed_capabilities` entry against the manifest's approval state, so a `--strict` PASS means the policy is valid **and** every named capability is present, approved, and not flagged for review.

**Usage:**
```
tusq policy verify [--policy <path>] --strict [--manifest <path>] [--json] [--verbose]
```

The `--manifest` flag is only valid under `--strict`. Using `--manifest` without `--strict` exits 1 with `--manifest requires --strict` before any file read (SYSTEM_SPEC Constraint 11). Default manifest path is `tusq.manifest.json` in the current directory.

**Strict check logic** — Three failure reasons, emitted for each failing `allowed_capabilities` entry in declaration order:
- `not_in_manifest` — capability name is absent from `manifest.capabilities`
- `not_approved` — capability is present but `approved: false`
- `requires_review` — capability is present and approved but `review_needed: true`

If `allowed_capabilities` is unset or null, the strict check passes trivially without opening the manifest. An empty array also passes trivially.

**Exit behavior under `--strict`:**
- Exit 0: policy is structurally valid **and** all allowed capabilities are approved in the manifest. Output: `Policy valid (strict): <path> (mode: <mode>, reviewer: <reviewer>, allowed_capabilities: N, manifest: <manifest_path>)`
- Exit 1: policy is invalid, OR one or more allowed capabilities fail the manifest cross-reference. Each failing entry is emitted as `Strict policy verify failed: <reason>: <name>`.

**`--strict --json` output shapes:**

Success:
```json
{
  "valid": true,
  "strict": true,
  "path": "/path/to/execution-policy.json",
  "manifest_path": "/path/to/tusq.manifest.json",
  "manifest_version": 1,
  "approved_allowed_capabilities": 1,
  "policy": { "schema_version": "1.0", "mode": "describe-only", ... }
}
```

Failure:
```json
{
  "valid": false,
  "strict": true,
  "path": "/path/to/execution-policy.json",
  "manifest_path": "/path/to/tusq.manifest.json",
  "strict_errors": [
    { "name": "cap_unapproved", "reason": "not_approved" }
  ]
}
```

**M22 parity invariant** (SYSTEM_SPEC Constraint 9) — The default `tusq policy verify` code path (no `--strict`) is byte-for-byte identical to M22. The `--strict` flag is always opt-in; it is never inferred from the presence of a manifest file. M22 validation always runs first on the `--strict` path; strict checks only execute after M22 validation passes.

**What strict PASS does NOT claim** (SYSTEM_SPEC Constraint 12) — A strict PASS is a policy/manifest alignment statement at verify time only. It does not imply runtime safety, execution pre-flight, manifest freshness, or reachability of any capability at serve time. `tusq serve --policy` continues to silently drop unlisted/unapproved capabilities from `tools/list` as specified in M20, regardless of what `policy verify --strict` found at verify time.

**New eval scenario** — `policy-strict-verify-determinism` extends the governed-cli eval harness to 6 scenarios. It runs `policy verify --strict --json` three times and asserts that `strict_errors` name ordering is identical across all runs, confirming deterministic output from the Map-based capability lookup and declaration-order iteration over `allowed_capabilities`.

**All 80 acceptance criteria** (REQ-001–REQ-080) pass on HEAD 72722fa: `npm test` exits 0 with `Smoke tests passed` and `Eval regression harness passed (6 scenarios)`.

## Fastify Schema Body-Field Extraction (M24 — V1.5)

When a Fastify route declares a literal `schema: { body: { properties: {...}, required: [...] } }` block in its route-options object, `tusq scan` now captures the declared top-level field shapes and merges them into `input_schema.properties`.

**What changes for Fastify routes with a literal body schema:**
- `input_schema.source` is set to `fastify_schema_body` (previously `framework_schema_hint` or `request_body`).
- `input_schema.additionalProperties` is `false` (previously `true`), indicating the body shape is fully declared.
- `input_schema.properties` includes the declared field names with their types in declaration order.
- `input_schema.required` includes the declared required fields.
- A `capability_digest` change from the new `input_schema` shape will appear in `tusq diff` output, requiring re-approval via `tusq approve` before recompiling.

**Path-parameter collision rule:** When a body schema declares a field with the same name as a path parameter (e.g. `PUT /items/:id` with `body.properties.id`), the path parameter wins. The path parameter entry (`source: 'path'`, `type: 'string'`) is preserved; the body-declared field is silently dropped.

**Fall-back behavior (byte-for-byte M15):** Any of the following causes the extractor to fall back to M15 behavior with no schema_fields:
- `schema` is a variable reference (not a literal object)
- `body` key is absent from the schema object
- `properties` key is absent from the body object
- Any brace is unbalanced in the options block

**What does NOT change:** Express and NestJS routes produce byte-identical manifests before and after M24 — the extraction is Fastify-only. Routes that fall back to M15 behavior also produce byte-identical manifests.

**Framing boundary** (SYSTEM_SPEC Constraint 14): `fastify_schema_body` means "the declared body schema as it appears literally in source." It does NOT mean the shape is validator-backed, runtime-enforced by Fastify, or ajv-validated. The manifest documents what the source declares; Fastify at runtime may enforce additional constraints not visible to the static extractor.

**New eval scenario** — `fastify-schema-body-extraction-determinism` extends the governed-cli eval harness to 7 scenarios. It runs `tusq scan` three times on the Fastify fixture and asserts that POST /items produces `source: 'fastify_schema_body'`, `additionalProperties: false`, and identical property key ordering (`name`, `price`, `active`) across all three runs.

**All 87 acceptance criteria** (REQ-001–REQ-087) pass on HEAD b651135: `npm test` exits 0 with `Smoke tests passed` and `Eval regression harness passed (7 scenarios)`.

## PII Field-Name Redaction Hints (M25 — V1.6)

`tusq manifest` now automatically populates `capability.redaction.pii_fields` by matching `input_schema.properties` key names against a frozen canonical set of well-known PII field names. No AST parsing, no value inspection, no external library, and no network I/O — the extractor is a pure in-memory function over the already-built `input_schema.properties` object.

**How it works:**
- Each property key from `input_schema.properties` is normalized: `toLowerCase()` then strip `_` and `-`.
- The normalized key is looked up (whole-key only) in the `PII_CANONICAL_NAMES` frozen Set in `src/cli.js`.
- Matched keys are returned in source-declaration order with their original casing preserved (`user_email` stays `user_email`, not `useremail`).
- `pii_fields` is `[]` when no keys match — byte-identical to the V1 default.

**Canonical V1.6 set (36 normalized names across 9 categories):**
- Email: `email`, `emailaddress`, `useremail`
- Phone: `phone`, `phonenumber`, `mobile`, `mobilephone`, `telephone`
- Government ID: `ssn`, `socialsecuritynumber`, `taxid`, `nationalid`
- Name: `firstname`, `lastname`, `fullname`, `middlename`
- Address: `streetaddress`, `zipcode`, `postalcode`
- Date of birth: `dateofbirth`, `dob`, `birthdate`
- Payment: `creditcard`, `cardnumber`, `cvv`, `cvc`, `bankaccount`, `iban`
- Secrets: `password`, `passphrase`, `apikey`, `accesstoken`, `refreshtoken`, `authtoken`, `secret`
- Network: `ipaddress`

**Key invariants:**
- `user_email` matches (`useremail` is in the set); `email_template_id` does NOT match (`emailtemplateid` is not in the set). Whole-key match only — no substring, no tail match.
- `sensitivity_class` is NOT auto-escalated — it remains `"unknown"` in V1.6 regardless of `pii_fields` content.
- `log_level`, `mask_in_traces`, and `retention_days` are NOT auto-populated — they remain at V1 permissive defaults.
- Applies uniformly across Express, Fastify, and NestJS capabilities (operates on the already-normalized `input_schema.properties`, not on source text).

**Upgrade note — digest flip and re-approval:** Populating `pii_fields` on a capability that previously had `pii_fields: []` changes `capability_digest` (M13 hashes the full `redaction` object). Any affected capability will disappear from `tools/list` until explicitly re-approved via `tusq approve`. Use `tusq diff` to see which capabilities are affected before and after upgrading to M25. This is the correct governance path — it is intentional, not a bug.

**Framing boundary** (SYSTEM_SPEC Constraint 16): A `pii_fields` entry means the field's normalized key matches a well-known PII name in the V1.6 set. It does NOT prove the field carries PII at runtime, does NOT imply GDPR/HIPAA/PCI compliance, and MUST NOT be described as "PII detection" or "PII-validated." Reviewers remain responsible for final redaction posture.

**V1.6 canonical list is frozen.** Any expansion of `PII_CANONICAL_NAMES` is a material governance event that must land under its own ROADMAP milestone with a fresh re-approval expectation and a RELEASE_NOTES entry.

**New eval scenario** — `pii-field-hint-extraction-determinism` extends the governed-cli eval harness to 8 scenarios. It runs `tusq scan` + `tusq manifest` three times on the pii-hint-sample fixture and asserts that POST /auth, POST /register, and GET /catalog produce the expected `pii_fields` arrays with identical ordering across all three runs.

**All 93 acceptance criteria** (REQ-001–REQ-093) pass on HEAD ca29d17: `npm test` exits 0 with `Smoke tests passed` and `Eval regression harness passed (8 scenarios)`.

## Static PII Category Labels (M26 — V1.7)

`tusq manifest` now automatically populates `capability.redaction.pii_categories` as a parallel array to `capability.redaction.pii_fields`. Each entry labels the M25 canonical category that produced the matching field-name hint, in the same order and at the same index.

**How it works:**
- `PII_CATEGORY_BY_NAME` in `src/cli.js` is the frozen normalized-name → category lookup.
- `PII_CANONICAL_NAMES` is derived from `Object.keys(PII_CATEGORY_BY_NAME)`, so the M25 field-name set and M26 category mapping freeze together.
- `extractPiiFieldCategories(piiFields)` normalizes each M25-emitted field name with the same `toLowerCase()` + strip `_`/`-` rule, looks up the category, and returns a parallel array.
- If `pii_fields` is empty, `pii_categories` is `[]` (array, never absent).

**Canonical V1.7 category keys:**
- `email`
- `phone`
- `government_id`
- `name`
- `address`
- `date_of_birth`
- `payment`
- `secrets`
- `network`

**Examples:**
- `pii_fields: ["email", "password"]` → `pii_categories: ["email", "secrets"]`
- `pii_fields: ["user_email", "first_name", "phone_number"]` → `pii_categories: ["email", "name", "phone"]`
- `pii_fields: ["user_email", "ssn", "credit_card"]` → `pii_categories: ["email", "government_id", "payment"]`
- `pii_fields: []` → `pii_categories: []`

**Key invariants:**
- `pii_categories.length === pii_fields.length`.
- Category ordering is exactly `pii_fields` ordering.
- No new command, flag, dependency, source-text scan, value inspection, network I/O, or compliance/retention-policy library was added.
- `scoreConfidence()` is unchanged; category presence is a redaction signal, not a confidence signal.
- `sensitivity_class` is NOT auto-escalated — it remains `"unknown"` in V1.7.
- `log_level`, `mask_in_traces`, and `retention_days` are NOT auto-populated from categories — existing defaults remain `"full"`, `false`, and `null` unless a reviewer edits them.
- `tusq serve` and `tusq policy verify --strict` do not filter or enforce based on `pii_categories`.

**Upgrade note — broad digest flip and re-approval:** M26 adds `pii_categories` to every capability's `redaction` object. Capabilities with PII hints gain populated category arrays, and non-PII capabilities gain `pii_categories: []`. Because M13 hashes the full `redaction` object, every existing approved capability can see a one-time `capability_digest` flip on its first post-M26 manifest regeneration. Use `tusq diff` to review the shape change, then re-approve affected capabilities with `tusq approve` before expecting them to reappear in `tools/list`.

**Framing boundary** (SYSTEM_SPEC Constraint 18): A `pii_categories` entry means "this field-name hint belongs to this canonical category." It does NOT prove the field carries PII at runtime, does NOT enforce retention policy, does NOT auto-redact payloads, and does NOT imply GDPR/HIPAA/PCI compliance. Reviewers still own final masking, logging, and retention choices.

**New eval scenario** — `pii-category-label-determinism` extends the governed-cli eval harness to 9 scenarios. It runs `tusq scan` + `tusq manifest` three times on the pii-hint-sample fixture and asserts expected `pii_fields`/`pii_categories` pairs for POST /auth, POST /register, POST /profile, and GET /catalog with identical ordering across all three runs.

**All 100 acceptance criteria** (REQ-001–REQ-100) pass on HEAD 45129d3: `npm test` exits 0 with `Smoke tests passed` and `Eval regression harness passed (9 scenarios)`. Recovered QA re-ran and confirmed the same command/result before the launch transition.

## Reviewer-Facing PII Redaction Review Report (M27 — V1.8)

`tusq redaction review` adds a read-only reviewer report for the static PII redaction metadata already emitted by M25/M26. It reads a manifest, lists each capability's `redaction.pii_fields` and `redaction.pii_categories`, and attaches frozen per-category advisory text for reviewer-owned masking, logging, and retention decisions.

**Usage:**
```
tusq redaction review [--manifest <path>] [--capability <name>] [--json]
```

**What the report includes:**
- Top-level `manifest_path`, `manifest_version`, and `generated_at` copied from the manifest; missing `manifest_version`/`generated_at` become `null` in `--json` and `unknown` in human output.
- One section/object per capability, including unapproved and review-needed capabilities.
- `approved`, `sensitivity_class`, `pii_fields`, and `pii_categories` copied from the manifest.
- `advisories` with one entry per distinct category in first-appearance order.

**Frozen V1.8 advisory categories:**
- `email`
- `phone`
- `government_id`
- `name`
- `address`
- `date_of_birth`
- `payment`
- `secrets`
- `network`

**Key invariants:**
- The advisory source of truth is `PII_REVIEW_ADVISORY_BY_CATEGORY` in `src/cli.js`.
- Advisory wording is frozen, including em-dash U+2014 usage; wording or punctuation drift is a material governance event.
- `capabilities: []` is valid and exits 0: human output is exactly `No capabilities in manifest — nothing to review.`; JSON output still emits the top-level fields and `capabilities: []`.
- Missing manifest, malformed JSON, missing/non-array `capabilities`, unknown `--capability`, unknown subcommand, and unknown flag all exit 1 with stderr-only messages and empty stdout.
- The command is strictly read-only: it does not mutate `tusq.manifest.json`, does not write policy/tool/scan artifacts, does not change `capability_digest`, and does not change `tusq policy verify` or `tusq policy verify --strict`.
- `sensitivity_class`, `retention_days`, `log_level`, `mask_in_traces`, approval fields, and review-needed state are not inferred or mutated.

**Framing boundary** (SYSTEM_SPEC Constraints 19 and 20): `tusq redaction review` is a reviewer aid, not a runtime enforcement gate, not automated PII compliance, not an automated redaction policy, and not a substitute for reviewer judgment. Running it does not make a capability safer at runtime; it only summarizes existing static field-name/category evidence alongside frozen reviewer reminders.

**New eval scenario** — `redaction-review-determinism` extends the governed-cli eval harness to 10 scenarios. It runs `tusq redaction review --json` three times on the same pii-hint-sample manifest and asserts byte-identical stdout plus advisory ordering that matches `pii_categories` appearance order.

**All 108 acceptance criteria** (REQ-001–REQ-108) pass on HEAD d242727: `npm test` exits 0 with `Smoke tests passed` and `Eval regression harness passed (10 scenarios)`.

## Known V1 Limits And Non-Claims

- **Heuristic scanner:** Route extraction uses regex-based static analysis, not a full AST. Complex dynamic route registration patterns may be missed or produce low-confidence results. Users should review the manifest before compiling.
- **Describe-only and dry-run MCP:** `tusq serve` returns capability schemas and (with `--policy`) dry-run plans. Neither mode proxies or executes live API calls. Full execution support is planned for V2.
- **No plugin API:** Framework support (Express, Fastify, NestJS) is hardcoded. Community framework plugins are deferred to V2.
- **JavaScript/TypeScript only:** Python, Go, Java, and other ecosystems are not supported in V1.
- **Non-interactive review:** `tusq review` prints to stdout only. An interactive TUI for in-terminal approval is planned for V1.1.
- **Distribution still needs explicit confirmation:** the launch narrative should drive repo-local evaluation until a public package channel is actually available

## QA Re-Verification (turn_5584c661462c5226, attempt 2, 2026-04-25, HEAD 6b2cc50)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (10 scenarios)`. `node bin/tusq.js help` → exit 0, 13 commands, `redaction` at position 11. All 108 acceptance criteria (REQ-001–REQ-108) remain PASS. No source drift from prior QA-verified baseline — git diff 7756d19..6b2cc50 confirms only `.planning/IMPLEMENTATION_NOTES.md` changed.

## QA Re-Verification (turn_a769aa550ba55c00, attempt 8, 2026-04-25, HEAD 524520f)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (10 scenarios)`. `node bin/tusq.js help` → exit 0, 13 commands (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help), `redaction` at position 11. All 108 acceptance criteria (REQ-001–REQ-108) remain PASS. No source drift from prior QA-verified baseline — `git diff HEAD~1..HEAD --name-only` confirms only `.planning/IMPLEMENTATION_NOTES.md` changed in the dev turn (turn_56af307abe6071b2). Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## Static Sensitivity Class Inference (M28 — V1.9)

`tusq manifest` now automatically infers `capability.sensitivity_class` from existing manifest evidence using a frozen six-rule first-match-wins decision table. No new command, no new dependency, and no runtime coupling.

**Five sensitivity class values:**
- `restricted` — irreversible/admin/destructive operations (R1: preserve flag; R2: admin or destructive verb/route)
- `confidential` — confirmed PII evidence (R3) or write to financial/regulated route (R4)
- `internal` — auth-gated or write operations below the confidential threshold (R5)
- `public` — evidence present, no stronger rule matched (R6)
- `unknown` — zero static evidence (no verb, path, PII categories, preserve flag, or auth hints)

**Frozen six-rule decision table (R1 beats all — any rule change is a governance event):**

| Rule | Trigger | Class |
|------|---------|-------|
| R1 | `preserve: true` flag | `restricted` |
| R2 | Admin/destructive verb or admin-namespaced route | `restricted` |
| R3 | `redaction.pii_categories` non-empty | `confidential` |
| R4 | Write verb + financial/regulated route or parameter | `confidential` |
| R5 | `auth_hints` present or write verb | `internal` |
| R6 | Default — evidence present, no stronger rule matched | `public` |

**New review filter — `tusq review --sensitivity <class>`:** Optional flag limits displayed output to capabilities with the specified sensitivity class. Legal values: `unknown`, `public`, `internal`, `confidential`, `restricted`. Unrecognized value exits 1 before any output. Filter is display-only — it does not affect exit code (unapproved or low-confidence capabilities outside the filter still count for `--strict` failure).

**Compile and MCP surface unchanged:** `sensitivity_class` is NOT in compiled tool definitions or MCP `tools/list`/`tools/call` responses. Only `tusq review`, `tusq docs`, and `tusq diff` surface it as reviewer-aid metadata.

**Upgrade note — expected digest flip and re-approval sweep:** M28 changes how `sensitivity_class` is computed. On first `tusq manifest` run after M28, capabilities that previously had `sensitivity_class: "unknown"` will now receive a computed value. Because M13 hashes `sensitivity_class` into `capability_digest`, any value change flips the digest and resets `approved` to `false`. Use `tusq diff` to see which capabilities changed, then re-approve with `tusq approve`. This is the expected M28 adoption path.

**Key invariants:**
- 13-command CLI surface preserved exactly (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help).
- `tusq compile` output is byte-identical before and after M28 adoption.
- `tusq approve` gate logic is unchanged.
- `tusq serve` MCP surface is unchanged.
- `tusq policy verify` (default and `--strict`) behavior is unchanged.
- No new dependency added to `package.json`.

**Framing boundary** (SYSTEM_SPEC Constraint 21): `sensitivity_class` is reviewer-aid framing only. It MUST NOT be presented as runtime PII enforcement, automated compliance certification, or GDPR/HIPAA/PCI/SOC2 attestation. The classifier is a deterministic pure function of already-shipped manifest evidence with zero network, runtime, or policy calls.

**Three new eval scenarios** extend the governed-cli eval harness to 13 scenarios: `sensitivity-class-r4-financial-inference` (R4: POST /payments → confidential without PII), `sensitivity-class-r1-preserve-precedence` (R1 beats R3: preserve=true+PII → restricted), and `sensitivity-class-zero-evidence-unknown` (zero-evidence guard: no method/path/PII/auth → unknown).

**All 115 acceptance criteria** (REQ-001–REQ-115) pass on HEAD 6fb4fa1 + QA working tree: `npm test` exits 0 with `Smoke tests passed` and `Eval regression harness passed (13 scenarios)`.

## Static Auth Requirements Inference (M29 — V1.10)

`tusq manifest` now automatically computes a structured `auth_requirements` record per capability as a pure deterministic function of existing manifest evidence. The record is a reviewer aid — it does NOT authenticate requests, enforce authorization, validate tokens, or certify OAuth/OIDC/SOC2/GDPR compliance.

**Seven auth scheme values:**
- `bearer` — middleware-name evidence matches bearer-token / JWT / access-token pattern (R1)
- `api_key` — middleware-name evidence matches API-key / x-api-key pattern (R2)
- `session` — middleware-name evidence matches session / cookie / passport-local pattern (R3)
- `basic` — middleware-name evidence matches HTTP Basic Auth pattern (R4)
- `oauth` — middleware-name evidence matches OAuth / OIDC / OpenID pattern (R5)
- `none` — `auth_required === false` AND non-admin route (R6; reachable via manual manifest edits)
- `unknown` — zero static evidence or no rule matched

**Frozen six-rule decision table (R1 beats all — any rule change is a governance event):**

| Rule | Condition | `auth_scheme` | `evidence_source` |
|------|-----------|--------------|-------------------|
| R1 | Any `auth_hints` name matches `/bearer\|jwt\|access[_-]?token/i` | `bearer` | `middleware_name` |
| R2 | Any `auth_hints` name matches `/api[_-]?key\|x-api-key/i` | `api_key` | `middleware_name` |
| R3 | Any `auth_hints` name matches `/session\|cookie\|passport-local/i` | `session` | `middleware_name` |
| R4 | Any `auth_hints` name matches `/basic[_-]?auth/i` | `basic` | `middleware_name` |
| R5 | Any `auth_hints` name matches `/oauth\|oidc\|openid/i` | `oauth` | `middleware_name` |
| R6 | `auth_required === false` AND non-admin route | `none` | `auth_required_flag` |
| default | Evidence present, no rule matched | `unknown` | `none` |

**Zero-evidence guard (first check before R1):** Capabilities with no auth-related middleware (`auth_hints: []`), no route, no `auth_required` flag, and no sensitivity signal receive `auth_scheme: "unknown"` — NEVER silently `"none"`. `"none"` is only reachable from R6.

**New review filter — `tusq review --auth-scheme <scheme>`:** Optional flag limits displayed output to capabilities with the specified auth scheme. Legal values: the 7-value closed enum above. Unrecognized value exits 1 before any output (empty stdout, error on stderr). Mutually compatible with `--sensitivity` (AND-style intersection when both are set). Filter is display-only and does not affect `--strict` exit code.

**`auth_scopes` and `auth_roles` extraction:** Derived from middleware annotation literals via frozen frozen regex patterns `/scopes?:\s*\[([^\]]+)\]/` and `/role[s]?:\s*\[([^\]]+)\]/`. Both arrays are always present (never `null`), order-preserving, and case-sensitively deduplicated. Returns `[]` when no annotation matches.

**Compile and MCP surface unchanged (AC-7):** `auth_requirements` is NOT in compiled tool definitions (`tusq-tools/*.json`) or MCP `tools/list`/`tools/call`/`dry_run_plan` responses. It is a manifest-and-review-surface field only.

**Upgrade note — expected digest flip and re-approval sweep:** M29 changes `capability_digest` because `auth_requirements` is now included in the hash payload. On first `tusq manifest` run after M29, capabilities that previously had no `auth_requirements` will now have a computed value, flipping the digest and resetting `approved` to `false`. Use `tusq diff` to see which capabilities changed, then re-approve with `tusq approve`.

**Key invariants:**
- 13-command CLI surface preserved exactly (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help).
- `tusq compile` output is byte-identical before and after M29 adoption.
- `tusq approve` gate logic is unchanged.
- `tusq serve` MCP surface (tools/list, tools/call, dry_run_plan) is byte-for-byte unchanged.
- `tusq policy verify` (default and `--strict`) behavior is unchanged.
- `tusq redaction review` behavior is unchanged.
- No new dependency added to `package.json`.

**Framing boundary (SYSTEM_SPEC Constraint 22):** `auth_requirements` is reviewer-aid framing only. tusq DOES NOT authenticate or authorize requests at runtime, DOES NOT certify OAuth/OIDC/SAML/SOC2/ISO27001 compliance, and DOES NOT validate token signatures or scope grants. `auth_scheme: "bearer"` means a middleware name matched the R1 regex — not that tusq verifies bearer tokens. Reviewers own all AAA decisions.

**Three new eval scenarios** extend the governed-cli eval harness from 13 to 16 scenarios: `auth-scheme-bearer-r1-precedence` (R1 bearer precedence), `auth-scheme-zero-evidence-unknown-bucket` (zero-evidence guard → unknown, never none), `auth-scheme-scopes-extraction-order` (auth_scopes/auth_roles are arrays with order preservation).

**All 124 acceptance criteria** (REQ-001–REQ-124) pass on HEAD 2ba4452 + QA working tree: `npm test` exits 0 with `Smoke tests passed` and `Eval regression harness passed (16 scenarios)`.

**Known limitation (V1.10):** The `auth_required` field is not set by the scanner in V1.10, making R6 (`auth_required === false` → `auth_scheme: 'none'`) reachable only via manually-edited manifests. The implementation is correct for manual edits. A future milestone may populate `auth_required` from scanner evidence.

## QA M29 Re-Verification (turn_9c2522b83d39efec, run_8fe3b8b418dc589c, 2026-04-25)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (16 scenarios)`. `node bin/tusq.js help` → exit 0, 13 commands. `node bin/tusq.js review --help` → includes `--auth-scheme <scheme>` and `--sensitivity <class>`. Dev turn (turn_0528de27fb8f6d22) made zero source changes — M29 already on HEAD 3074ee5/d904e1f. OBJ-001 (medium, non-blocking) carried forward: R6 dead code in automated pipeline; implementation correct. All 124 acceptance criteria (REQ-001–REQ-124) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA M29 Re-Verification (turn_c72ee10c438066e0, run_44a179ccf81697c3, 2026-04-25)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (16 scenarios)`. `node bin/tusq.js help` → exit 0, 13 commands. `node bin/tusq.js review --help` → includes `--auth-scheme <scheme>` and `--sensitivity <class>`. Dev turn (turn_91da85658fdfe27c) made zero source changes — M29 already on HEAD bc5e2fe. OBJ-001 (medium, non-blocking) carried forward: R6 dead code in automated pipeline; implementation correct. All 124 acceptance criteria (REQ-001–REQ-124) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA M29 Verification (turn_f01a675bc13a2594, 2026-04-25)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (16 scenarios)`. `node bin/tusq.js help` → exit 0, 13 commands. `node bin/tusq.js review --help` → includes `--auth-scheme <scheme>`. OBJ-001 (medium) raised: AC-8 Case 6 (R6) is dead code in the automated pipeline — `auth_required` is never set by scanner; implementation is correct for manual manifest edits; non-blocking. All 124 acceptance criteria (REQ-001–REQ-124) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA M28 Verification (turn_bff61126f4accd83, 2026-04-25)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (13 scenarios)`. `node bin/tusq.js help` → exit 0, 13 commands. `node bin/tusq.js review --help` → exit 0, includes `--sensitivity <class>`. Challenged dev turn (turn_6f3041947dd2a211) on three objections (AC-8 eval count gap, missing review --help doc, missing website docs). All three resolved by QA fixes applied directly (write authority: authoritative). All 115 acceptance criteria (REQ-001–REQ-115) pass. Ship verdict: SHIP. Gate artifacts (acceptance-matrix.md, ship-verdict.md, RELEASE_NOTES.md) fully updated; phase_transition_request: launch (auto_approve policy).

## QA M29 Re-Verification (turn_d16957598390228f, run_94746c3508844fcb, 2026-04-25)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (16 scenarios)`. `node bin/tusq.js help` → exit 0, 13 commands (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help). `node bin/tusq.js review --help` → includes `--auth-scheme <scheme>` and `--sensitivity <class>`. `git diff HEAD --stat -- src/ bin/ tests/ website/` → empty (zero source drift). Dev turn (turn_0e8e152e05796fdc) made zero source changes — M29 already on HEAD 2afe119/6e9167e. OBJ-001 (medium, non-blocking) carried forward: R6 (`auth_required === false` → `auth_scheme: 'none'`) is dead code in the automated pipeline; implementation is correct for manually-edited manifests. All 124 acceptance criteria (REQ-001–REQ-124) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA M29 Re-Verification (turn_ee155e3062a2395e, run_6d12fe85d0e51576, 2026-04-25)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (16 scenarios)`. `node bin/tusq.js help` → exit 0, 13 commands (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help). `node bin/tusq.js review --help` → includes `--auth-scheme <scheme>` and `--sensitivity <class>`. `git diff HEAD --stat -- src/ bin/ tests/ website/` → empty (zero source drift). Dev turn (turn_768db52384611260) made zero source changes — M29 already on HEAD ab436bf from prior runs. OBJ-001 (medium, non-blocking) carried forward: R6 (`auth_required === false` → `auth_scheme: 'none'`) is dead code in the automated pipeline; implementation is correct for manually-edited manifests. All 124 acceptance criteria (REQ-001–REQ-124) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA M29 Re-Verification (turn_7774b27ecf2a7a31, run_ce89ef5bd4b8cca8, 2026-04-25)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (16 scenarios)`. `node bin/tusq.js help` → exit 0, 13 commands (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help). `node bin/tusq.js review --help` → includes `--auth-scheme <scheme>` and `--sensitivity <class>`. `git diff ab436bf..fa7853e -- src/ bin/ tests/ website/` → empty (zero source drift since last QA checkpoint). Prior accepted turn (turn_430f9b5d0f850456) was a ghost with no evidence — challenged independently. Zero source changes between ab436bf and fa7853e — only launch artifacts and AgentXchain docs changed. OBJ-001 (medium, non-blocking) carried forward: R6 (`auth_required === false` → `auth_scheme: 'none'`) is dead code in the automated pipeline; implementation correct for manually-edited manifests. All 124 acceptance criteria (REQ-001–REQ-124) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA M29 Re-Verification (turn_f49fd22cd74a554c, run_2ee1a03651d5d485, 2026-04-25)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (16 scenarios)`. `node bin/tusq.js help` → exit 0, 13 commands (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help). `git diff HEAD --stat -- src/ bin/ tests/ website/` → empty (zero source drift). Dev turn (turn_363693afea46c3e7) made zero source changes — only `.planning/IMPLEMENTATION_NOTES.md` modified; embeddable-surface charter remains unbound candidate in ROADMAP_NEXT_CANDIDATES.md only. OBJ-001 (medium, non-blocking) carried forward: R6 (`auth_required === false` → `auth_scheme: 'none'`) is dead code in the automated pipeline; implementation is correct for manually-edited manifests. OBJ-002 (low, non-blocking): VISION.md chat/voice/widget/palette surfaces are unimplemented in M1–M29; shipped product delivers compiler/governance half only; charter cycle will address. All 124 acceptance criteria (REQ-001–REQ-124) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA M29 Re-Verification (turn_ceaedc5c7d5bbf1a, run_42732dba3268a739, 2026-04-26)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (16 scenarios)`. `node bin/tusq.js help` → exit 0, 13 commands (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help). `git diff HEAD -- src/ bin/ tests/ website/ package.json package-lock.json` → empty (zero source drift). Dev turn (turn_cdcec89ff1d6683d) made zero source changes — only `.planning/IMPLEMENTATION_NOTES.md` modified; static-MCP-descriptor charter (intent_1777173722739_5899) remains unbound candidate in ROADMAP_NEXT_CANDIDATES.md only; dev correctly declined to implement without human binding. PM OBJ-001 (form decision A/B/C for `tusq mcp export` vs `tusq serve --export` vs `tusq plan mcp`) is unresolved and is a pre-binding blocker. Two unbound vision-derived charters now coexist in the candidate backlog (embeddable-surface + static-MCP-descriptor); non-blocking for V1.10 ship. OBJ-001 (medium, non-blocking) carried forward: R6 (`auth_required === false` → `auth_scheme: 'none'`) is dead code in the automated pipeline; implementation is correct for manually-edited manifests. All 124 acceptance criteria (REQ-001–REQ-124) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA M28 Stale-Checkbox Reconciliation Re-Verification (turn_9abf910a0efb4468, run_d69cb0392607d170, 2026-04-26)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (16 scenarios)`. `node bin/tusq.js help` → exit 0, 13 commands (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help). `git diff HEAD --stat -- src/ bin/ tests/ website/ package.json package-lock.json` → empty (zero source drift). Dev turn (turn_76e50fc1cfd4ef0f) made zero source changes — only `.planning/IMPLEMENTATION_NOTES.md` modified. PM turn (turn_641188dc0c4b7616) correctly reconciled 15 M28 ROADMAP checkboxes as a stale-checkbox false positive from vision_scan (intent_1777180727050_1210); M28 was fully shipped at V1.9 with verifiable file:line evidence (`classifySensitivity` at `src/cli.js:2732`, zero-evidence guard at `:2741`, digest hash at `:469/:472`, `--sensitivity` filter at `:803-882`). No new charter bound in either PM or dev turns. OBJ-001 (medium, non-blocking) carried forward: R6 (`auth_required === false` → `auth_scheme: 'none'`) is dead code in the automated pipeline; implementation is correct for manually-edited manifests. OBJ-002 (low, non-blocking): two unbound vision-derived charters (embeddable-surface + static-MCP-descriptor) in candidate backlog awaiting human binding. OBJ-003 (low, non-blocking): vision_scan has produced at least three stale-checkpoint false positives across consecutive runs; operator-level filter configuration warranted. All 124 acceptance criteria (REQ-001–REQ-124) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA M35 Refinement Re-Verification (turn_b417afbe873a5777, run_152b21c8bbaa78d9, 2026-04-26)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (26 scenarios)`. `node -e "require('./src/cli.js'); console.log('Module loaded OK');"` → exit 0 (`_guardAuthSchemeBucketAlignment` IIFE fires and passes: `AUTH_SCHEME_INDEX_BUCKET_ORDER ∪ {'unknown'}` equals `AUTH_SCHEMES`). `node bin/tusq.js auth index --help` → exit 0; planning-aid framing and `bearer → api_key → session → basic → oauth → none → unknown` bucket order confirmed. `node bin/tusq.js auth index --scheme BEARER --manifest tests/fixtures/express-sample/tusq.manifest.json` → exit 1, stderr `Unknown auth scheme: BEARER`, empty stdout (case-sensitive enforcement confirmed). `git diff --quiet HEAD -- src/ bin/ tests/ website/ package.json package-lock.json` → exit 0 (zero source drift). Dev turn (turn_bdc543168423c491) modified exactly 3 dev-owned files: `src/cli.js` (line 109: `AUTH_SCHEME_INDEX_BUCKET_ORDER = Object.freeze(AUTH_SCHEMES.filter((s) => s !== 'unknown'))` — derived from M29 AUTH_SCHEMES rather than independently declared; lines 114–125: `_guardAuthSchemeBucketAlignment` IIFE throws synchronously at module load if `AUTH_SCHEME_INDEX_BUCKET_ORDER ∪ {'unknown'}` diverges from `AUTH_SCHEMES`), `.planning/ROADMAP.md` (line 629 `[ ]→[x]`, all 20 M35 checkboxes now `[x]`), `.planning/IMPLEMENTATION_NOTES.md` (this turn entry prepended). PM turn (turn_ec2716f4b8fe4ff4) correctly identified that intake charter intent_1777244614389_af70 (vision_scan, category roadmap_open_work_detected) re-injected M35 V1.16 (PROPOSED) as if unshipped — the 9th recurrence of the vision_scan stale-checkbox false-positive pattern (M28→M30→M31→M32→M33→M33-again→M34-again→M34-again-again→M35-again) — and identified the genuine residual gap at ROADMAP line 629: no derivation from AUTH_SCHEMES, no synchronous mismatch guard. Dev turn closed the gap. OBJ-001/OBJ-002/OBJ-003 carried forward. REQ-264 added (derivation + guard). All 264 acceptance criteria (REQ-001–REQ-264) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA M35 Auth Scheme Index Verification (turn_1192bec565305f72, run_0b373a30d182816a, 2026-04-26)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (26 scenarios)`. `node bin/tusq.js help` → exit 0, 19 commands (init, scan, manifest, compile, serve, review, docs, approve, auth, diff, domain, effect, method, policy, redaction, sensitivity, surface, version, help) with `auth` between `approve` and `diff`. `node bin/tusq.js auth index --help` → exit 0; includes planning-aid framing (`This is a planning aid, not a runtime authentication enforcer or OAuth/OIDC/SAML/SOC2 compliance certifier.`); bucket iteration order `bearer → api_key → session → basic → oauth → none → unknown`. `node bin/tusq.js auth index --scheme BEARER --manifest tests/fixtures/express-sample/tusq.manifest.json` → exit 1, stderr `Unknown auth scheme: BEARER`, empty stdout (case-sensitive lowercase enforcement confirmed). `node bin/tusq.js auth index --manifest tests/fixtures/express-sample/tusq.manifest.json --json` → exit 0, valid `schemes[]` with `unknown` bucket (3 capabilities, all 8 per-bucket fields). `git diff --quiet HEAD -- package.json package-lock.json` → exit 0 (zero dependency drift). `git diff --quiet HEAD -- src/ bin/ tests/ website/ package.json package-lock.json` → exit 0 (zero source drift). Dev turn (turn_e2b7cb50cd77d1d5) implemented M35 across nine dev-owned files: `src/cli.js` (AUTH_SCHEME_INDEX_AGGREGATION_KEY_ENUM frozen two-value Set [scheme,unknown], AUTH_SCHEME_INDEX_BUCKET_ORDER frozen array ['bearer','api_key','session','basic','oauth','none'], cmdAuth enumerator, cmdAuthIndex main handler with detection-before-output and --out .tusq/ rejection and --scheme case-sensitive lowercase filter, parseAuthIndexArgs 4-flag parser, _guardAuthSchemeBucketKey synchronous throw on out-of-seven-value-set, _guardAuthAggregationKey synchronous throw on out-of-two-value-set, buildAuthIndex closed-enum ordering with unknown appended last and empty buckets omitted and all 8 per-bucket fields with has_restricted_or_confidential_sensitivity derived from sensitivity_class===restricted||confidential, formatAuthIndex human output with planning-aid callout), `tests/smoke.mjs` (M35 assertions cases a-u plus edge cases), `tests/evals/governed-cli-scenarios.json` (auth-scheme-index-determinism, eval count 25→26; expected_scheme_order 'bearer,api_key,none,unknown' — session/basic/oauth absent because no fixture capability uses them, correctly testing empty-bucket omission), `tests/eval-regression.mjs` (runAuthSchemeIndexDeterminismScenario handler), `.planning/SYSTEM_SPEC.md` (§ M35 + Constraint 28), `.planning/command-surface.md` (§ M35 CLI Surface), `.planning/IMPLEMENTATION_NOTES.md`, `website/docs/cli-reference.md`, `website/docs/manifest-format.md`. PM turn (turn_d7fc926d1c177c66) correctly bound M35 under intake charter intent_1777242416896_42c9 with frozen seven-value `auth_scheme` bucket-key enum (bearer|api_key|session|basic|oauth|none|unknown — the full M29 AUTH_SCHEMES set, unknown inclusive), frozen two-value `aggregation_key` enum (scheme|unknown), closed-enum bucket iteration order (bearer→api_key→session→basic→oauth→none→unknown), per-bucket 8-field entry shape (auth_scheme, aggregation_key, capability_count, capabilities[], approved_count, gated_count, has_destructive_side_effect, has_restricted_or_confidential_sensitivity), case-sensitive lowercase-only --scheme filter, and six Key Risk rows. M35 closes its own flag-value coverage at REQ-260 (has_destructive_side_effect) and REQ-261 (has_restricted_or_confidential_sensitivity). OBJ-001 (medium, non-blocking) carried forward: R6 dead code. OBJ-002 (low, non-blocking) carried forward: surface-plan-determinism eval uses synthetic_capabilities. OBJ-003 (low, non-blocking) carried forward: M31 flag value assertion gap; M32/M33/M34/M35 close their own analogs. REQ-240–REQ-263 added to acceptance matrix (24 new M35 criteria). All 263 acceptance criteria (REQ-001–REQ-263) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA M34 Re-Verification No-Source-Change Cycle (turn_38cdeb85330f729b, run_9b4197b36f01ca42, 2026-04-26)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (25 scenarios)`. `node bin/tusq.js help` → exit 0, 18 commands (init, scan, manifest, compile, serve, review, docs, approve, diff, domain, effect, method, policy, redaction, sensitivity, surface, version, help) with `method` between `effect` and `policy`. `node bin/tusq.js method index --help` → exit 0; includes planning-aid framing and bucket iteration order `GET → POST → PUT → PATCH → DELETE → unknown`. `git diff --quiet HEAD -- src/ bin/ tests/ website/ package.json package-lock.json` → exit 0 (zero source drift). `git diff e63b515..HEAD --name-only` → `.planning/IMPLEMENTATION_NOTES.md` only. Dev turn (turn_de5362f531cf37b9) made zero source changes — only `.planning/IMPLEMENTATION_NOTES.md` modified. PM turn (turn_2ef90ba3bbd49667) correctly reconciled 20 M34 ROADMAP checkboxes as a stale-checkbox false positive from vision_scan (intent_1777241694258_a438, category roadmap_open_work_detected); M34 was fully shipped at V1.15 in run_bf8efb6b9c733000. This is the 8th recurrence of the stale-checkbox false-positive pattern (M28→M30→M31→M32→M33→M33-again→M34-again→M34-again-again). No new acceptance criteria required — no new scope shipped; REQ-001–REQ-239 remain complete and accurate coverage for the V1.15 (M1–M34) shipped boundary. OBJ-001 (medium, non-blocking) carried forward: R6 (`auth_required === false` → `auth_scheme: 'none'`) is dead code in the automated pipeline; implementation is correct for manually-edited manifests. OBJ-002 (low, non-blocking) carried forward: surface-plan-determinism eval uses synthetic_capabilities. OBJ-003 (low, non-blocking) carried forward: M31 per-domain flag value assertions not independently smoke-asserted; M32/M33/M34 close their own analogs. All 239 acceptance criteria (REQ-001–REQ-239) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA M34 HTTP Method Index Verification (turn_28b0298523d838a3, run_bf8efb6b9c733000, 2026-04-26)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (25 scenarios)`. `node bin/tusq.js help` → exit 0, 18 commands (init, scan, manifest, compile, serve, review, docs, approve, diff, domain, effect, method, policy, redaction, sensitivity, surface, version, help) with `method` between `effect` and `policy`. `node bin/tusq.js method index --help` → exit 0; includes `planning aid` framing (`This is a planning aid, not a runtime HTTP-method router, REST-convention validator, or idempotency classifier.`); bucket iteration order `GET → POST → PUT → PATCH → DELETE → unknown`. `git diff HEAD -- package.json package-lock.json` → empty (zero new dependencies). `node bin/tusq.js method index --method get --manifest tests/fixtures/express-sample/tusq.manifest.json` → exit 1, stderr `Unknown method: get`, empty stdout (case-sensitive uppercase enforcement confirmed). Default human index on express-sample fixture → exit 0 with [GET] and [POST] buckets; JSON mode → `methods[]` array with 8-field entries. Dev turn (turn_c530db27dd4d2941) implemented M34 across nine dev-owned files: `src/cli.js` (METHOD_INDEX_AGGREGATION_KEY_ENUM frozen two-value Set [method,unknown], METHOD_INDEX_BUCKET_ORDER frozen array ['GET','POST','PUT','PATCH','DELETE'], METHOD_INDEX_VALID_METHODS frozen Set of five canonical verbs, cmdMethod enumerator, cmdMethodIndex main handler with detection-before-output and --out .tusq/ rejection and --method case-sensitive filter, parseMethodIndexArgs 4-flag parser, _guardMethodBucketKey synchronous throw on out-of-six-value-set, _guardMethodAggregationKey synchronous throw on out-of-two-value-set, buildMethodIndex closed-enum ordering with unknown appended last and empty buckets omitted and all 8 per-bucket fields, formatMethodIndex human output with planning-aid callout), `tests/smoke.mjs` (M34 assertions cases a-u plus edge cases), `tests/evals/governed-cli-scenarios.json` (method-index-determinism, eval count 24→25; expected_method_order 'GET,POST,PATCH,DELETE,unknown' — PUT absent because no fixture capability has method: PUT), `tests/eval-regression.mjs` (runMethodIndexDeterminismScenario handler), `.planning/SYSTEM_SPEC.md` (§ M34 + Constraint 27), `.planning/command-surface.md` (§ M34 CLI Surface), `.planning/IMPLEMENTATION_NOTES.md`, `website/docs/cli-reference.md`, `website/docs/manifest-format.md`. PM turn (turn_8656b25a486eaa6d) correctly bound M34 under intake charter intent_1777239733034_e0fb with frozen five-value `http_method` enum (GET|POST|PUT|PATCH|DELETE) plus `unknown` zero-evidence catchall (six total), frozen two-value `aggregation_key` enum (method|unknown), closed-enum bucket iteration order (GET→POST→PUT→PATCH→DELETE→unknown), per-bucket 8-field entry shape, case-sensitive uppercase-only `--method` filter, and six Key Risk rows. M34 closes its own flag-value coverage at REQ-236 (has_destructive_side_effect) and REQ-237 (has_unknown_auth). OBJ-001 (medium, non-blocking) carried forward: R6 dead code. OBJ-002 (low, non-blocking) carried forward: surface-plan-determinism eval uses synthetic_capabilities. OBJ-003 (low, non-blocking) carried forward: M31 flag value assertion gap; M32/M33/M34 close their own analogs. REQ-216–REQ-239 added to acceptance matrix (24 new M34 criteria). All 239 acceptance criteria (REQ-001–REQ-239) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA M33 Re-Verification No-Source-Change Cycle (turn_a291b557e6bf6051, run_cd98cdad0fb83285, 2026-04-26)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (24 scenarios)`. `node bin/tusq.js help` → exit 0, 17 commands (init, scan, manifest, compile, serve, review, docs, approve, diff, domain, effect, policy, redaction, sensitivity, surface, version, help) with `sensitivity` between `redaction` and `surface`. `node bin/tusq.js sensitivity index --help` → exit 0; includes `planning aid` framing; bucket iteration order `public → internal → confidential → restricted → unknown`. `git diff HEAD -- src/ bin/ tests/ website/ package.json package-lock.json` → empty (zero source drift on HEAD 0f4ecaa). `git diff 753cf31..0f4ecaa --name-only` → `.planning/IMPLEMENTATION_NOTES.md`, `.planning/PM_SIGNOFF.md`, `.planning/ROADMAP.md`, `.planning/SYSTEM_SPEC.md`, `.planning/command-surface.md` only. Dev turn (turn_0e359b277c048d1f) made zero source changes — confirmed M33 (V1.14) shipped from run_4506c41d74e23e8e; only `.planning/IMPLEMENTATION_NOTES.md` modified by dev this run cycle. PM turn (turn_73d77d855d310a6c) reconciled 20 M33 ROADMAP checkboxes from `[ ]` to `[x]` as a stale-checkbox false positive from vision_scan (intent_1777238952808_4fd5, roadmap_open_work_detected). This is the sixth recurrence of the stale-checkbox pattern (M28→M30→M31→M32→M33→M33-again). No new scope shipped. OBJ-001 (medium, non-blocking) carried forward: R6 (`auth_required === false` → `auth_scheme: 'none'`) is dead code in the automated pipeline; implementation is correct for manually-edited manifests. OBJ-002 (low, non-blocking) carried forward: surface-plan-determinism eval uses synthetic_capabilities. OBJ-003 (low, non-blocking) carried forward: M31 flag value assertion gap non-blocking; M32/M33 close their own analogous flags at REQ-189/REQ-213/REQ-214. All 215 acceptance criteria (REQ-001–REQ-215) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA M33 Sensitivity Index Verification (turn_76e3bd05609910ce, run_4506c41d74e23e8e, 2026-04-26)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (24 scenarios)`. `node bin/tusq.js help` → exit 0, 17 commands (init, scan, manifest, compile, serve, review, docs, approve, diff, domain, effect, policy, redaction, sensitivity, surface, version, help) with `sensitivity` between `redaction` and `surface`. `node bin/tusq.js sensitivity index --help` → exit 0; includes `planning aid` framing; bucket iteration order `public → internal → confidential → restricted → unknown`. `git diff HEAD -- package.json package-lock.json` → empty (zero new dependencies). Dev turn (turn_42c7748a59fa5ef3) implemented M33 across nine dev-owned files: `src/cli.js` (SENSITIVITY_INDEX_AGGREGATION_KEY_ENUM frozen two-value Set [class,unknown], SENSITIVITY_INDEX_BUCKET_ORDER frozen array ['public','internal','confidential','restricted'], cmdSensitivity enumerator, cmdSensitivityIndex main handler with detection-before-output and --out .tusq/ rejection and --sensitivity filter using SENSITIVITY_CLASSES.includes() per M33 Key Risk, parseSensitivityIndexArgs 4-flag parser, _guardSensitivityBucketKey using SENSITIVITY_CLASSES.includes directly — M28 constant referenced with no independent enum redeclaration, _guardSensitivityAggregationKey, buildSensitivityIndex closed-enum ordering with unknown appended last and empty buckets omitted and all 8 per-bucket fields, formatSensitivityIndex human output with planning-aid callout), `tests/smoke.mjs` (21 M33 assertions cases a-u plus edge cases), `tests/evals/governed-cli-scenarios.json` (sensitivity-index-determinism, eval count 23→24), `tests/eval-regression.mjs` (runSensitivityIndexDeterminismScenario handler), `.planning/SYSTEM_SPEC.md` (§ M33 + Constraint 26), `.planning/command-surface.md` (§ M33 CLI Surface), `.planning/IMPLEMENTATION_NOTES.md`, `website/docs/cli-reference.md`, `website/docs/manifest-format.md`. PM turn (turn_8803f8edb25d1a0e) correctly bound M33 under intake charter intent_1777237013665_c189 with frozen five-value `sensitivity_class` enum aligned 1:1 to M28 SENSITIVITY_CLASSES (public|internal|confidential|restricted|unknown), frozen two-value `aggregation_key` enum (class|unknown), closed-enum iteration order (public→internal→confidential→restricted→unknown), per-bucket 8-field entry shape (sensitivity_class, aggregation_key, capability_count, capabilities[], approved_count, gated_count, has_destructive_side_effect, has_unknown_auth), and MUST-reference-M28-SENSITIVITY_CLASSES Key Risk (no independent enum redeclaration). M33 closes its own flag-value coverage (REQ-213: has_destructive_side_effect; REQ-214: has_unknown_auth) parallel to M32's REQ-189. OBJ-001 (medium, non-blocking) carried forward: R6 dead code. OBJ-002 (low, non-blocking) carried forward: surface-plan-determinism eval uses synthetic_capabilities. OBJ-003 (low, non-blocking) carried forward: M31 flag value assertion gap; M32/M33 close their own analogs. REQ-192–REQ-215 added to acceptance matrix (24 new M33 criteria). All 215 acceptance criteria (REQ-001–REQ-215) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA M32 Re-Verification No-Source-Change Cycle (turn_5ae9cd7ed8e985f1, run_7183d8c70482329b, 2026-04-26)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (23 scenarios)`. `node bin/tusq.js help` → exit 0, 16 commands (init, scan, manifest, compile, serve, review, docs, approve, diff, domain, effect, policy, redaction, surface, version, help) with `effect` between `domain` and `policy`. `node bin/tusq.js effect index --help` → exit 0; includes `planning aid` framing; bucket iteration order `read → write → destructive → unknown`. `git diff HEAD -- src/ bin/ tests/ website/ package.json package-lock.json` → empty (zero source drift on HEAD 0a38455). `git diff 5dca9a8..0a38455 --name-only` → `.planning/IMPLEMENTATION_NOTES.md` only. Dev turn (turn_02b2c0e4dceeead3) made zero source changes — confirmed M32 (V1.13) shipped from run_ae841429202c5bb7; only `.planning/IMPLEMENTATION_NOTES.md` modified this run cycle. PM turn (turn_f69f5083f63ad652) reconciled 20 M32 ROADMAP checkboxes from `[ ]` to `[x]` as a stale-checkbox false positive from vision_scan (intent_1777236173495_2303, roadmap_open_work_detected). This is the fifth recurrence of the stale-checkbox pattern (M28/M30/M31/M32/M32-again). No new scope shipped. OBJ-001 (medium, non-blocking) carried forward: R6 (`auth_required === false` → `auth_scheme: 'none'`) is dead code in the automated pipeline; implementation is correct for manually-edited manifests. OBJ-002 (low, non-blocking) carried forward: surface-plan-determinism eval uses synthetic_capabilities. OBJ-003 (low, non-blocking) carried forward: M31 flag value assertion gap non-blocking; M32 closes its own flags at REQ-189. All 191 acceptance criteria (REQ-001–REQ-191) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA M32 Effect Index Verification (turn_131a847ada2fad7c, run_ae841429202c5bb7, 2026-04-26)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (23 scenarios)`. `node bin/tusq.js help` → exit 0, 16 commands (init, scan, manifest, compile, serve, review, docs, approve, diff, domain, effect, policy, redaction, surface, version, help) with `effect` between `domain` and `policy`. `node bin/tusq.js effect index --help` → exit 0; includes `planning aid` framing; bucket iteration order `read → write → destructive → unknown`. `git diff HEAD -- package.json package-lock.json` → empty (zero new dependencies). Dev turn (turn_18e3b3d9ce515cf1) implemented M32 across nine dev-owned files: `src/cli.js` (EFFECT_INDEX_SIDE_EFFECT_CLASS_ENUM 4-value frozen Set [read,write,destructive,unknown], EFFECT_INDEX_AGGREGATION_KEY_ENUM 2-value frozen Set [class,unknown], EFFECT_INDEX_BUCKET_ORDER frozen array ['read','write','destructive'], cmdEffect enumerator, cmdEffectIndex main handler with detection-before-output and --out .tusq/ rejection and --effect filter with Unknown effect: error, parseEffectIndexArgs 4-flag parser, _guardEffectBucketKey, _guardEffectAggregationKey, buildEffectIndex closed-enum ordering with unknown appended last and empty buckets omitted and all 8 per-bucket fields, formatEffectIndex human output with planning-aid callout), `tests/smoke.mjs` (21 M32 assertions cases a-u plus edge cases), `tests/evals/governed-cli-scenarios.json` (effect-index-determinism, eval count 22→23), `tests/eval-regression.mjs` (runEffectIndexDeterminismScenario handler), `.planning/SYSTEM_SPEC.md` (§ M32 + Constraint 25), `.planning/command-surface.md` (§ M32 CLI Surface), `.planning/IMPLEMENTATION_NOTES.md`, `website/docs/cli-reference.md`, `website/docs/manifest-format.md`. PM turn (turn_b5d4f652077b62be) correctly bound M32 under intake charter intent_1777234191976_e06a with frozen four-value `side_effect_class` enum, frozen two-value `aggregation_key` enum, closed-enum iteration order (read→write→destructive, unknown appended last), per-bucket 8-field entry shape, and read-only invariants mirroring M30/M31. M32 additionally closes the OBJ-002-M31 flag-value coverage gap by explicitly asserting correct `has_restricted_or_confidential_sensitivity` and `has_unknown_auth` values per bucket (smoke cases t, u; REQ-189). OBJ-001 (medium, non-blocking) carried forward: R6 dead code. OBJ-002 (low, non-blocking) carried forward: surface-plan-determinism eval uses synthetic_capabilities. REQ-168–REQ-191 added to acceptance matrix (24 new M32 criteria). All 191 acceptance criteria (REQ-001–REQ-191) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA M31 Re-Verification No-Source-Change Cycle (turn_21e6a71b08014338, run_25308eabf162ba8b, 2026-04-26)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (22 scenarios)`. `node bin/tusq.js help` → exit 0, 15 commands (init, scan, manifest, compile, serve, review, docs, approve, diff, domain, policy, redaction, surface, version, help) with `domain` between `diff` and `policy`. `node bin/tusq.js domain index --help` → exit 0; includes `planning aid` framing. `git diff HEAD -- src/ bin/ tests/ website/ package.json package-lock.json` → empty (zero source drift on HEAD 8c80a26). `git diff 67d96ae..8c80a26 --name-only` → `.planning/IMPLEMENTATION_NOTES.md` only. Dev turn (turn_2a28545f82ce5e1b) made zero source changes — confirmed M31 (V1.12) shipped from run_e40832d436a42d75; only `.planning/IMPLEMENTATION_NOTES.md` modified this run cycle. PM turn (turn_cf57b41e62c05af6) reconciled 19 M31 ROADMAP checkboxes from `[ ]` to `[x]` as a stale-checkbox false positive from vision_scan (intent_1777233493634_b5f9, roadmap_open_work_detected). No new scope shipped. OBJ-001 (medium, non-blocking) carried forward: R6 (`auth_required === false` → `auth_scheme: 'none'`) is dead code in the automated pipeline; implementation is correct for manually-edited manifests. OBJ-001-M30 (low, non-blocking) carried forward: surface-plan-determinism eval uses synthetic_capabilities; scanned fixture variant deferred. OBJ-002-M31 (low, non-blocking) carried forward: flag value assertions (`has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`, `has_unknown_auth`) not independently smoke-asserted for correctness; determinism scenario covers stability but not specific counter values; deferred. All 167 acceptance criteria (REQ-001–REQ-167) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA M31 Domain Index Verification (turn_4125be3cf057395a, run_e40832d436a42d75, 2026-04-26)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (22 scenarios)`. `node bin/tusq.js help` → exit 0, 15 commands (init, scan, manifest, compile, serve, review, docs, approve, diff, domain, policy, redaction, surface, version, help) with `domain` between `diff` and `policy`. `node bin/tusq.js domain index --help` → exit 0; includes `planning aid` framing. `git diff HEAD -- package.json package-lock.json` → empty (zero new dependencies). Dev turn (turn_59bd0fdb1abd4a32) implemented M31 across nine dev-owned files: `src/cli.js` (DOMAIN_INDEX_AGGREGATION_KEY_ENUM frozen two-value Set, _guardAggregationKey synchronous throw guard, cmdDomain enumerator, cmdDomainIndex main handler with detection-before-output and --out .tusq/ rejection, parseDomainIndexArgs four-flag parser, buildDomainIndex first-appearance bucketing with unknown-appended-last, formatDomainIndex human output with planning-aid callout), `tests/smoke.mjs` (17 M31 assertions cases a-q), `tests/evals/governed-cli-scenarios.json` (domain-index-determinism, eval count 21→22), `tests/eval-regression.mjs` (runDomainIndexDeterminismScenario handler), `.planning/SYSTEM_SPEC.md` (§ M31 + Constraint 29), `.planning/command-surface.md` (§ M31 CLI Surface), `.planning/IMPLEMENTATION_NOTES.md`, `website/docs/cli-reference.md`, `website/docs/manifest-format.md`. PM turn (turn_104e8064c293ba9f) correctly bound M31 under intake charter intent_1777224728413_a063 with frozen two-value `aggregation_key` enum (`domain | unknown`), 8-field per-domain entry shape, manifest first-appearance ordering rule, empty-capabilities exit-0 rule, and read-only invariants mirroring M30. OBJ-001 (medium, non-blocking) carried forward: R6 dead code. OBJ-001-M30 (low, non-blocking) carried forward: synthetic_capabilities in surface-plan-determinism eval. OBJ-002-M31 (low, non-blocking) raised: flag value assertions (`has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`, `has_unknown_auth`) not independently asserted for correctness in smoke — only presence confirmed; determinism scenario covers stability but not specific counter values; deferred. REQ-146–REQ-167 added to acceptance matrix (22 new M31 criteria). All 167 acceptance criteria (REQ-001–REQ-167) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA M30 Re-Verification No-Source-Change Cycle (turn_98d87515fa014a92, run_7894753f9c47c8e3, 2026-04-26)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (21 scenarios)`. `node bin/tusq.js help` → exit 0, 14 commands (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, surface, version, help). `node bin/tusq.js surface plan --help` → exit 0; includes `planning aid` framing. `git diff HEAD -- src/ bin/ tests/ website/ package.json package-lock.json` → empty output (zero source drift on HEAD e67c9d5). Dev turn (turn_f766c529523ce892) made zero source changes — confirmed M30 (V1.11) shipped from run_24ccd92f593d8647; only `.planning/IMPLEMENTATION_NOTES.md` modified. PM turn (turn_b2926375e6189caf) reconciled 21 M30 ROADMAP checkboxes from `[ ]` to `[x]` as a stale-checkbox false positive from vision_scan (intent_1777223991256_bb53, roadmap_open_work_detected). No new scope shipped. OBJ-001 (medium, non-blocking) carried forward: R6 (`auth_required === false` → `auth_scheme: 'none'`) is dead code in the automated pipeline; implementation is correct for manually-edited manifests. OBJ-001-M30 (low, non-blocking) carried forward: surface-plan-determinism eval uses synthetic_capabilities; scanned fixture variant deferred. All 145 acceptance criteria (REQ-001–REQ-145) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA M30 Surface Plan Verification (turn_f95801133a76aecb, run_24ccd92f593d8647, 2026-04-26)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (21 scenarios)`. `node bin/tusq.js help` → exit 0, 14 commands (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, surface, version, help). `node bin/tusq.js surface plan --help` → exit 0; includes `planning aid` framing. `git diff HEAD --stat -- src/ bin/ website/ package.json package-lock.json` → empty (zero source drift on non-test files). Dev turn (turn_73dc44cfb9cef2c7) implemented M30 across five dev-owned files: `src/cli.js` (SURFACE_ENUM, GATED_REASON_ENUM, BRAND_INPUTS_REQUIRED, classifyGating, buildSurfacePlan, cmdSurface/cmdSurfacePlan, dispatch/printHelp/printCommandHelp wiring), `tests/smoke.mjs` (16 M30 assertions cases a-p plus guards), `tests/evals/governed-cli-scenarios.json` (surface-plan-determinism, scenario count 20→21), `tests/eval-regression.mjs` (runSurfacePlanDeterminismScenario handler), `.planning/IMPLEMENTATION_NOTES.md`. OBJ-001 (medium, non-blocking) carried forward: R6 dead code in automated pipeline. OBJ-001-M30 (low, non-blocking): surface-plan-determinism eval uses synthetic_capabilities — same pattern as M29; scanned fixture variant deferred to future QA. REQ-129–REQ-145 added to acceptance matrix (17 new M30 criteria). All 145 acceptance criteria (REQ-001–REQ-145) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).

## QA M29 R2-R5 Eval Coverage Verification (turn_0f67c476b8fd6477, run_3c9aac455742ac3e, 2026-04-26)

`npm test` → exit 0, `Smoke tests passed`, `Eval regression harness passed (20 scenarios)`. `node bin/tusq.js help` → exit 0, 13 commands (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help). `git diff HEAD --stat -- src/ bin/ website/ package.json package-lock.json` → empty (zero source drift). Dev turn (turn_4553eefe4fa30a21) added 4 M29 R2-R5 eval scenarios to `tests/evals/governed-cli-scenarios.json`: auth-scheme-api-key-r2-precedence (R2: apiKeyAuth → api_key), auth-scheme-session-r3-precedence (R3: sessionAuth → session), auth-scheme-basic-r4-precedence (R4: basicAuth → basic), auth-scheme-oauth-r5-precedence (R5: oauthMiddleware → oauth). Eval scenario count: 16 → 20. Zero source files changed; all new scenarios are additive eval coverage for M29 R2-R5 auth scheme classification rules. REQ-125–REQ-128 added to acceptance matrix. OBJ-001 (medium, non-blocking) carried forward: R6 (`auth_required === false` → `auth_scheme: 'none'`) is dead code in the automated pipeline; implementation is correct for manually-edited manifests. OBJ-002 (low, non-blocking): two unbound vision-derived charters in candidate backlog awaiting human binding. OBJ-003 (low, non-blocking): vision_scan stale-checkpoint false positives; operator-level filter configuration warranted. All 128 acceptance criteria (REQ-001–REQ-128) pass. Ship verdict: SHIP. Phase transition requested: launch (auto_approve policy).
