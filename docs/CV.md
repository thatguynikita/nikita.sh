# What cv.html is

The actual résumé — the page meant to be linked, printed, or handed to a
recruiter, as opposed to `index.html`'s terminal, which is the portfolio's
front door. It wears the same chrome (topbar, matrix rain, CRT/vignette,
`term-head` dots) for visual continuity, but has **none of index.html's
interactivity** — no command input, no dispatch engine (see
[TERMINAL.md](TERMINAL.md)). The only live behavior is the EN/RU toggle
and the print button.

## Content model: one `render()`, no incremental updates

Page-chrome strings live in a per-language `UI` object; résumé facts come
from the `GENERATED:*` constants (`JOBS`, `CERTS`, `LANGUAGES`, `SKILLS`,
`TRAITS`, `SOCIALS`, `ABOUT_CV_EN`/`_RU`, `EDUCATION_BODY_EN`/`_RU`) —
see [UPDATE-GUIDE.md](UPDATE-GUIDE.md) for how those get filled in from
`content/site-data.mjs`. `render()` concatenates all of it into one HTML
string and sets `termBody.innerHTML` wholesale; the language toggle just
re-runs `render()` from scratch rather than diffing anything.

`sectionHead(cmd, file)` is the one helper of note — it renders each
section's heading as a fake shell command (`cat about.txt`,
`tail -n 200 experience.log`, `less skills.sh`,
`grep -A99 not_so_hard_skills notes.txt`, ...). These aren't real
commands, just decoration continuing the terminal aesthetic without any
actual parsing behind them.

## Sections, in render order

Profile block (name/tagline/socials/meta line + avatar) → about →
experience (`JOBS`) → education → certifications → languages
(proficiency bars) → skills table → notes.txt ("not so hard skills" /
personality traits) → sign-off line.

## Avatar, print styles, JSON-LD, language toggle

- The avatar's theme-reactive duotone treatment is documented in
  `CLAUDE.md`'s Theming section (it's the canonical example the 404 page's
  cat photo treatment is based on) — not repeated here.
- `@media print` strips all chrome (matrix/CRT/vignette/topbar/footer/
  `term-head`/fake cursor) back to a plain printable page, and turns off
  the avatar's duotone filter/overlay so it prints as a normal photo.
- The `<head>` JSON-LD (`GENERATED:JSONLD`) always renders the English
  version regardless of the active language toggle — see the comment in
  `scripts/build.mjs`'s `buildCvHtml()` for why that's intentional, not
  a bug.
- The EN/RU toggle itself (chip, `aria-live` announcer, `localStorage`
  persistence) follows the same pattern documented in `CLAUDE.md`'s
  Theming section — identical shape on `index.html` and `404.html`.
