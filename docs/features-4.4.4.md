# Android 4.4.4 KitKat (Nexus 5) – features

[← Back to the README](../README.md)

`versions/4.4.4/` is Android 4.4.4 (build KTU84P, AOSP tag `android-4.4.4_r1`) on the Nexus 5, with its own saved data. It shows the stock Nexus 5: the Google Now Launcher, Google Now, Hangouts, Chrome, Gmail and Google+ Photos, which are not in AOSP and were rebuilt from 2013–2014 screenshots and Google's Android 4.4 Quick Start Guide. The drawer holds what the KTU84P factory image's launcher shows after setup: there is no AOSP Browser, Messaging or Music (Chrome, Hangouts with SMS and Play Music stand in), and Cloud Print stays hidden as on the phone. References and measurements are in [docs/visual-audit-4.4.md](visual-audit-4.4.md).

- **Nexus 5 and system bars:**
  - The frame is traced from Google's render.
  - The bars are translucent with gradients on the launcher and keyguard, and opaque in apps.
  - White status icons, the BatteryMeterView and the KitKat navigation keys.
- **Google Now Launcher (Launcher3):** the 4 × 4 Nexus 5 grid, the "Say “Ok Google”" search bar, the Google folder and Play Store, and the Phone / Hangouts / apps / Chrome / Camera dock.
  - Google Now is the leftmost screen, with weather, the next calendar event and the "Ok Google" tip card.
  - Dynamic pages: an empty page appears while you drag and is removed afterwards.
  - The two-screen default wallpaper pans with the pages.
  - All apps has no tabs and no widget pages. Folders are white.
  - Long-press opens the overview with Wallpapers, Widgets and Settings. Widgets open from there. The Launcher3 clings show on first run.
- **Wallpaper picker:**
  - It is fullscreen with the *Set wallpaper* bar.
  - The strip offers Pick image (through DocumentsUI "Open from"), the default wallpaper, the Google Now Launcher's eight bundled wallpapers, saved images and Sun Beam, the Nexus 5's only live wallpaper (Phase Beam in orange, redrawn in WebGL from its RenderScript and the APK's shaders).
  - Long-press a saved image to delete it.
  - Settings → Display → Wallpaper lists Gallery, Live Wallpapers, Photos and Wallpapers, as the KTU84P image registers them.
- **Keyguard:** the thin centred clock, the date and alarm row, and the Home-only navigation bar.
- **Notification panel:** 4.4 artwork, white Quick Settings icons, the battery tile and the Location tile.
- **Settings:** Tap & pay, Location modes, Printing, the default SMS app and Nexus 5 About phone. Tap Android version for the KitKat K and logo; long-press it for the immersive Dessert Case, which then becomes a daydream.
- **Phone and People:**
  - The 4.4 Dialer has speed-dial tiles with letter tiles, the search box, the recent call card and the white dialpad, plus History with All / Missed.
  - The in-call screen has the flat red end button.
  - People uses light bars, icon tabs and letter tiles.
- **Clock:** expandable alarm cards with day toggles and the dark radial time picker. Timers have the round add button.
- **Downloads:** the DocumentsUI view of the Downloads root.
- **Email:** the 4.4 Email, now built on UnifiedEmail.
  - A folder drawer, letter-tile conversation rows and selection through the sender image.
  - The conversation view with Reply / Reply all / Forward.
  - Compose with Cc/Bcc and attachments.
- **Google Play Store 4.5.10, the image's own:** rebuilt from its Phonesky.apk (texts, icons, colours, sizes and menus).
  - The side drawer (Store home, My apps, My wishlist, Redeem); Settings and Help in the overflow menu.
  - The corpus links with Newsstand, clusters with their MORE box, the details page with the fixed summary, *Rate this app* for installed apps and the *Rate it!* dialog.
  - The permissions dialog with the system's permission groups, My apps, the wishlist and the settings (auto-update, shortcuts, content filtering, password).
- **Hangouts 2.0:** the SMS app, with the conversation list, the New Hangout picker and SMS conversations of white cards. Notifications and shares open it.
- **Gmail 4.7:** Primary with the Social / Promotions category rows, the label drawer, personal level markers, Archive and a separate offline account.
- **Play Music, Play Movies & TV, Play Books, Play Games (late 2013):** coloured action bars, drawers and cards. Music plays the simulator's tracks with Now playing and the queue, Movies has a player, Books has a reader with public-domain openings, and Games has achievements.
- **The rest of the stock drawer:** Google (Now), Voice Search, Maps, Drive, Keep, YouTube, Google+, Earth, News & Weather and Google Settings, each with a simple 2013-style screen. The Google folder holds GSMArena's launch set of 11 apps.
- **Earth 7.1.3:** the Blue Marble globe (drag, zoom, double tap), Search, Reset to north, My location, Share to Hangouts and Settings (settings.xml: account, cache, text size, image quality, sensors, Imagery Visibility, HTTPS, Google location settings, databases, About).
- **Google+ 4.2.3 New post and Settings:** Photo, Location and Write open the share box (text, picture, location); the post goes to the top of the stream and is kept, with Delete; Back offers Discard. Settings is main_preferences.xml with Notifications (notifications, ringtone, vibrate).
- **Google+ Photos:** CAMERA / HIGHLIGHTS tabs, the Folders view and a black viewer with share, delete and set-as-wallpaper.
- **Chrome 31:** the omnibox toolbar, the menu with Back / Forward / Bookmark, the stacked tab switcher, the New Tab page (Most visited, Bookmarks, Other devices), incognito tabs and history. Its tabs are kept separate from the AOSP Browser.
- Camera (the arc quick settings that the Nexus 5 shipped with), Gallery and Calendar match their 4.3 versions, as in AOSP. Play Newsstand 3.0.1, Quickoffice 6.3.1 and Wallet 2.0 open simple screens with their own icons and labels. All screens have been checked in English, Hungarian, German, French and Spanish.
