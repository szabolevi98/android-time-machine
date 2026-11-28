/* Calculator (IMM76I Calculator.apk), moved out of simulator.js (docs/plans/engine-migration.md).
   layout-port/main.xml: the display (display_style: 30 sp, 8 dp padding) with the overflow_menu button (48 dp, shown as
   the phone has no menu key), the btn_function strip with CLR / DELETE (15 dp) at a quarter, and the CalculatorViewPager's
   simple_pad.xml / advanced_pad.xml (weights 3 : 1.5 : 10). button_style 40 dp on btn_function, digit_button_style on
   btn_digit, button_small_style 30 dp for sin, cos, tan, ln and log; 1 dp gaps. The labels are the image's (strings.xml:
   "sen" in Spanish, "E" in French).
   - a sideways swipe or the overflow's Advanced / Basic panel moves between the panels, Back returns to the basic one
   - DELETE deletes one character; held (600 ms plus Settings' touch & hold delay) it clears the display
   - = keeps the expression and its result in data.calcHistory (the last 50); the computer's Up and Down keys bring them
     back, and its digit and operator keys type. The expression is evaluated by calculator-engine.js. */
(() => {
  'use strict';
  const text = (c, key) => { const row = window.StockStrings?.calculator?.[key]; return row ? AndroidStrings.pick(row, c.lang, key) : key; };
  let clearTimer = null;

  function render(c) {
    const {ui, safe} = c, CALC = key => text(c, key);
    const basic = ['7','8','9','÷','4','5','6','×','1','2','3','−','.','0','=','+'];
    const advanced = ['sin','cos','tan','ln','log','!','π','e','^','(',')','√'], small = ['sin','cos','tan','ln','log'];
    const label = key => ['sin','cos','tan','ln','log','e'].includes(key) ? CALC(key) : key;
    const keys = items => items.map(key => `<button class="${/^[0-9.]$/.test(key) ? 'digit' : small.includes(key) ? 'function small' : 'function'}" data-action="calc-key" data-id="${key}">${safe(label(key))}</button>`).join('');
    return `<div class="app-view"><div class="ics-calculator"><div class="ics-calc-display"><output aria-label="Calculator display">${safe(ui.calc === 'Error' ? CALC('Error') : ui.calc)}</output><button data-action="calc-menu" aria-label="More options"><img src="assets/ic_menu_overflow.png" alt=""></button></div><div class="ics-calc-delete"><span></span><button data-action="calc-key" data-id="${ui.calcFresh ? 'C' : '⌫'}" aria-label="${ui.calcFresh ? 'Clear' : 'Delete'}">${safe(CALC(ui.calcFresh ? 'CLR' : 'DELETE'))}</button></div><div class="calc-pager"><div class="calc-panels" style="transform:translateX(-${ui.calcPanel * 50}%)"><div class="ics-calc-grid" aria-label="${safe(CALC('Basic panel'))}" ${ui.calcPanel ? 'inert' : ''}>${keys(basic)}</div><div class="ics-calc-grid scientific" aria-label="${safe(CALC('Advanced panel'))}" ${ui.calcPanel ? '' : 'inert'}>${keys(advanced)}</div></div></div></div></div>`;
  }
  function setPanel(c, index) {
    c.ui.calcPanel = index;
    const track = c.viewport.querySelector('.calc-panels');
    if (!track) return;
    track.style.transition = '';
    track.style.transform = `translateX(-${index * 50}%)`; c.snapResting(track);
    track.querySelectorAll('.ics-calc-grid').forEach((panel, i) => { panel.inert = i !== index; });
  }
  function operate(c, key) {
    const {ui, data, save} = c;
    if (key === 'C') { ui.calc = ''; ui.calcFresh = false; return; }
    if (key === '⌫') { ui.calc = ui.calc === 'Error' ? '' : ui.calc.replace(/(?:sin|cos|tan|log|sqrt|√|ln)\($|.$/, ''); ui.calcFresh = false; return; }
    if (key === '=') {
      if (!ui.calc || ui.calc === 'Error') return;
      try { const expression = ui.calc; ui.calc = ICSCalculator.evaluate(expression); data.calcHistory = [...(data.calcHistory || []), {expression, result:ui.calc}].slice(-50); ui.calcHistoryIndex = -1; save(); } catch { ui.calc = 'Error'; }
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

  ICS.register('calculator', {
    // The panel strip is the calculator's own gesture (the page must not rubber-band under it).
    touch: '.calc-pager',
    init(c) { Object.assign(c.ui, {calc: '', calcFresh: false, calcPanel: 0, calcHistoryIndex: -1}); },
    render,
    overlay(c) {
      const {ui, safe} = c, CALC = key => text(c, key);
      if (ui.overlay === 'calc-menu') return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu"><button data-action="calc-clear">${safe(CALC('Clear history'))}</button><button data-action="calc-panel" data-id="${ui.calcPanel ? 0 : 1}">${safe(CALC(ui.calcPanel ? 'Basic panel' : 'Advanced panel'))}</button></div>`;
    },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay} = c, {id} = button.dataset;
      switch (action) {
        case 'calc-menu': ui.overlay = 'calc-menu'; renderOverlay(); break;
        case 'calc-panel': ui.overlay = ''; renderOverlay(); setPanel(c, Number(id)); break;
        case 'calc-clear': data.calcHistory = []; ui.calcHistoryIndex = -1; save(); operate(c, 'C'); ui.overlay = ''; render(); break;
        case 'calc-key': operate(c, id); render(); break;
        default: return false;
      }
      return true;
    },
    back(c) {
      const {ui} = c;
      if (ui.overlay) return false;
      if (ui.view === 'calculator' && ui.calcPanel) { setPanel(c, 0); return true; }
      return false;
    },
    // The panels follow a sideways drag and settle on the nearer one; holding DELETE clears the display.
    pointerdown(event, p, c) {
      const {ui} = c;
      if (ui.view === 'calculator' && !ui.overlay && event.target.closest('.calc-pager')) p.calculatorSwipe = true;
      if (event.target.closest('.ics-calc-delete button')) clearTimer = setTimeout(() => { operate(c, 'C'); c.suppressClick(350); c.render(); }, c.holdDelay(600));
    },
    pointermove(event, p, dx, dy, c) {
      const {ui, screen, viewport, dp} = c;
      if (Math.hypot(dx,dy) > dp(9)) clearTimeout(clearTimer);
      if (p.calculatorSwipe && (p.calculatorSwiping || Math.abs(dx) > dp(14) && Math.abs(dx) > Math.abs(dy))) {
        p.calculatorSwiping = true; c.suppressClick(350); event.preventDefault();
        try { screen.setPointerCapture(event.pointerId); } catch {}
        const track = viewport.querySelector('.calc-panels');
        if (track) { track.style.transition = 'none'; track.style.transform = `translateX(${Math.max(-screen.clientWidth, Math.min(0, -ui.calcPanel * screen.clientWidth + dx))}px)`; }
        return true;
      }
    },
    pointerup(event, p, dx, dy, c) {
      clearTimeout(clearTimer);
      if (p.calculatorSwiping) { setPanel(c, Math.abs(dx) > c.dp(59) ? (dx < 0 ? 1 : 0) : c.ui.calcPanel); c.suppressClick(350); return true; }
    },
    pointercancel(c) {
      clearTimeout(clearTimer);
      const calcTrack = c.viewport.querySelector('.calc-panels'); if (calcTrack) { calcTrack.style.transition = ''; calcTrack.style.transform = `translateX(-${c.ui.calcPanel * 50}%)`; c.snapResting(calcTrack); }
    },
    // The computer's keyboard: Up / Down step through the history, the digit and operator keys type.
    key(event, c) {
      const {ui, data, render} = c;
      if (ui.view === 'calculator' && !ui.overlay && ['ArrowUp','ArrowDown'].includes(event.key) && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) {
        event.preventDefault(); const history = data.calcHistory || []; if (!history.length) return true;
        ui.calcHistoryIndex = event.key === 'ArrowUp' ? (ui.calcHistoryIndex < 0 ? history.length - 1 : Math.max(0,ui.calcHistoryIndex - 1)) : (ui.calcHistoryIndex < 0 ? history.length - 1 : Math.min(history.length - 1,ui.calcHistoryIndex + 1));
        ui.calc = history[ui.calcHistoryIndex].expression; ui.calcFresh = false; render(); return true;
      }
      if (ui.view === 'calculator' && !ui.overlay && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName) && (/^[0-9.+\-*/=()!^]$/.test(event.key) || ['Enter','Backspace','Delete'].includes(event.key))) {
        event.preventDefault(); const map = {'*':'×','/':'÷','-':'−','Enter':'=','Backspace':'⌫','Delete':'C'}; operate(c, map[event.key] || event.key); render(); return true;
      }
      return false;
    },
    clearData(c) { c.ui.calc = ''; c.ui.calcHistoryIndex = -1; c.data.calcHistory = []; }
  });
})();
