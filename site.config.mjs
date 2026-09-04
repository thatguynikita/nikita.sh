/* ================================================================
   site.config.mjs — deployment/structure config.

   The split with content/site-data.mjs: this file is "where this site
   lives and how it's put together"; site-data.mjs is "who the person
   is". A forker edits this one once, and site-data.mjs continuously.

   Everything here is consumed by the build. Later PRs in the template
   conversion add more keys (terminal host, the game/now-playing
   feature flags, deploy target) as the code that reads them lands —
   deliberately no placeholder config for things nothing reads yet.
   ================================================================ */

export const SITE = {
  // Origin only, no trailing slash and no path.
  baseUrl: "https://nikita.sh",

  // Sub-path the site is served under, "" for a domain root. Set this
  // to "/repo-name" only for a GitHub *project* page
  // (username.github.io/repo-name). Note that 404.html is only
  // partially usable in that setup — GitHub serves a project page's
  // 404 only for paths under /repo-name/ — so a custom domain or a
  // user/org page (username.github.io) is the better-supported route.
  basePath: "",

  // Browser UI color (Android Chrome address bar, iOS PWA). Matches the
  // green theme's --bg. Note first-time visitors are assigned a random
  // theme, so this won't match every visitor's background.
  themeColor: "#060a08",

  // Site UI languages. First entry is the default: it's the language
  // the live pages' <head>, JSON-LD and <noscript> fallbacks are
  // rendered in, and the one whose /llm/ mirror sits at the root of the
  // mirror path.
  //
  // Objects rather than bare codes because neither `ogLocale`
  // (en -> en_US, but pt -> pt_BR or pt_PT?) nor the switcher `label`
  // can be derived from a two-letter code. Language *names* are not a
  // field here — Intl.DisplayNames derives those from the code, in
  // whichever language they need to be rendered (see site-urls.mjs).
  //
  // NOT to be confused with site-data.mjs's LANGUAGES, which is the
  // human languages the *person* speaks, shown on the CV.
  locales: [
    { code: "en", ogLocale: "en_US", label: "EN" },
    { code: "ru", ogLocale: "ru_RU", label: "RU" },
  ],

  // The generated plain-HTML crawler mirror (see README). `path` is the
  // directory under the site root; the default locale's mirror lives at
  // `<path>/` and every other locale at `<path>/<code>/`.
  mirrors: {
    enabled: true,
    path: "llm",
  },
};
