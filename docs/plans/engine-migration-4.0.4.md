# Engine migration: 4.0.4

4.0.4's part of [engine-migration.md](engine-migration.md): `versions/4.0.4/simulator.js` moves onto the module core,
following the pattern of 2.3.6's Calculator (commit 3585865f).

## The design

- `ics-core.js` names the module host `ICS` (`window.ICS = window.StoreHost`, store-apps/legacy-host.js), loaded right
  after legacy-host.js; every screen is a module, `ICS.register('<view>', {...})`, in its own `ics-<view>.js` (where the
  app's logic file already has that name, e.g. ics-gmail.js from a template, the module is `ics-<view>-app.js`).
- legacy-host.js is not changed for 4.0.4: the core calls the module hooks itself (`ICS.module(id)`), so the host's own
  paths (render, mount, the store apps' action, Back, Clear data) work as they did.
- One context `c` for every hook (the core's state with getters, the shell's drawing and navigation, shared helpers);
  `storeContext()` = `StoreHost.context(c)` adds the host's dialog and menu. A module may add the helpers it shares to `c`
  in `init(c)` (Messaging's `c.openMessageThread`, Music's `c.saveMusic` ...).
- The hooks, asked of the open screen's module first, then of the other modules in the order they registered (the store
  apps aside); a hook that takes the event returns true:
  - `render(c)`, `mount(c, root)`: the screen (through the host, as before)
  - `action(name, el, c)`: a click on `data-action` (the old click switch was by name only, so every module is asked);
    `early(name, el, c)`: the clicks handled before the lock check
  - `overlay(c)`: the markup of `ui.overlay` when it is the module's (`undefined` otherwise), `mountOverlay(c, root)`
  - `submit(form, values, c)`, `input(event, c)`, `key(event, c)`, `contextmenu(event, c)`
  - `back(c)`: the module's part of the old Back chain; what came after the chain's "an overlay closes" step starts with
    `if (ui.overlay) return false`
  - `pointerdown(event, p, c)` (all), `pointermove(event, p, dx, dy, c)`, `pointerup(event, p, dx, dy, c)`,
    `pointercancel(c)` (all): `p` is the core's pointer record; `touch`: the selector of the module's own gesture area
  - `second(c, now)`: every second (not `tick`, which the host already runs every second for its store apps)
  - `rendered(c)`: after every draw, open or not; `clearData(c)`: Settings › Apps › Clear data; `init(c)`: once
  - `scroller`: the selector of the screen's scrolling list (Recents keeps its scroll); `legacyMenu(c)`: the
    navigation bar's menu key
- No behaviour changes; the save format stays.

## Progress

- [x] `ics-core.js`, the module dispatch in simulator.js, Calculator (`ics-calculator.js`)
- [x] Clock, Calendar (with the framework pickers), Music, Phone, Browser, People, Messaging, Email
- [ ] Gallery, Camera
- [ ] Settings
- [ ] Play Store, Downloads, Gmail, Play Music, the Google apps, Maps / Navigation / Places / Latitude, Earth,
      News & Weather, Messenger, Movie Studio
- [ ] The shell: status bar, lock screen, home and the drawer (widgets, folders, clings, wallpapers), shade, Recents,
      power menu, volume, keys
- [ ] What is left into `ics-core.js`, simulator.js deleted

Tests: `npm test` (three tests fail only in a Windows checkout with CRLF line endings: asset-inventory, sitemap,
text-tables) and `node tests/browser/ci.mjs 4.0.4` before each push.
