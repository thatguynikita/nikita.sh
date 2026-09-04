/* ================================================================
   scripts/templates/robots-txt.mjs — public/robots.txt.

   Only the Sitemap URL is derived from config; the two editorial
   decisions in this file are the constants right below, and they are
   the two things a forker may want to change:

     NAMED_CRAWLERS  search and AI crawlers granted an explicit Allow,
                     rather than relying on the wildcard group. Named
                     groups win over "User-agent: *" in every major
                     implementation, so listing a bot here is what
                     actually guarantees it isn't caught by a future
                     restriction added to the wildcard group.

     CONTENT_SIGNAL  Cloudflare's Content Signals Policy
                     (https://contentsignals.org) — search=yes means
                     "index me", ai-train=yes means "training on this
                     is fine", ai-input=yes means "quote me in an AI
                     answer". Someone who does *not* want to be
                     training data sets ai-train=no here; note that
                     this is a stated preference, not an enforcement
                     mechanism.

   Both are code rather than site.config.mjs keys on purpose: they are
   a curated list and a policy string, not deployment settings, and a
   forker changing them is editing a decision, not filling in a blank.
   ================================================================ */

import { siteUrl } from "../lib/site-urls.mjs";

const NAMED_CRAWLERS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
  "PerplexityBot",
  "Perplexity-User",
  "Googlebot",
  "Google-Extended",
  "Bingbot",
  "Applebot",
  "YandexBot",
  "Amazonbot",
  "DuckDuckBot",
];

const CONTENT_SIGNAL = "search=yes, ai-train=yes, ai-input=yes";

export function renderRobotsTxt() {
  const lines = [];

  for (const ua of NAMED_CRAWLERS) lines.push(`User-agent: ${ua}`);
  lines.push("Allow: /");
  lines.push("");

  lines.push("User-agent: *");
  lines.push(`Content-Signal: ${CONTENT_SIGNAL}`);
  lines.push("Allow: /");
  lines.push("");

  lines.push(`Sitemap: ${siteUrl("sitemap.xml")}`);

  return lines.join("\n") + "\n";
}
