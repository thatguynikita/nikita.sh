/* ================================================================
   content/locales/ru.mjs — every user-facing string the three
   pages show, in Russian.

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
    availableCommands: "Доступные команды:",
    openingCv: 'открываю <a href="cv.html" class="glow">cv.html</a> ...',
    launchingGame: 'запускаю <span class="glow">cat.nikita.sh</span> в песочнице CRT-режима...',
    catNotText: 'cat: cv.html: не текстовый файл — используйте <span class="glow">cv</span>, чтобы открыть его',
    catUsage: "использование: cat &lt;файл&gt;",
    catNoFile: "cat: {file}: Нет такого файла или каталога",
    matrixOff: "дождь из матрицы: выкл",
    matrixOn: "дождь из матрицы: вкл",
    matrixUsage: "использование: matrix &lt;on|off&gt;",
    themeSet: 'тема изменена на <span class="glow">{name}</span>',
    themeUsage: "использование: theme &lt;green|amber|pascal|commodore|solarized|ubuntu&gt;",
    langUsage: "usage: lang &lt;ru|en&gt;  /  использование: lang &lt;ru|en&gt;",
    langSet: 'язык переключён на <span class="glow">русский</span>',
    sudo: {
      reported: '<span class="amber">Об этом инциденте будет доложено.</span>',
      justKidding: '<span class="amber">...шутка. но неплохая попытка.</span>',
      nothingHarmed: '<span class="dim">(ничего не пострадало — это статичный сайт, ты в браузере, а не на реальном сервере)</span>',
    },
    gameDenied: "bash: ./milk-quest.sh: отказано в доступе",
    loggingOut: "выхожу из системы...",
    connClosed: "соединение с nikita.sh закрыто.",
    notFound: 'команда не найдена: <span class="accent">{command}</span>',
    notFoundHint: '<span class="dim">это игрушечный терминал на JavaScript, а не настоящий шелл. попробуй <span class="glow">help</span>, чтобы увидеть, что здесь есть</span>',
    welcome: "Добро пожаловать в мой игрушечный терминал. Введите «help», чтобы увидеть список команд.",
    welcomeWhisper: "(псс — «help» скромничает. покопайся немного.)",
    help: {
      about: "кто такой вообще этот никита",
      skills: "технологический стек",
      contact: "как со мной связаться",
      cv: "открыть страницу резюме",
      neofetch: "карточка с информацией о системе",
      whoami: "узнать о себе немного больше",
      ls: "список файлов",
      cat: "вывести файл",
      fortune: "случайная мудрость сисадмина",
      top: "фейковый монитор процессов",
      kubectl: "заглянуть в игрушечный кластер",
      terraform: "apply обещает, destroy исполняет",
      ssh: "удалённая сессия — провести экспресс-скрининг (или узнать, что ещё тут есть)",
      claude: "спросить у ИИ ассистента",
      theme: "сменить цвет терминала",
      matrix: "вкл/выкл фоновый дождь из символов",
      lang: "сменить язык вывода",
      help: "показать этот список",
    },
    fortunes: [
      "Это всегда DNS.",
      "99.9% аптайма — это 8ч46м простоя в год, и шесть из них мы уже потратили сегодня.",
      "Никакого облака нет. Это просто чей-то кластер Kubernetes.",
      "Энергия пятничного деплоя: высокий риск, ещё более высокое сожаление.",
      "Баг никогда не в проде. (Баг в проде.)",
      "Если следить за пайплайном, он никогда не закончится.",
      "У меня на ноутбуке всё работает — отгружаем ноутбук.",
      "Chaos engineering: это не баг, это вторник.",
      "Ваша дежурная смена звонила. Она хочет прибавку.",
      "Бэкапы как чистка зубной нитью — все согласны, что это важно, пока не перестают это делать.",
      "Автоматизируй рутину, а потом автоматизируй саму автоматизацию.",
      "Нет места лучше, чем 127.0.0.1.",
      "Распределённая система — это когда неизвестная вам машина мешает вам делать вашу работу.",
      "Мониторинг без алертинга — это просто очень дорогая заставка.",
      "Лучший runbook — тот, который никому не приходится читать в три часа ночи.",
      "Постмортемы: там, где «человеческий фактор» незаметно превращается в «пробел в процессе».",
      "Балансировщику нагрузки плевать на ваши чувства.",
      "Идемпотентность нужна, чтобы повторный запуск не обошелся в два раза дороже.",
      "Любой «временный» костыль становится постоянным в тот момент как он заработал.",
      "Kubernetes: усложняем простые вещи с 2014 года.",
      "График выглядел нормально, пока кто-то не приблизил масштаб.",
      "Infrastructure as Code — теперь у ваших опечаток есть история версий.",
      "На самом деле ничего не удаляется — оно просто eventually consistent.",
      "Кнопка rollback — самая недооценённая функция во всём пайплайне.",
      "SLO — искусство обещать чуть меньше, чем 100%.",
      "Хорошее дежурство незаметно. Плохое — это групповой чат в два часа ночи.",
      "Инцидент никогда по-настоящему не заканчивается — он просто становится тикетом в Jira который никому не назначают.",
      "Вам не нужно больше дашбордов. Вам нужно читать те, что уже есть.",
    ],
    whoami: {
      labels: {
        user: "Пользователь",
        browser: "Браузер",
        os: "ОС",
        tz: "Часовой пояс",
      },
      timeQuip: {
        lateNight: [
          "всё ещё не спишь? уважаю, но немного тревожно",
          "где-то сейчас 3 ночи и, кажется, как раз здесь",
          "машины не спят и ты похоже тоже",
        ],
        earlyMorning: [
          "рано встал или вообще не ложился, поди разбери",
          "ранняя пташка на максималках",
        ],
        morning: [
          "вполне разумное время, очень ответственно с твоей стороны",
          "продуктивная утренняя энергия, уважаю",
        ],
        midday: [
          "обеденный перерыв за терминалом, классика",
          "идеальное окно для прокрастинации",
        ],
        afternoon: [
          "тот самый послеобеденный спад, браузинг как способ пережить его",
          "послеобеденная энергия ещё держится",
        ],
        evening: [
          "вечерний браузинг, самое время",
          "прайм-тайм для скроллинга, ничего постыдного",
        ],
        night: [
          "по идее, уже пора спать",
          "ну ещё одна вкладка перед сном, конечно",
        ],
      },
    },
    nowPlaying: {
      offline: "spotify недоступен",
      idle: "сейчас ничего не играет",
    },
    neofetch: {
      labels: {
        name: "Имя",
        role: "Должность",
        uptime: "Стаж",
        shell: "Оболочка",
        stack: "Стек",
        status: "Статус",
        playing: "Играет",
        nameVal: "Никита Чернозипунников",
        roleVal: "DevOps / SRE",
        uptimeVal: "11+ лет в проде",
        stackVal: "AWS · OpenStack · Kubernetes · Linux",
        statusVal: "в творческом отпуске (алерты замьючены)",
      },
    },
    top: {
      headers: [
        "PID",
        "КОМАНДА",
        "CPU%",
        "MEM%",
        "СТАТУС",
      ],
      running: "работает",
      sleeping: "ожидание",
      zombie: "зомби",
      quitChip: "q — выход",
      quitHint: "(top — q для выхода)",
      quitHintDim: '<span class="dim">нажмите <span class="accent">q</span> или введите <span class="accent">exit</span>, чтобы выйти</span>',
      exited: "вышли из top.",
      quitPrompt: 'нажмите <span class="accent">q</span> или введите <span class="accent">exit</span>, чтобы выйти',
    },
    kubectl: {
      headers: [
        "ИМЯ",
        "ГОТОВНОСТЬ",
        "СТАТУС",
        "ВОЗРАСТ",
      ],
      running: "Работает",
      describeUsage: "использование: kubectl describe pod &lt;имя&gt;",
      podNotFound: 'Error from server (NotFound): pods "{pod}" не найден',
      help: "kubectl управляет менеджером кластера Kubernetes.",
      subcommands: 'доступные подкоманды: <span class="glow">get pods</span>, <span class="glow">describe pod &lt;имя&gt;</span>',
      unknownCommand: 'error: неизвестная команда "{command}" для "kubectl"',
      reasonLabel: "Причина",
      barelyReady: "еле-еле",
      pods: {
        "condensed-milk-store-0": {
          reason: "OOMKilled (переел сгущёнки)",
          events: [
            "Killing — контейнер превысил лимит по сахару",
            "BackOff — перезапуск отложен, контейнер приходит в себя",
            'Pulling — image "cat:hungry-latest"',
          ],
        },
        "sre-sanity-canary": {
          status: "Работает",
          reason: "держится на кофе и упрямстве",
          events: [
            "Started — контейнер запущен",
            "Warning — уровень тревожности приближается к критическому",
          ],
        },
        "deploy-friday-afternoon": {
          reason: "node pressure: пятница, 17:58",
          events: [
            "Evicted — узел решил, что с него хватит на сегодня",
          ],
        },
        "cat-deployment-7f9d8c-x2m4q": {
          status: "Работает",
          reason: "заряжен на результат, сгущёнки: 0/30",
          events: [
            "Started — контейнер запущен 11 лет назад",
            "Normal — работает стабильнее, чем большинство прод-сервисов",
          ],
        },
      },
    },
    a11y: {
      inputLabel: "Поле ввода команд терминала",
      outputLabel: "Вывод терминала",
    },
    ssh: {
      handshake: [
        "запрашиваю рукопожатие с {host} ...",
        "ECDSA key fingerprint is SHA256:7hR3s+kn0wYouR3Wo7rth.",
        "Are you sure you want to continue connecting (yes/no)? yes",
        "Warning: Permanently added '{host}' (ECDSA) to the list of known hosts.",
        "аутентификация...",
        "доступ разрешён.",
      ],
      askPrompt: 'Введите команду, чтобы задать вопрос, или "exit", чтобы отключиться:',
      topicsLabel: "темы:",
      connected: 'подключено к <span class="glow">{host}</span>.',
      closing: "разрываю соединение с {host}...",
      askAnother: '<span class="dim">задайте другой вопрос, или введите "exit"</span>',
      unrecognized: 'неизвестная команда — доступны: {commands} или "exit"',
      usage: "использование: ssh &lt;user@host&gt;",
      knownHosts: '<span class="dim"># известные хосты на этой машине:</span> {hosts}',
      personas: {
        recruiter: {
          why: {
            q: "Почему нам стоит вас нанять?",
            a: "Одиннадцать лет держу прод в рабочем состоянии, чтобы другие могли спать. Спокоен в инцидентах, дружу с автоматизацией и беру на себя ответственность.",
          },
          favorite: {
            q: "Что вам больше всего нравится в DevOps?",
            a: "Момент, когда шаткая ручная процедура превращается в скучный, надёжный пайплайн — и про неё можно забыть.",
          },
          incident: {
            q: "Расскажите про инцидент, который вы разруливали.",
            a: "Опустим подробности — кластер лёг в пятницу вечером, а к понедельнику про это уже никто не помнил, кроме постмортема.",
          },
          goals: {
            q: "Что вы ищете в следующей роли?",
            a: "Команду, где SRE-практики не факультатив, и где можно расти в сторону AI-driven разработки.",
          },
          salary: {
            q: "Ожидания по зарплате?",
            a: "Обсуждаемо — предлагаю продолжить это через contact, а не в терминальном пасхальном яйце :)",
          },
        },
      },
      failure: {
        first: {
          connecting: "ssh: подключение к {host} ...",
          retry1: "ssh: повторная попытка (1/3)...",
          retry2: "ssh: повторная попытка (2/3)...",
          noSuchHost: '<span class="dim">этого хоста, кажется, не существует. как и этой сессии.</span>',
        },
        persistent: {
          connecting: "ssh: подключение к {host} ...",
          attemptNote: '<span class="amber">[note]</span> это попытка №{count} подключиться к хосту, которого не существует',
          persistence: '<span class="amber">[note]</span> впечатляющее упорство, если честно',
          neverExisted: "ssh: этого хоста никогда не было. я проверил. дважды.",
          hint: '<span class="dim">кстати — может, попробуете: <span class="glow">ssh recruiter@nikita.sh</span></span>',
        },
      },
    },
    game: {
      script: [
        "#!/bin/bash",
        "# milk-quest.sh — ой, да не читай, просто запусти",
        '# см. также: <a href="https://cat.nikita.sh" target="_blank" rel="noopener">cat.nikita.sh</a>',
        "# заметка: понадобится sudo",
        'echo "открываю маленький сюрприз..."',
        "xdg-open https://cat.nikita.sh 2&gt;/dev/null",
      ],
    },
    claude: {
      usage: 'использование: claude "&lt;промпт&gt;" &nbsp;|&nbsp; claude log --oneline &nbsp;|&nbsp; claude --confess',
      log: {
        hidCommands: "feat: спрятал пару лишних команд, никому не сказал",
        cursorPixel: "fix: курсор появлялся на пиксель правее на пустой строке",
        sudoGate: "feat: спрятать игру за sudo, ведь системы пермиссий это так весело",
        androidKeyboard: "fix: клавиатура на android перепутала первую введённую букву (опять)",
        fakeSsh: "feat: фейковые ошибки ssh, с проламыванием четвёртой стены",
        revert: "revert: пользователь попросил менее вежливо в этот раз :(",
      },
      logNote: '<span class="dim">с этим сайтом у меня история коммитов длиннее, чем с большинством моих реальных отношений</span>',
      confess: "да — этот терминал был собран с помощью ИИ (привет, это я).",
      lightTheme: {
        checking: "Проверю текущую систему тем.",
        foundNone: "Нашёл — у этого сайта нет светлой темы. Никогда не было. И не будет.",
        mightUpsetCat: "Могу добавить, но хочу отметить — коту это может не понравиться.",
        wontFix: "Помечаю как won't-fix. Что-нибудь ещё?",
        persistent: "Ладно, ты настойчив. На этот раз действительно сделаю это.",
        guessIWriteOne: "Светлой темы тут нет. Видимо, придётся написать самому.",
        sketching: "Набрасываю светлую палитру... что-то в духе Ayu Light.",
        wiringUp: "Подключаю её и называю так, чтобы никто не угадал.",
        shipped: "Готово. Кота уведомили — он подаёт жалобу.",
        flipSwitch: "Написать — моя работа, переключать — уже твоя: theme {theme}.",
        unmarking: "Снимаю пометку won't-fix. Что-нибудь ещё?",
        beenOverThis: "Мы это уже обсуждали.",
        ticketDone: "Тикет помечен как выполненный. Строить больше нечего — просто набери theme {theme}.",
      },
      fixBug: {
        noBug: "Багов нет. Багов никогда не было. Я проверил. Дважды.",
      },
      addTests: {
        foundZero: "Найдено 0 тестов. Это весьма тревожно конечно, либо смелое дизайн-решение.",
        boldDecision: "Остановлюсь на «смелом дизайн-решении» и пойду дальше.",
      },
      generic: {
        gotIt: "Понял. Уже работаю над этим.",
        mightTakeLonger: "На самом деле это может занять больше времени чем ожидалось. Добавляю в список.",
        theListIsLong: "(список длинный. список всегда длинный.)",
      },
    },
    terraform: {
      willPerform: '<span class="dim">Terraform выполнит следующие действия:</span>',
      destroyWeekend: '<span class="amber">Это уничтожит твои выходные. Только "yes" будет принято для подтверждения.</span>',
      applyCancelled: '<span class="dim">Enter a value: (тайм-аут) — apply отменён.</span>',
      acquiringLock: '<span class="dim">Acquiring state lock (это может занять некоторое время)...</span>',
      willDestroy: '<span class="dim">Terraform уничтожит:</span>',
      confirmDestroy: 'Вы действительно хотите уничтожить все ресурсы? Только "yes" будет принято для подтверждения.',
      enterValue: '<span class="dim">Enter a value: <span class="glow">yes</span> (терминал ответил за вас)</span>',
      ripWeekend: '<span class="dim">(покойтесь с миром, выходные.)</span>',
      usage: "использование: terraform &lt;subcommand&gt;",
      subcommands: 'доступные подкоманды: <span class="glow">apply</span>, <span class="glow">destroy</span>',
      unknownSubcommand: 'terraform: неизвестная подкоманда "{command}"',
    },
  },
  cv: {
    name: "Никита Чернозипунников",
    photoAlt: "Никита Чернозипунников, инженер DevOps / SRE — портретное фото",
    tagline: '<span class="accent">DevOps / SRE</span> <span class="dim">&mdash; Системный инженер &middot; 11 лет опыта</span>',
    metaLine: "Санкт-Петербург, Россия &middot; Гражданство: Россия &middot; гибридный график, полный день &middot; не готов к переезду или командировкам",
    techPrefix: "// стек:",
    signOff: '$ <span class="accent">echo</span> <span class="amber">"спасибо, что дочитали до конца. давайте построим что-то надёжное вместе."</span>',
    print: "печать",
    footerBack: "назад в терминал",
    langChip: "EN",
    langSwitchLabel: "Переключить на английский",
    langAnnounce: "Язык переключён на русский",
  },
  notFound: {
    notFound: "Нет такого файла или каталога",
    message1: "Ой! Похоже, котик съел всю сгущёнку... и эту страницу тоже.",
    catAlt: "Рыжий котик лежит на спине, уставший, вокруг рассыпаны банки сгущёнки.",
    footerBack: "назад в терминал",
    langChip: "EN",
    langSwitchLabel: "Переключить на английский",
    langAnnounce: "Язык переключён на русский",
  },
};
