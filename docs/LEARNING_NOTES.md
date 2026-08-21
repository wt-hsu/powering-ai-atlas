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

---

## Day 1 supplement — deconstructing the Hyperion financing

Working through the disclosed terms of one real transaction, term by term.
Deal: Beignet Investor LLC (SPV) bond financing the Meta / Blue Owl Hyperion JV.
Reported terms: ~$27.3bn senior secured fully amortizing notes, 144A, 6.581%
fixed coupon, quarterly pay, final maturity May 2049, priced ~225bps over
Treasuries, rated A+ by S&P; plus ~$2.5bn equity. *(Pricing details are from
tier-C financial press, pending owner verification against primary documents.)*

### Project finance vs corporate finance

The bond investors did not lend to Meta. They lent to a shell company whose only
asset is the project, and their repayment source is the rent Meta will pay.
Corporate finance looks at the borrower's balance sheet; project finance looks at
one project's contracted cash flows. That is why the deal's credit quality flows
through the lease, not through Meta's equity.

### Senior secured

"Senior" — first claim in the repayment queue if things go wrong.
"Secured" — backed by specific collateral (the campus and its rent stream).
Both features lower the lender's risk, which lowers the interest rate the
borrower pays.

### Amortizing vs bullet

- **Bullet**: interest only during the term, full principal repaid at maturity.
  Standard for corporate bonds. Leaves *refinancing risk* — the bet that new debt
  will be available at maturity.
- **Fully amortizing**: principal repaid gradually like a mortgage; nothing left
  at maturity. The debt shrinks alongside the asset's remaining life.

Hyperion chose fully amortizing. For a 24-year bond against an asset class whose
value in 2049 nobody can forecast, eliminating the refinancing cliff is the point.
Note this solves the same fear as the residual value guarantee — "what is this
asset worth decades from now?" — from a different angle.

### Spread (basis points over Treasuries)

Bond pricing convention: quote not the absolute rate but the margin over the
same-maturity US Treasury. 225bps = 2.25 percentage points. The spread isolates
the *project's* risk price from the general interest-rate environment, which
makes it the comparable number across deals. When reading any financing, the
spread carries more information than the coupon.

### Rule 144A

A US securities rule allowing bonds to be sold only to Qualified Institutional
Buyers without full SEC registration. Explains the investor list (PIMCO,
BlackRock, insurers) and why a $27bn issue involved no public roadshow — and
also why primary deal documents are hard to obtain: there is no public
prospectus. Data consequence: pricing details for 144A deals usually rest on
tier-C reporting.

### The rating notch

S&P rated the notes A+ — one notch below Meta's own corporate rating. That one
notch is the rating agency quantifying exactly the gap this dataset records: the
cash flows depend on Meta (rating travels with Meta), but the debt is not Meta's
direct obligation (discount one notch). Legal form vs economic substance,
expressed as a credit rating.

### Capital stack and leverage

~$27.3bn debt over ~$2.5bn equity ≈ 92% leverage. Ordinary real estate runs
60–70%. What supports the difference is the credit package: a full-campus lease
from an A+ tenant plus a 16-year guarantee. Causal chain worth remembering:
**stronger credit support → higher sustainable leverage → higher equity returns.**
Equity sits below debt in loss absorption: losses eat equity first, which is why
equity demands the higher return.

### How the pieces interlock

| Investor fear | Structural answer |
|---|---|
| Will the rent stop? | Meta leases the entire campus |
| The initial lease is only ~4 years — then what? | Meta's 16-year guarantee bridges the gap |
| What is the asset worth in 2049? | Fully amortizing debt — no terminal-value bet |
| What if Meta itself fails? | SPV holds the collateral; lenders can't reach Meta, but Meta can't reach the asset's lenders either |

The 4-year lease plus 16-year guarantee combination is the subtle part: Meta
kept the *option* to walk away after four years while promising financiers they
would not lose for sixteen. Meta bought flexibility; lenders got downside
protection; the risk beyond year 16 sits with the equity.

### Meta-lesson about sources

While researching this deal I initially swept a satirical Substack post into my
source list alongside genuine analysis — and its link was dead besides. Two
reminders in one: (1) source review includes recognising parody and advocacy,
not just checking facts; (2) links rot, which is why every source record carries
an `accessed_date` and, where lawful, an `archive_url`, and why the build
includes a link checker.
