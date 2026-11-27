# Store apps that work — plan

Started 2026-11-27 (owner: "kezdheted … inkább legyen jó"). Every version's store (Market 1.71 / 2.3.4, Play 3.4.7 …
7.4.31) sells a few made-up apps. They install, but none of them works yet. The goal is the whole "installed from the
store" experience, in the look of each version's own time:

- **Install:** the store installs the app as it does today (permissions, progress bar, notification).
- **Launcher:** the app shows up in the app drawer, and from Play 4.x on also on the home screen, as the version's
  Play does (its "Add icon to Home screen" setting).
- **Use:** it opens from the drawer, the home screen, the store's Open button and Recents, and it works.
- **Settings:** it is listed under Settings › Apps (size, Force stop, Clear data, Uninstall).
- **Uninstall:** it can be removed from the store or from Settings, and its icon goes away.

The apps are the simulator's own fiction: no image has them, so there is no APK to follow. Their look follows the
version's UI conventions of the time (see "Era look" below), and they never borrow a later version's look.

## Today (2026-11-27)

| Version | Store module | Fictional apps | What "Open" does now |
| --- | --- | --- | --- |
| 2.1 | `ec-market.js` (`CATALOG`) | Orbit Hopper, Pixel Blocks, Lunar Golf, Pocket Planner | "notlaunched" dialog; not in the drawer |
| 2.3.6 | `gb-market.js` + `simulator.js` `gbmk-open` | Lunar Golf, Pocket Planner | toast "Unavailable" |
| 4.0.4 | `ics-play.js` + `simulator.js` `icsp-open` | Lunar Golf, Pocket Planner | toast "Unavailable" |
| 4.3, 4.4.4, 5.1.1 | `jb-play.js`, `kk-play.js`, `lp-play.js` + `simulator.js` `jbp-open` | Lunar Golf, Pocket Planner | toast "Unavailable" |
| 6.0.1 | `mm-play.js` (`FICTION`, module `fiction-app`) | 8 apps and 4 games (Trail Notes … Star Courier) | placeholder card; not in the drawer |
| 7.1.2 | `ng-play-model.js` (`FICTION`, `register()` → `NG.appsData['demo-<id>']`) | the same 12 | placeholder card (`NG.playDemo`); in the drawer and on home |

## The apps

Two rounds, three apps each; each round ships complete in all eight versions before the next one starts.

- **Round 1**
  - **Pocket Planner** (Quiet Tools, Productivity): the week on one page. Each day has its tasks; you add, tick off,
    edit and delete them, move between weeks, and clear the completed ones. Tasks are kept in the phone's save.
  - **Lunar Golf** (Crater Games, game): a short course in low gravity. Drag to aim and set the power, and the ball
    flies under lunar gravity between craters to the flag. It counts strokes per hole and keeps the best score.
  - **Orbit Hopper** (Moonlight Studio, game): tap to jump from one orbiting planet to the next and collect stars. It
    keeps a high score.
- **Round 2 (after round 1 is done)**
  - **Focus Timer**: work and break sessions, and a notification when a session ends.
  - **Daily Weather**: the demo city's week.
  - **Pixel Blocks**: its own block puzzle, not a copy of a known game.

Every version's store sells the round's apps. 6.0.1 and 7.1.2 add them to their `FICTION` lists; 2.3.6–5.1.1 add Orbit
Hopper where it is missing. An app that works is free in every catalogue (the simulator sells nothing; Pocket Planner
was $1.99 in 2.1–5.1.1 before).

## Code design

- **Shared logic, per-version look.** Each app's model lives once at the repository root: `store-apps/<app>.js`. It
  holds the data rules, the game physics and the app's own texts in all five languages, and it draws no HTML. Each
  version renders the app in its own file with its own CSS, so no look is shared. That is how `mms-prefs.js` is shared
  today, and it keeps 2.1's rule that only logic is copied (`docs/plans/2.1.md`). `tests/version-files.test.cjs` must
  allow the shared files.
- **Module core (2.1, 6.0.1, 7.1.2).** Each app is an `EC/MM/NG.register('store-<app>', …)` module. The store's Open
  button, the drawer and Recents all open that module.
- **2.3.6–5.1.1.** A small host in each `simulator.js` runs register-style modules: `render(ctx)`, `mount`, `action`,
  `submit` and `back`, with the version's dialog, menu and toast. It is the first step of the later move of these five
  versions onto the module core. 2.3.6 has `GBApps.register` already;
  4.0.4–5.1.1 get the same kind of host.
- **Saved state:** `data.storeApps.<app>` in every version. Factory reset clears it, like any app's data. Uninstalling
  removes the app's data too.

## Era look

| Era | Versions | Chrome |
| --- | --- | --- |
| Eclair / Gingerbread | 2.1, 2.3.6 | The app's title bar, dark list rows, options from the Menu key, AlertDialog with EditText |
| Holo | 4.0.4, 4.3, 4.4.4 | Action bar with the app icon and title, action items with overflow (4.0.4: the Menu key too) |
| Material | 5.1.1, 6.0.1, 7.1.2 | Coloured toolbar and status bar, floating action button, cards, Material dialogs |

The apps keep their own brand colours: Planner #2a6fbd, Golf #0c1022, Orbit #152049. The art is the catalogue's own
SVG icons, our own drawings.

## Done means

Following the owner's "done means done" rule, for each app and each version:

- install from the store, then the icon appears in the drawer (and on home where the store adds it)
- the app opens from the drawer, home, the store and Recents, and Back works
- it is listed in Settings › Apps, and uninstalling removes the app and its data
- the texts exist in all five languages (hu, en, de, fr, es)
- it works at desktop size and at phone width
- unit tests cover the shared model; a browser test runs install → open → use → uninstall in every version

## Progress

- 2026-11-27: Pocket Planner works in all eight versions (store-apps/pocket-planner.js; ec-, gb-, ics-, jb-, kk-, lp-,
  mm-, ng-store-planner.js; store-apps/legacy-host.js hosts it on 2.3.6–5.1.1). tests/store-pocket-planner.test.cjs
  covers the logic, tests/browser/store-apps.mjs installs, opens, uses and uninstalls it in every version.
- 2026-11-27/28: Lunar Golf and Orbit Hopper work in all eight versions. A game draws itself on its canvas (its own
  art, as games had in every era), so its rules, physics, texts and drawing are shared (store-apps/lunar-golf.js,
  store-apps/orbit-hopper.js); each version only wires it (ec-, gb-, ics-, jb-, kk-, lp-, mm-, ng-store-games.js): full
  screen, New game from the Menu key on 2.1 and 2.3.6, a button of the game's own on the others. Lunar Golf is free in
  every catalogue now. tests/store-lunar-golf.test.cjs plays every hole; tests/store-orbit-hopper.test.cjs hops ten
  planets; tests/browser/store-apps.mjs installs, opens and uninstalls all three apps in every version.
- Round 1 is done.
- 2026-11-28: Focus Timer (round 2) works in all eight versions (store-apps/focus-timer.js; ec-, gb-, ics-, jb-, kk-,
  lp-, mm-, ng-store-focus.js). Its session runs from the end time it keeps, so it ends while the app is closed and
  posts the version's notification; store-apps/legacy-host.js now gives the older versions' apps a tick every second
  (StoreHost.provide) and notify(). The older catalogues sell it next to Pocket Planner.
- 2026-11-28: Daily Weather (round 2) works in all eight versions (store-apps/daily-weather.js; ec-, gb-, ics-, jb-,
  kk-, lp-, mm-, ng-store-weather.js): Riverside's made-up forecast, the same for everyone on a given day and hour (from
  the date, with the season's means), now, the next hours and seven days; Celsius or Fahrenheit (a Units dialog on the
  older versions, checked menu items on 6.0.1 and 7.1.2) and Refresh. tests/store-daily-weather.test.cjs.
- 2026-11-28: Pixel Blocks (round 2) works in all eight versions: the store's own block puzzle (store-apps/pixel-blocks.js),
  tap a group of two or more blocks of one colour to clear it (n × (n − 1) points), the blocks fall and empty columns
  close up, a cleared board scores 500 more, the best score is kept. It is the catalogues' existing 'blocks' item; the
  games files wire it next to Lunar Golf and Orbit Hopper. tests/store-pixel-blocks.test.cjs plays a game to its end.
- Round 2 is done: six store apps install, open, show in Settings › Apps and uninstall with their data in every
  version (tests/browser/store-apps.mjs, 48 runs).
