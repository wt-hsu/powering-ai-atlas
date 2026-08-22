# Decision Log

Every material decision about scope, schema, licensing, or public claims is
recorded here with its reasoning. This log is part of the public deliverable:
it shows how the project was reasoned about, not just what was built.

Format: `ID | date | decision | reasoning | status`

---

## D-001 — 2026-08-19 — Reposition v0.1 around deal structure, not map coverage

**Decision.** v0.1 carries two analytical layers of equal weight: capacity-basis
disambiguation *and* commercial/financing structure. Deal structure is no longer
deferred to v0.3.

**Reasoning.** A competitive review found the "source-linked AI data center map"
space is already well served — Epoch AI's Frontier Data Centers Hub (satellite
imagery + permits, estimated IT load, CC BY), AI Data Center Index (346 facilities,
64 countries), SemiAnalysis, compute-atlas. Map coverage is no longer a
differentiator. None of these model the commercial structure: equity stakes,
lease terms, credit support, balance-sheet treatment. That gap is both the
genuine white space and the project's stated purpose.

**Status.** Adopted.

---

## D-002 — 2026-08-19 — Position as complementary to estimate-based trackers

**Decision.** The methodology will explicitly state that this project records
**reported figures and their provenance**, in contrast to trackers that publish
**modelled estimates** of true capacity.

**Reasoning.** Epoch AI estimates IT load from cooling equipment visible in
satellite imagery. The brief forbids publishing model-generated estimates as
reported facts. Rather than treating this as a limitation, it is a clean division
of labour: estimate-based trackers answer "what is actually there", this project
answers "what was claimed, by whom, on what basis". Stating this openly
demonstrates awareness of the landscape.

**Status.** Adopted.

---

## D-003 — 2026-08-19 — v0.1 target reduced to 10 projects, floor of 6

**Decision.** v0.1 targets 10 projects. Six fully validated projects is the hard
release floor. Public release date held at 2026-08-29.

**Reasoning.** A record meeting this project's own evidence standard (multi-source
corroboration, explicit capacity basis, evidenced roles, deal terms) takes
2–4 hours of research. 20–25 records is 50–100 hours, which does not fit ten days
alongside building the application. The brief's own tradeoff rule (§16) says to
reduce project count rather than weaken evidence standards. Applying that rule
up front rather than under pressure.

**Status.** Adopted.

---

## D-004 — 2026-08-19 — Drop the geographic coverage quota

**Decision.** No minimum region count for v0.1. Coverage follows evidence quality.

**Reasoning.** The brief targeted "at least 5 regions". Public disclosure quality
varies enormously by jurisdiction — US permits, interconnection queues, state
incentive filings and SEC filings support tier-A evidence, while several other
markets would force publication on tier-C reporting alone. A geographic quota
optimises for a claim rather than for evidence. Coverage will be described
factually as whatever it turns out to be.

**Status.** Adopted.

---

## D-005 — 2026-08-19 — Define the `current_stage` controlled vocabulary

**Decision.** Eight values defined in `DATA_DICTIONARY.md` §1.1. `current_stage`
means the highest stage with supporting evidence as of `status_as_of`, and stages
are explicitly not sequential.

**Reasoning.** The brief marked `current_stage` as a required enum but never
listed its values, unlike `capacity_basis` and `role`. Validation could not be
implemented as written. Non-sequentiality matters because financing frequently
closes before permitting.

**Status.** Adopted.

---

## D-006 — 2026-08-19 — Split mixed-type date fields

**Decision.** `expected_cod` becomes `expected_cod_date` (ISO date) plus
`expected_cod_precision` (enum).

**Reasoning.** The brief specified "ISO date or year" in a single column. Mixed
types cannot be validated cleanly and push the ambiguity into the UI. The paired
precision column preserves "2028" as a year without inventing 1 January.

**Status.** Adopted.

---

## D-007 — 2026-08-19 — Add range, supersession, and conflict handling to capacity events

**Decision.** Added `capacity_value_mw_low` / `_high`, `reported_unit_original`,
`supersedes_event_id`, and `conflict_group_id`.

**Reasoning.** The brief allowed `capacity_disclosure_status = RANGE` with only a
single value column, so ranges had nowhere to go. It allowed `CONFLICTING` with no
way to link the conflicting rows, and no way to distinguish a genuine
disagreement between sources from a later upward revision by the same party.
Without supersession, any project re-announced at a larger size is double-counted.

**Status.** Adopted.

---

## D-008 — 2026-08-19 — Add `deal_structures.csv`

**Decision.** New sixth source table for disclosed commercial and financing
arrangements. `relationships.csv` gains `equity_stake_pct`.

**Reasoning.** The brief listed "planned investment" as a decision-relevant
attribute (§4.5) but provided no column anywhere in the five tables to hold an
amount, currency, or ownership percentage. The project's central question — who
owns, who pays, who guarantees, who bears residual risk — was unrepresentable in
its own schema.

**Status.** Adopted.

---

## D-009 — 2026-08-19 — Career and admissions material stays out of the public repo

**Decision.** Sections 2.2 and 2.3 of the original brief (career purpose, MBA and
public-brand purpose) must be removed from `PROJECT_BRIEF.md` before the
repository is made public. They are retained in a gitignored private file.

**Reasoning.** "I built this to support an MBA application" reframes the work from
independent research into a portfolio exercise, which weakens how a domain reader
receives it. The research rationale stands on its own.

**Status.** Adopted. Blocking item for the Phase 5 pre-publication audit.

---

## D-010 — 2026-08-19 — Tool-neutral file naming

**Decision.** `CODEX_PROJECT_BRIEF.md` → `PROJECT_BRIEF.md`. `AGENTS.md` retained
but written generically.

**Reasoning.** Tool-specific filenames in a public repository draw attention to
the authoring tool rather than the work. The brief's content is a specification
and reads as one regardless of who implements it.

**Status.** Adopted.

---

## D-011 — 2026-08-19 — Publish as point-in-time snapshots, not a live tracker

**Decision.** Each release is an explicitly dated snapshot (`v0.1.0, data as of
YYYY-MM-DD`). No commitment to a fixed update cadence.

**Reasoning.** Announced projects change monthly, and a stale dataset presented as
current is worse than no dataset. The brief's proposed monthly cadence is not
sustainable alongside the owner's other commitments. Framing releases as versioned
snapshots makes age a documented property rather than a failure, and matches how
research datasets are normally cited.

**Status.** Adopted.

---

## D-012 — 2026-08-19 — No bond-pricing fields in v0.1

**Decision.** `deal_structures.csv` records amounts, terms, stakes, and credit
support, but not pricing terms (coupon, spread, rating). Revisit for v0.3.

**Reasoning.** Pricing details for 144A private placements come almost entirely
from tier-C financial press, since there is no public prospectus. v0.1's central
question is *who bears which risk*, which the existing fields answer; *what the
risk pays* is a return question and belongs with the v0.3 bankability layer,
by which point the sourcing standard for pricing data can be decided properly.
Adding weakly-sourced numeric fields now would dilute the dataset's evidence
standard for marginal analytical value.

**Status.** Adopted.

---

## D-013 — 2026-08-19 — Two-step source verification workflow

**Decision.** Every fact enters the dataset through a two-step workflow:
the implementer drafts candidate facts from search and cross-referencing, marked
unverified; the owner opens the primary source, checks the exact wording, and
confirms before the record is committed with an `accessed_date`. A cited URL must
have been successfully opened by a human before it enters `sources.csv`.

**Reasoning.** Two triggers. First, a dead link and a satirical post surfaced in
the same research pass that produced genuine sources — automated collection
cannot be trusted to separate them. Second, the implementation environment has
restricted network egress and cannot open most primary sources directly, while
the project brief (§15) already assigns source reading to the owner. The
workflow turns both constraints into the intended quality gate: no fact is
published that the owner has not personally traced to its source.

**Status.** Adopted.

---

## D-014 — 2026-08-22 — Power dimension elevated to co-equal with deal structure

**Decision.** Every project entering the dataset must answer four power questions
before it can reach `PUBLISHED` status:

1. **Who supplies the power** — utility, self-generation, or both?
2. **Interconnection status** — requested, agreed, or energized?
3. **Where the power comes from** — grid procurement, new-build generation, PPA?
4. **Who bears the cost of new power infrastructure** — the developer, the
   tenant, the utility's ratepayers, or undisclosed?

A question with no public answer is recorded as `NOT_DISCLOSED` rather than
skipped — the pattern of non-disclosure is itself a finding. No schema change is
required: the answers land in existing structures (`UTILITY` / `POWER_DEVELOPER`
/ `OFFTAKER` roles, `PPA` deal type, `GRID_CONNECTION` and
`GENERATION_NAMEPLATE` capacity bases). This is a research-discipline rule, not
a schema rule, so it is enforced by owner review rather than the validator.

**Reasoning.** A review of the due-diligence practices of the dataset's primary
target users — energy and site-strategy practitioners at large data-center
operators (brief §3.4) — shows their working questions centre on utility rate
structures, interconnection queues, and capacity-delivery strategy. The v0.1
repositioning (D-001) weighted commercial structure heavily; without this rule
the power dimension, which those users need first, would remain the thinnest
layer in the dataset. It also directly serves the v0.2 roadmap (grid and power
context), which builds on exactly these fields.

**Status.** Adopted.

---

## D-015 — 2026-08-22 — Analyst notes as a per-project deliverable

**Decision.** Each project entered into the dataset is accompanied by a short
analyst note in `docs/ANALYST_NOTES.md`: (a) the open questions a power or
finance practitioner would ask next about this project, and (b) how the
project's structure compares with others already in the dataset. Notes are
clearly separated from the dataset itself: the CSVs record disclosed facts,
the notes record interpretation. Whether the notes file is included in the
public v0.1 release is decided at the Phase 5 audit.

**Reasoning.** The dataset records facts; the recurring comparison of those
facts is where market interpretation accumulates, and writing it down per
project is cheap (minutes) while reconstructing it later is expensive. Keeping
notes in a separate file preserves the dataset's fact-only discipline (§4.6:
no model-generated or inferred content inside the data) while still capturing
the analytical layer that makes the dataset useful.

**Status.** Adopted.
