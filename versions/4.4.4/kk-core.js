/* Android 4.4.4's core, as it grows out of simulator.js (docs/plans/engine-migration.md). Every screen moves into a
   module that registers itself, as 2.1's (EC), 6.0.1's (MM) and 7.1.2's (NG) do:
     KK.register(id, {render(c), mount(c, root), back(c), key(event, c), open(c, resume), clearData(c), tick(c),
                      click(action, button, c, event), submit(form, event, c, values), input(event, c), overlay(c),
                      gestureDown(event, c), gestureMove(event, dx, dy, c), gestureUp(event, dx, dy, c), gestureCancel(c),
                      second(now, c), init(c)})
   The view hooks (render to clearData) are store-apps/legacy-host.js's and run for the screen in front. The others are
   the core's: the click, submit and input events and the overlay to draw are offered to every module in turn (a case
   can be reached from the shade, a widget or another app), the gestures join the shared pointer handling (pointerStart),
   second runs with the device clock and init once at the start. For now simulator.js hosts the modules and gives them
   its context `c` (kkScope: the shell's bindings by name), plus c.dialog(spec) and c.menu(items) from the host. */
window.KK = window.StoreHost;
