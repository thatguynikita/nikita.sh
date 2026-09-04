#!/usr/bin/env node
// Asserts that every string recorded in tests/golden-strings.json still
// exists somewhere — either still in the page, or in a locale file it
// was migrated into.
//
//   npm run test:strings
//
// This is the safety net the drift check cannot be. `npm run build`
// only proves the build is idempotent; it is perfectly happy to
// regenerate a page with a line missing. This proves no user-visible
// string vanished or got garbled while being moved.
//
// Strings that legitimately changed shape (a `${x}` interpolation
// becoming a "{x}" placeholder) go in EXPECTED_CHANGES below, with the
// replacement and a reason — so the exceptions are reviewable rather
// than invisible.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { harvestStrings, collectLocaleStrings } from "./lib/harvest-strings.mjs";
import { localeCodes } from "./lib/site-urls.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

// Strings that legitimately changed shape or disappeared, grouped by
// reason so the list stays readable as it grows. Everything in
// EXPECTED_CHANGES must have its replacement actually present, so a typo
// in a replacement fails the check rather than silently excusing the
// original. Nothing user-visible should ever end up in
// EXPECTED_REMOVALS — that list is for literals that were code, or for
// artefacts of the harvester's deliberately-crude tokenisation.

const EXPECTED_CHANGES = [
  {
    why:
      "A ${expr} interpolation became a {name} placeholder when the string moved into a locale file. t() fills it in at the call site.",
    pairs: [
      ["<span class=\"dim\"># known hosts on this machine:</span> ${hostList}",
       "<span class=\"dim\"># known hosts on this machine:</span> {hosts}"],
      ["<span class=\"dim\"># известные хосты на этой машине:</span> ${hostList}",
       "<span class=\"dim\"># известные хосты на этой машине:</span> {hosts}"],
      ["Building it was my job — flipping the switch is yours: theme ${SECRET_THEME_NAME}.",
       "Building it was my job — flipping the switch is yours: theme {theme}."],
      ["Error from server (NotFound): pods \"${escapeHtml(podName)}\" not found",
       "Error from server (NotFound): pods \"{pod}\" not found"],
      ["Error from server (NotFound): pods \"${escapeHtml(podName)}\" не найден",
       "Error from server (NotFound): pods \"{pod}\" не найден"],
      ["Ticket's marked done. Nothing left to build — just type theme ${SECRET_THEME_NAME}.",
       "Ticket's marked done. Nothing left to build — just type theme {theme}."],
      ["Warning: Permanently added '${host}' (ECDSA) to the list of known hosts.",
       "Warning: Permanently added '{host}' (ECDSA) to the list of known hosts."],
      ["closing connection to ${host}...",
       "closing connection to {host}..."],
      ["connected to <span class=\"glow\">${host}</span>.",
       "connected to <span class=\"glow\">{host}</span>."],
      ["error: unknown command \"${escapeHtml(arg)}\" for \"kubectl\"",
       "error: unknown command \"{command}\" for \"kubectl\""],
      ["error: неизвестная команда \"${escapeHtml(arg)}\" для \"kubectl\"",
       "error: неизвестная команда \"{command}\" для \"kubectl\""],
      ["requesting handshake with ${host} ...",
       "requesting handshake with {host} ..."],
      ["terraform: unknown subcommand \"${escapeHtml(arg)}\"",
       "terraform: unknown subcommand \"{command}\""],
      ["terraform: неизвестная подкоманда \"${escapeHtml(arg)}\"",
       "terraform: неизвестная подкоманда \"{command}\""],
      ["unrecognized command — available: ${qa.map(q=>q.cmd).join(', ')} or \"exit\"",
       "unrecognized command — available: {commands} or \"exit\""],
      ["Написать — моя работа, переключать — уже твоя: theme ${SECRET_THEME_NAME}.",
       "Написать — моя работа, переключать — уже твоя: theme {theme}."],
      ["Тикет помечен как выполненный. Строить больше нечего — просто набери theme ${SECRET_THEME_NAME}.",
       "Тикет помечен как выполненный. Строить больше нечего — просто набери theme {theme}."],
      ["запрашиваю рукопожатие с ${host} ...",
       "запрашиваю рукопожатие с {host} ..."],
      ["неизвестная команда — доступны: ${qa.map(q=>q.cmd).join(', ')} или \"exit\"",
       "неизвестная команда — доступны: {commands} или \"exit\""],
      ["подключено к <span class=\"glow\">${host}</span>.",
       "подключено к <span class=\"glow\">{host}</span>."],
      ["разрываю соединение с ${host}...",
       "разрываю соединение с {host}..."],
    ],
  },
  {
    why:
      "A template literal that wrapped a `lang === 'ru' ? … : …` ternary now wraps a t() call. The literal's own text is unchanged; only what it interpolates moved.",
    pairs: [
      ["<div class=\"dim\">${lang === 'ru' ? 'темы:' : 'topics:'}</div>",
       "<div class=\"dim\">${t('ssh.topicsLabel')}</div>"],
      ["<span class=\"dim\">${lang === 'ru' ? '(top — q для выхода)' : '(top — q to quit)'}</span>",
       "<span class=\"dim\">${t('top.quitHint')}</span>"],
      ["<div><span class=\"accent\">${lang==='ru'?'Причина':'Reason'}:</span> ${d.reason}</div>",
       "<div><span class=\"accent\">${t('kubectl.reasonLabel')}:</span> ${d.reason}</div>"],
    ],
  },
  {
    why:
      "PR 6b: the ssh failure sequence's step text moved out of the function body — the translated steps into the locale files, the two verbatim OpenSSH lines into SSH_FAILURE_STEPS — and its ${h}/${count} interpolation became {host}/{count} placeholders filled by fillTemplate().",
    pairs: [
      ["<span class=\"amber\">[note]</span> this is attempt #${count} at a host that does not exist",
       "<span class=\"amber\">[note]</span> this is attempt #{count} at a host that does not exist"],
      ["<span class=\"amber\">[note]</span> это попытка №${count} подключиться к хосту, которого не существует",
       "<span class=\"amber\">[note]</span> это попытка №{count} подключиться к хосту, которого не существует"],
      ["ssh: connect to host ${h} port 22: Connection timed out",
       "ssh: connect to host {host} port 22: Connection timed out"],
      ["ssh: connecting to ${h} ...",
       "ssh: connecting to {host} ..."],
      ["ssh: подключение к ${h} ...",
       "ssh: подключение к {host} ..."],
    ],
  },
  {
    why:
      "PR 7: strings that named the other language, or the language pair, now take a placeholder so they work for any locale list. langUsage was one bilingual string shared by both locales (\"usage: lang <ru|en> / использование: lang <ru|en>\"); it is now one single-language string per locale, with {codes} filled from LOCALE_CODES — so a fork with en+de doesn't show Russian.",
    pairs: [
      ["usage: lang &lt;ru|en&gt;  /  использование: lang &lt;ru|en&gt;",
       "usage: lang &lt;{codes}&gt;"],
      ["Switch to Russian",
       "Switch to {language}"],
      ["Переключить на английский",
       "Переключить на {language}"],
    ],
  },
  {
    why:
      "PR 8: the terminal's pretend host, the ssh persona's address and the embedded game's URL became site.config.mjs values (terminalHost, game.url), so strings that spelled them out now carry a {host}/{sshTarget}/{game}/{gameUrl} placeholder, or interpolate TERMINAL_HOST / GAME / PERSONAS.recruiter.host.",
    pairs: [
      ["<h2 class=\"line section-head\"><span class=\"ps\">guest@nikita.sh:~$</span><span class=\"cmd\">${cmd}</span> <span class=\"file\">${file}</span></h2>",
       "<h2 class=\"line section-head\"><span class=\"ps\">guest@${TERMINAL_HOST}:~$</span><span class=\"cmd\">${cmd}</span> <span class=\"file\">${file}</span></h2>"],
      ["# see also: <a href=\"https://cat.nikita.sh\" target=\"_blank\" rel=\"noopener\">cat.nikita.sh</a>",
       "# see also: <a href=\"{gameUrl}\" target=\"_blank\" rel=\"noopener\">{game}</a>"],
      ["# см. также: <a href=\"https://cat.nikita.sh\" target=\"_blank\" rel=\"noopener\">cat.nikita.sh</a>",
       "# см. также: <a href=\"{gameUrl}\" target=\"_blank\" rel=\"noopener\">{game}</a>"],
      ["-ssh recruiter@nikita.sh",
       "-ssh ${PERSONAS.recruiter.host}"],
      ["<div class=\"neofetch\">\n      <div class=\"nf-art\">${NEOFETCH}</div>\n      <div class=\"nf-info\">\n        <div><span class=\"nf-key accent\">guest</span>@<span class=\"accent\">nikita.sh</span></div>\n        <div class=\"dim\">--------------------</div>\n        <div><span class=\"nf-key\">${L.name}</span> ${L.nameVal}</div>\n        <div><span class=\"nf-key\">${L.role}</span> ${L.roleVal}</div>\n        <div><span class=\"nf-key\">${L.uptime}</span> ${L.uptimeVal}</div>\n        <div><span class=\"nf-key\">${L.shell}</span> /bin/bash</div>\n        <div><span class=\"nf-key\">${L.stack}</span> ${L.stackVal}</div>\n        <div><span class=\"nf-key\">${L.status}</span> <span class=\"amber\">${L.statusVal}</span></div>\n        <div class=\"np-row\"><span class=\"nf-key\">${L.playing}</span><span class=\"np-eq\" aria-hidden=\"true\"><span></span><span></span><span></span><span></span></span><span class=\"np-field\"><span class=\"np-track\">&hellip;</span></span></div>\n      </div>\n    </div>",
       "<div class=\"neofetch\">\n      <div class=\"nf-art\">${NEOFETCH}</div>\n      <div class=\"nf-info\">\n        <div><span class=\"nf-key accent\">guest</span>@<span class=\"accent\">${TERMINAL_HOST}</span></div>\n        <div class=\"dim\">--------------------</div>\n        <div><span class=\"nf-key\">${L.name}</span> ${L.nameVal}</div>\n        <div><span class=\"nf-key\">${L.role}</span> ${L.roleVal}</div>\n        <div><span class=\"nf-key\">${L.uptime}</span> ${L.uptimeVal}</div>\n        <div><span class=\"nf-key\">${L.shell}</span> /bin/bash</div>\n        <div><span class=\"nf-key\">${L.stack}</span> ${L.stackVal}</div>\n        <div><span class=\"nf-key\">${L.status}</span> <span class=\"amber\">${L.statusVal}</span></div>\n        <div class=\"np-row\"><span class=\"nf-key\">${L.playing}</span><span class=\"np-eq\" aria-hidden=\"true\"><span></span><span></span><span></span><span></span></span><span class=\"np-field\"><span class=\"np-track\">&hellip;</span></span></div>\n      </div>\n    </div>"],
      ["<span class=\"dim\">psst — maybe try: <span class=\"glow\">ssh recruiter@nikita.sh</span></span>",
       "<span class=\"dim\">psst — maybe try: <span class=\"glow\">ssh {sshTarget}</span></span>"],
      ["<span class=\"dim\">кстати — может, попробуете: <span class=\"glow\">ssh recruiter@nikita.sh</span></span>",
       "<span class=\"dim\">кстати — может, попробуете: <span class=\"glow\">ssh {sshTarget}</span></span>"],
      ["<span class=\"ps\" id=\"psLabel\">guest@nikita.sh <span class=\"path\">${PROMPT_PATH}</span> $</span>\n    <input id=\"cmdline\" autocomplete=\"off\" autocapitalize=\"off\" spellcheck=\"false\" aria-label=\"Terminal command input\" />",
       "<span class=\"ps\" id=\"psLabel\">guest@${TERMINAL_HOST} <span class=\"path\">${PROMPT_PATH}</span> $</span>\n    <input id=\"cmdline\" autocomplete=\"off\" autocapitalize=\"off\" spellcheck=\"false\" aria-label=\"Terminal command input\" />"],
      ["Linux nikita.sh 6.6.0-sre #1 SMP PREEMPT Sun Aug 9 20:48:27 UTC 2026 x86_64 GNU/Linux",
       "Linux ${TERMINAL_HOST} 6.6.0-sre #1 SMP PREEMPT Sun Aug 9 20:48:27 UTC 2026 x86_64 GNU/Linux"],
      ["connection to nikita.sh closed.",
       "connection to {host} closed."],
      ["guest@nikita.sh <span class=\"path\">~</span> $",
       "guest@${TERMINAL_HOST} <span class=\"path\">~</span> $"],
      ["guest@nikita.sh — bash — 80×24",
       "guest@${TERMINAL_HOST} — bash — 80×24"],
      ["guest@nikita.sh — top — 80×24",
       "guest@${TERMINAL_HOST} — top — 80×24"],
      ["launching <span class=\"glow\">cat.nikita.sh</span> in a sandboxed CRT window...",
       "launching <span class=\"glow\">{game}</span> in a sandboxed CRT window..."],
      ["nikita.sh boot sequence — kernel 6.6.0-sre",
       "${TERMINAL_HOST} boot sequence — kernel 6.6.0-sre"],
      ["recruiter@nikita.sh",
       "recruiter@${TERMINAL_HOST}"],
      ["xdg-open https://cat.nikita.sh 2&gt;/dev/null",
       "xdg-open {gameUrl} 2&gt;/dev/null"],
      ["запускаю <span class=\"glow\">cat.nikita.sh</span> в песочнице CRT-режима...",
       "запускаю <span class=\"glow\">{game}</span> в песочнице CRT-режима..."],
      ["соединение с nikita.sh закрыто.",
       "соединение с {host} закрыто."],
    ],
  },
  {
    why:
      "A ternary whose two branches were the identical string — it never translated anything — replaced by that string.",
    pairs: [
      ["<div class=\"dim\">${lang==='ru'?'Events':'Events'}:</div>",
       "<div class=\"dim\">Events:</div>"],
    ],
  },
];

const EXPECTED_REMOVALS = [
  {
    why: "t() no longer accepts function values, so its `typeof v === 'function'` test is gone. Not copy.",
    strings: ["function"],
  },
  {
    why:
      "Not copy: \"{file}\" was an example inside t()'s own doc comment, which PR 6b reworded, \"lang ${nextLang}\" is a template literal whose variable PR 7 renamed to `next`, and \"https://cat.nikita.sh/\" was the game iframe's hardcoded src, which PR 8 replaced with GAME.url from site.config.mjs — a URL, not copy, and it now lives in a file this harness doesn't scan. The rest are not strings at all — the harvester's regex tokenises a multi-line template literal that contained a nested ternary into fragments. The literal it came from still exists, with a t() call where the ternary was.",
    strings: [
      "{file}",
      "lang ${nextLang}",
      "https://cat.nikita.sh/",
      "\n      : ",
      "<div>${lang === 'ru'\n      ? ",
      "}</div>",
    ],
  },
];

const changeTo = new Map();
for (const g of EXPECTED_CHANGES) for (const [from, to] of g.pairs) changeTo.set(from, { to, why: g.why });
const removed = new Map();
for (const g of EXPECTED_REMOVALS) for (const str of g.strings) removed.set(str, g.why);

const golden = JSON.parse(read("tests/golden-strings.json"));

// Everything a string could legitimately have moved into.
const haystack = new Set();
for (const page of Object.keys(golden.pages)) {
  for (const s of harvestStrings(read(page))) haystack.add(s);
}
for (const code of localeCodes) {
  const mod = await import(new URL(`../content/locales/${code}.mjs`, import.meta.url));
  for (const s of collectLocaleStrings(mod.default)) haystack.add(s);
}

const missing = [];
for (const [page, strings] of Object.entries(golden.pages)) {
  for (const s of strings) {
    if (haystack.has(s)) continue;
    if (removed.has(s)) continue;
    const change = changeTo.get(s);
    if (change && haystack.has(change.to)) continue;
    missing.push({ page, s, change });
  }
}

const total = Object.values(golden.pages).reduce((n, a) => n + a.length, 0);

// A fork that has replaced the original copy fails this by hundreds, on
// its first `npm test`, which reads as a broken repo rather than an
// out-of-date snapshot. Past a fifth of everything, it isn't a
// regression — it's a different site.
if (missing.length > total / 5) {
  console.error(
    `${missing.length} of ${total} recorded strings are gone — that's most of the site.\n\n` +
      `This is what re-writing the content looks like, not a bug: the snapshot in\n` +
      `tests/golden-strings.json still describes the site this was forked from.\n\n` +
      `Re-record it, then review the diff — that diff is the list of copy you\n` +
      `changed, which is the thing worth looking at:\n\n` +
      `  node scripts/harvest-strings.mjs HEAD\n\n` +
      `From then on this check does its real job: catching a single line that\n` +
      `vanishes when you didn't mean it to.\n`
  );
  process.exit(1);
}

if (missing.length) {
  console.error(`${missing.length} string(s) from tests/golden-strings.json no longer exist:\n`);
  for (const { page, s, change } of missing) {
    console.error(`  [${page}] ${JSON.stringify(s)}`);
    if (change) console.error(`    expected to become ${JSON.stringify(change.to)} (${change.why}) — but that isn't there either`);
  }
  console.error(
    "\nEither the string was dropped/garbled, or the change was intentional.\n" +
      "If intentional: add it to EXPECTED_CHANGES (reworded) or\n" +
      "EXPECTED_REMOVALS (deleted, and not copy) in scripts/check-strings.mjs,\n" +
      "or re-record the snapshot with `node scripts/harvest-strings.mjs` and\n" +
      "review that diff."
  );
  process.exit(1);
}

console.log(`All ${total} strings from tests/golden-strings.json accounted for (snapshot ref: ${golden.ref}).`);
