/* ================================================================
   scripts/templates/footer.mjs — the footer every page shares, and
   cv.html/404.html's "back to the terminal" top-bar link.

   Static markup rather than something JS fills in: the footer is
   meaningful without JavaScript, and one of the three pages is a 404
   served to clients that may never run any.
   ================================================================ */

import { SITE } from "../../site.config.mjs";
import { PERSON, LICENSE_CONTENT } from "../../content/site-data.mjs";
import { escapeHtml } from "../lib/html.mjs";
import { siteUrl, displayUrl, host, defaultLocale } from "../lib/site-urls.mjs";

// Copyright line + content licence. The trailing "· …" each page adds
// after this is hand-authored and page-specific (index.html points at
// `help`, the other two link back to the terminal), so it stays outside
// the marker — except its href, which is GENERATED:FOOTER_BACK.
export function renderFooter() {
  const name = escapeHtml(PERSON.name[defaultLocale.code]);
  const { year, name: licenseName, url: licenseUrl } = LICENSE_CONTENT;
  return [
    `    © ${year} <a href="${siteUrl("")}" target="_blank" rel="noopener">${name}</a> ·`,
    `    <a href="${licenseUrl}" target="_blank" rel="noopener">${escapeHtml(licenseName)}</a>`,
  ].join("\n");
}

/** cv.html / 404.html's trailing footer link. Text is set by their own JS. */
export function renderFooterBack() {
  return `    · <a href="${siteUrl("")}" id="footerBack">back to terminal</a>`;
}

/**
 * index.html's top-left label. Not a link — you're already on the
 * terminal — but the same slot as cv.html/404.html's back-link, and it
 * keeps their two hidden spacer spans so the three headers line up to
 * the pixel (a recurring source of bugs; see CLAUDE.md).
 */
export function renderTopbarLabel() {
  return (
    `    <span class="glow" style="display:inline-block; padding:6px 8px;">` +
    `<span aria-hidden="true" style="visibility:hidden">&larr; </span>${escapeHtml(host)}</span>`
  );
}

/** The window-chrome title, "guest@<host> — <what this page is>". */
export function renderTermTitle(suffix) {
  return `      <span class="term-title">guest@${escapeHtml(SITE.terminalHost)} — ${escapeHtml(suffix)}</span>`;
}

/** The game overlay's window title — host plus the game's own address. */
export function renderGameTitle() {
  const label = displayUrl(SITE.game.url).replace(/\/+$/, "");
  return renderTermTitle(label);
}

/** cv.html / 404.html's top-left "← nikita.sh" link. */
export function renderBackLink() {
  return `    <a href="${siteUrl("")}">&larr; ${escapeHtml(host)}</a>`;
}
