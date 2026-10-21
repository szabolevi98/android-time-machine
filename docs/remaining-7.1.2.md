# Remaining work for the full 7.1.2 release

Owner authorization 2026-10-20: continue until the version is fully built; commit and push validated milestones.
Latest owner instruction 2026-10-21: continue; usage limit does not apply. This explicitly suspends the earlier 18% stop threshold until the user reinstates a limit.
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
- [x] Drive 2.4.452: files/provider, sharing, audio/video preview, scan preferences/PDFs, native widget, cache and notification/legal/backup routes. Help stays in the shared service activity checklist below.
- [x] YouTube 11.41.56: native home/tabs, watch/mini-player, search/history, reactions/subscriptions, playlists, local upload/edit/delete, settings, captions and licenses. Shared Help and dedicated media SEND receivers remain below.
- [x] Play Store 7.4.31: offline storefront/search, install/update/cancel, My apps/library, wishlist/reviews, account empty states, settings/content PIN, licenses and all three native widget providers.
- [x] Play Music 6.13: native light toolbar/library, local MediaStore audio, playlists, queue/player, background notification, sleep timer/settings, AudioPreview, both widgets and all three launcher shortcuts. MusicFX controls remain below.
- [x] Play Movies 3.20: onboarding, Watch now, drawer, library tabs, shared wishlist, search, trailer player, settings/captions/parental controls/licenses.
- [x] Play Games 3.7.24: tutorial, Gamer ID setup, Play Now, My Games, Notifications, Players, Explore, game/player detail, settings.
- [x] Android Pay 1.4: splash, speed dial, OCR/manual card form, verification states, how-to, details/removal, settings.
- [x] Project Fi: activation sign-up page, account chooser, web sign-up (no Fi account on the demo phone).
- [x] Device Policy 7.05: the no-work-account page with Add account.
- [x] Help/feedback (GoogleHelp + Google Feedback for every caller).
- [x] Print preview (Save as PDF, options, All printers) from Cloud Print, Gmail and GoogleHelp.
- [x] Google settings (GmsCore) and Location History.
- [ ] Daydream/GoogleVrCore, Live Wallpaper Picker, Nougat Easter egg.

## System and remaining details

- [ ] Split-screen/docked stack in Overview.
- [ ] Bundled notifications.
- [x] Launcher shortcut popup / pinning, provider picker / drag placement, wallpaper picker and home settings.
- [ ] Remaining widget provider implementations and configuration activities. All 18 enabled providers are listed
      with native previews; digital/analog Clock and Google Search/Feed run. Calendar schedule/month, Chrome bookmarks,
      both Messenger widgets, Gmail, Project Fi and
      Sound Search still show an explicit not-built marker after placement. Complete them as their apps are finished.
      Drive now has its native widget with account configuration, upload/scan/create actions and cancellation cleanup.
      Play Store's small rotating card, recommendation refresh/dismiss and My Library widgets are implemented;
      configuration preserves the placement page and cleans up a cancelled new widget.
      Play Music's five-control widget (small/large layouts) and I'm Feeling Lucky widget use the shared player.
      Static shortcuts for later apps already carry their source shortcut ID through `shortcut:<id>`.
- [ ] Camera guided panorama / Photo Sphere / Lens Blur, Smartburst, volume key action.
- [ ] Photos native CPE preset catalogue investigation and final polish.
- [x] Chrome site settings category pages, per-site permissions, exceptions and reset.
- [ ] Calendar Goal flow and any service-backed activity still left as a not-built card.
- [ ] App info Clear data: connect the current storage-usage flags to each app's actual saved model and cancel stale work.
- [ ] MusicFX's full effect-control panel. Play Music currently exposes its native unavailable-effects response because the simulated media clock has no DSP session.
- [ ] Widget resize handles and minimum sizes from each provider's resize flags.
- [ ] ACTION_SEND video/audio dedicated Hangouts/Messenger/Photos receivers; preserve media metadata and native MIME target filtering. PDF streams and image-to-Messenger attachment delivery are connected.
- [ ] Preference leaf/intent routing audit: finish service-backed and non-toggle rows that still lack a click handler.
- [ ] Sweep all direct `missing(...)` branches and external activity routes; no unfinished card may remain at release.

## Release gate

- [ ] Demo-data checklist on a fresh phone, upgrades and saved state.
- [ ] Desktop and phone browser flows, five-language sweep, missing-asset/text checks.
- [ ] Full module suite and source inventory regeneration (run regeneration separately from tests/browser: it temporarily rewrites boot assets).
- [ ] Landing screenshot, features-7.1.2.md, README, catalogue available, sitemap.
- [ ] Commit and push release; verify clean relevant working tree and remote state.
