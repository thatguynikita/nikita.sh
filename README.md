# nikita.sh

An interactive JS-terminal portfolio (`index.html`) plus a résumé page
(`cv.html`), with a plain-HTML mirror for crawlers/AI agents that don't
execute JavaScript. Deployed as static files to a Yandex Object Storage
bucket — the repo root mirrors the deploy root, so a few files are pinned
to root by web/browser convention even though everything else is
organized into folders.

## Project structure

```
index.html, cv.html      → the live site (hand-authored; only their
                            GENERATED:* data blocks are generator-owned)
theme.css, theme.js      → shared styling/JS for both live pages
favicon.ico, robots.txt,
site.webmanifest,
sitemap.xml, llms.txt    → pinned to root: browser/crawler convention
                            requires it, not a choice

assets/icons/             → favicons, apple-touch-icon, android-chrome
assets/img/                → nikita-photo.png, og-terminal.png (OG images)

content/site-data.mjs       → single source of truth for shared facts
                               (bio, socials, skills, jobs, certs, JSON-LD)
scripts/                     → node scripts/build.mjs propagates
                                content/site-data.mjs into index.html,
                                cv.html, and llm/* — see docs/UPDATE-GUIDE.md

llm/                          → plain-HTML crawler mirror (see below)
spotify/                       → now-playing widget backend (separate
                                  service, not part of the static deploy)
docs/UPDATE-GUIDE.md            → the content-update + deploy workflow
```

## Bilingual LLM/crawler mirror

`index.html` and `cv.html` at the site root are untouched. `llm/` is a
plain-HTML mirror under `/llm/` (English) and `/llm/ru/` (Russian), plus
the root-level discovery files.

## Files

```
robots.txt            → allows named AI/search crawlers, points to sitemap
llms.txt               → summary + direct links, both languages
sitemap.xml             → lists live pages + both mirrors, with hreflang alternates
llm/style.css           → shared stylesheet for the mirror pages
llm/index.html           → EN profile (about, skills, contact)
llm/cv.html               → EN full CV (experience, education, certs, languages, skills)
llm/ru/index.html          → RU profile
llm/ru/cv.html               → RU full CV
```

## Content source

These mirror pages are generated, not hand-maintained — `content/site-data.mjs`
is the single source of truth for the shared facts (bio, skills, socials,
job history, certs, languages, JSON-LD), and `node scripts/build.mjs`
propagates edits into `index.html`, `cv.html`, and all 4 mirror pages in
one run. See `docs/UPDATE-GUIDE.md` for the workflow. The cloaking concern from
the previous (hand-synced) version of these mirrors is why `index.html`/
`cv.html` still don't link to `/llm/` directly — that part is unchanged.

## Bilingual setup

- Each EN page has `<link rel="alternate" hreflang="ru" ...>` pointing to
  its RU counterpart, and vice versa, plus `x-default` pointing at EN.
- `sitemap.xml` repeats the same hreflang alternates per Google's
  guidance for multilingual sitemaps, so crawlers that read sitemaps
  (rather than in-page tags) also get the language relationship.
- Visible `EN / RU` links sit at the top of every mirror page for anyone
  (human or agent) who lands on the "wrong" language.

## Discovery

Same mechanism as before — `sitemap.xml` and `llms.txt` list `/llm/` and
`/llm/ru/` directly, since nothing in `index.html`/`cv.html` links to them.
Submit `sitemap.xml` to Google Search Console, Bing Webmaster Tools, and
Yandex.Webmaster so indexing doesn't depend on a crawler finding it
unprompted.

## Still to do outside these files

- Register the domain and submit `sitemap.xml` in the three search
  consoles.
- Add `rel="me"` back-links: put `https://nikita.sh` in the "website"
  field on GitHub, LinkedIn, Telegram, Twitter, Facebook, and Instagram,
  matching the `sameAs` list in the JSON-LD.
- Wikidata: only once you have an independent citing source.
