/* Android 6.0.1 on-screen keyboard: Google Keyboard 4.1 (the image's LatinImeGoogle.apk) in the theme KeyboardTheme picks
   on API 23, LXX Light. It opens when a text field of the screen gets the focus and pushes the screen up (adjustResize);
   Back (the navigation bar's ic_sysbar_back_ime) or leaving the field closes it.
   - Geometry (KeyboardBuilder.parseKeyboardAttributes, in px at 420 dpi): config_default_keyboard_height 205.6 dp
     (539 px), keyboardTopPadding 2.335 %p (12) and keyboardBottomPadding 4.669 %p (25) of it, verticalGap 6.127 %p (33),
     the base height 539 - 12 - 25 + 33 = 535 and rowHeight 25 %p of it (133); a key is the row less the gap (100 px),
     horizontalGap 1.739 %p of the width (18 px) split around each key. Above it the 40 dp suggestion strip
     (keyboard_suggest_strip_lxx_light, three suggestions, the 36 dp voice key ic sym_keyboard_voice_lxx_light at the
     right); a password field has no strip.
   - The rows (res/xml): rows_qwerty / rows_qwertz / rows_azerty / rows_spanish — 10 %p keys, the second row 5 %p in
     (azerty and spanish fill it), shift 15 %p with a 1 %p inset and delete filling the rest; row_qwerty4: ?123 15 %p,
     the comma (key_comma: "/" for a URL, "@" for an e-mail address), the 50 %p space bar at 25 %p, the period, the enter
     key filling the rest. rows_symbols (1–0; @ # $ % & - + ( ) 5 %p in; =\< * " ' : ; ! ?; ABC , _ space / .) and
     rows_symbols_shift (~ ` | • √ π ÷ × ¶ ∆; £ ¢ € ¥ ^ ° = { }; ?123 \ © ® ™ ℅ [ ]; ABC , < space > .). The layout set
     follows the language as the image's subtypes do: English QWERTY, German and Hungarian QWERTZ, French AZERTY,
     Spanish with Ñ.
   - KeyboardView.LXX_Light: everything on #eceff1 (keyboard_background_lxx_light, flat keys), pressed keys
     #2637474f, letters 55 % of the key height in key_text_color_lxx_light #37474f, labels (?123, ABC) 34 % in
     key_functional_text_color_lxx_light #cc37474f; the space bar btn_keyboard_spacebar_*_lxx_light; an IME action
     (search, go, send, next, done) on btn_keyboard_key_active_lxx_light, the #4db6ac circle kept round. The key
     preview (keyboard_key_feedback_background_lxx_light, 122 dp high, 50 dp below the key's top, the letter at 82 % of
     the key height) shows over a pressed letter. Delete repeats (config_key_repeat_start_timeout 400 ms, interval 50).
   - Shift: one tap shifts the next letter, a second tap within the double-tap time locks it (sym_keyboard_shift_locked);
     a text area and fields asking for capitals start sentences shifted (TextUtils.getCapsMode).
   - The suggestion strip shows the word being typed in the middle, as the keyboard does when its dictionary has no
     better word; the dictionaries themselves are not in the simulator. A computer keyboard keeps typing too. */
(() => {
  'use strict';
  const PX = 2.625, W = 1080, H = 539, TOP = 12, ROW = 133, KEY = 100, HGAP = 18, STRIP = 40;
  const dp = px => `calc(${(px / PX).toFixed(3)} * var(--dp))`;
  const LETTERS = {qwerty: ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'], qwertz: ['qwertzuiop', 'asdfghjkl', 'yxcvbnm'], azerty: ['azertyuiop', 'qsdfghjklm', "wxcvbn'"], spanish: ['qwertyuiop', 'asdfghjklñ', 'zxcvbnm']};
  const SET = {en: 'qwerty', de: 'qwertz', hu: 'qwertz', fr: 'azerty', es: 'spanish'};
  const SYMBOLS = [['1234567890'], ['@#$%&-+()'], ['*"\':;!?'], [',', '_', '/', '.']];
  const SHIFT_SYMBOLS = [['~`|•√π÷×¶∆'], ['£¢€¥^°={}'], ['\\©®™℅[]'], [',', '<', '>', '.']];
  let ctx = null, field = null, root = null, sheet = 'alpha', shift = 0, lastShiftTap = 0, repeatTimer = 0, voice = null;
  const LISTEN = 4000;

  const eligible = el => el && el.closest?.('#screen') && (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && /^(text|search|email|url|password|tel|number)$/.test(el.type || 'text'))) && !el.readOnly && !el.disabled;
  const kind = el => el.type === 'email' ? 'email' : el.type === 'url' ? 'url' : el.type === 'password' ? 'password' : 'text';
  // The enter key: a text area takes a new line; a field's IME action (EditorInfo imeOptions) shows its icon.
  const action = el => el.tagName === 'TEXTAREA' ? 'return' : (el.enterKeyHint || (el.type === 'search' || /search/i.test(`${el.form?.dataset.form} ${el.className}`) ? 'search' : el.type === 'url' ? 'go' : 'done'));
  const capsField = el => el.tagName === 'TEXTAREA' || /sentences|words/.test(el.getAttribute('autocapitalize') || '');

  // One row of keys in px: [{x, w, ...key}] from widths in %p of the base width.
  function layout() {
    const rows = [], k = kind(field), set = LETTERS[SET[ctx?.lang] || 'qwerty'];
    const put = (row, x, w, key) => row.push({x: Math.round(x * W + HGAP / 2), w: Math.round(w * W - HGAP), ...key});
    const chars = (row, x0, str, w = .1) => { [...str].forEach((ch, i) => put(row, x0 + i * w, w, {t: 'char', ch})); return x0 + str.length * w; };
    if (sheet === 'alpha') {
      const r1 = [], r2 = [], r3 = [];
      chars(r1, 0, set[0]);
      chars(r2, set[1].length === 10 ? 0 : .05, set[1]);
      put(r3, 0, .15, {t: 'shift', inset: 'r'}); const x3 = chars(r3, .15, set[2]); put(r3, x3, 1 - x3, {t: 'delete', inset: 'l'});
      rows.push(r1, r2, r3);
    } else {
      const s = sheet === 'symbols' ? SYMBOLS : SHIFT_SYMBOLS, r1 = [], r2 = [], r3 = [];
      chars(r1, 0, s[0][0]);
      chars(r2, (10 - s[1][0].length) * .05, s[1][0]);
      put(r3, 0, .15, {t: 'more', inset: 'r'}); const x3 = chars(r3, .15, s[2][0]); put(r3, x3, 1 - x3, {t: 'delete', inset: 'l'});
      rows.push(r1, r2, r3);
    }
    const r4 = [];
    put(r4, 0, .15, {t: 'switch'});
    if (sheet === 'alpha') {
      put(r4, .15, .1, {t: 'char', ch: k === 'url' ? '/' : k === 'email' ? '@' : ','});
      put(r4, .25, .5, {t: 'space'});
      put(r4, .75, .1, {t: 'char', ch: '.'});
      put(r4, .85, .15, {t: 'enter'});
    } else {
      const s = sheet === 'symbols' ? SYMBOLS[3] : SHIFT_SYMBOLS[3];
      put(r4, .15, .1, {t: 'char', ch: s[0]}); put(r4, .25, .1, {t: 'char', ch: s[1]});
      put(r4, .35, .3, {t: 'space'});
      put(r4, .65, .1, {t: 'char', ch: s[2]}); put(r4, .75, .1, {t: 'char', ch: s[3]});
      put(r4, .85, .15, {t: 'enter'});
    }
    rows.push(r4);
    return rows;
  }

  const ICON = {shift: 'sym_keyboard_shift_lxx_light', locked: 'sym_keyboard_shift_locked_lxx_light', delete: 'sym_keyboard_delete_lxx_light',
    return: 'sym_keyboard_return_lxx_light', go: 'sym_keyboard_go_lxx_light', search: 'sym_keyboard_search_lxx_light', send: 'sym_keyboard_send_lxx_light', next: 'sym_keyboard_next_lxx_light', done: 'sym_keyboard_done_lxx_light', enter: 'sym_keyboard_return_lxx_light'};
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[ch]);
  function keyHtml(key, y) {
    const style = `left:${dp(key.x)};top:${dp(y)};width:${dp(key.w)};height:${dp(KEY)}`;
    let inner = '', cls = 'mmime-key';
    if (key.t === 'char') { const ch = sheet === 'alpha' && shift ? key.ch.toLocaleUpperCase(ctx?.locale()) : key.ch; inner = `<b>${esc(ch)}</b>`; key.out = ch; }
    else if (key.t === 'shift') { cls += ` fn np-ime-btn_keyboard_key_normal_${shift === 2 ? 'on' : 'off'}_lxx_light`; inner = `<i style="--ic:url('assets/ime-${shift ? ICON.locked : ICON.shift}.png')"${shift === 1 ? ' class="once"' : ''}></i>`; }
    else if (key.t === 'delete') { cls += ' fn'; inner = `<i style="--ic:url('assets/ime-${ICON.delete}.png')"></i>`; }
    else if (key.t === 'switch') { cls += ' fn'; inner = `<span>${sheet === 'alpha' ? '?123' : 'ABC'}</span>`; }
    else if (key.t === 'more') { cls += ' fn'; inner = `<span>${sheet === 'symbols' ? '=\\&lt;' : '?123'}</span>`; }
    else if (key.t === 'space') { cls += ' space'; inner = '<u class="np-ime-btn_keyboard_spacebar_normal_lxx_light"></u>'; }
    else if (key.t === 'enter') { const a = action(field); cls += a === 'return' ? ' fn' : ' act'; inner = `${a === 'return' ? '' : '<u></u>'}<i style="--ic:url('assets/ime-${ICON[a] || ICON.done}.png')"></i>`; }
    return `<button type="button" class="${cls}" style="${style}" data-t="${key.t}"${key.out ? ` data-ch="${esc(key.out)}"` : ''}>${inner}</button>`;
  }
  function currentWord() {
    if (!field || field.type === 'password') return '';
    const v = field.value.slice(0, field.selectionStart ?? field.value.length);
    return (v.match(/[\p{L}\p{N}'’-]+$/u) || [''])[0];
  }
  /* The voice key switches to Google voice typing (the Google app's voice IME, Velvet ime.xml): ime_port_height 240 dp on
     ime_background_holo, the 22 sp state ("Speak now", "Tap to speak" while paused, ime_no_match once nothing was
     heard: the simulator has no microphone) 20 dp from the top, the 90 dp mic with ime_btn_rec in the middle, the
     Google logo at the foot and ic_ime_keyboard back to Google Keyboard at its left. */
  function voicePanel() {
    const t = MM.text('google'), done = !voice.paused && Date.now() - voice.at >= LISTEN;
    const state = voice.paused ? t.t('ime_hint_tap_to_speak') : done ? t.t('ime_no_match') : t.t('speak_now');
    root.className = 'mmime voice';
    root.innerHTML = `<div class="mmime-vpanel np-vv-ime_background_holo"><div class="mmime-vstate">${esc(state).replace(/\s*\n\s*/g, '<br>')}</div>
      <button type="button" class="mmime-vmic${done || voice.paused ? ' idle' : ''}" data-t="vmic" aria-label="${esc(t.t(done || voice.paused ? 'ime_hint_tap_to_speak' : 'ime_hint_tap_to_pause'))}"><img src="assets/vv-ime_btn_rec.png" alt=""></button>
      <div class="mmime-vfoot"><button type="button" class="mmime-vkbd" data-t="vkbd" aria-label="${esc(t.t('ime_hint_keyboard_input'))}"><img src="assets/vv-ic_ime_keyboard.png" alt=""></button><img class="mmime-vlogo" src="assets/vv-ic_google_logo_ime.png" alt="Google"></div></div>`;
    ctx?.el.screen.style.setProperty('--ime-h', 'calc(240 * var(--dp))');
    if (!done && !voice.paused) { const at = voice.at; setTimeout(() => { if (voice && voice.at === at) draw(); }, LISTEN - (Date.now() - at) + 20); }
  }
  function draw() {
    if (!root) return;
    if (voice) { voicePanel(); return; }
    const strip = field.type !== 'password';
    const keys = layout().map((row, r) => row.map(k => keyHtml(k, TOP + r * ROW)).join('')).join('');
    const word = currentWord();
    root.className = `mmime${strip ? ' strip' : ''}`;
    root.innerHTML = `${strip ? `<div class="mmime-strip np-ime-keyboard_suggest_strip_lxx_light"><span></span><i class="div"></i><span class="mid">${esc(word)}</span><i class="div"></i><span></span><button type="button" class="mmime-voice" data-t="voice"><img src="assets/ime-sym_keyboard_voice_lxx_light.png" alt=""></button></div>` : ''}<div class="mmime-kb np-ime-keyboard_background_lxx_light">${keys}</div><div class="mmime-preview np-ime-keyboard_key_feedback_background_lxx_light" hidden></div>`;
    ctx?.el.screen.style.setProperty('--ime-h', dp(H + (strip ? STRIP * PX : 0)));
  }

  // Editing the field as InputConnection.commitText / deleteSurroundingText do, with an input event for the page.
  function insert(text) {
    const s = field.selectionStart ?? field.value.length, e = field.selectionEnd ?? s;
    try { field.setRangeText(text, s, e, 'end'); } catch { field.value += text; }
    field.dispatchEvent(new Event('input', {bubbles: true}));
  }
  function del() {
    let s = field.selectionStart ?? field.value.length, e = field.selectionEnd ?? s;
    if (s === e) { if (!s) return; const before = [...field.value.slice(0, s)]; s -= before.at(-1).length; }
    try { field.setRangeText('', s, e, 'end'); } catch { field.value = field.value.slice(0, -1); }
    field.dispatchEvent(new Event('input', {bubbles: true}));
  }
  // Auto-capitalisation at the start and after a sentence end (TextUtils.CAP_MODE_SENTENCES).
  function autoShift() {
    if (shift === 2 || sheet !== 'alpha') return;
    const v = field.value.slice(0, field.selectionStart ?? field.value.length);
    shift = capsField(field) && (/^\s*$/.test(v) || /[.!?]\s+$/.test(v)) ? 1 : 0;
  }
  function press(t, el) {
    if (t === 'char') {
      insert(el.dataset.ch);
      if (sheet === 'alpha' && shift === 1) shift = 0;
      if (sheet !== 'alpha' && el.dataset.ch === "'") sheet = 'alpha';
      autoShift();
    } else if (t === 'space') {
      insert(' ');
      // Symbols go back to letters after a space (KeyboardState: SWITCH_BACK_TO_ALPHABET after space).
      if (sheet !== 'alpha') sheet = 'alpha';
      autoShift();
    } else if (t === 'delete') { del(); autoShift(); }
    else if (t === 'shift') {
      const now = Date.now();
      shift = shift === 0 ? (now - lastShiftTap < 300 ? 2 : 1) : shift === 1 && now - lastShiftTap < 300 ? 2 : 0;
      lastShiftTap = now;
    } else if (t === 'switch') { sheet = sheet === 'alpha' ? 'symbols' : 'alpha'; if (sheet === 'alpha') autoShift(); }
    else if (t === 'more') sheet = sheet === 'symbols' ? 'shifted' : 'symbols';
    else if (t === 'enter') {
      const a = action(field);
      if (a === 'return') { insert('\n'); autoShift(); }
      else {
        const f = field, ev = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true});
        const go = f.dispatchEvent(ev);
        if (go && f.form) f.form.requestSubmit ? f.form.requestSubmit() : f.form.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));
        if (a === 'done' || a === 'go' || a === 'search' || a === 'send') { hide(); f.blur?.(); return; }
      }
    } else if (t === 'voice') voice = {at: Date.now(), paused: false};
    else if (t === 'vmic') voice = voice.paused || Date.now() - voice.at >= LISTEN ? {at: Date.now(), paused: false} : {...voice, paused: true};
    else if (t === 'vkbd') { voice = null; autoShift(); }
    if (root && field) draw();
  }

  function show(el) {
    if (!ctx) return;
    field = el;
    // No keyboard of the phone's browser on top of this one.
    if (!el.hasAttribute('inputmode')) { el.setAttribute('inputmode', 'none'); el.dataset.imeSet = '1'; }
    if (!root) {
      root = document.createElement('div');
      ctx.el.screen.append(root);
      root.addEventListener('pointerdown', onDown);
      root.addEventListener('pointerup', onUp);
      root.addEventListener('pointercancel', onCancel);
      root.addEventListener('pointerleave', onCancel);
      root.addEventListener('mousedown', e => e.preventDefault());
    }
    sheet = 'alpha'; shift = 0; voice = null; autoShift();
    draw();
    ctx.el.screen.classList.add('ime');
    const back = ctx.el.nav.querySelector('[data-key="back"] img');
    if (back) back.src = back.src.replace(/ic_sysbar_back(_ime)?\.png/, 'ic_sysbar_back_ime.png');
    requestAnimationFrame(() => el.scrollIntoView?.({block: 'nearest'}));
  }
  function hide() {
    if (!root) return;
    root.remove(); root = null; voice = null;
    if (field?.dataset.imeSet) { field.removeAttribute('inputmode'); delete field.dataset.imeSet; }
    field = null;
    ctx?.el.screen.classList.remove('ime');
    const back = ctx?.el.nav.querySelector('[data-key="back"] img');
    if (back) back.src = back.src.replace('ic_sysbar_back_ime.png', 'ic_sysbar_back.png');
  }

  let down = null;
  function onDown(e) {
    e.preventDefault();
    const el = e.target.closest('[data-t]');
    if (!el || !field) return;
    down = el; el.classList.add('down');
    const t = el.dataset.t;
    if (t === 'char') {
      const p = root.querySelector('.mmime-preview'), r = el.getBoundingClientRect(), rr = root.getBoundingClientRect(), k = rr.width / W;
      p.textContent = el.dataset.ch; p.hidden = false;
      Object.assign(p.style, {left: `${r.left - rr.left}px`, width: `${r.width}px`, top: `${r.top - rr.top - (122 - 50) * PX * k}px`, height: `${122 * PX * k}px`, fontSize: `${.82 * KEY * k}px`});
    }
    if (t === 'delete') {
      press('delete', el);
      down = root?.querySelector('[data-t="delete"]'); down?.classList.add('down');
      repeatTimer = setTimeout(function rep() { if (!field) return; del(); draw(); down = root?.querySelector('[data-t="delete"]'); down?.classList.add('down'); repeatTimer = setTimeout(rep, 50); }, 400);
    }
  }
  function onUp(e) {
    const el = down; down = null;
    clearTimeout(repeatTimer);
    root?.querySelector('.mmime-preview')?.setAttribute('hidden', '');
    if (!el) return;
    el.classList.remove('down');
    if (el.dataset.t !== 'delete') press(el.dataset.t, el);
  }
  function onCancel() { if (down) { down.classList.remove('down'); down = null; } clearTimeout(repeatTimer); root?.querySelector('.mmime-preview')?.setAttribute('hidden', ''); }

  document.addEventListener('focusin', e => { if (eligible(e.target)) show(e.target); });
  document.addEventListener('focusout', () => setTimeout(() => { if (root && !eligible(document.activeElement)) hide(); }));
  // A computer keyboard's typing keeps the strip and the shift state in step.
  document.addEventListener('input', e => { if (root && e.target === field && e.isTrusted) { autoShift(); draw(); } });

  MM.ime = {hide, open: () => !!root, back() { if (!root) return false; const f = field; hide(); f?.blur?.(); return true; }};
  MM.register('ime', {
    app: false,
    // The module keeps the core's context to open screens and size the screen.
    tick(c) {
      ctx = c;
      if (root && field && !field.isConnected) hide();
      // A field that took the focus before the first tick (or while the page was in the background).
      else if (!root && eligible(document.activeElement)) show(document.activeElement);
    },
    render: () => ''
  });
})();
