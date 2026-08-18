/* ================================================================
   theme.js — shared theme/lang/matrix persistence for nikita.sh
   Used by index.html, cv.html, and 404.html so a preference set on
   one page is respected on the others. Exposes window.NikitaTheme.
   ================================================================ */
(function(){
  "use strict";

  // gameHue: hue-rotate() angle fed to the cat.nikita.sh game overlay's
  // CRT-tint filter (see index.html's .game-view iframe) so that tint
  // lands on each theme's own color instead of always being green.
  // Solved from the CSS Filter Effects matrices (grayscale(.55) ->
  // sepia(.5) -> hue-rotate -> saturate(1.8)) for the angle whose output
  // hue best matches each theme's --fg.
  const THEME_MAP = {
    green:{fg:"#3dff8a",dim:"#2a9c60",accent:"#5ff1ff",warn:"#ffb454",gameHue:"75deg"},
    amber:{fg:"#ffb454",dim:"#a06a1f",accent:"#ffe08a",warn:"#5ff1ff",gameHue:"-6deg"},
    cyan :{fg:"#5ff1ff",dim:"#2a8a9c",accent:"#3dff8a",warn:"#ffb454",gameHue:"137deg"},
    // Secret theme (easter egg — not listed in help/usage/tab-completion
    // anywhere). Its full palette lives in theme.css's
    // :root[data-theme="sabbatical"] block, not here — this entry only
    // carries what canvas-only code needs, since <canvas> can't read CSS
    // custom properties. No gameHue on purpose: the cat.nikita.sh game
    // overlay's CRT tint falls back to the CSS default (75deg/green)
    // rather than trying to match a light theme, which wouldn't make
    // sense for a filter meant to look like a dark CRT screen.
    sabbatical:{fg:"#5c6166",matrixColor:"#86b300",matrixFade:"rgba(248,249,250,.12)"},
  };

  // Themes whose full palette lives in theme.css's [data-theme] block
  // rather than being computed here from a fg/dim/accent/warn set.
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

  // Applies a theme by name to :root custom properties. Returns the
  // theme's fg color (handy for callers that also need to recolor a
  // <canvas> matrix rain, since canvas can't read CSS vars directly).
  function applyTheme(name){
    const t = THEME_MAP[name];
    if(!t) return null;
    const root = document.documentElement.style;

    if(DATA_THEME_NAMES.has(name)){
      // Palette comes from theme.css's :root[data-theme="..."] block.
      // Clear any inline overrides a previous JS-driven theme left
      // behind — inline style always wins over a stylesheet rule
      // regardless of selector specificity, so without this, switching
      // e.g. green -> sabbatical live (no reload) would keep showing
      // green's --fg/--border/etc. instead of picking up the CSS block.
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
  // handling its own resize/draw loop. Shared since the drawing logic is
  // otherwise byte-identical between pages — encapsulating it here means
  // the pages can't silently drift apart the way index.html and cv.html
  // already had (index.html was missing the tab-visibility pause cv.html had).
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
