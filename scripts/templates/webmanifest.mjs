/* ================================================================
   scripts/templates/webmanifest.mjs — public/site.webmanifest.

   Hand-authored before this, which is how its theme_color drifted to
   #ffffff while the <meta name="theme-color"> two files away said
   #060a08. Both now come from SITE.themeColor.
   ================================================================ */

import { SITE } from "../../site.config.mjs";
import { PERSON } from "../../content/site-data.mjs";
import { rootPath, host, defaultLocale } from "../lib/site-urls.mjs";

const ICONS = [
  { file: "assets/icons/android-chrome-192x192.png", sizes: "192x192" },
  { file: "assets/icons/android-chrome-512x512.png", sizes: "512x512" },
];

export function renderWebmanifest() {
  const manifest = {
    name: PERSON.name[defaultLocale.code],
    short_name: host,
    // Without this a project page served under basePath resolves the
    // start URL against the manifest's own location, which is only
    // right by accident. rootPath() makes it explicit.
    start_url: rootPath(""),
    icons: ICONS.map((i) => ({ src: rootPath(i.file), sizes: i.sizes, type: "image/png" })),
    theme_color: SITE.themeColor,
    background_color: SITE.themeColor,
    display: "standalone",
  };
  return JSON.stringify(manifest, null, 2) + "\n";
}
