# Powering AI: Global Infrastructure Deal Atlas

A source-linked, open dataset tracking how selected major AI infrastructure
projects secure land, power, capacity, capital, and long-term customers — and
which party bears each major delivery and commercial risk.

> **Status: pre-release.** The dataset is under construction and not yet published.

---

## What this is

Most trackers of AI data centers map physical facts: where a site is, how large,
how far along. Several do it well and at scale.

This project maps something else — the **commercial structure** behind a smaller
number of projects:

- who develops, owns, and operates the asset
- who leases it, and on what term
- who provides equity, debt, and credit support
- who guarantees what, and for how long
- where the legal form of a deal and its economic substance diverge

It also treats reported capacity figures as what they are: claims made on
different bases, at different stages of certainty, which cannot simply be added
together.

## What this is not

This atlas covers **selected publicly announced projects** and is **not a complete
directory of global data centers**. Capacity figures use different reporting bases
and should not be aggregated unless the basis and status are comparable.

It publishes **reported figures and their provenance**, not modelled estimates of
true capacity. Trackers that estimate physical capacity from satellite imagery and
permits answer a different and complementary question.

## Repository map

| Path | Contents |
|---|---|
| `PROJECT_BRIEF.md` | Founding specification: scope, inclusion rules, source policy |
| `docs/DATA_DICTIONARY.md` | Authoritative schema — field definitions and controlled vocabularies |
| `docs/DECISIONS.md` | Every material decision and its reasoning |
| `docs/BUILD_LOG.md` | How the project was actually built |
| `docs/LEARNING_NOTES.md` | Working notes on terminology and concepts |
| `docs/STATUS.md` | Current phase, plan, and next tasks |
| `data/source/` | Hand-curated source CSV files — the source of truth |
| `data/processed/` | Generated JSON and GeoJSON — do not edit by hand |

## Licensing

Intended, subject to a pre-publication source audit:

- original code — MIT (`LICENSE-CODE`)
- original curated dataset — CC BY 4.0 (`LICENSE-DATA`)
- third-party datasets — their own licences, recorded in `THIRD_PARTY_NOTICES.md`

These files are added before public release, not before.
