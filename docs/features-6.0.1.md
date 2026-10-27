# Android 6.0.1 Marshmallow (Nexus 5X) – features

[← Back to the README](../README.md)

The Nexus 5X as Google's last Marshmallow build for it left it: the factory image MTC20K (`google/bullhead/bullhead:6.0.1/MTC20K/3142008`, security patch 2016-09-06). Everything is rebuilt from that image alone: its APKs, its pre-optimised (ART) code turned back into dex, its resources, vectors and strings. Only logic (saving, dispatch, timers, game loops) comes from the other versions. The code comments name the classes and resources each screen follows ([plan](plan-6.0.1.md), [sources](sources.md)). The image ships Hungarian itself, so every Hungarian text is the image's own; a text the image leaves in English stays English. Content the phone would get from a server (mail, events, the store's apps, the offline web) is made up, and the files say so.

## System

- **Status bar, quick settings and notifications:** the Marshmallow status bar with its battery and signal drawing, the shade with the quick settings tiles and their detail panels (Wi-Fi, Bluetooth, Do not disturb, mobile data, cast, users), the Hotspot tile for 30 days after the hotspot was used, brightness, and Do not disturb with its priority and alarms-only modes. Lists scroll with the image's fading 4 dp scrollbar.
- **Lock screen:** the keyguard with the phone and camera shortcuts, the bouncer for pattern, PIN and password, the emergency dialer, the screen lock message, and Nexus Imprint: the fingerprint icon on the lock screen and unlocking (and waking) with the sensor.
- **Power, volume and recents:** the power menu, the boot animation, the volume panel with its expanded streams and Do not disturb, and Overview's card stack.
- **Now on Tap:** holding Home opens Google's assist layer with its opt-in card.
- **Keyboard:** Google Keyboard 4.1 in the LXX Light theme, with its key layouts (QWERTY, QWERTZ for German and Hungarian, AZERTY, Spanish), symbols, key preview, the suggestion strip and the IME action key.

## Launcher

- **Google Now Launcher:** the default workspace with the Google search bar, folders, the hotseat, drag and drop with Remove and App info, Overview mode, and the Google Now page on the left.
- **Apps drawer:** the vertically scrolling list with app predictions and search.
- **Widgets:** the image's own list (grouped by app, with their previews and sizes) and the widgets drawn on the home screen: Calendar, Gmail, Chrome bookmarks, Drive, Play Music, Messenger, Hangouts, Google Now, the analog and digital clocks, Sound Search and I'm Feeling Lucky. Dragging to the edge opens a new page.
- **Wallpapers:** the launcher's picker as it is in this image (My photos through Documents, the default wallpaper, GoogleHome's nine bundled pictures and the pictures set before); a photo becomes the wallpaper of the home screen, Overview and the lock screen. The thumbnail strip scrolls with mouse dragging, the wheel and phone touch, and keeps its position when a picture is selected. The image has no live wallpapers, and Live Wallpapers says so.

## Settings

Every screen of the image's Settings dashboard: Wi-Fi with its networks and advanced settings, Bluetooth, data usage, display, sound and notifications with Do not disturb, apps with app info and app permissions, battery with Doze optimisation, storage, memory, users (switching to another user or the guest, Profile info, each user's details), tethering and the portable hotspot (its access point dialog; the hotspot turns Wi-Fi off, shows its status icon and the "Tethering or hotspot active" notification), Nexus Imprint (enrollment from the introduction to Fingerprint added!, the backup screen lock, managing fingerprints), screen lock and encryption, accounts with the Google account, Google Settings (Play services 8.1), language, backup, date and time, accessibility (Captions with its preview, styles, colours and the image's caption typefaces), text-to-speech (Google TTS speaking its own sample), the spell checker, pointer speed, printing, daydream, and About phone with its status pages, the developer options countdown and the Marshmallow easter egg: PlatLogoActivity and Marshmallow Land for up to six players.

## Apps

- **Phone and Contacts:** Dialer 2.21 with speed dial, call log, contacts, the dialpad with SmartDial and the in-call screen; Contacts 1.2 with QuickContact and the editor.
- **Messenger, Hangouts, Gmail and Calendar:** conversations and compose in each; Gmail 5.7's inbox, drawer and threads; Calendar 5.2.3's schedule with month pictures and the event editor.
- **Chrome 44:** document mode with the omnibox, the New Tab page, the app menu and an offline web of 2016.
- **Camera, Photos, Clock and Calculator.**
- **Google apps:** the Google app with the Now page, search and voice; Play Store 5.12.7 with a made-up storefront, installing and My apps; Maps 9.13 (a drawn town), YouTube 10.28.60, Drive 2.3, Play Music, Play Movies & TV, Play Games, Android Pay, Project Fi and Device Policy, and Downloads (Documents).

## Apps installed from Play (not in the factory image)

The owner of the demo phone installed these from Play, in the version of the image's month (docs/sources.md). Settings › Apps lists them with Uninstall.

- **Earth 8.0.4** (installed from Play, not in MTC20K): the Blue Marble globe (drag, zoom, double tap), Search flying to a place ("Not Found: %s" otherwise), My location with the blue dot, the compass, Share, Layers (kept) and the APK's Settings (cache, Google location settings, About Google Earth).
- **Keep 3.3.315.0** (installed from Play): the demo notes, Take a note… and New list, check boxes, the eight note colours, Pin, Archive, Delete to Trash with Restore / Delete forever / Empty Trash, Make a copy, Send, Search, Single- / Multi-column view and Settings (List behavior, Reminder settings, Sharing). Drawings, audio, photos, reminders and labels keep the limit.
- **Docs 1.6.292.13, Sheets 1.6.502.06 and Slides 1.6.352.16** (installed from Play): one doclist each over Drive's files of its type (the welcome view, rows or grid, Sort by, Search), the drawer (Recent, Shared with me, Starred, Offline, Trash, Settings, Help & feedback, Google Drive), the FAB menu with a new file, the file's menu (Share link, Send file, Available offline, Rename, Remove; Restore and Delete in Trash) and Settings; a file opens with an edit button: a document's text, a spreadsheet's cells (A–F, 30 rows), a presentation's slides with Add slide, kept in Drive. Templates, Open with, Download, Move, Add to Home screen and Print keep the limit
- **Fit 1.58.09** (installed from Play): Home under the illustrated header with the Active time wheel against a 30 min goal, today's sessions and the weight card; Timeline with every session under its day; the FAB's Add activity (description, type, date, start time, duration; a future end is refused) and Add your weight; Settings (the weight unit, goal notifications). Challenges, Start activity (live sensors) and Help keep the limit
- **Play Books 3.9.37** (installed from Play): Read now (the books read last) and My library with the demo phone's four public-domain books, Sort by (Recent, Title, Author), the card's Download / Remove download and Delete from library, Downloaded only, Search; the reader turns pages (sides, scrubber), lists Contents and sets Display options (Day, Night, Sepia, line height). Shop opens the Play Store; Settings and Help keep the limit
- **News & Weather 2.7.1** (installed from Play): Headlines with the weather card (Riverside, the Temp. / Precip. / Wind / Humidity tabs, C° / F°, the section menu's Edit weather display, Temperature and Wind speed units), the Technology and Sports sections from the drawer, a story's page with Open in browser and Share article, Search ("No matching news") and the dark theme. The stories are short made-up demo pieces; sections, editions, Settings and Help keep the limit
- **Google+ 8.4.0** (installed from Play): the Home stream of the demo phone's three posts with +1, Share and the card menu, the compose FAB's share box (Public, "What's new with you?", POST; Back with text asks to discard), Delete on one's own post, Notifications' "All caught up!", the bottom bar and the drawer. Collections, Communities, Profile, People, comments, photos, Search, Settings and Help keep the limit
