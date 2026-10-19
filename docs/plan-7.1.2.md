# Android 7.1.2 on the Nexus 6P — plan

Started 2026-10-19 (owner: "kezdd el a Nougatot"). Build: **N2G48C** (`angler-n2g48c-factory-6a21e528.zip`, "7.1.2
(N2G48C, Aug 2017)", SHA-256 `6a21e52889246aee2be75479af1a684d4e1c78259dfc88a73a1e57e786cd771b`), the last 7.1.2 build
Google published for the Nexus 6P before 8.0. Folder `versions/7.1.2`, era prefix `ng-` (Nougat). The frame
(`device-frames.py`, the `nexus-6p` block) was measured on a Wikimedia Commons front view on 2026-10-19; until the scaffold
replaces it, `versions/7.1.2/` is the preview page (the 6P installing a system update in recovery). How the image was
found and unpacked: `docs/sources.md`.

## Rules: built from the image, nothing inherited

The same rules as 6.0.1 ([plan-6.0.1.md](plan-6.0.1.md)), with 6.0.1 as the version that must not leak in:

1. **Only logic is copied** from 6.0.1 (saving and loading, dispatch, navigation, timers, engines). No stylesheet, render
   function, string table or asset is copied over, even where it would look right.
2. **Nothing falls back to an older screen.** A screen that is not rebuilt yet shows a visible "not built yet" placeholder,
   and the version is not called done while one is left ([feedback: done means done]).
3. **`ng-` files only** in `index.html`, plus the logic-only files `tests/version-files.test.cjs` allows.
4. **Every asset comes from the angler image** (its hash is in the image, or `docs/data/asset-sources.tsv` names it as our
   own drawing).
5. **Texts** are the image's own: every visible string is in `_aosp/angler/strings-index.json` or is marked `own`.
6. **Demo data:** the shared "used phone" of every version (`docs/demo-data.md`, its checklist), with the 7.1.2 texts.
7. **The simulator's rules of every version:** the screen stays on unless a timeout is chosen, the clock widget on the
   home screen, the image's own fading scrollbar, desktop drag and phone width both work.

## What the image holds

- Fingerprint `google/angler/angler:7.1.2/N2G48C/4104010:user/release-keys`, security patch 2017-08-05.
- The APKs are pre-optimised: the dex is inside `oat/arm64/X.odex` (dex format 037; `docs/tools/oat2dex.py` takes 035 and
  037). Unpacking needed `extract-image.py` to skip links that pass through a file.
- System look: `framework-res.apk` 1470 PNGs, only 11 % the same as 6.0.1's; SystemUI 342 PNGs, 6 % — the Nougat look
  (quick settings header, bundled notifications, the new Settings dashboard with its drawer and suggestions) is read from
  these APKs, not from 6.0.1.
- Settings is `SettingsGoogle` (com.android.settings 7.1.2); home is the Google Now Launcher as its own APK
  (`GoogleHome` 1.4, com.google.android.launcher) with `AnglerLayout`'s default workspace, the Google app is Velvet 6.5.36.
- Google apps of the image: Phone 8.0, Contacts 1.4.22, Messenger 2.0.906, Chrome 55, Gmail 6.9.25, Calendar 5.7,
  Camera 4.3.016, Photos 1.25, Clock 4.6.1, Calculator 7.1.1, Gboard 6.0.84, Maps 9.34.1, YouTube 11.41.56,
  Hangouts 12.0, Drive 2.4.452, Play Store 7.4.31, Play Music 6.13, Play Movies 3.20, Play Games 3.7.24, Android Pay
  1.4, Project Fi, Device Policy 7.05, Google Play services 9.8.79, Daydream (GoogleVrCore), Files (Storage manager),
  Emergency information, Downloads, Documents, Live Wallpaper Picker, the Android Easter egg (com.android.egg).

## Order of work

| # | Step | State |
| --- | --- | --- |
| 1 | Image (download, SHA-256, unpack), `oat2dex.py` on the image's odex / oat, strings index, this plan | done 2026-10-19 |
| 2 | Scaffold: `versions/7.1.2/index.html` with the frame, the logic-only core, placeholders, leak checks; the preview page goes | done 2026-10-19 |
| 3 | Status bar, quick settings and notification shade (bundled notifications, direct reply), lock screen, power menu, volume panel, the launcher with the drawer, recents with split-screen, dialogs and menus | |
| 4 | Settings (with the 7.x dashboard and its suggestions, Data Saver, Night mode where the image has it) and the core apps: Phone, Contacts, Messenger, Chrome, Gmail, Calendar, Camera, Photos, Clock, Calculator | |
| 5 | Google apps and Play Store from the image's APKs with made-up offline content, widgets, the Google app | |
| 6 | Language sweep, landing picture, `features-7.1.2.md`, catalogue status available, README and sitemap | |

Commits are pushed as each piece passes the gate.
