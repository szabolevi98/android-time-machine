/* One text contract for every version (audit point 10). A table maps a key (the English text, or on 2.3.6 the resource
   name) to an entry with named languages:
     {res?, hu, de, fr, es, en?}  or for the simulator's own texts  {own: true, hu, de, fr, es, en?}
   en is the image's English and is left out when it equals the key; res names the factory resource the row was read from
   ("Vending:install", "framework:ok"); src: 'AOSP' marks a row taken from the AOSP sources where the image has no
   resource with these texts. A plural entry holds an object of quantities per language: {en: {one, other}, hu: …}.
   AndroidStrings.table(id, entries, missing?) gives the reader every module uses:
     t(key, lang)            the entry in that language, else its English, else missing(key, lang) (default: the key)
     fmt(key, lang, …args)   t() with %s / %d / %1$s / %2$d / %% / ^1 filled in
     plural(key, n, lang, …) the quantity Intl.PluralRules picks for n (args default to [n])
   lang is a language code or a locale ('hu', 'hu-HU'); without one the simulator's current language is used. */
(() => {
  'use strict';
  const LANGS = ['en', 'hu', 'de', 'fr', 'es'];
  const LOCALES = {en: 'en-US', hu: 'hu-HU', de: 'de-DE', fr: 'fr-FR', es: 'es-ES'};
  const tables = {};
  const code = lang => {
    const c = String(lang || (globalThis.window?.AndroidI18n ?? globalThis.AndroidI18n)?.language || 'en').slice(0, 2).toLowerCase();
    return LANGS.includes(c) ? c : 'en';
  };
  // Android's formatter: positional %1$s / %2$d, sequential %s / %d, %% for a percent sign, a width with 0 padding (%02d),
  // a precision (%.1f), hexadecimal (%02X) and the grouping flag (%,d: callers pass the number already grouped); the Market's ^1 as well.
  function format(text, ...args) {
    let next = 0;
    return String(text ?? '')
      .replace(/%(?:(\d+)\$)?([-#+0,]*)(\d*)(?:\.(\d+))?([sdfSxX%])/g, (all, pos, flags, width, precision, type) => {
        if (type === '%') return '%';
        const value = args[pos ? pos - 1 : next++];
        if (value === undefined) return all;
        let out = type === 'f' && precision ? Number(value).toFixed(Number(precision)) : type === 'x' || type === 'X' ? Number(value).toString(16) : String(value);
        if (type === 'X') out = out.toUpperCase();
        if (width && out.length < Number(width)) out = flags.includes('-') ? out.padEnd(Number(width)) : out.padStart(Number(width), flags.includes('0') ? '0' : ' ');
        return out;
      })
      .replace(/\^(\d)/g, (all, n) => args[n - 1] ?? all);
  }
  // Keys a table was asked for in another language than English but does not have (docs/tools/text-check.mjs reads them).
  const misses = new Map();
  const miss = (key, lang) => { if (lang !== 'en' && /[A-Za-z]{2}/.test(key)) misses.set(key, (misses.get(key) || 0) + 1); };
  function value(entry, key, lang, missing) {
    if (entry === undefined || entry === null) { if (missing) return missing(key, code(lang)); miss(key, code(lang)); return key; }
    if (typeof entry === 'string') return entry;
    const c = code(lang);
    return entry[c] ?? entry.en ?? key;
  }
  // missing(key, lang) answers keys the table lacks; a module that falls back on the shared AndroidI18n rows passes
  // AndroidStrings.shared.
  function table(id, entries = {}, missing) {
    const has = key => Object.prototype.hasOwnProperty.call(entries, key);
    const reader = {
      id, entries, has,
      entry: key => has(key) ? entries[key] : undefined,
      t: (key, lang) => value(has(key) ? entries[key] : undefined, key, lang, missing),
      fmt: (key, lang, ...args) => format(reader.t(key, lang), ...args),
      plural(key, n, lang, ...args) {
        const forms = value(has(key) ? entries[key] : undefined, key, lang, missing);
        if (typeof forms === 'string') return format(forms, ...(args.length ? args : [n]));
        const quantity = new Intl.PluralRules(LOCALES[code(lang)]).select(Number(n));
        const english = entries[key]?.en || {};
        return format(forms[quantity] ?? forms.other ?? english[quantity] ?? english.other ?? key, ...(args.length ? args : [n]));
      }
    };
    if (id) tables[id] = reader;
    return reader;
  }
  // One entry read the shared way, for a module that has already looked it up (a missing language reads as English).
  const pick = (entry, lang, key) => value(entry, key, lang ?? 'en');
  // The CLDR plural category of n in a language ('one', 'other', …), as Android's getQuantityString picks it.
  const quantity = (n, lang) => new Intl.PluralRules(LOCALES[code(lang)]).select(Number(n));
  // Tables keyed by resource name, as docs/tools/gb-strings.py writes them: {strings: {name: {en, hu, …}}, arrays: {name: {en:
  // [...], hu: [...]}}, plurals: {name: {en: {one, other}, …}}}. get() is read on every call, so the order the scripts
  // load in does not matter.
  function resources(get) {
    const part = kind => get()?.[kind] || {};
    return {
      has: key => Object.prototype.hasOwnProperty.call(part('strings'), key),
      t: (key, lang) => table('', part('strings')).t(key, lang),
      fmt: (key, lang, ...args) => table('', part('strings')).fmt(key, lang, ...args),
      array: (key, lang) => { const entry = part('arrays')[key]; return entry ? entry[code(lang)] || entry.en : []; },
      plural: (key, n, lang, ...args) => table('', part('plurals')).plural(key, n, lang, ...args)
    };
  }
  // The shared rows (i18n.js and the version's image-strings.js) in the simulator's current language; English as is.
  const shared = (key, lang) => lang === 'en' ? key : (globalThis.window?.AndroidI18n ?? globalThis.AndroidI18n)?.t(key) ?? key;
  // Legacy shapes, for tables that have not moved to the named form yet: [hu, de, fr, es, en?] rows keyed by English.
  const fromRows = rows => Object.fromEntries(Object.entries(rows).map(([key, [hu, de, fr, es, en]]) => [key, en && en !== key ? {en, hu, de, fr, es} : {hu, de, fr, es}]));
  const api = {LANGS, LOCALES, code, format, table, tables, resources, pick, quantity, shared, misses, fromRows, locale: lang => LOCALES[code(lang)]};
  // A page's window is its global object; a test's vm context may carry a separate window object, so both get it.
  globalThis.AndroidStrings = api;
  if (globalThis.window) globalThis.window.AndroidStrings = api;
})();
