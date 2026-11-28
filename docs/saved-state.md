# Saved state

Each Android version keeps its own save in `localStorage`, under its own key; the versions never read each other's
save. The interface language is the only shared entry. All reads and writes go through `state.js` (`AndroidState`, audit
point 13).

| Version | Key | Revision markers |
|---|---|---|
| 2.3.6 | `android-time-machine-gb-v1` | `layoutRevision` (3) |
| 4.0.4 | `android-time-machine-ics-v1` | `layoutRevision` (3), `wallpaperRevision` (1) |
| 4.3 | `android-time-machine-jb-v1` | `layoutRevision` (3), `wallpaperRevision` (2) |
| 4.4.4 | `android-time-machine-kk-v1` | `layoutRevision` (6) |
| 5.1.1 | `android-time-machine-lp-v1` | `layoutRevision` (1, no upgrade uses it yet) |
| all | `android-time-machine-language` | – (`en`, `hu`, `de`, `fr`, `es`; i18n.js) |

## What a save holds

One JSON object: `defaultData` of the version's `simulator.js` (2.3.6: `gb-core.js`) with the visitor's changes. The top-level fields:

- desktop: `wallpaper` (index into the version's own wallpaper list; a picked photo is `customWallpaper` /
  `customWallpaperPhoto` with its own slot, `'custom'` on 4.3), `liveWallpaper` / `lwPrefs`, `homePages` (one array of cells per page; a cell is an app id or `null`),
  `homeWidgets` (one array per page: `{id, type, x, y, width, height, …}`), `dock`, `folders`, `clings` (the
  launcher's first-run tips already dismissed), `protips` (2.3.6)
- `settings`: every Settings switch and value (merged over the defaults one level deep, so a new setting gets its default)
- app data: `contacts`, `contactGroups`, `callHistory` (5.1.1), `messages`, `photos`, `events`, `calendarFired`,
  `alarms`, `bookmarks`, `browserHistory`, `sentEmails`, `mailbox`, `gmailbox` / `gmail40`, `keepNotes`,
  `hangoutChats` (4.3), `notifications`, `lockAttempts`

## Loading

`AndroidState.load(key, defaults, build, steps)` (see the comment at the top of `state.js`):

1. Nothing saved: a fresh copy of the defaults.
2. Unreadable JSON: the text is kept under `<key>:unreadable`, the phone starts fresh, the visitor is told.
3. A top-level field of the wrong kind (array, object, string, number, boolean) takes its default alone.
4. `build`: the version's merge, `{...defaults, ...saved, settings: {...defaults.settings, ...saved.settings}}`.
5. `steps`: the version's upgrades, in order, each `[name, (result, saved) => …]`. Each runs on its own: one that throws
   is reported by name (`AndroidState.problems`, a toast) and the others still run.

Every problem reaches `AndroidState.onProblem`; the versions show one toast per kind in the visitor's language.

## Upgrade steps

A step is one of two kinds:

- **Repair**, safe to run on every load: it only changes data that is still in an old shape (for example `pages of 12
  cells to 16`, `unfinished photo frame`). Running it again changes nothing.
- **Revision**, run once: it checks a marker (`(saved.layoutRevision || 0) < n`), changes the save and sets the marker
  to `n`. A new desktop or wallpaper default that must replace old saves gets the next number of its marker; the
  default in `defaultData` carries the newest number, so a fresh save never runs it.

New steps go at the end of the list; a step is never renumbered or removed while saves that need it may exist.

| Step | 2.3.6 | 4.0.4 | 4.3 | 4.4.4 | 5.1.1 | Kind |
|---|---|---|---|---|---|---|
| live wallpaper on first boot only |  | ✓ |  |  |  | repair (Phase Beam only for a new save) |
| clings of an older save |  | ✓ | ✓ | ✓ | ✓ | repair (tips counted as seen) |
| old third page shortcuts | ✓ | ✓ | ✓ | ✓ |  | repair |
| pages of 12 cells to 16 | ✓ | ✓ | ✓ | ✓ |  | repair |
| missing widget pages | ✓ | ✓ | ✓ | ✓ | ✓ | repair |
| layout revision 2 | ✓ | ✓ | ✓ | ✓ |  | revision (the untouched old demo desktop is replaced) |
| layout revision 3 | ✓ | ✓ | ✓ | ✓ |  | revision (the factory desktop; on 4.4.4 the Launcher3 tips) |
| layout revision 4–6 |  |  |  | ✓ |  | revision (stock Nexus 5 desktop, its clock, the Google folder) |
| widget page for every page, no widget page without a page |  |  |  | ✓ | ✓ | repair |
| old photo frame size, photo frame size | ✓ | ✓ | ✓ | ✓ | ✓ | repair (2.3.6 has both) |
| unfinished photo frame | ✓ | ✓ | ✓ | ✓ | ✓ | repair |
| custom wallpaper slot | ✓ | ✓ | ✓ | ✓ | ✓ | repair |
| wallpaper revision 1 |  | ✓ | ✓ |  |  | revision (wallpaper index in the image's order) |
| wallpaper revision 2 |  |  | ✓ |  |  | revision (Phase Beam no longer the default) |
| apps no longer on the image |  |  |  | ✓ | ✓ | repair (removed apps' shortcuts and widgets) |
| live wallpapers of the image |  |  |  | ✓ | ✓ | repair |

## Checks

- `tests/state.test.cjs`: unreadable JSON, wrong kinds, missing parts, a failing build, a failing step, a full storage,
  save and reload.
- `tests/browser/flows.mjs`: on every version a changed setting survives a reload; the same save then has its revision
  markers and clings removed and loads twice without a problem.
