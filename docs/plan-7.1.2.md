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
| 3 | Status bar, quick settings and notification shade (bundled notifications, direct reply), lock screen, power menu, volume panel, the launcher with the drawer, recents with split-screen, dialogs and menus | mostly done 2026-10-19: status bar, navigation bar, the shade (QuickQSPanel / QSPanel, notification rows, swipe to dismiss, heads-up), the quick settings details and the tile editor with all stock tiles and pages, the framework AlertDialog, the lock screen, the power menu with restart and the boot animation, the volume panel, the Google Now Launcher home screen with folders, overview mode and the clock widget, the apps drawer, Overview's Nougat stack, toasts and the overflow menu. Left for later steps: split-screen (the docked stack), bundled notifications, app shortcuts on a long press, the widget and wallpaper pickers (step 5). Done since: the keyguard bouncer (with Settings › Security), the expanded row's actions and direct reply (RemoteInput, with Messenger, 2026-10-20) |
| 4 | Settings (with the 7.x dashboard and its suggestions, Data Saver, Night mode where the image has it) and the core apps: Phone, Contacts, Messenger, Chrome, Gmail, Calendar, Camera, Photos, Clock, Calculator | Settings done 2026-10-20: dashboard, drawer, conditions, suggestions, search, Support; every tile's screens (Wi-Fi, Bluetooth, data usage, More, display, notifications, sound and DND, apps and app info, storage, battery, memory, users with the quick settings user switcher, tap & pay, Moves, location, security with the bouncer and Nexus Imprint, accounts, Google, languages & input, backup & reset, date & time, accessibility, printing, developer options, about). Rows that open another app's own activity (an input method's settings, TalkBack's, Location History, the feedback form) show the not-built card until that app is built. Core apps 2026-10-20: Calculator, Clock, Phone (with InCallUI), Contacts (with the share sheet), Messenger (the list with swipe to archive and selection, the conversation with clusters, separators, details, selection and search, the media picker's stickers / camera / gallery / audio, the contact picker, People & options, Archived, Blocked contacts through the system's blocked numbers, its Settings, the notification's Reply and Call). Messenger's location chooser waits for Maps (not-built card). No emoji keyboard: Messenger 2.0 hides its button when the input method is emoji capable (the image's Gboard). Chrome 55 (2026-10-20): first run with sign-in, the tabbed toolbar with the tab count, the omnibox and its suggestions, the cards New Tab page (NTPSnippets is on by default in 55: Articles for you from the offline web, Recent bookmarks), the app menu, the tab switcher stack, incognito, Bookmarks, Recent tabs, History, the error page, Find in page, Add to Home screen, site information, Settings. Not built yet there: the site settings' category pages, the voice search (the Google app). Gmail 6.9.25 (2026-10-20): the welcome tour and addresses, Primary with the sectioned inbox teaser, swipe to archive with Undo, the drawer with the account header, a conversation, reply / forward / compose, search, Move to / Label as, Settings with the account's own screen. Attach file waits for Documents. Calendar 5.7 (2026-10-20): the first run, Schedule with the month pictures, the drawer with its lockup, Day / Week / Month, the mini month, the speed dial with Event and Reminder (a Goal needs Google's goal service: not built), an event, the editor, search, Settings' headers. Camera integrated 2026-10-20 (checkpoint below). Photos integrated 2026-10-20 (checkpoint below). Documents / Files and Gmail attachments integrated 2026-10-20 (checkpoint below). Next: the remaining Google apps and keyboard |
| 5 | Google apps and Play Store from the image's APKs with made-up offline content, widgets, the Google app | |
| 6 | Language sweep, landing picture, `features-7.1.2.md`, catalogue status available, README and sitemap | |

Commits are pushed as each piece passes the gate.

## Play Store continuation — 2026-10-21

Phonesky 7.4.31 now uses its V2 Apps corpus resources (green #0f9d58, status #0d854b),
MainActivityTheme, 48dp tabs and the small-card/detail/My apps layouts. The invented offline
server selects this branch among the APK's server-configured variants. Twelve shared fictional
listings provide the content and runtime SVG icons; native Google entries use angler's package
metadata. No previous release's rendering, stylesheet, string table or artwork was copied.

Search/history, category/top lists, wishlist, ratings/edit/delete, install/update/cancel and
My apps Updates/Installed/Library/Beta are connected. Jobs continue while another app is open,
pause without a permitted network and survive reloads. Completion registers launcher/App info
metadata and optional home icons; uninstall removes folders/shortcuts, recents and app settings
while retaining library membership. Factory packages remain installed and can be re-enabled.
An unavailable package such as a Drive editor has an item-not-found result.

The actual settings XML supplies general, notification, user-control and About rows. Download
network choices, automatic updates, home shortcuts, history clearing, purchase authentication
choice and local parental PIN/filtering persist. Restricted listings are filtered and direct
install requests rejected. The account has empty payment/order/subscription/reward responses;
redeeming an unknown offline code returns the native invalid-entry response. The open-source
license resource is preserved byte for byte. Payment processing and real APK downloads are
outside this browser-local catalogue. The three native widget providers are still tracked below
the application milestone in remaining-7.1.2.md.

Validation: 199 module checks passed, including five install/state cases. The new Play browser
flow covers background installation, cancellation, launcher integration, App info uninstall,
library/reinstall, reviews, history, PIN rejection/confirmation, licenses, reload, five languages
and phone width. Source inventory: 943 files rebuilt, zero problems. Light preference toolbar
foreground was also corrected and checked in Drive and YouTube.

## Play Store widgets — 2026-10-21

All three providers now use their own native layout resources. The small 2×2 card flips every
seven seconds using the exact top/bottom nine-patches. The recommendation panel has its native
tiled background, title, corpus strip and refresh/dismiss controls, with a five-minute automatic
flip interval. My Library shows the APK's empty state, exploration shortcuts and installed game
tiles, with a provider hook for the remaining media apps.

The three-column configuration activity saves the selected corpus; cancelling removes only the
new placement and returns to the launcher's original page. Widget artwork and all labels were
extracted from this Phonesky APK. The dedicated browser flow covers configuration/cancel, timed
flip, refresh/dismiss/open, empty/populated library, persistence, five languages and phone width.
Source inventory: 950 rebuilt files, zero problems; the full 199-check module suite passes.

## Tools added for 7.1.2

## Play Music and store media — 2026-10-21

Music2 6.13 now uses its own MusicActivityTheme (#fafafa toolbar, #e65100 status bar,
#f5f5f5 window), library pager, track rows, empty screens, create/edit-playlist panel and
now-playing controls. A fresh demo account has no music. Local Documents/MediaStore audio
is grouped by artist/album/genre, searchable, and usable in saved playlists. The shared player
handles background playback, seek, queue order/removal, repeat/shuffle, thumbs and a sleep timer;
its notification has Previous/Play/Pause/Next. Deleted files are reconciled without stale queue
indices. Reload pauses the saved media clock.

Documents and Gmail audio VIEW intents use the native AudioPreview layout, with a temporary
snapshot and separate preview clock. Uploading/downloading/copying audio through Drive and
Documents now preserves duration and artist/album/genre/title metadata; copied PDF metadata is
also independent. The native preferences, exact licenses, two Music widgets (small/large five-button
layout and IFL dice) and all three native launcher shortcuts are connected. Cloud-only pages use
the native connection-error state of this local account. MusicFX currently shows its native
unavailable-effects response; its full effect panel is separately tracked in remaining-7.1.2.md.

Play Store now also exposes the shared invented albums, movies, books and magazines through
fresh 7.4 rendering and its V2 corpus colours. Shop opens Music directly; album samples use a
temporary audio preview and never enter the library. Media cannot be installed as APKs, and
Buy/Rent proceeds to the demo account's empty payment-method response. Recommendation widgets
can display the same Music/Movies catalogue. Only the shared fictional content constants were
reused from 6.0.1.

Validation: 205 module checks passed, including four player cases, media/APK separation and
audio metadata transfer. Music's browser flow covers library/grouping, playlists, background
playback/notification, queue, preferences/sleep timer, licenses, Documents preview, both widget
layouts and IFL, all shortcuts, Shop/sample/payment routing, phone width and five languages.
Play Store and Play widget browser flows pass, as do Drive and Documents/Gmail regression flows.
Source inventory: 977 files rebuilt, zero problems.

- `docs/tools/layout-xml.py <apk> <res path>`: a compiled layout (or any XML resource) of the image with its resource ids
  named and their first value, for reading a screen's structure.
- `docs/tools/res-xml.py <apk> <out dir> <glob>`: compiled XML written back as plain XML (the AVD tool reads
  `_aosp/angler/refs/sui-xml` this way: `ERA=ng python docs/tools/mm-avd.py`).
- The 6.0.1 generators take `ERA=ng` (`docs/tools/era.py`): mm-assets, mm-vectors (now following a theme's parent styles
  into the framework), mm-strings, mm-avd (now with path motions), dex-decompile (the era's framework).
- Colours in the stylesheets: Android writes #AARRGGBB, CSS #RRGGBBAA (#b3ffffff is #ffffffb3).
- `docs/tools/bootanimation.py angler` writes ng-boot-animation.js and the sprite sheets; `mm-avd.py` (ERA=ng) also draws
  ic_invert_colors.
- `docs/tools/era.py` gives each era its API level (23, 25): `mm-appprefs.py` reads the res/xml variant the phone loads
  (the highest res/xml-v<n> at or under it; Messenger's switches are xml-v23's SwitchPreferences, on 6.0.1 too).
- Chrome's behaviour is read from the Chromium sources of its exact build (chromium.googlesource.com, tag
  55.0.2883.91); `docs/tools/ng-chrome-pak.py` reads its native texts from the image's .lpak packs (and the error page's
  icon from resources.pak). The offline web of 2017 is `ng-web.js`, the simulator's own pages.
- `docs/tools/dex-decompile.py` on Messenger's dex (`_aosp/ngbg/dex/classes.dex`, decompiled classes in `_aosp/ngbg/java`).

## Camera continuation — 2026-10-20

Recovered the unfinished Camera 4.3 module, string tables and extracted assets. Added its own
`ng-camera.css` from GoogleCamera's layout resources and drawing code, and loaded Camera on the page.
Photo capture, front/back switching, timer (3 / 10 seconds), HDR+, grid, white balance, flash options,
photo/video switching by swipe and paginator, recording with pause/resume, slow motion's 120 / 240 FPS,
the toybox and the image's settings screens are wired. The 16:9 photo preference changes the preview;
its layout follows display resizing. Media are the simulator's drawn scenes, saved with the phone.
Panorama / Photo Sphere / Lens Blur currently save a simulated still; their guided capture sequences
and Smartburst are still outstanding. The thumbnail routes to Photos, which is the next app to build;
until then its explicit not-built card remains.

The core now calls an optional `unmount(c)` when a screen is left or turned off. Camera cancels its
countdown and saves an active recording once, excluding paused time. Returning immediately cannot
revive an old countdown. The camera assets are traced in the regenerated 7.1.2 inventory.

Validation: `npm test` (155 passing checks including six Camera cases) and
`node tests/browser/ng-camera.mjs` against a local server (desktop, 375 × 812, all five languages;
photo persistence, timer cancellation, front camera, video pause/resume and Home, settings, slow motion,
Photos routing; no JavaScript exceptions or failed requests). Screenshots go to ignored
`tests/browser/artifacts/7.1.2-camera-{desktop,phone}.png`.
`python docs/tools/asset-inventory.py --check 7.1.2` also passes: 679 regenerated files, zero problems.
The check now uses the boot generator's era-specific script filenames for Eclair, Marshmallow and Nougat.

## Photos continuation — 2026-10-20

Google Photos 1.25 now opens Camera captures, the dated demo library, Assistant and Albums, device
folders, shared albums, search by caption/date/type, and the image's navigation drawer. The viewer
has swipe navigation, zoom, slideshow, video playback controls for simulated recordings, sharing,
editable descriptions and metadata. Album creation, adding photos, title editing and album deletion
keep media separate from album membership. Collages and frame-based animations/movies use snapshots
of the selected demo media.

Trash hides items from Camera and Messenger too; restore retains album membership, permanent deletion
cleans memberships, and the image's 60-day expiration is enforced. IDs remain unique when the newest
picture is in trash. CPE saves edits nondestructively: Auto/Original, Light/Color/Pop, quarter rotation,
aspect ratios and a draggable free crop; Save copy and Discard are available. Video trim changes the
simulated duration. The complete native preset catalogue still needs investigation before the final
polish; Auto/Original are the locally reconstructed choices so far. Back up & sync and Assistant
preferences are simulated and saved locally. The image lacks Hungarian Photos resources, so the
English fallback is deliberate and listed by the generated table.

Photos uses the full `ngphotos-` class/action prefix, separate from Phone (`ngph`) and the lock
pattern (`ngpt`). Browser checks include the app window's height to catch stylesheet collisions.
Validation: 162 module/model checks passed; the source inventory rebuilds 715 files with zero
problems; `node tests/browser/ng-photos.mjs` covers onboarding, descriptions, edit/crop, trash/undo/
restore, albums, Camera → Photos, phone width, five languages and Phone isolation. The Camera
browser flow now also requires the actual Photos viewer.

## Documents and attachment continuation — 2026-10-20

DocumentsUI is rebuilt from its N2G48C layouts and DocumentsTheme: Downloads / Files, Recent,
Images/Videos/Audio, internal storage and the local Drive provider, root drawer, breadcrumbs,
list/grid, search, sort, size/internal-storage toggles. Local demo text/PDF previews, folder creation,
selection, rename, recursive copy/move/delete and clipboard paste are wired. Camera media appear in
the image/video providers; deleting them uses Photos trash. File operations reject invalid names,
name conflicts, destinations inside the source tree and duplicate processing of selected descendants.

`NG.pickDocument`, `NG.saveDocument`, and `NG.viewDocument` expose picker/save/preview activities.
Gmail's attachment picker returns to compose with attachment tiles from its own layout and icons;
attachments survive send, saved drafts, reopening and forwarding. Attachment-only drafts are saved;
removing the last content from a resumed draft removes it. Image shares carry the photo ID into Gmail.

Validation: 169 module/model checks; seven new provider-operation cases; source inventory check
741 rebuilt files, zero problems. `node tests/browser/ng-documents.mjs` passes Downloads/preview,
folder creation, grid/search, Gmail pick/send, attachment-only draft/reopen/remove, Files, phone
width and all five languages. Remaining full-release work is tracked in remaining-7.1.2.md.

## Emergency information continuation — 2026-10-20

EmergencyInfo now opens through the emergency dialer's two-tap action. Its red ViewInfoActivity
shows the owner's populated information and emergency contacts; EditInfoActivity has the image's
Info / Contacts tabs, first-use consent, text fields, blood-type and organ-donor arrays, contact add /
remove and Clear all. Medical values start blank. The Contacts activity now supports an ACTION_PICK
callback and the emergency picker filters to contacts with phone numbers.

`NG.requireUnlock` uses the existing Nougat keyguard before protected edits on a secure phone.
Cancel returns to the public information view; the correct PIN/pattern/password resumes the editing
flow. Browser validation covers the PIN path, cancellation, field persistence, consent, contact
selection, all five languages and phone width. `npm test`: 169 passed. Inventory regeneration:
751 files, zero problems.

## Gboard input continuation — 2026-10-21

Gboard 6.0.84 now supplies the on-screen editor in apps and framework dialogs. Its five language
layouts, accent popups, two symbol pages and 1,347 emoji entries are generated from this APK's own
compiled XML by ng-keyboard-data.py; icons and NotoColorEmoji.ttf come from N2G48C. The material
light/dark colours and sw400dp keyboard dimensions were read from the same APK. Selection replacement,
grapheme deletion, shift/caps lock, textarea Enter, app-specific Enter handlers, number/password fields,
double-space period, Back/Home and focus restoration across an app redraw are connected.

Settings opens the native Gboard preference XML, including its custom category classes, headers,
fragment extras, toggles and list dependencies. Languages, native light/dark previews, key borders,
number row, keyboard height, one-handed placement, custom layout variants and keypress timing controls
are wired to persistent preferences. The generic preference reader now follows referenced string
defaults, and disabled preferences reject actions. The native dictionary list and system personal
dictionary route are connected; predictive/glide decoding, voice/search access points and remaining
theme packages still need the Google-app continuation before this checklist item is closed.

Validation: 169 module/model checks passed. The Gboard browser flow checks Gmail address entry,
selection, a real held-pointer accent popup, emoji deletion, newline, Back/Home, Messenger's rebuilding
search field, preference persistence, five layouts/languages and phone width. Documents/Gmail attachments
and protected emergency editing browser flows also passed with the IME enabled. The headless harness
now explicitly emulates window focus so focus-driven editor behaviour is exercised. Source inventory:
761 rebuilt files, zero problems. No older release's keyboard artwork or CSS was copied.

## Google search / Now continuation — 2026-10-21

Google 6.5.36.21.arm64 now supplies launcher search, the Google app, the left-hand Now page,
voice search examples and held-Home screen search. SearchPlate is 48dp; suggestion rows use
core_suggestion_view (56dp, primary/secondary text and refine action). Queries find the phone's
apps and contacts and search the shared invented 2017 web. Search history persists, de-duplicates
case variants and supports removal. Result links open Chrome; image results open the same Photos
library. Voice is explicitly offered as sample phrases and never records audio.

The native 248dp Now header, 304dp drawer and 2dp cards hold the demo Riverside weather, the actual
next Calendar event and the offline news stories. Weather units, Feed/Upcoming, card dismissal
(menu or swipe), restore and feed preferences are saved. Google reminders use Calendar's event
store, so add/edit/complete/delete stay consistent. Screen search has Velvet's own opt-in layout
and uses the selected text or current page title only inside the local simulator.

The APK's preference headers and sixteen XML screens are available through Settings; the launcher's
two switch-header extras now control app suggestions and save the rotation preference. Google voice
IME settings also open their actual preference XML. Gboard's voice access point now returns its
sample text to the original field and selection, including Google's own editor; cancellation and
leaving the voice activity clear the pending callback.

Validation: 169 module/model checks passed, Google and Gboard browser flows pass five languages and
phone width, history, contact/Chrome/Photos routing, reminder CRUD, preferences, screen-search opt-in,
dictation return and cancellation. Source inventory: 775 rebuilt files, zero problems. Remaining
system/service activities and the full-release gates are still listed in remaining-7.1.2.md.

## Launcher pickers / Nougat shortcuts continuation — 2026-10-21

ng-launcher-data.py reads N2G48C manifests, compiled provider XML and android.app.shortcuts directly.
The image enables 18 widget providers, declares 30 static shortcuts and installs zero live wallpaper
services. Disabled duplicate Gmail and Settings power-control providers are not offered. Widget labels,
minimum spans, configuration activity names and native previews are retained in the generated catalogue.

The dark Launcher3 widget list now groups all enabled providers, shows native previews and supports
held-drag placement into vacant cells. Digital clock, analog clock (native dial/hands), Google Search
and Google Feed have live renderers. Other providers retain an explicit not-built marker and remain
on the release checklist. A digital clock's minute refresh now respects each instance's saved span.

Long-pressing a home/drawer app opens its source shortcut pills. Existing apps accept their native
Chrome new/private tab, Camera selfie/video, Calendar event/reminder, Gmail compose, Contacts add,
Google search/voice and Settings intents. Shortcut rows can be dragged out and pinned; pinned labels
follow the locale. Remaining apps receive their source ID as a shortcut sub-route. Launcher drag
listeners are now disposed on activity changes: otherwise an old detached workspace could consume
the next drop after visiting an app. The regression test pins a shortcut after app transitions.

Velvet's wallpaper array is empty in this image, so its picker offers the framework default, My photos
and the actual live-wallpaper picker. Photo pan/zoom becomes a persisted SVG snapshot; Home only
preserves the old lock wallpaper, Lock only preserves Home, and Both updates both. Cancel discards
the unapplied crop. The live picker shows its native empty list. Home and keyguard use the saved
wallpaper independently after reload.

Resource tools now select up to the active era API (25 here) instead of rejecting v25 bitmap/vector
shortcuts. Vector provenance includes the actual qualified XML path; the inventory reads that exact
declaration before trying output-name heuristics. This avoids falsely attributing renamed Nougat
icons to an older image. Inventory regeneration has zero untraced files; 820 files rebuild with zero
problems. Browser checks cover wallpaper targets/cancel/persistence, shortcut launch/pinning after
transitions, real widget placement and spans, five languages and mobile bounds.
The full 169-test module/model suite also passes with four concurrent test files; the isolated
text-entry audit passes with 19,408 entries. Google search regression checks remain green.

## Chrome site settings continuation — 2026-10-21

Chrome 55's website_preferences.xml and single_website_preferences.xml now supply category
switches, cookie/vibration dependants, allowed/blocked exception groups, all sites, storage,
USB's native empty state and per-site permission lists with Clear & reset. Exceptions persist
under Chrome's app data. Exact hosts override wildcards; the longest matching wildcard wins
before the category default. Page info opens the current site's permissions directly.
The offline pages do not generate browser cookies or USB grants; these lists contain the
simulator's saved permission exceptions. No real device/network permission is requested.

Validation: the browser flow passes category navigation, saved switches, wildcard exceptions,
per-site permission/reset, page-info routing, phone width and all five languages. Added model
checks cover permission precedence, unrelated host boundaries and Chrome app-data reset.

## Maps / Messenger locations continuation — 2026-10-21

Maps 9.34.1 uses N2G48C's qu_* palette, 48dp targets, 24dp raster icons, native
card/FAB dimensions, SheetPage/base_header/navigation layouts, settings XML and localized
strings. Maps in this image lacks Hungarian resources; that locale deliberately uses
its native English fallback. The Riverside streets, six places and route geometry are
invented offline content, drawn afresh for this release. No map/GPS/account requests run.

Search accepts Google and Contacts' q: intents. The map pans with a real pointer, zooms
with wheel/two fingers and selects place markers. Place cards save/share, Your places
keeps Home/Work, saved places and recent visits, layers show traffic/transit/bicycling/
satellite, and directions accept endpoints, reverse them and choose four transport modes.
Navigation advances along the drawn route and cancels when the activity is left. Native
distance-unit preferences affect route/guidance formatting. Offline areas select a map
rectangle, save its camera, show persistent download progress/expiry and allow rename/delete.
The app's navigation preferences, sound test, Google voice settings, driving shortcut,
system location and notification routes are connected. Open-source notices are copied
byte for byte from gmm_license_notices.txt; terms/privacy open their Chrome URLs.

Messenger's PlacePickerFragment uses the source 72dp list rows and PlaceCard's map/title/
address layout. Locations wait with other attachments, survive send/reload, forward/share
their place information and open Maps on a tap. The common Help/feedback activities remain
on the separate release checklist, alongside other apps that use them.

Validation: model checks cover endpoint validation, mode-dependent route timing, saved/
recent place deduplication, text search and download progress after reload. Browser checks
cover search/save, routes/modes, all navigation steps, Home label, area create/rename,
imperial units, actual drag/marker pointer events, source notices, Messenger send/open,
five languages and phone width. Chrome and Google browser regressions also pass.
The full module/model suite passes 174 checks. Asset inventory regeneration has zero
untraced files; the source rebuild check passes 845 files with zero problems.

## Hangouts continuation — 2026-10-21

Hangouts 12.0 now draws its 72dp conversation list, 40dp avatars, account drawer,
15sp chat text, compose/attachment strip and call controls from the N2G48C APK's
layouts and resources. Incoming/outgoing/grouped bubble masks are the APK's actual
nine-patches. MessageBubbleView's SRC_IN tint is applied to the background alone:
white incoming and bluegrey100 outgoing, retaining the image's alpha/tail and the
photo/emoji colours. No older app's render function, stylesheet or text table was copied.

Sam's shared hike demo starts the saved chat. Text, photo and location attachments,
group creation/rename/leave, message copy/forward/details/delete, archive/unarchive,
conversation notification levels, block/unblock, DND and account/general settings
are wired. Photos/Documents/shared image intents retain the media ID. Photo and
location cards open Photos/Maps. Native audio/video call screens use local timers,
mute/speaker/camera toggles and an ended-call message; no device media is captured.
The group-left status is explicitly an own offline-model text. Hungarian follows
the APK's English fallback where its resources lack that translation.

A known demo contact answers once per session, after 4.5 seconds. Replies respect
block, sign-out, DND and conversation notification settings; a deleted thread cannot
be resurrected by a pending reply. The source notification icon/large avatar and
RemoteInput reply are connected. A notification reply preserves the in-app draft
and pending attachments. Hangouts has no enabled static shortcut entries in this image.

Validation: the full suite passes 177 checks; source regeneration rebuilds 869 files
with zero problems. Browser coverage includes the seed, delayed reply/notification,
RemoteInput with draft preservation, real held-message forwarding, Documents and
Photos share integration, call controls, block/mute, groups/rename/leave, archive,
settings/sign-in, all five languages and phone width. Screenshots were inspected
to verify native bubble tints and that photos are not tinted with their backgrounds.


## Drive file/provider/widget continuation — 2026-10-21

Drive 2.4.452.15.46 uses the angler APK's white toolbar, grey200 document list,
72dp rows and 40dp type icons, native create panel, scanner controls and widget.
The asset manifest adds 27 original raster resources, including its widget 9-patch.
Texts follow the APK's own fallback where Hungarian/German resources are absent.
PreferenceActivity combines the base preferences with drive_preferences at runtime;
release UI excludes the developer-tools category. The widget's white text was
verified against Widget.Text, not inferred from the main app's colours.

The browser-local Drive model has stable IDs, folders, upload, rename, star/offline,
search/sort/list/grid, move, trash/restore/permanent deletion, file details,
collaborator roles and link-sharing metadata. Shared-upload dialogs select a target
folder and retain the edited file name. Native editor-install prompts cover Google
Docs/Sheets/Slides, whose editor APKs are absent from the image. Cloud operations
are local demonstrations; no invitations or real cloud requests are sent.

DocumentsUI and Drive share stable provider URIs. Cross-provider copy/move rolls
back failures before removing any source. Image uploads own independent snapshots;
mail/chat attachments own private cache copies hidden from Photos and media roots.
Messenger retains a provider snapshot when an outgoing MMS references a local photo.
Downloaded image copies become public MediaStore entries. Clearing Drive's preview
cache preserves Drive records and pinned/offline files.

The scanner captures an invented meetup page, supports multiple pages, rotation,
colour/B&W, pointer crop handles aligned with the letterboxed page and retake in
place. Saved PDF previews retain their page edits. The native 4x1 widget configures
the demo account; cancelling removes only the new widget. Home/upload/scan/create
buttons route to the app, and repeated entry discards stale scanner state.

Validation: 184 module checks pass; the inventory rebuilds 896 files with zero
problems. Drive browser coverage includes sharing, folder destinations, image export,
scan crop/rotate/retake order, provider URIs, cache clearing, five languages and
phone width. Photos, Documents/Gmail and Hangouts regressions pass. Real held-drag
widget placement, cancelled and accepted configuration, scan/create/upload and native
clock widgets pass. Screenshots were inspected for the phone list, scanned pages and
widget. Three Hangouts list dialogs now use escaped item HTML as required by the
framework dialog renderer.

Drive's audio/video previews, scan preference effects and remaining service-backed
settings/activity/help routes are still in the release checklist; this milestone
does not mark the application or the whole version finished.


Drive cache-size source follow-up: dequickened Drive.odex has Lfti.d() installing
ListPreference entries from Lfts.f()/q(). The base sizes in Lfts.<clinit> are
1,2,5,10,25,50,100,250,500,1000 MB; q() divides the cache filesystem's block-count
capacity by 10 MiB, caps at 1000 and selects nearby entries. With the simulator's
26,503,790,080-byte data filesystem this yields 100/250/500/1000 MB. Lftr$a clamps
max/3 to the preceding choice, so the initial selection is 250 MB. The preference
now displays those choices and persists the selected value. The original algorithm
and decoded instruction extracts are retained under tests/browser/artifacts/drive-cache-*;
extracted dex is in ignored _aosp/ngdrive. Cache-size browser coverage verifies the
four labels and persistence of 500 MB. Enforcing preview-cache capacity remains a
model follow-up; cloud records and pinned files must never be evicted.


## Drive completion of local screens — 2026-10-21

The file_viewer_audio/video and media_controls XML now drive audio/video previews:
black window, 56dp audio metadata strip, 80dp #b3000000 controller, 48dp play and
36dp 30-second skip controls. Invented media runs on the local playback clock,
stops at its stored duration, supports seeking, and pauses on leaving the app.
Image previews use meet rather than a cropped square. Scanner settings now affect
new-page enhancement, saved PDF paper size/orientation and JPEG-quality metadata/size;
PDF copies, downloads and re-uploads preserve the pages and options. Delete-page,
retake/capture Back and the scanner settings activity preserve the remaining draft.

Preview cache limits now evict oldest unpinned entries; clear-cache and eviction
retain cloud records and offline pins. Notification preferences include the enable
switch, dependent notification types/vibration and framework sound picker. Encryption
preference dependency is wired. Native empty Notifications and Backups screens replace
the unrelated generic empty view; Backups opens Settings' PrivacySettings.
Privacy/terms open Chrome; the APK's exact 463452-byte third_party_licenses is shown
locally. The inventory can now trace explicitly declared extensionless raw assets
without adding arbitrary APK files to the media fingerprint index.

ACTION_SEND PDF streams retain independent attachment snapshots in Gmail and Drive,
rather than sending their extracted text. Image sharing now populates Messenger's
MMS attachment tray and its provider cache. Native SEND filters were inspected for
Bluetooth/Gmail/Drive/Hangouts/Bugle/Photos; dedicated audio/video receiving activities
remain in the shared intent checklist. The shared Help activity also remains a
release-wide task, rather than a duplicate app-specific replacement.

Validation: 188 module checks, Drive and Documents/Gmail browser workflows, five
languages and phone bounds pass. The Drive browser additionally exercises audio
seek/pause, video completion, native backup settings, scanner preferences, A3
landscape PDF, Gmail PDF snapshot, Messenger image stream, dependent notification
preferences and original license content. Audio/PDF screenshots were inspected.
Source inventory: 903 files rebuilt with zero problems.


## YouTube continuation — 2026-10-21

YouTube 11.41.56 is drawn from Theme.YouTube.Home/Light (#e62117 toolbar,
#ba1b12 status, #4285f4 accent, #fefefe window), AppTabsBar above the feed,
video_feed_entry, slim_metadata, player_controller, account_item,
create_playlist_dialog and upload_form_details. Original xxhdpi icons and the
APK's extensionless third_party_licenses are copied byte for byte. Native strings
cover the controls and preferences. Labels/content normally provided by YouTube's
server catalogue are explicitly own rows in ng-own.tsv; six invented video entries
and drawn frames are offline demonstration content, with no external stream.

Home, Trending, Subscriptions and Account tabs, global search, viewing/search history
and pause/clear controls, channel lists, mutually exclusive like/dislike state,
subscribe/unsubscribe, Watch later, liked videos and playlist create/edit/delete/
remove/share are connected. Creation uses the source's 50-character name and Private
checkbox. The player has time/seek, play/pause/next, fullscreen, captions, speed,
quality and optional native Stats overlay. Its 180dp mini player follows the source's
8dp padding and 90dp horizontal dismissal threshold, tested with a real pointer drag.
Leaving the app pauses playback; reaching the stored duration stops or follows Autoplay.

My videos accepts a local DocumentsUI video, clones its source snapshot, and uses the
native 105x66 thumbnail, 100-character title, 5000-character description and privacy
spinner. Local upload, metadata editing, cancellation and deletion work without a
remote publish. Deleted uploads lose their history, rating and playlist references;
the original MediaStore video remains. Native Java-installed settings rows are joined
to the generated XML. General/privacy/notifications/about and framework captioning
routes work; Watch on TV shows the native no-TV state in this offline environment.
Shared Help remains a common service activity task.

Visual inspection caught 1x1 transparent compatibility resources for nominal play/
pause/next icons; the visible buttons now use ic_media_play_light,
ic_media_pause_light and ic_vidcontrol_next. The Cast control uses the real media
route drawable, tinted as the action bar does, rather than the Live broadcast icon.
A regression check rejects dummy control images. Home, watch, upload and phone
screenshots were inspected. The browser flow covers reactions/subscriptions, saved
playlists, fullscreen, speed/captions, real mini-player drag, search, native preferences,
licenses, local upload/edit/delete/cancel, all five languages and phone width.

Validation: 194 module checks pass. Source inventory rebuilds 930 files with zero
problems. The earlier usage stop threshold is suspended by the owner's latest
instruction; continue with the remaining applications and release gates.

## Play Movies continuation — 2026-10-21

Videos 3.20.10 is drawn from AppTheme.Drawer: the PlayHeaderListLayout header in play_movies_primary #ff1744 under
the drawer's #2e000000 status overlay (#d11338), the #eeeeee window, the Play drawer with Watch now / My library /
Wishlist / Shop (ic_drawer_* vectors) and Settings / Help & feedback (settings_and_help_menu). The first start shows
onboarding_layout (#ff1744, BlueButton "Get started"). Watch now has welcome_card_narrow's generic card (Shop TV /
Shop Movies) and the dismissable Family Library card on play_movies_secondary, the "Trailers, trailers, trailers"
channel card and a Movies cluster of the shared invented store titles (cluster_item_movie: 0.693 poster, year and
movie_duration, price, wishlist toggle). The demo account owns nothing, so My library's Movies / TV Shows tabs show
no_content_narrow ("No movies", "No TV shows"). The wishlist is Play Store's own list (cluster_item_wishlist_movie with
its overflow: Remove from wishlist, Play trailer). Search filters the catalogue (no_results_label). A card opens the
store details; Play Store now returns to the calling app when it was started for a detail, corpus or search.

The trailer player is WatchTheme on black: the 48 dp action bar overlay, controller_overlay's #cc000000 bar with
the time / TimeBar (4 dp rail, 6 dp scrubber, play_movies_primary) row, the 40 dp play/pause FAB (ic_fab_*_small),
skip previous / next, the wishlist button and the captions button (Off / the language), auto-hiding after 3 s with
the status and navigation bars. Trailers of the invented titles run on a local clock; leaving pauses them.
Settings is res/xml/preferences with its code's rows: parental controls (Allow movies rated up to), caption settings
(preferences_caption with a preview), manage downloads (instructions_no_offline_content), storage, version, licenses
(the APK's license.html). Dogfood, TV pairing and Disney Movies Anywhere stay hidden (internal build, no set-top box,
no linked account). `node tests/browser/ng-movies.mjs` covers all of it in five languages and at phone width.

## Play Games continuation — 2026-10-21

PlayGames 3.7.24 follows Games.DestinationActivityTheme: Games.ActionBar.Dest #4e802b, status #446f26, the #eeeeee
window and the DrawerLayout with Play Now / My Games / Notifications / Players / Explore (games_ic_drawer_* for the
three the APK draws) and Settings / Help & Feedback. The first start runs the onboarding tutorial (games_on_board_bg,
games_ww_logo / friends / levelup, Skip, Done) and the Gamer ID setup: games_profile_setup_info's three rows, then
games_profile_setup (avatar pict_player_no_image, the Gamer ID field with its "%1$d / %2$d" counter, the 3–15 letters
and numbers check, both privacy check boxes, the sign-in footnote). Play Now has games_profile_summary_card (tiled
banner, level 1 and its XP bar, View profile), the green Onyx "got it" card and the Featured / Continue Playing clusters
of the invented store's games (games_onyx_small_card with Not installed / Continue Playing). My Games (Installed / All my
games), Notifications and Players show the APK's empty states; Explore has Featured / Popular / Popular multiplayer and
the Play store card. A game's detail installs through Play Store's own page and then plays the installed demo app; the
player detail shows the new profile's level and XP. Settings (built in code): the signed-in account, Switch account,
Edit profile and Delete Play Games profile. `node tests/browser/ng-games.mjs` covers it in five languages and at phone
width.

## Android Pay continuation — 2026-10-21

Wallet 1.4 is card_list_activity on quantum_grey50 with the account-spinner toolbar; with no card it shows the
cyanA700 #00b8d4 splash (tp_placeholder_card, "Add a credit or debit card") and the white FAB, whose speed dial
(card_list_fab_fragment) offers a credit or debit card, a store gift card and a loyalty program. A card goes through the
OCR screen (Theme.Ocr, "Line up your card with the frame", Add manually) to Google Payments' add-instrument form from
PrebuiltGmsCore (Scan credit or debit card, Card number with 4-digit grouping, MM/YY, CVC, Cardholder name, billing
address), validated with the form's own messages (Luhn, expiry, CVC length by network, ZIP). With no issuer to ask, the
new card is "Contacting your bank…" and then "Verification needed"; the first one opens warm_welcome's three how-to
pages. The card's details show the virtual account number state, no transactions, Set as default (refused with the
app's verification message) and Remove card. Gift card and loyalty search find no programs offline. cards_menu
(Settings with the five setting_switch rows and the APK's third_party_licenses, How it works, Nearby stores and the
web pages), the NFC-off and "Always use Android Pay in stores?" prompts read Settings' NFC and Tap & pay values.
`node tests/browser/ng-pay.mjs` covers it in five languages and at phone width.

## Project Fi continuation — 2026-10-21

Tycho K.2.7.20's launcher activity (AccountDetailsActivity) needs a Project Fi account; the demo Google account has
none, so it opens the activation flow in SuwThemeGlif.Light (suw_glif_template_compact, ic_fi_logo, the
google_blue_500 accent): "Sign up for Project Fi" with the phone's account, fragment_account_chooser behind the text's
own "use a different account." link, and "Sign up at fi.google.com" in Chrome. The image has these texts only in
English (Fi was US-only), so every language shows them so. `docs/tools/mm-vectors.py` takes `VECTORS=-<name>` to draw
one list quickly. `node tests/browser/ng-fi.mjs` covers it.

## Device Policy continuation — 2026-10-21

DMAgent 7.05's DMAgentActivity finds no Google Apps for Business, Education or Government account on the demo phone
and shows add_account_activity in DMAgentTheme (DMAgent.Toolbar #3aa3db, status #0099cc): the two explanations, the
example address and the bottom bar's Add account, which opens Settings › Add an account. The image has DMAgent's texts
in English (and French) only. `node tests/browser/ng-dmagent.mjs` covers it.

## Help & feedback continuation — 2026-10-21

Every app's Help & feedback now opens GoogleHelp of PrebuiltGmsCore 9.8 (`help`, sub = the calling app): the #e5e5e5
console under the light header, the Search help card (gh_card_background nine-patch), "<app> Help" with BROWSE ALL
ARTICLES (support.google.com in Chrome), Contact us with Send feedback, and the overflow's Version info (the app's
version, ©2016 Google Inc.), Clear help history and View in Google Play Store. Help articles come from Google's server,
so a search shows its "No results found." Send feedback opens feedback_ui under gf_action_bar_fill #00bbd3: the
account, Write your feedback (Send refuses an empty one with gf_invalid_description_text), Include system logs and the
screenshot preview; Send shows "Sending feedback..." and returns to the app. The class prefix is `nghp-` (the
launcher already uses `ngh-`). `node tests/browser/ng-help.mjs` covers it.

## Print continuation — 2026-10-21

PrintSpooler 7.1.2's PrintActivity (`print-preview`) prints the job an app hands over (c.ui.printJob): Cloud Print's
share alias, Gmail's conversation menu Print and GoogleHelp's Print… (gh_print_job_name). Theme.PrintActivity is
Theme.Material.Light: the destination spinner (Save as PDF, All printers…) and the "Copies: / Paper size:" summary in
#f5f5f5, print_activity_controls (Copies, Paper size from the framework's media size names, Color, Orientation, Pages
with the "All n / Range of n" choice and the page range field; an invalid count or range disables the button), the
round print_button in colorAccent #009688 with ic_menu_savetopdf and the preview pages on #f2f1f2 with the page
selector. The default paper follows mediasize_standard: Letter for en-US, ISO A4 elsewhere. All printers… finds no
printers (Add service opens Play Store). Save to PDF writes the PDF (pages, paper, orientation, colour, copies)
through Documents' save dialog, whose save now takes the caller's type. `node tests/browser/ng-print.mjs` covers it.

## Google settings and Location History — 2026-10-21

The dashboard's Google tile (GoogleSettingsActivity of PrebuiltGmsCore 9.8) now opens Settings pages (`gms*`, ng-gms.js)
instead of a not-built card: Account (Sign-in & security, Personal info & privacy, Account preferences on
myaccount.google.com) and Services: Ads (advertising ID, reset, Opt out of Ads Personalization), Connected apps (none),
Data management (Drive-enabled app files over Wi-Fi only / Wi-Fi or Cellular), Location (Google location settings:
Access location, Google Location History, Location Sharing), Nearby (switch bar), Play Games (its settings), Search &
Now (the Google app's preferences), Security (Android Device Manager's two switches, Verify apps), Set up nearby device
(Getting started, searching, No nearby devices found) and Smart Lock for Passwords (switches, the never-save apps).
Google Fit is not on the image, so its row is left out. Settings › Location › Google Location History opens the same
Location History page (the account, the summary, pause confirmation, Manage activities, Delete Location History).
`node tests/browser/ng-gms.mjs` covers it.

## Screen savers — 2026-10-21

`daydream` is the screen saver DreamManagerService starts (Settings › Display › Screen saver › Start now): DeskClock
4.6.1's Screensaver (desk_clock_saver: the 64 sp digital clock or the clock_analog_* dial, date and next alarm; its
screensaver_settings through the app-prefs engine: Style, digital by default, and Night mode, on by default, the very
dim display; moved to a new place each minute with a fade), BasicDreams' Colors and Google Photos' daydream (the device
albums one after another, slowly panning; DreamSettingsActivity as a Settings page: Only use Wifi for data, Albums on
device, Albums in Google Photos). A touch wakes it to the screen it covered. The image's GoogleVrCore (Google VR
Services) has no screen of its own (the 6P is not Daydream-ready); its app info is Settings' generic page. The class
prefix is `ngsv-` (`ngdm-` is Device Policy's). `node tests/browser/ng-dreams.mjs` covers it.

## Nougat easter egg — 2026-10-21

Read from frameworks/base android-7.1.2_r1 (PlatLogoActivity, packages/EasterEgg's neko/*, kept in _aosp/aosp712/egg):
Settings › About phone › Android version tapped three times opens `platlogo` (Theme.Wallpaper.NoTitleBar.Fullscreen,
the framework's platlogo vector scaling in after 800 ms); a long press after five taps runs NekoActivationActivity,
which turns the Neko tile on or off with a borderless 🐱 / 🚫 toast (the toast now takes {plain: true}). Quick
settings take other packages' tiles through NG.qsCustom (available, state, click, long click), so the tile shows in the
editor once enabled; it shows the dish's food, a tap empties the dish or opens NekoDialog's food grid, and the food
schedules NekoService for its food_intervals minutes ±25 %. When the job runs a cat comes (new with food_new_cat_prob,
else a known one) with "A cat is here." from Android Neko. Cats are drawn as Cat.java does: java.util.Random seeded
with the cat's seed picks the colours, the 27 parts (docs/tools/ng-egg-parts.py writes their shapes into
ng-egg-parts.js) are tinted in CatParts' order, the icon is the cat in its value-shifted circle. `neko` (NekoLand) lists
them by hue in three columns: tap to rename, long press for Forget %s? and share (the picture is saved to Photos'
Pictures/Cats, ng-media.js now draws a picture's own SVG markup, and sent through the share sheet).
`node tests/browser/ng-egg.mjs` covers it.

## Settings rows into other packages — 2026-10-21

Settings › More › Cellular networks (and Data usage's menu) open TeleService's MobileNetworkSettings through the
app-prefs engine (`[mobilenet]`: network_setting, gsm_umts_options, carrier_select): Data roaming with "Allow data
roaming?", Preferred network type (enabled_networks_choices: 4G / 3G / 2G), Enhanced 4G LTE Mode, Access Point Names and
Network operators (Search networks lists the radio's scan of the simulated area, Choose automatically registers again).
The CDMA row, the GSM-only network mode list and the empty Carrier settings target stay hidden as the code hides them on
this phone. Wi-Fi › Advanced › Wi-Fi Direct (`wifi-direct`) shows the P2P device name (Android_ and four characters of
the Android ID by default), Peer devices while searching, Remembered groups, Search for devices and Rename device.
About phone's Send feedback about this device opens Google Feedback, Emergency information the Emergency information app.
`node tests/browser/ng-settings-extra.mjs` covers it.

## Smart Lock and Trusted face — 2026-10-22

Settings › Security › Smart Lock (GmsCore 9.8's GoogleTrustAgentPersonalUnlockingSettings) asks for the screen lock
first and opens Settings pages (`smartlock*`, ng-smartlock.js): On-body detection (the switch bar over
auth_on_body_detection_prompt's #007166 area with the illustration; turning it on asks "Keep in mind"), Trusted places
(Home from Google Maps, places added by name and address, duplicates refused), Trusted devices (Bluetooth: the bonded
devices, "Add trusted device?", Connected / Not connected, removal; NFC), Trusted face and Trusted voice (the Google
app's hotword setup). Trusted face is FaceLock's own setup, read from its decompiled code (_aosp/ngfl): SetupIntro,
SetupInstructionsScreen, SetupEnrollmentScreen (the front camera under the white Scrim with the ProgressRing's opening,
"Starting up…", a frame every 660 ms filling the ring's 10 steps, then "Face added" and SetupEndScreen) and the end
screen with Licenses; once set up, Improve face matching runs AddToSetup and the enrollment again, Remove trusted face
forgets it. Each FaceLock activity lays out under the transparent status bar (setSystemUiVisibility 1280): modules can
now say `underStatus(c)` (Settings pages too). The agents keep the phone unlocked (open lock icon, no bouncer) once
the screen lock has been used since boot: on-body detection, a trusted face, or a trusted Bluetooth device that is
connected. `node tests/browser/ng-smartlock.mjs` covers it.

## Rows that reached no screen — 2026-10-22

A sweep of `c.open` targets and `missing:` cards: Calculator's, Camera's and Maps' Send feedback now open Google
Feedback, Chrome's microphone the Google app's voice search, Printing's Add service the Play Store search, Settings'
Explore tips & tricks www.android.com in Chrome (SupportFeatureProviderImpl's default tips_and_tricks_url). The spell
checker's settings are Gboard's SettingsActivity. Text-to-speech's engine gear opens GoogleTTS's EngineSettings
("Google TTS Options": GeneralSettingsFragment without process_text and voices_type, AnalyticsPreferenceScreen,
Feedback). The other input methods (Google Indic Keyboard, Japanese Input, Korean Input, Pinyin Input) have their
settings once enabled (ng-imes.js: headers with PREFERENCE_FRAGMENT, the shared library's seek bars, theme selector,
the overflow's Send feedback and About with the version), Japanese Input its Dictionary tool (Mozc's
UserDictionaryToolActivity: dictionaries, words with the 43 categories, export through the share sheet, import,
undo), keyboard layout and Clear … dialogs. The app-prefs engine opens the intents no hook takes: web pages in Chrome,
the user dictionary, captions, Google location settings, and the licences (LicenseActivity's assets/licenses.html;
LicenseMenuActivity's third_party_licenses by its metadata, else the whole text); hooks can give an XML screen action
bar buttons (`actions(c, xml)`); Gboard's overflow has Usage tips, About and Help & feedback. mm-appprefs.py now
resolves intent data references and tolerates complex entries. `node tests/browser/ng-imes.mjs` covers it.

## Bundled notifications — 2026-10-22

From android-7.1.2_r1 (kept in _aosp/aosp712/sui): GoogleExtServices' Ranker bundles an app's ungrouped notifications
at AUTOBUNDLE_AT_COUNT 4 (NotificationManagerService posts a textless summary); an app's own group bundles from two.
The shade and the keyguard draw a bundle as NotificationChildrenContainer does: the header with the expand button,
2 HybridNotificationView lines collapsed (5 when it is the first, system expanded row; the last ends in "+ n"), tapped
the children as rows (up to 8) under 0.5 dp #616161 dividers at 50 % with only the time left in their headers
(NotificationHeaderUtil). A bundle swiped away takes all its notifications; collapsing the panel collapses every
bundle (NotificationStackScrollLayout.setIsExpanded); the status bar shows one icon for it.
`node tests/browser/ng-bundles.mjs` covers it.

## Split screen — 2026-10-22

From android-7.1.2_r1 (DividerView, DividerHandleView, DividerSnapAlgorithm, TaskStack.DockState, RecentsView,
RecentsViewTouchHandler, Recents.dockTopTask, kept in _aosp/aosp712/divider and recents) — ng-split.js:
Overview held in an app docks it at the top with Overview below (an undockable app: "App doesn't support split
screen"; Camera is the image's only launcher activity with resizeableActivity="false"; target SDK 23 apps show "App
may not work with split-screen."); in Overview a task held for 500 ms and dragged into the top 12.5 % ("Drag here to
use split screen", the white 80 / 255 overlay growing to the docked bounds) docks too, an undockable one shows the
incompatible app overlay. The 10 dp black divider with its 16 x 2 dp handle (a 6 dp circle while held) snaps to the
16:9, middle and 16:9 targets (SNAP_MODE_16_9: 894 / 1221 / 1547 px) and dismisses at the ends (top: the docked app
goes; bottom: it takes the screen) with the 400 / 600 dp/s fling rules; Overview below lays its stack out in the
bottom window and leaves the docked task out (undockable tasks carry the incompatible toast). Home minimizes the docked
stack (an 8 dp strip with MinimizedDockShadow), an app from the launcher restores the split; Overview held again
undocks; the Overview key shows ic_sysbar_docked. One side is live and the other shows its last drawing laid out in
its window; a tap makes it the live side. `node tests/browser/ng-split.mjs` covers it.

## Calendar Goals — 2026-10-22

The speed dial's Goal no longer shows a not-built card: CreateGrooveActivity is `calendar-goal` (ng-calendar-goals.js),
read from Calendar 5.7's com.google.android.calendar.groove (not obfuscated; decompiled into _aosp/ngcal): the store
(five GrooveCategories cards with their pictures), the subcategories (getNumSubcategoriesToDisplay 4 / 3 and Custom…
on the illustration colour with the picture at the bottom), CustomGrooveFragment (the question as hint, the rest of
the subcategories or the language / instrument / art / hobby suggestions, the mini button once there is text), How
often? (the monthly set for GrooveFrequencySelectionView's types, More options…), For how long?, Best time?, the
summary (groove_n_times_a_week, "duration, time", MORE OPTIONS: the goal's editor) and the creation with
groove_checking_schedule_array. The sessions are placed at free times in the chosen part of the day for four weeks
(eight for monthly goals); Calendar shows the post-creation sheet ("First time is …", ADJUST TIME / LOOKS GOOD), the
sessions carry the flag, and a session shows the goal segment (Session n this week, n/m done) with LATER / DID IT.
Screens can ask for the light status bar (`lightStatus(c)`: dark icons, #99000000).
`node tests/browser/ng-calendar-goals.mjs` covers it.

## Testing menu and keyless preferences — 2026-10-22

Finished the in-progress Dialer SpecialCharSequenceMgr paths: `*#06#` shows the device IMEI, `*#07#` reuses the regulatory
labels, and `*#*#4636#*#*` opens Settings' TestingSettings. RadioInfo follows the shared mobile/Wi-Fi state: radio power
affects the status bar, SMSC Update/Refresh store/read the simulated SIM address, the menu has the IMS status, band mode
selection/result and the demo SIM's empty ADN/FDN/SDN lists. The OEM button is disabled because the image has no receiver;
carrier provisioning broadcasts likewise have no receiver. Ping results describe the simulated network, never the host's.
WifiAPITest's disable/enable accept a saved network ID; blank/invalid input cannot accidentally select network zero,
and the IDs stay stable when Settings sorts the connected AP first. UsageStatsActivity records foreground time and last use
at one-second intervals, with the native sort choices, rather than inventing usage from the launcher's predictions.
Texts come from SettingsGoogle, TeleService, GoogleDialer and framework; debug constants come from the AOSP classes in
`_aosp/aosp712/settings/testing`. Keyless Settings preference rows now carry their XML position so each resolves its own
intent (both Testing's keyless sibling rows were inert before). Validation: `ng-testing.mjs` covers codes, radio power,
SMSC, IMS/bands/SIM lists, measured usage, all Wi-Fi screens and disable/enable, phone width and all five languages;
`ng-settings-extra.mjs` passed, all 205 module checks passed, and the source inventory was regenerated.

## App data and package lifetime — 2026-10-22

App info's Clear data now clears the package's private model/preferences instead of only changing a storage counter.
`ng-app-data.js` maps the launcher apps to their private fields and shared provider/service records. SMS, contacts,
calendar events/goals, local photos/audio/Documents nodes, Drive's cloud files and PackageManager's installed apps stay;
queues, drafts, onboarding, private settings and offline/cache copies reset as appropriate. Clock loses its alarms,
Chrome its unsynced local tabs/bookmarks/history and site settings, Music its queue/playlists/player, and Pay its
device cards. Settings' Clear data is disabled. Clear cache has a separate scope (Drive's offline files stay).
Force stop and disabling a package stop its player/work, cancel its notifications and discard its recent tasks,
history, split snapshot and private screen state. Stopped packages' tick hooks stay stopped across reloads until an
explicit app launch (including its settings activity) reopens the package. Shared `NG.appTasks` owns Messenger,
Hangouts and Calendar Goal delayed jobs so clearing/stopping cancels old callbacks; pending message delivery can resume
on launch without replaying a cancelled demo answer. Opening an app resets its zeroed usage flags as private data grows
again. Hangouts' browser test now scopes queries to the live viewport so animation snapshots cannot supply the old
draft field. Validation: six new lifecycle/model checks (211 module checks total); browser Clear data/Force stop flow,
Music, Hangouts and Calendar Goals; phone width and all five languages in the new flow.

## Widget resize — 2026-10-22

Launcher3's AppWidgetResizeFrame (`ng-widget-resize.js/css`) now appears after a resizable widget is dropped, including
after successful configuration: Velvet's widget_resize_shadow/frame nine-patches and 19 dp ic_widget_resize_handle,
24 dp background padding, 13 dp handle margins, 48 dp touch regions, the 0.66-cell threshold and 150 ms snap. Resize
flags control which handles appear; minResizeWidth/minResizeHeight plus the host's 16 dp padding determine the minimum
spans. The provider generator now follows AppWidgetServiceImpl's minWidth/minHeight fallback when those attributes
are absent (not zero, which would have made Music shrink below its native minimum). Resizing previews a complete
reorder transaction outside the saved model; the grid commits on release, rolls back on pointer cancellation and rejects
an area that cannot fit all items. Other widgets keep their spans when displaced. Back, Home and leaving the launcher
dismiss the frame. Moving an existing widget preserves its resized dimensions and grab point; nearest placement takes
the widget's centre once, so a hold/release does not shift it. The digital clock's font sizer now subtracts the host's
padding, keeping its minimum 2x1 clock inside the available space.
Validation: five new geometry/transaction checks (216 total module checks), `ng-widget-resize.mjs` (desktop preview/
commit, minima, reordering, moving, horizontal-only and fixed providers, reload, five languages, actual phone touch
resize and touch cancellation), and the existing provider picker and Play Store widget flows. Three native bitmaps
were added to the source inventory.


## Audio/video SEND receivers — 2026-10-23

ACTION_SEND now resolves the enabled N2G48C manifest MIME filters, including Messenger/Hangouts' separate video
aliases, Photos' video/panorama filter and YouTube's upload alias. Hangouts has no audio receiver; Messenger accepts
application/ogg in addition to audio/*. Cloud Print's wildcard receiver responds with its native submission failure
for audio/video. Disabled packages are excluded, and a target outside the resolved set cannot be selected.
Share-time snapshots preserve capture time, duration, filename, edits and audio tags. Receiver-owned visual media,
provider-sent MMS and uploaded Photos/Drive/YouTube copies remain usable after deleting the source. Messenger handles
inline audio play/pause/elapsed progress and video overlays, forwarding and resharing retain media types, Hangouts
shows its native video overlay, and Photos, Gmail, Drive and YouTube consume the appropriate stream metadata.
PrebuiltBugle's audio bitmaps are alpha masks tinted like ConversationDrawables (conversation colour outgoing,
white incoming), with native progress backgrounds and timer colours. Playing inline audio pauses Play Music and
volume keys follow actual active call/media state. A YouTube upload resets stale fullscreen/search/license state.
Validation: four new model cases (220 module checks total); Documents, Hangouts and YouTube browser regressions;
new media flow covers native target sets, SMS audio/video and resharing, volume keys/tint, Hangouts video,
Photos/YouTube upload, Gmail/Drive audio, Cloud Print failure, source independence, five languages and phone width.
Four native control bitmaps are recorded in the regenerated asset inventory.


## MusicFX — 2026-10-23

Play Music's Equalizer now opens MusicFX 1.4 ActivityMusic rather than the unavailable-effects dialog. The panel is
rebuilt from N2G48C's music_main/music_eq and framework Theme.Material.Light: light action bar with a right switch,
180 dp rotated band sliders, 50 dp frequency columns, 15/6 dp effect-row margins and 170 dp strength sliders.
The image's audio_effects.conf selects libbundlewrapper; android-7.1.2_r39 EffectBundle.h supplies its exact five-band
soft curves and untranslated driver preset names. ControlPanelEffect supplies disabled-by-default processing,
FX booster [0,800,400,100,1000] mB, stored User curve, bass 667 and surround 0; ActivityMusic clamps its UI to +/-10 dB.
Editing a band preserves the other active-preset levels in User. Preferences are isolated per calling package and
belong to MusicFX for Clear data. Bass/surround follow wired/A2DP routing and bypass on disconnect without discarding
saved strengths; HFP-only pairing does not enable media effects. The native plug-headphones response is wired.
Preset reverb remains hidden: this APK's music_main marks its spinner GONE and ActivityMusic never shows it.
As with the other simulated players, these are media-session parameters around a simulated clock; no real decoded
waveform/DSP graph is claimed.
Sources: https://android.googlesource.com/platform/packages/apps/MusicFX/+/android-7.1.2_r39/src/com/android/musicfx/
and https://android.googlesource.com/platform/frameworks/av/+/android-7.1.2_r39/media/libeffects/lvm/wrapper/Bundle/EffectBundle.h
Validation: four new model/lifecycle cases (224 module checks pass), Music regression and a dedicated browser flow:
opening from Music settings, enable/bypass, presets/User preservation, A2DP gating, strength persistence, separate
callers, reload, desktop/phone and all five languages with no missing texts/assets.


## Calendar and Chrome widgets — 2026-10-23

Calendar's Schedule widget now renders native widget_initial/header and normal/narrow chips from CalendarGooglePrebuilt
5.7: 12/22 sp header, 46 dp day column, 60/36 sp normal rows and 50/30 sp narrow rows, 2 dp coloured chips, scrollable
upcoming local provider events and the native empty state. Month uses widgetmonth_layout's 48 dp blue header,
48 dp previous/next controls, 24 dp weekday band, 10 sp day numbers, 17 dp today circle and 14 dp short event chips.
Week start follows the locale; five/six-week grids and per-widget saved month offsets are supported. Event, day and
header taps open the corresponding Calendar event/day/schedule. Ended events are filtered, ongoing/overnight events
and exclusive all-day end boundaries stay correct, and civil-day arithmetic avoids DST drift. Month rows adapt their
chip capacity to the host's available height and expose overflow-day taps.
Chrome's bookmark_widget/item/icons_only now displays the shared bookmark model in its native translucent-white
48 dp rows, 64 dp favicon column and 16 sp titles. Mobile-bookmark folder navigation is widget-local and saved;
URL taps open normal Chrome tabs, and deleted/all-cleared bookmarks produce the native empty-folder state.
Validation: three new date/provider cases; dedicated browser flow uses actual pointer taps after dismissing the
launcher's first-run cling, and covers events/day launch, month navigation/persistence, folders/URL/empty, phone
width and five languages. All 227 module checks pass. Three source bitmaps added; inventory rebuilds 1139 files with zero problems.


## Messenger and Gmail widgets — 2026-10-23

Messenger's native 8 dp padded list (48 dp blue header, 72 dp rows) shares the actual provider conversations, names,
read flags and previews. Its conversation widget uses transparent header/title, native incoming/outgoing nine-patches,
40 dp avatars, a 25-message window with View more, and the exact reply/list controls. The provider's deleted-thread
response starts reconfiguration. WidgetPickConversationActivity was checked in the image's dex: it opens
ShareIntentFragment with hide_conv_button_key, so configuration uses Select conversation with no new-thread control.
Back/Cancel removes an uncommitted placement; selecting stores the widget's own conversation reference.
WidgetReplyActivity uses widget_reply_view/QuickReply styles, the 85% black scrim, normal/compressed keyboard insets,
13 sp Open Messenger and Gboard. Its translucent window keeps the workspace visible beneath the scrim. Attach-media is GONE in this activity's onCreate (confirmed in N2G48C's code).
Reply uses Messenger's existing delivery/demo-reply jobs, stops with its package, preserves a draft when opening the
full conversation and finishes its activity rather than leaving a stale reply screen in Back history.
Gmail's 48 dp red header, 72 sp sender/subject/snippet rows, native gradient background and compose action are wired.
Choose account then Choose folder stores independent widget configuration; Inbox includes all inbox categories,
mail taps mark the provider record read and compose opens a new draft. Background provider changes refresh visible
widgets, with the conversation stacked at its newest messages.
Validation: the dedicated flow uses real pointer taps and covers config/cancel/reconfigure, list/conversation launch,
quick reply with Gboard, send/draft handoff, Gmail account/folder/mail/compose, reload, phone and five languages.
Documents/Gmail regression and all 227 module checks pass. Six native assets added; inventory rebuilds 1145 files,
zero problems. Source excerpts remain in ignored _aosp/ngbg-widget-java for audit.


## Project Fi and Sound Search widgets — 2026-10-23

The final two enabled providers are implemented, so the full N2G48C catalogue of 18 has working views. Project Fi
uses Tycho's actual no-account response, not the phone's unrelated cellular-usage estimate. Its provider bytecode
selects widget_data_usage_1x1_no_account below 133 dp and scales the larger circular illustration against 133 dp;
logo size/offset and Sign in size/padding now follow that code. The widget opens the existing Fi activation flow.
Velvet's soundsearch_intent_widget uses both native selector bitmaps and opens its intent_api_soundsearch capture
layout: native IME background, 24 sp light capture text, 90 dp recognizer, 68 dp listening orb and 96 dp audio renderer.
The local simulator resolves an empty capture to the native no-recognition response; retry resets its capture token,
Back cancels its visible activity, and package-owned work cannot return a stale result after leaving or Force stop.
No microphone capture or real song-identification backend is represented by the simulated listening state.
Validation: service-widget browser flow covers all providers implemented, large/1x1 Fi and Sign in, listening/
no-match/retry/cancel, persistence, phone width and five languages; the native picker/real held-drag regression and
all 227 module checks pass. Four native bitmaps/nine-patch and Fi's vector added: 1150 rebuilt source files, zero
inventory problems. Three labels untranslated in the source APK intentionally retain their native English fallback.

## Guided Camera captures and Smartburst — 2026-10-23

GoogleCamera 4.3's panorama types and Photo Sphere now run a multi-frame guided
capture: pointer/touch motion supplies the simulated orientation, dwell samples an
aligned target, Done requires two frames, Cancel/Home discard unfinished captures,
and a complete grid finishes automatically. Saved media retain poses, coverage and
projection. These are synthetic scenes, not stitched sensor images; the deterministic
target map is simulator logic. Lens Blur uses the native RefocusProgressView geometry,
phone/warning/success assets and instructions, rejects fast/lateral motion and saves
only after upward travel completes. The native RGBZ viewer exposes focus and bokeh
strength with a synthetic depth mask; Done commits, Back discards its draft.

A held shutter starts a capped five-second/40-frame synthetic Smartburst. The native
preference retains the ranked best eight or all chronological frames; a second
preference controls automatic animation creation. Ranking and creation choices are
deterministic simulator logic rather than Google's proprietary image analysis.
BurstEditorFragment's grid/section/selection toolbar and AddCreationFabMenu use their
current APK resources. Available landscape creations are collage, animation, video
and a four-frame Photo Booth strip. Group Smiles is unavailable because these drawn
scenes have no detected faces. Creations snapshot source media and remain usable
after a source frame is deleted. The viewer supports playback, deletion, share and
direct Photos editing. SEND_MULTIPLE routing is covered in its own section below. Volume keys now obey Camera's shutter/zoom/nothing preference;
pinch and digital zoom crop the saved synthetic scene (simulated 1–4x capability).

Validation: all 234 module checks passed; seven new model/media checks, guided capture and burst editor pointer
browser flows, all five languages and phone width; existing Camera and Photos
browser regressions passed. Source inventory rebuilt all 1168 assets with zero problems. Image assets were extracted from N2G48C, never
from an earlier release. No real camera, stitching, depth capture or face-analysis
backend is claimed.

## Gboard theme packages and image themes — 2026-10-23

The 15 additional Gboard 6.0.84 theme packages are decoded from the APK's protobuf
metadata and layered style sheets, including each optional bordered palette. The
existing Material light/dark themes remain; all 17 use native names and colours.
ThemeSelectorActivity now has its native dark preview holder, 128×92dp fixed grid
candidates, native checked foreground and My Image launcher. Miniature keys are
runtime previews of this image's keyboard mappings, rather than copied screenshots.

The image builder selects a local image through Documents, snapshots it, supports
drag/pinch crop (mouse wheel on desktop), brightness, save/edit/cancel/delete and
automatic fallback to Material light on deletion. The saved theme remains intact
when its source photo is removed. Theme metadata and the frame/editor dimensions
come only from this Gboard APK. Fullscreen preference customs allow the native
special-purpose activity to retain its own header and status colour.

Validation: original Gboard editor/language/browser regression and the new real
pointer theme flow passed, including live red/cyan palettes, borders, crop,
brightness, snapshot independence, editing/cancellation/deletion, phone width and
five languages. Source inventory: 1174 rebuilt files, zero problems.

## Gboard D3 dictionaries and composing words — 2026-10-23

The native D3 dictionaries embed MARISA tries, mapped symbol tables (16- or 24-bit
trie-key+1 indices), blocked label IDs and weighted initial-candidate protobufs.
ng-keyboard-dictionaries.py decodes the exact compressed resources and records their
SHA-256; --check rebuilds and compares all four outputs. English has 169151 symbols;
German 64081, French 64109 and Spanish 64087. There is no bundled Hungarian pack,
so Hungarian uses the shared personal dictionary and learned words. Generated JSON
is loaded locally on demand, without contacting a dictionary service.

Candidate buttons, prefix completion, transposition/spelling correction, correction
undo, personal shortcuts and next-word learning are connected to the browser editor
contract. Native initial predictions and blocked lists are preserved. Password,
e-mail and numeric editors do not suggest or learn words; automatic correction also
respects spellcheck=false. The native preferences control predictions, correction,
learning, blocked words, gesture input and gesture trail. Secret text is never
added to the learned model.

Pointer/touch gliding decodes a sampled path against the current layout's actual
key coordinates, including repeated-letter paths and alternative candidates.
GestureOverlayView's light/dark track colours come from this APK. Prefix scoring,
edit distance and geometric path comparison are simulator algorithms over the
native vocabulary, not a claim to reproduce Google's proprietary decoder/LM.

Validation: all 237 module checks passed; three model checks use the real four extracted packs and a real
pointer browser flow cover native completions, correction/undo, a hello glide,
personal shortcut expansion, preference changes, private editor contracts, all
five languages and phone width. The original Gboard browser regression passed.

## Gboard Search and access points — 2026-10-23

The native access-point row now opens Search, voice typing, one-handed mode,
ThemeSelector and Settings. The Show G button preference switches the default
chevron/menu access point to direct search. Search uses Gboard's 48dp white
EditTextOnKeyboard header, native labels/icons, card container and default query
chips. Search card contents are invented responses from the existing offline
2017 web/weather service; no live Google search or external queries are performed.
The native no-results response handles unknown demo queries.

The query editor is separate from the originating app's text. Soft and hardware
input edit only the query; Share restores the original caret/selection and inserts
the result title/link (space in a single-line editor, newline in a textarea).
Result cards and query chips support real pointer/touch horizontal scrolling,
results open their offline Chrome page, and Back restores query then original
keyboard without leaking the search text into the draft. Home/other activities
clear the transient search panel. Search history is private Gboard preference data.

Validation: real pointer browser checks cover caret/suffix preservation, card
scrolling/sharing/opening, native empty/default responses, Back, one-handed/theme
access, direct G preference, all five languages and phone width. Both the original
Gboard and dictionary/glide browser regressions passed. Inventory: 1177 rebuilt
assets from N2G48C, zero problems.

## Photos native CPE look catalogue — 2026-10-23

The native libnative.so constant table supplies None and all 14 planet/moon looks:
Mars, Phobos, Deimos, Ceres, Juno, Saturn, Mimas, Rhea, Dione, Ariel, Triton, Venus,
Pluto and Eris. ng-photos-presets.py recovers the names, colours and LUT paths from
this APK's native table. All 15 34×289 RGB PNGs are copied byte for byte from
assets/luts. These contain paired 17³ colour lookup tables: the native strength
worker blends identity to the first table below 0.5, then the first to the second
above 0.5; Pluto/Eris use a 0.30/0.59/0.11 monochrome base. The browser samples the
native LUTs with trilinear interpolation over our drawn scenes.

The CPE strip uses 80dp previews/28dp title bars, native 4dp spacing, 88/80 selected
scale, title colours/elevation and the 44dp, 0–1000 RelativeSeekBar. Intensities are
remembered per look during one edit session. None removes the look without
resetting independent adjustments. Auto enhancement remains in Adjustments.
Saved look metadata is nondestructive and retained in copied/shared media.

Filtered scenes are rasterized asynchronously with a bounded cache; completion
replaces only its matching SVG, preserving active slider/pointer nodes. Each job
owns an immutable snapshot, so a later slider change cannot corrupt an earlier
cache entry. Nested edited collage frames are awaited before rasterization.
The native photo-processing backend is not ported; local legacy adjustments and
synthetic media remain simulator logic. The remaining adjustment/crop polish is
tracked explicitly before release.

Validation: all 240 module checks passed; three native-pixel/model checks, the existing Photos browser flow and
a new pointer flow cover LUTs/strength/per-look state, carousel dragging, save,
discard, copy, immutable sharing, pending-job isolation, phone width and five
languages. Source inventory rebuilt 1192 assets with zero problems.


## Photos expanded adjustments and geometry — 2026-10-23

Photos.apk AdjustmentsFragment/bik defines four groups: Light (Exposure, Contrast,
Highlights, Midtones, Shadows, Black point, Vignette), Color (Saturation,
Temperature, Tint, Skin tone, Deep blue), Pop and Style. The separate Brightness
parameter is deliberately absent from the native list. CPE.Adjustments* layouts
supply the 200dp list, 56dp sections, 96dp child labels, 24dp relative sliders,
sticky master headers and #1a1a1a subsection background. Native subclasses use
0..1000 progress with signed centred values except positive Pop/Style/Vignette.
The native expand bitmap and three additional strings are extracted from this APK.

All sixteen visible parameters affect the drawn media; detailed tone and selective
colour processing are our synthetic scene approximation, while the native preset
LUTs remain byte-exact. Values persist nondestructively through save, copies and
all existing media consumers. Hold/release on the editing picture compares the
unmodified source without changing the edit or losing an active colour job.

StraightenSliderView bounds are +/-45 degrees. cpe_crop_toolbar_fragment supplies
the 53dp aspect/48dp tilt/rotate row and Reset/Done row. Rotation scales to cover
the canvas, crop handles retain the selected aspect, and RGBZ focus coordinates
invert both tilt and quarter turns. Reset only resets geometry. The saved image
clips at its crop bounds. Repeated identical Photos edit intents are consumed and
can reopen the editor. The common ListPopupWindow now constrains left/bottom
anchors inside the display frame; this fixed the crop aspect menu escaping the
screen during real pointer selection.

Validation: 243 module checks passed, including geometry inverse/coverage, signed
parameter persistence, and distinct/selective synthetic colour effects. Real
pointer browser flows cover all groups, live slider attachment, hold/release,
straighten, locked-square dragging, Reset/Done/save/discard, repeated edit intents,
phone width and five languages. Photos library, native LUT and Camera advanced /
RGBZ browser regressions passed. Inventory: 1193 assets rebuilt, zero problems.

## SEND_MULTIPLE — 2026-10-23

Selecting several photos in Photos or several files in Documents now sends one
ACTION_SEND_MULTIPLE stream list instead of the first item. Receivers come from
each package's own SEND_MULTIPLE filter, not its SEND filter: Hangouts, Cloud
Print and Drive's clipboard declare none, Messenger (Bugle) takes only images,
Bluetooth's batch set leaves audio out. The chooser's MIME is the honest common
type (`image/jpeg`, `video/*` or `*/*`), as ShareCompat builds it. A single
selected document still goes out as plain SEND with its own filter.

Gmail attaches every stream; Messenger places each image as its own MMS part;
Drive's UploadSharedItemActivity swaps the title editor for the native "Document
titles" list (`upload_multiple_document_titles`) and uploads each file under its
own name; Photos imports every item; YouTube queues the videos and offers the next
upload after each save, and cancelling abandons the whole queue; Beam and the
Bluetooth device picker keep the full list. Every stream keeps its own snapshot,
edits and tags. Fixed on the way: a share arriving while a Gmail compose is open
stored the open draft with no arguments and threw. The Burst editor's frame selection
uses the same route. The chooser window now ends above the navigation bar, which
stays visible over apps that hid it: Theme.DeviceDefault.Resolver sets no
windowTranslucentNavigation and ChooserActivity is a window of its own.

Validation: 246 module checks (three new send-model checks); the real-pointer
browser flow `tests/browser/ng-send-multiple.mjs` covers Photos and Documents
selection, every receiver above, mixed and audio-only batches, five languages
and phone width; Drive, Hangouts, SEND media, Documents, Photos and YouTube
browser regressions passed.

## Navigation bar key positions — 2026-10-23

The owner noticed the keys sat too close together. NavigationBarInflaterView
(android-7.1.2_r1, fetched into `_aosp/aosp712/sui`) splits config_navBarLayout
"space,back;home;recent,menu_ime" at ";" into start, centre and end groups:
ends_group holds the 50 dp nav_key_space and Back, a weight-1 gravity spacer,
then Overview and the 50 dp menu_ime frame; center_group, a layer over it, holds
Home alone. The keys were all side by side in the centre (80 dp apart); they now
sit at 90, 205.5 and 321 dp of the 411 dp bar, measured headless at desktop and
phone width.

Wallpaper check (owner's question): `fw-default_wallpaper.png` is byte-identical
to N2G48C framework-res `res/drawable-nodpi-v4/default_wallpaper.png`, and
`default_wallpaper_component` is @null, so ImageWallpaper shows it. No APK in the
shamu 5.1.1, bullhead 6.0.1 or angler 7.1.2 images declares a WallpaperService
(of the five images only hammerhead's SunBeam does); 6.0.1 uses bullhead's
default_wallpaper.jpg byte for byte and 5.1.1 shamu's at half resolution.
