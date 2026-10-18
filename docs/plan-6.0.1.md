# Android 6.0.1 on the Nexus 5X — plan

Started 2026-10-16. Build: **MTC20K** (`google/bullhead/bullhead:6.0.1/MTC20K/3142008`, security patch 2016-09-06), the
last 6.0.1 build Google published for the Nexus 5X before 7.0. Folder `versions/6.0.1`, era prefix `mm-` (Marshmallow).
The frame (`device-frames.py`, the `nexus-5x` block) was measured on LG's press image and approved on 2026-10-15; until the
scaffold replaces it, `versions/6.0.1/` is the preview page (the 5X installing a system update in recovery). How the image
was fetched and unpacked: `docs/sources.md`.

## Rules: built from the image, nothing inherited

The same rules as 2.1 ([plan-2.1.md](plan-2.1.md)), with 5.1.1 as the version that must not leak in:

1. **Only logic is copied** from 5.1.1 (saving and loading, dispatch, navigation, timers, engines). No stylesheet, render
   function, string table or asset is copied over, even where it would look right.
2. **Nothing falls back to an older screen.** A screen that is not rebuilt yet shows a visible "not built yet" placeholder.
3. **`mm-` files only** in `index.html`, plus the logic-only files `tests/version-files.test.cjs` allows.
4. **Every asset comes from the bullhead image** (its hash is in the image, or `docs/data/asset-sources.tsv` names it as our
   own drawing). The framework shares 93 % of its PNGs byte for byte with 5.1.1, so a shared file is fine when the hash is
   in this image — what may not come over is 5.1.1's CSS, layout or text built around it.
5. **Texts** are the image's own: every visible string is in `_aosp/bullhead/strings-index.json` (22 009 texts) or is
   marked `own`. 6.0.1 ships Hungarian itself, so there is no borrowed translation; a gap stays the image's English.

## What the image holds

- The APKs are pre-optimised (ART): no `classes.dex` in them. `docs/tools/oat2dex.py` cuts the dex files out of
  `app/X/oat/arm64/X.odex` and `framework/arm64/boot.oat` (ten dex files) and fixes their checksums; methods left to the
  interpreter may carry ART quick opcodes.
- System look: `framework-res.apk` 1431 PNGs (93 % identical with 5.1.1), SystemUI 58 (72 %), Settings 180 (33 %) —
  what is new against 5.1.1 (quick settings, the volume panel and Do not disturb, app permissions, Doze / battery
  optimisation, the lock screen shortcuts, Now on Tap) is read from these APKs' layouts and dex, not from memory.
- Home: Google Now Launcher (GoogleHome 1.2, whose code and resources are in Velvet 5.3.27 "Google App") with
  BullheadLayout's default workspace; the drawer and its layout come from Velvet.
- Google apps of the image: Phone 2.21, Contacts 1.2, Messenger 1.4.533, Gmail 5.7, Calendar 5.2.3, Chrome 44,
  Camera 3.1.024, Photos 1.4.0, Clock 4.2.1, Calculator 5.2, Google Keyboard 4.1, Maps 9.13.0, YouTube 10.28.60,
  Hangouts 4.1, Drive 2.3, Play Store 5.12.7, Play Music 6.0, Play Movies 3.8, Play Games 3.2, Android Pay, Project Fi,
  Google Play services 8.1, Downloads, Documents, Live Wallpaper Picker.

## Order of work (five-hour sessions)

| # | Step | Sessions |
| --- | --- | --- |
| 1 | Image (download, SHA-256, unpack), `oat2dex.py`, strings index, this plan | done 2026-10-16 |
| 2 | Scaffold: `versions/6.0.1/index.html` with the approved frame, the logic-only core, placeholders, leak checks; the preview page goes | done 2026-10-16 |
| 3 | Status bar, quick settings and notification shade, lock screen, power menu, volume panel, Google Now Launcher with the drawer, recents, dialogs and menus | done 2026-10-17 (the Now page waits for step 5) |
| 4 | Settings (with app permissions, Doze, Do not disturb) and the core apps: Phone, Contacts, Messenger, Chrome, Gmail, Calendar, Camera, Photos, Clock, Calculator | done 2026-10-17 |
| 5 | Google apps and Play Store from the image's APKs with made-up offline content, widgets, live wallpapers, Now on Tap | done 2026-10-18 (also Google Keyboard 4.1, Nexus Imprint, Google Settings, the emergency dialer and the Marshmallow Land easter egg; the image has no live wallpapers) |
| 6 | Language sweep, landing picture, `features-6.0.1.md`, catalogue status available, README and sitemap; the OG cover is the owner's call | done 2026-10-18: [features-6.0.1.md](features-6.0.1.md), available (not deployed: the owner's call) |

Commits are pushed as each piece passes the gate; the site is not deployed during the build (owner, 2026-10-16).
