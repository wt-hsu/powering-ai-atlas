# Data Dictionary — v0.1

Schema version: **0.2.0** (supersedes the table definitions in `PROJECT_BRIEF.md` §6)

This document is the authoritative field-level definition for all source CSV files.
Where it conflicts with the project brief, this document wins. Every change to this
file must be recorded in `DECISIONS.md`.

## Design rules that apply to every table

1. **Never use `0` to mean unknown.** Numeric fields stay empty when not disclosed.
2. **Never put text in a numeric column.** No `not_disclosed`, no `~500`, no `500+`.
3. **Every unit is explicit.** All power values are stored in **MW**. If a source
   reported GW, convert and record the original unit.
4. **Every published fact carries a `source_id`.** No exceptions.
5. **Dates use ISO 8601** (`YYYY-MM-DD`). When a source only gives a year or a
   quarter, use the paired `*_precision` column instead of inventing a month/day.
6. **Conflicting values are preserved, not resolved.** See `conflict_group_id`.

---

## 1. `projects.csv`

One row per publicly identifiable campus or infrastructure project.

| Field | Type | Required | Description |
|---|---|---|---|
| `project_id` | slug | Yes | Stable ID, e.g. `us-la-hyperion`. Never reused. |
| `project_name` | string | Yes | Publicly recognisable name |
| `project_aliases` | pipe-delimited | No | Other public names |
| `country_iso3` | ISO 3166-1 alpha-3 | Yes | e.g. `USA` |
| `admin1` | string | No | State / province |
| `city` | string | No | Publicly disclosed city or parish |
| `latitude` | decimal | Conditional | Only when a publishable coordinate exists |
| `longitude` | decimal | Conditional | Only when a publishable coordinate exists |
| `geo_precision` | enum | Yes | `CAMPUS` / `CITY` / `REGION` |
| `workload_class` | enum | Yes | `AI_FACTORY` / `AI_DATA_CENTER` / `HPC` / `HYPERSCALE_MIXED` |
| `ai_evidence_summary` | string | Yes | Factual basis for the AI/HPC classification |
| `ai_evidence_source_id` | FK → sources | Yes | Evidence for the classification |
| `current_stage` | enum | Yes | See §1.1 |
| `announcement_date` | ISO date | No | Earliest verified public announcement |
| `expected_cod_date` | ISO date | No | Expected commercial operation date |
| `expected_cod_precision` | enum | Conditional | Required when `expected_cod_date` is set. See §1.2 |
| `operational_date` | ISO date | No | Verified operation date |
| `status_as_of` | ISO date | Yes | Date `current_stage` was last assessed |
| `project_summary` | string | Yes | Neutral summary, no promotional language |
| `last_verified` | ISO date | Yes | Latest review date |
| `publication_status` | enum | Yes | `DRAFT` / `REVIEWED` / `PUBLISHED` |

**Do not add a generic `capacity_mw` column.** Capacity lives in `capacity_events.csv`.

### 1.1 `current_stage` controlled vocabulary

The project brief required this field but never defined its values. Defined here.

| Value | Meaning | Typical evidence |
|---|---|---|
| `ANNOUNCED` | Publicly announced, no contract/permit evidence yet | Press release, IR statement |
| `SITE_SECURED` | Land ownership or long-term site control evidenced | Deed, lease, option filing |
| `PERMITTED` | Major construction / environmental / use permit granted | County or state permit record |
| `FINANCED` | Financing committed or closed | 8-K, JV announcement, bond pricing |
| `UNDER_CONSTRUCTION` | Physical construction evidenced | Permit status, official statement |
| `PARTIALLY_ENERGIZED` | Some capacity energised or in service | Utility notice, company statement |
| `OPERATIONAL` | First phase or whole project commercially operating | Company statement, filing |
| `PAUSED_OR_CANCELLED` | Publicly paused, shelved, or cancelled | Company or government statement |

**Important modelling note:** these stages are **not strictly sequential.** A project
can be financed before it is permitted. `current_stage` records the *highest stage
with supporting evidence* as of `status_as_of`. It is not a percentage-complete.

### 1.2 `*_precision` controlled vocabulary

Used to say how precise a date actually is, without inventing digits.

`DAY` / `MONTH` / `QUARTER` / `HALF_YEAR` / `YEAR` / `NOT_DISCLOSED`

Example: a source saying "expected online in 2028" is stored as
`expected_cod_date = 2028-01-01`, `expected_cod_precision = YEAR`.
The UI must render this as "2028", never as "1 Jan 2028".

---

## 2. `capacity_events.csv`

One row per **reported capacity figure**. A project with three announcements at
different sizes has three rows, not one averaged row.

| Field | Type | Required | Description |
|---|---|---|---|
| `capacity_event_id` | slug | Yes | Stable ID |
| `project_id` | FK → projects | Yes | |
| `phase_name` | string | No | Phase, building, or tranche |
| `capacity_value_mw` | decimal | Conditional | Point value, in MW. Empty when `RANGE` or `NOT_DISCLOSED` |
| `capacity_value_mw_low` | decimal | Conditional | Required when status is `RANGE` |
| `capacity_value_mw_high` | decimal | Conditional | Required when status is `RANGE` |
| `reported_unit_original` | enum | Yes | `MW` / `GW` / `KW` / `NOT_APPLICABLE` — what the source actually printed |
| `capacity_disclosure_status` | enum | Yes | `DISCLOSED` / `RANGE` / `NOT_DISCLOSED` / `CONFLICTING` |
| `capacity_basis` | enum | Yes | See §2.1 |
| `capacity_status` | enum | Yes | `ANNOUNCED` / `CONTRACTED` / `CONNECTED` / `ENERGIZED` / `OPERATIONAL` |
| `reported_date` | ISO date | Yes | Date the figure was reported |
| `expected_cod_date` | ISO date | No | For this specific capacity |
| `expected_cod_precision` | enum | Conditional | Required when `expected_cod_date` is set |
| `source_id` | FK → sources | Yes | |
| `source_quote_or_locator` | short string | No | Page / section / table locator. Keep quotes short |
| `supersedes_event_id` | FK → capacity_events | No | See §2.2 |
| `conflict_group_id` | slug | No | See §2.2 |
| `confidence_grade` | enum | Yes | `A` / `B` / `C` |
| `notes` | string | No | Clarification |

### 2.1 `capacity_basis` — the core of this project

A megawatt figure is meaningless without knowing which of these it measures.

| Value | What it measures | Why it differs |
|---|---|---|
| `IT_LOAD` | Power delivered to computing equipment | The number most people *think* is being quoted |
| `FACILITY_LOAD` | Total facility demand incl. cooling and support | Typically 1.2–1.5x IT load |
| `UTILITY_SERVICE` | Contracted utility service capacity | Often larger than actual use; reflects headroom |
| `GRID_CONNECTION` | Interconnection request or connection capacity | May be speculative and never built |
| `GENERATION_NAMEPLATE` | Nameplate rating of associated generation assets | Supply-side, not demand — a different quantity entirely |
| `TRANSFORMER_CAPACITY` | Transformer / substation rating | Equipment rating, not consumption |
| `UNKNOWN_REPORTED_POWER` | Source gave MW/GW with no clear basis | Very common in press coverage |

**Hard rule:** values with different `capacity_basis` must never be summed or
placed on the same comparison axis without an explicit warning.

### 2.2 Handling revised and conflicting figures

Announced capacity is revised constantly. Two distinct situations, two mechanisms:

- **Superseded** — the same party later revised its own figure.
  Set `supersedes_event_id` on the newer row pointing at the older row.
  The older row stays in the dataset (that is the historical record) but the UI
  and any aggregation must use only the latest row in the chain.

- **Conflicting** — two sources disagree and neither clearly supersedes the other.
  Give both rows the same `conflict_group_id`, set
  `capacity_disclosure_status = CONFLICTING` on both, and explain in `notes`.
  The UI must show both. **Never silently pick one.**

Without these two columns the map double-counts every project that was ever
re-announced at a larger size — which is most of them.

---

## 3. `relationships.csv`

One row per organisation-role-project relationship.

| Field | Type | Required | Description |
|---|---|---|---|
| `relationship_id` | slug | Yes | |
| `project_id` | FK → projects | Yes | |
| `organization_name` | string | Yes | Public entity name |
| `organization_alias` | string | No | |
| `role` | enum | Yes | See §3.1 |
| `relationship_status` | enum | Yes | `ANNOUNCED` / `CONTRACTED` / `ACTIVE` / `ENDED` / `NOT_DISCLOSED` |
| `equity_stake_pct` | decimal 0–100 | No | Disclosed ownership percentage |
| `contract_term_years` | decimal | No | Disclosed term |
| `effective_date` | ISO date | No | |
| `source_id` | FK → sources | Yes | |
| `confidence_grade` | enum | Yes | `A` / `B` / `C` |
| `notes` | string | No | |

### 3.1 `role` controlled vocabulary

`DEVELOPER` · `LANDOWNER` · `ASSET_OWNER` · `OPERATOR` · `TENANT` · `OFFTAKER` ·
`UTILITY` · `POWER_DEVELOPER` · `EQUIPMENT_SUPPLIER` · `EQUITY_SPONSOR` ·
`LENDER` · `GUARANTOR` · `GOVERNMENT_PARTNER` · `OTHER_DISCLOSED_ROLE`

Never infer a contractual role from general involvement. A company appearing in a
photo op is not a `TENANT`.

---

## 4. `deal_structures.csv` — NEW in schema 0.2.0

The brief treated investment and financing as a v0.3 concern, which left the
project's own stated question — who pays, who owns, who bears the risk — with
nowhere to live. This table is the answer.

One row per **disclosed commercial or financing arrangement**.

| Field | Type | Required | Description |
|---|---|---|---|
| `deal_id` | slug | Yes | |
| `project_id` | FK → projects | Yes | |
| `deal_type` | enum | Yes | See §4.1 |
| `counterparties` | pipe-delimited | Yes | Named parties to this arrangement |
| `announced_date` | ISO date | Yes | |
| `amount_original` | decimal | No | Amount as reported |
| `currency_original` | ISO 4217 | Conditional | Required when `amount_original` is set |
| `amount_usd_m` | decimal | No | Normalised to USD millions |
| `fx_rate_date` | ISO date | Conditional | Required when currency was converted |
| `amount_disclosure_status` | enum | Yes | `DISCLOSED` / `APPROXIMATE` / `NOT_DISCLOSED` |
| `equity_stake_pct` | decimal 0–100 | No | For equity/JV deals |
| `initial_term_years` | decimal | No | Initial contract term |
| `extension_options` | string | No | e.g. `4 x 4-year renewals` |
| `credit_support_type` | enum | Yes | See §4.2 |
| `credit_support_term_years` | decimal | No | Duration of the guarantee |
| `balance_sheet_treatment` | enum | Yes | `ON_BALANCE_SHEET` / `OFF_BALANCE_SHEET` / `NOT_DISCLOSED` / `DISPUTED` |
| `economic_risk_note` | string | No | Where economic risk sits vs. legal form. See §4.3 |
| `source_id` | FK → sources | Yes | |
| `confidence_grade` | enum | Yes | `A` / `B` / `C` |
| `notes` | string | No | |

### 4.1 `deal_type` controlled vocabulary

`JV_EQUITY` · `PROJECT_FINANCE_DEBT` · `CORPORATE_DEBT` · `SALE_LEASEBACK` ·
`LEASE` · `PPA` · `TAX_INCENTIVE_OR_ABATEMENT` · `VENDOR_OR_SUPPLIER_FINANCING` ·
`CORPORATE_CAPEX` · `OTHER_DISCLOSED`

### 4.2 `credit_support_type` controlled vocabulary

`RESIDUAL_VALUE_GUARANTEE` · `PARENT_GUARANTEE` · `LEASE_GUARANTEE` ·
`TAKE_OR_PAY` · `LETTER_OF_CREDIT` · `NONE_DISCLOSED` · `OTHER_DISCLOSED`

### 4.3 `economic_risk_note` — the analytical payload

Legal form and economic substance often diverge. A sponsor may hold a small
equity stake (legal form) while providing a long-term lease and a residual value
guarantee (economic substance), leaving most of the risk with the sponsor.

This field records that observation **as a sourced statement about disclosed
terms**, never as a rating or score. If the divergence is not supported by
disclosed terms, leave it empty.

---

## 5. `sources.csv`

| Field | Type | Required | Description |
|---|---|---|---|
| `source_id` | slug | Yes | |
| `url` | URL | Yes | Direct supporting page or document |
| `title` | string | Yes | |
| `publisher` | string | Yes | |
| `published_date` | ISO date | No | |
| `accessed_date` | ISO date | Yes | |
| `source_type` | enum | Yes | See §5.1 |
| `source_tier` | enum | Yes | `A` / `B` / `C` / `DISCOVERY_ONLY` |
| `reuse_status` | enum | Yes | `OPEN_LICENSE` / `PUBLIC_FACTS_ONLY` / `RESTRICTED` / `UNKNOWN` |
| `license_name` | string | No | |
| `archive_url` | URL | No | |
| `notes` | string | No | |

### 5.1 `source_type` controlled vocabulary

`REGULATORY_FILING` · `GOVERNMENT_DOCUMENT` · `COMPANY_FILING` ·
`COMPANY_IR_OR_PRESS_RELEASE` · `UTILITY_OR_GRID_DOCUMENT` ·
`OFFICIAL_PROJECT_PAGE` · `WIRE_SERVICE` · `TRADE_MEDIA` · `OPEN_DATASET` ·
`DIRECTORY` · `OTHER`

### 5.2 Source tiers

- **A** — regulator, government, official filing, utility/grid document
- **B** — first-party company IR, official project page, press release
- **C** — credible wire service or trade reporting, used for context or corroboration
- **DISCOVERY_ONLY** — directory, crowdsourced map, or search result. **Cannot
  independently support publication.**

---

## 6. `glossary.csv`

| Field | Type | Required | Description |
|---|---|---|---|
| `term_id` | slug | Yes | |
| `term` | string | Yes | Preferred English term |
| `term_zh` | string | No | Traditional Chinese term |
| `acronym` | string | No | |
| `category` | enum | Yes | `LAND` / `POWER` / `SHELL` / `COMPUTE` / `FINANCE` / `CONTRACT` / `DELIVERY` / `RISK` |
| `plain_english_definition` | string | Yes | Concise, university level |
| `common_confusion` | string | No | Frequent misuse |
| `example_project_id` | FK → projects | No | |
| `source_id` | FK → sources | Conditional | Required for technical/regulatory terms; optional for general finance vocabulary |
| `last_verified` | ISO date | Yes | |

`source_id` was relaxed from Required to Conditional: forcing a citation onto
general vocabulary such as "capital stack" encourages padding the source table
with weak references purely to satisfy the validator.
