/* The Nexus S image's Google apps (Gmail, Maps, Talk, YouTube, ...) register here:
   GBApps.register(id, {render(ctx), mounted(ctx), menu(ctx), keep(ctx), dialog(kind, ctx), handle(action, id, ctx, button),
   submit(form, values, ctx), back(ctx), open(ctx, resume), scroll}); every hook but render is optional. Each one is a GB
   module (docs/plans/engine-migration.md) that hands the app the context it was written for (c.gapp(): the shell's
   gappContext). A module's texts come from its APK in the image (docs/tools/apk-strings.py), falling back to the shared
   interface rows. */
(() => {
  'use strict';
  const apps = new Map();
  // T(STRINGS)(lang, key): the APK's own translation, else the shared i18n row, else the English key.
  const texts = strings => {
    const table = AndroidStrings.table('', strings, AndroidStrings.shared);
    return (lang, key) => table.t(key, lang);
  };
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  window.GBApps = {
    register(id, module) {
      apps.set(id, module);
      window.GB?.register(id, {
        google: module,
        render: c => module.render(c.gapp()),
        mount: c => module.mounted?.(c.gapp()),
        // keep: the screen's fields are kept before the menu opens over it.
        menu(c) { const ctx = c.gapp(); module.keep?.(ctx); c.gbMenu(module.menu?.(ctx) || []); },
        dialog: (kind, c) => module.dialog?.(kind, c.gapp()),
        // The keys and the launcher's open-app stay the system's.
        action: (name, el, c) => !['back', 'home', 'menu-key', 'search-key', 'open-app'].includes(name) && !!module.handle?.(name, el.dataset.id, c.gapp(), el),
        submit: (name, values, c) => !!module.submit?.(name, values, c.gapp()),
        back: c => !!module.back?.(c.gapp()),
        open: (c, resume) => module.open?.(c.gapp(), resume)
      });
    },
    has: id => apps.has(id),
    get: id => apps.get(id),
    ids: () => [...apps.keys()],
    texts, e
  };
})();
