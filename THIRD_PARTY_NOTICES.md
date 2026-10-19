# Third-party notices

The Android 4.0.4 simulator includes artwork and a font from the Android Open Source Project, tag [`android-4.0.4_r2.1`](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-4.0.4_r2.1/). These files are distributed under the Apache License, Version 2.0. The license text: [apache.org/licenses/LICENSE-2.0](https://www.apache.org/licenses/LICENSE-2.0).

- `versions/4.0.4/assets/aosp-wallpaper.jpg`, `platlogo.png`, and `Roboto-Regular.ttf`: [AOSP frameworks/base](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-4.0.4_r2.1/).
- `versions/4.0.4/assets/nav-*.png`: [AOSP SystemUI](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-4.0.4_r2.1/packages/SystemUI/res/drawable-hdpi/).
- `versions/4.0.4/assets/nyandroid*.png` and `star*.png`: [AOSP SystemUI drawable-nodpi](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-4.0.4_r2.1/packages/SystemUI/res/drawable-nodpi/).
- `versions/4.0.4/assets/ic_notify_*.png`, `stat_sys_*.png`, and `stat_notify_more.png`: [AOSP SystemUI drawable-hdpi](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-4.0.4_r2.1/packages/SystemUI/res/drawable-hdpi/).
- `versions/4.0.4/assets/stat_notify_sms.png`: [AOSP Mms drawable-hdpi](https://android.googlesource.com/platform/packages/apps/Mms/+/refs/tags/android-4.0.4_r2.1/res/drawable-hdpi/).
- `versions/4.0.4/assets/ic_lockscreen_*.png`: [AOSP framework drawable-hdpi](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-4.0.4_r2.1/core/res/res/drawable-hdpi/).
- `versions/4.0.4/assets/apps.png`: [AOSP Launcher2](https://android.googlesource.com/platform/packages/apps/Launcher2/+/refs/tags/android-4.0.4_r2.1/).
- `versions/4.0.4/assets/wallpaper_*.jpg` and `ic_launcher_market_holo.png`: [AOSP Launcher2](https://android.googlesource.com/platform/packages/apps/Launcher2/+/refs/tags/android-4.0.4_r2.1/res/).
- `versions/4.0.4/assets/ic_btn_speak_now.png`: [AOSP framework drawable-hdpi](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-4.0.4_r2.1/core/res/res/drawable-hdpi/).
- Other `versions/4.0.4/assets/*.png` application icons: corresponding [AOSP packages/apps](https://android.googlesource.com/platform/packages/apps/) projects at tag `android-4.0.4_r2.1` (Browser, Calculator, Calendar, Contacts, DeskClock, Email, Gallery, Mms, Music, Settings).
- `versions/4.0.4/assets/setting-bluetooth.png`: the `ic_settings_bluetooth2.png` resource selected by the [Android 4.0.4 Settings header](https://android.googlesource.com/platform/packages/apps/Settings/+/refs/tags/android-4.0.4_r2.1/res/xml/settings_headers.xml).

Android is a trademark of Google LLC. This project is an independent, unofficial browser simulation.

## Additional resources used by the 2026-09-28 audit

All resources below use the same AOSP tag and Apache-2.0 license:

- `background_holo_dark.png`: framework `core/res/res/drawable-nodpi/background_holo_dark.png`.
- `appwidget_clock_dial.png`, `appwidget_clock_hour.png`, `appwidget_clock_minute.png`: [DeskClock `res/drawable-hdpi`](https://android.googlesource.com/platform/packages/apps/DeskClock/+/refs/tags/android-4.0.4_r2.1/res/drawable-hdpi/).
- `btn_check_*_holo_dark.png`, `ic_ab_back_holo_dark.png`, `ic_menu_moreoverflow_normal_holo_dark.png`: framework `core/res/res/drawable-hdpi`.
- `ic_bt_*.png`, `ic_wifi_*.png`: [Settings `res/drawable-hdpi`](https://android.googlesource.com/platform/packages/apps/Settings/+/refs/tags/android-4.0.4_r2.1/res/drawable-hdpi/).
- `power-*.png`: Settings `ic_appwidget_settings_*_holo.png`, renamed for browser use.
- `widget-power-bg.png`: Settings `appwidget_bg_holo.9.png`.
- `appwidget_settings_ind_*_c_holo.png`: corresponding Settings `.9.png` resources.
- `status_bar_close_on.png`: SystemUI `res/drawable-hdpi/status_bar_close_on.9.png`.
- `toast_frame_holo.png`: framework `core/res/res/drawable-xhdpi/toast_frame_holo.9.png`.

For converted `.9.png` resources, the one-pixel Android stretch-metadata border was removed. CSS border images or repeat/stretch rules reproduce the frame; the original artwork inside the metadata border is retained.

## Phone and Calculator reconstruction

- `dial_num_*_wht.png`, `dial_background_texture.png`, `ic_ab_{dialer,history,favourites}_holo_dark.png`, `ic_dial_action_*.png`, `ic_menu_overflow.png`, `ic_call_outgoing_holo_dark.png`, `ic_contact_picture_holo_dark.png`: [Contacts hdpi resources](https://android.googlesource.com/platform/packages/apps/Contacts/+/refs/tags/android-4.0.4_r2.1/res/drawable-hdpi/).
- `calc-btn_keyboard_key_*.png`: [Calculator hdpi resources](https://android.googlesource.com/platform/packages/apps/Calculator/+/refs/tags/android-4.0.4_r2.1/res/drawable-hdpi/), renamed and stripped of their one-pixel nine-patch metadata borders. CSS preserves the source stretch regions.

These resources retain the AOSP Apache-2.0 license described above. The JavaScript expression evaluator is project code, not a port of Calculator's Arity dependency.

## Play Store demo

The 4.3 storefront (`versions/4.3/jb-play.js` / `.css`, Play Store 4.2.3) is project code drawn from period screenshots in the same way; its icons are inline SVG. In 2.3.6, `assets/play-store.svg` is a project-authored redrawing of the 2010–2011 Android Market bag. In 4.0.4 and 4.3 it is the 2012–2014 Google Play Store logo by Google, licensed under CC BY-SA 3.0. It comes from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Google_Play_Store_(2012-2014).svg), which took it from the Google Play brand guidelines. Only the view box was cropped to a square and the Inkscape metadata removed. That adapted file is shared under the same license. `versions/4.0.4/ics-play.js` / `.css` (Play Store 3.5) and `versions/2.3.6/gb-market.js` (Market 3) are project code drawn from period screenshots, and their artwork is CSS / inline SVG. Storefront illustrations are project CSS, apart from the existing AOSP canyon wallpaper and application icons listed above. No Google Play APK, proprietary storefront assets, or historical screenshot is redistributed. Google Play is a trademark of Google LLC; this offline sample catalog is unofficial and is not connected to Google services.

## Messaging reconstruction

`versions/4.0.4/assets/mms-*.png` are unmodified [AOSP Mms hdpi resources at `android-4.0.4_r2.1`](https://android.googlesource.com/platform/packages/apps/Mms/+/refs/tags/android-4.0.4_r2.1/res/drawable-hdpi/), renamed with the `mms-` prefix: `ic_contact_picture`, `ic_menu_attachment`, `ic_menu_call`, `ic_menu_msg_compose_holo_dark`, `ic_menu_search_holo_dark`, `ic_send_holo_light`, `msg_bubble_left` and `msg_bubble_right`. They retain the AOSP Apache-2.0 license described above. The browser UI and SMS segment counter are project code.

## People and Browser resources

The `people-*.png` resources are from [AOSP Contacts drawable-hdpi](https://android.googlesource.com/platform/packages/apps/Contacts/+/refs/tags/android-4.0.4_r2.1/res/drawable-hdpi/); `web-*.png` resources are from [AOSP Browser drawable-hdpi](https://android.googlesource.com/platform/packages/apps/Browser/+/refs/tags/android-4.0.4_r2.1/res/drawable-hdpi/). They retain their original artwork with a filename prefix added, under the same Apache-2.0 license. The additional offline articles are project-authored fictional demo content.

## DeskClock resources

- `AndroidClock.ttf`: [AOSP frameworks/base data/fonts](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-4.0.4_r2.1/data/fonts/AndroidClock.ttf).
- `clock-*.png`: [AOSP DeskClock drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_deskclock/tree/android-4.0.4_r2.1/res/drawable-hdpi), with a filename prefix added. Original images are unchanged.

These resources use the same Android 4.0.4 tag and Apache-2.0 license noted above.

## Camera and Gallery resources

- `camera-*.png`: [AOSP Camera drawable-hdpi](https://github.com/aosp-mirror/platform_packages_apps_camera/tree/android-4.0.4_r2.1/res/drawable-hdpi).
- `gallery-*.png`: [AOSP Gallery2 drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_gallery2/tree/android-4.0.4_r2.1/res/drawable-hdpi).

Original PNG artwork is unchanged, with filename prefixes added. The same Apache-2.0 license applies. The SVG camera/gallery scenes generated by `media.js` are original project illustrations, not photographs or AOSP assets.


### Calendar controls

`versions/4.0.4/assets/calendar-ic_menu_{today,done,cancel}_holo_light.png` are unmodified AOSP Calendar assets from [android-4.0.4_r2.1](https://github.com/aosp-mirror-neo/platform_packages_apps_calendar/tree/android-4.0.4_r2.1/res/drawable-hdpi). `btn_check_{off,on}_holo_light.png` and `ic_menu_moreoverflow_normal_holo_light.png` come from the [Android framework at the same tag](https://github.com/aosp-mirror/platform_frameworks_base/tree/android-4.0.4_r2.1/core/res/res/drawable-hdpi). Copyright The Android Open Source Project; Apache License 2.0.


### AOSP Music artwork

The `music-*.png` tab, album placeholder, playlist, shuffle/repeat and metadata images are unmodified assets from [AOSP Music, android-4.0.4_r2.1](https://github.com/aosp-mirror/platform_packages_apps_music/tree/android-4.0.4_r2.1/res/drawable-hdpi). `music-ic_media_{play,pause,previous,next}.png` come from [frameworks/base at the same tag](https://github.com/aosp-mirror/platform_frameworks_base/tree/android-4.0.4_r2.1/core/res/res/drawable-hdpi). Copyright The Android Open Source Project; Apache License 2.0. Demo track names and artists are fictional; no recordings are distributed.


### Email controls

The unmodified `email-*.png` images come from [AOSP Email, android-4.0.4_r2.1](https://github.com/aosp-mirror-neo/platform_packages_apps_email/tree/android-4.0.4_r2.1/res/drawable-hdpi). Copyright The Android Open Source Project; Apache License 2.0. The forward icon is darkened with CSS for the light toolbar.


### In-call Phone artwork

The unmodified `phone-*.png` images come from [AOSP Phone, android-4.0.4_r2.1](https://github.com/aosp-mirror/platform_packages_apps_phone/tree/android-4.0.4_r2.1/res/drawable-hdpi). Copyright The Android Open Source Project; Apache License 2.0.

### Launcher folders

The `launcher-portal_container_holo.png` (nine-patch guide border removed), `launcher-portal_ring_inner_holo.png` and `launcher-portal_ring_outer_holo.png` images come from [AOSP Launcher2, android-4.0.4_r2.1](https://android.googlesource.com/platform/packages/apps/Launcher2/+/android-4.0.4_r2.1/res/drawable-hdpi/). Copyright The Android Open Source Project; Apache License 2.0. The browser approximates Android's nine-patch rendering with CSS border images.

### Credential lock artwork

The unmodified `lock-*.png` assets come from [AOSP frameworks/base, android-4.0.4_r2.1, drawable-hdpi](https://android.googlesource.com/platform/frameworks/base/+/android-4.0.4_r2.1/core/res/res/drawable-hdpi/): the default/touched pattern points, default/green/red point rings, emergency-call icon and keyboard OK icon. Copyright The Android Open Source Project; Apache License 2.0. The keyboard key backgrounds are CSS approximations.

### Launcher widgets

Unmodified AOSP resources at `android-4.0.4_r2.1`, Apache License 2.0:

- `calwidget-header_bg_cal_widget_holo.png`, `calwidget-header_row_press_cal_widget_holo.png` and `calwidget-calendar_widget_preview.png`: [Calendar drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_calendar/tree/android-4.0.4_r2.1/res/drawable-hdpi).
- `music-appwidget_bg.png`, `music-appwidget_inner_press_{l,c,r}.png` and `music-ic_appwidget_music_{play,pause,next}.png`: [Music drawable-hdpi](https://github.com/aosp-mirror/platform_packages_apps_music/tree/android-4.0.4_r2.1/res/drawable-hdpi).
- `gallery-appwidget_photo_border.png`, `gallery-border_photo_frame_widget_holo.png`, `gallery-border_photo_frame_widget_pressed_holo.png` and `gallery-widget_preview.png` (`preview.png`): [Gallery2 drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_gallery2/tree/android-4.0.4_r2.1/res/drawable-hdpi).
- `btn_radio_{on,off}_holo_dark.png`: framework `core/res/res/drawable-hdpi`.

Resources that are `.9.png` files in AOSP were renamed and their one-pixel nine-patch metadata border was removed; CSS border images reproduce the stretch regions. Flat nine-patches (event rows, list background and color chips) are drawn as CSS colors.

### Launcher drop targets

`launcher-ic_launcher_clear_{normal,active}_holo.png` and `launcher-ic_launcher_info_{normal,active}_holo.png` are unmodified [AOSP Launcher2 drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_launcher2/tree/android-4.0.4_r2.1/res/drawable-hdpi) resources at `android-4.0.4_r2.1`, Apache License 2.0.

`launcher-search_frame.png` (the home screen search bar frame) is the compiled xhdpi nine-patch from the Launcher2.apk of the Galaxy Nexus factory image IMM76I (AOSP Launcher2, Apache License 2.0).

`calendar-stat_notify_calendar.png` is the unmodified [AOSP Calendar](https://github.com/aosp-mirror-neo/platform_packages_apps_calendar/tree/android-4.0.4_r2.1/res/drawable-hdpi) `stat_notify_calendar.png` at `android-4.0.4_r2.1`, Apache License 2.0.

`ic_lockscreen_chevron_right.png`, `ic_lockscreen_unlock_activated.png`, `ic_lockscreen_camera_activated.png` and `ic_lockscreen_handle_pressed.png` are unmodified [AOSP framework drawable-hdpi](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-4.0.4_r2.1/core/res/res/drawable-hdpi/) resources at `android-4.0.4_r2.1`, Apache License 2.0.

## Android 4.3 Jelly Bean

`versions/4.3/` begins as a copy of the 4.0.4 directory; the resources above apply to it too. Added resources from tag `android-4.3_r1.1`, Apache License 2.0:

- `jb-platlogo.png` and `jb-platlogo_alt.png`: framework `core/res/res/drawable-nodpi/platlogo.png` and `platlogo_alt.png`, renamed.
- `redbean0.png`, `redbean1.png`, `redbean2.png`, `redbeandroid.png` and `jandycane.png`: SystemUI `res/drawable-nodpi`, unmodified.
- `jb-ic_notify_*`, `jb-ic_notifications_normal.png` and `jb-ic_qs_*`: SystemUI `res/drawable-hdpi`, renamed with a `jb-` prefix.
- `jb-status_bar_close_on.png`: SystemUI `status_bar_close_on.9.png` with the nine-patch border removed.
- `calendar-ic_alarm_holo_dark.png`, `calendar-ic_map.png` and `calendar-ic_menu_email_holo_dark.png`: [AOSP Calendar](https://github.com/aosp-mirror-neo/platform_packages_apps_calendar/tree/android-4.3_r1.1/res/drawable-hdpi) at `android-4.3_r1.1`.
- `jb-ic_lockscreen_glowdot.png`, `jb-ic_lock_idle_alarm.png`, `jb-ic_lockscreen_alarm.png`, `jb-kg_add_widget.png`, `jb-kg_add_widget_pressed.png` and `jb-kg_widget_bg_padded.png` (nine-patch border removed): framework `core/res/res/drawable-hdpi`.
- `jb-wallpaper_{01,02,03,04,05,08,09,10,11,12}.jpg` and their `_small` thumbnails: [Launcher2 drawable-nodpi](https://github.com/aosp-mirror-neo/platform_packages_apps_launcher2/tree/android-4.3_r1.1/res/drawable-nodpi), renamed with a `jb-` prefix. `jb-search_frame.png` (nine-patch border removed) and `launcher-ic_home_voice_search_holo.png`: Launcher2 `drawable-hdpi`.
- Launcher icons replaced in `versions/4.3/assets` (`browser`, `calculator`, `calendar`, `clock`, `email`, `messaging`, `settings`, `people`, `phone`, `camera`, `gallery`): the `ic_launcher_*` `mipmap-xhdpi` resources of Browser, Calculator, Calendar, DeskClock, Email, Mms, Settings, Phone and Gallery2 at `android-4.3_r1.1`. `appwidget_clock_{dial,hour,minute}.png`, `clock-ic_menu_add.png` and `jbclock-appwidget_digital_clock_preview.png`: DeskClock 4.3. `calendar-ic_menu_today_holo_light.png`: Calendar 4.3. `mms-msg_bubble_{left,right}.png`: Mms 4.3. `Roboto-Regular.ttf` and `AndroidClock.ttf`: framework `data/fonts` at `android-4.3_r1.1`.
- `jb-ic_action_assist_generic_{normal,activated}.png`: framework `core/res/res/drawable-hdpi` at `android-4.3_r1.1`, renamed with a `jb-` prefix.
- `jb-btn_call_pressed.png`: [AOSP Dialer drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_dialer/tree/android-4.3_r1.1/res/drawable-hdpi) at `android-4.3_r1.1`, renamed with a `jb-` prefix.
- `calwidget-header_bg_cal_widget_pressed_holo.png` (nine-patch border removed): Calendar `drawable-hdpi` at `android-4.3_r1.1`.
- `jbgal-*.png`: Gallery2 `drawable-hdpi` at `android-4.3_r1.1` (`actionbar_translucent`, `ic_menu_edit_holo_dark`, `ic_menu_savephoto`, the `ic_photoeditor_*` panel icons and `filtershow_button_undo/redo`) and framework `spinner_ab_{default,pressed}_holo_dark` and `ic_menu_moreoverflow_normal_holo_dark`; nine-patch borders removed where present.
- `jbcam-*.png`: [Gallery2 camera drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_gallery2/tree/android-4.3_r1.1/res/drawable-hdpi) at `android-4.3_r1.1` (shutter states, switcher, pie, exposure, flash, white-balance, scene, location, timer and on-screen indicator icons), renamed with a `jbcam-` prefix.
- `jb-kg_bouncer_bg_white.png` (nine-patch border removed), `jb-kg_security_lock_{normal,pressed,focused}.png`, `jb-sym_keyboard_return_holo.png` and `jb-ic_input_delete.png`: [framework drawable-hdpi](https://github.com/aosp-mirror/platform_frameworks_base/tree/android-4.3_r1.1/core/res/res/drawable-hdpi) at `android-4.3_r1.1`, renamed with a `jb-` prefix. The 4.3 pattern dots and emergency-call icon are byte-identical to the ICS `lock-*` files already listed.
- `jb-widget_resize_frame_holo.png` (nine-patch border removed) and `jb-widget_resize_handle_{left,top,right,bottom}.png`: [Launcher2 drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_launcher2/tree/android-4.3_r1.1/res/drawable-hdpi) at `android-4.3_r1.1`.
- `versions/4.3/assets/Roboto-Light.ttf`, `Roboto-LightItalic.ttf`, `Roboto-Bold.ttf`, `Roboto-Italic.ttf`: [AOSP frameworks/base data/fonts](https://github.com/aosp-mirror/platform_frameworks_base/tree/android-4.3_r1/data/fonts) at `android-4.3_r1`, Apache License 2.0. Used by the Play Store 4.2.3 rebuild (`jb-play.css`).
- `jbclock-*.png`: [DeskClock drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_deskclock/tree/android-4.3_r1.1/res/drawable-hdpi) at `android-4.3_r1.1`, renamed with a `jbclock-` prefix. `Roboto-Thin.ttf` and `AndroidClockMono-{Thin,Light,Bold}.ttf`: DeskClock `assets/fonts`, Apache License 2.0.

### Power menu and boot animation

`versions/{4.0.4,4.3}/assets/ga-*.png`: framework `core/res/res/drawable-hdpi` at [`android-4.0.4_r2.1`](https://github.com/aosp-mirror/platform_frameworks_base/tree/android-4.0.4_r2.1/core/res/res/drawable-hdpi) and [`android-4.3_r1.1`](https://github.com/aosp-mirror/platform_frameworks_base/tree/android-4.3_r1.1/core/res/res/drawable-hdpi): `ic_lock_power_off`, `ic_lock_airplane_mode{,_off}`, `ic_audio_vol{,_mute}`, `ic_audio_ring_notif_vibrate`, `spinner_48_{outer,inner}_holo`, `dialog_full_holo_dark` (nine-patch border removed) and, in 4.3 only, `stat_sys_adb`. All are renamed with a `ga-` prefix. `boot-android-logo-{mask,shine}.png`: framework `core/res/assets/images`. `stat_sys_ringer_{vibrate,silent}.png` and `stat_sys_alarm.png`: SystemUI `res/drawable-hdpi`. All Apache License 2.0.

`versions/{4.0.4,4.3}/assets/vol-scrubber_*.png`: each version's framework `drawable-hdpi` holo SeekBar (`scrubber_track_holo_dark` and `scrubber_primary_holo` with the nine-patch border removed, `scrubber_control_{normal,pressed,disabled}_holo`). `ga-ic_audio_ring_notif{,_mute}.png` and `ga-ic_audio_phone.png` come from the same framework directories. All Apache License 2.0.

### Launcher clings

`versions/{4.0.4,4.3}/assets/cling-*.png`: [Launcher2 drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_launcher2/tree/android-4.3_r1.1/res/drawable-hdpi) (`bg_cling1`–`3`, `cling`, `hand`, and `btn_cling_{normal,pressed}` with the nine-patch border removed), byte-identical at `android-4.0.4_r2.1` and `android-4.3_r1.1`. Apache License 2.0.

### Wi-Fi settings (4.3)

- `versions/4.3/assets/jb-ic_wps.png` and `jb-ic_menu_add.png`: [AOSP Settings drawable-hdpi](https://github.com/aosp-mirror/platform_packages_apps_settings/tree/android-4.3_r1.1/res/drawable-hdpi) at `android-4.3_r1.1`.
- `calendar-ic_menu_compose_holo_light.png` and `calendar-ic_menu_trash_holo_light.png`: [AOSP Calendar drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_calendar/tree/android-4.3_r1.1/res/drawable-hdpi) at `android-4.3_r1.1`.
- `mms-ic_send_disabled_holo_light.png`: [AOSP Mms drawable-hdpi](https://github.com/aosp-mirror/platform_packages_apps_mms/tree/android-4.3_r1.1/res/drawable-hdpi) at `android-4.3_r1.1`.
- `jb-ab_solid_shadow_holo.png` (nine-patch border removed): framework `core/res/res/drawable-hdpi` at `android-4.3_r1.1`, used under the People contact photo.
- `jb-btn_default_{normal,pressed}_holo_dark.png` and `jb-progress_{bg,primary}_holo_dark.png` (nine-patch borders removed): framework `core/res/res/drawable-hdpi` at `android-4.3_r1.1`.

Apache License 2.0.

### Live wallpapers

`versions/{4.0.4,4.3}/assets/lw-*`: [packages/wallpapers/Basic drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_wallpapers_basic/tree/android-4.3_r1.1/res/drawable-hdpi) (the Nexus pyramid background, pulse and glow; the Grass skies; the Galaxy space, flares and light; the Water pond and leaves; and the thumbnails) and [LivePicker](https://github.com/aosp-mirror-neo/platform_packages_wallpapers_LivePicker/tree/android-4.3_r1.1/res/drawable-hdpi) `livewallpaper_placeholder`. All are prefixed `lw-`. `lw-vis-*` and `lw-vis2`–`5`: [packages/wallpapers/MusicVisualization](https://github.com/aosp-mirror-neo/platform_packages_wallpapers_MusicVisualization/tree/android-4.3_r1.1/res) (the meter background, frame, needle and peak lamps, album art, the fire/ice line gradients and the thumbnails). The renderers in `live-wallpapers.js` are JavaScript/WebGL ports of the same packages' RenderScript and Java sources. Apache License 2.0.

`versions/{4.0.4,4.3}/assets/lw-phasebeam_*` (dot, beam, thumbnail) and the mesh in `live-wallpapers.js` come from PhaseBeam.apk in the Galaxy Nexus IMM76I and Nexus 4 JWR66Y factory images (`res/drawable-nodpi`, `res/raw/bgmesh.csv`), built from [packages/wallpapers/PhaseBeam](https://android.googlesource.com/platform/packages/wallpapers/PhaseBeam/+/refs/tags/android-4.3_r1), Apache License 2.0. `versions/4.3/assets/jb-wallpaper_{06,07,13,14}*` are the Nexus 4 Launcher2's wallpapers from the same JWR66Y image, scaled to the other wallpapers' size.

`versions/{4.0.4,4.3}/assets/lw-holospiral_*` and `lw-noisefield_*` (point and dot textures, thumbnails) and the Bubbles mesh in `live-wallpapers.js` come from HoloSpiralWallpaper.apk and NoiseField.apk in the same images, built from [packages/wallpapers/HoloSpiral](https://android.googlesource.com/platform/packages/wallpapers/HoloSpiral/+/refs/tags/android-4.3_r1) and [packages/wallpapers/NoiseField](https://android.googlesource.com/platform/packages/wallpapers/NoiseField/+/refs/tags/android-4.3_r1), Apache License 2.0.

The Microbes scene in `versions/{2.3.6,4.0.4}/live-wallpapers.js` re-creates Google's Microbes live wallpaper (`com.android.livewallpaper.microbesgl`, closed source, Copyright Google; Microbes.apk with `libmicrobes_jni.so` in the Nexus S GRK39F and Galaxy Nexus IMM76I images). Its four short GLSL programs are taken from that library, with only a point-size factor added. The behaviour is reimplemented from the library's code, and no image or other file is copied: `lw-microbes_thumb.png` is a capture of the simulator's own rendering. This is for this non-commercial simulator only.

`versions/2.3.6/assets/lw-*`: the same packages at [android-2.3.6_r1](https://github.com/aosp-mirror-neo/platform_packages_wallpapers_basic/tree/android-2.3.6_r1/res/drawable-hdpi) (with the 2.3.6 Nexus `pyramid_background` and thumbnail), plus `lw-magicsmoke_thumb` and `lw-smoke-noise1`–`5` from [packages/wallpapers/MagicSmoke](https://github.com/aosp-mirror-neo/platform_packages_wallpapers_magicsmoke/tree/android-2.3.6_r1/res) (the noise textures are stored as grey PNGs). The Magic Smoke renderer is a WebGL port of `clouds.rs` and `MagicSmokeRS.java`. Apache License 2.0.

### Google apps of the Nexus 4 image (4.3)

`versions/4.3/assets/chrome.png` and the other launcher icons of Google's apps that the 4.3 simulator adds are copied from the APKs in the Nexus 4 JWR66Y factory image (for example `Chrome.apk` `res/mipmap-xhdpi/app_icon.png`) by `docs/tools/image-icons.py`. They are Google's artwork and trademarks, used only to show what the 2013 phone looked like, in this non-commercial simulator. The apps themselves are project code; Chrome's screens are the KitKat simulator's, scaled to the Nexus 4.

### Nexus 4 additions (4.3)

`versions/4.3/assets/jb-stat_sys_data_fully_connected_h.png`, `jb-ic_qs_signal_full_h.png` and `jb-ic_qs_remote_display.png`: SystemUI `res/drawable-hdpi` at `android-4.3_r1.1`. `jbcam-ic_hdr.png`, `jbcam-ic_hdr_off.png` and `jbcam-ic_indicator_sce_hdr.png`: Gallery2 camera `res/drawable-hdpi` at `android-4.3_r1.1`. Apache License 2.0.

### Keyboard

`versions/{4.0.4,4.3}/assets/ime-*.png`: [AOSP LatinIME java/res/drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_inputmethods_latinime/tree/android-4.3_r1.1/java/res/drawable-hdpi) (`btn_keyboard_key_{light,dark}_{normal,pressed}_holo`, `keyboard_background_holo` with the nine-patch border removed, and `sym_keyboard_*_holo`), identical at `android-4.0.4_r2.1` and `android-4.3_r1.1`. Apache License 2.0.

## Android 2.3.6 Gingerbread assets

`versions/2.3.6/assets/gb-*` come from AOSP `android-2.3.6_r1`, using the hdpi drawables. The status bar and shade images are from [frameworks/base packages/SystemUI](https://github.com/aosp-mirror/platform_frameworks_base/tree/android-2.3.6_r1/packages/SystemUI/res/drawable-hdpi) and [core/res](https://github.com/aosp-mirror/platform_frameworks_base/tree/android-2.3.6_r1/core/res/res/drawable-hdpi). The notification icons come from:
- [Mms](https://github.com/aosp-mirror/platform_packages_apps_mms/tree/android-2.3.6_r1/res/drawable-hdpi) (`gb-app-mms-*`),
- [Calendar](https://github.com/aosp-mirror/platform_packages_apps_calendar/tree/android-2.3.6_r1/res/drawable-hdpi) (`gb-app-calendar-*`),
- [DeskClock](https://github.com/aosp-mirror-neo/platform_packages_apps_deskclock/tree/android-2.3.6_r1/res/drawable-hdpi) (`gb-app-deskclock-*`),
- [Email](https://github.com/aosp-mirror/platform_packages_apps_email/tree/android-2.3.6_r1/res/drawable-hdpi) (`gb-app-email-*`).

The 1px guide border is removed from nine-patch images. `versions/2.3.6/fonts/DroidSans.ttf` and `DroidSans-Bold.ttf` come from [frameworks/base data/fonts](https://github.com/aosp-mirror/platform_frameworks_base/tree/android-2.3.6_r1/data/fonts). Copyright The Android Open Source Project; Apache License 2.0.

App drawables carry a prefix for their source package at `android-2.3.6_r1`:
- `gb-br-*`: [Browser](https://github.com/aosp-mirror/platform_packages_apps_browser/tree/android-2.3.6_r1/res);
- `gb-cal-*`: [Calendar](https://github.com/aosp-mirror-neo/platform_packages_apps_calendar/tree/android-2.3.6_r1/res);
- `gb-em-*`: [Email](https://github.com/aosp-mirror/platform_packages_apps_email/tree/android-2.3.6_r1/res);
- `gb-g3-*`: [Gallery3D](https://github.com/aosp-mirror-neo/platform_packages_apps_gallery3d/tree/android-2.3.6_r1/res);
- `gb-cam-*`: [Camera](https://github.com/aosp-mirror/platform_packages_apps_camera/tree/android-2.3.6_r1/res). The `*-p.png` files are rotated 90° for the upright phone.
- `gb-ce-*`: [Contacts](https://github.com/aosp-mirror/platform_packages_apps_contacts/tree/android-2.3.6_r1/res);
- `gb-st-*`: [Settings](https://github.com/aosp-mirror/platform_packages_apps_settings/tree/android-2.3.6_r1/res);
- `gb-qsb-*` and `search.png` (the launcher icon): [QuickSearchBox](https://github.com/aosp-mirror-neo/platform_packages_apps_quicksearchbox/tree/android-2.3.6_r1/res);
- `gb-dl-*` and `downloads.png` (the launcher icon): [DownloadProvider ui](https://github.com/aosp-mirror/platform_packages_providers_downloadprovider/tree/android-2.3.6_r1/ui/res).

`gb-recent_dialog_background.png` and `gb-platlogo.jpg` (the PlatLogoActivity image, "Zombie art by Jack Larson") come from frameworks/base core/res. Copyright The Android Open Source Project; Apache License 2.0.

### Google apps of the Nexus S image (2.3.6)

The Nexus S simulator follows the factory image `soju-grk39f` (GRK39F). The launcher icons of its Google apps (`gmail.png`, `maps.png`, `google-search.png`, ...) are copied from the APKs in that image by `docs/tools/image-icons.py`. The Gmail 2.3.5.1 drawables `gm-*` (check boxes, stars, importance carets, message cards, action-strip and compose icons, the logo) come from the image's `Gmail.apk` (`res/drawable-hdpi*`), the Maps 5.4.0 drawables `mp-*` (header bar, zoom buttons, markers and letters, bubble, Places icons, Latitude frame, Navigation panels and turn arrows, the Latitude widget's `mp-friends_appwidget_*`, the Rate Places widget's `mp-hotpot_*`) from its `Maps.apk`, the Google Talk 1.3 drawables `tk-*` (avatar frame, chat header, compose bar, presence and menu icons, emoticons) from `Talk2.apk`, the YouTube 2.1.6 drawables `yt-*` (header, logo, menu and toolbar icons, tabs, player overlays) from `YouTube.apk`, `nw-*` (weather pictures, tabs, panels) from `GenieWidget.apk`, `bk-*` (action bars, Get eBooks, reader controls) from `BooksPhone.apk`, `ea-*` (the splash, brand and buttons) from `GoogleEarth.apk`, `vs-*` (the recognition dialog, microphone and Voice Actions icons) from `VoiceSearch.apk`, `ch-*` (cells, arrows and icons) from `CarHomeGoogle.apk`, `gv-*` (with the Inbox and Settings widgets' `gv-widget_*`) from `googlevoice.apk`, the Calendar widget's `cp-appwidget_*` from `CalendarProvider.apk`, `tg-*` from `TagGoogle.apk`, `vd-*` from `VoiceDialer.apk`, the Market widget's `mk-*` from `Vending.apk`, and `gb-btn_dropdown_normal.png` from its `framework-res.apk`. These are Google's artwork and trademarks, used only to show what the 2011 phone looked like, in this non-commercial simulator; they are not covered by this project's license. The apps' code is the project's own, and the mail is made up.

## Android 4.4.4 stock Nexus 5 launcher icons

The Google Now Launcher search plate uses the original `search_bg_transparent.9.png`,
`ic_google_small_light.png` (normal and pressed) and `ic_mic_light.png` from
`Velvet.apk` 3.3.11.1069658.arm in the Nexus 5 KTU84P factory image, copied as
`versions/4.4.4/assets/gel-*` by `docs/tools/kitkat-launcher.py`. GoogleHome
1.0.10.1069658 delegates the launcher to this APK. These assets are Google's
artwork and trademarks, used for the historical simulator; they are not covered
by the project's license. Resource paths and hashes are in
`docs/reports/kitkat-launcher-source.json`.

`versions/4.4.4` shows the stock Nexus 5 (Google Now Launcher) desktop. Two sources provide the Google app icons:
- **Google's "Android Quick Start Guide" for Android 4.4** (Copyright 2013 Google Inc.). The images embedded in the guide supply `phone.png` (Google Phone), `hangouts.png`, `gmail.png`, `photos.png`, `play-books.png`, `play-games.png`, `play-movies.png`, `play-music.png`, `calendar.png` (Google Calendar) and `google-settings.png`.
- **[Wikimedia Commons "Nexus 5 (Android 4.4.2) Screenshot.jpg"](https://commons.wikimedia.org/wiki/File:Nexus_5_(Android_4.4.2)_Screenshot.jpg)**, labelled Apache License 2.0. It served as the layout reference for the home screen. `chrome.png` is now the xxhdpi launcher icon (`res/mipmap-xxhdpi/app_icon.png`) of the Chrome 32.0.1700.99 APK (January 2014); the earlier cut-out left wallpaper on its edges.

These names and logos are trademarks of Google LLC. They are used only to show what the 2014 device looked like, in this non-commercial simulator. The AOSP launcher icons they replace are kept as `aosp-phone.png` and `aosp-calendar.png`.

The Hangouts 2.0 screens (`hangouts.js`, `hangouts.css`) were rebuilt from measurements of the GSMArena Nexus 5 review screenshots. No Google image was copied: the action bar, editor and attach icons are simple vector shapes, and `stat_notify_hangouts.png` is a white Hangouts glyph drawn for the simulator. Chrome's toolbar, menu, tab switcher and New Tab page (`chrome.js`, `chrome.css`) were rebuilt the same way from the review's browser screenshots, with vector icons. Only the Chrome launcher icon (`chrome.png`, above) is reused for the Most visited tab and new-tab cards. Google+ Photos (`photos.js`, `photos.css`) was rebuilt from the review's gallery screenshots in the same way, and shows the simulator's own illustrations. The Play Music, Play Movies & TV, Play Books and Play Games screens (`play-apps.js`, `play-apps.css`) follow 2013 screenshots from GSMArena, Android Police and Droid Life. Their covers, posters and icons are drawn by the simulator, the movies, shows and games are fictional, and the book pages are public-domain texts (Lewis Carroll 1865, Jane Austen 1813, Alexandre Dumas 1844 in its 1846 English translation, Arthur Conan Doyle 1892). The launcher icons of these apps are originals.
- **From the period APKs (xxhdpi, 144 px):**
  - `maps.png`: Google Maps 7.4.0, November 2013.
  - `keep.png`: Google Keep 2.0.35.
  - `youtube.png`: YouTube 5.2.27.
  - `news-weather.png`: News & Weather 1.3.11, November 2013.
  - `voice-search.png` and `google-search.png`: Google Search 3.1.8, November 2013.
  - `drive.png`: Google Drive 1.2.403.9, November 2013.
- **From Wikimedia Commons, rasterized at the same size:**
  - `earth.png`: ["Google Earth logo 2013.svg"](https://commons.wikimedia.org/wiki/File:Google_Earth_logo_2013.svg).
  - `google-plus.png`: ["Google Plus icon (2013-2015).png"](https://commons.wikimedia.org/wiki/File:Google_Plus_icon_(2013-2015).png).

Commons marks both Commons files as public domain. The APK icons belong to Google. Their screens (`stock-apps.js`, `stock-apps.css`) show made-up offline content. The names are trademarks of Google LLC.

## Android 5.1.1 Lollipop (Nexus 6)

The 5.1.1 build follows the Nexus 6 factory image `shamu-lmy48y` (build LMY48Y, fingerprint `google/shamu/shamu:5.1.1/LMY48Y/2364368:user/release-keys`), downloaded from Google's factory image page, and the AOSP sources at `android-5.1.1_r26`.

- **AOSP resources (Apache License 2.0):** SystemUI (`lp-sysui-*`, `lp-kg-*`, `lp-recents_*`, the navigation keys `lp-ic_sysbar_*`, the LLand easter egg `lland*`, `lp-platlogo.svg`), the framework (`lp-fw-*`, `lp-default_wallpaper.jpg`), Settings (`lps-ic_settings_*`), Launcher3 (`l3-*`) and DeskClock (`dc5-*`). The animated Quick Settings icons in `lp-qs-icons.js` are generated by `docs/tools/lp-avd.py` from SystemUI's AnimatedVectorDrawables (`res/drawable`, `res/anim`, `res/interpolator`). Behaviour and timings are ported from the matching SystemUI, framework and Launcher3 classes, which the code comments name.
- **Google app resources (property of Google LLC):** the icons and artwork of Google Dialer (`gd-*`), Gmail 5 (`gm5-*`), Google Calendar 5 (`gc5-*`), Google Camera (`gcam-*`), the Google Now Launcher and Google app (`gnl-*`, `gnow-*`), Chrome 40 (`chr40-*`), Hangouts (`hg-*`) and the notification icons `lpn-*` come from those apps' APKs in the same image. They are used to reproduce the stock Nexus 6 screens and are not covered by this project's license.
- **Interface texts:** `versions/5.1.1/lp-strings.js` is generated by `docs/tools/lp-strings.py` from the string resources of the system APKs in the image, in English, Hungarian, German, French and Spanish. Each text comes from the app that shows it. Simulator-only texts are in `docs/data/lp-strings-extra.tsv`.
- `versions/5.1.1/assets/device-nexus-6.svg` is the simulator's own drawing. Its outline and the positions of the speakers, camera and keys are traced by `docs/tools/device-frames.py` from Google's Nexus 6 device art ([Wikimedia Commons "Nexus 6.png"](https://commons.wikimedia.org/wiki/File:Nexus_6.png), from the Android Device Art Generator, CC BY 2.5). The art itself is not redistributed.
- The Android robot is reproduced or modified from work created and shared by Google and used according to terms described in the Creative Commons 3.0 Attribution License.
- Google, Android, Nexus, Gmail, Chrome, Hangouts and the other app names are trademarks of Google LLC. This simulator is unofficial and is not connected to Google services.

### Downloads (4.0.4, 4.3)

`versions/{4.0.4,4.3}/assets/dl-*` (Holo check boxes, expanders, action-mode and menu icons) come from `framework-res.apk` of the Galaxy Nexus IMM76I and Nexus 4 JWR66Y images, `dl-ic_download_misc_file_type.png` and the `downloads.png` launcher icon from their `DownloadProviderUi.apk`. Copyright The Android Open Source Project; Apache License 2.0.

`versions/{4.3,4.4.4}/assets/calendar-spinner_*_holo_light.png` and `ic_ab_back_holo_light.png` are framework-res.apk nine-patches and icons of the Nexus 4 JWR66Y and Nexus 5 KTU84P images (the KitKat ones from their `_am` auto-mirrored drawables), AOSP, Apache License 2.0. `versions/{4.3,4.4.4,5.1.1}/dtp.js` / `dtp.css` re-create AOSP `frameworks/opt/datetimepicker` (Apache License 2.0) from the resources of each image's Calendar.

`versions/4.0.4/assets/calendar-spinner_*_holo_light.png` and `ic_ab_back_holo_light.png` are framework-res.apk nine-patches and icons of the Galaxy Nexus IMM76I image (AOSP, Apache License 2.0).

`versions/5.1.1/assets/pm58-*` (Music2.apk; the PlayDrawer's default cover and avatar among them), `mv36-*` (Videos.apk; its PlayDrawer cover and avatar are shared with Books.apk), `bk33-*` (Books.apk), `ed-*` (EditorsDocs.apk, shared by Sheets and Slides), `ns33-*` (Newsstand.apk), `pg22-*` (PlayGames.apk), `ea8-*`, `nw2-*`, `kp3-*`, `mp9-*`, `dr2-*`, `yt10-*`, `gp49-*` and `vn4-*` (Velvet.apk, the Google Now header pictures among them) come from GoogleEarth.apk, PrebuiltNewsWeather.apk, PrebuiltKeep.apk, Maps.apk, Drive.apk, YouTube.apk and PlusOne.apk of the Nexus 6 LMY48Y image. `versions/4.4.4/assets/pm52-*` (Music2.apk; the play card frame, drawer toggle and search icon are shared with Videos.apk), `mv3-*` (Videos.apk), `bk3-*` (Books.apk), `pg1-*` (PlayGames.apk), `ns-*` (Magazines.apk, Play Newsstand), `vn3-*` (the Google Now header pictures among them), `mp7-*` (Maps.apk), `kp2-*` (Keep.apk), `yt5-*` (YouTube.apk), `dr-*` (Drive.apk), `gp42-*` (PlusOne.apk), `nw-*`, `ea7-*` and `gms-*` come from Velvet.apk, GenieWidget.apk, GoogleEarth.apk (and the framework's search icon) and PrebuiltGmsCore.apk of the Nexus 5 KTU84P image. `versions/4.3/assets/kp-*` come from Keep.apk, `yt4-*` from YouTube.apk, `mp6-*` from Maps.apk, `gp4-*` from PlusOne.apk, `ea7-*` from GoogleEarth.apk `vn-*` (the Google Now header pictures among them) from Velvet.apk and `nw-*` from GenieWidget.apk (The Weather Channel's logo among them) `gms-*` from PrebuiltGmsCore.apk `msg-*` from PlusOne.apk (Messenger), `mag-*` from Magazines.apk, `wal-*` from Wallet.apk, `ms-*` from VideoEditorGoogle.apk (AOSP VideoEditor, Apache License 2.0), `nav-*` and `loc-*` from Maps.apk (Navigation's tiles, Local's bars, categories and map), `bk28-*` from Books.apk (the play card frame, overflow and drawer toggle, which Music2.apk shares), `pm5-*` from Music2.apk and `mv25-*` from Videos.apk (the framework's search icon among them) of the Nexus 4 JWR66Y image; they are Google's artwork, used only to show what the phone looked like. `versions/*/stock-strings.js` holds the stock Google apps' texts from the same images.

`versions/{4.0.4,4.3}/assets/music-ic_mp_playlist_recently_added_list.png` comes from AOSP `packages/apps/Music` (android-4.0.4_r2.1 / android-4.3_r1.1, Apache License 2.0), and `ic_sysbar_menu.png` from SystemUI.apk of the Galaxy Nexus IMM76I and Nexus 4 JWR66Y images; `music-strings.js` holds that AOSP Music's texts.

`versions/{4.0.4,4.3,4.4.4}/assets/ce-*` (editor field buttons, expanders, section divider, account spinner icon, default picture, star and done icons) come from Contacts.apk of the Galaxy Nexus IMM76I, Nexus 4 JWR66Y and Nexus 5 KTU84P images (AOSP, Apache License 2.0).

`versions/4.4.4/assets/pc-ic_menu_overflow.png` (the contact editor's overflow) is framework-res.apk's `drawable-xxhdpi/ic_menu_moreoverflow_normal_holo_light.png` of the Nexus 5 KTU84P image.

`versions/4.0.4/assets/lng-ic_sysbar_quicksettings.png` and `lng-ic_menu_add.png` come from Settings.apk of the Galaxy Nexus IMM76I image (AOSP, Apache License 2.0).

`versions/4.0.4/assets/ea6-*` come from GoogleEarth.apk (and the framework's search icon), `nav-*`, `loc-*` and `mp6-*` from Maps.apk, `nw-*` from GenieWidget.apk (The Weather Channel's logo among them), `msg-*` from PlusOne.apk and `ms-*` from VideoEditorGoogle.apk (AOSP, Apache License 2.0) of the Galaxy Nexus IMM76I image. `versions/4.0.4/assets/ga-*` are the action bar and screen drawables of the Galaxy Nexus IMM76I image's Google apps: `ga-yt-*` from YouTube.apk (3.5.5), `ga-gp-*` from PlusOne.apk, `ga-tk-*` from Talk.apk, `ga-bk-*` from BooksTablet.apk, `ga-mv-*` from Videos.apk, `ga-lat-*` from Maps.apk, `ga-qsb-*` from GoogleQuickSearchBox.apk, `ga-vd-*` from VoiceDialer.apk (AOSP, Apache License 2.0) and `ga-fw-*` from its framework-res.apk (AOSP, Apache License 2.0). `versions/{4.3,4.4.4}/assets/nw-navigation_refresh.png` comes from GenieWidget.apk (News & Weather 1.3.11) of the Nexus 4 JWR66Y and Nexus 5 KTU84P images, `versions/5.1.1/assets/nw-*` from PrebuiltNewsWeather.apk (News & Weather 2.2) of the Nexus 6 LMY48Y image. The Google app artwork is Google's, used only to show what the phones looked like, in this non-commercial simulator.

## Android 6.0.1 preview (Nexus 5X)

- `versions/6.0.1/assets/device-nexus-5x.svg` is the simulator's own drawing. Its outline and the positions of the earpiece and loudspeaker slots, the front camera and the keys are traced by `docs/tools/device-frames.py` from LG's Nexus 5X press image ([Wikimedia Commons "Nexus 5X (White).jpg"](https://commons.wikimedia.org/wiki/File:Nexus_5X_(White).jpg), LG Electronics, CC BY 2.0). The image itself is not redistributed.
- The recovery picture on `versions/6.0.1/` (the Android robot with an open hatch and a turning icosahedron) is the simulator's own drawing, as on the earlier 5.1.1 preview. The Android robot is reproduced or modified from work created and shared by Google and used according to terms described in the Creative Commons 3.0 Attribution License.
- `versions/6.0.1/assets/Roboto-Regular.ttf` is the same file as `versions/5.1.1/assets/Roboto-Regular.ttf` (the Nexus 6 LMY48Y image's system font, Apache License 2.0).
- `versions/6.0.1/fonts/DroidSansMono.ttf`, `NotoSerif-Regular.ttf`, `CutiveMono.ttf`, `ComingSoon.ttf`, `DancingScript-Regular.ttf` and `CarroisGothicSC-Regular.ttf` are the Nexus 5X MTC20K image's `/system/fonts` files that `fonts.xml` names for the caption typefaces (monospace, serif, serif-monospace, casual, cursive, sans-serif-smallcaps). Droid Sans Mono and Coming Soon: Apache License 2.0; Noto Serif, Cutive Mono, Dancing Script and Carrois Gothic SC: SIL Open Font License 1.1.

## Android 7.1.2 preview (Nexus 6P)

- `versions/7.1.2/assets/device-nexus-6p.svg` is the simulator's own drawing (`docs/tools/device-frames.py`). Its outline, the corners and the positions of the display, the two loudspeaker slots, the front camera and the keys are measured on a front view of the Nexus 6P ([Wikimedia Commons "Nexus 6P 模型.png"](https://commons.wikimedia.org/wiki/File:Nexus_6P_%E6%A8%A1%E5%9E%8B.png), April.Kai, CC BY-SA 4.0); the proportions were checked against [Wikimedia Commons "Huawei Google Nexus 6P smartphone (24681191233).jpg"](https://commons.wikimedia.org/wiki/File:Huawei_Google_Nexus_6P_smartphone_(24681191233).jpg) (Andri Koolme, CC BY 2.0). Neither image is redistributed.
- The recovery picture on `versions/7.1.2/` (the Android robot with an open hatch and a turning icosahedron) is the simulator's own drawing, as on the 6.0.1 preview. The Android robot is reproduced or modified from work created and shared by Google and used according to terms described in the Creative Commons 3.0 Attribution License.
