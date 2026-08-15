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

  window.NikitaTheme = {
    THEME_MAP,
    THEME_STORAGE_KEY,
    LANG_STORAGE_KEY,
    MATRIX_STORAGE_KEY,
    readStored,
    writeStored,
    applyTheme,
  };
})();
