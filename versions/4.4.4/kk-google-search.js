/* Google Search 3.3.11 and Voice Search in the 4.4.4 shell (docs/plans/engine-migration.md): the search and voice screens (stock-apps.js), Google Now's switch, the settings pages (kk-search-prefs.js) and Back, moved out of simulator.js. */
(() => {
  'use strict';
  function scope(c) {
    const {data, i18n, listenVoice, openApp, render, renderStockApp, save, toast, ui} = c;
    // Share contact via Email or Gmail: the app's compose with the contact card attached.
    // Google Search's settings pages (kk-search-prefs.js); Location services is Google Settings' Location.
    function gsContext() {
      return {ui, data, t: key => i18n.t(key), locale: i18n.locale(), account: GmailApp.account, save, render,
        unsupported: () => toast(i18n.t('This feature is not part of the simulator.')),
        openLocation() { openApp('google-settings'); ui.sub = 'gms-location'; ui.gmsDialog = ''; render(); }};
    }
    return {
      render() {
        return renderStockApp();
      },
      action(action, button, event) {
        const {id, app, url} = button.dataset;
        if (ui.view === 'google-search' && action.startsWith('ksp-') && KKSearchPrefs.handle(action, id, gsContext())) return;
        switch (action) {
          // Google Settings' Play Games opens the Games app.
          case 'gs-play-games': openApp('play-games'); break;
          // The search box microphones open the image's voice search.
          case 'voice-search': openApp('voice-search'); break;
          case 'voice-listen': listenVoice(); break;
          case 'google-now-toggle': data.googleNowOn = data.googleNowOn === false; save(); render(); break;
          default: return false;
        }
        return true;
      },
      back() {
        if (ui.view === 'google-search' && ui.voiceFromSettings && ui.sub === 'settings' && !ui.overlay && !(ui.ksStack || []).length) { ui.voiceFromSettings = false; openApp('settings'); ui.sub = 'language'; render(); return true; }
        if (ui.view === 'google-search' && ui.sub === 'settings' && !ui.overlay && KKSearchPrefs.back(gsContext())) return true;
        return false;
      }
    };
  }
  const spec = {
    render: c => scope(c).render(),
    action: (name, el, event, c) => scope(c).action(name, el, event),
    back: c => scope(c).back()
  };
  for (const id of ['google-search', 'voice-search']) KK.register(id, spec);
})();
