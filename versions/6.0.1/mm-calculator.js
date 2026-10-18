/* Android 6.0.1 Calculator (CalculatorGoogle 5.2, the AOSP 6.0 Calculator; app/CalculatorGoogle in MTC20K), the app
   'calculator'.
   - activity_calculator_port.xml: display.xml (white, elevation 4 dp; the actionBarSize Toolbar with the mode
     indicator, 16 sp medium caps, and the overflow menu; CalculatorText's formula, sans-serif-light #8a000000 from 74 sp
     down to 42 sp in 8 sp steps as it fills (sw400dp-port: 16 dp above, 28 dp below, 16 dp at the sides); the result
     42 sp #6c000000, 16 dp above and 42 dp below), then CalculatorPadViewPager: pad_numeric (#434343, weight 264, 7 8 9 /
     4 5 6 / 1 2 3 / . 0 =, 36 sp light white) beside pad_operator_one_col (#636363, weight 96: del / clr, ÷ × − +,
     27 sp, del 20 sp caps) and the second page pad_advanced (#1de9b6, elevation 4 dp, 23 sp at #99000000: inv deg %,
     sin cos tan, ln log !, π e ^, ( ) √; inv shows sin⁻¹ cos⁻¹ tan⁻¹ eˣ 10ˣ x²), its edge showing at the right
     (pad_page_margin −24 dp) until it is swiped or tapped open.
   - The CalculatorTheme: the status bar #00bcd4, the navigation bar black.
   - Calculator / CalculatorExpr: implicit multiplication, right-associative ^, postfix ! % ², functions opening their
     parenthesis, unclosed parentheses closed for evaluation; the result previews as soon as the expression has an
     operator; = moves it into the formula (RESULT), an error shows in calculator_error_color #f40056 (Bad expression,
     Can't divide by 0, Not a number); in RESULT or ERROR del becomes clr, which clears with a circular reveal in
     calculator_accent_color (#00bcd4). The decimal separator is the locale's (KeyMaps); a physical keyboard types too.
   - The overflow menu: Send feedback and Help (Google's), Open source licenses. */
(() => {
  'use strict';
  const T = () => MM.text('calculator');
  const st = c => c.ui.calc || (c.ui.calc = {tokens: [], state: 'input', inv: false, deg: false, adv: false});

  // Tokens: digits and '.', '+ − × ÷ ^', '! % ²', '( )', 'π e', functions 'sin cos tan asin acos atan ln log exp pow10 sqrt'.
  const FN = {sin: 'fun_sin', cos: 'fun_cos', tan: 'fun_tan', asin: 'fun_arcsin', acos: 'fun_arccos', atan: 'fun_arctan', ln: 'fun_ln', log: 'fun_log', exp: 'fun_exp', pow10: 'fun_10pow'};
  const sep = c => { try { return new Intl.NumberFormat(c.locale()).formatToParts(1.5).find(p => p.type === 'decimal').value; } catch { return '.'; } };
  function text(c, tokens) {
    const t = T();
    // A function shows its label and the parenthesis it opens; eˣ is entered as exp(, 10ˣ as 10^.
    return tokens.map(k => k === '.' ? sep(c) : k === 'exp' ? 'exp(' : FN[k] ? `${t.t(FN[k])}(` : k === 'sqrt' ? t.t('op_sqrt') : k).join('');
  }

  // CalculatorExpr's evaluation over the tokens.
  function evaluate(tokens, deg) {
    let i = 0;
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
      if (k === 'π') { next(); return Math.PI; }
      if (k === 'e') { next(); return Math.E; }
      if (k === '(') { next(); const v = expr(); if (peek() === ')') next(); return v; }
      if (k === 'sqrt') { next(); const v = unary(); if (v < 0) fail('nan'); return Math.sqrt(v); }
      if (FN[k]) {
        next(); const v = expr(); if (peek() === ')') next();
        switch (k) {
          case 'sin': return Math.sin(rad(v)); case 'cos': return Math.cos(rad(v));
          case 'tan': { const r = Math.tan(rad(v)); if (deg && Math.abs(((v % 180) + 180) % 180 - 90) < 1e-12) fail('nan'); return r; }
          case 'asin': return unrad(Math.asin(v)); case 'acos': return unrad(Math.acos(v)); case 'atan': return unrad(Math.atan(v));
          case 'ln': if (v <= 0) fail('nan'); return Math.log(v);
          case 'log': if (v <= 0) fail('nan'); return Math.log10(v);
          case 'exp': return Math.exp(v); case 'pow10': return Math.pow(10, v);
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
    function power() { const b = postfix(); if (peek() === '^') { next(); return Math.pow(b, unary()); } return b; }
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
    return v;
  }
  // The result as CalculatorResult shows it: as many digits as fit, an E exponent for very large or small values.
  function format(c, v, digits = 15) {
    let s;
    const a = Math.abs(v);
    if (a !== 0 && (a >= 1e15 || a < 1e-6)) {
      s = v.toExponential(digits - 6).replace(/\.?0+e/, 'e').replace('e+', 'E').replace('e-', 'E-');
    } else {
      s = Number(v.toPrecision(digits)).toString();
      if (/e/.test(s)) s = v.toFixed(Math.max(0, digits - String(Math.trunc(a)).length));
      if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
    }
    return s.replace('-', '−').replace('.', sep(c));
  }
  const hasOperator = tokens => tokens.some(k => !/^[0-9.]$/.test(k));
  function preview(c) {
    const s = st(c);
    if (s.state !== 'input' || !hasOperator(s.tokens)) return '';
    try { return format(c, evaluate(s.tokens, s.deg)); } catch { return ''; }
  }

  function render(c) {
    const t = T(), s = st(c), inv = s.inv;
    const formula = text(c, s.tokens), size = Math.max(42, 74 - 8 * Math.max(0, Math.ceil((formula.length - 9) / 2)));
    const result = s.state === 'error' ? t.t(`error_${s.error}`) : preview(c);
    const btn = (action, value, label, cls = '') => `<button type="button" class="mmca-b${cls}" data-action="${action}" data-v="${c.safe(value)}">${c.safe(label)}</button>`;
    const digit = d => btn('mmca-in', d, d);
    const adv = [
      [btn('mmca-inv', '', t.t('inv'), ` text${inv ? ' on' : ''}`), btn('mmca-mode', '', t.t(s.deg ? 'mode_rad' : 'mode_deg'), ' text'), btn('mmca-in', '%', t.t('op_pct'))],
      inv ? [btn('mmca-in', 'asin', t.t('fun_arcsin')), btn('mmca-in', 'acos', t.t('fun_arccos')), btn('mmca-in', 'atan', t.t('fun_arctan'))] : [btn('mmca-in', 'sin', t.t('fun_sin')), btn('mmca-in', 'cos', t.t('fun_cos')), btn('mmca-in', 'tan', t.t('fun_tan'))],
      inv ? [btn('mmca-in', 'exp', t.t('fun_exp')), btn('mmca-in', 'pow10', t.t('fun_10pow')), btn('mmca-in', '!', t.t('op_fact'))] : [btn('mmca-in', 'ln', t.t('fun_ln')), btn('mmca-in', 'log', t.t('fun_log')), btn('mmca-in', '!', t.t('op_fact'))],
      [btn('mmca-in', 'π', t.t('const_pi')), btn('mmca-in', 'e', t.t('const_e')), btn('mmca-in', '^', t.t('op_pow'))],
      [btn('mmca-in', '(', '('), btn('mmca-in', ')', ')'), inv ? btn('mmca-in', '²', t.t('op_sqr')) : btn('mmca-in', 'sqrt', t.t('op_sqrt'))]];
    const clear = s.state !== 'input';
    return `<div class="mmca">
      <div class="mmca-display"><div class="mmca-toolbar"><span class="mmca-mode">${s.deg ? c.safe(t.t('mode_deg')) : ''}</span>${MM.menu.button(c, 'dark')}</div>
        <div class="mmca-formula" style="font-size:calc(${size} * var(--dp))">${c.safe(formula)}</div>
        <div class="mmca-result${s.state === 'error' ? ' error' : ''}">${c.safe(result)}</div><i class="mmca-reveal"></i></div>
      <div class="mmca-pager${s.adv ? ' adv' : ''}">
        <div class="mmca-numeric">${['7', '8', '9', '4', '5', '6', '1', '2', '3'].map(digit).join('')}${btn('mmca-in', '.', sep(c))}${digit('0')}${btn('mmca-eq', '', t.t('eq'))}</div>
        <div class="mmca-operator">${clear ? btn('mmca-clr', '', t.t('clr'), ' text') : btn('mmca-del', '', t.t('del'), ' text')}${btn('mmca-in', '÷', t.t('op_div'))}${btn('mmca-in', '×', t.t('op_mul'))}${btn('mmca-in', '−', t.t('op_sub'))}${btn('mmca-in', '+', t.t('op_add'))}</div>
        <div class="mmca-advanced" data-action="mmca-open">${adv.flat().join('')}</div>
      </div></div>`;
  }

  function input(c, k) {
    const s = st(c);
    const operator = /^[+−×÷^!%²]$/.test(k);
    if (s.state === 'result' && !operator) s.tokens = [];
    if (s.state !== 'input') s.state = 'input';
    // A function or √ after nothing or an operator; an operator replaces a trailing one (except − for a sign).
    const last = s.tokens.at(-1);
    if (/^[+×÷^]$/.test(k) && /^[+−×÷^]$/.test(last || '')) s.tokens.pop();
    if (/^[+×÷^!%²]$/.test(k) && !s.tokens.length) return;
    if (k === 'pow10') { s.tokens.push('1', '0', '^'); return; }
    s.tokens.push(k);
  }
  function equals(c) {
    const s = st(c);
    if (!s.tokens.length || s.state !== 'input') return;
    try {
      const v = evaluate(s.tokens, s.deg);
      s.tokens = [...format(c, v).replace('−', '-').replace(sep(c), '.')].map(ch => ch === '-' ? '−' : ch === 'E' ? 'E' : ch);
      // An exponent result keeps its "E" as a multiplication by 10^ for further work.
      const idx = s.tokens.indexOf('E');
      if (idx >= 0) s.tokens.splice(idx, 1, '×', '1', '0', '^');
      s.state = 'result';
    } catch (e) { s.state = 'error'; s.error = e.message === 'zero' ? 'zero_divide' : e.message === 'nan' ? 'nan' : e.message === 'overflow' ? 'overflow' : 'syntax'; reveal(c, '#f40056'); }
  }
  // The clear / error circular reveal over the display, from the bottom right.
  function reveal(c, color) {
    requestAnimationFrame(() => {
      const el = c.el.viewport.querySelector('.mmca-reveal'); if (!el?.animate) return;
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

  MM.register('calculator', {
    statusColor: () => '#00bcd4',
    render,
    mount(c, root) {
      if (keyHandler) document.removeEventListener('keydown', keyHandler);
      keyHandler = e => { if (c.ui.view === 'calculator' && !c.ui.overlay && !e.target.closest?.('input,textarea')) { if (key(c, e)) e.preventDefault(); } };
      document.addEventListener('keydown', keyHandler);
      // Swiping the pager opens or closes the advanced pad.
      const pager = root.querySelector('.mmca-pager'); let x0 = null;
      pager?.addEventListener('pointerdown', e => { x0 = e.clientX; });
      pager?.addEventListener('pointerup', e => {
        if (x0 == null) return; const dx = e.clientX - x0; x0 = null;
        if (Math.abs(dx) > 40) { st(c).adv = dx < 0; pager.classList.toggle('adv', st(c).adv); }
      });
    },
    back(c) { if (st(c).adv) { st(c).adv = false; c.render(); return true; } return false; },
    action(name, el, event, c) {
      const s = st(c), t = T();
      if (name === 'mmca-open') { if (!s.adv) { s.adv = true; c.render(); } return true; }
      if (name === 'mmca-in') { input(c, el.dataset.v); c.render(); return true; }
      if (name === 'mmca-eq') { equals(c); c.render(); return true; }
      if (name === 'mmca-del') { s.tokens.pop(); c.render(); return true; }
      if (name === 'mmca-clr') { s.tokens = []; s.state = 'input'; reveal(c, '#00bcd4'); c.render(); return true; }
      if (name === 'mmca-inv') { s.inv = !s.inv; c.render(); return true; }
      if (name === 'mmca-mode') { s.deg = !s.deg; c.render(); return true; }
      if (name === 'mm-menu') {
        c.menu([{label: t.t('menu_feedback'), action: c => c.open('feedback', 'calculator')}, {label: t.t('menu_help'), action: c => c.open('help', 'calculator')}, {label: t.t('menu_licenses'), action: c => c.open('calculator-licenses')}]);
        return true;
      }
      return false;
    }
  });
  // com.android.calculator2.Licenses (Theme.Licenses: Theme.Material.Light.DarkActionBar with colorPrimary and the status
  // bar in calculator_accent_color #00bcd4, the label menu_licenses): a WebView of the APK's assets/licenses.html.
  MM.register('calculator-licenses', {
    app: false,
    statusColor: () => '#00bcd4',
    render: c => `<div class="mmca-lic"><div class="mmca-licbar"><button type="button" data-action="mmca-licup"><img src="assets/fw-ic_ab_back_material.svg" alt=""></button><span>${c.safe(T().t('menu_licenses'))}</span></div><iframe src="assets/ca-licenses.html" title="${c.safe(T().t('menu_licenses'))}"></iframe></div>`,
    action(name, el, event, c) { if (name === 'mmca-licup') { c.back(); return true; } return false; }
  });
})();
