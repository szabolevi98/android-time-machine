/* Calculator (KTU84P Calculator.apk), moved out of simulator.js (docs/plans/engine-migration.md): its screen, the
   overflow menu, the panel swipe and Back to the basic panel, the CLR / DELETE hold, the computer's keys and Clear data. */
(() => {
  'use strict';
  let calculatorClearTimer = null;
  function scope(c) {
    const {data, dp, holdDelay, i18n, overlayRoot, render, renderOverlay, safe, save, screen, snapResting, ui, viewport} = c;
    /* Calculator (KTU84P Calculator.apk), layout-port/main.xml: the display (display_style: 30 sp, 8 dp padding) with the
       overflow_menu button (48 dp, shown as the phone has no menu key), the btn_function strip with CLR / DELETE (15 dp,
       minWidth 89 dp, delDesc as its description) at its end, and the CalculatorViewPager's simple_pad.xml / advanced_pad.xml (weights 3 : 1.5 : 10). button_style 40 dp on
       btn_function, digit_button_style on btn_digit, button_small_style 30 dp for sin, cos, tan, ln and log; 1 dp gaps. The
       labels are the image's (strings.xml: "sen" in Spanish, "E" in French). */
    const CALC = key => { const row = window.StockStrings?.calculator?.[key]; return row ? AndroidStrings.pick(row, i18n.language, key) : key; };
    function renderCalculator() {
      const basic = ['7','8','9','÷','4','5','6','×','1','2','3','−','.','0','=','+'];
      const advanced = ['sin','cos','tan','ln','log','!','π','e','^','(',')','√'], small = ['sin','cos','tan','ln','log'];
      const label = key => ['sin','cos','tan','ln','log','e'].includes(key) ? CALC(key) : key;
      const keys = items => items.map(key => `<button class="${/^[0-9.]$/.test(key) ? 'digit' : small.includes(key) ? 'function small' : 'function'}" data-action="calc-key" data-id="${key}">${safe(label(key))}</button>`).join('');
      return `<div class="app-view"><div class="ics-calculator"><div class="ics-calc-display"><output aria-label="Calculator display">${safe(ui.calc === 'Error' ? CALC('Error') : ui.calc)}</output><button data-action="calc-menu" aria-label="More options"><img src="assets/ic_menu_overflow.png" alt=""></button></div><div class="ics-calc-delete"><span></span><button data-action="calc-key" data-id="${ui.calcFresh ? 'C' : '⌫'}" aria-label="${safe(ui.calcFresh ? CALC('CLR') : CALC('delete'))}">${safe(CALC(ui.calcFresh ? 'CLR' : 'DELETE'))}</button></div><div class="calc-pager"><div class="calc-panels" style="transform:translateX(-${ui.calcPanel * 50}%)"><div class="ics-calc-grid" aria-label="${safe(CALC('Basic panel'))}" ${ui.calcPanel ? 'inert' : ''}>${keys(basic)}</div><div class="ics-calc-grid scientific" aria-label="${safe(CALC('Advanced panel'))}" ${ui.calcPanel ? '' : 'inert'}>${keys(advanced)}</div></div></div></div></div>`;
    }
    function setCalculatorPanel(index) {
      ui.calcPanel = index;
      const track = viewport.querySelector('.calc-panels');
      if (!track) return;
      track.style.transition = '';
      track.style.transform = `translateX(-${index * 50}%)`; snapResting(track);
      track.querySelectorAll('.ics-calc-grid').forEach((panel, i) => { panel.inert = i !== index; });
    }

    function operateCalculator(key) {
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
    return {
      render() {
        return renderCalculator();
      },
      click(action, button, event) {
        const {id, app, url} = button.dataset;
        switch (action) {
          case 'calc-menu': ui.overlay = 'calc-menu'; renderOverlay(); break;
          case 'calc-panel': ui.overlay = ''; renderOverlay(); setCalculatorPanel(Number(id)); break;
          case 'calc-clear': data.calcHistory = []; ui.calcHistoryIndex = -1; save(); operateCalculator('C'); ui.overlay = ''; render(); break;
          case 'calc-key': operateCalculator(id); render(); break;
          default: return false;
        }
        return true;
      },
      overlay() {
        if (ui.overlay === 'calc-menu') {
          overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu"><button data-action="calc-clear">${safe(CALC('Clear history'))}</button><button data-action="calc-panel" data-id="${ui.calcPanel ? 0 : 1}">${safe(CALC(ui.calcPanel ? 'Basic panel' : 'Advanced panel'))}</button></div>`;
        } else return false;
        return true;
      },
      back() {
        if (ui.view === 'calculator' && ui.calcPanel) { setCalculatorPanel(0); return true; }
        return false;
      },
      key(event) {
        if (ui.view === 'calculator' && !ui.overlay && ['ArrowUp','ArrowDown'].includes(event.key) && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) {
          event.preventDefault(); const history = data.calcHistory || []; if (!history.length) return true;
          ui.calcHistoryIndex = event.key === 'ArrowUp' ? (ui.calcHistoryIndex < 0 ? history.length - 1 : Math.max(0,ui.calcHistoryIndex - 1)) : (ui.calcHistoryIndex < 0 ? history.length - 1 : Math.min(history.length - 1,ui.calcHistoryIndex + 1));
          ui.calc = history[ui.calcHistoryIndex].expression; ui.calcFresh = false; render(); return true;
        }
        if (ui.view === 'calculator' && !ui.overlay && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName) && (/^[0-9.+\-*/=()!^]$/.test(event.key) || ['Enter','Backspace','Delete'].includes(event.key))) {
          event.preventDefault(); const map = {'*':'×','/':'÷','-':'−','Enter':'=','Backspace':'⌫','Delete':'C'}; operateCalculator(map[event.key] || event.key); render(); return true;
        }
        return false;
      },
      clearData() {
        ui.calc='';ui.calcHistoryIndex=-1;data.calcHistory=[];
      },
      gestureDown(event) {
        if (ui.view === 'calculator' && !ui.overlay && event.target.closest('.calc-pager')) c.pointerStart.calculatorSwipe = true;
        if (event.target.closest('.ics-calc-delete button')) calculatorClearTimer = setTimeout(() => { operateCalculator('C'); c.suppressClickUntil = Date.now() + 350; render(); }, holdDelay(600));
      },
      gestureMove(event, dx, dy) {
        if (Math.hypot(dx,dy) > dp(9)) clearTimeout(calculatorClearTimer);
        if (c.pointerStart.calculatorSwipe && (c.pointerStart.calculatorSwiping || Math.abs(dx) > dp(13) && Math.abs(dx) > Math.abs(dy))) {
          c.pointerStart.calculatorSwiping = true; c.suppressClickUntil = Date.now() + 350; event.preventDefault();
          try { screen.setPointerCapture(event.pointerId); } catch {}
          const track = viewport.querySelector('.calc-panels');
          if (track) { track.style.transition = 'none'; track.style.transform = `translateX(${Math.max(-screen.clientWidth, Math.min(0, -ui.calcPanel * screen.clientWidth + dx))}px)`; }
          return true;
        }
        return false;
      },
      gestureUp(event, dx, dy) {
        clearTimeout(calculatorClearTimer);
        if (c.pointerStart.calculatorSwiping) { setCalculatorPanel(Math.abs(dx) > dp(55) ? (dx < 0 ? 1 : 0) : ui.calcPanel); c.suppressClickUntil = Date.now() + 350; c.pointerStart = null; return true; }
        return false;
      },
      gestureCancel() {
        clearTimeout(calculatorClearTimer); const calcTrack = viewport.querySelector('.calc-panels'); if (calcTrack) { calcTrack.style.transition = ''; calcTrack.style.transform = `translateX(-${ui.calcPanel * 50}%)`; snapResting(calcTrack); }
      }
    };
  }
  const spec = {
    render: c => scope(c).render(),
    click: (action, button, c, event) => scope(c).click(action, button, event),
    overlay: c => scope(c).overlay(),
    back: c => scope(c).back(),
    key: (event, c) => scope(c).key(event),
    clearData: c => scope(c).clearData(),
    gestureDown: (event, c) => scope(c).gestureDown(event),
    gestureMove: (event, dx, dy, c) => scope(c).gestureMove(event, dx, dy),
    gestureUp: (event, dx, dy, c) => scope(c).gestureUp(event, dx, dy),
    gestureCancel: c => scope(c).gestureCancel()
  };
  for (const id of ['calculator']) KK.register(id, spec);
})();
