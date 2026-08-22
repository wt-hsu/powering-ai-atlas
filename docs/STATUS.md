# Status

**Phase:** 0 complete → Phase 1 next
**Schema version:** 0.2.0
**Release target:** v0.1.0, public, 2026-08-29
**Project target:** 10 projects (release floor: 6)
**Repository visibility:** Private

---

## Ten-day plan

| Day | Date | Deliverable |
|---|---|---|
| 1 | 08-19 | Governance, schema 0.2.0, decision log, build log ✅ |
| 2 | 08-20 | `validate_data.py` + first fully validated project record |
| 3 | 08-21 | `build_data.py` → JSON/GeoJSON; frontend scaffold |
| 4 | 08-22 | Map with markers, geo-precision labelling |
| 5 | 08-23 | Project detail panel incl. deal structure |
| 6 | 08-24 | Research day → 6 projects (release floor reached) |
| 7 | 08-25 | Pipeline chart + capacity-basis chart |
| 8 | 08-26 | Methodology, glossary, download pages |
| 9 | 08-27 | Research day → 10 projects; link and staleness checks |
| 10 | 08-28 | Pre-publication audit, licences, README |
| — | 08-29 | Public release `v0.1.0` |
| — | 08-31 | Launch post |

---

## Completed

- Repository governance and `.gitignore` established before any data collection
- Competitive review of existing trackers → repositioning (D-001, D-002)
- Schema 0.2.0: six source tables, six defects in the original spec fixed
  (D-005 through D-008)
- Scope reduced to 10 projects with a documented floor (D-003)
- Public brief separated from private career material (D-009)
- CSV headers written for all six source tables

## Blockers

None.

## Standing research rules

- Power Four Questions answered for every project before PUBLISHED (D-014)
- Analyst note per project in docs/ANALYST_NOTES.md (D-015)
- Two-step source verification: implementer drafts, owner confirms (D-013)

## Next three tasks

1. Write `scripts/validate_data.py` covering every hard rule in the brief §8.1
   plus the new schema 0.2.0 constraints (ranges, supersession, currency pairing).
2. Enter the first project record end to end — projects, capacity events,
   relationships, deal structure, sources — and make it pass validation.
3. Write `scripts/build_data.py` to produce `data/processed/` deterministically.

## Open questions

- Which 10 projects. Selection must favour jurisdictions with tier-A disclosure
  rather than geographic spread (D-004).
- Whether `economic_risk_note` stays free text or becomes a controlled vocabulary
  once several deals are recorded. Revisit after project 6.
