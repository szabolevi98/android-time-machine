// Round seven, package 1 (T71, docs/reports/simulator-limits-2026-10-23.md): the Settings rows of 6.0.1 and 7.1.2 that
// were dead or wrong. 7.1.2: the Do Not Disturb rule suggestion, a set-up user switched to at once, colour inversion on
// the screen, SIM card lock with its PIN dialogs. 6.0.1: account sync with auto-sync off, the backup account, Default
// apps, Restrict background data on and off, Battery's Force stop, Network operators, Color correction's switch bar.
// Both: Trust agents (Smart Lock), Apps with usage access and its detail, Cast's empty list and Enable wireless display,
// Make pattern visible off on the keyguard, Take bug report in the power menu; then the phone width.
import assert from 'node:assert/strict';
import {marshmallow, sleep} from './mm-harness.mjs';
import {nougat} from './ng-harness.mjs';

for (const [version, start, p] of [['6.0.1', marshmallow, 'mm'], ['7.1.2', nougat, 'ng']].filter(([v]) => !process.argv[2] || process.argv[2] === v)) {
  const b = await start(), KEY = `android-time-machine-${p}-v1`;
  const text = sel => b.ev(`document.querySelector(${JSON.stringify(sel)})?.textContent||''`);
  const row = key => `#viewport .${p}st-pref[data-key="${key}"]`;
  const dialog = () => b.ev(`document.querySelector('#overlay-root .${p}dlg')?.textContent||''`);
  const button = async label => { await b.until(`[...document.querySelectorAll('#overlay-root [data-action="${p}dlg-button"]')].some(x=>x.textContent.trim()===${JSON.stringify(label)})`); await b.ev(`[...document.querySelectorAll('#overlay-root [data-action="${p}dlg-button"]')].find(x=>x.textContent.trim()===${JSON.stringify(label)}).click()`); };
  const menu = async label => { await b.click(`#viewport [data-action="${p}-menu"]`); await b.until(`[...document.querySelectorAll('.${p}menu-item')].some(x=>x.textContent.trim()===${JSON.stringify(label)})`); await b.ev(`[...document.querySelectorAll('.${p}menu-item')].find(x=>x.textContent.trim()===${JSON.stringify(label)}).click()`); };
  const settings = async () => (await b.save()).settings;
  // Changes the save and reloads the phone (the state a visitor reaches through other screens).
  const seed = async (fn, view = 'home') => {
    await b.ev(`(()=>{const d=JSON.parse(localStorage.getItem('${KEY}'));(${fn})(d);localStorage.setItem('${KEY}',JSON.stringify(d));window.__ngReloadPending=true;location.reload();})()`);
    await b.until(`!window.__ngReloadPending && document.querySelector('#screen')?.classList.contains('view-${view}')`);
  };
  const type = (sel, v) => b.ev(`(()=>{const f=document.querySelector(${JSON.stringify(sel)});f.value=${JSON.stringify(v)};f.dispatchEvent(new Event('input',{bubbles:true}));return 1})()`);
  try {
    await b.language('en');

    // Trust agents: Smart Lock (Google), on until switched off.
    await b.open('settings', 'xml:trust_agent_settings');
    await b.until(`!!document.querySelector(${JSON.stringify(row('smartlock_agent'))})`);
    assert.equal(await text(row('smartlock_agent')), 'Smart Lock (Google)');
    assert.ok(await b.ev(`!!document.querySelector(${JSON.stringify(row('smartlock_agent') + ' .' + p + 'w-switch.on')})`), 'the agent starts on');
    await b.click(row('smartlock_agent'));
    assert.equal((await settings()).trustAgentOff, true);

    // Apps with usage access from Security, then its detail.
    await b.open('settings', 'xml:security');
    await b.until(`!!document.querySelector(${JSON.stringify(row('usage_access'))})`);
    await b.click(row('usage_access'));
    await b.until(`document.querySelectorAll('#viewport [data-action="${p}sc-usage"]').length===${version === '6.0.1' ? 2 : 3}`);
    const usage = await text('#viewport');
    assert.ok(usage.includes('Google Play services') && usage.includes('Google Play Store') && usage.includes('On'), usage);
    if (version === '7.1.2') assert.ok(usage.includes('Smart Storage'));
    await b.shot(`${version}-t71-usage-access`);
    await b.click(`#viewport [data-action="${p}sc-usage"][data-app="com.android.vending"]`);
    await b.until(`!!document.querySelector(${JSON.stringify(row('app_ops_settings_switch'))})`);
    assert.ok((await text('#viewport')).includes('Permit usage access'));
    assert.ok((await text('#viewport')).includes('Usage access allows'));
    await b.click(row('app_ops_settings_switch'));
    assert.deepEqual((await settings()).usageOff, ['com.android.vending']);
    await b.click('#nav-bar [data-key="back"]');
    await b.until(`/Off/.test(document.querySelector('#viewport [data-action="${p}sc-usage"][data-app="com.android.vending"]')?.textContent||'')`);
    if (version === '7.1.2') {
      await b.open('settings', 'xml:special_access');
      await b.click(row('usage_access'));
      await b.until(`document.querySelectorAll('#viewport [data-action="ngsc-usage"]').length===3`);
    }

    // Cast: the empty list and the checkable Enable wireless display.
    await b.open('settings', 'cast');
    await b.until(`/No nearby devices were found\\./.test(document.querySelector('#viewport')?.textContent||'')`);
    await menu('Enable wireless display');
    assert.equal((await settings()).wifiDisplay, true);
    await b.click(`#viewport [data-action="${p}-menu"]`);
    assert.ok(await b.ev(`!!document.querySelector('.${p}menu-check.on')`), 'the item shows its check');
    await b.ev(`document.querySelector('[data-action="${p}menu-close"]')?.click()`);
    await b.shot(`${version}-t71-cast`);

    // Take bug report in the power menu with the developer option on.
    await seed(`d=>{d.settings.dev={...(d.settings.dev||{}),on:true,bugreport_in_power:true}}`);
    await b.ev(`(async()=>{const k=document.querySelector('#power-button');k.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));await new Promise(r=>setTimeout(r,1500));k.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));})()`);
    await b.until(`/Take bug report/.test(document.querySelector('#overlay-root')?.textContent||'')`);
    assert.ok((await dialog()).includes(version === '6.0.1' ? '6.0.1 (MTC20K)' : '7.1.2 (N2G48C)'));
    await b.shot(`${version}-t71-power`);
    await b.ev(`[...document.querySelectorAll('#overlay-root [data-action="${p}dlg-item"]')].find(x=>/Take bug report/.test(x.textContent)).click()`);
    if (version === '6.0.1') { await b.until(`/collect information/.test(document.querySelector('#overlay-root')?.textContent||'')`); await button('Report'); }
    await b.until(`/Take bug report/.test(document.querySelector('.${p}toast, [class*="toast"]')?.textContent||'')`);

    // Make pattern visible off: the keyguard's pattern draws no path.
    await seed(`d=>{d.settings.lock={type:'pattern',secret:'0124',visible:false}}`, 'lock');
    for (let i = 0; i < 5 && !await b.ev(`!!document.querySelector('.${p}pt')`); i++) { await b.drag('#screen', 0, -400); await sleep(500); }
    await b.until(`!!document.querySelector('.${p}pt')`);
    assert.ok(await b.ev(`document.querySelector('.${p}pt').classList.contains('stealth')`), 'the bouncer pattern is in stealth mode');
    assert.equal(await b.ev(`getComputedStyle(document.querySelector('.${p}pt-path')).display`), 'none');
    await seed(`d=>{d.settings.lock={type:'swipe'}}`);

    if (version === '7.1.2') {
      // The DND rule suggestion: done once a rule is on.
      const title = await b.ev(`NG.text('settings').t('zen_mode_automation_suggestion_title')`);
      await seed(`d=>{d.settings.zenRules=[{id:'r1',name:'Weekend',on:true,days:[0,6],start:1320,end:420}]}`);
      await b.open('settings');
      await b.ev(`document.querySelector('#viewport [data-action="ngst-suggest-expand"], #viewport [data-action="ngst-suggestions"]')?.click()`); await sleep(300);
      assert.ok(!(await text('#viewport')).includes(title), 'a rule that is on hides the suggestion');
      // Color inversion from Accessibility inverts the screen and is the Quick Settings tile's value.
      await b.open('settings', 'xml:accessibility_settings');
      await b.click(row('toggle_inversion_preference'));
      assert.equal((await settings()).inversion, true);
      assert.match(await b.ev(`document.querySelector('#screen').style.filter`), /invert\(1\)/);
      await b.click(row('toggle_inversion_preference'));
      assert.doesNotMatch(await b.ev(`document.querySelector('#screen').style.filter`), /invert/);
      // Users (UserSettings.updateUserList): a user who is set up is a plain row with the manage gear; one who is not
      // is selectable and asks "Set up user now?".
      await b.ev(`(()=>{const a=NG.users.addUser(),b=NG.users.addUser();localStorage.setItem('android-time-machine-ng-v1-'+a,'{}');window.__uids=[a,b];})()`);
      await b.open('settings', 'xml:user_settings');
      const [ready, fresh] = await b.ev('window.__uids');
      await b.until(`!!document.querySelector(${JSON.stringify(row('user_' + fresh))})`);
      assert.equal(await b.ev(`!!document.querySelector(${JSON.stringify(row('user_' + ready))})`), false, 'a set-up user is not selectable');
      assert.ok(await b.ev(`!!document.querySelector('#viewport [data-key="manage_${ready}"]')`));
      await b.click(row('user_' + fresh));
      await b.until(`/Set up user now\?/.test(document.querySelector('#overlay-root')?.textContent||'')`);
      await button('Not now');
      // SIM card lock: Lock SIM card asks for the PIN; Change SIM PIN asks old, new, new again.
      await b.open('settings', 'xml:sim_lock_settings');
      await b.click(row('sim_toggle'));
      await b.until(`!!document.querySelector('#overlay-root input')`);
      assert.ok((await dialog()).includes('Lock SIM card') && (await dialog()).includes('SIM PIN'));
      await type('#overlay-root input', '12'); await button('OK');
      await b.until(`/Incorrect PIN/.test(document.querySelector('#overlay-root')?.textContent||'')`);
      await type('#overlay-root input', '1234'); await button('OK');
      await b.until(`!document.querySelector('#overlay-root input')`);
      assert.equal((await settings()).simLock, true);
      await b.click(row('sim_pin'));
      for (const [prompt, v] of [['Old SIM PIN', '1234'], ['New SIM PIN', '5678'], ['Re‑type new PIN', '5678']]) {
        await b.until(`document.querySelector('#overlay-root')?.textContent.includes(${JSON.stringify(prompt)})&&!!document.querySelector('#overlay-root input')`);
        await type('#overlay-root input', v); await button('OK');
      }
      await b.until(`/SIM PIN changed successfully/.test(document.querySelector('#overlay-root')?.textContent||document.body.textContent)`);
      assert.equal((await settings()).simPin, '5678');
      await b.shot('7.1.2-t71-simlock');
    } else {
      // Auto-sync off: every adapter checked, "Touch to sync now".
      await seed(`d=>{d.settings.autoSync=false;d.settings.syncOff=['com.android.contacts']}`);
      await b.open('settings', 'account-sync');
      await b.until(`!!document.querySelector('#viewport [data-action="mmsx-sync"]')`);
      assert.ok((await text('#viewport [data-action="mmsx-sync"] .mmst-summary')).startsWith('Touch to sync now'));
      assert.equal(await b.ev(`document.querySelectorAll('#viewport [data-action="mmsx-sync"] .mmst-check:not(.on)').length`), 0);
      await b.click('#viewport [data-action="mmsx-sync"]');
      assert.deepEqual((await settings()).syncOff, ['com.android.contacts'], 'a touch syncs once and changes nothing');
      await b.shot('6.0.1-t71-sync-off');
      // The backup account: the account's name while backup is on; a touch offers it and Add account.
      await seed(`d=>{d.settings.backup=true}`);
      await b.open('settings', 'xml:privacy_settings');
      await b.until(`!!document.querySelector(${JSON.stringify(row('configure_account'))})`);
      assert.match(await text(row('configure_account')), /@gmail\.com/);
      await b.click(row('configure_account'));
      await b.until(`/Add account/.test(document.querySelector('#overlay-root')?.textContent||'')`);
      await b.ev(`document.querySelector('#overlay-root [data-action="mmdlg-item"][data-index="1"]').click()`);
      await b.until(`!!document.querySelector('#viewport') && !document.querySelector('#viewport .mmst-missing') && /Add an account/.test(document.querySelector('#screen').textContent)`);
      // Default apps: Chrome, Phone, Messenger; no emergency row.
      await b.open('settings', 'xml:default_apps');
      await b.until(`!!document.querySelector(${JSON.stringify(row('default_browser'))})`);
      assert.match(await text(row('default_browser')), /Chrome/);
      assert.match(await text(row('default_phone_app')), /Phone/);
      assert.match(await text(row('default_sms_app')), /Messenger/);
      assert.equal(await b.ev(`!!document.querySelector(${JSON.stringify(row('default_emergency_app'))})`), false);
      await b.click(row('default_sms_app'));
      await b.until(`!!document.querySelector('#overlay-root .mmdlg .mmw-radio.on')`);
      assert.ok((await dialog()).includes('Messenger'));
      await button('Cancel');
      // Restrict background data: on after the warning, off at once.
      await b.open('settings', 'data-usage');
      await menu('Restrict background data');
      await button('OK');
      assert.equal((await settings()).restrictBackground, true);
      await b.click('#viewport [data-action="mm-menu"]');
      assert.ok(await b.ev(`[...document.querySelectorAll('.mmmenu-item')].find(x=>/Restrict background/.test(x.textContent)).querySelector('.mmmenu-check.on')!==null`));
      await b.ev(`[...document.querySelectorAll('.mmmenu-item')].find(x=>/Restrict background/.test(x.textContent)).click()`);
      assert.equal((await settings()).restrictBackground, false);
      // Battery › Google Play services: Force stop, OK greys the button.
      await b.open('settings', 'batt:gms');
      await b.click('#viewport [data-action="mmsx-battstop"]');
      await button('OK');
      await b.until(`document.querySelector('#viewport [data-action="mmsx-battstop"]')?.disabled===true`);
      // Network operators: Search networks lists the scan, a pick is the summary; Choose automatically clears it.
      await b.open('settings', 'xml:wireless_settings');
      await b.click(row('mobile_network_settings'));
      const titled = label => `[...document.querySelectorAll('#viewport .mmst-pref')].find(x=>x.querySelector('.mmst-title')?.textContent===${JSON.stringify(label)})`;
      const tapTitled = async label => { await b.until(`!!${titled(label)}`); await b.ev(`${titled(label)}.click()`); };
      await tapTitled('Network operators');
      await tapTitled('Search networks');
      await b.until(`/Searching/.test(document.querySelector('#overlay-root')?.textContent||'')`);
      await b.until(`/Vodafone/.test(document.querySelector('#overlay-root')?.textContent||'')`);
      await b.ev(`[...document.querySelectorAll('#overlay-root [data-action="mmdlg-item"]')].find(x=>/Vodafone/.test(x.textContent)).click()`);
      await b.until(`/Registered on network|Registration/i.test(document.body.textContent) || /Vodafone/.test(${titled('Choose automatically')}?.textContent||'')`);
      await b.until(`/Vodafone/.test(${titled('Choose automatically')}?.textContent||'')`);
      assert.equal((await b.save()).appPrefs.network.manual, 'Vodafone');
      await tapTitled('Choose automatically');
      await b.until(`!/Vodafone/.test(${titled('Choose automatically')}?.textContent||'')`);
      await b.shot('6.0.1-t71-operators');
      // Color correction: the switch bar turns it on and enables Mode.
      await b.open('settings', 'xml:accessibility_daltonizer_settings');
      await b.until(`!!document.querySelector('#viewport [data-action="mma1-dalton"]')`);
      assert.ok(await b.ev(`document.querySelector(${JSON.stringify(row('type'))}).disabled`), 'Mode is off with the feature');
      await b.click('#viewport [data-action="mma1-dalton"]');
      assert.equal((await settings()).a11y.daltonizer_preference_screen, true);
      assert.ok(!await b.ev(`document.querySelector(${JSON.stringify(row('type'))}).disabled`));
      // Color inversion inverts the screen.
      await b.open('settings', 'xml:accessibility_settings');
      await b.click(row('toggle_inversion_preference'));
      assert.match(await b.ev(`document.querySelector('#screen').style.filter`), /invert\(1\)/);
      await b.click(row('toggle_inversion_preference'));
    }

    // Every language has the new screens' texts (no key falls back to the missing-text marker).
    for (const lang of ['hu', 'de', 'fr', 'es']) {
      await b.language(lang);
      for (const sub of ['usage-access', 'cast', 'xml:trust_agent_settings', ...(version === '6.0.1' ? ['xml:default_apps', 'xml:accessibility_daltonizer_settings', 'account-sync'] : ['xml:sim_lock_settings'])]) await b.open('settings', sub);
      await b.click(`#viewport [data-action="${p}-menu"]`).catch(() => {});
      assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`), [], lang);
    }
    await b.language('en');

    // The phone width: the new screens fit.
    await b.send('Emulation.setDeviceMetricsOverride', {width: 375, height: 812, deviceScaleFactor: 1, mobile: true});
    for (const sub of ['usage-access', 'cast', 'xml:trust_agent_settings']) {
      await b.open('settings', sub);
      assert.ok(await b.ev(`document.querySelector('#viewport').scrollWidth<=document.querySelector('#viewport').clientWidth+1`), `${sub} fits the phone width`);
    }
    await b.shot(`${version}-t71-phone`);
    b.check();
    console.log(version, 'T71 ok');
  } catch (error) { await b.shot(`${version}-t71-failure`); throw error; } finally { b.close(); }
}
