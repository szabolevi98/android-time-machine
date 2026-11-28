# Engine migration: 2.3.6

2.3.6's part of [engine-migration.md](engine-migration.md): `versions/2.3.6/simulator.js` moves into `gb-core.js` and
one `GB.register(id, {...})` module per screen.

## How a screen moves

- The click cases go verbatim into the module's `action(name, el, c)` (docs/tools/migrate.py), the form cases into
  `submit(name, values, c)`, the field handlers into `input(event, c)`, the Back steps into `back(c)`, the Menu key's
  items into `menu(c)` (`c.gbMenu(items)`), the AlertDialog specs into `dialog(kind, c)`, Clear data into
  `clearData(c)`.
- The screen's helpers move with it, inside a `shell(c)` function that takes the shell's bindings from `c` and returns
  them with the helpers, so the moved code keeps its names.
- Gestures go into `mount(c, root)`, on the screen's own element (`root.firstElementChild`, drawn anew by every
  render); long presses use `GB.hold`, drags `GB.gesture`.
- Tests that look for a piece of the engine read `tests/lib/engine-source.cjs` ('2.3.6'): the version's scripts as
  index.html loads them.
- A click goes to the module in front, then to the shell's own cases; one neither takes goes to the other modules (the
  shade's ongoing call returns to Phone this way); a form likewise.
- An app's settings screen (GBPrefs, Menu › Settings) is drawn over its view: while it is open the module is not in
  front (`moduleView()` in the shell).

## Progress

| Screen | Module | Commit |
| --- | --- | --- |
| Calculator | gb-calculator.js | 3585865f |
| Downloads, Search | gb-downloads.js, gb-search.js | ef14be02 |
| Clock | gb-deskclock.js | 6dfac9b3 |
| Music | gb-music.js | 2d85c4d4 |
| Calendar | gb-calendar.js | 23788113 |
| Gallery | gb-gallery.js | 9d8d8e72 |
| Camera | gb-camera.js | 965c3e4a |
| Email | gb-email.js | 1537deba |
| Messaging | gb-mms.js | 77737d05 |
| Phone, Contacts | gb-phone.js | a2683caf |
| Browser | gb-browser.js | f1a071a4 |
| Settings | gb-settings.js | 9ef7cef0 |
| Market | gb-market.js | 2ae2c24f |
| Live wallpapers, wallpaper picker | gb-wallpapers.js (new) | 89eacdf4 |
| The Google apps (GBApps.register is a GB module) | gb-apps.js | 72357291 |
| App settings screens (GBPrefs) | gb-prefs.js (the prefs module) | |

Bugs fixed on the way (their own commits):

- Clock › Menu › Settings drew the clock: the module host was asked before GBPrefs (`moduleView`). `GB.hold` added its
  listeners to `#viewport` on every render; they go on the screen's element now, and a right mouse button no longer
  starts the long press.
- Back (the touch key or Escape) on Settings' screen lock setup cancelled the setup even with the shade or a dialog
  open over it, which then stayed: the overlay closes first now.
- The Menu key over a Google app's settings screen (Gmail, Talk, YouTube, Maps…) opened the app's own menu: the
  settings screen is asked first now (it has none, or Restore default settings).

Notes:

- Calendar: `data-gbcal-swipe` (the vertical swipe) is not drawn by GBCalendar, so that branch moved as it was but is
  not reached; Day and Week swipe horizontally (`data-calendar-swipe`). The inherited ICS overlay branch
  (`calendar-views`, `calendar-menu`) stays in the shell; GBCalendar does not open it.
