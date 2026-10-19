# Tasks across every version

Changes the owner asked for that touch more than one version. Tick them off here when each version is done.

## Screen timeout: "Never" by default (owner, 2026-10-18)

The screen should not go off by itself after a minute or two. Every version starts with its Sleep / Screen timeout
setting at "Never", and the setting's list offers Never after the image's own entries (in the image's own "Never" text
where it has one). A version whose user picks a timeout keeps that behaviour.

- [x] 6.0.1: `screenTimeout` -1, Settings › Display › Sleep adds Never (Settings' battery_saver_turn_on_automatically_never); the keyguard's 10 s only with a timeout set
- [x] 5.1.1, 4.4.4, 4.3, 4.0.4: settings-detail.js `sleep: -1` with Never after the entries (i18n.js's Never, as the images' framework save_password_never), the timer only with a timeout, old saves' 30 s default moved to Never once (`data.sleepNever`)
- [x] 2.3.6: gb-settings.js `screenTimeout: 6`, the 7th entry framework save_password_never; no timer for it
- [x] 2.1: ec-core.js `screenTimeout ?? -1`, Screen timeout's list ends with framework save_password_never

## Clock widget on the home screen by default (owner, 2026-10-18)

A deliberate change from the factory home screen: most people put the clock on first, so every version starts with
its image's clock widget, as 5.1.1 already does.

- [x] 6.0.1: Clock's digital_gadget across the top of the first page (mm-launcher.js), added once to older saves
- [x] 5.1.1 (DeskClock digital), 4.4.4 (digital), 4.3 and 4.0.4 (analog, on the default page) already have one
- [ ] 2.3.6 and 2.1 keep their factory home screens (the owner's earlier "factory homes" decision); ask the owner whether the clock rule overrides it

## Android's own fading scrollbar (owner, 2026-10-18)

The page's native (Windows Chrome) scrollbars stay hidden, and a scrolling list shows the image's own scrollbar while
it moves, then fades it (View.onDrawScrollBars, the theme's scrollbarThumbVertical drawable, the version's fade
delay and duration).

- [x] 6.0.1: mm-scroll.js (scrollbar_handle_material 4 dp, colorControlNormal tint, 300 ms + 250 ms fade)
- [x] 5.1.1: lp-scrollbar.js / .css (shamu's scrollbar_handle_material is the same 4 dp shape)
- [x] 4.4.4 / 4.3 / 4.0.4: kk- / jb- / ics-scrollbar.js / .css (the image's scrollbar_handle_holo_dark on dark screens,
  _light on light ones, as a nine-patch border image 10 dp wide; 300 ms + 250 ms fade)
- [x] 2.3.6 / 2.1: gb- / ec-scrollbar.js / .css (scrollbar_handle_vertical, the grey nine-patch, on every theme; the
  fast-scroll thumb scrollbar_handle_accelerated_anim2 belongs to long lists with fastScrollEnabled and is not drawn)
