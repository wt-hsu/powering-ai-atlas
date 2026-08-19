# Build Log

A running record of how this project was built: decisions, dead ends, and things
that turned out to be harder than expected. Written as it happened.

---

## Day 1 — 2026-08-19 — Killing the idea I started with

I started with a plan to build a source-linked map of global AI data centers,
differentiated by being rigorous about capacity figures. Before writing any code
I checked what already exists.

That check changed the project.

Epoch AI runs a Frontier Data Centers Hub that uses commercial satellite imagery
and permitting documents to estimate IT power capacity, compute, and capital cost
over time. AI Data Center Index tracks 346 facilities across 64 countries with
machine-readable exports. SemiAnalysis sells a datacenter industry model.
compute-atlas covers the US.

So the thing I was about to spend ten days building already exists, several times
over, built by teams with more resources than I have.

The useful question became: what did all of them leave out?

They map **physical** facts — where, how big, how far along. None of them map the
**commercial** structure. Who actually owns the asset. Who signed the lease. Who
lent the money. Who guaranteed what, and for how long.

That gap is not an accident. Physical facts can be extracted at scale from
imagery and permits. Commercial structure has to be read out of press releases,
JV announcements, and filings one deal at a time. It does not scale — which is
precisely why nobody has done it, and why doing it carefully for a small number
of projects is worth more than doing the physical layer for a large number.

**The example that convinced me.** Meta's Hyperion campus in Louisiana:

- Meta and Blue Owl Capital formed a joint venture. Blue Owl holds 80%. Meta holds 20%.
- The JV raised roughly $27bn of A+ rated debt plus $2.5bn of equity through an
  SPV, anchored by PIMCO and BlackRock.
- Meta leases the entire completed campus, on an initial four-year term with
  extension options.
- Meta provided the JV a guarantee covering the first 16 years of operations.

Read the ownership column alone and this is Blue Owl's asset. Read the whole
structure and Meta is the tenant, the guarantor, and the party carrying the
residual value risk — while keeping $27bn of debt off its own balance sheet.

One column tells you the legal form. The structure tells you the economics. A map
with an "owner" field cannot show you the difference. That difference is the
product.

**What I actually did today.** No code. I rewrote the schema instead, because I
found six things in my own specification that would have broken as soon as I tried
to validate real data:

1. `current_stage` was a required enum whose values were never defined.
2. `expected_cod` was specified as "ISO date or year" in one column — two types,
   one field, no clean validation.
3. `RANGE` was an allowed disclosure status, but there was only one value column,
   so a range had nowhere to go.
4. `CONFLICTING` was allowed with no way to link the conflicting rows together —
   and no way to distinguish two sources disagreeing from one party revising its
   own number upward. Without that, every re-announced project gets double-counted.
5. There was no column anywhere for an investment amount, a currency, or an
   ownership percentage — in a project whose stated purpose is tracking who
   finances these things.
6. Power values had no unit column, while sources move freely between MW and GW.

Finding these before collecting data cost an afternoon. Finding them after
collecting 25 records would have cost the release.

**Scope cut.** Target reduced from 20–25 projects to 10, with 6 as the release
floor. The specification I wrote for myself says to cut project count rather than
lower evidence standards under schedule pressure. Applying that on day one instead
of on day nine.
