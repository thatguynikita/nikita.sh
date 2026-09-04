/* ================================================================
   content/locales/en.mjs — every user-facing string the three
   pages show, in English.

   Adding a language: copy this file to <code>.mjs, translate the
   values, and add { code: "<code>", ... } to site.config.mjs. The
   build fails if any locale is missing a key the default locale has,
   or carries one it doesn't — so a half-finished translation is a
   build error, not an "undefined" printed into the terminal.

   Not here on purpose:
   - Anything identical in every language: the command names in
     `help`'s keys, cv.html's section commands ("cat", "about.txt"),
     the theme names. Those are structure, and duplicating them per
     locale is how they drift.
   - Strings still living in index.html's easter-egg code (the ssh
     persona, the fake claude CLI, boot lines, top/kubectl output).
     Those are being moved in a later pass; see docs/UPDATE-GUIDE.md.

   "{file}"-style placeholders are filled in by t(key, params) — the
   name inside the braces is the key of the object passed at the call
   site, so it can be reordered or repeated freely in a translation.
   ================================================================ */

export default {
  terminal: {
    availableCommands: "Available commands:",
    openingCv: 'opening <a href="cv.html" class="glow">cv.html</a> ...',
    launchingGame: 'launching <span class="glow">cat.nikita.sh</span> in a sandboxed CRT window...',
    catNotText: 'cat: cv.html: not a text file — use <span class="glow">cv</span> to open it instead',
    catUsage: "usage: cat &lt;file&gt;",
    catNoFile: "cat: {file}: No such file or directory",
    matrixOff: "matrix rain: off",
    matrixOn: "matrix rain: on",
    matrixUsage: "usage: matrix &lt;on|off&gt;",
    themeSet: 'theme set to <span class="glow">{name}</span>',
    themeUsage: "usage: theme &lt;green|amber|pascal|commodore|solarized|ubuntu&gt;",
    langUsage: "usage: lang &lt;ru|en&gt;  /  использование: lang &lt;ru|en&gt;",
    langSet: 'language switched to <span class="glow">English</span>',
    sudo: '<span class="amber">This incident will be reported.</span>',
    gameDenied: "bash: ./milk-quest.sh: Permission denied",
    loggingOut: "logging out...",
    connClosed: "connection to nikita.sh closed.",
    notFound: 'command not found: <span class="accent">{command}</span>',
    notFoundHint: "<span class=\"dim\">this is a silly terminal held together by JavaScript, not a real shell. try <span class=\"glow\">help</span> for what's here</span>",
    welcome: "Welcome to my silly terminal. Type 'help' to see what's available.",
    welcomeWhisper: "(psst — 'help' is being modest. dig a little.)",
    help: {
      about: "who is that guy nikita anyway",
      skills: "tech stack",
      contact: "ways to reach me",
      cv: "open CV page",
      neofetch: "system info card",
      whoami: "a little too much about you",
      ls: "list files",
      cat: "print a file",
      fortune: "random sysadmin wisdom",
      top: "fake process monitor",
      kubectl: "peek at a pretend cluster",
      terraform: "apply optimism, destroy everything",
      ssh: "remote login — skip the screening call (or find out what else is out there)",
      claude: "ask an AI assistant",
      theme: "change terminal color",
      matrix: "toggle background rain",
      lang: "switch output language",
      help: "show this list",
    },
    fortunes: [
      "It's always DNS.",
      "99.9% uptime means 8h46m of downtime a year — we've already used six of them today.",
      "There is no cloud. It's just someone else's Kubernetes cluster.",
      "Friday deploy energy: high risk, higher regret.",
      "The bug is never in prod. (The bug is in prod.)",
      "A watched pipeline never finishes.",
      "Works on my machine — shipping the machine.",
      "Chaos engineering: it's not a bug, it's a Tuesday.",
      "Your on-call shift called. It wants a raise.",
      "Backups are like flossing — everyone agrees they matter, right up until they don't do them.",
      "Automate the boring stuff, then automate the automation.",
      "There's no place like 127.0.0.1.",
      "A distributed system is one where a machine you've never heard of can stop you from doing your job.",
      "Monitoring without alerting is just a very expensive screensaver.",
      "The best runbook is the one nobody has to read at 3am.",
      "Postmortems: where 'human error' quietly becomes 'process gap'.",
      "Your load balancer doesn't care about your feelings.",
      "Idempotency: because running it twice shouldn't cost you twice.",
      "Every 'temporary' fix becomes permanent the moment it works.",
      "Kubernetes: making simple things complicated since 2014.",
      "The graph looked fine until someone zoomed in.",
      "Infrastructure as Code: now your typos have version history.",
      "Nothing is really deleted — it's just eventually consistent.",
      "The rollback button is the most underrated feature in your whole pipeline.",
      "SLOs: the art of promising slightly less than 100%.",
      "A good on-call rotation is invisible. A bad one is a group chat at 2am.",
      "The incident is never really over — it just becomes a Jira ticket nobody assigns.",
      "You don't need more dashboards. You need to read the ones you have.",
    ],
  },
  cv: {
    name: "Nikita Chernozipunnikov",
    photoAlt: "Nikita Chernozipunnikov, DevOps / SRE engineer — portrait photo",
    tagline: '<span class="accent">DevOps / SRE</span> <span class="dim">&mdash; Systems Engineer &middot; 11y experience</span>',
    metaLine: "Saint Petersburg, Russia &middot; Citizenship: Russia &middot; hybrid, full day &middot; not available for relocation or business trips",
    techPrefix: "// tech:",
    signOff: "$ <span class=\"accent\">echo</span> <span class=\"amber\">\"thanks for reading this far. let's build something reliable together.\"</span>",
    print: "print",
    footerBack: "back to terminal",
    langChip: "RU",
    langSwitchLabel: "Switch to Russian",
    langAnnounce: "Language switched to English",
  },
  notFound: {
    notFound: "No such file or directory",
    message1: "Oops! Looks like the cat ate all the condensed milk... and this page too.",
    catAlt: "An orange cat lies on its back, tired, surrounded by spilled condensed-milk cans.",
    footerBack: "back to terminal",
    langChip: "RU",
    langSwitchLabel: "Switch to Russian",
    langAnnounce: "Language switched to English",
  },
};
