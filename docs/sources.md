# Sources and regeneration

Every version is rebuilt from its own factory image. The images and their unpacked `/system` stay out of Git (`_aosp/` is
ignored: they are large and Google's); the tools, the commands and the generated files are in the repository. This page
says what to fetch, how to unpack it and how to rebuild and check the generated files.

## Factory images

| Folder | Version | Phone | Build | Fingerprint | Factory package |
| --- | --- | --- | --- | --- | --- |
| `_aosp/passion` | 2.1 | Nexus One | ERE27 | google/passion/passion/mahimahi:2.1-update1/ERE27/24178 | `Passion-ERD79.zip` + `signed-passion-ERE27-from-ERD79.a487b405.zip` |
| `_aosp/crespo` | 2.3.6 | Nexus S | GRK39F | google/soju/crespo:2.3.6/GRK39F/189904 | `soju-grk39f-factory-5ab09c98.tgz` |
| `_aosp/maguro` | 4.0.4 | Galaxy Nexus | IMM76I | google/yakju/maguro:4.0.4/IMM76I/330937 | `yakju-imm76i-factory-8001e72f.tgz` |
| `_aosp/mako` | 4.3 | Nexus 4 | JWR66Y | google/occam/mako:4.3/JWR66Y/776638 | `occam-jwr66y-factory-74b1deab.tgz` |
| `_aosp/hammerhead` | 4.4.4 | Nexus 5 | KTU84P | google/hammerhead/hammerhead:4.4.4/KTU84P/1227136 | `hammerhead-ktu84p-factory-35ea0277.tgz` |
| `_aosp/shamu` | 5.1.1 | Nexus 6 | LMY48Y | google/shamu/shamu:5.1.1/LMY48Y/2364368 | `shamu-lmy48y-factory-505ed306.zip` |
| `_aosp/bullhead` | 6.0.1 | Nexus 5X | MTC20K | google/bullhead/bullhead:6.0.1/MTC20K/3142008 | `bullhead-mtc20k-factory-4a950470.zip` |
| `_aosp/angler` | 7.1.2 | Nexus 6P | N2G48C | google/angler/angler:7.1.2/N2G48C/4104010 | `angler-n2g48c-factory-6a21e528.zip` |

The packages come from Google's factory image page (`https://dl.google.com/dl/android/aosp/<package>`); the hash in a
package name is the first eight digits of its SHA-1. Google no longer serves the Nexus S package; the copy used here is the
Wayback Machine's capture of the same Google URL (2013-11-13), and its SHA-1 matches the name. Google's page also lists
each package's SHA-256; the Nexus 5X package's (4a950470af6c1e01…eeae1b97a9) matches the download. From 7.x on the name carries the
SHA-256's first digits instead: the Nexus 6P package's SHA-256 (6a21e52889246aee…57e786cd771b) matches the download
(the first download was damaged: its inner image zip failed its CRC; the second matched). Google's page lists the 7.x
packages only once its terms are acknowledged; the names were read from the Wayback Machine's 2018-03 capture.

Google never published factory packages for the Nexus One. Its 2.1 image is put together from two files of the Internet
Archive item `media-fire-htc-passion-stock-software` ("Passion OTAs.zip"): `Downloads/Passion-ERD79.zip`, the HTC/Google
shipping set (fastboot images of the launch build ERD79), and `Downloads/Partial OTAs/Update-Passion-ERE27-From-ERD79.zip`,
Google's own update, whose SHA-1 (a487b405…) matches the name Google served it under. The update checks the SHA-1 of every
file it changes: all 178 ERD79 files matched, and all 177 patched files match the update's target hashes.

1. `python docs/tools/yaffs2-extract.py _aosp/passion/images/system.img _aosp/passion/erd79-system` — the YAFFS2
   `system.img` (2048-byte pages, 64-byte spare) of the ERD79 set → its `/system`.
2. `python docs/tools/ota-apply.py _aosp/passion/dl/Update-Passion-ERE27-From-ERD79.zip _aosp/passion/erd79-system _aosp/passion/system`
   — applies the update (BSDIFF40 / IMGDIFF2 patches, new files, deletions) and stops on any hash that does not match.

The image has en, de, es, fr, it, ja, ko, pt, ru and zh resources; Hungarian came with 2.3, so 2.1's Hungarian rows are
the 2.3.6 image's text where the English matches exactly, and our own translation (marked as such) otherwise.

## Unpacking and indexing

Python 3.10+ with `androguard`, `loguru`, `ext4` and `Pillow`; Node 20+ for the `.mjs` tools; headless Chrome for the
runtime checks.

1. `python docs/tools/extract-image.py _aosp/<device> _aosp/<device>/<factory package>` — package → `system.raw.img` → `system/`
   (app, priv-app, framework with the odex files, media, fonts, build.prop). The Nexus One is unpacked as described above.
   From 6.0.1 on the APKs carry no `classes.dex`: `python docs/tools/oat2dex.py <app>/oat/arm64/<App>.odex <out>` (or
   `framework/arm64/boot.oat`) cuts the dex files out of the OAT file and refreshes their checksums.
2. `python docs/tools/image-index.py _aosp/<device>` — `strings-index.json`: every string resource of the image's APKs
   (English → APK, resource name, hu / de / fr / es), which the text generators read.

What `_aosp/<device>/` holds afterwards, all rebuilt by the tools and therefore not in Git: the factory package,
`system.raw.img`, the unpacked `system/`, `strings-index.json`, `asset-index.json` (the asset inventory's picture
signatures), and the lists the research tools below write (`launcher-apps.json`, `sounds.json`).

## Reading an app out of the image

What a screen shows comes from its APK and code; these find it.

- `python docs/tools/odex2dex.py <file.odex> <out dir>` — the app's code as dex (Dalvik odex up to 4.4, ART oat odex on
  5.x), for `dexdump -d`: menu order, which items show, what a button does. `aapt2 dump resources <apk>` resolves the
  `#7f…` resource ids it prints; `aapt2 dump xmltree <apk> --file res/layout/<name>.xml` shows a compiled layout.
- `python docs/tools/dex-strings.py <file.odex | file.dex> [regex]` — the string table of a dex or Dalvik odex, for a quick
  search before disassembling.
- `python docs/tools/pull-file.py _aosp/<device> <out dir> /app/Gmail.odex …` — copies files out of `system.raw.img`.
- `python docs/tools/launcher-apps.py _aosp/<device>` — every launcher entry of the image with its English and Hungarian
  label, APK and version.
- `python docs/tools/ogg-titles.py _aosp/<device>` — the titles the sound pickers show for the image's ringtones,
  notifications and alarms.
- `python docs/tools/dimens.py <apk>` — the dimensions a phone-width configuration sets differently from the default.

## Generated files

- Texts: `node docs/tools/texts.mjs` reruns every text generator with its arguments (the list is in the script);
  `node docs/tools/texts.mjs --check` fails when an output differs from the committed one. The tables are in the named form
  `strings.js` reads (`{res | own | src, hu, de, fr, es, en?}`); `res` names the image resource of each row.
  `docs/data/image-strings-<version>.res` fixes which shared rows a version takes from its image.
- Launcher icons: `python docs/tools/image-icons.py _aosp/<device> <density> <version> <id>=<APK>[:<activity>] …` (2.3.6 hdpi,
  4.0.4 xhdpi, 4.3 xhdpi, 4.4.4 xxhdpi, 5.1.1 xxxhdpi).
- Drawables of an app module: each module's header names the APK and density its `assets/<prefix>-*` files come from;
  compiled nine-patches are copied as stored (the APK keeps their padding and stretch areas in the npTc chunk).
- Boot animations, sounds, fonts and the other data generators: see each `docs/*.py` header.
- Asset inventory: `python docs/tools/asset-inventory.py [version…]` traces every file of `versions/<v>/assets` (and
  `assets/audio`) to its image — APK or system file, resource path, density, transformation (copy, same pixels,
  resized, converted, rotated, nine-patch border removed, vector drawn as SVG, transcoded sound, generated sprite sheet)
  and both hashes — into `docs/reports/assets/<version>.tsv`, with a summary in `docs/reports/asset-inventory.md`. Files no image file
  matches take their source from `docs/data/asset-sources.tsv`; the rest are listed for review.
  `python docs/tools/asset-inventory.py --check` (`npm run regenerate:assets`) is the trial regeneration: every traced file is
  rebuilt from its source and compared, the boot animation sheets by rerunning `docs/tools/bootanimation.py`.

## Checks

- `node --test tests/*.cjs` — the module tests, including `text-tables`, `text-entries`, `strings` and `assets`.
- `node docs/tools/text-survey.mjs --md docs/reports/text-survey.md` — the inventory of the text tables (audit point 10).
- `node docs/tools/text-check.mjs` — every app of every version opened in hu / de / fr / es; missing keys → `docs/reports/text-check.md`.
- `node tests/asset-inventory.test.cjs` (in `npm test`) — the inventory lists exactly the asset files, with their hashes.
- `node docs/tools/asset-unused.mjs` — asset files no code, page, test or built-up path uses (a list to check by hand before
  deleting; empty after the 2026-10 cleanup).
- `node docs/tools/css-unused.mjs [version …] [--write]` — CSS rules whose classes / ids no loaded script, page or fetched
  page can produce, and @keyframes nothing names (`--write` removes them; empty after the 2026-10 cleanup).
- `node docs/tools/action-unused.mjs [version …]` — `case` branches whose name no button, assignment or built name
  produces (dead actions, forms and views; empty after the 2026-10 cleanup).
- `node docs/tools/asset-check.mjs` — stylesheet url()s and literal asset paths (case-sensitive), failed requests while every
  app opens, and the asset folders' inventory → `docs/reports/asset-check.md`.

The runtime checks need a server for the repository root (`php -S localhost:8090 -t .`, or `BASE=…`).
# Nougat accessibility activities (release continuation, 2026-10-23)

`angler/system/app/talkback/talkback.apk` is TalkBack 5.0.4 (version code
50004003). It also supplies Switch Access. The activity layouts/preferences,
themes, translated texts and tutorial arrows all come from this N2G48C APK.
`ng-appprefs.txt` adds its API-21 preference variant, gesture/classic/default
keymap XML and Switch Access XML to the normal `mm-appprefs.py` generator.

The pre-optimised classes are recovered with:

```powershell
$env:ERA='ng'
python docs/tools/oat2dex.py _aosp/angler/system/app/talkback/oat/arm64/talkback.odex _aosp/angler/talkback-dex
python docs/tools/dex-decompile.py _aosp/angler/talkback-dex/classes.dex _aosp/angler/talkback-java _aosp/angler/system/app/talkback/talkback.apk KeyComboModelApp DefaultKeyComboModel
python docs/tools/ng-accessibility.py --check
```

`ng-accessibility.py` evaluates the two constant `getDefaultKeyComboCode` decision
trees for a non-ARC phone and reads the APK's `res/raw/tutorial.json`: 15 classic
and 63 default shortcut entries, five lessons. Its generated data records the
APK SHA-256. `TalkBackDumpAccessibilityEventFragment` fills its empty XML at run
time using `AccessibilityEventUtils.getAllEventTypes` (25 API-25 event names).
`CustomLabelMigrationManager` supplies the `labels_array` JSON format.

The normal `ERA=ng` `mm-assets.py` and `mm-strings.py accessibility` commands
regenerate the two tutorial arrow PNGs and the event-menu/reading-granularity
texts. `ng-assets-accessibility.tsv` records the drawable sources; the highest
density this APK provides is xhdpi. The browser uses local pointer/key events
and optional Web Speech for tutorial practice; Android service/sensor backends
are outside this static simulator.

### Nexus 6P retained Marshmallow wallpaper (owner exception, 2026-10-23)

The used-phone Nougat demo now carries one saved pre-OTA image from the same
phone's original Marshmallow firmware. It is not claimed as part of N2G48C.
The four native GoogleHome tiles and N2G48C's pink framework default remain.
Only fresh profiles start with the retained image; existing home/lock choices
are left intact. The landing card is recaptured from this fresh demo.

- Official package: [angler-mdb08k-factory-46550886.zip](https://dl.google.com/dl/android/aosp/angler-mdb08k-factory-46550886.zip).
- Package SHA-256: `4655088655f64e4f778adebe9e0ac8099447af643cf983262a95a1abf4401053`.
- Fingerprint: `google/angler/angler:6.0/MDB08K/2343511:user/release-keys`.
- `/system/framework/framework-res.apk` SHA-256: `c0e3a915d5b92c07b15d8d47e19507f22ed0ade2d1a7bc3148c551616b5a55f2`.
- APK member: `res/drawable-nodpi-v4/default_wallpaper.jpg`, 1634 x 2560,
  1,186,226 bytes; copied without conversion, cropping or resampling.
- Output: `versions/7.1.2/assets/saved-nexus-6p-marshmallow.jpg`, SHA-256
  `8e8782b9e47ea0c14a966b32296d27172c4a5ec1c85dc5293be5aee5c2928f15`.

Unpack the official archive with the existing `extract-image.py` into a
separate `_aosp/angler-marshmallow` folder (do not replace `_aosp/angler`). Then:

```sh
python docs/tools/ng-retained-wallpaper.py _aosp/angler-marshmallow/system/framework/framework-res.apk
python docs/tools/ng-retained-wallpaper.py --check
```

The helper verifies both APK and JPEG hashes before writing. The asset inventory
records this external historical source via `docs/data/asset-sources.tsv`;
its `own` category means outside the indexed N2G48C image, not simulator artwork.

### Google Earth globe imagery (owner decision, 2026-10-26)

Earth streamed its imagery from Google's servers, so no factory image holds a globe picture. Every version's Earth
(2.3.6, 4.0.4, 4.3, 4.4.4, 5.1.1) draws NASA's Blue Marble Next Generation instead, kept locally so it works offline;
the Earth chrome, menus and settings stay the APKs' own (`earth-globe.js`, `earth-app.js`, 2.3.6 `gb-google-apps.js`).

- Source: NASA Earth Observatory, Blue Marble Next Generation with topography and bathymetry, August 2004,
  [world.topo.bathy.200408.3x5400x2700.jpg](https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73776/world.topo.bathy.200408.3x5400x2700.jpg)
  (5400 x 2700, SHA-256 `f76d7b94445e8975a755c849ddaa93ed07b7e01118fb0b7e6bc5546a68c18d5c`); NASA imagery is
  public domain.
- Output: `assets/earth/blue-marble.jpg` (SHA-256 `315d58513142cdde94fd202ca148858f914986a2e7ee12be2c3192e368612b00`),
  Lanczos-resized to 4096 x 2048, JPEG quality 80, progressive (one shared
  file for all versions, owner 2026-10-26).
- The search places in `earth-globe.js` are well-known coordinates; the demo phone's location is Mountain View, as
  in the other apps' maps.

### Apps installed from Play on 6.0.1 and 7.1.2 (owner decision, 2026-10-26)

The Nexus 5X (MTC20K) and 6P (N2G48C) images lack ten Google apps that 5.1.1's image has. They are added as apps the
phone's owner installed from Play, in the version current on the image's build date, and are marked so: `installed:
true` in `mm-apps.js` / `ng-apps.js` (Settings › Apps shows Uninstall, which the simulator does not perform). The APKs
live beside the images in `_aosp/<device>/playapps/` (gitignored; `docs/tools/apkmirror-get.py` downloads one and checks it); `docs/tools/mm-apps.py`, `mm-appprefs.py`,
`mm-strings.py` (`image_res.py`), `playapp-assets.py` and `asset-inventory.py` read them there. Plan and versions:
docs/reports/simulator-limits-2026-10-23.md, "Negyedik kör".

| Version | App | APK (APKMirror) | Variant | SHA-256 |
|---|---|---|---|---|
| 6.0.1 | Earth 8.0.4.2346 | [earth-8-0-4-2346-release](https://www.apkmirror.com/apk/google-inc/earth/earth-8-0-4-2346-release/) (uploaded 2016-06-29) | x86, nodpi | `52623b93fcd82d35abdb13aa4abb69edae4740275f2d1c8d54a28f8c24b10c46` |
| 7.1.2 | Earth 9.0.4.2 | [earth-9-0-4-2-release](https://www.apkmirror.com/apk/google-inc/earth/earth-9-0-4-2-release/) (uploaded 2017-05-08) | armeabi-v7a, nodpi | `3128b1f7d67efe066d4edee8dcd527d36fb028ce997d7612f8d3377840c4e95b` |
| 6.0.1 | Keep 3.3.315.0 | [keep-3-3-315-0-release](https://www.apkmirror.com/apk/google-inc/keep/keep-3-3-315-0-release/) (uploaded 2016-08-10) | armeabi-v7a, nodpi | `e10e7d61462b37996c2f9bff4c47d88815fa475a20d710c7227760d7ab163021` |
| 7.1.2 | Keep 3.4.724.02 | [keep-3-4-724-02-release](https://www.apkmirror.com/apk/google-inc/keep/keep-3-4-724-02-release/) (uploaded 2017-05-18) | armeabi-v7a, nodpi | `35fd2d31f0e7db00c90c5d0d10d40370ebdb7f9a713e0f137ea89efefdad0cb3` |
| 6.0.1 | Docs 1.6.292.13 | [docs-1-6-292-13-release](https://www.apkmirror.com/apk/google-inc/docs/docs-1-6-292-13-release/) (uploaded 2016-08-02) | armeabi-v7a, nodpi | `11b86ae76ee3d4b0745a4d2391d2dde6fd7553123f18e61df6ef2618ea271692` |
| 6.0.1 | Sheets 1.6.502.06 | [sheets-1-6-502-06-release](https://www.apkmirror.com/apk/google-inc/sheets/sheets-1-6-502-06-release/) (uploaded 2017-01-06) | armeabi-v7a, nodpi | `0af0963a1c22859aee51ba0fa85f17f5802428bcdbcb30ac23ff3cc148c8da3a` |
| 6.0.1 | Slides 1.6.352.16 | [slides-1-6-352-16-release](https://www.apkmirror.com/apk/google-inc/slides/slides-1-6-352-16-release/) (uploaded 2016-09-16) | armeabi-v7a, nodpi | `70a5e0cb8234a7bd0fcd5320649ca52b3719fd245107a226d41505abf04cb5ee` |
| 7.1.2 | Docs 1.7.212.02 | [docs-1-7-212-02-release](https://www.apkmirror.com/apk/google-inc/docs/docs-1-7-212-02-release/) (uploaded 2017-06-01) | armeabi-v7a, nodpi | `0f9a2e7ec2c2fb814f3876eae680711eba3ed3edabbcc4fb43e2e6f3f59830a6` |
| 7.1.2 | Sheets 1.7.212.03 | [sheets-1-7-212-03-release](https://www.apkmirror.com/apk/google-inc/sheets/sheets-1-7-212-03-release/) (uploaded 2017-06-01) | armeabi-v7a, nodpi | `6dfa2bef4822ca9c43ccdfa58133625e86457e5d4936f67ab0cc5aa850f5d09f` |
| 7.1.2 | Slides 1.7.212.01 | [slides-1-7-212-01-release](https://www.apkmirror.com/apk/google-inc/slides/slides-1-7-212-01-release/) (uploaded 2017-06-02) | armeabi-v7a, nodpi | `eda23b06e046e598f028ccfc89cd398560fac180cf2bed82f2ca71012932d886` |

Sheets on 6.0.1 is 1.6.502.06 (January 2017): APKMirror has no Sheets release between 1.4.492.11 and it, so the
plan's fallback, the first one after the image's month, is used.

The variant's native code does not matter here: the simulator reads the resources (layouts, strings, drawables,
settings XML), which are the same in every nodpi variant. Each file is saved as `<Apk name>.apk` (GoogleEarth.apk);
its checksum is APKMirror's.
