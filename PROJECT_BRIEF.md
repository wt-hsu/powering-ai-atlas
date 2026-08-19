# Powering AI: Global Infrastructure Deal Atlas

## Project Brief / Development Specification v0.1

> **Note.** This is the original v0.1 specification, retained as the project's
> founding document. Where it conflicts with `docs/DATA_DICTIONARY.md` or
> `docs/DECISIONS.md`, those documents supersede it — in particular the table
> definitions in §6, the v0.1 scope in §4.2, and the schedule in §11.

---


> **Implementation instruction:** Read this document in full before modifying the repository. Treat the scope, data-integrity rules, licensing constraints, security rules, and definitions of done as binding unless the project owner explicitly changes them.

---

## 0. Document metadata

| Item | Value |
|---|---|
| Document version | 0.1 |
| Status | Draft ready for implementation |
| Last updated | 2026-08-19 |
| Project owner | Wanting Hsu |
| Working product name | **Powering AI: Global Infrastructure Deal Atlas** |
| Working repository name | `powering-ai-atlas` |
| Initial repository visibility | Private |
| Target public release | `v0.1.0`, target 2026-08-29 |
| Target LinkedIn launch | 2026-08-31 |
| Default product language | English / Traditional Chinese |
| Project identity | Independent public-data research project |

This specification is the initial source of truth for product, data, and implementation decisions. If implementation reveals a conflict or ambiguity, the implementer should document it in `docs/DECISIONS.md` and request a decision only when the issue materially changes scope, licensing, public claims, or architecture.

---

## 1. Executive summary

The project is an English-first, source-linked, open-data product that tracks how selected major AI infrastructure projects secure:

- land and site control;
- power and grid access;
- data-center shell and delivery capacity;
- long-term customers or tenants;
- equity, debt, guarantees, and other credit support;
- permitting, construction, energization, and commercial milestones.

The product is **not** intended to be another exhaustive directory of every data center in the world. Existing public and commercial directories already compete on facility count. This project differentiates itself through comparability, evidence quality, commercial structure, and explicit treatment of uncertainty.

The central product question is:

> **Where are major AI infrastructure projects being developed, what has actually been announced, contracted, financed, constructed, or energized, what does each reported MW figure mean, and which party bears each major delivery and commercial risk?**

---

## 2. Why this project exists

### 2.1 Learning purpose

The project should help the owner develop working fluency in AI and data-center infrastructure terminology, including:

- site control;
- speed to power;
- interconnection agreement;
- utility service capacity;
- IT load;
- facility load;
- generation nameplate capacity;
- power usage effectiveness (PUE);
- commercial operation date (COD);
- lease, take-or-pay, and offtake structures;
- power purchase agreement (PPA);
- capital stack;
- credit enhancement;
- lease or power-payment guarantee;
- counterparty risk;
- residual-value risk.

The data model and user interface must make important terminology visible and teachable. The glossary is a first-class dataset, not an appendix.

### 2.4 Open-data purpose

The project should make a small, high-quality, source-linked compilation reusable by other researchers and practitioners. Completeness is secondary to traceability and comparability.

---

## 3. Product positioning

### 3.1 Working tagline

> **A source-linked, open dataset tracking how major AI infrastructure projects secure land, power, capacity, capital, and long-term customers.**

### 3.2 Primary differentiation

| Common directory approach | Powering AI Atlas approach |
|---|---|
| Maximize facility count | Curate selected decision-relevant projects |
| One location equals one record | Treat the campus/project and its phases as the unit of analysis |
| Store one ambiguous `capacity_mw` value | Store capacity events with an explicit capacity basis and status |
| List operator and address | Model developer, owner, operator, tenant, utility, lender, and guarantor roles |
| Hide missing or conflicting information | Surface disclosure status, source tier, and uncertainty |
| Show dots on a map | Explain development stage, commercial structure, and risk allocation |

### 3.3 Naming rule

Do not use **AIDC** as the primary English product label. In international technology markets, AIDC commonly refers to *Automatic Identification and Data Capture*. Preferred external terms are:

- AI data center;
- AI infrastructure;
- AI factory;
- hyperscale data center;
- high-performance computing (HPC) infrastructure.

### 3.4 Target users

Primary:

- AI and data-center infrastructure professionals;
- energy, utility, and power-market professionals;
- infrastructure investors, lenders, and advisers;
- corporate strategy, partnerships, and site-development teams;
- researchers and journalists requiring source-linked public facts.

Secondary:

- MBA admissions readers and recruiters evaluating the owner's work;
- students learning the AI infrastructure value chain;
- open-source contributors proposing corrections.

---

## 4. Product scope

### 4.1 Minimum Credible Release (MCR)

The MCR proves the data model and end-to-end workflow before the dataset is expanded.

Required:

- 8 verified projects;
- at least 3 geographic regions;
- 20 glossary terms;
- all published project claims linked to sources;
- a working map;
- project filters;
- a project detail panel;
- CSV and GeoJSON downloads;
- methodology and data-dictionary pages;
- automated schema validation.

The repository may remain private during MCR development.

### 4.2 Public v0.1 scope

Target:

- 20–25 selected major projects;
- at least 5 geographic regions, where evidence permits;
- 40 glossary terms;
- at least one authoritative source for every published project;
- two independent or complementary sources where a material capacity, investment, contract, or financing claim requires corroboration;
- one interactive global project map;
- one pipeline/status visualization;
- one capacity-basis visualization;
- one reusable project/deal card;
- CSV, GeoJSON, and JSON downloads;
- contribution and correction workflow through GitHub Issues.

### 4.3 Initial time boundary

Default inclusion period:

- projects announced, materially expanded, newly contracted, financed, or under construction from **2024-01-01 onward**.

An older project may be included only as an explicitly labeled benchmark and only when it materially improves comparison.

### 4.4 Unit of analysis

The primary unit is a **publicly identifiable campus or infrastructure project**, not an individual server room, cloud availability zone, generic company region, or every building within a campus.

Separate phases of a campus should initially be represented through capacity events and milestone fields. A separate project record should be created only when the phase has a meaningfully different location, ownership structure, contract, or development identity.

### 4.5 Inclusion criteria

A project is eligible when all required conditions are met:

1. A campus/project is publicly identifiable at least at region, city, or publicly disclosed campus level.
2. A first-party, regulatory, government, or other sufficiently authoritative source confirms its existence.
3. AI, AI factory, AI data center, HPC, GPU infrastructure, or a materially AI-driven hyperscale use case is explicitly supported by evidence.
4. At least one decision-relevant attribute is publicly disclosed, such as:
   - reported capacity;
   - planned investment;
   - developer, owner, operator, tenant, or offtaker;
   - power or utility arrangement;
   - financing or guarantee;
   - permitting, construction, energization, or operation milestone.
5. The available information can be recorded without violating source terms or exposing non-public sensitive information.

### 4.6 Exclusions

Do not publish:

- rumors or projects supported only by social-media speculation;
- records copied in bulk from proprietary or restricted directories;
- exact coordinates inferred from private sources or satellite imagery;
- confidential NTU E3, Deloitte, client, partner, or prospective-member information;
- data-center facilities with no evidence of AI/HPC relevance in the initial release;
- personal contact information;
- operational-vulnerability, security-system, or critical-infrastructure details beyond ordinary public project facts;
- model-generated estimates presented as reported facts;
- a composite site-readiness or bankability score in v0.1.

### 4.7 Required public limitation statement

The product and README must state prominently:

> **This atlas covers selected publicly announced projects and is not a complete directory of global data centers. Capacity figures use different reporting bases and should not be aggregated unless the basis and status are comparable.**

---

## 5. Product principles

1. **Source-linked:** Every material public fact is traceable to a source record.
2. **Capacity-aware:** A MW value is never published without a capacity basis.
3. **Milestone-aware:** Announced, contracted, financed, permitted, constructed, energized, and operational are not interchangeable.
4. **Uncertainty-visible:** Unknown, undisclosed, estimated, and conflicting values are not silently resolved.
5. **No false precision:** City or regional coordinates must not be represented as exact campus coordinates.
6. **Open by design:** Processed public data and methodology should be downloadable and understandable.
7. **English-first:** Public UI, field names, glossary, README, and launch materials are in English.
8. **Static-first:** v0.1 should run without a server-side application or database.
9. **Accessible:** Visual encodings must not rely solely on color; text contrast and keyboard interaction should be considered.
10. **Decision-oriented:** Every feature should help a user understand project maturity, capacity meaning, counterparties, or risk.

---

## 6. Dataset architecture

The public source of truth consists of five normalized CSV files. Derived JSON and GeoJSON files are build artifacts, not manually edited source files.

### 6.1 `projects.csv`

One row per campus/project.

| Field | Type | Required | Description |
|---|---|---:|---|
| `project_id` | string slug | Yes | Stable identifier; never reuse for another project |
| `project_name` | string | Yes | Publicly recognizable project/campus name |
| `project_aliases` | pipe-delimited string | No | Other public names |
| `country_iso3` | ISO 3166-1 alpha-3 | Yes | Country code |
| `admin1` | string | No | State/province/first-level division |
| `city` | string | No | Publicly disclosed city |
| `latitude` | decimal | Conditional | Required only when a publishable coordinate exists |
| `longitude` | decimal | Conditional | Required only when a publishable coordinate exists |
| `geo_precision` | enum | Yes | `CAMPUS`, `CITY`, or `REGION` |
| `workload_class` | enum | Yes | `AI_FACTORY`, `AI_DATA_CENTER`, `HPC`, or `HYPERSCALE_MIXED` |
| `ai_evidence_summary` | string | Yes | Short factual explanation of AI/HPC relevance |
| `ai_evidence_source_id` | source ID | Yes | Source supporting workload classification |
| `current_stage` | enum | Yes | Current controlled development stage |
| `announcement_date` | ISO date | No | Earliest verified public announcement date |
| `expected_cod` | ISO date or year | No | Publicly stated expected commercial operation date |
| `operational_date` | ISO date or year | No | Verified operation date, if applicable |
| `status_as_of` | ISO date | Yes | Date current stage was last assessed |
| `project_summary` | string | Yes | Concise neutral summary; no promotional prose |
| `last_verified` | ISO date | Yes | Latest review date |
| `publication_status` | enum | Yes | `DRAFT`, `REVIEWED`, or `PUBLISHED` |

Do **not** add a generic `capacity_mw` field to this table.

### 6.2 `capacity_events.csv`

One row per reported capacity figure, project phase, and reporting context.

| Field | Type | Required | Description |
|---|---|---:|---|
| `capacity_event_id` | string slug | Yes | Stable event ID |
| `project_id` | foreign key | Yes | Links to `projects.csv` |
| `phase_name` | string | No | Project phase, building, or tranche |
| `capacity_value_mw` | decimal | Conditional | Numeric MW value when disclosed |
| `capacity_disclosure_status` | enum | Yes | `DISCLOSED`, `NOT_DISCLOSED`, `RANGE`, or `CONFLICTING` |
| `capacity_basis` | enum | Yes | Basis defined below |
| `capacity_status` | enum | Yes | `ANNOUNCED`, `CONTRACTED`, `CONNECTED`, `ENERGIZED`, or `OPERATIONAL` |
| `reported_date` | ISO date | Yes | Date the figure was reported |
| `expected_cod` | ISO date or year | No | Expected operation date for the relevant capacity |
| `source_id` | source ID | Yes | Evidence for this value |
| `source_quote_or_locator` | short string | No | Short locator, table/page/section; avoid long quotes |
| `confidence_grade` | enum | Yes | `A`, `B`, or `C` |
| `notes` | string | No | Clarification or conflict note |

Controlled `capacity_basis` values:

- `IT_LOAD`: power delivered to computing/IT equipment;
- `FACILITY_LOAD`: total facility demand, generally including cooling and supporting systems;
- `UTILITY_SERVICE`: utility service or power-delivery capacity;
- `GRID_CONNECTION`: grid interconnection or connection-request capacity;
- `GENERATION_NAMEPLATE`: nameplate capacity of associated generation assets;
- `TRANSFORMER_CAPACITY`: transformer/substation rating where explicitly reported;
- `UNKNOWN_REPORTED_POWER`: source uses MW/GW without a sufficiently clear basis.

Never sum or visually compare unlike capacity bases without an explicit warning and separate encoding.

### 6.3 `relationships.csv`

One row per organization-role-project relationship.

| Field | Type | Required | Description |
|---|---|---:|---|
| `relationship_id` | string slug | Yes | Stable relationship ID |
| `project_id` | foreign key | Yes | Links to project |
| `organization_name` | string | Yes | Public entity name |
| `organization_alias` | string | No | Relevant alternate name |
| `role` | enum | Yes | Role defined below |
| `relationship_status` | enum | Yes | `ANNOUNCED`, `CONTRACTED`, `ACTIVE`, `ENDED`, or `NOT_DISCLOSED` |
| `contract_term_years` | decimal | No | Publicly disclosed term |
| `effective_date` | ISO date | No | Start date if disclosed |
| `source_id` | source ID | Yes | Evidence for the role |
| `notes` | string | No | Neutral clarification |

Controlled `role` values:

- `DEVELOPER`
- `LANDOWNER`
- `ASSET_OWNER`
- `OPERATOR`
- `TENANT`
- `OFFTAKER`
- `UTILITY`
- `POWER_DEVELOPER`
- `EQUIPMENT_SUPPLIER`
- `EQUITY_SPONSOR`
- `LENDER`
- `GUARANTOR`
- `GOVERNMENT_PARTNER`
- `OTHER_DISCLOSED_ROLE`

Do not infer a contractual role from a company's general involvement. Store only roles supported by evidence.

### 6.4 `sources.csv`

One row per source document or webpage.

| Field | Type | Required | Description |
|---|---|---:|---|
| `source_id` | string slug | Yes | Stable source identifier |
| `url` | URL | Yes | Direct supporting page/document URL |
| `title` | string | Yes | Source title |
| `publisher` | string | Yes | Publishing organization |
| `published_date` | ISO date | No | Publication date if available |
| `accessed_date` | ISO date | Yes | Date source was accessed |
| `source_type` | enum | Yes | Type defined below |
| `source_tier` | enum | Yes | `A`, `B`, `C`, or `DISCOVERY_ONLY` |
| `reuse_status` | enum | Yes | `OPEN_LICENSE`, `PUBLIC_FACTS_ONLY`, `RESTRICTED`, or `UNKNOWN` |
| `license_name` | string | No | Applicable license if known |
| `archive_url` | URL | No | Archived version when lawful and available |
| `notes` | string | No | Scope, limitations, or conflict note |

Controlled `source_type` values:

- `REGULATORY_FILING`
- `GOVERNMENT_DOCUMENT`
- `COMPANY_FILING`
- `COMPANY_IR_OR_PRESS_RELEASE`
- `UTILITY_OR_GRID_DOCUMENT`
- `OFFICIAL_PROJECT_PAGE`
- `WIRE_SERVICE`
- `TRADE_MEDIA`
- `OPEN_DATASET`
- `DIRECTORY`
- `OTHER`

Source tiers:

- **A:** regulator, government, official filing, utility/grid document, signed/official contractual disclosure;
- **B:** first-party company IR, official project page, or press release;
- **C:** credible wire service or trade reporting used for context or corroboration;
- **DISCOVERY_ONLY:** directory, crowdsourced map, search result, or other lead that cannot independently support publication.

### 6.5 `glossary.csv`

One row per industry term.

| Field | Type | Required | Description |
|---|---|---:|---|
| `term_id` | string slug | Yes | Stable identifier |
| `term` | string | Yes | Preferred English term |
| `acronym` | string | No | Acronym if applicable |
| `category` | enum | Yes | `LAND`, `POWER`, `SHELL`, `COMPUTE`, `FINANCE`, `CONTRACT`, `DELIVERY`, or `RISK` |
| `plain_english_definition` | string | Yes | Concise university-level definition |
| `common_confusion` | string | No | Frequent misuse or ambiguity |
| `example_project_id` | foreign key | No | Project illustrating the term |
| `source_id` | source ID | Yes | Authoritative supporting source |
| `last_verified` | ISO date | Yes | Review date |

### 6.6 Null and disclosure conventions

- Do not use `0` to mean unknown or undisclosed.
- Numeric fields remain null when not disclosed.
- Use a companion disclosure-status field when the distinction matters.
- Do not place the string `not_disclosed` inside numeric columns.
- Preserve conflicting reported values as separate events or explicit conflict notes; do not silently choose one.
- All dates use ISO 8601 where the source supports a full date. If only a year is disclosed, store it in a schema-approved year field or normalized representation; do not invent month/day values.

---

## 7. Data-source and licensing policy

### 7.1 Preferred project sources

Use, in priority order:

1. government approvals, permits, regulatory dockets, and public land or lease documents;
2. SEC or other official company filings;
3. utility, RTO/ISO, grid, or interconnection documents;
4. company investor-relations disclosures and official press releases;
5. credible wire services and specialist trade publications for corroboration;
6. directories and crowdsourced maps only as discovery leads.

### 7.2 Approved open contextual sources

The following may be considered for separate contextual layers, subject to preserving their attribution and license:

- [Natural Earth](https://www.naturalearthdata.com/) — public-domain global geography;
- [GeoNames](https://www.geonames.org/export/) — CC BY place data;
- [Ember Electricity Data Explorer](https://ember-energy.org/data/electricity-data-explorer/) — CC BY 4.0 global electricity data;
- [U.S. EIA Form EIA-860](https://www.eia.gov/electricity/data/eia860/) and other EIA public data — U.S. generation and electricity context;
- [EPA eGRID](https://www.epa.gov/egrid/detailed-data) — U.S. grid-emissions context.

Context layers are not required for the MCR. Add them only after the core project schema works.

### 7.3 Discovery-only sources and restrictions

Do not bulk ingest or redistribute data from:

- PeeringDB without explicit permission; its acceptable-use policy restricts bulk redistribution;
- Google Maps, Google Places, or Google geocoding content in ways prohibited by their service terms;
- Cloudscene, Data Center Map, or other commercial directories without a compatible license;
- FracTracker data in a commercially reusable dataset without compatible permission;
- any dataset with unclear provenance or a license incompatible with the intended public release.

An existing source being publicly viewable does not make it open data.

### 7.4 Press releases and webpages

For sources without an open-data license:

- store discrete factual observations and direct source links;
- do not copy substantial prose, tables, images, or logos;
- use short quotations only when needed to clarify a term or reported capacity basis;
- attribute the publisher and preserve the publication/access date;
- do not mirror an entire source database.

### 7.5 Project licensing intention

Subject to the final source audit:

- original code: MIT License;
- original curated dataset: CC BY 4.0;
- third-party datasets: remain under their original licenses;
- attribution and compatibility details: `THIRD_PARTY_NOTICES.md`.

Do not add a single generic `LICENSE` during initial repository creation. Before public release, add:

- `LICENSE-CODE`;
- `LICENSE-DATA`;
- `THIRD_PARTY_NOTICES.md`.

If any source is incompatible with CC BY 4.0 or unclear, keep that source-derived layer separate or exclude it from the public dataset.

---

## 8. Data quality and validation rules

Automated validation must fail the build when any published record violates a hard rule.

### 8.1 Hard validation rules

- `project_id`, event IDs, relationship IDs, source IDs, and glossary IDs are unique.
- All foreign keys resolve.
- Every `PUBLISHED` project has an `ai_evidence_source_id`.
- Every published capacity event has a valid `capacity_basis`, `capacity_status`, `reported_date`, and `source_id`.
- A disclosed MW value is positive and numeric.
- `NOT_DISCLOSED` records do not contain a numeric MW value.
- Latitude is between -90 and 90; longitude is between -180 and 180.
- A coordinate requires a valid `geo_precision`.
- All country codes are valid ISO 3166-1 alpha-3 values.
- Enum values match the controlled vocabularies in this document.
- Published records have `last_verified` and `status_as_of` values.
- Published sources include direct URLs and accessed dates.
- No project is published from a `DISCOVERY_ONLY` source alone.
- No capacity aggregation mixes different `capacity_basis` categories.

### 8.2 Review warnings

The validator should emit non-blocking warnings for:

- one-source-only material financial or capacity claims;
- sources older than a defined freshness threshold;
- `UNKNOWN_REPORTED_POWER` values;
- conflicting project names, organizations, dates, or capacity values;
- `REGION`-precision coordinates displayed at high zoom;
- projects without an expected COD;
- projects where the stage has not been verified recently.

### 8.3 Confidence grades

Confidence applies to a fact or event, not automatically to the entire project.

- **A:** directly supported by tier-A evidence;
- **B:** directly supported by first-party tier-B evidence or corroborated credible sources;
- **C:** plausible contextual fact supported mainly by tier-C evidence and visibly labeled as such.

The implementer must not assign confidence based on intuition alone.

---

## 9. Information architecture and v0.1 features

### 9.1 Main navigation

1. **Explore** — map, filters, project table, and detail drawer;
2. **Methodology** — inclusion rules, source policy, capacity definitions, and limitations;
3. **Glossary** — searchable industry terms;
4. **Download** — CSV, GeoJSON, JSON, version, and license information;
5. **Contribute** — correction and new-project submission workflow.

### 9.2 Explore page

Required components:

- restrained title and project description;
- as-of date and dataset version;
- summary counts that do not imply completeness;
- global project map;
- filters for region/country, current stage, workload class, capacity basis, and disclosed role;
- searchable project list/table;
- project detail drawer/card;
- pipeline/status chart;
- capacity-basis chart;
- visible methodology and download links.

### 9.3 Project detail card

Display, where available:

- project name and location;
- geographic precision;
- AI/HPC evidence summary;
- current stage and as-of date;
- separate reported capacity events with basis and status;
- organizations grouped by disclosed role;
- expected COD;
- relevant land, power, shell, commercial, financing, or guarantee facts;
- source list with publication dates;
- last verified date;
- uncertainty or conflict notes.

### 9.4 Visualization rules

- Map-circle size may encode disclosed `IT_LOAD` only when that is the selected comparison basis.
- `UTILITY_SERVICE`, `GRID_CONNECTION`, and `GENERATION_NAMEPLATE` must use separate encodings or views.
- Projects without comparable capacity remain visible with a fixed minimum marker.
- Do not show a single misleading total-GW headline that adds unlike capacity bases.
- Status must use label/shape/icon support, not color alone.
- City and regional points must be described as approximate.
- No 3D map, animated globe, or decorative feature is required for v0.1.
- No project-quality, site-readiness, or bankability score is permitted in v0.1.

### 9.5 Visual direction

Use a restrained **infrastructure intelligence** aesthetic:

- dark navy/ink or neutral background;
- high-contrast off-white text;
- limited signal colors for stages and capacity types;
- blue, muted gold, green, and restrained violet may be used;
- avoid excessive neon, generic AI imagery, or decorative animation;
- prioritize readability, evidence, and comparison over spectacle.

---

## 10. Technical architecture

### 10.1 Default stack

- source data: CSV;
- validation and ETL: Python 3 with `pandas` and a schema-validation library or explicit validation module;
- frontend: Vite + React + TypeScript;
- mapping: MapLibre GL JS;
- charts: Apache ECharts or a comparably lightweight open-source chart library;
- geography: Natural Earth-based public-domain layer for initial global context;
- processed outputs: JSON and GeoJSON;
- hosting: GitHub Pages;
- CI/CD: GitHub Actions;
- backend/database: none for v0.1.

The implementer may recommend a materially simpler alternative only if it preserves static hosting, downloadability, accessibility, and future extension. Do not introduce a paid API, persistent backend, or vendor lock-in for the first release.

### 10.2 Data flow

```text
Public sources
  -> manual/source-linked CSV records
  -> schema validation and normalization
  -> derived JSON + GeoJSON + summary statistics
  -> static frontend build
  -> GitHub Pages deployment
  -> GitHub Release assets
  -> corrections through Issues/PRs
```

### 10.3 Proposed repository structure

```text
powering-ai-atlas/
├── README.md
├── AGENTS.md
├── CODEX_PROJECT_BRIEF.md
├── CONTRIBUTING.md
├── CITATION.cff
├── LICENSE-CODE
├── LICENSE-DATA
├── THIRD_PARTY_NOTICES.md
├── CHANGELOG.md
├── data/
│   ├── source/
│   │   ├── projects.csv
│   │   ├── capacity_events.csv
│   │   ├── relationships.csv
│   │   ├── sources.csv
│   │   └── glossary.csv
│   ├── processed/
│   │   ├── projects.json
│   │   ├── projects.geojson
│   │   ├── glossary.json
│   │   └── summary.json
│   └── fixtures/
├── scripts/
│   ├── validate_data.py
│   ├── build_data.py
│   └── check_links.py
├── tests/
│   ├── test_schema.py
│   ├── test_foreign_keys.py
│   └── test_aggregations.py
├── web/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── METHODOLOGY.md
│   ├── DATA_DICTIONARY.md
│   ├── RESEARCH_GUIDE.md
│   ├── DECISIONS.md
│   └── STATUS.md
└── .github/
    ├── workflows/
    │   ├── validate.yml
    │   └── deploy-pages.yml
    └── ISSUE_TEMPLATE/
        ├── new-project.yml
        └── correction.yml
```

Generated files in `data/processed/` must be reproducible from source CSV files. The implementer should not require users to manually edit generated data.

### 10.4 API keys and secrets

- v0.1 should avoid APIs requiring keys whenever practical.
- Never commit tokens, secrets, credentials, private URLs, or local environment files.
- If a later build-time API requires a key, store it in GitHub Actions Secrets and fetch data at build/refresh time.
- Do not place secrets in client-side JavaScript; anything shipped to the browser is public.
- Add appropriate `.gitignore` rules before the first data/API experiment.

---

## 11. Development phases

### Phase 0 — Project governance and guardrails

Target: 2026-08-19

Tasks:

- create the repository under the owner's personal GitHub account;
- set repository visibility to Private;
- add this project brief;
- confirm the independent-project disclaimer;
- create `.gitignore` before storing local data or credentials;
- create `docs/DECISIONS.md` and `docs/STATUS.md`;
- record all unresolved ownership or license questions.

Acceptance criteria:

- no NTU or client-confidential material is in the repository;
- repository identity, scope, and visibility are explicit;
- first commit contains only safe project scaffolding.

### Phase 1 — Repository and application scaffold

Target: 2026-08-19 to 2026-08-20

Tasks:

- initialize Python and frontend environments;
- implement the proposed folder structure;
- add placeholder source CSV files with headers;
- add a basic site shell and routing;
- add validation and test commands;
- add local developer instructions to README.

Acceptance criteria:

- one documented command validates data;
- one documented command runs the development site;
- one documented command builds the static site;
- an empty or fixture dataset does not crash the UI;
- CI can run without external secrets.

### Phase 2 — Data foundation and seed research

Target: 2026-08-20 to 2026-08-23

Tasks:

- implement all five source tables;
- implement controlled vocabularies and foreign-key validation;
- add 8 seed projects;
- add at least 20 glossary terms;
- record sources and access dates;
- build derived JSON and GeoJSON;
- document one ambiguous-capacity example and how it was resolved or left unresolved.

Acceptance criteria:

- all 8 seed projects pass hard validation;
- every published claim has a source;
- capacity basis is explicit for every disclosed MW value;
- source data regenerate all processed outputs deterministically;
- no discovery-only source independently supports publication.

### Phase 3 — Minimum Credible Release application

Target: 2026-08-24 to 2026-08-26

Tasks:

- implement map and project markers;
- implement filtering and search;
- implement project detail card;
- implement pipeline/status chart;
- implement capacity-basis chart;
- implement methodology, glossary, and download pages;
- add source links and limitations visibly in the UI;
- verify responsive desktop and mobile behavior.

Acceptance criteria:

- a user can find, filter, and inspect all 8 projects;
- a user can distinguish capacity bases and project stages;
- downloads match validated source/processed data;
- approximate coordinates are visibly labeled;
- there are no misleading aggregate-GW claims;
- the static production build succeeds.

### Phase 4 — v0.1 dataset expansion and QA

Target: 2026-08-27 to 2026-08-29

Tasks:

- expand to 20–25 projects as evidence and time permit;
- expand glossary to 40 terms;
- review every project for source quality, dates, roles, and capacity basis;
- test broken links and stale sources;
- review accessibility and mobile layout;
- request review from selected industry contacts where practical;
- log corrections and methodology decisions.

Acceptance criteria:

- all public records pass validation;
- material claims have sufficient evidence or visible uncertainty labels;
- project count and geographic coverage are described as selected, not comprehensive;
- methodology matches actual implementation;
- README and public UI use the same definitions.

### Phase 5 — Public-readiness and GitHub release

Target: 2026-08-30

Tasks:

- complete README, methodology, data dictionary, contributing guide, licenses, and notices;
- audit the entire Git history for secrets, private documents, and restricted data;
- review GitHub Actions logs for information that will become public;
- enable GitHub Pages deployment;
- change repository visibility from Private to Public only after the checklist passes;
- create immutable or final `v0.1.0` release assets;
- add `CITATION.cff`;
- pin the repository to the owner's GitHub profile.

Acceptance criteria:

- no secret, confidential, personal, or restricted content exists in the repository or relevant history;
- public site and all download links work;
- licenses and third-party attributions are visible;
- release files match the tagged source version;
- the public project contains a clear limitation statement and as-of date.

### Phase 6 — Launch and learning loop

Target: 2026-08-31 onward

Tasks:

- publish an English LinkedIn launch post;
- publish a 60–90 second English product explanation;
- invite corrections through the contribution form/Issues;
- contact 5 relevant professionals for targeted feedback;
- track substantive outcomes: corrections, forks, citations, conversations, and collaboration opportunities;
- create a monthly release/update cadence.

Acceptance criteria:

- public communication explains the capacity-comparability problem, not merely that a map was built;
- every public claim in launch content matches the dataset;
- feedback is captured as issues or documented research notes;
- the next version is driven by evidence and user feedback rather than feature accumulation.

---

## 12. Git and GitHub workflow

### 12.1 Visibility

- Start Private.
- Use one repository rather than separate private/public copies.
- Publish only after the Phase 5 audit.
- Assume every committed file and Actions log may eventually become public.

### 12.2 Branches and pull requests

- `main` must remain buildable and validated.
- Use short feature branches such as:
  - `feat/data-schema`;
  - `feat/map-explorer`;
  - `data/seed-projects`;
  - `docs/methodology`.
- Require validation before merge.
- Use pull requests for material schema, methodology, and public-data changes, even if the owner is the sole maintainer once the initial scaffold is stable.

### 12.3 Commit style

Use concise English commit messages, for example:

- `docs: add v0.1 project brief`
- `feat: validate capacity basis and source links`
- `data: add reviewed PORTS-Pike project records`
- `fix: separate generation capacity from IT load`

Avoid commits containing personal notes, unverified allegations, or source text copied in bulk.

### 12.4 Community contributions

Issue forms should require:

- project name;
- proposed correction/addition;
- direct source URL;
- source publisher and date;
- capacity basis, if MW is supplied;
- contributor confirmation that the source can lawfully support the proposed fact.

`CONTRIBUTING.md` should state that accepted original contributions to the curated dataset will be released under the project's data license.

---

## 13. Public-release checklist

The repository must remain private until every blocking item is satisfied.

### Product

- [ ] Scope and limitation statement is visible.
- [ ] MCR features work in production build.
- [ ] Mobile and desktop layouts are usable.
- [ ] No broken critical navigation or download link.

### Data

- [ ] At least 8 projects pass validation; target 20–25 for v0.1.
- [ ] Every material fact has a source.
- [ ] Every MW value has capacity basis and status.
- [ ] No mixed-basis capacity total is displayed.
- [ ] Approximate locations are labeled.
- [ ] No confidential or restricted-source data is included.

### Legal and attribution

- [ ] `LICENSE-CODE` exists.
- [ ] `LICENSE-DATA` exists.
- [ ] `THIRD_PARTY_NOTICES.md` exists.
- [ ] Source and attribution requirements are met.
- [ ] Copyrighted prose, images, logos, and tables have not been copied improperly.

### Security and privacy

- [ ] No secrets or credentials in files, history, or Actions logs.
- [ ] No personal contact data beyond intentional public profile information.
- [ ] No private NTU, Deloitte, client, or partner information.
- [ ] No inferred sensitive critical-infrastructure detail.

### Documentation

- [ ] README explains what the project is and is not.
- [ ] Methodology reflects actual inclusion and validation rules.
- [ ] Data dictionary describes all public fields.
- [ ] Contribution instructions exist.
- [ ] Dataset version and as-of date are visible.

---

## 14. Success metrics

### 14.1 Product-quality metrics

- 100% of published MW values have a capacity basis and source;
- 100% of published projects have AI/HPC evidence and verification date;
- 0 restricted bulk datasets in the public release;
- 0 unresolved hard validation errors;
- reproducible processed data and production build.

### 14.2 Learning metrics

- 40 terms understood and explainable without reading a script;
- 8–10 recorded English project/deal explanations;
- ability to explain one ambiguous capacity case and one risk-allocation case;
- ability to answer who owns, pays, supplies power, guarantees, and bears residual risk for selected projects.

### 14.3 Career and public-impact metrics

- 5 targeted expert reviews or conversations;
- at least 1 substantive correction, contribution, citation, or reuse signal;
- GitHub project pinned publicly;
- 1 LinkedIn launch post and 1 English video;
- later reuse in a white paper, commercialization memo, or financial model.

Do not optimize solely for impressions, stars, or raw facility count.

---

## 15. Collaboration responsibilities

### Project owner

The owner is responsible for:

- approving positioning, scope, public claims, and ownership boundaries;
- reading and understanding the sources behind published records;
- making final judgment on ambiguous terminology or commercial meaning;
- reviewing public UI language and LinkedIn communications;
- being able to explain methodology and insights in interviews.

### The implementer

The implementer is responsible for:

- repository scaffolding and implementation;
- data schema, validators, build scripts, frontend, tests, and documentation;
- locating candidate public sources and pre-structuring facts when asked;
- identifying contradictions, missing evidence, and license risk;
- maintaining reproducible outputs and a safe public-release process;
- never silently inventing or filling missing industry facts.

The project should remain genuinely owned and explainable by the owner. Code generation does not replace source review or industry judgment.

---

## 16. Implementation operating instructions

For every implementation session:

1. Read `AGENTS.md`, this brief, and the current `docs/STATUS.md` before editing.
2. Inspect the existing repository and preserve unrelated user changes.
3. State the current phase and the smallest useful deliverable.
4. Update a short implementation plan before material multi-file work.
5. Prefer the agreed static architecture; do not add a backend without explicit approval.
6. Do not scrape restricted directories or Google Maps content.
7. Do not invent capacity basis, stage, coordinates, contractual roles, or financial terms.
8. Treat source URLs, dates, and disclosure status as required data, not optional documentation.
9. Keep source CSV files human-reviewable and processed outputs reproducible.
10. Add or update tests whenever schema, controlled vocabulary, aggregation, or public display logic changes.
11. Run validation, tests, and production build before reporting completion.
12. Record material decisions in `docs/DECISIONS.md`.
13. Update `docs/STATUS.md` with completed work, current blockers, and the next three tasks.
14. Ask the owner only when a decision materially affects scope, licensing, public claims, ownership, or irreversible architecture.
15. Never make the repository public, publish a release, or post externally without the owner's explicit approval at that stage.

### Priority order when tradeoffs arise

1. data integrity and source traceability;
2. security, privacy, and license compliance;
3. clear methodology and honest limitations;
4. working end-to-end product;
5. accessibility and usability;
6. dataset breadth;
7. decorative polish.

When schedule pressure occurs, reduce project count or defer optional features. Do not weaken evidence standards or merge unlike capacity figures.

---

## 17. Initial research and launch narrative

The product should be introduced around the analytical problem, not the coding achievement.

Working launch framing:

> **I kept seeing gigawatts in AI infrastructure announcements, but the numbers were rarely comparable. Some referred to IT load, others to utility service or new generation. I built an open, source-linked atlas to separate those concepts and track who develops, owns, powers, finances, and ultimately pays for major AI infrastructure projects.**

The first public insight should ideally demonstrate one of the following:

- why reported GW figures cannot automatically be added;
- the gap between announced and energized capacity;
- how developer, tenant, utility, lender, and guarantor roles differ;
- how a land-power-shell project becomes financeable;
- where public disclosure is strongest or weakest.

---

## 18. Future roadmap beyond v0.1

### v0.2 — Grid and power context

- country electricity mix;
- U.S. state/region electricity price and emissions context;
- utility, balancing authority, or grid-region fields;
- clearer power-procurement taxonomy.

### v0.3 — Bankability and risk allocation

- lease/offtake terms;
- tenant or counterparty credit support;
- financing milestones;
- guarantee and residual-value structures;
- risk-allocation matrix without a simplistic composite score.

### v0.4 — TCO and development scenario tool

- build vs. lease vs. JV vs. guarantee comparison;
- PUE, load factor, tariff, financing, and COD assumptions;
- transparent scenario ranges rather than false-precision forecasts.

### v0.5 — Research publication

- AI infrastructure market map;
- investment/commercialization thesis;
- public white paper;
- selected case studies and an executive recommendation framework.

Do not implement future-version features during v0.1 unless they are required to prevent architectural dead ends.

---

## 19. Reference links

### Existing maps and market context

- [Global Data Center Map / ATLAS](https://github.com/Ringmast4r/Global-Data-Center-Map)
- [FracTracker U.S. Data Centers Tracker](https://fractracker.org/data-centers/)
- [NVIDIA AI data-center and AI-factory materials](https://www.nvidia.com/en-us/data-center/)

### Data and licensing

- [Natural Earth](https://www.naturalearthdata.com/)
- [GeoNames export and license](https://www.geonames.org/export/)
- [Ember Electricity Data Explorer](https://ember-energy.org/data/electricity-data-explorer/)
- [EIA-860](https://www.eia.gov/electricity/data/eia860/)
- [EPA eGRID](https://www.epa.gov/egrid/detailed-data)
- [PeeringDB Acceptable Use Policy](https://www.peeringdb.com/aup)
- [Google Maps Platform Terms](https://cloud.google.com/maps-platform/terms)

### Technical platform

- [MapLibre GL JS](https://www.maplibre.org/maplibre-gl-js/docs/)
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub repository visibility](https://docs.github.com/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility)
- [GitHub citation files](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-citation-files)
- [Zenodo and GitHub integration](https://help.zenodo.org/docs/github/)

---

## 20. Immediate next actions

1. Create the private personal repository `powering-ai-atlas`.
2. Copy this file into the repository root as `PROJECT_BRIEF.md`.
3. Add a short root `AGENTS.md` instructing the implementer to read this brief before work.
4. Complete Phase 0 and Phase 1 before collecting a large dataset.
5. Use 8 seed projects to test the schema and UI.
6. Expand only after the full source-to-site pipeline works.

