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
