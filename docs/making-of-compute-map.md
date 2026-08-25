# Making of “Where AI Computing Lives”

*How I built an interactive map of the world's AI supercomputers — and what the
data made me change along the way.*

## The idea

AI feels weightless, but it runs on buildings you can point to on a map. I
wanted the first piece of the Powering AI Atlas to answer one question as
directly as possible: **where does AI computing physically live, and how much
electricity does it draw?**

The format is a hybrid: a short scroll-driven story that lands the three facts
I think matter most (there are only a few hundred of these machines; most of
them sit on the US grid; the biggest single sites now rival cities), followed
by a free-exploration map for readers who want to dig.

## The data

The map draws on two open datasets from [Epoch AI](https://epoch.ai), both
CC BY 4.0:

- **[AI Supercomputers](https://epoch.ai/data/ai-supercomputers)** — 480+
  operational GPU clusters with coordinates, power capacity (MW), hardware
  estimates, and owners. These are the solid dots.
- **[Frontier Data Centers](https://epoch.ai/data/data-centers)** — the ~50
  hyperscale campuses still building out (Stargate, Colossus 2, Hyperion…),
  tracked via satellite imagery and permits. These are the hollow circles.

Clean-looking data still needed editorial decisions:

- **Phases would double-count.** xAI's Colossus appears as Phases 1, 2, and 3 —
  three rows, one site, where the newest supersedes the others. I drop any row
  marked as superseded or decommissioned (30 rows), so one machine is one dot.
- **The frontier campuses have no coordinates upstream** — only street
  addresses. I geocode them to city level with a lookup table and mark them
  “location approximate” in the tooltip rather than pretending to precision I
  don't have.
- **Owner isn't the same as user.** Stargate Abilene is owned by its landlords,
  but readers ask “whose compute is this?” — so leased sites are grouped by
  their primary user (OpenAI), with the full ownership shown on hover.
- **China is missing by necessity.** The source anonymizes Chinese facilities,
  so they can't be mapped. The gap is stated in the methods note — an absence
  in the data is information too.

## Design decisions

**Dark, because the metaphor is electric.** The atlas borrows the visual
language of night-lights imagery: a near-black basemap with glowing marks.

**Area encodes power.** Dot area scales with the square root of megawatts, so a
1.5 GW campus reads as vastly bigger than a 20 MW lab — without the biggest
circles swallowing the map.

**Five company colors, not seven.** I wanted brand colors for every major
player. A colorblind-simulation validator said no: on a map, any two dots can
end up adjacent, and with 7 saturated hues some pairs become indistinguishable
under color-vision deficiency (Meta blue vs Microsoft blue was the worst
offender). Five hues plus a muted “Other” is the ceiling that keeps every pair
distinguishable for every kind of color vision — the rest of the identity work
moves to tooltips, the legend, and per-company filters. Color turns out to be
computable, not a matter of taste.

**Scrollytelling without a framework.** The story section is an
`IntersectionObserver` watching three text cards, driving MapLibre's `flyTo()`
camera. That's the whole trick. The numbers in the cards (site count, US share,
top-site power) are computed from the dataset at build time, so they stay
honest when the data refreshes.

## The pipeline

The site is Astro with React islands, deployed to GitHub Pages. Data lives in
the repo as a committed snapshot — for a dataset that changes on the scale of
months, a live API would be over-engineering. A GitHub Actions workflow
re-downloads the CSVs, re-runs the transform (with its parsing checks), and
commits the diff, so refreshing the map is one button and one review.

## What's next

- A build-out timeline: Epoch's quarterly campus data supports animating the
  construction rush.
- Country comparisons: “this one campus draws more power than country X,”
  using Ember/Our World in Data electricity figures.
- The gray dots deserve their own story — most of the map isn't Big Tech, but
  national labs, telecoms, and sovereign funds.

---

*Data: Epoch AI (CC BY 4.0). Basemap: © OpenStreetMap contributors, © CARTO.
Built with Astro, React, and MapLibre GL.*
