/* The boot covers startup work: decode launcher icons, the current wallpaper and keyguard/status/navigation
   pictures before releasing it. These are small startup resources, not every picture in every application. */
(() => {
  'use strict';
  let pending;
  const state = {status: 'idle', images: [], failed: []};
  function shouldBoot(version) {
    try { return !sessionStorage.getItem(`android-sim-booted-${version}`); }
    catch { return true; } // Private/blocked storage must not bypass the boot.
  }
  function complete(version) { try { sessionStorage.setItem(`android-sim-booted-${version}`, '1'); } catch {} }
  function prepare({images = [], markup = '', root = document.querySelector('#screen')} = {}) {
    if (pending) return pending;
    state.status = 'loading';
    const urls = new Set(images.filter(Boolean)), fonts = new Set();
    const add = value => { for (const m of String(value || '').matchAll(/url\(["']?([^"')]+)["']?\)/g)) urls.add(m[1]); };
    const collect = element => {
      if (element.tagName === 'IMG' && element.hasAttribute('src')) urls.add(element.currentSrc || element.src);
      const s = getComputedStyle(element); add(s.backgroundImage); add(s.maskImage); add(s.webkitMaskImage); add(s.borderImageSource);
      if (s.fontFamily) fonts.add(`${s.fontSize} ${s.fontFamily}`);
    };
    if (root) { collect(root); root.querySelectorAll('*').forEach(collect); }
    const fragment = document.createElement('template'); fragment.innerHTML = markup;
    fragment.content.querySelectorAll('img[src]').forEach(img => urls.add(img.getAttribute('src')));
    const rules = list => { for (const rule of list) {
      if (rule.cssRules) rules(rule.cssRules);
      if (rule.style && /lock|keyguard|eckg|mmlk|nglk|status|nav-bar/.test(rule.selectorText || '')) {
        add(rule.style.cssText);
        if (rule.style.fontFamily) fonts.add(`16px ${rule.style.fontFamily}`);
      }
    }};
    for (const sheet of document.styleSheets) { try { rules(sheet.cssRules); } catch {} }
    const assets = [...urls].filter(url => url && !url.startsWith('#')).map(url => new URL(url, document.baseURI).href);
    state.images = [...new Set(assets)];
    const decode = url => new Promise(resolve => {
      const img = new Image(); let done = false;
      const finish = ok => { if (done) return; done = true; clearTimeout(timer); if (!ok) state.failed.push(url); resolve(); };
      const timer = setTimeout(() => finish(false), 15000);
      img.onload = () => { if (img.decode) img.decode().then(() => finish(true), () => finish(img.naturalWidth > 0)); else finish(true); };
      img.onerror = () => finish(false); img.src = url;
    });
    const queue = [...state.images];
    const worker = async () => { while (queue.length) await decode(queue.shift()); };
    const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(resolve => window.addEventListener('load', resolve, {once: true}));
    const fontLoads = document.fonts ? [...fonts].map(font => Promise.resolve().then(() => document.fonts.load(font)).catch(() => {})) : [];
    pending = Promise.all([loaded, ...Array.from({length: Math.min(8, queue.length)}, worker), ...fontLoads])
      .then(() => document.fonts?.ready).then(() => { state.status = state.failed.length ? 'degraded' : 'ready'; });
    return pending;
  }
  const sprites = data => Promise.all((data?.parts || []).map(part => {
    const image = new Image(); image.src = part.sheet;
    return image.decode ? image.decode().catch(() => {}) : Promise.resolve();
  }));
  window.AndroidBoot = {shouldBoot, complete, prepare, sprites, state};
})();
