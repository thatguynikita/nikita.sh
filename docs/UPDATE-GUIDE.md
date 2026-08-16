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

## Workflow

1. **Edit `content/site-data.mjs`.** This is the only file you should be
   changing for a content update (bio text, a job bullet, a cert, a
   social link, a skill row, etc). See the comments at the top of that
   file for what's deliberately *not* here (terminal easter eggs, the
   cv.html "notes.txt" traits list, per-page `<title>`/`<meta
   description>` — those stay hand-authored where they already live).

2. **Run the build:**
   ```bash
   node scripts/build.mjs
   ```
   This regenerates:
   - the `GENERATED:*` data blocks inside `index.html` and `cv.html`
     (everything else in those files — layout, terminal logic, styling —
     is untouched)
   - `llm/index.html`, `llm/cv.html`, `llm/ru/index.html`,
     `llm/ru/cv.html` in full, including their JSON-LD (produced via
     `JSON.stringify`, so it can't go silently invalid on a missing
     comma the way hand-typed JSON-LD could)
   - `sitemap.xml`'s `<lastmod>`, bumped to today only for the URLs whose
     backing file actually changed (git's working-tree diff decides
     this — no separate cache file)

3. **Review the diff:**
   ```bash
   git diff
   ```
   This replaces the old 8-item manual checklist — if the diff looks
   right, you're done editing. Running the build with no data changes
   should produce no diff at all; if it does, something's out of sync.

4. **Deploy.** Still manual — you're serving from a Yandex Object Storage
   bucket behind nginx (SSL termination only, nginx doesn't set headers),
   so upload each *changed* file (`git status` tells you which) with
   `yc storage s3api put-object` and set `--content-type` explicitly —
   S3-compatible storage doesn't reliably infer charset from the file
   extension, which is what caused a `llms.txt` garbling issue in the
   past:
   ```bash
   yc storage s3api put-object \
     --body llm/index.html \
     --bucket <your-bucket-name> \
     --key llm/index.html \
     --content-type "text/html; charset=utf-8"
   ```
   Repeat with the right `--key` and content-type for each changed file
   (`.html` → `text/html; charset=utf-8`, `.xml` → `application/xml;
   charset=utf-8`, `.txt` → `text/plain; charset=utf-8`). If
   `--content-type` isn't available in your installed CLI version,
   set it afterward via the console: bucket → object → Properties →
   Metadata → edit `Content-Type`.

5. **Ask for a recrawl** instead of waiting. In Google Search Console,
   use URL Inspection → Request Indexing on each changed URL. Bing and
   Yandex don't have as fast a manual re-fetch option, but resubmitting
   the sitemap in their consoles nudges them too.

> **One-time note (2026-08 restructuring):** icons and images moved from
> the bucket root into `assets/icons/` and `assets/img/` (e.g.
> `favicon-32x32.png` → `assets/icons/favicon-32x32.png`,
> `nikita-photo.png` → `assets/img/nikita-photo.png`). The bucket key
> mirrors the repo path (`--key assets/icons/favicon-32x32.png`), same
> pattern as any other file — but the *old* root-level keys need a
> one-time re-upload at the new path plus deletion of the stale old-path
> objects so they don't linger in the bucket.

## What if I need to change page chrome, not facts?

Headings, button labels, and other page-chrome strings for the `/llm/`
mirrors live in small `UI` objects at the top of
`scripts/templates/mirror-index.mjs` and `scripts/templates/mirror-cv.mjs`
— edit those directly, then re-run the build. `index.html`/`cv.html`'s own
chrome (everything outside the `GENERATED:*` markers) is edited directly
in those files, same as before.

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
(`python3 -m http.server`) so the terminal and cv.html can be exercised
in a real browser — `file://` won't execute the page's JavaScript.

## Sanity checklist before you consider an update "done"

- [ ] `content/site-data.mjs` updated
- [ ] `node scripts/build.mjs` run
- [ ] `git diff` reviewed and matches intent
- [ ] Spot-checked the live terminal (`about`, `skills`, `contact`, `cv`)
      and at least one `/llm/*` mirror in a browser
- [ ] Deployed with `--content-type` (and `charset=utf-8`) set on every
      uploaded file
- [ ] Reindex requested for changed URLs in GSC
