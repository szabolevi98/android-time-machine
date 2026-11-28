# Engine migration: 5.1.1

5.1.1's part of docs/plans/engine-migration.md: `versions/5.1.1/simulator.js` (4,445 lines on 2026-11-28) moves onto
the module core, screen by screen, until it is gone.

## How the code moves

- `lp-core.js` names the host `LP` (= `StoreHost`, store-apps/legacy-host.js) and adds what the moved screens need:
  - `LP.define(id, factory)`: a screen's module. The factory gets the core's bindings (`{ui, render, safe, ...}`) and
    `lp` (`LP.live`); it returns the module (`render`, `click`, `submit`, `input`, `overlays`, `back`, `key`,
    `clearData`, the pointer hooks...). `LP.start()` runs the factories once simulator.js has given its bindings.
  - `LP.kernel(getters)`: simulator.js's bindings, live (the `lp:kernel` block at its end lists the ones modules use).
    A binding that is reassigned (`data` on Reset, `pointerStart`, `suppressClickUntil`) is read as `lp.<name>`;
    the others are destructured once. A function a module shares with the core or other modules is added to `lp`
    (`Object.assign(lp, {...})`) and called as `lp.<name>()` there.
  - `LP.click / LP.submit / LP.input / LP.overlay`: the click switch, the submit switch, the input handler and
    renderOverlay offer their event to the modules first, at the place the moved cases were (the switches' cases
    leave whole, so the order cannot change).
- The code itself moves unchanged (a scratch tool cuts the statements, switch cases and handler blocks by their syntax
  tree and rewrites only the references described above). Where order matters (Back, the pointer handlers, the keys),
  simulator.js calls the module's hook at the line the code left.
- Library files that unit tests load on their own (lp-downloads.js, ...) stay libraries: a screen whose library has
  its name gets `lp-<app>-app.js`.
- Tests that look into simulator.js read `tests/lib/engine-source.cjs` (simulator.js plus the modules) instead.

## Progress

| Step | Screens | Module | State |
| --- | --- | --- | --- |
| 1 | the core | lp-core.js | started |
| 2 | Calculator | lp-calculator.js | moved |
| 2 | Downloads | lp-downloads-app.js | moved |
| 2 | Wallpaper picker | lp-wallpaper-picker-app.js | moved |
| 2 | Live Wallpapers | lp-live-wallpapers.js | moved |
| 2 | Document picker | lp-docpicker-app.js | moved |
| 2 | Camera | lp-camera-app.js | moved |
| 2 | Clock | lp-clock.js | moved |
| 2 | Calendar (with its date, time and time zone pickers) | lp-calendar.js | moved |
| 2 | Contacts (People) | lp-people.js | moved |
| 2 | Phone | lp-phone.js | moved |
