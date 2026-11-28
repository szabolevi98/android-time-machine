# Engine migration: 4.3 onto the module core

4.3's part of docs/plans/engine-migration.md: `versions/4.3/simulator.js` moves into `jb-*.js` modules registered with
`JB.register(id, {...})` (`JB` = store-apps/legacy-host.js's StoreHost, named in `jb-core.js`), until simulator.js is
gone and what is left of it is `jb-core.js`.

## How a module is hosted

`jb-core.js` names the host (`window.JB = StoreHost`) when it loads, right after legacy-host.js, so every `jb-*.js`
module can register; the core itself starts on DOMContentLoaded, once all of them have. Its header lists the hooks.

- the context `c` (`storeContext()`): the store apps' context plus `moduleApi`, every name of the core a module uses,
  read live through getters (the core's variables also through setters: `$c.dragState = …`). A module refreshes its
  module-scope names on every hook entry (`$bind(c)`), so the moved code reads as it did in simulator.js.
- view hooks go to the module of ui.view: render (renderApp asks first), mount, back (at the start of navigateBack,
  open overlay or not; the lines that stood after the overlay closes check `ui.overlay` first), key, open /
  openUnlocked (before / after openApp's lock check), clearData.
- every module, in turn, where its code stood: actionEarly (before the keyguard's filter) and action (before the click
  switch), submit, input, overlayEarly / overlay, afterRender, pointerMove / pointerUp (in the shared touch handlers),
  init(make, c) (once, before the first render).
- a function the core still calls after its code moved is a one-line stub that calls the module's `exports`.

## Progress

| Step | What | Commit |
| --- | --- | --- |
| 1 | jb-core.js (`JB`), Calculator → jb-calculator.js | |
| 2–19 | Sound Recorder, Live wallpapers, Clock, Downloads, Play media apps, stock Google apps, extra apps, Messaging + Hangouts, Phone + People, Gallery + Camera, Calendar, Music, Email + Gmail, Browser + Chrome, Play Store, Settings (+ Daydream), Sound Search | see git log |
| 20 | Shell: lock screen (jb-keyguard.js), power (jb-power.js), volume (jb-volume.js), status / nav bar (jb-statusbar.js), shade (jb-shade.js), Recents (jb-recents.js), search swipe (jb-search.js), launcher (jb-launcher.js), keys (jb-keys.js) | see git log |
| fix | notification-open: `note` out of scope for non-calendar notifications | 71fc5d5f |
| 21 | simulator.js is gone: the rest is jb-core.js, in ec-core.js's order (saved state, context, drawing, opening and Back, dispatch, shared touch gestures, site controls, device clock) | see git log |

## Left

- The shared touch handlers (home page swipe, drawer swipe, drag start, shade pull, lock drag, Recents swipe) are still
  the core's: they call the launcher, keyguard, shade and Recents through their modules, as one dispatcher.
- Magnification (Settings › Accessibility) and the page's site controls stay in the core.
