/* Android 7.1.2 Calculator (CalculatorGooglePrebuilt 7.1.1, the AOSP ExactCalculator of android-7.1.2_r1), the app
   'calculator'. The logic is 6.0.1's (its calculator: the tokens, the evaluation, the pads); N2G48C's APK decides:
   - activity_calculator_port: display_two_line (white, elevation 4 dp: the Toolbar with the deg / rad mode, 16 sp
     sans-serif-medium caps, and the overflow; the formula sans-serif-light #8a000000 from 74 sp down to 42 sp in 8 sp
     steps, 16 dp above, 28 dp below; the result 42 sp #6c000000, 16 dp above, 42 dp below), then CalculatorPadViewPager:
     pad_numeric (#434343, 36 sp light white) beside pad_operator_one_col (#636363: del / clr 20 sp caps, ÷ × − + 27 sp)
     and pad_advanced_3x5 (#1de9b6, 23 sp at #99000000, inv / deg 20 sp caps: inv deg %, sin cos tan, ln log !, π e ^,
     ( ) √; inv shows sin⁻¹ cos⁻¹ tan⁻¹ eˣ 10ˣ x²), its edge showing at the right (pad_page_margin 24 dp).
   - Theme: colorPrimary and the status bar in calculator_accent_color #0097a7; errors in calculator_error_color
     #c2185b (Bad expression, Can't divide by 0, Not a number, Infinite?).
   - CalculatorResult: as many digits as fit the width, the exponent ("E…") in display_result_exponent_text_color
     #40000000; the result previews as soon as the expression has an operator; = moves it into the formula (RESULT); in
     RESULT or ERROR del becomes clr, which clears with a circular reveal in the accent.
   - The overflow (activity_calculator + activity_calculator_google): Answer with leading digits (in RESULT: the full
     result and "(exact)" / "(±1 in last digit)"), Answer as fraction (in RESULT with a rational result:
     BoundedRational.toNiceString, "3/4"), Open source licenses (the APK's assets/licenses.html), Send feedback, Help.
   - The decimal separator and the minus sign are KeyMaps': the locale's separator, U+2212. */
(() => {
  'use strict';
  const T = () => NG.text('calculator');
  const A = name => `assets/${name}`;
  const st = c => c.ui.calc || (c.ui.calc = {tokens: [], state: 'input', inv: false, deg: false, adv: false});
  const FN = {sin: 'fun_sin', cos: 'fun_cos', tan: 'fun_tan', asin: 'fun_arcsin', acos: 'fun_arccos', atan: 'fun_arctan', ln: 'fun_ln', log: 'fun_log', exp: 'fun_exp', pow10: 'fun_10pow'};
  const sep = c => { try { return new Intl.NumberFormat(c.locale()).formatToParts(1.5).find(p => p.type === 'decimal').value; } catch { return '.'; } };
  function text(c, tokens) {
    const t = T();
    return tokens.map(k => k === '.' ? sep(c) : k === 'exp' ? `${t.t('exponential')}(` : FN[k] ? `${t.t(FN[k])}(` : k === 'sqrt' ? t.t('op_sqrt') : k).join('');
  }

  // CalculatorExpr's evaluation over the tokens (the 6.0.1 parser); rational says whether the value stayed exact.
  function evaluate(tokens, deg) {
    let i = 0, rational = true;
    const peek = () => tokens[i], next = () => tokens[i++];
    const fail = code => { throw new Error(code); };
    const num = () => { let s = ''; while (/^[0-9.]$/.test(peek() || '')) s += next(); if ((s.match(/\./g) || []).length > 1 || s === '.') fail('syntax'); return parseFloat(s); };
    const startsPrimary = k => k != null && (/^[0-9.]$/.test(k) || k === '(' || k === 'π' || k === 'e' || k === 'sqrt' || FN[k]);
    const rad = x => deg ? x * Math.PI / 180 : x, unrad = x => deg ? x * 180 / Math.PI : x;
    const fact = n => { if (n < 0 || !Number.isInteger(n)) fail('nan'); let r = 1; for (let k = 2; k <= n; k++) r *= k; return r; };
    function primary() {
      const k = peek();
      if (k == null) fail('syntax');
      if (/^[0-9.]$/.test(k)) return num();
      if (k === 'π') { next(); rational = false; return Math.PI; }
      if (k === 'e') { next(); rational = false; return Math.E; }
      if (k === '(') { next(); const v = expr(); if (peek() === ')') next(); return v; }
      if (k === 'sqrt') { next(); const v = unary(); if (v < 0) fail('nan'); const r = Math.sqrt(v); if (!Number.isInteger(r)) rational = false; return r; }
      if (FN[k]) {
        next(); const v = expr(); if (peek() === ')') next(); if (k !== 'pow10') rational = false;
        switch (k) {
          case 'sin': return Math.sin(rad(v)); case 'cos': return Math.cos(rad(v));
          case 'tan': { const r = Math.tan(rad(v)); if (deg && Math.abs(((v % 180) + 180) % 180 - 90) < 1e-12) fail('nan'); return r; }
          case 'asin': return unrad(Math.asin(v)); case 'acos': return unrad(Math.acos(v)); case 'atan': return unrad(Math.atan(v));
          case 'ln': if (v <= 0) fail('nan'); return Math.log(v);
          case 'log': if (v <= 0) fail('nan'); return Math.log10(v);
          case 'exp': return Math.exp(v);
        }
      }
      fail('syntax');
    }
    function postfix() {
      let v = primary();
      for (;;) {
        const k = peek();
        if (k === '!') { next(); v = fact(v); } else if (k === '%') { next(); v /= 100; } else if (k === '²') { next(); v *= v; } else break;
      }
      return v;
    }
    function power() { const b = postfix(); if (peek() === '^') { next(); const e = unary(); if (!Number.isInteger(e)) rational = false; return Math.pow(b, e); } return b; }
    function unary() { if (peek() === '−') { next(); return -unary(); } if (peek() === '+') { next(); return unary(); } return power(); }
    function term() {
      let v = unary();
      for (;;) {
        const k = peek();
        if (k === '×') { next(); v *= unary(); }
        else if (k === '÷') { next(); const d = unary(); if (d === 0) fail('zero'); v /= d; }
        else if (startsPrimary(k)) v *= unary();
        else break;
      }
      return v;
    }
    function expr() {
      let v = term();
      for (;;) { const k = peek(); if (k === '+') { next(); v += term(); } else if (k === '−') { next(); v -= term(); } else break; }
      return v;
    }
    const v = expr();
    if (i < tokens.length) fail('syntax');
    if (Number.isNaN(v)) fail('nan');
    if (!Number.isFinite(v)) fail('overflow');
    return {v, rational};
  }
  // CalculatorResult: the digits that fit (here 15 significant ones in the 42 sp display), the exponent kept apart.
  function format(c, v, digits = 15) {
    const a = Math.abs(v);
    let mant, exp = '';
    if (a !== 0 && (a >= 1e15 || a < 1e-6)) {
      const [m, e] = v.toExponential(digits - 5).split('e');
      mant = m.includes('.') ? m.replace(/0+$/, '').replace(/\.$/, '') : m; exp = `E${+e}`;
    } else {
      mant = Number(v.toPrecision(digits)).toString();
      if (/e/.test(mant)) mant = v.toFixed(Math.max(0, digits - String(Math.trunc(a)).length));
      if (mant.includes('.')) mant = mant.replace(/0+$/, '').replace(/\.$/, '');
    }
    const fix = s => s.replace(/-/g, '−').replace('.', sep(c));
    return {mant: fix(mant), exp: fix(exp)};
  }
  // BoundedRational.toNiceString for a result kept exact: the reduced fraction (a continued fraction of the double).
  function fraction(v) {
    if (Number.isInteger(v)) return null;
    let h0 = 1, h1 = 0, k0 = 0, k1 = 1, x = Math.abs(v);
    for (let n = 0; n < 40; n++) {
      const a = Math.floor(x); [h0, h1] = [a * h0 + h1, h0]; [k0, k1] = [a * k0 + k1, k0];
      if (Math.abs(h0 / k0 - Math.abs(v)) < 1e-12 * Math.max(1, Math.abs(v)) || k0 > 1e9) break;
      x = 1 / (x - a); if (!Number.isFinite(x)) break;
    }
    return k0 > 1e9 ? null : `${v < 0 ? '−' : ''}${h0}/${k0}`;
  }
  const hasOperator = tokens => tokens.some(k => !/^[0-9.]$/.test(k));
  function preview(c) {
    const s = st(c);
    if (s.state !== 'input' || !hasOperator(s.tokens)) return null;
    try { return format(c, evaluate(s.tokens, s.deg).v); } catch { return null; }
  }

  function render(c) {
    const t = T(), s = st(c), inv = s.inv;
    const formula = text(c, s.tokens), size = Math.max(42, 74 - 8 * Math.max(0, Math.ceil((formula.length - 9) / 2)));
    const res = s.state === 'error' ? {mant: t.t(`error_${s.error}`), exp: ''} : preview(c);
    const btn = (action, value, label, cls = '') => `<button type="button" class="ngca-b${cls}" data-action="${action}" data-v="${c.safe(value)}">${c.safe(label)}</button>`;
    const digit = d => btn('ngca-in', d, t.t(`digit_${d}`));
    const adv = [
      [btn('ngca-inv', '', t.t('inv'), ` text${inv ? ' on' : ''}`), btn('ngca-mode', '', t.t(s.deg ? 'mode_rad' : 'mode_deg'), ' text'), btn('ngca-in', '%', t.t('op_pct'))],
      inv ? [btn('ngca-in', 'asin', t.t('fun_arcsin'), ' medium'), btn('ngca-in', 'acos', t.t('fun_arccos'), ' medium'), btn('ngca-in', 'atan', t.t('fun_arctan'), ' medium')] : [btn('ngca-in', 'sin', t.t('fun_sin')), btn('ngca-in', 'cos', t.t('fun_cos')), btn('ngca-in', 'tan', t.t('fun_tan'))],
      inv ? [btn('ngca-in', 'exp', t.t('fun_exp'), ' medium'), btn('ngca-in', 'pow10', t.t('fun_10pow'), ' medium'), btn('ngca-in', '!', t.t('op_fact'))] : [btn('ngca-in', 'ln', t.t('fun_ln')), btn('ngca-in', 'log', t.t('fun_log')), btn('ngca-in', '!', t.t('op_fact'))],
      [btn('ngca-in', 'π', t.t('const_pi')), btn('ngca-in', 'e', t.t('const_e')), btn('ngca-in', '^', t.t('op_pow'))],
      [btn('ngca-in', '(', t.t('lparen')), btn('ngca-in', ')', t.t('rparen')), inv ? btn('ngca-in', '²', t.t('op_sqr'), ' medium') : btn('ngca-in', 'sqrt', t.t('op_sqrt'))]];
    const clear = s.state !== 'input';
    return `<div class="ngca">
      <div class="ngca-display"><div class="ngca-toolbar"><span class="ngca-mode">${c.safe(t.t(s.deg ? 'mode_deg' : 'mode_rad'))}</span>${NG.menu.button(c, '', true)}</div>
        <div class="ngca-formula" style="font-size:calc(${size} * var(--dp))">${c.safe(formula)}</div>
        <div class="ngca-result${s.state === 'error' ? ' error' : ''}">${res ? `${c.safe(res.mant)}${res.exp ? `<span class="ngca-exp">${c.safe(res.exp)}</span>` : ''}` : ''}</div><i class="ngca-reveal"></i></div>
      <div class="ngca-pager${s.adv ? ' adv' : ''}">
        <div class="ngca-numeric">${['7', '8', '9', '4', '5', '6', '1', '2', '3'].map(digit).join('')}${btn('ngca-in', '.', sep(c))}${digit('0')}${btn('ngca-eq', '', t.t('eq'))}</div>
        <div class="ngca-operator">${clear ? btn('ngca-clr', '', t.t('clr'), ' text') : btn('ngca-del', '', t.t('del'), ' text')}${btn('ngca-in', '÷', t.t('op_div'))}${btn('ngca-in', '×', t.t('op_mul'))}${btn('ngca-in', '−', t.t('op_sub'))}${btn('ngca-in', '+', t.t('op_add'))}</div>
        <div class="ngca-advanced" data-action="ngca-open">${adv.flat().join('')}</div>
      </div></div>`;
  }

  function input(c, k) {
    const s = st(c);
    const operator = /^[+−×÷^!%²]$/.test(k);
    if (s.state === 'result' && !operator) s.tokens = [];
    if (s.state !== 'input') s.state = 'input';
    const last = s.tokens.at(-1);
    if (/^[+×÷^]$/.test(k) && /^[+−×÷^]$/.test(last || '')) s.tokens.pop();
    if (/^[+×÷^!%²]$/.test(k) && !s.tokens.length) return;
    if (k === 'pow10') { s.tokens.push('1', '0', '^'); return; }
    s.tokens.push(k);
  }
  function equals(c) {
    const s = st(c);
    if (!s.tokens.length || s.state !== 'input' || !hasOperator(s.tokens)) return;
    try {
      const {v, rational} = evaluate(s.tokens, s.deg), f = format(c, v);
      s.value = v; s.rational = rational;
      s.tokens = [...f.mant.replace(/−/g, '-').replace(sep(c), '.')].map(ch => ch === '-' ? '−' : ch);
      if (f.exp) s.tokens.push('×', '1', '0', '^', ...[...f.exp.slice(1).replace(/−/g, '-')].map(ch => ch === '-' ? '−' : ch));
      s.state = 'result';
    } catch (e) { s.state = 'error'; s.error = e.message === 'zero' ? 'zero_divide' : e.message === 'nan' ? 'nan' : e.message === 'overflow' ? 'overflow' : 'syntax'; reveal(c, '#c2185b'); }
  }
  // The clear / error circular reveal over the display, from the button's side.
  function reveal(c, color) {
    requestAnimationFrame(() => {
      const el = c.el.viewport.querySelector('.ngca-reveal'); if (!el?.animate) return;
      el.style.background = color;
      el.animate([{clipPath: 'circle(0% at 90% 100%)', opacity: 1}, {clipPath: 'circle(150% at 90% 100%)', opacity: 1, offset: .7}, {clipPath: 'circle(150% at 90% 100%)', opacity: 0}], {duration: 500, easing: 'cubic-bezier(.4,0,.2,1)'});
    });
  }
  function key(c, e) {
    const map = {'+': '+', '-': '−', '*': '×', '/': '÷', '^': '^', '!': '!', '%': '%', '(': '(', ')': ')', '.': '.', ',': '.'};
    if (/^[0-9]$/.test(e.key) || map[e.key]) { input(c, /^[0-9]$/.test(e.key) ? e.key : map[e.key]); c.render(); return true; }
    if (e.key === 'Enter' || e.key === '=') { equals(c); c.render(); return true; }
    if (e.key === 'Backspace') { const s = st(c); if (s.state === 'input') s.tokens.pop(); else { s.tokens = []; s.state = 'input'; } c.render(); return true; }
    return false;
  }
  let keyHandler = null;
  const message = (c, text) => c.dialog({message: text, buttons: [{label: T().t('dismiss')}]});

  NG.register('calculator', {
    statusColor: () => '#0097a7',
    render,
    mount(c, root) {
      if (keyHandler) document.removeEventListener('keydown', keyHandler);
      keyHandler = e => { if (c.ui.view === 'calculator' && !c.ui.overlay && !e.target.closest?.('input,textarea')) { if (key(c, e)) e.preventDefault(); } };
      document.addEventListener('keydown', keyHandler);
      // CalculatorPadViewPager: a swipe opens or closes the advanced pad.
      const pager = root.querySelector('.ngca-pager'); let x0 = null;
      pager?.addEventListener('pointerdown', e => { x0 = e.clientX; });
      pager?.addEventListener('pointerup', e => {
        if (x0 == null) return; const dx = e.clientX - x0; x0 = null;
        if (Math.abs(dx) > 40) { st(c).adv = dx < 0; pager.classList.toggle('adv', st(c).adv); }
      });
    },
    back(c) { if (st(c).adv) { st(c).adv = false; c.render(); return true; } return false; },
    action(name, el, event, c) {
      const s = st(c), t = T();
      if (name === 'ngca-open') { if (!s.adv) { s.adv = true; c.render(); } return true; }
      if (name === 'ngca-in') { input(c, el.dataset.v); c.render(); return true; }
      if (name === 'ngca-eq') { equals(c); c.render(); return true; }
      if (name === 'ngca-del') { s.tokens.pop(); c.render(); return true; }
      if (name === 'ngca-clr') { s.tokens = []; s.state = 'input'; reveal(c, '#0097a7'); c.render(); return true; }
      if (name === 'ngca-inv') { s.inv = !s.inv; c.render(); return true; }
      if (name === 'ngca-mode') { s.deg = !s.deg; c.render(); return true; }
      if (name === 'ng-menu') {
        const result = s.state === 'result', frac = result && s.rational ? fraction(s.value) : null, items = [];
        if (result) items.push({label: t.t('menu_leading'), action: c => { const f = format(c, s.value, 17); message(c, `${f.mant}${f.exp} ${t.t(s.rational ? 'exact' : 'approximate')}`); }});
        if (frac) items.push({label: t.t('menu_fraction'), action: c => message(c, frac)});
        items.push({label: t.t('menu_licenses'), action: c => c.open('calculator-licenses')}, {label: t.t('menu_feedback'), action: c => c.open('feedback', 'calculator')}, {label: t.t('menu_help'), action: c => c.open('help', 'calculator')});
        c.menu(items, el);
        return true;
      }
      return false;
    }
  });
  // Licenses (Theme.Licenses over Theme: the action bar and the status bar in the accent): a WebView of the APK's
  // assets/licenses.html.
  NG.register('calculator-licenses', {
    app: false,
    statusColor: () => '#0097a7',
    render: c => `<div class="ngca-lic"><div class="ngca-licbar"><button type="button" data-action="ngca-licup" aria-label=""><i style="-webkit-mask-image:url('${A('fw-ic_ab_back_material.svg')}');mask-image:url('${A('fw-ic_ab_back_material.svg')}')"></i></button><span>${c.safe(T().t('menu_licenses'))}</span></div><iframe src="${A('calc-licenses.html')}" title=""></iframe></div>`,
    action(name, el, event, c) { if (name === 'ngca-licup') { c.back(); return true; } return false; }
  });
})();
