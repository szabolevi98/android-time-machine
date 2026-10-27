# Launcher drag ownership and wallpaper continuity

## Android 6.0.1

Animated window changes replace `#viewport`. The launcher's old document-level pointer handlers were stored on the
discarded viewport and survived its removal. They then consumed gestures intended for the new launcher. The browser
regression reproduced failure to create page two after three app round trips before the fix.

The core now calls the leaving module's optional `unmount` hook. The launcher owns one cleanup function in its UI
state, releases listeners and pending long-press timers on unmount/remount, and cancels an active drag when leaving.
Pointer cancellation clears drag mode without moving or deleting an item.

Real phone-sized touch input also exposed native browser panning cancelling an icon drag. A non-passive touchmove
handler prevents that pan only while an item is being dragged, including a drag handed off from the drawer.

## Android 7.1.2

Recents used a fixed `left top / auto 100%` wallpaper instead of the saved home crop. The regression recorded
`0% 0%, auto 100%` in Recents versus the selected `73% 28%, auto 140%` on Home before the fix.

Recents now uses the same wallpaper position and size variables as Home. The outgoing window animation paints its
wallpaper in a screen-sized layer, offset by the viewport's top inset. This preserves percentage-based pan and zoom
on both axes instead of reinterpreting the crop against the smaller viewport.

## Regression coverage

`node tests/browser/launcher-lifecycle.mjs` is part of `npm run test:browser`:

- 6.0.1: three app round trips, stable document listener count, edge-hold creation of page two, no lost/duplicated
  item, Remove, drawer-to-home drag, folder removal, pointer cancellation and unchanged saved items after cancellation.
  Runs with desktop mouse, phone touch and reduced motion.
- 7.1.2: saved off-centre zoomed crop remains identical in Home, Recents and the outgoing animation; the snapshot's
  wallpaper occupies the original screen bounds. Runs at desktop and phone widths.

Companion checks: the 275 unit tests, Marshmallow browser flows, the existing Nougat wallpaper interaction suite
and the Nougat release gate.
