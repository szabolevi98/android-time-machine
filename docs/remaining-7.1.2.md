# Remaining work for the full 7.1.2 release

Owner authorization 2026-10-20: continue until the version is fully built; commit and push validated milestones.
Latest user limit 2026-10-21: monitor the Codex 300-minute usage window; stop work when remaining usage reaches 18% (usedPercent >= 82), and wait for the user's explicit permission to continue. This replaces the earlier 22% limit and its temporary suspension. Check before work and regularly between bounded work batches.
The source and completion rules remain in plan-7.1.2.md. This is a concrete continuation checklist, not a replacement scope.

## Completed milestones

- [x] Camera integration and lifecycle (`b5496458`). Advanced capture sequences below remain.
- [x] Photos library, viewer, albums, trash and basic CPE (`8c4d7f56`). Native preset catalogue below remains.

## Applications and connected activities

- [x] Documents / Files / Downloads; pick/save intents; Gmail attachments.
- [x] Emergency information, Contacts picker, keyguard-protected editing.
- [x] Gboard editor and native preferences milestone; advanced items below remain.
- [x] Google app 6.5.36: search, voice examples, Now, screen search (Now on Tap), launcher settings.
- [ ] Gboard 6.0.84 and input method settings; TalkBack and relevant Settings external activities.
      Core IME, layouts/accents/emoji, light/dark themes and preferences are implemented. Remaining:
      predictive/glide dictionary decoding, inline search access point, additional native theme packages,
      TalkBack and other enabled external input/settings activities.
- [x] Maps 9.34.1 and Messenger's location chooser.
- [x] Hangouts 12.0 and demo replies.
- [ ] Drive 2.4.452: core file/share/provider/scan/widget milestone implemented; finish audio/video viewers, scan preference effects, account backup/activity/help routes and remaining native preference leaves.
- [ ] YouTube 11.41.56.
- [ ] Play Store 7.4.31 with offline storefront/install/My apps.
- [ ] Play Music 6.13, Play Movies 3.20, Play Games 3.7.24.
- [ ] Android Pay 1.4, Project Fi, Device Policy 7.05.
- [ ] Google Play services settings, Location History, Help/feedback, print preview.
- [ ] Daydream/GoogleVrCore, Live Wallpaper Picker, Nougat Easter egg.

## System and remaining details

- [ ] Split-screen/docked stack in Overview.
- [ ] Bundled notifications.
- [x] Launcher shortcut popup / pinning, provider picker / drag placement, wallpaper picker and home settings.
- [ ] Remaining widget provider implementations and configuration activities. All 18 enabled providers are listed
      with native previews; digital/analog Clock and Google Search/Feed run. Calendar schedule/month, Chrome bookmarks,
      both Play Music widgets, both Messenger widgets, Gmail, Project Fi, all three Play Store widgets and
      Sound Search still show an explicit not-built marker after placement. Complete them as their apps are finished.
      Drive now has its native widget with account configuration, upload/scan/create actions and cancellation cleanup.
      Static shortcuts for later apps already carry their source shortcut ID through `shortcut:<id>`.
- [ ] Camera guided panorama / Photo Sphere / Lens Blur, Smartburst, volume key action.
- [ ] Photos native CPE preset catalogue investigation and final polish.
- [x] Chrome site settings category pages, per-site permissions, exceptions and reset.
- [ ] Calendar Goal flow and any service-backed activity still left as a not-built card.
- [ ] App info Clear data: connect the current storage-usage flags to each app's actual saved model and cancel stale work.
- [ ] Widget resize handles and minimum sizes from each provider's resize flags.
- [ ] Preference leaf/intent routing audit: finish service-backed and non-toggle rows that still lack a click handler.
- [ ] Sweep all direct `missing(...)` branches and external activity routes; no unfinished card may remain at release.

## Release gate

- [ ] Demo-data checklist on a fresh phone, upgrades and saved state.
- [ ] Desktop and phone browser flows, five-language sweep, missing-asset/text checks.
- [ ] Full module suite and source inventory regeneration (run regeneration separately from tests/browser: it temporarily rewrites boot assets).
- [ ] Landing screenshot, features-7.1.2.md, README, catalogue available, sitemap.
- [ ] Commit and push release; verify clean relevant working tree and remote state.
