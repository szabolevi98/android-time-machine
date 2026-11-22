# Gingerbread 2.3.6 visual audit

Target: Android 2.3.6 (GRK39F) on the Nexus S (Samsung GT-I9020, `crespo`), the last GSM Nexus S release. AOSP references use the `android-2.3.6_r1` tag.

## Device frame — 2026-10-02

The Nexus S is an SVG drawing (`versions/2.3.6/assets/device-nexus-s.svg`) made by `docs/tools/device-frames.py`, the same tool as the Galaxy Nexus and Nexus 4 frames.
- **Source.** The outline was traced from a front render on Wikimedia Commons ([File:Nexus S.png](https://commons.wikimedia.org/wiki/File:Nexus_S.png), CC BY-SA 3.0, by Bea, derived from Luckyz's Nexus_S.jpg). Only the outline is traced: the alpha mask, with the side keys cut off, smoothed into a path. No pixels from the photo are used.
- **Drawn parts.** The glossy black Contour Display body has a thin plastic rim and the inner edge of the curved glass. The earpiece grille sits at the top centre with the front camera to its right. Power is on the right and the volume rocker on the left, at their measured heights.
- **Keys.** The four capacitive keys sit under the glass in the AOSP order: Back, Menu, Search, Home. The frame draws them unlit; the simulator lights them while they are in use.
- **Size.** The display window is 276 × 460, the 480 × 800 panel at 0.575. This keeps the 4.0" screen in proportion to the 4.65" Galaxy Nexus (545 px tall), and keeps the dp scale of the other versions (1 dp ≈ 0.86 CSS px). The whole frame is 336 × 675.

## Version scaffold and touch keys — 2026-10-02

`versions/2.3.6/` starts as a copy of the 4.0.4 directory, the way 4.3 did. It saves its state under `android-time-machine-gb-v1`. At the owner's request it is listed as available on the landing page from the start, first in the list, with a Nexus S miniature and a work-in-progress note, while the Gingerbread screens replace the inherited ICS ones step by step.

- **No navigation bar.** The ICS on-screen bar is gone, and the display uses the full 460 px height.
- **Keys.** The four Nexus S keys are buttons laid over the drawn glyphs on the glass: Back, Menu, Search and Home, at their centres 68 / 136 / 199.7 / 263.7 px across and 606.7 px down.
  - Back and Home behave as before.
  - Menu opens the current screen's options menu (for now the inherited per-app menus), and screens without one ignore it.
  - Search opens the Browser for now, until the Gingerbread Quick Search Box exists.
  - Holding Home for the 500 ms long-press timeout shows the recent apps.
- **Backlight.** The key glyphs are unlit at rest. Following `PowerManagerService` in 2.3.6 (`SCREEN_BUTTON_BRIGHT` on user activity, `LONG_KEYLIGHT_DELAY` = 6 s), any touch or key press lights them, and they go dark six seconds after the last activity.
- **Mobile.** In mobile full-screen mode the keys become a 52 px black bar under the display.
- **About phone.**
  - Model number: Nexus S. Android version: 2.3.6. Build number: GRK39F.
  - Kernel version: `2.6.35.7-gf5f63ef` / `android-build@apa28 #1` / `Tue Aug 2 13:57:05 PDT 2011`. This was read from the `Linux version` banner inside the prebuilt kernel at `device/samsung/crespo` `android-2.3.6_r1`. It is laid out with the 2.3.6 `DeviceInfoSettings` regex, which shortens the build host to `apa28`.
  - Baseband: `I9020XXKD1`. This is the GSM Nexus S radio from the 2.3.4 update, which the GRK39F OTA did not replace. It is an inference, since no published GRK39F "About phone" capture was found.

## Status bar and notification shade — 2026-10-02

References: SystemUI 2.3.6 `status_bar.xml`, `status_bar_expanded.xml`, `status_bar_latest_event.xml`, `status_bar_tracking.xml`, `StatusBarService.java`, `Ticker.java`, `Clock.java` and `DateView.java`, plus framework `status_bar_latest_event_content.xml`, `config_statusBarIcons` and `stat_sys_battery.xml`. The code is in `versions/2.3.6/gb-statusbar.js` and `.css`. Text uses Droid Sans, the Gingerbread system font.

- **Bar.**
  - A 25 dp solid black bar. Every icon sits in its own 25 dp square, as `StatusBarService` lays them out (`status_bar_icon_size`), which gives Gingerbread's wide spacing.
  - On the left is one icon per notification: the Messaging and Calendar notification icons, the bug droid for system notices, and the phone icon during a call.
  - On the right, in `config_statusBarIcons` order: Bluetooth, ringer mode, then Wi-Fi or the 3G data icon, then signal, battery and alarm. The signal and Wi-Fi icons are the green "fully connected" set.
  - The battery follows the 5% level-list.
  - The clock is 14 sp bold white with `AM_PM_STYLE_GONE`, so it shows "8:47" without AM/PM.
- **Ticker.** A new notification replaces the icons with its icon and title: push-up in and out, 500 ms (`config_longAnimTime`). Each segment stays for 3 s (`TICKER_SEGMENT_DELAY`), then the icons push back down.
- **Shade.**
  - Tapping or dragging the bar pulls the panel down under the bar. The bar then shows the DateView (long date format).
  - The header is `title_bar_portrait` with the carrier name (textAppearanceLarge, #dfdfdf) and the small default "Clear" button. Below it are the "Ongoing" and "Notifications" sections (14 sp bold #969696 on #282828), or "No notifications".
  - Each notification is a 64 sp row on `status_bar_item_background` with the light divider. The 16 sp bold black title sits next to the 25 dp icon, and the 14 sp #6b6b6b text and time sit on the line below. A press shows the orange pressed frame.
  - The empty area is the TrackingView's #212121, and `status_bar_close_on` is the handle.
  - Gingerbread has no swipe-to-dismiss. "Clear" removes everything and collapses the panel.
- **Motion.** `StatusBarService` physics, scaled to the screen:
  - The panel's bottom edge follows the finger, or the handle when closing.
  - A tap expands with an initial 2000 px/s and +2000 px/s². Back, the handle or the bar collapse it at −2000 px/s, about 0.33 s for the full height.
  - On release, `performFling` decides the direction: 200 px/s, half the height when closed, or the last 25 px when open.
- **Translations.** The section titles use the 2.3.6 SystemUI translations ("Folyamatban van", "Aktuell", "En cours", "Entrante").

Checks: `gb-statusbar.test.cjs` covers battery levels, icon order, fling thresholds and the shade markup. Headless Chrome covered the bar, the tap-open animation (transform at 120 ms and at rest), closing by dragging the handle, the ticker, and the Hungarian shade at 360 × 640. No JavaScript errors.

Not yet Gingerbread: the lock screen, launcher, menus, Settings and apps are still the inherited ICS screens.

## Lock screens — 2026-10-02

References:
- Framework 2.3.6 layouts: `keyguard_screen_tab_unlock.xml`, `keyguard_screen_unlock_portrait.xml` and `keyguard_screen_password_portrait.xml`.
- Sources: `LockScreen.java`, `SlidingTab.java`, `PatternUnlockScreen.java`, `PasswordUnlockScreen.java`, `LockPatternView.java` and `DigitalClock.java`.
- Resources: the `jog_tab_*` drawables and the `password_kbd_numeric` / `password_kbd_qwerty` keyboards.

The code is in `versions/2.3.6/gb-keyguard.js` / `.css`, with the credential screens in the version's `lockscreen.js`. The verification logic, attempt counting and 30 s lockout are unchanged.

- **Flow** (`LockPatternKeyguardView.getInitialMode`).
  - A pattern lock opens straight on the pattern screen.
  - PIN and password locks show the SlidingTab screen first, and its unlock tab leads to the password screen. Back returns to the SlidingTab screen.
  - Without a secure lock, the unlock tab goes home.
  - The notification shade can be pulled down over the insecure lock screen, but not over the secure ones.
- **SlidingTab screen.**
  - Carrier top right. Clockopia clock (72 sp, "kk:mm" or "h:mm" with a Droid Sans Bold AM/PM). The `full_wday_month_day_no_year` date, and the next alarm with `ic_lock_idle_alarm` in NEXT_ALARM_FORMATTED style ("Sat 7:00").
  - The two 162 × 140 jog tabs sit 80 dp above the bottom.
  - Grabbing a tab vibrates (30 ms), fades in its target (500 ms) and slides the other tab off (250 ms). The tab follows the finger with its hint bar ("Unlock", "Sound off" / "Sound on") trailing behind.
  - Crossing two thirds of the width turns the tab and bar to the green, gray or yellow confirm art and slides them away. Releasing earlier snaps the tab back, and leaving the 50 px tracking band counts as a release.
  - The sound tab toggles silent mode (vibrate unless "vibrate in silent" is off). It shows "Sound is OFF" (white) or "Sound is ON" (#e69310) with the ringer icon for 3.5 s, and the tab returns as the yellow vibrate or sound-off dial.
- **Pattern screen.**
  - A smaller 56 sp clock and the date, a divider, and a status line with `ic_lock_idle_lock`: "Draw pattern to unlock", "Sorry, try again" or the countdown.
  - The pattern uses `btn_code_lock_default` / `_touched` inside the `indicator_code_lock_point_area` default, green and red rings. While drawing, the rings are green with touched buttons; a finished wrong pattern turns red.
  - The path is white at alpha 128 and a quarter of a cell wide. Green or red drag-direction arrows sit at the top of each ring, pointing to the next dot.
  - An "Emergency call" footer.
- **Password screen.**
  - "Enter PIN code" or "Enter password to unlock" in textAppearanceLarge, a divider, and a bold 32 sp field on `password_field_default`.
  - A PasswordEntryKeyboardView on a transparent background with `btn_keyboard_key_fulltrans` keys. The numeric pad uses the `sym_keyboard_num` art with letters, plus OK, 0 and delete. The QWERTY layout has a number row, the inset second letter row, 15% shift and delete, and `?123` , - space = . OK.
  - A wrong code only clears the field, as in `PasswordUnlockScreen`. The same keyboards appear when choosing a PIN or password.
- **Translations.** Hints, toasts and instructions use the 2.3.6 framework translations.

Checks: `gb-keyguard.test.cjs` covers the clock formats, right-tab states and the screen markup. Headless Chrome covered the sound tab (toast and status icon), the unlock tab, a wrong pattern, then the right one, the PIN entered through the slide screen, and the password keyboard. No JavaScript errors.

Still inherited from ICS: setting up a screen lock in Settings (only its keyboards are Gingerbread).

## Launcher, window animations and app icons — 2026-10-02

References:
- Launcher2 2.3.6 sources: `launcher.xml`, `workspace_screen.xml` (port), `all_apps_2d.xml`, `application_boxed.xml`, `WorkspaceIcon` styles, `BubbleTextView`, `AllApps2D`, `default_workspace.xml`.
- Other packages: QuickSearchBox `search_widget.xml`, Protips (`widget.xml`, `ProtipWidget.java`, `arrays.xml`), Music `album_appwidget.xml`.
- The crespo device overlay at `android-2.3.6_r1` (googlesource).

The code is in `versions/2.3.6/gb-launcher.js` / `.css`, and the window animations are in the version's `transitions.js`.

- **Default home** (Launcher2 `default_workspace.xml`).
  - The middle screen has the Google search widget and the "Home screen tips" widget. The right screen has the Music widget. The Google-only Genie and Market widgets are left out.
  - The wallpaper is the Nexus live wallpaper, the crespo default (`default_wallpaper_component = .nexus.NexusWallpaper`). The crespo overlay replaces its background and script (see "Nexus S live wallpaper" below).
- **Workspace.**
  - 4 × 4 cells of 80 × 100 dp, 8 dp above and 78 dp below, with the rest of the height spread as the row gap.
  - BubbleTextView icons: 48 dp icon, 5 dp gap, 13 dip white label with a 2 px shadow on the #B2191919 bubble (8 dp corners). There are no first-run clings.
  - While dragging, the 70 dp trash can replaces the cluster. Over it the dragged view gets the red `delete_color_filter`. There is no holo drop outline.
- **Bottom of the screen.**
  - The `all_apps_button_cluster` sits on the hotseat backgrounds: phone, all apps, browser.
  - The 93 × 56 dp previous/next screen buttons show one dot per screen on that side (the `home_arrows` level-list) and update while paging.
- **Search widget.** On `search_floater`: the corpus button with the magnifier, the "Google" hint field and the voice button.
- **Protips.**
  - The bugdroid sits next to the `droid_widget` speech bubble: bold header, body, the all-apps or trash callout, and the "1 of 6" footer.
  - Tapping the bubble shows the next tip. Tapping the droid blinks it (closed 100 ms, open 200 ms).
  - Dialling `*#*#8477#*#*` (TIPS) swaps in the untranslated haiku set, goes home and blinks three times.
  - The tips use the 2.3.6 translations, including the Hungarian footer's swapped numbers ("6/1").
- **Music widget.** On `appwidget_bg` with a 3 : 1 : 1 split: title (18 sp bold) and artist, or "Touch to select music.", then the play/pause and next buttons with the `appwidget_inner_press` highlights.
- **All apps** (AllApps2D).
  - A black 4-column grid of `application_boxed` items (88 dp, two-line 13 dip labels), sorted alphabetically, above the home button.
  - It opens with `all_apps_2d_fade_in` (700 ms decelerate) and closes with the 700 ms accelerate fade-out.
- **App names and icons.** The 2.3.6 hdpi launcher icons replace the ICS ones: Phone, Contacts, Messaging, Browser, Camera, Gallery (Gallery3D), Settings, Clock, Calendar, Calculator, Music and Email. "People" is "Contacts" and "Play Store" is "Market"; since 2026-10-11 the Market icon is the image's own `ic_launcher_androidmarket` from Vending.apk.
- **Window animations** (2.3.6 `core/res/res/anim`, short 150 / medium 300 / long 400 ms).
  - Launcher ↔ app: `wallpaper_close_*` / `wallpaper_open_*` — the app scales between 0.5 and 1 with a fade, the launcher between 1 and 2.
  - Within an app: `activity_*` — the new screen slides in from 33%, the old one slides off on top.
  - Between apps: `task_*` — the same, plus a 2× scale about the right edge.
  - Unlock: `lock_screen_exit` / `lock_screen_behind_enter` — a 400 ms fade.
  - The ticker now uses the 400 ms `config_longAnimTime`.

Checks: `gb-launcher.test.cjs` covers the tips per language and the haiku set, the footer, blink frames, arrow dots, cluster, search and music widget markup. Headless Chrome covered the middle and right screens, the all apps grid, a tip tap, dragging Browser from all apps onto the workspace, and dragging it to the trash. No JavaScript errors.

Not yet: the Menu-key icon menu (Add, Wallpaper, Search, Notifications, Settings), the "Add to Home screen" dialog, the wallpaper chooser, folders and screen previews.

## Options menu and dialogs — 2026-10-02

References:
- Framework 2.3.6: `icon_menu_layout.xml` (port), `IconMenuView.java`, `Theme.IconMenu`, `options_panel_enter/exit`, `alert_dialog.xml`, `AlertController.setBackground`, `select_dialog_item`, `dialog_enter/exit`, `Widget.Button`.
- Launcher2: `Launcher.onCreateOptionsMenu`, `AddAdapter`, `add_list_item.xml`.

The shared code is in `versions/2.3.6/gb-ui.js` / `.css`.

- **Icon menu (Menu key).**
  - A full-width panel on `menu_background_fill_parent_width`: 90% black under a gray top edge. Rows are 66 dip, with up to three items per row and six in total.
  - Over six items, the first five show plus "More" (`ic_menu_more`), which opens the expanded list. `layoutItemsUsingGravity` gives the leftover items to the bottom rows.
  - Each item has a 48 dp icon over a 14 sp label. Dark dividers sit between items, and `highlight_pressed` shows on touch.
  - It slides up 25% with a 150 ms fade, and slides down 50% when closed. The Menu key toggles it.
- **Launcher menu:** Add, Manage apps, Wallpaper / Search, Notifications, Settings, with their 2.3 icons.
- **Inherited menus.** The ICS holo overflow menus that the apps still use are converted into icon menus on the fly. Known commands get their 2.3 menu icons (framework, Browser and Music art), for example Browser's Forward, Refresh, New window, Bookmark, Bookmarks and More.
- **AlertDialog.**
  - A dark title (`popup_top_dark`, 22 sp, 1 dip divider) over either a dark message (18 sp) or a bright list (22 sp black text, 64 dip rows), then the buttons on `popup_bottom_medium`. The pieces use `AlertController.setBackground`'s top / center / bottom / full rule.
  - Buttons use `btn_default` with 14 sp black text, and a single button gets the 0.25 / 1 / 0.25 spacing.
  - Radio and check variants use `btn_radio` / `btn_check`.
  - The window dims what is behind it by 0.6 and opens with `dialog_enter` (scale 0.9 + fade, 150 ms).
- **Add to Home screen** (AddAdapter): Shortcuts, Widgets, Folders, Wallpapers.
  - Shortcuts lists the apps ("Select shortcut") and puts the chosen one in the first free cell, or reports "No more room on this Home screen."
  - Widgets ("Choose widget") lists the widget types and adds the chosen one.
  - Wallpapers opens "Select wallpaper from": Gallery, Live wallpapers, Wallpapers.
- **Translations.** Launcher2, framework, Settings and LivePicker 2.3.6 strings.

Checks: headless Chrome covered the home menu (two rows of three), Add → Widgets → Analog clock, Add → Shortcuts → Calculator, the Browser menu conversion and closing with the Menu key. No JavaScript errors.

Next: Gingerbread folders (New folder, the UserFolder panel, rename), the wallpaper chooser and the home screen previews.

## Folders, wallpapers, toasts and screen previews — 2026-10-02

References: Launcher2 2.3.6 `user_folder.xml`, `Folder.java`, `UserFolder.java`, `Workspace.acceptDrop`, `AddAdapter`, `WallpaperChooser` (`wallpaper_chooser.xml`), `Launcher.showPreviews`; crespo `wallpapers.xml`; Contacts live folders; framework `transient_notification.xml`, `toast_frame`, `toast_enter/exit`.

- **Folders.**
  - Folders come from Add → Folders ("Select folder"): New folder, or the Contacts live folders All contacts, Contacts with phone numbers and Starred contacts.
  - Dropping one icon on another never makes a folder. As in `Workspace.acceptDrop`, the item goes to the nearest vacant cell, or "No more room on this Home screen." if there is none.
  - Dropping onto a folder icon adds the item. Folders keep their place even when empty.
  - The icon is `ic_launcher_folder`, and `ic_launcher_folder_open` while open; live folders use the Contacts icons.
  - The open UserFolder covers the CellLayout area: a `box_launcher_top` title (14 sp bold #404040) and a 4-column `application_boxed` grid on `box_launcher_bottom`.
  - Touching the title closes the folder. Touching and holding it opens "Rename folder" (an AlertDialog with a "Folder name" field, OK and Cancel).
  - Live folders list the matching contacts and open them in Contacts.
- **Wallpapers.**
  - The 15 Nexus S wallpapers in the crespo order, as 960 × 800 images (re-encoded at quality 82): Street lights, Stream, Phase beam, Pulse, Nexus rain, Stars, Canyon, Grass, Zanzibar, Cloud, Monument valley, Mountains, Sunset, Golden gate, Shuttle.
  - A static wallpaper spans two screens and moves a quarter of its spare width per home screen.
  - The WallpaperChooser shows a fitCenter preview, a Gallery of the `_small` thumbnails, and "Set wallpaper".
- **Toasts.** `toast_frame`, 14 sp white text with the #BB000000 shadow, 64 dip above the bottom, and a 400 ms fade.
- **Screen previews.**
  - Touching and holding the previous/next arrows or the all apps button opens the PopupWindow of all five screens.
  - Each CellLayout is drawn without the wallpaper at the scale that fits five across, in `preview_background` frames, with the current screen in the pressed frame. Touching one goes to that screen.

Checks: `gb-ui.test.cjs` was updated for the dialog section classes. Headless Chrome covered New folder and All contacts, dragging Browser from all apps into the folder, opening it, renaming it to "Web", the live folder list, Mountains via the chooser with the parallax at 50% and 75%, and the previews from the right arrow, jumping to screen 4. No JavaScript errors.

## Power menu — 2026-10-02

References: 2.3.6 `GlobalActions.java`, `global_actions_item.xml`, `ShutdownThread`, `progress_dialog.xml`, `progress_medium_white`.

- **Phone options** (touch & hold power). An AlertDialog over a bright list (`setInverseBackgroundForced`) with three items.
  - **Silent mode:** `ic_lock_silent_mode_off` and "Sound is ON", or the silent or vibrate icon and "Sound is OFF". It switches to vibrate unless "vibrate in silent" is off.
  - **Airplane mode:** "Airplane mode is ON/OFF" with its icon.
  - **Power off.**
  - Each row is `global_actions_item.xml`: a 22 sp label with a 14 sp status line. There is no bug report or ringer-mode row; those are 4.x.
- **Shutdown.**
  - The confirmation is `ic_dialog_alert`, "Power off" and "Your phone will shut down." with OK / Cancel.
  - Then the ProgressDialog shows `spinner_white_48` stepping 12 frames every 100 ms beside "Shutting down…".
- **Strings.** Framework 2.3.6 translations.

## Settings — 2026-10-02

References: Settings 2.3.6 `res/xml` (`settings.xml`, `wireless_settings`, `tether_prefs`, `sound_settings`, `display_settings`, `security_settings*`, `application_settings`, `privacy_settings`, `device_info_memory`, `language_settings`, `accessibility_settings`, `date_time_prefs`, `device_info_settings`, `device_info_status`), `SecuritySettings.java`; framework `preference.xml`, `Widget.TextView.ListSeparator`, `WindowTitle`, `activity_title_bar`, `dark_header`; SettingsProvider `defaults.xml` and the crespo overlay.

The code is in `versions/2.3.6/gb-settings.js` / `.css`. `gb-settings-strings.js` is generated by `docs/tools/gb-settings-strings.py` from the Settings and framework strings in English, Hungarian, German, French and Spanish, so every title, summary and list entry uses the shipped 2.3.6 translation.

- **Look.**
  - Each screen has the 25 dip `activity_title_bar` window title (14 sp bold white with the #BB000000 shadow) over a black list.
  - Categories are 25 dip `dark_header` separators with 14 sp bold #bebebe text.
  - Preferences are `preference.xml` rows: 64 dip, 22 sp title, 14 sp #bebebe summary (up to four lines), the `btn_check` widget on the right, dark dividers and the orange pressed highlight. Disabled rows are dimmed.
- **Main list** (settings.xml with the `ic_settings_*` icons): Wireless & networks, Call settings, Sound, Display, Location & security, Applications, Accounts & sync, Privacy, Storage, Language & keyboard, Voice input & output, Accessibility, Date & time, About phone. Dock is hidden, as on the Nexus S.
- **Screens.** Each follows its XML, or `SecuritySettings` for Location & security.
  - Wireless & networks: airplane mode disables Wi-Fi and Bluetooth; tethering (USB and Wi-Fi), VPN, NFC and Mobile networks.
  - Sound: General, Incoming calls, Notifications and Feedback; Vibrate and Emergency tone are ListPreferences.
  - Display: Brightness dialog with Automatic brightness, Auto-rotate, Animation, Screen timeout.
  - Location & security:
    - My Location: wireless networks, GPS, and assisted GPS, which depends on GPS.
    - Screen unlock: "Set up screen lock", or "Change screen lock" plus "Use visible pattern" and "Use tactile feedback" for a secure lock.
    - Passwords, Device administration and Credential storage.
  - The rest: Applications, Privacy (backup and restore, factory data reset), Storage (SD card / internal), Language & keyboard, Accessibility (power button ends call), Date & time, About phone and Status.
- **ListPreference.** A single-choice AlertDialog with Cancel; the row summary shows the chosen entry where the XML has no fixed summary.
- **Defaults** (SettingsProvider `defaults.xml`, crespo overlay):
  - screen timeout 1 minute, All animations, vibrate "Only in Silent mode";
  - lock screen sounds off, haptic feedback on, assisted GPS on, automatic time on;
  - automatic brightness on (crespo).
- **Navigation.** Back walks the order the screens were opened in, including the inherited pages that have no 2.3 definition yet: the Wi-Fi network list, Bluetooth, Accounts & sync, Manage applications, Battery use, Development, Volume, Phone ringtone, Legal information, Factory data reset and the language picker.

Checks: `gb-settings.test.cjs` covers the main list order and icons, translations, check boxes with the airplane dependency, the ListPreference summary and dialog, the lock-dependent security rows, About phone and unknown screens. Headless Chrome covered English and Hungarian: the main list, Wireless (Bluetooth toggle), Sound, the Vibrate dialog, Brightness, Location & security, About and Status, and back navigation. No JavaScript errors.
- **Update 2026-10-02 (inherited pages replaced).**
  - **Wi-Fi settings** (`wifi_settings.xml`): the toggle with the `wifi_status_with_ssid` summary ("Connected to …"), Network notification, the Wi-Fi networks category and "Add Wi-Fi network".
    - Access points show the `ic_wifi_(lock_)signal_*` icons and "Connected" / "Secured with WPA2", with the connected network first and then by signal.
    - The Menu key gives Scan / Advanced (sleep policy, MAC and IP).
    - The WifiDialog shows status, signal, speed, security and IP with Forget / Cancel, or Security, Signal, Password and "Show password." with Connect / Cancel. WPA networks need 8 characters.
  - **Bluetooth settings** (`bluetooth_settings.xml`): the toggle, Device name (EditText dialog), Discoverable ("Discoverable for 120 seconds…"), Discoverable timeout, and "Scan for devices", which finds a headset, a car kit and a laptop with the `ic_bt_*` icons. Touching a device pairs and connects it.
  - **Development** (`development_prefs.xml`): USB debugging asks "Allow USB debugging?" first; Stay awake; Allow mock locations.
  - **Volume** (RingerVolumePreference): Ringtone, "Use incoming call volume for notifications" (which shows the Notification slider when cleared), Media and Alarm.
  - **Phone and notification ringtone pickers:** Silent plus the `OriginalAudio.mk` sounds the full crespo build ships. The default notification is On The Hunt (`core.mk`), and there is no default ringtone.
  - **Select language:** a locale list that switches the simulator language.
- **Update 2026-10-02 (screen lock setup).**
  - "Set up / Change screen lock" opens ChooseLockGeneric: the "Screen unlock security" list with None, Pattern, PIN and Password and their summaries. "None" is the plain slide lock, as in 2.3.
  - **ChooseLockPattern** (`choose_lock_pattern.xml`): on black, the header steps through "Draw an unlock pattern" (footer "Press Menu for help."), "Release finger when done.", "Connect at least 4 dots. Try again:", "Pattern recorded!", "Draw pattern again to confirm:" and "Your new unlock pattern:". The pattern sits between `code_lock_top` and `code_lock_bottom`.
    - The ButtonBar switches between Cancel / Retry and Continue / Confirm, enabled only for a valid pattern.
    - ConfirmLockPattern shows "Confirm saved pattern" or "Sorry, try again:".
  - **ChooseLockPassword**: "Choose your PIN / password", then "Confirm your …", with "PINs don't match" or "PIN must be at least 4 characters" on errors. The field and the PasswordEntryKeyboardView sit above the `bottom_bar` with Cancel and Continue / OK.

## Phone and Contacts (Dialtacts) — 2026-10-02

References: Contacts 2.3.6 (`layout-finger/twelve_key_dialer.xml`, `dialpad.xml`, `voicemail_dial_delete.xml`, `recent_calls_list_item_layout.xml`, `DialtactsActivity.java`, `drawable-hdpi-finger`), framework `tab_indicator.xml` and the `tab_*` drawables. Strings are generated by `docs/tools/gb-strings.py contacts` into `gb-strings-contacts.js` (Contacts app translations). The code is in `versions/2.3.6/gb-phone.js` / `.css`.

- **Tabs.** The TabWidget has Phone, Call log, Contacts and Favorites (`ic_tab_selected/unselected_*`) as 64 dip tab indicators with a 14 sp label, the light `tab_selected` and dark `tab_unselected` backgrounds, and #fff / #808080 text. The Contacts launcher icon opens the same activity on its Contacts tab.
- **Phone (TwelveKeyDialer).**
  - The digits field is 67 dip on `btn_dial_textfield` with 33 sp digits. The ButtonGridLayout has 88 × 50 dp keys (`btn_dial`, transparent with a divider, green when pressed), using the `dial_num_*_wht` art, which switches to `_blk` while pressed.
  - Below are voicemail, dial and delete on the `btn_dial_action_left/middle/right` pieces.
  - The Menu key gives Add to contacts, Add 2-sec pause and Add wait once digits are entered.
- **Call log.** Rows show the name or number (22 sp), the call-type arrow, the number label and a relative time, then a divider and the call button. "Call log is empty." when there are none, and Menu → Clear call log asks to confirm.
- **Contacts.** An alphabetical list with `dark_header` section letters, 48 dp contact pictures and 22 sp names. Menu: Search, New contact, Display options, Accounts, Import/Export.
- **Favorites.** The starred contacts, or the "You don't have any favorites…" help text.
- **Contact details** (ViewContactActivity): the header with picture, name and the big star, then Call mobile, Text mobile and Email home with their action icons. Menu: Edit contact, Share, Delete contact.

Checks: `gb-phone.test.cjs` covers tab order and translations, the 12 keys and their art, call log order, arrows, relative time and the empty state, contact sections and sorting, favorites, details and the menus. Headless Chrome covered dialling 5551234, calling and hanging up, the call log, contacts, details with its menu, back to the list, and favorites. No JavaScript errors.

Still ICS: the contact editor.

## In-call screen (InCallScreen) — 2026-10-02

References: Phone 2.3.6 (`incall_screen.xml`, `call_card.xml`, `call_card_person_info.xml`, `incall_touch_ui.xml`, `layout-long-finger/non_drawer_dialpad.xml`, `InCallScreen.updateInCallBackground`, `CallCard.updateCardTitleWidgets`, `InCallTouchUi`, `InCallControlState`, `NotificationMgr`), Contacts `TwelveKeyDialer.showDialpadChooser`. Strings are generated by `docs/tools/gb-strings.py phone` into `gb-strings-phone.js`. Phone drawables are installed as `assets/gb-p-*` (9-patch borders stripped).

- **Background.** The mainFrame uses `bg_in_call_gradient_*`: gray (unidentified) while dialing, green once connected, orange on hold, blue with Bluetooth audio, and red after the call ends.
- **Call card.** "Dialing" as the 28 sp upper title while dialing. When connected the title is cleared and the 15 sp bold elapsed time appears beside the photo in green (blue with Bluetooth). On hold it reads "On hold" in orange. The photo is `picture_unknown` in `incall_photo_border_lg` (172 × 166 dp), the 28 sp name sits under it, then the label and number in 18 sp secondary text.
- **Touch UI.** The bottom cluster has Add call / End (red label) / Dialpad on `incall_button`, then Bluetooth / Mute / Speaker toggles on `incall_toggle_button` with the green indicator light.
  - Add call and Dialpad are disabled while dialing. Mute is disabled on hold, and Bluetooth needs a paired headset with Bluetooth on.
  - The round Hold / Unhold button sits in the upper-left corner while connected.
  - Dialpad opens the DTMF pad (88 × 58 dp keys on `btn_dial_green`, 24 sp field), which hides the call card. The button then reads Hide.
- **Hang-up.** "Hanging up" on the connected background, then the red "Call ended" title and time without controls. The screen then closes and the call is logged.
- **Status bar.** `stat_sys_phone_call` (on hold / Bluetooth variants), and the ongoing notification "Current call (0:12)" with the caller. Tapping it returns to the call.
- **Dialtacts during a call.** The launcher icon opens Dialtacts. The Phone tab shows the dialpad chooser: Use touch tone keypad, Return to call in progress, Add call (`ic_dialer_fork_*`). Add call shows the normal dial pad, and Back returns to the call. The simulator has one line, so dialing from Add call ends the first call and dials the new number.

Checks: `gb-incall.test.cjs` covers the state machine, elapsed time, backgrounds, titles, enabled/disabled controls, the DTMF pad, hang-up states, Hungarian strings and the chooser. Headless Chrome covered calling a contact, dialing → connected, speaker/mute, hold/unhold, DTMF digits, the shade notification and returning from it, the chooser, Add call with Back, a second call via Add call, and hang-up into the call log. No JavaScript errors.

## Messaging (Mms) — 2026-10-02

References: Mms 2.3.6 (`conversation_list_screen.xml`, `conversation_list_item.xml`, `ConversationListItem.formatMessage`, `compose_message_activity.xml`, `message_list_item.xml`, `MessageListItem.formatMessage`, `MessageItem`, `MessageUtils.formatTimeStampString` / `getTextMessageDetails`, `SmileyParser`, `AttachmentTypeSelectorAdapter`, the `onPrepareOptionsMenu` methods), framework `Widget.QuickContactBadge`, `Widget.ListView.White`, `textfield_*`, `btn_default`. Strings and the smiley arrays come from `docs/tools/gb-strings.py mms` (the generator now also reads `<string-array>`s and decodes `\uXXXX`). Assets: `gb-m-*`, `gb-quickcontact_badge_*`. Code: `versions/2.3.6/gb-mms.js` / `.css`.

- **Conversation list.** A white list under the "Messaging" title bar.
  - The first row is "New message / Compose new message".
  - Each conversation row is 64 dip with the QuickContactBadge (the "…" strip under the picture), the 18 sp name with " (n) " and a red "Draft", and the snippet and date in 14 sp #323232 (time today, "Jan 5" earlier, with the year when older).
  - Unread conversations are bold on white; read ones sit on #eeeeee.
  - Menu: Compose, Delete threads, Search, Settings. A long press opens View thread / View contact (or Add to Contacts) / Delete thread.
- **Conversation.** The title bar shows "Name <number>". The history is stacked from the bottom on white.
  - Each message is "**Name**: body" (sent ones say "Me") at 18 sp, with the badge in the leading margin and "Sent: time" in 14 sp at #bf000000. Received rows are light blue (#ecfbff) and sent rows white.
  - SmileyParser replaces the 17 default smiley texts with the `emo_im_*` art.
  - The bottom panel has the `bottombar_landscape_565` background, the "Type to compose" edit text and the Send button (disabled while empty). The white bold 11 sp counter appears from 10 remaining characters or with more than one part, and reads "MMS" with an attachment.
  - New messages get the "To" recipients editor with contact suggestions. Add subject shows the Subject field, and a sent subject displays as "<Subject: …> - body".
- **Menus and dialogs.**
  - Conversation menu: Call, View contact, Add subject, Attach, Send, Insert smiley, Delete thread or Discard, All threads, Add to Contacts (as applicable; more than six go to More).
  - **Attach** lists Pictures, Capture picture, Videos, Capture video, Audio, Record audio and Slideshow. Pictures picks from the simulator photos and shows the attachment with View / Replace picture / Remove. The rest say they are unavailable.
  - **Insert smiley** lists the icon, translated name and text.
  - **Message options** (tap or long press): Forward, Copy message text, View message details ("Type / From or To / Received or Sent"), Delete message, Lock/Unlock message (lock icon).
  - The delete confirmations use the "Delete" alert with the Mms messages.

Checks: `gb-mms.test.cjs` covers the list rows, unread/read, counts, drafts, date formats, the compose title, message formatting with smileys, the counter, recipients and subject fields, all menus and dialogs, and the Hungarian smiley names. Headless Chrome covered opening Messaging, both menus, sending a message with a smiley, message options and details, Insert smiley, attaching a picture, the draft in the list, and the new-message recipient suggestions. No JavaScript errors.

## Calculator — 2026-10-02

References: Calculator 2.3.6 (`layout-port/main.xml`, `values/styles.xml`, `drawable/button.xml`, `drawable/blue_button.xml`, `ColorButton`, `Calculator.adjustFontSize`, `PanelSwitcher`, `CalculatorDisplay`, `EventListener`, `Logic.onDelete`). Strings come from `docs/tools/gb-strings.py calculator`, and the menu icons are `gb-calc-*`.

- **Layout.** Theme.Black.NoTitleBar. The display (weight 1) sits over the panel switcher (weight 4).
  - The display shows 40 dp white text, right-aligned, with a blinking cursor and no field background (`setBackgroundDrawable(null)`).
  - The simple pad starts with a blank gradient cell (weight 3) and **CLEAR** (localized, e.g. "MINDENT TÖRÖL").
  - Below are the 7–9 / 4–6 / 1–3 / . 0 rows on `blue_button` (#071622 → #253541), and ÷ × − = + on `button` (#000 → #333). Columns have 1 dp left margins.
- **Text sizes.** `adjustFontSize` scales by 480 / 320, so 40 dp keys render at 51.75 px, the advanced sin/cos/tan/ln/log keys (30 dp) at 38.8 px, and CLEAR (15 dp) at 19.4 px.
- **Feedback.** ColorButton's "magic flame" is a 2 px white outline while pressed that fades over 350 ms after release.
- **Behavior.** Tapping CLEAR deletes one character, or clears the display after a result or an error (`Logic.onDelete`). A long press clears everything.
  - Swiping (or Menu → Advanced panel / Basic panel) slides between the pads in 400 ms. Back returns to the basic pad.
  - Menu: Clear history, Advanced panel or Basic panel.

Checks: headless Chrome covered 12×3+4 = 40, the menu items, switching to the advanced panel and back, and delete after a result. No JavaScript errors.

## Clock (DeskClock) — 2026-10-02

References: DeskClock 2.3.6 from aosp-mirror-neo (`desk_clock.xml`, `desk_clock_time_date.xml`, `desk_clock_buttons.xml`, `alarm_clock.xml`, `alarm_time.xml`, `xml/alarm_prefs.xml`, `set_alarm.xml`, `alarm_alert.xml`, `DeskClock.doDim`, `DigitalClock` with `assets/fonts/Clockopia.ttf`, `Alarms.formatToast`, `menu/*.xml`), framework `time_picker.xml` / `number_picker.xml` with the `timepicker_*` 9-patches. Strings and the `alarm_set` array come from `docs/tools/gb-strings.py deskclock` (plus the framework "Set"). Assets: `gb-dc-*`, `fonts/Clockopia.ttf`.

- **Desk clock.** Theme.Wallpaper.NoTitleBar: the (live) wallpaper shows through FLAG_DIM_BEHIND 0.4.
  - The next alarm sits top left ("Sat 7:00 AM" with `ic_lock_idle_alarm`), with the round night-mode button at the right.
  - The time is 106 sp Clockopia with a bold AM/PM, above the "Friday, October 2" date. Everything has the #C0000000 shadow.
  - The `btn_strip_trans` strip at the bottom holds Alarms, Gallery, Music and Home.
  - Night mode fades in the #CC000000 tint over a 0.8 dim; a tap restores it.
  - Menu: Alarms, Add alarm, Dock settings.
- **Alarms.** "Add alarm" in the 68 dip left column, then the rows: the clock icon with the green or gray indicator bar (tapping it toggles the alarm), a divider, the 28 sp Clockopia time with AM/PM, the label right-aligned in tertiary bold, and the days ("Mon, Wed", "every day").
  - The bottom strip has the desk clock button and a 48 sp Clockopia clock.
  - A long press opens Turn alarm on/off, Edit alarm, Delete alarm.
  - Menu: Desk clock, Add alarm, Settings.
- **Set alarm.** The preference list: Turn alarm on, Time, Repeat (Never / days), Ringtone (the OriginalAudio alarms, Alarm Classic by default on crespo, or Silent), Vibrate, Label. The Done / Revert / Delete ButtonBar follows.
  - A new alarm opens the TimePickerDialog right away. Its title is the picked time, with two NumberPickers (+ / 30 sp field / −), the AM/PM button, and Set / Cancel.
  - Saving an enabled alarm shows the "This alarm is set for 2 days, 18 hours, and 45 minutes from now." toast. Back saves too.
- **Alert.** The alarm dialog shows the label (or "Alarm"), the 64 sp Clockopia time, and Snooze ("Snoozing for 10 minutes.") / Dismiss.

Checks: `gb-deskclock.test.cjs` covers the time and day formats, all toast variants, the face, list and SetAlarm markup, the menus and every dialog. Headless Chrome covered the face on the live wallpaper, night mode, the alarm list, a new alarm through the time picker, Repeat and Label, saving with the toast, and the updated list. No JavaScript errors.

## Music — 2026-10-02

References: Music 2.3.6 (`layout-finger/audio_player.xml`, `audio_player_common.xml`, `track_list_item_common.xml`, `MediaPlaybackActivity` / `TrackBrowserActivity` / `ArtistAlbumBrowserActivity` menus and context menus, `drawable-hdpi(-finger)`), framework `MediaButton` and the `ic_media_*` icons. Strings come from `docs/tools/gb-strings.py music`.

- The inherited library and player already used the pre-Holo Music app. The ICS and GB `music-*` drawables are identical, so only the framework media button icons were replaced with the 2.3.6 versions.
- **Song rows** (track_list_item) show the duration (12 sp, textColorTertiary) at the top right. They have no overflow button: a long press (or right click) opens the context menu titled with the song: Play, Add to playlist, Remove from playlist (inside a playlist), Use as phone ringtone, Delete, Search.
  - **Add to playlist** lists Current playlist, New and the saved playlists. New asks for the name, prefilled with "New playlist 1", with Save / Cancel.
- **Player:** the audio_player layout ends with the seek bar on #5a5a5a. The simulator's "Demo tracks" note and the library button are gone; Menu → Library returns to the browser.
  - Shuffle and repeat show the Music toasts ("Shuffle is on.", "Repeating all songs.", ...).
- **Menus.** Browser tabs: Party shuffle / Party shuffle off, Shuffle all. Player: Library, Party shuffle, Add to playlist, Use as phone ringtone, Delete.

Checks: headless Chrome covered both menus, the song context menu, Add to playlist → New → Save (playlist stored), and the player. No JavaScript errors.

## Browser — 2026-10-02

References: Browser 2.3.6 (`title_bar.xml`, `TitleBar.java`, `browser_find.xml`, `bookmark_thumbnail.xml`, `history_item.xml`, `history_header.xml`, `tab_view.xml`, `tab_view_add_tab.xml`, `active_tabs.xml`, `browser_add_bookmark.xml`, `page_info.xml`, `menu/browser.xml`, `BrowserBookmarksPage.java`), framework `search_bar.xml` and `progress_horizontal.xml`. Strings come from `docs/tools/gb-strings.py browser`; 9-patch slices were read from the 2.3.6 `.9.png` guides.

- **Title bar** on `search_plate_browser`: the 5 dip yellow progress bar (invisible but keeping its space when idle), the title field on `textfield_search_empty_default` with the black / white framed favicon and the 18 sp black title, and the bookmarks button on `btn_search_dialog_voice`.
  - While a page loads (0.8 s), the field switches to `textfield_search_default` with the address and the `search_spinner`, and the stop button replaces the bookmarks button.
- **Search dialog** (tap the title or the Search key): `search_plate_global`, the Browser icon, `textfield_search`, the go button and the microphone while empty, the dimmed page, and white suggestion rows from bookmarks and history with the green URL.
- **Find on page** sits at the bottom on `bottom_bar`: previous / next, the field with the match count, and close.
- **Bookmarks / Most visited / History** use the framework tabs. Bookmarks is a thumbnail grid (`browser_thumbnail` size, 8 / 14 dip spacing) with the "Add" holder over the current page first. Menu switches it to a list. History has the "Today" group and `btn_star` rows.
  - A long press opens the bookmark or history context menu: Open, Open in new window, Copy link URL, Remove, Set as homepage, and Add bookmark from history.
- **Windows** (ActiveTabsPage): the window title bar, New window (up to TabControl.MAX_TABS = 8), and rows with the framed favicon, the #313431 divider and the close button.
- **Menu:** New window, Bookmarks, Windows, Refresh / Stop, Forward, and More (Add bookmark, Find on page, Select text, Page info, Share page, Downloads, Settings). Add bookmark opens the Name / Location dialog; Page info shows the title and address.
- The demo pages were moved to 2011 and Android 2.3 / Nexus S.

Checks: `gb-browser.test.cjs` covers the title bar states, suggestions, find bar, grid, list, history, Most visited, Windows and the tab limit, the menus, the dialogs and the translations. Headless Chrome covered loading, the search dialog with suggestions, the menu and More, find with highlighting, the bookmark grid, history and Windows. No JavaScript errors.

## Owner feedback: dock panels and Nexus pulses — 2026-10-02

- **Hotseat:** the phone, all apps and browser buttons sit on `hotseat_bg_left` / `hotseat_bg_center` / `hotseat_bg_right` (HotseatButton, 12 dip padding, 4 dip outer margins). The panels never showed, because a more specific `.screen button{border:…}` rule reset `border-image`. The selectors now carry `.screen .gbl-cluster`.
- **Nexus live wallpaper:** `nexus.rs` works in device pixels (14 px cells, 40-cell trails, 64 px glow). The canvas port drew those numbers in CSS pixels, so the pulses were 480 / 276 ≈ 1.74× too wide on the Nexus S, and 2.35× on the Galaxy Nexus. The scene now runs in panel pixels (480 on 2.3.6) and is scaled to the canvas; taps are converted the same way. The fix is in the shared `live-wallpapers.js`, so 4.0.4 and 4.3 get it too.
- **Status bar icons** were checked against `packages/SystemUI/res/drawable-hdpi` at android-2.3.6_r1: the files are byte-identical, and StatusBarService adds each one in a 25 × 25 dip box (`new LinearLayout.LayoutParams(mIconSize, mIconSize)`), which is where the gaps around the narrow battery come from.
  - The owner pointed out that the icons did not fit. `max-width:100%` resolved inside the grid cell but `max-height:100%` did not, so each icon was drawn at a different scale: the battery and the alarm clock at almost their full 38 px, overflowing the 25 dip bar. Now every icon uses FIT_CENTER in the 21.56 px square (absolute max-width / max-height), so the 38 px tall hdpi icons all scale by the same 0.567.
- **Nexus taps:** NexusRS.onCommand adds `xOffset * (960 − width)` to the tap x before nexus.rs uses it, because the scene scrolls with the home screens. The port skipped this, so on the middle screen the burst appeared half a screen to the left. It now starts under the finger on every page.

## Calendar — 2026-10-02

References: Calendar 2.3.6 (`month_activity.xml`, `MonthView.java`, `CalendarView.java`, `agenda_day.xml`, `agenda_item.xml`, `agenda_header_footer.xml`, `AgendaItemView.java`, `event_info_activity.xml`, `edit_event.xml`, `MenuHelper.java`, `colors.xml`, `styles.xml`, the activity themes in `AndroidManifest.xml`), framework `date_picker.xml`, `btn_dropdown`, `btn_check`, `bottom_bar`. Strings and arrays come from `docs/tools/gb-strings.py calendar`.

- **Month** (MonthView): the centred window title ("October 2026"), the 23 dip #dedede day-name row (14 sp bold) and title_bar_shadow. The 6 × 7 grid has 1 dip #dedede lines, 20 dip numbers in #404040, today on #888888 in white, and other months on #ececec with #b7b7b7. Days with events are bold. The 6 dip busy-bit column (#dedede, events in #6090f0 by time of day) starts at the top of the number.
  - A tap opens Day, a long press opens Show day / Show agenda / New event, and a vertical fling changes the month (as MonthView.onFling does).
- **Day / Week** (CalendarView): the title is the long date or the week range. The #dedede hour column has bold 12 sp hours (am / pm under 12), ten hours per screen, and the view opens at 8 AM.
  - Events are rounded boxes in the calendar colour with a darker border and 12 sp white text, in lanes when they overlap. The all-day row and the red current-time line are there too.
  - Week uses the two-letter day headers ("Su 04"), as drawDayHeaderLoop does when the medium names do not fit. A horizontal swipe moves by a day or a week. Back from a Day opened from the month returns to the month.
- **Agenda** (Theme.Light): "Showing events since … Tap to look for more." at the top and "… until …" at the bottom; each one moves the range by 30 days. The #c8c8c8 day bars are bold, including "Today, Friday, October 2". Rows have the 5 px calendar colour strip, a bold title, a bold time and the location.
- **View event:** the calendar colour around `bg_cal_card`, holding the bold title, "Calendar: demo@example.com", a divider, the bold when line, the repeat line with `ic_repeat_dark`, the location and the description. Below are Reminders, with a spinner and `btn_circle` minus, or Add reminder with plus. Menu: Edit event, Delete event.
- **Event details** (EditEvent):
  - What, From / To with the date (7) and time (4) buttons, All day (which hides the times), Where, Description, the Calendar spinner, Repetition, and Reminders (10 minutes by default for a new event).
  - The `bottom_bar` holds Done / Revert / Delete. Menu → Show extra options adds Show me as and Privacy.
  - The buttons open the DatePickerDialog (80 / 80 / 95 dip month / day / year NumberPickers in locale order) and the TimePickerDialog. Moving the start keeps the duration.
  - Saving shows "Event created" or "Event saved". A new event returns to the view it came from; an edited one returns to its info.
- **Delete:** "This event will be deleted." with OK / Cancel; repeating events get the three-item delete_repeating_labels list. The edit scopes are Change only this event / all events in the series / this and all future events.

Checks: `gb-calendar.test.cjs` covers the month cells and busy bits, Day and Week geometry, the 12 / 24 hour labels, the agenda, the event info, the editor states, menus, dialogs, picker steps and translations. Headless Chrome covered month → menu → New event → time and date pickers → Repetition → Done, then Day, Week, Agenda, View event and the delete dialog. It also covered a fling to the next month, the long-press context menu and the Hungarian week view. No JavaScript errors.

## Landing thumbnail — 2026-10-02

The 2.3.6 card on the landing page showed the drawn ICS-style layers (ICS wallpaper and search bar, navigation bar). The catalogue entry now uses `art.shot`: a 414 × 690 capture of the simulator's own home screen (`versions/2.3.6/assets/landing-home.jpg`: the Nexus live wallpaper, the search widget, Protips and the hotseat cluster), shown full-size inside the Nexus S frame. Retake it with headless Chrome whenever the home screen changes.

## Email — 2026-10-02

References: Email 2.3.6 (`list_title.xml`, `message_list.xml`, `message_list_item.xml`, `MessageList.java` binding, `mailbox_list_item.xml`, `account_folder_list_item.xml`, `message_view.xml`, `message_view_header.xml`, `message_compose.xml`, the option and context menus, `colors.xml`, `styles.xml`, `drawable-hdpi`), framework `star_off` / `star_on`, `btn_dialog`, `bottom_bar`. Strings and the "Message(s) deleted." plurals come from `docs/tools/gb-strings.py email`, which now reads `<plurals>` too.

- **MessageList** (dark): the title bar shows the mailbox on the left and demo@example.com on the right.
  - Rows are 64 dip, on #404040 when unread and #000000 when read. Each has the 4 dip account chip, the buttonless check box, the 18 sp sender (bold and white when unread, #bebebe when read), the 14 sp subject with the attachment icon, the date (the time for today, otherwise the short numeric date) and the star.
  - Checking messages shows the `bottom_bar` with Mark read / Mark unread, Add star / Remove star and Delete.
  - A long press opens the context menu: Open, Delete, Forward, Reply all, Reply, Mark as read / unread. Trash has Open / Delete; Drafts has Open / Discard.
  - Menu: Refresh, Compose, Deselect all (while selecting), Folders, Accounts, Account settings.
- **Folders** (MailboxList): Inbox, Drafts, Outbox, Sent and Trash, with the `ic_list_*` icons and the `ind_unread` / `ind_sum` counts.
- **Accounts** (AccountFolderList): Combined Inbox and the non-empty Starred / Drafts / Outbox, the "Accounts" separator, and the account row with the default indicator, the #303030 separator and `btn_folder`.
- **MessageView** (white): the #101010 bar holds the newer / older arrows on `bg_arrow`. `header_card` holds the presence icon, the bold sender, the date, "To:", the time, the bold subject and the big star.
  - The message follows, then the Reply / Reply all / Delete bar.
  - Menu: Delete, Forward, Reply, Reply all, Mark as unread. Deleting shows "Message deleted."
- **Compose:** the "Compose" title, the #ededed block with To (and Cc / Bcc after Add Cc/Bcc) and Subject, and `divider_horizontal_email`.
  - Below are the "Compose Mail" body and, for replies and forwards, the "Quoted text" bar with `btn_dialog` above the original ("Android Team wrote:" or the Original Message header). Reply all puts the other recipients in Cc.
  - The bottom bar has Send / Save as draft / Discard. Menu: Add Cc/Bcc, Send, Save as draft, Discard, Add attachment.
  - Back or Save as draft keeps a non-empty draft ("Message saved as draft."); Discard removes it ("Message discarded."). Sending without a recipient or with an invalid address shows the 2.3.6 error toasts and keeps the screen; a sent message returns to the list.
- The sample mail now talks about the Nexus S and Android 2.3.

Checks: `gb-email.test.cjs` covers the list rows and organize bar, search, MailboxList, AccountFolderList, the message view, compose with quoting and Cc, the menus, the context menus and translations. Headless Chrome covered the list, menu, Folders, Accounts, selection, the message view arrows, Reply all → menu → Send, plus a Hungarian long-press menu → Forward → Back (saved as a draft) → Folders → Drafts. No JavaScript errors.

## Gallery (Gallery3D) — 2026-10-02

References: Gallery3D 2.3.6 (`com.cooliris.media`: `HudLayer`, `PathBarLayer`, `MenuBar`, `TimeBar`, `GridLayer` state layouts, `GridLayoutInterface`, `GridDrawables`, `BackgroundLayer`, `Gallery` with the 96 × 72 dip items, `MediaSet` titles, `res/drawable(-hdpi)`). Strings come from `docs/tools/gb-strings.py gallery`. The Nexus S gallery is drawn in OpenGL, so the screens are rebuilt in HTML from these numbers.

- **Background:** the focused cover, blurred and dimmed (BackgroundLayer's adaptive texture), over `default_background`.
- **Path bar:** at y −4 dip and 39 dip tall. Each `pathbar_bg` level is followed by `pathbar_join`, and the last ends in `pathbar_cap`; every level except the last is drawn as its icon only (PathBarLayer.layout). The text is 18 dip bold.
  - On the albums it shows Gallery; in an album, home › the album; in full screen, home › album › `ic_fs_details` with the "2/4" position. Tapping that swaps to the caption.
- **Albums** (STATE_MEDIA_SETS): stacks in 3 rows (portrait numMaxRows − 1), 100 dip × spacing and 70 dip × yStretch, scrolling sideways. The first column is centred.
  - Each stack holds up to four framed photos turned behind each other, the source icon (camera / folder) and "Pictures (4)".
  - `btn_camera` (100 × 94 dip) sits in the top-right corner.
- **Album** (STATE_GRID_VIEW): 4 rows, 10 dip spacing, column by column. The TimeBar holds the month label and the `scroller_new` knob. The `mode_grid` / `mode_stack` switch (100 × 47 dip) toggles a stack of the month's photos.
- **Full screen:** a black stage with the photo fitted. The 45 dip MenuBar on `selection_menu_bg` holds Slideshow (`icon_play`) and Menu (`icon_more`), with the 66 × 42 dip zoom buttons above it. A tap hides the HUD; swipes move between photos.
- **Selection** (long press, or Menu in full screen):
  - The top MenuBar shows Select All / "1 item selected" / Deselect All. Albums use "album(s) selected".
  - The bottom bar has Share / Delete / More. Their `popup.9` menus carry the bottom triangle: Messaging and Email; Confirm Delete / Cancel; and Details, Show on map, Rotate Left / Right, Set as wallpaper, Crop (single image options only for one photo).
  - Details opens the AlertDialog with title, type, album, taken on and location.

Checks: `gb-gallery.test.cjs` covers the stacks and their placement, the path bar levels, the grid and time bar, stack mode, the full-screen labels and bar, the selection bars, popups, details and translations. Headless Chrome covered albums → album → stack mode → photo → Menu → More → Details, and a long press → Delete. No JavaScript errors.

## Camera — 2026-10-02

References: Camera 2.3.6 (`camera.xml`, `camera_control.xml`, `CameraHeadUpDisplay`, `HeadUpDisplay`, `IndicatorBar`, `GLOptionItem` / `GLOptionHeader`, `OtherSettingsIndicator`, `ZoomIndicator`, `camera_preferences.xml`, `Camera.addBaseMenuItems`, the manifest's landscape Theme.Black.NoTitleBar.Fullscreen, `drawable-hdpi`). Strings and the preference entry arrays come from `docs/tools/gb-strings.py camera`. The generator now resolves `@string/` items in untranslated `arrays.xml` per language.

- **Orientation:** the activity is landscape-only and full screen (the status bar is hidden). Held upright, the layout appears turned 90° clockwise while RotateImageView / RotatePane keep the icons and popups upright. So:
  - the 76 dp control bar runs along the bottom, with the shutter on the left, the camera / video Switcher in the middle and the 52 dp review thumbnail on the right;
  - the IndicatorBar crosses the bottom of the preview, 10 dp from its edge;
  - the popups open above it, with the triangle pointing down.
  - The turned 9-patches (iconbar, switch track, menu_popup, triangle) are stored pre-rotated as `gb-cam-*-p.png`.
- **Preview:** a 4:3 frame (3:4 upright) in `border_view_finder` on the `bg_camera_pattern` tile. A tap runs the FocusRectangle: focusing, then focused in green.
- **IndicatorBar** (CameraHeadUpDisplay order, shown right to left): Other settings, Store location (GPS), White balance, Flash mode, the zoom ratio ("1x" … "4x", 18 dip #A8FFFFFF) and Select camera (back / front). The active indicator gets the #9A2B2B2B highlight.
  - The popups are `menu_popup` lists: GLOptionHeader (12 dip #979797 on #2b2b2b), then GLOptionItem rows (18 dip, `ic_menuselect_*` icons, `ic_menuselect_on/off`).
  - Other settings lists Focus mode, Exposure, Scene mode, Picture size, Picture quality, Color effect and "Restore defaults" (with the confirm dialog). Zoom has a slider.
  - The colour effects tint the preview.
- **Capture:** the shutter focuses, captures (`IMG_yyyyMMdd_HHmmss`), and the picture drops into the review thumbnail, which opens it in the Gallery.
  - The Switcher moves to video: the record button appears, then the stop button with the blinking `ic_recording_indicator` and the elapsed time. Stopping saves `VID_…`, which the Gallery shows with `videooverlay`.
- **Menu:** Switch to video / camera, Gallery, Switch Camera.

Checks: `gb-camera.test.cjs` covers the defaults and media.js compatibility, the labels in three languages, the indicator order, the popups and their anchors, focus, video recording, the thumbnail and the menu. Headless Chrome covered the white balance popup → Cloudy, Other settings, zoom, shutter (focusing → focused → thumbnail), video recording and the menu. No JavaScript errors.

## Recent applications — 2026-10-02

Reference: framework `recent_apps_dialog.xml`, `recent_apps_icon.xml`, `RecentApplicationsDialog.java`, Theme.Dialog.RecentApplications, Animation.RecentApplications, `recent_dialog_background.9.png`.

- Holding Home opens the 2.3 RecentApplicationsDialog instead of the inherited ICS thumbnail list.
- There is no frame and no dim. `recent_dialog_background` (a black band fading out over 180 px above and below the content) runs across the screen behind the content.
- The 40 dip "Recent" title is small, bold and #80FFFFFF. Below it come up to eight (NUM_BUTTONS) 80 dip buttons in two rows of four, newest first, each with the 48 dip icon and a 13 dip label of at most two lines. A 40 dip space closes the dialog.
- Pressed icons glow orange (IconUtilities). With no history it shows "No recent applications."; it fades in and out.
- The strings come from the framework (`docs/tools/gb-strings.py framework`).

## Contact editor — 2026-10-02

References: Contacts 2.3.6 (`act_edit.xml`, `item_contact_editor.xml`, `item_kind_section.xml`, `item_generic_editor.xml`, `item_photo_editor.xml`, `FallbackSource.java`, `styles.xml` Plus / Minus / More / Less buttons, `drawable-hdpi-finger`), framework phone and email type labels.

- **ContactEditorActivity** for the phone-only account (FallbackSource):
  - The "Edit contact" / "New contact" title, then the 64 dip header with the 4 dip #666666 bar, the account icon and "Phone-only, unsynced".
  - The 76 dip photo button on `contact_picture_border` with `ic_menu_add_picture`.
  - The structured name: Given name and Family name, with the `btn_circle` more / less expander for prefix, middle name and suffix.
- **Kind sections** (14 dip indent, 18 sp titles, list divider):
  - Phone and Email have a 100 dip label button that opens "Select label" (Home / Mobile / Work / Other), an EditText and the minus button.
  - Organization has a Company row behind its plus button.
  - The collapsible "More" section holds Notes.
  - As with EntityModifier.ensureKindExists, a phone and an email row are always offered.
- **Saving:** the ButtonBar has Done / Revert, and Back saves too (onBackPressed → doSaveAction). The name parts are joined into the display name, and the chosen labels are kept and shown on the contact ("Call work", "Email work"). It ends with the "Contact saved." toast.

Checks: `gb-contact-editor.test.cjs` covers the name split and join, the editor rows, the expanded name, the secondary section, the removed and added rows, the label dialog and translations. Headless Chrome covered Edit contact → label → Work → Organization → expander → More → Back (saved, "Call work" on the details). No JavaScript errors.

## Applications, battery, legal and reset pages — 2026-10-02

References: Settings 2.3.6 (`manage_applications.xml`, `manage_applications_item.xml`, `LinearColorBar`, `installed_app_details.xml`, `running_processes_view.xml`, `running_processes_item.xml`, `preference_powergauge.xml`, `power_usage_details.xml`, `power_usage_summary.xml`, `master_clear_primary.xml`, `master_clear_final.xml`, the legal_information screen of `device_info_settings.xml`, `drawable-hdpi`). Strings come from `docs/tools/gb-strings.py settings2`, using the Nexus S `product="nosdcard"` variants ("USB storage").

- **Manage applications:**
  - The framework tabs are Downloaded / USB storage / Running / All. The simulator's apps are part of the system image, so Downloaded and USB storage show "No applications.", and All lists them.
  - Rows have the 48 dip icon, the bold 18 sp name and the size (Formatter units).
  - The LinearColorBar at the bottom shows "Internal storage" with #a0a0a0 used, #a0c0a0 free, and the "… used" / "… free" texts.
  - Menu: Sort by name / Sort by size.
- **Running services:** process rows with "1 process and 1 service", RAM and uptime, plus the RAM bar.
- **Application info:**
  - The snippet with "version 2.3.6", then Force stop (only for a running app, with its confirmation) and Uninstall (disabled for system apps).
  - Storage shows Total / Application / Data with `dotted_line_480px` leaders and Clear data (with the delete confirmation; it really clears that app's simulator data). Cache has Clear cache.
  - Launch by default: "No defaults set." with Clear defaults. Then the permissions.
- **Battery use:**
  - "3h 12m 5s on battery", then the "Battery use since unplugged" category with preference_powergauge rows: Display, Cell standby, Phone idle, Wi-Fi, Android System, Android OS and the recent apps. Each row has the `app_gauge` bar on #80404040 (written #40404080 in CSS, since Android colours are AARRGGBB).
  - The details page shows the use details, Force stop / Application info for apps, and the Display / Wi-Fi settings buttons.
- **Legal information:** Open source licenses opens the NOTICE page. Google legal ships with the Google apps, not AOSP.
- **Factory data reset:** the 18 sp master_clear_desc list, the "Erase USB storage" check box with its description, and "Reset phone". The final screen ("Erase everything") resets the simulator.
- **Fixes found on the way:**
  - The launcher label bubble used `#b2191919` (CSS RRGGBBAA) for Android's #B2191919 and showed a faint red. It is now `#191919b2`.
  - `docs/tools/gb-strings.py` now collapses raw XML whitespace like aapt does, so line breaks inside resource text no longer leak into the strings.
- Accounts & sync stays the inherited page: in 2.3.6 it belongs to the Google account components, not to AOSP Settings.

## Easter egg — 2026-10-02

- Three taps on Android version within 500 ms (DeviceInfoSettings mHits) open PlatLogoActivity, not ICS's Nyandroid. It runs under Theme.NoTitleBar.Fullscreen, so the status bar is hidden.
- `platlogo.jpg`, the Gingerbread zombie art, is shown FIT_CENTER on black. Every touch shows the "Zombie art by Jack Larson" toast. Back returns to About phone.

## Accounts & sync — 2026-10-02

References: AccountsAndSyncSettings 2.3.6 (a separate AOSP package: `manage_accounts_screen.xml`, `manage_accounts_settings.xml`, `account_preference.xml`, `account_sync_screen.xml`, `account_sync_settings.xml`, `title.xml`, `preference_widget_sync_toggle.xml`, `AccountSyncSettings.java`, `drawable-hdpi`). Strings come from `docs/tools/gb-strings.py accounts`.

- **Accounts & sync settings:**
  - The "General sync settings" category has Background data (turning it off asks the "Attention" question) and Auto-sync.
  - The "Manage accounts" category holds the demo@example.com Email account with "Sync is ON / OFF" and the `ic_sync_green` / `ic_sync_grey` status icon.
  - The `bottom_bar` holds the centred "Add account" button.
- **Account sync screen:** the `title_bar` header with the 48 dip provider icon, the bold account name and "Email". Under "Data & synchronization" are Sync Contacts / Sync Calendar / Sync Email, each with the last sync time and a check box (shown disabled while background data or auto-sync is off). "Remove account" asks first.
  - Menu: Sync now runs the `ic_list_sync_anim` state with "Touch to sync now" for a moment. Cancel sync stops it.
- This replaces the last inherited ICS settings page.

## Sweep — 2026-10-02

A Gingerbread-specific sweep visited the home screen and its menu, the drawer, every app with its Menu panel, and every Settings screen. The Settings screens were found breadth-first from the main list (51–56 screens per run).

- It ran in all five languages at 1280 × 900 (frame) and 360 × 640, plus German and Hungarian at 320 × 568.
- It checked for text overflow, off-screen elements, broken images and untranslated strings. Every run came back clean.
- Two flags are known false positives:
  - the Protips text while its fade animation is running;
  - the French app name "Agenda", which is the same word as the English source.
- An earlier crawl for ICS / holo class names found the Accounts & sync page, which is now replaced, and the Market, which remains the inherited store.
- The landing card and the 2.3.6 page now describe the finished Gingerbread features instead of "work in progress", in five languages.

## Market — 2026-10-02

Android Market is closed source, so there are no AOSP layouts or drawables. The screens are rebuilt from period material, which was used as reference only and is not copied into the project:
- the Android Developers Blog post "A New Android Market for Phones" (July 2011) with its home screenshot on a Gingerbread phone;
- frames of Google's own video "A New Android Market for Phones", shot on a Nexus S (home, details, the price button);
- Android Police's 480 × 800 Market 3.1.3 captures of the details and settings pages (August 2011);
- a period hands-on video of the Apps section (tab strip and featured tiles).

All artwork is drawn here, including the bag icon (`assets/play-store.svg`, 2.3.6 only) and the icons of the fictional apps. The catalog is the simulator's fictional one, plus public-domain books, fictional films and two paid fictional apps.

- **Home:**
  - The dark action bar holds the bag, "Market" and search.
  - Below it is the promo banner (about 37 % of the screen).
  - The left column has the Apps / Games / Books / Movies tiles. Each has its colour stripe (green, green, blue, red), a watermark and "see more ›".
  - The right column has featured cards with a colour-coded edge, the art, title, developer, stars and price.
- **Sections:** the ViewPager title strip shows the current tab centred and its neighbours at the edges (CATEGORIES, FEATURED, TOP PAID, TOP FREE, TOP GROSSING, TOP NEW PAID, TOP NEW FREE, TRENDING; books and movies have fewer). It is underlined in the section colour, and a sideways swipe moves between tabs.
  - FEATURED is a banner and tile grid. CATEGORIES is the 2011 category list. The top lists are rows with icon, title, developer, stars and price or INSTALLED; free and paid are listed separately.
- **Details:**
  - The #3c3c3c header holds the icon, bold title, upper-case developer and the cyan price button. Installed apps get Open / Uninstall between 2.3 px #a2c447 rules; Uninstall is disabled for system apps.
  - Then the screenshot strip on black and the light block: stars and votes, date, downloads, size, the +1 button with its count, and "Allow automatic updating" for installed apps.
  - Last comes the green DESCRIPTION heading.
- **Purchase flow:** FREE opens the permissions page ("This application has access to the following:" with `ic_bullet_key_permission`) and the cyan "Accept & download" button. Paid items show "not available".
  - Downloading shows the yellow progress bar and Cancel, then Installing…, then Open / Uninstall. The status bar shows the `stat_sys_download` arrow, then "Successfully installed."
- **Other screens:** My apps, the framework search dialog with the bag icon, catalog suggestions and recent searches (also from the Search key), and results. Settings has Notifications, Clear search history, User controls, Content filtering and Use PIN for purchases.
  - Menu: My apps, Accounts, Settings, Help.
- The labels come from a small five-language table in `gb-market.js`, since the Market's own translations are not public.

Checks: `gb-market.test.cjs` covers the home tiles and colours, the section tab strip, the free and paid lists, the details states, download progress, permissions, My apps, search, settings, the menu and translations. Headless Chrome covered home → Games → TOP PAID / TOP FREE → details → Accept & download → Downloading → Open / Uninstall → My apps → search, plus Hungarian. The five-language sweep at 360 × 640 now includes the Market and is clean.

## Market 2.3.4 from the image — 2026-10-11

This replaces the 2026-10-02 Market above, which was a Market 3.x reconstruction from period material. The GRK39F image ships Market 2.3.4 (`system/app/Vending.apk`), so the store is now rebuilt from that APK, like the image's other apps:
- **Sources:** texts in five languages from the APK's resources (`docs/templates/gb-market.template.js` → `docs/tools/apk-strings.py` → `gb-market.js`), drawables from its hdpi set (`assets/gbm234-*`), sizes from its layouts, behaviour and colours from its `classes.dex`. The catalog, the featured list and the reviews stay the simulator's own (they came from the server).
- **Home** (`home_activity`): the velvet arc header, whose gradients use the colours HomeActivity sets in code (`header_background_dark1` #465D00 to `highlight` #A5D300); the carousel of featured apps with its page buttons; Apps / Games / My apps; then the Featured list.
- **Sections and categories:** a section lists its categories with a few app names under each; a category has the Top paid / Top free / Just in tabs and the APK's "No matching content" text when a list is empty.
- **Details** (`AssetInfoActivity.setupContentArea`): the fat header with the icon frame, Install or Open / Uninstall and the rating; "Rate it!" and "Allow automatic updating" for installed apps; Description with More, the version and download count, the screenshots, the permissions, Reviews, Related, Developer info. Install opens the permissions page (OK / Cancel on `bottombar_portrait`); Uninstall asks for one of the APK's five reasons first.
- **Dialogs:** "Rate it!" is `set_rating.xml` (a plain framework RatingBar, so the framework's `btn_rating_star_*`, and the Unrated … Excellent! labels), Security lists the permissions, Notifications and "Allow apps rated" are the settings lists.
- **Menu** (`res/menu/base.xml`): Search, My apps, Settings, Help; Home on inner pages; details add Security, and Clear my review once a rated app is installed.
- **Settings:** Content filtering (the `settings_lock` button and the "Allow apps rated" spinner) and Notifications.

Checks: `gb-market.test.cjs` covers the version, the translations, home, sections, category tabs, details for new and installed apps, permissions, the uninstall reasons, My apps, search, settings, the menu and the dialogs in every language. Headless Chrome covered home → Apps → Tools → details → Install → OK → download → Rate it! → uninstall reasons, and settings with the filter list.

## Widgets — 2026-10-02

References: DeskClock `analog_appwidget.xml` and `xml/analog_appwidget.xml`, Settings `widget.xml` / `appwidget_info.xml` / `SettingsAppWidgetProvider`, Gallery3D `photo_frame.xml` / `appwidget_info.xml` / `PhotoAppWidgetConfigure`, Browser `bookmarkwidget.xml` / `xml/bookmarkwidget.xml`, and their `drawable-hdpi` art (`gb-w-*`).

- **The widget list now matches the 2.3.6 build:** Analog clock, Bookmarks, Home screen tips, Music, Picture frame, Power control and Search, sorted by label like AppWidgetPickActivity.
  - The inherited ICS widgets are gone: the Calendar widget (2.3.6 Calendar has no app widget) and the Gallery2 photo stack. Saved Calendar widgets are dropped when the data loads.
- **Analog clock** (2 × 2): the dark DeskClock dial with the green hands.
- **Power control** (4 × 1, 294 × 72 dip):
  - The five buttons (Wi-Fi, Bluetooth, GPS, Sync, Brightness) sit on `appwidget_bg`, separated by `appwidget_settings_divider`. Each shows the `ic_appwidget_settings_*_on/off` icon over the green / grey / yellow `appwidget_settings_ind_*_l/c/r` bar and the `appwidget_inner_press` highlight.
  - Brightness cycles low → default → full → automatic, like toggleBrightness.
- **Picture frame** (2 × 2): adding it opens the Gallery in pick mode (the path bar says "Pick" and the camera button is hidden). The chosen picture is centre-cropped inside `photo_inner` on `appwidget_bg`. Back cancels the widget.
- **Bookmarks** (4 × 4): previous / title / next above the page thumbnail. The arrows step through the bookmarks, and a tap opens the page in the Browser.

## Live wallpapers — 2026-10-02

References: android-2.3.6_r1 `packages/wallpapers/LivePicker` (`live_wallpaper_entry.xml`, `live_wallpaper_preview.xml`, `LiveWallpaperListActivity`, `LiveWallpaperPreview`), `Basic` (`nexus.rs`, `NexusRS`, `polar_clock_prefs.xml`, the AndroidManifest), `MusicVisualization` (`cube.xml`) and `MagicSmoke` (`clouds.rs`, `MagicSmokeRS`, `MagicSmokeSelector`, `selector.xml`).

- **The list is the 2.3.6 set:** Galaxy, Grass, Magic Smoke, Many, Nexus, Polar clock, Spectrum, VU meter, Water and Waveform. See Through is commented out of the 2.3.6 Basic manifest, so it does not appear.
- **List rows** (Theme.NoTitleBar): the 75 dip centre-cropped thumbnail, then the label and the description (up to three lines; the Water haiku keeps its line breaks), in all five languages from the packages' own strings.
- **Preview:** two 160 dip `btn_default` buttons at the bottom, "Set wallpaper" and "Settings…". "Settings…" only appears for Polar clock and Magic Smoke.
- **Nexus** now uses the 2.3.6 art and timing:
  - the 2.3.6 `pyramid_background` (corrected later: the Nexus S overlay replaces it, see "Nexus S live wallpaper");
  - one 14 px cell size, with ±30 % speed variance;
  - tap pulses at 1.5× speed.
- **Magic Smoke** is new, a WebGL port of `clouds.rs`:
  - The five noise layers are recoloured per preset exactly as `makeTexture` does it, then rotate and drift behind the normalized projection.
  - The default is preset 4 (the green smoke from the thumbnail).
  - Its selector shows the "Tap to change" bar and an OK button; each tap steps one preset back.
- **Polar clock settings** use the GB preference look: the window title bar, two checkboxes, and "Color palette" as a list dialog with radio buttons and Cancel.

## Market icon and landing thumbnail — 2026-10-02

- **Market icon redrawn** from the 2010–2011 Android Market logo (owner's reference): the green handle, the wide white bag with its lower shading band, and the big tilted green Android peeking in from the lower right, clipped by the bag. The earlier version was drawn from memory and used a small, centred robot.
- **Landing thumbnail recaptured** with the 2.3.6 Nexus pyramid-grid wallpaper.

## Quick Search Box — 2026-10-02

References: android-2.3.6_r1 `packages/apps/QuickSearchBox` (`search_activity.xml`, `suggestion.xml`, `contact_suggestion.xml`, `corpus_selection_dialog.xml`, `corpus_grid_item.xml`, `preferences.xml`, `config.xml` default_corpora, styles and the hdpi drawables), plus the searchable labels of Contacts, Mms and Music.

- **The Search key and the home Search widget now open SearchActivity** (Theme.Light.NoTitleBar), not the Browser's search dialog.
  - Browser and Market keep their own search.
  - Contacts, Messaging and Music start in their own corpus, with the hint "Search contacts", "Search Messaging" and so on.
- **"Search" appears in the app drawer** with QSB's launcher icon.
- **Search plate** (`search_plate_global`):
  - the corpus indicator with its drop-down arrow;
  - the field on `textfield_search_empty_selected` with the Google hint image, or on `textfield_search_selected` once you type;
  - the voice button while the field is empty, the go button otherwise.
- **Suggestions** (56 dip rows on white):
  - shortcuts to earlier picks come first (they are all shown for an empty query);
  - then web suggestions (magnifying glass; the typed part normal, the completion bold) and URL / history entries (globe);
  - then apps, contacts (badge, name and number), and, when enabled, messages and music tracks.
  - Picking a suggestion opens it and saves it as a shortcut. Go runs a web search in the Browser.
- **Corpus selector:** the arrow and `corpus_selector_bg` panel with the "Search" heading and the Add / Remove icon. A four-column grid lists All, Web, Apps and Contacts (the 2.3.6 defaults); the current corpus is highlighted.
- **Menu → Search settings:**
  - Web: Google search → Show web suggestions.
  - Phone: Searchable items (checkboxes with each corpus's description) and Clear shortcuts (with its confirmation dialog).
  - All strings come from QSB and the apps' own resources, in five languages.

## Downloads — 2026-10-02

References: android-2.3.6_r1 `packages/providers/DownloadProvider/ui` (`download_list.xml`, `download_list_item.xml`, `list_group_header.xml`, `download_menu.xml`, `DownloadList`, `DownloadAdapter`, `DateSortedExpandableListAdapter`), plus frameworks `DateSorter` and `Formatter.formatFileSize`.

- **New "Downloads" app** in the drawer. The Browser's Menu → More → Downloads also opens it (it used to show a toast).
- **Date-sorted list** under the window title. The DateSorter groups are Today, Yesterday, Last 7 days, Last month and Older, each with the expander indicator; the first group starts expanded.
- **Rows:**
  - a checkbox, the 48 dip file-type icon, the bold title and the domain;
  - then the status (Complete / Failed / In progress / Queued), the size ("845KB", "2.13MB") and, on the right, the time for today or the short date otherwise.
- **Selection:** checking a row brings up the `bottom_bar` with Delete (Remove for a queued download, Cancel for a running one) and Clear selection.
- **Menu:** Sort by size or Sort by time, whichever is not active.
- **Tapping a row:**
  - A finished image or song opens Gallery or Music. Any other file type shows "Cannot open file".
  - A failed download asks Retry / Delete (Retry runs it again until Complete).
  - A queued download asks Keep / Remove.

## Browser, Calendar and Email settings — 2026-10-02

References: android-2.3.6_r1 Browser `browser_preferences.xml` / `BrowserPreferencesPage`, Calendar `preferences.xml` / `CalendarPreferenceActivity`, and Email `account_settings_preferences.xml` / `AccountSettings`.

- **New shared preference engine:** `gb-prefs.js` renders these screens on the GB preference rows. It supports categories, checkboxes, `dependency` greying, ListPreference single-choice dialogs, DialogPreference yes/no confirmations, EditTextPreference dialogs and the RingtonePreference picker. Values are kept in `data.appPrefs`, and the list keeps its scroll position.
- **Browser → Menu → More → Settings** has the full 2.3.6 list:
  - Page content: text size, zoom, overview, encoding, pop-ups, images, auto-fit, landscape, JavaScript, plug-ins, background windows and home page.
  - Privacy: the clears, cookies, form data and location.
  - Security: passwords and warnings.
  - Advanced: search engine, Website settings (disabled while no site has data, as in BrowserPreferencesPage) and Reset to default.
  - Text size, zoom, encoding and home page show their values. Clear history really clears the history.
- **Calendar → Menu → More → Settings:**
  - Hide declined events.
  - Use home time zone, with Home time zone (greyed until enabled, Pacific Time by default).
  - Alerts: alert type, ringtone, vibrate and the default reminder.
  - Build version.
- **Email → Menu → Account settings:**
  - Account name, your name and signature (edit dialogs; summaries show the values), inbox check frequency, and default account.
  - Notifications, ringtone and vibrate, which depend on Email notifications.
  - Incoming / outgoing server entries.

## Calendars list, Share page and button text — 2026-10-02

- **Calendar → Menu → More → Calendars** (SelectCalendarsActivity):
  - The account group (the account and "Corporate") is expanded and holds the calendar row: the colour bar, the name, the status, and the MultiStateButton (`widget_show` / `widget_sync` / `widget_off`).
  - Tapping cycles synced & visible → synced, not visible → not synced.
  - OK applies the change and Cancel / Back discards it. While the calendar is not visible, its events are hidden from the views.
- **Browser → Menu → More → Share page:** the framework "Share via" chooser with Email and Messaging. It opens a new email (subject = page title, body = address) or a new message with the address.
- **Button text size:** GB `Widget.Button` uses textAppearanceSmallInverse (14 sp). The default buttons in the Calendar editor, Email compose ("Save as draft" no longer truncates), the contact editor and the Settings two-button panels now use 14 sp. The Calendar date / time buttons stay at their textAppearanceMediumInverse 18 sp.

## Contact photos — 2026-10-02

References: android-2.3.6_r1 Contacts `EditContactActivity` (createPickPhotoDialog, the PhotoEditorView dialog) and `PhotoEditorView`.

- **Tapping the photo in the contact editor** opens "Contact icon" with Take photo and Select photo from Gallery.
  - With a photo set, the choices are Use this photo, Remove icon and Change icon.
  - Select / Change opens the Gallery in pick mode. A picture goes back to the editor; Back returns without one. Take photo is not available in the simulator.
- **A saved photo replaces the default picture** in the contact list, the contact details header, the in-call card, the Messaging badges (threads and received messages) and the Quick Search Box contact suggestions.

## Email account setup — 2026-10-02

References: android-2.3.6_r1 Email `account_setup_basics.xml`, `AccountSetupBasics.validateFields`, and `AccountSetupCheckSettings`.

- **Email → Accounts → Menu → Add account** opens "Set up email":
  - the 20 sp welcome text;
  - the Email address and Password fields;
  - "Send email from this account by default.";
  - the bottom_bar with Manual setup and Next (with `button_indicator_next`).
- **Both buttons stay disabled** until the address is valid and a password is typed.
- **Next shows "Checking incoming server settings…"** and then, because the simulator is offline, "Setup could not finish / Cannot connect to server." with Edit details, which returns to the form.
  - The password is never stored.
  - Manual setup is not available.

## Nexus S live wallpaper (crespo overlay) — 2026-10-02

The Nexus wallpaper used the AOSP `packages/wallpapers/Basic` resources: the grey pyramid-grid `pyramid_background` that had shipped since the Nexus One. However, `device/samsung/crespo` (`android-2.3.6_r1`) has `overlay/packages/wallpapers/Basic`, which the Nexus S build applies on top of them:

- **`res/drawable-hdpi/pyramid_background.png`** (960 × 800): a dark background with soft blue-violet light waves across the middle, the image on the Nexus S box. It replaces the pyramid grid.
- **`res/drawable-hdpi/nexus_thumb.png`**: coloured light bars on black, now used in the LivePicker.
- **`res/raw/nexus.rs`:**
  - `initPulse` gives every pulse a random scale of 0.7–1.7. The scale sets both the pulse's size (the model matrix is scaled) and its speed (`dx` / `dy = ±scale`), and the far-edge origins are divided by the scale. Thin, slow and thick, fast pulses mix, as if at different depths.
  - `addTap` uses one random scale of 0.9–1.9 for its four pulses.
  - The 14 px cells, 40-cell trails, 64 px glow, colours, 45 ms frame and the 2 × width background scrolling are unchanged.
- **`res/values/surfacemode.xml`**: `use_32bit = true`. Only the surface format changes; nothing to draw.

The crespo `default_wallpaper.jpg` (green grass) is only the static ImageWallpaper fallback. `config.xml` makes the live Nexus wallpaper the default.

`versions/2.3.6/assets/lw-pyramid_background.png` and `lw-nexus_thumb.png` are now the crespo files (cache key `?v=2`). `live-wallpapers.js` follows the crespo `initPulse` / `addTap` scaling. The landing thumbnail (`landing-home.jpg?v=4`) was recaptured. The shot is staged with two taps on the empty home area, so two four-colour `addTap` bursts cross the light waves. 4.0.4 and 4.3 keep their own wallpapers.

Checks: headless Chrome showed the new background with mixed pulse widths, a tap burst and the new LivePicker thumbnail. No JavaScript errors.

## Straight left edge on the frame — 2026-10-03

The Nexus S outline came out wavy on the left (owner feedback). The render it is traced from is slightly skewed, and its shading and the volume keys made the left edge jump by 0–3 px from row to row, which the curve smoothing turned into waves. The right edge was already straight, because it is clamped to the body width. The Nexus S front is symmetric, so `docs/tools/device-frames.py` now mirrors the right edge for the left one (`mirror=True`). The rounded top-left and bottom-left corners were still uneven, so the left half of the top and bottom edges is mirrored too. The whole left half of the outline is now the mirror image of the right half.

## Interface strings from the factory image — 2026-10-04

The Gingerbread screens read their text from `gb-strings-*.js`, which are generated from the AOSP `android-2.3.6_r1` sources. These were compared with the Nexus S GRK39F image's resources: 784 strings are the same and none differ in substance. The only real difference is the Google Quick Search Box: the image ships GoogleQuickSearchBox, whose German, French and Spanish texts for agree, disagree and the settings title are worded differently. `docs/tools/gb-strings.py` now applies those three from the image (`image` in the `search` entry).

The screens Gingerbread inherits use the shared `i18n.js` rows. `docs/tools/image-strings.mjs 2.3.6` now overrides those rows with the image's own text: `versions/2.3.6/image-strings.js`, 156 rows, with the same rules as 4.0.4 and 4.3. The changes are listed in `docs/reports/image-strings-2.3.6.tsv`.

Seven French rows in `i18n.js` showed a backslash ("Transfert d\'appel"); they are fixed.

## Sounds from the Nexus S image — 2026-10-04

The ringtone, notification and alarm pickers used to list the AOSP `OriginalAudio.mk` set of the generic crespo build (BeatPlucker, OnTheHunt, Alarm_Rooster_02). They now list the GRK39F image's `/system/media/audio`, with each file's Vorbis TITLE in MediaStore title order: 28 ringtones, 20 notifications and 5 alarms ("Ringing Alarm", "Piezo Alarm" and so on).

The defaults come from `build.prop`: Sceptrum, Castor, and Alarm_Classic ("Ringing Alarm"). `build.prop` also has a later `ro.config.notification_sound=OnTheHunt.ogg` line, but it cannot override a read-only property that is already set, and the image has no such file.

A saved sound that the image does not have shows as the default.

## Microbes live wallpaper — 2026-10-04

The Nexus S image ships Google's Microbes wallpaper (Microbes.apk 2.3.6, odexed, with the native `/system/lib/libmicrobes_jni.so`). The Java side was read from the odex: taps go to `Native.motion` on the way down and `Native.touch` on release (if the finger stayed within 30 px), the scroll goes to `Native.setScrollInfo(desiredWidth, desiredHeight, width, height, xPixels)`, and `step(min(frame time, .1 s))` runs every frame.

The four GLSL programs (microbe, food, dead shell, background blob) are plain strings in the library. The simulation comes from its ARM code (disassembled with Capstone):
- the counts: 300 microbes, 600 food specks, 80 shells, 60 blobs, 15 touch rings;
- the 30 microbes and 50 food specks at start;
- wander, margin push, neighbour repulsion, feeding, fleeing a touch, the speed cap, energy, growth, division, death and sinking shells;
- food every 0.2 s, and the colour change off screen;
- drawing with additive blending on black.

The Galaxy Nexus copy (4.0.4) has the same shaders and constants. The world is Launcher2's desired wallpaper size: twice the screen width by the screen height. The picker shows the image's untranslated "Microbes" and "Life under the microscope.". The thumbnail is our own capture, not Google's JPEG.

## Maps live wallpaper — 2026-10-04

Maps 5.4.0 on the Nexus S image registers `com.google.googlenav.wallpaper.MapWallpaper`. It draws Google's map tiles around the phone's location and scrolls them with the home screen. Those tiles cannot ship here. As the owner proposed, the wallpaper draws a map in the style of the simulator's Maps app instead: a made-up riverside city two screens wide, with the blue my-location dot.

The settings follow the image's `wallpaper_prefs.xml`:
- "Show traffic", off by default. When on, the arterials are drawn green, yellow and red.
- "Map mode": Normal, Satellite or Terrain, with Satellite (`map_mode_satellite`) as the default.

The labels are the image's own; Maps 5.4.0 has no Hungarian, so the Hungarian interface shows them in English. The Galaxy Nexus (Maps 6.4.0) and Nexus 4 (Maps 6.14.4) builds dropped "Show traffic", so 4.0.4 and 4.3 offer only Map mode, translated as their images have it. The thumbnail is a capture of our own drawing.

## Gmail 2.3.5.1 — 2026-10-04

The Nexus S image ships Gmail 2.3.5.1 instead of only AOSP Email, so it is added as a working app (`gb-gmail.js`, `gb-gmail.css`, strings from `docs/templates/gb-gmail.template.js` via `docs/tools/apk-strings.py`). Email stays. The image's Google apps register through `gb-apps.js`, which the simulator wires once (render, Menu key, dialogs, taps, forms, Back, open).

Sources in `Gmail.apk` and its odex (GRK39F):
- **Conversation list.** `custom_title.xml` puts the label and unread count on the left and the account on the right. The rows are `CanvasConversationHeaderView`, read from the odex:
  - 60 dip rows; the check box at 3 / 8 dip;
  - the subject in 18 sp, bold while unread, then the snippet in #777777;
  - below them the importance caret, the senders in 14 sp, the labels and the date; the star at 5 dip;
  - read rows on #e7e3e7.
- **Selection.** `footer_organize` shows Archive, Delete and Labels. The #A4C639 undo bar uses the `conversation_*ing` plurals.
- **Conversation.** `res/raw-hdpi/styles.css` draws the WebView: message cards on `message_header.9`, the contact frame, the action strip with Reply / Reply all / Forward, and recipient details. The bottom bar holds Archive, Delete, Newer and Older.
- **Compose.** `compose_custom_title.xml` holds Compose or the Reply / Reply all / Forward picker, then Send and Save draft. Below it are `compose_area_layout.xml` on #ededed and `quoted_text.xml` with "Include text" and "Respond inline".
- **Labels and menus.** "Go to labels" uses `label_item.xml`. The Menu key opens `conversation_list_menu`, `_organize_mode`, `conversation_menu` and `compose_menu`.

The label colours are Gmail's palette from the dex.

Period reference: Liliputing and Habr screenshots of Gmail 2.3.2 compose (December 2010).

`docs/tools/apk-strings.py` now also reads plurals (`@plurals/name:one`) through the Android SDK's aapt2. The launcher's Search entry is now "Google Search" with the image's icon: the image ships Google's build of the Quick Search Box.

## Maps 5.4.0, Places, Latitude and Navigation — 2026-10-04

`gb-maps.js` and `gb-maps.css` render the image's Maps.apk launcher entries. The text tables come from `docs/templates/gb-maps.template.js`.

**Maps.** The 45 dip header follows `header_bar.xml`: the "Search Maps" field, then Places, Layers and My Location. Below it:
- the map with the blue dot;
- `btn_zoom_down` / `btn_zoom_up` while the map is touched;
- lettered search markers with the `popup_pointer_button` bubble;
- place pages;
- the directions panel (`directions_input_dialog.xml` with the `mode_*` toggles and Go), which draws the route and a summary ribbon with Navigation;
- the Layers list (Traffic, Satellite and Terrain change the drawing; Latitude shows friends on the map);
- the Menu-key menu (Search, Directions, Starred Places, Clear Map, Latitude, More).

**Places.** The category grid, with `icon_restaurants` … `icon_gas` and `icon_add`, and the result rows.

**Latitude.** `list_header_friends_list.xml` and `friends_list_item.xml`.

**Navigation.**
- The destination picker: `da_destination_activity.xml`, Theme.Light.
- The guidance screen (`da_navigation.xml`):
  - the 84 dip `da_top_panel_green` step bar with the turn square;
  - the tilted map, with the `dav_chevron` driving the route in 40 s;
  - the `da_bottom_panel_gray` status bar.
- Back asks "Exit navigation?".
- The `da_*` texts are translated as in the image.

The map is the Maps live wallpaper's drawn city, now shared as `LiveWallpapers.mapSheet`. The places, friends and routes are made up.

Maps 5.4 loaded most of its interface text (Directions, Labs, Check in…) from a downloaded language pack that is not in the image. Those texts use the simulator's own rows: new `i18n.js` rows were taken from the Galaxy Nexus and Nexus 4 images where those have them (Directions, Bicycling, Check in, Now), and written by hand otherwise.

## Google Talk 1.3 and YouTube 2.1.6 — 2026-10-04

**Talk.** `gb-talk.js` and `gb-talk.css`, built from Talk2.apk.
- **Friends list.** `roster_list.xml` on #e3e3e3 has your own row and 65 dip friend rows. Each row has the picture, the bold name and the status, then the separator and the 62 dip presence column. Voice and video friends get the microphone presence icons. Offline friends are on #cccccc. Tapping your row opens Set status (Available, Busy, Invisible and a status message).
- **Chat.** `title_message_bar.xml` on `header_chat` holds the name, the status, the presence and the voice and video buttons. Received lines are on #effbff, with names in chat_from #7785e0 and chat_me #3492c5. The compose bar on `bottombar_landscape_565` has "Type to compose" and Send. Emoticons render as in the app, and Insert smiley adds them. Friends answer with made-up replies.
- **Menus and texts.** Both screens have their Menu-key menus, and the texts are Talk2.apk's.

**YouTube.** `gb-youtube.js` and `gb-youtube.css`, built from YouTube.apk on the dark framework Theme.
- **Header.** `header.xml`: 51 dip, with the logo and the upload and search buttons.
- **Video rows.** `video_item.xml`: an 80 × 60 dip thumbnail frame with the duration on black, the 13 dp title, and the 12 dp author and views.
- **Browse.** The Browse categories, with the time filter.
- **Search.**
- **Watch screen.** The player plays in real time, with the paused overlay, scrubber and time. Below it are the like, dislike, favorite, share and flag toolbar, and the Info, Related videos and Comments tabs (`tab_drawable`). Comments can be posted.
- **Menu.** Home, Browse, My Channel, Upload, Search and Settings.
- **Language.** YouTube 2.1.6 has no Hungarian, so it shows English there, as on the phone.

## News & Weather, Books, Earth and Voice Search — 2026-10-04

These four apps are in `gb-google-apps.js` and `gb-google-apps.css`. The texts come from each APK through `docs/tools/apk-strings.py`.

**News & Weather 1.3.04 (GenieWidget.apk)**
- The 41 dip tab row, with 18 sp tabs on the `tab_weather_*` 9-patches.
- `weather_current_view.xml`: the 30 sp city, the 90 dp picture with the 90 sp temperature, high and low, humidity and wind, and the four-day forecast. Units are °F in English and metric elsewhere.
- `news_item_layout.xml` rows on #1a1a1a, and white story pages.
- The topic names come from Google's server, so they use the simulator's own translations. The news is made up.

**Books 1.2.2 (BooksPhone.apk)**
- The 45 dip `home_actionbar` with Get eBooks and search.
- The library grid on #eaf0fb, with sort by Recently read, Title or Author.
- The reader: the 60 dip `ab_material_reader_day` bar, contents, day / night, tap-to-turn pages and the page scrubber.
- The books are the same public-domain openings as on 4.3.

**Earth 2.0.1 (GoogleEarth.apk)**
- The APK's splash, then a drawn globe that turns and can be spun by dragging.
- Brand, north button, Search (Fly to a few cities), Layers and My Location.
- Earth 2.0.1 is English-only.

**Voice Search 2.1.3 (VoiceSearch.apk)**
- `recognition_dialog.xml` on `vs_dialog_red`: "Speak now", the microphone level meter, the Google watermark, Help and Cancel, and the hint bubble.
- After five seconds without speech: "No speech heard" with Speak again.
- Help ("Try saying...") lists the Voice Actions with the image's own per-language examples (`en_US_hint_*`, `de_DE_hint_*`, …). Tapping an example runs it: Messaging, Navigation, Phone, Gmail, Maps, Music, Browser, Clock or Google Search.
- Voice Search had no Hungarian, so it shows English there.

## Car Home, Google Voice, Tags and Voice Dialer — 2026-10-04

These four apps are in `gb-extra-apps.js` and `gb-extra-apps.css`. The app drawer now lists exactly the image's 30 launcher entries.

**Car Home 2.2.1.2.** The screens follow `res/xml/default_carhome.xml`:
- screen 1: Navigate, Phone, Voice Search, Contacts, Music, Exit car mode;
- screen 2: Maps, Places, Add shortcut, Settings, Day/Night mode.

The cells are 160 × 133.3 dip on the `container` 9-patch, shown over the home wallpaper, with the screen arrows. Empty cells take car apps through Add shortcut, and Day/Night mode dims and tints the screen.

**Google Voice 0.4.2.30.** Theme.Light, English only, as the service was.
- `conversation_item.xml` rows: the picture with the voicemail, text or call badge, the name, count and time, the star and the message.
- The labels.
- Voicemail playback with the transcript.
- Text threads with replies, and Compose.

**Tags 1.1.**
- The Tags, Starred and My tag tabs, with made-up scanned tags.
- `tag_viewer.xml`: the URL opens the Browser and a contact calls, with Done and Delete.
- About Tags.
- "NFC turned off" when NFC is off in Settings.

**Voice Dialer.** "Starting up.", "Listening…", then "No results, try again." with the examples and the "Did you know…" tip.

Google Voice's launcher label stays "Voice" and Car Home stays untranslated in Hungarian, as on the image. `AndroidI18n.extend` sets this for 2.3.6 only.

## Home screen of the factory image — 2026-10-04

The default desktop now follows the image's Launcher2 `res/xml/default_workspace.xml` (layout revision 3, which resets older saved desktops once):
- screen 1: News & Weather 4 × 1;
- screen 2: YouTube 4 × 1;
- screen 3: the search bar and the home screen tips at the bottom row;
- screen 4: Market 2 × 2;
- screen 5: Power control.

New widgets in `gb-widgets.js`:
- **News & Weather** (`miniwidget.xml`): the weather column and the flipping stories.
- **YouTube** (`widget_layout.xml` / `widget_teaser.xml`): the logo, the flipping videos, and the camera and search buttons.
- **Market** (`widget.xml` / `widget_app.xml`): the header and the flipping featured apps on `green_gradient`.

Taps open the story, the video, YouTube search or the app's Market page. The widget picker lists the image's providers, sorted by label, with the search widget as "Google Search".

## More widgets of the Google apps — 2026-10-05

`gb-google-widgets.js` (built from `docs/templates/gb-google-widgets.template.js` by `docs/tools/apk-strings.py`) adds the image's other providers to the widget picker:
- **Calendar** 2 × 2 (`CalendarProvider.apk` `agenda_appwidget.xml`):
  - the next event that has not ended, under the blue top with the day (17 sp) and the date (30 sp);
  - the time in 14 sp #666, the title in 14 sp bold, the place in 11 sp;
  - "1 more event" for events starting at the same time;
  - "No upcoming calendar events" when the week ahead is empty.
- **Google Voice Inbox** 3 × 1 (`widget_inbox_layout.xml`): the title with the unread count, the arrows and the message preview. Missed calls show as "Missed call from …".
- **Google Voice Settings** 3 × 1 (`widget_settings_layout.xml`, 80 dip): Inbox, Compose, Call settings and Do not disturb, over the balance and call setting bar. Do not disturb toggles with the app's toast.
- **Latitude** 4 × 2 (`Maps.apk` `layout-port/friends_appwidget.xml`): the header with your location, Check in and Refresh; two friends with their distance and place over the watermark; the account and "Last Updated" in the footer.
- **Traffic** 1 × 1 (`traffic_appwidget.xml`): the 41 dip traffic light with the minutes home, slower in the rush hours.
- **Rate Places** 4 × 1 (`Maps.apk` HotpotWidgetProvider; `hotpot_widget.xml`, `hotpot_widget_rate.xml`, 300 × 56 dip):
  - the rate button over the three-digit counter of rated places;
  - the nearest place with "You rated:" and small stars, or the blue dot and "Updated {0}";
  - the drop-down opens "Select a place:" (ResolvePlaceActivity's dark list: 17 sp name, 14 sp #999 address);
  - the rate button or the place slides in the rate panel: "Posting publicly as {0}", five stars, and Say more, which opens the place in Places.

Taps open Latitude, Maps, Places, Google Voice (the previewed conversation or Compose) or Calendar. The texts come from the APKs: Google Voice is English only, and Maps has no Hungarian. The migration no longer drops `calendar` widgets, because the inherited ICS calendar widgets went with the revision 3 reset.
