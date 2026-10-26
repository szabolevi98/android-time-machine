# Android 5.1.1 Lollipop (Nexus 6) – features

[← Back to the README](../README.md)

The stock Nexus 6 as the factory image `shamu-lmy48y` (build LMY48Y, August 2015) ships it: AOSP 5.1.1 (`android-5.1.1_r26`) with the Google apps of that image. Behaviour, timings and texts come from the AOSP sources and from the APKs in the image; the code comments name the classes and resources they follow.

## System

- **Status and navigation bars:** Material system bars, translucent over the launcher and the keyguard, in each app's `colorPrimaryDark` elsewhere. The navigation keys press with SystemUI's KeyButtonRipple pill.
- **Notification panel:** pulling down follows NotificationPanelView and StackScrollAlgorithm: the header slides in from above at 1/2.05 of the stack's offset, cards that do not fit yet gather in the bottom stack with three 12 dp peeking edges, the scrim darkens along ScrimController's cosine curve to 62 %, and releasing flings open or closed with FlingAnimationUtils timing. However the panel closes (Back, Home, the scrim, a swipe up or an action), it collapses the same way.
- **Quick Settings:** a second pull or two fingers expand the 116 dp header and the tiles (Wi-Fi and Bluetooth as dual tiles with their detail panels, cellular, airplane mode, auto-rotate, flashlight, location, cast, and invert colours and hotspot once used). The tile icons are SystemUI's AnimatedVectorDrawables, so a toggled tile plays its own animation.
- **Heads-up notifications** drop in with `heads_up_enter` (overshoot from −50 %, 200 ms), and swipe away up or sideways.
- **Keyguard:** the lock screen is the notification panel in its keyguard state, with the 88 dp clock, notification cards, the phone and camera affordances and the bouncer for a PIN, password or pattern.
- **Overview:** the 5.1 stack of task cards on the log curve. From Home the cards rise from below with a 12 ms stagger; from an app its window shrinks into its card; going Home drops them again.
- **Touch feedback:** Material ripples on every control, with RippleDrawable's 80 ms delay, the touch-down and touch-up accelerations at the Nexus 6's density and the 333 ms fade; icon-only buttons draw borderless ripples.
- **Windows and dialogs:** the 5.1 window transitions (activity, task, wallpaper and unlock) and Material dialogs and menus that fade in 150 ms.
- **Volume and power:** the SystemUI 5.1 volume dialog with interruptions, the Power off menu and the shutdown dialogs.
- **Easter egg:** Settings → About phone → Android version opens the Lollipop platform logo; a long press starts LLand.

## Launcher and apps

- **Google Now Launcher 1.1:** the Nexus 6 home screen with the Google search bar, the circular-reveal app drawer, folders that reveal from their icon, the DeskClock and Calendar widgets, the wallpaper picker and Google Now.
  The wallpaper strip supports mouse dragging, the wheel and phone touch; selecting a picture keeps the strip's scroll position.
- **Phone and Contacts:** Google Dialer 2.1 with speed dial, recents and the dial pad, InCallUI, and Google Contacts 1.1.
- **Messages:** Messenger 1.1 for SMS with coloured conversations, and Hangouts 2.5 for chats.
- **Mail:** Gmail 5.0 and Email 7.0 (UnifiedEmail) with the drawer, conversation view and compose.
- **Calendar 5.0.1:** schedule with the month illustrations, Day, Week and Month views, the drawer and event screens.
- **Clock, Calculator and Camera:** the 5.1 DeskClock with the hour-coloured background, Calculator 5.1 with the live result and the advanced pad, and Google Camera 2.4.
- **Chrome 40** with the Material toolbar, the Google New Tab page and the tab switcher; **Photos** (Google+ 4.9) and **Play Store 5.2.13**, the image's own (rebuilt from its Phonesky.apk: the Material drawer, quick links, the module-based details page with the discovery badges, the permission buckets and the 5.2 settings) with the Play media apps.
- **Earth 8.0.1:** the Blue Marble globe (drag, zoom, double tap), Search, the compass (Reset to north), My location, Share to Messenger, Layers (kept) and Settings (Theme.Earth.ActionBar: cache, Google location settings, About).
- **Play Newsstand 3.3:** Read Now's stories open in a reader (short made-up demo articles), Bookmark for Later keeps them under Bookmarks, My Library shows the APK's empty caption, Search finds a story, and the drawer's Settings (settings.xml) keeps its choices; Article text size changes the reader.
- **Google+ 4.9 New post and Settings:** the pen button opens the share box (text, picture, location); the post goes to the top of the stream and is kept, with Delete; Back offers Discard. Settings is settings_headers.xml with Notifications.
- **Settings:** the Material dashboard and the 5.1 preference screens, including Sound & notification, Interruptions, data usage, battery, accounts and the Google Keyboard.
- Docs, Sheets, Slides, Fit, Newsstand and Wallet open simple screens of their own. The drawer is the LMY48Y launcher's: no AOSP Browser, Gallery or Music (Chrome, Photos and Play Music stand in; the camera's last picture opens in Photos), and no Cloud Print, which hides its icon from Android 4.4 on.

## Languages

The interface runs in English, Hungarian, German, French and Spanish. `versions/5.1.1/lp-strings.js` carries the texts of the system APKs in those languages (`docs/tools/lp-strings.py`), each taken from the app that shows it. Apps that the image does not translate, such as Wallet in Hungarian, stay in English as on the phone.

## Interface strings from the factory image (2026-10-04)

`versions/5.1.1/image-strings.js` (283 rows, generated by `docs/tools/image-strings.mjs 5.1.1` from the Nexus 6 LMY48Y image) covers the shared rows the Lollipop screens still read. It loads before `lp-strings.js`, so the curated Lollipop table keeps the last word. Chrome's Forward button keeps the shared row, because the image only has Email's "Forward". The report is in `docs/reports/image-strings-5.1.1.tsv`.
- Calendar's Starts / Ends rows open Google Calendar 5.0's datetimepicker (`dtp.js`, from the APK's resources): the month grid and year list, and the radial time picker with AM / PM or the 24-hour inner ring.
