# nikita.sh — archived

> [!IMPORTANT]
> **This repository is archived and no longer developed.**
>
> Development continues at
> **[thatguynikita/terminal-portfolio](https://github.com/thatguynikita/terminal-portfolio)** —
> a rewrite of the same idea on Vite + TypeScript, with the CV prerendered
> instead of assembled in the browser.
>
> Nothing here is maintained. If you came for the terminal, go to the new
> repo; if you came for the history, it's all still here, frozen.

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/code-MIT-blue" alt="Code license: MIT"></a>
  <a href="LICENSE-CONTENT"><img src="https://img.shields.io/badge/content-CC_BY--NC--ND_4.0-lightgrey" alt="Content license: CC BY-NC-ND 4.0"></a>
  <a href="https://github.com/thatguynikita/terminal-portfolio"><img src="https://img.shields.io/badge/successor-terminal--portfolio-brightgreen" alt="Successor repository"></a>
</p>

<p align="center">
  <img src="docs/media/theme-preview.gif" width="560" alt="nikita.sh cycling through all 7 terminal color themes — green, amber, pascal, commodore, solarized, ubuntu, and the hidden sabbatical theme">
</p>

## What this was

**[nikita.sh](https://nikita.sh)** — a DevOps/SRE portfolio built as an
interactive terminal you could actually type into, with a proper résumé
underneath it (`cv.html`) and a themed 404 page. Bilingual (EN/RU),
hand-authored HTML/CSS/JS with zero runtime dependencies and no build
step for the live pages, plus a generated plain-HTML mirror so crawlers
and AI agents that skip JavaScript still got the real content.

Everything deployed lived under `public/`; the repo root was
source/tooling only. A small zero-dependency Node pipeline in `scripts/`
kept facts that appeared in several places in sync, from one source of
truth in `content/site-data.mjs`.

## Why it moved

The terminal, the themes and the easter eggs were worth keeping. The
machinery around them was not: a hand-rolled build driven by marker
comments inside the HTML, translatable text scattered across half a
dozen files, and a `/llm/` crawler mirror that existed only because the
CV rendered itself in the browser. Rebuilding on Vite + TypeScript with
the CV prerendered removes the mirror and most of the pipeline with it.

The [new repo](https://github.com/thatguynikita/terminal-portfolio) is
also built to be forked — adding a command is one file.

## If you're reading the archive

| Doc | Covers |
|---|---|
| [docs/TERMINAL.md](docs/TERMINAL.md) | Every command and easter egg in `index.html` |
| [docs/CV.md](docs/CV.md) | The `cv.html` résumé page — printing, language switching |
| [docs/404.md](docs/404.md) | The themed error page |
| [docs/UPDATE-GUIDE.md](docs/UPDATE-GUIDE.md) | The content-update and deploy workflow |
| [CLAUDE.md](CLAUDE.md) | Deep architecture notes — why things were shaped the way they were, and what had bitten before |

There is also an unmerged **[`template-v2`](../../tree/template-v2)**
branch, which took this codebase most of the way to a general-purpose
forkable template: configurable languages, hostname, mirrors and deploy
target, every user-facing string extracted into locale files, and an
`npm run init` first-run setup. It was superseded by the rewrite rather
than finished, and it never merged into `main`. Kept for reference.

## License

Dual-licensed, unchanged by the archive:

- **Code** (the terminal engine, the content-generation pipeline,
  build/deploy tooling, page structure and styling) — [MIT](LICENSE).
- **Content** (biography, résumé text, photography, and the terminal
  persona's writing — fortunes, boot-sequence lines, easter-egg dialogue
  and similar) — [CC BY-NC-ND 4.0](LICENSE-CONTENT). View and share with
  attribution; no commercial use, no adaptations of the persona, bio or
  photo as your own.

The `Playing` line in the terminal's neofetch card was fed by a separate
widget backend, still in its own repo:
[spotify-now-playing](https://github.com/thatguynikita/spotify-now-playing).
