# Nexus 6P / Nougat release verification — 2026-10-23

Image: angler N2G48C, Android 7.1.2, security patch 2017-08-05.

| Gate | Result |
| --- | --- |
| `npm test` | 247 passed, 0 failed |
| Existing Nougat browser scripts | All 51 passed; Bundles and Hangouts rerun after their fixes |
| `ng-accessibility.mjs` | Native preference routes, nested developer/event filters, gestures, keyboard maps/reset, labels/import/export/revert, tutorial practice, Switch Access, five languages and phone width passed |
| `ng-release.mjs` | Shared demo checklist, two old-save reloads, 120 app openings and 610 preference screens over five languages, phone width passed |
| `flows.mjs` | Earlier seven releases and their configured phone-width flows passed |
| Application/menu route sweep | No missing activity cards or raw format placeholders |
| `text-check.mjs 7.1.2 --langs en,hu,de,fr,es` | 23 detected apps in each language, 0 missing keys, 0 exceptions |
| `asset-check.mjs 7.1.2` | 69 stylesheets, 197 scripts; 0 missing static assets, 0 failed runtime requests |
| `font-check.mjs` | All eight releases checked; every font byte-identical to its source image |
| `ng-accessibility.py --check` | Both source keymaps and five-lesson catalogue reproduce exactly |
| `asset-inventory.py --check 7.1.2` | 1207 rebuilt files, 0 problems; run after browser checks |

The version inventory contains 1208 assets: 850 copies, 352 vectors, four
generated asset files and two simulator-owned files. The regeneration command
also verifies the generated boot metadata. The two tutorial arrows are exact
copies from this TalkBack APK; the new 720×1280 landing JPEG captures the fresh
home screen after dismissing its welcome cling.

The release is listed as available in the catalogue and sitemap. Its feature
list documents browser-local content, synthetic media and the limits of the
Android-service/backend reconstruction. The release gate is part of
`npm run test:browser` and the existing push/PR workflow.

CI setup includes Python 3.12 and pinned Pillow for the native Photos LUT pixel
fixtures. `test-ci.mjs` preserves TAP output and annotates failed checks with
their diagnostics. A raw Git snapshot also passes all 247 checks locally with
Node 22 and UTC, without unpacked factory images.

Wallpaper follow-up (2026-10-23): the destination dialog passed `label` where
the dialog renderer requires escaped `html`, so all three visible options read
`undefined` despite selecting the correct destination. Corrected and covered
with exact visible-label assertions in all five languages. The horizontal
thumbnail strip now supports mouse dragging and the wheel, preserves its
position on selection, and retains native touch scrolling. Real pointer tests
reach the third and fourth bundled images, which were previously offscreen.
The N2G48C GoogleHome APK's `array/wallpapers` (`nodpi-v4`) was rechecked:
`wp_001` through `wp_004`, including the turquoise surf image `wp_003`, plus
the separately inserted framework default. No images were added or removed.
