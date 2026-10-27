# Demo data

Every version starts as a phone someone already uses: the same people, the same short conversations, a few
appointments and pictures. This is the simulator's own content (not from the factory images), kept the same across
versions so that moving between them feels familiar. A new version (for example 7.1.2) should start with all of it;
the checklist at the end is the short form.

The image decides the look and behaviour; the demo data only fills it. Texts that are web or message content stay in
English like the sites and people themselves; the simulator's own notification texts are translated (hu, de, fr, es).

## The people

| Contact | Phone | E-mail | Notes |
|---|---|---|---|
| Alex Morgan | 202-555-0148 | alex@example.com | the coffee and the hike; groups: Friends |
| Sam Rivera | 202-555-0192 | sam@example.com | the hike photos (Hangouts); groups: Friends |
| Taylor Lee | 202-555-0116 | taylor@example.com | the meetup slides; groups: Friends |
| Mom | 202-555-0107 | mom@example.com | starred (favourite); groups: Family |

The account: `<device>.demo@gmail.com` (6.0.1: nexus5x.demo@gmail.com). Carrier: Telekom (APN internet.telekom).

## By app

- **Phone, call log:** yesterday an incoming call from Mom (12:34 long), 3 hours ago a missed call from Alex, then the
  call back to Alex (2:12).
- **Messages (SMS):** Alex: "Hey! Are we still on for coffee tomorrow?" — me: "Absolutely. See you at 11!" (about an
  hour ago); Mom, yesterday: "Don’t forget to call this weekend ☺". A demo contact answers a new text once a session,
  4.5 s after it was sent (6.0.1: Messenger and Hangouts; texts own:sim_reply_1…3).
- **Hangouts (4.3 and later):** Sam, yesterday: "The photos from the hike are up!" — me: "They look amazing 😀".
- **Notifications on a new phone:** "Welcome to Android <x.y>" / "Your <device> is ready to explore." and "New message
  from Alex" / "See you at 11!" (opens the Alex thread). Every version (2.1 since 2026-10-19, owner's decision).
- **E-mail / Gmail:** 2.3.6–5.1.1: one "Welcome to Android" mail from the Android Team. 6.0.1 and 7.1.2 Gmail: Alex "Hike on
  Saturday?", Taylor "Slides for Monday", Mom "Sunday lunch", Sam "Photos from the trip", Tech News newsletter.
- **Calendar:** today 11:00 "Coffee with Alex". 6.0.1 adds Sunday "Sunday lunch at Mom’s" (12:30, Bring dessert),
  Saturday "Hike with Alex" (8:00, Ridge trail), in 9 days "Meetup slides due" (all day).
- **Clock:** 7:00 alarm switched on (status bar alarm icon), 8:30 off. 6.0.1: 7:00 weekdays on, plus DeskClock's own
  8:30 weekdays and 9:00 weekend, off. 2.1: the same 7:00 weekday alarm on, beside AlarmProvider's two. The home screen clock widget is on from 4.0.4
  on (owner's rule; not on 2.1 and 2.3.6 on purpose).
- **Photos / Gallery:** four pictures (Mountain afternoon, City lights, By the sea, Sunset as drawn gradients; 6.0.1:
  four seeded drawings, the last a panorama, two days and nine days old).
- **Keep (4.3–5.1.1; 6.0.1 and 7.1.2 as an app installed from Play):** "Buy concert tickets", "Groceries: milk, eggs, lollipops", "Call Mom on Sunday".
- **Fit (5.1.1; 6.0.1 and 7.1.2 as an app installed from Play):** walking 9 min at 8:05, biking 4 min at 12:40,
  walking 5 min at 17:30 against a 30 min goal (6.0.1 / 7.1.2: a time still to come today falls on yesterday).
- **Play Books (4.3–5.1.1's Play apps; 6.0.1 and 7.1.2 as an app installed from Play):** four public-domain openings,
  Alice's Adventures in Wonderland, Pride and Prejudice, The Three Musketeers, The Adventures of Sherlock Holmes.
- **News & Weather (5.1.1; 6.0.1 and 7.1.2 as an app installed from Play):** the Riverside weather card; 5.1.1 has its own
  stories, 6.0.1 / 7.1.2 eight short made-up ones under Headlines, Technology and Sports.
- **Browser / Chrome bookmarks:** Google, Android, the Wikipedia Android article.
- **Google Now:** weather card "Riverside 18°, partly cloudy" and the next Calendar event.
- **Wi-Fi:** the saved network (5.1.1: AndroidAP; 6.0.1: Home Network) and nearby AndroidAP, CoffeeShop, Library
  Wi-Fi. **Bluetooth:** a headset that pairs (per version's own list).

The 7.1.2 Nexus 6P demo keeps its original Marshmallow wallpaper as a saved
image after an imagined OTA update (owner decision, 2026-10-23). New profiles
start with the green coast image from the Nexus 6P MDB08K framework; N2G48C's
pink default and four bundled images remain available. Existing saved home
and lock wallpapers are preserved. This deliberately models a used phone,
not the wallpaper state after a clean 7.1.2 factory flash.

## The offline web

The browser reaches a small invented web of its year (no network): www.google.com (home and results),
www.android.com (that version's Android), the Wikipedia Android article, news.example (Tech News) with an article on
the version's phone, retro.example ("the <year> Web") with a page on the version, maps.example (a drawn sample map).
6.0.1 also has the My Account pages and www.google.com/history/now (Now card history). Footer: "Offline demo pages ·
<year>".

## Checklist for a new version

1. The four contacts (names, numbers, e-mails, Mom starred, Friends / Family groups).
2. The call log (Mom yesterday, Alex missed and called back).
3. The Alex coffee thread and Mom's message; Sam's Hangouts chat if Hangouts is on the image.
4. The two first-boot notifications, translated, the message one opening Alex's thread.
5. Mail in the image's mail app (at least the welcome mail; the Gmail set from 6.0.1 is preferred).
6. Calendar: Coffee with Alex today 11:00, plus the 6.0.1 events.
7. The 7:00 alarm switched on, so the status bar shows the alarm icon; the clock widget on the home screen.
8. Four photos.
9. Chrome bookmarks (Google, Android, Wikipedia) and the offline web pages of the year.
10. Google Now weather and next event; Wi-Fi networks, Bluetooth headset, Telekom.
11. The demo replies (a text answered once a session after 4.5 s).
