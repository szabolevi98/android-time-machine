# Engine migration: 5.1.1

5.1.1's part of docs/plans/engine-migration.md: `versions/5.1.1/simulator.js` (4,445 lines on 2026-11-28) moved onto
the module core, screen by screen, until it was gone (done the same day).

## How the code moved

- `lp-core.js` is the core. Its header lists the hooks; it is laid out like versions/2.1/ec-core.js (the saved state
  and `ui`, what the image has, the context `c`, the phone, render, open / home / back, toasts, renderOverlay, the
  click / form / field dispatch, the gestures, the keys, the cold boot, the site controls, the device clock's tick,
  start). Its `start()` runs on DOMContentLoaded, after every module has loaded (simulator.js was the page's last
  script).
- It names the host `LP` (= `StoreHost`, store-apps/legacy-host.js) and adds what the moved screens need (it refuses
  a name the host already has):
  - `LP.define(id, factory)`: a screen's module. The factory gets the core's bindings (`{ui, render, safe, ...}`) and
    `lp` (`LP.live`); it returns the module (`render`, `click`, `submit`, `input`, `overlays`, `overlay`, `back`,
    `key`, `clearData`, the pointer hooks...). `LP.start()` runs the factories once the core has given its bindings.
  - `LP.kernel(getters)`: the core's bindings, live (the block at the end of `start()` lists the ones modules use).
    A binding that is reassigned (`data` on Reset, `pointerStart`, `suppressClickUntil`) is read as `lp.<name>`;
    the others are destructured once. A function a module shares with the core or other modules is added to `lp`
    (`Object.assign(lp, {...})`) and called as `lp.<name>()` there.
  - `LP.dispatchClick / dispatchSubmit / dispatchInput / drawOverlay`: the click switch, the submit switch, the input
    handler and renderOverlay offer their event to the modules first, at the place the moved cases were (the
    switches' cases left whole, so the order could not change). The store apps keep the host's view-scoped hooks.
- The code moved unchanged: a scratch tool cut the statements, switch cases and handler blocks by their syntax tree
  and rewrote only the references described above. Where order matters (Back, the pointer handlers, openApp,
  render), the core calls the module's hook at the line the code left (`LP.module('<id>').back()`...).
- The gesture pipeline (one `pointerStart` from pointerdown to pointerup / cancel) stays in the core and calls the
  modules' pointer hooks in the old order; the card swipe Recents and the notifications share stays in it.
- Library files that unit tests load on their own (lp-downloads.js, ...) stay libraries: a screen whose library has
  its name gets `lp-<app>-app.js`.
- Tests that looked into simulator.js read `tests/lib/engine-source.cjs` (simulator.js while it lasted, the core and
  the modules) instead.

## Modules

| Step | Screens | Module |
| --- | --- | --- |
| 1, 4 | the core | lp-core.js |
| 2 | Calculator | lp-calculator.js |
| 2 | Downloads | lp-downloads-app.js |
| 2 | Wallpaper picker | lp-wallpaper-picker-app.js |
| 2 | Live Wallpapers | lp-live-wallpapers.js |
| 2 | Document picker | lp-docpicker-app.js |
| 2 | Camera | lp-camera-app.js |
| 2 | Clock | lp-clock.js |
| 2 | Calendar (with its date, time and time zone pickers) | lp-calendar.js |
| 2 | Contacts (People) | lp-people.js |
| 2 | Phone | lp-phone.js |
| 2 | Messenger and Hangouts | lp-messaging.js |
| 2 | Email and Gmail | lp-mail.js |
| 2 | Chrome | lp-chrome.js |
| 2 | Play Store | lp-play-store.js |
| 2 | Play Music, Movies, Books and Games | lp-play-apps.js |
| 2 | Photos | lp-photos.js |
| 2 | Google apps (Search and Now, Voice Search, Maps, Drive, Keep, YouTube, Google+, Earth, News & Weather, Google Settings) | lp-google-apps.js |
| 2 | Docs, Sheets, Slides, Fit, Newsstand, Wallet | lp-extra-apps-app.js |
| 2 | Settings (with Print, cell broadcasts, users, security, Interruptions, Daydream's settings) | lp-settings.js |
| 3 | Volume panel | lp-volume.js |
| 3 | Power key, global actions, power off and boot | lp-power.js |
| 3 | Daydream (the screen saver) | lp-dream.js |
| 3 | Recents and screen pinning | lp-recents-app.js |
| 3 | Status bar and navigation bar (with the search panel swipe and the immersive bars peek) | lp-statusbar.js |
| 3 | Lock screen (keyguard, bouncer, its widgets and notifications) | lp-lock.js |
| 3 | Notification shade and Quick Settings (heads-up, peek, pull, brightness dialogs) | lp-shade-panel.js |
| 3 | Home screen and app drawer (widgets, folders, clings, shortcuts, drag and drop, page swipes, widget resize) | lp-home.js |

## Fixes on the way

All three were bugs of the migration itself, fixed as soon as a check found them:

- `LP.overlay` replaced the host's `StoreHost.overlay` (LP is the host object), so the store apps' dialogs drew
  nothing; it is `LP.drawOverlay`, and lp-core.js refuses a host name.
- Chrome's menu became the AOSP Browser's (an exact-name overlay is tried before an `overlay(name)` hook); one
  overlay draws both again.
- A `let` the core stopped writing lost its setter (`closingVelocity`); every `let` gets one.

## Checks

`npm test` (asset-inventory, sitemap and text-tables fail on a CRLF checkout, on main too) and
`node tests/browser/ci.mjs 5.1.1` plus `5.1.1b`, with the worktree served on port 8194.
