# Engine migration: 2.3.6–5.1.1 onto the module core

Agreed with the owner on 2026-11-27 (after the store apps, docs/plans/play-apps.md); started 2026-11-28.

## Why

2.1 (`EC`), 6.0.1 (`MM`) and 7.1.2 (`NG`) are built on one design: a small core (ec-core.js, mm-core.js, ng-core.js,
about 400 lines) routes everything, and every screen is a module that registers itself:

```js
EC.register(id, {title, render(c), mount(c, root), action(name, el, event, c), submit(form, event, c), back(c),
                 menu(c), tick(c, now), ...})
```

2.3.6, 4.0.4, 4.3, 4.4.4 and 5.1.1 each have one big `simulator.js` (2,800–4,400 lines) whose render switch, click
switch (350–680 cases) and Back chain know every app. A fix in one place (the drawer swipe, the store apps' wiring)
has to be made five times, in five slightly different closures. The goal: all eight versions on the same design, each
with its own modules and look.

## How

Step by step, every step shippable with the tests green (the "strangler" way: the new design grows around the old one
until the old one is empty).

1. **The host.** `store-apps/legacy-host.js` (StoreHost) is already a module host with the core's hooks (render,
   mount, action, back, menu, tick, clearData) and the five simulator.js files already ask it first when they draw,
   take a click, go Back and open the Menu. It learns the missing hooks (submit, open) and takes any screen, not only
   the store apps. Each version names it as its core will be named: `GB` (2.3.6), `ICS` (4.0.4), `JB` (4.3), `KK`
   (4.4.4), `LP` (5.1.1), in a `<pfx>-core.js` that starts as that one line and grows.
2. **The apps, one by one.** An app's screen, its click cases, its Back and Menu handling, its state and its gestures
   move from simulator.js into its own module (`gb-calculator.js` registers `GB.register('calculator', {...})`); the
   module attaches its own pointer and key listeners in `mount`, as 2.1's do. One app per commit; the smoke CI on every
   push, the version's full browser job (Actions › Tests › Run workflow) after each app.
3. **The shell.** The status bar, the lock screen, home and the drawer, the shade, Recents, the power menu, the volume
   panel and the keys become modules the same way.
4. **The core.** What is left of simulator.js (the saved state, render, the click and key dispatch, the device clock)
   moves into `<pfx>-core.js`, and simulator.js is deleted.

Order: 2.3.6 first (it already has `GBApps.register` for its Google apps, which folds into `GB`), then 4.0.4, 4.3,
4.4.4, 5.1.1.

## Target

Owner, 2026-11-28: no single shared core; each version keeps its own core, but the eight must look alike. So every
`<pfx>-core.js` follows ec-core.js's layout (header with the hook list, the saved state and `ui`, the context `c`,
render / renderOverlay, open / home / back, the click, form and key dispatch, the device clock, the site controls),
and modules use the same hook names as EC / MM / NG.

## Rules

- No behaviour changes on the way: a step moves code, it does not fix or redesign. A bug found on the way is fixed in
  its own commit.
- The per-version look stays per version (no shared CSS); only logic may be shared, as store-apps/ is.
- The save format stays: a module reads and writes the same `data` fields, so a phone saved before a step loads after
  it.

## Progress

- 2026-11-28: the plan; CI changed for the long series of commits (a smoke check per push, the full flows nightly and
  on demand).
- 2026-11-28: each version migrated in its own session and worktree; progress in docs/plans/engine-migration-<v>.md.
  A finished branch is checked by the full CI on it (Actions › Tests › Run workflow on the branch, clean Linux
  runners), then on a trial merge with main, before main gets it.
- 2026-11-28: **4.0.4 and 4.3 done** and live (d224b464): their simulator.js is gone; ics-core.js and jb-core.js plus
  modules. Found on the way and fixed on main: 2.3.6's Clock settings (Menu › Settings) drew the clock (667ceedf), and
  the host's key hook tripped over the store apps' `key` field (9552645e).
