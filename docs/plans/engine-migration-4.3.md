# Engine migration: 4.3 onto the module core

4.3's part of docs/plans/engine-migration.md: `versions/4.3/simulator.js` moves into `jb-*.js` modules registered with
`JB.register(id, {...})` (`JB` = store-apps/legacy-host.js's StoreHost, named in `jb-core.js`), until simulator.js is
gone and what is left of it is `jb-core.js`.

## How a module is hosted (while simulator.js is still there)

- simulator.js's `storeContext()` is the context `c` every module gets: the StoreHost context of the store apps plus
  what the moved code needs (viewport, dp, snapResting, holdDelay, suppressClick, ...).
- render: `renderApp()` asks `StoreHost.render(ui.view)` first; mount runs after every render.
- clicks: the click handler offers `StoreHost.action` before its own switch (after the prefix handlers and the
  keyguard's filter), for the view in front.
- Back: `navigateBack()` offers `StoreHost.back` first when no overlay is open.
- overlays: `renderOverlay()` asks the module in front for `overlay(c)` (jb-core.js); a string is drawn.
- keys: the keydown handler offers `StoreHost.key` where the app's own keys were.
- Clear data: `clearAppData()` already calls the module's `clearData`.

## Progress

| Step | What | Commit |
| --- | --- | --- |
| 1 | jb-core.js (`JB`), Calculator → jb-calculator.js | |
| 2–19 | Sound Recorder, Live wallpapers, Clock, Downloads, Play media apps, stock Google apps, extra apps, Messaging + Hangouts, Phone + People, Gallery + Camera, Calendar, Music, Email + Gmail, Browser + Chrome, Play Store, Settings (+ Daydream), Sound Search | see git log |
| 20 | Shell: lock screen (jb-keyguard.js), power (jb-power.js), volume (jb-volume.js), status / nav bar (jb-statusbar.js), shade (jb-shade.js), Recents (jb-recents.js), search swipe (jb-search.js), launcher (jb-launcher.js), keys (jb-keys.js) | see git log |
| fix | notification-open: `note` out of scope for non-calendar notifications | 71fc5d5f |

## Hooks the core offers (besides StoreHost's)

actionEarly / action (every module, where the click cases stood), submit, input, overlayEarly / overlay, back (screen in
front, open overlay or not; lines that stood after the overlay close check it), open / openUnlocked, mount, afterRender
and init(make, c) (every module), pointerMove / pointerUp (where the apps' branches stood), key. A module reads and sets
the core's variables live through `$c.name` (moduleApi getters / setters).

## Left (2026-11-28 evening)

- simulator.js (≈97 KB) is now only the core: state and save, render / renderApp / renderOverlay dispatch, openApp,
  navigateBack, the click / submit / input dispatch with the generic cases, the shared pointer handlers (they call the
  launcher, keyguard, shade and Recents through their modules), magnification, the tick, the page chrome.
- Step 4: rename it to jb-core.js (`window.JB = StoreHost` at load, the core started on DOMContentLoaded as mm-core.js
  does; all the screen's layers have z-indexes, so jb-scrollbar.js starting first changes nothing), remove the
  simulator.js tag, update tests that still read versions/4.3/simulator.js (global-actions' end-of-file regex, the
  remaining `${v}` loops: tests/lib/engine-source.cjs) and docs/tools that name it.
- Then a full `node tests/browser/ci.mjs 4.3` (the last full run was lost to a port clash: use your own port).
