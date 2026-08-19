# Working agreement

Read before making changes:

1. `PROJECT_BRIEF.md` — product scope, inclusion rules, source policy, licensing
2. `docs/DATA_DICTIONARY.md` — authoritative schema (supersedes brief §6)
3. `docs/DECISIONS.md` — decisions already made and why
4. `docs/STATUS.md` — current phase and next tasks

## Non-negotiable rules

- Never invent a capacity value, capacity basis, stage, coordinate, contractual
  role, or financial term. Missing data stays missing.
- Never publish a MW figure without a `capacity_basis`.
- Never sum or co-plot values with different `capacity_basis`.
- Never resolve conflicting sources silently — use `conflict_group_id`.
- Never treat a `DISCOVERY_ONLY` source as sufficient for publication.
- Never commit secrets, credentials, or anything under `private/`.
- Files in `data/processed/` are generated. Never hand-edit them.

## When schema changes

Update `docs/DATA_DICTIONARY.md`, bump the schema version, record the reasoning in
`docs/DECISIONS.md`, and update the validator and its tests in the same change.
