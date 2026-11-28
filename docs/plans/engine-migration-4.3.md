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
