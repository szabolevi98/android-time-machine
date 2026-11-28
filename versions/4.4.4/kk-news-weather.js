/* News & Weather 1.3.11 in the 4.4.4 shell (docs/plans/engine-migration.md): the sections and stories (stock-apps.js), refresh, share and the settings (news-prefs.js) and Back, moved out of simulator.js. */
(() => {
  'use strict';
  function scope(c) {
    const {data, deviceDate, i18n, messageDraft, openApp, render, renderOverlay, renderStockApp, save, toast, ui, viewport} = c;
    return {
      render() {
        return renderStockApp();
      },
      action(action, button, event) {
        const {id, app, url} = button.dataset;
        switch (action) {
          case 'news-tab': ui.newsTab = id; render(); break;
          // News & Weather: Refresh records the time the refresh status shows; Settings, the story page and Share story.
          case 'sa-news-refresh': ui.overlay = ''; renderOverlay(); NewsPrefs.refresh(data, deviceDate().getTime()); save(); render(); toast(AndroidStrings.pick(window.StockStrings?.news?.['Updating news topics…'], i18n.language, 'Updating news topics…')); break;
          case 'news-settings': ui.overlay = ''; renderOverlay(); ui.newsSub = 'settings'; ui.nwpScreen = 'root'; ui.nwpDialog = ''; render(); break;
          case 'news-story': ui.newsSub = 'story'; ui.newsStory = id; render(); break;
          case 'news-share': { ui.overlay = ''; renderOverlay(); const title = viewport.querySelector('.nwp-story h2')?.textContent || ''; openApp('hangouts'); ui.sub = 'new'; messageDraft().body = title; save(); render(); break; }
          case 'nwp-open': case 'nwp-toggle': case 'nwp-topic': case 'nwp-remove': case 'nwp-dialog': case 'nwp-cancel': case 'nwp-choose': case 'nwp-ok': case 'nwp-unsupported':
            NewsPrefs.handle(action, id, {ui, data, lang: i18n.language, save, render, input: () => viewport.querySelector('[data-nwp-input]')?.value, unsupported: () => toast(i18n.t('This feature is not part of the simulator.'))}); break;
          default: return false;
        }
        return true;
      },
      back() {
        // News & Weather: a settings dialog or nested screen, then the settings or the story page.
        if (ui.view === 'news-weather' && ui.newsSub && !ui.overlay) { if (!(ui.newsSub === 'settings' && NewsPrefs.back(ui))) { ui.newsSub = ''; ui.nwpScreen = ''; } render(); return true; }
        return false;
      }
    };
  }
  const spec = {
    render: c => scope(c).render(),
    action: (name, el, event, c) => scope(c).action(name, el, event),
    back: c => scope(c).back()
  };
  for (const id of ['news-weather']) KK.register(id, spec);
})();
