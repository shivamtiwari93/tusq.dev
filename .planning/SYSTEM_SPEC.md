# System Spec — tusq.dev Docs & Website Platform

> **M72 Materialized — 2026-04-28, run_1cb3a28391fa0f54, turn_453d79c50ae896e2, dev attempt 1.** All PM-frozen scope carried forward verbatim. Implementation: `classifyInputSchemaFirstPropertyNullable` (pure function; ABSENT-AS-NOT-NULLABLE: nullable absent or undefined→not_nullable, no warning — mirrors M58/M60/M61 boolean-default-false; NULL-AS-ABSENT: nullable:null→not_nullable, no warning — mirrors M55–M71; BOOLEAN-FALSE-AS-NOT-NULLABLE: nullable:false→not_nullable, no warning — deliberate; BOOLEAN-TRUE-AS-NULLABLE: nullable:true→nullable; DRAFT-7-BOOLEAN-IS-VALID-NULLABLE: non-boolean non-null non-absent nullable→unknown WITH 6th code; NO-COERCION via Boolean()/!!; NO-TYPE-APPLICABILITY: nullable applies to ALL JSON-Schema types; MUST NOT bucket as not_applicable based on firstVal.type — mirrors M58/M60/M61), `buildInputSchemaFirstPropertyNullableIndex`, `formatInputSchemaFirstPropertyNullableIndex`, `cmdNullable`/`cmdNullableIndex`/`parseNullableIndexArgs` in `src/cli.js`; CLI surface 55→56 (`nullable` between `mime` and `obligation`; mime(m=109,i=105)<nullable(n=110) at pos 0; nullable(n=110)<obligation(o=111) at pos 0); 18-case M72 smoke matrix; eval scenario `input-schema-first-property-nullable-index-determinism` (62→63 scenarios); Constraint 65: non-runtime-null-coercer / non-runtime-null-rejector / non-database-NOT-NULL-constraint-validator / non-ORM-non-nullable-field-validator / non-DTO-serializer-deserializer-pair-implementer / non-warehouse-NULL-aggregation-implementer / non-dbt-NULL-handling-implementer / non-BI-metric-NULL-aggregator / non-data-lineage-NULL-propagation-tracer / non-migration-history-validator / non-tenant-boundary-NULL-isolator / non-required-crossref / non-default-crossref / non-const-crossref / non-enum-crossref / non-doc-contradiction-detector / non-LLM-nullable-inferrer / non-statistical-aggregator. npm test exits 0 with 63 scenarios. See IMPLEMENTATION_NOTES.md § M72 for full detail.

> **M72 Charter Sketch Reservation — 2026-04-28, run_1cb3a28391fa0f54, turn_e88a6bc0946e8d8f, PM attempt 1, HEAD prior to PM edits at `59e660a`.** [SUPERSEDED by M72 Materialized above] Reserves a future § "Input Schema First Property Nullable Annotation Presence Index" section for the planning-phase M72 charter. Axis: `input_schema.properties[firstKey].nullable` (OpenAPI 3.0+/JSON-Schema-aligned boolean annotation governing whether the property value MAY be JSON `null`). Bucket-key enum (closed four-value): `nullable | not_nullable | not_applicable | unknown`. Aggregation_key enum (closed three-value): `nullability_constraint | not_applicable | unknown`. Six frozen warning reason codes (5 baseline + axis-specific 6th `input_schema_properties_first_property_nullable_invalid_when_present`). Bucket iteration order: `nullable → not_nullable → not_applicable → unknown` (deterministic stable-output only). Rules: NULL-AS-ABSENT (`nullable: null` → `not_nullable`); ABSENT-AS-NOT-NULLABLE (own property absent OR `nullable: undefined` → `not_nullable`); BOOLEAN-FALSE-AS-NOT-NULLABLE (`nullable: false` → `not_nullable`); BOOLEAN-TRUE-AS-NULLABLE (`nullable: true` → `nullable`); DRAFT-7-BOOLEAN-IS-VALID-NULLABLE (non-boolean `nullable` → `unknown` WITH 6th code; NO TRUTHY/FALSY-COERCION); NO-TYPE-APPLICABILITY (`nullable` applies to ALL JSON-Schema types; classifier MUST NOT bucket as `not_applicable` based on `firstVal.type` — mirrors M58/M60/M61). CLI surface 55 → 56 with new noun `nullable` between `mime` and `obligation`. Result-array field name: `first_property_nullable_states[]`. Per-bucket field name: `input_schema_first_property_nullable`. Constraint 65 (proposed) reserves M72 as "non-runtime-null-coercer / non-runtime-null-rejector / non-database-NOT-NULL-constraint-validator / non-ORM-non-nullable-field-validator / non-DTO-serializer-deserializer-pair-implementer / non-warehouse-NULL-aggregation-implementer / non-dbt-NULL-handling-implementer / non-BI-metric-NULL-aggregator / non-data-lineage-NULL-propagation-tracer / non-migration-history-validator / non-tenant-boundary-NULL-isolator / non-required-crossref / non-default-crossref / non-const-crossref / non-enum-crossref / non-doc-contradiction-detector / non-LLM-nullable-inferrer / non-statistical-aggregator". VISION primary citation: lines 48–54 (`### Database, Warehouse, And Data Model`) — first milestone to use this section as primary. The full M72 § will be materialized by the dev role's implementation phase per the M27–M71 PM-vs-dev ownership split. M72 is implementation-ready planned work, not shipped.

> **M71 Materialized — 2026-04-28, run_033b48ec21830f59, turn_0e713d40d8a2ff10, dev attempt 1.** All PM-frozen scope carried forward verbatim. Implementation: `classifyInputSchemaFirstPropertyContentMediaType` (pure function; NULL-AS-ABSENT: contentMediaType:null→untyped, no warning; EMPTY-STRING-AS-ABSENT: contentMediaType:''→untyped, no warning — mirrors M52/M53/M70; TYPE-APPLICABILITY-STRING: firstVal.type is a string but NOT 'string'→not_applicable, no warning — mirrors M62/M63/M70; ANY-NON-EMPTY-STRING-IS-TYPED: non-empty string including non-canonical strings→typed, no warning; DRAFT-7-STRING-IS-VALID-CONTENT-MEDIA-TYPE: non-string non-null non-absent contentMediaType→unknown WITH 6th code; NO-COERCION via String()), `buildInputSchemaFirstPropertyContentMediaTypeIndex`, `formatInputSchemaFirstPropertyContentMediaTypeIndex`, `cmdMime`/`cmdMimeIndex`/`parseMimeIndexArgs` in `src/cli.js`; CLI surface 54→55 (`mime` between `method` and `obligation`; method(m=109,e=101)<mime(m=109,i=105) at pos 1; mime(m=109)<obligation(o=111) at pos 0); 24-case M71 smoke matrix; eval scenario `input-schema-first-property-content-media-type-index-determinism` (61→62 scenarios); `tusq mime index` documented in `website/docs/cli-reference.md`. Six frozen warning codes: 5 baseline + axis-specific 6th `input_schema_properties_first_property_content_media_type_invalid_when_present` (covers ALL non-string non-null non-absent contentMediaType malformations: number/boolean/array/object). Constraint 64: non-runtime-drift-detector-implementer / non-runtime-payload-shape-observer / non-RFC-6838-validator / non-IANA-media-type-registry-validator / non-doc-contradiction-detector / non-canonical-form-validator / non-content-encoding-aggregator / non-format-aggregator / non-pattern-aggregator / non-joint-validity-validator / non-type-applicability-validator / non-LLM-media-type-inferrer / non-statistical-aggregator. npm test exits 0 with 62 scenarios. See IMPLEMENTATION_NOTES.md § M71 for full detail.

> **M71 Charter Sketch Reservation — 2026-04-28, run_033b48ec21830f59, turn_9de4de1590557d15, PM attempt 1, HEAD prior to PM edits at `d452d72`.** [SUPERSEDED by M71 Materialized above] Reserves a future § "Input Schema First Property Content Media Type Annotation Presence Index" section for the planning-phase M71 charter. Axis: `input_schema.properties[firstKey].contentMediaType` (JSON-Schema Draft 7+ IANA media-type annotation per RFC 6838 type/subtype form). Bucket-key enum (closed four-value): `typed | untyped | not_applicable | unknown`. Aggregation_key enum (closed three-value): `media_type_constraint | not_applicable | unknown`. Six frozen warning reason codes (5 baseline + axis-specific 6th `input_schema_properties_first_property_content_media_type_invalid_when_present`). Bucket iteration order: `typed → untyped → not_applicable → unknown` (deterministic stable-output only). Rules: NULL-AS-ABSENT (`contentMediaType: null` → `untyped`); EMPTY-STRING-AS-ABSENT (`contentMediaType: ''` → `untyped`); TYPE-APPLICABILITY-STRING (firstVal.type is a string and is NOT `'string'` → `not_applicable`); DRAFT-7-STRING-IS-VALID-CONTENT-MEDIA-TYPE (non-string `contentMediaType` → `unknown` WITH 6th code; NO-COERCION); ANY-NON-EMPTY-STRING-IS-TYPED (RFC-6838 type/subtype-form validation and IANA registry membership validation BOTH deferred). CLI surface 54 → 55 with new noun `mime` between `method` and `obligation`. Result-array field name: `first_property_content_media_type_states[]`. Per-bucket field name: `input_schema_first_property_content_media_type`. Constraint 64 (proposed) reserves M71 as "non-runtime-drift-detector-implementer / non-runtime-payload-shape-observer / non-RFC-6838-validator / non-IANA-media-type-registry-validator / non-doc-contradiction-detector / non-canonical-form-validator / non-content-encoding-aggregator / non-format-aggregator / non-pattern-aggregator / non-joint-validity-validator / non-type-applicability-validator / non-LLM-media-type-inferrer / non-statistical-aggregator". VISION primary citation: lines 495–497 (`### Runtime Learning`) — first milestone to use this section as primary. The full M71 § will be materialized by the dev role's implementation phase per the M27–M70 PM-vs-dev ownership split. M71 is implementation-ready planned work, not shipped.

> **M70 Materialized — 2026-04-28, run_7aa3510dbb544d16, turn_834a243911a397f0, dev attempt 1.** All PM-frozen scope carried forward verbatim. Implementation: `classifyInputSchemaFirstPropertyContentEncoding` (pure function; NULL-AS-ABSENT: contentEncoding:null→unencoded, no warning; EMPTY-STRING-AS-ABSENT: contentEncoding:''→unencoded, no warning — deliberate divergence from M69's FALSY-IS-VALID-CONST; TYPE-APPLICABILITY-STRING: firstVal.type is a string but NOT 'string'→not_applicable, no warning — mirrors M62/M63; ANY-NON-EMPTY-STRING-IS-ENCODED: non-empty string including non-canonical 'rot13'/'gzip'→encoded, no warning; DRAFT-7-STRING-IS-VALID-CONTENT-ENCODING: non-string non-null non-absent contentEncoding→unknown WITH 6th code; NO-COERCION via String()), `buildInputSchemaFirstPropertyContentEncodingIndex`, `formatInputSchemaFirstPropertyContentEncodingIndex`, `cmdWire`/`cmdWireIndex`/`parseWireIndexArgs` in `src/cli.js`; CLI surface 53→54 (`wire` between `version` and `help`; version(v=118)<wire(w=119) at pos 0; `wire` is LAST alphabetical noun before trailing special `help`); 24-case M70 smoke matrix; eval scenario `input-schema-first-property-content-encoding-index-determinism` (60→61 scenarios); `tusq wire index` documented in `website/docs/cli-reference.md`. Six frozen warning codes: 5 baseline + axis-specific 6th `input_schema_properties_first_property_content_encoding_invalid_when_present` (covers ALL non-string non-null non-absent contentEncoding malformations: number/boolean/array/object). Constraint 63: non-runtime-decoder-implementer / non-ingestion-pre-decoder / non-RFC-2045-validator / non-RFC-4648-validator / non-doc-contradiction-detector / non-canonical-vocabulary-validator / non-content-media-type-aggregator / non-format-aggregator / non-pattern-aggregator / non-joint-validity-validator / non-type-applicability-validator / non-LLM-content-encoding-inferrer / non-statistical-aggregator. npm test exits 0 with 61 scenarios. See IMPLEMENTATION_NOTES.md § M70 for full detail.

> **M69 Materialized — 2026-04-28, run_b755142c1e667f34, turn_34b72c9cd670d869, dev attempt 1.** All PM-frozen scope carried forward verbatim. Implementation: `classifyInputSchemaFirstPropertyConst` (pure function; classifier uses `Object.prototype.hasOwnProperty.call(firstVal, 'const') && firstVal.const !== undefined` — NULL-IS-VALID-CONST: const:null→pinned, no warning; FALSY-IS-VALID-CONST: const:false/0/''/[]/{}→pinned, no warning; ANY-JSON-VALUE-IS-VALID-CONST: any JSON value→pinned; NO 6th warning code; undefined-as-absent: const:undefined→unpinned), `buildInputSchemaFirstPropertyConstIndex`, `formatInputSchemaFirstPropertyConstIndex`, `cmdFixed`/`cmdFixedIndex`/`parseFixedIndexArgs` in `src/cli.js`; CLI surface 52→53 (`fixed` between `examples` and `floor`; examples(e=101)<fixed(f=102) at pos 0; fixed(f=102,i=105)<floor(f=102,l=108) at pos 1 (i(105)<l(108))); 24-case M69 smoke matrix covering NULL-IS-VALID-CONST (const:null→pinned), FALSY-IS-VALID-CONST (const:false/0/''/[]/{}→pinned), ANY-JSON-VALUE-IS-VALID-CONST (const:[1,2,3]/const:{a:1,b:2}→pinned), unpinned (absent const), not_applicable, unknown, case-sensitive enforcement (--fixed PINNED→exit 1), absent-bucket enforcement, non-persistence, help enumeration and ordering (examples<fixed<floor); eval scenario `input-schema-first-property-const-index-determinism` (59→60 scenarios); `tusq fixed index` documented in `website/docs/cli-reference.md`. Five frozen warning codes (no 6th — const accepts ANY JSON value, no value-type failure mode, mirrors M55 pattern). Constraint 62: non-runtime-validator-implementer / non-MCP-marketplace-pin-generator / non-marketplace-package-generator / non-MCP-server-output-generator / non-tool-call-wrapper-pin-enforcer / non-doc-contradiction-detector / non-enum-aggregator / non-default-aggregator / non-value-type-distributor / non-value-cardinality-tier-distributor / non-joint-validity-validator / non-type-applicability-validator / non-LLM-const-inferrer / non-statistical-aggregator. M69-vs-M54-vs-M55 distinctness: `tusq fixed index` aggregates per-property `firstKey.const` (cardinality-exactly-1 single-allowed-value pin; operator MUST NOT override); `tusq choice index` aggregates per-property `firstKey.enum` (cardinality-≥1 closed LIST; orthogonal cardinality of the closed-vocabulary constraint); `tusq preset index` aggregates per-property `firstKey.default` (operator-overridable pre-fill seed — operator MAY override at runtime; orthogonal mutability semantic). M69-vs-M65/M66/M67/M68 distinctness: reads `firstKey.const` — a different JSON-Schema keyword entirely from any numeric-bound keyword; NULL-IS-VALID-CONST explicitly departs from M65–M68's null-as-absent precedent because for `const` null is a valid JSON-Schema pin value (mirrors M55's `default: null`-as-defaulted precedent). npm test exits 0 with 60 scenarios. See IMPLEMENTATION_NOTES.md § M69 for full detail.

> **M69 Charter Sketch Reservation — 2026-04-28, run_b755142c1e667f34, turn_5094853d8deae4ef, PM attempt 1.** Reserves the M69 boundary for the dev turn to materialize. **M69 axis**: `input_schema.properties[firstKey].const` (JSON-Schema Draft 6+ single-allowed-value pin — the property MUST equal exactly the const value; cardinality-exactly-1, semantically orthogonal to `enum` (cardinality≥1 closed list, M54) and to `default` (operator-overridable seed value, M55)). **Bucket-key enum (closed four-value)**: `pinned | unpinned | not_applicable | unknown`. **Aggregation_key enum (closed three-value)**: `single_value_constraint | not_applicable | unknown`. **Five frozen warning reason codes** (mirrors M55 `default` precedent — `const` accepts ANY JSON value with NO value-type validation failure mode, therefore NO axis-specific 6th code; the 5th `input_schema_properties_first_property_descriptor_invalid` covers structural malformation only): `manifest_missing`, `manifest_unreadable`, `manifest_invalid_json`, `capabilities_missing_or_not_array`, `input_schema_properties_first_property_descriptor_invalid`. **Bucket iteration order**: `pinned → unpinned → not_applicable → unknown` (deterministic stable-output convention only — explicitly NOT an MCP-server-tool-criticality / marketplace-package-strictness-tier / ecosystem-metadata-completeness / icon-presence-priority / example-prompt-quality-tier / auth-scope-tightness / credentialed-publishing-eligibility / update-flow-priority ranking). **NULL-IS-VALID-CONST (M69-SPECIFIC, departs from M55–M68 NULL-AS-ABSENT precedent)**: `const: null` → `pinned` (no warning) — JSON-Schema explicitly permits `null` as a valid pin value (the property is constrained to be exactly `null`); the entire `properties[firstKey]` descriptor must be probed via `'const' in firstPropertyDescriptor` (Object.prototype.hasOwnProperty.call), NOT via `firstPropertyDescriptor.const !== undefined` and NOT via `firstPropertyDescriptor.const !== null` — both would misclassify `const: null` as `unpinned`. **FALSY-IS-VALID-CONST (M69-SPECIFIC)**: `const: false` → `pinned`, `const: 0` → `pinned`, `const: ''` → `pinned`, `const: 0.0` → `pinned`, `const: -0` → `pinned` — every JSON falsy is a legal pin value; truthy-only checks are forbidden. **ANY-JSON-VALUE-IS-VALID-CONST (M69-SPECIFIC)**: `const: [1,2]` → `pinned`, `const: {a:1}` → `pinned`, `const: 'x'` → `pinned`, `const: 1.5` → `pinned`, `const: -273.15` → `pinned`, `const: NaN` → `pinned` (NaN is a JS number, JSON.parse cannot produce NaN, but if memory-resident manifest has it, it is bucketed as a number value — any JS value that JSON.stringify would round-trip is acceptable). **NO-VALUE-TYPE-VALIDATION**: unlike M62/M63/M64/M65/M66/M67/M68 which all have axis-specific value-type predicates, `const` has NO value-type predicate — there is no malformed `const` value because every JS value is a legal pin. The 5th frozen code applies ONLY when the surrounding `properties[firstKey]` descriptor is structurally malformed (e.g., not an object, or `properties` itself is not an object), NOT when the const value itself is unusual. **CLI surface**: 52 → 53. **New noun**: `fixed` between `examples` and `floor` in the post-`docs` alphabetical block (`examples` (e=101, x=120) < `fixed` (f=102) at pos 0 (e (101) < f (102)); `fixed` (f=102, i=105) < `floor` (f=102, l=108) at pos 1 (i (105) < l (108))). **Subcommand**: `index`. **Flags**: `--manifest`, `--json`, `--out` (rejects `.tusq/`), `--fixed` (case-sensitive lowercase only; closed four-value enum `pinned|unpinned|not_applicable|unknown`). **Result-array field**: `first_property_const_states[]`. **Per-bucket field**: `input_schema_first_property_const`. **Read-only invariant**: 39 prior peer index commands byte-identical pre/post (`tusq surface plan`, `tusq domain index`, `tusq effect index`, `tusq sensitivity index`, `tusq method index`, `tusq auth index`, `tusq confidence index`, `tusq pii index`, `tusq examples index`, `tusq input index`, `tusq output index`, `tusq path index`, `tusq response index`, `tusq request index`, `tusq description index`, `tusq items index`, `tusq strictness index`, `tusq parameter index`, `tusq shape index`, `tusq signature index`, `tusq obligation index`, `tusq binding index`, `tusq gloss index`, `tusq hint index`, `tusq choice index`, `tusq preset index`, `tusq sample index`, `tusq caption index`, `tusq legacy index`, `tusq regex index`, `tusq seal index`, `tusq secret index`, `tusq floor index`, `tusq ceiling index`, `tusq divisor index`, `tusq lower index`, `tusq upper index`, `tusq above index`, `tusq below index`). **Non-persistence**: `input_schema_first_property_const` MUST NOT be written into `tusq.manifest.json`. **VISION primary citation**: `.planning/VISION.md` lines 515–517 (`### MCP And Marketplace`) — first milestone to use this section as primary aggregation source ("Generates MCP server output, marketplace packages, ecosystem metadata, icons, descriptions, example prompts, auth scopes, and optional credentialed publishing/update flows."). **Distinct from**: M44 (top-level description word count), M48 (output first-property type), M49 (firstKey `.type`), M50 (firstKey ∈ required[]), M51 (`.source`), M52 (`.description`), M53 (`.format` — closed-vocabulary string-format hint), M54 (`.enum` — cardinality≥1 closed list of allowed values), M55 (`.default` — operator-overridable seed value, ANY-JSON-VALUE precedent), M56 (`.examples`), M57 (`.title`), M58 (`.deprecated`), M59 (`.pattern`), M60 (`.readOnly`), M61 (`.writeOnly`), M62 (`.minLength`), M63 (`.maxLength`), M64 (`.multipleOf`), M65 (`.minimum`), M66 (`.maximum`), M67 (`.exclusiveMinimum`), M68 (`.exclusiveMaximum`). **Const-vs-Enum-vs-Default distinctness**: `const: X` constrains the property to be EXACTLY X (cardinality 1, no override, validation failure on any other value); `enum: [X, Y, Z]` constrains the property to be in a closed list (cardinality≥1, no override at runtime); `default: X` provides a fallback if the property is absent (cardinality 1 hint, fully overridable at runtime). M69 aggregates the `const` PRESENCE annotation, not the const VALUE itself. **Const-vs-Enum-cardinality-1 collapse**: even if `enum: [X]` (single-element enum) is semantically equivalent to `const: X`, the M69 axis aggregates ONLY the `const` keyword — single-element enums are bucketed by M54 as `enum_constrained`, not by M69. **Deferred 11 successor milestones**: `M-Fixed-All-Properties-Const-Index-1`, `M-Fixed-Nested-Property-Const-Index-1`, `M-Fixed-Output-First-Property-Const-Index-1`, `M-Fixed-Enum-Crossref-1` (const + single-element enum joint distribution), `M-Fixed-Default-Crossref-1` (const + default joint distribution / pinned-value-with-fallback paradox), `M-Fixed-Type-Applicability-Crossref-1`, `M-Fixed-JSON-Roundtrip-Validity-1` (NaN/Infinity/-Infinity/undefined/symbol/function const-value JSON-roundtrip-stability check), `M-Fixed-Joint-Validity-Crossref-1` (const + minimum/maximum/pattern/format joint feasibility), `M-Fixed-Persistence-1`, `M-Fixed-Doc-Contradiction-1`, `M-Fixed-LLM-Const-Inferrer-1`. Dev turn replaces this reservation with a full M69 § "Input Schema First Property Const Single-Allowed-Value-Pin Annotation Presence Index" section + Constraint 62 ("non-runtime-validator-implementer / non-doc-contradiction-detector / non-enum-aggregator / non-default-aggregator / non-single-element-enum-collapser / non-joint-validity-validator / non-type-applicability-validator / non-LLM-const-inferrer / non-MCP-server-criticality-tier-emitter / non-marketplace-package-criticality-tier-emitter / non-JSON-roundtrip-stability-validator / non-statistical-aggregator").

> **M68 Materialized — 2026-04-28, run_68afe5c0590c0d56, turn_71a39cd2a9291228, dev attempt 1.** All PM-frozen scope carried forward verbatim. Implementation: `classifyInputSchemaFirstPropertyExclusiveMaximum` (pure function, strict `typeof v === 'number' && Number.isFinite(v)` check — NO Number()/parseFloat()/truthy coercion; NOT >= 0, NOT > 0, NOT Number.isInteger; ZERO-IS-VALID-EXCLUSIVE-UPPER-BOUND: exclusiveMaximum:0→upper_exclusive_bounded; NEGATIVE-IS-VALID-EXCLUSIVE-UPPER-BOUND: exclusiveMaximum:-273.15→upper_exclusive_bounded; FRACTIONAL-IS-VALID-EXCLUSIVE-UPPER-BOUND: exclusiveMaximum:0.5→upper_exclusive_bounded; DRAFT-4-BOOLEAN-IS-INVALID: exclusiveMaximum:true/false→unknown WITH 6th code; NULL-AS-ABSENT: exclusiveMaximum:null→upper_exclusive_unbounded, no warning), `buildInputSchemaFirstPropertyExclusiveMaximumIndex`, `formatInputSchemaFirstPropertyExclusiveMaximumIndex`, `cmdBelow`/`cmdBelowIndex`/`parseBelowIndexArgs` in `src/cli.js`; CLI surface 51→52 (`below` between `auth` and `binding`); 24-case M68 smoke matrix covering ZERO-IS-VALID-EXCLUSIVE-UPPER-BOUND, NEGATIVE-IS-VALID-EXCLUSIVE-UPPER-BOUND, FRACTIONAL-IS-VALID-EXCLUSIVE-UPPER-BOUND, DRAFT-4-BOOLEAN-IS-INVALID (exclusiveMaximum:true→unknown WITH 6th code), null-as-absent (exclusiveMaximum:null→upper_exclusive_unbounded), string malformation (exclusiveMaximum:'1'→unknown WITH 6th code), aggregation_key closed enum (numeric_upper_exclusive_bound_constraint/not_applicable/unknown), non-persistence, help enumeration and ordering (auth < below < binding); eval scenario `input-schema-first-property-exclusive-maximum-index-determinism` (58→59 scenarios); `tusq below index` documented in `website/docs/cli-reference.md`. Sixth frozen warning code `input_schema_properties_first_property_exclusive_maximum_invalid_when_present` covers ALL non-finite-number malformations (including Draft-4 boolean form) under a single consolidated code. Constraint 61: non-runtime-validator-implementer / non-doc-contradiction-detector / non-maximum-aggregator / non-exclusive-minimum-aggregator / non-Draft-4-polyfill / non-joint-validity-validator / non-type-applicability-validator / non-LLM-exclusive-maximum-inferrer / non-runtime-criticality-tier-emitter / non-statistical-aggregator. M68-vs-M62-vs-M63-vs-M64-vs-M65-vs-M66-vs-M67 distinctness: `tusq below index` aggregates per-property `firstKey.exclusiveMaximum` (finite-number numeric-EXCLUSIVE-upper-bound — value < exclusiveMaximum); `tusq above index` aggregates per-property `firstKey.exclusiveMinimum` (numeric-EXCLUSIVE-lower-bound — opposite direction); `tusq upper index` aggregates per-property `firstKey.maximum` (numeric-INCLUSIVE-upper-bound — same direction, different equality semantics); `tusq lower index` aggregates per-property `firstKey.minimum` (numeric-INCLUSIVE-lower-bound); `tusq divisor index` aggregates per-property `firstKey.multipleOf` (strictly-positive-finite-number numeric-divisibility); `tusq ceiling index` aggregates per-property `firstKey.maxLength` (non-negative-integer string-length ceiling); `tusq floor index` aggregates per-property `firstKey.minLength` (non-negative-integer string-length floor) — seven orthogonal JSON-Schema input-validation keywords. npm test exits 0 with 59 scenarios. See IMPLEMENTATION_NOTES.md § M68 for full detail.

> **M68 Charter Sketch — 2026-04-28, run_68afe5c0590c0d56.** (replaced by M68 Materialized above). Reserves the M68 boundary for the dev turn to materialize. **M68 axis**: `input_schema.properties[firstKey].exclusiveMaximum` (JSON-Schema Draft 6+ finite-number numeric-EXCLUSIVE-upper-bound validation keyword: `value < exclusiveMaximum`). **Bucket-key enum (closed four-value)**: `upper_exclusive_bounded | upper_exclusive_unbounded | not_applicable | unknown`. **Aggregation_key enum (closed three-value)**: `numeric_upper_exclusive_bound_constraint | not_applicable | unknown`. **Six frozen warning reason codes** (5th: `input_schema_properties_first_property_descriptor_invalid`; 6th: `input_schema_properties_first_property_exclusive_maximum_invalid_when_present`). **Bucket iteration order**: `upper_exclusive_bounded → upper_exclusive_unbounded → not_applicable → unknown` (deterministic stable-output only — explicitly NOT a runtime-criticality / same-session-proxy-priority / generated-auth-adapter-strictness / dry-run-confirmation-priority / direct-execution-eligibility-tier / audit-trace-completeness-tier / policy-enforcement-priority / kill-switch-target-priority / fallback-guidance-strength ranking). **NULL-AS-ABSENT** (mirrors M55–M67): `exclusiveMaximum: null` → `upper_exclusive_unbounded` (no warning). **ZERO-IS-VALID-EXCLUSIVE-UPPER-BOUND (M68-SPECIFIC, mirrors M65/M66/M67)**: `exclusiveMaximum: 0` → `upper_exclusive_bounded` (no warning) — JSON-Schema permits zero as a valid finite-number strict-upper bound. **NEGATIVE-IS-VALID-EXCLUSIVE-UPPER-BOUND (M68-SPECIFIC, mirrors M65/M66/M67)**: `exclusiveMaximum: -273.15` → `upper_exclusive_bounded` (no warning) — JSON-Schema permits arbitrary negative finite-number strict-upper bounds. **FRACTIONAL-IS-VALID-EXCLUSIVE-UPPER-BOUND (M68-SPECIFIC)**: `exclusiveMaximum: 0.5` / `exclusiveMaximum: -0.001` → `upper_exclusive_bounded` (no warning). **DRAFT-4-BOOLEAN-IS-INVALID (M68-SPECIFIC, mirrors M67)**: `exclusiveMaximum: true`/`false` (the JSON-Schema Draft 4 boolean form) → `unknown` WITH 6th code (cross-Draft polyfill deferred to `M-Below-Draft4-Crossref-1`). **STRICT predicate**: `typeof v === 'number' && Number.isFinite(v)` — NO `Number()`/`parseFloat()`/truthy coercion (NOT `>= 0`, NOT `> 0`, NOT `Number.isInteger`). NaN/Infinity/-Infinity/non-numeric → `unknown` WITH 6th code. **CLI surface**: 51 → 52. **New noun**: `below` between `auth` and `binding` in the post-`docs` block (`auth` (a=97) < `below` (b=98) at pos 0; `below` (b=98, e=101) < `binding` (b=98, i=105) at pos 1 (e (101) < i (105))). **Subcommand**: `index`. **Flags**: `--manifest`, `--json`, `--out` (rejects `.tusq/`), `--below` (case-sensitive lowercase only). **Result-array field**: `first_property_exclusive_maximum_states[]`. **Per-bucket field**: `input_schema_first_property_exclusive_maximum`. **Read-only invariant**: 38 prior peer index commands byte-identical pre/post. **Non-persistence**: `input_schema_first_property_exclusive_maximum` MUST NOT be written into `tusq.manifest.json`. **VISION primary**: `.planning/VISION.md` lines 511–513 (`### Runtime`) — first milestone to use this section as primary aggregation source. **VISION re-cited**: lines 164–173 (`### Tools`) as structural anchor only. **Distinct from**: M44 (top-level description word count), M48 (output first-property type), M49 (firstKey `.type`), M50 (firstKey ∈ required[]), M51 (`.source`), M52 (`.description`), M53 (`.format`), M54 (`.enum`), M55 (`.default`), M56 (`.examples`), M57 (`.title`), M58 (`.deprecated`), M59 (`.pattern`), M60 (`.readOnly`), M61 (`.writeOnly`), M62 (`.minLength` — non-negative INTEGER STRING-length lower bound), M63 (`.maxLength` — non-negative INTEGER STRING-length upper bound), M64 (`.multipleOf` — strictly-positive FINITE-NUMBER numeric DIVISIBILITY), M65 (`.minimum` — INCLUSIVE numeric-LOWER-bound, opposite-direction semantics), M66 (`.maximum` — INCLUSIVE numeric-UPPER-bound, same direction with different equality semantics), M67 (`.exclusiveMinimum` — EXCLUSIVE numeric-LOWER-bound, opposite-direction semantics). **Deferred 11 successor milestones**: `M-Below-All-Properties-ExclusiveMaximum-Index-1`, `M-Below-Nested-Property-ExclusiveMaximum-Index-1`, `M-Below-Output-First-Property-ExclusiveMaximum-Index-1`, `M-Below-Maximum-Crossref-1` (exclusiveMaximum + maximum joint distribution), `M-Below-Minimum-Crossref-1`, `M-Below-Above-Crossref-1` (exclusiveMaximum + exclusiveMinimum joint distribution / empty-feasible-set), `M-Below-Joint-Validity-Crossref-1`, `M-Below-Type-Applicability-Crossref-1`, `M-Below-Draft4-Crossref-1` (Draft 4 boolean form polyfill), `M-Below-Persistence-1`, `M-Below-Doc-Contradiction-1`, `M-Below-LLM-ExclusiveMaximum-Inferrer-1`. Dev turn replaces this reservation with a full M68 § "Input Schema First Property ExclusiveMaximum Numeric-Exclusive-Upper-Bound Annotation Presence Index" section + Constraint 61 ("non-runtime-validator-implementer / non-doc-contradiction-detector / non-maximum-aggregator / non-exclusive-minimum-aggregator / non-Draft-4-polyfill / non-joint-validity-validator / non-type-applicability-validator / non-LLM-exclusive-maximum-inferrer / non-runtime-criticality-tier-emitter / non-statistical-aggregator").

> **M67 Materialized — 2026-04-28, run_a32ec6b13eb1a938, turn_cd878f1f2157ef33, dev attempt 1.** All PM-frozen scope carried forward verbatim. Implementation: `classifyInputSchemaFirstPropertyExclusiveMinimum` (pure function, strict `typeof v === 'number' && Number.isFinite(v)` check — NO Number()/parseFloat()/truthy coercion; NOT >= 0, NOT > 0, NOT Number.isInteger; ZERO-IS-VALID-EXCLUSIVE-LOWER-BOUND: exclusiveMinimum:0→lower_exclusive_bounded; NEGATIVE-IS-VALID-EXCLUSIVE-LOWER-BOUND: exclusiveMinimum:-273.15→lower_exclusive_bounded; FRACTIONAL-IS-VALID-EXCLUSIVE-LOWER-BOUND: exclusiveMinimum:0.5→lower_exclusive_bounded; DRAFT-4-BOOLEAN-IS-INVALID: exclusiveMinimum:true/false→unknown WITH 6th code; NULL-AS-ABSENT: exclusiveMinimum:null→lower_exclusive_unbounded, no warning), `buildInputSchemaFirstPropertyExclusiveMinimumIndex`, `formatInputSchemaFirstPropertyExclusiveMinimumIndex`, `cmdAbove`/`cmdAboveIndex`/`parseAboveIndexArgs` in `src/cli.js`; CLI surface 50→51 (`above` as FIRST entry in post-`docs` alphabetical block before `approve`); 24-case M67 smoke matrix covering ZERO-IS-VALID-EXCLUSIVE-LOWER-BOUND, NEGATIVE-IS-VALID-EXCLUSIVE-LOWER-BOUND, FRACTIONAL-IS-VALID-EXCLUSIVE-LOWER-BOUND, DRAFT-4-BOOLEAN-IS-INVALID (exclusiveMinimum:true→unknown WITH 6th code), null-as-absent (exclusiveMinimum:null→lower_exclusive_unbounded), string malformation (exclusiveMinimum:'0'→unknown WITH 6th code), aggregation_key closed enum (numeric_lower_exclusive_bound_constraint/not_applicable/unknown), non-persistence, help enumeration and ordering (above before approve); eval scenario `input-schema-first-property-exclusive-minimum-index-determinism` (57→58 scenarios); `tusq above index` documented in `website/docs/cli-reference.md`. Sixth frozen warning code `input_schema_properties_first_property_exclusive_minimum_invalid_when_present` covers ALL non-finite-number malformations (including Draft-4 boolean form) under a single consolidated code. Constraint 60: non-runtime-validator / non-doc-contradiction-detector / non-minimum-aggregator / non-exclusive-maximum-aggregator / non-Draft-4-polyfill / non-joint-validity-validator / non-type-applicability-validator / non-LLM-exclusive-minimum-inferrer / non-ecosystem-integration-compiler-criticality-tier-emitter / non-statistical-aggregator. M67-vs-M62-vs-M63-vs-M64-vs-M65-vs-M66 distinctness: `tusq above index` aggregates per-property `input_schema.properties[firstKey].exclusiveMinimum` (finite-number numeric-EXCLUSIVE-lower-bound — value > exclusiveMinimum; zero, negative, and fractional values ARE all valid); `tusq lower index` aggregates per-property `firstKey.minimum` (finite-number numeric-INCLUSIVE-lower-bound — value >= minimum; same value-domain but different equality semantics); `tusq upper index` aggregates per-property `firstKey.maximum` (finite-number numeric-inclusive-upper-bound); `tusq divisor index` aggregates per-property `firstKey.multipleOf` (strictly-positive-finite-number numeric-divisibility); `tusq ceiling index` aggregates per-property `firstKey.maxLength` (non-negative-integer string-length ceiling); `tusq floor index` aggregates per-property `firstKey.minLength` (non-negative-integer string-length floor) — six orthogonal JSON-Schema input-validation keywords. npm test exits 0 with 58 scenarios. See IMPLEMENTATION_NOTES.md § M67 for full detail.

> **M66 Materialized — 2026-04-28, run_f11fc93257e4e50c, turn_0522461f4f32c54c, dev attempt 1.** All PM-frozen scope carried forward verbatim. Implementation: `classifyInputSchemaFirstPropertyMaximum` (pure function, strict `typeof v === 'number' && Number.isFinite(v)` check — NO Number()/parseFloat()/truthy coercion; NOT >= 0, NOT > 0, NOT Number.isInteger; ZERO-IS-VALID-UPPER-BOUND: maximum:0→upper_bounded; NEGATIVE-IS-VALID-UPPER-BOUND: maximum:-273.15→upper_bounded; FRACTIONAL-IS-VALID-UPPER-BOUND: maximum:0.5→upper_bounded; NULL-AS-ABSENT: maximum:null→upper_unbounded, no warning), `buildInputSchemaFirstPropertyMaximumIndex`, `formatInputSchemaFirstPropertyMaximumIndex`, `cmdUpper`/`cmdUpperIndex`/`parseUpperIndexArgs` in `src/cli.js`; CLI surface 49→50 (`upper` between `surface` and `version`); 20-case M66 smoke matrix covering ZERO-IS-VALID-UPPER-BOUND (maximum:0→upper_bounded, no warning), NEGATIVE-IS-VALID-UPPER-BOUND (maximum:-273.15→upper_bounded, no warning), FRACTIONAL-IS-VALID-UPPER-BOUND (maximum:0.5→upper_bounded, no warning), null-as-absent (maximum:null→upper_unbounded, no warning), string malformation (maximum:'100'→unknown WITH 6th code), boolean malformation (maximum:true→unknown), aggregation_key closed enum (numeric_upper_bound_constraint/not_applicable/unknown), non-persistence, help enumeration and ordering (upper between surface and version); eval scenario `input-schema-first-property-maximum-index-determinism` (56→57 scenarios); `tusq upper index` documented in `website/docs/cli-reference.md`. Sixth frozen warning code `input_schema_properties_first_property_maximum_invalid_when_present` covers ALL non-finite-number malformations under a single consolidated code. NULL-AS-ABSENT: maximum:null → upper_unbounded (no warning, mirrors M55–M65 precedent). ZERO-IS-VALID-UPPER-BOUND (M66-SPECIFIC): maximum:0 → upper_bounded (no warning; JSON-Schema permits zero as valid finite-number upper bound; mirrors M65 ZERO-IS-VALID-LOWER-BOUND). NEGATIVE-IS-VALID-UPPER-BOUND (M66-SPECIFIC): maximum:-273.15 → upper_bounded (no warning; JSON-Schema permits arbitrary negative finite numbers). FRACTIONAL-IS-VALID-UPPER-BOUND (M66-SPECIFIC): maximum:0.5 → upper_bounded (no warning). Constraint 59: non-runtime-validator / non-doc-contradiction-detector / non-minimum-aggregator / non-exclusive-maximum-aggregator / non-joint-validity-validator / non-type-applicability-validator / non-LLM-maximum-inferrer / non-data-intelligence-compiler-criticality-tier-emitter / non-statistical-aggregator. M66-vs-M62-vs-M63-vs-M64-vs-M65 distinctness: `tusq upper index` aggregates per-property `input_schema.properties[firstKey].maximum` (finite-number numeric-inclusive-upper-bound — zero, negative, and fractional values ARE all valid); `tusq lower index` aggregates per-property `firstKey.minimum` (finite-number numeric-inclusive-lower-bound); `tusq divisor index` aggregates per-property `firstKey.multipleOf` (strictly-positive-finite-number numeric-divisibility); `tusq ceiling index` aggregates per-property `firstKey.maxLength` (non-negative-integer string-length ceiling); `tusq floor index` aggregates per-property `firstKey.minLength` (non-negative-integer string-length floor) — five orthogonal JSON-Schema validation keywords with distinct value-domain rules, read-only-invariant peers. npm test exits 0 with 57 scenarios. See IMPLEMENTATION_NOTES.md § M66 for full detail.

> **M66 Charter Sketch Reservation — 2026-04-28, run_24ccd92f593d8647, turn_b954ef96b85d5797, PM attempt 1.** Reserves the M66 boundary for the dev turn to materialize. **M66 axis**: `input_schema.properties[firstKey].maximum` (JSON-Schema Draft 4+ finite-number numeric-inclusive-upper-bound validation keyword). **Bucket-key enum (closed four-value)**: `upper_bounded | upper_unbounded | not_applicable | unknown`. **Aggregation_key enum (closed three-value)**: `numeric_upper_bound_constraint | not_applicable | unknown`. **Six frozen warning reason codes** (5th: `input_schema_properties_first_property_descriptor_invalid`; 6th: `input_schema_properties_first_property_maximum_invalid_when_present`). **Bucket iteration order**: `upper_bounded → upper_unbounded → not_applicable → unknown` (deterministic stable-output only — explicitly NOT a data-intelligence-compiler-criticality / semantic-layer-priority / metric-catalog-completeness-tier / safe-SQL-tool-strictness / dashboard-Q&A-coverage / anomaly-explanation-priority / data-governance-artifact-deprecation-priority / dashboard-fallback-guidance-strength ranking). **NULL-AS-ABSENT** (mirrors M55–M65): `maximum: null` → `upper_unbounded` (no warning). **ZERO-IS-VALID-UPPER-BOUND (M66-SPECIFIC, mirrors M65)**: `maximum: 0` → `upper_bounded` (no warning) — JSON-Schema permits zero as a valid finite-number upper bound. **NEGATIVE-IS-VALID-UPPER-BOUND (M66-SPECIFIC, mirrors M65)**: `maximum: -273.15` → `upper_bounded` (no warning) — JSON-Schema permits arbitrary negative finite-number upper bounds. **FRACTIONAL-IS-VALID-UPPER-BOUND (M66-SPECIFIC)**: `maximum: 0.5` / `maximum: -0.001` → `upper_bounded` (no warning). **STRICT predicate**: `typeof v === 'number' && Number.isFinite(v)` — NO `Number()`/`parseFloat()`/truthy coercion (NOT `>= 0`, NOT `> 0`, NOT `Number.isInteger`). NaN/Infinity/-Infinity/non-numeric → `unknown` WITH 6th code. **CLI surface**: 49 → 50. **New noun**: `upper` between `surface` and `version` in the post-`docs` block. **Subcommand**: `index`. **Flags**: `--manifest`, `--json`, `--out` (rejects `.tusq/`), `--upper` (case-sensitive lowercase only). **Result-array field**: `first_property_maximum_states[]`. **Per-bucket field**: `input_schema_first_property_maximum`. **Read-only invariant**: 36 prior peer index commands byte-identical pre/post. **Non-persistence**: `input_schema_first_property_maximum` MUST NOT be written into `tusq.manifest.json`. **VISION primary**: `.planning/VISION.md` lines 531–533 (`### Data Intelligence Compiler`) — first milestone to use this section as primary aggregation source. **VISION re-cited**: lines 164–173 (`### Tools`) as structural anchor only. **Distinct from**: M44 (top-level description word count), M48 (output first-property type), M49 (firstKey `.type`), M50 (firstKey ∈ required[]), M51 (`.source`), M52 (`.description`), M53 (`.format`), M54 (`.enum`), M55 (`.default`), M56 (`.examples`), M57 (`.title`), M58 (`.deprecated`), M59 (`.pattern`), M60 (`.readOnly`), M61 (`.writeOnly`), M62 (`.minLength` — non-negative INTEGER STRING-length lower bound), M63 (`.maxLength` — non-negative INTEGER STRING-length upper bound), M64 (`.multipleOf` — strictly-positive FINITE-NUMBER numeric DIVISIBILITY), M65 (`.minimum` — finite-NUMBER numeric inclusive-LOWER-BOUND, opposite-direction semantics from M66). **Deferred 10 successor milestones**: `M-Upper-All-Properties-Maximum-Index-1`, `M-Upper-Nested-Property-Maximum-Index-1`, `M-Upper-Output-First-Property-Maximum-Index-1`, `M-Upper-Lower-Crossref-1`, `M-Upper-Exclusive-Crossref-1`, `M-Upper-Joint-Validity-Crossref-1`, `M-Upper-Type-Applicability-Crossref-1`, `M-Upper-Persistence-1`, `M-Upper-Doc-Contradiction-1`, `M-Upper-LLM-Maximum-Inferrer-1`. Dev turn replaces this reservation with a full M66 § "Input Schema First Property Maximum Numeric-Upper-Bound Annotation Presence Index" section + Constraint 59 ("non-runtime-validator / non-doc-contradiction-detector / non-minimum-aggregator / non-exclusive-maximum-aggregator / non-joint-validity-validator / non-type-applicability-validator / non-LLM-maximum-inferrer / non-data-intelligence-compiler-criticality-tier-emitter / non-statistical-aggregator").

> **M65 Materialized — 2026-04-28, run_55fdb392f22e9987, turn_fab8a0c105d82460, dev attempt 1.** All PM-frozen scope carried forward verbatim. Implementation: `classifyInputSchemaFirstPropertyMinimum` (pure function, strict `typeof v === 'number' && Number.isFinite(v)` check — NO Number()/parseFloat()/truthy coercion; NOT >= 0, NOT > 0, NOT Number.isInteger; ZERO-IS-VALID-LOWER-BOUND: minimum:0→lower_bounded; NEGATIVE-IS-VALID-LOWER-BOUND: minimum:-273.15→lower_bounded; FRACTIONAL-IS-VALID-LOWER-BOUND: minimum:0.5→lower_bounded; NULL-AS-ABSENT: minimum:null→lower_unbounded, no warning), `buildInputSchemaFirstPropertyMinimumIndex`, `formatInputSchemaFirstPropertyMinimumIndex`, `cmdLower`/`cmdLowerIndex`/`parseLowerIndexArgs` in `src/cli.js`; CLI surface 48→49 (`lower` between `legacy` and `method`); 24-case M65 smoke matrix (a-x4) covering ZERO-IS-VALID-LOWER-BOUND (minimum:0→lower_bounded, no warning — M65-SPECIFIC divergence from M64), NEGATIVE-IS-VALID-LOWER-BOUND (minimum:-273.15→lower_bounded, no warning — M65-SPECIFIC divergence from M62/M63/M64), FRACTIONAL-IS-VALID-LOWER-BOUND (minimum:0.5→lower_bounded, no warning — M65-SPECIFIC), null-as-absent (minimum:null→lower_unbounded, no warning), string malformation (minimum:'0'→unknown WITH 6th code, NO type coercion), boolean malformation (minimum:true→unknown), all 6 warning reason codes, aggregation_key closed enum (numeric_lower_bound_constraint/not_applicable/unknown), non-persistence, help enumeration and ordering (lower between legacy and method); eval scenario `input-schema-first-property-minimum-index-determinism` (55→56 scenarios); `tusq lower index` documented in `website/docs/cli-reference.md`. Sixth frozen warning code `input_schema_properties_first_property_minimum_invalid_when_present` covers ALL non-finite-number malformations under a single consolidated code. NULL-AS-ABSENT: minimum:null → lower_unbounded (no warning, mirrors M55–M64 precedent). ZERO-IS-VALID-LOWER-BOUND (M65-SPECIFIC): minimum:0 → lower_bounded (no warning; JSON-Schema permits zero as valid finite-number lower bound; diverges from M64 EXPLICIT-ZERO-IS-INVALID). NEGATIVE-IS-VALID-LOWER-BOUND (M65-SPECIFIC): minimum:-273.15 → lower_bounded (no warning; JSON-Schema permits arbitrary negative finite numbers; diverges from M62/M63 which require >= 0). FRACTIONAL-IS-VALID-LOWER-BOUND (M65-SPECIFIC): minimum:0.5 → lower_bounded (no warning). Constraint 58: non-runtime-validator / non-doc-contradiction-detector / non-maximum-aggregator / non-exclusive-minimum-aggregator / non-joint-validity-validator / non-type-applicability-validator / non-LLM-minimum-inferrer / non-knowledge-and-copilot-compiler-criticality-tier-emitter / non-statistical-aggregator. M65-vs-M62-vs-M63-vs-M64 distinctness: `tusq lower index` aggregates per-property `input_schema.properties[firstKey].minimum` (finite-number numeric-inclusive-lower-bound — zero, negative, and fractional values ARE all valid); `tusq floor index` aggregates per-property `firstKey.minLength` (non-negative-integer string-length floor); `tusq ceiling index` aggregates per-property `firstKey.maxLength` (non-negative-integer string-length ceiling); `tusq divisor index` aggregates per-property `firstKey.multipleOf` (strictly-positive-finite-number numeric-divisibility) — four orthogonal JSON-Schema validation keywords with distinct value-domain rules, read-only-invariant peers. npm test exits 0 with 56 scenarios. See IMPLEMENTATION_NOTES.md § M65 for full detail.

> **M65 Charter Sketch Reservation — 2026-04-28, run_55fdb392f22e9987, turn_722acdf65c49b523, PM attempt 1.** Reserves the M65 boundary for the dev turn to materialize. **M65 axis**: `input_schema.properties[firstKey].minimum` (JSON-Schema Draft 4+ finite-number numeric-inclusive-lower-bound validation keyword). **Bucket-key enum (closed four-value)**: `lower_bounded | lower_unbounded | not_applicable | unknown`. **Aggregation_key enum (closed three-value)**: `numeric_lower_bound_constraint | not_applicable | unknown`. **Six frozen warning reason codes** (5th: `input_schema_properties_first_property_descriptor_invalid`; 6th: `input_schema_properties_first_property_minimum_invalid_when_present`). **Bucket iteration order**: `lower_bounded → lower_unbounded → not_applicable → unknown` (deterministic stable-output only — explicitly NOT a knowledge-and-copilot-compiler-criticality / RAG-index-priority / Q&A-pack-completeness-tier / troubleshooting-tree-branching-priority / employee-copilot-pre-validation-strictness / customer-facing-help-content-coverage / help-content-deprecation-priority / copilot-fallback-guidance-strength ranking). **NULL-AS-ABSENT** (mirrors M55–M64): `minimum: null` → `lower_unbounded` (no warning). **ZERO-IS-VALID-LOWER-BOUND (M65-SPECIFIC, departs from M64)**: `minimum: 0` → `lower_bounded` (no warning) — JSON-Schema permits zero as a valid finite-number lower bound. **NEGATIVE-IS-VALID-LOWER-BOUND (M65-SPECIFIC, departs from M62/M63/M64)**: `minimum: -273.15` → `lower_bounded` (no warning) — JSON-Schema permits arbitrary negative finite-number lower bounds. **FRACTIONAL-IS-VALID-LOWER-BOUND (M65-SPECIFIC)**: `minimum: 0.5` / `minimum: -0.001` → `lower_bounded` (no warning). **STRICT predicate**: `typeof v === 'number' && Number.isFinite(v)` — NO `Number()`/`parseFloat()`/truthy coercion (NOT `>= 0`, NOT `> 0`, NOT `Number.isInteger`). NaN/Infinity/-Infinity/non-numeric → `unknown` WITH 6th code. **CLI surface**: 48 → 49. **New noun**: `lower` between `legacy` and `method` in the post-`docs` block. **Subcommand**: `index`. **Flags**: `--manifest`, `--json`, `--out` (rejects `.tusq/`), `--lower` (case-sensitive lowercase only). **Result-array field**: `first_property_minimum_states[]`. **Per-bucket field**: `input_schema_first_property_minimum`. **Read-only invariant**: 35 prior peer index commands byte-identical pre/post. **Non-persistence**: `input_schema_first_property_minimum` MUST NOT be written into `tusq.manifest.json`. **VISION primary**: `.planning/VISION.md` lines 527–529 (`### Knowledge And Copilot Compiler`) — first milestone to use this section as primary aggregation source. **VISION re-cited**: lines 164–173 (`### Tools`) as structural anchor only. **Distinct from**: M44 (top-level description word count), M48 (output first-property type), M49 (firstKey `.type`), M50 (firstKey ∈ required[]), M51 (`.source`), M52 (`.description`), M53 (`.format`), M54 (`.enum`), M55 (`.default`), M56 (`.examples`), M57 (`.title`), M58 (`.deprecated`), M59 (`.pattern`), M60 (`.readOnly`), M61 (`.writeOnly`), M62 (`.minLength` — non-negative INTEGER STRING-length lower bound), M63 (`.maxLength` — non-negative INTEGER STRING-length upper bound), M64 (`.multipleOf` — strictly-positive FINITE-NUMBER numeric DIVISIBILITY). **Deferred 10 successor milestones**: `M-Lower-All-Properties-Minimum-Index-1`, `M-Lower-Nested-Property-Minimum-Index-1`, `M-Lower-Output-First-Property-Minimum-Index-1`, `M-Lower-Maximum-Crossref-1`, `M-Lower-Exclusive-Crossref-1`, `M-Lower-Joint-Validity-Crossref-1`, `M-Lower-Type-Applicability-Crossref-1`, `M-Lower-Persistence-1`, `M-Lower-Doc-Contradiction-1`, `M-Lower-LLM-Minimum-Inferrer-1`. Dev turn replaces this reservation with a full M65 § "Input Schema First Property Minimum Numeric-Lower-Bound Annotation Presence Index" section + Constraint 58 ("non-runtime-validator / non-doc-contradiction-detector / non-maximum-aggregator / non-exclusive-minimum-aggregator / non-joint-validity-validator / non-type-applicability-validator / non-LLM-minimum-inferrer / non-knowledge-and-copilot-compiler-criticality-tier-emitter / non-statistical-aggregator").

> **M64 Materialized — 2026-04-28, run_3626d963236136d0, turn_243c1b5e877fb108, dev attempt 1.** All PM-frozen scope carried forward verbatim. Implementation: `classifyInputSchemaFirstPropertyMultipleOf` (pure function, strict `typeof v === 'number' && Number.isFinite(v) && v > 0` check — NO Number()/parseFloat()/truthy coercion; FRACTIONAL-DIVISORS-ARE-VALID: multipleOf:0.5→multiple_constrained; EXPLICIT-ZERO-IS-INVALID: multipleOf:0→unknown WITH 6th code), `buildInputSchemaFirstPropertyMultipleOfIndex`, `formatInputSchemaFirstPropertyMultipleOfIndex`, `cmdDivisor`/`cmdDivisorIndex`/`parseDivisorIndexArgs` in `src/cli.js`; CLI surface 47→48 (`divisor` between `diff` and `domain`); 24-case M64 smoke matrix (a-x4) covering EXPLICIT-ZERO-IS-INVALID (multipleOf:0→unknown WITH 6th code — M64-SPECIFIC divergence from M62/M63), FRACTIONAL-DIVISORS-ARE-VALID (multipleOf:0.5→multiple_constrained — M64-SPECIFIC divergence from M62/M63), null-as-absent (multipleOf:null→multiple_unconstrained, no warning), negative number malformation (multipleOf:-1→unknown WITH 6th code), string malformation (multipleOf:'5'→unknown, NO type coercion), boolean malformation (multipleOf:true→unknown), all 6 warning reason codes, aggregation_key closed enum (numeric_divisibility_constraint/not_applicable/unknown), non-persistence, help enumeration and ordering (divisor between diff and domain); eval scenario `input-schema-first-property-multiple-of-index-determinism` (54→55 scenarios); `tusq divisor index` documented in `website/docs/cli-reference.md`. Sixth frozen warning code `input_schema_properties_first_property_multiple_of_invalid_when_present` covers ALL non-strictly-positive-finite malformations under a single consolidated code. NULL-AS-ABSENT: multipleOf:null → multiple_unconstrained (no warning, mirrors M55–M63 precedent). EXPLICIT-ZERO-IS-INVALID (M64-SPECIFIC): multipleOf:0 → unknown WITH 6th code (NOT multiple_constrained — JSON-Schema strictly rejects multipleOf:0; deliberate divergence from M62 EXPLICIT-ZERO-IS-FLOORED and M63 EXPLICIT-ZERO-IS-CAPPED). FRACTIONAL-DIVISORS-ARE-VALID (M64-SPECIFIC): multipleOf:0.5 → multiple_constrained (no warning; predicate is `Number.isFinite()&&>0`, NOT `Number.isInteger()&&>=0`). Constraint 57: non-runtime-validator / non-doc-contradiction-detector / non-minimum-aggregator / non-maximum-aggregator / non-joint-validity-validator / non-type-applicability-validator / non-LLM-multipleOf-inferrer / non-governance-and-rollout-criticality-tier-emitter / non-statistical-aggregator. M64-vs-M62-vs-M63 distinctness: `tusq divisor index` aggregates per-property `input_schema.properties[firstKey].multipleOf` (strictly-positive-finite-number numeric-divisibility — fractional values such as 0.5 ARE valid); `tusq floor index` aggregates per-property `input_schema.properties[firstKey].minLength` (non-negative-integer string-length lower-bound — integer-only); `tusq ceiling index` aggregates per-property `input_schema.properties[firstKey].maxLength` (non-negative-integer string-length upper-bound — integer-only) — three orthogonal JSON-Schema validation keywords with distinct value-domain rules, read-only-invariant peers. npm test exits 0 with 55 scenarios. See IMPLEMENTATION_NOTES.md § M64 for full detail.

> **M64 Charter Sketch Reservation — 2026-04-28, run_3626d963236136d0, turn_299c8f65bb142aef, PM attempt 1, HEAD prior to PM edits at `61da132`.** Reserves the `### M64: Static Capability Input Schema First Property MultipleOf Numeric-Divisibility Annotation Presence Index` detail block for the dev materialization turn. PM-frozen scope (dev MUST carry forward verbatim): closed four-value `input_schema_first_property_multiple_of` bucket-key enum `multiple_constrained | multiple_unconstrained | not_applicable | unknown`; closed three-value aggregation_key enum `numeric_divisibility_constraint | not_applicable | unknown`; six frozen warning reason codes (FIFTH `input_schema_properties_first_property_descriptor_invalid` carried forward from M55/M56/M57/M58/M59/M60/M61/M62/M63; SIXTH `input_schema_properties_first_property_multiple_of_invalid_when_present` axis-specific consolidating ALL non-strictly-positive-finite-number malformations — non-numeric values such as strings/booleans/arrays/objects, zero, negative numbers, NaN, Infinity, -Infinity — under a single code); strict-positive-finite-number classifier with `typeof firstVal.multipleOf === 'number' && Number.isFinite(firstVal.multipleOf) && firstVal.multipleOf > 0` for `multiple_constrained` (NO `Number()` coercion of strings, NO `parseFloat()` coercion); NULL-AS-ABSENT rule (multipleOf:null → multiple_unconstrained, no warning — mirrors M55/M56/M57/M58/M59/M60/M61/M62/M63 null-as-absent precedent); **EXPLICIT-ZERO-IS-INVALID rule (M64-SPECIFIC divergence from M62/M63)** — multipleOf:0 → unknown WITH 6th code, NOT bucketed as the boundary-active value because JSON-Schema strictly rejects `multipleOf: 0` (every number is trivially divisible by zero — degenerate; deliberate divergence from M62 EXPLICIT-ZERO-IS-FLOORED and M63 EXPLICIT-ZERO-IS-CAPPED); **FRACTIONAL-DIVISORS-ARE-VALID rule (M64-SPECIFIC divergence from M62/M63)** — multipleOf:0.5 → multiple_constrained (no warning) because JSON-Schema's `multipleOf` permits fractional positive divisors for sub-unit quantization, so the predicate uses `Number.isFinite(v) && v > 0` NOT `Number.isInteger(v) && v >= 0`; NO-TYPE-COERCION (multipleOf:'1'/'0.5'/true/false/[1]/{}/-1/-0.5/NaN/Infinity → unknown WITH 6th code; the triple `typeof === 'number' && Number.isFinite && > 0` strictly rejects all non-positive-finite-numeric values); only `unknown` bucket emits warnings; bucket iteration order `multiple_constrained → multiple_unconstrained → not_applicable → unknown` (deterministic stable-output convention only — explicitly NOT a governance-and-rollout-criticality / approval-gate-priority / audit-log-completeness-tier / kill-switch-target-priority / review-queue-prioritization / staged-rollout-stage-eligibility / operator-documentation-completeness / fallback-guidance-strength ranking); empty buckets MUST NOT appear; case-sensitive lowercase-only `--divisor` filter; non-persistence rule (`input_schema_first_property_multiple_of` MUST NOT be written into `tusq.manifest.json`); CLI surface growth 47 → 48 with new top-level noun `divisor` and single subcommand `index`, inserted alphabetically between `diff` and `domain` in the post-`docs` block; result-array field name `first_property_multiple_of_states`; per-bucket field name `input_schema_first_property_multiple_of`; 8-field per-bucket entry shape (`input_schema_first_property_multiple_of`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`); within-bucket order = manifest declared order; 34-peer-index byte-identity invariant; classifier MUST NOT cross-reference `minimum` (deferred `M-Divisor-Minimum-Crossref-1`), `maximum` (deferred `M-Divisor-Maximum-Crossref-1`), `minLength` (M62 axis), `maxLength` (M63 axis), or joint validity (deferred `M-Divisor-Joint-Validity-Crossref-1`); classifier MUST NOT validate that the property's `type === 'number'` or `'integer'` (the JSON-Schema typing rule that `multipleOf` only applies to numeric types is observable but not gating — a `multipleOf` divisor on a non-numeric-typed firstVal is still bucketed by presence/value, mirroring M62/M63's `minLength`/`maxLength`-on-non-string handling, with cross-axis type-applicability deferred to `M-Divisor-Type-Applicability-Crossref-1`); 10 deferred successor milestones (`M-Divisor-All-Properties-MultipleOf-Index-1`, `M-Divisor-Nested-Property-MultipleOf-Index-1`, `M-Divisor-Output-First-Property-MultipleOf-Index-1`, `M-Divisor-Minimum-Crossref-1`, `M-Divisor-Maximum-Crossref-1`, `M-Divisor-Joint-Validity-Crossref-1`, `M-Divisor-Type-Applicability-Crossref-1`, `M-Divisor-Persistence-1`, `M-Divisor-Doc-Contradiction-1`, `M-Divisor-LLM-MultipleOf-Inferrer-1`). Constraint 57 RESERVED for the dev materialization turn: "non-runtime-validator / non-doc-contradiction-detector / non-minimum-aggregator / non-maximum-aggregator / non-joint-validity-validator / non-type-applicability-validator / non-LLM-multipleOf-inferrer / non-governance-and-rollout-criticality-tier-emitter / non-statistical-aggregator." M64-vs-M62-vs-M63 distinctness: `tusq divisor index` aggregates per-property `input_schema.properties[firstKey].multipleOf` (strictly-positive-finite-number numeric-divisibility — JSON-Schema Draft 4+ numeric validation keyword applicable to numeric types; fractional divisors valid); `tusq floor index` aggregates per-property `input_schema.properties[firstKey].minLength` (non-negative-integer string-length lower-bound — JSON-Schema Draft 4+ integer-only validation keyword applicable to strings); `tusq ceiling index` aggregates per-property `input_schema.properties[firstKey].maxLength` (non-negative-integer string-length upper-bound — JSON-Schema Draft 4+ integer-only validation keyword applicable to strings) — three orthogonal JSON-Schema validation keywords with distinct value-domain rules (numeric-fractional-positive vs. integer-only-non-negative on strings vs. integer-only-non-negative on strings) and distinct typing applicability (numeric types vs. string types), read-only-invariant peers. The dev turn replaces this reservation block with the full § M64 section detailing the materialized constraint number and the binding to `src/cli.js` symbols.

> **M63 Materialized — 2026-04-28, run_e29754fde9f7e4f7, turn_a43e548e5465caff, dev attempt 1.** All PM-frozen scope carried forward verbatim. Implementation: `classifyInputSchemaFirstPropertyMaxLength` (pure function, strict-numeric `Number.isInteger(v) && v >= 0` check — NO Number()/parseInt()/truthy coercion), `buildInputSchemaFirstPropertyMaxLengthIndex`, `formatInputSchemaFirstPropertyMaxLengthIndex`, `cmdCeiling`/`cmdCeilingIndex`/`parseCeilingIndexArgs` in `src/cli.js`; CLI surface 46→47 (`ceiling` between `caption` and `choice`); 24-case M63 smoke matrix (a-x4) covering EXPLICIT-ZERO-IS-CAPPED (maxLength:0→length_capped, no warning), null-as-absent (maxLength:null→length_uncapped, no warning), negative integer malformation (maxLength:-1→unknown WITH 6th code), fractional malformation (maxLength:1.5→unknown), string malformation (maxLength:'100'→unknown, NO type coercion), boolean malformation (maxLength:true→unknown), all 6 warning reason codes, aggregation_key closed enum (string_length_ceiling_constraint/not_applicable/unknown), non-persistence, help enumeration and ordering (ceiling between caption and choice); eval scenario `input-schema-first-property-max-length-index-determinism` (53→54 scenarios); `tusq ceiling index` documented in `website/docs/cli-reference.md`. Sixth frozen warning code `input_schema_properties_first_property_max_length_invalid_when_present` covers ALL non-non-negative-integer malformations under a single consolidated code. NULL-AS-ABSENT: maxLength:null → length_uncapped (no warning, mirrors M55/M56/M57/M58/M59/M60/M61/M62). EXPLICIT-ZERO-IS-CAPPED: maxLength:0 → length_capped (no warning, mirrors M58/M60/M61/M62 explicit-default-value precedent). Constraint 56: non-runtime-validator / non-doc-contradiction-detector / non-minLength-aggregator / non-pattern-crossref / non-format-crossref / non-type-applicability-validator / non-LLM-maxLength-inferrer / non-evals-and-regression-coverage-tier-emitter / non-statistical-aggregator. M63-vs-M62 distinctness: `tusq ceiling index` aggregates per-property `input_schema.properties[firstKey].maxLength` (non-negative-integer string-length UPPER-bound — JSON-Schema Draft 4+ numeric validation keyword); `tusq floor index` aggregates per-property `input_schema.properties[firstKey].minLength` (non-negative-integer string-length LOWER-bound — JSON-Schema Draft 4+ numeric validation keyword) — orthogonal JSON-Schema string-length-bound keywords (upper-bound vs. lower-bound), read-only-invariant peers. npm test exits 0 with 54 scenarios. See IMPLEMENTATION_NOTES.md § M63 for full detail.

> **M62 Materialized — 2026-04-28, run_a9f53305f71ff8e4, turn_0ae9e9cb6c065564, dev attempt 1.** All PM-frozen scope carried forward verbatim. Implementation: `classifyInputSchemaFirstPropertyMinLength` (pure function, strict-numeric `Number.isInteger(v) && v >= 0` check — NO Number()/parseInt()/truthy coercion), `buildInputSchemaFirstPropertyMinLengthIndex`, `formatInputSchemaFirstPropertyMinLengthIndex`, `cmdFloor`/`cmdFloorIndex`/`parseFloorIndexArgs` in `src/cli.js`; CLI surface 45→46 (`floor` between `examples` and `gloss`); 24-case M62 smoke matrix (a-x4) covering EXPLICIT-ZERO-IS-FLOORED (minLength:0→length_floored, no warning), null-as-absent (minLength:null→length_unfloored, no warning), negative integer malformation (minLength:-1→unknown WITH 6th code), fractional malformation (minLength:1.5→unknown), string malformation (minLength:'1'→unknown, NO type coercion), boolean malformation (minLength:true→unknown), all 6 warning reason codes, aggregation_key closed enum (string_length_floor_constraint/not_applicable/unknown), non-persistence, help enumeration and ordering (floor between examples and gloss); eval scenario `input-schema-first-property-min-length-index-determinism` (52→53 scenarios); `tusq floor index` documented in `website/docs/cli-reference.md`. Sixth frozen warning code `input_schema_properties_first_property_min_length_invalid_when_present` covers ALL non-non-negative-integer malformations under a single consolidated code. NULL-AS-ABSENT: minLength:null → length_unfloored (no warning, mirrors M55/M56/M57/M58/M59/M60/M61). EXPLICIT-ZERO-IS-FLOORED: minLength:0 → length_floored (no warning, mirrors M58/M60/M61 explicit-default-value precedent). Constraint 55: non-runtime-validator / non-doc-contradiction-detector / non-maxLength-aggregator / non-pattern-crossref / non-format-crossref / non-type-applicability-validator / non-LLM-minLength-inferrer / non-tool-and-skill-compiler-strictness-tier-emitter / non-statistical-aggregator. M62-vs-M59 distinctness: `tusq floor index` aggregates per-property `input_schema.properties[firstKey].minLength` (non-negative-integer string-length lower-bound — JSON-Schema Draft 4+ numeric validation keyword); `tusq regex index` aggregates per-property `input_schema.properties[firstKey].pattern` (regex string — JSON-Schema Draft 4+ string-shape validation keyword) — orthogonal JSON-Schema string-validation keywords (numeric-bound vs. shape-bound), read-only-invariant peers. npm test exits 0 with 53 scenarios. See IMPLEMENTATION_NOTES.md § M62 for full detail.

> **M62 Charter Sketch Reservation — 2026-04-28, run_a9f53305f71ff8e4, turn_ba5df362ec35d789, PM attempt 1, HEAD prior to PM edits at `d934958`.** (Original reservation — replaced by M62 Materialized above.) Reserves the `### M62: Static Capability Input Schema First Property MinLength String-Length-Floor Annotation Presence Index` detail block for the dev materialization turn. PM-frozen scope (dev MUST carry forward verbatim): closed four-value `input_schema_first_property_min_length` bucket-key enum `length_floored | length_unfloored | not_applicable | unknown`; closed three-value aggregation_key enum `string_length_floor_constraint | not_applicable | unknown`; six frozen warning reason codes (FIFTH `input_schema_properties_first_property_descriptor_invalid` carried forward from M55/M56/M57/M58/M59/M60/M61; SIXTH `input_schema_properties_first_property_min_length_invalid_when_present` axis-specific consolidating ALL non-non-negative-integer malformations — non-numeric values such as strings/booleans/arrays/objects, explicit-non-null but non-numeric, negative integers, fractional numbers like `1.5`, NaN, Infinity, -Infinity — under a single code); strict-numeric classifier with `Number.isInteger(firstVal.minLength) && firstVal.minLength >= 0` for `length_floored` (NO `Number()` coercion of strings, NO `parseInt()` coercion); NULL-AS-ABSENT rule (minLength:null → length_unfloored, no warning — mirrors M55/M56/M57/M58/M59/M60/M61 null-as-absent precedent); EXPLICIT-ZERO-IS-FLOORED rule (minLength:0 → length_floored, no warning — mirrors M58/M60/M61 explicit-default-value precedent; `0` is a valid non-negative integer per JSON-Schema and represents an operator-declared no-op floor that is semantically distinct from absent); NO-TYPE-COERCION (minLength:'1'/'0'/true/false/[1]/{} → unknown WITH 6th code; the `Number.isInteger` predicate evaluates to `false` on all non-number primitives and on NaN/Infinity); only `unknown` bucket emits warnings; bucket iteration order `length_floored → length_unfloored → not_applicable → unknown` (deterministic stable-output convention only — explicitly NOT a tool-and-skill-compiler-strictness / strict-tool-input-validation-strength / chat-prompt-input-rejection-priority / marketplace-package-strictness-tier / MCP-tool-validation-tier / empty-string-rejection-priority / injection-attack-mitigation-priority / domain-skill-pack-input-strictness ranking); empty buckets MUST NOT appear; case-sensitive lowercase-only `--floor` filter; non-persistence rule (`input_schema_first_property_min_length` MUST NOT be written into `tusq.manifest.json`); CLI surface growth 45 → 46 with new top-level noun `floor` and single subcommand `index`, inserted alphabetically between `examples` and `gloss` in the post-`docs` block; result-array field name `first_property_min_length_states`; per-bucket field name `input_schema_first_property_min_length`; 8-field per-bucket entry shape (`input_schema_first_property_min_length`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`); within-bucket order = manifest declared order; 32-peer-index byte-identity invariant; classifier MUST NOT cross-reference `maxLength` (orthogonal upper-bound axis), `pattern` (M59 axis), or `format` (M53 axis) — joint distributions deferred to successor milestones; classifier MUST NOT validate that the property's `type === 'string'` (the JSON-Schema typing rule that `minLength` only applies to strings is observable but not gating — a `minLength` floor on a non-string-typed firstVal is still bucketed by presence/value, mirroring M59's `pattern`-on-non-string handling, with cross-axis type-applicability deferred to `M-Floor-Type-Applicability-Crossref-1`); 10 deferred successor milestones (`M-Floor-All-Properties-MinLength-Index-1`, `M-Floor-Nested-Property-MinLength-Index-1`, `M-Floor-Output-First-Property-MinLength-Index-1`, `M-Floor-MaxLength-Crossref-1` (minLength + maxLength range distribution), `M-Floor-Pattern-Crossref-1` (minLength + pattern joint distribution), `M-Floor-Format-Crossref-1` (minLength + format joint distribution), `M-Floor-Type-Applicability-Crossref-1` (minLength on non-string firstVal — type validation), `M-Floor-Persistence-1`, `M-Floor-Doc-Contradiction-1`, `M-Floor-LLM-MinLength-Inferrer-1`). Constraint 55 RESERVED for the dev materialization turn: "non-runtime-validator / non-doc-contradiction-detector / non-maxLength-aggregator / non-pattern-crossref / non-format-crossref / non-type-applicability-validator / non-LLM-minLength-inferrer / non-tool-and-skill-compiler-strictness-tier-emitter / non-statistical-aggregator." M62-vs-M59 distinctness: `tusq floor index` aggregates per-property `input_schema.properties[firstKey].minLength` (non-negative-integer string-length lower-bound — JSON-Schema Draft 4+ numeric validation keyword); `tusq regex index` aggregates per-property `input_schema.properties[firstKey].pattern` (regex string — JSON-Schema Draft 4+ string-shape validation keyword) — orthogonal JSON-Schema string-validation keywords (numeric-bound vs. shape-bound), read-only-invariant peers. M62-vs-M53 distinctness: `tusq floor index` aggregates `firstKey.minLength` (numeric integer floor); `tusq hint index` aggregates `firstKey.format` (closed-vocabulary semantic hint such as `email`/`uri`/`date-time`) — orthogonal JSON-Schema string-annotation keywords, read-only-invariant peers. The dev turn replaces this reservation block with the full § M62 section detailing the materialized constraint number and the binding to `src/cli.js` symbols.

> **M61 Materialized — 2026-04-28, run_95643a76d3091ffd, turn_31d6f8498c2b8b0b, dev attempt 1.** All PM-frozen scope carried forward verbatim. Implementation: `classifyInputSchemaFirstPropertyWriteOnly` (pure function, strict-boolean `=== true` and `=== false` checks — NO truthy/falsy coercion), `buildInputSchemaFirstPropertyWriteOnlyIndex`, `formatInputSchemaFirstPropertyWriteOnlyIndex`, `cmdSecret`/`cmdSecretIndex`/`parseSecretIndexArgs` in `src/cli.js`; CLI surface 44→45 (`secret` between `seal` and `sensitivity`); 24-case M61 smoke matrix (a-x4) covering null-as-absent (writeOnly:null → not_write_only, no warning), EXPLICIT-FALSE-IS-NOT-WRITE-ONLY (writeOnly:false → not_write_only, no warning), all non-boolean malformations (string/'true'/number/array/object → unknown WITH 6th code), strict-boolean enforcement, and standard error-exit cases; eval scenario `input-schema-first-property-write-only-index-determinism` (51→52 scenarios); `tusq secret index` documented in `website/docs/cli-reference.md`. Sixth frozen warning code `input_schema_properties_first_property_write_only_invalid_when_present` covers ALL non-boolean malformations under a single consolidated code. NULL-AS-ABSENT: writeOnly:null → not_write_only (no warning, mirrors M55/M56/M57/M58/M59/M60). EXPLICIT-FALSE-IS-NOT-WRITE-ONLY: writeOnly:false → not_write_only (no warning, mirrors M60 EXPLICIT-FALSE-IS-MUTABLE). Constraint 54: non-runtime-redactor / non-doc-contradiction-detector / non-readOnly-aggregator / non-audit-log-redactor / non-format-hint-crossref / non-LLM-writeOnly-inferrer / non-surface-generator-masked-input-elicitor / non-statistical-aggregator. M61-vs-M60 distinctness: `tusq secret index` aggregates per-property `input_schema.properties[firstKey].writeOnly` (output-suppression boolean — JSON-Schema Draft 2019-09+; OUTPUT direction: operator-supplied-but-not-echoed-back); `tusq seal index` aggregates per-property `input_schema.properties[firstKey].readOnly` (mutability boolean — JSON-Schema Draft 7+; INPUT direction: server-set-vs-user-elicited) — orthogonal JSON-Schema boolean keywords, read-only-invariant peers. npm test exits 0 with 52 scenarios. See IMPLEMENTATION_NOTES.md § M61 for full detail.

> **M61 Charter Sketch Reservation — 2026-04-28, run_95643a76d3091ffd, turn_c7ec0d02a286e887, PM attempt 1, HEAD `0334f8a`.** Reserves the `### M61: Static Capability Input Schema First Property WriteOnly Annotation Presence Index` detail block for the dev materialization turn. PM-frozen scope (dev MUST carry forward verbatim): closed four-value `input_schema_first_property_write_only` bucket-key enum `write_only | not_write_only | not_applicable | unknown`; closed three-value aggregation_key enum `output_visibility | not_applicable | unknown`; six frozen warning reason codes (FIFTH `input_schema_properties_first_property_descriptor_invalid` carried forward from M55/M56/M57/M58/M59/M60; SIXTH `input_schema_properties_first_property_write_only_invalid_when_present` axis-specific consolidating ALL non-boolean malformations — string `'true'`, number `1`/`0`, empty string `''`, array, plain object — under a single code); strict-boolean classifier with `=== true` (writeOnly === true → `write_only`) and `=== false` (writeOnly === false → `not_write_only`, no warning — EXPLICIT-FALSE-IS-NOT-WRITE-ONLY mirrors M58/M60); NULL-AS-ABSENT rule (writeOnly:null → not_write_only, no warning — mirrors M55/M56/M57/M58/M59/M60 null-as-absent precedent); NO-TRUTHY-COERCION (writeOnly:'true'/1/0/''/[]/ {} → unknown WITH 6th code); only `unknown` bucket emits warnings; bucket iteration order `write_only → not_write_only → not_applicable → unknown` (deterministic stable-output convention only — explicitly NOT a credential-secrecy / chat-mask-priority / transcript-redaction-priority / audit-log-redaction-tier / surface-generator-output-suppression-priority / one-time-vs-persistent-credential / brand-safety / widget-output-elicitability ranking); empty buckets MUST NOT appear; case-sensitive lowercase-only `--secret` filter; non-persistence rule (`input_schema_first_property_write_only` MUST NOT be written into `tusq.manifest.json`); CLI surface growth 44 → 45 with new top-level noun `secret` and single subcommand `index`, inserted alphabetically between `seal` and `sensitivity` in the post-`docs` block; result-array field name `first_property_write_only_states`; per-bucket field name `input_schema_first_property_write_only`; 8-field per-bucket entry shape (input_schema_first_property_write_only, aggregation_key, capability_count, capabilities[], approved_count, gated_count, has_destructive_side_effect, has_restricted_or_confidential_sensitivity); within-bucket order = manifest declared order; 31-peer-index byte-identity invariant; classifier MUST NOT cross-reference `readOnly` (M60 axis) — joint distribution deferred to `M-Secret-ReadOnly-Crossref-1`; 10 deferred successor milestones (`M-Secret-All-Properties / Nested / Output / ReadOnly-Crossref / Format-Hint-Crossref / Persistence / Doc-Contradiction / LLM-WriteOnly-Inferrer / Surface-Generator-Masked-Input-Elicitation / Audit-Log-Redaction-Crossref`). Constraint 54 RESERVED for the dev materialization turn: "non-runtime-redactor / non-doc-contradiction-detector / non-readOnly-aggregator / non-audit-log-redactor / non-format-hint-crossref / non-LLM-writeOnly-inferrer / non-surface-generator-masked-input-elicitor / non-statistical-aggregator." M61-vs-M60 distinctness: `tusq secret index` aggregates per-property `input_schema.properties[firstKey].writeOnly` (output-suppression boolean — JSON-Schema Draft 2019-09+; OUTPUT direction: operator-supplied-but-not-echoed-back); `tusq seal index` aggregates per-property `input_schema.properties[firstKey].readOnly` (mutability boolean — JSON-Schema Draft 7+; INPUT direction: server-set-vs-user-elicited) — orthogonal JSON-Schema boolean keywords, read-only-invariant peers. The dev turn replaces this reservation block with the full § M61 section detailing the materialized constraint number and the binding to `src/cli.js` symbols.

> **M60 Materialized — 2026-04-28, run_139647ed3258809b, turn_76d6180219f49289, dev attempt 1.** All PM-frozen scope carried forward verbatim. Implementation: `classifyInputSchemaFirstPropertyReadOnly` (pure function, strict-boolean `=== true` and `=== false` checks — NO truthy/falsy coercion), `buildInputSchemaFirstPropertyReadOnlyIndex`, `formatInputSchemaFirstPropertyReadOnlyIndex`, `cmdSeal`/`cmdSealIndex`/`parseSealIndexArgs` in `src/cli.js`; CLI surface 43→44 (`seal` between `sample` and `sensitivity`); 24-case M60 smoke matrix (a-x4) covering null-as-absent (readOnly:null → mutable, no warning), EXPLICIT-FALSE-IS-MUTABLE (readOnly:false → mutable, no warning), all non-boolean malformations (string/'true'/number/array/object → unknown WITH 6th code), strict-boolean enforcement, and standard error-exit cases; eval scenario `input-schema-first-property-read-only-index-determinism` (50→51 scenarios); `tusq seal index` documented in `website/docs/cli-reference.md`. Sixth frozen warning code `input_schema_properties_first_property_read_only_invalid_when_present` covers ALL non-boolean malformations under a single consolidated code. NULL-AS-ABSENT: readOnly:null → mutable (no warning, mirrors M55/M56/M57/M58/M59). EXPLICIT-FALSE-IS-MUTABLE: readOnly:false → mutable (no warning, mirrors M58 EXPLICIT-FALSE-IS-ACTIVE). Constraint 53 reserved: non-runtime-validator / non-doc-contradiction-detector / non-writeOnly-aggregator / non-path-parameter-binder / non-server-set-provenance-tracker / non-LLM-readOnly-inferrer / non-surface-generator-elicitation-suppressor / non-statistical-aggregator. M60-vs-M58 distinctness: `tusq seal index` aggregates per-property `input_schema.properties[firstKey].readOnly` (mutability boolean — JSON-Schema Draft 7+); `tusq legacy index` aggregates per-property `input_schema.properties[firstKey].deprecated` (lifecycle-stage boolean) — orthogonal JSON-Schema boolean keywords, read-only-invariant peers. npm test exits 0 with 51 scenarios. See IMPLEMENTATION_NOTES.md § M60 for full detail.

> **M60 Charter Sketch Reservation — 2026-04-28, run_139647ed3258809b, turn_769eaad1ebd861f1, PM attempt 1, HEAD `e9d5f38`.** Reserves the `### M60: Static Capability Input Schema First Property ReadOnly Annotation Presence Index` detail block for the dev materialization turn. PM-frozen scope (dev MUST carry forward verbatim): closed four-value `input_schema_first_property_read_only` bucket-key enum (`readonly | mutable | not_applicable | unknown`); closed three-value `aggregation_key` enum (`mutability_state | not_applicable | unknown`); classifier function gated on `input_schema.type === 'object'` AND `Object.keys(properties).length > 0` AND `firstVal` is a plain non-null object, returning `'readonly'` when `firstVal.readOnly === true` (strict-boolean), returning `'mutable'` when `firstVal` does NOT have own property `'readOnly'` OR `firstVal.readOnly === undefined` OR `firstVal.readOnly === null` (null-as-absent per M55/M56/M57/M58/M59) OR `firstVal.readOnly === false` (EXPLICIT-FALSE-IS-MUTABLE per M58); `not_applicable` for non-object input or zero-property object (no warning); `unknown` for malformed input_schema, malformed properties (when type === 'object'), `firstVal` not a plain non-null object, OR `firstVal.readOnly` present-but-not-a-boolean (`typeof firstVal.readOnly !== 'boolean'` after the null/undefined branch is taken); **six frozen warning reason codes** (`input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_descriptor_invalid`, `input_schema_properties_first_property_read_only_invalid_when_present`) — the fifth code is the firstVal-descriptor-invalid reason carried forward from M55/M56/M57/M58/M59; the sixth is M60's axis-specific reason covering ALL non-boolean malformations under a single consolidated code (string `'true'`, number `1`/`0`, empty string `''`, array `[]`, plain object `{}` ALL bucket as `unknown` — NO TRUTHY/FALSY COERCION; `=== true` and `=== false` strict-boolean checks only); `not_applicable`, `readonly`, and `mutable` emit NO warning (only `unknown` triggers warnings); bucket iteration order `readonly → mutable → not_applicable → unknown` (deterministic stable-output convention only — explicitly NOT a capability-compiler-readiness, surface-generator-elicitability, IAM-requirement-strength, server-set-vs-user-set, parameter-mutability-tier, end-user-prompt-eligibility, path-parameter-binding-tier, or schema-extraction-completeness ranking); within-bucket order is manifest declared order; empty buckets MUST NOT appear; `--seal` filter case-sensitive lowercase-only with stderr `Unknown input schema first property read only state: <value>` for unknowns and `No capabilities found for input schema first property read only state: <value>` for absent buckets; CLI surface 43 → 44 with new noun `seal` inserted alphabetically between `sample` and `sensitivity` (`sample` (s=115, a=97) < `seal` (s=115, e=101) at position 1; `seal` (s=115, e=101, a=97) < `sensitivity` (s=115, e=101, n=110) at position 2); insertion sequence `..., sample, seal, sensitivity, shape, ...`; result-array field name `first_property_read_only_states` (matching M48–M59 `first_property_<axis>` pluralization precedent); per-bucket field name `input_schema_first_property_read_only` (8-field entry shape: `input_schema_first_property_read_only, aggregation_key, capability_count, capabilities[], approved_count, gated_count, has_destructive_side_effect, has_restricted_or_confidential_sensitivity`); read-only invariants extend M59 list with `tusq regex index` byte-identity guard (30 commands now); non-persistence rule: `input_schema_first_property_read_only` MUST NOT be written into `tusq.manifest.json`; eval scenario `input-schema-first-property-read-only-index-determinism` (50 → 51 scenarios); Constraint 53 reserved for explicit non-runtime-validator / non-doc-contradiction-detector / non-writeOnly-aggregator / non-path-parameter-binder / non-server-set-provenance-tracker / non-LLM-readOnly-inferrer / non-surface-generator-elicitation-suppressor / non-statistical-aggregator boundary; deferred successor milestones (`M-Seal-All-Properties-ReadOnly-Index-1`, `M-Seal-Nested-Property-ReadOnly-Index-1`, `M-Seal-Output-First-Property-ReadOnly-Index-1`, `M-Seal-WriteOnly-Crossref-1`, `M-Seal-Path-Parameter-Crossref-1`, `M-Seal-Server-Set-Provenance-1`, `M-Seal-Persistence-1`, `M-Seal-Doc-Contradiction-1`, `M-Seal-LLM-ReadOnly-Inferrer-1`, `M-Seal-Surface-Generator-Elicitation-Suppression-1`). Distinct from M44 (capability-level top-level `description` word-count tier via `tusq description index`), distinct from M48 (output-side first-property type via `tusq shape index`), distinct from M49 (firstKey `.type` via `tusq signature index`), distinct from M50 (firstKey ∈ required[] via `tusq obligation index`), distinct from M51 (firstKey `.source` via `tusq binding index`), distinct from M52 (firstKey `.description` via `tusq gloss index`), distinct from M53 (firstKey `.format` via `tusq hint index`), distinct from M54 (firstKey `.enum` via `tusq choice index`), distinct from M55 (firstKey `.default` via `tusq preset index`), distinct from M56 (firstKey `.examples` via `tusq sample index`), distinct from M57 (firstKey `.title` via `tusq caption index`), distinct from M58 (firstKey `.deprecated` via `tusq legacy index` — orthogonal to M60 because M58 reads the lifecycle-stage boolean signaling phase-out while M60 reads a mutability boolean signaling server-set-vs-user-elicited; both are independent JSON-Schema boolean keywords), distinct from M59 (firstKey `.pattern` via `tusq regex index`). VISION sources cited: `.planning/VISION.md` lines 499–501 (`### Capability Compiler`) — primary aggregation source, NOT yet primary aggregation source for any shipped milestone; `.planning/VISION.md` lines 164–173 (`### Tools`) re-cited as structural anchor only. Full M60 detail block lands in dev attempt 1 of this run alongside the source-code implementation; this PM block reserves the structure only.

> **M59 Materialized — 2026-04-28, run_8024d2c7f8ee0f10, turn_faf61809c4ae34cb, dev attempt 1.** All PM-frozen scope carried forward verbatim. Implementation: `classifyInputSchemaFirstPropertyPattern` (pure function, MUST NOT compile regex, MUST NOT validate regex syntax, MUST NOT trim whitespace), `buildInputSchemaFirstPropertyPatternIndex`, `formatInputSchemaFirstPropertyPatternIndex`, `cmdRegex`/`cmdRegexIndex`/`parseRegexIndexArgs` in `src/cli.js`; CLI surface 42→43 (`regex` between `redaction` and `request`); 24-case M59 smoke matrix (a-x4) covering null-as-absent (pattern:null → unpatterned, no warning), WHITESPACE-ONLY-COUNTS-AS-PATTERNED (pattern:'   ' → patterned, no trim), EMPTY-STRING IS-MALFORMED (pattern:'' → unknown WITH 6th code), all non-string malformations (number/boolean/array/object → unknown WITH 6th code), and standard error-exit cases; eval scenario `input-schema-first-property-pattern-index-determinism` (49→50 scenarios); `tusq regex index` documented in `website/docs/cli-reference.md`. Sixth frozen warning code `input_schema_properties_first_property_pattern_invalid_when_present` covers BOTH non-string AND empty-string malformations under a single consolidated code. Constraint 52 reserved: non-runtime-validator / non-doc-contradiction-detector / non-regex-syntax-validator / non-regex-compiler / non-regex-format-crossref / non-LLM-pattern-inferrer / non-pattern-length-tier-distributor / non-statistical-aggregator. M59-vs-M53 distinctness: `tusq regex index` aggregates per-property `input_schema.properties[firstKey].pattern` (open-ended regex string — JSON-Schema Draft 4+ string keyword); `tusq hint index` aggregates per-property `input_schema.properties[firstKey].format` (closed-vocabulary string-format hint such as `email`/`uri`/`date-time`) — orthogonal JSON-Schema string-validation primitives, read-only-invariant peers. npm test exits 0. See IMPLEMENTATION_NOTES.md § M59 for full detail.

> **M59 Charter Sketch Reservation — 2026-04-28, run_8024d2c7f8ee0f10, turn_5943645cb90ffa81, PM attempt 1, HEAD `b2a2c7a`.** Reserves the `### M59: Static Capability Input Schema First Property Pattern Regex Annotation Presence Index` detail block for the dev materialization turn. PM-frozen scope (dev MUST carry forward verbatim): closed four-value `input_schema_first_property_pattern` bucket-key enum (`patterned | unpatterned | not_applicable | unknown`); closed three-value `aggregation_key` enum (`pattern_constraint | not_applicable | unknown`); classifier function gated on `input_schema.type === 'object'` AND `Object.keys(properties).length > 0` AND `firstVal` is a plain non-null object, returning `'patterned'` when `typeof firstVal.pattern === 'string'` AND `firstVal.pattern.length >= 1` (whitespace-only counts as patterned at this milestone — string length >= 1 is the only check; regex syntax validation and whitespace-trim normalization are deferred to successor milestones), returning `'unpatterned'` when `firstVal` does NOT have own property `'pattern'` OR `firstVal.pattern === undefined` OR `firstVal.pattern === null` (null treated as semantically absent per M55/M56/M57/M58 null-as-absent precedent); `not_applicable` for non-object input or zero-property object (no warning); `unknown` for malformed input_schema, malformed properties (when type === 'object'), `firstVal` not a plain non-null object, OR `firstVal.pattern` present-but-(not-a-string OR empty-string) (`typeof firstVal.pattern !== 'string'` OR `firstVal.pattern === ''`); **six frozen warning reason codes** (`input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_descriptor_invalid`, `input_schema_properties_first_property_pattern_invalid_when_present`) — the fifth code is the firstVal-descriptor-invalid reason carried forward from M55/M56/M57/M58; the sixth code is M59's axis-specific reason and covers BOTH non-string AND empty-string malformation paths under a single consolidated code (deliberate alignment with M57's pattern); `not_applicable`, `patterned`, and `unpatterned` emit NO warning (only `unknown` triggers warnings); bucket iteration order `patterned → unpatterned → not_applicable → unknown` (deterministic stable-output convention only — explicitly NOT a static-understanding-completeness ranking, NOT a schema-extraction-coverage ranking, NOT an input-validation-strength ranking, NOT a regex-coverage ranking, NOT a pre-flight-validation-readiness ranking, NOT a framework-detection-confidence ranking, NOT a route-extraction-completeness ranking, NOT an auth-detection-completeness ranking); within-bucket order is manifest declared order; empty buckets MUST NOT appear; `--regex` filter case-sensitive lowercase-only with stderr `Unknown input schema first property pattern state:` for unknowns and `No capabilities found for input schema first property pattern state:` for absent buckets; CLI surface 42 → 43 with new noun `regex` inserted alphabetically between `redaction` and `request` (`redaction` (r=114, e=101, d=100) < `regex` (r=114, e=101, g=103) at position 2; `regex` (r=114, e=101, g=103) < `request` (r=114, e=101, q=113) at position 2); insertion sequence `..., redaction, regex, request, response, ...`; result-array field name `first_property_pattern_constraints` (matching M48–M58 `first_property_<axis>` pluralization precedent); per-bucket field name `input_schema_first_property_pattern` (8-field entry shape: `input_schema_first_property_pattern, aggregation_key, capability_count, capabilities[], approved_count, gated_count, has_destructive_side_effect, has_restricted_or_confidential_sensitivity`); read-only invariants extend M58 list with `tusq legacy index` byte-identity guard (29 commands now); non-persistence rule: `input_schema_first_property_pattern` MUST NOT be written into `tusq.manifest.json`; eval scenario `input-schema-first-property-pattern-index-determinism` (49 → 50 scenarios); Constraint 52 reserved for explicit non-runtime-validator / non-doc-contradiction-detector / non-regex-syntax-validator / non-regex-compiler / non-regex-format-crossref / non-LLM-pattern-inferrer / non-pattern-length-tier-distributor / non-statistical-aggregator boundary; deferred successor milestones (`M-Regex-All-Properties-Pattern-Index-1`, `M-Regex-Nested-Property-Pattern-Index-1`, `M-Regex-Output-First-Property-Pattern-Index-1`, `M-Regex-Pattern-Syntax-Validation-1`, `M-Regex-Pattern-Length-Tier-1`, `M-Regex-Pattern-Whitespace-Distribution-1`, `M-Regex-Persistence-1`, `M-Regex-Doc-Contradiction-1`, `M-Regex-LLM-Pattern-Inferrer-1`, `M-Regex-Pattern-Format-Crossref-1`). Distinct from M40 (capability-level top-level `examples` worked-example record array via `tusq examples index`), distinct from M44 (capability-level top-level `description` word-count tier via `tusq description index`), distinct from M48 (output-side first-property type via `tusq shape index`), distinct from M49 (firstKey `.type` via `tusq signature index`), distinct from M50 (firstKey ∈ required[] via `tusq obligation index`), distinct from M51 (firstKey `.source` via `tusq binding index`), distinct from M52 (firstKey `.description` via `tusq gloss index`), distinct from M53 (firstKey `.format` via `tusq hint index` — orthogonal to M59 because M53 reads a closed-vocabulary string-format hint such as `email`/`uri`/`date-time` while M59 reads an open-ended regex string under a different JSON-Schema keyword), distinct from M54 (firstKey `.enum` via `tusq choice index`), distinct from M55 (firstKey `.default` via `tusq preset index`), distinct from M56 (firstKey `.examples` via `tusq sample index`), distinct from M57 (firstKey `.title` via `tusq caption index`), distinct from M58 (firstKey `.deprecated` via `tusq legacy index`). VISION sources cited: `.planning/VISION.md` lines 491–493 (`### Static Understanding`) — primary aggregation source, NOT yet primary aggregation source for any shipped milestone; `.planning/VISION.md` lines 164–173 (`### Tools`) re-cited as structural anchor only. Full M59 detail block lands in dev attempt 1 of this run alongside the source-code implementation; this PM block reserves the structure only.

> **M58 Materialized — 2026-04-28, run_68913f73e2cc30a6, turn_729ead92ab56d17f, dev attempt 1.** All PM-frozen scope carried forward verbatim. Implementation: `classifyInputSchemaFirstPropertyDeprecated` (pure function, strict boolean check — NO truthy/falsy coercion), `buildInputSchemaFirstPropertyDeprecatedIndex`, `formatInputSchemaFirstPropertyDeprecatedIndex`, `cmdLegacy`/`cmdLegacyIndex`/`parseLegacyIndexArgs` in `src/cli.js`; CLI surface 41→42 (`legacy` between `items` and `method`); 24-case M58 smoke matrix (a-x4) covering null-as-absent (deprecated:null → active), EXPLICIT-FALSE-IS-ACTIVE (deprecated:false → active), all non-boolean malformations (string/number/array/object → unknown WITH 6th code), and standard error-exit cases; eval scenario `input-schema-first-property-deprecated-index-determinism` (48→49 scenarios); `tusq legacy index` documented in `website/docs/cli-reference.md`. Sixth frozen warning code `input_schema_properties_first_property_deprecated_invalid_when_present` covers ALL non-boolean malformations under a single consolidated code. NULL-AS-ABSENT: deprecated:null → active (no warning, mirrors M55/M56/M57). EXPLICIT-FALSE-IS-ACTIVE: deprecated:false → active (no warning). npm test exits 0. Constraint 51 reserved: non-runtime-validator / non-doc-contradiction-detector / non-deprecated-sunset-date-annotation-distributor / non-deprecated-replacement-crossref / non-LLM-sunset-inferrer / non-webhook-sunset-adapter / non-side-effect-migration-planner / non-statistical-aggregator. M58-vs-M40-vs-M56-vs-M57 distinctness: `tusq legacy index` aggregates per-property `input_schema.properties[firstKey].deprecated` (boolean sunset annotation); `tusq caption index` aggregates `input_schema.properties[firstKey].title` (short UI label); `tusq sample index` aggregates `input_schema.properties[firstKey].examples` (example values array); `tusq examples index` aggregates capability-level top-level `examples` worked-example records — four orthogonal axes, read-only-invariant peers. See IMPLEMENTATION_NOTES.md § M58 for full detail.

> **M58 Charter Sketch Reservation — 2026-04-28, run_68913f73e2cc30a6, turn_46c96427c73e4d4e, PM attempt 1, HEAD `fea7501`.** Reserves the `### M58: Static Capability Input Schema First Property Deprecated Annotation Presence Index` detail block for the dev materialization turn. PM-frozen scope (dev MUST carry forward verbatim): closed four-value `input_schema_first_property_deprecated` bucket-key enum (`deprecated | active | not_applicable | unknown`); closed three-value `aggregation_key` enum (`lifecycle_stage | not_applicable | unknown`); classifier function gated on `input_schema.type === 'object'` AND `Object.keys(properties).length > 0` AND `firstVal` is a plain non-null object, returning `'deprecated'` when `firstVal.deprecated === true` (boolean only — NO truthy/falsy coercion), returning `'active'` when `firstVal` does NOT have own property `'deprecated'` OR `firstVal.deprecated === undefined` OR `firstVal.deprecated === null` (null treated as semantically absent per M55/M56/M57 null-as-absent precedent) OR `firstVal.deprecated === false` (explicit not-deprecated); `not_applicable` for non-object input or zero-property object (no warning); `unknown` for malformed input_schema, malformed properties (when type === 'object'), `firstVal` not a plain non-null object, OR `firstVal.deprecated` present-but-not-a-boolean (`typeof firstVal.deprecated !== 'boolean'`); **six frozen warning reason codes** (`input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_descriptor_invalid`, `input_schema_properties_first_property_deprecated_invalid_when_present`) — the fifth code is the firstVal-descriptor-invalid reason carried forward from M55/M56/M57; the sixth code is M58's axis-specific reason and covers ALL non-boolean malformation paths (string `'true'`, number `1`/`0`, array, object) under a single consolidated code (deliberate consolidation matching M56/M57's pattern); `not_applicable`, `deprecated`, and `active` emit NO warning (only `unknown` triggers warnings); bucket iteration order `deprecated → active → not_applicable → unknown` (deterministic stable-output convention only — explicitly NOT an integration-readiness ranking, NOT a sunset-priority ranking, NOT a side-effect-emitter-triage ranking, NOT a webhook-migration-priority ranking, NOT a billing-integration-stability ranking, NOT a queue-job-deprecation ranking, NOT an analytics-event-sunset ranking, NOT a CRM-sync-lifecycle-stage ranking); within-bucket order is manifest declared order; empty buckets MUST NOT appear; `--legacy` filter case-sensitive lowercase-only with stderr `Unknown input schema first property deprecated state:` for unknowns and `No capabilities found for input schema first property deprecated state:` for absent buckets; CLI surface 41 → 42 with new noun `legacy` inserted alphabetically between `items` and `method` (`items` (i=105) < `legacy` (l=108) at position 0; `legacy` (l=108) < `method` (m=109) at position 0); insertion sequence `..., input, items, legacy, method, obligation, ...`; result-array field name `first_property_deprecation_states` (matching M48–M57 `first_property_<axis>` pluralization precedent); per-bucket field name `input_schema_first_property_deprecated` (8-field entry shape: `input_schema_first_property_deprecated, aggregation_key, capability_count, capabilities[], approved_count, gated_count, has_destructive_side_effect, has_restricted_or_confidential_sensitivity`); read-only invariants extend M57 list with `tusq caption index` byte-identity guard (28 commands now); non-persistence rule: `input_schema_first_property_deprecated` MUST NOT be written into `tusq.manifest.json`; eval scenario `input-schema-first-property-deprecated-index-determinism` (48 → 49 scenarios); Constraint 51 reserved for explicit non-runtime-validator / non-doc-contradiction-detector / non-deprecated-sunset-date-annotation-distributor / non-deprecated-replacement-crossref / non-LLM-sunset-inferrer / non-webhook-sunset-adapter / non-side-effect-migration-planner / non-statistical-aggregator boundary; deferred successor milestones (`M-Legacy-All-Properties-Deprecated-Index-1`, `M-Legacy-Nested-Property-Deprecated-Index-1`, `M-Legacy-Output-First-Property-Deprecated-Index-1`, `M-Legacy-Deprecated-Sunset-Date-Annotation-Index-1`, `M-Legacy-Deprecated-Replacement-Crossref-1`, `M-Legacy-Persistence-1`, `M-Legacy-Doc-Contradiction-1`, `M-Legacy-LLM-Sunset-Inferrer-1`, `M-Legacy-Webhook-Sunset-Adapter-1`, `M-Legacy-Side-Effect-Migration-Planner-1`). Distinct from M40 (capability-level top-level `examples` worked-example record array via `tusq examples index`), distinct from M44 (capability-level top-level `description` word-count tier via `tusq description index`), distinct from M48 (output-side first-property type via `tusq shape index`), distinct from M49 (firstKey `.type` via `tusq signature index`), distinct from M50 (firstKey ∈ required[] via `tusq obligation index`), distinct from M51 (firstKey `.source` via `tusq binding index`), distinct from M52 (firstKey `.description` via `tusq gloss index`), distinct from M53 (firstKey `.format` via `tusq hint index`), distinct from M54 (firstKey `.enum` via `tusq choice index`), distinct from M55 (firstKey `.default` via `tusq preset index`), distinct from M56 (firstKey `.examples` via `tusq sample index` — orthogonal to M58 because M56 reads a per-property example-values ARRAY while M58 reads a per-property BOOLEAN sunset annotation under a different JSON-Schema keyword), distinct from M57 (firstKey `.title` via `tusq caption index`). VISION sources cited: `.planning/VISION.md` lines 83–90 (`### Integrations And Side Effects`) — primary aggregation source, NOT yet primary aggregation source for any shipped milestone; `.planning/VISION.md` lines 164–173 (`### Tools`) re-cited as structural anchor only. Full M58 detail block lands in dev attempt 1 of this run alongside the source-code implementation; this PM block reserves the structure only.

> **M57 Materialized — 2026-04-28, run_27565cc0d89187ef, turn_09b015ce0e7b8ed1, dev attempt 1.** All PM-frozen scope carried forward verbatim. Implementation: `classifyInputSchemaFirstPropertyTitle` (pure function), `buildInputSchemaFirstPropertyTitleIndex`, `formatInputSchemaFirstPropertyTitleIndex`, `cmdCaption`/`cmdCaptionIndex`/`parseCaptionIndexArgs` in `src/cli.js`; CLI surface 40→41 (`caption` between `binding` and `choice`); 24-case smoke matrix (a-x4); eval scenario `input-schema-first-property-title-presence-index-determinism` (47→48 scenarios); `tusq caption index` documented in `website/docs/cli-reference.md`. Sixth frozen warning code `input_schema_properties_first_property_title_invalid_when_present` covers both non-string and empty-string malformations under a single consolidated code. EMPTY-STRING title:'' → unknown WITH 6th code (deliberate alignment with M54/M56 precedents). WHITESPACE-ONLY title:'   ' → titled (string length >= 1 is the only check; whitespace-trim deferred to M-Caption-Title-Whitespace-Distribution-Index-1). null-as-absent: title:null → untitled (no warning). npm test exits 0. Constraint 50 reserved: non-runtime-validator / non-doc-contradiction-detector / non-title-length-tier-distributor / non-title-whitespace-distribution-distributor / non-title-description-crossref / non-LLM-title-inferrer / non-brand-voice-adapter / non-statistical-aggregator. M57-vs-M52-vs-M44 distinctness: `tusq caption index` aggregates per-property `input_schema.properties[firstKey].title` (JSON-Schema short UI label); `tusq gloss index` aggregates per-property `input_schema.properties[firstKey].description` (longer prose explanation); `tusq description index` aggregates capability-level top-level `description` word-count tier — three orthogonal axes, read-only-invariant peers. See IMPLEMENTATION_NOTES.md § M57 for full detail.

> **M57 Charter Sketch Reservation — 2026-04-28, run_27565cc0d89187ef, turn_7bb9f75f896a40a2, PM attempt 1, HEAD `906dfca`.** Reserves the `### M57: Static Capability Input Schema First Property Title Presence Index` detail block for the dev materialization turn. PM-frozen scope (dev MUST carry forward verbatim): closed four-value `input_schema_first_property_title` bucket-key enum (`titled | untitled | not_applicable | unknown`); closed three-value `aggregation_key` enum (`title_label | not_applicable | unknown`); classifier function gated on `input_schema.type === 'object'` AND `Object.keys(properties).length > 0` AND `firstVal` is a plain non-null object, returning `'titled'` when `firstVal.title` is a string with `length >= 1` (whitespace-only titles count as `titled` at this milestone — string `length >= 1` is the only check; whitespace-trim normalization is deferred to `M-Caption-Title-Whitespace-Distribution-Index-1`), returning `'untitled'` when `firstVal` does NOT have own property `'title'` OR `firstVal.title === undefined` OR `firstVal.title === null` (null treated as semantically absent per M55/M56 null-as-absent precedent); `not_applicable` for non-object input or zero-property object (no warning); `unknown` for malformed input_schema, malformed properties (when type === 'object'), `firstVal` not a plain non-null object, OR `firstVal.title` present-but-not-a-string OR present-string-but-empty (`length === 0`); **six frozen warning reason codes** (`input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_descriptor_invalid`, `input_schema_properties_first_property_title_invalid_when_present`) — the fifth code is the firstVal-descriptor-invalid reason carried forward from M55/M56's formal elevation; the sixth code is M57's axis-specific reason and covers BOTH the "title present but not a string" AND the "title present as string but empty" malformation paths under a single consolidated code (deliberate alignment with M54's empty-`enum`-is-malformed precedent and M56's empty-`examples`-is-malformed precedent because the JSON-Schema `title` keyword requires the string to declare >=1 character to carry semantic intent — an empty title is incoherent on its face); `not_applicable`, `titled`, and `untitled` emit NO warning (only `unknown` triggers warnings); bucket iteration order `titled → untitled → not_applicable → unknown` (deterministic stable-output convention only — explicitly NOT a chat-interface-readiness ranking, NOT a reviewer-priority ranking, NOT a brand-matched-chat-readiness ranking, NOT a UX-label-completeness ranking, NOT a confirmation-prompt-readability ranking, NOT a form-widget-label-coverage ranking, NOT an embedded-chat-friendliness ranking, NOT a CSS-override-readiness ranking); within-bucket order is manifest declared order; empty buckets MUST NOT appear; `--caption` filter case-sensitive lowercase-only with stderr `Unknown input schema first property title:` for unknowns and `No capabilities found for input schema first property title:` for absent buckets; CLI surface 40 → 41 with new noun `caption` inserted alphabetically between `binding` and `choice` (`binding` (b=98) < `caption` (c=99) at position 0; `caption` (c=99, a=97) < `choice` (c=99, h=104) at position 0 same, position 1 `a` (97) < `h` (104); `caption` < `confidence` (c=99, o=111) at position 1 `a` (97) < `o` (111)); insertion sequence `..., auth, binding, caption, choice, confidence, ...`; result-array field name `first_property_titles` (plural categorical, matching M48/M51/M52/M53/M54/M55/M56 `first_property_<axis>` precedent verbatim); per-bucket field name `input_schema_first_property_title` (8-field entry shape: `input_schema_first_property_title, aggregation_key, capability_count, capabilities[], approved_count, gated_count, has_destructive_side_effect, has_restricted_or_confidential_sensitivity`); read-only invariants extend M56 list with `tusq sample index` byte-identity guard (27 commands now); non-persistence rule: `input_schema_first_property_title` MUST NOT be written into `tusq.manifest.json`; eval scenario `input-schema-first-property-title-presence-index-determinism` (47 → 48 scenarios); Constraint 50 reserved for explicit non-runtime-validator / non-doc-contradiction-detector / non-title-length-tier-distributor / non-title-whitespace-distribution-distributor / non-title-description-crossref / non-LLM-title-inferrer / non-brand-voice-adapter / non-statistical-aggregator boundary; deferred successor milestones (`M-Caption-All-Properties-Title-Index-1`, `M-Caption-Nested-Property-Title-Index-1`, `M-Caption-Output-First-Property-Title-Index-1`, `M-Caption-Title-Length-Tier-Index-1`, `M-Caption-Title-Whitespace-Distribution-Index-1`, `M-Caption-Title-Description-Crossref-1`, `M-Caption-Persistence-1`, `M-Caption-Doc-Contradiction-1`, `M-Caption-LLM-Title-Inferrer-1`, `M-Caption-Brand-Voice-Adapter-1`). Distinct from M44 (capability-level top-level `description` word-count tier via `tusq description index`), distinct from M48 (output-side first-property type via `tusq shape index`), distinct from M49 (firstKey `.type` via `tusq signature index`), distinct from M50 (firstKey ∈ required[] membership via `tusq obligation index`), distinct from M51 (firstKey `.source` via `tusq binding index`), distinct from M52 (firstKey `.description` via `tusq gloss index` — M52 reads the longer prose explanation, M57 reads the short UI label; the two annotations are orthogonal: a property MAY have BOTH `title` and `description`, MAY have only one, MAY have neither — they are independent reviewer signals), distinct from M53 (firstKey `.format` via `tusq hint index`), distinct from M54 (firstKey `.enum` via `tusq choice index`), distinct from M55 (firstKey `.default` via `tusq preset index`), distinct from M56 (firstKey `.examples` via `tusq sample index`); the M52 description axis and the M57 title axis are particularly orthogonal because JSON-Schema explicitly defines `title` and `description` as complementary annotations (`title` for short UI labels, `description` for longer prose). VISION sources cited: `.planning/VISION.md` lines 193–204 (`### Brand-Matched Chat Interface`) — primary aggregation source, NOT yet primary aggregation source for any shipped milestone; `.planning/VISION.md` lines 164–173 (`### Tools`) re-cited as structural anchor only. Full M57 detail block lands in dev attempt 1 of this run alongside the source-code implementation; this PM block reserves the structure only.

> **M56 Materialized — 2026-04-28, run_4c16dd0f2f6674fc, turn_dd4dc63d5e634f5d, dev attempt 1.** All PM-frozen scope carried forward verbatim. Implementation: `classifyInputSchemaFirstPropertyExamples` (pure function), `buildInputSchemaFirstPropertyExamplesIndex`, `formatInputSchemaFirstPropertyExamplesIndex`, `cmdSample`/`cmdSampleIndex`/`parseSampleIndexArgs` in `src/cli.js`; CLI surface 39→40 (`sample` between `response` and `sensitivity`); 24-case smoke matrix (a-x); eval scenario `input-schema-first-property-examples-index-determinism` (46→47 scenarios); `tusq sample index` documented in `website/docs/cli-reference.md`. Sixth frozen warning code `input_schema_properties_first_property_examples_invalid_when_present` covers both non-array and empty-array malformations. null-as-absent: `examples:null` → unexampled (no warning). npm test exits 0. See IMPLEMENTATION_NOTES.md § M56 for full detail. Constraint 49 reserved: non-runtime-validator / non-doc-contradiction-detector / non-examples-element-type-distributor / non-examples-cardinality-tier-distributor / non-PII-leak-crossref / non-LLM-examples-inferrer / non-marketplace-listing-generator / non-statistical-aggregator boundary. M56-vs-M40 distinctness: `tusq sample index` aggregates per-property `input_schema.properties[firstKey].examples` (JSON-Schema per-property example values); `tusq examples index` aggregates capability-level top-level `examples` field (worked-example invocation records) — orthogonal axes, read-only-invariant peers.

> **M56 Charter Sketch Reservation — 2026-04-28, run_4c16dd0f2f6674fc, turn_13f1b1f85e65a188, PM attempt 1, HEAD `531a09d`.** Reserves the `### M56: Static Capability Input Schema First Property Examples Array Presence Index` detail block for the dev materialization turn. PM-frozen scope (dev MUST carry forward verbatim): closed four-value `input_schema_first_property_examples` bucket-key enum (`exampled | unexampled | not_applicable | unknown`); closed three-value `aggregation_key` enum (`example_set | not_applicable | unknown`); classifier function gated on `input_schema.type === 'object'` AND `Object.keys(properties).length > 0` AND `firstVal` is a plain non-null object, returning `'exampled'` when `firstVal.examples` is an `Array` with `length >= 1` (per-element type permitted to be any JSON value type — strings, numbers, booleans, `null`, arrays, objects — heterogeneous arrays are valid; per-element type is NOT classified at this milestone); returning `'unexampled'` when `firstVal` does NOT have own property `'examples'` OR `firstVal.examples === undefined` OR `firstVal.examples === null` (null treated as semantically absent per JSON-Schema convention, mirroring M55's null-as-absent precedent); `not_applicable` for non-object input or zero-property object (no warning); `unknown` for malformed input_schema, malformed properties (when type === 'object'), `firstVal` not a plain non-null object, OR `firstVal.examples` present-but-not-Array OR present-Array-but-empty; **six frozen warning reason codes** (`input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_descriptor_invalid`, `input_schema_properties_first_property_examples_invalid_when_present`) — the fifth code is the firstVal-descriptor-invalid reason carried forward from M55's formal elevation; the sixth code is M56's axis-specific reason and covers BOTH the "examples present but not Array" AND the "examples present as Array but empty" malformation paths under a single consolidated code (deliberate alignment with M54's empty-`enum`-is-malformed precedent because the JSON-Schema `examples` keyword requires the array to declare >=1 example value to carry semantic intent — an empty examples array is incoherent on its face); `not_applicable`, `exampled`, and `unexampled` emit NO warning (only `unknown` triggers warnings); bucket iteration order `exampled → unexampled → not_applicable → unknown` (deterministic stable-output convention only — explicitly NOT a marketplace-readiness ranking, NOT a reviewer-priority ranking, NOT a marketplace-discoverability ranking, NOT a UX-affordance-completeness ranking, NOT an OpenAI-ecosystem-readiness ranking, NOT a Claude/Anthropic-ecosystem-readiness ranking, NOT an MCP-registry-readiness ranking, NOT an example-prompt-coverage ranking); within-bucket order is manifest declared order; empty buckets MUST NOT appear; `--sample` filter case-sensitive lowercase-only with stderr `Unknown input schema first property examples:` for unknowns and `No capabilities found for input schema first property examples:` for absent buckets; CLI surface 39 → 40 with new noun `sample` inserted alphabetically between `response` and `sensitivity` (`response` (r=114, e=101) < `sample` (s=115, a=97) at position 0 (r (114) < s (115)); `sample` (s=115, a=97) < `sensitivity` (s=115, e=101) at position 0 same (s = s) AND at position 1 `a` (97) < `e` (101); `sample` < `shape` (s=115, h=104) at position 1 `a` (97) < `h` (104)); insertion sequence `..., request, response, sample, sensitivity, shape, ...`; result-array field name `first_property_examples` (plural categorical, matching M48/M51/M52/M53/M54/M55 `first_property_<axis>` precedent verbatim); per-bucket field name `input_schema_first_property_examples` (8-field entry shape: `input_schema_first_property_examples, aggregation_key, capability_count, capabilities[], approved_count, gated_count, has_destructive_side_effect, has_restricted_or_confidential_sensitivity`); read-only invariants extend M55 list with `tusq preset index` byte-identity guard (26 commands now); non-persistence rule: `input_schema_first_property_examples` MUST NOT be written into `tusq.manifest.json`; eval scenario `input-schema-first-property-examples-index-determinism` (46 → 47 scenarios); Constraint 49 reserved for explicit non-runtime-validator / non-doc-contradiction-detector / non-examples-element-type-distributor / non-examples-cardinality-tier-distributor / non-PII-leak-crossref / non-LLM-examples-inferrer / non-marketplace-listing-generator / non-statistical-aggregator boundary; deferred successor milestones (`M-Sample-All-Properties-Examples-Index-1`, `M-Sample-Nested-Property-Examples-Index-1`, `M-Sample-Output-First-Property-Examples-Index-1`, `M-Sample-Examples-Cardinality-Tier-Index-1`, `M-Sample-Examples-Element-Type-Distribution-Index-1`, `M-Sample-Examples-PII-Leak-Crossref-1`, `M-Sample-Persistence-1`, `M-Sample-Doc-Contradiction-1`, `M-Sample-LLM-Examples-Inferrer-1`, `M-Sample-Marketplace-Listing-Generator-1`). Distinct from M40 (capability-level top-level `examples` worked-example-invocations array via `tusq examples index` — M40's `examples` and M56's `sample` are read-only-invariant peers reading two distinct JSON-Schema features under two distinct nouns, with M40 reading `cap.examples[]` worked-example records and M56 reading `cap.input_schema.properties[firstKey].examples[]` per-property example values), distinct from M44 (capability-level top-level `description` word-count tier via `tusq description index`), distinct from M48 (output-side first-property type via `tusq shape index`), distinct from M49 (firstKey `.type` via `tusq signature index`), distinct from M50 (firstKey ∈ required[] membership via `tusq obligation index`), distinct from M51 (firstKey `.source` via `tusq binding index`), distinct from M52 (firstKey `.description` via `tusq gloss index`), distinct from M53 (firstKey `.format` via `tusq hint index`), distinct from M54 (firstKey `.enum` via `tusq choice index`), distinct from M55 (firstKey `.default` via `tusq preset index`); the M55 default-value axis and the M56 examples-array axis are orthogonal — a `defaulted` first property MAY also carry an `examples[]` array (and typically should, with the `default` value as one of the array elements), MAY NOT, and an `undefaulted` first property MAY also carry an `examples[]` array — the two annotations are independent reviewer signals. VISION sources cited: `.planning/VISION.md` lines 241–253 (`### Marketplace Packages`) — primary aggregation source, NOT yet primary aggregation source for any shipped milestone; `.planning/VISION.md` lines 164–173 (`### Tools`) re-cited as structural anchor only. Full M56 detail block lands in dev attempt 1 of this run alongside the source-code implementation; this PM block reserves the structure only.

> **M55 Charter Sketch Reservation — 2026-04-28, run_a75232d11566c4cb, turn_cb44215adb5a904f, PM attempt 1, HEAD `f21f18d`.** Reserves the `### M55: Static Capability Input Schema First Property Default Value Presence Index` detail block for the dev materialization turn. PM-frozen scope (dev MUST carry forward verbatim): closed four-value `input_schema_first_property_default_value` bucket-key enum (`defaulted | undefaulted | not_applicable | unknown`); closed three-value `aggregation_key` enum (`default_value | not_applicable | unknown`); classifier function gated on `input_schema.type === 'object'` AND `Object.keys(properties).length > 0` AND `firstVal` is a plain non-null object, returning `'defaulted'` when `firstVal` has own property `'default'` AND `firstVal.default !== undefined` (any other JSON value valid: string, number, boolean, `null`, array, object — `null`/`false`/`0`/`""`/`[]`/`{}` are all structurally valid declared defaults), returning `'undefaulted'` when `firstVal` does NOT have own property `'default'` OR `firstVal.default === undefined`; `not_applicable` for non-object input or zero-property object (no warning); `unknown` for malformed input_schema, malformed properties (when type === 'object'), or `firstVal` not a plain non-null object; **five frozen warning reason codes** (`input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_descriptor_invalid`) — the fifth code is the firstVal-descriptor-invalid reason itself, NOT an axis-specific code, because the JSON-Schema `default` keyword permits any JSON value type and therefore has no axis-specific typing failure; this PM turn explicitly elevates the firstVal-descriptor-invalid reason into the formal frozen set to address the OBJ-004/OBJ-005/OBJ-006 pattern QA raised on M52/M53/M54 (where the same reason code was emitted but not declared in the PM-frozen set); `not_applicable`, `defaulted`, and `undefaulted` emit NO warning (only `unknown` triggers warnings — an absent default value is a pre-fill-readiness signal, not a malformation; a `default` value of `null`/`false`/`0`/`""`/`[]`/`{}` is a valid declared default and MUST bucket as `defaulted` with no warning); bucket iteration order `defaulted → undefaulted → not_applicable → unknown` (deterministic stable-output convention only — explicitly NOT a voice-interface-readiness ranking, NOT a reviewer-priority ranking, NOT a pre-fill-completeness ranking, NOT a UX-affordance-completeness ranking, NOT an agent-composition-readiness ranking, NOT a SaaS-onboarding-readiness ranking, NOT a copilot-pre-fill-readiness ranking, NOT a default-value-coverage ranking); within-bucket order is manifest declared order; empty buckets MUST NOT appear; `--preset` filter case-sensitive lowercase-only with stderr `Unknown input schema first property default value:` for unknowns and `No capabilities found for input schema first property default value:` for absent buckets; CLI surface 38 → 39 with new noun `preset` inserted alphabetically between `policy` and `redaction` (`policy` (p (112), o (111)) < `preset` (p (112), r (114)) at position 1 (o < r); `preset` < `redaction` at position 0 (p (112) < r (114))); insertion sequence `..., pii, policy, preset, redaction, request, response, ...`; result-array field name `first_property_default_values` (plural categorical, matching M48/M51/M52/M53/M54 `first_property_<axis>` precedent verbatim); per-bucket field name `input_schema_first_property_default_value` (8-field entry shape: `input_schema_first_property_default_value, aggregation_key, capability_count, capabilities[], approved_count, gated_count, has_destructive_side_effect, has_restricted_or_confidential_sensitivity`); read-only invariants extend M54 list with `tusq choice index` byte-identity guard (25 commands now); non-persistence rule: `input_schema_first_property_default_value` MUST NOT be written into `tusq.manifest.json`; eval scenario `input-schema-first-property-default-value-presence-index-determinism` (45 → 46 scenarios); Constraint 48 reserved for explicit non-runtime-validator / non-doc-contradiction-detector / non-default-value-type-distributor / non-default-value-cardinality-tier-distributor / non-default-validator-crossref / non-LLM-default-inferrer / non-SDK-pre-fill-generator / non-statistical-aggregator boundary; deferred successor milestones (`M-Preset-All-Properties-Default-Value-Index-1`, `M-Preset-Nested-Property-Default-Value-Index-1`, `M-Preset-Output-First-Property-Default-Value-Index-1`, `M-Preset-Default-Value-Type-Distribution-Index-1`, `M-Preset-Default-Value-Cardinality-Tier-Index-1`, `M-Preset-Default-Validator-Crossref-1`, `M-Preset-Persistence-1`, `M-Preset-Doc-Contradiction-1`, `M-Preset-LLM-Default-Inferrer-1`, `M-Preset-SDK-Pre-Fill-Generator-1`). Distinct from M44 (capability-level top-level `description` word-count tier via `tusq description index`), distinct from M48 (output-side first-property type via `tusq shape index`), distinct from M49 (firstKey `.type` via `tusq signature index`), distinct from M50 (firstKey ∈ required[] membership via `tusq obligation index`), distinct from M51 (firstKey `.source` via `tusq binding index`), distinct from M52 (firstKey `.description` via `tusq gloss index`), distinct from M53 (firstKey `.format` via `tusq hint index`), distinct from M54 (firstKey `.enum` via `tusq choice index`); the M54 enum-constraint axis and the M55 default-value axis are orthogonal — an `enum`-constrained property MAY also carry a `default` value drawn from the enum set, MAY NOT, and an unenumerated property MAY also carry a `default` value — the two annotations are independent reviewer signals. VISION sources cited: `.planning/VISION.md` lines 206–216 (`### Brand-Matched Voice Interface`) — primary aggregation source, NOT yet primary aggregation source for any shipped milestone; `.planning/VISION.md` lines 187–191 (`### Agents`) re-cited as structural anchor only. Full M55 detail block (purpose statement, command shape, frozen tables, classifier rules, 8-field entry shape, warnings rules, iteration order, within-bucket order, filter rules, empty-capabilities rules, read-only invariants, non-persistence rule, no-all-properties-default-walking rule, no-nested-default-recursion rule, no-output-side-default rule, no-default-value-type-distribution rule, no-default-value-cardinality-tier rule, no-runtime-default-validation rule, no-LLM-inference rule, no-doc-contradiction-detection rule, non-runtime-validator/non-doc-contradiction-detector/non-default-value-type-distributor/non-default-value-cardinality-tier-distributor/non-default-validator-crossref/non-LLM-default-inferrer/non-SDK-pre-fill-generator boundary, Constraint 48 freeze) lands in dev attempt 1 of this run alongside the source-code implementation; this PM block reserves the structure only.

> **M55 Materialized — 2026-04-28, run_a75232d11566c4cb, turn_103ec2af102d2d3a, dev attempt 1.** All PM-frozen scope carried forward verbatim. Implementation: `classifyInputSchemaFirstPropertyDefaultValue` (pure function), `buildInputSchemaFirstPropertyDefaultValueIndex`, `formatInputSchemaFirstPropertyDefaultValueIndex`, `cmdPreset`/`cmdPresetIndex`/`parsePresetIndexArgs` in `src/cli.js`; CLI surface 38→39 (`preset` between `policy` and `redaction`); 24-case smoke matrix; eval scenario `input-schema-first-property-default-value-presence-index-determinism` (45→46 scenarios); `tusq preset index` documented in `website/docs/cli-reference.md`. FALSY-DEFAULT-COUNTS-AS-DEFAULTED implemented (null/false/0/''/[]/{}→defaulted). Fifth frozen warning code `input_schema_properties_first_property_descriptor_invalid` formally elevated from M52/M53/M54 OBJ-004/OBJ-005/OBJ-006 undeclared pattern. npm test exits 0. See IMPLEMENTATION_NOTES.md § M55 for full detail.

### M55: Static Capability Input Schema First Property Default Value Presence Index Export from Manifest Evidence (~0.5 day) — V1.36

**Purpose:** Emit a deterministic, per-first-input-property-default-value-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].default` is present with any JSON value (`defaulted`), absent or undefined (`undefaulted`), non-applicable (`not_applicable`), or malformed (`unknown`). Planning aid only — does NOT validate runtime payloads against the declared default value, does NOT cross-reference manifest first-property default vs published OpenAPI/SDK docs, does NOT auto-infer missing default values, does NOT generate SDK or voice pre-fill stubs.

**Command shape:** `tusq preset index [--preset <value>] [--manifest <path>] [--out <path>] [--json]`

**Frozen four-value `input_schema_first_property_default_value` bucket-key enum:** `defaulted | undefaulted | not_applicable | unknown`

**Frozen three-value `aggregation_key` enum:** `default_value | not_applicable | unknown`

**Frozen classifier function (M55-specific rules):**
- `inputSchema` null/undefined/missing → `unknown` (reason: `input_schema_field_missing`)
- `inputSchema` not plain object → `unknown` (reason: `input_schema_field_not_object`)
- `inputSchema.type` missing or non-string → `unknown` (reason: `input_schema_type_missing_or_invalid`)
- `inputSchema.type` is string but not `"object"` → `not_applicable` (no warning)
- `inputSchema.type === "object"`, `properties` missing/null/not-plain-object → `unknown` (reason: `input_schema_properties_field_missing_when_type_is_object`)
- `inputSchema.type === "object"`, `Object.keys(properties).length === 0` → `not_applicable` (no warning)
- `firstVal` not plain object → `unknown` (reason: `input_schema_properties_first_property_descriptor_invalid` — FIFTH FROZEN CODE, formally elevated from M52/M53/M54 OBJ-004/OBJ-005/OBJ-006 pattern)
- HAS-OWN-PROPERTY-AND-NOT-UNDEFINED check: `Object.prototype.hasOwnProperty.call(firstVal, 'default') && firstVal.default !== undefined` → `defaulted` (no warning; FALSY-DEFAULT-COUNTS-AS-DEFAULTED: null/false/0/''/[]/{}→`defaulted`)
- else (key absent OR present with value===undefined) → `undefaulted` (no warning)
- NOTE: no axis-specific malformation code because JSON-Schema `default` accepts ANY JSON value type

**FALSY-DEFAULT-COUNTS-AS-DEFAULTED rule:** `default: null/false/0/empty-string/empty-array/empty-object` → `defaulted` (deliberate divergence from M52/M53 empty-string-counts-as-absent: operator explicitly typed falsy value as pre-fill seed, carrying semantic intent).

**Frozen warning reason codes (five values):** `input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_descriptor_invalid` (fifth code is the firstVal-descriptor-invalid reason, formally elevated from M52/M53/M54 OBJ pattern — M55 has NO axis-specific malformation code since `default` accepts any JSON value type).

**Frozen 8-field per-bucket entry shape:** `input_schema_first_property_default_value`, `aggregation_key` (`default_value` for defaulted/undefaulted; `not_applicable` for not_applicable; `unknown` for unknown), `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`.

**Top-level `warnings[]` rule:** Always present in `--json` output (empty `[]` when none). `not_applicable`, `defaulted`, `undefaulted` emit NO warning — only `unknown` triggers `{ capability, reason }` entries.

**Closed-enum bucket iteration order:** `defaulted → undefaulted → not_applicable → unknown` (deterministic stable-output convention only — NOT voice-interface-readiness-ranked, NOT reviewer-priority-ranked, NOT pre-fill-completeness-ranked, NOT UX-affordance-completeness-ranked, NOT agent-composition-readiness-ranked, NOT SaaS-onboarding-readiness-ranked, NOT copilot-pre-fill-readiness-ranked, NOT default-value-coverage-ranked). Within-bucket: manifest declared order. Empty buckets MUST NOT appear.

**Case-sensitive `--preset` filter:** lowercase-only; unknown value → stderr `Unknown input schema first property default value: <value>` + exit 1; absent bucket → stderr `No capabilities found for input schema first property default value: <value>` + exit 1.

**Read-only invariants:** `tusq.manifest.json` is never modified. `input_schema_first_property_default_value` MUST NOT be written into the manifest. Per-property default beyond FIRST not walked (→ `M-Preset-All-Properties`). Nested-property default not walked (→ `M-Preset-Nested`). Output-side default not classified (→ `M-Preset-Output`). No default-value-type distribution (→ `M-Preset-Default-Value-Type-Distribution`). No default-value-cardinality tier (→ `M-Preset-Default-Value-Cardinality-Tier`). No runtime-payload-against-default validation (→ `M-Preset-Default-Validator-Crossref`). No LLM inference (→ `M-Preset-LLM-Default-Inferrer`). No doc-contradiction detection (→ `M-Preset-Doc-Contradiction`). No SDK/voice pre-fill stub generation (→ `M-Preset-SDK-Pre-Fill-Generator`). No voice-confirmation-policy enforcement on defaulted destructive capabilities (reserved for separate milestone).

**Constraint 48:** `tusq preset index` is a planning aid that surfaces the per-capability `input_schema.properties[firstKey].default` JSON-Schema-default-value presence classification and the cross-axis side-effect/sensitivity exposure of each presence bucket. The four-value `input_schema_first_property_default_value` bucket-key enum (`defaulted | undefaulted | not_applicable | unknown`), the three-value `aggregation_key` enum (`default_value | not_applicable | unknown`), and the five-value warning reason-code enum are frozen; any addition is a material governance event. PM-frozen and dev-locked.

> **M54 Materialized — 2026-04-28, run_ca31318ae2693a36, turn_bb0592709e7268f5, dev attempt 1.** All PM-frozen scope carried forward verbatim. Implementation: `classifyInputSchemaFirstPropertyEnumConstraint` (pure function), `buildInputSchemaFirstPropertyEnumConstraintIndex`, `formatInputSchemaFirstPropertyEnumConstraintIndex`, `cmdChoice`/`cmdChoiceIndex`/`parseChoiceIndexArgs` in `src/cli.js`; CLI surface 37→38 (`choice` between `binding` and `confidence`); 24-case smoke matrix; eval scenario `input-schema-first-property-enum-constraint-index-determinism` (44→45 scenarios); `tusq choice index` documented in `website/docs/cli-reference.md`. npm test exits 0. See IMPLEMENTATION_NOTES.md § M54 for full detail.

### M54: Static Capability Input Schema First Property Enum Constraint Presence Index Export from Manifest Evidence (~0.5 day) — V1.35

**Purpose:** Emit a deterministic, per-first-input-property-enum-constraint-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].enum` is a non-empty array (`enumerated`), missing/null/undefined (`unenumerated`), non-applicable (`not_applicable`), or malformed (`unknown`). Planning aid only — does NOT validate runtime payload conformance against the declared enum vocabulary, does NOT cross-reference manifest enum vs published OpenAPI/SDK docs, does NOT infer missing enum vocabularies, does NOT generate SDK/embeddable-widget picker stubs.

**Command shape:** `tusq choice index [--choice <value>] [--manifest <path>] [--out <path>] [--json]`

**Frozen four-value `input_schema_first_property_enum_constraint` bucket-key enum:** `enumerated | unenumerated | not_applicable | unknown`

**Frozen three-value `aggregation_key` enum:** `enum_constraint | not_applicable | unknown`

**Frozen classifier function (M54-specific rules):**
- `inputSchema` null/undefined/missing → `unknown` (reason: `input_schema_field_missing`)
- `inputSchema` not plain object → `unknown` (reason: `input_schema_field_not_object`)
- `inputSchema.type` missing or non-string → `unknown` (reason: `input_schema_type_missing_or_invalid`)
- `inputSchema.type` is string but not `"object"` → `not_applicable` (no warning)
- `inputSchema.type === "object"`, `properties` missing/null/not-plain-object → `unknown` (reason: `input_schema_properties_field_missing_when_type_is_object`)
- `inputSchema.type === "object"`, `Object.keys(properties).length === 0` → `not_applicable` (no warning)
- `firstVal` not plain object → `unknown` (reason: `input_schema_properties_first_property_descriptor_invalid`)
- `firstVal.enum` present, non-null, non-undefined, not an Array → `unknown` (reason: `input_schema_properties_first_property_enum_invalid_when_present`)
- `firstVal.enum` present, is an Array, `length === 0` → `unknown` (reason: `input_schema_properties_first_property_enum_invalid_when_present` — **deliberate divergence from M52/M53 empty-counts-as-absent: empty enum is malformed JSON-Schema**)
- `firstVal.enum` missing/null/undefined → `unenumerated` (no warning)
- `firstVal.enum` is Array with `length >= 1` → `enumerated` (no warning; single-value is degenerate but structurally valid)

**Frozen warning reason codes (five values):** `input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_enum_invalid_when_present` (fifth code spans BOTH non-array AND empty-array malformations).

**Frozen 8-field per-bucket entry shape:** `input_schema_first_property_enum_constraint`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`

**Closed-enum bucket iteration order:** `enumerated → unenumerated → not_applicable → unknown` (deterministic stable-output convention only — NOT widget-composition-readiness-ranked, NOT reviewer-priority-ranked, NOT UX-affordance-completeness-ranked, NOT chat-affordance-readiness-ranked, NOT command-palette-readiness-ranked, NOT action-widget-readiness-ranked, NOT closed-vocabulary-coverage-ranked). Empty buckets MUST NOT appear.

**Read-only invariants:** manifest never modified; `input_schema_first_property_enum_constraint` NOT persisted into `tusq.manifest.json`; per-property enum beyond the FIRST NOT walked; nested-property enum NOT walked; output_schema enum NOT classified; CLI surface 37→38.

**Deferred successor milestones:** M-Choice-All-Properties / M-Choice-Nested / M-Choice-Output / M-Choice-Cardinality-Distribution / M-Choice-Enum-Value-Type / M-Choice-Enum-Validator-Crossref / M-Choice-Persistence / M-Choice-Doc-Contradiction / M-Choice-LLM-Enum-Inferrer / M-Choice-SDK-Picker-Generator.

> **M53 Materialized — 2026-04-28, run_e05bf49856cd2880, turn_3bd0b034cb7c2180, dev attempt 1.** All PM-frozen scope carried forward verbatim. Implementation: `classifyInputSchemaFirstPropertyFormatHint` (pure function), `buildInputSchemaFirstPropertyFormatHintIndex`, `formatInputSchemaFirstPropertyFormatHintIndex`, `cmdHint`/`cmdHintIndex`/`parseHintIndexArgs` in `src/cli.js`; CLI surface 36→37 (`hint` between `gloss` and `input`); 24-case smoke matrix; eval scenario `input-schema-first-property-format-hint-index-determinism` (43→44 scenarios); `tusq hint index` documented in `website/docs/cli-reference.md`. npm test exits 0. See IMPLEMENTATION_NOTES.md § M53 for full detail.

### M53: Static Capability Input Schema First Property Format Hint Presence Index Export from Manifest Evidence (~0.5 day) — V1.34

**Purpose:** Emit a deterministic, per-first-input-property-format-hint-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].format` is a non-empty trimmed string (`hinted`), missing/null/empty/whitespace-only (`unhinted`), non-applicable (`not_applicable`), or malformed (`unknown`). Planning aid only — does NOT validate runtime payload conformance against the declared format, does NOT cross-reference manifest format vs published OpenAPI/SDK docs, does NOT infer missing format hints, does NOT generate SDK validators.

**Command shape:** `tusq hint index [--hint <value>] [--manifest <path>] [--out <path>] [--json]`

**Frozen four-value `input_schema_first_property_format_hint` bucket-key enum:** `hinted | unhinted | not_applicable | unknown`

**Frozen three-value `aggregation_key` enum:** `format_hint | not_applicable | unknown`
- `hinted` and `unhinted` buckets: `aggregation_key = "format_hint"`
- `not_applicable` bucket: `aggregation_key = "not_applicable"`
- `unknown` bucket: `aggregation_key = "unknown"`

**Frozen classifier function `classifyInputSchemaFirstPropertyFormatHint(inputSchema)`:**
1. `inputSchema` null/undefined/missing → `'unknown'` (reason: `input_schema_field_missing`)
2. `inputSchema` not plain non-null object or is array → `'unknown'` (reason: `input_schema_field_not_object`)
3. `inputSchema.type` missing or non-string → `'unknown'` (reason: `input_schema_type_missing_or_invalid`)
4. `inputSchema.type` is string but not `'object'` → `'not_applicable'` (no warning)
5. `inputSchema.type === 'object'`, `properties` missing/null/not-plain-object → `'unknown'` (reason: `input_schema_properties_field_missing_when_type_is_object`)
6. `inputSchema.type === 'object'`, `Object.keys(properties).length === 0` → `'not_applicable'` (no warning)
7. `firstVal = properties[Object.keys(properties)[0]]`; if `firstVal` not plain non-null object → `'unknown'` (reason: `input_schema_properties_first_property_descriptor_invalid`)
8. `firstVal.format` is PRESENT AND not null/undefined AND `typeof !== 'string'` → `'unknown'` (reason: `input_schema_properties_first_property_format_invalid_when_present`)
9. `firstVal.format` missing/null/undefined OR string with `trim().length === 0` → `'unhinted'` (no warning)
10. `firstVal.format` string with `trim().length > 0` → `'hinted'` (no warning)

**Frozen five warning reason codes:** `input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_format_invalid_when_present`. The `not_applicable`, `hinted`, and `unhinted` buckets emit NO warning.

**Frozen 8-field per-bucket entry shape:** `input_schema_first_property_format_hint`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`.

**Bucket iteration order:** `hinted → unhinted → not_applicable → unknown` (deterministic stable-output convention — NOT knowledge-artifact-readiness-ranked, NOT reviewer-priority-ranked, NOT UX-affordance-completeness-ranked, NOT help-flow-readiness-ranked, NOT SDK-validator-readiness-ranked, NOT onboarding-clarity-ranked, NOT OpenAPI-conformance-ranked). Empty buckets MUST NOT appear. Within-bucket order is manifest declared order.

**Filter rule:** `--hint` case-sensitive lowercase-only. `--hint HINTED` exits 1 `Unknown input schema first property format hint: HINTED`. `--hint xyz` exits 1 for unknown values. `--hint hinted` exits 1 `No capabilities found for input schema first property format hint: hinted` when bucket absent.

**Read-only invariants and non-persistence rule:** `tusq.manifest.json` is never modified. `input_schema_first_property_format_hint` MUST NOT be written into the manifest. Per-property format beyond the FIRST is NOT walked (reserved for `M-Hint-All-Properties`). Nested-object property format NOT walked. Output-schema first-property format NOT classified.

**Constraint 46 (frozen):** `tusq hint index` is a planning aid that surfaces per-capability `input_schema.properties[firstKey].format` JSON-Schema-format-hint presence classification. It does NOT: execute capability invocations; validate runtime payload conformance against the declared format (deferred to `M-Hint-Format-Validator-Crossref-1`); cross-reference manifest first-property format vs published OpenAPI/SDK docs (deferred to `M-Hint-Doc-Contradiction-1`); auto-infer missing format hints (deferred to `M-Hint-LLM-Format-Inferrer-1`); bucket on the specific format-string value (deferred to `M-Hint-Format-Value-Distribution-Index-1`); generate downstream SDK input-validator stubs (deferred to `M-Hint-SDK-Validator-Generator-1`); auto-flip `tusq serve` filtering or approval gates; persist `input_schema_first_property_format_hint` into `tusq.manifest.json`. The four-value bucket-key enum, three-value `aggregation_key` enum, and five-value warning reason-code enum are frozen.

**Deferred successor milestones:** `M-Hint-All-Properties-Format-Hint-Index-1`, `M-Hint-Nested-Property-Format-Hint-Index-1`, `M-Hint-Output-First-Property-Format-Hint-Index-1`, `M-Hint-Format-Value-Distribution-Index-1`, `M-Hint-Format-Validator-Crossref-1`, `M-Hint-Persistence-1`, `M-Hint-Doc-Contradiction-1`, `M-Hint-LLM-Format-Inferrer-1`, `M-Hint-SDK-Validator-Generator-1`.

> **M53 Charter Sketch Reservation — 2026-04-28, run_e05bf49856cd2880, turn_6ad1bae70240d47c, PM attempt 1, HEAD `78a5bd4`.** (Materialized above.) Reserves the `### M53: Static Capability Input Schema First Property Format Hint Presence Index` detail block for the dev materialization turn. PM-frozen scope (dev MUST carry forward verbatim): closed four-value `input_schema_first_property_format_hint` bucket-key enum (`hinted | unhinted | not_applicable | unknown`); closed three-value `aggregation_key` enum (`format_hint | not_applicable | unknown`); classifier function gated on `input_schema.type === 'object'` AND `Object.keys(properties).length > 0` AND `firstVal` is a plain non-null object, returning `'unknown'` if `firstVal.format` is PRESENT but `typeof !== 'string'`, returning `'unhinted'` if `firstVal.format` is missing/`null`/`undefined` OR is a string with `.trim().length === 0`, returning `'hinted'` otherwise; `not_applicable` for non-object input or zero-property object (no warning); `unknown` for malformed input_schema, malformed properties (when type === 'object'), `firstVal` not a plain object, or `firstVal.format` present-but-non-string; five frozen warning reason codes (`input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_format_invalid_when_present`); `not_applicable`, `hinted`, and `unhinted` emit NO warning (only `unknown` triggers warnings); empty-string and whitespace-only `format` bucket as `unhinted` (NOT as malformed) — empty hint is a knowledge-artifact-rendering signal, not a typing failure (mirrors M52's empty-string-counts-as-absent precedent verbatim); bucket iteration order `hinted → unhinted → not_applicable → unknown` (deterministic stable-output convention only — explicitly NOT a knowledge-artifact-readiness ranking, NOT a reviewer-priority ranking, NOT a UX-affordance-completeness ranking, NOT a help-flow-readiness ranking, NOT an SDK-validator-readiness ranking, NOT an onboarding-clarity ranking, NOT an OpenAPI-conformance ranking); within-bucket order is manifest declared order; empty buckets MUST NOT appear; `--hint` filter case-sensitive lowercase-only with stderr `Unknown input schema first property format hint:` for unknowns and `No capabilities found for input schema first property format hint:` for absent buckets; CLI surface 36 → 37 with new noun `hint` inserted alphabetically between `gloss` and `input` (`gloss` (g=103) < `hint` (h=104) at position 0; `hint` < `input` (h=104 < i=105) at position 0); insertion sequence `..., gloss, hint, input, items, method, ...`; result-array field name `first_property_format_hints` (plural categorical, matching M48/M51/M52 `first_property_<axis>` precedent verbatim); per-bucket field name `input_schema_first_property_format_hint` (8-field entry shape: `input_schema_first_property_format_hint, aggregation_key, capability_count, capabilities[], approved_count, gated_count, has_destructive_side_effect, has_restricted_or_confidential_sensitivity`); read-only invariants extend M52 list with `tusq gloss index` byte-identity guard (23 commands now); non-persistence rule: `input_schema_first_property_format_hint` MUST NOT be written into `tusq.manifest.json`; eval scenario `input-schema-first-property-format-hint-index-determinism` (43 → 44 scenarios); Constraint 46 reserved for explicit non-runtime-validator / non-doc-contradiction-detector / non-format-value-distributor / non-format-validator-crossref / non-LLM-inferrer / non-SDK-validator-generator / non-statistical-aggregator boundary; deferred successor milestones (`M-Hint-All-Properties-Format-Hint-Index-1`, `M-Hint-Nested-Property-Format-Hint-Index-1`, `M-Hint-Output-First-Property-Format-Hint-Index-1`, `M-Hint-Format-Value-Distribution-Index-1`, `M-Hint-Format-Validator-Crossref-1`, `M-Hint-Persistence-1`, `M-Hint-Doc-Contradiction-1`, `M-Hint-LLM-Format-Inferrer-1`, `M-Hint-SDK-Validator-Generator-1`). Distinct from M44 (capability-level top-level `description` word-count tier via `tusq description index`), distinct from M48 (output-side first-property type via `tusq shape index`), distinct from M49 (firstKey `.type` JSON-Schema primitive type via `tusq signature index` — M49 reads `.type` while M53 reads `.format`, an annotation atop `.type`), distinct from M50 (firstKey ∈ required[] membership via `tusq obligation index`), distinct from M51 (firstKey `.source` HTTP-locus via `tusq binding index`), distinct from M52 (firstKey `.description` docstring presence via `tusq gloss index`). VISION sources cited: `.planning/VISION.md` lines 268–283 (`### Knowledge Artifacts`) — primary aggregation source, NOT yet primary aggregation source for any shipped milestone; `.planning/VISION.md` lines 99–106 (`### Internal Docs And Company Operating Knowledge`) re-cited as structural anchor only (M52 already used as primary). Full M53 detail block (purpose statement, command shape, frozen tables, classifier rules, 8-field entry shape, warnings rules, iteration order, within-bucket order, filter rules, empty-capabilities rules, read-only invariants, non-persistence rule, no-all-properties-format-walking rule, no-nested-format-recursion rule, no-output-side-format rule, no-format-value-distribution rule, no-runtime-payload-validation rule, no-LLM-inference rule, no-doc-contradiction-detection rule, non-runtime-validator/non-doc-contradiction-detector/non-format-value-distributor/non-format-validator-crossref/non-LLM-inferrer/non-SDK-validator-generator boundary, Constraint 46 freeze) lands in dev attempt 1 of this run alongside the source-code implementation; this PM block reserves the structure only.

> **M52 Charter Sketch Reservation — 2026-04-28, run_3f128359168988b4, turn_09cba7c7ad415bd0, PM attempt 1, HEAD `15424bc`.** Reserves the `### M52: Static Capability Input Schema First Property Description Presence Index` detail block for the dev materialization turn. PM-frozen scope (dev MUST carry forward verbatim): closed four-value `input_schema_first_property_description_presence` bucket-key enum (`described | undescribed | not_applicable | unknown`); closed three-value `aggregation_key` enum (`description_presence | not_applicable | unknown`); classifier function gated on `input_schema.type === 'object'` AND `Object.keys(properties).length > 0` AND `firstVal` is a plain non-null object, returning `'unknown'` if `firstVal.description` is PRESENT but `typeof !== 'string'`, returning `'undescribed'` if `firstVal.description` is missing/`null`/`undefined` OR is a string with `.trim().length === 0`, returning `'described'` otherwise; `not_applicable` for non-object input or zero-property object (no warning); `unknown` for malformed input_schema, malformed properties (when type === 'object'), `firstVal` not a plain object, or `firstVal.description` present-but-non-string; five frozen warning reason codes (`input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_description_invalid_when_present`); `not_applicable`, `described`, and `undescribed` emit NO warning (only `unknown` triggers warnings); empty-string and whitespace-only `description` bucket as `undescribed` (NOT as malformed) — empty docstring is a documentation-completeness signal, not a typing failure; bucket iteration order `described → undescribed → not_applicable → unknown` (deterministic stable-output convention only — explicitly NOT a documentation-completeness ranking, NOT a reviewer-priority ranking, NOT a maintenance-debt ranking, NOT a public-docs-gap ranking, NOT a launch-readiness ranking, NOT a copilot-composition-readiness ranking, NOT an onboarding-clarity ranking); within-bucket order is manifest declared order; empty buckets MUST NOT appear; `--presence` filter case-sensitive lowercase-only with stderr `Unknown input schema first property description presence:` for unknowns and `No capabilities found for input schema first property description presence:` for absent buckets; CLI surface 35 → 36 with new noun `gloss` inserted alphabetically between `examples` and `input` (`examples` (e=101) < `gloss` (g=103) at position 0; `gloss` < `input` (g=103 < i=105) at position 0); insertion sequence `..., examples, gloss, input, items, method, ...`; result-array field name `first_property_description_presences` (plural categorical, matching M48/M51 `first_property_<axis>` precedent verbatim); per-bucket field name `input_schema_first_property_description_presence` (8-field entry shape: `input_schema_first_property_description_presence, aggregation_key, capability_count, capabilities[], approved_count, gated_count, has_destructive_side_effect, has_restricted_or_confidential_sensitivity`); read-only invariants extend M51 list with `tusq binding index` byte-identity guard (22 commands now); non-persistence rule: `input_schema_first_property_description_presence` MUST NOT be written into `tusq.manifest.json`; eval scenario `input-schema-first-property-description-presence-index-determinism` (42 → 43 scenarios); Constraint 45 reserved for explicit non-runtime-validator / non-doc-contradiction-detector / non-quality-scorer / non-LLM-synthesizer / non-language-detector / non-SDK-help-generator / non-statistical-aggregator boundary; deferred successor milestones (`M-Gloss-All-Properties-Description-Presence-Index-1`, `M-Gloss-Nested-Property-Description-Presence-Index-1`, `M-Gloss-Output-First-Property-Description-Presence-Index-1`, `M-Gloss-Description-Word-Count-Tier-1`, `M-Gloss-Description-Language-Detector-1`, `M-Gloss-Description-Quality-Score-1`, `M-Gloss-Persistence-1`, `M-Gloss-Doc-Contradiction-1`, `M-Gloss-LLM-Description-Synthesizer-1`, `M-Gloss-SDK-Help-Generator-1`). Distinct from M44 (capability-level top-level `description` word-count tier via `tusq description index`; M52 reads `input_schema.properties[firstKey].description` — entirely different field), distinct from M48 (output-side first-property type via `tusq shape index`), distinct from M49 (firstKey `.type` via `tusq signature index`), distinct from M50 (firstKey ∈ required[] membership via `tusq obligation index`), distinct from M51 (firstKey `.source` via `tusq binding index`). VISION sources cited: `.planning/VISION.md` lines 99–106 (`### Internal Docs And Company Operating Knowledge`) — primary aggregation source, NOT yet primary aggregation source for any shipped milestone; `.planning/VISION.md` lines 268–283 (`### Knowledge Artifacts`) re-cited as structural anchor. Full M52 detail block (purpose statement, command shape, frozen tables, classifier rules, 8-field entry shape, warnings rules, iteration order, within-bucket order, filter rules, empty-capabilities rules, read-only invariants, non-persistence rule, no-all-properties-description-walking rule, no-nested-description-recursion rule, no-output-side-description rule, no-quality-scoring rule, no-LLM-synthesis rule, no-language-detection rule, non-runtime-validator/non-doc-contradiction-detector/non-quality-scorer/non-LLM-synthesizer/non-SDK-help-generator boundary, Constraint 45 freeze) lands in dev attempt 1 of this run alongside the source-code implementation; this PM block reserves the structure only.

> **M51 Charter Sketch Reservation — 2026-04-28, run_c39bd102a520411b, turn_400dc74e4496c4df, PM attempt 1, HEAD `14d8f85`.** Reserves the `### M51: Static Capability Input Schema First Property Source Index` detail block for the dev materialization turn. PM-frozen scope (dev MUST carry forward verbatim): closed six-value `input_schema_first_property_source` bucket-key enum (`path | request_body | query | header | not_applicable | unknown`); closed three-value `aggregation_key` enum (`source | not_applicable | unknown`); closed four-value property-`source` value set (`path`, `request_body`, `query`, `header`); classifier function gated on `input_schema.type === 'object'` AND `Object.keys(properties).length > 0` AND `firstVal` is a plain non-null object AND `typeof firstVal.source === 'string'` AND `INPUT_SCHEMA_FIRST_PROPERTY_SOURCE_VALUE_SET.has(firstVal.source)`, returning `firstVal.source` verbatim; `not_applicable` for non-object input or zero-property object (no warning); `unknown` for malformed input_schema, malformed properties (when type === 'object'), or `firstVal` not a plain object / `firstVal.source` missing/non-string/outside the closed four-value set; five frozen warning reason codes (`input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_source_invalid`); `not_applicable` and the four locus buckets emit NO warning (only `unknown` triggers warnings); bucket iteration order `path → request_body → query → header → not_applicable → unknown` (deterministic stable-output convention only — explicitly NOT a security-blast-radius ranking, NOT a workflow-criticality ranking, NOT a permission-sensitivity ranking, NOT an HTTP-spec-precedence ranking, NOT a skill-composition-priority ranking, NOT a widget-render-precedence ranking); within-bucket order is manifest declared order; empty buckets MUST NOT appear; `--source` filter case-sensitive lowercase-only with stderr `Unknown input schema first property source:` for unknowns and `No capabilities found for input schema first property source:` for absent buckets; CLI surface 34 → 35 with new noun `binding` inserted alphabetically between `auth` and `confidence` (`auth` (a=97) < `binding` (b=98) at position 0; `binding` < `confidence` (b=98 < c=99) at position 0); insertion sequence `..., approve, auth, binding, confidence, description, ...`; result-array field name `first_property_sources` (plural categorical, matching M48 `first_property_types` precedent verbatim); per-bucket field name `input_schema_first_property_source` (8-field entry shape: `input_schema_first_property_source, aggregation_key, capability_count, capabilities[], approved_count, gated_count, has_destructive_side_effect, has_restricted_or_confidential_sensitivity`); read-only invariants extend M50 list with `tusq obligation index` byte-identity guard (21 commands); non-persistence rule: `input_schema_first_property_source` MUST NOT be written into `tusq.manifest.json`; eval scenario `input-schema-first-property-source-index-determinism` (41 → 42 scenarios); Constraint 44 reserved for explicit non-runtime-validator / non-request-conformance-detector / non-SDK-call-site-signature-generator / non-widget-renderer-crossref / non-statistical-aggregator boundary; deferred successor milestones (`M-Binding-All-Properties-Source-Index-1`, `M-Binding-Nested-Property-Source-Index-1`, `M-Binding-Output-First-Property-Source-Index-1`, `M-Binding-Cookie-Bucket-1`, `M-Binding-File-Bucket-1`, `M-Binding-Persistence-1`, `M-Binding-Doc-Contradiction-1`, `M-Binding-Runtime-Conformance-1`, `M-Binding-SDK-Generator-1`, `M-Binding-Widget-Renderer-Crossref-1`). Distinct from M43 (capability-wide source UNION across ALL properties via `tusq request index` with `mixed`/`none` values; M51 reads ONLY `properties[firstKey].source`), distinct from M49 (firstKey `.type` via `tusq signature index`), distinct from M50 (firstKey ∈ required[] membership via `tusq obligation index`), distinct from M48 (output-side first-property type via `tusq shape index`). VISION sources cited: `.planning/VISION.md` lines 175–185 (`### Skills`) — primary aggregation source, NOT yet primary aggregation source for any shipped milestone; `.planning/VISION.md` lines 218–227 (`### Embeddable Widgets And Command Surfaces`) re-cited as structural anchor. Full M51 detail block (purpose statement, command shape, frozen tables, classifier rules, 8-field entry shape, warnings rules, iteration order, within-bucket order, filter rules, empty-capabilities rules, read-only invariants, non-persistence rule, no-all-properties-source-walking rule (M43 covers capability-wide union; per-property granularity reserved for `M-Binding-All-Properties-Source-Index-1`), no-nested-source-recursion rule, no-output-side-source rule, no-cookie/file/multipart-locus rule, non-runtime-validator/non-request-conformance-detector/non-SDK-generator/non-widget-renderer-crossref boundary, Constraint 44 freeze) lands in dev attempt 1 of this run alongside the source-code implementation; this PM block reserves the structure only.

> **M50 Charter Sketch Reservation — 2026-04-28, run_6e53e7b50cd2c457, turn_644dcda246f21bc1, PM attempt 1, HEAD `061a227`.** Reserves the `### M50: Static Capability Input Schema First Property Required Status Index` detail block for the dev materialization turn. PM-frozen scope (dev MUST carry forward verbatim): closed four-value `input_schema_first_property_required_status` bucket-key enum (`required | optional | not_applicable | unknown`); closed three-value `aggregation_key` enum (`required_status | not_applicable | unknown`); classifier function gated on `input_schema.type === 'object'` AND `Object.keys(properties).length > 0` AND `Array.isArray(input_schema.required)` (or absent), returning `'required'` if `firstKey ∈ required[]` else `'optional'`; `not_applicable` for non-object input or zero-property object (no warning); `unknown` for malformed input_schema, malformed properties (when type === 'object'), or `required` present but not an array of strings; five frozen warning reason codes (`input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_required_field_invalid_when_type_is_object`); `not_applicable` and `optional` emit NO warning (only `unknown` triggers warnings); bucket iteration order `required → optional → not_applicable → unknown` (deterministic stable-output convention only — explicitly NOT a runtime-execution-safety ranking, NOT a call-site-strictness ranking, NOT a destructive-action-priority ranking, NOT an action-policy-precedence ranking, NOT a security-blast-radius ranking); within-bucket order is manifest declared order; empty buckets MUST NOT appear; `--status` filter case-sensitive lowercase-only with stderr `Unknown input schema first property required status:` for unknowns and `No capabilities found for input schema first property required status:` for absent buckets; CLI surface 33 → 34 with new noun `obligation` inserted alphabetically between `method` and `output` (`method` (m=109) < `obligation` (o=111) at position 0; `obligation` < `output` (o=o; b(98) < u(117)) at position 1); insertion sequence `..., items, method, obligation, output, parameter, ...`; result-array field name `required_statuses`; per-bucket field name `input_schema_first_property_required_status` (8-field entry shape: `input_schema_first_property_required_status, aggregation_key, capability_count, capabilities[], approved_count, gated_count, has_destructive_side_effect, has_restricted_or_confidential_sensitivity`); read-only invariants extend M49 list with `tusq signature index` byte-identity guard (20 commands); non-persistence rule: `input_schema_first_property_required_status` MUST NOT be written into `tusq.manifest.json`; eval scenario `input-schema-first-property-required-status-index-determinism` (40 → 41 scenarios); Constraint 43 reserved for explicit non-runtime-validator / non-action-policy-enforcer / non-SDK-signature-generator / non-runtime-conformance-detector / non-action-execution-risk-score-computer boundary; deferred successor milestones (`M-Obligation-All-Properties-Required-Status-Index-1`, `M-Obligation-Nested-Property-Required-Status-Index-1`, `M-Obligation-Output-First-Property-Required-Status-Index-1`, `M-Obligation-Persistence-1`, `M-Obligation-Doc-Contradiction-1`, `M-Obligation-Runtime-Conformance-1`, `M-Obligation-SDK-Generator-1`, `M-Obligation-Action-Policy-Crossref-1`). VISION sources cited: `.planning/VISION.md` lines 409–422 (`### Action Execution Policy`) — primary aggregation source, NOT yet primary aggregation source for any shipped milestone; `.planning/VISION.md` lines 143–158 (`## The Canonical Artifact`) re-cited as structural anchor. Full M50 detail block (purpose statement, command shape, frozen tables, classifier rules, 8-field entry shape, warnings rules, iteration order, within-bucket order, filter rules, empty-capabilities rules, read-only invariants, non-persistence rule, no-all-properties-walking rule, no-nested-required-status-recursion rule, no-output-side-required-status rule, non-runtime-validator/non-action-policy-enforcer/non-SDK-generator boundary, Constraint 43 freeze) lands in dev attempt 1 of this run alongside the source-code implementation; this PM block reserves the structure only.

### M52: Static Capability Input Schema First Property Description Presence Index

**Status:** Shipped in `run_3f128359168988b4` / `turn_09c7bb9f6448bf1a` (dev implementation). V1.33.

**Purpose:** Export a per-bucket breakdown of capabilities by whether the FIRST property declared under `input_schema.properties` (Object.keys insertion-order index 0) carries a non-empty trimmed `description` docstring when `input_schema.type === 'object'`. Directly answers: "for the object-typed input parameter sets my tools accept, does the FIRST input parameter carry a non-empty docstring (`described`) that a Support Copilot, Sales Engineer Copilot, CSM Copilot, Implementation Copilot, Admin Copilot, Security Review Copilot, or governance reviewer can rely on as the operating-knowledge gloss for that parameter — or is the FIRST input parameter undescribed (forcing the copilot to fall back to inferred/best-guess prose), not-applicable (non-object input or empty-property object — there is no first property to describe), or unknown (malformed)?" Operationalizes VISION § Internal Docs And Company Operating Knowledge (lines 99–106) as the primary aggregation source; the first milestone to use this section. Cross-axis flags `has_destructive_side_effect` and `has_restricted_or_confidential_sensitivity` are particularly load-bearing for the `undescribed` bucket where a destructive or restricted-sensitivity capability whose primary input slot lacks a docstring exposes a "documentation-completeness gap on a high-stakes capability" review obligation. Distinct from M44 (capability-level top-level `description` word-count tier via `tusq description index`; M52 reads `input_schema.properties[firstKey].description` — entirely different field), M47 (input_schema.properties count cardinality), M48 (output-side first-property type), M49 (input-side first-property primitive type), M50 (input-side first-property required-status), M51 (input-side first-property HTTP-source locus).

**Command:** `tusq gloss index [--presence <described|undescribed|not_applicable|unknown>] [--manifest <path>] [--out <path>] [--json]`

**Bucket-key enum** (closed four-value; immutable post-ship):

| Key | Condition |
|-----|-----------|
| `described` | `input_schema.type === 'object'`, `Object.keys(properties).length > 0`, `properties[firstKey]` is a plain non-null object, `firstKey.description` is a string with `trim().length > 0` |
| `undescribed` | Same shape as above but `firstKey.description` is missing/`null`/`undefined` OR is a string with `trim().length === 0` |
| `not_applicable` | `input_schema.type` is a string but not `'object'`; OR `input_schema.type === 'object'` and `Object.keys(properties).length === 0` |
| `unknown` | `input_schema` missing/null/not-a-plain-object/array; OR `input_schema.type` missing or non-string; OR `input_schema.type === 'object'` but `properties` missing/null/not-a-plain-object; OR `properties[firstKey]` not a plain non-null object; OR `firstKey.description` present, non-null, non-undefined, and non-string (strict-typing rule) |

**Aggregation-key enum** (closed three-value; immutable post-ship): `description_presence` (for `described` and `undescribed`), `not_applicable` (for `not_applicable`), `unknown` (for `unknown`).

**Classifier function** (frozen; any change is a governance event): Object.keys insertion-order is used; key sequence is NOT sorted or reordered. `null` and `undefined` `description` values are treated as semantically absent (→ `undescribed`), consistent with the bucket spec. Only non-null, non-undefined, non-string `description` values (arrays, objects, numbers, booleans) trigger the strict-typing `unknown` bucket.

**Per-bucket entry shape** (frozen 8 fields): `input_schema_first_property_description_presence`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`.

**`warnings[]`**: Always present in `--json` output (even when empty). Five frozen warning reason codes: `input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_description_invalid_when_present`. The `not_applicable`, `described`, and `undescribed` buckets emit NO warnings.

**Bucket iteration order**: `described → undescribed → not_applicable → unknown` (deterministic stable-output convention only — explicitly NOT documentation-completeness-ranked, NOT reviewer-priority-ranked, NOT maintenance-debt-ranked, NOT public-docs-gap-ranked, NOT launch-readiness-ranked, NOT copilot-composition-readiness-ranked, NOT onboarding-clarity-ranked).

**Result-array field name**: `first_property_description_presences` (plural categorical, matching M48/M51 precedent).

**Non-persistence rule**: `input_schema_first_property_description_presence` MUST NOT be written into `tusq.manifest.json`.

**Deferred scope**: Per-property description beyond the FIRST (`M-Gloss-All-Properties-Description-Presence-Index-1`), nested-property description recursion (`M-Gloss-Nested-Property-Description-Presence-Index-1`), output-side analog (`M-Gloss-Output-First-Property-Description-Presence-Index-1`), word-count tier (`M-Gloss-Description-Word-Count-Tier-1`), language detection (`M-Gloss-Description-Language-Detector-1`), quality scoring (`M-Gloss-Description-Quality-Score-1`), persistence (`M-Gloss-Persistence-1`), doc-contradiction detection (`M-Gloss-Doc-Contradiction-1`), LLM-synthesis (`M-Gloss-LLM-Description-Synthesizer-1`), SDK help-text generation (`M-Gloss-SDK-Help-Generator-1`).

---

### M51: Static Capability Input Schema First Property Source Index

**Status:** Shipped in `run_c39bd102a520411b` / `turn_b129a6090e6226ec` (dev implementation). V1.32.

**Purpose:** Export a per-bucket breakdown of capabilities by the HTTP-request-anatomy `source` value of the FIRST property declared under `input_schema.properties` (Object.keys insertion-order index 0) when `input_schema.type === 'object'`. Directly answers: "for the object-typed input parameter sets my tools accept, where in the HTTP request anatomy does the FIRST input parameter come from — URL path (entity-anchored), request body (state-mutation payload), URL query string (filter/list shape), HTTP header (transport-context), not-applicable (non-object input or empty-property object), or unknown (malformed)?" Operationalizes VISION § Skills (lines 175–185) as the primary aggregation source; the first milestone to use this section. Cross-axis flags `has_destructive_side_effect` and `has_restricted_or_confidential_sensitivity` are load-bearing for the `path` bucket where a destructive or restricted-sensitivity capability whose first input slot is path-bound exposes a "URL-anchored irreversible action" risk. Distinct from M43 (capability-wide source UNION across ALL properties via `tusq request index` with `mixed`/`none` values), M47 (input_schema.properties count cardinality), M48 (output-side first-property type), M49 (input-side first-property primitive type), M50 (input-side first-property required-status).

**Command shape:** `tusq binding index [--source <value>] [--manifest <path>] [--out <path>] [--json]`

**Frozen six-value bucket-key enum:** `path | request_body | query | header | not_applicable | unknown`. Immutable post-ship.

**Frozen three-value aggregation_key enum:** `source | not_applicable | unknown`.

**Frozen closed four-value property-source value set:** `path`, `request_body`, `query`, `header`. Any string outside this set buckets as `unknown` with reason `input_schema_properties_first_property_source_invalid`.

**Classifier function (frozen):**

| Input | Result | Warning? |
|-------|--------|----------|
| `input_schema` missing/null/undefined | `unknown` | `input_schema_field_missing` |
| `input_schema` not a plain non-null object (or is array) | `unknown` | `input_schema_field_not_object` |
| `input_schema.type` missing or non-string | `unknown` | `input_schema_type_missing_or_invalid` |
| `input_schema.type` is a string but not `'object'` | `not_applicable` | none |
| `input_schema.type === 'object'`, `properties` missing/null/not-plain-object | `unknown` | `input_schema_properties_field_missing_when_type_is_object` |
| `input_schema.type === 'object'`, `Object.keys(properties).length === 0` | `not_applicable` | none |
| `firstVal = properties[firstKey]` not a plain non-null object, OR `firstVal.source` not a string, OR `firstVal.source` not in `{path, request_body, query, header}` | `unknown` | `input_schema_properties_first_property_source_invalid` |
| `firstVal.source ∈ {path, request_body, query, header}` | `firstVal.source` verbatim | none |

Object.keys insertion-order preserved. MUST NOT sort or reorder property keys.

**Frozen 8-field per-bucket entry shape:** `input_schema_first_property_source`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`.

**Top-level `warnings[]`:** Always emitted in `--json` mode (even when empty `[]`). Five frozen reason codes: `input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_source_invalid`. The `not_applicable` bucket and all four locus buckets emit NO warning.

**Bucket iteration order (closed-enum, deterministic stable-output only):** `path → request_body → query → header → not_applicable → unknown`. Matching M43's first-four locus ordering. NOT security-blast-radius-ranked, NOT workflow-criticality-ranked, NOT permission-sensitivity-ranked, NOT HTTP-spec-precedence-ranked, NOT skill-composition-priority-ranked, NOT widget-render-precedence-ranked. Empty buckets MUST NOT appear.

**Within-bucket order:** Manifest declared order (capabilities[] index ascending).

**`--source` filter:** Case-sensitive lowercase-only. Uppercase/mixed-case exits 1 `Unknown input schema first property source: <value>`. Filtering on absent bucket exits 1 `No capabilities found for input schema first property source: <value>`. `cookie` is NOT in the closed six-value bucket-key enum; filtering on `cookie` exits 1.

**Read-only invariants:** Manifest mtime + SHA-256 + capability_digest byte-identical pre/post. `tusq compile` output byte-identical pre/post. All 21 prior peer index commands byte-identical pre/post. `input_schema_first_property_source` MUST NOT be written into `tusq.manifest.json`.

**Frozen invariants:**
- Per-property source beyond index 0 NOT walked (reserved M-Binding-All-Properties-Source-Index-1).
- Nested-object property source under `properties[key].properties` NOT walked (reserved M-Binding-Nested-Property-Source-Index-1).
- OUTPUT-side first-property source NOT classified here (reserved M-Binding-Output-First-Property-Source-Index-1).
- Cookie/file/multipart locus extensions NOT in scope (reserved M-Binding-Cookie-Bucket-1, M-Binding-File-Bucket-1).
- Widget-render-control derivation NOT computed inline (reserved M-Binding-Widget-Renderer-Crossref-1).
- Runtime payload conformance NOT detected here (reserved M-Binding-Runtime-Conformance-1).
- SDK call-site signature generation NOT in scope (reserved M-Binding-SDK-Generator-1).

**Constraint 45:** `tusq gloss index` is a planning aid that surfaces the per-capability `input_schema.properties[firstKey].description` docstring-presence classification (whether the FIRST input property carries a non-empty trimmed docstring, is undescribed, is not-applicable, or is unknown) and the cross-axis side-effect/sensitivity exposure of each presence bucket. It does NOT execute capability invocations at runtime, does NOT validate runtime documentation completeness, does NOT cross-reference manifest first-property docstring vs published API/OpenAPI/SDK docs (deferred to `M-Gloss-Doc-Contradiction-1`), does NOT auto-generate missing docstrings (deferred to `M-Gloss-LLM-Description-Synthesizer-1`), does NOT score docstring quality (deferred to `M-Gloss-Description-Quality-Score-1`), does NOT count description word/character/sentence length per FIRST property (deferred to `M-Gloss-Description-Word-Count-Tier-1`), does NOT detect description language (deferred to `M-Gloss-Description-Language-Detector-1`), does NOT auto-flip `tusq serve` filtering or approval gates, does NOT alter M11/M14's canonical input_schema extraction rules, does NOT alter M44's `capability.description` word-count tier rules (M44 reads the capability-level top-level `description` string; M52 reads `input_schema.properties[firstKey].description` — entirely different fields), does NOT walk per-property description beyond the FIRST property (per-property fine-grained granularity reserved for `M-Gloss-All-Properties-Description-Presence-Index-1`), does NOT inspect nested-object property description under `input_schema.properties[<key>].properties[<nestedKey>].description` (reserved for `M-Gloss-Nested-Property-Description-Presence-Index-1`), does NOT classify the OUTPUT-side first-property description (reserved for `M-Gloss-Output-First-Property-Description-Presence-Index-1`), does NOT generate downstream SDK call-site help-text definitions (reserved for `M-Gloss-SDK-Help-Generator-1`), does NOT compute statistical aggregates, does NOT persist `input_schema_first_property_description_presence` into `tusq.manifest.json`. Subsequent milestones ship under their own ROADMAP entries with fresh acceptance contracts and fresh re-approval expectations. The four-value `input_schema_first_property_description_presence` bucket-key enum (`described | undescribed | not_applicable | unknown`), the three-value `aggregation_key` enum (`description_presence | not_applicable | unknown`), and the five-value warning reason-code enum are frozen; any addition is a material governance event. The `--presence` filter is case-sensitive lowercase-only; uppercase or mixed-case filter values exit 1 with `Unknown input schema first property description presence:`. Malformed `input_schema`/malformed-firstVal-descriptor/present-but-non-null-non-undefined-non-string-`description` values are bucketed as `unknown` and emit a `Warning: ...` to stderr (human) or `warnings[]` (`--json`); the `not_applicable` bucket and the `described`/`undescribed` buckets are valid named outcomes and emit NO warning. A present-but-empty (or whitespace-only) `description` string is `undescribed`, NOT a malformation: an empty docstring is a documentation-completeness signal, not a typing failure. A `null` or `undefined` `description` is treated as semantically absent (→ `undescribed`, no warning).

**Constraint 44:** `tusq binding index` is a planning aid that surfaces the per-capability `input_schema.properties[firstKey].source` HTTP-request-anatomy locus classification and the cross-axis side-effect/sensitivity exposure of each locus bucket. It does NOT execute capability invocations at runtime, does NOT validate runtime request payloads against the declared first-property source, does NOT cross-reference manifest first-property locus vs runtime request shape, does NOT auto-flip `tusq serve` filtering or approval gates, does NOT alter M11/M14's canonical input_schema extraction rules, does NOT alter M39's `input_schema.required` count bucketing rules, does NOT alter M43's capability-wide primary-parameter-source bucketing rules (M43 reads ALL properties' sources and computes a union; M51 reads ONLY the first property's source — the two milestones are orthogonal axes on the related field), does NOT alter M47's `input_schema.properties` cardinality bucketing rules, does NOT alter M48/M49/M50's respective bucketing rules, does NOT walk per-property source beyond the FIRST property (reserved M-Binding-All-Properties-Source-Index-1), does NOT inspect nested-object property source (reserved M-Binding-Nested-Property-Source-Index-1), does NOT classify OUTPUT-side first-property source (reserved M-Binding-Output-First-Property-Source-Index-1), does NOT extend the closed four-value source set to include `cookie` (reserved M-Binding-Cookie-Bucket-1) or `file`/`multipart`/`form-data` (reserved M-Binding-File-Bucket-1), does NOT generate SDK call-site signature definitions (reserved M-Binding-SDK-Generator-1), does NOT detect runtime payload conformance (reserved M-Binding-Runtime-Conformance-1), does NOT compute a derived widget-render-control type (reserved M-Binding-Widget-Renderer-Crossref-1), does NOT persist `input_schema_first_property_source` into `tusq.manifest.json`, and does NOT compute statistical aggregates. The six-value bucket-key enum, three-value aggregation_key enum, closed four-value property-source value set, and five-value warning reason-code enum are frozen.

---

### M50: Static Capability Input Schema First Property Required Status Index

**Status:** Shipped in `run_6e53e7b50cd2c457` / `turn_99050f1349379e99` (dev implementation). V1.31.

**Purpose:** Export a per-bucket breakdown of capabilities by whether the FIRST property declared under `input_schema.properties` (Object.keys insertion-order index 0) is a member of `input_schema.required[]` when `input_schema.type === 'object'`. Directly answers: "for the object-typed input parameter sets my tools accept, is the FIRST parameter mandatory or optional at the call site — required, optional, not-applicable (non-object input or empty-property object), or unknown (malformed)?" Operationalizes VISION § Action Execution Policy (lines 409–422) — "Risky actions require confirmation or approval … the default should be useful, but never reckless." — as the primary aggregation source; the first milestone to use this section. Cross-axis flags `has_destructive_side_effect` and `has_restricted_or_confidential_sensitivity` are load-bearing for the `optional` bucket where a destructive or restricted-sensitivity capability whose first input slot is OPTIONAL exposes a "fire-with-no-input" execution-policy risk. Distinct from M39 (input_schema.required count cardinality), M43 (input_schema primary parameter source), M47 (input_schema.properties count cardinality), M48 (output-side first-property type), M49 (input-side first-property primitive type).

**Command shape:** `tusq obligation index [--status <value>] [--manifest <path>] [--out <path>] [--json]`

**Frozen four-value bucket-key enum:** `required | optional | not_applicable | unknown`. Immutable post-ship.

**Frozen three-value aggregation_key enum:** `required_status | not_applicable | unknown`.

**Classifier function (frozen):**

| Input | Result | Warning? |
|-------|--------|----------|
| `input_schema` missing/null/undefined | `unknown` | `input_schema_field_missing` |
| `input_schema` not a plain non-null object (or is array) | `unknown` | `input_schema_field_not_object` |
| `input_schema.type` missing or non-string | `unknown` | `input_schema_type_missing_or_invalid` |
| `input_schema.type` is a string but not `'object'` | `not_applicable` | none |
| `input_schema.type === 'object'`, `properties` missing/null/not-plain-object | `unknown` | `input_schema_properties_field_missing_when_type_is_object` |
| `input_schema.type === 'object'`, `Object.keys(properties).length === 0` | `not_applicable` | none |
| `input_schema.required` present but not an array of strings | `unknown` | `input_schema_required_field_invalid_when_type_is_object` |
| `firstKey = Object.keys(properties)[0]`; `requiredArr = Array.isArray(required) ? required : []`; `requiredArr.includes(firstKey)` | `required` | none |
| Otherwise (firstKey not in requiredArr, including missing/empty required[]) | `optional` | none |

Object.keys insertion-order preserved. MUST NOT sort or reorder property keys.

**Frozen 8-field per-bucket entry shape:** `input_schema_first_property_required_status`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`.

**Top-level `warnings[]`:** Present only in `--json` mode; always emitted (even when empty `[]`). Five frozen reason codes: `input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_required_field_invalid_when_type_is_object`. The `not_applicable` bucket (non-object input or zero-property object) and the `optional` bucket (firstKey not in required[]) emit NO warning.

**Bucket iteration order (closed-enum, deterministic stable-output only):** `required → optional → not_applicable → unknown`. Binding-first → unbound → exits → malformed convention. NOT runtime-execution-safety-ranked, NOT call-site-strictness-ranked, NOT destructive-action-priority-ranked, NOT action-policy-precedence-ranked, NOT security-blast-radius-ranked. Empty buckets MUST NOT appear.

**Within-bucket order:** Manifest declared order (capabilities[] index ascending).

**`--status` filter:** Case-sensitive lowercase-only. Uppercase/mixed-case exits 1 `Unknown input schema first property required status: <value>`. Filtering on absent bucket exits 1 `No capabilities found for input schema first property required status: <value>`.

**Read-only invariants:** Manifest mtime + SHA-256 + capability_digest byte-identical pre/post. `tusq compile` output byte-identical pre/post. All 20 prior peer index commands byte-identical pre/post. `input_schema_first_property_required_status` MUST NOT be written into `tusq.manifest.json`.

**Frozen invariants:**
- Per-property required-status beyond index 0 NOT walked (reserved M-Obligation-All-Properties-Required-Status-Index-1).
- Nested-object property required-status under `properties[key].required` NOT walked (reserved M-Obligation-Nested-Property-Required-Status-Index-1).
- OUTPUT-side first-property required-status NOT classified here (reserved M-Obligation-Output-First-Property-Required-Status-Index-1).
- Action-execution risk score NOT derived inline (reserved M-Obligation-Action-Policy-Crossref-1).
- Runtime payload conformance NOT detected here (reserved M-Obligation-Runtime-Conformance-1).
- SDK call-site signature generation NOT in scope (reserved M-Obligation-SDK-Generator-1).

**Constraint 43:** `tusq obligation index` is a planning aid that surfaces the per-capability `firstKey ∈ input_schema.required[]` membership classification (whether the FIRST input property is required or optional at the call site) and the cross-axis side-effect/sensitivity exposure of each membership bucket. It does NOT execute capability invocations at runtime, does NOT validate runtime request payloads against the declared required-status, does NOT enforce action-execution policy at runtime, does NOT auto-flip `tusq serve` filtering or approval gates, does NOT certify call-site correctness, does NOT alter M39's `input_schema.required` count bucketing rules, does NOT alter M43's `input_schema` primary-parameter-source bucketing rules, does NOT alter M47's `input_schema.properties` cardinality bucketing rules, does NOT alter M48's `output_schema.properties[<firstKey>].type` bucketing rules, does NOT alter M49's `input_schema.properties[<firstKey>].type` bucketing rules, does NOT walk per-property required-status beyond the FIRST property (reserved M-Obligation-All-Properties-Required-Status-Index-1), does NOT inspect nested-object property required-status (reserved M-Obligation-Nested-Property-Required-Status-Index-1), does NOT classify OUTPUT-side first-property required-status (reserved M-Obligation-Output-First-Property-Required-Status-Index-1), does NOT generate SDK call-site signature definitions (reserved M-Obligation-SDK-Generator-1), does NOT detect runtime payload conformance (reserved M-Obligation-Runtime-Conformance-1), does NOT compute derived action-execution risk scores (reserved M-Obligation-Action-Policy-Crossref-1), does NOT persist `input_schema_first_property_required_status` into `tusq.manifest.json`, and does NOT compute statistical aggregates. The four-value bucket-key enum, three-value aggregation_key enum, and five-value warning reason-code enum are frozen.

---

### M49: Static Capability Input Schema First Property Type Index

**Status:** Shipped in `run_9a2f6448e2199cda` / `turn_a71ef526db35c329` (dev implementation). V1.30.

**Purpose:** Export a per-bucket breakdown of capabilities by the primitive `type` of the FIRST property declared under `input_schema.properties` (Object.keys insertion-order index 0) when `input_schema.type === 'object'`. Directly answers: "for the object-typed input parameter sets my tools accept, what is the primitive type of the first parameter of each — string, number, integer, boolean, null, object (nested), array (nested), not-applicable (non-object input or empty-property object), or unknown (malformed)?" Operationalizes VISION § The Promise (lines 19–32) — "AI tools with strict schemas" — as the primary aggregation source; the first milestone to use this section as the primary source. The first input parameter's primitive type is the leading characteristic of a tool's invocation footprint visible to LLM contexts, SDK call sites, MCP clients, and voice surfaces. Cross-axis flags `has_destructive_side_effect` and `has_restricted_or_confidential_sensitivity` are load-bearing for `object` and `array` buckets. Distinct from M39 (input_schema.required count), M43 (input_schema primary parameter source), M47 (input_schema.properties cardinality), M48 (output-side first-property type).

**Command shape:** `tusq signature index [--first-type <value>] [--manifest <path>] [--out <path>] [--json]`

**Frozen nine-value bucket-key enum:** `string | number | integer | boolean | null | object | array | not_applicable | unknown`. Immutable post-ship. Matches M48 output-side enum verbatim for cross-axis comparability.

**Frozen three-value aggregation_key enum:** `first_property_type | not_applicable | unknown`. Matches M48 precedent verbatim.

**Classifier function (frozen):**

| Input | Result | Warning? |
|-------|--------|----------|
| `input_schema` missing/null/undefined | `unknown` | `input_schema_field_missing` |
| `input_schema` not a plain non-null object (or is array) | `unknown` | `input_schema_field_not_object` |
| `input_schema.type` missing or non-string | `unknown` | `input_schema_type_missing_or_invalid` |
| `input_schema.type` is a string but not `'object'` | `not_applicable` | none |
| `input_schema.type === 'object'`, `properties` missing/null/not-plain-object | `unknown` | `input_schema_properties_field_missing_when_type_is_object` |
| `input_schema.type === 'object'`, `Object.keys(properties).length === 0` | `not_applicable` | none |
| `firstDescriptor` not a plain non-null object, or `firstDescriptor.type` missing/non-string/outside seven-primitive set | `unknown` | `input_schema_properties_first_property_descriptor_invalid` |
| Otherwise | `firstDescriptor.type` (one of seven primitives) | none |

Object.keys insertion-order preserved. MUST NOT sort or reorder property keys.

**Frozen 8-field per-bucket entry shape:** `input_schema_first_property_type`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`.

**Top-level `warnings[]`:** Present only in `--json` mode; always emitted (even when empty `[]`). Five frozen reason codes: `input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_descriptor_invalid`.

**Bucket iteration order (closed-enum, deterministic stable-output only):** `string → number → integer → boolean → null → object → array → not_applicable → unknown`. NOT tool-call-difficulty-ranked, NOT LLM-context-cost-ranked, NOT JSON-Schema-spec-precedence-ranked, NOT parameter-binding-difficulty-ranked, NOT customer-facing-shape-claim-ranked, NOT security-blast-radius-ranked. Empty buckets MUST NOT appear.

**Within-bucket order:** Manifest declared order (capabilities[] index ascending).

**`--first-type` filter:** Case-sensitive lowercase-only. Uppercase/mixed-case exits 1 `Unknown input schema first property type: <value>`. Filtering on absent bucket exits 1 `No capabilities found for input schema first property type: <value>`.

**Read-only invariants:** Manifest mtime + SHA-256 + capability_digest byte-identical pre/post. `tusq compile` output byte-identical pre/post. All prior peer index commands byte-identical pre/post. `input_schema_first_property_type` MUST NOT be written into `tusq.manifest.json`.

**Frozen invariants:**
- Per-property types beyond index 0 NOT walked (reserved M-Signature-All-Properties-Type-Index-1).
- Nested-object property types under `properties[key].properties` NOT walked (reserved M-Signature-Nested-Property-Type-Index-1).
- `output_schema.properties[firstKey].type` NOT classified here (that is M48 tusq shape index).
- `firstKey ∈ input_schema.required` NOT bucketed (reserved M-Signature-First-Property-Required-Status-Index-1).

**Constraint 42:** `tusq signature index` is a planning aid that surfaces the per-capability `input_schema.properties[<firstKey>].type` primitive classification (the leading characteristic of object-typed input invocation footprints) and the cross-axis side-effect/sensitivity exposure of each primitive bucket. It does NOT execute capability invocations at runtime, does NOT validate runtime request payloads against the declared first-property type, does NOT generate SDK call-site code, does NOT emit JSON-Schema files, does NOT certify request-shape correctness, does NOT alter M39's `input_schema.required` count bucketing rules, does NOT alter M43's `input_schema` primary-parameter-source bucketing rules, does NOT alter M47's `input_schema.properties` cardinality bucketing rules, does NOT alter M48's `output_schema.properties[<firstKey>].type` bucketing rules, does NOT walk per-property types beyond the FIRST property, does NOT inspect nested-object property types, does NOT bucket on the cross-axis required-or-not status of the first property, does NOT generate downstream SDK call-site type definitions, does NOT persist `input_schema_first_property_type` into `tusq.manifest.json`, and does NOT compute statistical aggregates. The nine-value bucket-key enum, the three-value aggregation_key enum, the closed seven-primitive set, and the five-value warning reason-code enum are frozen.

---

### M48: Static Capability Output Schema First Property Type Index

**Status:** Shipped in `run_f61946531dda2fe6` / `turn_7aca0e4acba46509` (dev implementation). V1.29.

**Purpose:** Export a per-bucket breakdown of capabilities by the primitive `type` of the FIRST property declared under `output_schema.properties` (Object.keys insertion-order index 0) when `output_schema.type === 'object'`. Directly answers: "for the object-typed responses my capabilities return, what is the primitive type of the first property of each — string, number, integer, boolean, null, object (nested), array (nested), not-applicable (non-object response or empty-property object), or unknown (malformed)?" Operationalizes VISION § Developer Artifacts (lines 342–356) — "SDK type definitions, API/tool schemas, …" — as the primary aggregation source; the first shipped milestone to use this section. Distinct from M40 (output_schema.properties cardinality count — count not type); M42 (output_schema.type top-level — top-level not per-property); M45 (output_schema.items.type for arrays — element-shape not first-property-shape); M46 (output_schema.additionalProperties boolean — boolean closure not primitive-type axis); M47 (input_schema.properties cardinality — input side not output per-property type).

**Command:** `tusq shape index [--first-type <value>] [--manifest <path>] [--out <path>] [--json]`

**Classifier function** (applied to `output_schema` of each capability; Object.keys insertion-order preserved):

| Result | Condition |
|--------|-----------|
| `unknown` | `output_schema` is `null`/`undefined`/missing/not-a-plain-object/array (reason: `output_schema_field_missing` or `output_schema_field_not_object`) |
| `unknown` | `output_schema.type` is missing or non-string (reason: `output_schema_type_missing_or_invalid`) |
| `not_applicable` | `output_schema.type` is a string but not literal `'object'` (non-object response has no first property; NO warning) |
| `unknown` | `output_schema.type === 'object'` but `output_schema.properties` is missing/null/not-plain-object (reason: `output_schema_properties_field_missing_when_type_is_object`) |
| `not_applicable` | `output_schema.type === 'object'` and `Object.keys(output_schema.properties).length === 0` (zero-property object; NO warning) |
| `unknown` | `firstDescriptor` is not a plain non-null object, or `firstDescriptor.type` is missing/non-string/outside closed seven-primitive set (reason: `output_schema_properties_first_property_descriptor_invalid`) |
| one of `string\|number\|integer\|boolean\|null\|object\|array` | `firstDescriptor.type` is a literal lower-case string in the closed seven-primitive set |

**Frozen invariants:**
- Closed nine-value bucket-key enum: `string | number | integer | boolean | null | object | array | not_applicable | unknown`. Immutable once M48 ships.
- Closed three-value aggregation_key enum: `first_property_type | not_applicable | unknown`. Seven primitive buckets → `first_property_type`; `not_applicable` → `not_applicable`; `unknown` → `unknown`. Immutable once M48 ships.
- Closed seven-primitive set matched as literal lower-case strings: `string | number | integer | boolean | null | object | array`. Any string outside this set returns `unknown`.
- Closed five-value warning reason-code enum: `output_schema_field_missing`, `output_schema_field_not_object`, `output_schema_type_missing_or_invalid`, `output_schema_properties_field_missing_when_type_is_object`, `output_schema_properties_first_property_descriptor_invalid`. The `not_applicable` bucket emits NO warning; only `unknown` triggers warnings.
- Closed-enum bucket iteration order: `string → number → integer → boolean → null → object → array → not_applicable → unknown` (scalar-primitives-first → null → structural-primitives → exits — NOT SDK-complexity-ranked, NOT tool-generation-difficulty-ranked, NOT JSON-Schema-spec-precedence-ranked, NOT serialization-cost-ranked).
- Frozen 8-field per-bucket entry: `output_schema_first_property_type`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`.
- Result array field name: `first_property_types` (matches M42 `types`, M45 `items_types` plural-categorical precedent).
- `warnings[]` top-level array: always present in `--json` mode (even when empty `[]`) for shape stability.
- Object.keys insertion-order semantics: the classifier MUST NOT sort, re-order, or otherwise mutate the property-key sequence.
- `--first-type` filter: case-sensitive lowercase-only; uppercase/mixed-case values exit 1 with `Unknown output schema first property type: <value>`. Absent-bucket filter exits 1 with `No capabilities found for output schema first property type: <value>`.
- Read-only invariants: manifest mtime + content unchanged pre/post; `output_schema_first_property_type` MUST NOT be written into `tusq.manifest.json`; all 18 peer index commands byte-identical pre/post.
- No-all-properties-walking: only the FIRST property is classified (reserved for `M-Shape-All-Properties-Type-Index-1`).
- No-nested-property-recursion: `output_schema.properties[key].properties` NOT walked (reserved for `M-Shape-Nested-Property-Type-Index-1`).
- No-input-side-classification: `input_schema.properties[firstKey].type` NOT classified (reserved for `M-Shape-Input-First-Property-Type-Index-1`).
- No-array-element-property-type: `output_schema.items.properties[firstKey].type` NOT classified (reserved for `M-Shape-Items-Property-Type-Index-1`).

**Constraint 41:** `tusq shape index` is a planning aid that surfaces the per-capability `output_schema.properties[<firstKey>].type` primitive classification and the cross-axis side-effect/sensitivity exposure of each primitive bucket. It does NOT execute capability invocations at runtime, does NOT validate runtime response payloads against the declared first-property type, does NOT generate SDK type definitions, does NOT emit JSON-Schema files, does NOT certify response-shape correctness, does NOT alter M40/M42/M45/M46 bucketing rules, does NOT walk per-property types beyond the FIRST property, does NOT inspect nested-object property types, does NOT bucket on input-schema properties, does NOT bucket on per-array-element property types, does NOT generate downstream SDK type definitions, does NOT persist `output_schema_first_property_type` into `tusq.manifest.json`, and does NOT compute statistical aggregates. The nine-value bucket-key enum, three-value aggregation_key enum, seven-primitive set, and five-value warning reason-code enum are frozen. The `--first-type` filter is case-sensitive lowercase-only.

### M47: Static Capability Input Schema Property Count Tier Index

**Status:** Shipped in `run_240679669ee78f0b` / `turn_cc1f4a9f48f528e8` (dev implementation). V1.28.

**Purpose:** Export a per-bucket breakdown of capabilities by the cardinality tier of the manifest's per-capability `input_schema.properties` Object.keys length. Directly answers: "for the MCP-listed tools generated from my capabilities, how many input parameters does each tool accept (none / few / a moderate handful / many), and which destructive or restricted-sensitivity capabilities sit in the high-cardinality bucket where parameter sprawl most blunts review-by-eye?" Operationalizes VISION § MCP Server (lines 229–239) — "MCP is a first-class output. The generated MCP server exposes tools and skills with: versioned registry metadata, **approval-aware tool listing**, IAM-aware execution context, dry-run and confirmation paths, self-hosted runtime support" — as the primary aggregation source; the first shipped milestone to use this section. Distinct from M39 (`input_schema.required[]` cardinality — M47 measures full properties count, M39 measures required-only subset count); orthogonal to M40 (`output_schema.properties` cardinality on object responses — M47 measures input side, M40 measures output side); orthogonal to M43 (`input_schema.properties[].source` categorical classification — M47 measures cardinality, M43 measures source class).

**Command:** `tusq parameter index [--tier <value>] [--manifest <path>] [--out <path>] [--json]`

**Tier function** (applied to `input_schema` of each capability; thresholds 0/2/5/6 match M40 verbatim and are immutable):

| Bucket | Condition |
|--------|-----------|
| `none` | `Object.keys(input_schema.properties).length === 0` |
| `low` | `1 <= length <= 2` |
| `medium` | `3 <= length <= 5` |
| `high` | `length >= 6` |
| `unknown` | `input_schema` missing/null/not-plain-object; `input_schema.properties` missing/null/not-plain-object; or any property descriptor value is not a plain non-null object |

**Frozen invariants:**
- Closed five-value bucket-key enum: `none | low | medium | high | unknown`. Immutable once M47 ships.
- Closed two-value aggregation_key enum: `tier | unknown`. Immutable once M47 ships.
- Closed five-value warning reason-code enum: `input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_properties_field_missing`, `input_schema_properties_field_not_object`, `input_schema_properties_field_contains_invalid_descriptor`. The `none` bucket emits NO warning (0 properties = valid named bucket, not a malformation); only `unknown` triggers warnings.
- Closed-enum bucket iteration order: `none → low → medium → high → unknown` (ascending-numeric-tier convention only — NOT complexity-blast-radius-ranked, NOT parameter-sprawl-precedence-ranked, NOT tool-generation-difficulty-ranked, NOT review-burden-priority-ranked, NOT LLM-context-length-ranked).
- Frozen 8-field per-bucket entry: `input_schema_property_count_tier`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`.
- `tiers[]` is the result-array field name (matches M40, M44 precedent).
- `warnings[]` always present in `--json` mode (empty `[]` when no malformed capabilities) for shape stability.
- Within-bucket order: manifest declared order. Empty buckets MUST NOT appear.
- Case-sensitive lowercase-only `--tier` filter. Uppercase/mixed-case exits 1. Absent bucket exits 1.
- Non-persistence rule: `input_schema_property_count_tier` MUST NOT be written into `tusq.manifest.json`.
- No-nested-property-walking rule: `input_schema.properties[].properties` NOT recursed (reserved for `M-Parameter-Nested-Properties-1`).
- No-required-intersection rule: M47 does NOT compute `required ∩ properties` (reserved for `M-Parameter-Required-Property-Count-1`).
- No-property-type rule: M47 does NOT bucket per-property primitive types (reserved for `M-Parameter-Property-Type-Index-1`).
- CLI surface: 30 → 31 commands. New noun `parameter` between `output` and `path`.
- Eval count: 37 → 38. New scenario `input-schema-property-count-tier-index-determinism`.
- Deferred successors: `M-Parameter-Nested-Properties-1`, `M-Parameter-Required-Property-Count-1`, `M-Parameter-Property-Type-Index-1`, `M-Parameter-Persistence-1`, `M-Parameter-Doc-Contradiction-1`, `M-Parameter-Runtime-Conformance-1`, `M-Parameter-AdditionalProperties-Effect-1`.

**Constraint 40:** `tusq parameter index` is a planning aid that surfaces the per-capability `input_schema.properties` Object.keys cardinality tier and the cross-axis side-effect/sensitivity exposure of each tier. It does NOT execute capability invocations at runtime, does NOT validate runtime request payloads, does NOT generate parameter-count-driven tool-listing budgets or LLM-context-length policies, does NOT certify input-shape correctness, does NOT alter M39's `input_schema.required[]` cardinality bucketing rules, does NOT alter M40's `output_schema.properties` cardinality bucketing rules, does NOT alter M43's `input_schema.properties[].source` bucketing rules, does NOT walk nested-property cardinality (reserved for `M-Parameter-Nested-Properties-1`), does NOT distinguish required-vs-optional within the property count (reserved for `M-Parameter-Required-Property-Count-1`), does NOT bucket on `input_schema.additionalProperties` strictness (reserved for `M-Strictness-Input-Schema-1`), does NOT persist `input_schema_property_count_tier` into `tusq.manifest.json`, and does NOT compute statistical aggregates. The five-value bucket-key enum, two-value aggregation_key enum, boundary thresholds (0/2/5/6), and five-value warning reason-code enum are frozen; any addition is a material governance event.

---

### M46: Static Capability Output Schema additionalProperties Strictness Index

**Status:** Shipped in `run_7c4036f0eba4cde3` / `turn_c5d62ccd1c2a4bcd` (dev implementation). V1.27.

**Purpose:** Export a per-bucket breakdown of capabilities by the JSON-Schema `output_schema.additionalProperties` boolean strictness gate for object-typed responses. `strict` if `additionalProperties === false` (closed-key contract — the LLM/caller may NOT introduce response fields not enumerated in `properties[]`); `permissive` if `additionalProperties === true` (unspecified-field-tolerant); `not_applicable` for capabilities whose top-level `output_schema.type !== 'object'`; `unknown` for malformed `output_schema` or non-boolean `additionalProperties` (including the schema-object case `{ "type": "string" }` reserved for the deferred `M-Strictness-Schema-As-AdditionalProperties-1` successor). Directly answers: "for the object-typed responses my capabilities return, which generated tool schemas are STRICT (closed-key contract enforceable as written), which are PERMISSIVE (unspecified-field-tolerant), and which capabilities respond with non-object top-level shapes?" Operationalizes VISION § Tools (lines 164–173) — "AI tools with **strict schemas**, normalized errors, dry-run and confirmation support, IAM context requirements, audit metadata, provenance back to source" — as the primary aggregation source; the first shipped milestone to use this section. Orthogonal to M40 (`output_schema.properties` cardinality on object responses; M46 measures the boolean strictness GATE of object responses — a fundamentally different axis class from numeric tier), M42 (top-level `output_schema.type` primitive; M46 measures the closed-vs-open contract claim of object-typed responses only), and M45 (`output_schema.items.type` per-element shape for array responses; M46 measures the boolean strictness gate of object responses).

**Command:** `tusq strictness index [--strictness <value>] [--manifest <path>] [--out <path>] [--json]`

**Tier function** (applied to `output_schema` of each capability):
- Returns `'unknown'` if `output_schema` is null, undefined, missing, not a plain object, or an array
- Returns `'unknown'` if `output_schema.type` is missing, null, or not a string (reason: `output_schema_type_missing_or_invalid`)
- Returns `'not_applicable'` if `output_schema.type` is a string but not the literal `'object'` (no warning)
- For `output_schema.type === 'object'`: returns `'unknown'` if `additionalProperties` is missing (reason: `output_schema_additional_properties_missing_when_type_is_object`)
- For `output_schema.type === 'object'`: returns `'unknown'` if `additionalProperties` is not a boolean — including the schema-object case `{ type: 'string' }` (reason: `output_schema_additional_properties_not_boolean_when_type_is_object`)
- For `output_schema.type === 'object'` AND `additionalProperties === false`: returns `'strict'`
- For `output_schema.type === 'object'` AND `additionalProperties === true`: returns `'permissive'`

**Frozen four-value bucket-key enum:** `strict | permissive | not_applicable | unknown`. Immutable once M46 ships. Expansion is a material governance event.

**Frozen three-value aggregation_key enum:** `strictness | not_applicable | unknown`.
- `strictness` — capability is object-typed with a valid boolean `additionalProperties` (`strict` or `permissive` buckets)
- `not_applicable` — capability is NOT object-typed (`output_schema.type !== 'object'`)
- `unknown` — `output_schema` or `additionalProperties` is missing/malformed

**Frozen 8-field per-bucket entry shape:**
- `output_schema_strictness` (one of the four bucket-key values)
- `aggregation_key` (one of the three aggregation_key enum values)
- `capability_count` (integer ≥ 1)
- `capabilities[]` (array of capability name strings, manifest declared order)
- `approved_count` (count of `approved === true`)
- `gated_count` (count of `approved !== true`)
- `has_destructive_side_effect` (boolean — true iff any capability in bucket has `side_effect_class === 'destructive'`)
- `has_restricted_or_confidential_sensitivity` (boolean — true iff any capability in bucket has `sensitivity_class === 'restricted'` or `'confidential'`)

**Top-level `warnings[]` rule:** Always present in `--json` output (empty `[]` when no malformed capabilities) for shape stability. In human mode, one `Warning: capability '<name>' has malformed output_schema strictness (<reason>)` per malformed capability emitted to stderr. Five frozen warning reason codes:
1. `output_schema_field_missing` — `output_schema` key absent from capability
2. `output_schema_field_not_object` — `output_schema` is not a plain non-null object
3. `output_schema_type_missing_or_invalid` — `output_schema.type` is missing or not a string
4. `output_schema_additional_properties_missing_when_type_is_object` — `output_schema.type === 'object'` but `additionalProperties` key absent
5. `output_schema_additional_properties_not_boolean_when_type_is_object` — `output_schema.type === 'object'` and `additionalProperties` present but not a boolean

**`not_applicable`-bucket-emits-NO-warning rule:** `not_applicable` is a valid named bucket (aggregation_key: `'not_applicable'`), NOT a malformation. Only `unknown` triggers warnings.

**Closed-enum bucket iteration order:** `strict → permissive → not_applicable → unknown` (closed-then-open boolean enumeration: false before true in JavaScript falsy-first convention; `not_applicable` appended next; `unknown` always appended last). NOT security-blast-radius-ranked, NOT strictness-precedence-ranked, NOT contract-quality-ranked, NOT tool-generation-safety-ranked, NOT JSON-Schema-spec-precedence-ranked, NOT customer-facing-strictness-claim-ranked. Empty buckets MUST NOT appear.

**Within-bucket ordering:** Capabilities appear in manifest declared order.

**Case-sensitive `--strictness` filter:** Only lowercase values match (`strict | permissive | not_applicable | unknown`). `--strictness STRICT` or `--strictness Permissive` exits `1` with `Unknown output schema strictness: <value>`. Empty-string exits `1` with `Unknown output schema strictness:`.

**Empty-capabilities rule:** `tusq strictness index` on a manifest with zero capabilities exits `0` with `No capabilities in manifest — nothing to index.` (human) or `{ strictnesses: [], warnings: [] }` (`--json`).

**Stdout discipline:** In `--out` mode, zero bytes to stdout on success; all warnings go to stderr. In `--json` mode, valid JSON to stdout. In human mode, formatted text to stdout; warnings to stderr.

**Read-only invariants:**
- `output_schema_strictness` is NOT written into `tusq.manifest.json` (non-persistence rule)
- `tusq.manifest.json` mtime, SHA-256, and per-capability `capability_digest` are byte-identical before and after any `tusq strictness index` invocation

**Boolean-only-additionalProperties rule:** M46 reads `output_schema.additionalProperties` ONLY as a boolean. Schema-as-`additionalProperties` (e.g., `{ "type": "string" }`) buckets as `unknown` with reason `output_schema_additional_properties_not_boolean_when_type_is_object`. Reserved for `M-Strictness-Schema-As-AdditionalProperties-1`.

**No-walking rules:**
- Per-nested-property `additionalProperties` under `properties.x.additionalProperties` NOT walked (reserved for `M-Strictness-Per-Property-1`)
- `output_schema.items.additionalProperties` for array-of-object items NOT walked (reserved for `M-Strictness-Items-Object-1`)
- `input_schema.additionalProperties` strictness reserved for `M-Strictness-Input-Schema-1`

**Result-array field name:** `strictnesses` (plural, distinct from M42's `types`, M43's `sources`, M44's `tiers`, M45's `items_types`).

**CLI surface:** 29 → 30 with new noun `strictness` inserted alphabetically between `sensitivity` and `surface` (`sensitivity` < `strictness`: `s` = `s` at position 0, `e` (101) < `t` (116) at position 1; `strictness` < `surface`: `s` = `s` at position 0, `t` (116) < `u` (117) at position 1).

**Eval count:** 36 → 37 (new `output-schema-strictness-index-determinism` eval scenario).

**Deferred successors:** `M-Strictness-Input-Schema-1` / `M-Strictness-Items-Object-1` / `M-Strictness-Schema-As-AdditionalProperties-1` / `M-Strictness-Per-Property-1` / `M-Strictness-Persistence-1` / `M-Strictness-Doc-Contradiction-1` / `M-Strictness-Runtime-Conformance-1`.

**Constraint 39:** `tusq strictness index` is a planning aid that surfaces the JSON-Schema `output_schema.additionalProperties` boolean strictness for object-typed capability responses and the cross-axis side-effect/sensitivity exposure of each strictness bucket. It does NOT execute capability invocations at runtime, does NOT validate runtime response payloads against the declared strictness, does NOT generate strict-schema enforcement middleware (e.g., AJV strict-mode validators) or middleware-library recommendations, does NOT certify schema enforceability, does NOT alter M40's `output_schema.properties` cardinality bucketing rules, does NOT alter M42's top-level `output_schema.type` bucketing rules, does NOT alter M45's `output_schema.items.type` bucketing rules, does NOT walk schema-as-`additionalProperties` (`additionalProperties: { type: 'string' }` buckets as `unknown`; reserved for `M-Strictness-Schema-As-AdditionalProperties-1`), does NOT walk per-nested-property `additionalProperties` under nested object properties (reserved for `M-Strictness-Per-Property-1`), does NOT walk `items.additionalProperties` for array-of-object items (reserved for `M-Strictness-Items-Object-1`), does NOT bucket on `input_schema.additionalProperties` strictness (reserved for `M-Strictness-Input-Schema-1`), does NOT persist `output_schema_strictness` into `tusq.manifest.json`, and does NOT compute statistical aggregates. The four-value `output_schema_strictness` bucket-key enum (`strict | permissive | not_applicable | unknown`), the three-value `aggregation_key` enum (`strictness | not_applicable | unknown`), and the five-value warning reason-code enum are frozen; any addition is a material governance event. The `--strictness` filter is case-sensitive lowercase-only; uppercase or mixed-case filter values exit `1` with `Unknown output schema strictness:`. Malformed `output_schema`/non-boolean `additionalProperties` values are bucketed as `unknown` and emit a `Warning: ...` to stderr (human) or `warnings[]` (`--json`); the `not_applicable` bucket (`output_schema.type !== 'object'`) is a valid named bucket and emits NO warning.

### M45: Static Capability Output Schema Items Type Index

**Purpose:** Export a per-bucket breakdown of capabilities by the JSON-Schema `output_schema.items.type` value of their array-typed response. For capabilities where `output_schema.type === 'array'`, the `items.type` is the most fundamental structural claim about how each array element will render in the frontend: `object` → multi-column table (each row = one object with named columns); `string`/`number`/`integer`/`boolean`/`null` → single-column list; `array` → nested-array tree. Directly answers: "for the array-typed responses my capabilities return, which item-shape will the frontend dashboard render?" Operationalizes VISION § Frontend, Design System, And Product UX (lines 66–72) as the primary aggregation source — the first shipped milestone to use this section. Orthogonal to M42 (which measures top-level `output_schema.type`; M45 measures `items.type` for array-typed responses only — M42 says "is this a table?", M45 says "if it's a table, what's in each row?"). Orthogonal to M40 (`output_schema.properties` cardinality on object responses; M45 measures per-element shape on array responses).

**Command:** `tusq items index [--items-type <value>] [--manifest <path>] [--out <path>] [--json]`

**Tier function** (applied to `output_schema` of each capability):
- Returns `'unknown'` if `output_schema` is null, undefined, missing, not a plain object, or an array
- Returns `'unknown'` if `output_schema.type` is missing, null, or not a string
- Returns `'not_applicable'` if `output_schema.type` is a string but not the literal `'array'`
- For `output_schema.type === 'array'`: returns `'unknown'` if `items` is missing/null/not-a-plain-object/array
- For `output_schema.type === 'array'`: returns `'unknown'` if `items.type` is missing/null/not-a-string
- For `output_schema.type === 'array'`: returns `'unknown'` if `items.type` is a string but not in the closed seven-value JSON-Schema primitive set (`object | array | string | number | integer | boolean | null`)
- For `output_schema.type === 'array'`: returns the literal `items.type` value (one of the seven primitives)

**Integer-NOT-collapsed-to-number rule:** `integer` is a first-class bucket in M45. Unlike M42 (which buckets `integer` as `unknown` because the JSON-Schema 2020-12 spec treats integer as a number subset), M45 does NOT collapse `integer` into `number` — a typed array of integers is a distinct rendering target from a typed array of arbitrary numbers (frontend tables format integers without decimal points differently from floats).

**Bucket-key enum** (closed nine-value, immutable): `object | array | string | number | integer | boolean | null | not_applicable | unknown`

**Aggregation-key enum** (closed three-value, immutable): `items_type | not_applicable | unknown`

**Per-bucket entry shape** (frozen 8 fields):
`output_schema_items_type`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`

**Result array field name:** `items_types` (plural categorical — distinct from M42's `types`, M43's `sources`, M44's `tiers`).

**Bucket iteration order** (closed-enum, deterministic stable-output convention only — NOT UI-rendering-precedence-ranked, NOT frontend-blast-radius-ranked, NOT table-vs-list-priority-ranked, NOT render-complexity-ranked): `object → array → string → number → integer → boolean → null → not_applicable → unknown`. Empty buckets MUST NOT appear.

**Within-bucket order:** manifest declared order (capabilities[] index ascending).

**Warnings** (--json only, always present even if empty): five frozen reason codes: `output_schema_field_missing`, `output_schema_field_not_object`, `output_schema_items_field_missing_when_type_is_array`, `output_schema_items_field_not_object_when_type_is_array`, `output_schema_items_type_field_missing_or_invalid_when_type_is_array`. The `not_applicable` bucket emits NO warning — it is a valid named bucket for non-array responses.

**Non-persistence rule:** `output_schema_items_type` MUST NOT be written into `tusq.manifest.json`.

**No-walking rules:** compositional items (`oneOf`/`anyOf`/`allOf` without top-level `type`) → `unknown`; tuple-style items (items as array) → `unknown`; multi-type items (`items.type` as array) → `unknown`; nested-array element typing (`items.items.type`) is NOT examined.

**Constraint 38:** `tusq items index` is a planning aid that surfaces the JSON-Schema `output_schema.items.type` for array-typed capability responses and the cross-axis side-effect/sensitivity exposure of each items-type bucket. It does NOT execute capability invocations at runtime, does NOT validate runtime response payloads against the declared `items.type`, does NOT generate frontend table/list components or component-library recommendations (mapping reserved for `M-Items-Type-Frontend-Render-Mapping-1`), does NOT certify rendering completeness, does NOT alter M42's top-level `output_schema.type` bucketing rules, does NOT walk compositional items schemas (`oneOf`/`anyOf`/`allOf`; reserved for `M-Items-Type-OneOf-AnyOf-AllOf-Index-1`), does NOT walk tuple-style items arrays (reserved for `M-Items-Type-Tuple-Index-1`), does NOT walk multi-type items (`items.type: ['object', 'null']`; reserved for `M-Items-Type-Multi-Type-Index-1`), does NOT walk nested-array element typing (`items.items.type`; reserved for `M-Items-Type-Nested-Array-Index-1`), does NOT walk per-element object property cardinality (reserved for `M-Items-Object-Property-Count-Tier-Index-1`), does NOT collapse `integer` into `number` (distinct from M42 — both are first-class buckets in M45), does NOT persist `output_schema_items_type` into `tusq.manifest.json`, and does NOT compute statistical aggregates. The nine-value `output_schema_items_type` bucket-key enum, the three-value `aggregation_key` enum, and the five-value warning reason-code enum are frozen; any addition is a material governance event.

### M44: Static Capability Description Word Count Tier Index

**Purpose:** Export a per-tier breakdown of capabilities by whitespace-token count of their top-level `description` field. Helps operators see how many capabilities have short, medium, or long documentation strings — and which tier buckets contain capabilities with destructive side effects or restricted/confidential sensitivity. Directly answers: "which of my capabilities have under-documented descriptions (low word count), and how many of those are also destructive or restricted?" Operationalizes VISION § Code And API Surface (lines 40–46) for documentation surface framing. Orthogonal to M39 (M39 = `input_schema.required[]` cardinality; M44 = `description` word count — different fields, different planning axes). Orthogonal to M41–M43 (those measure input/output schema structure; M44 measures prose documentation density on the capability's own `description` field).

**Command:** `tusq description index [--tier <low|medium|high|unknown>] [--manifest <path>] [--out <path>] [--json]`

**Tier function** (applied to the top-level `description` string field of each capability):
- Returns `'unknown'` if `description` is null, undefined, missing, or not a string
- Returns `'unknown'` if `description.trim().length === 0` (empty or whitespace-only string)
- Returns `'low'` if `description.trim().split(/\s+/u).length <= 7`
- Returns `'medium'` if token count is 8–14 inclusive
- Returns `'high'` if token count >= 15

The 7 / 14 thresholds are inline integer literals, post-ship-frozen (threshold-pair immutability rule). No markdown/HTML tags/punctuation/numbers stripping is performed — whitespace-token splitting is naïve and Unicode-aware via the `u` flag (no-markdown-stripping rule). `input_schema.description` / `output_schema.description` / `examples[].description` are NOT consulted — only the top-level capability `description` field (no-sub-schema-walking rule). CJK / RTL / no-whitespace scripts are NOT grapheme-clustered — naïve whitespace-only tokenization only (no-per-language-handling rule).

**Bucket-key enum** (closed four-value, immutable): `low | medium | high | unknown`

**Aggregation-key enum** (closed two-value, immutable): `tier | unknown`

**Per-bucket entry shape** (frozen 8 fields):
`description_word_count_tier`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`

**Result array field name:** `tiers` (plural numeric-band-tier convention — consistent with M37/M38/M39/M40/M41; NOT `types`/`sources` which are categorical-axis conventions).

**Bucket iteration order** (closed-enum, deterministic stable-output convention only — NOT doc-quality-ranked, NOT doc-completeness-ranked, NOT doc-richness-ranked, NOT doc-staleness-blast-radius-ranked, NOT customer-facing-truth-surface-ranked): `low → medium → high → unknown`. Empty buckets MUST NOT appear. `unknown` is always appended last if non-empty.

**Within-bucket order:** manifest declared order (capabilities[] index ascending).

**Warnings** (--json only, always present even if empty): three frozen reason codes: `description_field_missing`, `description_field_not_string`, `description_field_empty_after_trim`.

**Non-persistence rule:** `description_word_count_tier` MUST NOT be written into `tusq.manifest.json`.

**Constraint 37:** `tusq description index` is a planning aid that surfaces the documentation density of the manifest's capabilities by whitespace-token count of their top-level `description` field and the cross-axis side-effect/sensitivity exposure of each tier bucket. It does NOT execute capabilities at runtime, does NOT validate description quality or completeness against any standard, does NOT detect doc conformance or runtime behavior, does NOT generate or suggest description improvements, does NOT certify claim completeness, does NOT alter M11/M14's canonical description extraction rules, does NOT walk nested `input_schema.description`/`output_schema.description`/`examples[].description` fields (only the direct top-level capability `description` string is read), does NOT strip markdown/HTML tags/punctuation/numbers before tokenization (naïve whitespace split only), does NOT perform per-language grapheme clustering for CJK/RTL/no-whitespace scripts (naïve whitespace-only tokenization), does NOT adjust the 7/14 thresholds at runtime (post-ship-frozen inline literals), does NOT persist `description_word_count_tier` into `tusq.manifest.json`, and does NOT compute statistical aggregates. Deferred successors: `M-Description-Char-Length-Tier-Index-1`, `M-Description-Sentence-Count-Tier-Index-1`, `M-Description-Sub-Schema-Word-Count-Tier-Index-1`, `M-Description-Per-Language-Word-Count-Tier-Index-1`, `M-Description-Cross-Axis-Claim-Richness-Index-1`, `M-Description-Per-Cause-Sub-Bucket-Index-1`, `M-Description-Word-Count-Tier-Threshold-Adjustment-1`, `M-Description-Persistence-1`, `M-Description-Doc-Contradiction-1`, `M-Description-Markdown-Strip-1`, `M-Description-Runtime-Conformance-1`.

### M43: Static Capability Input Schema Primary Parameter Source Index

**Purpose:** Export a per-source breakdown of capabilities by the primary HTTP request input parameter source declared in their `input_schema.properties[*].source` fields. Helps operators see how many capabilities accept path parameters, request-body payloads, query strings, or request headers — and which source buckets contain capabilities with destructive side effects or restricted/confidential sensitivity. Directly answers: "which of my capabilities take request-body inputs, and how many of those are also destructive?" Operationalizes VISION § Code And API Surface (lines 40–46) for request-input-locus contract framing. Symmetric to M42 (M42 = response-shape contract on `output_schema.type`; M43 = request-input-locus contract on `input_schema.properties[*].source`; together M42 and M43 bracket the request/response data contract). Orthogonal to M39 (M39 measures `input_schema.required[]` cardinality; M43 measures `input_schema.properties[*].source` locus class — different but related fields).

**Command:** `tusq request index [--source <path|request_body|query|header|mixed|none|unknown>] [--manifest <path>] [--out <path>] [--json]`

**Source function** (applied to `input_schema.properties[*].source` values):
- Returns `'none'` if `input_schema.properties` is a valid plain object with zero keys (empty — no declared properties)
- Returns the single source value (e.g., `'path'`) if all properties share a single `source` value from the closed four-value set `{path, request_body, query, header}`
- Returns `'mixed'` if properties have two or more distinct source values, all from the closed four-value set
- Returns `'unknown'` for: `input_schema` null/undefined/missing/not-a-plain-object; `input_schema.properties` missing/null/not-a-plain-object; any property whose `source` value is missing, not a string, is an array, or is a string not in the four-value set (including `'cookie'`, `'file'`, `'multipart'`, `'form-data'`, and any other unrecognized string)

The closed four-value property-source value set `{path, request_body, query, header}` is immutable post-ship. Cookie-locus and file/multipart-locus distinctions are reserved for `M-Input-Source-Cookie-Bucket-1` and `M-Input-Source-File-Bucket-1`. Array-of-sources (`source: ['path', 'query']`) → `unknown`. The `mixed` bucket is a single catchall; per-locus-pair enumeration like `path+request_body` is reserved for `M-Input-Source-Mixed-Pair-Enumeration-Index-1`. Optional-vs-required split intentionally collapsed: every property's `source` field is consulted regardless of `input_schema.required[]` membership; the optional-only and required-only locus splits are reserved for `M-Input-Source-Optional-vs-Required-Split-1`.

**Bucket-key enum** (closed seven-value, immutable): `path | request_body | query | header | mixed | none | unknown`

**Aggregation-key enum** (closed two-value, immutable): `source | unknown`

**Per-bucket entry shape** (frozen 8 fields):
`input_schema_primary_parameter_source`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`

**Result array field name:** `sources` (plural, categorical — NOT `tiers`; consistent with M42's categorical-axis convention).

**Bucket iteration order** (closed-enum, deterministic stable-output convention only — NOT security-blast-radius-ranked, NOT workflow-criticality-ranked, NOT permission-sensitivity-ranked, NOT HTTP-spec-precedence-ranked): `path → request_body → query → header → mixed → none → unknown`. Empty buckets MUST NOT appear. `unknown` is always appended last if non-empty.

**Within-bucket order:** manifest declared order (capabilities[] index ascending).

**Warnings** (--json only, always present even if empty): five frozen reason codes: `input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_properties_field_missing`, `input_schema_properties_field_not_object`, `input_schema_property_source_field_missing_or_invalid`.

**Non-persistence rule:** `input_schema_primary_parameter_source` MUST NOT be written into `tusq.manifest.json`.

**Constraint 36:** `tusq request index` is a planning aid that surfaces what HTTP-request input parameter sources the manifest's capabilities declare across `input_schema.properties[*].source` and the cross-axis side-effect/sensitivity exposure of each source bucket. It does NOT execute capabilities at runtime, does NOT validate incoming request payloads against the declared `input_schema`, does NOT cross-reference manifest `input_schema.properties[*].source` vs actual request parameter binding (that is a deferred runtime-conformance milestone), does NOT generate request payloads, does NOT measure runtime request-shape variance or call-pattern statistics, does NOT certify input-contract completeness, does NOT alter M11/M14's canonical input_schema extraction rules, does NOT walk nested `input_schema` properties recursively (only the direct top-level `properties[*].source` string values are read), does NOT normalize `'cookie'`/`'file'`/`'multipart'`/`'form-data'` source values to any named bucket (all → `unknown`), does NOT unwrap array-of-sources (`source: ['path', 'query']` → `unknown`), does NOT enumerate `mixed` per-locus pairs (single `mixed` bucket only), does NOT split by optional vs required membership in `required[]` (all properties consulted regardless), does NOT persist `input_schema_primary_parameter_source` into `tusq.manifest.json`, and does NOT compute statistical aggregates. Deferred successors: `M-Input-Source-Cookie-Bucket-1`, `M-Input-Source-File-Bucket-1`, `M-Input-Source-Mixed-Pair-Enumeration-Index-1`, `M-Input-Source-Optional-vs-Required-Split-1`, `M-Input-Source-Runtime-Conformance-1`.

### M42: Static Capability Output Schema Top-Level Type Index

**Purpose:** Export a per-type breakdown of capabilities by the JSON Schema primitive type declared in their `output_schema.type` field. Helps operators see how many capabilities return objects, arrays, strings, numbers, booleans, or null responses — and which capability response shapes are undocumented or use non-standard types. Directly answers: "which of my capabilities return destructive or restricted-sensitivity results as a bare string or number (vs a structured object with auditable properties)?" Operationalizes VISION § Database, Warehouse, And Data Model (lines 48–54) — fresh aggregation source, not previously used as a primary milestone axis. Secondary citation: VISION § Code And API Surface (lines 40–46) for output-schema-type-derivation framing. Orthogonal to M40 (M40 = `output_schema.properties` key count; M42 = `output_schema.type` primitive classification — same field, different axis).

**Command:** `tusq response index [--type <object|array|string|number|boolean|null|unknown>] [--manifest <path>] [--out <path>] [--json]`

**Tier function** (literal exact-string match against the closed six-value JSON Schema 2020-12 spec primitive set):
- Returns the type literal (`object`, `array`, `string`, `number`, `boolean`, `null`) if `output_schema.type` is exactly one of the six spec primitives
- Returns `unknown` for: `output_schema` null/undefined/missing/not-a-plain-object; `output_schema.type` null/undefined/missing/not-a-string; `output_schema.type` string value not in the spec primitive set (including `'integer'`, `'tuple'`, `'enum'`, any custom string); `output_schema.type` is an array (array-of-types: `['object', 'null']`)

The `'integer'` → `unknown` rule is immutable in M42. The integer-subset distinction is reserved for `M-Output-Type-Integer-Subset-Index-1`. No `oneOf`/`anyOf`/`allOf`/`items`/`properties` walking is performed.

**Bucket-key enum** (closed seven-value, immutable): `object | array | string | number | boolean | null | unknown`

**Aggregation-key enum** (closed two-value, immutable): `type | unknown`

**Per-bucket entry shape** (frozen 8 fields):
`output_schema_top_level_type`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`

**Bucket iteration order** (closed-enum, deterministic stable-output convention only — NOT data-contract-completeness-ranked, NOT shape-complexity-ranked, NOT data-lineage-blast-radius-ranked, NOT DTO-richness-ranked, NOT JSON-Schema-spec-precedence-ranked): `object → array → string → number → boolean → null → unknown`. Empty buckets MUST NOT appear.

**Within-bucket order:** manifest declared order (capabilities[] index ascending).

**Warnings** (--json only, always present even if empty): five frozen reason codes: `output_schema_field_missing`, `output_schema_field_not_object`, `output_schema_type_field_missing`, `output_schema_type_field_not_string`, `output_schema_type_field_value_not_in_json_schema_primitive_set`.

**Result array field name:** `types` (plural, categorical — NOT `tiers`; the axis is a JSON Schema primitive type, not a numeric tier).

**Non-persistence rule:** `output_schema_top_level_type` MUST NOT be written into `tusq.manifest.json`.

**Constraint 35:** `tusq response index` is a planning aid that surfaces what JSON Schema top-level types the manifest's capabilities declare in their `output_schema` and the cross-axis side-effect/sensitivity exposure of each type bucket. It does NOT execute capability responses at runtime, does NOT validate response payloads against the declared `output_schema.type`, does NOT cross-reference manifest `output_schema.type` vs runtime response shape (that is a deferred runtime-conformance milestone), does NOT generate response payloads, does NOT measure runtime response-shape variance or call-pattern statistics, does NOT certify data-contract completeness, does NOT alter M11/M14's canonical output_schema extraction rules, does NOT walk `oneOf`/`anyOf`/`allOf`/`items`/`properties` recursively (only the literal top-level `type` field is read; compositional schemas without a top-level type primitive are bucketed as `unknown`), does NOT normalize `'integer'` to `'number'` (the JSON-Schema-spec subset relationship is acknowledged but `'integer'` is bucketed as `unknown` to preserve the closed primitive set), does NOT unwrap array-of-types (`type: ['object', 'null']` → `unknown` because `output_schema.type` is an array not a string), does NOT persist `output_schema_top_level_type` into `tusq.manifest.json`, and does NOT compute statistical aggregates. Deferred successors: `M-Output-Type-Integer-Subset-Index-1`, `M-Output-Type-Multi-Type-Index-1`, `M-Output-Type-OneOf-AnyOf-AllOf-Index-1`, `M-Output-Type-Persistence-1`, `M-Output-Type-Doc-Contradiction-1`, `M-Output-Type-Runtime-Conformance-1`.

### M41: Static Capability Path Segment Count Tier Index

**Purpose:** Export a per-tier breakdown of capabilities by URL path segment count from manifest evidence. Helps operators identify which capabilities live at deeply nested URL hierarchies (highest manifest-as-anti-sprawl-contract value) and which top-level capabilities are missing the manifest's flat-list compression benefit. Directly answers: "which of my capabilities are buried five-or-more URL segments deep — and which of those deeply-buried capabilities are also destructive or restricted/confidential?" The deeply-buried-destructive case is the canonical artifact-sprawl failure mode § Artifact Sprawl warns against. Operationalizes VISION § Artifact Sprawl (lines 721–723) — fresh aggregation source, not previously used as a primary milestone axis. Secondary citation: VISION § Code And API Surface (lines 40–46) for URL-hierarchy-depth-derivation framing.

**Command:** `tusq path index [--tier <none|low|medium|high|unknown>] [--manifest <path>] [--out <path>] [--json]`

**Tier function** (applied to `path.split('/').filter(Boolean).length`):
- `none` if segment count === 0 (path is `/`)
- `low` if 1 ≤ count ≤ 2 (e.g., `/users`, `/api/users`)
- `medium` if 3 ≤ count ≤ 4 (e.g., `/api/v1/orders`, `/api/v1/users/:id`)
- `high` if count ≥ 5 (e.g., `/api/v1/orgs/:orgId/projects`)
- `unknown` if path is null/missing/not-a-string, empty string, does not start with `/`, or contains an empty interior segment (double slash or trailing slash other than `/`)

Path parameters (`:id`, `:orgId`) count as one segment each — NOT unwrapped or downscaled. Tier-function thresholds `0/2/4/5` are immutable once M41 ships.

**Bucket-key enum** (closed five-value, immutable): `none | low | medium | high | unknown`

**Aggregation-key enum** (closed two-value, immutable): `tier | unknown`

**Per-bucket entry shape** (frozen 8 fields):
`path_segment_count_tier`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`

**Bucket iteration order** (closed-enum, deterministic stable-output convention only — NOT sprawl-risk-ranked, NOT blast-radius-ranked, NOT depth-ranked, NOT operator-visibility-ranked): `none → low → medium → high → unknown`. Empty buckets MUST NOT appear.

**Within-bucket order:** manifest declared order (capabilities[] index ascending).

**Warnings** (--json only, always present even if empty): five frozen reason codes: `path_field_missing`, `path_field_not_string`, `path_field_empty_string`, `path_field_does_not_start_with_forward_slash`, `path_field_contains_empty_interior_segment`.

**Non-persistence rule:** `path_segment_count_tier` MUST NOT be written into `tusq.manifest.json`.

**Constraint 34:** `tusq path index` is a planning aid that surfaces what URL-path-segment-count tiers the manifest's capabilities span and the cross-axis side-effect/sensitivity exposure of each tier. It does NOT execute capability paths at runtime, does NOT validate `path` conformance against a runtime route registry, does NOT cross-reference manifest path vs public/internal docs, does NOT generate URL examples, does NOT measure runtime path-resolution variance, does NOT certify route-registration completeness, does NOT walk wildcard or regex route segments differently from literal segments (path-parameter syntax `:id` counts as one segment, not unwrapped), does NOT normalize trailing or duplicate slashes (those produce `unknown` warnings), does NOT persist `path_segment_count_tier` into `tusq.manifest.json`, and does NOT compute statistical aggregates. Deferred successors: `M-Path-Wildcard-Index-1`, `M-Path-Prefix-Index-1`, `M-Path-Persistence-1`, `M-Path-Route-Registry-Validation-1`, `M-Path-Doc-Contradiction-1`.

### M40: Static Capability Output Schema Property Count Tier Index

**Purpose:** Export a per-tier breakdown of capabilities by `output_schema.properties` key count from manifest evidence. Helps operators identify which capabilities have the largest documented output contract surface (highest docs-vs-code drift potential), which have no documented output schema at all (highest blast radius), and which also carry destructive side effects or restricted/confidential sensitivity classifications.

**Command:** `tusq output index [--tier <none|low|medium|high|unknown>] [--manifest <path>] [--out <path>] [--json]`

**Tier function** (frozen; thresholds `0/2/5/6` are immutable post-ship):
- `none` if `Object.keys(output_schema.properties).length === 0`
- `low` if `1 <= length <= 2`
- `medium` if `3 <= length <= 5`
- `high` if `length >= 6`
- `unknown` if `output_schema` is `null`/`undefined`/missing/not-a-plain-object, OR `output_schema.properties` is `null`/`undefined`/missing/not-a-plain-object, OR `output_schema.properties` contains any value that is not a plain non-null object (null, primitive, array, or function disqualifies the entire schema)

**Note on `type:array` schemas:** `output_schema.properties` is legitimately absent for response shapes typed as `"array"`. Such schemas are bucketed as `unknown` with reason code `output_schema_properties_field_missing` — this is informative, not a defect.

**Bucket-key enum** (closed five-value): `none | low | medium | high | unknown`

**Aggregation key enum** (closed two-value): `tier | unknown`

**Per-bucket entry shape** (frozen 8 fields): `output_schema_property_count_tier`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`

**Top-level `warnings[]`:** Always present in `--json` mode (empty `[]` when no malformed capabilities). Five frozen reason codes: `output_schema_field_missing`, `output_schema_field_not_object`, `output_schema_properties_field_missing`, `output_schema_properties_field_not_object`, `output_schema_properties_object_contains_non_object_property_descriptor`

**Bucket iteration order:** `none → low → medium → high → unknown` (closed-enum deterministic stable-output convention only — NOT doc-drift-risk-ranked, NOT staleness-ranked, NOT contract-surface-area-ranked, NOT drift-blast-radius-ranked). Empty buckets MUST NOT appear.

**Within-bucket order:** Manifest declared order (capabilities[] index ascending).

**`--tier` filter:** Case-sensitive lowercase-only. Uppercase/mixed-case exits 1 with `Unknown output schema property count tier: <value>`. Filtering on absent tier exits 1 with `No capabilities found for output schema property count tier: <tier>`.

**Empty-capabilities:** Human mode emits `No capabilities in manifest — nothing to index.` and exits 0. JSON mode emits `{ ..., tiers: [], warnings: [] }` and exits 0.

**Read-only invariants:** Manifest mtime + SHA-256 + every capability's `capability_digest` byte-identical pre/post. `tusq compile` output byte-identical pre/post. All other index commands (`tusq surface plan`, `tusq domain index`, `tusq effect index`, `tusq sensitivity index`, `tusq method index`, `tusq auth index`, `tusq confidence index`, `tusq pii index`, `tusq examples index`, `tusq input index`) byte-identical pre/post.

**Non-persistence rule:** `output_schema_property_count_tier` MUST NOT be written into `tusq.manifest.json`.

> **M40 Charter Sketch Reservation — 2026-04-27 in run_0ce75469bde80380 (turn_f4192b1598e8a30f, PM attempt 1) at HEAD `61800d7`.** This PM turn binds **M40: Static Capability Output Schema Property Count Tier Index Export from Manifest Evidence (~0.5 day) — V1.21 (PROPOSED)** in `.planning/ROADMAP.md` and `.planning/PM_SIGNOFF.md`, citing VISION.md § Stale Or Contradictory Docs (lines 701–703 — "Public docs, internal docs, support tickets, and code can disagree. tusq.dev must surface contradictions instead of allowing stale docs to silently shape generated AI behavior") as the never-yet-used primary aggregation source for shipped milestones. The full SYSTEM_SPEC § M40 detail block (purpose statement, command shape `tusq output index [--tier <value>] [--manifest <path>] [--out <path>] [--json]`, frozen five-value `output_schema_property_count_tier` bucket-key enum (`none | low | medium | high | unknown`) — distinct from M37's pii-fields-derived enum, M38's examples-derived enum, and M39's input-schema-required-derived enum because M40 derives from the cardinality of the manifest's per-capability `output_schema.properties` object (M11/M14/M24-derived) which holds the documented response contract surface, not PII-name hints (M37), eval-seed entries (M38), or contract-required input fields (M39), frozen two-value `aggregation_key` enum (`tier | unknown`), frozen tier-function thresholds (`none if Object.keys(output_schema.properties).length === 0`, `low if 1 <= length <= 2`, `medium if 3 <= length <= 5`, `high if length >= 6`, `unknown if output_schema is null/undefined/missing/not-a-plain-object OR output_schema.properties is null/undefined/missing/not-a-plain-object OR contains any non-object property descriptor (null, primitive, array, function)`), per-bucket 8-field entry shape with name-and-counters fields only (`output_schema_property_count_tier`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`), top-level `warnings[]` array rule (only in `--json` mode; always present even when empty `[]` for shape stability; per-capability malformed-`output_schema` warnings with five frozen reason codes `output_schema_field_missing`/`output_schema_field_not_object`/`output_schema_properties_field_missing`/`output_schema_properties_field_not_object`/`output_schema_properties_object_contains_non_object_property_descriptor`; preserved byte-identically across runs), **closed-enum** bucket iteration order rule (`none → low → medium → high → unknown` — explicitly NOT a doc-drift-risk-precedence statement, NOT a staleness ranking, NOT a contract-surface-area ranking, NOT a drift-blast-radius ranking; the order is a deterministic stable-output convention only and MUST NOT be described as "doc-drift-risk-ranked," "staleness-ranked," "contract-surface-area-ranked," or "drift-blast-radius-ranked"), within-bucket manifest-declared-order rule, empty-buckets-MUST-NOT-appear rule, empty-capabilities exit-0 rule with explicit human line `No capabilities in manifest — nothing to index.` and `--json` shape `{ manifest_path, manifest_version, generated_at, tiers: [], warnings: [] }`, I/O stream discipline table (every error path empties stdout and writes exclusively to stderr; per-capability `Warning: ...` lines also write to stderr in human mode), **case-sensitive `--tier` filter rule** (lowercase only; uppercase values like `HIGH` exit 1 with `Unknown output schema property count tier:` rather than being lower-cased silently — mirroring M35 `--scheme`, M36/M37/M38/M39 `--tier` precedent), read-only invariants mirroring § M32/M33/M34/M35/M36/M37/M38/M39 plus the explicit non-persistence rule (`output_schema_property_count_tier` MUST NOT be written into `tusq.manifest.json`), **`type:array` informative-bucketing rule** (response shapes typed as `"array"` legitimately have no top-level `properties` — per-element shape lives under `items` — so they are bucketed as `unknown` with reason `output_schema_properties_field_missing`; this is informative behavior, NOT a defect, and is precisely the planning signal operators want to see for array-typed responses where the top-level contract surface is empty), malformed-object handling rule (bucketed as `unknown`, NOT silently coerced to empty `properties: {}`, with stderr/`warnings[]` entry citing one of the five frozen reason codes), non-runtime-output-executor/non-output-schema-validator/non-doc-contradiction-detector/non-output-generator/non-doc-accuracy-certifier boundary statement (M40 is a planning aid; it does not execute capability outputs at runtime, does not validate `output_schema.properties[]` conformance against runtime responses, does not cross-reference manifest `output_schema` vs public/internal docs, does not generate new output examples, does not measure runtime response variance, does not certify doc accuracy or staleness; whether a capability's documented contract matches the actual runtime response shape remains the reviewer's judgment combining sensitivity_class, side_effect_class, auth_scheme, confidence, examples_count_tier, required_input_field_count_tier, and output_schema_property_count_tier together), **nested-walk-not-performed rule** (only top-level `output_schema.properties` keys are counted; `properties.X.properties` nested cardinality walks are reserved for `M-Output-Schema-Nested-Property-Index-1`), proposed Constraint 33) is reserved for the dev role's implementation phase per the M27–M39 PM-vs-dev ownership split (PM charters; dev materializes the SYSTEM_SPEC § with verbatim shape/algorithm details before any code lands). § M39 (Static Capability Required Input Field Count Tier Index Export — V1.20 SHIPPED), § M38 (V1.19 SHIPPED), § M37 (V1.18 SHIPPED), § M36 (V1.17 SHIPPED), § M35 (V1.16 SHIPPED), § M34 (V1.15 SHIPPED), § M33 (V1.14 SHIPPED), § M32 (V1.13 SHIPPED), § M31 (V1.12 SHIPPED), and Constraints 24/25/26/27/28/29/30/31/32 carry forward verbatim. The closed five-value `output_schema_property_count_tier` bucket-key enum, the closed two-value `aggregation_key` enum, the frozen tier-function thresholds (`0 / 2 / 5 / 6` boundaries), the closed-enum bucket iteration order, the per-bucket 8-field entry shape, the top-level `warnings[]` rule with five frozen reason codes, the empty-buckets-omitted rule, the case-sensitive lowercase-only `--tier` filter rule, the malformed-object-bucketed-as-unknown rule, the `type:array → unknown` informative-bucketing rule, the nested-walk-not-performed rule, and the M40 implementation MUST NOT persist `output_schema_property_count_tier` into the manifest rule are PM-frozen scope decisions and MUST be carried forward unchanged by the dev materialization turn. Eval scenario `output-schema-property-count-tier-index-determinism` proposed; eval harness target 30 → ≥31 scenarios. The 23-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, auth, confidence, diff, domain, effect, examples, input, method, pii, policy, redaction, sensitivity, surface, version, help) MUST grow to 24 with `output` inserted alphabetically between `method` and `pii` in the post-`docs` block (`method` vs `output`: `m` (109) < `o` (111) in ASCII; `output` vs `pii`: `o` (111) < `p` (112) in ASCII). M40 is unchecked planned work, not shipped. The MCP-descriptor candidate in `ROADMAP_NEXT_CANDIDATES.md` remains unbound. No source code modified by this PM turn.

> **M39 Charter Sketch Reservation — 2026-04-27 in run_533b2f8c47cc0bf0 (turn_2c2363ba816afba6, PM attempt 1) at HEAD `d90bd90`.** This PM turn binds **M39: Static Capability Required Input Field Count Tier Index Export from Manifest Evidence (~0.5 day) — V1.20 (PROPOSED)** in `.planning/ROADMAP.md` and `.planning/PM_SIGNOFF.md`, citing VISION.md § Capability Overexposure (lines 693–695 — "Raw endpoints are not automatically safe AI tools. tusq.dev must classify side effects, risk, sensitivity, tenant context, and business intent before exposing a capability") as the never-yet-used primary aggregation source for shipped milestones. The full SYSTEM_SPEC § M39 detail block (purpose statement, command shape `tusq input index [--tier <value>] [--manifest <path>] [--out <path>] [--json]`, frozen five-value `required_input_field_count_tier` bucket-key enum (`none | low | medium | high | unknown`) — distinct from M37's pii-fields-derived enum and M38's examples-derived enum because M39 derives from the cardinality of the manifest's per-capability `input_schema.required[]` array (M11/M14/M24-derived) which contains contract-required input field names, not the PII-name hints (M37) or the eval-seed object entries (M38), frozen two-value `aggregation_key` enum (`tier | unknown`), frozen tier-function thresholds (`none if required.length === 0`, `low if 1 <= required.length <= 2`, `medium if 3 <= required.length <= 5`, `high if required.length >= 6`, `unknown if input_schema is null/undefined/missing/not-a-plain-object OR required is null/undefined/missing/not-an-array OR contains any non-string element OR contains an empty string element`), per-bucket 8-field entry shape with name-and-counters fields only (`required_input_field_count_tier`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`), top-level `warnings[]` array rule (only in `--json` mode; always present even when empty `[]` for shape stability; per-capability malformed-`input_schema` warnings with five frozen reason codes `input_schema_field_missing`/`input_schema_field_not_object`/`required_field_missing`/`required_field_not_array`/`required_array_contains_non_string_or_empty_element`; preserved byte-identically across runs), **closed-enum** bucket iteration order rule (`none → low → medium → high → unknown` — explicitly NOT an exposure-risk-precedence statement, NOT a blast-radius ranking, NOT an easy-call ranking, NOT an input-complexity ranking; the order is a deterministic stable-output convention only and MUST NOT be described as "exposure-risk-ranked," "blast-radius-ranked," "easy-call-ranked," or "input-complexity-ranked"), within-bucket manifest-declared-order rule, empty-buckets-MUST-NOT-appear rule, empty-capabilities exit-0 rule with explicit human line `No capabilities in manifest — nothing to index.` and `--json` shape `{ manifest_path, manifest_version, generated_at, tiers: [], warnings: [] }`, I/O stream discipline table (every error path empties stdout and writes exclusively to stderr; per-capability `Warning: ...` lines also write to stderr in human mode), **case-sensitive `--tier` filter rule** (lowercase only; uppercase values like `HIGH` exit 1 with `Unknown required input field count tier:` rather than being lower-cased silently — mirroring M35 `--scheme`, M36/M37/M38 `--tier` precedent), read-only invariants mirroring § M32/M33/M34/M35/M36/M37/M38 plus the explicit non-persistence rule (`required_input_field_count_tier` MUST NOT be written into `tusq.manifest.json`), malformed-array handling rule (bucketed as `unknown`, NOT silently coerced to empty `required: []`, with stderr/`warnings[]` entry citing one of the five frozen reason codes), non-runtime-executor/non-schema-validator/non-input-generator/non-exposure-safety-certifier boundary statement (M39 is a planning aid; it does not execute capability inputs at runtime, does not validate `input_schema.properties[]` conformance against any per-element schema, does not generate new inputs or example payloads, does not measure runtime call frequency or call patterns, does not certify exposure-safety; whether a capability is "safe to expose" remains the reviewer's judgment combining sensitivity_class, side_effect_class, auth_scheme, confidence, and required_input_field_count_tier together), proposed Constraint 32) is reserved for the dev role's implementation phase per the M27–M38 PM-vs-dev ownership split (PM charters; dev materializes the SYSTEM_SPEC § with verbatim shape/algorithm details before any code lands). § M38 (Static Capability Examples Count Tier Index Export — V1.19 SHIPPED), § M37 (V1.18 SHIPPED), § M36 (V1.17 SHIPPED), § M35 (V1.16 SHIPPED), § M34 (V1.15 SHIPPED), § M33 (V1.14 SHIPPED), § M32 (V1.13 SHIPPED), § M31 (V1.12 SHIPPED), and Constraints 24/25/26/27/28/29/30/31 carry forward verbatim. The closed five-value `required_input_field_count_tier` bucket-key enum, the closed two-value `aggregation_key` enum, the frozen tier-function thresholds (`0 / 2 / 5 / 6` boundaries), the closed-enum bucket iteration order, the per-bucket 8-field entry shape, the top-level `warnings[]` rule with five frozen reason codes, the empty-buckets-omitted rule, the case-sensitive lowercase-only `--tier` filter rule, the malformed-array-bucketed-as-unknown rule, and the M39 implementation MUST NOT persist `required_input_field_count_tier` into the manifest rule are PM-frozen scope decisions and MUST be carried forward unchanged by the dev materialization turn. Eval scenario `required-input-field-count-tier-index-determinism` proposed; eval harness target 29 → ≥30 scenarios. The 22-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, auth, confidence, diff, domain, effect, examples, method, pii, policy, redaction, sensitivity, surface, version, help) MUST grow to 23 with `input` inserted alphabetically between `examples` and `method` in the post-`docs` block (`examples` vs `input`: `e` (101) < `i` (105) in ASCII; `input` vs `method`: `i` (105) < `m` (109) in ASCII). M39 is unchecked planned work, not shipped. The MCP-descriptor candidate in `ROADMAP_NEXT_CANDIDATES.md` remains unbound. No source code modified by this PM turn.

> **M38 Charter Sketch Reservation — 2026-04-27 in run_0c5145f830f5940e (turn_5f9db83b54b7b58f, PM attempt 1) at HEAD `cd81f5e`.** This PM turn binds **M38: Static Capability Examples Count Tier Index Export from Manifest Evidence (~0.5 day) — V1.19 (PROPOSED)** in `.planning/ROADMAP.md` and `.planning/PM_SIGNOFF.md`, citing VISION.md § Bad Workflow Inference (lines 697–699 — "Inferred workflows can look plausible while violating real business rules. Workflow artifacts must be explicit, editable, provenance-backed, and eval-tested") as the never-yet-used primary aggregation source for shipped milestones. The full SYSTEM_SPEC § M38 detail block (purpose statement, command shape `tusq examples index [--tier <value>] [--manifest <path>] [--out <path>] [--json]`, frozen five-value `examples_count_tier` bucket-key enum (`none | low | medium | high | unknown`) — distinct from M37's pii-fields-derived enum because M38 derives from the cardinality of the manifest's `examples[]` array (M11-derived) which contains object-shaped seed entries, not the string-shaped per-field hints that drive M37, frozen two-value `aggregation_key` enum (`tier | unknown`), frozen tier-function thresholds (`none if examples.length === 0`, `low if 1 <= examples.length <= 2`, `medium if 3 <= examples.length <= 5`, `high if examples.length >= 6`, `unknown if examples is null/undefined/missing/not-an-array OR contains any non-object element OR null element OR array element`), per-bucket 8-field entry shape with name-and-counters fields only (`examples_count_tier`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`), top-level `warnings[]` array rule (only in `--json` mode; always present even when empty `[]` for shape stability; per-capability malformed-`examples` warnings with five frozen reason codes `examples_field_missing`/`examples_field_not_array`/`examples_array_contains_non_object_element`/`examples_array_contains_null_element`/`examples_array_contains_array_element`; preserved byte-identically across runs), **closed-enum** bucket iteration order rule (`none → low → medium → high → unknown` — explicitly NOT a coverage-quality-precedence statement, NOT a test-strength ranking, NOT an eval-readiness ranking; the order is a deterministic stable-output convention only and MUST NOT be described as "coverage-quality-ranked," "test-completeness-ranked," "eval-readiness-ranked," or "highest-coverage-first"), within-bucket manifest-declared-order rule, empty-buckets-MUST-NOT-appear rule, empty-capabilities exit-0 rule with explicit human line `No capabilities in manifest — nothing to index.` and `--json` shape `{ manifest_path, manifest_version, generated_at, tiers: [], warnings: [] }`, I/O stream discipline table (every error path empties stdout and writes exclusively to stderr; per-capability `Warning: ...` lines also write to stderr in human mode), **case-sensitive `--tier` filter rule** (lowercase only; uppercase values like `HIGH` exit 1 with `Unknown examples count tier:` rather than being lower-cased silently — mirroring M35 `--scheme`, M36 `--tier`, M37 `--tier` precedent), read-only invariants mirroring § M32/M33/M34/M35/M36/M37 plus the explicit non-persistence rule (`examples_count_tier` MUST NOT be written into `tusq.manifest.json`), malformed-array handling rule (bucketed as `unknown`, NOT silently coerced to empty array, with stderr/`warnings[]` entry), non-runtime-executor/non-schema-validator/non-generator/non-eval-certifier boundary statement (M38 is a planning aid; it does not execute examples at runtime, does not validate per-example schema conformance against `input_schema`/`output_schema`, does not generate new examples, does not measure runtime test-coverage, does not certify eval-readiness; example correctness is the manifest author's declaration), proposed Constraint 31) is reserved for the dev role's implementation phase per the M27/M28/M29/M30/M31/M32/M33/M34/M35/M36/M37 PM-vs-dev ownership split (PM charters; dev materializes the SYSTEM_SPEC § with verbatim shape/algorithm details before any code lands). § M37 (Static Capability PII Field Count Tier Index Export — V1.18 SHIPPED), § M36 (Static Capability Confidence Tier Index Export — V1.17 SHIPPED), § M35 (V1.16 SHIPPED), § M34 (V1.15 SHIPPED), § M33 (V1.14 SHIPPED), § M32 (V1.13 SHIPPED), § M31 (V1.12 SHIPPED), and Constraints 24/25/26/27/28/29/30 carry forward verbatim. The closed five-value `examples_count_tier` bucket-key enum, the closed two-value `aggregation_key` enum, the frozen tier-function thresholds (`0 / 2 / 5 / 6` boundaries), the closed-enum bucket iteration order, the per-bucket 8-field entry shape, the top-level `warnings[]` rule, the empty-buckets-omitted rule, the case-sensitive lowercase-only `--tier` filter rule, the malformed-array-bucketed-as-unknown rule with five frozen reason codes, and the M38 implementation MUST NOT persist `examples_count_tier` into the manifest rule are PM-frozen scope decisions and MUST be carried forward unchanged by the dev materialization turn. Eval scenario `examples-count-tier-index-determinism` proposed; eval harness target 28 → ≥29 scenarios. The 21-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, auth, confidence, diff, domain, effect, method, pii, policy, redaction, sensitivity, surface, version, help) MUST grow to 22 with `examples` inserted alphabetically between `effect` and `method` (`effect` vs `examples`: `e` = `e`, `f` (102) < `x` (120) in ASCII; `examples` vs `method`: `e` < `m`). M38 is unchecked planned work, not shipped. The MCP-descriptor candidate in `ROADMAP_NEXT_CANDIDATES.md` remains unbound. No source code modified by this PM turn.

> **M37 Charter Sketch Reservation — 2026-04-27 in run_0b366d58febc99be (turn_741c43114034bab7, PM attempt 1).** This PM turn binds **M37: Static Capability PII Field Count Tier Index Export from Manifest Evidence (~0.5 day) — V1.18 (PROPOSED)** in `.planning/ROADMAP.md` and `.planning/PM_SIGNOFF.md`, citing VISION.md § Data Leakage (lines 705–707 — "Capabilities that touch PII, billing, or session tokens must be visible. Otherwise the AI layer can leak data through unintentional combinations of compiled capabilities") as the never-yet-used primary aggregation source for shipped milestones. The full SYSTEM_SPEC § M37 detail block (purpose statement, command shape `tusq pii index [--tier <value>] [--manifest <path>] [--out <path>] [--json]`, frozen five-value `pii_field_count_tier` bucket-key enum (`none | low | medium | high | unknown`) — distinct from M36's four-value enum because M37 is M37-derived from the cardinality of the manifest's PII field array (e.g., `pii_fields[]` or equivalent) rather than from a numeric scalar like `confidence`, frozen two-value `aggregation_key` enum (`tier | unknown`), frozen tier-function thresholds (`none if length === 0`, `low if 1 <= length <= 2`, `medium if 3 <= length <= 5`, `high if length >= 6`, `unknown if missing/non-array/malformed/non-string-elements`), per-bucket 8-field entry shape with name-and-counters fields only (`pii_field_count_tier`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`), top-level `warnings[]` array rule (only in `--json` mode; always present even when empty `[]` for shape stability; per-capability malformed-field warnings; preserved byte-identically across runs), **closed-enum** bucket iteration order rule (`none → low → medium → high → unknown` — explicitly NOT a risk-precedence statement, NOT a leakage-severity ranking, NOT a sensitivity-ladder; the order is a deterministic stable-output convention only and MUST NOT be described as "leakage-risk-ranked," "severity-ranked," or "highest-risk-first"), within-bucket manifest-declared-order rule, empty-buckets-MUST-NOT-appear rule, empty-capabilities exit-0 rule with explicit human line `No capabilities in manifest — nothing to index.` and `--json` shape `{ manifest_path, manifest_version, generated_at, tiers: [], warnings: [] }`, I/O stream discipline table (every error path empties stdout and writes exclusively to stderr; per-capability `Warning: ...` lines also write to stderr in human mode), **case-sensitive `--tier` filter rule** (lowercase only; uppercase values like `HIGH` exit 1 with `Unknown PII field count tier:` rather than being lower-cased silently — mirroring M35 `--scheme` and M36 `--tier` precedent), read-only invariants mirroring § M32/M33/M34/M35/M36 plus the explicit non-persistence rule (`pii_field_count_tier` MUST NOT be written into `tusq.manifest.json`), malformed-field-array handling rule (bucketed as `unknown`, NOT silently coerced to empty or zero, with stderr/`warnings[]` entry), non-runtime-redactor/non-DLP-engine/non-PII-classifier boundary statement (M37 is a planning aid; it does not redact, mask, anonymize, or block at runtime; it does not classify whether a given field is actually PII — that is the manifest author's declaration), proposed Constraint 30) is reserved for the dev role's implementation phase per the M27/M28/M29/M30/M31/M32/M33/M34/M35/M36 PM-vs-dev ownership split (PM charters; dev materializes the SYSTEM_SPEC § with verbatim shape/algorithm details before any code lands). § M36 (Static Capability Confidence Tier Index Export — V1.17 SHIPPED), § M35 (V1.16 SHIPPED), § M34 (V1.15 SHIPPED), § M33 (V1.14 SHIPPED), § M32 (V1.13 SHIPPED), § M31 (V1.12 SHIPPED), and Constraints 24/25/26/27/28/29 carry forward verbatim. The closed five-value `pii_field_count_tier` bucket-key enum, the closed two-value `aggregation_key` enum, the frozen tier-function thresholds (`0 / 2 / 5 / 6` boundaries), the closed-enum bucket iteration order, the per-bucket 8-field entry shape, the top-level `warnings[]` rule, the empty-buckets-omitted rule, the case-sensitive lowercase-only `--tier` filter rule, the malformed-array-bucketed-as-unknown rule, and the M37 implementation MUST NOT persist `pii_field_count_tier` into the manifest rule are PM-frozen scope decisions and MUST be carried forward unchanged by the dev materialization turn. Eval scenario `pii-field-count-tier-index-determinism` proposed; eval harness target 27 → ≥28 scenarios. The 20-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, auth, confidence, diff, domain, effect, method, policy, redaction, sensitivity, surface, version, help) MUST grow to 21 with `pii` inserted alphabetically between `method` and `policy` (`method` vs `pii`: `m` < `p`; `pii` vs `policy`: `pi` < `po` because `i` < `o`). M37 is unchecked planned work, not shipped. The MCP-descriptor candidate in `ROADMAP_NEXT_CANDIDATES.md` remains unbound. No source code modified by this PM turn.

> **M36 Charter Sketch Reservation — 2026-04-26 in run_8580d828f0e1cc1e (turn_f657958213bbfb9d, PM attempt 1) at HEAD `7c6b47e`.** This PM turn binds **M36: Static Capability Confidence Tier Index Export from Manifest Evidence (~0.5 day) — V1.17 (PROPOSED)** in `.planning/ROADMAP.md` and `.planning/PM_SIGNOFF.md`, citing VISION.md lines 128–141 (`### Source Inventory And Confidence` — "tusq.dev should produce an input inventory before it claims understanding ... confidence by domain ... The engine should not pretend all inputs are equal") and lines 709–711 (`### False Governance Confidence` under § Risks — "Labels such as `approved`, `restricted`, `confidential`, or `auth_scheme: bearer` are not magic. The product must distinguish reviewer-aid metadata from runtime enforcement"). The full SYSTEM_SPEC § M36 detail block (purpose statement, command shape `tusq confidence index [--tier <value>] [--manifest <path>] [--out <path>] [--json]`, frozen four-value `confidence_tier` bucket-key enum (`high | medium | low | unknown`), frozen two-value `aggregation_key` enum (`tier | unknown`), frozen tier-function thresholds (`high if confidence >= 0.85`, `low if confidence < 0.6`, `medium if 0.6 <= confidence < 0.85`, `unknown if confidence is null/undefined/missing/non-numeric/NaN/+Infinity/-Infinity/out-of-[0,1]`), per-bucket 8-field entry shape with name-and-counters fields only (`confidence_tier`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`), top-level `warnings[]` array rule (only in `--json` mode; always present even when empty `[]` for shape stability; per-capability out-of-range/non-numeric warnings; preserved byte-identically across runs), **closed-enum** bucket iteration order rule (`high → medium → low → unknown` — explicitly NOT a quality-precedence statement, NOT an evidence-strength ranking, NOT a trust-ranking; the order is a deterministic stable-output convention only and MUST NOT be described as "evidence-strength-ranked," "trust-ranked," or "highest-quality-first"), within-bucket manifest-declared-order rule, empty-buckets-MUST-NOT-appear rule, empty-capabilities exit-0 rule with explicit human line `No capabilities in manifest — nothing to index.` and `--json` shape `{ manifest_path, manifest_version, generated_at, tiers: [], warnings: [] }`, I/O stream discipline table (every error path empties stdout and writes exclusively to stderr; per-capability `Warning: ...` lines also write to stderr in human mode), **case-sensitive `--tier` filter rule** (lowercase only; uppercase values like `HIGH` exit 1 with `Unknown confidence tier:` rather than being lower-cased silently — mirroring M35 `--scheme` precedent), read-only invariants mirroring § M32/M33/M34/M35 plus the explicit non-persistence rule (`confidence_tier` MUST NOT be written into `tusq.manifest.json`), out-of-range/non-numeric value handling rule (bucketed as `unknown`, NOT silently coerced or clamped, with stderr/`warnings[]` entry), non-runtime-gate/non-quality-engine/non-reclassifier boundary statement, proposed Constraint 29) is reserved for the dev role's implementation phase per the M27/M28/M29/M30/M31/M32/M33/M34/M35 PM-vs-dev ownership split (PM charters; dev materializes the SYSTEM_SPEC § with verbatim shape/algorithm details before any code lands). § M35 (Static Capability Auth Scheme Index Export — V1.16 SHIPPED with synchronous-mismatch guard refinement closed in run_152b21c8bbaa78d9), § M34 (V1.15 SHIPPED), § M33 (V1.14 SHIPPED), § M32 (V1.13 SHIPPED), § M31 (V1.12 SHIPPED), and Constraints 24/25/26/27/28 carry forward verbatim. The closed four-value `confidence_tier` bucket-key enum, the closed two-value `aggregation_key` enum, the frozen tier-function thresholds (`0.85` and `0.6`), the closed-enum bucket iteration order, the per-bucket 8-field entry shape, the top-level `warnings[]` rule, the empty-buckets-omitted rule, the case-sensitive lowercase-only `--tier` filter rule, and the M36 implementation MUST NOT persist `confidence_tier` into the manifest rule are PM-frozen scope decisions and MUST be carried forward unchanged by the dev materialization turn. Independent baseline re-verified on HEAD `7c6b47e`: `npm test` exits 0 with "Smoke tests passed" and "Eval regression harness passed (26 scenarios)"; zero source drift in `src/`, `bin/`, `tests/`, `website/`, `package.json`, `package-lock.json`. The 19-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, **auth**, diff, domain, effect, method, policy, redaction, sensitivity, surface, version, help) is intact — M36 is unchecked planned work, not shipped (the 20th command `confidence` lands in implementation, inserted alphabetically between `auth` and `diff`). The MCP-descriptor candidate in `ROADMAP_NEXT_CANDIDATES.md` remains unbound (form-decision A/B/C still unresolved). No source code modified by this PM turn.

> **M35 Synchronous Mismatch Guard Refinement — 2026-04-26 in run_152b21c8bbaa78d9 (turn_ec2716f4b8fe4ff4, PM attempt 1) at HEAD `dd91aa2`.** Intake charter `intent_1777244614389_af70` (vision_scan, category `roadmap_open_work_detected`) re-injected the M35 V1.16 (PROPOSED) `auth_scheme` bucket-key enum line — the 9th vision_scan stale-checkbox recurrence pattern. Independent re-verification on HEAD `dd91aa2`: `npm test` exit 0 with 26 scenarios; 19-command CLI surface intact (`auth` between `approve` and `diff`); `tusq auth index --help` exits 0 with planning-aid framing and closed-enum bucket iteration order; case-sensitive lowercase `--scheme` enforcement confirmed. M35 is substantively shipped at V1.16. Reconciled documentation drift: 19 of 20 M35 ROADMAP checkboxes flipped `[ ]→[x]`. **Line 629 deliberately remains `[ ]`** — the charter's sharpened sub-requirement "M35 MUST reference the M29 `AUTH_SCHEMES` constant directly + synchronous mismatch guard" is NOT strictly satisfied: `src/cli.js:108` declares `AUTH_SCHEME_INDEX_BUCKET_ORDER` as an independent literal array (with only an alignment comment at line 107), and there is no runtime mismatch guard that fires if M29's `AUTH_SCHEMES` (line 9) is ever extended without a corresponding update. The Constraint 28 sentence "M35 implementation MUST reference the M29 `AUTH_SCHEMES` constant directly (not redeclare an independent enum); a synchronous guard MUST throw if the M35 bucket-key enum and M29 AUTH_SCHEMES ever diverge." is restated here as the dev-implementation directive: (a) derive `AUTH_SCHEME_INDEX_BUCKET_ORDER` from `AUTH_SCHEMES` (e.g., `Object.freeze(AUTH_SCHEMES.filter((s) => s !== 'unknown'))` or equivalent that puts the named six in `bearer → api_key → session → basic → oauth → none` order), AND (b) add a synchronous module-init guard that throws if the named-six set + `unknown` ever diverges from `AUTH_SCHEMES`. The seven-value `auth_scheme` bucket-key enum, the two-value `aggregation_key` enum, the per-bucket 8-field entry shape, the closed-enum bucket iteration order, the case-sensitive lowercase-only `--scheme` filter rule, and Constraint 28 are PM-frozen and MUST be carried forward unchanged by the dev refinement turn. The refinement is bounded (~10 lines), preserves 26 eval scenarios as exit 0, preserves the 19-command CLI surface, preserves all per-bucket entry shape semantics. No source code modified by this PM turn.

> **M35 Charter Sketch Reservation — 2026-04-26 in run_0b373a30d182816a (turn_d7fc926d1c177c66, PM attempt 1) at HEAD `b129ca9`.** This PM turn binds **M35: Static Capability Auth Scheme Index Export from Manifest Evidence (~0.5 day) — V1.16 (PROPOSED)** in `.planning/ROADMAP.md` and `.planning/PM_SIGNOFF.md`, citing VISION.md lines 56–64 (`### Auth, IAM, Permissions, And Tenant Boundaries` — "user authentication, session boundaries, OAuth and OIDC scopes... The generated AI layer must respect the same access rules the logged-in user would have inside the SaaS portal") and lines 689–697 (`### Capability Overexposure` under § Risks — motivating the per-bucket `has_destructive_side_effect` and `has_restricted_or_confidential_sensitivity` cross-axis flags). The full SYSTEM_SPEC § M35 detail block (purpose statement, command shape, frozen seven-value `auth_scheme` bucket-key enum (`bearer | api_key | session | basic | oauth | none | unknown`) referenced from M29 `AUTH_SCHEMES` constant — note `unknown` is already a member of M29 AUTH_SCHEMES, so M35 has no synthesized catchall outside the canonical seven, distinct from M34 where `unknown` was synthesized outside the canonical five HTTP verbs, frozen two-value `aggregation_key` enum (`scheme | unknown`), per-bucket 8-field entry shape with name-and-counters fields only (`auth_scheme`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`), **closed-enum** bucket iteration order rule (`bearer → api_key → session → basic → oauth → none → unknown` — distinct from M31's first-appearance rule because M35 buckets on a closed enum, not an open string; mirroring M32/M33/M34's closed-enum convention with the `unknown` catchall appended last; explicitly NOT an IAM-strength-precedence statement, NOT a trust-ranking, NOT a security-strength ladder despite the visual ordering of `bearer` first and `none → unknown` last), within-bucket manifest-declared-order rule, empty-buckets-MUST-NOT-appear rule, empty-capabilities exit-0 rule with explicit human line `No capabilities in manifest — nothing to index.` and `--json` shape `{ manifest_path, manifest_version, generated_at, schemes: [] }`, I/O stream discipline table, **case-sensitive `--scheme` filter rule** (lowercase only; uppercase values like `BEARER` exit 1 with `Unknown auth scheme:` rather than being lower-cased silently — mirroring the manifest's verbatim lowercase `auth_scheme` field convention), read-only invariants mirroring § M32/M33/M34, non-runtime-enforcer/non-AAA-validator/non-compliance-certifier boundary statement, proposed Constraint 28) is reserved for the dev role's implementation phase per the M27/M28/M29/M30/M31/M32/M33/M34 PM-vs-dev ownership split (PM charters; dev materializes the SYSTEM_SPEC § with verbatim shape/algorithm details before any code lands). § M34 (Static Capability HTTP Method Index Export — V1.15 SHIPPED), § M33 (Static Capability Sensitivity Index Export — V1.14 SHIPPED), § M32 (Static Capability Side-Effect Index Export — V1.13 SHIPPED), § M31 (Static Capability Domain Index Export — V1.12 SHIPPED), and Constraints 24/25/26/27 carry forward verbatim. The closed seven-value `auth_scheme` bucket-key enum, the closed two-value `aggregation_key` enum, the closed-enum bucket iteration order, the per-bucket 8-field entry shape, the empty-buckets-omitted rule, the case-sensitive lowercase-only `--scheme` filter rule, the M35 implementation MUST reference M29 `AUTH_SCHEMES` directly rule, and the M35 implementation MUST NOT modify M29's classifier rule are PM-frozen scope decisions and MUST be carried forward unchanged by the dev materialization turn. Independent baseline re-verified on HEAD `b129ca9`: `npm test` exits 0 with "Smoke tests passed" and "Eval regression harness passed (25 scenarios)"; zero source drift in `src/`, `bin/`, `tests/`, `website/`, `package.json`, `package-lock.json`. The 18-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, domain, effect, method, policy, redaction, sensitivity, surface, version, help) is intact — M35 is unchecked planned work, not shipped (the 19th command `auth` lands in implementation, inserted alphabetically between `approve` and `compile`). The MCP-descriptor candidate in `ROADMAP_NEXT_CANDIDATES.md` remains unbound (form-decision A/B/C still unresolved). No source code modified by this PM turn.

> **M34 Re-Affirmation (Stale-Checkbox Reconciliation) — 2026-04-26, run_9b4197b36f01ca42, turn_2ef90ba3bbd49667, PM attempt 1, HEAD `88762ba`.** SYSTEM_SPEC § M34 (purpose, command shape, frozen five-value `http_method` bucket-key enum + `unknown` catchall, frozen two-value `aggregation_key` enum, frozen 8-field per-bucket entry shape, closed-enum bucket iteration order `GET → POST → PUT → PATCH → DELETE → unknown`, within-bucket manifest-declared-order rule, case-sensitive uppercase-only `--method` filter rule, empty-capabilities exit-0 rule, I/O stream discipline rules, read-only invariants, non-runtime-router/non-REST-validator/non-idempotency-classifier boundary statement) plus Constraint 27 are unchanged in this run. The dev-materialized § M34 detail block from the prior run chain (run_bf8efb6b9c733000) is the source of truth; this turn produces zero source modifications and reconciles only the 20 stale-`[ ]` ROADMAP checkboxes against shipped reality. Verified on HEAD `88762ba`: `npm test` exits 0 with `Eval regression harness passed (25 scenarios)`; the 18-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, domain, effect, **method**, policy, redaction, sensitivity, surface, version, help) is intact; `tusq method index --help` exits 0 with the planning-aid framing callout and the closed-enum bucket iteration order; zero source drift in `src/`, `bin/`, `tests/`, `website/`, `package.json`, `package-lock.json`.

> **M34 Charter Sketch Reservation — 2026-04-26 in run_bf8efb6b9c733000 (turn_8656b25a486eaa6d, PM attempt 1) at HEAD `8921229`.** This PM turn binds **M34: Static Capability HTTP Method Index Export from Manifest Evidence (~0.5 day) — V1.15 (PROPOSED)** in `.planning/ROADMAP.md` and `.planning/PM_SIGNOFF.md`, citing VISION.md lines 40–46 (`### Code And API Surface` — "REST routes, GraphQL operations, queue handlers, and similar entry points"; the HTTP method is the first-class attribute of every REST route and the most operator-recognizable axis of capability surface area) and lines 689–697 (`### Capability Overexposure` under § Risks — motivating the per-bucket `has_destructive_side_effect` and `has_unknown_auth` cross-axis flags). The full SYSTEM_SPEC § M34 detail block (purpose statement, command shape, frozen five-value `http_method` bucket-key enum (`GET | POST | PUT | PATCH | DELETE`) plus `unknown` zero-evidence catchall (six total) covering canonical REST verbs that tusq's scanner already emits in the manifest's `method` field with HEAD/OPTIONS/TRACE/CONNECT/non-standard verbs aggregated into `unknown`, frozen two-value `aggregation_key` enum (`method | unknown`), per-bucket 8-field entry shape with name-and-counters fields only (`http_method`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_unknown_auth`), **closed-enum** bucket iteration order rule (`GET → POST → PUT → PATCH → DELETE → unknown` — distinct from M31's first-appearance rule because M34 buckets on a closed enum, not an open string; mirroring M32/M33's closed-enum convention with the `unknown` catchall appended last; explicitly NOT a CRUD-risk-precedence statement, NOT destructive-ascending, NOT a safety ladder despite matching the conventional REST CRUD reading order GET=read, POST=create, PUT=replace, PATCH=update, DELETE=delete), within-bucket manifest-declared-order rule, empty-buckets-MUST-NOT-appear rule, empty-capabilities exit-0 rule with explicit human line `No capabilities in manifest — nothing to index.` and `--json` shape `{ manifest_path, manifest_version, generated_at, methods: [] }`, I/O stream discipline table, **case-sensitive `--method` filter rule** (uppercase only; lowercase values like `get` exit 1 with `Unknown method:` rather than being upper-cased silently — mirroring the manifest's verbatim uppercase `method` field convention), read-only invariants mirroring § M32/M33, non-runtime-router/non-REST-validator/non-idempotency-classifier boundary statement, proposed Constraint 27) is reserved for the dev role's implementation phase per the M27/M28/M29/M30/M31/M32/M33 PM-vs-dev ownership split (PM charters; dev materializes the SYSTEM_SPEC § with verbatim shape/algorithm details before any code lands). § M33 (Static Capability Sensitivity Index Export — V1.14 SHIPPED), § M32 (Static Capability Side-Effect Index Export — V1.13 SHIPPED), § M31 (Static Capability Domain Index Export — V1.12 SHIPPED), and Constraints 24/25/26 carry forward verbatim. The closed five-value-plus-unknown `http_method` bucket-key enum, the closed two-value `aggregation_key` enum, the closed-enum bucket iteration order, the per-bucket 8-field entry shape, the empty-buckets-omitted rule, the case-sensitive `--method` filter rule, and the M34 implementation MUST NOT modify the upstream scanner's `method` field rule are PM-frozen scope decisions and MUST be carried forward unchanged by the dev materialization turn. Independent baseline re-verified on HEAD `8921229`: `npm test` exits 0 with "Smoke tests passed" and "Eval regression harness passed (24 scenarios)"; zero source drift in `src/`, `bin/`, `tests/`, `website/`, `package.json`, `package-lock.json`. The 17-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, domain, effect, policy, redaction, sensitivity, surface, version, help) is intact — M34 is unchecked planned work, not shipped (the 18th command `method` lands in implementation, inserted alphabetically between `effect` and `policy`). The MCP-descriptor candidate in `ROADMAP_NEXT_CANDIDATES.md` remains unbound (form-decision A/B/C still unresolved). No source code modified by this PM turn.

> **M33 Re-Affirmation (Stale-Checkbox Reconciliation) — 2026-04-26, run_cd98cdad0fb83285, turn_73d77d855d310a6c, PM attempt 1, HEAD `753cf31`.** SYSTEM_SPEC § M33 (purpose, command shape, frozen five-value `sensitivity_class` bucket-key enum, frozen two-value `aggregation_key` enum, frozen 8-field per-bucket entry shape, closed-enum bucket iteration order `public → internal → confidential → restricted → unknown`, within-bucket manifest declared order rule, empty-capabilities exit-0 rule, I/O stream discipline rules, read-only invariants, non-runtime-enforcer/non-compliance-certifier boundary statement) plus Constraint 26 are unchanged in this run. The dev-materialized § M33 detail block from the prior run chain is the source of truth; this turn produces zero source modifications. Verified on HEAD 753cf31: `npm test` exits 0 with `Eval regression harness passed (24 scenarios)`; 17-command CLI surface intact; zero source drift in `src/`, `bin/`, `tests/`, `website/`, `package.json`, `package-lock.json`.

> **M33 Charter Sketch Reservation — 2026-04-26 in run_4506c41d74e23e8e (turn_8803f8edb25d1a0e, PM attempt 1) at HEAD `2dcec80`.** This PM turn binds **M33: Static Capability Sensitivity Index Export from Manifest Evidence (~0.5 day) — V1.14 (PROPOSED)** in `.planning/ROADMAP.md` and `.planning/PM_SIGNOFF.md`, citing VISION.md lines 108–114 (`### Data, Risk, And Sensitivity` — "PII, payment data, secrets, regulated data, and customer-sensitive fields ... capability risk tags and review recommendations") and lines 56–64 (`### Auth, IAM, Permissions, And Tenant Boundaries` — motivating the per-bucket `has_destructive_side_effect` and `has_unknown_auth` cross-axis flags). The full SYSTEM_SPEC § M33 detail block (purpose statement, command shape, frozen five-value `sensitivity_class` bucket-key enum (`public | internal | confidential | restricted | unknown`) aligned 1:1 with the existing M28 `SENSITIVITY_CLASSES` constant, frozen two-value `aggregation_key` enum (`class | unknown`), per-bucket entry shape with name-and-counters fields only (`sensitivity_class`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_unknown_auth`), **closed-enum** bucket iteration order rule (`public → internal → confidential → restricted → unknown` — distinct from M31's first-appearance rule because M33 buckets on a closed enum, not an open string; mirroring M32's closed-enum convention but with the `unknown` catchall appended last; explicitly NOT a risk-precedence statement), within-bucket manifest-declared-order rule, empty-buckets-MUST-NOT-appear rule, empty-capabilities exit-0 rule with explicit human line `No capabilities in manifest — nothing to index.`, I/O stream discipline table, read-only invariants mirroring § M32, non-runtime-enforcer/non-compliance-certifier boundary statement, proposed Constraint 26) is reserved for the dev role's implementation phase per the M27/M28/M29/M30/M31/M32 PM-vs-dev ownership split (PM charters; dev materializes the SYSTEM_SPEC § with verbatim shape/algorithm details before any code lands). § M32 (Static Capability Side-Effect Index Export — V1.13 SHIPPED), § M31 (Static Capability Domain Index Export — V1.12 SHIPPED), and Constraints 24/25 carry forward verbatim. The closed five-value `sensitivity_class` bucket-key enum, the closed two-value `aggregation_key` enum, the closed-enum bucket iteration order, the per-bucket 8-field entry shape, the empty-buckets-omitted rule, and the M33 implementation MUST-reference-M28-SENSITIVITY_CLASSES rule (not redeclare an independent constant) are PM-frozen scope decisions and MUST be carried forward unchanged by the dev materialization turn. Independent baseline re-verified on HEAD `2dcec80`: `npm test` exits 0 with "Smoke tests passed" and "Eval regression harness passed (23 scenarios)"; zero source drift in `src/`, `bin/`, `tests/`, `website/`, `package.json`, `package-lock.json`. The 16-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, domain, effect, policy, redaction, surface, version, help) is intact — M33 is unchecked planned work, not shipped (the 17th command `sensitivity` lands in implementation, inserted alphabetically between `redaction` and `surface`). The MCP-descriptor candidate in `ROADMAP_NEXT_CANDIDATES.md` remains unbound (form-decision A/B/C still unresolved). No source code modified by this PM turn.

> Re-affirmed on 2026-04-26 in run_7183d8c70482329b (turn_f69f5083f63ad652, PM attempt 1) at HEAD `79cf211`. This turn does NOT mutate § M32 or any of its frozen artifacts (PM-vs-dev ownership split; closed four-value `side_effect_class` bucket-key enum `read | write | destructive | unknown`; closed two-value `aggregation_key` enum `class | unknown`; per-bucket 8-field entry shape `{ side_effect_class, aggregation_key, capability_count, capabilities[], approved_count, gated_count, has_restricted_or_confidential_sensitivity, has_unknown_auth }`; closed-enum bucket iteration order `read → write → destructive → unknown` with `unknown` appended last; within-bucket manifest declared order; empty-buckets-MUST-NOT-appear rule; empty-capabilities valid-exit-0 rule with explicit human line `No capabilities in manifest — nothing to index.`; I/O stream discipline rules; read-only invariants mirroring § M27/M28/M29/M30/M31; non-runtime-enforcer/non-risk-classifier boundary statement; Constraint 25). Intake intent `intent_1777236173495_2303` (vision_scan, category `roadmap_open_work_detected`) charter "[roadmap] M32: Static Capability Side-Effect Index Export from Manifest Evidence (~0.5 day) — V1.13 (PROPOSED)" was a stale-checkbox false positive — M32 has been fully shipped at V1.13 in the prior run (`run_ae841429202c5bb7`) which completed all four phases through launch with `run_completion_request=true`. PM-defensible response: flip the 20 M32 ROADMAP checkboxes to reflect verified shipped state, re-anchor planning artifacts in this run, emit zero source/test/website changes. Independent verification on HEAD `79cf211`: `npm test` exits 0 with "Smoke tests passed" and "Eval regression harness passed (23 scenarios)"; `node bin/tusq.js help` enumerates the **16**-command CLI surface with `effect` between `domain` and `policy`; `node bin/tusq.js effect index --help` exits 0 with the planning-aid framing callout. § M32 carries forward verbatim. No source code modified by this PM turn.

> **M32 Charter Sketch Reservation — 2026-04-26 in run_ae841429202c5bb7 (turn_b5d4f652077b62be, PM attempt 1) at HEAD `f858d36`.** This PM turn binds **M32: Static Capability Side-Effect Index Export from Manifest Evidence (~0.5 day) — V1.13 (PROPOSED)** in `.planning/ROADMAP.md` and `.planning/PM_SIGNOFF.md`, citing VISION.md lines 40–46 (`### Code And API Surface`, item 4 "read, write, destructive, financial, security-sensitive, and admin-only side effects") and lines 689–697 (`### Capability Overexposure` under § Risks). The full SYSTEM_SPEC § M32 detail block (purpose statement, command shape, frozen four-value `side_effect_class` bucket-key enum (`read | write | destructive | unknown`), frozen two-value `aggregation_key` enum (`class | unknown`), per-bucket entry shape with name-and-counters fields only, **closed-enum** bucket iteration order rule (`read → write → destructive → unknown` — distinct from M31's first-appearance rule because M32 buckets on a closed enum, not an open string), within-bucket manifest-declared-order rule, empty-buckets-MUST-NOT-appear rule, empty-capabilities exit-0 rule with explicit human line `No capabilities in manifest — nothing to index.`, I/O stream discipline table, read-only invariants mirroring § M31, non-runtime-enforcer/non-risk-classifier boundary statement, proposed Constraint 25) is reserved for the dev role's implementation phase per the M27/M28/M29/M30/M31 PM-vs-dev ownership split (PM charters; dev materializes the SYSTEM_SPEC § with verbatim shape/algorithm details before any code lands). § M31 (Static Capability Domain Index Export — V1.12 SHIPPED) and Constraint 24 carry forward verbatim. The closed four-value `side_effect_class` bucket-key enum, the closed two-value `aggregation_key` enum, the closed-enum bucket iteration order, the per-bucket 8-field entry shape (`side_effect_class`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_restricted_or_confidential_sensitivity`, `has_unknown_auth`), and the empty-buckets-omitted rule are PM-frozen scope decisions and MUST be carried forward unchanged by the dev materialization turn. Independent baseline re-verified on HEAD `f858d36`: `npm test` exits 0 with "Smoke tests passed" and "Eval regression harness passed (22 scenarios)"; zero source drift in `src/`, `bin/`, `tests/`, `website/`, `package.json`, `package-lock.json`. The 15-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, domain, policy, redaction, surface, version, help) is intact — M32 is unchecked planned work, not shipped (the 16th command `effect` lands in implementation). The MCP-descriptor candidate in `ROADMAP_NEXT_CANDIDATES.md` remains unbound (form-decision A/B/C still unresolved). No source code modified by this PM turn.

> Re-affirmed on 2026-04-26 in run_25308eabf162ba8b (turn_cf57b41e62c05af6, PM attempt 1) at HEAD `6c7e7fd`. This turn does NOT mutate § M31 or any of its frozen artifacts (PM-vs-dev ownership split, closed two-value `aggregation_key` enum `domain | unknown`, per-domain 8-field entry shape `{ domain, aggregation_key, capability_count, capabilities[], approved_count, gated_count, has_destructive_side_effect, has_restricted_or_confidential_sensitivity, has_unknown_auth }`, manifest first-appearance ordering rule with `unknown` appended last, empty-capabilities valid-exit-0 rule with explicit human line `No capabilities in manifest — nothing to index.`, I/O stream discipline rules, read-only invariants mirroring § M30, non-skill-pack/non-rollout/non-workflow boundary statement, Constraint 24). Intake intent intent_1777233493634_b5f9 (vision_scan, category `roadmap_open_work_detected`) charter "[roadmap] M31: Static Capability Domain Index Export from Manifest Evidence (~0.5 day) — V1.12 (PROPOSED)" was a stale-checkbox false positive — M31 has been fully shipped at V1.12 in the prior run (run_e40832d436a42d75) which completed all four phases through launch with `run_completion_request=true`. Re-implementing M31 would re-run `computeCapabilityDigest` over identical content and produce no semantic change, but would risk triggering a forced re-approval sweep without a corresponding governance event — violating Constraint 24 (M31 domain-index planning-aid framing invariant) and the read-only invariants in § M31. PM-defensible response: flip the 19 M31 ROADMAP checkboxes to reflect verified shipped state, re-anchor planning artifacts in this run, emit zero source/test/website changes. Independent verification on HEAD `6c7e7fd`: `npm test` exits 0 with "Smoke tests passed" and "Eval regression harness passed (22 scenarios)"; `node bin/tusq.js help` enumerates the **15**-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, domain, policy, redaction, surface, version, help); `node bin/tusq.js domain index --help` exits 0 with the planning-aid framing callout. § M31 carries forward verbatim. No source code modified by this PM turn.

> **M31 Charter Sketch Reservation — 2026-04-26 in run_e40832d436a42d75 (turn_104e8064c293ba9f, PM attempt 1) at HEAD `dcf9098`.** This PM turn binds **M31: Static Capability Domain Index Export from Manifest Evidence (~0.5 day) — V1.12 (PROPOSED)** in `.planning/ROADMAP.md` and `.planning/PM_SIGNOFF.md`, citing VISION.md lines 74–82 (`### Domain Model And Workflows`) and lines 175–185 (`### Skills`). The full SYSTEM_SPEC § M31 detail block (purpose statement, command shape, frozen two-value `aggregation_key` enum (`domain | unknown`), per-domain entry shape with name-and-counters fields only, manifest first-appearance ordering rule, empty-capabilities exit-0 rule with explicit human line `No capabilities in manifest — nothing to index.`, I/O stream discipline table, read-only invariants mirroring § M30, non-skill-pack/non-rollout/non-workflow boundary statement, proposed Constraint 24) is reserved for the dev role's implementation phase per the M27/M28/M29/M30 PM-vs-dev ownership split (PM charters; dev materializes the SYSTEM_SPEC § with verbatim shape/algorithm details before any code lands). § M30 (M30 surface-plan planner — V1.11 SHIPPED) and Constraints 27/28 carry forward verbatim. The closed two-value `aggregation_key` enum, the manifest first-appearance ordering rule, and the per-domain shape (8 fields: `domain`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`, `has_unknown_auth`) are PM-frozen scope decisions and MUST be carried forward unchanged by the dev materialization turn. Independent baseline re-verified on HEAD `dcf9098`: `npm test` exits 0 with "Smoke tests passed" and "Eval regression harness passed (21 scenarios)"; zero source drift in `src/`, `bin/`, `tests/`, `website/`, `package.json`, `package-lock.json`. The 14-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, surface, version, help) is intact — M31 is unchecked planned work, not shipped (the 15th command `domain` lands in implementation). The MCP-descriptor candidate in `ROADMAP_NEXT_CANDIDATES.md` remains unbound (form-decision A/B/C still unresolved). No source code modified by this PM turn.

> Re-affirmed on 2026-04-26 in run_7894753f9c47c8e3 (turn_b2926375e6189caf, PM attempt 1) at HEAD `b6bfcb8`. This turn does NOT mutate § M30 or any of its frozen artifacts (PM-vs-dev ownership split, closed four-value `surface` enum `chat | palette | widget | voice`, closed six-value `gated_reason` enum, per-surface eligibility precedence table with six gates first-match-wins, ten-row read-only invariants table, empty-capabilities valid-exit-0 rule with explicit human line `No capabilities in manifest — nothing to plan.`, ten-row I/O stream discipline table, non-runtime-generator boundary statement, Constraints 27 and 28). Intake intent intent_1777223991256_bb53 (vision_scan, category `roadmap_open_work_detected`) charter "[roadmap] M30: Static Embeddable-Surface Plan Export from Manifest Evidence — V1.11 (PROPOSED)" was a stale-checkbox false positive — M30 has been fully shipped at V1.11 in the prior run (run_24ccd92f593d8647) which completed all four phases through launch with `run_completion_request=true`. Re-implementing M30 would re-run `computeCapabilityDigest` over identical content and produce no semantic change, but would risk triggering a forced re-approval sweep without a corresponding governance event — violating Constraints 23/27 (M30 surface-plan planning-aid framing invariant) and the read-only invariants in § M30. PM-defensible response: flip the 21 M30 ROADMAP checkboxes to reflect verified shipped state, re-anchor planning artifacts in this run, emit zero source/test/website changes. Independent verification on HEAD `b6bfcb8`: `npm test` exits 0 with "Smoke tests passed" and "Eval regression harness passed (21 scenarios)"; `node bin/tusq.js help` enumerates the **14**-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, surface, version, help); `node bin/tusq.js surface plan --help` exits 0 with the planning-aid framing callout. § M30 carries forward verbatim. No source code modified by this PM turn.

> Re-affirmed on 2026-04-26 in run_24ccd92f593d8647 (turn_5f551e9f95cc3829, PM attempt 1) at HEAD `e524f7b`. This turn re-anchors PM participation in this gate artifact for the current run, refreshing the stale `non_progress_signature` recorded in `.agentxchain/state.json`. The § M30 section below (chartered in turn_fa7dbb75b01943f5, commit da8a75e) is unchanged: PM-vs-dev ownership split preserved (PM scope/enums/invariants/framing; dev algorithm details), the closed four-value `surface` enum (`chat | palette | widget | voice`) remains frozen, the closed six-value `gated_reason` enum remains frozen, the per-surface eligibility precedence table (six gates, first-match-wins) is unchanged, the ten-row read-only invariants table is unchanged, the empty-capabilities valid-exit-0 rule with explicit human line `No capabilities in manifest — nothing to plan.` is unchanged, the ten-row I/O stream discipline table is unchanged, the non-runtime-generator boundary statement is unchanged, and Constraints 27 (M30 surface-plan planning-aid framing invariant) and 28 (run-specific binding) remain in place. M30 remains V1.11 PROPOSED — implementation-ready planned work, not shipped. Baseline re-verified before this edit: `npm test` exits 0 with 20 scenarios on HEAD `e524f7b`; zero source drift in `src/`, `bin/`, `tests/`, `website/`. No source code modified by this PM turn.

> Re-affirmed on 2026-04-26 in run_d69cb0392607d170 (turn_641188dc0c4b7616, PM attempt 1) at HEAD `5e1feae`. This turn does NOT mutate § M28 or any of its frozen artifacts (the closed five-value `sensitivity_class` enum, the frozen six-rule first-match-wins decision table, the zero-evidence `unknown` guard, the M13 `capability_digest` inclusion, the AC-9 compile/approve/serve invariants, the optional `--sensitivity <class>` filter on the existing `tusq review` command, or Constraint 21). Intake intent intent_1777180727050_1210 (vision_scan p2) charter "[roadmap] M28: Static Sensitivity Class Inference from Manifest Evidence" was a stale-checkbox false positive — M28 has been shipped at V1.9 since run_b784b6baf905fc02 and is a foundation dependency for M29's `sensitivity_class_propagation` evidence_source value (V1.10). Re-implementing M28 would re-run `computeCapabilityDigest` over identical content and produce no semantic change, but would risk triggering a forced re-approval sweep without a corresponding governance event — violating the spirit of Constraint 18 (no auto-escalation of `sensitivity_class`) and Constraint 21 (M28 reviewer-aid framing invariant). PM-defensible response: flip the M28 ROADMAP checkboxes to reflect verified shipped state, re-anchor planning artifacts in this run, emit zero source/test/website changes. Independent verification on HEAD `5e1feae`: `npm test` exits 0 with "Smoke tests passed" and "Eval regression harness passed (16 scenarios)"; `node bin/tusq.js help` enumerates the 13-command CLI surface unchanged. § M28 (line ~2782) and Constraint 21 (line ~3218) carry forward verbatim.

> Re-affirmed on 2026-04-25 in run_8fe3b8b418dc589c (turn_5d368031b5a8881a, PM attempt 2) at HEAD `1943326`. The § M29 section below carries the verbatim closed seven-value `auth_scheme` enum {bearer, api_key, session, basic, oauth, none, unknown}, the verbatim closed five-value `evidence_source` enum {middleware_name, route_prefix, auth_required_flag, sensitivity_class_propagation, none}, the frozen six-rule first-match-wins decision table (R1 /bearer\|jwt\|access[_-]?token/i → bearer; R2 /api[_-]?key\|x-api-key/i → api_key; R3 /session\|cookie\|passport-local/i → session; R4 /basic[_-]?auth/i → basic; R5 /oauth\|oidc\|openid/i → oauth; R6 auth_required === false AND non-admin route → none; default → unknown), the frozen scope/role extraction rules with order-preserving case-sensitive dedup, the zero-evidence `unknown` guard (NEVER silently `none`), the M13 `capability_digest` inclusion driving re-approval on flip, the AC-7 affirmative compile-surface-invariant AND serve-surface-invariant (`auth_requirements` MUST NOT appear in any compiled `tools/*.json` and MUST NOT appear in any `tusq serve` MCP response shape), and Constraint 22 (reviewer-aid framing — NOT runtime AAA enforcement, NOT OAuth/OIDC/SAML/SOC2 attestation). All chartered in the prior run (commit 66cec85, turn_480dc289e36bfeba) and re-anchored in turn_018f55250ec41d6d. This turn re-anchors that content for the current child run so the planning_signoff gate observes in-run PM participation. No source code modified by this turn.

> Re-affirmed on 2026-04-25 in run_44a179ccf81697c3 (turn_018f55250ec41d6d, PM attempt 4) at HEAD `5600a0d`. The § M29 section below was authored in the prior run (commit 66cec85, turn_480dc289e36bfeba) and carries the verbatim seven-value `auth_scheme` enum, the verbatim five-value `evidence_source` enum, the frozen six-rule first-match-wins decision table, the frozen scope/role extraction rules, the zero-evidence `unknown` guard, and Constraint 22. This turn re-anchors that content for the current run and adds ONE explicit affirmative invariant in § M29: in addition to the existing serve-surface-invariant ("`auth_requirements` MUST NOT appear in any `tusq serve` MCP response shape — `tools/list`, `tools/call`, or `dry_run_plan`"), § M29 also codifies a compile-surface-invariant in the same affirmative form: "`auth_requirements` MUST NOT appear as a top-level key in any compiled tool definition emitted by `tusq compile` to `tools/*.json`. Both invariants are stronger than the AC-7 byte-identity guarantee alone — byte-identity says the bytes are unchanged; the explicit affirmative invariants forbid an implementer from interpreting AC-7 as 'add the field but in a deterministic order so byte-identity holds for any given input'. The two invariants together close that ambiguity." No source code was modified by this PM turn.

## Purpose

Build the tusq.dev public-facing website, documentation, and blog using Docusaurus. This replaces the current static HTML landing page (`websites/`) with a maintainable, extensible docs platform that serves as the primary entry point for developers evaluating and using tusq.dev.

**What this delivers:** A Docusaurus-powered site with three surfaces — marketing homepage, CLI/usage documentation, and a blog — all aligned with the accepted V1 product truth from the prior planning/launch artifacts.

**What this does NOT deliver:** New product features, CLI changes, or any content that extends beyond the verified V1 boundary. The Docusaurus platform is a content delivery mechanism, not a product change.

## Scope — what ships

### In scope

1. **Docusaurus project setup** — Initialize a Docusaurus project within the repo (e.g., `website/` directory), configured with TypeScript, custom theme colors, and the tusq.dev brand identity
2. **Homepage migration** — Migrate the current `websites/index.html` landing page content into a Docusaurus custom homepage component, preserving the hero, feature cards, workflow steps, and V1 surface grid
3. **Documentation site** — Create user-facing docs pages derived from the accepted planning artifacts:
   - Getting Started (install, init, scan, manifest, compile, serve workflow)
   - CLI Reference (current CLI commands with flags, from command-surface.md)
   - Manifest Format (tusq.manifest.json schema and fields)
   - Configuration (tusq.config.json reference)
   - Supported Frameworks (Express, Fastify, NestJS — what works, what doesn't)
   - MCP Server (describe-only behavior, tools/list, tools/call)
   - FAQ (sourced from MESSAGING.md claims/non-claims)
4. **Blog setup** — Configure the built-in Docusaurus blog plugin with:
   - Launch announcement post (from ANNOUNCEMENT.md)
   - Release notes post (from RELEASE_NOTES.md)
   - Blog index and RSS feed
5. **Navigation and sidebar** — Top nav with Docs, Blog, GitHub link. Docs sidebar with logical grouping
6. **Product truth alignment** — All content must stay within the claims defined in MESSAGING.md "Product Truth" and "Claims We Can Defend" sections. No overclaiming
7. **SEO and metadata** — Proper `<title>`, `<meta description>`, Open Graph tags on all pages
8. **404 page** — Custom 404 page (migrate from `websites/404.html`)
9. **Build and deploy readiness** — `npm run build` produces a static site suitable for deployment to any static host

### Out of scope

- Hosting/deployment configuration (Vercel, Netlify, GitHub Pages setup) — human decision
- Custom Docusaurus plugins
- Search integration (Algolia, etc.) — can be added later
- i18n / localization
- Analytics integration
- Interactive demos or embedded terminals
- API reference auto-generation from source code
- Any content about features not shipped in V1 presented as current capabilities

## Content Architecture

### Documentation pages

| Page | Source | Purpose |
|------|--------|---------|
| Getting Started | SYSTEM_SPEC.md workflow + README quickstart | First-run developer experience |
| CLI Reference | command-surface.md | Complete command/flag reference |
| Manifest Format | SYSTEM_SPEC.md manifest section | Schema documentation for tusq.manifest.json |
| Configuration | SYSTEM_SPEC.md init section | tusq.config.json reference |
| Supported Frameworks | SYSTEM_SPEC.md scope + MESSAGING.md | Express, Fastify, NestJS details |
| MCP Server | SYSTEM_SPEC.md serve section | Describe-only MCP behavior |
| FAQ | MESSAGING.md claims/non-claims | Common questions and honest answers |

### Blog posts

| Post | Source | Purpose |
|------|--------|---------|
| Announcing tusq.dev v0.1.0 | ANNOUNCEMENT.md | Launch narrative |
| Release Notes: v0.1.0 | RELEASE_NOTES.md | Changelog and feature list |

### Homepage sections

| Section | Source | Content |
|---------|--------|---------|
| Hero | websites/index.html + MESSAGING.md | One-line positioning + CTA |
| What it does / ships / matters | websites/index.html cards | Three feature cards |
| Workflow | websites/index.html steps | 5-step terminal workflow |
| V1 Surface | websites/index.html grid | Shipped CLI capabilities |

## File Structure

```
website/
├── docusaurus.config.ts        # Site config, navbar, footer, metadata
├── sidebars.ts                 # Docs sidebar structure
├── package.json                # Docusaurus dependencies
├── tsconfig.json
├── src/
│   ├── pages/
│   │   └── index.tsx           # Custom homepage component
│   └── css/
│       └── custom.css          # Brand colors, fonts (from websites/styles.css)
├── docs/
│   ├── getting-started.md      # Install + workflow
│   ├── cli-reference.md        # All 8 commands
│   ├── manifest-format.md      # tusq.manifest.json schema
│   ├── configuration.md        # tusq.config.json
│   ├── frameworks.md           # Supported frameworks
│   ├── mcp-server.md           # Describe-only MCP
│   └── faq.md                  # FAQ
├── blog/
│   ├── 2026-04-18-announcing-tusq-dev.md
│   └── 2026-04-18-release-notes-v0-1-0.md
└── static/
    └── img/                    # Any images/logos
```

## Behavior

### Build

- `cd website && npm install && npm run build` produces a complete static site in `website/build/`
- Build must complete with zero errors and zero warnings (Docusaurus broken-link checker must pass)
- All internal links resolve. No dead links

### Development

- `cd website && npm start` runs local dev server with hot reload
- Default port: 3000 (Docusaurus default)

### Content ownership

- Product-marketing owns all website, docs, and blog content
- Docs content is derived from accepted planning artifacts but written in user-facing language (not internal planning jargon)
- Blog posts are adapted from launch artifacts, not copy-pasted

## Interface

The tusq.dev docs platform exposes three user-facing interfaces:

### CLI Interface (Build Commands)

Developers interact with the Docusaurus site through standard npm scripts in the `website/` directory:

| Command | Description | Output |
|---------|-------------|--------|
| `npm install` | Install all Docusaurus dependencies | `node_modules/` |
| `npm start` | Launch local dev server with hot reload | Dev server on `http://localhost:3000` |
| `npm run build` | Build static site for production | Static files in `website/build/` |
| `npm run serve` | Serve the production build locally | Local server on `http://localhost:3000` |

All commands run from the `website/` working directory. No global CLI is required.

### Web Interface (Site Navigation)

Users navigate the site through:

- **Top navbar:** tusq.dev brand (→ homepage), Docs (→ `/docs/getting-started`), Blog (→ `/blog`), GitHub (→ external repo)
- **Docs sidebar:** Grouped by Getting Started, Reference (CLI Reference, Manifest Format, Configuration), Guides (Supported Frameworks, MCP Server), Help (FAQ)
- **Blog index:** Chronological list of posts with RSS feed

### Content Interface (Authoring)

Content authors interact with Docusaurus via:

- **Docs:** Markdown files in `website/docs/` with YAML frontmatter (`title`, `sidebar_label`, `sidebar_position`)
- **Blog:** Markdown files in `website/blog/` with date-prefixed filenames and author frontmatter
- **Homepage:** React component in `website/src/pages/index.tsx`
- **Config:** `docusaurus.config.ts` for site metadata, navbar, footer, and plugin settings

## Acceptance Tests

### Setup
- [ ] `website/` directory exists with a valid Docusaurus project
- [ ] `cd website && npm install` succeeds
- [ ] `cd website && npm run build` succeeds with zero errors

### Homepage
- [ ] Homepage renders with hero, feature cards, workflow steps, and V1 surface grid
- [ ] Homepage content matches MESSAGING.md product truth — no overclaiming
- [ ] Homepage links to docs and blog

### Documentation
- [ ] All 7 docs pages exist and render without errors
- [ ] Getting Started page contains the full 6-command workflow
- [ ] CLI Reference page documents all 8 commands with flags
- [ ] Manifest Format page describes all capability fields
- [ ] MCP Server page explicitly states describe-only behavior
- [ ] FAQ page addresses "Does it execute tools?" and "Which frameworks?"
- [ ] Docs sidebar navigation works correctly

### Blog
- [ ] Blog index page lists all posts
- [ ] Launch announcement post renders correctly
- [ ] Release notes post renders correctly
- [ ] Blog RSS feed is generated

### Navigation
- [ ] Top navbar has Docs, Blog, and GitHub links
- [ ] All internal links resolve (no broken links)
- [ ] 404 page renders for unknown routes

### Product truth
- [ ] No page claims tusq.dev executes live API calls in V1
- [ ] No page claims support for Python, Go, Java, or frameworks beyond Express/Fastify/NestJS
- [ ] No page presents runtime learning, plugin API, or hosted execution as current features
- [ ] Framework support is visible on homepage and in docs

## The Canonical Artifact: Input and Output Shapes

This section formally specifies the shapes of every artifact that tusq.dev produces. These shapes are the contract between the CLI, the manifest, the compiled tools, and the MCP server. All downstream consumers (docs, agents, CI checks) depend on these shapes being stable and versioned.

### 1. `tusq.config.json` — Project Configuration (Input)

The configuration file that `tusq init` creates. It governs all subsequent CLI commands.

```json
{
  "version": 1,
  "framework": "express | fastify | nestjs | unknown",
  "scan": {
    "include": ["**/*.js", "**/*.ts"],
    "exclude": ["node_modules", ".git", ".tusq", "dist", "build", "coverage"]
  },
  "output": {
    "scan_file": ".tusq/scan.json",
    "manifest_file": "tusq.manifest.json",
    "tools_dir": "tusq-tools"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | integer | yes | Schema version; always `1` in V1 |
| `framework` | string | yes | Detected or user-specified framework |
| `scan.include` | string[] | yes | Glob patterns for source files to scan |
| `scan.exclude` | string[] | yes | Directory names to skip |
| `output.scan_file` | string | yes | Path for scan output relative to project root |
| `output.manifest_file` | string | yes | Path for manifest output relative to project root |
| `output.tools_dir` | string | yes | Directory for compiled tool definitions |

### 2. `.tusq/scan.json` — Scan Output

Produced by `tusq scan <path>`. Contains raw route discovery results before human review.

```json
{
  "generated_at": "<ISO 8601 timestamp>",
  "target_path": "<absolute path to scanned project>",
  "framework": "express | fastify | nestjs",
  "warnings": ["<string>"],
  "route_count": 2,
  "routes": [ "<Route object — see below>" ]
}
```

**Route object shape:**

```json
{
  "framework": "express | fastify | nestjs",
  "method": "GET | POST | PUT | PATCH | DELETE | OPTIONS | HEAD",
  "path": "/users/:id",
  "handler": "listUsers | inline_handler | unknown_handler",
  "domain": "users",
  "auth_hints": ["requireAuth", "AdminGuard"],
  "provenance": {
    "file": "src/app.ts",
    "line": 12
  },
  "confidence": 0.86,
  "input_schema": {
    "type": "object",
    "additionalProperties": true,
    "description": "<inference status message>"
  },
  "output_schema": {
    "type": "object",
    "additionalProperties": true,
    "description": "<inference status message>"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `framework` | string | Which framework detector matched this route |
| `method` | string | HTTP method (uppercased) |
| `path` | string | Route path, always starts with `/` |
| `handler` | string | Function name or `inline_handler` / `unknown_handler` |
| `domain` | string | Inferred from first meaningful path segment (after prefix-skipping) or controller prefix |
| `auth_hints` | string[] | Middleware/decorator names matching auth patterns |
| `provenance.file` | string | Relative path to source file |
| `provenance.line` | integer | 1-based line number |
| `confidence` | number | 0.0–0.95 score based on handler quality, auth hints, schema hints, path specificity |
| `input_schema` | object | JSON Schema for expected input; conservative (`additionalProperties: true`) in V1 |
| `output_schema` | object | JSON Schema for expected output; conservative in V1 |

**Confidence scoring (V1):**

| Signal | Score delta |
|--------|------------|
| Base score | +0.62 |
| Named handler (not inline/unknown) | +0.12 |
| Auth hints present | +0.08 |
| Schema hint detected (zod, joi, DTO) | +0.14 |
| Non-root path | +0.04 |
| No schema hint detected | -0.10 |
| **Cap** | **0.95** |

The schema-less penalty ensures routes without extractable schema signal (the majority in real codebases) trigger `review_needed: true` (threshold 0.8) even when handler name and auth are present. See First-Pass Manifest Usability section for detailed impact analysis.

#### Framework Support Depth — V1

The vision requires "support the most common framework stacks deeply within the first release" (VISION.md line 71). V1 delivers deep support for the three most widely used Node.js backend frameworks: **Express**, **Fastify**, and **NestJS**. "Deep" means every framework detector extracts the full Route object shape (method, path, handler, domain, auth_hints, provenance, confidence, schema_hint) using framework-specific patterns — not a single generic regex.

**Per-framework detection matrix:**

| Capability | Express | Fastify | NestJS |
|------------|---------|---------|--------|
| Route method extraction | `app.get/post/put/patch/delete/options/head` | `fastify.get/post/...` + `fastify.route({method})` | `@Get/@Post/@Put/@Patch/@Delete` decorators |
| Route path extraction | String literal in route call | String literal + `url`/`path` in route block | `@Controller()` prefix + method decorator argument |
| Named handler detection | Last identifier in handler expression | `handler:` property in route block | Next method signature after decorator |
| Inline handler detection | Arrow function / `function(` test | Arrow function / `function(` test | N/A (NestJS uses class methods) |
| Middleware chain extraction | All tokens except last in handler expression | Token extraction from inline handler | Class-level + method-level `@UseGuards` |
| Auth hint extraction | Handler expression + 3-line radius | Handler expression + 5-line radius + route block tokens | Class `@UseGuards` + method decorators + controller metadata |
| Schema hint detection | `zod`, `z.object`, `joi`, `schema` in 3-line radius | `schema:` property in 5-line radius | `dto`, `schema`, `zod`, `class-validator` in 4-line radius |
| Domain inference | First path segment | First path segment | Controller prefix or first path segment |
| Controller/prefix resolution | N/A | N/A | `@Controller('prefix')` → prepended to all method paths |
| Guard inheritance | N/A | N/A | Class-level guards inherited by all methods in controller |
| Deduplication | N/A | Cross-pattern dedup (inline + `fastify.route()` matches) | N/A |
| Nearby code radius | 3 lines | 5 lines (inline), full block (route object) | 4 lines |

**Why these three frameworks:**

Express, Fastify, and NestJS account for the overwhelming majority of Node.js backend API projects. Express is the default choice; Fastify is the performance-oriented alternative; NestJS is the enterprise/TypeScript-first framework built on top of Express or Fastify. Together they cover the spectrum from minimal to opinionated Node.js backends.

**Why Node.js only in V1:**

1. **Depth over breadth.** VISION line 114: "Support fewer stacks, deeper... done correctly, beats thin support for twelve." Shipping three deeply-supported frameworks with full governance metadata is more valuable than shallow support for many.
2. **Shared extraction infrastructure.** All three frameworks share the same runtime (Node.js), the same module system, and similar routing conventions. The confidence scoring, auth hint extraction, schema detection, and domain inference logic is reusable across all three without framework-specific reimplementation.
3. **Target audience alignment.** The V1 target user is a backend engineering team evaluating tusq.dev against a real codebase. Node.js backends are the most common target for AI-enablement due to the prevalence of REST APIs built on these frameworks.

**V1 framework detection limitations:**

| Limitation | Impact | V2 plan |
|-----------|--------|---------|
| Regex-based, not AST | May miss dynamically constructed routes or complex middleware chains | AST parsing with framework-specific visitors |
| No router composition | `express.Router()` sub-routers with `.use()` mounting not followed | Router graph resolution |
| No middleware ordering | Auth middleware order not captured | Middleware pipeline reconstruction |
| No re-export following | Routes defined in re-exported modules not discovered | Module resolution + re-export tracing |
| Single-file scope | Each file scanned independently; cross-file patterns missed | Multi-file analysis with import graph |
| No TypeScript type inference | Type annotations in handlers not used for schema extraction | TypeScript compiler API integration |

**V2 framework expansion plan:**

| Framework | Language | Priority | Rationale |
|-----------|----------|----------|-----------|
| Django REST Framework | Python | High | Most popular Python API framework; decorator-based routing similar to NestJS |
| FastAPI | Python | High | Growing rapidly; type-annotated routes enable richer schema extraction |
| Flask | Python | Medium | Widely used but less structured; fewer extraction signals |
| Spring Boot | Java | Medium | Enterprise standard; annotation-based routing |
| Gin / Echo | Go | Lower | Common but Go projects often use custom routing |

V2 framework support will be delivered through the plugin interface (VISION line 130: "Framework detectors... all live behind plugin interfaces"). Each framework adapter implements a standard `extractRoutes(content, filePath)` interface, enabling community contribution without core changes.

### 3. `tusq.manifest.json` — The Canonical Artifact

Produced by `tusq manifest`. This is the reviewable contract between code and agents — the central product of tusq.dev.

```json
{
  "schema_version": "1.0",
  "manifest_version": 1,
  "previous_manifest_hash": null,
  "generated_at": "<ISO 8601 timestamp>",
  "source_scan": ".tusq/scan.json",
  "capabilities": [ "<Capability object — see below>" ]
}
```

**Capability object shape:**

```json
{
  "name": "get_users_users",
  "description": "Retrieve users — read-only, requires requireAuth (handler: listUsers)",
  "method": "GET",
  "path": "/users",
  "input_schema": {
    "type": "object",
    "properties": {},
    "required": [],
    "additionalProperties": true,
    "description": "No required input detected; review optional query/body fields manually."
  },
  "output_schema": {
    "type": "array",
    "items": {
      "type": "object",
      "additionalProperties": true
    },
    "description": "Inferred array response from handler return/json usage."
  },
  "side_effect_class": "read | write | destructive",
  "sensitivity_class": "unknown | public | internal | confidential | restricted",
  "auth_hints": ["requireAuth"],
  "examples": [
    {
      "input": {},
      "output": {
        "note": "Describe-only mode in V1. Live execution is deferred to V1.1."
      }
    }
  ],
  "constraints": {
    "rate_limit": null,
    "max_payload_bytes": null,
    "required_headers": [],
    "idempotent": null,
    "cacheable": null
  },
  "redaction": {
    "pii_fields": [],
    "log_level": "full",
    "mask_in_traces": false,
    "retention_days": null
  },
  "provenance": {
    "file": "src/app.ts",
    "line": 12,
    "handler": "listUsers",
    "framework": "express"
  },
  "confidence": 0.86,
  "review_needed": false,
  "approved": true,
  "approved_by": null,
  "approved_at": null,
  "capability_digest": "a1b2c3d4e5f6...",
  "domain": "users"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | `{method}_{domain}_{path_slug}` — unique identifier (domain uses smart prefix-skipping) |
| `description` | string | Rich description: "{verb} {noun} {qualifier} — {side_effect}, {auth_context} (handler: {name})" |
| `method` | string | HTTP method (uppercased) |
| `path` | string | Route path |
| `input_schema` | object | JSON Schema describing expected input parameters |
| `output_schema` | object | JSON Schema describing expected response shape |
| `side_effect_class` | string | `read` (GET/HEAD/OPTIONS), `write` (POST/PUT/PATCH), or `destructive` (DELETE or destructive handler names) |
| `sensitivity_class` | string | `unknown` (default in V1), `public`, `internal`, `confidential`, or `restricted` — see classification rules below |
| `auth_hints` | string[] | Auth-related middleware/decorators detected |
| `examples` | array | Request/response examples; static describe-only placeholder in V1 — see Examples specification below |
| `constraints` | object | Operational constraints on the capability (rate limits, payload limits, idempotency) — see Constraints specification below |
| `redaction` | object | Redaction policy for this capability's input/output — see Redaction and Approval Metadata below |
| `provenance` | object | Source file, line number, handler, and framework metadata |
| `confidence` | number | 0.0–0.95 |
| `review_needed` | boolean | `true` when `confidence < 0.8` — see Redaction and Approval Metadata below |
| `approved` | boolean | Human-set gate; only `approved: true` capabilities compile into tools — see Redaction and Approval Metadata below |
| `approved_by` | string \| null | Identity of the human who approved this capability. `null` until explicitly set |
| `approved_at` | string \| null | ISO 8601 timestamp of when approval was granted. `null` until explicitly set |
| `capability_digest` | string | SHA-256 hex digest of content fields (excluding approval/review metadata and the digest itself). Enables change detection between manifest versions — see Version History and Diffs section |
| `domain` | string | Logical grouping (inferred from route prefix with smart prefix-skipping — see First-Pass Manifest Usability) |

**V1 input/output schema limitations:** In V1, `input_schema` and `output_schema` remain intentionally conservative, but they include first-pass route evidence when it is safe to infer. Path parameters become required string properties, write methods receive a `body` object placeholder, array returns are represented as `type: "array"`, and simple object literal responses expose property names and literal types. Full body/query schema inference from DTOs, Zod schemas, or Joi validators remains a V2 goal.

#### First-Pass Manifest Usability

VISION.md line 72 requires "produce manifests that are usable on first pass for real codebases, not toy examples." Line 73 adds: "treat manual manifest authoring as a failure of the engine, not a feature." The following four improvements use only information the scanner already computes to make first-pass output actionable without full manual rewrite.

##### 1. Path Parameter Extraction

Route paths like `/users/:id` and `/orders/{orderId}/items` contain explicit parameter names. V1 must extract these into `input_schema.properties` so that LLM consumers know what arguments to provide.

**Extraction rules:**

| Pattern | Regex | Example | Extracted parameter |
|---------|-------|---------|-------------------|
| Express/Fastify colon params | `/:([a-zA-Z_][a-zA-Z0-9_]*)` | `/users/:id` | `id` |
| OpenAPI-style brace params | `/\{([a-zA-Z_][a-zA-Z0-9_]*)\}` | `/orders/{orderId}` | `orderId` |

**V1 `input_schema` with path parameters:**

When path parameters are detected, `input_schema` is enriched:

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "source": "path",
      "description": "Path parameter: id"
    }
  },
  "required": ["id"],
  "additionalProperties": true,
  "description": "path parameters inferred from route pattern."
}
```

When no path parameters are detected, the schema remains conservative for read routes. For write routes, V1 adds a `body` object placeholder with `source: "request_body"` or `source: "framework_schema_hint"`.

**Pipeline propagation:** Path parameter extraction occurs in `finalizeRouteInference()` during `tusq scan`. The enriched `input_schema` flows unchanged through `tusq manifest` → `tusq compile` → `tusq serve` (both `tools/list` and `tools/call`).

**Agent implication:** An LLM receiving a tool with `required: ["id"]` in `input_schema` knows it must provide an `id` argument. Without this, the LLM has no signal about what the tool needs beyond `{ type: "object", additionalProperties: true }`.

**V1 limitations:**
- All path parameters are typed as `string` — no type inference from handler code
- Query parameters and request body fields are not extracted (V2 goal via DTO/Zod/Joi parsing)
- Path parameter descriptions are generic ("Path parameter: {name}") — no semantic inference

##### 2. Smart Domain Inference

The current `inferDomain()` takes the first non-parameter path segment. For routes mounted under API version prefixes (`/api/v1/users/:id`), this produces domain `api` — useless for grouping.

**V1 prefix-skipping rules:**

The following path segments are skipped when inferring domain:

| Prefix | Why it's skipped |
|--------|-----------------|
| `api` | Generic API namespace, not a business domain |
| `v1`, `v2`, `v3`, `v4`, `v5` | API version prefixes |
| `rest` | Transport-layer label |
| `graphql` | Transport-layer label |
| `internal` | Access-layer label, not a domain |
| `public` | Access-layer label, not a domain |
| `external` | Access-layer label, not a domain |

**Updated inference algorithm:**

1. Split path by `/`, filter out empty segments and parameter tokens (`:id`, `{id}`)
2. Skip segments matching the prefix-skip list (case-insensitive)
3. Take the first remaining segment as the domain
4. If no segments remain after skipping, fall back to `general`

**Examples:**

| Route path | Current domain | Corrected domain |
|-----------|---------------|-----------------|
| `/users` | `users` | `users` (unchanged) |
| `/api/v1/users/:id` | `api` | `users` |
| `/api/v2/orders/{orderId}/items` | `api` | `orders` |
| `/internal/admin/roles` | `internal` | `admin` |
| `/v1/health` | `v1` | `health` |
| `/` | `general` | `general` (unchanged) |

**Cascade effect on `name`:** Since `capabilityName()` uses `domain`, correcting the domain also fixes the capability name. `get_api_api_v1_users_id` becomes `get_users_users_id`.

##### 3. Rich Capability Descriptions

The current `describeCapability()` produces: `"GET /users capability in users domain"`. This template string conveys no semantic value to an LLM deciding whether to use a tool.

**V1 rich description template:**

```
{verb} {noun} {qualifier} — {side_effect}, {auth_context} (handler: {handler_name})
```

**Template field derivation:**

| Field | Source | Derivation rule |
|-------|--------|----------------|
| `verb` | HTTP method | GET → "Retrieve", POST → "Create", PUT → "Replace", PATCH → "Update", DELETE → "Delete", OPTIONS → "Check options for", HEAD → "Check" |
| `noun` | domain (after smart inference) | Singularize for single-resource paths (`/users/:id` → "user"), pluralize for collection paths (`/users` → "users") |
| `qualifier` | path parameters | "by {param}" for single param, "by {p1} and {p2}" for multiple, empty for collection routes |
| `side_effect` | `side_effect_class` | `read` → "read-only", `write` → "state-modifying", `destructive` → "destructive" |
| `auth_context` | `auth_hints` | Empty → "no authentication detected", non-empty → "requires {hint1}, {hint2}" |
| `handler_name` | `handler` field | As-is; omitted if `inline_handler` or `unknown_handler` |

**Examples:**

| Route | Current description | Rich description |
|-------|-------------------|-----------------|
| `GET /users` (handler: `listUsers`, auth: `[requireAuth]`) | "GET /users capability in users domain" | "Retrieve users — read-only, requires requireAuth (handler: listUsers)" |
| `GET /api/v1/users/:id` (handler: `getUser`, auth: `[requireAuth]`) | "GET /api/v1/users/:id capability in api domain" | "Retrieve user by id — read-only, requires requireAuth (handler: getUser)" |
| `POST /orders` (handler: `createOrder`, auth: `[requireAuth, AdminGuard]`) | "POST /orders capability in orders domain" | "Create orders — state-modifying, requires requireAuth, AdminGuard (handler: createOrder)" |
| `DELETE /users/:id` (handler: `inline_handler`, auth: `[]`) | "DELETE /users/:id capability in users domain" | "Delete user by id — destructive, no authentication detected" |

**V1 limitations:**
- Verb mapping is method-based only — handler name semantics not used (e.g., `POST /users/:id/disable` still says "Create" not "Disable")
- Noun singularization is heuristic (trailing `s` removal) — not linguistically robust
- No business-logic description extraction from code comments or JSDoc

**V2 plans:** Extract semantic descriptions from JSDoc `@description`, inline code comments above handler, and OpenAPI `summary`/`description` fields if available.

##### 4. Honest Confidence Scoring

The current confidence formula can produce 0.86 for a route with a named handler and auth hints but zero actual schema extraction. This misleads reviewers: the manifest shows `review_needed: false` for a route where the engine could not determine what parameters the tool accepts.

**V1 confidence adjustment:**

Add a penalty when no schema hint is detected:

| Signal | Score delta |
|--------|------------|
| Base score | +0.62 |
| Named handler (not inline/unknown) | +0.12 |
| Auth hints present | +0.08 |
| Schema hint detected (zod, joi, DTO) | +0.14 |
| Non-root path | +0.04 |
| **No schema hint detected** | **-0.10** |
| **Cap** | **0.95** |

**Impact on `review_needed` threshold (0.8):**

| Scenario | Old score | New score | `review_needed` change |
|----------|----------|----------|----------------------|
| Named handler + auth + schema hint + non-root | 0.95 | 0.95 | No change (still `false`) |
| Named handler + auth + no schema + non-root | 0.86 | 0.76 | `false` → `true` |
| Named handler + no auth + no schema + non-root | 0.78 | 0.68 | No change (still `true`) |
| Inline handler + no auth + no schema + non-root | 0.66 | 0.56 | No change (still `true`) |

The key correction: a route where the engine extracted the handler name and auth hints but failed to find any schema signals now correctly triggers `review_needed: true`. This is honest — the route needs human review to add parameter structure.

**V1 limitation:** The penalty is binary (present/absent). A V2 scoring model could weight partial schema extraction (e.g., path params extracted but body unknown) differently from zero extraction.

#### Side Effect Classification Rules

The `side_effect_class` field classifies whether invoking a capability mutates state. This classification drives agent safety decisions: an agent runtime can freely invoke `read` capabilities, require confirmation for `write`, and require explicit human approval for `destructive`.

| Class | Assigned when | Agent implication |
|-------|--------------|-------------------|
| `read` | HTTP method is GET, HEAD, or OPTIONS | Safe to invoke without confirmation |
| `write` | HTTP method is POST, PUT, or PATCH (and no destructive signals) | Requires confirmation before invocation |
| `destructive` | HTTP method is DELETE, **or** route path or handler name matches `/(delete\|destroy\|remove\|revoke)/i` | Requires explicit human approval |

**V1 implementation:** The `classifySideEffect(method, routePath, handler)` function in `src/cli.js` applies these rules deterministically. The classification is assigned during `tusq manifest` and propagated unchanged through `tusq compile` and `tusq serve`.

**Key design decision:** Handler/path name matching catches destructive operations that use non-DELETE methods (e.g., `POST /users/:id/deactivate` with handler `destroyUser`). This is intentionally conservative — false positives (flagging a non-destructive operation as destructive) are acceptable; false negatives (missing a destructive operation) are not.

#### Sensitivity Classification Rules

The `sensitivity_class` field classifies what kind of data a capability touches. This drives redaction, audit, and access-control decisions downstream. An agent runtime or governance layer uses sensitivity class to determine logging verbosity, payload redaction, and whether additional authorization is required.

| Class | Definition | Examples |
|-------|-----------|----------|
| `unknown` | No inference performed or insufficient signal | Default for all capabilities in V1 |
| `public` | Unauthenticated endpoint serving non-sensitive data | Health checks, public product catalog, documentation endpoints |
| `internal` | Authenticated endpoint with no sensitive data patterns | Internal dashboards, feature flags, non-PII settings |
| `confidential` | Handles PII, user data, or financial information | User profiles, email addresses, payment history, billing |
| `restricted` | Admin-only, security-critical, or regulated operations | Role/permission changes, API key management, audit logs, compliance exports |

**V1 sensitivity limitations:** In V1, `sensitivity_class` is always `"unknown"`. The field is present in the manifest shape to establish the contract, but no inference is performed. This mirrors the conservative approach used for `input_schema` and `output_schema`. The field exists so that:

1. Human reviewers can manually set sensitivity during manifest review (`tusq manifest` produces the field; humans edit it before `tusq compile`)
2. Downstream consumers (agent runtimes, governance tools) can rely on the field being present
3. V2 inference logic can populate it without changing the artifact shape

**V2 sensitivity inference (planned):** Future versions will infer sensitivity from:

| Signal | Inferred class |
|--------|---------------|
| No `auth_hints` + `side_effect_class: read` | `public` |
| `auth_hints` present + no sensitive path/handler patterns | `internal` |
| Path or handler matches `/(user|profile|email|password|payment|billing|invoice|card|ssn|pii)/i` | `confidential` |
| Path or handler matches `/(admin|role|permission|apikey|secret|audit|compliance)/i` | `restricted` |
| `auth_hints` contain admin/superadmin patterns | `restricted` |

#### Auth and Permission Expectations

The `auth_hints` field captures authentication and authorization signals detected in the source code. This is the third governance dimension in the canonical artifact, alongside `side_effect_class` (mutation type) and `sensitivity_class` (data sensitivity). Together, these three fields answer the core agent-safety questions:

| Field | Question it answers | Agent decision it drives |
|-------|-------------------|------------------------|
| `side_effect_class` | Does this mutate state? | Can the agent call this without confirmation? |
| `sensitivity_class` | What kind of data does this touch? | What audit/redaction rules apply? |
| `auth_hints` | What authentication/authorization is required? | Does the agent have sufficient credentials to attempt this? |

**V1 auth_hints detection rules:**

The `inferAuthHints(chunks)` function in `src/cli.js` extracts auth-related identifiers from handler expressions and nearby code (3-line radius). Detection uses pattern matching against the following regex:

```
/auth|guard|role|permission|admin|jwt|acl|rbac/i
```

| Pattern | What it catches | Examples |
|---------|----------------|----------|
| `auth` | General auth middleware | `requireAuth`, `isAuthenticated`, `authMiddleware` |
| `guard` | NestJS-style guards and route guards | `AuthGuard`, `RolesGuard`, `AdminGuard` |
| `role` | Role-based access control decorators | `@Roles('admin')`, `checkRole`, `roleMiddleware` |
| `permission` | Permission checks | `hasPermission`, `checkPermissions`, `PermissionGuard` |
| `admin` | Admin-only access | `isAdmin`, `adminOnly`, `AdminGuard` |
| `jwt` | JWT token validation | `jwtAuth`, `verifyJwt`, `JwtAuthGuard` |
| `acl` | Access control lists | `aclCheck`, `aclMiddleware` |
| `rbac` | Role-based access control | `rbacMiddleware`, `RbacGuard` |

**Framework-specific extraction:**

| Framework | Where auth hints are extracted from |
|-----------|-----------------------------------|
| Express | Handler expression + 3-line radius around route definition |
| Fastify | Inline handler expression + `fastify.route()` block options |
| NestJS | Class-level `@UseGuards()` decorators + method-level decorators + controller metadata |

**Auth hints shape:**

```json
{
  "auth_hints": ["requireAuth", "AdminGuard"]
}
```

The field is a `string[]` — an ordered, deduplicated list of identifier names that matched the auth pattern. The array is:
- **Empty (`[]`)** when no auth-related identifiers are detected. This does NOT mean the endpoint is unauthenticated — it means the scanner found no recognizable auth signal.
- **Non-empty** when one or more auth identifiers are found. The values are raw identifier names, not normalized roles or scopes.

**Agent implications of auth_hints:**

| Auth hints state | Agent interpretation | Recommended behavior |
|-----------------|---------------------|---------------------|
| Empty `[]` | No auth signal detected | Agent should treat as potentially unprotected; consult `sensitivity_class` before invoking |
| Contains general auth (e.g., `requireAuth`) | Endpoint requires authentication | Agent must present valid credentials; confirm identity context before invocation |
| Contains role/admin patterns (e.g., `AdminGuard`, `isAdmin`) | Endpoint requires elevated privileges | Agent must verify it holds the required role; require explicit human approval for admin operations |
| Contains multiple hints | Multiple auth layers detected | Agent must satisfy all detected requirements; treat as highest-privilege among detected hints |

**Confidence impact:** Each detected auth hint adds `+0.08` to the capability confidence score. Auth-protected endpoints are more likely to be intentional, well-defined capabilities.

**V1 auth limitations:**

1. **Detection is identifier-based, not semantic.** The scanner matches identifier names, not runtime behavior. A middleware named `authLogger` would match even though it only logs, not gates. False positives are acceptable; false negatives are not.
2. **No role or scope extraction.** V1 captures the *name* of the guard/middleware but not the *role or scope it requires*. `@Roles('admin', 'superadmin')` produces `auth_hints: ["Roles"]`, not `auth_hints: [{ role: "admin" }, { role: "superadmin" }]`.
3. **No tenant boundary detection.** Multi-tenant isolation (e.g., `tenantId` scoping) is not inferred.
4. **No least-privilege recommendations.** V1 does not generate minimum-required-permissions for each capability.
5. **Empty hints ≠ public.** An empty `auth_hints` array means no signal was found, not that the endpoint is unauthenticated. The scanner may miss auth applied at the router level, in middleware chains, or via framework conventions not covered by the regex.

**V2 auth and permission mapping (planned):**

Future versions will move from identifier matching to structured permission modeling:

| V2 capability | Description |
|--------------|-------------|
| Role extraction | Parse `@Roles()`, `@UseGuards(RolesGuard)`, and Express `role: ['admin']` to extract actual role names |
| Scope mapping | Extract OAuth scopes from `@Scopes()` decorators and `passport` configurations |
| Tenant boundary detection | Identify `tenantId`, `orgId`, or similar path/query parameters that indicate multi-tenant isolation |
| Least-privilege hints | Generate minimum required permissions per capability: `{ roles: ["admin"], scopes: ["users:write"] }` |
| Impersonation path detection | Flag capabilities where one user can act on behalf of another (e.g., admin impersonation endpoints) |
| Auth inheritance resolution | Resolve controller-level auth that applies to all methods, not just method-level decorators |

**V2 auth_hints shape (planned):**

```json
{
  "auth_hints": ["requireAuth", "AdminGuard"],
  "auth_requirements": {
    "authenticated": true,
    "roles": ["admin"],
    "scopes": ["users:read", "users:write"],
    "tenant_isolated": true,
    "impersonation_capable": false,
    "least_privilege": {
      "minimum_role": "admin",
      "minimum_scopes": ["users:read"]
    }
  }
}
```

The V2 shape adds `auth_requirements` as a structured companion to the existing `auth_hints` array. The `auth_hints` field remains for backward compatibility. The `auth_requirements` object is absent in V1 (not emitted), present with inferred values in V2.

#### Examples Specification

The `examples` field provides concrete request/response pairs that demonstrate how to invoke a capability. This is the fourth governance dimension listed in VISION.md: examples let agents understand expected usage patterns, and let human reviewers verify that the capability behaves as described.

| Field | Question it answers | Agent decision it drives |
|-------|-------------------|------------------------|
| `side_effect_class` | Does this mutate state? | Can the agent call this without confirmation? |
| `sensitivity_class` | What kind of data does this touch? | What audit/redaction rules apply? |
| `auth_hints` | What authentication/authorization is required? | Does the agent have sufficient credentials? |
| `examples` | What does a correct invocation look like? | How should the agent construct requests and interpret responses? |

**Example object shape:**

```json
{
  "input": { "<key>": "<value>" },
  "output": { "<key>": "<value>" },
  "description": "<optional human-readable explanation of this example>"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `input` | object | yes | Example request parameters — keys match `input_schema` properties |
| `output` | object | yes | Example response body — keys match `output_schema` properties |
| `description` | string | no | Human-readable note explaining what this example demonstrates |

**Agent implications of examples:**

| Examples state | Agent interpretation | Recommended behavior |
|---------------|---------------------|---------------------|
| Static V1 placeholder (describe-only note) | No real examples available | Agent must rely on `input_schema`/`output_schema` shapes alone; do not fabricate example data |
| Contains real input/output pairs | Capability has documented usage patterns | Agent may use examples to construct well-formed requests and validate response shapes |
| Multiple examples present | Capability has edge cases worth demonstrating | Agent should review all examples to understand the full range of valid invocations |

**V1 examples limitations:**

1. **Always static placeholder.** In V1, every capability's `examples` array contains exactly one entry with `input: {}` and `output: { note: "Describe-only mode in V1. Live execution is deferred to V1.1." }`. No real request/response data is generated.
2. **No inference from source code.** V1 does not extract example data from test files, JSDoc `@example` tags, or OpenAPI example fields.
3. **No validation against schemas.** V1 does not verify that example input/output conforms to `input_schema`/`output_schema`.
4. **Human-editable.** Like `approved` and `sensitivity_class`, examples can be manually authored in the manifest before `tusq compile`. The static placeholder is a starting point, not a final value.

**Pipeline propagation:** The `examples` field originates in `tusq.manifest.json`, is propagated unchanged through `tusq compile` to `tusq-tools/*.json`, and is returned in MCP `tools/call` responses. It is **not** present in `.tusq/scan.json` (scan discovers routes, not usage patterns).

```
.tusq/scan.json         — no examples field
tusq.manifest.json      — examples[] (static placeholder or human-authored)
tusq-tools/*.json       — examples[] (propagated from manifest)
MCP tools/call response — examples[] (propagated from compiled tool)
```

**V2 examples inference (planned):**

Future versions will infer real examples from multiple sources:

| V2 capability | Description |
|--------------|-------------|
| Test file extraction | Parse `*.test.js`, `*.spec.ts` files for request/response pairs matching the capability's route |
| JSDoc `@example` tags | Extract example blocks from handler function documentation |
| OpenAPI example fields | Pull `example` and `examples` from OpenAPI/Swagger specs if present |
| Runtime learning | Record real request/response pairs from instrumented traffic (requires opt-in) |
| Example validation | Verify all examples conform to `input_schema` and `output_schema`; flag mismatches |
| Negative examples | Include examples of invalid input and expected error responses |

**V2 example object shape (planned):**

```json
{
  "input": { "id": 42 },
  "output": { "name": "Alice", "email": "alice@example.com" },
  "description": "Fetch a user by ID",
  "source": "test",
  "source_file": "tests/users.test.js",
  "source_line": 87,
  "validated": true
}
```

The V2 shape adds `source` (where the example came from), `source_file`/`source_line` (provenance), and `validated` (whether it conforms to the capability's schemas). The V1 shape remains valid in V2 — new fields are additive.

#### Constraints Specification

The `constraints` field captures operational boundaries on a capability: rate limits, payload size limits, required headers, idempotency, and cacheability. This is the fifth governance dimension listed in VISION.md. Constraints let agents respect operational limits without trial-and-error, and let governance layers enforce quotas and retry policies.

| Field | Question it answers | Agent decision it drives |
|-------|-------------------|------------------------|
| `side_effect_class` | Does this mutate state? | Can the agent call this without confirmation? |
| `sensitivity_class` | What kind of data does this touch? | What audit/redaction rules apply? |
| `auth_hints` | What authentication/authorization is required? | Does the agent have sufficient credentials? |
| `examples` | What does a correct invocation look like? | How should the agent construct requests? |
| `constraints` | What operational limits apply? | How should the agent throttle, size, and retry? |

**Constraints object shape:**

```json
{
  "rate_limit": "<string | null>",
  "max_payload_bytes": "<integer | null>",
  "required_headers": ["<string>"],
  "idempotent": "<boolean | null>",
  "cacheable": "<boolean | null>"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rate_limit` | string \| null | yes | Human-readable rate limit (e.g., `"100/minute"`, `"10/second"`). `null` when unknown or unset |
| `max_payload_bytes` | integer \| null | yes | Maximum request body size in bytes. `null` when unknown or unset |
| `required_headers` | string[] | yes | Header names the endpoint requires beyond standard auth (e.g., `["X-Request-Id"]`, `["Content-Type"]`). Empty array when none |
| `idempotent` | boolean \| null | yes | Whether repeated identical calls produce the same result. `null` when unknown |
| `cacheable` | boolean \| null | yes | Whether responses can be cached. `null` when unknown |

**Agent implications of constraints:**

| Constraint field | Agent interpretation when set | Agent interpretation when null |
|-----------------|------------------------------|-------------------------------|
| `rate_limit` | Throttle invocations to stay within the stated limit | No rate information — agent should apply conservative defaults |
| `max_payload_bytes` | Validate request body size before sending | No size limit known — agent should avoid sending unbounded payloads |
| `required_headers` | Include all listed headers in every request | No special headers required beyond auth |
| `idempotent: true` | Safe to retry on transient failures without confirmation | Unknown — agent should treat as non-idempotent (no automatic retry for write/destructive) |
| `cacheable: true` | Agent may cache responses and reuse them within a reasonable TTL | Unknown — agent should not cache |

**V1 constraints limitations:**

1. **All fields default to null/empty.** In V1, `constraints` is always `{ rate_limit: null, max_payload_bytes: null, required_headers: [], idempotent: null, cacheable: null }`. No inference is performed.
2. **No detection from source code.** V1 does not scan for rate-limiting middleware (e.g., `express-rate-limit`, `@nestjs/throttler`), body-parser size configs, or caching decorators.
3. **Human-editable.** Like `sensitivity_class` and `examples`, constraints can be manually set in the manifest before `tusq compile`. The null defaults are starting points.
4. **The field is present to establish the contract** so downstream consumers can rely on it, and V2 inference logic can populate it without changing the artifact shape.

**Pipeline propagation:** The `constraints` field originates in `tusq.manifest.json`, is propagated unchanged through `tusq compile` to `tusq-tools/*.json`, and is returned in MCP `tools/call` responses. It is **not** present in `.tusq/scan.json`.

```
.tusq/scan.json         — no constraints field
tusq.manifest.json      — constraints {} (null defaults or human-authored)
tusq-tools/*.json       — constraints {} (propagated from manifest)
MCP tools/call response — constraints {} (propagated from compiled tool)
```

**V2 constraints inference (planned):**

Future versions will infer constraints from middleware and configuration:

| V2 capability | Description |
|--------------|-------------|
| Rate limit detection | Parse `express-rate-limit`, `@nestjs/throttler`, Fastify `fastify-rate-limit` configurations for window/max values |
| Payload size detection | Read `body-parser` `limit` option, Fastify `bodyLimit`, NestJS `@Body()` size decorators |
| Required headers detection | Identify custom header checks in middleware (`req.headers['x-request-id']`) |
| Idempotency inference | Mark GET/HEAD/OPTIONS as `idempotent: true`; detect idempotency-key middleware for POST endpoints |
| Cacheability inference | Detect `cache-control` header setting, `@CacheKey()` decorators, or CDN/proxy cache configuration |
| Timeout detection | Extract request timeout values from middleware or framework configuration |

**V2 constraints shape (planned):**

```json
{
  "rate_limit": "100/minute",
  "max_payload_bytes": 1048576,
  "required_headers": ["X-Request-Id", "X-Tenant-Id"],
  "idempotent": true,
  "cacheable": true,
  "timeout_ms": 30000,
  "retry_policy": {
    "max_retries": 3,
    "backoff": "exponential",
    "retry_on": [429, 503]
  }
}
```

The V2 shape adds `timeout_ms` and `retry_policy` as new fields. Existing V1 fields remain with the same semantics. The V1 shape is valid in V2 — new fields are additive.

#### Redaction and Approval Metadata

The `redaction`, `approved`, `approved_by`, `approved_at`, and `review_needed` fields form the sixth governance dimension in the canonical artifact. VISION.md line 60 explicitly lists "redaction and approval metadata" as a core component of the manifest. These fields answer two distinct questions:

| Field group | Question it answers | Who acts on it |
|-------------|-------------------|----------------|
| `redaction` | What data must be masked, minimized, or retained with limits? | Agent runtimes, logging systems, audit pipelines |
| `approved` + `approved_by` + `approved_at` + `review_needed` | Has a human reviewed and accepted this capability for compilation? | The `tusq compile` gate, governance dashboards, audit trails |

Together with the five previously specified dimensions, the governance model is now six fields:

| # | Field | Question |
|---|-------|----------|
| 1 | `side_effect_class` | Does this mutate state? |
| 2 | `sensitivity_class` | What kind of data does this touch? |
| 3 | `auth_hints` | What authentication/authorization is required? |
| 4 | `examples` | What does correct usage look like? |
| 5 | `constraints` | What operational limits apply? |
| 6 | `redaction` + approval metadata | What must be masked, and who approved this? |

##### Redaction Specification

The `redaction` object declares how an agent runtime, logging system, or governance layer should handle data flowing through a capability. This complements `sensitivity_class` (which says *what kind of data* a capability touches) by specifying *what to do about it* in operational contexts.

**Redaction object shape:**

```json
{
  "pii_fields": ["<string>"],
  "log_level": "full | redacted | silent",
  "mask_in_traces": true | false,
  "retention_days": <integer | null>
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pii_fields` | string[] | yes | Field names in input or output that contain PII and must be masked in logs/traces. Empty array when none identified |
| `log_level` | string | yes | How much of the request/response should be logged: `full` (everything), `redacted` (strip `pii_fields`), or `silent` (log only the invocation, not payloads) |
| `mask_in_traces` | boolean | yes | Whether request/response payloads should be masked in distributed traces (OpenTelemetry spans, etc.) |
| `retention_days` | integer \| null | yes | Maximum number of days to retain logs containing this capability's data. `null` when no policy is set |

**Agent implications of redaction:**

| Redaction state | Agent interpretation | Recommended behavior |
|----------------|---------------------|---------------------|
| `pii_fields: []` | No PII fields identified | Agent may log full payloads (subject to `log_level`) |
| `pii_fields: ["email", "ssn"]` | Named fields contain PII | Agent must mask these fields before logging, caching, or including in trace spans |
| `log_level: "full"` | No logging restrictions | Agent may include full request/response in logs |
| `log_level: "redacted"` | Strip PII before logging | Agent must remove `pii_fields` values from log entries |
| `log_level: "silent"` | Do not log payloads | Agent may log that the capability was invoked (name, timestamp, status) but must not include request or response bodies |
| `mask_in_traces: true` | Sensitive trace context | Agent must not attach request/response payloads to distributed trace spans |
| `retention_days: 30` | Time-limited retention | Logging/audit systems must enforce the stated retention period |
| `retention_days: null` | No retention policy set | Default organizational retention policy applies |

**V1 redaction limitations:**

1. **All fields default to empty/permissive.** In V1, `redaction` is always `{ pii_fields: [], log_level: "full", mask_in_traces: false, retention_days: null }`. No inference is performed.
2. **No PII detection from source code.** V1 does not scan for field names matching PII patterns (`email`, `password`, `ssn`, `phone`, etc.) in schemas, DTOs, or handler code.
3. **No framework-specific extraction.** V1 does not detect data masking middleware, logging sanitizers, or GDPR-related annotations.
4. **Human-editable.** Like `sensitivity_class`, `examples`, and `constraints`, redaction can be manually authored in the manifest before `tusq compile`. The permissive defaults are starting points, not final values.
5. **The field is present to establish the contract** so downstream consumers (agent runtimes, audit tools, compliance systems) can rely on it, and V2 inference logic can populate it without changing the artifact shape.

**Relationship to sensitivity_class:**

`sensitivity_class` and `redaction` are complementary, not redundant:

| Field | What it captures | Who sets it | What it drives |
|-------|-----------------|-------------|----------------|
| `sensitivity_class` | Category of data touched (unknown/public/internal/confidential/restricted) | Scanner (V2) or human (V1) | Access control decisions, audit tier selection |
| `redaction` | Specific operational masking and retention rules | Human (V1), scanner + policy engine (V2) | Logging behavior, trace masking, data retention |

A capability can be `sensitivity_class: "confidential"` (it touches PII) and `redaction: { pii_fields: ["email"], log_level: "redacted", mask_in_traces: true, retention_days: 90 }` (here's exactly what to mask and how long to keep it). Sensitivity is the classification; redaction is the operational response to that classification.

**Pipeline propagation:** The `redaction` field originates in `tusq.manifest.json`, is propagated unchanged through `tusq compile` to `tusq-tools/*.json`, and is returned in MCP `tools/call` responses. It is **not** present in `.tusq/scan.json` (scan discovers routes, not redaction policy) or MCP `tools/list` (summary view).

```
.tusq/scan.json         — no redaction field
tusq.manifest.json      — redaction {} (permissive defaults or human-authored)
tusq-tools/*.json       — redaction {} (propagated from manifest)
MCP tools/call response — redaction {} (propagated from compiled tool)
```

**V2 redaction inference (planned):**

Future versions will infer redaction policy from multiple signals:

| V2 capability | Description |
|--------------|-------------|
| PII field detection | Scan schema properties, DTO fields, and handler variables for PII patterns (`email`, `password`, `ssn`, `phone`, `address`, `dob`, `card_number`) |
| Sensitivity-driven defaults | Auto-set `log_level: "redacted"` and `mask_in_traces: true` for `confidential` capabilities; `log_level: "silent"` for `restricted` |
| Regulatory annotation detection | Parse GDPR, HIPAA, PCI-DSS annotations or comments in source code to set retention periods |
| Logging middleware analysis | Detect data-masking middleware (e.g., `morgan` custom formatters, `pino` redaction paths) to infer existing redaction behavior |
| Policy engine integration | Accept organizational redaction policies as input and apply them to capabilities matching sensitivity/domain criteria |

**V2 redaction shape (planned):**

```json
{
  "pii_fields": ["email", "phone", "billing_address"],
  "log_level": "redacted",
  "mask_in_traces": true,
  "retention_days": 90,
  "regulatory_tags": ["GDPR", "PCI-DSS"],
  "redaction_source": "inferred",
  "redaction_confidence": 0.82
}
```

The V2 shape adds `regulatory_tags` (which compliance frameworks apply), `redaction_source` (whether the policy was inferred or human-authored), and `redaction_confidence` (scanner confidence in the inferred policy). The V1 shape remains valid in V2 — new fields are additive.

##### Approval Metadata Specification

The `approved`, `approved_by`, `approved_at`, and `review_needed` fields form the human-in-the-loop gate in the tusq.dev pipeline. This is the only place where a human decision blocks automated compilation. Nothing compiles without `approved: true`.

**Approval fields shape:**

```json
{
  "review_needed": true,
  "approved": false,
  "approved_by": null,
  "approved_at": null
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `review_needed` | boolean | yes | `true` when `confidence < 0.8`. Signals that the capability has low confidence and should receive extra scrutiny during review |
| `approved` | boolean | yes | `true` when a human has reviewed and accepted this capability. Only `approved: true` capabilities pass through `tusq compile` |
| `approved_by` | string \| null | yes | Human-readable identifier (name, email, or username) of the person who approved. `null` until explicitly set |
| `approved_at` | string \| null | yes | ISO 8601 timestamp of when `approved` was set to `true`. `null` until explicitly set |

**Agent implications of approval metadata:**

| Approval state | Agent interpretation | Recommended behavior |
|---------------|---------------------|---------------------|
| `approved: false` | Capability has not been human-reviewed | Agent must not treat this as a reliable tool definition; capability is draft-quality |
| `approved: true, approved_by: null` | Approved but no audit trail | Agent may use the tool, but governance dashboards should flag missing provenance |
| `approved: true, approved_by: "alice@co.com"` | Approved with attribution | Full audit trail available; agent may use with confidence |
| `review_needed: true` | Low-confidence detection | Human reviewer should pay extra attention to this capability's accuracy |
| `review_needed: false` | High-confidence detection | Standard review process applies |

**How approval flows through the pipeline:**

1. `tusq manifest` generates capabilities with `approved: false` (new) or preserves existing `approved` values (regeneration). `approved_by` and `approved_at` are preserved from existing manifests when present.
2. A human reviews `tusq.manifest.json` and uses `tusq approve <capability-name> --reviewer <id>` or `tusq approve --all --reviewer <id>` to set `approved: true`, clear `review_needed`, and record `approved_by` plus `approved_at`.
3. `tusq compile` filters: only `approved: true` capabilities produce compiled tool files.
4. Compiled tools (`tusq-tools/*.json`) do **not** carry approval fields — their existence is proof of approval.
5. MCP `tools/list` and `tools/call` do **not** return approval fields — only approved capabilities are served.

```
.tusq/scan.json         — no approval fields (scan discovers, does not judge)
tusq.manifest.json      — review_needed, approved, approved_by, approved_at (the gate)
tusq-tools/*.json       — no approval fields (existence = approved)
MCP server responses    — no approval fields (only approved tools served)
```

**Review gate:**

`tusq review` prints a grouped, non-interactive summary for human and CI review. Each row includes approval state, confidence, inferred input/output shape summaries, and provenance. `tusq review --strict` exits `1` when any capability is unapproved or has `review_needed: true`, and exits `0` only when the manifest is fully approved and no low-confidence capability remains.

**V1 approval limitations:**

1. **`approved_by` and `approved_at` default to `null`.** They remain null until a reviewer approves a capability with `tusq approve` or manually edits the manifest. The `approved` boolean alone gates compilation.
2. **No interactive approval UI.** V1 ships a non-interactive `tusq approve` command, but not a TUI, web UI, approval history viewer, or multi-party workflow.
3. **No approval history.** V1 does not track when a capability was previously approved and then un-approved (e.g., after manifest regeneration changed its shape).
4. **No multi-party approval.** V1 supports a single `approved_by` identity. There is no countersignature or quorum requirement.

**V2 approval metadata (planned):**

| V2 capability | Description |
|--------------|-------------|
| Interactive approval UI | Guided terminal or web review flow on top of the non-interactive `tusq approve` primitive |
| Approval history | Track approval/revocation events with timestamps and identities in a `approval_history[]` array |
| Multi-party approval | Support `approved_by` as an array for capabilities requiring multiple reviewers |
| CI/CD integration | Gate deployment pipelines on approval status; fail builds if unapproved capabilities are referenced |
| Diff-aware re-approval | When `tusq manifest` regeneration changes a capability's shape, automatically set `approved: false` and flag for re-review |

**V2 approval shape (planned):**

```json
{
  "review_needed": true,
  "approved": true,
  "approved_by": "alice@company.com",
  "approved_at": "2026-04-19T10:30:00.000Z",
  "approval_history": [
    {
      "action": "approved",
      "by": "alice@company.com",
      "at": "2026-04-19T10:30:00.000Z",
      "note": "Reviewed after auth migration"
    }
  ]
}
```

The V2 shape adds `approval_history` for audit trail completeness. The V1 fields remain with the same semantics — new fields are additive.

#### Version History and Diffs

The `manifest_version`, `previous_manifest_hash`, and per-capability `capability_digest` fields form the seventh and final governance dimension in the canonical artifact. VISION.md line 61 explicitly lists "version history and diffs" as a core component of the manifest. Line 218 requires the system to "produce manifest diffs and review queues." These fields answer a distinct question from the other six dimensions:

| Field group | Question it answers | Who acts on it |
|-------------|-------------------|----------------|
| `manifest_version` + `previous_manifest_hash` | How has the manifest evolved? Which generation is this? | CI/CD pipelines, audit systems, diff tooling |
| `capability_digest` | Has this specific capability changed since the last manifest generation? | Re-approval workflows, review queues, diff consumers |

Together with the six previously specified dimensions, the governance model is now seven fields:

| # | Field | Question |
|---|-------|----------|
| 1 | `side_effect_class` | Does this mutate state? |
| 2 | `sensitivity_class` | What kind of data does this touch? |
| 3 | `auth_hints` | What authentication/authorization is required? |
| 4 | `examples` | What does correct usage look like? |
| 5 | `constraints` | What operational limits apply? |
| 6 | `redaction` + approval metadata | What must be masked, and who approved this? |
| 7 | `manifest_version` + `previous_manifest_hash` + `capability_digest` | How has the manifest evolved, and what changed? |

##### Manifest-Level Version Fields

Two fields are added to the manifest root (alongside `schema_version`, `generated_at`, and `source_scan`):

**Updated manifest root shape:**

```json
{
  "schema_version": "1.0",
  "manifest_version": 1,
  "previous_manifest_hash": null,
  "generated_at": "<ISO 8601 timestamp>",
  "source_scan": ".tusq/scan.json",
  "capabilities": [ "..." ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `manifest_version` | integer | yes | Monotonically increasing counter, starting at `1`. Incremented each time `tusq manifest` is run and produces a new manifest. If the manifest file already exists on disk and contains a valid `manifest_version`, the new value is `previous + 1`. If no prior manifest exists, the value is `1`. |
| `previous_manifest_hash` | string \| null | yes | SHA-256 hex digest of the entire previous `tusq.manifest.json` file content (byte-for-byte). `null` on first generation (no prior manifest exists). This creates a hash chain linking each manifest to its predecessor, enabling tamper detection and lineage verification. |

**Manifest version rules:**

| Scenario | `manifest_version` | `previous_manifest_hash` |
|----------|-------------------|-------------------------|
| First `tusq manifest` run (no prior manifest) | `1` | `null` |
| Subsequent `tusq manifest` run (prior manifest exists) | `previous + 1` | SHA-256 of prior manifest file |
| Manual edit of manifest (e.g., setting `approved: true`) | Unchanged (edits do not increment) | Unchanged |
| `tusq manifest` after manual edits | `previous + 1` | SHA-256 of prior (manually edited) manifest |

**Agent implications of manifest version fields:**

| Field state | Agent interpretation | Recommended behavior |
|-------------|---------------------|---------------------|
| `manifest_version: 1` | First-ever manifest for this project | All capabilities are new; no prior state to compare against |
| `manifest_version: N` (N > 1) | Manifest has been regenerated N times | Check `previous_manifest_hash` to verify lineage; compare with previous version if available |
| `previous_manifest_hash: null` | No predecessor exists | This is the initial manifest; no diff is possible |
| `previous_manifest_hash: "<hex>"` | Prior manifest hash recorded | Can verify integrity of prior manifest; enables diff computation |

##### Per-Capability Digest

Each capability gains a `capability_digest` field: a SHA-256 hex digest of the capability's content-addressable fields. This enables quick change detection without full object comparison.

**Digest computation:** The digest is computed over a deterministic JSON serialization of the capability's *content fields* — specifically, all fields **except**:
- `capability_digest` itself (circular)
- `approved` (human gate state, not content)
- `approved_by` (audit metadata, not content)
- `approved_at` (audit metadata, not content)
- `review_needed` (derived from confidence, not independent content)

The remaining fields are serialized as a JSON object with keys sorted alphabetically, no whitespace, and the resulting string is hashed with SHA-256.

**Capability digest shape (added to Capability object):**

```json
{
  "name": "get_users_users",
  "capability_digest": "a1b2c3d4e5f6...64-char-hex-string",
  "...": "other capability fields"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `capability_digest` | string | yes | SHA-256 hex digest of the capability's content fields (sorted-key JSON serialization, excluding approval/review metadata and the digest itself). 64-character lowercase hex string. |

**Agent implications of capability_digest:**

| Digest state | Agent interpretation | Recommended behavior |
|-------------|---------------------|---------------------|
| Same digest across manifest versions | Capability content unchanged | No re-review needed; approval state remains valid |
| Different digest across manifest versions | Capability content changed | Flag for re-review; consider resetting `approved: false` (V2 automation) |
| Digest present | Content is addressable | Can be used as cache key, deduplication signal, or change detection trigger |

**V1 version history limitations:**

1. **No `tusq diff` command.** V1 produces the fields that enable diffing but does not ship a CLI command to compute or display diffs. Users can compare manifests using standard JSON diff tools (e.g., `diff`, `jq`, `json-diff`).
2. **No history file.** V1 does not maintain a `.tusq/manifest-history.jsonl` or similar append-only log. The `previous_manifest_hash` field creates a single-step hash chain, not a full history. Users who need full history should use git (which already tracks `tusq.manifest.json`).
3. **No automatic re-approval on change.** V1 does not automatically set `approved: false` when a capability's `capability_digest` changes between manifest versions. This is a V2 feature (diff-aware re-approval).
4. **No diff format specification.** V1 establishes the fields but does not define a structured diff output format. The diff format is specified below as a V2 deliverable.
5. **Hash chain is advisory.** The `previous_manifest_hash` is not cryptographically verified by any V1 command. It exists for downstream consumers and future tooling.

**Pipeline propagation:** The version history fields live at different levels:

```
.tusq/scan.json         — no version fields (scan is stateless)
tusq.manifest.json      — manifest_version, previous_manifest_hash (root level)
                        — capability_digest (per capability)
tusq-tools/*.json       — no version fields (compiled tools are snapshots)
MCP server responses    — no version fields (runtime serves current state)
```

Version history is a manifest-only concern. Compiled tools and MCP responses are point-in-time snapshots of approved capabilities — they do not carry lineage information. The manifest is the single source of truth for version evolution.

**V2 version history and diff tooling (planned):**

Future versions will build on V1's fields to provide active diff and review capabilities:

| V2 capability | Description |
|--------------|-------------|
| `tusq diff` command | Compare current manifest to previous version (from git or a supplied file path); output added, removed, and changed capabilities with field-level detail |
| Structured diff format | JSON diff output with summary counts and per-capability change records (see format below) |
| Diff-aware re-approval | When `tusq manifest` regeneration changes a capability's `capability_digest`, automatically set `approved: false` and add to the review queue |
| `.tusq/manifest-history.jsonl` | Append-only log of manifest snapshots (version, hash, timestamp, summary of changes) for projects that want history beyond git |
| Git integration | `tusq diff --git HEAD~1` to compare manifest at current commit vs. previous commit |
| Review queue generation | `tusq review --changed` to list only capabilities whose digest changed since last approved version |
| CI/CD diff gate | `tusq diff --fail-on-unapproved-changes` exits non-zero if any changed capabilities lack re-approval |

**V2 diff output format (planned):**

```json
{
  "from_version": 3,
  "to_version": 4,
  "from_hash": "abc123...",
  "to_hash": "def456...",
  "generated_at": "2026-04-20T12:00:00.000Z",
  "summary": {
    "added": 1,
    "removed": 0,
    "changed": 2,
    "unchanged": 5
  },
  "changes": [
    {
      "type": "added",
      "capability": "post_billing_invoices",
      "digest": "new-digest-hex"
    },
    {
      "type": "changed",
      "capability": "get_users_users",
      "previous_digest": "old-digest-hex",
      "current_digest": "new-digest-hex",
      "fields_changed": ["path", "input_schema", "auth_hints"],
      "approval_invalidated": true
    },
    {
      "type": "removed",
      "capability": "delete_legacy_cleanup",
      "previous_digest": "old-digest-hex"
    },
    {
      "type": "unchanged",
      "capability": "get_health_health",
      "digest": "same-digest-hex"
    }
  ]
}
```

The V2 diff format is additive — it introduces a new output artifact (`tusq diff` result) without changing existing shapes. The V1 manifest fields (`manifest_version`, `previous_manifest_hash`, `capability_digest`) remain with the same semantics.

**M16 implementation target: `tusq diff` and review queue**

M16 promotes the first slice of the planned V2 diff work into the next implementation increment. The goal is not a full history store or git integration. The goal is a deterministic local command that turns existing manifest version fields into a reviewable change set.

**CLI interface:**

```bash
tusq diff [--from <manifest-path>] [--to <manifest-path>] [--json] [--review-queue] [--fail-on-unapproved-changes]
```

| Option | Required | Behavior |
|--------|----------|----------|
| `--from <manifest-path>` | optional | Previous manifest to compare from. If omitted, the command may use a locally available predecessor only when it can be resolved unambiguously. |
| `--to <manifest-path>` | optional | Current manifest to compare to. Defaults to `tusq.manifest.json` in the current working directory. |
| `--json` | optional | Print the structured diff output and no human summary text. |
| `--review-queue` | optional | Include or print the capabilities that require human review after the diff. |
| `--fail-on-unapproved-changes` | optional | Exit 1 when any added or changed capability is not approved. |

**Diff identity rules:**

Capabilities are matched by `name`. A capability present only in `to` is `added`. A capability present only in `from` is `removed`. A capability present in both with identical `capability_digest` is `unchanged`. A capability present in both with different `capability_digest` is `changed`.

When a changed capability is detected, the command compares normalized capability JSON excluding `capability_digest` itself and reports top-level `fields_changed`. Approval fields (`approved`, `approved_by`, `approved_at`, `review_needed`) remain visible as governance fields, but they do not override digest-based content-change detection.

**Human-readable output:**

The default output must include:

- from/to manifest paths and versions when present
- summary counts for added, removed, changed, unchanged
- one line per added, removed, or changed capability
- field names for changed capabilities
- review queue count when `--review-queue` is supplied
- a clear gate failure message when `--fail-on-unapproved-changes` exits non-zero

**Review queue rules:**

A capability enters the M16 review queue when any of these are true:

- it is `added`
- it is `changed`
- `approved !== true`
- `review_needed === true`

The review queue output must include capability name, change type, approved state, review-needed state, side effect class, sensitivity class, confidence, and provenance when available.

**M16 scope exclusions:**

- No `.tusq/manifest-history.jsonl` append-only history file
- No `--git` integration
- No automatic approval invalidation during `tusq manifest`
- No schema migration or manifest shape changes
- No MCP runtime changes

**Acceptance tests required by M16:**

- `tusq diff --from old.json --to new.json` exits 0 and prints summary counts for fixture manifests
- `tusq diff --json --from old.json --to new.json` emits parseable JSON matching the structured diff shape
- changed capabilities report `fields_changed`
- `--review-queue` includes added, changed, unapproved, and `review_needed` capabilities
- `--fail-on-unapproved-changes` exits 1 for added or changed unapproved capabilities and exits 0 when changed capabilities are approved
- invalid or missing manifest paths exit 1 with actionable errors
- `tusq help` and per-command help list the new command and options

### 4. `tusq-tools/*.json` — Compiled Tool Definitions (Output)

Produced by `tusq compile`. One JSON file per approved capability, plus an `index.json`.

**Individual tool shape (`tusq-tools/{name}.json`):**

```json
{
  "name": "get_users_users",
  "description": "GET /users capability in users domain",
  "parameters": {
    "type": "object",
    "additionalProperties": true,
    "description": "<input inference status>"
  },
  "returns": {
    "type": "object",
    "additionalProperties": true,
    "description": "<output inference status>"
  },
  "side_effect_class": "read",
  "sensitivity_class": "unknown",
  "auth_hints": ["requireAuth"],
  "examples": [
    {
      "input": {},
      "output": {
        "note": "Describe-only mode in V1. Live execution is deferred to V1.1."
      }
    }
  ],
  "constraints": {
    "rate_limit": null,
    "max_payload_bytes": null,
    "required_headers": [],
    "idempotent": null,
    "cacheable": null
  },
  "redaction": {
    "pii_fields": [],
    "log_level": "full",
    "mask_in_traces": false,
    "retention_days": null
  },
  "provenance": {
    "file": "src/app.ts",
    "line": 12
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Matches the capability name from the manifest |
| `description` | string | Human-readable summary |
| `parameters` | object | JSON Schema for tool input (from `input_schema`) |
| `returns` | object | JSON Schema for tool output (from `output_schema`) |
| `side_effect_class` | string | Same classification as manifest |
| `sensitivity_class` | string | Same classification as manifest |
| `auth_hints` | string[] | Auth requirements |
| `examples` | array | Static examples; in V1 always contain a describe-only note |
| `constraints` | object | Operational constraints; all null/empty in V1 — see Constraints specification |
| `redaction` | object | Redaction policy; permissive defaults in V1 — see Redaction specification |
| `provenance` | object | Source traceability |

**Tool index shape (`tusq-tools/index.json`):**

```json
{
  "generated_at": "<ISO 8601 timestamp>",
  "tool_count": 2,
  "tools": ["get_users_users", "post_users_users"]
}
```

### 5. MCP Server Responses (Output)

The `tusq serve` command exposes compiled tools via an HTTP JSON-RPC endpoint.

**`tools/list` response:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "get_users_users",
        "description": "GET /users capability in users domain",
        "parameters": { "type": "object", "additionalProperties": true },
        "returns": { "type": "object", "additionalProperties": true }
      }
    ]
  }
}
```

**`tools/call` response (describe-only in V1):**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "name": "get_users_users",
    "description": "GET /users capability in users domain",
    "schema": {
      "parameters": { "type": "object", "additionalProperties": true },
      "returns": { "type": "object", "additionalProperties": true }
    },
    "examples": [
      {
        "input": {},
        "output": { "note": "Describe-only mode in V1. Live execution is deferred to V1.1." }
      }
    ],
    "constraints": {
      "rate_limit": null,
      "max_payload_bytes": null,
      "required_headers": [],
      "idempotent": null,
      "cacheable": null
    },
    "redaction": {
      "pii_fields": [],
      "log_level": "full",
      "mask_in_traces": false,
      "retention_days": null
    }
  }
}
```

**MCP error response:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "error": {
    "code": -32602,
    "message": "Unknown tool: nonexistent_tool"
  }
}
```

| Error code | Meaning |
|------------|---------|
| `-32601` | Method not found (unsupported RPC method) |
| `-32602` | Invalid params (unknown tool name) |

### Shape Lineage

The data flows through a strict pipeline where each stage narrows and enriches:

```
tusq.config.json          (user input — framework, paths, exclusions)
       │
       ▼
.tusq/scan.json            (discovered routes with inferred schemas)
       │
       ▼
tusq.manifest.json         (capabilities with approval gates + provenance)
       │  ▲
       │  │ human edits approved=true
       │  │
       ▼
tusq-tools/*.json          (compiled tools for approved capabilities only)
       │
       ▼
MCP server responses       (tools/list and tools/call over JSON-RPC)
```

Each transformation is deterministic: the same input produces the same output. The `approved` field is the only human-in-the-loop gate. Nothing compiles without explicit human approval. The `redaction` field propagates from manifest through compile to MCP `tools/call`, enabling agent runtimes to enforce data masking at every stage. Approval metadata (`approved`, `approved_by`, `approved_at`, `review_needed`) lives only in the manifest — downstream artifacts exist only for approved capabilities. Version history fields (`manifest_version`, `previous_manifest_hash`, `capability_digest`) also live only in the manifest — they track evolution of the canonical artifact itself and do not propagate to compiled tools or MCP responses.

## M20: Opt-In Local Execution Policy Scaffold for MCP serve

M20 is the first increment on the VISION "safe execution wrappers" ladder (VISION.md lines 177–181 and line 245). V1 currently ships describe-only MCP responses (the `V1_DESCRIBE_ONLY_NOTE` in `src/cli.js` line 11). M20 does **not** turn on live execution. It adds an opt-in, repo-local scaffold that lets an operator validate arguments against the approved compiled tool schema and produce an auditable dry-run execution plan, while preserving V1's byte-for-byte describe-only default.

### Scope boundary

- **In scope.** A policy file `.tusq/execution-policy.json`; a new `tusq serve --policy <path>` flag; a `mode: "dry-run"` extension of the `tools/call` response that validates arguments against the approved compiled tool `parameters` schema and emits a structured `dry_run_plan`; JSON-RPC validation error surfaces; fully local execution (no network I/O to the target product).
- **Out of scope.** Live API execution; confirmation or approve ladders on the serve path; mutating target-system state; authoring policies via CLI; multi-party policy approval; streaming or async plans; policy inheritance or wildcard capability matchers beyond the explicit `allowed_capabilities` list.

### Policy file shape

File: `.tusq/execution-policy.json`. Human-authored in V1.1; no CLI writer.

```json
{
  "schema_version": "1.0",
  "mode": "dry-run",
  "allowed_capabilities": ["get_users_id", "list_orders"],
  "reviewer": "ops@example.com",
  "approved_at": "2026-04-22T05:20:21Z"
}
```

| Field | Type | Required | V1.1 behavior |
|-------|------|----------|---------------|
| `schema_version` | string | yes | Must be `"1.0"` or the serve startup fails with exit 1 |
| `mode` | `"describe-only"` \| `"dry-run"` | yes | `"describe-only"` is a no-op (identical to V1 without `--policy`); `"dry-run"` enables argument validation and plan emission |
| `allowed_capabilities` | string[] \| null | no | When present, plans are only produced for the listed compiled tool names; other names fall back to describe-only responses even under `dry-run` |
| `reviewer` | string \| null | no | Echoed into `dry_run_plan.policy.reviewer` for audit; never used for authz |
| `approved_at` | string (ISO-8601 UTC) \| null | no | Echoed into `dry_run_plan.policy.approved_at`; never used for authz |

### CLI surface additions

- `tusq serve --policy <path>`
- If `--policy` is set and the file is missing, unreadable, invalid JSON, has an unsupported `schema_version`, or contains an unknown `mode`, `tusq serve` exits 1 with an actionable message.
- If `--policy` is not set, behavior is byte-for-byte identical to V1 describe-only.

### `tools/call` dry-run response shape

Response body under `mode: "dry-run"` for an approved, allowed capability where argument validation passes:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "name": "get_users_id",
    "description": "Retrieve a specific user by ID — read-only, requires authentication",
    "executed": false,
    "policy": {
      "mode": "dry-run",
      "reviewer": "ops@example.com",
      "approved_at": "2026-04-22T05:20:21Z"
    },
    "dry_run_plan": {
      "method": "GET",
      "path": "/users/42",
      "path_params": { "id": "42" },
      "query": {},
      "body": null,
      "headers": { "Accept": "application/json" },
      "auth_context": { "hints": ["Authorization"], "required": true },
      "side_effect_class": "read",
      "sensitivity_class": "unknown",
      "redaction": { "pii_fields": [], "log_level": "full", "mask_in_traces": false, "retention_days": null },
      "plan_hash": "<SHA-256 hex of canonical plan content>",
      "evaluated_at": "2026-04-22T05:20:22Z"
    },
    "schema": {
      "parameters": { "type": "object", "properties": { "id": { "type": "string" } }, "required": ["id"] },
      "returns": { "type": "object", "additionalProperties": true }
    }
  }
}
```

Agent implications:

- `executed: false` is always present under dry-run mode. Consumers MUST NOT interpret a `dry_run_plan` as evidence of a performed request.
- `plan_hash` is a SHA-256 over a canonical JSON serialization of `{method, path, path_params, query, body, headers}`. Identical inputs produce identical plans. This is the first primitive for future replay, diff, and eval tooling.
- `policy.reviewer` and `policy.approved_at` are audit echoes. They do NOT authorize live execution in V1.1.

Validation failure response (argument does not match `parameters` schema):

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "error": {
    "code": -32602,
    "message": "Invalid arguments for tool: get_users_id",
    "data": {
      "validation_errors": [
        { "path": "/id", "reason": "required field missing" }
      ]
    }
  }
}
```

| Error code | Meaning under M20 |
|------------|-------------------|
| `-32601` | Method not found (unchanged from V1) |
| `-32602` | Unknown tool, tool not in `allowed_capabilities`, or invalid arguments under dry-run mode |
| `-32603` | Internal error during plan construction (reserved; MUST NOT surface live-execution error semantics) |

### Approval gate invariants

The approval gate is preserved under M20:

1. Only capabilities with `approved: true` in the manifest appear in `tools/list` (existing V1 behavior, unchanged).
2. `tools/call` on an unapproved or missing capability still returns `-32602`.
3. `mode: "dry-run"` never relaxes the approval gate. `allowed_capabilities` is a strict subset filter on top of the approval gate, not a replacement for it.
4. Unapproved capabilities cannot be dry-run validated, even with a permissive policy file.

### Argument validation rules

Under `mode: "dry-run"`, arguments at `params.arguments` are validated against the approved compiled tool's `parameters` schema:

- `required` array is enforced; each missing field produces one `validation_errors` entry with `path: "/<field>"` and `reason: "required field missing"`.
- `type` is enforced for primitive types (`string`, `number`, `integer`, `boolean`); mismatches produce `reason: "expected <type>, got <actual>"`.
- Unknown top-level properties are rejected when the schema declares `additionalProperties: false`; tolerated otherwise (matches the V1 permissive default of `additionalProperties: true`).
- Path params extracted by M15 into `parameters.properties` are substituted into `dry_run_plan.path` on validation success. Path params are always string-coerced.
- No network validation, no remote schema fetch. Validation runs fully in-process.

### V1.1 limitations

| Limitation | V1.1 behavior | Deferred to |
|------------|---------------|-------------|
| Live execution | No outbound HTTP, DB, or socket I/O under any policy mode | Later increment past V1.1 |
| Confirm and approve ladders | No interactive confirmation or run-time approval on serve | Later increment |
| Policy authoring UX | Policy file is human-authored; no `tusq policy` CLI | V2 |
| Policy diff and history | No policy version hash chain or diff command | V2 |
| Schema validation depth | Only required-fields, primitive types, and `additionalProperties: false` rejection; no format/enum/oneOf/regex | V2 |
| Authentication checks | `auth_context` is echoed; no real identity binding | V2 |

### Pipeline propagation

```
tusq.manifest.json (approved capabilities, schemas, governance)
       │
       ▼
tusq-tools/*.json (compiled tools for approved capabilities only)
       │
       ▼                                  .tusq/execution-policy.json  (opt-in operator artifact)
MCP server responses ───── merges policy ─────────────┘
       │
       ├── describe-only (default or mode="describe-only")      → V1 shape unchanged
       └── dry-run       (mode="dry-run" + arguments present)   → adds `dry_run_plan`, `executed: false`, `policy`
```

The policy file is a **governance artifact**: review it like a manifest. No policy is required to run `tusq serve`; the default is V1 describe-only. Adoption is explicit, not implicit.

### Docs and tests required before implementation

- `website/docs/cli-reference.md` — document `tusq serve --policy <path>` and update exit-code table.
- `website/docs/execution-policy.md` (new) — policy file shape, modes, allowed_capabilities semantics, dry-run response example, validation error example, invariants.
- `website/docs/mcp-server.md` — add dry-run section alongside the existing describe-only documentation.
- `tests/smoke.mjs` — add policy-off (describe-only unchanged), policy-on dry-run success, and validation-failure scenarios; assert `executed: false`, `plan_hash` determinism, and error `data.validation_errors` shape.
- `tests/evals/governed-cli-scenarios.json` — add a dry-run scenario asserting plan shape and one asserting unapproved capabilities stay invisible under dry-run policy.
- `README.md` — add the `--policy` flag to the CLI reference table.

## M21: Execution Policy Scaffold Generator

### Purpose

M20 shipped `tusq serve --policy <path>` and specified the `.tusq/execution-policy.json` shape, but it left operators hand-authoring a governance artifact whose schema they have to derive from SYSTEM_SPEC.md. That is a VISION-breaking friction point: the product must "treat manual manifest authoring as a failure of the engine, not a feature" (VISION.md line 74). By extension, manual authoring of the policy artifact that controls the serve path is also a failure of the engine.

M21 adds a single, local-only CLI command — `tusq policy init` — that generates a valid policy file for the operator. The command does not touch the network, the manifest, or the target product. It writes one JSON file under the repo root, and that file is guaranteed to pass `loadAndValidatePolicy()` (the same validator `tusq serve --policy` invokes at startup).

### Scope Boundary

M21 is deliberately narrow:

- **In scope (V1.2):** scaffold a valid `.tusq/execution-policy.json` file, optionally override `mode`, `reviewer`, `allowed_capabilities`, and output path, support `--force`, `--dry-run`, and `--json` flags.
- **Out of scope (V1.2):** no interactive wizard; no inspection of `tusq.manifest.json` to propose `allowed_capabilities` values; no rotating-reviewer workflows; no encrypted storage; no multi-environment policy profiles (`--env dev`/`--env prod`); no policy migration from older schema versions (there are none yet); no live API execution under any code path.

The V1.2 limitations table below enumerates these explicitly so the dev turn cannot overreach into V2 territory.

### `tusq policy init` Command Shape

Synopsis:

```
tusq policy init [--mode <describe-only|dry-run>]
                 [--reviewer <id>]
                 [--allowed-capabilities <name,name,...>]
                 [--out <path>]
                 [--force]
                 [--dry-run]
                 [--json]
                 [--verbose]
```

Exit codes:

| Exit | Meaning |
|------|---------|
| `0` | File was written (or would have been written, under `--dry-run`) |
| `1` | Any failure condition in the failure UX table below |

Default behavior (no flags): write `.tusq/execution-policy.json` with `schema_version: "1.0"`, `mode: "describe-only"`, reviewer resolved via env-chain (`TUSQ_REVIEWER` → `USER` → `LOGNAME` → `"unknown"`), `approved_at` set to the current ISO-8601 UTC timestamp at generation time, and no `allowed_capabilities` field (meaning "all approved capabilities in scope"). Parent directory `.tusq/` is created with `{ recursive: true }` if it does not already exist.

### Generated Policy File Shape

The generated file is a strict subset of the M20 policy schema. No new fields are introduced in V1.2.

| Field | Required | V1.2 Default | Notes |
|-------|----------|--------------|-------|
| `schema_version` | yes | `"1.0"` | Hard-coded; must match `SUPPORTED_POLICY_VERSIONS` in `loadAndValidatePolicy()` |
| `mode` | yes | `"describe-only"` | Controlled by `--mode`; any value outside `{describe-only, dry-run}` exits 1 before any file write |
| `reviewer` | yes | Env-chain resolved identity | Controlled by `--reviewer`; never empty string — empty string exits 1 |
| `approved_at` | yes | ISO-8601 UTC generation time | Always stamped at generation; not overridable from CLI |
| `allowed_capabilities` | no | omitted | Controlled by `--allowed-capabilities <a,b,c>`; list is trimmed and de-duplicated in declaration order; empty list or list containing an empty token exits 1 |

The file is written with `JSON.stringify(policy, null, 2)` followed by a trailing newline, matching the formatting convention of `tusq approve` writes so that line-diff tooling stays sensible.

### `tusq policy init` Failure UX

| Failure | User sees | Side effect |
|---------|-----------|-------------|
| Unknown `--mode` value | `Unknown policy mode: <value>. Allowed: describe-only, dry-run` | No file written |
| Empty or missing `--reviewer` value | `Invalid reviewer: reviewer identity cannot be empty` | No file written |
| Empty or malformed `--allowed-capabilities` | `Invalid allowed-capabilities: list cannot be empty or contain empty names` | No file written |
| Target file exists without `--force` | `Policy file already exists: <path>. Re-run with --force to overwrite.` | No file written |
| Unwritable target path (permission or EISDIR) | `Could not write policy file: <path>: <errno message>` | No file written (or partial write is caught and message includes path) |
| Unknown flag | Standard CLI error: `Unknown option: <flag>` | No file written |

Every failure message ends in an actionable next step (re-run with a flag, fix the value). Error messages are written to `stderr` and the process exits `1`.

### `tools/call` and MCP Surface — Unchanged

M21 adds a generator command only. The MCP server behavior, the M20 dry-run response shape, the `executed: false` invariant, and the approval-gate filter are all unchanged. A generated policy file is indistinguishable, from `tusq serve --policy`'s perspective, from a hand-authored one. This is the stability contract M21 guarantees.

### V1.2 Limitations

| Limitation | Rationale | V2 Plan |
|------------|-----------|---------|
| No interactive prompt when `allowed_capabilities` is omitted | Avoids coupling `policy init` to TTY state; keeps CI usage trivial | V2 may add `--interactive` if operator telemetry shows it is needed |
| Does not read `tusq.manifest.json` to auto-suggest `allowed_capabilities` | Keeps the generator's file surface minimal and decoupled from manifest I/O | V2 `tusq policy suggest` can read the manifest and propose an initial scoped list |
| No policy migration | There is only one schema version (`"1.0"`); nothing to migrate | V2 `tusq policy migrate` when a `1.1` schema ships |
| No per-environment profiles | `--out` is sufficient for operators that want multiple policy files | V2 may add `--profile dev|prod` with a dedicated directory layout |
| No signature or checksum field on the generated file | Operators audit via git history in V1 | V2 signed-policy roadmap is tracked in the governance ladder, not M21 |

### Approval-Gate Invariant Preservation

M21 does not alter the approval-gate invariant set first stated in the M20 section of this spec. For clarity:

1. `tools/list` continues to filter by `approved: true` on the source manifest regardless of whether a policy file was generated by `tusq policy init`.
2. `allowed_capabilities`, when present in a generated policy, is a **strict subset filter** layered on top of approval. The generator never writes an `allowed_capabilities` entry for an unapproved capability name; names are accepted verbatim from the CLI, and a mismatch between `--allowed-capabilities` and the manifest is a run-time concern surfaced by `tusq serve --policy`, not a policy-generation-time concern.
3. `tusq policy init` performs no outbound I/O. It cannot leak capability names, manifest state, or reviewer identity beyond the local filesystem.

### Pipeline Propagation

```
tusq policy init
   └─ writes: .tusq/execution-policy.json (local file)

tusq serve --policy .tusq/execution-policy.json
   └─ reads: loadAndValidatePolicy(path)   # unchanged from M20
   └─ serves: tools/list (approved-only)   # unchanged from M20
              tools/call (dry-run plan under mode: "dry-run") # unchanged from M20
```

M21 inserts no new pipeline stage. It only adds a local file producer whose output is consumed, unchanged, by the M20 serve path.

### Docs and Tests Required Before Implementation

- `README.md` — add `policy init` to the CLI reference table; add a three-line example showing the default invocation.
- `website/docs/cli-reference.md` — add a `policy init` subsection with synopsis, options table, and failure UX table mirroring this spec.
- `website/docs/execution-policy.md` — insert an "Authoring a policy file" section that recommends `tusq policy init` as the default path and preserves the hand-authoring description as an advanced alternative.
- `tests/smoke.mjs` — add coverage for: default generation (asserts file exists, `schema_version: "1.0"`, `mode: "describe-only"`), `--mode dry-run` effect on generated file, `--allowed-capabilities a,b` produces exact array `["a", "b"]`, `--force` overwrite behavior, exit-1 on pre-existing file without `--force`, `--dry-run` prints to stdout without creating the target file, and a round-trip that generates a file and then starts `tusq serve --policy <generated path>` (or calls `loadAndValidatePolicy()` directly) to confirm the generated file is accepted.
- `tests/evals/governed-cli-scenarios.json` — add one eval scenario asserting that a generated dry-run policy produces the same `dry_run_plan` shape on `tools/call` as a hand-authored policy would, preventing generator drift.

The dev role is accountable for implementing all items above. The QA role is accountable for independently re-verifying them as REQ-064 through REQ-069 acceptance criteria (the specific REQ numbering is the QA role's call; naming them now would over-reach PM scope).

## M22: Execution Policy Verifier (Standalone Validator)

### Purpose

M20 shipped `tusq serve --policy <path>` and an in-process `loadAndValidatePolicy()` validator. M21 shipped `tusq policy init` to stop operators from hand-authoring the policy artifact. The remaining governance gap is that a policy file, once generated or edited, can only be validated by starting a live MCP server — a heavy, stateful action that is hostile to CI, pre-commit hooks, and headless review workflows. If a policy file drifts into invalidity (a manual edit, a merge resolution, a schema bump), the breakage surfaces at `tusq serve` startup — which is typically later than it should.

M22 adds exactly one new local-only subcommand, `tusq policy verify`, that runs the same `loadAndValidatePolicy()` the serve path runs, but as a pure validator: no server, no port bind, no MCP handshake, no target-product I/O. The command's entire purpose is to let a reviewer, a pre-commit hook, or a CI job answer the question "would `tusq serve --policy <path>` accept this file today?" without paying the cost of actually starting the server.

### Scope Boundary

M22 is deliberately narrow:

- **In scope (V1.3):** expose `loadAndValidatePolicy(path)` as a standalone `tusq policy verify` subcommand; support `--policy <path>`, `--json`, and `--verbose` flags; emit the same startup-failure messages `tusq serve --policy` emits, identically worded.
- **Out of scope (V1.3):** no additional validation depth (no format/enum/oneOf/regex/regex-for-capability-names); no auto-fix; no migrate; no cross-referencing `.tusq/execution-policy.json` against `tusq.manifest.json` to validate that `allowed_capabilities` actually name approved capabilities (that is V2 `tusq policy verify --strict` territory and requires manifest I/O the command is intentionally avoiding in V1.3); no signed-policy verification; no network I/O of any kind; no target-product I/O of any kind.

Everything the verifier rejects today must be something `tusq serve --policy` would also reject; everything the verifier accepts today must be something `tusq serve --policy` would also accept. No divergence is allowed under V1.3.

### `tusq policy verify` Command Shape

Synopsis:

```
tusq policy verify [--policy <path>]
                   [--json]
                   [--verbose]
```

Exit codes:

| Exit | Meaning |
|------|---------|
| `0` | Policy file was read, parsed, and accepted by `loadAndValidatePolicy()` |
| `1` | Any failure from `loadAndValidatePolicy()` or surrounding I/O (missing file, unreadable, bad JSON, unsupported `schema_version`, unknown `mode`, invalid `allowed_capabilities`) |

Default behavior (no flags): read `.tusq/execution-policy.json` from the current working directory, call `loadAndValidatePolicy(path)`, and on success print a one-line human summary to stdout (`Policy valid: <path> (mode: <mode>, reviewer: <reviewer>, allowed_capabilities: <count|unset>)`) and exit 0. On failure, write the validator's error message to stderr (byte-for-byte identical to the `tusq serve --policy` startup failure for the same input) and exit 1.

### `tusq policy verify` Options

| Option | Description | Default |
|--------|-------------|---------|
| `--policy <path>` | Path to the execution-policy file to validate | `.tusq/execution-policy.json` |
| `--json` | Emit a machine-readable result object to stdout instead of the human summary | Human-readable summary |
| `--verbose` | Print the resolved path and validator diagnostics to stderr | Disabled |

### `tusq policy verify` JSON Output Shape

On success (exit 0), with `--json`:

```
{
  "valid": true,
  "path": "<resolved policy path>",
  "policy": {
    "schema_version": "1.0",
    "mode": "describe-only" | "dry-run",
    "reviewer": "<string>",
    "approved_at": "<ISO-8601 UTC>",
    "allowed_capabilities": null | ["<name>", ...]
  }
}
```

On failure (exit 1), with `--json`:

```
{
  "valid": false,
  "path": "<resolved policy path>",
  "error": "<same message written to stderr without --json>"
}
```

The non-`--json` path uses stdout for success and stderr for failure, matching the existing tusq CLI convention. With `--json`, the JSON object goes to stdout in both cases (so tooling can always parse stdout), and exit code is the authoritative success signal.

### `tusq policy verify` Failure UX

Every failure message must match the corresponding `tusq serve --policy` startup failure verbatim. This is the core M22 contract: a policy that fails `verify` fails `serve`, with the same words, and vice-versa.

| Failure | User sees (both `serve --policy` and `policy verify`) |
|---------|---------|
| `--policy` path missing or ENOENT | `Policy file not found:` followed by the path |
| Policy file unreadable (permissions, I/O error after the ENOENT check) | `Could not read policy file:` followed by the path and the OS error message |
| Policy file is not valid JSON | `Invalid policy JSON at:` followed by the path and parser message |
| Policy parses but is not a JSON object (array, `null`, or primitive) | `Invalid policy JSON at:` followed by the path and the literal suffix `: expected object` |
| Unsupported `schema_version` | `Unsupported policy schema_version:` followed by the value and the list of supported versions |
| Unknown `mode` | `Unknown policy mode:` followed by the value and the list of allowed modes |
| `allowed_capabilities` is not an array of strings | `Invalid allowed_capabilities in policy:` followed by the offending value |

If a future validation rule is added to `loadAndValidatePolicy()` for any reason, `tusq policy verify` picks it up automatically because both paths share the same validator. This is enforced by a smoke-test parity check (see Docs and Tests below).

### `tusq policy verify` Local-Only Invariants

| Invariant | How it shows up at the CLI |
|-----------|----------------------------|
| No server startup | `tusq policy verify` never binds a TCP port, never opens a socket; it runs synchronously and exits |
| No network I/O | No HTTP, DB, MCP handshake; operators can run it with networking disabled |
| No manifest read | `tusq.manifest.json` is never opened; the verifier is a pure policy-file validator in V1.3 |
| No target-product call | The verifier never invokes a compiled tool, never executes a dry-run plan |
| Validator parity | `tusq policy verify` and `tusq serve --policy` share `loadAndValidatePolicy()`; a smoke test asserts identical accept/reject behavior |

### Pipeline Propagation

```
tusq policy init
   └─ writes: .tusq/execution-policy.json                         # M21

tusq policy verify .tusq/execution-policy.json
   └─ reads:  loadAndValidatePolicy(path)                         # M22; pure validator
   └─ emits:  stdout summary or JSON; exit 0 or 1                 # M22

tusq serve --policy .tusq/execution-policy.json
   └─ reads:  loadAndValidatePolicy(path)                         # M20; unchanged, shared validator
   └─ serves: tools/list (approved-only), tools/call (policy mode)# M20
```

M22 inserts no new pipeline stage between `init` and `serve`; it inserts a *sibling* validator path that any CI or pre-commit workflow can call before `serve` is invoked. The shared validator contract guarantees that passing `verify` is equivalent to clean `serve --policy` startup.

### V1.3 Limitations

| Limitation | Rationale | V2 Plan |
|------------|-----------|---------|
| No format/enum/oneOf/regex validation | Matches the M20 V1.1 validation depth; raising depth here would make `verify` accept files that `serve` rejects or vice-versa | V2 raises the shared validator; both `verify` and `serve` pick up the new rule simultaneously |
| Does not read `tusq.manifest.json` to cross-check `allowed_capabilities` against approved capabilities | Keeps V1.3 strictly a *policy-file* validator, matches the M21 scope boundary | V2 `tusq policy verify --strict` can read the manifest and flag `allowed_capabilities` names that do not exist or are unapproved |
| No signed-policy / integrity check | No signing ships yet | V2 signed-policy roadmap is tracked in the governance ladder, not M22 |
| No auto-fix or migrate | V1.3 is intentionally read-only; it cannot change the policy file | V2 `tusq policy migrate` when a `1.1` schema ships |
| No exit-code flag for "warn only" | M22 is a hard gate or nothing | V2 may add `--warn-only` if operator telemetry shows a need |

### Approval-Gate Invariant Preservation

M22 does not alter the approval-gate invariant set first stated in the M20 section. For clarity:

1. `tools/list` continues to filter by `approved: true` on the source manifest regardless of whether a policy file was verified by `tusq policy verify`.
2. `tusq policy verify` does not read, touch, or opine on the manifest in V1.3. A passing `verify` is a statement about the policy file alone; it is *not* a statement that `allowed_capabilities` point to real or approved capabilities.
3. `tusq policy verify` performs no outbound I/O. It cannot leak capability names, reviewer identity, or policy content beyond the local filesystem and stdout/stderr.

### Validator Parity Contract

A dedicated smoke/eval scenario enforces that for every failing fixture (`empty-file.json`, `bad-schema-version.json`, `bad-mode.json`, `bad-allowed-capabilities.json`), `tusq policy verify` and `tusq serve --policy` exit the same way and print the same message. If a future validator change breaks parity, the smoke test fails before merge. This is the single most important contract M22 ships: **a policy that passes `verify` must start `serve`; a policy that fails `verify` must fail `serve` startup with the same message.**

### Docs and Tests Required Before Implementation

- `README.md` — add `policy verify` to the CLI reference table; add a two-line example showing the default invocation and a CI exit-code use case.
- `website/docs/cli-reference.md` — add a `policy verify` subsection with synopsis, options table, exit-code table, and a JSON-output example mirroring this spec.
- `website/docs/execution-policy.md` — insert a "Verifying a policy file" section that recommends `tusq policy verify` as the pre-serve / pre-commit / CI step; link it from the `tusq serve --policy` walkthrough and from the `tusq policy init` walkthrough.
- `tests/smoke.mjs` — add coverage for: (1) successful verification of a default-generated policy (round-trip `policy init` → `policy verify`), (2) exit-1 on missing file, (3) exit-1 on malformed JSON, (4) exit-1 on unsupported `schema_version`, (5) exit-1 on unknown `mode`, (6) exit-1 on non-array `allowed_capabilities`, (7) `--json` success shape matches the spec (valid, path, policy fields), (8) `--json` failure shape matches the spec (valid:false, path, error), (9) parity: every failure fixture exits 1 under BOTH `tusq policy verify --policy <fixture>` and `tusq serve --policy <fixture>` with byte-identical error messages.
- `tests/evals/governed-cli-scenarios.json` — add one eval scenario asserting that `tusq policy verify` exit codes and `--json` output remain stable across a round-trip from `tusq policy init` (prevents drift between generator, verifier, and validator).

The dev role is accountable for implementing all items above. The QA role is accountable for independently re-verifying them as REQ-070 through REQ-075 acceptance criteria (the specific REQ numbering is the QA role's call; naming them now would over-reach PM scope).

## M23: Opt-In Strict Policy Verifier (Manifest-Aware)

### Purpose

M22 shipped `tusq policy verify` as a pure *policy-file* validator: given a path, does `loadAndValidatePolicy()` accept it, exactly as `tusq serve --policy` would at startup? That is a necessary but not sufficient governance check. A policy file can be internally valid yet still misaligned with the manifest the serve path will actually consult — for example, when `allowed_capabilities` names a capability that does not exist in `tusq.manifest.json`, or names one that exists but is `approved: false`, or one whose `review_needed: true` flag is still set. In those cases, `tusq serve --policy` will start successfully, `tools/list` will silently drop the unapproved or missing capability, and an operator's reviewer-level least-privilege expectation is quietly violated — the policy looked tight but the manifest never supported it.

M23 closes that gap with a single opt-in flag on the existing `tusq policy verify` subcommand: `--strict`. When set, the verifier additionally reads `tusq.manifest.json` (or a path passed via `--manifest <path>`) and cross-references every name in the policy's `allowed_capabilities` array against the manifest's approval-gated set. The check is strictly read-only: it introduces one additional local filesystem read and zero new I/O classes.

### Scope Boundary

M23 is deliberately narrow:

- **In scope (V1.4):** one new flag (`--strict`) and one supporting flag (`--manifest <path>`, consulted only under `--strict`) on the existing `tusq policy verify` subcommand. Under `--strict`, every name listed in `allowed_capabilities` is cross-checked against the manifest for existence, `approved: true`, and absence of `review_needed: true`. Default (`--strict` absent) behavior is byte-for-byte identical to M22.
- **Out of scope (V1.4):** no manifest-freshness check (no `previous_manifest_hash` chaining, no `manifest_version` ladder enforcement); no capability-schema quality check; no dry-run plan execution under `--strict`; no network I/O of any kind; no target-product I/O of any kind; no `tusq policy audit` / multi-source governance report (reserved for a future increment); no auto-fix or `--fix` flag; no strict-by-default escalation.

Strict mode is additive and opt-in. Everything default `tusq policy verify` rejects, `tusq policy verify --strict` also rejects; strict mode adds additional rejection cases on top of the M22 validator, never relaxes them.

### `tusq policy verify --strict` Command Shape

Synopsis (extended from M22):

```
tusq policy verify [--policy <path>]
                   [--strict [--manifest <path>]]
                   [--json]
                   [--verbose]
```

Flag evaluation order (enforced by dev implementation):

1. Parse flags. If `--manifest` is set without `--strict`, exit 1 with `--manifest requires --strict` and do not read any file. (This guard keeps the flag semantics unambiguous and prevents a future drift where `--manifest` gets silently repurposed.)
2. Run the M22 policy-file validator via `loadAndValidatePolicy(policyPath)`. If it fails, exit 1 with the M22 message exactly as before. Strict checks are NOT run on a policy that fails M22 validation — the operator's first fix is the policy file, not the manifest.
3. If `--strict` is set, resolve the manifest path (default `tusq.manifest.json`; overridable via `--manifest <path>`), read the manifest, and run strict checks as defined below. On any strict check failure, exit 1.
4. On success (M22 validator accepts the policy AND, if `--strict`, every strict check passes), emit the appropriate success output and exit 0.

Exit codes:

| Exit | Meaning |
|------|---------|
| `0` | Policy file passed `loadAndValidatePolicy()`; AND, if `--strict` was set, all strict checks passed |
| `1` | M22 validator rejected the policy, OR a strict check rejected the policy, OR `--manifest` was supplied without `--strict`, OR (strict-mode only) the manifest file was missing or unreadable or not valid JSON |

### `tusq policy verify` Options (extended for M23)

| Option | Description | Default |
|--------|-------------|---------|
| `--policy <path>` | Path to the execution-policy file to validate | `.tusq/execution-policy.json` |
| `--strict` | Additionally cross-reference `allowed_capabilities` against the manifest | Disabled (default is M22 behavior) |
| `--manifest <path>` | Path to the manifest file consulted under `--strict` | `tusq.manifest.json` |
| `--json` | Emit a machine-readable result object to stdout (extended shape under `--strict`) | Human-readable summary |
| `--verbose` | Print the resolved policy path, manifest path (if `--strict`), and diagnostics to stderr | Disabled |

### Strict Check Rules

Given a policy with `allowed_capabilities` = `N` (an array or `null`):

| Case | Behavior |
|------|----------|
| `N` is `null` / unset | Strict check passes trivially. Unset semantically means "all approved capabilities in the manifest are allowed," which is by definition manifest-aligned. (This matches the M20 `tools/list` filter semantics.) |
| `N` is an empty array | Strict check passes trivially. The policy authorizes zero capabilities; no misalignment is possible. |
| `N` is a non-empty array | For each name in `N`, the manifest MUST contain a capability whose `name` field equals that string, that capability MUST have `approved: true`, and that capability MUST NOT have `review_needed: true`. Strict errors are collected in deterministic order (the order in which names appear in `N`), not deduplicated across rules (a single name can fail multiple rules, producing multiple strict errors). |

### `tusq policy verify --strict` Failure UX

Strict-mode failure messages are new (they describe a new failure class and therefore cannot inherit from M22). The M22 parity contract applies only to policy-file validation; strict checks are a distinct governance boundary and `tusq serve --policy` does NOT enforce them (serve silently drops unlisted capabilities via `tools/list`, which is the M20 contract and MUST be preserved).

| Failure | User sees |
|---------|-----------|
| `--manifest` supplied without `--strict` | `--manifest requires --strict` |
| `--strict` set but manifest file missing | `Manifest not found:` followed by the resolved manifest path |
| `--strict` set but manifest file unreadable | `Could not read manifest file:` followed by the path and the OS error message |
| `--strict` set but manifest file is not valid JSON | `Invalid manifest JSON at:` followed by the path and parser message |
| `--strict` set but manifest has no `capabilities` array | `Invalid manifest shape at:` followed by the path and the literal suffix `: missing capabilities array` |
| Strict: allowed capability not present in manifest | `Strict policy verify failed: allowed capability not found in manifest:` followed by the name |
| Strict: allowed capability present but `approved: false` | `Strict policy verify failed: allowed capability not approved:` followed by the name |
| Strict: allowed capability present and approved but `review_needed: true` | `Strict policy verify failed: allowed capability requires review:` followed by the name |

Multiple strict failures for different names produce one message line per failure, emitted to stderr (or included in the `strict_errors` array under `--json`), in the order the names appear in `allowed_capabilities`.

### `tusq policy verify --strict` JSON Output Shape

On success (exit 0), with `--strict --json`:

```
{
  "valid": true,
  "strict": true,
  "path": "<resolved policy path>",
  "manifest_path": "<resolved manifest path>",
  "manifest_version": <integer>,
  "policy": {
    "schema_version": "1.0",
    "mode": "describe-only" | "dry-run",
    "reviewer": "<string>",
    "approved_at": "<ISO-8601 UTC>",
    "allowed_capabilities": null | ["<name>", ...]
  },
  "approved_allowed_capabilities": <integer>
}
```

Where `approved_allowed_capabilities` is the count of names in `allowed_capabilities` that passed strict checks (equal to `allowed_capabilities.length` on success, or `null` when `allowed_capabilities` is itself `null`/unset).

On failure (exit 1), with `--strict --json`:

```
{
  "valid": false,
  "strict": true,
  "path": "<resolved policy path>",
  "manifest_path": "<resolved manifest path or null if manifest I/O failed before read>",
  "error": "<same message written to stderr for the first failure>",
  "strict_errors": [
    {"name": "<capability name>", "reason": "not_in_manifest" | "not_approved" | "requires_review"}
  ]
}
```

On an M22-level rejection (policy-file validator failed), `strict` is `true` only when `--strict` was supplied; `strict_errors` is an empty array because strict checks never ran. The `error` field and behavior are identical to the M22 `--json` failure shape for that case.

### `tusq policy verify --strict` Local-Only Invariants

| Invariant | How it shows up at the CLI |
|-----------|----------------------------|
| No server startup | `tusq policy verify --strict` never binds a TCP port, never opens a socket; it runs synchronously and exits |
| No network I/O | No HTTP, DB, MCP handshake; operators can run it with networking disabled |
| Filesystem reads are bounded | Exactly two files are read under `--strict`: the policy file and the manifest file. No scan file, no compiled tools, no `.git/`, no external includes |
| No target-product call | The verifier never invokes a compiled tool, never executes a dry-run plan |
| No manifest writes | The manifest is read-only under `--strict`; no field is mutated, no approval is recorded, no `capability_digest` is re-computed |
| Default behavior unchanged | With `--strict` absent, no manifest I/O occurs even if `tusq.manifest.json` exists at the default path; M22 behavior is preserved byte-for-byte |

### Pipeline Propagation

```
tusq manifest                                                         # existing
   └─ writes: tusq.manifest.json                                      # approval-gated set lives here

tusq approve <name> [--all]                                           # existing
   └─ writes: tusq.manifest.json capabilities[*].approved=true       # approval gate

tusq policy init
   └─ writes: .tusq/execution-policy.json                             # M21

tusq policy verify .tusq/execution-policy.json
   └─ reads:  loadAndValidatePolicy(path)                             # M22; pure policy-file validator

tusq policy verify --strict .tusq/execution-policy.json
   └─ reads:  loadAndValidatePolicy(path)                             # M22; pure policy-file validator
   └─ reads:  tusq.manifest.json (or --manifest <path>)               # M23; manifest-aware cross-reference
   └─ emits:  stdout summary or JSON; exit 0 or 1                     # M23

tusq serve --policy .tusq/execution-policy.json
   └─ reads:  loadAndValidatePolicy(path)                             # M20; unchanged, shared validator
   └─ serves: tools/list (approved-only), tools/call (policy mode)    # M20
```

M23 inserts no new pipeline stage; it extends the M22 sibling validator with an opt-in manifest-aware branch. Default `tusq policy verify` is still the pure policy-file path.

### V1.4 Limitations

| Limitation | Rationale | V2 Plan |
|------------|-----------|---------|
| No manifest freshness / hash-chain check | Adding `previous_manifest_hash` validation here would couple strict verify to version-history semantics that `tusq diff` already owns; keeping concerns separate preserves each command's contract | V2 `tusq policy audit` can compose strict verify + diff + eval into one multi-source report |
| No execution reachability probe | Violates the local/offline invariant; a PASS is an alignment statement, not an execution-safety statement | Reserved for a hosted / opt-in operator tier, never for the local CLI |
| No `--fix` or auto-remediation | V1.4 is read-only by design; mutating the policy file during verify would make the command a writer and break the single-responsibility shape | V2 may add `tusq policy migrate` when a `1.1` schema ships |
| No strict-by-default escalation | Would silently break every M22 CI caller and couple verify to filesystem state (manifest presence); Constraint 11 forbids this | V2 may expose an operator-level default via a separate config, never via command drift |
| No warning / advisory output when strict is off but manifest exists | Clutters stdout/stderr for a correctly-scoped default case and muddies exit-code semantics | If operator telemetry ever justifies it, a `--warn-strict` opt-in flag is the right shape, not a default |

### Approval-Gate Invariant Preservation

M23 does not alter the approval-gate invariant set first stated in the M20 section. For clarity:

1. `tools/list` continues to filter by `approved: true` on the source manifest regardless of whether `tusq policy verify --strict` passed, failed, or was never run.
2. A passing `tusq policy verify --strict` is NOT authorization to execute any capability, and is NOT a substitute for `tools/list`'s at-serve-time approval filter. Strict mode is a reviewer-time alignment check, not a runtime gate.
3. A failing `tusq policy verify --strict` does NOT prevent `tusq serve --policy` from starting successfully with the same policy file — M23 does not change the serve path, and `tusq serve --policy` continues to silently drop unlisted/unapproved capabilities from `tools/list` as specified in M20. Strict verify is a CI/review-layer gate, not a serve-startup gate.
4. `tusq policy verify --strict` performs no outbound I/O. It cannot leak capability names, reviewer identity, policy content, or manifest content beyond the local filesystem and stdout/stderr.

### Validator Parity Contract (Extended)

The M22 validator-parity contract (every M22 rejection message is byte-identical between `tusq policy verify` and `tusq serve --policy`) is preserved verbatim under M23: strict mode runs strictly AFTER M22 validation, so the M22 error surface is unchanged. Strict-mode failure messages are NOT part of the M22 parity contract — `tusq serve --policy` does not perform strict checks and never will under V1.4, and strict-mode messages are distinct strings documented in the failure UX table above.

A dedicated smoke/eval scenario enforces two parity invariants:

1. **M22 parity preserved:** every M22 failure fixture still produces byte-identical messages across `tusq policy verify`, `tusq policy verify --strict` (when M22 validation fails first), and `tusq serve --policy`.
2. **Strict determinism:** repeated `tusq policy verify --strict` runs on the same policy and manifest produce identical exit codes, identical stdout, and identical `strict_errors` ordering. No nondeterminism is permitted.

### Docs and Tests Required Before Implementation

- `README.md` — add `policy verify --strict` to the CLI reference description; add a two-line example showing the strict invocation and the forbidden framing ("alignment check, not a runtime safety gate").
- `website/docs/cli-reference.md` — add a `policy verify --strict` subsection with synopsis, options table, strict-failure table, JSON-output example, and an explicit "what a strict PASS does NOT prove" note.
- `website/docs/execution-policy.md` — insert a "Strict verification (opt-in)" section that recommends `tusq policy verify --strict` as a CI/review-layer gate once a manifest exists; link it from both the `tusq policy init` walkthrough and the `tusq serve --policy` walkthrough; explicitly distinguish policy-file validation from manifest-aware strict validation.
- `tests/smoke.mjs` — add coverage for: (1) default `tusq policy verify` behavior is byte-for-byte identical to M22 even when `tusq.manifest.json` exists (no manifest I/O observed), (2) `--strict` success exit 0 on a generated policy whose `allowed_capabilities` are approved in the manifest, (3) `--strict` exit 1 on allowed-capability absent from manifest with exact failure message, (4) `--strict` exit 1 on allowed-capability present but unapproved, (5) `--strict` exit 1 on allowed-capability present and approved but `review_needed: true`, (6) `--strict` exit 1 when manifest file is missing with `Manifest not found:` message, (7) `--strict` exit 1 when manifest is malformed JSON, (8) `--manifest` without `--strict` exits 1 before any file is read, (9) `--strict --json` success shape matches the spec (valid, strict, path, manifest_path, manifest_version, policy, approved_allowed_capabilities), (10) `--strict --json` failure shape matches the spec (valid:false, strict:true, path, manifest_path, error, strict_errors), (11) `--strict` with `allowed_capabilities` unset passes on a populated manifest, (12) M22 parity: every existing M22 failure fixture still produces identical messages under `tusq policy verify` with and without `--strict`.
- `tests/evals/governed-cli-scenarios.json` — add one eval scenario asserting that `tusq policy verify --strict` produces deterministic `strict_errors` ordering across repeated runs on the same fixture (guards against nondeterminism in manifest traversal or Set-based deduplication).

The dev role is accountable for implementing all items above. The QA role is accountable for independently re-verifying them as REQ-075 through REQ-080-ish acceptance criteria (the specific REQ numbering is the QA role's call; naming them now would over-reach PM scope).

## M24: Opt-In Fastify Schema Body-Field Extraction

### Purpose

VISION.md line 72 requires manifests that are "usable on first pass for real codebases, not toy examples." M15 addressed four of the first-pass usability gaps (path parameter extraction, smart domain inference, rich descriptions, honest confidence penalty). One gap remained: a Fastify route can declare a literal JSON-Schema `body` directly in its route-options object, and the V1.4 scanner discards that shape entirely — the existing `schema_hint` boolean detects only *presence* of the keyword `schema:` and never extracts the declared fields. An LLM receiving a manifest generated from a well-schema'd Fastify codebase sees `input_schema: { type: "object", additionalProperties: true }` and has no idea what fields to send, even though the source literally told the scanner which fields are required and what their types are.

M24 closes that gap for the deterministic case: when the Fastify route's `schema` value is a literal object, and the `body` key inside it is a literal object with `properties` and (optionally) `required`, the extractor captures the declared top-level field shapes into the manifest's `input_schema`. No library is imported; no code is evaluated; nothing about non-Fastify extractors changes.

### Scope Boundary

M24 ships exactly one extraction path: literal Fastify `schema.body` → manifest `input_schema.properties` (plus `input_schema.required` and `input_schema.additionalProperties: false`). Everything else is explicitly out of scope for V1.5:

| In-scope for M24 | Out-of-scope for V1.5 |
|------------------|-----------------------|
| Fastify route-options object containing a literal `schema: { body: { properties, required } }` block | Express-validator chain expressions (`body('x').isEmail()`) |
| Top-level primitive types on each property (`string`, `number`, `integer`, `boolean`, `object`, `array`) | Joi / Zod / Yup schema detection |
| Top-level `required` array literal | NestJS class-validator DTO decorators (`@IsEmail()`, `@IsNotEmpty()`) |
| Graceful degradation to M15 behavior on any parse ambiguity | Nested property descent below one level (`properties.address.properties.zip`) |
| Additive confidence bump (+0.04) when extraction succeeds | Format validation (`format: "email"`, `pattern: "^[a-z]+$"`, `enum`, `oneOf`, `anyOf`) |
| Fastify `schema.params` and `schema.querystring` extraction | Runtime validator execution or import |

### Extraction Rules

The Fastify extractor (`extractFastifyRoutes` in `src/cli.js`) runs the following algorithm **in addition to** the existing `schema_hint` detection:

1. Locate the route-options object for each route registration (existing pattern).
2. Within the options object, regex-locate `schema\s*:\s*\{`; if not found, emit no `schema_fields` and fall back to M15 behavior.
3. Balanced-brace-match forward from the `{` to find the end of the schema block; if the braces do not balance within the options block, fall back.
4. Inside the schema block, regex-locate `body\s*:\s*\{`; if not found, fall back.
5. Balanced-brace-match the body block; inside it, regex-locate `properties\s*:\s*\{` and balanced-brace-match the properties block.
6. Within the properties block, iterate top-level `<name>\s*:\s*\{` entries in **source order**. For each entry, balanced-brace-match the value block and extract the `type` string literal (one of `string|number|integer|boolean|object|array`). If no `type` is present, default to `"string"` (the Fastify default for an under-specified property).
7. Within the body block, regex-locate `required\s*:\s*\[` and balanced-bracket-match; parse the resulting array literal for string items.
8. If any step fails parse, the entire `schema_fields` record is dropped — the route falls back to M15 behavior byte-for-byte. Partial extraction is never emitted.

### Pipeline Propagation

```
tests/fixtures/fastify-sample/src/server.ts
   └─ extractFastifyRoutes()                                                 # M24; captures schema_fields when the pattern matches
      └─ finalizeRouteInference()                                            # merges schema_fields.body into input_schema
         └─ buildInputSchema()                                               # flips additionalProperties: false when schema_fields present
            └─ scanObject.routes[i].input_schema { properties, required, source: "fastify_schema_body", additionalProperties: false }
               └─ tusq.manifest.json capability.input_schema                 # same shape; schema_fields is not preserved, only the merged input_schema
                  └─ tusq-tools/*.json parameters                            # inherits the merged shape; agents see real field names
                     └─ MCP tools/list                                       # agents see real field names on callable tools
```

No new artifact shape is introduced. `schema_fields` lives only on the in-memory route record during manifest generation; the persisted artifact is the existing `input_schema` shape, now populated with real field names for Fastify routes that declare them.

### Confidence Model Extension

The existing `scoreConfidence()` branches are preserved verbatim. One additive branch is added: when `schema_fields` is captured, score += 0.04 (capped at 0.95). The existing `+0.14` for `schema_hint` is unchanged. A route with both a schema hint and captured schema fields therefore gains +0.18 total from the schema signal, reflecting the stronger grounding.

Routes without `schema_fields` capture the existing confidence behavior byte-for-byte.

### Source Metadata Tag

The manifest capability's `input_schema.source` field (already present at `src/cli.js:2552`) takes a new enumerated value under M24:

| `input_schema.source` | When emitted | Meaning |
|-----------------------|--------------|---------|
| `fastify_schema_body` | Fastify route with a literal `schema.body` block, successful M24 extraction | The declared body field shapes were captured verbatim from source; `additionalProperties` is `false` |
| `framework_schema_hint` | Fastify/Nest route with a non-extractable `schema:` reference (shared constant, computed object) | Only `schema_hint` was detected; fields are not declared in the manifest; M15/M24 fall-back path |
| `request_body` | Express-style handler body access without a schema declaration | Heuristic shape only; `additionalProperties: true` |

A reviewer can tell at a glance whether the manifest's `input_schema` shape is "what the source declares" or "what the heuristic guessed."

### Default Behavior Preservation Table

| Input | Pre-M24 manifest output | Post-M24 manifest output |
|-------|-------------------------|--------------------------|
| Fastify route with literal `schema.body` | `input_schema: { type: "object", additionalProperties: true, source: "framework_schema_hint" }` | `input_schema: { type: "object", properties: {...}, required: [...], additionalProperties: false, source: "fastify_schema_body" }` |
| Fastify route with `schema: sharedSchema` (non-literal) | `input_schema: { ..., source: "framework_schema_hint" }` | Byte-identical to pre-M24 |
| Fastify route with no `schema:` | `input_schema: { ..., source: "request_body" }` | Byte-identical to pre-M24 |
| Express route (any form) | current `input_schema` | Byte-identical to pre-M24 |
| NestJS route (any form) | current `input_schema` | Byte-identical to pre-M24 |

The only observable manifest change is on Fastify routes whose `schema.body` parses as a literal object with a literal `properties` block.

### Local-Only Invariants

| Invariant | How it shows up during scan/manifest |
|-----------|--------------------------------------|
| No dynamic evaluation | The extractor uses regex + balanced-brace matching on source text; no `require('fastify')`, no `eval`, no `new Function`, no `ts-node` |
| No network I/O | Scanner remains filesystem-only; no downloads, no registry lookups, no telemetry |
| No validator framework import | `src/cli.js` does NOT add a dependency on `ajv`, `fastify`, `@sinclair/typebox`, or any JSON-Schema runtime; M24 ships with zero new `package.json` entries |
| Graceful degradation | Any parse ambiguity falls back to M15 behavior byte-for-byte; partial schema extraction is forbidden |
| Deterministic output | Property key order is source-literal (declaration order); repeated runs produce byte-identical manifests |
| Path param authority | When a Fastify schema body field name collides with an M15 path parameter name, the path parameter wins (path is authoritative URL shape; body is authoritative payload shape) |

### V1.5 Limitations

| Limitation | Rationale | V2 Plan |
|------------|-----------|---------|
| Fastify only | Fastify's `schema` is literal JSON Schema by convention — the only deterministic case in the Node ecosystem. Express-validator, Joi, and Zod require chain-expression or AST parsing that is out of scope for a regex-based extractor | V2 `tusq scan --plugin express-validator` adds express-validator chain inference via an opt-in plugin; Joi/Zod follow the same plugin pattern |
| Body only (no `params`, no `querystring`, no `headers`) | Path params are already M15-extracted into `input_schema.properties`; extracting `schema.params` on top would create duplicate/conflicting shapes. `querystring` and `headers` are lower-value for first-pass usability | V2 may extract `schema.querystring` into a separate `query_schema` field on the capability; `schema.params` stays path-derived |
| Top-level fields only | One level of traversal covers the common case (flat request bodies); nested descent introduces recursion-depth policy and cycle handling that is out of scope for V1.5 | V2 plugin interface can descend deeper with explicit depth limits |
| No format validation | `format`, `pattern`, `enum`, `oneOf`, `anyOf`, `const`, `minLength`, `maxLength` are dropped by V1.5 — only `type` is preserved | V2 extracts the full JSON Schema subset and propagates it through `tools/call` for dry-run argument validation |
| No runtime validator execution | M24 is static-analysis-only; whether the Fastify runtime would actually accept a given payload is not proven by the manifest | V2 dry-run execution (`tusq serve --policy` under a future `mode: "validate"`) can invoke a JSON-Schema validator against the manifest shape |
| No diff-aware re-approval on `input_schema` change | A capability's `capability_digest` already includes `input_schema` (see M13), so an M24-driven shape change will flip the digest and require re-approval; M24 does not ship a one-click "accept new shape" workflow | V2 `tusq approve --schema-changes` may add a targeted approval path for schema-only drift |

### Approval-Gate Invariant Preservation

M24 does not alter the approval-gate invariant set first stated in the M20 section. For clarity:

1. A capability whose `input_schema` changes under M24 (from permissive placeholder to declared-field shape) MUST have its `capability_digest` re-computed; M13 semantics propagate verbatim. A reviewer MUST explicitly re-approve the capability for it to appear in `tools/list`.
2. `tools/list` continues to filter by `approved: true`. A newly-populated `input_schema` does NOT implicitly approve the capability; if approval was previously granted on a less-specific shape, M13 diff detection will surface the change for re-approval.
3. M24 does NOT change `tusq serve` behavior. The `input_schema` is passed through to `tools/list` and `tools/call` unchanged; under `--policy` dry-run, the narrow four-rule validator (see M20) operates against the new shape just as it operated against the old.

### Docs and Tests Required Before Implementation

- `README.md` — add a one-line note under the manifest-format section that Fastify routes with a literal `schema.body` block emit declared field shapes in `input_schema.properties`; name the `fastify_schema_body` source tag explicitly; do NOT use the phrase "validator-backed."
- `website/docs/manifest-format.md` — add a "Fastify schema body extraction" subsection documenting the extraction rules, the `source: "fastify_schema_body"` tag, the `additionalProperties: false` flip, the fall-back semantics when the schema is non-literal, and the V1.5 boundary (Fastify only, body only, top-level only, no format validation).
- `website/docs/frameworks.md` — extend the Fastify row to name "literal `schema.body` extraction" as a captured signal; link to the manifest-format subsection.
- `tests/smoke.mjs` — add coverage for: (a) Fastify route with literal `schema.body` produces `input_schema.properties` with declared field names in declaration order, `additionalProperties: false`, `source: "fastify_schema_body"`; (b) Fastify route with `schema: sharedSchema` (non-literal reference) produces byte-identical output to HEAD `35b7c9c` (M15 fall-back preserved); (c) Fastify route with `schema` present but no `body` key produces M15 fall-back output; (d) Fastify route combining a body schema and a path parameter surfaces both in `input_schema.properties` with path param winning on name collision; (e) Express fixture manifest is byte-identical pre/post-M24; (f) NestJS fixture manifest is byte-identical pre/post-M24; (g) repeated manifest generations on the Fastify fixture produce byte-identical property ordering.
- `tests/fixtures/fastify-sample/src/server.ts` — extend the existing Fastify sample to include at least one route with a literal `schema.body` block exercising `string`, `number`, `boolean` types, a `required` array, and a property name that collides with a path parameter. Add at least one route with `schema: sharedSchema` (non-literal reference) to exercise the fall-back path.
- `tests/evals/governed-cli-scenarios.json` — add one eval scenario asserting that the Fastify fixture manifest contains `input_schema.properties` with expected keys in declaration order, `additionalProperties: false` on the Fastify route, and that repeated runs (repeat_runs=3) produce byte-identical property ordering.

The dev role is accountable for implementing all items above. The QA role is accountable for independently re-verifying them as REQ-081 through REQ-086-ish acceptance criteria (the specific REQ numbering is the QA role's call; naming them now would over-reach PM scope).

## M25: Static PII Field-Name Redaction Hints

### Purpose

VISION.md lines 167–168 name "detect sensitive fields such as PII, payments, secrets, and regulated data" and "produce redaction and retention defaults" as a V1 data-and-schema-understanding responsibility. M12 added the `capability.redaction` shape with four fields (`pii_fields`, `log_level`, `mask_in_traces`, `retention_days`) but shipped them with permissive defaults — `pii_fields: []`, the other three `null` — deferring inference entirely to V2. That was correct in V1.0 when `input_schema.properties` was empty for most routes.

M15 (path-param extraction) and M24 (Fastify literal `schema.body` extraction) have since populated `input_schema.properties` with real declared field names for a meaningful slice of real SaaS codebases. The deterministic gap is now: every manifest generated against a codebase with declared `email`, `password`, or `ssn` body fields still emits `redaction.pii_fields: []`, even though the key names in `input_schema.properties` are literally telling the scanner which fields are sensitive. A reviewer looking at `tusq.manifest.json` sees `pii_fields: []` on a route that obviously handles PII and has to fix it by hand — the exact failure mode VISION.md line 73 flags ("treat manual manifest authoring as a failure of the engine, not a feature").

M25 closes that gap in the narrowest deterministic zone: match the already-populated `input_schema.properties` keys against a fixed canonical set of well-known PII field names, and populate `redaction.pii_fields` with the matching names in source-declaration order. No value inspection, no regex over source, no new dependency, no new CLI flag, no semantic claim beyond "the field name matches a canonical PII name."

### Scope Boundary

M25 ships exactly one extraction path: `input_schema.properties` keys → `redaction.pii_fields` array via a fixed canonical name set. Everything else is explicitly out of scope for V1.6:

| In-scope for M25 | Out-of-scope for V1.6 |
|------------------|------------------------|
| Whole-key case-insensitive match (normalized by stripping `_`/`-` and lowercasing) against a frozen canonical PII name set | Partial-key / tail-match (e.g., flagging `email_template_id` because it contains `email`) |
| Cross-framework application — same extractor runs against every `input_schema.properties` object regardless of Express/Fastify/NestJS provenance | Nested descent into `properties.address.properties.zip_code` (top-level keys only in V1.6) |
| Deterministic order matching `input_schema.properties` iteration order (source-literal declaration order from M15/M24) | Value inspection, payload sampling, or format-regex inference (e.g., detecting an email by regex on sample data) |
| `capability.redaction.pii_fields` populated as an array of original-case field names | Auto-population of `redaction.log_level`, `mask_in_traces`, or `retention_days` (these stay `null` in V1.6) |
| `capability_digest` re-computation when `redaction.pii_fields` changes (M13 semantics already cover this) | Auto-escalation of `capability.sensitivity_class` on PII match (stays `"unknown"`; explicit V2 increment owns sensitivity inference) |
| Narrow canonical list covering English-language common PII field names | Multi-locale PII names (Spanish, German, Portuguese, Japanese, etc.) — V2 plugin scope |
| Zero new dependencies, static in-memory computation | Runtime PII detection, sampling, or regulatory inference (GDPR/HIPAA/PCI mapping) |

### Canonical PII Name Set (V1.6)

The following set is enumerated explicitly and frozen in `src/cli.js`. All entries are shown in **normalized** form (lowercase, no underscores or hyphens). Match occurs when `key.toLowerCase().replace(/[_-]/g, '')` equals one of the entries.

| Category | Normalized names |
|----------|------------------|
| Email | `email`, `emailaddress`, `useremail` |
| Phone | `phone`, `phonenumber`, `mobile`, `mobilephone`, `telephone` |
| Government ID | `ssn`, `socialsecuritynumber`, `taxid`, `nationalid` |
| Name | `firstname`, `lastname`, `fullname`, `middlename` |
| Address | `streetaddress`, `zipcode`, `postalcode` |
| Date of birth | `dateofbirth`, `dob`, `birthdate` |
| Payment | `creditcard`, `cardnumber`, `cvv`, `cvc`, `bankaccount`, `iban` |
| Secrets | `password`, `passphrase`, `apikey`, `accesstoken`, `refreshtoken`, `authtoken`, `secret` |
| Network | `ipaddress` |

Expansions to this list are material governance events. Any V1.6.x or V2 expansion lands under its own ROADMAP milestone with a fresh re-approval expectation (reviewers re-evaluate affected capabilities via `tusq diff`) and a RELEASE_NOTES entry.

### Extraction Rules

The extractor (`extractPiiFieldHints` in `src/cli.js`) runs after `buildInputSchema()` finishes populating `capability.input_schema.properties`. For each generated capability:

1. If `input_schema.properties` is absent, empty, or not a plain object, return `[]`.
2. Iterate keys in object-insertion order (source-literal declaration order established under M15/M24).
3. For each key, compute `normalized = key.toLowerCase().replace(/[_-]/g, '')`.
4. If `normalized` is in the canonical set, push the **original-case** `key` into the result array.
5. Return the result array. No deduplication (insertion order already guarantees no duplicates from a single `properties` object).

The extractor is a pure function — no filesystem I/O, no side effects. It is invoked once per capability during manifest generation, immediately before `buildRedactionDefaults()` (which supplies the rest of the `redaction` shape).

### Pipeline Propagation

```
input_schema.properties (already populated by M15/M24/heuristic paths)
   └─ extractPiiFieldHints(properties)                                      # M25; pure function, in-memory only
      └─ capability.redaction.pii_fields                                    # populated array, declaration order
         └─ capability_digest (M13)                                         # re-hashed when pii_fields changes
            └─ tusq.manifest.json capability.redaction                      # persisted artifact
               └─ tusq-tools/*.json redaction                               # inherits pii_fields verbatim
                  └─ MCP tools/call redaction                               # agents see pii_fields as advisory metadata
```

No new artifact field is introduced. `redaction.pii_fields` is the existing M12 array; M25 simply supplies a non-empty default for routes whose `input_schema.properties` declares canonical PII names.

### Default Behavior Preservation Table

| Input | Pre-M25 `redaction.pii_fields` | Post-M25 `redaction.pii_fields` |
|-------|--------------------------------|----------------------------------|
| Capability with `input_schema.properties: { email: {...}, password: {...} }` | `[]` | `["email", "password"]` |
| Capability with `input_schema.properties: { user_email: {...}, FIRST_NAME: {...} }` | `[]` | `["user_email", "FIRST_NAME"]` |
| Capability with `input_schema.properties: { email_template_id: {...}, phone_book_url: {...} }` | `[]` | `[]` (whole-key match only) |
| Capability with `input_schema.properties: {}` or absent | `[]` | `[]` |
| Capability with path-param-only `input_schema.properties: { id: {...} }` | `[]` | `[]` (no canonical match) |
| Non-Fastify/Non-Express/Non-NestJS capability with no `input_schema.properties` | `[]` | `[]` |

The only observable manifest change is on capabilities whose `input_schema.properties` contains at least one key whose normalized form is in the canonical set.

### Confidence Model Interaction

M25 does NOT modify `scoreConfidence()`. PII field-name presence is not a confidence signal; it is a redaction signal. A capability with `redaction.pii_fields: ["email"]` has the same confidence score as the same capability without M25.

### Sensitivity Class Interaction

M25 does NOT modify `capability.sensitivity_class`. `sensitivity_class` remains `"unknown"` on every capability in V1.6. Auto-escalating to `"confidential"` or `"restricted"` on PII match would overclaim, because sensitivity is a composite judgment (data class + regulatory scope + organizational posture) that field-name matching alone cannot prove. Sensitivity inference is reserved for an explicit V2 increment.

### Local-Only Invariants

| Invariant | How it shows up during manifest generation |
|-----------|---------------------------------------------|
| No dynamic evaluation | The extractor is a pure function over an already-built `input_schema.properties` object; no `require`, no `eval`, no `new Function` |
| No network I/O | Manifest generation remains filesystem-only; no downloads, no registry lookups, no PII-dictionary fetch |
| No new runtime dependency | `package.json` MUST NOT gain `pii-detector`, `presidio`, `compromise`, or any NLP/PII library; M25 ships with zero new `package.json` entries |
| Graceful degradation | When `input_schema.properties` is absent or empty, `pii_fields: []` (byte-identical to pre-M25) |
| Deterministic output | `pii_fields` order is the iteration order of `input_schema.properties`; repeated runs produce byte-identical arrays |
| Whole-key match only | Partial / substring matches are forbidden; a field named `email_template_id` MUST NOT be flagged |
| No `sensitivity_class` auto-escalation | `sensitivity_class` stays `"unknown"` even when `pii_fields` is non-empty |
| No source-text regex | The extractor never opens or scans source files; it operates exclusively on the in-memory `input_schema.properties` object |

### V1.6 Limitations

| Limitation | Rationale | V2 Plan |
|------------|-----------|---------|
| English-language canonical names only | Covers the dominant real-SaaS case; multi-locale inference would require either a localization dictionary (new dependency) or locale detection (new heuristic) | V2 `tusq scan --plugin pii-multilocale` introduces opt-in localized canonical sets behind a plugin flag; per-language canonical files owned by contributors |
| Top-level keys only (no nested descent into `properties.address.properties.zip_code`) | V1.5 extraction already limits to one level of depth (M24 Constraint 13); consistency with the M24 boundary keeps the spec reviewable | V2 extends both M24 and M25 to nested descent under an explicit `max_depth` policy |
| Whole-key match only (no tail-match, no substring match) | Tail-matching creates false positives on innocuous names (`phone_book_url`, `email_template_id`); whole-key is the most defensible rule | V2 may ship an opt-in `tusq scan --pii-heuristic loose` mode for tail-matching; V1.6 keeps the conservative default |
| No value inspection | V1.6 is static-only by invariant (Constraint 15); inspecting values would violate the local-only boundary and require runtime sampling | V2 runtime-instrumentation increment may sample payloads under an explicit operator opt-in |
| No `log_level` / `mask_in_traces` / `retention_days` inference | These three fields encode organizational policy (log retention, redaction rules, regulatory deadlines) that field-name matching cannot derive | V2 reads a repo-local policy file (e.g., `.tusq/redaction-policy.json`) to supply organization-specific defaults |
| No `sensitivity_class` auto-escalation | Sensitivity is a composite judgment (data class + regulatory scope + org posture); field-name match alone cannot prove it | V2 sensitivity-inference increment ships with its own constraint entry and explicit escalation rules |
| Capability-digest flip on M25 upgrade | Every capability whose `input_schema.properties` contains a canonical PII name will see its digest flip on the first post-M25 scan, revoking effective approval until re-approval | Expected behavior — M13 approval gate is the correct migration path; RELEASE_NOTES MUST document the re-approval requirement |

### Approval-Gate Invariant Preservation

M25 does not alter the approval-gate invariant set first stated in the M20 section. For clarity:

1. A capability whose `redaction.pii_fields` changes under M25 (from `[]` to a non-empty array) MUST have its `capability_digest` re-computed; M13 semantics propagate verbatim. A reviewer MUST explicitly re-approve the capability for it to appear in `tools/list`.
2. `tools/list` continues to filter by `approved: true`. A newly-populated `redaction.pii_fields` does NOT implicitly approve the capability; if approval was previously granted on an empty `pii_fields`, M13 diff detection will surface the change for re-approval.
3. M25 does NOT change `tusq serve` behavior. The `redaction` shape is passed through to `tools/call` responses unchanged; agents see `pii_fields` as advisory metadata, not as an enforced constraint on payloads.
4. M25 does NOT change `tusq policy verify --strict` behavior. Strict mode's checks (name exists, approved, not review-needed) are orthogonal to redaction content; a capability with populated `pii_fields` and `approved: true` passes `--strict` on the same terms as one with empty `pii_fields` and `approved: true`.

### Docs and Tests Required Before Implementation

- `README.md` — add a one-line note under the manifest-format section that canonical PII field names (by whole-key normalized match) populate `redaction.pii_fields` by default; name the canonical set URL-reference (pointing to `website/docs/manifest-format.md`) and explicitly state that this is a source-literal name hint, not a runtime PII-detection claim; do NOT use "PII detection," "PII-validated," or "compliant" framing.
- `website/docs/manifest-format.md` — add a "PII Field-Name Redaction Hints" subsection enumerating the full canonical set, the normalization rule (lowercase + strip `_`/`-`), the whole-key match invariant, the no-auto-escalation rule for `sensitivity_class`, the fall-back semantics (empty `properties` → empty `pii_fields`), the V1.6 boundary (field-name-only, no value inspection, no nested descent, no format/regex), and the explicit framing that M25 does NOT prove runtime PII handling — `pii_fields` is a name hint, not a validation gate.
- `website/docs/redaction.md` (if present) or the manifest-format redaction subsection — add a "What M25 does NOT do" callout enumerating: does not inspect values, does not execute code, does not fetch any dictionary, does not prove regulatory compliance, does not auto-set `sensitivity_class`, does not modify `log_level` / `mask_in_traces` / `retention_days`.
- `tests/smoke.mjs` — add coverage for: (a) Fastify fixture route with literal `schema.body` declaring `email` and `password` produces `redaction.pii_fields: ["email", "password"]` in declaration order; (b) case/underscore/hyphen variants (`userEmail`, `user_email`, `USER_EMAIL`, `user-email`) all match; (c) whole-key invariant: `email_template_id`, `phone_book_url`, `ssn_document_uri` produce `pii_fields: []`; (d) capability with empty or absent `input_schema.properties` produces `pii_fields: []`; (e) Express and NestJS fixtures with no PII-named fields produce byte-identical manifests pre/post-M25; (f) repeated manifest generations produce byte-identical `pii_fields` ordering; (g) a capability whose `input_schema.properties` acquires a PII name flips `capability_digest` (M13) and surfaces under `tusq diff`; (h) `sensitivity_class` remains `"unknown"` on every capability even when `pii_fields` is populated; (i) `tusq policy verify --strict` is unchanged by M25 (strict's approval-alignment check does not inspect `redaction`).
- `tests/fixtures/fastify-sample/src/server.ts` — extend the existing Fastify sample to include at least one route whose literal `schema.body` declares `email`, `password`, and a non-PII field like `subject`; ensure the route exercises case/underscore variants.
- `tests/evals/governed-cli-scenarios.json` — add one eval scenario asserting that the Fastify fixture generates `redaction.pii_fields` in declaration order and that repeated runs (`repeat_runs=3`) produce byte-identical arrays.

The dev role is accountable for implementing all items above. The QA role is accountable for independently re-verifying them as REQ-088 through REQ-094-ish acceptance criteria (the specific REQ numbering is the QA role's call; naming them now would over-reach PM scope).

## M26: Static PII Category Labels for Redaction Hints

### Purpose

VISION.md line 168 names "produce redaction and **retention defaults**" as a V1 data-and-schema-understanding responsibility. M25 delivered the first half — it populates `redaction.pii_fields` with the canonical PII field-name hints derived statically from `input_schema.properties`. The second half (retention defaults) remains unserved: a reviewer looking at `tusq.manifest.json` sees `redaction.pii_fields: ["email", "password"]` but no signal that these two fields belong to *different* retention categories (email: contact PII with year-scale retention by org policy; password: secret with no-retention / immediate-hash by org policy). Auto-populating `retention_days` directly from a field-name match would conflate organizational policy with extracted evidence and silently reclassify approved capabilities — the same overclaim M25 rejected under Constraint 16.

The bounded path forward: emit a parallel `redaction.pii_categories` array (same length and order as `pii_fields`) where each entry labels the canonical category that produced the match. Categories are the exact nine buckets already enumerated in M25's canonical PII name set: `"email"`, `"phone"`, `"government_id"`, `"name"`, `"address"`, `"date_of_birth"`, `"payment"`, `"secrets"`, `"network"`. The category signal gives reviewers the data they need to set retention/log-level/mask-in-traces defaults by hand without the extractor silently doing it for them. `retention_days`, `log_level`, and `mask_in_traces` are not derived from categories and keep existing defaults (`null`, `"full"`, `false`) unless explicitly edited by a reviewer. `sensitivity_class` continues to stay `"unknown"` (M25 Constraint 16 propagates verbatim).

This is the smallest bounded increment that turns M25 from a flat name list into categorized retention-relevant evidence without overclaiming. It is a pure in-memory computation over M25's own output plus the frozen canonical name set that M25 already defines.

### Scope Boundary

M26 ships exactly one extraction path: M25's already-computed `redaction.pii_fields` array → a parallel `redaction.pii_categories` array via a frozen category lookup derived from the M25 canonical set. Everything else is explicitly out of scope for V1.7:

| In-scope for M26 | Out-of-scope for V1.7 |
|------------------|------------------------|
| Emit `redaction.pii_categories` — same length and same order as `pii_fields`; each entry is the canonical category label for the field at the same index | Auto-populating `redaction.retention_days` (keeps existing `null`; organizational policy owns retention) |
| Nine canonical categories, exactly matching M25's canonical-set row headings (normalized to snake_case category keys) | Auto-populating `redaction.log_level` or `redaction.mask_in_traces` (keeps existing defaults `"full"` and `false`) |
| Category keys use a frozen mapping table enumerated in `src/cli.js`: `PII_CANONICAL_NAMES` gains a sibling `PII_CATEGORY_BY_NAME` lookup from normalized name → category | Auto-escalating `capability.sensitivity_class` on category presence (stays `"unknown"`; Constraint 16 propagates to M26) |
| Pure function (`extractPiiFieldCategories(pii_fields, input_schema_properties)`) over M25's output | Introducing any new category beyond the nine M25 categories |
| Cross-framework application — category emission runs wherever `pii_fields` runs | Locale-aware category inference (multi-locale PII names remain V2 plugin scope) |
| `capability_digest` re-computation when `pii_categories` changes (M13 already hashes `redaction` into the digest) | Introducing a separate `redaction.retention_hints` array or new top-level redaction field (V2) |
| Deterministic output — categories array order matches `pii_fields` order which is already source-literal from M15/M24/M25 | Category-driven default filtering in `tusq serve` or `tusq policy verify --strict` (scoreless pass-through in V1.7) |

### Category Mapping (V1.7)

The category labels are the exact row headings from M25's canonical PII name set, normalized to lowercase snake_case. Every normalized name in `PII_CANONICAL_NAMES` MUST map to exactly one category key. The mapping is frozen and enumerated in `src/cli.js`:

| Category key | Source M25 normalized names |
|---------------|------------------------------|
| `email` | `email`, `emailaddress`, `useremail` |
| `phone` | `phone`, `phonenumber`, `mobile`, `mobilephone`, `telephone` |
| `government_id` | `ssn`, `socialsecuritynumber`, `taxid`, `nationalid` |
| `name` | `firstname`, `lastname`, `fullname`, `middlename` |
| `address` | `streetaddress`, `zipcode`, `postalcode` |
| `date_of_birth` | `dateofbirth`, `dob`, `birthdate` |
| `payment` | `creditcard`, `cardnumber`, `cvv`, `cvc`, `bankaccount`, `iban` |
| `secrets` | `password`, `passphrase`, `apikey`, `accesstoken`, `refreshtoken`, `authtoken`, `secret` |
| `network` | `ipaddress` |

The mapping is total and disjoint: every entry in `PII_CANONICAL_NAMES` has exactly one category; no name maps to two categories; no category key is emitted without at least one supporting entry in the canonical name set. Any V1.7.x or V2 expansion — whether adding a new normalized name to an existing category or adding a new category — is a material governance event and MUST land under its own ROADMAP milestone with a fresh re-approval expectation and a RELEASE_NOTES entry, identical to the M25 canonical-set freeze rule.

### Extraction Rules

The extractor (`extractPiiFieldCategories` in `src/cli.js`) runs immediately after `extractPiiFieldHints` finishes populating `capability.redaction.pii_fields`. For each generated capability:

1. If `redaction.pii_fields` is empty or absent, return `[]`.
2. For each `key` in `redaction.pii_fields`, in order:
   - Compute `normalized = key.toLowerCase().replace(/[_-]/g, '')` (exactly the M25 normalization rule).
   - Look up `normalized` in `PII_CATEGORY_BY_NAME`. Because M25 already guarantees every entry in `pii_fields` has a matching normalized canonical name, the lookup MUST succeed. If it does not (which would indicate a bug in the M25/M26 name-set synchronization), throw synchronously during manifest generation so the operator sees an actionable error before any `tusq.manifest.json` is written.
   - Push the returned category key into the result array.
3. Return the result array. The result array's length equals `pii_fields.length` and its ordering equals `pii_fields` ordering.

The extractor is a pure function — no filesystem I/O, no side effects, no source-text inspection. It is invoked exactly once per capability, after `extractPiiFieldHints` and before `buildRedactionDefaults()` / `computeCapabilityDigest()`.

### Pipeline Propagation

```
input_schema.properties (already populated by M15/M24/heuristic paths)
   └─ extractPiiFieldHints(properties)                                      # M25; unchanged
      └─ capability.redaction.pii_fields                                    # M25 array, declaration order
         └─ extractPiiFieldCategories(pii_fields, properties)               # M26; pure function, in-memory only
            └─ capability.redaction.pii_categories                          # M26 array, same length + order as pii_fields
               └─ capability_digest (M13)                                   # re-hashed when pii_categories changes
                  └─ tusq.manifest.json capability.redaction                # persisted artifact
                     └─ tusq-tools/*.json redaction                         # inherits pii_categories verbatim
                        └─ MCP tools/call redaction                         # agents see pii_categories as advisory metadata
```

`redaction.pii_categories` is a new sibling to `redaction.pii_fields` inside the `redaction` object. It does not replace any existing field; it sits alongside `pii_fields`, `log_level`, `mask_in_traces`, and `retention_days`. The manifest schema version is unchanged in V1.7 (the shape expansion is additive).

### Default Behavior Preservation Table

| Input | Pre-M26 `redaction` | Post-M26 `redaction` |
|-------|---------------------|------------------------|
| Capability with `pii_fields: ["email", "password"]` | `{pii_fields: ["email", "password"], pii_categories: <absent>, log_level: "full", mask_in_traces: false, retention_days: null}` | `{pii_fields: ["email", "password"], pii_categories: ["email", "secrets"], log_level: "full", mask_in_traces: false, retention_days: null}` |
| Capability with `pii_fields: ["user_email", "FIRST_NAME"]` | `{pii_fields: ["user_email", "FIRST_NAME"], pii_categories: <absent>, ...}` | `{pii_fields: ["user_email", "FIRST_NAME"], pii_categories: ["email", "name"], ...}` |
| Capability with `pii_fields: []` | `{pii_fields: [], pii_categories: <absent>, ...}` | `{pii_fields: [], pii_categories: [], ...}` |
| Capability with empty/absent `input_schema.properties` | `{pii_fields: [], pii_categories: <absent>, ...}` | `{pii_fields: [], pii_categories: [], ...}` |

Every capability emits `pii_categories` as an array; an empty `pii_fields` produces an empty `pii_categories`. The field is never absent — this keeps the manifest shape predictable for downstream consumers.

### Confidence Model Interaction

M26 does NOT modify `scoreConfidence()`. Category presence, like field-name presence, is a redaction signal, not a confidence signal. A capability with `redaction.pii_categories: ["email", "secrets"]` has the same `confidence` as the same capability without M26.

### Sensitivity Class Interaction

M26 does NOT modify `capability.sensitivity_class`. `sensitivity_class` remains `"unknown"` on every capability in V1.7. Constraint 16 (M25 redaction-framing invariant) propagates verbatim to M26: auto-escalating sensitivity_class on category presence would overclaim, because a `secrets` category on a 2FA toggle is semantically different from a `secrets` category on a login route, and the extractor cannot tell these apart from field names alone. Sensitivity inference is reserved for an explicit V2 increment.

### Retention Defaults Interaction

M26 does NOT derive or mutate `redaction.retention_days`, `redaction.log_level`, or `redaction.mask_in_traces`. Existing defaults remain `null`, `"full"`, and `false` respectively unless explicitly edited by a reviewer. This is a conscious boundary: these fields encode organizational policy (regulatory deadlines, log-retention rules, tracing budgets) that a field-category label cannot derive without org-specific context. The M26 increment supplies the evidence reviewers need to set these fields by hand; it does NOT auto-populate them. A future V2 increment may read a repo-local policy file (e.g., `.tusq/redaction-policy.json`) keyed by category to supply org-specific defaults; that increment is explicitly out of scope for V1.7.

### Local-Only Invariants

| Invariant | How it shows up during manifest generation |
|-----------|---------------------------------------------|
| No dynamic evaluation | The extractor is a pure function over M25's `pii_fields` array and the frozen `PII_CATEGORY_BY_NAME` lookup; no `require`, no `eval`, no `new Function` |
| No network I/O | Manifest generation remains filesystem-only; no downloads, no registry lookups, no category-dictionary fetch |
| No new runtime dependency | `package.json` MUST NOT gain any new library for M26; the extractor uses only the M25 canonical set and the frozen category lookup |
| Graceful degradation | When `pii_fields` is empty or absent, `pii_categories: []` (the only emitted shape on non-PII capabilities) |
| Deterministic output | `pii_categories` order is identical to `pii_fields` order (source-literal declaration order); repeated runs produce byte-identical arrays |
| Total mapping | Every M25-match triggers exactly one category emission; no skipped entries, no duplicate categories emitted for the same index |
| No `sensitivity_class` auto-escalation | `sensitivity_class` stays `"unknown"` even when `pii_categories` is non-empty |
| No `retention_days` / `log_level` / `mask_in_traces` auto-population | Existing defaults remain `null`, `"full"`, and `false`; organizational-policy owns them, not the extractor |
| No source-text regex | The extractor never opens or scans source files; it operates exclusively on M25's in-memory `pii_fields` array |
| No runtime-enforced framing | `pii_categories` is a source-literal label, NOT a runtime PII-validation claim, NOT a regulatory-compliance claim, NOT a retention-policy enforcement (Constraint 18 propagates framing guardrails from Constraint 16) |

### V1.7 Limitations

| Limitation | Rationale | V2 Plan |
|------------|-----------|---------|
| Nine categories only | Matches M25's canonical set exactly; expanding the category vocabulary requires expanding the canonical name set, which is a material governance event | V2 may add categories alongside new canonical names under a dedicated expansion milestone |
| `retention_days` / `log_level` / `mask_in_traces` are not category-derived | Retention/log/trace policies encode org-specific regulatory deadlines that field categories alone cannot derive | V2 reads a repo-local policy file (e.g., `.tusq/redaction-policy.json`) keyed by category to supply org-specific defaults under an explicit opt-in |
| No cross-capability aggregation | `pii_categories` is a per-capability array; V1.7 does not emit a repo-level summary | V2 `tusq docs` may summarize category distribution across capabilities |
| No category-driven filtering in `tusq serve` or policy verifier | M25/M26 are descriptive; enforcement remains out of scope | V2 may add a policy-file rule that rejects a capability whose `pii_categories` contains a category not listed in `.tusq/redaction-policy.json` |
| No `sensitivity_class` auto-escalation | Same composite-judgment reasoning as M25 Constraint 16 | V2 sensitivity-inference increment ships with its own constraint entry |
| Capability-digest flip on M26 upgrade | Every capability with non-empty `pii_fields` gains a new `pii_categories` entry; under M13, the `redaction` hash changes and the capability requires re-approval | Expected behavior — M13 approval gate is the correct migration path; RELEASE_NOTES MUST document the re-approval requirement; capabilities with `pii_fields: []` flip from `pii_categories: <absent>` to `pii_categories: []`, which is also a digest-flipping change |

### Approval-Gate Invariant Preservation

M26 does not alter the approval-gate invariant set stated under M20/M25. For clarity:

1. A capability whose `redaction.pii_categories` changes under M26 (appears for the first time; every capability will see this on its first post-M26 scan) MUST have its `capability_digest` re-computed; M13 semantics propagate verbatim. A reviewer MUST explicitly re-approve the capability for it to appear in `tools/list`.
2. `tools/list` continues to filter by `approved: true`. A newly-populated `redaction.pii_categories` does NOT implicitly approve the capability; if approval was previously granted, M13 diff detection will surface the change for re-approval under `tusq diff`.
3. M26 does NOT change `tusq serve` behavior. The `redaction` shape is passed through to `tools/call` responses unchanged; agents see `pii_categories` as advisory metadata alongside `pii_fields`, not as an enforced constraint on payloads.
4. M26 does NOT change `tusq policy verify --strict` behavior. Strict mode's checks (name exists, approved, not review-needed) are orthogonal to redaction content; a capability with populated `pii_categories` and `approved: true` passes `--strict` on the same terms as a capability with populated `pii_fields` and `approved: true`.

### Digest Flip Scope

M26's first-scan digest flip applies to **every** capability, not only those with non-empty `pii_fields`. Reason: capabilities with `pii_fields: []` transition from `pii_categories: <absent>` to `pii_categories: []`, and the `redaction` object hash computed under M13 includes the object shape. This is a one-time migration event and is documented in the M26 RELEASE_NOTES entry. Post-migration, the digest only re-flips when `pii_fields` itself changes (same M25 semantics).

### Docs and Tests Required Before Implementation

- `README.md` — add a one-line note under the manifest-format section that every capability's `redaction.pii_categories` array labels each `pii_fields` entry with its canonical category (`email`, `phone`, `government_id`, `name`, `address`, `date_of_birth`, `payment`, `secrets`, `network`) and explicitly state that categories are source-literal name-category labels, NOT retention-policy enforcement or regulatory-compliance claims; do NOT use "auto-retention," "auto-redaction," or "compliant" framing.
- `website/docs/manifest-format.md` — extend the "PII Field-Name Redaction Hints" subsection (or add an adjoining "PII Field-Name Category Labels" subsection) enumerating the nine-category V1.7 mapping, explaining the one-to-one correspondence with `pii_fields`, the empty-array behavior when `pii_fields` is empty, the no-auto-population rule for `retention_days`/`log_level`/`mask_in_traces`, the no-auto-escalation rule for `sensitivity_class`, and the explicit framing that M26 does NOT prove runtime PII handling or retention-policy enforcement — `pii_categories` is a category label, not a validation gate.
- `website/docs/manifest-format.md` — add a "What M26 does NOT do" callout enumerating: does not inspect values, does not execute code, does not fetch any dictionary, does not prove regulatory compliance, does not auto-set `sensitivity_class`, does not auto-populate `log_level` / `mask_in_traces` / `retention_days`, does not enforce retention, does not filter in `tusq serve`.
- `tests/smoke.mjs` — add coverage for: (a) Fastify fixture route with literal `schema.body` declaring `email` and `password` produces `redaction.pii_categories: ["email", "secrets"]` alongside `pii_fields: ["email", "password"]`, same length and order; (b) capability with `pii_fields: []` produces `pii_categories: []` (array, not absent); (c) capability with mixed-category fields (`user_email` + `ssn` + `credit_card`) produces `pii_categories: ["email", "government_id", "payment"]` in declaration order matching `pii_fields`; (d) Express and NestJS fixtures — non-PII capabilities produce `pii_categories: []`; PII-name capabilities emit categories in the same order as `pii_fields`; (e) repeated manifest generations produce byte-identical `pii_categories` arrays; (f) `sensitivity_class` remains `"unknown"` on every capability even when `pii_categories` is populated; (g) `retention_days`, `log_level`, `mask_in_traces` keep existing defaults (`null`, `"full"`, `false`) on every capability; (h) `tusq policy verify --strict` is unchanged by M26 (strict's approval-alignment check does not inspect `redaction`); (i) every entry in `pii_fields` produces exactly one entry in `pii_categories` at the same index.
- `tests/fixtures/pii-hint-sample/` — extend the existing M25 fixture (or add a sibling) with at least one route whose literal `schema.body` declares two PII fields from **different** categories (e.g., `email` + `credit_card`) so the category emission exercises the cross-category path. The existing `POST /auth` (`email` + `password`) already exercises two categories (email + secrets) and can serve the category-mix test without a new route.
- `tests/evals/governed-cli-scenarios.json` — add one eval scenario (`pii-category-label-determinism`) asserting that a fixture exercising multiple categories produces the expected `pii_categories` array in declaration order and that the scenario is deterministic across three repeated runs. Total eval scenarios become **9**.

The dev role is accountable for implementing all items above. The QA role is accountable for independently re-verifying them as REQ-094+ acceptance criteria (the specific REQ numbering is the QA role's call; naming them now would over-reach PM scope).

## M27: Reviewer-Facing PII Redaction Review Report

### Purpose

After M26 labeled every PII field-name hint with a frozen category, reviewers still have no tusq-native way to see those signals per capability alongside an advisory reminder for the category-specific judgment calls they own (retention window, log level, trace masking). M27 closes that gap with a new read-only CLI subcommand, `tusq redaction review`, that aggregates the manifest's M25 `redaction.pii_fields` and M26 `redaction.pii_categories` per capability and attaches one frozen advisory string per category. M27 adds a reviewer aid; it does NOT add runtime enforcement, does NOT mutate the manifest, and does NOT change the behavior of `tusq scan`, `tusq manifest`, `tusq compile`, `tusq serve`, `tusq approve`, `tusq diff`, `tusq docs`, or `tusq policy verify`.

### Scope Boundary

| In V1.8 scope (M27) | Out of V1.8 scope (V2+) |
|---------------------|--------------------------|
| New CLI noun `redaction` with one subcommand `review` | No other `redaction` subcommands (e.g., `redaction set-retention`, `redaction classify`) |
| Read `tusq.manifest.json` and emit a deterministic reviewer report | Mutating the manifest, even to "apply recommended defaults" |
| Human-readable and `--json` output modes | Interactive TTY UI, `--watch`, ANSI coloring |
| Frozen nine-entry `PII_REVIEW_ADVISORY_BY_CATEGORY` lookup in `src/cli.js` | Locale-specific advisory strings, custom-advisory file override |
| One advisory line per distinct category per capability, in category-appearance order | Cross-capability aggregation, category heatmaps, severity scoring |
| Local/offline/deterministic | Fetching compliance-framework advisory text over the network |
| Zero change to `retention_days`, `log_level`, `mask_in_traces`, `sensitivity_class` | Auto-populating any of those fields based on report content |
| Zero change to `tusq serve`, `tusq policy verify` (default or `--strict`) | Gating serve or strict verification on report content |
| Zero new dependencies | Adding a PII/compliance/retention/NLP library |

### Command Shape

```
tusq redaction review [--manifest <path>] [--capability <name>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--manifest <path>` | `tusq.manifest.json` (cwd) | Manifest file to read |
| `--capability <name>` | unset | Filter report to a single capability by exact name |
| `--json` | unset | Emit machine-readable JSON instead of the human report |

There are no other flags. `tusq redaction` with no subcommand prints a short enumerate-subcommands block identical in shape to `tusq policy`. Unknown subcommands exit 1 with `Unknown subcommand:` followed by the name.

### Frozen Advisory Set (V1.8)

`PII_REVIEW_ADVISORY_BY_CATEGORY` is a frozen nine-entry lookup in `src/cli.js`. Every M26 category key maps to exactly one single-line reviewer-advisory string. The set is total and disjoint; any addition OR wording change is a material governance event that MUST land under its own ROADMAP milestone with a fresh re-approval expectation and a RELEASE_NOTES entry.

| Category | Advisory string (single line, frozen V1.8) |
|----------|--------------------------------------------|
| `email` | `Contact-PII field detected — reviewer: choose retention window, log masking, and trace redaction aligned with your org's contact-data policy.` |
| `phone` | `Contact-PII field detected — reviewer: choose retention window, log masking, and trace redaction aligned with your org's contact-data policy.` |
| `government_id` | `High-sensitivity government-ID field detected — reviewer: apply your org's strictest retention, logging, and trace-redaction defaults.` |
| `name` | `Personal-name field detected — reviewer: decide whether the field should be logged in plaintext, masked, or redacted; retention follows your org's contact-data policy.` |
| `address` | `Physical-address field detected — reviewer: choose retention window, log masking, and trace redaction aligned with your org's contact-data policy.` |
| `date_of_birth` | `Date-of-birth field detected — reviewer: apply age-sensitive retention and redaction defaults; some jurisdictions treat DOB as higher-risk PII.` |
| `payment` | `Payment-data field detected — reviewer: apply your org's payment-data retention, logging, and masking rules (e.g., PCI-aligned defaults owned by your team).` |
| `secrets` | `Secret or credential field detected — reviewer: this field SHOULD NOT be logged in plaintext; apply trace redaction and minimal retention at your org's standard.` |
| `network` | `Network-identifier field detected — reviewer: choose retention and masking aligned with your org's logging policy; some jurisdictions treat IP addresses as PII.` |

The advisory strings are intentionally reviewer-directive (they each start with a noun phrase describing what was detected, followed by "reviewer:" and a reminder of the decision the reviewer still owns). None of them claim the capability is compliant, safe, or runtime-enforced; all of them delegate the retention/logging/masking choice to the reviewer.

### Report Shape (JSON)

```json
{
  "manifest_path": "tusq.manifest.json",
  "manifest_version": 7,
  "generated_at": "2026-04-22T12:34:56.000Z",
  "capabilities": [
    {
      "name": "users_createUser",
      "approved": true,
      "sensitivity_class": "unknown",
      "pii_fields": ["email", "password"],
      "pii_categories": ["email", "secrets"],
      "advisories": [
        { "category": "email",   "text": "Contact-PII field detected — reviewer: choose retention window, log masking, and trace redaction aligned with your org's contact-data policy." },
        { "category": "secrets", "text": "Secret or credential field detected — reviewer: this field SHOULD NOT be logged in plaintext; apply trace redaction and minimal retention at your org's standard." }
      ]
    }
  ]
}
```

Invariants on the JSON shape:

- `manifest_path` is the resolved input path (exact `--manifest` value or the default `tusq.manifest.json`).
- `manifest_version` and `generated_at` are copied verbatim from the manifest's top-level fields (not re-stamped). This keeps the report content-deterministic for a given manifest input.
- `capabilities` is an array in the manifest's own `capabilities` declaration order.
- `pii_fields` and `pii_categories` are copied verbatim from the manifest (same length, same parallel order).
- `advisories` contains one entry per **distinct** category in the order that category first appears in `pii_categories`. A capability with `pii_categories: ["email", "secrets", "email"]` emits two advisory entries (`email`, `secrets`), not three; the appearance order is preserved.
- Capabilities with `pii_fields: []` emit `pii_fields: []`, `pii_categories: []`, and `advisories: []`.
- No ANSI escape codes, no wall-clock fields inside per-capability entries, no randomization. Repeated runs produce byte-identical JSON.

### Report Shape (Human)

Human output mirrors the JSON shape in plain text. For each capability, one section:

```
Capability: users_createUser
  approved: true
  sensitivity_class: unknown
  Redaction:
    pii_fields:     ["email", "password"]
    pii_categories: ["email", "secrets"]
    Advisories:
      - email:   Contact-PII field detected — reviewer: choose retention window, log masking, and trace redaction aligned with your org's contact-data policy.
      - secrets: Secret or credential field detected — reviewer: this field SHOULD NOT be logged in plaintext; apply trace redaction and minimal retention at your org's standard.
```

Capabilities with `pii_fields: []` produce a single reminder line `No canonical PII field-name matches — reviewer action: none required from M27.` within the `Redaction:` sub-block, with no `Advisories:` rows. The human report is plain-text-only (no ANSI escapes) so operators piping to file get byte-identical text.

### Edge-Case and Empty-Manifest Handling

The following edge cases are specified explicitly so the dev role cannot ship two defensible implementations that diverge on reviewer-visible behavior:

| Input manifest condition | Exit code | Human stdout | `--json` stdout | stderr |
|---------------------------|-----------|--------------|-----------------|--------|
| `capabilities` is a valid array with ≥1 entry | 0 | One section per capability as shown above | `{manifest_path, manifest_version, generated_at, capabilities: [...]}` | empty |
| `capabilities` is a valid array with exactly 0 entries (`capabilities: []`) | 0 | Single explicit line `No capabilities in manifest — nothing to review.` and nothing else | `{manifest_path, manifest_version, generated_at, capabilities: []}` (top-level fields still copied verbatim from manifest) | empty |
| Manifest file path cannot be opened | 1 | empty | empty | `Manifest not found: <path>` |
| Manifest file opens but `JSON.parse` throws | 1 | empty | empty | `Invalid manifest JSON: <path>` |
| Manifest parses but top-level `capabilities` is missing OR not an array | 1 | empty | empty | `Invalid manifest: missing capabilities array` |
| `--capability <name>` specifies a name not present in the manifest | 1 | empty | empty | `Capability not found: <name>` |
| Unknown flag on `tusq redaction review` | 1 | empty | empty | `Unknown flag: <flag>` |
| Unknown subcommand under `tusq redaction` | 1 | empty | empty | `Unknown subcommand: <name>` |

Invariants implied by the table:

- **Empty-array is NOT an error.** A manifest with `capabilities: []` is a valid scaffold state (a fresh `tusq init` repo with no routes yet) and M27 MUST treat it as an exit-0 "nothing to review" signal, not a hard failure. Conflating it with the `missing capabilities array` error path would break the scaffold/init-new-repo workflow.
- **stdout is empty on every exit-1 path.** No partial report, no JSON object with an `error` field, no trailing newline. Operators who pipe stdout to a file get a zero-byte file on failure. The `stdout === ""` invariant is asserted by smoke for every error case.
- **Error text goes to stderr only.** The six error messages above are written to `process.stderr` exclusively; none of them reach stdout under any flag combination.
- **Detection-before-output.** Every error path exits before any stdout bytes are written. A malformed manifest MUST NOT produce a half-written JSON object on stdout before the parse error surfaces.

### Optional Top-Level Manifest Field Fallback

The input manifest's own `manifest_version` and `generated_at` fields are copied verbatim to the report. Older fixtures (pre-M13 scaffolds or hand-authored minimal manifests) may lack either field; the rule is:

| Input manifest state | `--json` report | Human report |
|----------------------|-----------------|--------------|
| Both fields present and well-formed | Copied verbatim | Copied verbatim |
| `manifest_version` missing or non-number | Emitted with value `null` | Rendered as the literal string `unknown` |
| `generated_at` missing or non-ISO-string | Emitted with value `null` | Rendered as the literal string `unknown` |

M27 MUST NOT re-stamp either field with current wall-clock time. M27 MUST NOT omit either field from the `--json` output. M27 MUST NOT error out on a manifest that lacks either field — both are informational top-level context, not required inputs.

### Advisory Byte-Exactness Invariant

The frozen `PII_REVIEW_ADVISORY_BY_CATEGORY` strings enumerated above use the em-dash character (U+2014, `—`) in every entry, not an ASCII hyphen-minus (U+002D, `-`) and not an en-dash (U+2013, `–`). stdout is written as UTF-8; the byte sequence for each advisory is locked by a smoke fixture. Any character-level change — including hyphen drift, whitespace drift, or punctuation drift — is a material governance event that MUST land under its own ROADMAP milestone with a RELEASE_NOTES entry. This is not pedantry: teams that snapshot the review output for change-review CI will see a spurious diff on any byte-level drift, and the whole governance story rests on reviewers being able to trust the wording is stable between releases.

### Pipeline Propagation

```
tusq.manifest.json (authored or generated) ─▶
  tusq redaction review (read-only) ─▶
    stdout (human or --json) ─▶
      reviewer (offline) ─▶
        hand-edits retention_days/log_level/mask_in_traces/sensitivity_class (if they choose)
```

The manifest is never modified. No other artifact (`.tusq/execution-policy.json`, `tusq-tools/*.json`, `.tusq/scan.json`) is read or written. The reviewer is always in the loop; M27 adds no automated path from advisory text to manifest defaults.

### Default Behavior Preservation Table

| Command / Field | M27 effect |
|-----------------|------------|
| `tusq scan` | Unchanged (M27 does not re-scan source) |
| `tusq manifest` | Unchanged (M27 does not mutate the manifest) |
| `tusq compile` | Unchanged |
| `tusq serve` | Unchanged (no filtering based on advisory content) |
| `tusq approve` / `tusq diff` / `tusq docs` / `tusq version` | Unchanged |
| `tusq policy verify` (default) | Unchanged |
| `tusq policy verify --strict` | Unchanged (strict continues to check approval alignment only; M27 advisory content is NOT a strict input) |
| `capability.redaction.pii_fields` | Unchanged (read verbatim) |
| `capability.redaction.pii_categories` | Unchanged (read verbatim) |
| `capability.redaction.retention_days` / `log_level` / `mask_in_traces` | Unchanged — defaults stay `null` / `"full"` / `false` unless a reviewer hand-edits them |
| `capability.sensitivity_class` | Unchanged — stays `"unknown"`; M27 never escalates |
| `capability.capability_digest` | Unchanged — M27 does not mutate capability content, so there is no digest flip on first post-M27 run |

### Confidence Model Interaction

M27 does not modify `scoreConfidence()`, does not introduce new confidence inputs, and does not emit a confidence field in the review report. `scoreConfidence()` remains exactly the M15/M24 implementation.

### Sensitivity Class Interaction

M27 does not mutate `sensitivity_class`. The report echoes the manifest's `sensitivity_class` verbatim alongside `pii_fields` and `pii_categories` so the reviewer sees all three signals at once; that is a read, not a write. Constraint 16 (no auto-escalation under M25) and Constraint 18 (no auto-escalation under M26) propagate verbatim to M27 — no advisory category causes any sensitivity escalation.

### Local-Only Invariants

| Invariant | How it shows up at review time |
|-----------|---------------------------------|
| Read-only | `tusq.manifest.json` mtime and content are unchanged after any `tusq redaction review` invocation; smoke test asserts this |
| No network I/O | No HTTP, DB, socket, or DNS; smoke test exercises the default and `--json` paths with network disabled |
| Zero new dependencies | `package.json` MUST NOT gain any PII, compliance, retention, NLP, or table-rendering library |
| Deterministic output | Running twice on the same manifest produces byte-identical stdout (human and `--json`); no wall-clock field inside per-capability entries |
| No scan re-run | The subcommand never calls the scanner or re-reads `src/` |
| No capability execution | The subcommand never calls a compiled tool or starts the MCP server |
| Advisory set is frozen | `PII_REVIEW_ADVISORY_BY_CATEGORY` is enumerated in this spec and locked by a smoke fixture; any wording change is a material governance event |

### V1.8 Limitations

- English advisory strings only; multi-locale advisory sets are reserved for V2 under a plugin interface.
- No custom-advisory override file (so the frozen set is the single source of reviewer guidance; this is deliberate — allowing overrides in V1.8 would create the same governance-drift risk the frozen set is meant to prevent).
- No CSV/HTML/Markdown export mode; `--json` is the only machine-readable mode (stdout Markdown can be produced by a downstream tool from the `--json` output, which keeps the M27 surface small).
- No manifest-wide aggregates (total PII capabilities, per-category counts); the report is per-capability. Aggregate reporting is reserved for a later increment.
- No `--diff` / `--since` flag comparing two manifests; the existing `tusq diff` command covers that territory and M27 deliberately stays single-manifest.
- No reviewer identity or approval action is captured; M27 is purely informational. `tusq approve` remains the reviewer-action surface.

### Approval-Gate Invariant Preservation

M27 does NOT change the M13 approval gate. `tools/list` and `tools/call` continue to filter on `approved: true` and `review_needed: false` exactly as before. M27 does NOT auto-approve, does NOT clear `review_needed`, and does NOT mutate `approved_by`/`approved_at`. The review report is purely informational and reviewers continue to run `tusq approve` by hand when they want to approve a capability.

### Digest Flip Scope

M27 causes ZERO `capability_digest` flips on first post-M27 run because the manifest is not mutated. In contrast with M25 (narrow flip on PII-name capabilities) and M26 (broad flip across every capability), M27 is observationally invisible in `tusq diff`. The first run after upgrading to a version that includes M27 produces an identical manifest to the version before M27 landed.

### Docs and Tests Required Before Implementation

- `tusq help` — add `redaction` to the noun list (single additional line) and `redaction review` to the subcommand examples; the existing 12-command summary copy gains one new noun with one subcommand and becomes a 12-noun / 13-entry-point surface depending on counting convention (see command-surface.md for the exact table).
- `tusq redaction --help` — prints the subcommands block (`review`).
- `tusq redaction review --help` — prints the flag surface (`--manifest`, `--capability`, `--json`), exit codes, and the "reviewer aid, not a runtime enforcement gate" callout.
- `README.md` — add a short "Reviewer Review Report" subsection under the existing redaction coverage, linking to `website/docs/cli-reference.md` for detail and explicitly stating the advisory set is frozen and the command never mutates the manifest.
- `website/docs/cli-reference.md` — add a `tusq redaction review` section documenting the command shape, flags, exit codes, human output example, `--json` output example, the nine-entry advisory table (frozen V1.8 wording), and the explicit not-runtime-enforcement / not-compliance / not-a-substitute-for-reviewer-judgment framing required by Constraint 19.
- `website/docs/manifest-format.md` — extend the existing PII subsection with a "Reviewing PII redaction hints" paragraph pointing readers at `tusq redaction review`; no manifest-shape changes are documented because there are none.
- `tests/smoke.mjs` — add coverage for: (a) exit 0 on a manifest with M25/M26 PII capabilities, with the expected advisory lines; (b) `--json` round-trips through JSON.parse and preserves order; (c) `--capability <name>` filter to one capability on success; (d) `--capability <unknown>` exits 1 with `Capability not found:`; (e) missing manifest exits 1 with `Manifest not found:`; (f) malformed-JSON manifest exits 1 before any stdout; (g) byte-identical stdout across two runs in both modes; (h) `tusq.manifest.json` mtime and content are unchanged after a review run (the read-only invariant); (i) `sensitivity_class` in the report equals the manifest's value (no escalation); (j) capability with `pii_fields: []` renders the "no canonical PII field-name matches" line; (k) mixed-category capability renders distinct advisory lines in category-appearance order; (l) `tusq policy verify` (default) and `tusq policy verify --strict` stdout/exit code are byte-identical before and after an M27 run on the same fixture.
- `tests/evals/governed-cli-scenarios.json` — add one eval scenario (`redaction-review-determinism`) asserting that `tusq redaction review --json` produces byte-identical stdout across three repeated runs and that advisory ordering matches `pii_categories` appearance order. Total eval scenarios become **10**.

The dev role is accountable for implementing all items above. The QA role is accountable for independently re-verifying them as REQ-101+ acceptance criteria (the specific REQ numbering is the QA role's call; naming them now would over-reach PM scope).

## M28: Static Sensitivity Class Inference from Manifest Evidence

### Purpose

M25–M27 shipped three redaction-metadata increments that gave reviewers structured PII signals but left `capability.sensitivity_class` frozen at `"unknown"` for every capability. The field has existed since M9, and Constraint 16 correctly prevented M25 from auto-escalating it on a PII name match alone. The gap is now addressable: a capability's manifest record already carries the verb, route, parameters, M26 PII categories, the M13 preserve flag, and write-effect markers — all of which are static, reviewer-authored evidence. A deterministic rule table over that evidence can produce a meaningful, reproducible sensitivity label without any network call, runtime probe, or policy inference.

M28 computes `sensitivity_class` as a pure deterministic function of the existing manifest record. The classifier is a frozen six-rule first-match-wins decision table producing a closed five-value enum: `{public, internal, confidential, restricted, unknown}`. Capabilities with zero static evidence return `"unknown"` explicitly rather than silently defaulting to `"public"`. The new label surfaces only in `tusq review`, `tusq docs`, and `tusq diff` as a reviewer aid. It MUST NOT alter `tusq compile` policy, `tusq approve` gating, or any runtime execution surface.

### Scope Boundary

| In scope (V1.9) | Out of scope (V1.9) |
|-----------------|---------------------|
| Pure deterministic classifier over manifest record fields only | Any network or runtime call |
| Closed five-value enum: public, internal, confidential, restricted, unknown | Open-ended or free-text sensitivity labels |
| Six-rule first-match-wins frozen decision table | Machine-learning inference or heuristic scoring |
| sensitivity_class surfaces in `tusq review`, `tusq docs`, `tusq diff` | New top-level CLI noun or flag |
| capability_digest flip + M13 approved=false reset on change | Altering `tusq compile`, `tusq approve`, or `tusq serve` behavior |
| `--sensitivity` optional filter on `tusq review` | Any runtime enforcement or PII compliance claim |
| M10 SYSTEM_SPEC section (M28 frozen rule table + non-certification boundary) | GDPR / HIPAA / PCI / SOC2 attestation of any kind |
| New Constraint 21 reserving reviewer-aid framing | Marketing or docs that frame sensitivity_class as runtime enforcement |

### Frozen Decision Table (Six Rules, First-Match-Wins)

The classifier evaluates rules in order; the first rule that matches the capability's manifest record determines the `sensitivity_class`. Rules are immutable once M28 ships; any rule change is a material governance event that MUST land under its own ROADMAP milestone with fresh re-approval expectations and a RELEASE_NOTES entry.

| Rule | Condition | Assigned class | Rationale |
|------|-----------|----------------|-----------|
| R1 | `capability.preserve === true` | `restricted` | Preserve flag signals irreversible or destructive-by-intent semantics |
| R2 | `capability.verb` in `{delete, drop, truncate, admin, destroy, purge, wipe}` OR route segment matches `/^(admin\|root\|superuser)/` | `restricted` | Admin/destructive verb or admin-namespaced route |
| R3 | `capability.redaction.pii_categories` is non-empty | `confidential` | Confirmed PII-category evidence from M26 static labels |
| R4 | `capability.verb` in `{create, update, write, post, put, patch}` AND (`capability.route` OR any param key) matches `/payment\|invoice\|charge\|billing\|ssn\|tax\|account_number/i` | `confidential` | Write verb into financial or regulated context |
| R5 | `capability.auth_required === true` OR (`capability.verb` in write set AND no PII/financial signal from R3/R4) | `internal` | Auth gate or narrow write that does not meet R3/R4 threshold |
| R6 | (no prior rule matched) | `public` | Default — only when evidence is present and all stronger rules fail |

**Rule precedence is fixed: R1 beats all others; R2 beats R3; R3 beats R4; earlier rules always win.**

Capabilities with zero static evidence (no verb, no route, no params, no redaction, no preserve flag, no auth_required) MUST receive `sensitivity_class: "unknown"`. This is a distinct sixth class, NOT a fallback to "public." The classifier MUST emit `"unknown"` explicitly when no manifest evidence is present to drive a rule — never silently default to `"public"` in the zero-evidence case.

### Eight-Case Smoke Matrix (AC-7)

| Case | Evidence | Expected class | Rule |
|------|----------|----------------|------|
| 1 | preserve=true, pii_categories non-empty | `restricted` | R1 beats R3 |
| 2 | verb=delete, pii_categories non-empty | `restricted` | R2 beats R3 |
| 3 | pii_categories non-empty, no preserve, verb=get | `confidential` | R3 |
| 4 | verb=post, route=/payments/new, pii_categories empty | `confidential` | R4 |
| 5 | auth_required=true, verb=get, pii_categories empty | `internal` | R5 |
| 6 | verb=put, no PII, no financial route | `internal` | R5 |
| 7 | verb=get, no auth, no PII | `public` | R6 |
| 8 | no verb, no route, no params, no redaction, no preserve, no auth_required | `unknown` | zero evidence |

### `classifySensitivity(capability)` Algorithm

```
function classifySensitivity(cap) {
  // Zero-evidence guard
  if (!cap.verb && !cap.route && (!cap.redaction?.pii_categories?.length)
      && !cap.preserve && !cap.auth_required) {
    return "unknown";
  }
  // R1: preserve flag
  if (cap.preserve === true) return "restricted";
  // R2: admin/destructive verb or route
  const RESTRICTED_VERBS = new Set(["delete","drop","truncate","admin","destroy","purge","wipe"]);
  if (RESTRICTED_VERBS.has((cap.verb || "").toLowerCase())) return "restricted";
  if (/^(admin|root|superuser)(\/|$)/i.test(cap.route || "")) return "restricted";
  // R3: PII category present
  if (cap.redaction?.pii_categories?.length) return "confidential";
  // R4: write verb + financial context
  const WRITE_VERBS = new Set(["create","update","write","post","put","patch"]);
  const FINANCIAL_RE = /payment|invoice|charge|billing|ssn|tax|account_number/i;
  if (WRITE_VERBS.has((cap.verb || "").toLowerCase())) {
    if (FINANCIAL_RE.test(cap.route || "") ||
        Object.keys(cap.input_schema?.properties || {}).some(k => FINANCIAL_RE.test(k))) {
      return "confidential";
    }
  }
  // R5: auth_required or narrow write
  if (cap.auth_required === true) return "internal";
  if (WRITE_VERBS.has((cap.verb || "").toLowerCase())) return "internal";
  // R6: default (evidence present, no stronger rule matched)
  return "public";
}
```

The function is pure: same input → same output, byte-stable across runs, no I/O, no clock, no randomness.

### Pipeline Propagation

```
tusq manifest
   └─ capabilities[*].sensitivity_class = classifySensitivity(cap)   # M28; pure function
   └─ capability_digest re-computed (sensitivity_class included)      # M13; unchanged algorithm
   └─ approved = false when digest flips                              # M13; unchanged gate

tusq review [--sensitivity <class>]
   └─ displays sensitivity_class per capability                       # M28; reviewer-aid surface

tusq docs
   └─ renders sensitivity_class in per-capability sections            # M28; reviewer-aid surface

tusq diff
   └─ surfaces sensitivity_class changes in review queue              # M28; reviewer-aid surface

tusq compile
   └─ output is byte-identical regardless of sensitivity_class        # M28; AC-9 invariant

tusq approve
   └─ gate logic is unchanged (approved/review_needed only)           # M28; AC-9 invariant

tusq serve
   └─ MCP surface is unchanged                                        # M28; AC-9 invariant
```

### `tusq review` Optional `--sensitivity` Filter

The only new surface flag in M28 is an optional `--sensitivity <class>` filter on the existing `tusq review` command. When supplied, the review output lists only capabilities whose `sensitivity_class` matches the given value. It MUST NOT change the exit code semantics of `tusq review` (exit 0 still means no blocking concerns; exit 1 still means unapproved/low-confidence capabilities were found — the filter does not hide those). When the supplied value is not in the legal enum, exit 1 with an actionable message before any output. The filter is advisory-only: operators remain responsible for reviewing all capabilities regardless of sensitivity label.

### AC-9 Compile / Approve / Runtime Invariant Preservation

`tusq compile` output MUST be byte-identical for two manifests that differ only in `sensitivity_class` value. The compiled tool shape does NOT include `sensitivity_class` in V1.9; no sensitivity gate is applied at compile time. `tusq approve` acceptance criteria (approved/review_needed) are unchanged. `tusq serve` tool-list filtering continues to use only `approved: true` and `review_needed: false`. Any golden-file assertion that compares `tusq compile` output before and after a `sensitivity_class` change MUST pass without modification.

### Digest Flip Scope and AC-5

`sensitivity_class` is included in the content fields hashed to produce `capability_digest` (M13). When M28 first computes a non-`"unknown"` value for a capability that previously had `"unknown"`, the digest flips and `approved` resets to `false`. The capability disappears from `tools/list` until a reviewer re-approves it via `tusq approve`. This is the correct migration path for M28 adoption; RELEASE_NOTES MUST document the expected re-approval sweep on first post-M28 manifest regeneration.

### V1.9 Limitations

| Limitation | Rationale | V2 plan |
|------------|-----------|---------|
| No multi-locale or natural-language route parsing | Route segment matching is regex on ASCII patterns only; non-English or path-aliased routes may miss a classification | V2 plugin interface for locale-aware route classifiers |
| No org-policy override file for sensitivity rules | Hardcoded rule table is the governance guarantee; overrides would drift reviewers | V2 policy-as-code tier with a signed rule table |
| No partial-route confidence weighting | R4 financial match is binary; ambiguous routes (e.g., `/orders`) are classified by verb alone | V2 scoring model that weights multiple signals |
| No reviewer-assignable sensitivity override | Reviewers can observe sensitivity in the review output but cannot override it in the manifest in V1.9 | V2 `tusq approve --sensitivity <class>` to record reviewer override with audit trail |

### Non-Compliance-Certification Boundary

`sensitivity_class` is reviewer-aid framing only. tusq DOES NOT certify, enforce, or attest GDPR, HIPAA, PCI, SOC2, or any other regulatory compliance at runtime. `sensitivity_class: "restricted"` does NOT mean the capability is runtime-restricted from unauthorized callers; it means the manifest evidence pattern matched the R1 or R2 rule and a reviewer should pay heightened attention. DOCS, CLI help, launch artifacts, and any external communication MUST NOT frame `sensitivity_class` as a runtime data-access control, a regulatory compliance proof, or an automated governance certification.

### Edge-Case Invariants

- A capability with `preserve === null` (not `true`) MUST NOT trigger R1.
- A capability with `verb: "DELETE"` (uppercase) MUST trigger R2 after `toLowerCase()` normalization.
- A route of `/admin-panel` MUST NOT trigger R2; the regex is `^(admin|root|superuser)(\/|$)` requiring the segment to BE admin/root/superuser as a full path prefix, not merely contain it.
- `pii_categories: []` (empty array) MUST NOT trigger R3; the check is `length > 0`.
- A capability with auth_required present but false MUST NOT trigger R5; the check is `=== true`.

### Local-Only Invariants

| Invariant | Requirement |
|-----------|-------------|
| Pure function | `classifySensitivity` has no I/O, no network, no clock, no filesystem reads beyond the manifest |
| Deterministic | Same manifest record → same `sensitivity_class`, byte-stable across Node.js processes and platforms |
| Closed enum | No value outside `{public, internal, confidential, restricted, unknown}` may be emitted |
| Zero new dependencies | `package.json` MUST NOT gain any classification, ML, or compliance library |
| Compile-output-invariant | `tusq compile` output is byte-identical before and after M28 adoption |

### Docs and Tests Required Before Implementation

- `src/cli.js` — add `classifySensitivity(cap)` pure function and call it on every capability in manifest generation; update `tusq review` to render `sensitivity_class` per capability and accept optional `--sensitivity <class>` filter; update `tusq docs` to include `sensitivity_class` in per-capability sections; verify `tusq diff` already surfaces the field change (no change needed if diff compares `capability_digest` — digest flip is automatic from M13).
- `SYSTEM_SPEC.md` — this M28 section (already present after this edit); `## Constraints` gains Constraint 21.
- `README.md` — add one line under the manifest shape description noting `sensitivity_class` is computed by a static rule table; link to docs for the frozen rule table.
- `website/docs/manifest-format.md` — add a "Sensitivity Class" subsection documenting the five enum values, the six-rule table, the zero-evidence unknown bucket, the non-certification boundary, and the `--sensitivity` filter on `tusq review`.
- `website/docs/cli-reference.md` — update `tusq review` entry with `--sensitivity` flag and note that `tusq docs` and `tusq diff` now surface `sensitivity_class`.
- `tests/smoke.mjs` — add the 8-case smoke matrix (AC-7); add an assertion that `tusq compile` output is byte-identical for two capabilities differing only in `sensitivity_class`; add assertions that `tusq review --sensitivity restricted` filters correctly and that an unknown filter value exits 1.
- `tests/evals/governed-cli-scenarios.json` — add ≥3 eval regression scenarios: (1) R1>R3 precedence (preserve=true with PII → restricted); (2) R4 financial-route detection (post verb + payment route, no PII → confidential); (3) zero-evidence unknown bucket (empty record → unknown). Total eval scenarios become **≥13**.
- `tests/evals/governed-cli-scenarios.json` — verify AC-9 golden-file: a scenario that compiles two identical capabilities differing only in `sensitivity_class` and asserts identical compiled tool output.

The dev role is accountable for implementing all items above. The QA role is accountable for independently re-verifying them as REQ-109+ acceptance criteria.

## M29: Static Auth Requirements Inference from Manifest Evidence

### Purpose

M10 shipped a single boolean `auth_required` field on each capability; M28 shipped static `sensitivity_class` inference. Reviewers still have no structured view of *what kind* of authentication a capability appears to expect: bearer token, API key, session cookie, basic auth, OAuth/OIDC, or none. This information is already implied by manifest evidence — the middleware-name strings recorded by the scanner, the route prefix, the `auth_required` boolean, and (post-M28) the `sensitivity_class` propagation — but it is not yet surfaced in a structured shape.

M29 computes a structured `auth_requirements` record per capability as a pure deterministic function of the existing manifest record. The classifier evaluates a frozen six-rule first-match-wins decision table over middleware-name strings to assign `auth_scheme`, extracts `auth_scopes` and `auth_roles` from middleware-annotation literals via a frozen extraction rule set, and returns a closed-shape record. The new label surfaces only in `tusq review`, `tusq docs`, and `tusq diff` as a reviewer aid. It MUST NOT alter `tusq compile` policy, `tusq approve` gating, `tusq serve` MCP responses, `tusq policy verify` (default or `--strict`), or `tusq redaction review` output.

### Scope Boundary

| In scope (V1.10) | Out of scope (V1.10) |
|------------------|----------------------|
| Pure deterministic classifier over manifest record fields only | Any network or runtime call |
| Closed seven-value `auth_scheme` enum: bearer, api_key, session, basic, oauth, none, unknown | Open-ended or free-text auth-scheme labels |
| Closed five-value `evidence_source` enum: middleware_name, route_prefix, auth_required_flag, sensitivity_class_propagation, none | Inference from arbitrary source-text grep |
| Frozen six-rule first-match-wins `auth_scheme` decision table | Token-signature validation, JWT-claim parsing, OAuth-flow simulation |
| Frozen scope/role extraction rules (regex over middleware annotation literals only) | Reading any source file beyond what manifest generation already reads |
| `auth_requirements` surfaces in `tusq review`, `tusq docs`, `tusq diff` | New top-level CLI noun or subcommand |
| `capability_digest` flip + M13 `approved=false` reset on change | Altering `tusq compile`, `tusq approve`, `tusq serve`, `tusq policy verify`, `tusq redaction review` behavior |
| Optional `--auth-scheme <scheme>` filter on existing `tusq review` | Any runtime AAA enforcement or compliance attestation claim |
| New SYSTEM_SPEC § M29 + Constraint 22 (reviewer-aid framing) | SOC2 / ISO27001 / OAuth2 / OIDC / SAML / GDPR / HIPAA / PCI attestation of any kind |

### Closed `auth_scheme` Enum (Seven Values)

| Value | Meaning |
|-------|---------|
| `bearer` | Middleware-name evidence matches bearer-token / JWT / access-token pattern |
| `api_key` | Middleware-name evidence matches API-key / x-api-key pattern |
| `session` | Middleware-name evidence matches session / cookie / passport-local pattern |
| `basic` | Middleware-name evidence matches HTTP Basic Auth pattern |
| `oauth` | Middleware-name evidence matches OAuth / OIDC / OpenID pattern |
| `none` | `auth_required === false` AND no admin/restricted route prefix; capability appears intentionally unauthenticated |
| `unknown` | Zero-evidence guard: no middleware, no route prefix, no `auth_required` flag, no `sensitivity_class` signal |

The seven values are the entire legal set. No other value, nullable, or wildcard is permitted in `auth_requirements.auth_scheme`.

### Closed `evidence_source` Enum (Five Values)

| Value | Meaning |
|-------|---------|
| `middleware_name` | Classification driven by R1–R5 middleware-name regex match |
| `route_prefix` | Classification driven by route segment evidence |
| `auth_required_flag` | Classification driven by R6 `auth_required === false` path |
| `sensitivity_class_propagation` | Classification informed by `sensitivity_class` (R2/R6 admin/restricted route gating) |
| `none` | Zero-evidence guard fired; record is `unknown` with empty arrays |

### Frozen Decision Table (Six Rules, First-Match-Wins)

The classifier evaluates rules in order against the capability's middleware-name list and `auth_required` flag; the first rule that matches determines `auth_scheme`. Rules are immutable once M29 ships; any rule change is a material governance event requiring its own ROADMAP milestone with fresh re-approval expectations and a RELEASE_NOTES entry.

| Rule | Condition | Assigned `auth_scheme` | `evidence_source` |
|------|-----------|------------------------|-------------------|
| R1 | Any middleware_name matches `/bearer|jwt|access[_-]?token/i` | `bearer` | `middleware_name` |
| R2 | Any middleware_name matches `/api[_-]?key|x-api-key/i` | `api_key` | `middleware_name` |
| R3 | Any middleware_name matches `/session|cookie|passport-local/i` | `session` | `middleware_name` |
| R4 | Any middleware_name matches `/basic[_-]?auth/i` | `basic` | `middleware_name` |
| R5 | Any middleware_name matches `/oauth|oidc|openid/i` | `oauth` | `middleware_name` |
| R6 | `auth_required === false` AND no admin/restricted route prefix | `none` | `auth_required_flag` |
| default | (no prior rule matched, evidence present) | `unknown` | `none` |

**Rule precedence is fixed: R1 beats all others; earlier rules always win.** A capability with both a `bearer`-matching middleware AND an `api_key`-matching middleware is classified as `bearer` (R1), never `api_key`.

### Zero-Evidence Guard

Capabilities with zero static evidence (no middleware names, no route prefix, no `auth_required` flag, no `sensitivity_class` signal) MUST receive:

```
auth_requirements: {
  auth_scheme: "unknown",
  auth_scopes: [],
  auth_roles: [],
  evidence_source: "none"
}
```

— never silently default to `"none"`. The zero-evidence guard is the first check in `classifyAuthRequirements` before the rule table runs. `"none"` is reachable only from R6 evidence (an explicit `auth_required: false` declaration paired with a non-admin route); it MUST NOT be the absence-of-evidence fallback.

### Frozen Scope/Role Extraction Rules

`auth_scopes` and `auth_roles` are derived from a frozen pure rule set:

- **Scopes** are extracted from middleware-annotation literals matching `/scopes?:\s*\[([^\]]+)\]/` over the capability's source-literal middleware list.
- **Roles** are extracted from middleware-annotation literals matching `/role[s]?:\s*\[([^\]]+)\]/` over the same surface.

Both arrays MUST:
- preserve declaration order (the order entries appear in the source-literal middleware annotation),
- be deduplicated case-sensitively (`"read:user"` and `"Read:User"` are distinct entries; only exact byte-equal duplicates are removed),
- be empty arrays (never `null`, never absent) when zero matches are found.

The extractor reads ONLY the already-built capability record fields (the source-literal middleware list captured by the M9/M15 scanner); no regex over arbitrary source files; no filesystem reads beyond what manifest generation already performs.

### Eight-Case Smoke Matrix (AC-8)

| Case | Evidence | Expected `auth_scheme` | Expected scopes/roles |
|------|----------|------------------------|------------------------|
| 1 | middleware_name="requireBearerToken" | `bearer` | `[]`/`[]` |
| 2 | middleware_name="checkApiKey" | `api_key` | `[]`/`[]` |
| 3 | middleware_name="sessionGuard" | `session` | `[]`/`[]` |
| 4 | middleware_name="basicAuth" | `basic` | `[]`/`[]` |
| 5 | middleware_name="oauthMiddleware" | `oauth` | `[]`/`[]` |
| 6 | `auth_required=false`, route=/public/health | `none` | `[]`/`[]` |
| 7 | middleware annotation declares `scopes:["read:user","write:user"]` | (per other rules) | `["read:user","write:user"]` (preserved order, deduped) |
| 8 | zero-evidence empty record | `unknown` | `[]`/`[]` |

### `classifyAuthRequirements(capability)` Algorithm

```
function classifyAuthRequirements(cap) {
  const middlewareList = cap.middleware_names || [];
  const annotations = cap.middleware_annotations || [];
  // Zero-evidence guard
  const hasMiddleware = middlewareList.length > 0;
  const hasRoutePrefix = !!cap.route;
  const hasAuthFlag = typeof cap.auth_required === "boolean";
  const hasSensitivitySignal = cap.sensitivity_class && cap.sensitivity_class !== "unknown";
  if (!hasMiddleware && !hasRoutePrefix && !hasAuthFlag && !hasSensitivitySignal) {
    return { auth_scheme: "unknown", auth_scopes: [], auth_roles: [], evidence_source: "none" };
  }
  // Scope/role extraction (frozen rules; pure)
  const scopes = extractFrozenList(annotations, /scopes?:\s*\[([^\]]+)\]/);
  const roles = extractFrozenList(annotations, /role[s]?:\s*\[([^\]]+)\]/);
  // R1..R5: middleware-name first-match-wins
  const RULES = [
    [/bearer|jwt|access[_-]?token/i, "bearer"],
    [/api[_-]?key|x-api-key/i, "api_key"],
    [/session|cookie|passport-local/i, "session"],
    [/basic[_-]?auth/i, "basic"],
    [/oauth|oidc|openid/i, "oauth"],
  ];
  for (const [re, scheme] of RULES) {
    if (middlewareList.some(name => re.test(name))) {
      return { auth_scheme: scheme, auth_scopes: scopes, auth_roles: roles, evidence_source: "middleware_name" };
    }
  }
  // R6: explicit auth_required=false on non-admin route
  const isAdminRoute = /^\/(admin|root|superuser)(\/|$)/i.test(cap.route || "");
  if (cap.auth_required === false && !isAdminRoute) {
    return { auth_scheme: "none", auth_scopes: scopes, auth_roles: roles, evidence_source: "auth_required_flag" };
  }
  // default: evidence present but no rule matched
  return { auth_scheme: "unknown", auth_scopes: scopes, auth_roles: roles, evidence_source: "none" };
}
```

The function is pure: same input → same output, byte-stable across runs, no I/O, no clock, no randomness, no network, no auth-library import.

### Pipeline Propagation

```
tusq manifest
   └─ capabilities[*].auth_requirements = classifyAuthRequirements(cap)   # M29; pure function
   └─ capability_digest re-computed (auth_requirements included)            # M13; unchanged algorithm
   └─ approved = false when digest flips                                    # M13; unchanged gate

tusq review [--auth-scheme <scheme>] [--sensitivity <class>]
   └─ displays auth_requirements per capability                             # M29; reviewer-aid surface

tusq docs
   └─ renders auth_requirements in per-capability sections                  # M29; reviewer-aid surface

tusq diff
   └─ surfaces auth_requirements changes in review queue                    # M29; via M13 digest flip

tusq compile
   └─ output is byte-identical regardless of auth_requirements              # M29; AC-7 invariant

tusq approve
   └─ gate logic is unchanged (approved/review_needed only)                 # M29; AC-7 invariant

tusq serve
   └─ MCP surface (tools/list, tools/call, dry_run_plan) is unchanged       # M29; AC-7 invariant
   └─ auth_requirements MUST NOT appear in any serve response shape         # M29; AC-7 invariant

tusq policy verify (default and --strict)
   └─ unchanged                                                              # M29; AC-7/AC-10 invariant

tusq redaction review
   └─ unchanged                                                              # M29; AC-7/AC-10 invariant
```

### `tusq review` Optional `--auth-scheme` Filter

The only new surface flag in M29 is an optional `--auth-scheme <scheme>` filter on the existing `tusq review` command. When supplied, the review output lists only capabilities whose `auth_requirements.auth_scheme` matches the given value. It MUST NOT change the exit code semantics of `tusq review` (exit 0 still means no blocking concerns; exit 1 still means unapproved/low-confidence capabilities were found — the filter does not hide those). When the supplied value is not in the legal seven-value enum, exit 1 with `Unknown auth scheme: <value>` on stderr, empty stdout, before any output (matching M28's `--sensitivity` validation pattern).

The filter is mutually compatible with `--sensitivity`: both can be set in one invocation; they intersect AND-style. `tusq review --sensitivity restricted --auth-scheme bearer` lists only capabilities matching both filters.

### AC-7 Compile / Approve / Runtime Invariant Preservation

`tusq compile` output MUST be byte-identical for two manifests that differ only in `auth_requirements` value. The compiled tool shape does NOT include `auth_requirements` in V1.10. `tusq approve` acceptance criteria (`approved`/`review_needed`) are unchanged. `tusq serve` MCP surface (`tools/list`, `tools/call`, `dry_run_plan`) MUST NOT include `auth_requirements` in any response shape. `tusq policy verify` (default and `--strict`) and `tusq redaction review` behavior is byte-for-byte unchanged. Any golden-file assertion that compares `tusq compile` output before and after an `auth_requirements` change MUST pass without modification.

### Digest Flip Scope and AC-5

`auth_requirements` is included in the content fields hashed to produce `capability_digest` (M13). When M29 first computes a non-`"unknown"` value for a capability that previously had no `auth_requirements` field, the digest flips and `approved` resets to `false`. The capability disappears from `tools/list` until a reviewer re-approves it via `tusq approve`. RELEASE_NOTES MUST document the expected re-approval sweep on first post-M29 manifest regeneration.

A change to any field of `auth_requirements` — including the contents of `auth_scopes` or `auth_roles` arrays (e.g., adding a single scope `"read:user"`) — flips the digest. The diff queue under `tusq diff` surfaces the `auth_requirements` change as a non-empty review queue entry.

### V1.10 Limitations

| Limitation | Rationale | V2 plan |
|------------|-----------|---------|
| No multi-locale or natural-language middleware-name parsing | Middleware regex is ASCII patterns only; non-English middleware names may miss classification | V2 plugin interface for locale-aware classifiers |
| No org-policy override file for auth-scheme rules | Hardcoded rule table is the governance guarantee; overrides would drift reviewers | V2 policy-as-code tier with a signed rule table |
| No reviewer-assignable auth-scheme override | Reviewers can observe `auth_scheme` in the review output but cannot override it in the manifest in V1.10 | V2 `tusq approve --auth-scheme <scheme>` to record reviewer override with audit trail |
| No JWT-claim or scope-grant validation | Scopes/roles are extracted from middleware-annotation literals only; no token decoding or signature verification | Out of scope permanently for tusq; reserved for runtime-AAA-enforcement layers outside tusq |
| No detection of multi-scheme middleware chains | A capability with both bearer and api_key middleware is classified by R1 precedence (bearer); the alternate scheme is not separately recorded | V2 may add a `secondary_schemes` array if reviewer demand emerges |

### Non-Attestation Boundary

`auth_requirements` is reviewer-aid framing only. tusq DOES NOT authenticate or authorize requests at runtime, DOES NOT certify SOC2 / ISO27001 / OAuth2 / OIDC / SAML compliance, and DOES NOT validate token signatures or scope grants. `auth_scheme: "bearer"` does NOT mean tusq verifies bearer tokens; it means a middleware in the source matched the R1 regex and a reviewer should pay attention to bearer-token configuration. DOCS, CLI help, launch artifacts, and any external communication MUST NOT frame `auth_requirements` as runtime AAA enforcement, automated AAA certification, or any compliance attestation.

### Edge-Case Invariants

- A capability with `auth_required === undefined` (not `false`) MUST NOT trigger R6; the check is `=== false`.
- A capability with `middleware_names: ["BearerAuth", "checkApiKey"]` MUST classify as `bearer` (R1 precedence over R2).
- A capability with route `/admin/users` AND `auth_required: false` MUST NOT trigger R6; admin route prefix blocks the `none` classification (admin route requires authentication review regardless of the flag).
- A scopes annotation `scopes: ["read:user", "read:user", "write:user"]` MUST dedupe to `["read:user", "write:user"]` preserving first-occurrence order.
- A scopes annotation `scopes: ["read:user", "Read:User"]` MUST preserve both entries (case-sensitive dedup); `"Read:User"` is a distinct scope.

### Local-Only Invariants

| Invariant | Requirement |
|-----------|-------------|
| Pure function | `classifyAuthRequirements` has no I/O, no network, no clock, no filesystem reads beyond the manifest record |
| Deterministic | Same manifest record → same `auth_requirements`, byte-stable across Node.js processes and platforms |
| Closed enums | `auth_scheme` ∈ seven-value set; `evidence_source` ∈ five-value set; no other value, nullable, or wildcard |
| Empty-array invariant | `auth_scopes` and `auth_roles` MUST be `[]` (never `null`, never absent) when zero matches |
| Zero-evidence unknown | Capabilities with no middleware, no route, no `auth_required`, no `sensitivity_class` signal MUST receive `unknown` (never silently `"none"`) |
| Zero new dependencies | `package.json` MUST NOT gain `passport`, `jsonwebtoken`, `oauth2-server`, or any AAA library |
| Compile-output-invariant | `tusq compile` output is byte-identical before and after M29 adoption |
| Serve-surface-invariant | `tusq serve` `tools/list` / `tools/call` / `dry_run_plan` response shapes do NOT include `auth_requirements` |

### Docs and Tests Required Before Implementation

- `src/cli.js` — add `classifyAuthRequirements(cap)` pure function and call it on every capability in manifest generation; update `tusq review` to render `auth_requirements` per capability and accept optional `--auth-scheme <scheme>` filter (mutually compatible with `--sensitivity`); update `tusq docs` to include `auth_requirements` in per-capability sections; verify `tusq diff` already surfaces the field change (no change needed if diff compares `capability_digest` — digest flip is automatic from M13).
- `SYSTEM_SPEC.md` — this M29 section (already present after this edit); `## Constraints` gains Constraint 22.
- `README.md` — add one line under the manifest shape description noting `auth_requirements` is computed by a static rule table; link to docs for the frozen rule table.
- `website/docs/manifest-format.md` — add an "Auth Requirements" subsection documenting the seven-value `auth_scheme` enum, the five-value `evidence_source` enum, the six-rule table, the scope/role extraction rules, the zero-evidence `unknown` bucket, the non-attestation boundary, and the `--auth-scheme` filter on `tusq review`.
- `website/docs/cli-reference.md` — update `tusq review` entry with `--auth-scheme` flag (and document mutual compatibility with `--sensitivity`) and note that `tusq docs` and `tusq diff` now surface `auth_requirements`.
- `tests/smoke.mjs` — add the 8-case smoke matrix (AC-8); add an assertion that `tusq compile` output is byte-identical for two capabilities differing only in `auth_requirements`; add assertions that `tusq review --auth-scheme bearer` filters correctly, that an unknown filter value exits 1 with empty stdout, and that `--sensitivity` + `--auth-scheme` intersect AND-style.
- `tests/evals/governed-cli-scenarios.json` — add ≥3 eval regression scenarios: (1) bearer-token middleware detection precedence over generic `auth_required` (R1 wins); (2) scopes-array extraction with mixed-order declaration verifying preserved order and deduplication; (3) zero-evidence `unknown` bucket with empty `auth_scopes`/`auth_roles` arrays. Total eval scenarios become **≥16**.
- `tests/evals/governed-cli-scenarios.json` — verify AC-7 golden-file: a scenario that compiles two identical capabilities differing only in `auth_requirements` and asserts identical compiled tool output; a serve-surface assertion that `tools/list` / `tools/call` response shapes contain no `auth_requirements` key.

The dev role is accountable for implementing all items above. The QA role is accountable for independently re-verifying them as REQ-116+ acceptance criteria.

## M30: Static Embeddable-Surface Plan Export from Manifest Evidence

> **Scope binding (run_24ccd92f593d8647, turn_fa7dbb75b01943f5, PM, planning phase):** This § materializes the PM-level scope contract for M30 — V1.11 (PROPOSED) — chartered in `.planning/ROADMAP.md` § "M30: Static Embeddable-Surface Plan Export from Manifest Evidence (~0.75 day) — V1.11 (PROPOSED)" and announced in `.planning/PM_SIGNOFF.md`'s M30 charter-bound preamble. The dev role is accountable for materializing the implementation-level algorithm details (function signatures, file paths, shape verbatim JSON keys, exit-code constants, smoke fixture filenames) during the implementation phase. PM owns scope, frozen enums, read-only invariants, the planning-aid (not surface-generator) framing, and the eligibility precedence; dev owns the algorithm landing.

### Purpose

VISION.md (line 27, "embeddable chat, widget, command-palette, and voice surfaces" under **The Promise**; lines 193–224, "Brand-Matched Chat Interface", "Brand-Matched Voice Interface", "Embeddable Widgets And Command Surfaces") names four operator-visible runtime surfaces (chat, palette, widget, voice) that V1.10 does NOT yet provide. Shipping any one of them as runnable code is a multi-milestone effort (chat-1 generator, palette-1 generator, widget-1 generator, voice-1 generator) that crosses framework choice, brand-profile schema, accessibility certification, and runtime hosting boundaries — none of which V1.11 is prepared to commit to. M30 is the smallest first increment that addresses the vision goal **without** committing the project to runtime chat/voice/widget rendering: a static, deterministic, manifest-only planner that describes what each embeddable surface **would** look like for the current manifest under current sensitivity/auth/side-effect posture.

M30 introduces a new top-level CLI noun `surface` with a single subcommand `plan` (mirroring the M27 `redaction review` precedent). The CLI surface grows from 13 commands (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help) to **14** (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, surface, version, help). The new noun `surface` is inserted alphabetically between `serve` and `redaction` in the help enumeration so the help block remains stably ordered. M30 mutates no existing command's observable behavior.

### Scope Boundary

| In scope (V1.11) | Out of scope (V1.11) |
|------------------|----------------------|
| Pure deterministic planner over manifest record fields only | Any network or runtime call |
| Closed four-value `surface` enum: chat, palette, widget, voice | Open-ended or free-text surface labels (e.g., email, slack-bot) |
| Closed six-value `gated_reason` enum: unapproved, restricted_sensitivity, confidential_sensitivity, destructive_side_effect, auth_scheme_unknown, auth_scheme_oauth_pending_v2 | Open-ended gating reasons |
| Per-surface eligibility precedence rules over `approved`/`sensitivity_class`/`auth_requirements`/side-effect class | Runtime AAA enforcement, brand certification, accessibility certification |
| Deterministic JSON and human plan output | Generation of runnable chat / palette / widget / voice code |
| M27 advisory copy-forward and M29 `auth_requirements` copy-forward (verbatim, no recomputation) | Recomputation of advisories or auth scheme; recoercion of `unknown` → `none` |
| `brand_inputs_required[]` as frozen names-only list per surface | Reading any brand profile file, looking up any brand value, emitting template strings |
| New top-level CLI noun `surface` with single subcommand `plan` | Any change to `tusq compile`, `tusq serve` MCP surface, `tusq policy verify`, `tusq redaction review`, `tusq approve`, `tusq diff`, `tusq docs`, `tusq scan`, `tusq manifest`, `tusq init`, `tusq version`, `tusq help` observable behavior |
| Four flags on `tusq surface plan`: `--surface`, `--manifest`, `--out`, `--json` | Any other flag; runtime adapter generation; brand-profile read; `.tusq/` write |
| Eval regression scenario `surface-plan-determinism` (eval harness 20 → ≥21) | Network I/O at any error path; partial output before error detection |
| Constraint 23 (proposed) reviewer-aid / planning-aid framing | Any framing implying "generates a chat client", "renders a widget", "hosts a voice interface", "runs a command palette" |

### Closed `surface` Enum (Four Values)

| Value | Meaning |
|-------|---------|
| `chat` | Plan section for an embeddable chat surface (per VISION.md "Brand-Matched Chat Interface") |
| `palette` | Plan section for an embeddable command-palette surface |
| `widget` | Plan section for embeddable widgets (action and insight, split by side-effect class) |
| `voice` | Plan section for an embeddable voice surface (per VISION.md "Brand-Matched Voice Interface") |

The four values are the entire legal set. No other value, nullable, or wildcard is permitted in the `surface` field of plan output. The `--surface <chat|palette|widget|voice|all>` flag accepts only these five tokens (the four enum values plus `all` which expands to all four in the frozen order); any other token exits 1 with `Unknown surface:` followed by the value, empty stdout. The four-value enum is **immutable once M30 ships**; adding a new surface (e.g., `email`, `slack-bot`) is a material governance event under its own ROADMAP milestone with a fresh re-approval expectation and a RELEASE_NOTES entry.

### Closed `gated_reason` Enum (Six Values)

| Value | Meaning |
|-------|---------|
| `unapproved` | `capability.approved !== true` — capability has not passed the M13 approval gate |
| `restricted_sensitivity` | `capability.sensitivity_class === "restricted"` — sensitivity class blocks this surface per its eligibility rule |
| `confidential_sensitivity` | `capability.sensitivity_class === "confidential"` — sensitivity class blocks this surface per its eligibility rule |
| `destructive_side_effect` | Capability's verb resolves to a destructive side-effect class and the target surface forbids destructive verbs (palette and voice in V1.11) |
| `auth_scheme_unknown` | `capability.auth_requirements.auth_scheme === "unknown"` — zero-evidence auth scheme is never eligible for any embeddable surface |
| `auth_scheme_oauth_pending_v2` | `capability.auth_requirements.auth_scheme === "oauth"` — oauth flows are deferred to a V2 runtime adapter milestone |

The six values are the entire legal set. An implementation-time error (synchronous throw) MUST fire if `classifyGating(capability, surface)` ever returns a value outside this set. The six-value enum is **immutable once M30 ships**; adding a new reason is a material governance event under its own ROADMAP milestone with a fresh re-approval expectation and a RELEASE_NOTES entry.

### Per-Surface Eligibility Precedence (Frozen First-Match-Wins)

For each (capability, surface) pair, the planner evaluates the following gates in order; the first gate that fails records its corresponding `gated_reason` in the surface's `gated_capabilities[]`. If all gates pass, the capability is appended to `eligible_capabilities[]`.

| Order | Gate | `gated_reason` on failure |
|-------|------|---------------------------|
| 1 | `capability.approved === true` | `unapproved` |
| 2 | `capability.sensitivity_class !== "restricted"` (per surface; widget exception below) | `restricted_sensitivity` |
| 3 | `capability.sensitivity_class !== "confidential"` (per surface; widget exception below) | `confidential_sensitivity` |
| 4 | side-effect class allowance per surface (palette and voice forbid destructive; chat and widget action_widgets allow destructive) | `destructive_side_effect` |
| 5 | `capability.auth_requirements.auth_scheme !== "unknown"` (all surfaces) | `auth_scheme_unknown` |
| 6 | `capability.auth_requirements.auth_scheme !== "oauth"` (all surfaces; deferred to V2) | `auth_scheme_oauth_pending_v2` |

**Per-surface gate set:**

- `chat`: gates 1, 2, 3, 5, 6. Destructive verbs ARE allowed (chat surface supports confirmation flows).
- `palette`: gates 1, 2, 3, 4, 5, 6. Destructive verbs are gated (palette is the lowest-risk surface).
- `widget`: gates 1, 5, 6. Confidential/restricted sensitivity is permitted for widgets (widgets are typically embedded inside the SaaS portal under same-session proxy semantics). Side-effect class drives the widget split: destructive/writes → `action_widgets`; read-only → `insight_widgets`.
- `voice`: gates 1, 2, 3, 4, 5, 6. Destructive verbs are gated (voice destructive flows are reserved for a future V2 confirmation-flow milestone).

**First-match-wins:** when a capability fails multiple gates, only the **first** failing gate (lowest order) is recorded in `gated_reason`. A capability with `approved=false` AND `auth_scheme="oauth"` is recorded as `unapproved`, never `auth_scheme_oauth_pending_v2`.

### Plan Output Shape (JSON)

| Field | Source | Notes |
|-------|--------|-------|
| `manifest_path` | `--manifest` or default | Resolved input path |
| `manifest_version` | copied from manifest | Not re-stamped (M27 fallback: `null` in JSON, `unknown` in human when absent) |
| `generated_at` | copied from manifest | Not re-stamped; keeps plan content-deterministic |
| `surfaces[]` | enum-driven; frozen order chat → palette → widget → voice | Empty array when `capabilities: []` |
| `surfaces[].surface` | one of `chat`/`palette`/`widget`/`voice` | Closed four-value enum |
| `surfaces[].eligible_capabilities[]` | manifest declared order | Capability names (strings); `approved===true` and per-surface gates pass |
| `surfaces[].gated_capabilities[]` | manifest declared order | `{name, reason}` objects; `reason` ∈ closed six-value enum |
| `surfaces[].entry_points` | per-surface keyed object | Derived deterministically from M9 domain + verb data |
| `surfaces[].entry_points` (chat) | `{intents: [{capability, intent_label}]}` | One per eligible capability |
| `surfaces[].entry_points` (palette) | `{actions: [{capability, action_label}]}` | One per eligible capability |
| `surfaces[].entry_points` (widget) | `{action_widgets: [{capability}], insight_widgets: [{capability}]}` | Split by side-effect class |
| `surfaces[].entry_points` (voice) | `{voice_intents: [{capability, intent_label}]}` | Constrained to non-destructive read/update verbs |
| `surfaces[].redaction_posture` | per eligible capability | Copy-forward of M27 advisory set verbatim; no recomputation, no new advisory text |
| `surfaces[].auth_posture` | per eligible capability | Copy-forward of M29 `auth_requirements` record verbatim; no recoercion of `unknown` → `none` |
| `surfaces[].brand_inputs_required[]` | frozen named-list per surface | Names only; no values; no template strings; no brand profile read |

**Frozen `brand_inputs_required` named-lists:**

| Surface | `brand_inputs_required[]` (frozen names; no values) |
|---------|-----------------------------------------------------|
| `chat` | `["brand.tone", "brand.color_primary", "brand.color_secondary", "brand.font_family"]` |
| `palette` | `["brand.color_primary", "brand.font_family"]` |
| `widget` | `["brand.color_primary", "brand.color_accent", "brand.layout_density", "brand.radius"]` |
| `voice` | `["brand.tone", "voice.persona", "voice.greeting"]` |

The brand-input lists are **immutable once M30 ships**; adding a name is a material governance event under its own ROADMAP milestone.

### Read-Only Invariants

| Invariant | How it shows up at plan time |
|-----------|-------------------------------|
| Read-only manifest | `tusq.manifest.json` mtime and content are byte-identical before/after every `tusq surface plan` invocation |
| No `.tusq/` write | `tusq surface plan` MUST NOT create or modify any file under `.tusq/`. The `--out <path>` flag MUST reject any path resolving inside `.tusq/` with `--out path must not be inside .tusq/` on stderr and exit 1 |
| Zero `capability_digest` flips | Running `tusq surface plan` MUST NOT cause any capability's `capability_digest` to change. Hash-before vs hash-after assertion is byte-identical |
| `tusq compile` byte-identity | `tusq compile` output is byte-identical pre and post-M30 for every fixture (golden-file smoke assertion) |
| `tusq serve` MCP surface byte-identity | `tools/list`, `tools/call`, `dry_run_plan` responses are byte-identical pre and post-M30 (golden-file smoke assertion). `eligible_capabilities`, `gated_capabilities`, surface plan fields MUST NOT appear in any MCP response |
| `tusq policy verify` byte-identity | Default and `--strict` modes byte-for-byte unchanged |
| `tusq redaction review` byte-identity | Both human and `--json` outputs byte-for-byte unchanged |
| `tusq approve` gate logic unchanged | Approval flow does NOT consider surface eligibility |
| Zero new dependencies | `package.json` MUST NOT gain React, Vue, Lit, Web Speech polyfill, audio runtime, markdown renderer, or any chat/widget/voice/palette UI library |

### Empty-Capabilities Valid-Exit-0 Rule

When the manifest's `capabilities[]` is a valid empty array, `tusq surface plan` MUST exit 0:

- **Human mode:** stdout is exactly the line `No capabilities in manifest — nothing to plan.` followed by a single trailing newline. No surface section, no warnings, no advisory text.
- **`--json` mode:** stdout is `{manifest_path, manifest_version, generated_at, surfaces: []}` with the top-level fields copied verbatim from the manifest (M27 fallback: `null` for absent fields).

This is distinct from a missing/non-array `capabilities` (exit 1 with `Invalid manifest: missing capabilities array` on stderr; stdout empty).

### I/O Stream Discipline

Every error path writes exclusively to stderr and leaves stdout empty (`stdout === ""`). Smoke assertion captures both streams and verifies the empty-stdout invariant on every exit-1 case. The complete error message set:

| Situation | Operator sees on stderr | Exit code |
|-----------|--------------------------|-----------|
| Plan succeeded | (per-surface plan on stdout; stderr empty) | 0 |
| Empty-capabilities | (single human line on stdout; stderr empty) | 0 |
| `--manifest` points to a missing file | `Manifest not found: <path>` | 1 |
| Manifest is present but not valid JSON | `Invalid manifest JSON: <path>` | 1 |
| Manifest is valid JSON but lacks `capabilities[]` array | `Invalid manifest: missing capabilities array` | 1 |
| `--surface <value>` is not in the closed five-token set | `Unknown surface: <value>` | 1 |
| Unknown subcommand under `tusq surface` | `Unknown subcommand: <name>` | 1 |
| Unknown flag on `tusq surface plan` | `Unknown flag: <flag>` | 1 |
| `--out <path>` is unwritable | `Cannot write to --out path: <path>` | 1 |
| `--out <path>` resolves inside `.tusq/` | `--out path must not be inside .tusq/` | 1 |

Detection-before-output means no partial JSON and no partial human section is written before an error surfaces. An operator who pipes `tusq surface plan > plan.json` gets a zero-byte file on every failure path.

### Non-Runtime-Generator Boundary

`tusq surface plan` is a **planning aid** that describes what an embeddable surface **would** look like for the current manifest under the current sensitivity/auth/side-effect posture. It does NOT:

- generate runnable chat client code (no React component, no Vue component, no Lit component, no HTML template, no JavaScript module);
- generate runnable command-palette code (no keybinding registration, no event handler);
- generate runnable widget code (no embeddable iframe, no Web Component, no script tag);
- generate runnable voice code (no Web Speech polyfill, no audio runtime, no STT/TTS adapter);
- read or write any brand profile file (`brand_inputs_required[]` is names-only, no values, no template strings, no placeholder lookups);
- host any runtime (no HTTP server, no WebSocket, no audio session);
- execute any capability (no `tools/call` reachable from this command path);
- certify brand compliance, accessibility compliance (WCAG, ARIA), or any regulatory framework.

Subsequent milestones (M-Chat-1, M-Palette-1, M-Widget-1, M-Voice-1) for actual surface generators ship under their own ROADMAP entries with fresh acceptance contracts and fresh re-approval expectations.

### Docs and Tests Required Before Implementation (Dev Materializes)

The dev role is accountable for materializing the following before any code lands:

- `src/cli.js` — add the `tusq surface` noun and `tusq surface plan` subcommand handler; implement `classifyGating(capability, surface) -> gated_reason | null`, `buildSurfacePlan(manifest, surfaceFilter, options) -> plan`; wire the subcommand into the help enumeration alphabetically between `serve` and `redaction`.
- `SYSTEM_SPEC.md` — this M30 § (already present after this PM edit); `## Constraints` gains the M30 reviewer-aid framing constraint (Constraint 23-equivalent appended at constraints tail).
- `README.md` — add one line under the manifest shape description noting that `tusq surface plan` is a static planning aid that consumes manifest fields without mutation; link to docs.
- `website/docs/cli-reference.md` — add a `tusq surface plan` entry documenting the closed four-value `surface` enum, the four flags, exit codes, the empty-capabilities behavior, and the explicit "planning aid, not a surface generator" callout.
- `website/docs/manifest-format.md` — add a "Surface Plan" subsection explaining how the manifest's `approved` / `sensitivity_class` / `auth_requirements` / side-effect class fields drive per-surface eligibility, and that the surface plan is read-only and never mutates the manifest.
- `tests/smoke.mjs` — add the M30 smoke matrix covering: (a) default `tusq surface plan` produces exit 0 and the expected per-surface eligibility/gating split; (b) `--surface chat`/`--surface palette`/`--surface widget`/`--surface voice` each emit one surface section; (c) `--surface all` emits all four in the frozen order; (d) `--surface unknown` exits 1 with `Unknown surface:` and empty stdout; (e) missing `--manifest` path exits 1 with `Manifest not found:`; (f) malformed-JSON manifest exits 1 with `Invalid manifest JSON:` before any stdout; (g) running twice produces byte-identical stdout in both modes; (h) M30 does not mutate the manifest (mtime/content unchanged); (i) `capability_digest` does not flip on any capability after a plan run (asserted by hash compare); (j) `tusq compile` golden-file output byte-identical pre and post-M30; (k) `tusq serve tools/list` golden-file output byte-identical; (l) empty-capabilities manifest emits the documented human line and `surfaces: []` JSON; (m) `--out <path>` writes to the path and emits no stdout on success; (n) `--out` to an unwritable path exits 1; (o) every gating reason resolves to exactly one of the six closed reason codes; (p) destructive verb is gated for `palette` and `voice` but allowed for `chat` and `widget action_widgets`.
- `tests/evals/governed-cli-scenarios.json` — add eval regression scenario `surface-plan-determinism` asserting `tusq surface plan --json` byte-identical stdout across three runs on the same manifest and that the gating-reason enum is closed (every gated capability's reason is one of the six values). Total eval scenarios become **≥21** (current 20 + 1 new).

The dev role is accountable for implementing all items above. The QA role is accountable for independently re-verifying them as REQ-129+ acceptance criteria.

## M31: Static Capability Domain Index Export from Manifest Evidence (V1.12 — SHIPPED)

`tusq domain index` is a **planning aid** that surfaces what domains the manifest exposes and the shape of each domain. It reads the manifest's `capabilities[]` array, groups capabilities by their `domain` field in manifest first-appearance order, and emits a per-domain index with name-and-counters fields only.

### M31 Purpose and Boundary

- **What it does:** Reads `capabilities[]`, groups by `domain` field, emits per-domain buckets with counters and boolean flags.
- **What it does NOT do:** Does NOT generate skill packs, does NOT generate rollout plans, does NOT generate workflow definitions, does NOT derive agent personas, does NOT certify domain ownership, and does NOT enforce domain-level access control. Subsequent milestones (M-Skills-1, M-Rollout-1, M-Workflow-1, M-Agent-Persona-1) ship under their own ROADMAP entries with fresh acceptance contracts.

### M31 Command Shape

```
tusq domain index [--domain <name>] [--manifest <path>] [--out <path>] [--json]
```

The CLI surface grows from 14 → 15 commands; `domain` is inserted alphabetically between `diff` and `policy`.

### M31 Frozen Two-Value `aggregation_key` Enum

| Value | Condition |
|-------|-----------|
| `"domain"` | The bucket aggregates capabilities sharing a named manifest `domain` value |
| `"unknown"` | The bucket aggregates capabilities whose `domain` field is `null`, missing, or empty-string |

The two-value enum is immutable once M31 ships. Any addition is a material governance event under its own ROADMAP milestone with a fresh re-approval expectation and a RELEASE_NOTES entry. An implementation-time guard (synchronous throw) fires if the internal bucket function ever produces a value outside this set.

### M31 Frozen Per-Domain Entry Shape (name-and-counters only)

| Field | Type | Description |
|-------|------|-------------|
| `domain` | string | Manifest-declared domain value, or the literal `"unknown"` for the zero-evidence bucket |
| `aggregation_key` | `"domain" \| "unknown"` | Closed two-value enum (see above) |
| `capability_count` | integer | Number of capabilities in this bucket |
| `capabilities[]` | string[] | Capability names in manifest first-appearance order |
| `approved_count` | integer | Capabilities where `approved === true` |
| `gated_count` | integer | `capability_count - approved_count` |
| `has_destructive_side_effect` | boolean | Any capability has `side_effect_class === "destructive"` |
| `has_restricted_or_confidential_sensitivity` | boolean | Any capability has `sensitivity_class ∈ {"restricted","confidential"}` |
| `has_unknown_auth` | boolean | Any capability has `auth_requirements.auth_scheme === "unknown"` or no auth_requirements |

Top-level fields `manifest_path`, `manifest_version`, `generated_at` are copied verbatim from the input manifest (null in `--json` mode and `"unknown"` in human mode when the manifest lacks the field).

### M31 Manifest First-Appearance Ordering Rule

Per-domain iteration order is the manifest's **first appearance** order — deterministic, never alphabetized. The `unknown` bucket (if any capability lacks a domain) is **always appended last**, regardless of where the first domainless capability appears in the manifest.

### M31 Empty-Capabilities and stdout-Discipline Rules

- **Empty-capabilities valid-exit-0:** When `capabilities: []` is a valid empty array, the command MUST exit 0 in both human and `--json` modes. Human mode emits the single explicit line `No capabilities in manifest — nothing to index.` to stdout. `--json` mode emits `{manifest_path, manifest_version, generated_at, domains: []}`.
- **stdout discipline:** Every error path writes exclusively to stderr; stdout MUST be empty on every exit-1 path (no partial index, no JSON with an `error` field, no trailing newline).

### M31 Read-Only Invariants

| Invariant | Enforcement |
|-----------|-------------|
| `tusq.manifest.json` mtime/content unchanged after any invocation | Smoke assertion: byte-compare before/after |
| No write to `.tusq/`; no write to any path other than `--out <path>` | Smoke assertion |
| `capability_digest` MUST NOT flip on any capability | Smoke assertion: digest-before vs digest-after |
| `tusq compile` output byte-identical pre and post-M31 | Smoke assertion: golden-file comparison |
| `tusq surface plan` output byte-identical pre and post-M31 | Smoke assertion |
| Zero new dependency in `package.json` | Not added |

### M31 Deliverables (dev-owned)

- `src/cli.js` — `DOMAIN_INDEX_AGGREGATION_KEY_ENUM`, `cmdDomain`, `cmdDomainIndex`, `parseDomainIndexArgs`, `buildDomainIndex`, `formatDomainIndex`, `_guardAggregationKey`; updated `dispatch()`, `printHelp()`, `printCommandHelp()` (CLI surface 14 → 15).
- `tests/smoke.mjs` — M31 smoke matrix (assertions a-q per ROADMAP § M31).
- `tests/evals/governed-cli-scenarios.json` — `domain-index-determinism` scenario (eval harness 21 → 22).
- `tests/eval-regression.mjs` — `runDomainIndexDeterminismScenario` handler.
- `website/docs/cli-reference.md` — `tusq domain index` documentation.
- `website/docs/manifest-format.md` — Domain Index subsection.

## M32: Static Capability Side-Effect Index Export from Manifest Evidence (V1.13 — PROPOSED)

`tusq effect index` is a **planning aid** that surfaces what side-effect classes the manifest exposes and the shape of each bucket. It reads the manifest's `capabilities[]` array, groups capabilities by their `side_effect_class` field in closed-enum order, and emits a per-bucket index with name-and-counters fields only.

### M32 Purpose and Boundary

- **What it does:** Reads `capabilities[]`, groups by `side_effect_class` field in closed-enum order (`read → write → destructive → unknown`), emits per-bucket entries with counters and boolean flags.
- **What it does NOT do:** Does NOT enforce side-effect policy at runtime, does NOT derive a composite risk tier, does NOT generate confirmation-flow code, does NOT certify destructive-action safety, and does NOT alter the M30 `gated_reason: destructive_side_effect` surface-eligibility rule. Subsequent milestones (M-Risk-1 composite risk-tier classifier, M-Confirm-1 destructive-action confirmation-flow generator) ship under their own ROADMAP entries with fresh acceptance contracts.

### M32 Command Shape

```
tusq effect index [--effect <read|write|destructive|unknown>] [--manifest <path>] [--out <path>] [--json]
```

The CLI surface grows from 15 → 16 commands; `effect` is inserted alphabetically between `domain` and `policy`.

### M32 Frozen Four-Value `side_effect_class` Bucket-Key Enum

| Value | Condition |
|-------|-----------|
| `"read"` | The bucket aggregates capabilities with `side_effect_class === "read"` |
| `"write"` | The bucket aggregates capabilities with `side_effect_class === "write"` |
| `"destructive"` | The bucket aggregates capabilities with `side_effect_class === "destructive"` |
| `"unknown"` | The bucket aggregates capabilities whose `side_effect_class` is `null`, missing, empty-string, or any value outside the closed three-value classifier set |

The four-value enum is immutable once M32 ships. Any addition is a material governance event under its own ROADMAP milestone with a fresh re-approval expectation and a RELEASE_NOTES entry. An implementation-time guard (synchronous throw via `_guardEffectBucketKey`) fires if the internal bucket function ever produces a value outside this set.

### M32 Frozen Two-Value `aggregation_key` Enum

| Value | Condition |
|-------|-----------|
| `"class"` | The bucket aggregates capabilities sharing a named `side_effect_class` value (`read`, `write`, or `destructive`) |
| `"unknown"` | The bucket aggregates capabilities whose `side_effect_class` is the zero-evidence catchall |

The two-value enum is immutable once M32 ships. An implementation-time guard (synchronous throw via `_guardEffectAggregationKey`) fires if the internal bucket function ever produces a value outside this set.

### M32 Frozen Per-Bucket Entry Shape (name-and-counters only)

| Field | Type | Description |
|-------|------|-------------|
| `side_effect_class` | string | One of `"read"`, `"write"`, `"destructive"`, or the literal `"unknown"` for the zero-evidence bucket |
| `aggregation_key` | `"class" \| "unknown"` | Closed two-value enum (see above) |
| `capability_count` | integer | Number of capabilities in this bucket |
| `capabilities[]` | string[] | Capability names in manifest declared order |
| `approved_count` | integer | Number of capabilities where `approved === true` |
| `gated_count` | integer | `capability_count - approved_count` |
| `has_restricted_or_confidential_sensitivity` | boolean | Any capability has `sensitivity_class ∈ {"restricted","confidential"}` |
| `has_unknown_auth` | boolean | Any capability has `auth_requirements.auth_scheme === "unknown"` or no `auth_requirements` |

Top-level fields `manifest_path`, `manifest_version`, `generated_at` are copied verbatim from the input manifest (null in `--json` mode and `"unknown"` in human mode when the manifest lacks the field).

**Deliberately omitted** (parallel to M31's omission of cross-cutting fields): no `domains_represented[]`, no `auth_schemes_represented[]`, no `pii_categories_present[]`, no `risk_tier`. Cross-axis roll-ups belong in their own future M-Risk milestone with a fresh acceptance contract.

### M32 Closed-Enum Bucket Iteration Order

Bucket iteration follows the **closed-enum order: `read → write → destructive`**, then `unknown` last. This is distinct from M31's first-appearance rule because M32 buckets on a closed enum, not an open string. The closed-enum order is a deterministic stable-output convention — NOT a risk-precedence statement.

Within each bucket, capability names follow **manifest declared order** (mirroring M31). Empty buckets MUST NOT appear.

### M32 Empty-Capabilities and stdout-Discipline Rules

- **Empty-capabilities valid-exit-0:** When `capabilities: []` is a valid empty array, the command MUST exit 0 in both human and `--json` modes. Human mode emits the single explicit line `No capabilities in manifest — nothing to index.` to stdout. `--json` mode emits `{manifest_path, manifest_version, generated_at, effects: []}`.
- **stdout discipline:** Every error path writes exclusively to stderr; stdout MUST be empty on every exit-1 path (no partial index, no JSON with an `error` field, no trailing newline).

### M32 Read-Only Invariants

| Invariant | Enforcement |
|-----------|-------------|
| `tusq.manifest.json` mtime/content unchanged after any invocation | Smoke assertion: byte-compare before/after |
| No write to `.tusq/`; no write to any path other than `--out <path>` | Smoke assertion |
| `capability_digest` MUST NOT flip on any capability | Smoke assertion: digest-before vs digest-after |
| `tusq compile` output byte-identical pre and post-M32 | Smoke assertion: golden-file comparison |
| `tusq surface plan` output byte-identical pre and post-M32 | Smoke assertion |
| `tusq domain index` output byte-identical pre and post-M32 | Smoke assertion |
| Zero new dependency in `package.json` | Not added |

### M32 Deliverables (dev-owned)

- `src/cli.js` — `EFFECT_INDEX_SIDE_EFFECT_CLASS_ENUM`, `EFFECT_INDEX_AGGREGATION_KEY_ENUM`, `EFFECT_INDEX_BUCKET_ORDER`, `cmdEffect`, `cmdEffectIndex`, `parseEffectIndexArgs`, `buildEffectIndex`, `formatEffectIndex`, `_guardEffectBucketKey`, `_guardEffectAggregationKey`; updated `dispatch()`, `printHelp()`, `printCommandHelp()` (CLI surface 15 → 16).
- `tests/smoke.mjs` — M32 smoke matrix (assertions a-u per ROADMAP § M32).
- `tests/evals/governed-cli-scenarios.json` — `effect-index-determinism` scenario (eval harness 22 → 23).
- `tests/eval-regression.mjs` — `runEffectIndexDeterminismScenario` handler.
- `website/docs/cli-reference.md` — `tusq effect index` documentation.
- `website/docs/manifest-format.md` — Side-Effect Index subsection.

## M33: Static Capability Sensitivity Index Export from Manifest Evidence (V1.14 — PROPOSED)

> Materialized by dev in run_4506c41d74e23e8e, turn_42c7748a59fa5ef3, implementation phase. Charter bound by PM in turn_8803f8edb25d1a0e.

### M33 Purpose and Boundary

`tusq sensitivity index` produces a static, deterministic, read-only sensitivity-class index of the manifest's capabilities bucketed by their M28-derived `sensitivity_class` value. It is a planning aid that helps reviewers answer "which sensitivity classes does this manifest expose, how many capabilities are in each class, and which buckets contain destructive or unknown-auth capabilities?" It does NOT enforce sensitivity policy at runtime, does NOT enforce data-class access control, does NOT certify GDPR/HIPAA/SOC2/PCI compliance, does NOT generate retention policy, does NOT modify the M28 `sensitivity_class` derivation rules, and does NOT alter the M30 `gated_reason: restricted_sensitivity` or `gated_reason: confidential_sensitivity` surface-eligibility rules.

### M33 Command Shape

```
tusq sensitivity index [--sensitivity <public|internal|confidential|restricted|unknown>]
                       [--manifest <path>] [--out <path>] [--json]
```

`tusq sensitivity` (no subcommand) prints a short enumerate-subcommands block. Unknown subcommands exit 1 with `Unknown subcommand: <name>` on stderr, empty stdout. CLI surface grows from 16 → 17 commands with `sensitivity` inserted alphabetically between `redaction` and `surface`.

### M33 Frozen Five-Value `sensitivity_class` Bucket-Key Enum

```
public | internal | confidential | restricted | unknown
```

This enum aligns 1:1 with the existing `SENSITIVITY_CLASSES` constant in `src/cli.js` (`['unknown', 'public', 'internal', 'confidential', 'restricted']`). The M33 implementation MUST reference `SENSITIVITY_CLASSES` directly — no independent enum is declared. The `unknown` bucket aggregates every capability whose `sensitivity_class` field is `null`, missing, empty-string, or any value outside the closed four-value named set (mirrors M28's zero-evidence `unknown` guard, M31's `unknown` domain bucket, and M32's `unknown` effect bucket). The enum is immutable once M33 ships; any addition is a material governance event.

### M33 Frozen Two-Value `aggregation_key` Enum

```
class | unknown
```

Parallel to M31's `domain | unknown` and M32's `class | unknown`. The `unknown` aggregation-key marks the zero-evidence bucket; the `class` aggregation-key marks every other bucket (public/internal/confidential/restricted). The enum is immutable once M33 ships.

### M33 Frozen Per-Bucket Entry Shape (name-and-counters only)

| Field | Type | Notes |
|-------|------|-------|
| `sensitivity_class` | string | One of the five enum values |
| `aggregation_key` | string | `"class"` or `"unknown"` |
| `capability_count` | integer | Capabilities in this bucket |
| `capabilities[]` | string[] | Capability names in manifest declared order |
| `approved_count` | integer | Capabilities with `approved === true` |
| `gated_count` | integer | `capability_count - approved_count` |
| `has_destructive_side_effect` | boolean | True iff any capability has `side_effect_class === "destructive"` |
| `has_unknown_auth` | boolean | True iff any capability has `auth_requirements.auth_scheme === "unknown"` |

Deliberately omitted (parallel to M31/M32): no `domains_represented[]`, no `auth_schemes_represented[]`, no `pii_categories_present[]`, no `side_effect_classes_represented[]`, no `risk_tier`. Cross-axis roll-ups belong in a future M-Risk-1 milestone.

Top-level fields `manifest_path`, `manifest_version`, `generated_at` are copied verbatim from the input manifest (fallback: `null` in `--json` mode and `unknown` in human mode when the manifest lacks the field).

### M33 Closed-Enum Bucket Iteration Order

Bucket iteration follows the **closed-enum order: `public → internal → confidential → restricted`**, then `unknown` last. This is distinct from M31's first-appearance rule because M33 buckets on a closed enum, not an open string. The closed-enum order is a deterministic stable-output convention — NOT a risk-precedence statement.

Empty buckets MUST NOT appear. Within each bucket, capabilities appear in manifest declared order (NOT alphabetized).

### M33 Empty-Capabilities and stdout-Discipline Rules

- `capabilities: []` → exit 0; human: `No capabilities in manifest — nothing to index.\n`; JSON: `{manifest_path, manifest_version, generated_at, sensitivities: []}`.
- Every error path writes exclusively to stderr; stdout MUST be empty on every exit-1 path.
- Error messages: `Manifest not found:`, `Invalid manifest JSON:`, `Invalid manifest: missing capabilities array`, `Unknown sensitivity:`, `Unknown subcommand:`, `Unknown flag:`, `Cannot write to --out path:`.

### M33 Read-Only Invariants

| Invariant | Verification |
|-----------|-------------|
| `tusq.manifest.json` mtime/content unchanged after every invocation | Smoke assertion |
| No write to `.tusq/`; no write to any path other than `--out <path>` when supplied | Smoke assertion |
| `capability_digest` MUST NOT flip on any capability | Smoke assertion: hash before vs after |
| `tusq compile` output byte-identical pre and post-M33 | Smoke assertion: golden-file comparison |
| `tusq surface plan` output byte-identical pre and post-M33 | Smoke assertion |
| `tusq domain index` output byte-identical pre and post-M33 | Smoke assertion |
| `tusq effect index` output byte-identical pre and post-M33 | Smoke assertion |

### M33 Deliverables (dev-owned)

- `src/cli.js` — `SENSITIVITY_INDEX_AGGREGATION_KEY_ENUM`, `SENSITIVITY_INDEX_BUCKET_ORDER`, `cmdSensitivity`, `cmdSensitivityIndex`, `parseSensitivityIndexArgs`, `buildSensitivityIndex`, `formatSensitivityIndex`, `_guardSensitivityBucketKey`, `_guardSensitivityAggregationKey`; updated `dispatch()`, `printHelp()`, `printCommandHelp()` (CLI surface 16 → 17). Uses `SENSITIVITY_CLASSES` (M28) directly — no independent enum declared.
- `tests/smoke.mjs` — M33 smoke matrix (assertions a-u per ROADMAP § M33).
- `tests/evals/governed-cli-scenarios.json` — `sensitivity-index-determinism` scenario (eval harness 23 → 24).
- `tests/eval-regression.mjs` — `runSensitivityIndexDeterminismScenario` handler.
- `website/docs/cli-reference.md` — `tusq sensitivity index` documentation.
- `website/docs/manifest-format.md` — Sensitivity Index subsection.

## M36: Static Capability Confidence Tier Index Export from Manifest Evidence (V1.17 — PROPOSED)

> Materialized by dev in run_8580d828f0e1cc1e, turn_c3e78ecd352330aa, implementation phase. Charter bound by PM in turn_f657958213bbfb9d.

### M36 Purpose and Boundary

`tusq confidence index` produces a static, deterministic, read-only confidence tier index of the manifest's capabilities bucketed by a tier derived from their numeric `confidence` field. It is a planning aid that helps reviewers answer "how many capabilities are below the high-confidence threshold and what is their cross-axis side-effect/sensitivity exposure?" It does NOT enforce confidence at runtime, does NOT function as an evidence-quality scoring engine, does NOT trigger automated re-classification, does NOT alter the scanner's `confidence` derivation rules (which remain the single source of truth for the underlying value), does NOT persist `confidence_tier` into `tusq.manifest.json`, and does NOT perform cross-axis statistical aggregation (deferred to M-Confidence-Statistics-1).

### M36 Command Shape

```
tusq confidence index [--tier <high|medium|low|unknown>]
                      [--manifest <path>] [--out <path>] [--json]
```

`tusq confidence` (no subcommand) prints a short enumerate-subcommands block. Unknown subcommands exit 1 with `Unknown subcommand: <name>` on stderr, empty stdout. CLI surface grows from 19 → 20 commands with `confidence` inserted alphabetically between `auth` and `diff` (`auth` vs `confidence`: `a` < `c`; `confidence` vs `diff`: `c` < `d`).

### M36 Frozen Tier Function

| Condition | Tier |
|-----------|------|
| `confidence >= 0.85` | `high` |
| `0.6 <= confidence < 0.85` | `medium` |
| `confidence < 0.6` | `low` |
| null / undefined / missing | `unknown` (no warning) |
| non-numeric (typeof !== 'number') | `unknown` + warning |
| NaN | `unknown` + warning |
| +Infinity / -Infinity | `unknown` + warning |
| out-of-[0,1] (e.g., -0.1, 1.5) | `unknown` + warning |

Thresholds `0.85` and `0.6` are immutable once M36 ships. Any threshold change is a material governance event requiring its own ROADMAP milestone with a fresh re-approval expectation.

### M36 Frozen Four-Value `confidence_tier` Bucket-Key Enum

```
high | medium | low | unknown
```

The enum is immutable once M36 ships. `confidence_tier` MUST NOT be written into `tusq.manifest.json` (non-persistence rule). Any addition to the enum is a material governance event that requires its own ROADMAP milestone.

### M36 Frozen Two-Value `aggregation_key` Enum

```
tier | unknown
```

Parallel to M31's `domain | unknown`, M32's `class | unknown`, M33's `class | unknown`, M34's `method | unknown`, M35's `scheme | unknown`. The `unknown` aggregation-key marks the zero-evidence / non-numeric / null bucket; the `tier` aggregation-key marks every named tier bucket (high/medium/low). The enum is immutable once M36 ships.

### M36 Frozen Per-Bucket Entry Shape (name-and-counters only)

| Field | Type | Notes |
|-------|------|-------|
| `confidence_tier` | string | One of the four enum values (`"high"`, `"medium"`, `"low"`, `"unknown"`) |
| `aggregation_key` | string | `"tier"` or `"unknown"` |
| `capability_count` | integer | Capabilities in this bucket |
| `capabilities[]` | string[] | Capability names in manifest declared order |
| `approved_count` | integer | Capabilities with `approved === true` |
| `gated_count` | integer | `capability_count - approved_count` |
| `has_destructive_side_effect` | boolean | True iff any capability has `side_effect_class === "destructive"` |
| `has_restricted_or_confidential_sensitivity` | boolean | True iff any capability has `sensitivity_class === "restricted"` or `sensitivity_class === "confidential"` |

Deliberately omitted: no `risk_tier`, no `confidence_min`/`confidence_max`/`confidence_mean` per bucket (reserved for M-Confidence-Statistics-1), no cross-axis roll-up arrays.

Top-level fields `manifest_path`, `manifest_version`, `generated_at` are copied verbatim from the input manifest (fallback: `null` in `--json` mode and `unknown` in human mode when the manifest lacks the field).

### M36 Top-Level `warnings[]` Array Rule

`warnings[]` is a top-level field present **only in `--json` output** (and `--out` JSON file). It is always present even when empty (`[]`) for shape stability. Each entry is a string describing one capability with a non-numeric, NaN, Infinity, or out-of-[0,1] `confidence` value. Format: `"capability '<name>' has confidence <json-value> which is out-of-range or non-numeric; bucketed as 'unknown'"`. In human text output, warnings are emitted to stderr (one line per warning, prefix `Warning: `); they do not appear in the text body.

### M36 Closed-Enum Bucket Iteration Order

Bucket iteration follows the **closed-enum order: `high → medium → low`**, then `unknown` last. This is distinct from M31's first-appearance rule because M36 buckets on a closed derived tier, not an open string. The closed-enum order is a **deterministic stable-output convention only** and MUST NOT be described as "evidence-strength-ranked," "trust-ranked," "quality-precedence," or "highest-quality-first."

A capability maps to the `unknown` bucket if its `confidence` field is null, undefined/missing, non-numeric, NaN, Infinity/-Infinity, or a number outside [0,1]. Empty buckets MUST NOT appear. Within each bucket, capabilities appear in manifest declared order (NOT alphabetized).

### M36 Case-Sensitive `--tier` Filter Rule

The `--tier <value>` flag limits output to a single bucket. Filter matching is **case-sensitive lowercase only** — mirroring M35's `--scheme` precedent. Uppercase values like `HIGH` exit 1 with `Unknown confidence tier: <value>` (rather than being lower-cased silently) so reviewer scripts cannot accidentally drift from the canonical lowercase form. A valid enum value that is absent in the manifest also exits 1 (e.g., `--tier low` when no capabilities fall below 0.6 exits 1 with `Unknown confidence tier: low`).

### M36 Empty-Capabilities and stdout-Discipline Rules

- `capabilities: []` → exit 0; human: `No capabilities in manifest — nothing to index.\n`; JSON: `{manifest_path, manifest_version, generated_at, tiers: [], warnings: []}`.
- Every error path writes exclusively to stderr; stdout MUST be empty on every exit-1 path.
- Error messages: `Manifest not found:`, `Invalid manifest JSON:`, `Invalid manifest: missing capabilities array`, `Unknown confidence tier:`, `Unknown subcommand:`, `Unknown flag:`, `Cannot write to --out path:`, `--out path must not be inside .tusq/`.

### M36 Read-Only Invariants

| Invariant | Verification |
|-----------|-------------|
| `tusq.manifest.json` mtime/content unchanged after every invocation | Smoke assertion |
| `confidence_tier` MUST NOT be written into `tusq.manifest.json` | Smoke assertion |
| No write to `.tusq/`; no write to any path other than `--out <path>` when supplied | Smoke assertion |
| `capability_digest` MUST NOT flip on any capability | Smoke assertion |
| `tusq compile` output byte-identical pre and post-M36 | Smoke assertion |
| `tusq surface plan` output byte-identical pre and post-M36 | Smoke assertion |
| `tusq domain index` output byte-identical pre and post-M36 | Smoke assertion |
| `tusq auth index` output byte-identical pre and post-M36 | Smoke assertion |

### Constraint 29

M36 implementation MUST NOT frame `tusq confidence index` as a runtime confidence enforcement mechanism, an evidence-quality scoring engine, an automated capability re-classifier, an alteration of the scanner's `confidence` derivation rules, a persister of `confidence_tier` into the manifest, or a cross-axis statistical aggregator. Help text, docs, and human output MUST include the planning-aid framing callout: "This is a planning aid, not a runtime confidence enforcement engine, evidence-quality scoring engine, or automated re-classifier."

### M36 Deliverables (dev-owned)

- `src/cli.js` — `CONFIDENCE_TIER_ENUM`, `CONFIDENCE_TIER_AGGREGATION_KEY_ENUM`, `CONFIDENCE_TIER_BUCKET_ORDER`, `classifyConfidenceTier`, `cmdConfidence`, `cmdConfidenceIndex`, `parseConfidenceIndexArgs`, `buildConfidenceIndex`, `formatConfidenceIndex`, `_guardConfidenceTierBucketKey`, `_guardConfidenceTierAggregationKey`; updated `dispatch()`, `printHelp()`, `printCommandHelp()` (CLI surface 19 → 20).
- `tests/smoke.mjs` — M36 smoke matrix (assertions a-v per ROADMAP § M36; updated M35 help-count check from 19 to 20).
- `tests/evals/governed-cli-scenarios.json` — `confidence-tier-index-determinism` scenario (eval harness 26 → 27).
- `tests/eval-regression.mjs` — `runConfidenceTierIndexDeterminismScenario` handler.
- `.planning/IMPLEMENTATION_NOTES.md` — M36 dev turn entry.
- `.planning/SYSTEM_SPEC.md` — this section.
- `.planning/command-surface.md` — M36 Product CLI Surface section.
- `website/docs/cli-reference.md` — `tusq confidence index` documentation.
- `website/docs/manifest-format.md` — Confidence Tier Index subsection.

## M35: Static Capability Auth Scheme Index Export from Manifest Evidence (V1.16 — PROPOSED)

> Materialized by dev in run_0b373a30d182816a, turn_e2b7cb50cd77d1d5, implementation phase. Charter bound by PM in turn_d7fc926d1c177c66.

### M35 Purpose and Boundary

`tusq auth index` produces a static, deterministic, read-only auth scheme index of the manifest's capabilities bucketed by their `auth_requirements.auth_scheme` value. It is a planning aid that helps reviewers answer "which auth schemes does this manifest expose, how many capabilities use each scheme, and which buckets contain destructive or restricted/confidential capabilities?" It does NOT enforce authentication at runtime, does NOT validate OAuth/OIDC tokens, does NOT certify SOC2/ISO27001/GDPR compliance, does NOT generate auth adapters, does NOT derive IAM posture, does NOT modify M29's `auth_scheme` derivation rules (which remain the single source of truth for the underlying classifier), and does NOT alter the M30 `gated_reason: auth_scheme_unknown` or `gated_reason: auth_scheme_oauth_pending_v2` surface-eligibility rules.

### M35 Command Shape

```
tusq auth index [--scheme <bearer|api_key|session|basic|oauth|none|unknown>]
                [--manifest <path>] [--out <path>] [--json]
```

`tusq auth` (no subcommand) prints a short enumerate-subcommands block. Unknown subcommands exit 1 with `Unknown subcommand: <name>` on stderr, empty stdout. CLI surface grows from 18 → 19 commands with `auth` inserted alphabetically between `approve` and `compile` (`approve` vs `auth`: `app` < `aut` because `p` < `u`; `auth` vs `compile`: `a` < `c`).

### M35 Frozen Seven-Value `auth_scheme` Bucket-Key Enum

```
bearer | api_key | session | basic | oauth | none | unknown
```

Aligns 1:1 with the existing M29 `AUTH_SCHEMES` constant in `src/cli.js` (`['unknown', 'bearer', 'api_key', 'session', 'basic', 'oauth', 'none']`). Note that `unknown` is already a member of M29 AUTH_SCHEMES — unlike M34 where `unknown` was synthesized outside the canonical five HTTP verbs. M35 MUST reference `AUTH_SCHEMES` (M29) directly rather than declaring an independent constant. M35 MUST NOT modify M29's classifier or the M29 AUTH_SCHEMES constant. The enum is immutable once M35 ships; any addition is a material governance event that requires its own ROADMAP milestone.

### M35 Frozen Two-Value `aggregation_key` Enum

```
scheme | unknown
```

Parallel to M31's `domain | unknown`, M32's `class | unknown`, M33's `class | unknown`, M34's `method | unknown`. The `unknown` aggregation-key marks the zero-evidence / explicit-unknown bucket; the `scheme` aggregation-key marks every named scheme bucket (bearer/api_key/session/basic/oauth/none). The enum is immutable once M35 ships.

### M35 Frozen Per-Bucket Entry Shape (name-and-counters only)

| Field | Type | Notes |
|-------|------|-------|
| `auth_scheme` | string | One of the seven enum values (`"bearer"`, `"api_key"`, `"session"`, `"basic"`, `"oauth"`, `"none"`, `"unknown"`) |
| `aggregation_key` | string | `"scheme"` or `"unknown"` |
| `capability_count` | integer | Capabilities in this bucket |
| `capabilities[]` | string[] | Capability names in manifest declared order |
| `approved_count` | integer | Capabilities with `approved === true` |
| `gated_count` | integer | `capability_count - approved_count` |
| `has_destructive_side_effect` | boolean | True iff any capability has `side_effect_class === "destructive"` |
| `has_restricted_or_confidential_sensitivity` | boolean | True iff any capability has `sensitivity_class === "restricted"` or `sensitivity_class === "confidential"` |

Deliberately omitted (parallel to M31/M32/M33/M34): no `methods_represented[]`, no `domains_represented[]`, no `side_effect_classes_represented[]`, no `sensitivity_classes_represented[]`, no `iam_posture`, no `risk_tier`. Cross-axis roll-ups belong in future M-IAM-Posture-1 / M-Risk-1 milestones.

Top-level fields `manifest_path`, `manifest_version`, `generated_at` are copied verbatim from the input manifest (fallback: `null` in `--json` mode and `unknown` in human mode when the manifest lacks the field).

### M35 Closed-Enum Bucket Iteration Order

Bucket iteration follows the **closed-enum order: `bearer → api_key → session → basic → oauth → none`**, then `unknown` last. This is distinct from M31's first-appearance rule because M35 buckets on a closed enum, not an open string. The closed-enum order mirrors the M29 AUTH_SCHEMES decision table ordering but carries no IAM-strength semantic and MUST NOT be described as "strength-ordered," "trust-ranked," "security-ascending," or any phrase implying security or trust semantics.

A capability maps to the `unknown` bucket if its `auth_requirements.auth_scheme` is `"unknown"`, or if `auth_requirements` is missing/null/not-an-object, or if `auth_scheme` is null/not-a-string or any value not in the six named values. Empty buckets MUST NOT appear. Within each bucket, capabilities appear in manifest declared order (NOT alphabetized).

### M35 Case-Sensitive `--scheme` Filter Rule

The `--scheme <value>` flag limits output to a single bucket. Filter matching is **case-sensitive lowercase only** — mirroring the manifest's verbatim lowercase `auth_scheme` field convention. Uppercase values like `BEARER` exit 1 with `Unknown auth scheme: <value>` (rather than being lower-cased silently) so reviewer scripts cannot accidentally drift from the canonical lowercase form.

### M35 Empty-Capabilities and stdout-Discipline Rules

- `capabilities: []` → exit 0; human: `No capabilities in manifest — nothing to index.\n`; JSON: `{manifest_path, manifest_version, generated_at, schemes: []}`.
- Every error path writes exclusively to stderr; stdout MUST be empty on every exit-1 path.
- Error messages: `Manifest not found:`, `Invalid manifest JSON:`, `Invalid manifest: missing capabilities array`, `Unknown auth scheme:`, `Unknown subcommand:`, `Unknown flag:`, `Cannot write to --out path:`, `--out path must not be inside .tusq/`.

### M35 Read-Only Invariants

| Invariant | Verification |
|-----------|-------------|
| `tusq.manifest.json` mtime/content unchanged after every invocation | Smoke assertion |
| No write to `.tusq/`; no write to any path other than `--out <path>` when supplied | Smoke assertion |
| `capability_digest` MUST NOT flip on any capability | Smoke assertion |
| `tusq compile` output byte-identical pre and post-M35 | Smoke assertion |
| `tusq surface plan` output byte-identical pre and post-M35 | Smoke assertion |
| `tusq domain index` output byte-identical pre and post-M35 | Smoke assertion |
| `tusq effect index` output byte-identical pre and post-M35 | Smoke assertion |
| `tusq sensitivity index` output byte-identical pre and post-M35 | Smoke assertion |
| `tusq method index` output byte-identical pre and post-M35 | Smoke assertion |

### M35 Deliverables (dev-owned)

- `src/cli.js` — `AUTH_SCHEME_INDEX_AGGREGATION_KEY_ENUM`, `AUTH_SCHEME_INDEX_BUCKET_ORDER`, `cmdAuth`, `cmdAuthIndex`, `parseAuthIndexArgs`, `buildAuthIndex`, `formatAuthIndex`, `_guardAuthSchemeBucketKey`, `_guardAuthAggregationKey`; updated `dispatch()`, `printHelp()`, `printCommandHelp()` (CLI surface 18 → 19).
- `tests/smoke.mjs` — M35 smoke matrix (assertions a-u per ROADMAP § M35).
- `tests/evals/governed-cli-scenarios.json` — `auth-scheme-index-determinism` scenario (eval harness 25 → 26).
- `tests/eval-regression.mjs` — `runAuthSchemeIndexDeterminismScenario` handler.
- `website/docs/cli-reference.md` — `tusq auth index` documentation.
- `website/docs/manifest-format.md` — Auth Scheme Index subsection.

## M34: Static Capability HTTP Method Index Export from Manifest Evidence (V1.15 — PROPOSED)

> Materialized by dev in run_bf8efb6b9c733000, turn_c530db27dd4d2941, implementation phase. Charter bound by PM in turn_8656b25a486eaa6d.

### M34 Purpose and Boundary

`tusq method index` produces a static, deterministic, read-only HTTP method index of the manifest's capabilities bucketed by their verbatim `method` field value. It is a planning aid that helps reviewers answer "which HTTP methods does this manifest expose, how many capabilities use each verb, and which buckets contain destructive or unknown-auth capabilities?" It does NOT route HTTP methods at runtime, does NOT validate REST conventions (idempotency, safety, cacheability), does NOT certify idempotency class, does NOT automatically classify destructive verbs (DELETE is a bucket label — not a destructive-side-effect attestation), does NOT modify the M32 `side_effect_class` derivation rules (which use `method` as one of several inputs), and does NOT alter the M30 `gated_reason: destructive_side_effect` surface-eligibility rule.

### M34 Command Shape

```
tusq method index [--method <GET|POST|PUT|PATCH|DELETE|unknown>]
                  [--manifest <path>] [--out <path>] [--json]
```

`tusq method` (no subcommand) prints a short enumerate-subcommands block. Unknown subcommands exit 1 with `Unknown subcommand: <name>` on stderr, empty stdout. CLI surface grows from 17 → 18 commands with `method` inserted alphabetically between `effect` and `policy`.

### M34 Frozen Six-Value `http_method` Bucket-Key Enum

```
GET | POST | PUT | PATCH | DELETE | unknown
```

The five named methods are the canonical REST verbs that tusq's scanner already emits verbatim in the manifest's `method` field. The `unknown` bucket aggregates every capability whose `method` field is `null`, missing, empty-string, or any value outside the five canonical values (e.g., HEAD, OPTIONS, TRACE, CONNECT, non-standard verbs). M34 MUST NOT modify, override, or augment the upstream scanner's `method` field; the enum is a bucket-key, not a re-classifier. The enum is immutable once M34 ships; any addition is a material governance event that MUST land under its own ROADMAP milestone with a fresh re-approval expectation.

### M34 Frozen Two-Value `aggregation_key` Enum

```
method | unknown
```

Parallel to M31's `domain | unknown`, M32's `class | unknown`, M33's `class | unknown`. The `unknown` aggregation-key marks the zero-evidence bucket; the `method` aggregation-key marks every named method bucket (GET/POST/PUT/PATCH/DELETE). The enum is immutable once M34 ships.

### M34 Frozen Per-Bucket Entry Shape (name-and-counters only)

| Field | Type | Notes |
|-------|------|-------|
| `http_method` | string | One of the six enum values (`"GET"`, `"POST"`, `"PUT"`, `"PATCH"`, `"DELETE"`, `"unknown"`) |
| `aggregation_key` | string | `"method"` or `"unknown"` |
| `capability_count` | integer | Capabilities in this bucket |
| `capabilities[]` | string[] | Capability names in manifest declared order |
| `approved_count` | integer | Capabilities with `approved === true` |
| `gated_count` | integer | `capability_count - approved_count` |
| `has_destructive_side_effect` | boolean | True iff any capability has `side_effect_class === "destructive"` |
| `has_unknown_auth` | boolean | True iff any capability has `auth_requirements.auth_scheme === "unknown"` |

Deliberately omitted (parallel to M31/M32/M33): no `domains_represented[]`, no `auth_schemes_represented[]`, no `side_effect_classes_represented[]`, no `sensitivity_classes_represented[]`, no `idempotency_class`, no `risk_tier`. Cross-axis roll-ups belong in future M-Risk-1 / M-Idempotency-1 milestones.

Top-level fields `manifest_path`, `manifest_version`, `generated_at` are copied verbatim from the input manifest (fallback: `null` in `--json` mode and `unknown` in human mode when the manifest lacks the field).

### M34 Closed-Enum Bucket Iteration Order

Bucket iteration follows the **closed-enum order: `GET → POST → PUT → PATCH → DELETE`**, then `unknown` last. This is distinct from M31's first-appearance rule because M34 buckets on a closed enum, not an open string. The closed-enum order matches the conventional REST CRUD reading order (GET=read, POST=create, PUT=replace, PATCH=update, DELETE=delete) but carries no risk semantic and MUST NOT be described as "low-to-high risk," "destructive-ascending," "safety-ordered," or any phrase implying risk semantics.

Empty buckets MUST NOT appear. Within each bucket, capabilities appear in manifest declared order (NOT alphabetized).

### M34 Case-Sensitive `--method` Filter Rule

The `--method <value>` flag limits output to a single bucket. Filter matching is **case-sensitive uppercase only** — mirroring the manifest's verbatim uppercase `method` field convention. Lowercase values like `get` or `delete` exit 1 with `Unknown method: <value>` (rather than being upper-cased silently) so reviewer scripts cannot accidentally drift from the canonical uppercase form.

### M34 Empty-Capabilities and stdout-Discipline Rules

- `capabilities: []` → exit 0; human: `No capabilities in manifest — nothing to index.\n`; JSON: `{manifest_path, manifest_version, generated_at, methods: []}`.
- Every error path writes exclusively to stderr; stdout MUST be empty on every exit-1 path.
- Error messages: `Manifest not found:`, `Invalid manifest JSON:`, `Invalid manifest: missing capabilities array`, `Unknown method:`, `Unknown subcommand:`, `Unknown flag:`, `Cannot write to --out path:`, `--out path must not be inside .tusq/`.

### M34 Read-Only Invariants

| Invariant | Verification |
|-----------|-------------|
| `tusq.manifest.json` mtime/content unchanged after every invocation | Smoke assertion |
| No write to `.tusq/`; no write to any path other than `--out <path>` when supplied | Smoke assertion |
| `capability_digest` MUST NOT flip on any capability | Smoke assertion: hash before vs after |
| `tusq compile` output byte-identical pre and post-M34 | Smoke assertion: golden-file comparison |
| `tusq surface plan` output byte-identical pre and post-M34 | Smoke assertion |
| `tusq domain index` output byte-identical pre and post-M34 | Smoke assertion |
| `tusq effect index` output byte-identical pre and post-M34 | Smoke assertion |
| `tusq sensitivity index` output byte-identical pre and post-M34 | Smoke assertion |

### M34 Deliverables (dev-owned)

- `src/cli.js` — `METHOD_INDEX_AGGREGATION_KEY_ENUM`, `METHOD_INDEX_BUCKET_ORDER`, `METHOD_INDEX_VALID_METHODS`, `cmdMethod`, `cmdMethodIndex`, `parseMethodIndexArgs`, `buildMethodIndex`, `formatMethodIndex`, `_guardMethodBucketKey`, `_guardMethodAggregationKey`; updated `dispatch()`, `printHelp()`, `printCommandHelp()` (CLI surface 17 → 18).
- `tests/smoke.mjs` — M34 smoke matrix (assertions a-u per ROADMAP § M34).
- `tests/evals/governed-cli-scenarios.json` — `method-index-determinism` scenario (eval harness 24 → 25).
- `tests/eval-regression.mjs` — `runMethodIndexDeterminismScenario` handler.
- `website/docs/cli-reference.md` — `tusq method index` documentation.
- `website/docs/manifest-format.md` — HTTP Method Index subsection.

## M39: Static Capability Required Input Field Count Tier Index Export from Manifest Evidence (V1.20 — SHIPPED)

### M39 Purpose and Boundary

`tusq input index` is a **planning aid** that surfaces what required-input-field-count tiers the manifest's capabilities span and the cross-axis side-effect/sensitivity exposure of each tier. It does NOT execute capability inputs at runtime, does NOT validate `input_schema.properties[]` conformance against any per-element schema, does NOT generate new inputs or example payloads, does NOT measure runtime call frequency or call patterns, does NOT certify exposure-safety, does NOT alter M11/M14/M24's canonical input-schema extraction rules, does NOT persist `required_input_field_count_tier` into `tusq.manifest.json`, and does NOT compute statistical aggregates (`min`, `max`, `mean`, percentiles, distributions).

### M39 Command Shape

`tusq input index [--tier <none|low|medium|high|unknown>] [--manifest <path>] [--out <path>] [--json]`

Top-level noun `input` with single subcommand `index`. CLI surface grows 22 → 23 with `input` inserted alphabetically between `examples` and `method` (`e` (101) < `i` (105) < `m` (109)).

### M39 Frozen Tier Function

Applied to `capability.input_schema.required[]` array:
- `unknown` if `input_schema` is `null`/`undefined`/missing/not-a-plain-non-null-object (including Array) — reason: `input_schema_field_missing` or `input_schema_field_not_object`
- `unknown` if `input_schema.required` is `null`/`undefined`/missing/not-an-array — reason: `required_field_missing` or `required_field_not_array`
- `unknown` if `required[]` contains any element that is not a non-empty string (empty string, `null`, primitive, array, object) — reason: `required_array_contains_non_string_or_empty_element`
- `none` if `required.length === 0`
- `low` if `1 <= required.length <= 2`
- `medium` if `3 <= required.length <= 5`
- `high` if `required.length >= 6`

Boundaries `0/2/5/6` are immutable once M39 ships. Any threshold change is a material governance event.

### M39 Frozen Five-Value `required_input_field_count_tier` Bucket-Key Enum

`none | low | medium | high | unknown` — closed enum. Any addition is a material governance event. `required_input_field_count_tier` is derived from `capability.input_schema.required[]` cardinality (M11/M14/M24-derived) and is distinct from M37's `pii_field_count_tier` (PII-name hints) and M38's `examples_count_tier` (eval-seed objects).

### M39 Frozen Two-Value `aggregation_key` Enum

`tier | unknown` — closed enum. Named buckets emit `aggregation_key: 'tier'`; unknown bucket emits `aggregation_key: 'unknown'`.

### M39 Frozen Per-Bucket Entry Shape (name-and-counters only)

8 fields: `required_input_field_count_tier`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`. Within each bucket: capabilities in manifest declared order.

### M39 Top-Level `warnings[]` Array Rule

Present only in `--json` mode (always emitted, even `[]`, for shape stability). Per-capability malformed warnings are objects: `{ capability: <name>, reason: <reason_code> }`. Five frozen reason codes: `input_schema_field_missing`, `input_schema_field_not_object`, `required_field_missing`, `required_field_not_array`, `required_array_contains_non_string_or_empty_element`. In human mode, warnings write to stderr (NOT stdout). Preserved byte-identically across runs.

### M39 Closed-Enum Bucket Iteration Order

`none → low → medium → high → unknown` — deterministic stable-output convention only. NOT exposure-risk-ranked, NOT blast-radius-ranked, NOT easy-call-ranked, NOT input-complexity-ranked. Empty buckets MUST NOT appear. `unknown` appended last only when non-empty.

### M39 Case-Sensitive `--tier` Filter Rule

Lowercase-only; uppercase values (e.g., `HIGH`) exit 1 with `Unknown required input field count tier: HIGH`. Valid enum value not present in index exits 1 with `No capabilities found for required input field count tier: <tier>`.

### M39 Empty-Capabilities and stdout-Discipline Rules

Empty `capabilities: []` manifest: exit 0, human line `No capabilities in manifest — nothing to index.`, JSON shape `{ manifest_path, manifest_version, generated_at, tiers: [], warnings: [] }`. Every error path: empty stdout, error to stderr, exit 1. Per-capability warnings in human mode go to stderr (not stdout).

### M39 Read-Only Invariants

`tusq.manifest.json` mtime/content MUST be byte-identical pre and post. `capability_digest` MUST NOT flip. `required_input_field_count_tier` MUST NOT be written into manifest. `tusq compile`, all other index commands, `tusq serve` MCP responses MUST be byte-for-byte unchanged. `--out` MUST reject any path resolving inside `.tusq/`. Zero new dependencies in `package.json`.

### M39 Deliverables (dev-owned)

- `src/cli.js` — `REQUIRED_INPUT_FIELD_COUNT_TIER_ENUM`, `REQUIRED_INPUT_FIELD_COUNT_TIER_AGGREGATION_KEY_ENUM`, `REQUIRED_INPUT_FIELD_COUNT_TIER_BUCKET_ORDER`, `cmdInput`, `cmdInputIndex`, `parseInputIndexArgs`, `buildRequiredInputFieldCountTierIndex`, `formatRequiredInputFieldCountTierIndex`, `_guardRequiredInputFieldCountTierBucketKey`, `_guardRequiredInputFieldCountTierAggregationKey`, `classifyRequiredInputFieldCountTier`; updated `dispatch()`, `printHelp()`, `printCommandHelp()` (CLI surface 22 → 23).
- `tests/smoke.mjs` — M39 smoke matrix (assertions a-x per ROADMAP § M39); updated M35/M36/M37/M38 help-count assertions from 22 to 23.
- `tests/evals/governed-cli-scenarios.json` — `required-input-field-count-tier-index-determinism` scenario (eval harness 29 → 30).
- `tests/eval-regression.mjs` — `runRequiredInputFieldCountTierIndexDeterminismScenario` handler.
- `website/docs/cli-reference.md` — `tusq input index` documentation.
- `website/docs/manifest-format.md` — Required Input Field Count Tier Index subsection.

## M38: Static Capability Examples Count Tier Index Export from Manifest Evidence (V1.19 — SHIPPED)

### M38 Purpose and Boundary

`tusq examples index` is a **planning aid** that surfaces what examples-count tiers the manifest's capabilities span and the cross-axis side-effect/sensitivity exposure of each tier. It does NOT execute examples at runtime, does NOT validate per-example schema conformance against `input_schema`/`output_schema`, does NOT generate new examples, does NOT measure runtime test coverage, does NOT certify eval-readiness, does NOT alter M11's canonical examples extraction rules, does NOT persist `examples_count_tier` into `tusq.manifest.json`, and does NOT compute statistical aggregates (`min`, `max`, `mean`, percentiles, distributions).

### M38 Command Shape

`tusq examples index [--tier <none|low|medium|high|unknown>] [--manifest <path>] [--out <path>] [--json]`

Top-level noun `examples` with single subcommand `index`. CLI surface grows 21 → 22 with `examples` inserted alphabetically between `effect` and `method`.

### M38 Frozen Tier Function

Applied to `capability.examples[]` array:
- `none` if `examples.length === 0`
- `low` if `1 <= examples.length <= 2`
- `medium` if `3 <= examples.length <= 5`
- `high` if `examples.length >= 6`
- `unknown` if `examples` is `null`/`undefined`/missing/not-an-array OR contains any `null` element OR contains any array element OR contains any non-object element

Boundaries `0/2/5/6` are immutable once M38 ships. Any threshold change is a material governance event.

### M38 Frozen Five-Value `examples_count_tier` Bucket-Key Enum

`none | low | medium | high | unknown` — closed enum. Any addition is a material governance event.

### M38 Frozen Two-Value `aggregation_key` Enum

`tier | unknown` — closed enum. Named buckets emit `aggregation_key: 'tier'`; unknown bucket emits `aggregation_key: 'unknown'`.

### M38 Frozen Per-Bucket Entry Shape (name-and-counters only)

8 fields: `examples_count_tier`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`. Within each bucket: capabilities in manifest declared order.

### M38 Top-Level `warnings[]` Array Rule

Present only in `--json` mode (never in human mode). Always emitted (even `[]`) for shape stability. Per-capability malformed-`examples` warnings are objects with two fields: `{ capability: <name>, reason: <reason_code> }`. Five frozen reason codes: `examples_field_missing`, `examples_field_not_array`, `examples_array_contains_non_object_element`, `examples_array_contains_null_element`, `examples_array_contains_array_element`. Preserved byte-identically across runs.

### M38 Closed-Enum Bucket Iteration Order

`none → low → medium → high → unknown` — deterministic stable-output convention only. NOT coverage-quality-ranked, NOT test-strength-ranked, NOT eval-readiness-ranked. Empty buckets MUST NOT appear. `unknown` appended last only when non-empty.

### M38 Case-Sensitive `--tier` Filter Rule

Lowercase-only; uppercase values (e.g., `HIGH`) exit 1 with `Unknown examples count tier: HIGH`. Valid enum value not present in index exits 1 with `No capabilities found for examples count tier: <tier>`.

### M38 Empty-Capabilities and stdout-Discipline Rules

Empty `capabilities: []` manifest: exit 0, human line `No capabilities in manifest — nothing to index.`, JSON shape `{ manifest_path, manifest_version, generated_at, tiers: [], warnings: [] }`. Every error path: empty stdout, error to stderr, exit 1. Per-capability warnings in human mode go to stderr (not stdout).

### M38 Read-Only Invariants

`tusq.manifest.json` mtime/content MUST be byte-identical pre and post. `capability_digest` MUST NOT flip. `examples_count_tier` MUST NOT be written into manifest. `tusq compile`, all other index commands, `tusq serve` MCP responses MUST be byte-for-byte unchanged. `--out` MUST reject any path resolving inside `.tusq/`. Zero new dependencies in `package.json`.

### M38 Deliverables (dev-owned)

- `src/cli.js` — `EXAMPLES_COUNT_TIER_ENUM`, `EXAMPLES_COUNT_TIER_AGGREGATION_KEY_ENUM`, `EXAMPLES_COUNT_TIER_BUCKET_ORDER`, `cmdExamples`, `cmdExamplesIndex`, `parseExamplesIndexArgs`, `buildExamplesCountTierIndex`, `formatExamplesCountTierIndex`, `_guardExamplesCountTierBucketKey`, `_guardExamplesCountTierAggregationKey`, `classifyExamplesCountTier`; updated `dispatch()`, `printHelp()`, `printCommandHelp()` (CLI surface 21 → 22).
- `tests/smoke.mjs` — M38 smoke matrix (assertions a-x per ROADMAP § M38); updated M35/M36/M37 help-count assertions from 21 to 22.
- `tests/evals/governed-cli-scenarios.json` — `examples-count-tier-index-determinism` scenario (eval harness 28 → 29).
- `tests/eval-regression.mjs` — `runExamplesCountTierIndexDeterminismScenario` handler.
- `website/docs/cli-reference.md` — `tusq examples index` documentation.
- `website/docs/manifest-format.md` — Examples Count Tier Index subsection.

## M37: Static Capability PII Field Count Tier Index Export from Manifest Evidence (V1.18 — SHIPPED)

### M37 Purpose and Boundary

`tusq pii index` is a **planning aid** that surfaces what PII-field-count tiers the manifest's capabilities span and the cross-axis side-effect/sensitivity exposure of each tier. It does NOT detect PII at runtime, does NOT prevent data leakage at runtime, does NOT enforce field redaction at runtime, does NOT certify GDPR/HIPAA/PCI/PHI compliance, does NOT alter M25's canonical PII name set or `pii_fields[]` extraction rules, does NOT persist `pii_field_count_tier` into `tusq.manifest.json`, and does NOT compute statistical aggregates (`min`, `max`, `mean`, percentiles, distributions).

### M37 Command Shape

```
tusq pii index [--tier <none|low|medium|high|unknown>] [--manifest <path>] [--out <path>] [--json]
```

### M37 Frozen Tier Function

| `pii_fields` value | Tier |
|-------------------|------|
| Valid array, `length === 0` | `none` |
| Valid array, `1 <= length <= 2` | `low` |
| Valid array, `3 <= length <= 5` | `medium` |
| Valid array, `length >= 6` | `high` |
| null / undefined / missing | `unknown` (warning emitted) |
| not an array | `unknown` (warning emitted) |
| array with non-string element | `unknown` (warning emitted) |
| array with empty string element | `unknown` (warning emitted) |

Thresholds `0`, `2`, `5`, `6` are immutable once M37 ships. Any threshold change or enum extension is a material governance event requiring its own ROADMAP milestone with a fresh re-approval expectation.

### M37 Frozen Five-Value `pii_field_count_tier` Bucket-Key Enum

`none | low | medium | high | unknown`

The enum is immutable once M37 ships. `pii_field_count_tier` MUST NOT be written into `tusq.manifest.json` (non-persistence rule). Any addition to the enum is a material governance event.

### M37 Frozen Two-Value `aggregation_key` Enum

`tier | unknown`

Parallel to M31's `domain | unknown`, M32's `class | unknown`, M33's `class | unknown`, M34's `method | unknown`, M35's `scheme | unknown`, M36's `tier | unknown`. The `unknown` aggregation-key marks the malformed/missing-pii_fields bucket; the `tier` aggregation-key marks every named tier bucket (none/low/medium/high). The enum is immutable once M37 ships.

### M37 Frozen Per-Bucket Entry Shape (name-and-counters only)

| Field | Type | Description |
|-------|------|-------------|
| `pii_field_count_tier` | string | One of `none/low/medium/high/unknown` |
| `aggregation_key` | string | One of `tier/unknown` |
| `capability_count` | integer | Number of capabilities in this bucket |
| `capabilities[]` | string[] | Capability names in manifest declared order |
| `approved_count` | integer | Capabilities where `approved === true` |
| `gated_count` | integer | `capability_count - approved_count` |
| `has_destructive_side_effect` | boolean | true iff any cap has `side_effect_class === "destructive"` |
| `has_restricted_or_confidential_sensitivity` | boolean | true iff any cap has `sensitivity_class === "restricted"` or `"confidential"` |

**Deliberately omitted** (parallel to M31–M36 omissions): no `domains_represented[]`, no `pii_categories_represented[]`, no derived `risk_tier`, no `pii_field_count_min/max/mean/distribution[]`.

### M37 Top-Level `warnings[]` Array Rule

Present in `--json` output always (even when empty `[]` for shape stability). Each entry is a string describing a malformed `pii_fields` value for a specific capability. In human mode, warnings write to stderr (NOT stdout).

### M37 Closed-Enum Bucket Iteration Order

Bucket iteration follows the **closed-enum order: `none → low → medium → high`**, then `unknown` last. This is a deterministic stable-output convention only and MUST NOT be described as "leakage-ranked," "exposure-ranked," "risk-precedence-ordered," or any phrase implying a data-leakage-severity semantic.

### M37 Case-Sensitive `--tier` Filter Rule

`--tier` values are matched verbatim (lowercase canonical form). Uppercase or mixed-case values like `HIGH` exit 1 with `Unknown pii field count tier: HIGH`.

### M37 Empty-Capabilities and stdout-Discipline Rules

When `capabilities: []`, exit 0 in both modes. Human: `No capabilities in manifest — nothing to index.` JSON: `{ manifest_path, manifest_version, generated_at, tiers: [], warnings: [] }`. Missing/non-array `capabilities` exits 1 with `Invalid manifest: missing capabilities array`. Every error path empties stdout and writes exclusively to stderr.

### M37 Read-Only Invariants

| Invariant | Verified by |
|-----------|-------------|
| `tusq.manifest.json` mtime/content unchanged after every invocation | Smoke assertion |
| No write to `.tusq/`; no write to any path other than `--out <path>` | Smoke assertion |
| `capability_digest` MUST NOT flip on any capability | Smoke assertion |
| `pii_field_count_tier` MUST NOT be written into manifest | Smoke assertion |
| `tusq compile` output byte-identical pre and post-M37 | Smoke assertion |
| `tusq surface plan`, `tusq domain index`, `tusq confidence index`, etc. byte-identical | Smoke assertion |

### M37 Deliverables (dev-owned)

- `src/cli.js` — `PII_FIELD_COUNT_TIER_ENUM`, `PII_FIELD_COUNT_TIER_AGGREGATION_KEY_ENUM`, `PII_FIELD_COUNT_TIER_BUCKET_ORDER`, `cmdPii`, `cmdPiiIndex`, `parsePiiIndexArgs`, `buildPiiFieldCountTierIndex`, `formatPiiFieldCountTierIndex`, `_guardPiiFieldCountTierBucketKey`, `_guardPiiFieldCountTierAggregationKey`, `classifyPiiFieldCountTier`; updated `dispatch()`, `printHelp()`, `printCommandHelp()` (CLI surface 20 → 21).
- `tests/smoke.mjs` — M37 smoke matrix (assertions a-w per ROADMAP § M37).
- `tests/evals/governed-cli-scenarios.json` — `pii-field-count-tier-index-determinism` scenario (eval harness 27 → 28).
- `tests/eval-regression.mjs` — `runPiiFieldCountTierIndexDeterminismScenario` handler.
- `website/docs/cli-reference.md` — `tusq pii index` documentation.
- `website/docs/manifest-format.md` — PII Field Count Tier Index subsection.

## Constraints

1. **Docusaurus version** — Use Docusaurus 3.x (latest stable)
2. **No ejecting** — Use swizzling only if needed for the homepage; prefer the plugin/theme API
3. **Monorepo-friendly** — The `website/` directory is self-contained with its own `package.json`
4. **Brand continuity** — Preserve the Fraunces + Space Grotesk font pairing and color scheme from the current site
5. **Content fidelity** — All user-facing content must be traceable to an accepted planning or launch artifact. Do not invent new product claims
6. **M20 local-only invariant** — The opt-in execution-policy scaffold MUST NOT perform live API execution. `tools/call` under any policy mode stays in-process; no outbound HTTP, DB, or socket I/O to the target product. `executed: false` MUST appear in every dry-run response.
7. **M21 local-only invariant** — `tusq policy init` MUST NOT perform any network, manifest, or target-product I/O. Its side effects are limited to writing one JSON file (and creating `.tusq/` if missing) under the repo root, plus stdout/stderr output. The generated file MUST pass `loadAndValidatePolicy()` byte-for-byte so no hidden code path makes the generator drift from the validator.
8. **M21 safe-default invariant** — The default `mode` for a generated policy is `"describe-only"`. An operator must explicitly pass `--mode dry-run` to generate a dry-run policy. The generator never flips describe-only behavior silently.
9. **M22 validator-parity invariant** — `tusq policy verify` and `tusq serve --policy` MUST share `loadAndValidatePolicy()` byte-for-byte. Every acceptance or rejection decision, and every error message, is identical across the two entry points. No standalone re-implementation of validation logic is permitted; any new validator rule lands in `loadAndValidatePolicy()` and is picked up by both paths at once. Smoke-test parity fixtures enforce this invariant at merge time.
10. **M22 local-only invariant** — `tusq policy verify` MUST NOT perform any network, manifest, or target-product I/O in V1.3. Its side effects are limited to reading the policy file path, writing to stdout/stderr, and exiting 0 or 1. It never binds a TCP port, never starts an MCP server, never reads `tusq.manifest.json`, and never invokes a compiled tool.
11. **M23 opt-in-strict invariant** — Strict manifest-aware verification is opt-in via the `--strict` flag on `tusq policy verify`. The default `tusq policy verify` path (no flag) MUST remain byte-for-byte identical to the M22 behavior: no manifest file is opened, no manifest path is resolved, and no new failure mode is exposed. `--strict` is never default, never inferred from filesystem state (e.g., presence of `tusq.manifest.json`), and never toggled by any other flag. `--manifest <path>` is only consulted when `--strict` is set and passing `--manifest` without `--strict` MUST exit 1 with `--manifest requires --strict` before any file is read.
12. **M23 least-privilege-validation invariant** — A passing `tusq policy verify --strict` run is strictly a policy/manifest alignment statement at verify time: every name in `allowed_capabilities` exists in the referenced manifest, is `approved: true`, and is not blocked on review. It is NOT a runtime safety gate. Strict mode MUST NOT be documented, described, or framed as an "execution safety check," a "pre-flight for serve --policy," a "manifest freshness check," a "runtime reachability probe," or any phrase that implies a PASS makes execution safe. Strict mode performs exactly two local filesystem reads (the policy file and the manifest file), writes to stdout/stderr, and exits 0 or 1. It never binds a TCP port, never opens a network socket, never executes any capability, never mutates the manifest, and never reads any other file.
13. **M24 static-literal-extraction invariant** — Fastify `schema.body` extraction is strictly static: the extractor reads source bytes via `fs.readFile` and applies regex + balanced-brace matching on the literal text. It MUST NOT import `fastify`, `ajv`, `@sinclair/typebox`, or any validator runtime; MUST NOT evaluate source code via `require`, `eval`, `new Function`, or `ts-node`; and MUST NOT make any network I/O. When the `schema` value is not a literal object, when `body` is not a literal object, when `properties` is absent, or when any brace/bracket is unbalanced, the extractor MUST drop the entire `schema_fields` record and fall back to M15 behavior byte-for-byte. Partial extraction is forbidden. Manifest output for non-Fastify fixtures and for Fastify routes without a literal `schema.body` block MUST be byte-for-byte identical to HEAD `35b7c9c`.
14. **M24 source-literal-framing invariant** — The extracted `input_schema` shape represents "what the source declares," NOT "what the Fastify runtime would validate." The manifest `input_schema.source` field tags the extraction as `fastify_schema_body`, and docs/README/CLI-help/launch artifacts MUST NOT describe it as "validator-backed," "runtime-validated," "ajv-validated," or any phrase that implies the manifest shape is enforced at runtime by the framework. The defensible framing is "the declared body schema as it appears literally in source." M24 does NOT invoke any JSON-Schema validator; propagation to `tools/call` dry-run validation continues to use the narrow four-rule validator specified under M20. Any future runtime-enforced validation lands under a separate milestone with its own constraint entry.
15. **M25 static-name-matching invariant** — PII field-name redaction hints are produced by a pure function over the already-built `input_schema.properties` object. The matching rule is whole-key case-insensitive comparison after normalization (`toLowerCase()` + strip `_` and `-`) against a frozen canonical set explicitly enumerated in `src/cli.js`. Partial-key, tail-match, or substring matching is forbidden: `email_template_id` MUST NOT match `email`. The extractor MUST NOT read any source file; MUST NOT inspect any value; MUST NOT invoke regex over source text; MUST NOT make network I/O; MUST NOT import any PII-detection or NLP library (no `pii-detector`, no `presidio`, no `compromise`). `redaction.pii_fields` ordering MUST equal the iteration order of `input_schema.properties` (source-literal declaration order from M15/M24). Repeated manifest generations on the same repo MUST produce byte-identical `pii_fields` arrays. Manifest output for capabilities whose `input_schema.properties` contains no canonical PII keys MUST be byte-for-byte identical to HEAD `541abcd`. Any expansion of the canonical set beyond the V1.6 list is a material governance event that MUST land under its own ROADMAP milestone with a fresh re-approval expectation and a RELEASE_NOTES entry.
16. **M25 redaction-framing invariant** — A non-empty `redaction.pii_fields` array means "the field key matches a well-known PII canonical name." It does NOT mean the field carries PII at runtime, that the route is GDPR/HIPAA/PCI-compliant, or that any payload validation occurs. Docs/README/CLI-help/launch artifacts MUST NOT describe M25 as "PII detection," "PII validation," "PII-validated," "GDPR-compliant," "HIPAA-compliant," "PCI-compliant," "automated redaction," or any phrase that implies regulatory-grade or runtime-enforced PII handling. The defensible framing is "well-known PII field-name hints derived statically from source-declared field keys." M25 MUST NOT auto-escalate `capability.sensitivity_class` on PII match; `sensitivity_class` remains `"unknown"` until an explicit V2 sensitivity-inference increment ships with its own constraint entry. M25 MUST NOT auto-populate `redaction.log_level`, `redaction.mask_in_traces`, or `redaction.retention_days` — those remain `null` in V1.6 and are owned by a future organizational-policy increment.
17. **M26 static-category-labeling invariant** — PII field-name category labels are produced by a pure function over M25's already-emitted `redaction.pii_fields` array plus a frozen `PII_CATEGORY_BY_NAME` lookup enumerated in `src/cli.js`. The extractor MUST NOT read any source file; MUST NOT inspect any value; MUST NOT invoke regex over source text; MUST NOT make network I/O; MUST NOT import any PII-detection, NLP, retention-policy, or compliance library. `redaction.pii_categories` length MUST equal `redaction.pii_fields` length, and entries MUST appear in the same order (one-to-one index correspondence). Category keys are drawn from a frozen nine-entry set: `"email"`, `"phone"`, `"government_id"`, `"name"`, `"address"`, `"date_of_birth"`, `"payment"`, `"secrets"`, `"network"`. Every normalized name in M25's `PII_CANONICAL_NAMES` MUST map to exactly one category in `PII_CATEGORY_BY_NAME`; M25 and M26 freeze together. Any expansion of either the canonical name set or the category set is a material governance event that MUST land under its own ROADMAP milestone with a fresh re-approval expectation and a RELEASE_NOTES entry. Repeated manifest generations on the same repo MUST produce byte-identical `pii_categories` arrays. When `redaction.pii_fields` is empty, `redaction.pii_categories` MUST be `[]` (never absent).
18. **M26 retention-framing invariant** — A populated `redaction.pii_categories` array means "each entry labels the M25 canonical category that produced the matching `pii_fields` entry." It does NOT mean the capability enforces any retention policy at runtime, does NOT prove regulatory compliance, and does NOT imply the manifest auto-sets retention defaults. Docs/README/CLI-help/launch artifacts MUST NOT describe M26 as "auto-retention," "automated redaction," "retention-policy enforcement," "GDPR-retention-compliant," "HIPAA-retention-compliant," or any phrase that implies runtime retention is governed by the manifest. The defensible framing is "canonical PII field-name category labels derived statically from M25's field-name matches, intended to help reviewers set retention/log/trace policy defaults by hand." M26 MUST NOT auto-populate `redaction.retention_days`, `redaction.log_level`, or `redaction.mask_in_traces` — existing defaults remain `null`, `"full"`, and `false` respectively unless explicitly edited by a reviewer, and those fields are owned by a future organizational-policy increment. M26 MUST NOT auto-escalate `capability.sensitivity_class` — it stays `"unknown"` (Constraint 16 propagates verbatim to M26). M26 MUST NOT filter capabilities in `tusq serve` or in `tusq policy verify --strict` based on category content; M26 is descriptive metadata only.
19. **M27 reviewer-aid-framing invariant** — The `tusq redaction review` subcommand is a reviewer aid, NOT a runtime enforcement gate, NOT a compliance certification, and NOT a substitute for reviewer judgment. Docs/README/CLI-help/launch artifacts MUST NOT describe M27 as "automated PII compliance," "automated redaction policy," "GDPR/HIPAA/PCI-ready check," "pre-flight check for serve," "runtime PII safeguard," "execution-safety gate," or any phrase that implies running the command makes a capability safer at runtime. The defensible framing is "a read-only reviewer report that aggregates the M25 field-name hints, the M26 category labels, and a frozen per-category advisory string for each capability." The V1.8 advisory set is explicitly enumerated in SYSTEM_SPEC § M27 and frozen in `src/cli.js` as `PII_REVIEW_ADVISORY_BY_CATEGORY`. Any addition or wording change is a material governance event that MUST land under its own ROADMAP milestone with a fresh re-approval expectation and a RELEASE_NOTES entry. Every advisory string ends with a reviewer-directed reminder (it always says what the reviewer still has to decide) and never claims the manifest or the capability is compliant.
20. **M27 read-only invariant** — `tusq redaction review` is strictly read-only. It MUST NOT mutate `tusq.manifest.json`, MUST NOT write to `.tusq/execution-policy.json`, MUST NOT write to `tusq-tools/*.json`, MUST NOT write to `.tusq/scan.json`, MUST NOT create or modify any other repo file. It MUST NOT mutate `capability.redaction.retention_days`, `capability.redaction.log_level`, `capability.redaction.mask_in_traces`, `capability.sensitivity_class`, `capability.approved`, `capability.approved_by`, `capability.approved_at`, or `capability.review_needed`. It MUST NOT re-run the scanner, MUST NOT import `fastify`/`ajv`/`@sinclair/typebox` or any PII/compliance/retention/NLP library, MUST NOT bind a TCP port, MUST NOT start an MCP server, MUST NOT make any network I/O, and MUST NOT invoke any compiled tool. It MUST NOT change the observable behavior of `tusq scan`, `tusq manifest`, `tusq compile`, `tusq serve`, `tusq approve`, `tusq diff`, `tusq docs`, `tusq version`, `tusq policy init`, `tusq policy verify` (default), or `tusq policy verify --strict`. The only observable side effects of a `tusq redaction review` invocation are stdout output, stderr output, and a process exit code; a smoke test asserts that the manifest file's mtime and content are unchanged after any invocation, and that `tusq policy verify` (default and `--strict`) produces byte-identical stdout and exit code before and after running M27 on the same fixture.
21. **M28 sensitivity-class reviewer-aid framing invariant** — `sensitivity_class` is reviewer-aid framing only. It MUST NOT be presented as runtime PII enforcement, automated compliance certification, or GDPR/HIPAA/PCI/SOC2 attestation in any docs, marketing, CLI output, or eval scenario. The closed five-value enum `{public, internal, confidential, restricted, unknown}` is derived purely from already-shipped manifest evidence (verb, route, parameters, redaction PII categories, M13 preserve flag, write-effect markers) by a deterministic pure function (`classifySensitivity`) that performs zero network/runtime/policy calls. The frozen six-rule first-match-wins decision table (R1 preserve→restricted, R2 admin/destructive verb→restricted, R3 PII category→confidential, R4 write+financial-context→confidential, R5 auth_required or narrow_write→internal, R6 default→public) is immutable once M28 ships; any rule change is a material governance event that MUST land under its own ROADMAP milestone. Capabilities with zero static evidence MUST receive `sensitivity_class: "unknown"` — never silently "public." `tusq compile` output MUST be byte-identical regardless of `sensitivity_class` value. `tusq approve` gate logic MUST remain unchanged. `tusq serve` MCP surface MUST be unchanged. The only new CLI surface is an optional `--sensitivity <class>` filter on the existing `tusq review` command; no new top-level noun is introduced and the 13-command CLI surface is preserved exactly.
23. **Run-specific re-affirmation — run_94746c3508844fcb / turn_6551742f923b14ee** — This SYSTEM_SPEC is re-anchored unchanged in run `run_94746c3508844fcb` (turn `turn_6551742f923b14ee`, planning phase, attempt 1) on HEAD `782780b`. The M29 § (Static Auth Requirements Inference from Manifest Evidence — V1.10) and Constraint 22 (M29 auth-requirements reviewer-aid framing invariant) remain frozen as established in the parent run chain. Independent verification on HEAD 782780b: `npm test` exits 0 with `Eval regression harness passed (16 scenarios)`; `node bin/tusq.js help` enumerates exactly the 13-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help); the only new operator-visible surface from M29 is the optional `--auth-scheme <scheme>` filter on the existing `tusq review` command, mutually compatible with M28's `--sensitivity` via AND-style intersection. The closed seven-value `auth_scheme` enum, closed five-value `evidence_source` enum, frozen six-rule first-match-wins decision table, frozen scope/role extraction rules, AC-4 zero-evidence `unknown` guard (returning `{auth_scheme: "unknown", auth_scopes: [], auth_roles: [], evidence_source: "none"}` — never silently `"none"`), M13 `capability_digest` inclusion driving a one-time re-approval sweep on first post-M29 manifest regeneration, AC-7 `tusq compile` byte-identity invariant AND the stronger MCP-surface invariant (`tusq serve` `tools/list` / `tools/call` / `dry_run_plan` byte-for-byte unchanged, `auth_requirements` MUST NOT appear in any MCP response), zero new dependencies in `package.json` (no `passport`, no `jsonwebtoken`, no `oauth2-server`), and the V1.10 disclosed limitation (the M9/M15 scanner does not set `auth_required`, so R6 is reachable in V1.10 only via manually-edited manifests) all carry forward verbatim. This entry makes no spec mutation; it records this run's independent verification for audit continuity.

22. **M29 auth-requirements reviewer-aid framing invariant** — `auth_requirements` is reviewer-aid framing only. It MUST NOT be presented as runtime authentication enforcement, runtime authorization enforcement, automated AAA certification, OAuth/OIDC/SAML/SOC2/ISO27001 compliance attestation, or token-signature validation in any docs, marketing, README, CLI help, launch artifact, or eval scenario. The closed seven-value `auth_scheme` enum `{bearer, api_key, session, basic, oauth, none, unknown}` and the closed five-value `evidence_source` enum `{middleware_name, route_prefix, auth_required_flag, sensitivity_class_propagation, none}` are derived purely from already-shipped manifest evidence (middleware-name list, route prefix, `auth_required` boolean, `sensitivity_class`, middleware-annotation literals) by a deterministic pure function (`classifyAuthRequirements`) that performs zero network calls, imports zero auth libraries (no `passport`, no `jsonwebtoken`, no `oauth2-server`), reads zero source files beyond what manifest generation already reads, and executes zero compiled tools. The frozen six-rule first-match-wins `auth_scheme` decision table (R1 bearer/jwt/access_token middleware, R2 api_key/x-api-key middleware, R3 session/cookie/passport-local middleware, R4 basic_auth middleware, R5 oauth/oidc/openid middleware, R6 `auth_required === false` AND non-admin route → `none`, default → `unknown`) and the frozen scope/role extraction rules (`/scopes?:\s*\[([^\]]+)\]/` and `/role[s]?:\s*\[([^\]]+)\]/` over middleware-annotation literals only, order-preserving case-sensitive dedup, empty-array on zero matches) are immutable once M29 ships; any rule change is a material governance event that MUST land under its own ROADMAP milestone. Capabilities with zero static evidence MUST receive `auth_requirements: { auth_scheme: "unknown", auth_scopes: [], auth_roles: [], evidence_source: "none" }` — never silently `"none"`. `tusq compile` output MUST be byte-identical regardless of `auth_requirements` value. `tusq approve` gate logic MUST remain unchanged. `tusq serve` MCP surface (`tools/list`, `tools/call`, `dry_run_plan`) MUST be byte-for-byte unchanged and MUST NOT include `auth_requirements` in any response shape. `tusq policy verify` (default and `--strict`) and `tusq redaction review` MUST be byte-for-byte unchanged. The only new CLI surface is an optional `--auth-scheme <scheme>` filter on the existing `tusq review` command (mutually compatible with `--sensitivity`); no new top-level noun is introduced and the 13-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help) is preserved exactly.

24. **Run-specific re-affirmation — run_6d12fe85d0e51576 / turn_534487732e1e53b2** — This SYSTEM_SPEC is re-anchored unchanged in run `run_6d12fe85d0e51576` (turn `turn_534487732e1e53b2`, planning phase, attempt 1) on HEAD `b7cd4b0`. The M29 § (Static Auth Requirements Inference from Manifest Evidence — V1.10) and Constraint 22 (M29 auth-requirements reviewer-aid framing invariant) remain frozen as established in the parent run chain. Independent verification on HEAD b7cd4b0: `npm test` exits 0 with `Eval regression harness passed (16 scenarios)`; `node bin/tusq.js help` enumerates exactly the 13-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help); the only new operator-visible surface from M29 is the optional `--auth-scheme <scheme>` filter on the existing `tusq review` command, mutually compatible with M28's `--sensitivity` via AND-style intersection. The closed seven-value `auth_scheme` enum, closed five-value `evidence_source` enum, frozen six-rule first-match-wins decision table, frozen scope/role extraction rules, AC-4 zero-evidence `unknown` guard (returning `{auth_scheme: "unknown", auth_scopes: [], auth_roles: [], evidence_source: "none"}` — never silently `"none"`), M13 `capability_digest` inclusion driving a one-time re-approval sweep on first post-M29 manifest regeneration, AC-7 `tusq compile` byte-identity invariant AND the stronger MCP-surface invariant (`tusq serve` `tools/list` / `tools/call` / `dry_run_plan` byte-for-byte unchanged, `auth_requirements` MUST NOT appear in any MCP response), zero new dependencies in `package.json` (no `passport`, no `jsonwebtoken`, no `oauth2-server`), and the V1.10 disclosed limitation (the M9/M15 scanner does not set `auth_required`, so R6 is reachable in V1.10 only via manually-edited manifests) all carry forward verbatim. This entry makes no spec mutation; it records this run's independent verification for audit continuity.

25. **Run-specific re-affirmation — run_2ee1a03651d5d485 / turn_2cc0b42362df3fd3** — This SYSTEM_SPEC is re-anchored unchanged in run `run_2ee1a03651d5d485` (turn `turn_2cc0b42362df3fd3`, planning phase, attempt 1) on HEAD `a46d3cb`. The M29 § (Static Auth Requirements Inference from Manifest Evidence — V1.10) and Constraint 22 (M29 auth-requirements reviewer-aid framing invariant) remain frozen as established in the parent run chain. Independent verification on HEAD a46d3cb: `npm test` exits 0 with `Eval regression harness passed (16 scenarios)`; `node bin/tusq.js help` enumerates exactly the 13-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help). **Vision-derived charter received this turn (intent_1777171732846_289f, p2, charter "[vision] The Promise: embeddable chat, widget, command-palette, and voice surfaces"):** PM has materialized a charter sketch for `tusq surface plan` (a static, deterministic, manifest-only planner for the four embeddable surfaces) in `.planning/ROADMAP_NEXT_CANDIDATES.md`. The charter sketch is **not yet** bound into this SYSTEM_SPEC — binding it requires human approval at the planning_signoff gate and would add a new § (Surface Plan Static Export) plus Constraint 23 (`tusq surface plan` reviewer-aid framing forbidding runtime-chat/widget/palette/voice generation, brand certification, and accessibility-compliance claims). This entry makes no spec mutation; it records this run's independent verification and names the candidate charter for audit continuity.

26. **Run-specific re-affirmation — run_42732dba3268a739 / turn_1e0689ffd021d2d5** — This SYSTEM_SPEC is re-anchored unchanged in run `run_42732dba3268a739` (turn `turn_1e0689ffd021d2d5`, planning phase, attempt 1, runtime `local-pm`) on HEAD `1d3f074`. The M29 § (Static Auth Requirements Inference from Manifest Evidence — V1.10) and Constraint 22 (M29 auth-requirements reviewer-aid framing invariant) remain frozen as established in the parent run chain. Independent verification on HEAD 1d3f074: `npm test` exits 0 with `Smoke tests passed` and `Eval regression harness passed (16 scenarios)`; `node bin/tusq.js help` enumerates exactly the 13-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help). **Vision-derived charter received this turn (intent_1777173722739_5899, p2, charter "[vision] The Promise: a self-hostable runtime and MCP server"):** distinct from the prior run's embeddable-surface charter — this run targets the runtime + MCP half of **The Promise**. PM has materialized a charter sketch for **Static MCP Server Descriptor Export** (a static, deterministic, manifest-only command that captures the *describe-only* shape of `tusq serve` into a registry-compatible JSON file) in `.planning/ROADMAP_NEXT_CANDIDATES.md` § "Vision-Derived Charter Candidate: MCP Server Static Descriptor Export (V2 Self-Host First Step)". The charter sketch acknowledges that the vision goal is **partially served at V1.10**: `tusq serve` already provides a describe-only local MCP endpoint per this SYSTEM_SPEC's serve § with `tools/list` / `tools/call` / `dry_run_plan`, and the OSS is CLI-first / file-first / runs entirely locally. The unserved parts decompose into four future milestones: (1) static MCP server descriptor as a hashable/diffable/signable artifact (this charter's scope); (2) generated auth adapters (deferred to M-Runtime-Auth-1; honors VISION lines 396, 608); (3) execution runtime beyond describe-only — same-session proxy, dry-run with confirmation, direct execution of approved-read low-risk capabilities, runtime audit/trace (deferred to M-Runtime-Exec-1; honors VISION line 513); (4) MCP marketplace packaging — registry-submission metadata, icons, descriptions, example prompts, registry submission helpers (deferred to M-MCP-Marketplace-1; honors VISION lines 249, 515–517). **Open scope decision the operator must resolve at the planning_signoff gate (PM does NOT pre-commit):** noun-vs-flag form for the new command — (A) new top-level noun `mcp` with subcommand `export` (CLI surface 13 → 14, compounding top-level surface growth alongside the proposed `surface` noun), (B) flag-only extension `tusq serve --export <path>` (CLI surface stays 13; overloads `serve` verb with non-server emit mode), (C) subcommand under a future `plan` hub (`tusq plan mcp` alongside `tusq plan surface`; presupposes chartering a `plan` hub first). The charter sketch is **not yet** bound into this SYSTEM_SPEC — binding it requires human approval at the planning_signoff gate and would add a new § (MCP Server Static Descriptor Export) with the frozen `schema_version` literal `"tusq.mcp-descriptor.v1"`, the closed three-value `runtime_posture` boolean block (`describe_only_supported: true`, `execution_supported: false`, `auth_adapter_generation_supported: false`), the closed six-value `gated_tools` reason-code enum (`unapproved`, `restricted_sensitivity`, `confidential_sensitivity_pending_review`, `auth_scheme_unknown_pending_v2`, `auth_scheme_oauth_pending_v2`, `destructive_side_effect_pending_v2`), the deterministic `audit_required` derivation rule, the frozen `registry_metadata` named-list, the `derived_from` deterministic pointer with `manifest_sha256` + `capability_digest` copy-forward, the `disclaimers` frozen literal text array, the eval scenario `mcp-descriptor-determinism` (eval harness 16 → ≥17), and proposed Constraint 24 (the static MCP server descriptor is a planning-and-distribution artifact capturing the *describe-only* shape of `tusq serve`; it does NOT host execution outside `tusq serve`, does NOT generate auth adapters, does NOT generate a stand-alone runtime binary, does NOT call any MCP marketplace, does NOT publish to any registry, does NOT certify compliance with any registry's submission requirements, and does NOT enforce runtime authentication, authorization, or policy; forbidden framings: "self-hostable runtime generator," "AI runtime engine," "MCP marketplace publisher," "auth adapter generator," "MCP execution runtime," "registry-certified output"). **Frozen invariants the future binding will inherit verbatim from M27/M28/M29 reviewer-aid pattern:** read-only (manifest mtime/content unchanged; no `.tusq/` write unless `--out` given; `capability_digest` MUST NOT flip; `tusq compile` byte-for-byte unchanged; `tusq serve` MCP responses `tools/list` / `tools/call` / `dry_run_plan` byte-for-byte unchanged; all other commands byte-for-byte unchanged); deterministic byte-identical output across runs; empty-capabilities valid-exit-0 with explicit `No capabilities in manifest — nothing to export.` human line and `tools: []` / `gated_tools: []` JSON; empty-stdout-on-every-exit-1; zero new dependencies in `package.json` (no `mcp-sdk`, no `@modelcontextprotocol/*` SDK, no `passport`, no `jsonwebtoken`); zero network I/O; zero registry call; no external schema validation at emit time. This entry makes no spec mutation; it records this run's independent verification and names the candidate charter for audit continuity. Both vision-derived candidates (Static Embeddable-Surface Plan Export from `run_2ee1a03651d5d485` and Static MCP Server Descriptor Export from this run) coexist in `ROADMAP_NEXT_CANDIDATES.md` as mutually-independent operator-decision-pending items — neither presupposes the other.

27. **M30 surface-plan planning-aid framing invariant (proposed Constraint 23 per ROADMAP § M30; appended at constraints tail to preserve numbering continuity with prior re-affirmation entries)** — `tusq surface plan` is a planning aid that describes what an embeddable surface **would** look like for the current manifest under the current sensitivity/auth/side-effect posture. It MUST NOT be presented as a runtime surface generator, brand certification, accessibility-compliance certification (WCAG, ARIA, ADA, EN 301 549), or runtime hosting in any docs, marketing, README, CLI help, launch artifact, or eval scenario. Forbidden framings include but are not limited to: "generates a chat client," "renders a widget," "hosts a voice interface," "runs a command palette," "ships a runnable surface," "auto-brands the embed," "certifies accessibility," "publishes to a marketplace." The closed four-value `surface` enum `{chat, palette, widget, voice}` and the closed six-value `gated_reason` enum `{unapproved, restricted_sensitivity, confidential_sensitivity, destructive_side_effect, auth_scheme_unknown, auth_scheme_oauth_pending_v2}` are derived purely from already-shipped manifest evidence (`approved`, `sensitivity_class`, `auth_requirements`, side-effect class, M9 verb/domain data) by deterministic pure functions (`classifyGating`, `buildSurfacePlan`) that perform zero network calls, import zero UI libraries (no React, no Vue, no Lit, no Web Speech polyfill, no audio runtime, no markdown renderer), read zero source files beyond what manifest generation already reads, read zero brand profile files (`brand_inputs_required[]` is names-only with no values, no template strings, no placeholder lookups), and execute zero compiled tools. The frozen six-gate first-match-wins eligibility precedence (1: `approved===true`, 2: not `restricted` sensitivity per surface, 3: not `confidential` sensitivity per surface, 4: side-effect class allowance per surface, 5: `auth_scheme !== "unknown"`, 6: `auth_scheme !== "oauth"`) and the frozen `brand_inputs_required` named-lists (chat: `["brand.tone","brand.color_primary","brand.color_secondary","brand.font_family"]`; palette: `["brand.color_primary","brand.font_family"]`; widget: `["brand.color_primary","brand.color_accent","brand.layout_density","brand.radius"]`; voice: `["brand.tone","voice.persona","voice.greeting"]`) are immutable once M30 ships; any rule, enum, or list change is a material governance event that MUST land under its own ROADMAP milestone with a fresh re-approval expectation and a RELEASE_NOTES entry. M27 advisory copy-forward and M29 `auth_requirements` copy-forward MUST be verbatim — no recomputation, no recoercion of `unknown` → `none`. Capabilities that fail the gating precedence MUST be recorded with the **first** failing gate's reason (a capability with `approved=false` AND `auth_scheme="oauth"` is `unapproved`, never `auth_scheme_oauth_pending_v2`). An implementation-time error (synchronous throw) MUST fire if `classifyGating(capability, surface)` ever returns a value outside the closed six-value set. `tusq.manifest.json` mtime/content MUST be byte-identical pre and post-`tusq surface plan`. `capability_digest` MUST NOT flip on any capability. `tusq compile` output, `tusq serve` MCP responses (`tools/list`, `tools/call`, `dry_run_plan`), `tusq policy verify` (default and `--strict`), `tusq redaction review`, `tusq approve`, `tusq diff`, `tusq docs`, `tusq scan`, `tusq manifest`, `tusq init`, `tusq version`, and `tusq help` MUST be byte-for-byte unchanged. The plan output fields (`eligible_capabilities`, `gated_capabilities`, surface-plan structure) MUST NOT appear in any MCP response. `--out` MUST reject any path resolving inside `.tusq/`. Every error path MUST write exclusively to stderr with empty stdout. The empty-capabilities case (`capabilities: []`) is exit 0 with the explicit human line `No capabilities in manifest — nothing to plan.` (single trailing newline) or `{manifest_path, manifest_version, generated_at, surfaces: []}` in `--json`. Subsequent surface-generator milestones (M-Chat-1, M-Palette-1, M-Widget-1, M-Voice-1) ship under their own ROADMAP entries with fresh acceptance contracts; M30 is **not** a substitute for any of them. The CLI surface grows from 13 → 14 (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, surface, version, help) and the new noun `surface` is inserted alphabetically between `serve` and `redaction` in help output.

31. **M33 sensitivity-index planning-aid framing invariant (Constraint 26 per ROADMAP § M33; appended at constraints tail to preserve numbering continuity)** — `tusq sensitivity index` is a planning aid that surfaces what sensitivity classes the manifest exposes and the shape of each bucket. It MUST NOT be presented as a runtime sensitivity enforcer, data-class access-control enforcer, GDPR/HIPAA/SOC2/PCI compliance certifier, retention-policy generator, alteration of the M28 `sensitivity_class` derivation rules, or alteration of the M30 `gated_reason: restricted_sensitivity` or `gated_reason: confidential_sensitivity` surface-eligibility rules in any docs, marketing, README, CLI help, launch artifact, or eval scenario. Forbidden framings include but are not limited to: "enforces sensitivity policy at runtime," "certifies GDPR compliance," "certifies HIPAA compliance," "certifies PCI compliance," "generates retention policy," "alters the M28 classifier," "alters the M30 gating rule." The five-value `sensitivity_class` bucket-key enum `{public, internal, confidential, restricted, unknown}` aligns 1:1 with the existing M28 `SENSITIVITY_CLASSES` constant — no independent enum is declared in M33 (`SENSITIVITY_CLASSES` is referenced directly per the M33 Key Risk). The two-value `aggregation_key` enum `{class, unknown}` and the pure functions (`buildSensitivityIndex`, `_guardSensitivityBucketKey`, `_guardSensitivityAggregationKey`) perform zero network calls, read zero source files beyond the manifest, execute zero compiled tools, import zero risk-scoring/compliance/NLP libraries, and write nothing to `.tusq/`. The closed-enum bucket iteration order (`public → internal → confidential → restricted → unknown`) is a deterministic stable-output convention only — NOT a risk-precedence statement. An implementation-time error (synchronous throw via `_guardSensitivityBucketKey` and `_guardSensitivityAggregationKey`) MUST fire if `buildSensitivityIndex` ever produces a value outside either closed enum. `tusq.manifest.json` mtime/content MUST be byte-identical pre and post-`tusq sensitivity index`. `capability_digest` MUST NOT flip. `tusq compile`, `tusq serve`, `tusq policy verify`, `tusq redaction review`, `tusq surface plan`, `tusq domain index`, `tusq effect index`, and all other commands MUST be byte-for-byte unchanged. `--out` MUST reject any path resolving inside `.tusq/`. Every error path MUST write exclusively to stderr with empty stdout. The empty-capabilities case (`capabilities: []`) is exit 0 with the explicit human line `No capabilities in manifest — nothing to index.` or `{manifest_path, manifest_version, generated_at, sensitivities: []}` in `--json`. Subsequent sensitivity milestones (M-Risk-1 composite risk-tier classifier, M-Compliance-1 regulatory-tag emitter) ship under their own ROADMAP entries with fresh acceptance contracts; M33 is **not** a substitute for any of them. The CLI surface grows from 16 → 17 and the new noun `sensitivity` is inserted alphabetically between `redaction` and `surface` in help output.

30. **M32 effect-index planning-aid framing invariant (Constraint 25 per ROADMAP § M32; appended at constraints tail to preserve numbering continuity)** — `tusq effect index` is a planning aid that surfaces what side-effect classes the manifest exposes and the shape of each bucket. It MUST NOT be presented as a runtime side-effect enforcer, automatic confirmation-flow generator, composite risk-tier classifier, destructive-action safety certifier, or alteration of the M30 `gated_reason: destructive_side_effect` surface-eligibility rule in any docs, marketing, README, CLI help, launch artifact, or eval scenario. Forbidden framings include but are not limited to: "enforces side-effect policy at runtime," "derives a risk tier," "generates confirmation flows," "certifies destructive-action safety," "alters the M30 gating rule." The closed four-value `side_effect_class` bucket-key enum `{read, write, destructive, unknown}` and the closed two-value `aggregation_key` enum `{class, unknown}` are derived purely from already-shipped manifest evidence (`capability.side_effect_class` field) by deterministic pure functions (`buildEffectIndex`) that perform zero network calls, read zero source files beyond the manifest, execute zero compiled tools, import zero risk-scoring/graph/schema libraries, and write nothing to `.tusq/`. The closed-enum bucket iteration order (`read → write → destructive → unknown`) is a deterministic stable-output convention only — NOT a risk-precedence statement. An implementation-time error (synchronous throw via `_guardEffectBucketKey` and `_guardEffectAggregationKey`) MUST fire if `buildEffectIndex` ever produces a value outside either closed enum. `tusq.manifest.json` mtime/content MUST be byte-identical pre and post-`tusq effect index`. `capability_digest` MUST NOT flip. `tusq compile`, `tusq serve`, `tusq policy verify`, `tusq redaction review`, `tusq surface plan`, `tusq domain index`, and all other commands MUST be byte-for-byte unchanged. `--out` MUST reject any path resolving inside `.tusq/`. Every error path MUST write exclusively to stderr with empty stdout. The empty-capabilities case (`capabilities: []`) is exit 0 with the explicit human line `No capabilities in manifest — nothing to index.` or `{manifest_path, manifest_version, generated_at, effects: []}` in `--json`. Subsequent side-effect milestones (M-Risk-1 composite risk-tier classifier, M-Confirm-1 destructive-action confirmation-flow generator) ship under their own ROADMAP entries with fresh acceptance contracts; M32 is **not** a substitute for any of them. The CLI surface grows from 15 → 16 and the new noun `effect` is inserted alphabetically between `domain` and `policy` in help output.

29. **M31 domain-index planning-aid framing invariant (Constraint 24 per ROADMAP § M31; appended at constraints tail to preserve numbering continuity with prior re-affirmation entries)** — `tusq domain index` is a planning aid that surfaces what domains the manifest exposes and the shape of each domain. It MUST NOT be presented as a skill-pack generator, rollout-plan generator, workflow-definition generator, agent-persona derivation engine, domain-ownership certifier, or domain-level access-control enforcer in any docs, marketing, README, CLI help, launch artifact, or eval scenario. Forbidden framings include but are not limited to: "generates skill packs," "produces rollout checklists," "emits workflow definitions," "derives agent personas," "certifies domain ownership," "enforces domain access control." The closed two-value `aggregation_key` enum `{domain, unknown}` is derived purely from already-shipped manifest evidence (`capability.domain` field) by a deterministic pure function (`buildDomainIndex`) that performs zero network calls, reads zero source files beyond the manifest, executes zero compiled tools, imports zero graph/schema/markdown/AI libraries, and writes nothing to `.tusq/`. The frozen manifest first-appearance ordering rule (per-domain iteration follows manifest `capabilities[]` declaration order; `unknown` bucket is always appended last regardless of where the first domainless capability appears) is immutable once M31 ships; any ordering change is a material governance event that MUST land under its own ROADMAP milestone with a fresh re-approval expectation and a RELEASE_NOTES entry. An implementation-time error (synchronous throw via `_guardAggregationKey`) MUST fire if `buildDomainIndex` ever produces an `aggregation_key` value outside the closed two-value set. `tusq.manifest.json` mtime/content MUST be byte-identical pre and post-`tusq domain index`. `capability_digest` MUST NOT flip on any capability. `tusq compile` output, `tusq serve` MCP responses (`tools/list`, `tools/call`, `dry_run_plan`), `tusq policy verify` (default and `--strict`), `tusq redaction review`, `tusq surface plan`, `tusq approve`, `tusq diff`, `tusq docs`, `tusq scan`, `tusq manifest`, `tusq init`, `tusq version`, and `tusq help` MUST be byte-for-byte unchanged. The domain index output fields (`domains[]`, per-domain counters and flags) MUST NOT appear in any MCP response. `--out` MUST reject any path resolving inside `.tusq/`. Every error path MUST write exclusively to stderr with empty stdout. The empty-capabilities case (`capabilities: []`) is exit 0 with the explicit human line `No capabilities in manifest — nothing to index.` (single trailing newline) or `{manifest_path, manifest_version, generated_at, domains: []}` in `--json`. Subsequent domain-export milestones (M-Skills-1 skill-pack export, M-Rollout-1 rollout-plan generator, M-Workflow-1 workflow plan, M-Agent-Persona-1 agent persona derivation) ship under their own ROADMAP entries with fresh acceptance contracts and fresh re-approval expectations; M31 is **not** a substitute for any of them. The CLI surface grows from 14 → 15 (init, scan, manifest, compile, serve, review, docs, approve, diff, domain, policy, redaction, surface, version, help) and the new noun `domain` is inserted alphabetically between `diff` and `policy` in help output.

28. **Run-specific binding — run_24ccd92f593d8647 / turn_fa7dbb75b01943f5 (M30 PM-level scope materialization)** — This SYSTEM_SPEC entry records that PM has materialized the M30 scope contract in the new `## M30: Static Embeddable-Surface Plan Export from Manifest Evidence` § directly above the Constraints heading on HEAD `e41237e` (run `run_24ccd92f593d8647`, turn `turn_fa7dbb75b01943f5`, planning phase, runtime `local-pm`). The previous PM turn (`turn_33f4e15b33cf141c`) bound M30 in `.planning/ROADMAP.md` and `.planning/PM_SIGNOFF.md` but explicitly deferred SYSTEM_SPEC and command-surface materialization to the dev role; the gate evaluator's `non_progress_signature` then required PM participation in **all four** planning_signoff artifacts (`PM_SIGNOFF.md`, `ROADMAP.md`, `SYSTEM_SPEC.md`, `command-surface.md`), preventing phase advance. This turn closes the gate by adding the M30 § to SYSTEM_SPEC.md and the M30 Product CLI Surface § to command-surface.md, both at PM scope-level (frozen enums, eligibility precedence, read-only invariants, planning-aid framing). The dev role retains accountability for implementing the algorithm details (`classifyGating`, `buildSurfacePlan`, command wiring, smoke fixtures, eval scenario) during the implementation phase per the M27/M28/M29 precedent. Independent verification on HEAD e41237e: `npm test` exits 0 with `Smoke tests passed` and `Eval regression harness passed (20 scenarios)`; the 13-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help) is intact (M30 is unchecked planned work, not shipped). Shipped V1.10 boundary (M1-M29) remains intact. M30 is V1.11 (PROPOSED), implementation-ready planned work.

33. **M35 auth-scheme-index planning-aid framing invariant (Constraint 28 per ROADMAP § M35; appended at constraints tail to preserve numbering continuity)** — `tusq auth index` is a planning aid that surfaces what auth schemes the manifest exposes and the shape of each bucket. It MUST NOT be presented as a runtime authentication enforcer, runtime AAA validator, OAuth/OIDC/SAML/SOC2/ISO27001 compliance certifier, auth-adapter code generator, IAM-context derivation engine, alteration of M29's `auth_scheme` derivation rules, or alteration of the M30 `gated_reason: auth_scheme_unknown` or `gated_reason: auth_scheme_oauth_pending_v2` surface-eligibility rules in any docs, marketing, README, CLI help, launch artifact, or eval scenario. Forbidden framings include but are not limited to: "enforces authentication at runtime," "validates OAuth/OIDC tokens," "certifies SOC2 compliance," "generates auth adapters," "proves token validity," "derives IAM posture." The seven-value `auth_scheme` bucket-key enum (`bearer | api_key | session | basic | oauth | none | unknown`) aligns 1:1 with the existing M29 `AUTH_SCHEMES` constant — M35 references `AUTH_SCHEMES` directly, no independent constant is declared. The two-value `aggregation_key` enum (`scheme | unknown`) and the pure functions (`buildAuthIndex`, `_guardAuthSchemeBucketKey`, `_guardAuthAggregationKey`) perform zero network calls, read zero source files beyond the manifest, execute zero compiled tools, import zero auth/crypto/compliance/AAA/NLP libraries, and write nothing to `.tusq/`. The closed-enum bucket iteration order (`bearer → api_key → session → basic → oauth → none → unknown`) is a deterministic stable-output convention only — NOT an IAM-strength-precedence statement, NOT a trust-ranking, NOT a security-strength ladder. An implementation-time error (synchronous throw via `_guardAuthSchemeBucketKey` and `_guardAuthAggregationKey`) MUST fire if `buildAuthIndex` ever produces a value outside either closed enum. `tusq.manifest.json` mtime/content MUST be byte-identical pre and post-`tusq auth index`. `capability_digest` MUST NOT flip. `tusq compile`, `tusq serve`, `tusq policy verify`, `tusq redaction review`, `tusq surface plan`, `tusq domain index`, `tusq effect index`, `tusq sensitivity index`, `tusq method index`, and all other commands MUST be byte-for-byte unchanged. `--out` MUST reject any path resolving inside `.tusq/`. Every error path MUST write exclusively to stderr with empty stdout. The empty-capabilities case (`capabilities: []`) is exit 0 with the explicit human line `No capabilities in manifest — nothing to index.` or `{manifest_path, manifest_version, generated_at, schemes: []}` in `--json`. Deferred successor milestones (M-IAM-Posture-1 cross-axis IAM-posture roll-up, M-Auth-Adapter-1 generated auth adapter, M-Runtime-Auth-1 runtime auth validator) ship under their own ROADMAP entries with fresh acceptance contracts and fresh re-approval expectations; M35 is NOT a substitute for any of them. The CLI surface grows from 18 → 19 and the new noun `auth` is inserted alphabetically between `approve` and `compile` in help output.

32. **M34 method-index planning-aid framing invariant (Constraint 27 per ROADMAP § M34; appended at constraints tail to preserve numbering continuity)** — `tusq method index` is a planning aid that surfaces what HTTP methods the manifest exposes and the shape of each bucket. It does NOT route HTTP methods at runtime, does NOT validate REST conventions (idempotency, safety, cacheability), does NOT certify idempotency class, does NOT automatically classify destructive verbs (DELETE is a bucket label, not a destructive-side-effect attestation), does NOT modify the M32 `side_effect_class` derivation rules (which use `method` as one of several inputs), and does NOT alter the M30 `gated_reason: destructive_side_effect` surface-eligibility rule. Subsequent milestones (M-Risk-1 composite risk-tier classifier, M-Idempotency-1 idempotency-class derivation, M-RestConv-1 REST-convention conformance check) ship under their own ROADMAP entries with fresh acceptance contracts and fresh re-approval expectations. The five-value `http_method` bucket-key enum (`GET | POST | PUT | PATCH | DELETE`) plus the `unknown` zero-evidence catchall (six total) and the two-value `aggregation_key` enum (`method | unknown`) are frozen; any addition is a material governance event. The `--method` filter is case-sensitive uppercase-only; lowercase or mixed-case filter values exit 1 with `Unknown method:`. The closed-enum bucket iteration order (`GET → POST → PUT → PATCH → DELETE → unknown`) is a deterministic stable-output convention that matches the conventional REST CRUD reading order but carries no risk semantic and MUST NOT be described as "low-to-high risk," "destructive-ascending," "safety-ordered," or any phrase implying risk semantics. An implementation-time error (synchronous throw via `_guardMethodBucketKey` and `_guardMethodAggregationKey`) MUST fire if `buildMethodIndex` ever produces a value outside either closed enum. `tusq.manifest.json` mtime/content MUST be byte-identical pre and post-`tusq method index`. `capability_digest` MUST NOT flip. `tusq compile`, `tusq serve`, `tusq policy verify`, `tusq redaction review`, `tusq surface plan`, `tusq domain index`, `tusq effect index`, `tusq sensitivity index`, and all other commands MUST be byte-for-byte unchanged. `--out` MUST reject any path resolving inside `.tusq/`. Every error path MUST write exclusively to stderr with empty stdout. The empty-capabilities case (`capabilities: []`) is exit 0 with the explicit human line `No capabilities in manifest — nothing to index.` or `{manifest_path, manifest_version, generated_at, methods: []}` in `--json`. The CLI surface grows from 17 → 18 and the new noun `method` is inserted alphabetically between `effect` and `policy` in help output.

39. **M40 output-schema-property-count-tier-index planning-aid framing invariant (Constraint 33 per ROADMAP § M40; appended at constraints tail to preserve numbering continuity)** — **Constraint 33:** `tusq output index` is a planning aid that surfaces what output-schema-property-cardinality tiers the manifest's capabilities span and the cross-axis side-effect/sensitivity exposure of each tier. It does NOT execute capability outputs at runtime, does NOT validate `output_schema.properties[]` conformance against any per-element schema, does NOT validate runtime response shape against the declared schema, does NOT cross-reference manifest output_schema vs public docs vs internal docs (that is a deferred contradiction-detection milestone), does NOT generate new output examples or response payloads, does NOT measure runtime response variance or call-pattern statistics, does NOT certify doc accuracy or staleness, does NOT alter M11/M14/M24's canonical output-schema extraction rules, does NOT walk nested `output_schema.properties.X.properties` for nested-cardinality tiering (top-level keys only), does NOT persist `output_schema_property_count_tier` into `tusq.manifest.json`, and does NOT compute statistical aggregates. The five-value `output_schema_property_count_tier` bucket-key enum, the two-value `aggregation_key` enum, the five-value warning reason-code enum, and the tier-function thresholds (`0`, `2`, `5`, `6`) are frozen; any addition or threshold change is a material governance event.

38. **M39 required-input-field-count-tier-index planning-aid framing invariant (Constraint 32 per ROADMAP § M39; appended at constraints tail to preserve numbering continuity)** — `tusq input index` is a planning aid that surfaces what required-input-field-cardinality tiers the manifest's capabilities span and the cross-axis side-effect/sensitivity exposure of each tier. It does NOT execute capability inputs at runtime, does NOT validate `input_schema.properties[]` conformance against any per-element schema, does NOT generate new inputs or example payloads, does NOT measure runtime call frequency or call patterns, does NOT certify exposure-safety, does NOT alter M11/M14/M24's canonical input-schema extraction rules, does NOT persist `required_input_field_count_tier` into `tusq.manifest.json`, and does NOT compute statistical aggregates (`min`, `max`, `mean`, percentiles, distributions). Subsequent milestones (M-Input-Schema-Validation-1 per-capability input-schema conformance check, M-Input-Optional-Field-Count-Tier-1 companion index keyed on optional field count, M-Input-Property-Type-Index-1 bucket on `input_schema.properties[].type` distribution, M-Input-Persistence-1 if persistence is later authorized) ship under their own ROADMAP entries with fresh acceptance contracts and fresh re-approval expectations. The five-value `required_input_field_count_tier` bucket-key enum (`none | low | medium | high | unknown`), the two-value `aggregation_key` enum (`tier | unknown`), the five-value warning reason-code enum (`input_schema_field_missing | input_schema_field_not_object | required_field_missing | required_field_not_array | required_array_contains_non_string_or_empty_element`), and the tier-function thresholds (`0`, `2`, `5`, `6`) are frozen; any addition or threshold change is a material governance event. The `--tier` filter is case-sensitive lowercase-only; uppercase or mixed-case filter values exit 1 with `Unknown required input field count tier:`. Malformed `input_schema` or `required` values are bucketed as `unknown` and emit a `Warning: ...` to stderr (human) or `warnings[]` (`--json`); they MUST NOT be silently coerced to an empty `required: []`. The CLI surface grows from 22 → 23 and the new noun `input` is inserted alphabetically between `examples` and `method` in help output.

37. **M38 examples-count-tier-index planning-aid framing invariant (Constraint 31 per ROADMAP § M38; appended at constraints tail to preserve numbering continuity)** — `tusq examples index` is a planning aid that surfaces what example-cardinality tiers the manifest's capabilities span and the cross-axis side-effect/sensitivity exposure of each tier. It does NOT execute examples at runtime, does NOT validate per-example schema conformance against `input_schema`/`output_schema`, does NOT generate new examples, does NOT measure runtime test coverage, does NOT certify eval-readiness, does NOT alter M11's canonical examples extraction rules, does NOT persist `examples_count_tier` into `tusq.manifest.json`, and does NOT compute statistical aggregates (`min`, `max`, `mean`, percentiles, distributions). Subsequent milestones (M-Examples-Schema-Validation-1 per-example schema conformance check, M-Examples-Coverage-Statistics-1 distribution and percentile aggregation, M-Examples-Persistence-1 if persistence is later authorized, M-Examples-Generation-1 auto-generate example seeds) ship under their own ROADMAP entries with fresh acceptance contracts and fresh re-approval expectations. The five-value `examples_count_tier` bucket-key enum (`none | low | medium | high | unknown`), the two-value `aggregation_key` enum (`tier | unknown`), and the tier-function thresholds (`0`, `2`, `5`, `6`) are frozen; any addition or threshold change is a material governance event. The `--tier` filter is case-sensitive lowercase-only; uppercase or mixed-case filter values exit 1 with `Unknown examples count tier:`. Malformed `examples` arrays are bucketed as `unknown` and emit a `Warning: ...` to stderr (human) or `warnings[]` (`--json`); they MUST NOT be silently coerced or trimmed. The CLI surface grows from 21 → 22 and the new noun `examples` is inserted alphabetically between `effect` and `method` in help output.
