/* ================================================================
   theme.js — shared theme/lang/matrix persistence for nikita.sh
   Used by index.html, cv.html, and 404.html so a preference set on
   one page is respected on the others. Exposes window.NikitaTheme.
   ================================================================ */
(function(){
  "use strict";

  const THEME_MAP = {
    green:{fg:"#3dff8a",dim:"#2a9c60",accent:"#5ff1ff",warn:"#ffb454",gameHue:"75deg"},
    amber:{fg:"#ffb454",dim:"#a06a1f",accent:"#ffe08a",warn:"#5ff1ff",gameHue:"-6deg"},
    cyan :{fg:"#5ff1ff",dim:"#2a8a9c",accent:"#3dff8a",warn:"#ffb454",gameHue:"137deg"},
    // Secret theme (easter egg — not listed anywhere). Full palette lives in
    // theme.css's :root[data-theme="sabbatical"] block.
    sabbatical:{fg:"#5c6166",matrixColor:"#8a9199",matrixFade:"rgba(248,249,250,.12)",metaThemeColor:"#f8f9fa"},
  };

  // Matches theme.css's :root --bg for every theme except sabbatical (the
  // only one that overrides --bg, via its own [data-theme] block) — kept
  // here since mobile browser chrome tinting can't read CSS custom
  // properties any more than the matrix-rain canvas can (see applyTheme's
  // return value, used for the same reason).
  const DEFAULT_META_THEME_COLOR = "#060a08";

  // Themes whose palette lives in theme.css's [data-theme] block instead
  // of being computed here from fg/dim/accent/warn.
  const DATA_THEME_NAMES = new Set(['sabbatical']);

  const THEME_STORAGE_KEY = 'nikita.sh:theme';
  const LANG_STORAGE_KEY = 'nikita.sh:lang';
  const MATRIX_STORAGE_KEY = 'nikita.sh:matrix';

  function readStored(key){
    try { return localStorage.getItem(key); } catch(e){ return null; }
  }
  function writeStored(key, value){
    try { localStorage.setItem(key, value); } catch(e){}
  }

  function applyTheme(name){
    const t = THEME_MAP[name];
    if(!t) return null;
    const root = document.documentElement.style;

    if(DATA_THEME_NAMES.has(name)){
      // Palette comes from theme.css's :root[data-theme="..."] block.
      document.documentElement.dataset.theme = name;
      ['--fg','--fg-dim','--accent','--amber','--amber-glow','--border',
       '--glow','--ambient','--ambient-inset','--game-hue']
        .forEach((p) => root.removeProperty(p));
    } else {
      document.documentElement.dataset.theme = '';
      root.setProperty('--fg', t.fg);
      root.setProperty('--fg-dim', t.dim);
      root.setProperty('--accent', t.accent);
      root.setProperty('--amber', t.warn);
      root.setProperty('--amber-glow', `0 0 6px ${t.warn}99`);
      root.setProperty('--border', `${t.fg}47`);
      root.setProperty('--glow', `0 0 4px ${t.fg}, 0 0 12px ${t.fg}88, 0 0 24px ${t.fg}44`);
      root.setProperty('--ambient', `${t.fg}0f`);
      root.setProperty('--ambient-inset', `${t.fg}08`);
      if(t.gameHue) root.setProperty('--game-hue', t.gameHue);
      else root.removeProperty('--game-hue');
    }

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if(themeColorMeta) themeColorMeta.setAttribute('content', t.metaThemeColor || DEFAULT_META_THEME_COLOR);

    return t.fg;
  }

  // Reads all three persisted preferences and resolves them to concrete
  // values/side-effects (applies the theme, sets document.lang) without
  // touching any page-local state — callers apply the returned bits
  // (lang, matrixColor, matrixEnabled) to their own variables/controllers.
  function restoreSettings(){
    const storedLang = readStored(LANG_STORAGE_KEY);
    const lang = (storedLang === 'ru' || storedLang === 'en') ? storedLang : 'en';
    document.documentElement.lang = lang;

    const storedTheme = readStored(THEME_STORAGE_KEY);
    const t = storedTheme ? THEME_MAP[storedTheme] : null;
    const fg = storedTheme ? applyTheme(storedTheme) : null;
    const matrixColor = t && t.matrixColor ? t.matrixColor : fg;
    const matrixFade = t && t.matrixFade ? t.matrixFade : null;

    const matrixEnabled = readStored(MATRIX_STORAGE_KEY) !== 'off';

    return { lang, matrixColor, matrixFade, matrixEnabled };
  }

  // Creates a self-contained matrix-rain animation bound to a <canvas>,
  // handling its own resize/draw loop.
  function createMatrixRain(canvasEl){
    const ctx = canvasEl.getContext('2d');
    const glyphs = "01アイウエオカキクケコサシスセソ$#&+=-<>/\\{}[]";
    let cols, drops;
    let color = "#3dff8a";
    let fadeColor = "rgba(2,4,3,0.08)";
    let enabled = true;

    function resize(){
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
      const fontSize = 15;
      cols = Math.floor(canvasEl.width / fontSize);
      drops = new Array(cols).fill(0).map(()=>Math.random()*-50);
    }
    function draw(){
      if(enabled && !document.hidden){
        ctx.fillStyle = fadeColor;
        ctx.fillRect(0,0,canvasEl.width,canvasEl.height);
        ctx.fillStyle = color;
        ctx.font = "15px monospace";
        for(let i=0;i<cols;i++){
          const text = glyphs[Math.floor(Math.random()*glyphs.length)];
          ctx.fillText(text, i*15, drops[i]*15);
          if(drops[i]*15 > canvasEl.height && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        }
      }
      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();

    return {
      setColor(c){ color = c; },
      setFadeColor(c){ fadeColor = c; },
      setEnabled(v){
        enabled = v;
        canvasEl.classList.toggle('off', !v);
      },
    };
  }

  window.NikitaTheme = {
    THEME_MAP,
    THEME_STORAGE_KEY,
    LANG_STORAGE_KEY,
    MATRIX_STORAGE_KEY,
    readStored,
    writeStored,
    applyTheme,
    restoreSettings,
    createMatrixRain,
  };
})();
