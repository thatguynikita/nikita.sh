# nikita.sh — bilingual parallel LLM/crawler mirror

`index.html` and `cv.html` at the site root are untouched. This adds a
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

Populated directly from the real `SKILLS_EN`/`SKILLS_RU`, `SOCIALS`,
`ABOUT_EN`/`ABOUT_RU` variables and the live CV output you provided —
not placeholders. If you update the terminal's content, update these
mirror pages in the same sitting so the two stay in sync (see the
cloaking note from the previous version — still applies).

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
