# Engine migration: 4.4.4 (KK)

4.4.4's part of docs/plans/engine-migration.md: `versions/4.4.4/simulator.js` moves into `kk-core.js` and `kk-*.js`
modules registered with `KK.register(id, {...})` (KK is store-apps/legacy-host.js's StoreHost, as GB is on 2.3.6).

## How a module looks

The code moves verbatim. A module is one IIFE:

```js
(() => {
  'use strict';
  let calculatorClearTimer = null;          // the module's own state
  function scope(c) {
    const {data, ui, save, render, ...} = c; // the shell's bindings it uses, from the context
    function renderCalculator() { ... }      // the functions that moved, unchanged
    return {render() {...}, click(action, button, event) {...}, back() {...}, ...};
  }
  const spec = {render: c => scope(c).render(), click: (action, button, c, event) => scope(c).click(action, button, event), ...};
  for (const id of ['calculator']) KK.register(id, spec);
})();
```

- `c` is `storeContext()`: `kkScope`, one object with a getter per shell binding the modules use (simulator.js keeps
  the list up to date), plus the host's `c.dialog` / `c.menu`. A shell `let` that a module assigns
  (`suppressClickUntil`, `pointerStart`) is written as `c.pointerStart = ...` and has a setter there.
- The hooks: the view hooks of the host (render, mount, back, key, open, clearData, tick) run for the screen in front;
  the core offers every module the click cases (`click`, at the place of the old switch), the forms (`submit`), the
  input events (`input`) and the overlay to draw (`overlay`), in turn until one takes it; the gestures join the shared
  pointer handling (`gestureDown`, `gestureMove`, `gestureUp`, `gestureCancel`); `second(now)` runs with the device
  clock and `init` once at the start. kk-core.js lists them.
- Behaviour stays: a case, branch or statement keeps its text; `return;` in a Back / key / gesture statement becomes
  `return true;` (handled).

## Progress

- 2026-11-28: kk-core.js (`window.KK = window.StoreHost`), the core's hook points, and the first module:
  kk-calculator.js (screen, overflow menu, panel swipe, Back, CLR / DELETE hold, keys, Clear data).
- 2026-11-28 (later): modules for Downloads, the wallpaper picker, Live Wallpapers, the Google apps (YouTube, Drive,
  Maps, Earth, Google+, Google Settings, News & Weather, Google Search / Voice Search, Keep), Newsstand / Quickoffice /
  Wallet, the four Play apps, Photos, Gallery, Camera, Clock, Calendar, Email / Gmail, Hangouts, Phone, People, Chrome,
  the Play Store and Settings. Hooks follow EC: action(name, el, event, c), submit(form, event, c). Each move was
  checked against main by a differential walk (the same clicks on both, the screens compared).
- Left: the shell (status bar, lock / keyguard, home / drawer / folders / widgets / Google Now, the shade and quick
  settings, Recents, the power menu, volume, the search panel, print, dreams), then the rest of simulator.js into
  kk-core.js laid out like ec-core.js (docs/plans/engine-migration.md, Target), and simulator.js deleted.
  factory-drawers and global-actions tests still cut spans out of simulator.js.
