# Updating content: nikita.sh, cv.html, and the /llm/ mirrors

Facts that appear in more than one place on the site (bio, socials, skills,
job history, certs, languages, JSON-LD) — plus a couple of live-page-only
bits kept here for the same one-place-to-edit reason even though they
don't propagate to any mirror (cv.html's playful "notes.txt" traits list,
each job's playful closing bullet) — live in one file:
**`content/site-data.mjs`**. `index.html` and `cv.html` embed generated
data blocks fenced by `/* GENERATED:X:START */ ... /* GENERATED:X:END */`
comments; the 4 crawler mirrors under `/llm/` are fully generated files.
Nothing under those markers, and none of the `llm/*.html` files, should be
hand-edited — the next build overwrites it.

**Layout note:** everything actually deployed lives under `public/`
(`public/index.html`, `public/llm/*`, etc.) — `content/`, `scripts/`,
`docs/`, and this guide live outside `public/` and are never deployed.
S3 keys and the `npm run deploy -- ... index.html cv.html` argument
style below stay unprefixed (`public/` is stripped for the key), same
as `--dry-run` output.

## Workflow

1. **Edit `content/site-data.mjs`.** This is the only file you should be
   changing for a content update (bio text, a job bullet, a cert, a
   social link, a skill row, etc). See the comments at the top of that
   file for what's deliberately *not* here (terminal easter eggs, the
   cv.html "notes.txt" traits list, per-page `<title>`/`<meta
   description>` — those stay hand-authored where they already live).

2. **Run the build:**
   ```bash
   npm run build
   ```
   (equivalent to `node scripts/build.mjs` directly, if you'd rather skip npm)
   This regenerates:
   - the `GENERATED:*` data blocks inside `index.html`, `cv.html` and
     `404.html` (everything else in those files — layout, terminal
     logic, styling — is untouched)
   - `llm/index.html`, `llm/cv.html`, `llm/ru/index.html`,
     `llm/ru/cv.html` in full, including their JSON-LD (produced via
     `JSON.stringify`, so it can't go silently invalid on a missing
     comma the way hand-typed JSON-LD could)
   - `robots.txt`, `llms.txt` and `site.webmanifest` in full — don't
     hand-edit these, the next build overwrites them. Their prose lives
     in `LLMS_TXT` in `content/site-data.mjs`; the crawler allowlist and
     Content-Signal policy are named constants at the top of
     `scripts/templates/robots-txt.mjs`
   - `sitemap.xml` in full. Its `<lastmod>` dates are carried over from
     the sitemap already in the tree and bumped to today only for the
     URLs whose backing file actually changed (git's working-tree diff
     decides this — no separate cache file), so building twice in a row
     never produces a different file

3. **Review the diff:**
   ```bash
   git diff
   ```
   This replaces the old 8-item manual checklist — if the diff looks
   right, you're done editing. Running the build with no data changes
   should produce no diff at all; if it does, something's out of sync.

4. **Deploy:**
   ```bash
   npm run deploy -- --bucket <your-bucket-name>
   ```
   (or `export NIKITASH_BUCKET=<your-bucket-name>` once per shell and
   drop `-- --bucket ...` for `npm run deploy` alone). This uploads
   everything under `public/` (`index.html`, `cv.html`, `404.html`,
   `theme.css`, `theme.js`, `favicon.ico`, `robots.txt`, `sitemap.xml`,
   `site.webmanifest`, `llms.txt`, `assets/`, `llm/`) — via
   `yc storage s3api put-object`, one call per file, with the
   `--content-type` picked automatically from a table in the script
   (this is exactly what caused the `llms.txt` charset-garbling bug in
   the past — S3-compatible storage doesn't reliably infer charset from
   the file extension on its own). It always deploys the full manifest
   rather than trying to guess "what changed," since git only knows
   local history, not what's actually live in the bucket.

   Run `npm run deploy:dry-run` first (no bucket needed) to preview the
   exact file → key → content-type plan with zero network calls. The
   script continues through failures rather than stopping at the first
   one, and prints a pass/fail summary at the end.

   To deploy only specific files instead of the full manifest, pass them
   as extra arguments (`public/`-relative paths with the prefix dropped,
   same as they appear in `--dry-run` output):
   ```bash
   npm run deploy -- --bucket <your-bucket-name> index.html cv.html
   ```
   Each path is still checked against the manifest — a typo or a path
   outside the allowlist (e.g. `content/site-data.mjs`) errors out rather
   than silently deploying nothing or something unintended.

   `content/`, `scripts/`, `docs/`, `README.md`, and `.claude/` are never
   part of the deploy — the manifest is a recursive walk of everything
   under `public/` in `scripts/deploy.mjs`, and anything outside `public/`
   simply isn't reachable by it, not an explicit list with exclusions.

5. **Ask for a recrawl** instead of waiting. In Google Search Console,
   use URL Inspection → Request Indexing on each changed URL. Bing and
   Yandex don't have as fast a manual re-fetch option, but resubmitting
   the sitemap in their consoles nudges them too.

## What if I need to change page chrome, not facts?

Headings, button labels, and other page-chrome strings for the `/llm/`
mirrors live in small `UI` objects at the top of
`scripts/templates/mirror-index.mjs` and `scripts/templates/mirror-cv.mjs`
— edit those directly, then re-run the build. `index.html`/`cv.html`'s own
chrome (everything outside the `GENERATED:*` markers) is edited directly
in those files — no build step involved, since it's hand-authored, not
generated. `404.html` is entirely hand-authored the same way — it has no
`GENERATED:*` blocks at all, so `content/site-data.mjs` and `build.mjs`
don't touch it; edit it directly.

## Adding a new generated field

If you add a new fact to `content/site-data.mjs` that needs to appear on
the live pages too (not just the mirrors), you'll need a new marker pair.
Look at any existing one (e.g. `GENERATED:SOCIALS` in `index.html`) for
the pattern — wrap the data literal in
`/* GENERATED:NAME:START — edit content/site-data.mjs, then run scripts/build.mjs */`
/ `/* GENERATED:NAME:END */` comments (or the `<!-- -->` HTML-comment
form for markers sitting outside a `<script>` tag), then add a matching
`replaceMarker(html, "NAME", ...)` call in `scripts/build.mjs`.

## Local preview

`.claude/launch.json` defines a `static` preview config
(`python3 -m http.server --directory public`) so the terminal, cv.html, and 404.html can be
exercised in a real browser — `file://` won't execute the page's
JavaScript.

## Sanity checklist before you consider an update "done"

- [ ] `content/site-data.mjs` updated
- [ ] `npm run build` run
- [ ] `git diff` reviewed and matches intent
- [ ] Spot-checked the live terminal (`about`, `skills`, `contact`, `cv`)
      and at least one `/llm/*` mirror in a browser
- [ ] `npm run deploy:dry-run` reviewed, then deployed for real
- [ ] Reindex requested for changed URLs in GSC
