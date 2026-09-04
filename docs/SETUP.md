# Setting this up as your own site

You need Node 20 or newer. There is nothing to install — the build has
zero dependencies, and `node_modules/` never gets created.

```bash
git clone <your fork> my-site && cd my-site
npm run init      # asks a handful of questions, writes site.config.mjs
npm run build     # regenerates everything from your answers
```

Then open `public/index.html` through a local server (`file://` won't run
the JavaScript):

```bash
python3 -m http.server 8934 --directory public
```

That gets you a working site with someone else's face on it. The rest of
this page is about replacing the face.

---

## The two files you edit

Everything is driven by two files, and the split matters:

| File | What it holds | How often you touch it |
|---|---|---|
| **`site.config.mjs`** | Where the site lives and how it's assembled: URL, sub-path, languages, the terminal's pretend hostname, the crawler mirror, the game, the deploy target. | Once. `npm run init` writes it for you. |
| **`content/site-data.mjs`** | Who you are: name, bio, skills, jobs, education, certifications, socials, page titles. | Whenever your career does. |

A third file matters once you start rewording the terminal itself:
**`content/locales/<code>.mjs`**, which holds every string the pages
display. Adding a language means copying one of these and translating it.

Nothing else needs editing to make the site yours. If you find yourself
typing your domain into an HTML file, something has gone wrong — say so
in an issue, because that's a bug in this template.

---

## Four values that look like one domain

This is the single most common way to get a fork subtly wrong, so it's
worth thirty seconds up front. These are four independent things:

| Value | Where | What it is |
|---|---|---|
| `SITE.baseUrl` | `site.config.mjs` | Where the site is actually served. Feeds canonical URLs, Open Graph, the sitemap, the footer. |
| `SITE.terminalHost` | `site.config.mjs` | What the terminal *pretends* to be — the `guest@…` prompt, `uname`, the window title, and `ssh recruiter@…`. Pure set dressing, so it can be prettier than the real URL. A site at `alex.github.io` can still have a `guest@alex.dev` prompt. |
| `PERSON.email` | `content/site-data.mjs` | Your actual email. **Never derived from the domain** — most people's isn't on it. |
| `SITE.game.url` | `site.config.mjs` | The embedded game. Any page that allows framing; it is not a subdomain of your site. |

They're all `nikita.sh` in the original only because one person owned that
domain and used it for everything.

---

## What you must replace, and what you merely should

The repository is dual-licensed, and the line is not where people
usually expect it.

### Must replace — legally (CC BY-NC-ND, see `LICENSE-CONTENT`)

These are statements about a specific real person. You may not ship them
as your own:

- **`public/assets/img/nikita-photo.png`** — the photograph.
- **The name and identity**, in `PERSON.name` and throughout.
- **The factual personal content** in `content/site-data.mjs`: `ABOUT`,
  `ABOUT_CV_SUFFIX`, `SKILLS`, `JOBS`, `EDUCATION`, `CERTS`, `LANGUAGES`,
  `TRAITS`, `LLMS_TXT`, and the descriptions in `PAGES`.

### Should replace — because it's about someone else (MIT, so it's your call)

**The entire terminal persona and easter-egg layer is MIT**: the
fortunes, the boot sequence, the fake `top` / `df` / `ps` / `who` / `w` /
`uname` / `kubectl` / `terraform` output, the sudo jokes, the `whoami`
quips, the fake `claude` conversation, `milk-quest.sh`, and **the ssh
recruiter Q&A including its answers**. That's deliberate: it's the part
worth forking, and a licence forbidding you to adapt it would have made
forking pointless.

But some of it is written in one person's voice about one person's
career, and the licence permitting you to keep it doesn't mean you
should:

| Where | What still describes someone else |
|---|---|
| `content/locales/*.mjs` → `ssh.personas.recruiter` | Five answers about eleven years of production experience. |
| `content/locales/*.mjs` → `terminal.neofetch` labels + `site-data.mjs` | The neofetch card's `Uptime` and `Status` lines. |
| `content/locales/*.mjs` → `terminal.fortunes` | Fine to keep — they're generic sysadmin jokes. |
| `content/locales/*.mjs` → `terminal.claude.*` | The fake AI conversation. Generic, but it references *this* site's missing light theme. |

`npm run init` prints a list of every file still mentioning the previous
owner, and you can re-run it — or the `git grep` it suggests — until the
list is empty.

---

## Common configurations

### English only

Set one locale and delete the others:

```js
locales: [{ code: "en", ogLocale: "en_US", label: "EN" }],
```

```bash
rm content/locales/ru.mjs
```

You also need to remove the `ru:` half of every locale map in
`content/site-data.mjs` — the build will tell you exactly which ones, by
name, and refuse to run until you have. That's on purpose: a
half-translated site renders the literal word `undefined`.

Everything else adapts on its own. The language switcher disappears from
all three pages, the `lang` command and its `help` row disappear, no
`hreflang` is emitted, and the mirror pages stop advertising alternates.

### Adding a third language

Copy `content/locales/en.mjs` to `content/locales/de.mjs`, translate the
values, add `{ code: "de", ogLocale: "de_DE", label: "DE" }` to
`locales`, and add a `de:` entry to every locale map in
`content/site-data.mjs`. The build fails, listing every key you missed,
until both files agree.

### Turning off the crawler mirror

```js
mirrors: { enabled: false, path: "llm" },
```

No mirror pages are written, `sitemap.xml` and `llms.txt` stop listing
them, and the live pages stop emitting `hreflang`. The build also deletes
the mirror pages it previously generated — otherwise a fork would ship
the original site's, in the original language. The `<noscript>`
fallbacks are unaffected; they don't depend on the mirror.

One leftover: `public/llm/style.css` is hand-authored, so the build won't
delete it for you. Remove it yourself once nothing references it.

### Turning off the game

```js
game: { enabled: false, ... },
```

It leaves the fiction entirely: no `game` alias in `.bashrc`, no
`milk-quest.sh` in `ls`, `./milk-quest.sh` becomes command-not-found.
Better than a CRT window framing a dead URL.

---

## Publishing

Two options that don't overlap.

### GitHub Pages — no credentials, no bucket

Settings → Pages → Build and deployment → Source: **GitHub Actions**.
`.github/workflows/pages.yml` does the rest on every push to `main`.

Set `baseUrl` to the URL Pages gives you. On a **project** page
(`username.github.io/my-repo`) also set `basePath: "/my-repo"` — and know
that `404.html` only half works there, because GitHub serves a project
page's 404 only for paths under `/my-repo/`. A **user/org** page
(`username.github.io`) or a custom domain avoids that entirely and is the
better-supported route.

### Object storage — `npm run deploy`

Set `deploy.target` to `yandex` (the `yc` CLI) or `aws` (the `aws` CLI),
and `deploy.bucket` to your bucket. Then:

```bash
npm run deploy:dry-run                 # every file, its key, its content type — no network
npm run deploy                         # upload everything
npm run deploy -- index.html cv.html   # upload just these
```

The manifest is everything under `public/`. That boundary is the
allowlist: `content/`, `scripts/`, `docs/` and `site.config.mjs` sit
outside it and can't be deployed by accident.

---

## Checking your work

```bash
npm run build     # must leave a clean `git status` when run twice
npm test          # three checks, described below
```

| Check | Catches |
|---|---|
| `npm run build` + clean `git status` | A hand-edited `GENERATED:*` block, or content edited without rebuilding. CI enforces this. |
| `npm run test:strings` | A user-visible string that vanished or got garbled. The build can't see this — it's perfectly happy to regenerate a page with a line missing. |
| `npm run test:i18n` | A `t()` key that doesn't resolve in some language. Otherwise it renders as the literal word `undefined`. |
| `npm run test:init` | `npm run init` mangling `site.config.mjs`. |

When you change your own copy, `tests/golden-strings.json` will start
failing — it's a snapshot of the strings that existed before. Re-record
it once you're happy:

```bash
node scripts/harvest-strings.mjs HEAD
```

and review that diff, which is precisely the list of copy you changed.

---

## Where things are

| Path | What |
|---|---|
| `public/` | Everything deployed, mapping 1:1 to the site root. |
| `public/index.html` | The terminal. Hand-authored; only its `GENERATED:*` blocks belong to the build. |
| `public/cv.html`, `public/404.html` | The résumé and the error page, same arrangement. |
| `public/theme.css`, `public/theme.js` | Shared by all three. Adding a theme is one CSS block — see `CLAUDE.md`. |
| `public/llm/` | The generated crawler mirror. Never hand-edit; the next build overwrites it. |
| `content/site-data.mjs` | Who you are. |
| `content/locales/*.mjs` | Every string the pages display. |
| `site.config.mjs` | Where the site lives and how it's assembled. |
| `scripts/` | The build, the deploy, the checks. Zero dependencies. |
| `docs/TERMINAL.md` | What the terminal can actually do — worth reading before you cut anything. |

`CLAUDE.md` in the repo root is the deep architectural notes: why the
build is shaped the way it is, and which parts have bitten people before.
It's written for an AI assistant working in this codebase, but it's the
most complete description of the machinery that exists.
