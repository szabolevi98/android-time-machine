# Engine migration: 4.4.4 (KK)

4.4.4's part of docs/plans/engine-migration.md: `versions/4.4.4/simulator.js` moved into `kk-core.js` and `kk-*.js`
modules registered with `KK.register(id, {...})` (KK is store-apps/legacy-host.js's StoreHost, as GB is on 2.3.6).
Done 2026-11-28: simulator.js is gone.

## How a module looks

The code moved verbatim. A module is one IIFE (a library file such as kk-downloads.js has it at its end):

```js
(() => {
  'use strict';
  let calculatorClearTimer = null;          // the module's own state
  function scope(c) {
    const {data, ui, save, render, ...} = c; // the core's bindings it uses, from the context
    function renderCalculator() { ... }      // the functions that moved, unchanged
    return {render() {...}, action(action, button, event) {...}, back() {...}, ...};
  }
  const spec = {render: c => scope(c).render(), action: (name, el, event, c) => scope(c).action(name, el, event), ...};
  for (const id of ['calculator']) KK.register(id, spec);
})();
```

- `c` is `storeContext()`: `kkScope` in kk-core.js, one object with a getter per core binding the modules use (each
  module lists them in its scope's `const {...} = c` line; a new one needs a getter there), plus the host's
  `c.dialog` / `c.menu`. A core `let` a module assigns (`suppressClickUntil`, `pointerStart`, the hold timers) is
  written `c.pointerStart = ...` and has a setter.
- The hooks (kk-core.js's header lists them): the host's view hooks (render, mount, back, key, open, clearData, tick)
  run for the screen in front, backAlways also with an overlay open; the core offers every module (not the store-<id>
  apps) `action`, `submit`, `input` and `overlay` in turn until one takes it, joins the gestures to the shared pointer
  handling (`gestureDown`, `gestureMove`, `gestureUp`, `gestureCancel`), runs `second(now)` with the device clock and
  `init` once at the start. A module under several ids uses `second`, not the host's `tick` (the host would tick it
  once per id). Global listeners a module needs are attached in `init` and run each event in a fresh scope.
- Behaviour stays: a case, branch or statement keeps its text; `return;` in a Back / key / gesture statement became
  `return true;` (handled).

## The core

kk-core.js keeps simulator.js's order under ec-core.js's section headings: the saved state and ui, the context, the
system bars, render / renderOverlay, open / home / back, the click, form and input dispatch, the shared pointer
handling, the keys, power and volume, the site controls, the device clock. As in ec-core.js, KK exists before the
modules load and the core starts on DOMContentLoaded. It still holds what several modules share (navigateBrowser,
messageDraft, composeEmail, cameraShoot, the launcher's drag and drop and page swipes, the keyguard's controller and
glow pad, the in-call timer).

## Progress

- 2026-11-28: kk-core.js, the core's hook points and the Calculator; then Downloads, the wallpaper picker, Live
  Wallpapers, the Google apps (YouTube, Drive, Maps, Earth, Google+, Google Settings, News & Weather, Google Search /
  Voice Search, Keep, their shared menu), Newsstand / Quickoffice / Wallet, the four Play apps, Photos, Gallery,
  Camera, Clock, Calendar, Email / Gmail, Hangouts, Phone, People, Chrome, the Play Store, Settings; the shell: the
  shade, Recents, the power menu, Daydream, the search panel, print, the lock screen, the launcher, Google Now, the
  status bar and the volume panel; the rest into kk-core.js. Every step was checked against main by a differential
  walk (the same clicks, keys and drags on both, the screens compared) besides npm test and the 4.4.4 browser CI.
- Bugs found on the way, fixed in their own commits: App info gave image apps a store app's size once they were host
  modules (settings-detail.js); a store app threw on every key; tapping the welcome notification threw "note is not
  defined" (notification-open).
