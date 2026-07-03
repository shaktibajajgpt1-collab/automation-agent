# MF Sarthi — Goal-first Mutual Fund Guide 📱

A mobile-first Progressive Web App that helps a person decide **which mutual
funds to invest in, how much, and for how long** — following the discipline a
senior financial advisor would apply: goal first, horizon next, risk honestly,
and only then the fund.

It also fetches **live NAV data** for Indian mutual funds (from
[api.mfapi.in](https://www.mfapi.in/), sourced from AMFI) and shows the
information an investor must see before investing: multi-year returns, worst
drawdown, consistency, fund age, exit load, taxation, and what to verify in
the scheme document.

## What the app does

### 1. Plan tab — a guided 6-step decision wizard
1. **Goal** — retirement, child education, home, wealth, emergency fund… plus
   whether the goal is *essential* (essential goals get a safer mix).
2. **Time horizon** — 1 to 30 years.
3. **Amount** — either a target corpus (optionally inflation-adjusted at 6%
   p.a.) or a monthly budget.
4–6. **Three honest risk questions** — reaction to a 20% fall, source of the
   money, market experience.

The engine then produces:

- A **risk profile** (conservative / moderate / aggressive), downgraded one
  notch for essential goals.
- An **asset allocation** matched to the horizon:
  under 3 years → liquid + short-duration debt only; 3–5 years → cautious
  hybrid mix; 5–7 years → growth tilt with a cushion; 7+ years →
  equity-oriented. Shown as a donut with the equity share at the centre.
- The **required monthly SIP** (or projected corpus), with a "what if returns
  are 2% lower" stress figure so assumptions are never mistaken for promises.
- A **SIP split by category**, each with one clear role (core equity,
  stability, satellite) so there is no duplication.
- **Example funds per category** (large, established schemes) with live NAV
  and 1Y/3Y/5Y returns — tap through for full detail.
- A "how to act on this plan" checklist (direct plans, autopay SIPs, yearly
  review, glide into debt as the goal nears).

### 2. Explore tab — live search over every AMFI scheme
Search any Indian mutual fund and open its detail page.

### 3. Fund detail — what to know before investing
- Latest NAV and fund age (live).
- NAV history chart (1Y/3Y/5Y) with crosshair tooltip and an accessible
  table view.
- Returns (1Y/3Y/5Y CAGR), **worst 3-year drawdown**, and **share of positive
  rolling 1-year periods** (a simple consistency check).
- Fund house, category, type.
- A category-specific **"Know before you invest"** panel: risk level, sensible
  horizon, exit load, taxation (equity vs debt rules), and exactly what to
  verify in the scheme document (expense ratio, credit quality, overlap…).

### 4. Learn tab — the advisory guidance built in
The ten selection principles, the disciplined sequence, a pre-purchase
checklist, common mistakes, current tax rules, and a glossary.

## Live data

- Source: `https://api.mfapi.in` (free, AMFI-sourced NAV history; updates once
  per business day).
- Curated funds are resolved **by name search at runtime** (preferring
  Direct–Growth plans), so hard-coded scheme codes can never go stale.
- Responses are cached in `localStorage` (12h TTL) and the service worker
  keeps the last-seen data available offline; a header pill shows
  **Live NAV / Offline** status.

## Tech

- React 18 + Vite, no other runtime dependencies.
- Installable PWA: manifest + service worker (cache-first shell,
  network-first API with offline fallback).
- Mobile-first UI (≤480px layout, safe-area aware, bottom tab bar), automatic
  light/dark theme.
- Charts are hand-rolled SVG following an accessible dataviz method
  (validated colour palette, single axis, hairline grid, direct labels,
  tooltip + table view).

## Run it

```bash
npm install
npm run dev        # local development
npm run build      # production build → dist/
npm run preview    # serve the production build
```

Open on a phone (or a mobile viewport) and "Add to Home Screen" to install.

> **Note:** `api.mfapi.in` must be reachable from the browser. Without a
> connection the app still works with cached data and shows clear offline
> states.

## Disclaimer

MF Sarthi is an educational planning tool, **not investment advice**. Fund
names shown are large, well-known examples of each category, not
recommendations. Mutual fund investments are subject to market risks — read
all scheme-related documents carefully. Past performance does not guarantee
future returns. Consider consulting a SEBI-registered investment adviser
before investing.
