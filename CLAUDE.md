# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**nikita.sh** is a DevOps/SRE portfolio dressed up as an interactive terminal — a playful homage, not a real shell. `index.html` is the terminal; `cv.html` is a proper résumé underneath it; `404.html` is a themed error page. All three are bilingual (EN/RU), hand-authored HTML/CSS/JS with **zero runtime dependencies and no build step for the live pages themselves** — `theme.css`/`theme.js` are shared between them. A small Node pipeline (zero npm dependencies) keeps facts that appear in multiple places in sync, and generates a plain-HTML mirror for crawlers/LLM agents that don't execute JavaScript.

## Commands

```bash
npm run build          # propagate content/site-data.mjs -> index.html, cv.html, llm/*, sitemap.xml
npm run deploy:dry-run # preview the full deploy manifest (file -> bucket key -> content-type), no network calls, no bucket needed
npm run deploy -- --bucket <bucket-name>   # deploy everything (or set NIKITASH_BUCKET env var and drop --bucket)
npm run deploy -- --bucket <bucket-name> index.html cv.html   # deploy only specific files (still checked against the allowlist)
```

There is no test suite, linter, or bundler — no dependencies are installed (`node_modules/` is gitignored but nothing populates it). "Correctness" is verified by `git diff` after a build (should be empty on a no-op run) and by exercising pages in a real browser (`file://` won't execute the JS — use the `static` preview config in `.claude/launch.json`, `python3 -m http.server` on port 8934, which serves `index.html`/`cv.html`/`404.html`).

CI (`.github/workflows/ci.yml`) runs `npm run build` then fails if `git status --porcelain` is non-empty — this is the drift check that catches a hand-edited `GENERATED:*` block or `llm/*` mirror page. It also runs `npm run deploy:dry-run` as a smoke test.

## Content pipeline architecture

This is the part that requires reading multiple files to understand. Facts that appear in more than one place (bio, socials, skills, job history, certs, languages, JSON-LD) live in **one file: `content/site-data.mjs`**. Everything else reads from it:

- `scripts/build.mjs` is the orchestrator. It imports from `content/site-data.mjs`, formats each field to match the hand-written array/object style already used in `index.html`/`cv.html` (compact, unquoted keys — see the `tupleRow`/`certRow`/`legacyJobRow` etc. formatter functions), and writes the result into two kinds of targets:
  - **`index.html` and `cv.html`**: only the regions between `/* GENERATED:NAME:START */ ... /* GENERATED:NAME:END */` comments (or `<!-- -->` for the one marker sitting in markup, cv.html's head JSON-LD) are touched, via `scripts/lib/markers.mjs`'s `replaceMarker()`. Everything else in those files — layout, terminal logic, styling, `404.html` in its entirety — is hand-authored and the build never touches it.
  - **`llm/index.html`, `llm/cv.html`, `llm/ru/index.html`, `llm/ru/cv.html`**: fully regenerated every run from `scripts/templates/mirror-index.mjs` / `mirror-cv.mjs`. Never hand-edit these — the next build overwrites them. Page-chrome strings (headings, button labels) for the mirrors live in small `UI` objects at the top of those template files, not in `content/site-data.mjs`.
- `sitemap.xml`'s `<lastmod>` gets bumped to today, but only for the sitemapped URLs whose backing file actually changed in the git working tree (`git status --porcelain` decides this — no separate cache file).
- Data items carry a `contexts: ["index", "cv"]` array (see `SOCIALS`/`SKILLS` in `content/site-data.mjs`) so the same list can be filtered differently per page — e.g. Twitter/Facebook/Instagram only show on `index.html`'s terminal, not the résumé.
- `JOBS` entries have a structured `org: {name, url, locationDisplay}` plus an optional `playfulBullet`; `scripts/build.mjs`'s `legacyJobRow()` reshapes this into the flat `{co, loc:{en,ru}}` shape `cv.html`'s hand-authored `render()` expects, rather than changing that rendering logic.

**Deliberately NOT in `content/site-data.mjs`** (stays hand-authored where it already lives): `index.html`'s terminal easter eggs (fortunes, fake `top`/`kubectl`/`terraform` output, the ssh persona Q&A, boot sequence jokes — `docs/TERMINAL.md` has the full user-facing feature list; its command dispatch/mode-switching internals aren't documented outside the code itself), `cv.html`'s "notes.txt" traits list is in `site-data.mjs` but its playful framing isn't, and `404.html` in full — it has zero `GENERATED:*` blocks, so the build script never touches it. Per-page `<title>`/`<meta description>` also stay hand-authored in place.

Full workflow and the "adding a new generated field" recipe: `docs/UPDATE-GUIDE.md`.

## Deploy

`scripts/deploy.mjs` shells out to `yc storage s3api put-object` (Yandex Object Storage) — one call per file, zero dependencies. The manifest is an **explicit allowlist**, not a blocklist: root files (`index.html`, `cv.html`, `404.html`, `theme.css`, `theme.js`, `favicon.ico`, `robots.txt`, `sitemap.xml`, `site.webmanifest`, `llms.txt`) plus everything under `assets/` and `llm/`. `content/`, `scripts/`, `docs/`, `README.md`, `.claude/` can never end up in a deploy by accident. Content-Type is picked from a table keyed by extension (this replaced a manual process that once garbled `llms.txt`'s charset). Always deploys the full manifest, not a diff — git only knows local history, not what's actually live in the bucket.

## Theming and shared JS (`theme.js` / `theme.css`)

`theme.js` exposes `window.NikitaTheme` and is shared by `index.html`, `cv.html`, and `404.html` so a preference set on one page is respected on the others (`localStorage`, keys `nikita.sh:theme` / `nikita.sh:lang` / `nikita.sh:matrix`). Key facts:

- `THEME_MAP` has three themes (`green`/`amber`/`cyan`), each reassigning `--fg`, `--fg-dim`, `--accent`, `--warn`. **`--fg` is the one true "theme color" — don't assume any other token is stable across themes.** In particular `--amber`/`--warn`-ish values get reassigned per theme (e.g. in the `amber` theme, the "warn" slot becomes cyan) — if something must render in a fixed, theme-independent color regardless of the active `theme` command, hardcode the hex value with a comment explaining why, don't reach for a CSS var that looks stable but isn't.
- Duotone image treatment (used for `cv.html`'s avatar photo and `404.html`'s cat illustration): `filter:grayscale(1) contrast(1.05) brightness(1.05)` on the `<img>`, plus an overlay layer using `background:var(--fg); mix-blend-mode:color;` so the image re-tints with whichever theme is active. For an image in an opaque rectangular frame (the avatar), the overlay is a plain `::after` sized to the frame. For an image with real transparency (the 404 cat, not framed), the overlay additionally needs `mask-image:url(<same-png>)` (with `-webkit-` prefix) so the color layer is clipped to the PNG's own alpha shape instead of bleeding into a solid rectangle over the transparent background.
- `createMatrixRain(canvasEl)` drives the background matrix-rain canvas; canvas can't read CSS custom properties, so `applyTheme()` returns the theme's `fg` color for callers that also need to recolor it directly.
- Bilingual toggle pattern (established on `cv.html`, reused on `404.html`): a `UI` object per language, a `lang` variable persisted via `writeStored()`/`restoreSettings()`, a `.sr-only` (visually-hidden) CSS utility class in `theme.css`, and an `aria-live="polite"` announcer region (`#langAnnounce`) plus `aria-label` on the toggle button, so a screen reader user gets the same feedback a sighted user gets from the visible chip changing.
- Page-specific error/404 concern: `404.html` is served at an arbitrary broken URL, so it must use **root-absolute** paths (`/theme.css`, `/theme.js`, `/cv.html`) rather than relative ones — a relative path resolves against whatever URL the browser's address bar shows, not the file's real location, and breaks specifically for paths with a trailing slash.

## Crawler mirror (`/llm/`)

`index.html`/`cv.html` never link to `/llm/` — a JS page and a plain-HTML page serving the same content differently at the same URL would read as cloaking to search engines. Discovery instead goes through `sitemap.xml` and `llms.txt` (which list `/llm/` and `/llm/ru/` directly), `hreflang` cross-references between the EN/RU mirror pairs (plus `x-default` pointing at EN), and a visible EN/RU switcher on each mirror page.

## Licensing

Dual-licensed and this split matters when adding new content: **code** (terminal engine, content pipeline, build/deploy tooling, page structure/styling) is MIT (`LICENSE`); **content** (bio, résumé text, photography, the terminal persona's writing — fortunes, boot-sequence lines, easter-egg dialogue) is CC BY-NC-ND 4.0 (`LICENSE-CONTENT`), applied by reference, not full legal text inline.

## Other

- The "Playing" line shown in the terminal's neofetch card is produced by a separate widget backend, developed in its own repo ([thatguynikita/spotify-now-playing](https://github.com/thatguynikita/spotify-now-playing), interface documented in that repo's `CONTRACT.md`) — it used to live here under `spotify/` but was moved out, and was never part of the static site or deploy manifest.
- `.editorconfig`: 2-space indent by default, 4-space for `*.py`, no trailing-whitespace-trim for `*.md`.

## Working conventions specific to this repo

- **The bilingual EN/RU toggle is load-bearing.** Any new visible text — including text baked into an image asset — needs an EN and RU version that responds to the toggle. If a supplied image has language-specific text baked into its pixels (e.g. a generated illustration with a caption drawn on it), that's a conflict with the toggle, not a detail to silently keep or silently crop — flag it and ask.
- **Pixel-level layout parity between `index.html`/`cv.html`/`404.html`'s shared header is expected and has broken in non-obvious ways before** — once from a missing Google Fonts `<link>` (fallback-font metrics shifted the whole `.term` box), once from one page's element being a bare `<span>` vs. another's `<a>` picking up `.topbar a`'s padding from `theme.css`. "Aligned" here means matching `getBoundingClientRect()` values, not just looking close in a screenshot — a 2-3px gap has been treated as a real bug worth chasing down, not rounding error.
- **After a cluster of iterative edits to one file (add something, live with it, prune it, adjust again), do an explicit dead-code sweep before calling it done** — unused CSS selectors/ids, orphaned JS functions or variables, stray `<span>`/element ids nothing references. This codebase accumulates that kind of residue from exactly this edit pattern (see `404.html`'s history: cans → removed, `zzz` floaty → removed, a `print` UI string copy-pasted from `cv.html` that was never wired to anything).
- **When a correction reveals a misread of scope, don't reflexively revert everything done under the wrong premise** — check whether any of it is independently valid first. A misunderstanding about *which* feature was meant doesn't necessarily mean the resulting code was wrong; e.g. a fix made while chasing the wrong "always green" element can still be a legitimate, unrelated bug fix worth keeping.
- **The local preview harness can silently throttle animations.** A stray auto-opened tab stealing focus backgrounds the intended preview tab (`document.hidden === true`), which throttles `setTimeout` and CSS animations to ~1/sec — this looks like a real animation bug but isn't. Close stray tabs and reselect the intended one before judging animation/timer behavior; if still unsure, verify via `getComputedStyle`/`animationPlayState` instead of trusting a screenshot.
- **The local preview browser can silently serve a stale cached `theme.css`/`theme.js`** after an edit — observed repeatedly, surviving a normal reload, a hard reload (Cmd+Shift+R), and even a brand-new tab, since the HTTP cache is shared browser-wide per origin/port and `python3 -m http.server` sends no `Cache-Control` header. If an edit to either file doesn't visually take effect, don't conclude the code is wrong — first compare `fetch(url)` vs `fetch(url, {cache:'no-store'})` (byte length, or check for a string you just added) to see whether it's actually a cache issue, and verify against the `{cache:'no-store'}` copy.
- **`rgba(61,255,138,...)` / `#3dff8a` (hardcoded green) is scattered well beyond `theme.css`'s `:root` block** — in page-level `<style>` blocks in `index.html`/`cv.html` (hover backgrounds, `.rule.strong`, `.lang-bar`, etc.) and in one-off effects like `index.html`'s game-overlay `<iframe>` filter (`hue-rotate(...)`, see Theming section above). A request like "this is always green regardless of theme" can refer to any of several such spots sharing no obvious name — `grep -rn "61,255,138\|3dff8a"` across the repo first to see every candidate before picking one to fix.
- **To calibrate a CSS `filter` hue-rotate() (or similar) so its output matches a theme color, don't eyeball it** — the CSS Filter Effects spec defines exact matrices for `grayscale`/`sepia`/`hue-rotate`/`saturate`/etc.; implementing that math (e.g. in a throwaway Python script) and solving for the angle whose output hue best matches the target `--fg` gives an exact, reproducible answer instead of trial-and-error screenshots.
