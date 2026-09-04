/* ================================================================
   theme.js — shared theme/lang/matrix persistence.
   Used by index.html, cv.html, and 404.html so a preference set on
   one page is respected on the others. Exposes window.TermTheme,
   deliberately named after the term: storage-key prefix rather than
   after whoever owns the site.
   ================================================================ */
(function(){
  "use strict";

  // Every theme's full palette lives in theme.css as one complete
  // :root[data-theme="name"] block — this registry only needs to know
  // each theme's name and (for the ones that differ from plain fg) how
  // to recolor the matrix-rain <canvas>, which can't read CSS custom
  // properties.
  const THEME_MAP = {
    green:{fg:"#3dff8a"},
    amber:{fg:"#ffb000"},
    commodore:{fg:"#7869c4"},
    pascal:{fg:"#ffff55"},
    solarized:{fg:"#839496"},
    ubuntu:{fg:"#eeeeec"},
    // Secret theme (easter egg — not listed anywhere).
    sabbatical:{fg:"#5c6166",matrixColor:"#8a9199",matrixFade:"rgba(248,249,250,.12)"},
  };

  const THEME_STORAGE_KEY = 'term:theme';
  const LANG_STORAGE_KEY = 'term:lang';
  const MATRIX_STORAGE_KEY = 'term:matrix';

  function readStored(key){
    try { return localStorage.getItem(key); } catch(e){ return null; }
  }
  function writeStored(key, value){
    try { localStorage.setItem(key, value); } catch(e){}
  }

  function applyTheme(name){
    const t = THEME_MAP[name];
    if(!t) return null;
    document.documentElement.dataset.theme = name;
    return t.fg;
  }

  // Reads all three persisted preferences and resolves them to concrete
  // values/side-effects (applies the theme, sets document.lang) without
  // touching any page-local state — callers apply the returned bits
  // (lang, matrixColor, matrixEnabled) to their own variables/controllers.
  // Fills "{name}"-style placeholders from a params object. Lives here
  // because all three pages need it — index.html's t(), and cv/404's
  // language-switcher aria-label, which has to name the language it
  // switches to.
  function fillTemplate(s, params){
    return typeof s === 'string'
      ? s.replace(/\{(\w+)\}/g, function(m, k){ return k in params ? params[k] : m; })
      : s;
  }

  // `codes` is the page's GENERATED:LOCALES list, first entry default.
  // Passed in rather than hardcoded here so theme.js stays a plain
  // shared library with no build coupling and no idea which languages
  // this particular site has.
  function restoreSettings(codes){
    const valid = (codes && codes.length) ? codes : ['en'];
    const storedLang = readStored(LANG_STORAGE_KEY);
    const lang = valid.indexOf(storedLang) !== -1 ? storedLang : valid[0];
    document.documentElement.lang = lang;

    let storedTheme = readStored(THEME_STORAGE_KEY);
    if(!storedTheme){
      // First-time visitor (no preference saved yet) — assign a random
      // theme from every entry in THEME_MAP, sabbatical included, and
      // persist it immediately so it stays consistent across reloads
      // and other pages, same as if they'd typed `theme <name>`
      // themselves. New themes only need adding to THEME_MAP — this
      // picks them up automatically.
      const names = Object.keys(THEME_MAP);
      storedTheme = names[Math.floor(Math.random() * names.length)];
      writeStored(THEME_STORAGE_KEY, storedTheme);
    }
    const t = THEME_MAP[storedTheme];
    const fg = applyTheme(storedTheme);
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

  window.TermTheme = {
    THEME_MAP,
    THEME_STORAGE_KEY,
    LANG_STORAGE_KEY,
    MATRIX_STORAGE_KEY,
    readStored,
    writeStored,
    fillTemplate,
    applyTheme,
    restoreSettings,
    createMatrixRain,
  };
})();
