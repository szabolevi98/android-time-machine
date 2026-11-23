# Kiadás utáni audit — 2026-11-23

Vizsgált commit: `f5822f94` (a VPS-en élő állapot). Mind a nyolc verzió, angol felülettel, friss mentéssel.

Szempontok (a tulajdonos kérése): mi van meg az egyik verzióban és hiányzik vagy „nem része a szimulátornak” egy
másikban; hibák a működésben vagy a megjelenésben. Az ismert, szándékos korlátok (Play Store vásárlás/letöltés,
Help/Feedback/Terms webes oldalak, valódi fiók, fizetés, hálózat) nem szerepelnek hibaként.

## Hogyan készült

- **Bejárás minden verzióban:** minden indítóban lévő app megnyitva, az első képernyő minden vezérlője megnyomva
  (frissen nyitott appban egyenként), és minden menü minden pontja, amit egy vezérlő megnyit. 2 634 vezérlő,
  asztali szélességen (1280 px). Rögzítve: a megjelenő toastok, „Not built yet” képernyők, JavaScript-kivételek,
  sikertelen helyi kérések, `undefined` / `NaN` / `%s` / `null` a szövegben, törött képek, vízszintes túlcsordulás,
  és a semmit sem változtató gombok.
- **Mély bejárás a moduláris verziókon** (2.1, 6.0.1, 7.1.2) a projekt `tests/browser/fallback-audit.mjs`-ével:
  a teljes Beállítások-fa, a widgetek, a gyorsbeállítás-panelek és az app-beállítás XML-ek.
- **Képernyőképek:** minden app első képernyője asztali és telefonos (390 × 844) szélességen, verziónként egy
  áttekintő lapon átnézve; a gyanús képernyők külön, nagy felbontásban újra.
- **Fordítás:** `docs/tools/text-check.mjs` hu, de, fr, es nyelven minden verzióra.
- Minden alább hibaként szereplő pontot külön, kézzel is reprodukáltam; a téves riasztásokat a végén sorolom fel.

## Összkép

| | 2.1 | 2.3.6 | 4.0.4 | 4.3 | 4.4.4 | 5.1.1 | 6.0.1 | 7.1.2 |
|---|---|---|---|---|---|---|---|---|
| Appok | 25 | 30 | 31 | 37 | 32 | 35 | 34 | 34 |
| Vezérlők az első képernyőkön | 207 | 277 | 328 | 433 | 403 | 358 | 272 | 356 |
| JS-kivétel / sikertelen kérés | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| Hibás szöveg / törött kép | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| „Nem része” az első két szinten¹ | 0 | 1 | 22 | 57 | 38 | 33 | 1 | 2 |

¹ Különböző vezérlők száma, a Help / Feedback / Terms / vásárlás menüpontokkal együtt.

## 1. Megjelenési hiba

### 1.1 5.1.1: a Newsstand listája 300 dp-nél levágódik — **javítandó**

A Newsstand „Read Now” oldalán csak az első kártya és a második képének teteje látszik, alatta üres a képernyő; a
harmadik cikk nem érhető el (asztali és telefonos szélességen is). Ok: a `versions/5.1.1/play-apps.css` 327. sora,
`.lpx-list{overflow-y:auto;max-height:calc(300 * var(--dp))}`, a Play-appok párbeszédablakának listájához készült
(`57238006`), de nincs a `.lpx-dialog`-ra szűkítve, így minden `.lpx-list`-et 300 dp-re korlátoz, a teljes képernyős
listákat is (`lp-extra-apps.css` ott `flex:1`-et ad). Ugyanez a lista van a 5.1.1 Docs / Sheets / Slides
fájllistáján, keresésén és találati listáján; ott most egy-egy fájl van, ezért ott nem feltűnő.
Javítás: a szabály `.lpx-dialog .lpx-list`-re szűkítése.

### 1.2 5.1.1 Maps: a mikrofon gomb akadálymentességi címkéje „Search” — apróság

A keresőmező melletti mikrofon (`sa-unsupported`) `aria-label`-je „Search”, holott hangalapú keresés; megnyomva
„nem része a szimulátornak”. A szöveges keresés működik.

### 1.3 5.1.1 Earth: a „Reset to north” fordítás nélkül — apróság

A `text-check` egyetlen új hiánya: az Earth iránytű gombjának `aria-label`-je (`versions/5.1.1/stock-apps.js:274`)
hu, de, fr és es nyelven is angol, mert az 5.1.1 `stock-strings.js`-ében nincs „Reset to north” sor (a 4.3-asban és a
4.4.4-esben van, `GoogleEarth:menu_north_up`). Nem látható szöveg, csak a képernyőolvasó mondja fel. A `608d5556`
(2026-10-26) hozta be; a 10-26-i `text-check` futás még 0 hiányt mutatott.

### 1.4 Vágólapra másolás: kezeletlen Promise-hiba — apróság

A `try { navigator.clipboard?.writeText(…) } catch {}` nem fogja meg az aszinkron elutasítást; ha a böngésző nem
engedi az írást (nem fókuszált lap, beágyazott iframe engedély nélkül), „Uncaught (in promise) NotAllowedError” marad a
konzolban. A funkció működik (toast, a szimulátor saját vágólapja beáll). Öt hely: 2.3.6 `simulator.js:1799`
(Böngésző › URL másolása) és `:1856` (SMS másolása), 6.0.1 `mm-chrome.js:181` (Chrome oldalinfó › URL másolása),
7.1.2 `ng-intents.js:120` (Megosztás › Vágólapra) és `ng-phone.js:436` (szám másolása). Javítás: `.catch(() => {})`.

## 2. Demóadat: egyik verzióban megvan, a másikban nincs

A `docs/demo-data.md` ellenőrzőlistája minden verzióra előírja ezeket.

| Tétel | Megvan | Hiányzik | Ami látszik |
|---|---|---|---|
| Híváslista (Mom tegnap, Alex nem fogadott és visszahívott) és **Mom csillagozva** | 2.1, 5.1.1, 6.0.1, 7.1.2 | 2.3.6, 4.0.4, 4.3, 4.4.4 | Üres híváslista; a 4.4.4 Telefon kedvencei üresek („Favorites & contacts you call often will show here”), a Névjegyek Kedvencek füle is |
| Négy fotó a Galériában | 2.3.6 – 7.1.2 | 2.1 | „There are no items in your collection” |

Verziónként eltérő tartalom, amelyre nincs szabály, de feltűnő:

| Tétel | Van tartalom | Üres |
|---|---|---|
| Drive-fájlok (Trip plan, Budget, Nexus kézikönyv, Photos mappa, Meetup slides) és ezekből a Docs / Sheets / Slides listája | 4.4.4, 5.1.1 | 6.0.1, 7.1.2 („Welcome, your Drive is ready!”, a Docs / Sheets / Slides üdvözlőképernyője) |
| Play Zene könyvtár (The Demo Tapes, Paper Satellites) | 4.0.4, 4.3, 4.4.4, 5.1.1 | 6.0.1 („Your music library is empty”), 7.1.2 („Enjoy Play Music”) |
| Play Filmek könyvtár | 4.3, 4.4.4, 5.1.1 | 6.0.1 („No movies”), 7.1.2 |
| Letöltések (beach-panorama.jpg, kézikönyv PDF) | 4.0.4, 4.3, 7.1.2 (Documents) | 4.4.4, 5.1.1, 6.0.1 („No items”) |

A 6.0.1 Play Music / Movies / Games könyvtára a korlát-felmérés szerint külön döntésre vár („Kimarad a 2-es
változatból”). A 2.1 Zene üres SD-kártyája és a Hírek és időjárás „network error”-a dokumentált szándék
(`docs/features/2.1.md`, `ec-news.js` fejkomment), de a többi verzió mindkettőben tartalmat mutat.

## 3. Funkció, amely az egyik verzióban működik, a másikban „nem része a szimulátornak”

| App / funkció | Működik | „Nem része” | Megjegyzés |
|---|---|---|---|
| **Local / Places**: a hét kategória (Restaurants … Gas stations) és a keresés | 4.0.4 | **4.3** (mind) | A T28 csak a 4.0.4-et javította; a 4.3 Local gyakorlatilag üres héj. |
| **Navigation**: Contacts, Starred places | 4.0.4, 2.3.6 | **4.3** | Ugyanaz a T28; a Speak destination mindenhol korlát (hangfelismerés). |
| **Messaging › Settings** (menü) | 2.1 | 2.3.6, 4.0.4, 4.3, 5.1.1 | 4.3-ban a Cell broadcasts is; 4.0.4 / 4.3 szálban az Add to People is. |
| **Google Settings** sorai | 4.4.4-ben csak a Google+ korlát | **5.1.1**: Account History, Data management, Google Fit, Google+ | |
| **Hangouts** | — | 4.4.4: Set mood…; 5.1.1: Video call | |
| **Drive › View as Grid** | 6.0.1, 7.1.2 (Docs/Sheets/Slides rács) | 4.4.4, 5.1.1; 4.4.4-ben a Product Tour is | |
| **Hírek és időjárás**: Search | 6.0.1, 7.1.2 | 5.1.1 (az Add section is) | |
| **Photos › Create movie** | — | 4.4.4 | |
| **Google+** | — | 4.0.4: Profile, Games; 4.3 / 4.4.4: Notifications, Reshare, Mood; 5.1.1: Notifications; 6.0.1 / 7.1.2: Search | A T23 (posztolás) tulajdonosi döntéssel könnyítve. |
| **Currents** fiók: a források (Tech Daily, Trail & Summit, Weekend Kitchen) és a Customize | a történetek megnyílnak | 4.3 | A T36 maradéka. |
| **Latitude › Add friends** | — | 2.3.6 | |
| **Wallet** (Payment cards, Rewards cards, Offers, Transactions) | — | 4.3 | Pénzügyi szolgáltatás: tulajdonosi döntés szerint korlát marad. |
| **Earth › Street View** | — | 6.0.1, 7.1.2 | Döntés szerint korlát. |

Egységes, szándékos korlátok (nem hibák): Help, Send feedback, Contact us, Tutorial, Terms of Service minden
Google-appban; a Play Store fizetős vásárlása és a Redeem / My account / Accounts („Unavailable”).

## 4. Amit nem találtam

- JavaScript-kivétel, sikertelen helyi kérés, `undefined` / `NaN` / `%s` a szövegben, törött kép: egyik verzióban sem.
- Hiányzó fordítás (hu, de, fr, es, minden app megnyitva): az 1.3-as egy sor kivételével egyik verzióban sem.
- „Not built yet” képernyő a mély bejárásban egyik moduláris verzióban sem:

  | | Appvezérlők | Beállítás-képernyők / vezérlők | Widgetek | Gyorsbeáll. panelek | App-beállítás XML |
  |---|---|---|---|---|---|
  | 2.1 | 159 | 48 / 257 | 8 | — | — |
  | 6.0.1 | 205 | 344 / 1 757 | 24 | 6 | 84 |
  | 7.1.2 | 247 | 376 / 12 033 | 18 | 7 | 124 |

  A 7.1.2 három `%s` találata a libpng licencszövegének `printf("%s", …)` sora (Open source licenses), nem hiba;
  egyetlen kivétele az 1.4-es vágólap-hiba.
- Indítóikon, amely csak „This app is not part of the simulator”-t ad: nincs (a `GEL_UNSIMULATED` lista üres).

## 5. Téves riasztások (ellenőrizve, nem hibák)

- 4.0.4: 31 px vízszintes túlcsordulás minden app megnyitásakor — csak a nyitóanimáció alatt, `overflow: hidden`
  mellett, nem látszik. 2.1: 3 px a fülsoroknál, ugyanígy.
- 4.3 / 4.4.4 / 5.1.1 Chrome: a Back / Forward / Bookmark ikon a kezdőlapon tiltott és szürke, ahogy az eredetiben.
- 4.3 Óra időzítő számgombjai: működnek, a bejáró a változást nem vette észre.
- 4.4.4 Hangkeresés: a Google-logó a képkészítés pillanatában még töltődött.
- A kezdőképernyő-képek egy része a fiók bezárása közben készült; külön ellenőrizve mind rendben.
- A „semmit sem csinál” gombok többsége már kiválasztott fül, üres mezőn nyomott Törlés vagy a „Ma” a mai napon.
