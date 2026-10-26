# Android 7.1.2 Nougat (Nexus 6P) — features

[← Back to the README](../README.md)

Rebuilt from Google's **N2G48C** Nexus 6P factory image, fingerprint
`google/angler/angler:7.1.2/N2G48C/4104010:user/release-keys`, security patch
2017-08-05. Layouts, themes, icons, fonts and five-language resource tables come
from this image's APKs and framework. Its OAT files provide the pre-optimised
apps' code. Source classes, generators and validation are recorded in the
[plan](plan-7.1.2.md) and [sources](sources.md).

## System and launcher

- Nougat status/navigation bars, notification shade, quick settings details,
  brightness and the tile editor. Notifications bundle by app, expand, dismiss,
  show heads-up alerts and accept direct replies.
- Lock screen, pattern/PIN/password bouncers, emergency dialer and information,
  Nexus Imprint enrollment/unlock, users/guest, power/restart, boot animation,
  volume and Do not disturb.
- Overview cards, quick switching and split-screen with a movable divider.
- Google Now Launcher with the 6P workspace, folders, app predictions/search,
  drag and drop, shortcut menus/pinning, wallpaper picking and home settings.
- All 18 enabled widget providers: Clock, Calendar, Chrome, Google Search/Now,
  Sound Search, Gmail, Messenger, Drive, Play Music, Play Store and Project Fi.
  Configuration, cancellation, placement, resizing and saved state are connected.
- The framework's default wallpaper and GoogleHome 1.4's four bundled pictures.
  The fresh used-phone demo keeps the Nexus 6P's original Marshmallow coast
  wallpaper as a saved image after an imagined OTA update (owner-approved
  exception, not an N2G48C bundled resource). Existing wallpaper choices survive.
  My photos uses Documents and saves an independent wallpaper image. The image
  ships no live wallpaper service, so its picker has the native empty state.
- PlatLogo and the Android Neko easter egg: the cat tile, food, visits and NekoLand.

## Settings and external activities

The Nougat dashboard, suggestions, conditions, drawer, search and Support;
Wi-Fi/Bluetooth, data usage/Data Saver, mobile networks, tethering, VPN/APNs,
display, notifications, sound/DND, storage, battery, memory, users, gestures,
location, security/Smart Lock/Imprint, accounts, languages/input, backup/reset,
date/time, accessibility, printing, developer options and About phone.

Special access includes notification listeners, VR listeners, DND access,
premium SMS, device administration, user credentials and all 156 system trusted
certificates from the image. Emergency broadcast settings use the phone's
supported categories. Physical-keyboard shortcuts open SystemUI's helper;
Dialer testing codes reach the phone/radio, usage and Wi-Fi testing pages.

Gboard and the other bundled input methods have their own preference activities,
as do Google TTS, TalkBack 5.0.4 and Switch Access. TalkBack includes speech and
feedback preferences, gesture assignment, both native keyboard maps with
assignment/reset, event logging, custom-label import/export/revert and its
five-lesson tutorial. Switch Access settings include scanning methods, highlights,
auto-scan timing and switch/key assignments. These are browser-local activity
reconstructions; Android's accessibility-service and sensor backends are not run.

Clear data and Force stop follow package ownership: private preferences/tasks
reset while contacts, SMS, Calendar and shared media remain with their providers.

## Core apps

- **Phone 8.0 and Contacts 1.4.22:** speed dial/call log, dialpad and SmartDial,
  in-call controls, contacts/groups/favourites, QuickContact, editing and picking.
- **Messenger 2.0.906:** conversations, SMS/MMS with images/audio/video, selection,
  archive, drafts, notifications and direct replies.
- **Gmail 6.9.25:** onboarding, inbox/drawer, threads, search, composing, drafts,
  attachment picking and single/multiple media shares.
- **Calendar 5.7:** schedule/day/week/month, event editing/recurrence/reminders,
  Goals and their scheduled sessions, widgets and preferences.
- **Chrome 55:** onboarding, tabs/incognito, omnibox, bookmarks/history, the
  invented offline 2017 web and category/per-site permission settings.
- **Camera 4.3.016:** photo/video, guided panorama/Photo Sphere/Lens Blur,
  RGBZ refocusing, Smartburst groups/creations and native preferences.
- **Photos 1.25:** library/viewer/albums/trash, burst editor and creations,
  native 14-look CPE catalogue with extracted LUTs, strength/adjustments,
  crop/rotation/straighten, original comparison, save/copy/share.
- **Clock 4.6.1 and Calculator 7.1.1:** alarms, world clocks, timer/stopwatch,
  clock widgets/screensaver and calculator with scientific operations.
- **Gboard 6.0.84:** layouts, accents/emoji, four bundled native dictionaries,
  correction/completion, glide, personal dictionary, inline offline Search,
  one-handed mode, 17 native themes and an image-theme builder.

## Google apps and shared activities

- **Google 6.5.36:** search/voice examples, Now cards/weather, Now on Tap and
  launcher/Google preferences.
- **Maps 9.34.1:** drawn town, search/place/directions and Messenger's location picker.
- **Hangouts 12.0:** chats/groups, attachments, calls, notification replies,
  forwarding, blocking, archive and preferences.
- **Drive 2.4.452:** provider/files, upload/download/sharing, media previews,
  scan/PDF workflows, preferences and widget.
- **YouTube 11.41.56:** tabs/search/watch/mini-player, reactions/subscriptions,
  playlists/history, local upload/edit/delete, captions and preferences.
- **Play Store 7.4.31:** invented offline storefront/search, local install/update/
  cancel/uninstall, My apps/library, wishlist/reviews, content PIN and widgets.
- **Play Music 6.13:** local audio library, playlists, queue/player/background
  notification, sleep timer, AudioPreview, widgets/shortcuts and MusicFX controls.
- **Play Movies 3.20, Play Games 3.7.24 and Android Pay 1.4:** their native
  onboarding, browsing/detail/settings flows and browser-local demo state.
- **Project Fi and Device Policy 7.05:** the image's no-account/sign-up activities.
- **Google settings/Location History, Help/Feedback and print preview:** callers
  route to the shared activities. Printing supports Save as PDF and printer options.
- **Documents/Files/Downloads:** shared storage and Drive roots, selection,
  rename/copy/move/delete, MIME-aware opening, attachment pick/save and sharing.
- **SEND and SEND_MULTIPLE:** package-declared MIME filters determine receivers;
  every selected stream retains its own media snapshot and metadata.

## Demo and practical limits

The [shared used-phone demo](demo-data.md) supplies Alex, Sam, Taylor and Mom,
the call/message/mail history, four Calendar events, the enabled 7:00 alarm,
four drawn photos, bookmarks, Now weather and local Wi-Fi/Bluetooth devices.
English content stays English; interface resources use English, Hungarian,
German, French and Spanish as the APKs provide them.

This is a static browser simulator with separate local saved state for each
version/user. Calls, messages, search results, store/cloud content, camera scenes,
media processing and payments are simulated. It does not connect to live Google
accounts, telephone networks, payment services or an Android runtime.

## Apps installed from Play (not in the factory image)

The owner of the demo phone installed these from Play, in the version of the image's month (docs/sources.md). Settings › Apps lists them with Uninstall.

- **Earth 9.0.4** (installed from Play, not in N2G48C): the Blue Marble globe (drag, zoom, double tap), Search with its results, I'm Feeling Lucky, My Location and Share Link in the overflow, the compass and 2D / 3D, the drawer (My Places, Map Style kept) and the APK's Settings (flight animations, units, quality, version, region). Voyager, postcards and Street View keep the limit.
