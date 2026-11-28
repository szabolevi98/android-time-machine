/* Calculator on Android 4.3 (Calculator.apk of JWR66Y), moved out of simulator.js (docs/plans/engine-migration.md).
   - the display, DELETE / CLR and the two panels, basic and advanced, side by side: a sideways swipe or the overflow
     menu's Advanced / Basic panel moves between them, Back returns to the basic one
   - DELETE deletes one character; held (600 ms plus the Touch & hold delay) it clears the display
   - = keeps the expression and its result in data.calcHistory (the last 50); the computer's Up and Down keys bring them
     back, and its digit and operator keys type
   - the overflow menu: Clear history, Advanced panel / Basic panel. The expression is evaluated by calculator-engine.js. */
(() => {
  'use strict';
  const state = ui => { ui.calc ??= ''; ui.calcFresh ??= false; ui.calcPanel ??= 0; ui.calcHistoryIndex ??= -1; return ui; };

  function render(c) {
    const ui = state(c.ui), safe = c.safe;
    const basic = ['7','8','9','÷','4','5','6','×','1','2','3','−','.','0','=','+'];
    const advanced = ['sin','cos','tan','ln','log','!','π','e','^','(',')','√'];
    const keys = (items, scientific = false) => items.map(key => `<button class="${!scientific && /^[0-9.]$/.test(key) ? 'digit' : 'function'}" data-action="calc-key" data-id="${key}">${key}</button>`).join('');
    return `<div class="app-view"><div class="ics-calculator"><div class="ics-calc-display"><output aria-label="Calculator display">${safe(ui.calc)}</output><button data-action="calc-menu" aria-label="More options"><img src="assets/ic_menu_overflow.png" alt=""></button></div><div class="ics-calc-delete"><span></span><button data-action="calc-key" data-id="${ui.calcFresh ? 'C' : '⌫'}" aria-label="${ui.calcFresh ? 'Clear' : 'Delete'}">${ui.calcFresh ? 'CLR' : 'DELETE'}</button></div><div class="calc-pager"><div class="calc-panels" style="transform:translateX(-${ui.calcPanel * 50}%)"><div class="ics-calc-grid" aria-label="Basic panel" ${ui.calcPanel ? 'inert' : ''}>${keys(basic)}</div><div class="ics-calc-grid scientific" aria-label="Advanced panel" ${ui.calcPanel ? '' : 'inert'}>${keys(advanced,true)}</div></div></div></div></div>`;
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
    const ui = state(c.ui), data = c.data;
    if (key === 'C') { ui.calc = ''; ui.calcFresh = false; return; }
    if (key === '⌫') { ui.calc = ui.calc === 'Error' ? '' : ui.calc.replace(/(?:sin|cos|tan|log|sqrt|√|ln)\($|.$/, ''); ui.calcFresh = false; return; }
    if (key === '=') {
      if (!ui.calc || ui.calc === 'Error') return;
      try { const expression = ui.calc; ui.calc = ICSCalculator.evaluate(expression); data.calcHistory = [...(data.calcHistory || []), {expression, result:ui.calc}].slice(-50); ui.calcHistoryIndex = -1; c.save(); } catch { ui.calc = 'Error'; }
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

  // The panels follow a sideways drag and settle on the nearer one; holding DELETE clears the display.
  function mount(c, root) {
    const pager = root.querySelector('.calc-pager'), track = root.querySelector('.calc-panels'), del = root.querySelector('.ics-calc-delete button');
    if (!pager || !track) return;
    let start = null, clearTimer = null;
    const reset = () => { clearTimeout(clearTimer); if (start?.swiping) { track.style.transition = ''; track.style.transform = `translateX(-${c.ui.calcPanel * 50}%)`; c.snapResting(track); } start = null; };
    del?.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const x = event.clientX, y = event.clientY;
      clearTimer = setTimeout(() => { operate(c, 'C'); c.suppressClick(350); c.render(); }, c.holdDelay(600));
      const moved = ev => { if (Math.hypot(ev.clientX - x, ev.clientY - y) > c.dp(9)) clearTimeout(clearTimer); };
      const done = () => { clearTimeout(clearTimer); window.removeEventListener('pointermove', moved); window.removeEventListener('pointerup', done); window.removeEventListener('pointercancel', done); };
      window.addEventListener('pointermove', moved); window.addEventListener('pointerup', done); window.addEventListener('pointercancel', done);
    });
    pager.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (c.ui.overlay) return;
      start = {id: event.pointerId, x: event.clientX, y: event.clientY, swiping: false};
    });
    pager.addEventListener('pointermove', event => {
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x, dy = event.clientY - start.y;
      if (!start.swiping && !(Math.abs(dx) > c.dp(14) && Math.abs(dx) > Math.abs(dy))) return;
      start.swiping = true; c.suppressClick(350); event.preventDefault();
      try { pager.setPointerCapture(event.pointerId); } catch {}
      const width = c.screen.clientWidth;
      track.style.transition = 'none'; track.style.transform = `translateX(${Math.max(-width, Math.min(0, -c.ui.calcPanel * width + dx))}px)`;
    });
    pager.addEventListener('pointerup', event => {
      if (!start?.swiping || event.pointerId !== start.id) { start = null; return; }
      const dx = event.clientX - start.x; start = null;
      setPanel(c, Math.abs(dx) > c.dp(59) ? (dx < 0 ? 1 : 0) : c.ui.calcPanel); c.suppressClick(350);
    });
    pager.addEventListener('pointercancel', reset);
  }

  JB.register('calculator', {
    render, mount,
    action(name, el, c) {
      const {ui, data} = c, id = el.dataset.id;
      if (name === 'calc-menu') { ui.overlay = 'calc-menu'; c.renderOverlay(); return true; }
      if (name === 'calc-panel') { ui.overlay = ''; c.renderOverlay(); setPanel(c, Number(id)); return true; }
      if (name === 'calc-clear') { data.calcHistory = []; ui.calcHistoryIndex = -1; c.save(); operate(c, 'C'); ui.overlay = ''; c.render(); return true; }
      if (name === 'calc-key') { operate(c, id); c.render(); return true; }
      return false;
    },
    // The overflow menu (the action button beside the display).
    overlay(c) {
      const ui = state(c.ui);
      if (ui.overlay === 'calc-menu') return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu"><button data-action="calc-clear">Clear history</button><button data-action="calc-panel" data-id="${ui.calcPanel ? 0 : 1}">${ui.calcPanel ? 'Basic panel' : 'Advanced panel'}</button></div>`;
    },
    back(c) { if (!c.ui.calcPanel) return false; setPanel(c, 0); return true; },
    // The computer's keyboard: Up / Down step through the history, the digit and operator keys type.
    key(event, c) {
      const ui = state(c.ui), data = c.data;
      if (ui.overlay || ['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) return false;
      if (['ArrowUp','ArrowDown'].includes(event.key)) {
        event.preventDefault(); const history = data.calcHistory || []; if (!history.length) return true;
        ui.calcHistoryIndex = event.key === 'ArrowUp' ? (ui.calcHistoryIndex < 0 ? history.length - 1 : Math.max(0,ui.calcHistoryIndex - 1)) : (ui.calcHistoryIndex < 0 ? history.length - 1 : Math.min(history.length - 1,ui.calcHistoryIndex + 1));
        ui.calc = history[ui.calcHistoryIndex].expression; ui.calcFresh = false; c.render(); return true;
      }
      if (/^[0-9.+\-*/=()!^]$/.test(event.key) || ['Enter','Backspace','Delete'].includes(event.key)) {
        event.preventDefault(); const map = {'*':'×','/':'÷','-':'−','Enter':'=','Backspace':'⌫','Delete':'C'}; operate(c, map[event.key] || event.key); c.render(); return true;
      }
      return false;
    },
    clearData(c) { c.ui.calc = ''; c.ui.calcHistoryIndex = -1; c.data.calcHistory = []; }
  });
})();
