# Remaining work for the full 7.1.2 release

Owner authorization 2026-10-20: continue until the version is fully built; commit and push validated milestones.
User limit 2026-10-21: monitor the Codex 300-minute usage window; stop work when remaining usage reaches 22% (usedPercent >= 78), and wait for the user's explicit permission to continue. Check before work and regularly between bounded work batches.
The source and completion rules remain in plan-7.1.2.md. This is a concrete continuation checklist, not a replacement scope.

## Completed milestones

- [x] Camera integration and lifecycle (`b5496458`). Advanced capture sequences below remain.
- [x] Photos library, viewer, albums, trash and basic CPE (`8c4d7f56`). Native preset catalogue below remains.

## Applications and connected activities

- [x] Documents / Files / Downloads; pick/save intents; Gmail attachments.
- [x] Emergency information, Contacts picker, keyguard-protected editing.
- [x] Gboard editor and native preferences milestone; advanced items below remain.
- [ ] Google app 6.5.36: search, voice, Now, Now on Tap, launcher settings.
- [ ] Gboard 6.0.84 and input method settings; TalkBack and relevant Settings external activities.
      Core IME, layouts/accents/emoji, light/dark themes and preferences are implemented. Remaining:
      predictive/glide dictionary decoding, voice/search access points, additional native theme packages,
      TalkBack and other enabled external input/settings activities.
- [ ] Maps 9.34.1 and Messenger's location chooser.
- [ ] Hangouts 12.0 and demo replies.
- [ ] Drive 2.4.452 and shared/uploaded files.
- [ ] YouTube 11.41.56.
- [ ] Play Store 7.4.31 with offline storefront/install/My apps.
- [ ] Play Music 6.13, Play Movies 3.20, Play Games 3.7.24.
- [ ] Android Pay 1.4, Project Fi, Device Policy 7.05.
- [ ] Google Play services settings, Location History, Help/feedback, print preview.
- [ ] Daydream/GoogleVrCore, Live Wallpaper Picker, Nougat Easter egg.

## System and remaining details

- [ ] Split-screen/docked stack in Overview.
- [ ] Bundled notifications.
- [ ] Launcher long-press shortcuts, widgets picker, wallpaper picker and home settings.
- [ ] Camera guided panorama / Photo Sphere / Lens Blur, Smartburst, volume key action.
- [ ] Photos native CPE preset catalogue investigation and final polish.
- [ ] Chrome site settings category pages.
- [ ] Calendar Goal flow and any service-backed activity still left as a not-built card.
- [ ] Sweep all direct `missing(...)` branches and external activity routes; no unfinished card may remain at release.

## Release gate

- [ ] Demo-data checklist on a fresh phone, upgrades and saved state.
- [ ] Desktop and phone browser flows, five-language sweep, missing-asset/text checks.
- [ ] Full module suite and source inventory regeneration (run regeneration separately from tests/browser: it temporarily rewrites boot assets).
- [ ] Landing screenshot, features-7.1.2.md, README, catalogue available, sitemap.
- [ ] Commit and push release; verify clean relevant working tree and remote state.
