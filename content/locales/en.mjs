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
    sudo: {
      reported: '<span class="amber">This incident will be reported.</span>',
      justKidding: '<span class="amber">...just kidding. nice try though.</span>',
      nothingHarmed: "<span class=\"dim\">(nothing was harmed — this is a static site, you're in a browser, not a real server)</span>",
    },
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
    whoami: {
      labels: {
        user: "User",
        browser: "Browser",
        os: "OS",
        tz: "Timezone",
      },
      timeQuip: {
        lateNight: [
          "still awake? respect, but also concerning",
          "it's 3am somewhere, and unfortunately it might be here",
          "the machines don't sleep and apparently neither do you",
        ],
        earlyMorning: [
          "up early, or never went to bed — hard to say which",
          "the extremely online early bird",
        ],
        morning: [
          "reasonable hours, very responsible of you",
          "productive morning energy, I respect it",
        ],
        midday: [
          "lunch break browsing, a classic",
          "prime procrastination window",
        ],
        afternoon: [
          "the 3pm slump, browsing as a coping mechanism",
          "afternoon energy, holding strong",
        ],
        evening: [
          "evening browsing, the good stuff",
          "prime scrolling hours, no shame in it",
        ],
        night: [
          "should probably be asleep by now",
          "one more tab before bed, sure",
        ],
      },
    },
    nowPlaying: {
      offline: "spotify offline",
      idle: "nothing playing right now",
    },
    neofetch: {
      labels: {
        name: "Name",
        role: "Role",
        uptime: "Uptime",
        shell: "Shell",
        stack: "Stack",
        status: "Status",
        playing: "Playing",
        nameVal: "Nikita Chernozipunnikov",
        roleVal: "DevOps / SRE",
        uptimeVal: "11+ years in production",
        stackVal: "AWS · OpenStack · Kubernetes · Linux",
        statusVal: "on sabbatical (pager silenced)",
      },
    },
    top: {
      headers: [
        "PID",
        "CMD",
        "CPU%",
        "MEM%",
        "STATUS",
      ],
      running: "running",
      sleeping: "sleeping",
      zombie: "zombie",
      quitChip: "q — quit",
      quitHint: "(top — q to quit)",
      quitHintDim: '<span class="dim">press <span class="accent">q</span> or type <span class="accent">exit</span> to quit</span>',
      exited: "exited top.",
      quitPrompt: 'press <span class="accent">q</span> or type <span class="accent">exit</span> to quit',
    },
    kubectl: {
      headers: [
        "NAME",
        "READY",
        "STATUS",
        "AGE",
      ],
      running: "Running",
      describeUsage: "usage: kubectl describe pod <name>",
      podNotFound: 'Error from server (NotFound): pods "{pod}" not found',
      help: "kubectl controls the Kubernetes cluster manager.",
      subcommands: 'available subcommands: <span class="glow">get pods</span>, <span class="glow">describe pod &lt;name&gt;</span>',
      unknownCommand: 'error: unknown command "{command}" for "kubectl"',
      reasonLabel: "Reason",
      barelyReady: "just barely",
      pods: {
        "condensed-milk-store-0": {
          reason: "OOMKilled (ate too much condensed milk)",
          events: [
            "Killing — container exceeded sugar limit",
            "BackOff — restart delayed, container is recovering",
            'Pulling — image "cat:hungry-latest"',
          ],
        },
        "sre-sanity-canary": {
          status: "Running",
          reason: "held together by coffee and stubbornness",
          events: [
            "Started — container started",
            "Warning — anxiety level approaching critical",
          ],
        },
        "deploy-friday-afternoon": {
          reason: "node pressure: it's Friday, 5:58pm",
          events: [
            "Evicted — the node decided it was done for the day",
          ],
        },
        "cat-deployment-7f9d8c-x2m4q": {
          status: "Running",
          reason: "fully motivated, condensed milk cans: 0/30",
          events: [
            "Started — container started 11 years ago",
            "Normal — more stable than most production services",
          ],
        },
      },
    },
    a11y: {
      inputLabel: "Terminal command input",
      outputLabel: "Terminal output",
    },
    ssh: {
      handshake: [
        "requesting handshake with {host} ...",
        "ECDSA key fingerprint is SHA256:7hR3s+kn0wYouR3Wo7rth.",
        "Are you sure you want to continue connecting (yes/no)? yes",
        "Warning: Permanently added '{host}' (ECDSA) to the list of known hosts.",
        "authenticating...",
        "access granted.",
      ],
      askPrompt: 'Type a command to ask a question, or "exit" to disconnect:',
      topicsLabel: "topics:",
      connected: 'connected to <span class="glow">{host}</span>.',
      closing: "closing connection to {host}...",
      askAnother: '<span class="dim">ask another question, or type "exit"</span>',
      unrecognized: 'unrecognized command — available: {commands} or "exit"',
      usage: "usage: ssh &lt;user@host&gt;",
      knownHosts: '<span class="dim"># known hosts on this machine:</span> {hosts}',
      personas: {
        recruiter: {
          why: {
            q: "Why should we hire you?",
            a: "Eleven years of keeping production upright so everyone else could sleep. Calm in incidents, comfortable with automation, and I take ownership.",
          },
          favorite: {
            q: "What's your favorite part of DevOps?",
            a: "The moment a shaky manual process turns into a boring, reliable pipeline — and everyone can forget it exists.",
          },
          incident: {
            q: "Tell me about an incident you handled.",
            a: "Skipping the gory details — a cluster went down on a Friday night, and by Monday nobody remembered it except the postmortem doc.",
          },
          goals: {
            q: "What are you looking for next?",
            a: "A team where SRE practices aren't optional, with room to grow toward AI-driven development.",
          },
          salary: {
            q: "Salary expectations?",
            a: "Negotiable — let's actually talk about that via contact instead of a terminal easter egg :)",
          },
        },
      },
      failure: {
        first: {
          connecting: "ssh: connecting to {host} ...",
          retry1: "ssh: retrying (1/3)...",
          retry2: "ssh: retrying (2/3)...",
          noSuchHost: '<span class="dim">this host does not appear to exist. neither does this session.</span>',
        },
        persistent: {
          connecting: "ssh: connecting to {host} ...",
          attemptNote: '<span class="amber">[note]</span> this is attempt #{count} at a host that does not exist',
          persistence: '<span class="amber">[note]</span> impressive persistence, honestly',
          neverExisted: "ssh: this host has never existed. I checked. Twice.",
          hint: '<span class="dim">psst — maybe try: <span class="glow">ssh recruiter@nikita.sh</span></span>',
        },
      },
    },
    game: {
      script: [
        "#!/bin/bash",
        "# milk-quest.sh — don't read it, just run it",
        '# see also: <a href="https://cat.nikita.sh" target="_blank" rel="noopener">cat.nikita.sh</a>',
        "# note: you'll need sudo",
        'echo "opening a little surprise..."',
        "xdg-open https://cat.nikita.sh 2&gt;/dev/null",
      ],
    },
    claude: {
      usage: 'usage: claude "&lt;prompt&gt;" &nbsp;|&nbsp; claude log --oneline &nbsp;|&nbsp; claude --confess',
      log: {
        hidCommands: "feat: hid a few extra commands, didn't tell anyone",
        cursorPixel: "fix: cursor was one pixel to the right on empty line",
        sudoGate: "feat: sudo-gate the game, because permission systems are so funny",
        androidKeyboard: "fix: android keyboard scrambled the first typed letter (again)",
        fakeSsh: "feat: fake ssh failures, with a fourth-wall break",
        revert: "revert: user asked less nicely this time :(",
      },
      logNote: '<span class="dim">this website has a longer commit history with me than most of my actual relationships</span>',
      confess: "yes — this terminal was built by asking an AI (hi, that's me).",
      lightTheme: {
        checking: "I'll take a look at the current theming setup.",
        foundNone: "Found it — this site doesn't have a light theme. It never has. It never will.",
        mightUpsetCat: "I could add one, but I'd like to flag it may upset the cat.",
        wontFix: "Marking as won't-fix. Anything else?",
        persistent: "Alright, you're persistent. Let me actually build it this time.",
        guessIWriteOne: "No light theme in here. Guess I'll have to write one.",
        sketching: "Sketching out a light palette... something in the spirit of Ayu Light.",
        wiringUp: "Wiring it up and naming it something nobody will guess.",
        shipped: "Shipped it. The cat has been informed and is filing a complaint.",
        flipSwitch: "Building it was my job — flipping the switch is yours: theme {theme}.",
        unmarking: "Un-marking as won't-fix. Anything else?",
        beenOverThis: "We've been over this.",
        ticketDone: "Ticket's marked done. Nothing left to build — just type theme {theme}.",
      },
      fixBug: {
        noBug: "There is no bug. There has never been a bug. I checked. Twice.",
      },
      addTests: {
        foundZero: "Found 0 tests. This is either very concerning or a bold design decision.",
        boldDecision: "I'm going to go with \"bold design decision\" and move on.",
      },
      generic: {
        gotIt: "Got it. Working on that now.",
        mightTakeLonger: "Actually, this might take longer than expected. Adding it to the list.",
        theListIsLong: "(the list is long. the list is always long.)",
      },
    },
    terraform: {
      willPerform: '<span class="dim">Terraform will perform the following actions:</span>',
      destroyWeekend: "<span class=\"amber\">This will destroy your weekend. Only 'yes' will be accepted to approve.</span>",
      applyCancelled: '<span class="dim">Enter a value: (timed out) — apply cancelled.</span>',
      acquiringLock: '<span class="dim">Acquiring state lock (this may take a few moments)...</span>',
      willDestroy: '<span class="dim">Terraform will destroy:</span>',
      confirmDestroy: "Do you really want to destroy all resources? Only 'yes' will be accepted to approve.",
      enterValue: '<span class="dim">Enter a value: <span class="glow">yes</span> (the terminal answered for you)</span>',
      ripWeekend: '<span class="dim">(RIP weekend.)</span>',
      usage: "usage: terraform <subcommand>",
      subcommands: 'available subcommands: <span class="glow">apply</span>, <span class="glow">destroy</span>',
      unknownSubcommand: 'terraform: unknown subcommand "{command}"',
    },
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
