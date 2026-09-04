/* ================================================================
   scripts/templates/terminal-block.mjs — the GENERATED:TERMINAL block.

   Three values the pages need at runtime that used to be typed out as
   "nikita.sh" in about thirty places: the terminal's pretend host, the
   site's own URL (for the footer and back-links), and the embedded
   game. Keeping them apart matters — see the note on terminalHost in
   site.config.mjs for why they are three values and not one domain.
   ================================================================ */

import { SITE } from "../../site.config.mjs";
import { siteUrl, displayUrl } from "../lib/site-urls.mjs";

export function renderTerminalBlock(indent = "  ") {
  const lines = [
    `const TERMINAL_HOST = ${JSON.stringify(SITE.terminalHost)};`,
    `const SITE_URL = ${JSON.stringify(siteUrl(""))};`,
    `const GAME = { enabled: ${SITE.game.enabled}, url: ${JSON.stringify(SITE.game.url)}, ` +
      `label: ${JSON.stringify(displayUrl(SITE.game.url).replace(/\/+$/, ""))}, ` +
      `title: ${JSON.stringify(SITE.game.title)} };`,
  ];
  return lines.map((l) => indent + l).join("\n");
}
