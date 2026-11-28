/* Calculator on Android 2.3.6 (Calculator.apk of GRK39F), moved out of simulator.js (docs/plans/engine-migration.md).
   - the display and the two panels, basic and advanced, side by side: a sideways swipe or the Menu key's Advanced /
     Basic panel moves between them, Back returns to the basic one
   - CLEAR (DELETE) deletes one character; held for 600 ms it clears the display (Logic.onClear)
   - = keeps the expression and its result in data.calcHistory (the last 50); the computer's Up and Down keys bring them
     back, and its digit and operator keys type
   - the Menu key: Clear history, Advanced panel / Basic panel. The expression is evaluated by calculator-engine.js. */
(() => {
  'use strict';
  const text = (c, key) => AndroidStrings.resources(() => window.GBStrings?.calculator).t(key, c.lang);
  const state = ui => { ui.calc ??= ''; ui.calcFresh ??= false; ui.calcPanel ??= 0; ui.calcHistoryIndex ??= -1; return ui; };

  function render(c) {
    const ui = state(c.ui), safe = c.safe;
    const key = (id, cls = '') => `<button class="gbcalc-key${cls}" data-action="calc-key" data-id="${id}">${safe(id)}</button>`;
    const row = keys => `<div class="gbcalc-row">${keys.map(([id, cls]) => key(id, cls)).join('')}</div>`;
    const simple = `<div class="gbcalc-pad gbcalc-simple" aria-label="${safe(text(c, 'basic'))}" ${ui.calcPanel ? 'inert' : ''}><div class="gbcalc-row gbcalc-top"><span class="gbcalc-blank"></span><button class="gbcalc-key gbcalc-del" data-action="calc-key" data-id="⌫" aria-label="${safe(text(c, 'del'))}">${safe(text(c, 'clear'))}</button></div>${row([['7', ' digit'], ['8', ' digit'], ['9', ' digit'], ['÷']])}${row([['4', ' digit'], ['5', ' digit'], ['6', ' digit'], ['×']])}${row([['1', ' digit'], ['2', ' digit'], ['3', ' digit'], ['−']])}${row([['.', ' digit'], ['0', ' digit'], ['='], ['+']])}</div>`;
    const advanced = `<div class="gbcalc-pad gbcalc-advanced" aria-label="${safe(text(c, 'advanced'))}" ${ui.calcPanel ? '' : 'inert'}>${row([['sin', ' small'], ['cos', ' small'], ['tan', ' small']])}${row([['ln', ' small'], ['log', ' small'], ['!']])}${row([['π'], ['e'], ['^']])}${row([['('], [')'], ['√']])}</div>`;
    const shown = ui.calc === 'Error' ? text(c, 'error') : ui.calc;
    return `<div class="app-view gbcalc" data-no-translate><div class="gbcalc-display"><output aria-label="${safe(text(c, 'app_name'))}">${safe(shown)}</output><i class="gbcalc-caret"></i></div><div class="calc-pager gbcalc-pager"><div class="calc-panels" style="transform:translateX(-${ui.calcPanel * 50}%)">${simple}${advanced}</div></div></div>`;
  }

  function setPanel(c, index) {
    c.ui.calcPanel = index;
    const track = c.viewport.querySelector('.calc-panels');
    if (!track) return;
    track.style.transition = '';
    track.style.transform = `translateX(-${index * 50}%)`; c.snapResting(track);
    track.querySelectorAll('.gbcalc-pad').forEach((panel, i) => { panel.inert = i !== index; });
  }

  function operate(c, key) {
    const ui = state(c.ui), data = c.data;
    if (key === 'C') { ui.calc = ''; ui.calcFresh = false; return; }
    // Logic.onDelete: on a result or an error DELETE clears the display.
    if (key === '⌫') { ui.calc = ui.calc === 'Error' || ui.calcFresh ? '' : ui.calc.replace(/(?:sin|cos|tan|log|sqrt|√|ln)\($|.$/, ''); ui.calcFresh = false; return; }
    if (key === '=') {
      if (!ui.calc || ui.calc === 'Error') return;
      try { const expression = ui.calc; ui.calc = ICSCalculator.evaluate(expression); data.calcHistory = [...(data.calcHistory || []), {expression, result: ui.calc}].slice(-50); ui.calcHistoryIndex = -1; c.save(); } catch { ui.calc = 'Error'; }
      ui.calcFresh = true; return;
    }
    if (ui.calc.length > 150) return;
    const operator = ['÷', '×', '−', '+', '^', '!'].includes(key);
    if (ui.calc === 'Error' || ui.calcFresh && !operator) ui.calc = '';
    ui.calcFresh = false;
    const token = key === '√' ? '√(' : /^(sin|cos|tan|ln|log)$/.test(key) ? `${key}(` : key;
    if (operator && key !== '!' && /[÷×−+^]$/.test(ui.calc) && key !== '−') ui.calc = ui.calc.slice(0, -1);
    ui.calc += token;
  }

  // The panels follow a sideways drag and settle on the nearer one; holding CLEAR clears the display.
  function mount(c, root) {
    const pager = root.querySelector('.calc-pager'), track = root.querySelector('.calc-panels');
    if (!pager || !track) return;
    let start = null, clearTimer = null;
    const reset = () => { clearTimeout(clearTimer); if (start?.swiping) { track.style.transition = ''; track.style.transform = `translateX(-${c.ui.calcPanel * 50}%)`; c.snapResting(track); } start = null; };
    pager.addEventListener('pointerdown', event => {
      if (c.ui.overlay) return;
      start = {id: event.pointerId, x: event.clientX, y: event.clientY, swiping: false};
      if (event.target.closest('.gbcalc-del')) clearTimer = setTimeout(() => { operate(c, 'C'); c.suppressClick(350); c.render(); }, 600);
    });
    pager.addEventListener('pointermove', event => {
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x, dy = event.clientY - start.y;
      if (Math.hypot(dx, dy) > 8) clearTimeout(clearTimer);
      if (!start.swiping && !(Math.abs(dx) > c.dp(14) && Math.abs(dx) > Math.abs(dy))) return;
      start.swiping = true; c.suppressClick(350); event.preventDefault();
      try { pager.setPointerCapture(event.pointerId); } catch {}
      const width = c.screen.clientWidth;
      track.style.transition = 'none'; track.style.transform = `translateX(${Math.max(-width, Math.min(0, -c.ui.calcPanel * width + dx))}px)`;
    });
    pager.addEventListener('pointerup', event => {
      clearTimeout(clearTimer);
      if (!start?.swiping || event.pointerId !== start.id) { start = null; return; }
      const dx = event.clientX - start.x; start = null;
      setPanel(c, Math.abs(dx) > c.dp(58) ? (dx < 0 ? 1 : 0) : c.ui.calcPanel); c.suppressClick(350);
    });
    pager.addEventListener('pointercancel', reset);
  }

  GB.register('calculator', {
    render, mount,
    action(name, el, c) {
      const id = el.dataset.id;
      if (name === 'calc-panel') { setPanel(c, Number(id)); return true; }
      if (name === 'calc-clear') { c.data.calcHistory = []; c.ui.calcHistoryIndex = -1; c.save(); operate(c, 'C'); c.render(); return true; }
      if (name === 'calc-key') { operate(c, id); c.render(); c.viewport.querySelector(`.gbcalc-key[data-id="${CSS.escape(id)}"]`)?.classList.add('gbcalc-flame'); return true; }
      return false;
    },
    menu(c) {
      c.menu([{label: text(c, 'clear_history'), icon: 'gb-calc-clear_history.png', action: c => GB.module('calculator').action('calc-clear', {dataset: {}}, c)},
        c.ui.calcPanel ? {label: text(c, 'basic'), icon: 'gb-calc-simple.png', action: c => setPanel(c, 0)} : {label: text(c, 'advanced'), icon: 'gb-calc-advanced.png', action: c => setPanel(c, 1)}]);
    },
    back(c) { if (!c.ui.calcPanel) return false; setPanel(c, 0); return true; },
    // The computer's keyboard: Up / Down step through the history, the digit and operator keys type.
    key(event, c) {
      const ui = state(c.ui);
      if (ui.overlay || ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return false;
      if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault(); const history = c.data.calcHistory || []; if (!history.length) return true;
        ui.calcHistoryIndex = event.key === 'ArrowUp' ? (ui.calcHistoryIndex < 0 ? history.length - 1 : Math.max(0, ui.calcHistoryIndex - 1)) : (ui.calcHistoryIndex < 0 ? history.length - 1 : Math.min(history.length - 1, ui.calcHistoryIndex + 1));
        ui.calc = history[ui.calcHistoryIndex].expression; ui.calcFresh = false; c.render(); return true;
      }
      if (/^[0-9.+\-*/=()!^]$/.test(event.key) || ['Enter', 'Backspace', 'Delete'].includes(event.key)) {
        event.preventDefault(); const map = {'*': '×', '/': '÷', '-': '−', 'Enter': '=', 'Backspace': '⌫', 'Delete': 'C'}; operate(c, map[event.key] || event.key); c.render(); return true;
      }
      return false;
    },
    clearData(c) { c.ui.calc = ''; c.ui.calcHistoryIndex = -1; c.data.calcHistory = []; }
  });
})();
