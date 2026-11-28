/* Calculator on Android 5.1.1 (Calculator of android-5.1.1_r26), moved out of simulator.js
   (docs/plans/engine-migration.md).
   - the display with the formula and the live result, the numeric pad and operators, and the advanced pad peeking at
     the right edge: a sideways swipe or a tap moves between them, Back returns to the main one
   - = keeps the expression and its result in data.calcHistory (the last 50); the computer's Up and Down keys bring them
     back, and its digit and operator keys type
   - the overflow menu: Clear history, Advanced panel / Basic panel. The expression is evaluated by calculator-engine.js. */
'use strict';
LP.define('calculator', ({
  dp, holdDelay, i18n, render, renderOverlay, safe, save, screen, snapResting, ui, viewport
}, lp) => {
  Object.assign(ui, {calc: '', calcFresh: false, calcPanel: 0, calcHistoryIndex: -1});
  /* Calculator 5.1 (packages/apps/Calculator android-5.1.1_r26, activity_calculator_port): the white display (4 dp
     elevation) with the formula (sans-serif-light, #8A000000, 64 sp shrinking in 8 sp steps to 36 sp; 48 dp above,
     24 dp below, 16 dp sides) and the live result (36 sp #6C000000); below, the #434343 numeric pad (12 dp in, 32 sp
     white keys: 7 8 9 / 4 5 6 / 1 2 3 / . 0 =) beside the #636363 operator column (DEL or CLR in 15 sp caps, ÷ × − +
     in 23 sp), and the #1DE9B6 advanced pad peeking 24 dp at the right edge (sin cos tan / ln log ! / π e ^ / ( ) √,
     20 sp #91000000), swiped or tapped in. The status bar is the #00BCD4 accent; clearing reveals it over the display. */
  const LP_CALC_PEEK = 21.74;
  function calcPreview(expression) {
    if (!expression || expression === 'Error' || !/[÷×−+^!√(]|sin|cos|tan|ln|log|π|e/.test(expression.replace(/^−/, ''))) return '';
    try { const value = ICSCalculator.evaluate(expression); return value === expression ? '' : value; } catch { return ''; }
  }
  function renderCalculator() {
    const numeric = ['7','8','9','4','5','6','1','2','3','.','0','='];
    const operators = ['÷','×','−','+'];
    const advanced = ['sin','cos','tan','ln','log','!','π','e','^','(',')','√'];
    const key = (k, cls = '') => `<button class="lpcalc-key ${cls}" data-action="calc-key" data-id="${k}">${k}</button>`;
    const error = ui.calc === 'Error', formula = error ? '' : ui.calc, result = error ? i18n.t('Error') : ui.calcFresh ? '' : calcPreview(ui.calc);
    const width = 343 / .906, len = Math.max(1, [...formula].length);
    const size = [64, 56, 48, 40, 36].find(sp => len * .55 * sp <= width) || 36;
    const reveal = ui.calcReveal && Date.now() - ui.calcReveal < 600 ? `<span class="lpcalc-reveal${ui.calcRevealError ? ' error' : ''}"></span>` : '';
    return `<div class="app-view lpcalc"><div class="lpcalc-display">${reveal}<output class="lpcalc-formula" aria-label="${safe(i18n.t('Calculator display'))}" style="font-size:calc(${size} * var(--dp))">${safe(formula)}</output><output class="lpcalc-result${error ? ' error' : ''}">${safe(result)}</output></div><div class="calc-pager lpcalc-pager"><div class="calc-panels lpcalc-track" style="transform:translateX(${ui.calcPanel ? `calc(-100% + ${LP_CALC_PEEK}px)` : '0'})"><div class="lpcalc-main" ${ui.calcPanel ? 'inert' : ''}><div class="lpcalc-numeric">${numeric.map(k => key(k, k === '=' ? 'eq' : 'digit')).join('')}</div><div class="lpcalc-operators">${ui.calcFresh || error ? `<button class="lpcalc-key text" data-action="calc-key" data-id="C">${safe(i18n.t('clr').toUpperCase())}</button>` : `<button class="lpcalc-key text" data-action="calc-key" data-id="⌫">${safe(i18n.t('del').toUpperCase())}</button>`}${operators.map(k => key(k, 'op')).join('')}</div></div><div class="lpcalc-advanced"${ui.calcPanel ? '' : ` data-action="calc-panel" data-id="1"`}><div class="lpcalc-advanced-grid" ${ui.calcPanel ? '' : 'inert'}>${advanced.map(k => key(k, 'adv')).join('')}</div></div></div></div></div>`;
  }
  function setCalculatorPanel(index) {
    ui.calcPanel = index;
    const track = viewport.querySelector('.calc-panels');
    if (!track) return;
    track.style.transition = '';
    track.style.transform = index ? `translateX(calc(-100% + ${LP_CALC_PEEK}px))` : 'translateX(0)'; snapResting(track);
    const main = track.querySelector('.lpcalc-main'), grid = track.querySelector('.lpcalc-advanced-grid'), adv = track.querySelector('.lpcalc-advanced');
    if (main) main.inert = !!index; if (grid) grid.inert = !index;
    if (adv) { if (index) { delete adv.dataset.action; delete adv.dataset.id; } else { adv.dataset.action = 'calc-panel'; adv.dataset.id = '1'; } }
  }
  function operateCalculator(key) {
    if (key === 'C') { ui.calcRevealError = ui.calc === 'Error'; ui.calcReveal = Date.now(); ui.calc = ''; ui.calcFresh = false; return; }
    if (key === '⌫') { ui.calc = ui.calc === 'Error' ? '' : ui.calc.replace(/(?:sin|cos|tan|log|sqrt|√|ln)\($|.$/, ''); ui.calcFresh = false; return; }
    if (key === '=') {
      if (!ui.calc || ui.calc === 'Error') return;
      try { const expression = ui.calc; ui.calc = ICSCalculator.evaluate(expression); lp.data.calcHistory = [...(lp.data.calcHistory || []), {expression, result:ui.calc}].slice(-50); ui.calcHistoryIndex = -1; save(); } catch { ui.calc = 'Error'; }
      ui.calcFresh = true; return;
    }
    if (ui.calc.length > 150) return;
    const operator = ['÷','×','−','+','^','!'].includes(key);
    if (ui.calc === 'Error' || ui.calcFresh && !operator) ui.calc = '';
    ui.calcFresh = false;
    const token = key === '√' ? '√(' : /^(sin|cos|tan|ln|log)$/.test(key) ? `${key}(` : key;
    if (operator && key !== '!' && /[÷×−+^]$/.test(ui.calc) && key !== '−') ui.calc = ui.calc.slice(0,-1);
    ui.calc += token;
  }
  // The panel swipe and the held DEL key, called by simulator.js's pointer handlers where they were.
  let calculatorClearTimer = null;
  return {
    render: renderCalculator,
    click(action, button, event) {
      const {id} = button.dataset;
      switch (action) {
        case 'calc-menu': ui.overlay = 'calc-menu'; renderOverlay(); break;
        case 'calc-panel': ui.overlay = ''; renderOverlay(); setCalculatorPanel(Number(id)); break;
        case 'calc-clear': lp.data.calcHistory = []; ui.calcHistoryIndex = -1; save(); operateCalculator('C'); ui.overlay = ''; render(); break;
        case 'calc-key': operateCalculator(id); render(); break;
        default: return false;
      }
      return true;
    },
    overlays: {
      'calc-menu'(root) {
        root.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu"><button data-action="calc-clear">Clear history</button><button data-action="calc-panel" data-id="${ui.calcPanel ? 0 : 1}">${ui.calcPanel ? 'Basic panel' : 'Advanced panel'}</button></div>`;
      }
    },
    back() { if (!ui.calcPanel) return false; setCalculatorPanel(0); return true; },
    pointerdown(event) {
      if (ui.view === 'calculator' && !ui.overlay && event.target.closest('.calc-pager')) lp.pointerStart.calculatorSwipe = true;
      if (event.target.closest('.ics-calc-delete button')) calculatorClearTimer = setTimeout(() => { operateCalculator('C'); lp.suppressClickUntil = Date.now() + 350; render(); }, holdDelay(600));
    },
    cancelHold() { clearTimeout(calculatorClearTimer); },
    pointermove(event, dx, dy) {
      const pointerStart = lp.pointerStart;
      if (!(pointerStart.calculatorSwipe && (pointerStart.calculatorSwiping || Math.abs(dx) > dp(13) && Math.abs(dx) > Math.abs(dy)))) return false;
      pointerStart.calculatorSwiping = true; lp.suppressClickUntil = Date.now() + 350; event.preventDefault();
      try { screen.setPointerCapture(event.pointerId); } catch {}
      const track = viewport.querySelector('.calc-panels');
      if (track) { track.style.transition = 'none'; track.style.transform = `translateX(${Math.max(-(screen.clientWidth - LP_CALC_PEEK), Math.min(0, -ui.calcPanel * (screen.clientWidth - LP_CALC_PEEK) + dx))}px)`; }
      return true;
    },
    pointerup(dx) {
      if (!lp.pointerStart.calculatorSwiping) return false;
      setCalculatorPanel(Math.abs(dx) > dp(55) ? (dx < 0 ? 1 : 0) : ui.calcPanel); lp.suppressClickUntil = Date.now() + 350; lp.pointerStart = null; return true;
    },
    pointercancel() {
      clearTimeout(calculatorClearTimer);
      const calcTrack = viewport.querySelector('.calc-panels'); if (calcTrack) { calcTrack.style.transition = ''; calcTrack.style.transform = `translateX(-${ui.calcPanel * 50}%)`; snapResting(calcTrack); }
    },
    // The computer's keyboard: Up / Down step through the history, the digit and operator keys type.
    key(event) {
      if (ui.view === 'calculator' && !ui.overlay && ['ArrowUp','ArrowDown'].includes(event.key) && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) {
        event.preventDefault(); const history = lp.data.calcHistory || []; if (!history.length) return true;
        ui.calcHistoryIndex = event.key === 'ArrowUp' ? (ui.calcHistoryIndex < 0 ? history.length - 1 : Math.max(0,ui.calcHistoryIndex - 1)) : (ui.calcHistoryIndex < 0 ? history.length - 1 : Math.min(history.length - 1,ui.calcHistoryIndex + 1));
        ui.calc = history[ui.calcHistoryIndex].expression; ui.calcFresh = false; render(); return true;
      }
      if (ui.view === 'calculator' && !ui.overlay && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName) && (/^[0-9.+\-*/=()!^]$/.test(event.key) || ['Enter','Backspace','Delete'].includes(event.key))) {
        event.preventDefault(); const map = {'*':'×','/':'÷','-':'−','Enter':'=','Backspace':'⌫','Delete':'C'}; operateCalculator(map[event.key] || event.key); render(); return true;
      }
      return false;
    },
    clearData() { ui.calc = ''; ui.calcHistoryIndex = -1; lp.data.calcHistory = []; }
  };
});
