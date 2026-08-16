// Small derivations from content/site-data.mjs shared by the templates.

import { ABOUT, ABOUT_CV_SUFFIX } from "../../content/site-data.mjs";

// index.html's ABOUT strings keep their original internal line-wraps
// (load-bearing for the terminal's line-by-line typewriter effect). The
// mirror pages and cv.html render prose in an HTML <p>, where whitespace
// collapses anyway — so here we collapse it explicitly to get one clean
// paragraph string to concatenate the CV suffix onto.
export function aboutParagraph(lang) {
  return ABOUT[lang].replace(/\s+/g, " ").trim();
}

export function aboutCvParagraph(lang) {
  return aboutParagraph(lang) + ABOUT_CV_SUFFIX[lang];
}

// "vk.company" from "https://vk.company" — the free-text location strings
// this replaces always showed the bare domain, not the scheme.
export function domainFromUrl(url) {
  return url ? url.replace(/^https?:\/\//, "") : null;
}

// "Saint Petersburg · vk.company" (or just the city, if org.url is null —
// e.g. Deutsche Telekom, which never had a domain in the source data).
export function jobLocationText(job, lang) {
  const domain = domainFromUrl(job.org.url);
  const loc = job.org.locationDisplay[lang];
  return domain ? `${loc} · ${domain}` : loc;
}

// "Nov 2022 – Sep 2025 (2y 11m) · VK, Saint Petersburg · vk.company"
export function jobWhenLine(job, lang) {
  return `${job.dates[lang]} (${job.span[lang]}) · ${job.org.name}, ${jobLocationText(job, lang)}`;
}
