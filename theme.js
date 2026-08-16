/* ================================================================
   theme.js — shared theme/lang/matrix persistence for nikita.sh
   Used by both index.html and cv.html so a preference set on one
   page is respected on the other. Exposes window.NikitaTheme.
   ================================================================ */
(function(){
  "use strict";

  const THEME_MAP = {
    green:{fg:"#3dff8a",dim:"#2a9c60",accent:"#5ff1ff",warn:"#ffb454"},
    amber:{fg:"#ffb454",dim:"#a06a1f",accent:"#ffe08a",warn:"#5ff1ff"},
    cyan :{fg:"#5ff1ff",dim:"#2a8a9c",accent:"#3dff8a",warn:"#ffb454"},
  };

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
    root.setProperty('--fg', t.fg);
    root.setProperty('--fg-dim', t.dim);
    root.setProperty('--accent', t.accent);
    root.setProperty('--amber', t.warn);
    root.setProperty('--amber-glow', `0 0 6px ${t.warn}99`);
    root.setProperty('--border', `${t.fg}47`);
    root.setProperty('--glow', `0 0 4px ${t.fg}, 0 0 12px ${t.fg}88, 0 0 24px ${t.fg}44`);
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
    const matrixColor = storedTheme ? applyTheme(storedTheme) : null;

    const matrixEnabled = readStored(MATRIX_STORAGE_KEY) !== 'off';

    return { lang, matrixColor, matrixEnabled };
  }

  // Creates a self-contained matrix-rain animation bound to a <canvas>,
  // handling its own resize/draw loop. Shared since the drawing logic is
  // otherwise byte-identical between pages — encapsulating it here means
  // the two pages can't silently drift apart the way they already had
  // (index.html was missing the tab-visibility pause cv.html had).
  function createMatrixRain(canvasEl){
    const ctx = canvasEl.getContext('2d');
    const glyphs = "01アイウエオカキクケコサシスセソ$#&+=-<>/\\{}[]";
    let cols, drops;
    let color = "#3dff8a";
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
        ctx.fillStyle = "rgba(2,4,3,0.08)";
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
