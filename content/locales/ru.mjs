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
    sudo: '<span class="amber">Об этом инциденте будет доложено.</span>',
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
