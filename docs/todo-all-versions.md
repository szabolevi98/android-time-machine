# Tasks across every version

Changes the owner asked for that touch more than one version. Tick them off here when each version is done.

## Screen timeout: "Never" by default (owner, 2026-10-18)

The screen should not go off by itself after a minute or two. Every version starts with its Sleep / Screen timeout
setting at "Never", and the setting's list offers Never after the image's own entries (in the image's own "Never" text
where it has one). A version whose user picks a timeout keeps that behaviour.

- [x] 6.0.1: `screenTimeout` -1, Settings › Display › Sleep adds Never (Settings' battery_saver_turn_on_automatically_never); the keyguard's 10 s only with a timeout set
- [ ] 5.1.1 (`data.settings.sleep`, simulator.js)
- [ ] 4.4.4
- [ ] 4.3
- [ ] 4.0.4
- [ ] 2.3.6 (gb-settings.js)
- [ ] 2.1 (`screenTimeout`, ec-core.js / ec-settings.js)

## Clock widget on the home screen by default (owner, 2026-10-18)

A deliberate change from the factory home screen: most people put the clock on first, so every version starts with
its image's clock widget, as 5.1.1 already does.

- [ ] 6.0.1
- [ ] check the others

## Android's own fading scrollbar (owner, 2026-10-18)

The page's native (Windows Chrome) scrollbars stay hidden, and a scrolling list shows the image's own scrollbar while
it moves, then fades it (View.onDrawScrollBars, the theme's scrollbarThumbVertical drawable, the version's fade
delay and duration).

- [x] 6.0.1: mm-scroll.js (scrollbar_handle_material 4 dp, colorControlNormal tint, 300 ms + 250 ms fade)
- [ ] 5.1.1 (same Material drawable as 6.0.1; check the image)
- [ ] 4.4.4 / 4.3 / 4.0.4 (Holo scrollbar_handle_holo_dark / _light nine-patches)
- [ ] 2.3.6 / 2.1 (scrollbar_handle_vertical / accelerated nine-patches)
