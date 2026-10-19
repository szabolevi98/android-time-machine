/* Nougat preview page (the Nexus 6P in recovery until the simulator is built): the language picker and the page
   translation only. */
(() => {
  'use strict';
  const i18n = window.AndroidI18n;
  if (!i18n) return;
  const select = document.querySelector('#language-select');
  select.value = i18n.language;
  select.addEventListener('change', event => { i18n.setLanguage(event.target.value); location.reload(); });
  document.documentElement.lang = i18n.language;
  i18n.translateDOM(document.body);
})();
