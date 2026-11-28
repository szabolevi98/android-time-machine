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
  in `init(c)` (Messaging's `c.openMessageThread`, Music's `c.saveMusic`, the launcher's `c.appIcon` ...).
- The hooks are asked of the open screen's module first, then of the other modules in the order they registered (the
  store apps aside; a spec registered for several views is asked once); a hook that takes the event returns true. The
  old code dispatched clicks by name only and guarded the rest by view, overlay or touch target, so asking every module
  keeps its behaviour; the few phases that need an order have hooks of their own.
  - the screen: `render(c)`, `drawn(c, root)` (right after the markup is in place), `mount(c, root)` (through the host,
    after the overlay and the translation), `rendering(c)` before every draw, `backdrop(c)` once the screen's classes
    are set (the live wallpaper), `rendered(c)` after every draw, open or not
  - opening: `launch(c, resume, app)` (before the lock check, as the old resets ran), `open(c, resume)` (before the
    screen switches), `goHome(c)` (the Home key)
  - clicks: `early(name, el, c)` before the lock check, `action(name, el, c)` after it
  - overlays: `beforeOverlay(c)` (true: the module took over, Recents' removed task), `ownOverlay(c)` (drawn as it is: not
    translated, no clings: Downloads, Gmail, Play Music, Voice Search), `overlay(c)` (the markup of `ui.overlay` when it
    is the module's, `undefined` otherwise) with `mountOverlay(c, root)`, then `afterOverlay(root, c)` (the launcher's
    folder animation and clings)
  - `submit(form, values, c)`, `input(event, c)`, `key(event, c)` (the navigation bar's module, loaded last, has Escape
    and Home), `contextmenu(event, c)`
  - `back(c)`: the module's part of the old Back chain; what came after the chain's "an overlay closes" step starts with
    `if (ui.overlay) return false`
  - the pointer pipeline (`p` is the core's pointer record; `touch` is the selector of a module's own gesture area):
    `pointerdown(event, p, c)` (all), `pointermove(event, p, dx, dy, c)`, then the core's list scrolling (`scrollstart(c)`
    when it starts), then `pointerdrag(...)` (the launcher's page swipe and icon drag); `pointerup(...)`, the list
    scrolling's end, `pointerdrop(...)` (the launcher's drop, the shade's swipe and pull); `pointercancel(c)` (all)
  - every second, in the order the modules registered: `clocks(c, now)` (the keyguard's countdown, the status bar's
    clock), the screen-off timeout, then `second(c, now)` (not `tick`, which the host already runs for its store apps)
  - `clearData(c)`: Settings › Apps › Clear data; `init(c)`: once, before the first draw; `start(c)`: once, after it
  - `scroller`: the screen's scrolling list (Recents keeps its scroll); `legacyMenu(c)`: the navigation bar's menu key
- No behaviour changes; the save format stays.

## The modules

Apps: `ics-calculator.js`, `ics-phone.js`, `ics-clock.js`, `ics-calendar.js` (also the framework's date / time pickers),
`ics-music.js` (AOSP Music and the playback service), `ics-browser.js`, `ics-people.js`, `ics-messaging.js`,
`ics-email.js`, `ics-gallery.js`, `ics-camera.js`, `ics-settings.js`, `ics-play-store.js`, `ics-downloads-app.js`,
`ics-gmail-app.js`, `ics-play-music-app.js`, `ics-google.js` (Google+, Talk, YouTube, Play Books, Play Movies, Search,
Voice Dialer, as ics-google-apps.js draws them together), `ics-stock-apps.js` (Maps, Latitude, Navigation, Places, Earth,
News & Weather, Messenger, Movie Studio, as their code was one block).

The shell: `ics-home.js` (home and the drawer: widgets, drag and drop, folders, clings, page swipe, Voice Search),
`ics-wallpapers.js` (the pickers and the live wallpaper engine), `ics-lock.js`, `ics-status.js` (the status bar),
`ics-shade.js`, `ics-recents.js`, `ics-power.js` (power key, power menu, shutdown, boot, waking), `ics-volume.js`,
`ics-keys.js` (the navigation bar and the computer's keys).

## Progress

- [x] `ics-core.js`, the module dispatch in simulator.js, Calculator (`ics-calculator.js`)
- [x] Clock, Calendar (with the framework pickers), Music, Phone, Browser, People, Messaging, Email
- [x] Gallery, Camera
- [x] Settings
- [x] Play Store, Downloads, Gmail, Play Music, the Google apps, the Maps family
- [x] The shell: status bar, lock screen, home and the drawer (widgets, folders, clings, wallpapers), shade, Recents,
      power menu, volume, keys
- [x] What is left into `ics-core.js` (started on DOMContentLoaded, once every module has registered), simulator.js deleted

## How it was checked

Besides `npm test` and `node tests/browser/ci.mjs 4.0.4` before each push (three unit tests fail only in a Windows
checkout with CRLF line endings: asset-inventory, sitemap, text-tables), each step was compared with the code before
the migration (3585865f) in headless Chrome: a fixed walk through every app (open it, click the visible controls in a
fixed order, Back every tenth step) and a set of gestures with real touch and mouse input (page swipes, long-press drags
of icons, widgets and folder items, the drawer, the shade, Recents, the lock slide, the photo stack, the calculator and
gallery swipes), comparing the structure of the screen and the saved layout after every step, and the exceptions.
