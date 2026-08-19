# Learning Notes

Terminology and concepts encountered while building this project, recorded in the
order I actually needed them. The glossary dataset (`data/source/glossary.csv`) is
the polished public version; this file is the working notebook.

---

## Day 1 — 2026-08-19

### Data contract / schema

A schema is the field-level definition of a dataset: which columns exist, what
type each holds, and which values are permitted. Agreeing it before collecting
data is called establishing a **data contract**.

The reason to do this first is rework. Changing a column definition after
collecting 25 records means revisiting all 25. Changing it before collecting any
costs nothing. Most of the cost of a data project is not collection — it is
re-collection caused by a definition that turned out to be wrong.

A practical test for whether a schema is finished: try to write the validation
rules for it. Any field you cannot write a rule for is under-specified. That test
is what surfaced all six defects in this project's original schema.

### Capacity basis

A megawatt figure for a data center can mean at least seven different things:

| Basis | Measures |
|---|---|
| IT load | Power delivered to computing equipment |
| Facility load | Total site demand including cooling — typically 1.2–1.5x IT load |
| Utility service | Contracted service capacity from the utility |
| Grid connection | Interconnection request capacity — may never be built |
| Generation nameplate | Rating of associated generation — supply side, not demand |
| Transformer capacity | Equipment rating |
| Unknown | Source printed a number with no stated basis |

These are not variations on one quantity. Generation nameplate and IT load
measure different sides of the system. Summing them produces a number that
corresponds to nothing.

This matters at national scale. Utilities receive speculative interconnection
requests, including multiple requests for the same project across different
utility territories, which inflates load forecasts with capacity that will never
be built. Announced gigawatts and delivered gigawatts are different quantities.

### SPV — special purpose vehicle

A company created to hold exactly one project's assets and liabilities. Its
purpose is **risk ring-fencing**: if the project fails, lenders can pursue the
SPV's assets and not the sponsor's balance sheet.

### JV — joint venture

Two or more parties jointly own a new entity. The ownership split is not a
formality — it determines which party consolidates the asset and the associated
debt into its financial statements.

### Off-balance-sheet treatment

If a sponsor holds a minority stake in a JV, the JV's debt generally does not
appear on the sponsor's balance sheet. This preserves the sponsor's leverage
ratios and credit rating while still securing the asset it wants.

### Residual value guarantee

A promise by one party that an asset will be worth at least a stated amount at a
future date, with the guarantor covering any shortfall. It exists to make
long-dated infrastructure financeable: investors putting up capital for a 16-year
horizon need protection against the asset being obsolete or unwanted at the end.

### Legal form versus economic substance

The central analytical idea of this project.

Meta's Hyperion structure: Meta holds 20% of the JV, so in legal form it is a
minority partner. But Meta leases the entire campus, and guarantees the first 16
years of operations. In economic substance, Meta carries most of the demand risk
and most of the residual value risk.

A dataset with a single "owner" field records the legal form and loses the
economics. Recording lease terms, credit support type, and guarantee duration as
separate sourced fields preserves both — and lets a reader see where they diverge.

The discipline: record the **disclosed terms**, never a judgement or a score.
The divergence should be visible from the data, not asserted by the author.
