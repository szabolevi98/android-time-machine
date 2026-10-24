# Szimulátorkorlátok verziónként — 2026-10-23

Vizsgált commit: `f4a72fe404051cde4275aa982641104e38baee7f`.

A felmérés a felhasználónak kiírt „nem része a szimulátornak”, „nem elérhető”, „Még nincs kész” üzeneteket és az ezekhez kötött akciókat gyűjti. A konkrét korlátok sorai forrásban azonosított UI-utak; nem minden menüpontot kattintottam végig. A feltételes tartalékágak és a kiszűrt, inaktív találatok külön szerepelnek. A natív „nincs internet”, „nincs SIM”, „nincs találat” hibaállapotokat nem minősítem automatikusan hiányzó funkciónak.

Ez nem az összes inaktív/noop gomb vagy teljes funkcióteljesség auditja. Több funkció egyetlen közös elutasító kezelőt használ, ezért a forrássorok száma nem azonos a hiányzó funkciók számával.

## Lezárt besorolás — aktuális mag és későbbi lista

Az eredeti besorolás a `751118ebc5fd5aac051a4e77b78600dc4465b305` commitban megmarad: mind a 153 auditcsoport egyedi azonosítót és döntést kapott; ebből 125 volt konkrét korlát. **A felhasználó visszajelzése alapján a 49 csomag teljes megépítése nem az aktuális vállalás.** A helyileg megépíthető funkció és az ebben a körben elvégzendő munka külön fogalom.

A 125-ös audit korábbi megoszlása (16 teljesen javítandó helyi csoport, 91 vegyes, 18 szándékos korlát) a lehetőségek besorolása, **nem 107 most elvégzendő csoport**. Az alábbi ütemezés felülírja a korábbi teljes A–E végrehajtási sorrendet. A csoporttáblák külön Ütem oszlopa jelzi, mi tartozik ténylegesen a maghoz.

### Visszaállított szűrési szabály

**A munka a helyi beállításokra és szerkesztésre koncentráljon. Vitás esetben a verziók közötti eltérés dönt: ami másik verzióban már helyi működésként kész, itt viszont elutasít, az lehet a mag része. Ami egyik verzióban sincs kész, azt ebben a körben nem építjük meg.**

A működő referencia szükséges támpont, de önmagában nem tesz minden átépítést aktuális feladattá. A nagyobb új régi-verziós alrendszerek és a felhasználó által külön megnevezett T23/T24/T27/T29/T41/T45 a későbbi listára kerülnek. A fő T01–T07 prioritásnál a meglévő működés korhű párját építjük, nem új alkalmazásfunkciókat találunk ki. A gyári APK részletessége nem indok a feladat nevesített határán kívüli funkcióbővítésre.

Help/Feedback/Contact us, külső Terms/Privacy/jogi link, valódi Add/Remove account/Sign out, fizetés, hálózati szolgáltatás és fizikai hardver működtetése továbbra is szándékos korlát. A későbbre halasztott helyi funkció **nem szándékos korlát és nem kész**: elkülönített későbbi jelölt, amelyhez új fejlesztési döntés kell. A már működő újabb verziós megfelelőjét nem töröljük.

### Aktuális mag és későbbi lista

**Mag: 8 teljes csomag és 4 pontosan szűkített csomagrész.** A további **37 teljes csomag**, valamint a 4 részcsomag fennmaradó részei későbbi listán vannak. A T-azonosítók és az eredeti műveletleírások megmaradnak a visszakereshetőséghez. Minden státusz nyitott/halasztott; ebben a körben nem történt alkalmazáskód-javítás.

| Ütem | Csomag | Mostani terjedelem | Működő referencia / bizonyíték |
|---|---|---|---|
| Mag | T01 | 5.1.1 Photos saját Edit; a meglévő képszerkesztés korhű megfelelője, nem a hiányzó Galéria visszahozása | [simulator.js:2077](https://github.com/szabolevi98/android-time-machine/blob/751118ebc5fd5aac051a4e77b78600dc4465b305/versions/4.4.4/simulator.js#L2077); [mm-photos.js:160](https://github.com/szabolevi98/android-time-machine/blob/751118ebc5fd5aac051a4e77b78600dc4465b305/versions/6.0.1/mm-photos.js#L160) |
| Mag | T02 | 4.3 Email Settings belépés és a már felsorolt helyi prefsorok | [email-prefs.js:17](https://github.com/szabolevi98/android-time-machine/blob/751118ebc5fd5aac051a4e77b78600dc4465b305/versions/4.4.4/email-prefs.js#L17) |
| Mag | T03 | 4.3/4.4.4/5.1.1 Naptár Settings; 4.3/4.4 látható naptárak | [gb-prefs.js:55](https://github.com/szabolevi98/android-time-machine/blob/751118ebc5fd5aac051a4e77b78600dc4465b305/versions/2.3.6/gb-prefs.js#L55); [mm-calendar.js:199](https://github.com/szabolevi98/android-time-machine/blob/751118ebc5fd5aac051a4e77b78600dc4465b305/versions/6.0.1/mm-calendar.js#L199) |
| Mag | T04 | 2.3.6–5.1.1 Gmail auditált helyi beállítás- és címkehiányai | [mm-gmail.js:250](https://github.com/szabolevi98/android-time-machine/blob/751118ebc5fd5aac051a4e77b78600dc4465b305/versions/6.0.1/mm-gmail.js#L250) |
| Mag | T05 | 4.0.4 kamera Video és Panorama | [camera-pano.js:68](https://github.com/szabolevi98/android-time-machine/blob/751118ebc5fd5aac051a4e77b78600dc4465b305/versions/4.3/camera-pano.js#L68) |
| Mag | T06 | 5.1.1 Gmail Attach file | [mm-gmail.js:267](https://github.com/szabolevi98/android-time-machine/blob/751118ebc5fd5aac051a4e77b78600dc4465b305/versions/6.0.1/mm-gmail.js#L267) |
| Mag | T07 | A meglévő T07-ben név szerint felsorolt, szűk Chrome-kategóriák | [mm-chrome.js:190](https://github.com/szabolevi98/android-time-machine/blob/751118ebc5fd5aac051a4e77b78600dc4465b305/versions/6.0.1/mm-chrome.js#L190) |
| Mag | T33 | 4.3–5.1.1 Óra Settings és 5.1.1 Cities helyi keresés | [mm-clock.js:170](https://github.com/szabolevi98/android-time-machine/blob/751118ebc5fd5aac051a4e77b78600dc4465b305/versions/6.0.1/mm-clock.js#L170) |
| Mag, részben | T11 | 4.0.4/4.3/4.4.4/5.1.1 Import/export helyi vCard-fájllal; 4.0.4/4.3/4.4.4 Set ringtone a meglévő hangválasztóval. | [gb-contacts-io.js:98](https://github.com/szabolevi98/android-time-machine/blob/751118ebc5fd5aac051a4e77b78600dc4465b305/versions/2.3.6/gb-contacts-io.js#L98); [ng-contacts.js:285](https://github.com/szabolevi98/android-time-machine/blob/751118ebc5fd5aac051a4e77b78600dc4465b305/versions/7.1.2/ng-contacts.js#L285) |
| Mag, részben | T44 | 5.1.1 Telefon Import/export a T11 helyi folyamatára kötve; Settings belépés, valamint a gyári Dialer helyi megjelenítési/rendezési, hang/rezgés és gyorsválasz-preferenciái. | [ng-appprefs-phone.js:59](https://github.com/szabolevi98/android-time-machine/blob/751118ebc5fd5aac051a4e77b78600dc4465b305/versions/7.1.2/ng-appprefs-phone.js#L59) |
| Mag, részben | T49 | 4.4.4 és 5.1.1 Photo Sphere irányított helyi felvétel, megszakítás, mentett kép és gömbnézet a már meglévő 7.1-es guided capture modell korabeli megfelelőjeként. | [ng-camera-capture-model.js:7](https://github.com/szabolevi98/android-time-machine/blob/751118ebc5fd5aac051a4e77b78600dc4465b305/versions/7.1.2/ng-camera-capture-model.js#L7) |
| Mag, kísérő rész | T48 | A mag közös regressziós tesztje és az érintett üzenetek rendezése | A funkciójavítás része; nem új Android-funkció |

A forráshivatkozások meglévő implementációra mutatnak; ebben a tervezési körben nem futtattunk új teljes böngészős regressziót. Az adott régi verzió pontos UI-ját a saját gyári APK/AOSP adja, a referencia adatmodell és működésbeli támpont.

### Későbbi lista — nem automatikusan végrehajtandó

| Csomagok | Döntés |
|---|---|
| T08–T10, T12–T22, T25–T26, T28, T30–T32, T34–T40, T42–T43, T46–T47 | A leírás és a forráscsoport megmarad; ebben a magban nem kezdjük el. Külön döntés kell a megépítéshez. |
| T23 Google+ posztolás, T24 Play Movies offline kezelés, T27 Movie Studio, T29 ICS System updates/TalkBack, T41 Fit adatbevitel, T45 régi nyomtatás/PDF | A felhasználó által kifogásolt nagyobb bővítések: kikerültek az aktuális vállalásból. |
| T11 fennmaradó műveletek; T44 teljes haladó hívásbeállításfa; T49 Lens Blur; T48 összes app/verzió teljes szöveges újraauditja | A lenti feladatlapokon pontosan felsorolt későbbi rész. Nem feltétele a mag lezárásának. |

Pontosítás a „sehol sincs kész” állításhoz: a 6/7-ben a helyi nyomtatási/PDF folyamat már létezik (`mm-print.js`, `ng-print.js`), és TalkBack szolgáltatás-/beállításfelületek is vannak (`mm-settings-extra.js`, `ng-accessibility.js`). Ettől a T45 és a T29 **még későbbi feladat marad**: egy teljes régi-verziós átépítés nem automatikus magmunka. Movie Studio vagy más hiányzó helyi szerkesztő megépítését nem vesszük be pusztán azért, mert offline is megoldható volna.

### Munkasorrend és kezelhető terjedelem

1. A közös `tests/browser/limits-regression.mjs` kerete a `flows.mjs` alapján, a `package.json` `test:browser` parancsába kötve. A teszt a ténylegesen megépített mag-út pozitív eredményét is ellenőrzi; skipelt eset nem kész funkció.
2. T01–T07 a meglévő prioritási sorrendben. Az egymáshoz tartozó verziókat közös forrásfeltárással és adatmodellel kezeljük, de saját korhű UI-val.
3. T33, majd T11 és T44 fenti szűkített része; T49-ből csak Photo Sphere. A T11 helyi import/exportja a Telefonból is használható.
4. A mag útjainak asztali/telefonos regressziója és a T48 fenti kísérő része. Teljes új 2.1/6/7 Settings-audit (T47) nem előfeltétel.

A felhasználó **nem kér fix 7 sessiont, de nem szeretne 20+ sessiones munkává növő tervet**. Ezt a szűk mag és a külön későbbi lista szolgálja; a teljes 49 csomagot nem hajtjuk végre egy menetben. Nem adunk új, commit-időablakokból számolt sessionbecslést. Az első kész prioritások tényleges munkaigénye alapján kell jelezni, ha a maradék mag is jelentősen nagyobbnak bizonyul; ilyenkor a későbbi lista nem válik automatikusan kötelezővé, és az eltérésről még a terjedelem bővítése előtt számot adunk.

A mag készfeltételéből nem hagyunk el tesztet vagy mentési/visszanavigálási viselkedést. A méretet a funkciók kijelölt körével tartjuk kézben. A későbbi feladatok nincsenek késznek vagy szándékosan tiltott funkciónak jelentve.

### Feladatcsomagok és készfeltételek

**Az Ütem és — részcsomagnál — a Mostani rész az irányadó.** A teljes korábbi leírás későbbi jelöltként marad meg. Részcsomagnál a mag lezárásához csak a Mostani készfeltétel szükséges; a későbbi rész státusza ettől halasztott marad. Minden javítás commitja és ellenőrzése itt, a riport megfelelő T-lapján vezetendő.

#### T01 — 5.1.1 Photos saját szerkesztő

- **Ütem:** Mag.
- **Állapot:** Kész — `2b9f5839`. A Photos Edit a Google+ 4.9 saját szerkesztőjét nyitja (PlusOne.apk: PhotoEditorActivity, a 15 eszköz cdf sorrendjében, paraméterek ceq.d szerint, stíluslisták, Looks 15 előbeállítása, Compare, Revert, mentetlen-változás párbeszéd). A szerkesztés a képpel együtt mentődik, a könyvtárban, a nézegetőben és megosztáskor is látszik. Ellenőrzés: `tests/browser/limits-regression.mjs T01` asztali és telefonszélességen zöld (eszköz alkalmazása, mentés, újratöltés utáni megmaradás, Back eszközelvetés, kilépési párbeszéd Continue/Exit, nincs elutasító üzenet), kézi képernyőképek angolul és magyarul; `npm test` 247/247. A szűrők matematikája a natív könyvtárban van, ezért a hatások a szimulátor SVG-közelítései; a Vintage/Retrolux színei az APK stílusikonjaiból.
- **Verziók:** 5.1.1.
- **Forráscsoportok:** 5.1.1-21.
- **Elkészítendő és határ:** A shamu gyári Photos/PlusOne APK-jának Edit belépése és az ottani helyi képszerkesztő: eszközválasztás, beállítás, előnézet, mentés és elvetés. A 4.4-es Galéria-híd nem vihető át, mert 5.1-en nincs ilyen gyári app. Az eszközkészletet az adott APK rögzíti, nem a 7.1-es UI másolata.
- **Kész, ha:** A Photos Edit valódi képet kap; legalább egy módosítás mentve visszajelenik a könyvtárban és újranyitva is megmarad; Cancel nem módosítja az eredetit; Back nem veszti el észrevétlenül a munkát.

#### T02 — 4.3 Email Settings belépés és mögöttes helyi sorok

- **Ütem:** Mag.
- **Állapot:** Kész — `c67a7a43`. A 4.3 Email menü › Settings a saját beállításfát nyitja (email-prefs.js, mako EmailGoogle 4.1). Quick responses (lista, Create new, szerkesztő párbeszéd Cancel/Delete/Save), Choose ringtone (az image értesítési hangjai, érintésre lejátszva, Cancel/OK) és az Incoming/Outgoing settings (IMAP-mezők, biztonsági típus, Require sign-in, Cancel/Done) helyben menthető, újratöltés után megmarad; szerverkapcsolat nincs. Remove account korlát marad. Ellenőrzés: `limits-regression.mjs T02` asztali és telefonszélességen zöld; magyar képernyőképek; `npm test` 247/247.
- **Verziók:** 4.3.
- **Forráscsoportok:** 4.3-01, 4.3-09, 4.3-15.
- **Elkészítendő és határ:** A külön Email app beállításfája a mako gyári Email alapján. A már definiált Quick responses, Choose ringtone, Incoming settings és Outgoing settings is ide tartozik, bár az audit idején a belépés elfedte őket. A Remove account szolgáltatási korlát marad.
- **Kész, ha:** Az Email menüből a saját fiók beállításai nyílnak; sablonválasz, csengőhang és szervermező menthető, újranyitva megmarad. Nincs valódi hitelesítés vagy levélkiszolgáló-kapcsolat.

#### T03 — Naptár beállításai és látható naptárak

- **Ütem:** Mag.
- **Állapot:** Kész — `f4023b42`. calendar-prefs.js mindhárom verzió saját képernyőivel: 4.3/4.4.4 Settings (fejlécek, general_preferences.xml sorai, fiók szinkronizált naptárai, About Calendar) és Calendars to display; 5.1.1 Settings (General szegmensek, Events from Gmail, a fiók naptárai Sync kapcsolóval). Hatások: rejtett/nem szinkronizált naptár eseményei eltűnnek a nézetekből, widgetből, Now-kártyáról; hét kezdőnapja, hétszámok, új esemény alapértelmezett emlékeztetője/időtartama, értesítések kikapcsolása. Ellenőrzés: `limits-regression.mjs T03` (4.3, 4.4.4, 5.1.1) asztali és telefonszélességen zöld; magyar képernyőképek; `npm test` 247/247. Korlát marad: Add account, Send feedback, Help. Az 5.1.1 „No end time” alapidőtartam az új esemény szerkesztőjében 60 percet ad, mert a szerkesztő vég nélküli eseményt nem tud.
- **Verziók:** 4.3, 4.4.4, 5.1.1.
- **Forráscsoportok:** 4.3-06, 4.4.4-06, 5.1.1-06.
- **Elkészítendő és határ:** 4.3, 4.4.4 és 5.1.1: Settings helyi általános/fiók/naptár-preferenciái; 4.3/4.4.4: Calendars to display kijelölés. A fiókfelvétel, szerveroldali szinkron és súgó külön korlát marad.
- **Kész, ha:** A naptár láthatósága ténylegesen szűri az eseményeket; az értesítési/megjelenítési értékek menthetők; visszanavigáláskor az eredeti naptárnézet marad.

#### T04 — Gmail helyi beállítások és címkék

- **Ütem:** Mag.
- **Állapot:** Kész — `2d3f42bc` (4.3, 4.4.4, 5.1.1) és `aa780314` (2.3.6, 4.0.4). 2.3.6: Google Mail 2.3.5.1 Settings a gb-prefs.js-ben (preferences_root.xml, a fiók preferences.xml sorai, Confirm actions többes választással, Sync inboxes and labels címkénként, Labels to notify címkénkénti értesítéssel). 4.0.4: ics-gmail-prefs.js (fejlécek, general_preferences.xml, account_preferences.xml, Ringtone & vibrate, Days of mail to sync, Manage labels, a lista Label settings menüpontja). 4.3/4.4.4/5.1.1: Inbox sound & vibrate, Manage labels, Days of mail to sync (label_preferences.xml), 5.1.1-en Vacation responder (tárgy vagy üzenet nélkül nem ment, nem küld semmit). Hatás: None szinkronú címke listája üres, az utolsó N nap korlátozza a listát. Ellenőrzés: `limits-regression.mjs T04` mind az öt verzión asztali és telefonszélességen zöld; magyar képernyőképek; `npm test` 247/247. Mellékjavítás: 5.1.1 Gmail Starred/Sent/Outbox/Drafts/Trash nevei (üres label_* helyett mailbox_name_display_*), stock-strings.py mcc-konfiguráció hiba. Korlát marad: Add account, About Gmail, Help.
- **Verziók:** 2.3.6, 4.0.4, 4.3, 4.4.4, 5.1.1.
- **Forráscsoportok:** 2.3.6-02, 4.0.4-01, 4.3-04, 4.4.4-04, 5.1.1-04.
- **Elkészítendő és határ:** 2.3.6 és 4.0.4: teljes korabeli Settings belépés és helyi preferenciák; 4.0.4 Manage labels/Label settings. 4.3, 4.4.4, 5.1.1: Inbox sound & vibrate, Days of mail to sync, Manage labels; 5.1.1 Vacation responder szerkesztés helyi mentéssel. Valódi szinkron és automatikus email-küldés nincs.
- **Kész, ha:** Általános és fiókértékek elkülönülnek; választás és címkénkénti értesítés újranyitva megmarad; a szabadságválasz űrlap érvényesít és ment, de nem állít szerveroldali aktiválást.

#### T05 — 4.0.4 kamera videó és panoráma

- **Ütem:** Mag.
- **Állapot:** Kész — `6cff485d`. A 4.0.4 kamera módválasztója Video és Panorama módba vált: videó a btn_video_shutter gombbal, piros rögzítésjelzővel és eltelt idővel, a gomb vagy a Vissza leállítja és VID_ elemet ment; panoráma (ics-pano.js) a pano_capture.xml / pano_review.xml szerint (PanoProgressBar, „Panoráma rögzítése”, „Mentés…”, MÉGSE), mentés PANO_ elemként, MÉGSE után nincs elem. A Galéria megjeleníti a panorámát, a videót rácsjelöléssel és lejátszó gombbal, lejátszás MovieActivity-ként (ics-movie.js). Ellenőrzés: `limits-regression.mjs T05` asztali és telefonszélességen zöld; képernyőképek; `npm test` 247/247. A videóbeállítások (minőség, időzített felvétel, effektek) nem részei ennek a körnek.
- **Verziók:** 4.0.4.
- **Forráscsoportok:** 4.0.4-03.
- **Elkészítendő és határ:** ICS Video és Panorama módválasztás, a gyári módhoz illő felvételi folyamat, megszakítás és helyi eredmény; a 4.3 meglévő felvételi modellje referencia.
- **Kész, ha:** Mindkét mód a kamera látható választójából nyitható; indul/leáll vagy végigvezet a panorámán; a befejezett média megnyitható a Galériában; Cancel nem hoz létre elemet.

#### T06 — 5.1.1 Gmail általános fájlcsatolás

- **Ütem:** Mag.
- **Állapot:** Kész — `0f8e206c`. Az 5.1.1 Gmail és Email „Attach file” a DocumentsUI 5.1.1 ACTION_GET_CONTENT választóját nyitja (lp-docpicker.js): „Open from” gyökérfiók (Recent, Internal storage ha látszik, Images, Videos, Audio, Downloads a RootsAdapter sorrendjében), MediaDocumentsProvider vödrök és előadó/album/dal fa, morzsamenü, Sort by, Grid/List view, Show internal storage, Show file size, keresés az Internal storage-ban, más típusú dokumentum letiltva, az utolsó hely alkalmazásonként megjegyezve; a Vissza a veremben lép, majd fájl nélkül visszatér. A kép compose_attachment_tile csempeként, más fájl attachment.xml sorként jelenik meg névvel és AttachmentUtils-mérettel, eltávolító gombbal; az elküldött levél megtartja. Az Attach picture megmaradt; a háttérkép-választó és a Keep „Pick image” ugyanezt a választót használja image/* szűréssel. Ellenőrzés: `limits-regression.mjs T06` asztali és telefonos szélességen (kép + hangfájl csatolása, név/méret, verem visszaállítása, Vissza/Mégse, törlés, piszkozat tárgya megmarad, elküldött levél), `tests/lp-docpicker.test.cjs`, `npm test` 248/248, magyar képernyőképek.
- **Verziók:** 5.1.1.
- **Forráscsoportok:** 5.1.1-22.
- **Elkészítendő és határ:** Attach file bekötése az adott verzió helyi fájlválasztójába; több fájltípus adatainak átadása, csatolmány megjelenítése és törlése. Az Attach picture megmarad.
- **Kész, ha:** Kép és nem képfájl is csatolható; név/típus/méret helyes; Cancel és csatolmánytörlés működik; a piszkozatot nem nullázza új megosztás.

#### T07 — Chrome helyi kategóriák, pontos verziónkénti körrel

- **Ütem:** Mag.
- **Állapot:** Kész — `5cdecb09`. A Chrome 27 (4.3), 32 (4.4.4) és 40 (5.1.1) saját APK-ja szerinti oldalai oldalveremként: Search engine (a nyelv országának előtöltött keresőmotorjai a Chromium adott címkéjű template_url_prepopulate_data.cc / prepopulated_engines.json alapján; a címsor ezután ott keres, pl. Bing találati oldal), Accessibility (FontSizePreview, Text scaling csúszka 50–200%, ami a weboldal szövegét méretezi, a Force enable zoom 130%-on át követi), Content/Site settings (jelölőnégyzetek; 5.1.1-ben a kategóriaoldalak read_write_toggle-lal és üres webhelylistával, All sites, Storage, Protected content, Google Translate; 4.3/4.4.4-ben Website settings, Protected content (4.4.4), Google Translate, a helybeállítás sor a rendszer / Google helybeállításait nyitja és Vissza visszahoz), Bandwidth management / Reduce data usage (bekapcsolva a Data savings 0%-kal — a szimulátor nem színlel tömörítő proxyt), 'Do Not Track', Touch to Search, Merge tabs and apps (DocumentModeEnabler megerősítéssel), 4.3 Developer tools. A kapcsolós oldalak az akciósávba teszik a kapcsolót; Learn more / Help új lapon nyitja a cikket. A Home page sor kikerült 4.4.4/5.1.1-ből: HomepageManager.shouldShowHomepageSetting() partner-kezdőlap nélkül hamis, és egyik képen sincs ilyen szolgáltató. Passwords, Autofill, Sign in, Help & feedback (5.1.1) és Legal information továbbra is korlát. Ellenőrzés: `limits-regression.mjs T07` mindhárom verzión asztali és telefonos szélességen (keresőmotor + címsoros keresés, csúszka húzással + oldalszöveg, JavaScript, Location kategória, kapcsolók, külső helybeállítás oda-vissza, újratöltés után megmarad), `tests/chrome-settings.test.cjs`, `npm test` 248/248, képernyőképek angolul és magyarul.
- **Verziók:** 4.3, 4.4.4, 5.1.1.
- **Forráscsoportok:** 4.3-02, 4.4.4-02, 5.1.1-02.
- **Elkészítendő és határ:** 4.3/4.4.4/5.1.1: Search engine, Accessibility, Content/Site settings, Bandwidth management/Reduce data usage és a meglévő Privacy alatti Do Not Track. 4.3: Developer tools; 4.4.4/5.1.1: Home page; 5.1.1: Merge tabs and apps és Touch to Search. A forrásbeli kulcsok: search_engine, accessibility, content, bandwidth, devtools, homepage, tabs_apps, dnt, contextual. Passwords, Autofill, Sign in, Help és Legal information e körben meghagyott korlát.
- **Kész, ha:** A felsorolt kategóriák saját korabeli oldalt nyitnak; értékeik menthetők; ahol a helyi böngésző viselkedését érintik (kezdőlap, szövegmérték, JavaScript stb.), a hatás ellenőrzött. Adattömörítés vagy távoli hibakeresés aktív hálózati működését nem színleli.

#### T08 — Szövegkijelölés a Gingerbread appokban

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 2.3.6.
- **Forráscsoportok:** 2.3.6-01, 2.3.6-02.
- **Elkészítendő és határ:** 2.3.6 böngésző Select text és Gmail beszélgetés Select text: a megjelenített szöveg kijelölése és másolási művelete. Nem a böngésző teljes Android-szövegkezelő rendszerének újraírása.
- **Kész, ha:** Látható szövegrész kijelölhető és kimásolható asztali egérrel, illetve telefonszélességen; kilépés visszaadja a szokásos görgetést.

#### T09 — Email helyi szervermezők és hiányzó prefsorok

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Részben kész — `c67a7a43`: a közös email-prefs.py miatt 4.4.4 és 5.1.1 alatt is működik a Quick responses, a csengőhang és az Incoming/Outgoing settings (`limits-regression.mjs T09` asztali és telefonszélességen zöld). Nyitott: 2.3.6 Incoming/Outgoing settings, 4.0.4 (az Email Settings ott nem az email-prefs.js-t nyitja), valamint a szervermezők tartalmi validációja (pl. port).
- **Verziók:** 2.3.6, 4.0.4, 4.4.4, 5.1.1.
- **Forráscsoportok:** 2.3.6-03, 4.0.4-19, 4.4.4-01, 4.4.4-09, 5.1.1-01, 5.1.1-09.
- **Elkészítendő és határ:** 2.3.6 Incoming/Outgoing settings. 4.0.4, 4.4.4, 5.1.1 Quick responses, Choose ringtone, Incoming/Outgoing settings. 4.3 ugyanezt a T02 keretében kapja meg. A 2.3.6 újfiókos Manual setup és a Remove account továbbra is valódi fiókműveleti korlát.
- **Kész, ha:** Sablonválasz hozzáadás/szerkesztés, csengőhangválasztás és helyi szervermező-validáció/mentés működik; jelszó nem kerül tesztlogba; valós email-fiókot nem hoz létre.

#### T10 — Névjegykép és Hangouts kamerás csatolás

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 2.3.6, 4.3, 4.4.4, 5.1.1.
- **Forráscsoportok:** 2.3.6-05, 4.3-08, 4.4.4-08, 5.1.1-08.
- **Elkészítendő és határ:** 2.3.6 névjegyszerkesztő Take photo; 4.3/4.4.4/5.1.1 Hangouts Take photo. A már meglévő helyi kamerafolyamat bekötése az eredmény fogadójába, nem új kameramotor.
- **Kész, ha:** A felvétel a megfelelő névjegyhez/beszélgetéshez tér vissza; a kép megjelenik és menthető; megszakításkor nincs üres kép vagy új beszélgetés.

#### T11 — Névjegyek helyi menüműveletei

- **Ütem:** Mag, részben; a többi későbbi lista.
- **Állapot:** A mostani rész nyitott; a későbbi rész halasztott.
- **Mostani rész:** 4.0.4/4.3/4.4.4/5.1.1 Import/export helyi vCard-fájllal; 4.0.4/4.3/4.4.4 Set ringtone a meglévő hangválasztóval.
- **Mostani készfeltétel:** Helyi vCard export/import megőrzi a mintanévjegy mezőit; a csengőhang a megfelelő névjegyhez mentve visszaáll; Cancel nem ír adatot.
- **Későbbi rész:** Share, Place on Home screen, Contacts to display és az általános Contacts Settings megépítése; új shortcut/chooser vagy teljes névjegybeállításfa nem része a magnak.
- **A következő eredeti terjedelem/készfeltétel a teljes jelöltet dokumentálja; nem bővíti a mostani részt.**
- **Verziók:** 4.0.4, 4.3, 4.4.4, 5.1.1.
- **Forráscsoportok:** 4.0.4-02, 4.3-10, 4.4.4-10, 5.1.1-10, 5.1.1-15.
- **Elkészítendő és határ:** 4.0.4, 4.3, 4.4.4, 5.1.1: Share (vCard/chooser), Place on Home screen, Contacts to display, Import/export és Settings. Set ringtone a 4.0.4/4.3/4.4.4 látható sorain. A fizikai SIM-re írás és Accounts/Help nem része; a helyi fájlimport/export igen.
- **Kész, ha:** A címzett helyes névjegyadatot kap; a shortcut megnyitja a névjegyet; listaszűrő és csengőhang megmarad; vCard ki-/beolvasás nem duplikál és nem veszít mezőket észrevétlenül.

#### T12 — Maps/Navigation helyi beállítások és mentett elemek

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 2.3.6, 4.0.4, 4.3, 4.4.4, 5.1.1.
- **Forráscsoportok:** 2.3.6-06, 2.3.6-16, 2.3.6-17, 4.0.4-16, N01, N02, N03.
- **Elkészítendő és határ:** 2.3.6 Maps Labs/Cache settings, Navigation Settings; rétegek Transit Lines/Bicycling/Wikipedia helyi mintarétege; Places Add kategória. 4.0.4 Maps Settings és Latitude előző/következő helyi elem. A triage során külön azonosított 4.3 My Places, 5.1.1 Your places és a három verzió Maps Settings sorai is itt szerepelnek (N01–N03). Latitude Add friends, valós forgalom, hálózati térképletöltés és hangfelismerés nem része. 2.3.6 Galéria Show on map a helyi Maps-pontra ad át.
- **Kész, ha:** A réteg láthatóan megváltozik, a helyi helylista és kategória menthető, a navigációs választások megmaradnak. Az üres helyi cache törlése nem állít távoli letöltést.

#### T13 — Gingerbread MMS mellékletek és Jelly Bean hanglejátszás

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 2.3.6, 4.3.
- **Forráscsoportok:** 2.3.6-07, 2.3.6-08, 4.3-17.
- **Elkészítendő és határ:** 2.3.6: video kiválasztás/felvétel, audio kiválasztás/felvétel, slideshow összeállítás és a képmelléklet View. 4.3: az audio editor Play gombja és a kirajzolt helyi mellékletforrások bekötése. Valódi MMS-küldés nem része.
- **Kész, ha:** A kiválasztott vagy felvett helyi média megjelenik, lejátszható, cserélhető és törölhető; slideshow sorrendje menthető; küldés csak a meglévő helyi beszélgetésmodellben történik.

#### T14 — 2.3.6 Zene helyi fájlműveletei

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 2.3.6.
- **Forráscsoportok:** 2.3.6-09.
- **Elkészítendő és határ:** Use as ringtone és Delete a szám/lejátszó menüjében; a helyi demókönyvtár módosítása és a Beállítások csengőhangértékének összekötése.
- **Kész, ha:** A választott szám lesz a mentett csengőhang; törlés megerősítéssel a megfelelő számot távolítja el; érvényes következő szám/üres lista állapot marad.

#### T15 — 2.3.6 Car Home és Dock settings

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 2.3.6.
- **Forráscsoportok:** 2.3.6-10, 2.3.6-14.
- **Elkészítendő és határ:** Car Home Settings és Desk clock Dock settings korabeli helyi preferenciái, köztük az app által kezelt éjszakai/dokkolt viselkedés. Fizikai dokkoló/Bluetooth kapcsolat nem készül.
- **Kész, ha:** A menü saját beállításoldalt nyit; az értékek menthetők; az éjszakai/nézetértékek a demón belül érvényesülnek.

#### T16 — 2.3.6 Google Voice helyi beállítások

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 2.3.6.
- **Forráscsoportok:** 2.3.6-13.
- **Elkészítendő és határ:** A Settings út helyi értesítési, hang- és megjelenítési preferenciái a crespo gyári APK alapján. Balance, fizetés, szolgáltatói aktiválás és Help korlát marad.
- **Kész, ha:** A Settings saját oldalt nyit és helyi értékeket ment; nem kéri valódi Google Voice aktiválását és nem állít át szolgáltatói híváskezelést.

#### T17 — Talk helyi beszélgetés- és beállításműveletei

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 2.3.6, 4.0.4.
- **Forráscsoportok:** 2.3.6-15, 4.0.4-08.
- **Elkészítendő és határ:** 2.3.6 Settings és Add to chat a demó névjegyeivel. 4.0.4 Talk settings, Display options, Friend info és Add to chat. Sign out/Help/Feedback és valódi voice/video hívás korlát marad.
- **Kész, ha:** A résztvevőválasztó módosítja a helyi beszélgetés résztvevőit; információ megnyílik; nézet- és értesítési beállítás menthető. Nem jelenik meg fiktív valós híváskapcsolat.

#### T18 — Books helyi könyvtári műveletek

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 2.3.6, 4.0.4.
- **Forráscsoportok:** 2.3.6-18, 4.0.4-10.
- **Elkészítendő és határ:** 2.3.6 About és Manage eBooks helyi könyvkezelő. 4.0.4 Search, About the book, Share, Available offline/Make available offline, Read aloud és Refresh. A valódi áruházi beszerzés, Accounts és Help nem része; Read aloud a demószöveget használja és megállítható.
- **Kész, ha:** A keresés a helyi könyveket szűri; könyvadatok helyesek; offline jelölés és könyvtárválasztás megmarad; megosztás a megfelelő könyvazonosítót kapja; felolvasás nem marad futva kilépés után.

#### T19 — Earth helyi eszközök és beállítások

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 2.3.6, 4.0.4, 4.3, 4.4.4, 5.1.1.
- **Forráscsoportok:** 2.3.6-18, 4.0.4-16, 4.3-20, 4.4.4-20, 5.1.1-27.
- **Elkészítendő és határ:** 2.3.6 Settings; 4.0.4 Search, Layers, North up, My Location, Settings; 4.3/4.4.4/5.1.1 Reset to north, My location, Share és Settings/drawer beállításoldal. A jelenlegi demótérkép/földgömb és előre tárolt helyek, nem élő GPS vagy új online földgömbmotor. Help/Feedback/Tutorial/Terms webes út korlát marad.
- **Kész, ha:** A keresett mintapont kiválasztódik, hely/irány/réteg ténylegesen változik a nézetben; Share a jelenlegi helyet adja át; preferenciák menthetők.

#### T20 — YouTube helyi műveletek

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 2.3.6, 4.0.4, 4.3, 4.4.4, 5.1.1.
- **Forráscsoportok:** 2.3.6-19, 4.0.4-09, 4.3-20, 4.4.4-20, 5.1.1-27.
- **Elkészítendő és határ:** 2.3.6 Settings. 4.0.4 Search, Record helyi kameraeredménnyel, Add to helyi lista, Share, csatornaoldal és Settings. 4.3 Add to, Share, Dislike, Copy URL és Settings; 4.4.4/5.1.1 Settings. Nincs valódi upload, stream, Flag/Feedback/Help vagy fiókművelet.
- **Kész, ha:** A demóvideók kereshetők; helyi lista és értékelés megmarad; URL másolás/megosztás helyes; a rögzített demóvideó helyi elemként nyitható; beállítások menthetők.

#### T21 — Market/Play Store helyi megosztás és szűrés

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 2.3.6, 4.0.4, 4.3, 4.4.4, 5.1.1.
- **Forráscsoportok:** 2.3.6-21, 4.0.4-06, 4.3-11, 4.4.4-11, 5.1.1-11, 5.1.1-34.
- **Elkészítendő és határ:** 2.3.6 Developer Info helyi adatlap, Sharing, Market content és PIN-szűrés. 4.0.4 Content filtering/PIN. 4.3/4.4.4/5.1.1 Share. 5.1.1 READ MORE helyi leírás és Send email átadás a helyi levélírónak. Redeem, vásárlás, fiók, People, Flag és webes jogi/súgólinkek korlát maradnak.
- **Kész, ha:** A tartalomszűrő/PIN valóban szabályozza a demólistát; Share és email a megfelelő app metaadatait viszi; READ MORE megmutatja a teljes tárolt leírást.

#### T22 — 4.0.4 Play Music helyi keresés, mix és beállítások

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 4.0.4.
- **Forráscsoportok:** 4.0.4-05.
- **Elkészítendő és határ:** Search music, Make instant mix a helyi zenékből és Settings helyi preferenciái. Help és hálózati fiók/szinkron nem része.
- **Kész, ha:** Keresés szűr, mix nem üres ha van zene és lejátszható; beállítások mentve újranyitáskor megmaradnak; nem állít szerveroldali ajánlást.

#### T23 — Google+ helyi posztolás és beállítások

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 4.0.4, 4.3, 4.4.4, 5.1.1.
- **Forráscsoportok:** 4.0.4-07, 4.3-14, 4.3-20, 4.4.4-14, 4.4.4-20, 5.1.1-14, 5.1.1-27.
- **Elkészítendő és határ:** 4.0.4 New post. 4.3 Photo/Check in/Mood/Write, New post, Share photos, Share your location, Reshare, értesítési lista és Settings. 4.4.4 a kirajzolt poszt/értesítés/új bejegyzés műveletei és Settings; 5.1.1 Settings. Google Settings Google+ belépés ezekre irányít. A poszt és hely helyi demóadat, nem publikálás.
- **Kész, ha:** Szöveg/kép/hely poszt helyben létrejön, újranyitva megmarad; Reshare és értesítési lista értelmes helyi eredményt ad; Cancel nem posztol; fiók és Feedback/Help korlát marad.

#### T24 — 4.0.4 Play Movies helyi offline kezelés

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 4.0.4.
- **Forráscsoportok:** 4.0.4-11.
- **Elkészítendő és határ:** Manage offline rentals helyi mintaelem-listája, Settings helyi preferenciák és Retry natív offline hibaállapot újbóli megnyitással. Valódi kölcsönzés, Accounts, stream és támogatás nem része.
- **Kész, ha:** A helyi offline lista és beállítás menthető; Retry visszajut az adott elem valós demó/offline állapotába generikus szimulátor-toast nélkül; nem állít sikeres hálózati lejátszást.

#### T25 — Google keresés helyi beállítások

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 4.0.4, 4.3, 4.4.4, 5.1.1.
- **Forráscsoportok:** 4.0.4-12, 4.3-14, 4.4.4-14, 5.1.1-14.
- **Elkészítendő és határ:** 4.0.4 Searchable items. 4.3 Google Now, Notifications, My stuff, Voice, Phone search, Privacy & accounts helyi részei. 4.4.4/5.1.1 a Google Settings Play Games belépése a T43 helyi beállítására mutat; Google+ a T23-ra. A webes Ads by Google/Ads Settings/Learn more és valódi fiók/személyre szabás marad korlát.
- **Kész, ha:** A kereshető források kijelölése szűri a helyi keresést; értesítés/Now/saját mintatartalom beállítása menthető; a Google Settings belépések helyes app-oldalra térnek vissza.

#### T26 — 4.0.4/4.3 Google+ Messenger helyi beszélgetések

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 4.0.4, 4.3.
- **Forráscsoportok:** 4.0.4-13, 4.3-22.
- **Elkészítendő és határ:** Beszélgetés megnyitása, New conversation és Settings a mintanévjegyekkel; meglévő helyi üzenetmodellre építve. Nincs valódi Google+ üzenetküldés, Sign out, Help vagy Feedback.
- **Kész, ha:** A listáról megnyíló szál és az új helyi szál üzenetet fogad és ment; megfelelő címzettek és visszanavigálás; beállítás megmarad.

#### T27 — 4.0.4/4.3 Movie Studio helyi projektek

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 4.0.4, 4.3.
- **Forráscsoportok:** 4.0.4-14, 4.3-22.
- **Elkészítendő és határ:** Create new project névvel, helyi kép/videó hozzáadás, idővonalon sorrend/csonkolás, előnézet, projektmentés/újranyitás/törlés a gyári VideoEditor UI alapján. Ez egy önálló nagyobb szerkesztőfeladat; nem soroljuk át szolgáltatási korláttá az időigény miatt. Új natív kodek/MP4 renderelő nem része; a helyi projekt és előnézet igen.
- **Kész, ha:** A létrehozott projekt két médiaelemmel menthető és újranyitva visszaáll; sorrend/csonkolás láthatóan hat az előnézetre; törlés és üres projekt kezelése működik.

#### T28 — 4.0.4 Navigation/Places helyi választók

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 4.0.4.
- **Forráscsoportok:** 4.0.4-15.
- **Elkészítendő és határ:** Navigation Contacts és Starred places; Places keresés és Restaurants/Coffee/Bars/Hotels/Attractions/ATMs/Gas stations kategóriák a már tárolt helyekből. Speak destination az offline hangszolgáltatás korlátja marad. A Type destination már működik.
- **Kész, ha:** Névjegy/mentett hely kiválasztása a létező útvonalkezelőbe ad célt; kategória és keresés helyi találatot/üres állapotot ad; Back a választóhoz tér vissza.

#### T29 — 4.0.4 System updates és TalkBack helyi felülete

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 4.0.4.
- **Forráscsoportok:** 4.0.4-17.
- **Elkészítendő és határ:** System updates eredeti frissítési állapotképernyő; a tényleges OTA letöltés/telepítés nem része. TalkBack szolgáltatásrészletek, engedélyezési figyelmeztetés és saját prefsorok a maguro APK alapján; új, teljes rendszerű képernyőolvasó-motor nem része.
- **Kész, ha:** Nem a generikus elutasítás jelenik meg: az update oldal őszinte offline állapotot mutat, a TalkBack helyi engedélyezés/konfiguráció menthető és a kapcsoló/szolgáltatáslista konzisztens.

#### T30 — Settings dev-info valódi helyi céljai

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 4.0.4, 4.3, 4.4.4, 5.1.1.
- **Forráscsoportok:** 4.0.4-18, 5.1.1-18, N04, N05.
- **Elkészítendő és határ:** 4.0.4 Music effects választó; 4.3/4.4.4 Music effects és Wi-Fi Install certificates; 5.1.1 Wi-Fi Install certificates. A 4.0.4 közös kódjában definiált certs sor az ICS visszatérési ágban nincs kirajzolva, oda nem kerül új Wi-Fi sor. 5.1.1-ben a régi Music effects renderút helyett az LP Sound & notification aktív, oda sem találunk ki új sort. A tanúsítványfolyamat a demó fájltárat és hitelesítő-tárat kezeli, nem a host rendszerét. A readonly/információs dev-info céloknak statikus részlet/noop kell, új hardverfunkció nem.
- **Kész, ha:** A zenei effektválasztó menthető; helyi minta tanúsítvány import és hibás fájl validáció működik; a readonly adatok nem adnak félrevezető hiányüzenetet. A host rendszer konfigurációja változatlan.

#### T31 — 4.3/4.4.4 Galéria videó Trim és Mute

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 4.3, 4.4.4.
- **Forráscsoportok:** 4.3-16, 4.4.4-15.
- **Elkészítendő és határ:** A meglévő helyi videóhoz vágási tartományválasztó, előnézet, mentés másolatként és némított másolat a gyári Galéria szerint. A fizikai média újrakódolása csak a projekt meglévő médiamodelljének szintjén szükséges; nem elég egy sikertoast.
- **Kész, ha:** A mentett elem tartománya/hangállapota ténylegesen visszaköszön a lejátszóban és újranyitva is megmarad; eredeti megmarad; érvénytelen tartomány nem menthető.

#### T32 — Hangouts és 5.1 Messenger helyi opciók

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 4.3, 4.4.4, 5.1.1.
- **Forráscsoportok:** 4.3-07, 4.4.4-07, 5.1.1-07, 5.1.1-36.
- **Elkészítendő és határ:** 4.3/4.4.4/5.1.1 Hangouts Settings, Invites helyi üres/minta lista, People & options és Add people mintanévjegyekből; 5.1.1 Blocked people kezelése. 5.1.1 SMS/Messenger People & options értesítéskapcsoló. A Google+ photos távoli könyvtár és valódi Video call korlát marad; kameracsatolás T10.
- **Kész, ha:** Résztvevő és tiltás változtatása menthető; értesítéskapcsoló állapota hat a helyi értesítési modellre; a látható listák megfelelő elemet mutatnak; nincs puszta „notifications stay on” helyettesítés.

#### T33 — 4.3–5.1.1 Óra beállítások és városkeresés

- **Ütem:** Mag.
- **Állapot:** Kész — `d9db7c9e`. A DeskClock 2.0.3 (4.3), 3.0.0 (4.4.4) és 3.0.4 (5.1.1) „More options” menüje a gyári desk_clock_menu.xml szerint (Night mode — 3.x-ben az Alarm fülön rejtve —, Settings, Help), a Cities menü Settings/Help sora is működik. A SettingsActivity (settings.xml) az APK saját szövegeivel és tömbjeivel (docs/tools/clock-prefs-strings.py): Style, Automatic home clock, Home time zone („(GMT+H:MM) név” lista eltolás szerint, az automatikus otthoni órától függően engedélyezve), Silence after, Snooze length (1–30 választó), Alarm volume, Volume buttons; mentve data.jbClock.prefs-be. Hatások: Analóg stílus az óra oldalon és Night módban (AnalogClock számlap/mutatók), Home óra a világórák elején, ha a telefon zónája eltér az otthonitól, a szundi a beállított hosszt várja, a csörgő ébresztő a Silence after után elhallgat, a hangerőgombok szundiznak/elvetnek. Night mode a ScreensaverActivity tompított órája. 4.4.4/5.1.1 Cities: SearchView szűrés (CitiesActivity: a név a beírt szöveggel kezdődik). Help: desk_clock_help_url a böngészőben. Ellenőrzés: `limits-regression.mjs T33` mindhárom verzión asztali és telefonos szélességen, `tests/clock-prefs.test.cjs`, `npm test` 249/249, képernyőképek angolul és magyarul.
- **Verziók:** 4.3, 4.4.4, 5.1.1.
- **Forráscsoportok:** 4.3-13, 4.4.4-13, 5.1.1-13, 5.1.1-23.
- **Elkészítendő és határ:** 4.3/4.4.4/5.1.1 More options valódi menüje és Settings helyi preferenciák; 5.1.1 Cities keresés a meglévő városlistában. Help korlát marad. A Cities-keresés két auditcsoportja ugyanaz a munka.
- **Kész, ha:** Órastílus/otthoni időzóna/ébresztőértékek a gyári verziónak megfelelően menthetők; 5.1 keresés szűr és kiválasztható a találat; kiválasztott világóra megjelenik.

#### T34 — 4.3–5.1.1 Drive helyi fájlműveletek

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 4.3, 4.4.4, 5.1.1.
- **Forráscsoportok:** 4.3-18, 4.4.4-19, 5.1.1-25.
- **Elkészítendő és határ:** 4.3 New, Search, overflow, mappa megnyitás, fájl Share/overflow; 4.4.4 Create/Add new, Refresh, Filter by, Sort by, Settings és fájlmenü; 5.1.1 Create, Refresh, Filter by, Sort by és az elutasító új/keresés vezérlők. Műveletek: helyi mappa/fájl létrehozás, név/move/delete/offline jelölés, megosztás a helyi chooserrel. Product Tour és webes support nem része.
- **Kész, ha:** Fájllétrehozás/mappa és keresés/szűrés/rendezés működik a tárolt fájllistán; célzott fájlműveletek menthetők, a megosztott tartalom helyes. Refresh újraolvassa a helyi állapotot, nem színlel felhőszinkront.

#### T35 — Keep helyi megosztás, felvétel és beállítás

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 4.3, 4.4.4, 5.1.1.
- **Forráscsoportok:** 4.3-19, 4.4.4-20, 5.1.1-26.
- **Elkészítendő és határ:** 4.3 New recording, Share és Settings; 4.4.4 Share/Settings; 5.1.1 Make a copy, Send és New recording. A hangfelvétel a meglévő demófelvételi modellből jegyzetcsatolmányt hoz létre. Help/Feedback nem része.
- **Kész, ha:** Másolat új azonosítóval készül; Share/Send a jegyzet tartalmát adja át; a hangjegyzet visszajátszható és megmarad; helyi preferenciák menthetők.

#### T36 — Currents/Magazines/Newsstand helyi tartalmi utak

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 4.3, 4.4.4, 5.1.1.
- **Forráscsoportok:** 4.3-21, 4.4.4-21, 5.1.1-32.
- **Elkészítendő és határ:** 4.3 Currents Search/Sync now/Settings, Featured/Saved/Add edition helyi mintaelemek; Play Magazines keresés, magazin megnyitás, Refresh, On device only, Settings. 4.4.4 Newsstand Search, My News/My Magazines/Saved/Explore, Settings, On device only. 5.1.1 Newsstand Search/My Library/Bookmarks/Explore/Settings. Online előfizetés és Help korlát marad.
- **Kész, ha:** A mintacikk/magazin megnyílik; keresés szűr; mentés/könyvjelző/saját kiadás megmarad; szekcióváltás külön helyi tartalmat vagy korrekt üres állapotot mutat; nem fiktív hálózati sync.

#### T37 — 4.4.4/5.1.1 Google Now emlékeztetők

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 4.4.4, 5.1.1.
- **Forráscsoportok:** 4.4.4-18, 5.1.1-24.
- **Elkészítendő és határ:** Eseménykártya menü releváns helyi elrejtés/szerkesztés; Where helyi mintapontválasztó és One-time helyett ismétlődés mentése. Nem folyamatos GPS/geofencing vagy élő naptárszolgáltatás.
- **Kész, ha:** Kártyaművelet tényleg változtatja a listát; hely és ismétlés az emlékeztetőben mentve visszajelenik; megszakítás és szerkesztés stabil; helyalapú háttérriasztást nem állít valósnak.

#### T38 — 4.4.4/5.1.1 Photos helyi menüműveletek

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 4.4.4, 5.1.1.
- **Forráscsoportok:** 4.4.4-17, 5.1.1-21.
- **Elkészítendő és határ:** Slideshow, Download a helyi médiatárba, Select photos többes kijelöléssel és az APK szerinti helyi Settings értékek. Az online backup/bejelentkezés nem része. Print T45, 5.1 Edit T01. 4.4 Edit működő regressziós referencia marad.
- **Kész, ha:** A slideshow léptet és leáll; kijelölés helyes elemekre vonatkozik; helyi mentés megnyitható; Settings megmarad; a már működő 4.4 szerkesztés nem romlik el.

#### T39 — 4.4.4 Quickoffice helyi fájlforrások

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 4.4.4.
- **Forráscsoportok:** 4.4.4-22.
- **Elkészítendő és határ:** Drive a demó Drive-listával, Device a helyi tárral; overflow adott APK-ban szereplő helyi rendezési/nézet/beállítás műveletei. Valós Google Drive hozzáférés, fiók és webes support nem része. Create new file már működik.
- **Kész, ha:** Mindkét forrásból megfelelő helyi dokumentum nyílik meg; a menü tényleges helyi műveletet végez; új fájl továbbra is létrehozható; Cancel visszatér az eredeti listához.

#### T40 — 5.1.1 Docs/Sheets/Slides listák és fájlmenük

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 5.1.1.
- **Forráscsoportok:** 5.1.1-29, 5.1.1-30.
- **Elkészítendő és határ:** Drawer helyi gyűjteményei, View as Grid, Sort by, Open document helyi picker, Refresh; Share link helyi dokumentumazonosítóval, Send file, Keep on device, Move, Add to home screen. Print T45. Rename/Remove meglévő működését védeni kell; teljes irodai fájlformátum-motor és valós linkjogosultság nincs.
- **Kész, ha:** Mindhárom appban listaállapot, rendezés és offline jelölés mentve helyes; Move célmappát változtat; küldés a dokumentum tartalmát viszi; shortcut a jó dokumentumot nyitja; Rename/Remove továbbra is működik.

#### T41 — 5.1.1 Fit helyi adatbevitel

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 5.1.1.
- **Forráscsoportok:** 5.1.1-31.
- **Elkészítendő és határ:** Add activity, Add your weight és Settings helyi értékek. Google Fit felhő, élő lépésszámláló és külső szenzor nem része.
- **Kész, ha:** Érvényes aktivitás/súly hozzáadása megváltoztatja a helyi listát/összesítést és újranyitva megmarad; negatív/hibás érték nem menthető; helyi cél és mértékegység beállítás érvényesül.

#### T42 — 5.1.1 News & Weather helyi szekciókezelés

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 5.1.1.
- **Forráscsoportok:** 5.1.1-28.
- **Elkészítendő és határ:** Open in browser a tárolt cikk URL-jének átadásával a szimulált böngészőnek; Change editions és Manage sections a helyi mintaszekciókon. Nem új hírletöltés.
- **Kész, ha:** A megfelelő cikk/URL nyílik; kiadás és szekcióválasztás a helyi tabokat/listát ténylegesen módosítja és mentve visszaáll.

#### T43 — 4.3–5.1.1 Play-appok helyi overflow és könyvtárak

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 4.3, 4.4.4, 5.1.1.
- **Forráscsoportok:** 4.3-12, 4.4.4-12, 4.4.4-14, 5.1.1-12, 5.1.1-14.
- **Elkészítendő és határ:** Music: helyi keresési More listák, overflow sor/album/queue műveletek, helyi Settings. Movies: helyi pin/offline jelölés, TV-mintaelem megnyitás, Settings. Books: könyvtár/olvasó overflow helyi könyvadatok/megosztás/offline/Sort/Settings. Games: mintajáték/mintajátékos részlet és overflow, helyi Settings. Cast, Search online, számlázás és tényleges külső játékindítás marad korlát. A műveletkészletet e négy felsorolás zárja, nem általános „minden pa-unsupported”.
- **Kész, ha:** A More lista nem csonkolt találatot mutat; helyi média/listaművelet és offline jelölés menthető; könyvrendezés, mintajátékos-részlet és apponkénti preferencia működik. Külső játék futtatását nem színleli.

#### T44 — 5.1.1 Telefon beállítások és Import/export

- **Ütem:** Mag, részben; a többi későbbi lista.
- **Állapot:** A mostani rész nyitott; a későbbi rész halasztott.
- **Mostani rész:** 5.1.1 Telefon Import/export a T11 helyi folyamatára kötve; Settings belépés, valamint a gyári Dialer helyi megjelenítési/rendezési, hang/rezgés és gyorsválasz-preferenciái.
- **Mostani készfeltétel:** A Telefonból megnyílik a helyi import/export és a saját Settings; a felsorolt preferenciák menthetők és hatnak a helyi megjelenítésre/hang/gyorsválasz-modellre; History és New contact változatlanul működik.
- **Későbbi rész:** A teljes Calls/alárendelt telefonhálózati, akadálymentességi vagy egyéb haladó beállításfa átépítése; új szolgáltatói működés nincs.
- **A következő eredeti terjedelem/készfeltétel a teljes jelöltet dokumentálja; nem bővíti a mostani részt.**
- **Verziók:** 5.1.1.
- **Forráscsoportok:** 5.1.1-15.
- **Elkészítendő és határ:** Import/export a T11 közös helyi névjegyfolyamatára mutat; Settings a shamu gyári Dialer helyi megjelenítési/hang/hívásbeállítási értékeivel. Valódi szolgáltatói hívásátirányítás, SIM-írás nincs.
- **Kész, ha:** A Telefon saját menüjéből mindkét helyi cél megnyílik; preferenciák menthetők és a helyi tárcsázóban alkalmazhatók; Call History/New contact működése megmarad.

#### T45 — 4.4.4/5.1.1 helyi nyomtatási folyamat és webshortcut

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 4.4.4, 5.1.1.
- **Forráscsoportok:** 4.4.4-03, 4.4.4-15, 4.4.4-17, 5.1.1-03, 5.1.1-21, 5.1.1-22, 5.1.1-30.
- **Elkészítendő és határ:** 4.4.4 Galéria/Photos/Chrome Print; 5.1.1 Photos/Gmail/Chrome/Docs/Sheets/Slides Print: saját korabeli PrintSpooler előnézet, helyi Save as PDF, megszakítás. 4.4.4/5.1.1 Chrome Add to homescreen. A 6/7 print modul adatátadási referencia, nem átmásolandó UI. Fizikai nyomtató és print service telepítés nem része.
- **Kész, ha:** Az előnézet a forrás képét/szövegét kapja, a mentett helyi PDF elem megnyitható; Cancel nem ment; webshortcut a jó URL-t nyitja. Minden felsorolt belépés külön teszteset.

#### T46 — Gmail helyi About oldal

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 4.3, 4.4.4.
- **Forráscsoportok:** 4.3-05, 4.4.4-05.
- **Elkészítendő és határ:** 4.3 Gmail 4.5.1 és 4.4.4 Gmail 4.6.1: a már kirajzolt About Gmail sor helyi verzió/build oldala. 5.1.1-en a headers csak general/account, ezért ott nincs About feladat és nem kerül be új menüpont. Welcome/Learn more és külső jogi/súgólink marad korlát.
- **Kész, ha:** 4.3 és 4.4.4 alatt a létező About Gmail sor a megfelelő gyári verziót mutatja; 5.1.1-en nem jelenik meg új, forrás nélküli About menüpont.

#### T47 — Tartalékágak egyszeri elérhetőségi ellenőrzése

- **Ütem:** Későbbi lista — külön fejlesztési döntés szükséges.
- **Állapot:** Halasztott, nincs megépítve; nem része az aktuális magnak.
- **Verziók:** 2.1, 6.0.1, 7.1.2.
- **Forráscsoportok:** 2.1-02, 2.1-03, 2.1-04, 6.0.1-01, 6.0.1-02, 6.0.1-03, 6.0.1-04, 7.1.2-01, 7.1.2-02, 7.1.2-03, 7.1.2-04.
- **Elkészítendő és határ:** 2.1 összes jegyzett app/widget/Settings-cél; 6.0.1 app/widget/Settings/Quick Settings/Now célok; 7.1.2 app/widget/Settings/app-prefs célok. A 4.3/4.4 Safety information és ismerten inaktív ágak megtartják besorolásukat. Későbbi feladatként ez véges belépési-/preferencia-/providerjegyzék bejárás, nem minden lehetséges hibás intent generálása.
- **Kész, ha:** A jelenlegi jegyzékből elérhető célokhoz nincs indokolatlan missing fallback. Az ismeretlen célokra továbbra is van védelmi renderer. Ha konkrét normál UI-út hibás, útvonallal és új azonosítóval dokumentálandó; nem indokol általános fallbacktörlést.

#### T48 — Elutasító szövegek és regressziós kör lezárása

- **Ütem:** Mag, részben; a többi későbbi lista.
- **Állapot:** A mostani rész nyitott; a későbbi rész halasztott.
- **Mostani rész:** Közös regressziós teszt a mag útjaihoz; kizárólag a javított appokban érintett elutasító szövegek közös, lefordított kulcsainak rendezése. Nem teljes, nyolcverziós szöveg-újraaudit.
- **Mostani készfeltétel:** Minden elkészült mag-út pozitív eredményre, mentésre, Cancel/Back működésre is tesztelt; az érintett üzenetkulcsok a projekt öt nyelvén feloldhatók; a halasztott tétel nem szerepel kész/skipelt sikernek jelentett funkcióként.
- **Későbbi rész:** Az összes verzió/app megmaradó üzenetének teljes körű egységesítése és a későbbi csomagok regressziós esetei.
- **A következő eredeti terjedelem/készfeltétel a teljes jelöltet dokumentálja; nem bővíti a mostani részt.**
- **Verziók:** 2.1, 2.3.6, 4.0.4, 4.3, 4.4.4, 5.1.1, 6.0.1, 7.1.2.
- **Forráscsoportok:** Az összes megmaradó üzenet és javított út; közös lezáró feladat.
- **Elkészítendő és határ:** A megmaradó azonos értelmű F/U/N/D/V/C/H üzenetek közös lefordított kulcsra vezetése; indokolt kamera/segélyhívás/offline/fallback külön szöveg maradhat. A projekt öt UI-nyelvén legyen feloldható szöveg. Apponként a funkciós commit után, végül maradékellenőrzés. A közös regressziós teszt bevezetése induláskor történik, nem csak a végén.
- **Kész, ha:** Nincs nyers undefined/fordítatlan kulcs vagy azonos jelentésű véletlen változat; a szándékos korlát nem lett eltüntetve sikertoasttal. A javított utak pozitív eredményt, perzisztenciát és Cancel/Back működést is ellenőrző közös tesztben szerepelnek.

#### T49 — 4.4.4 Photo Sphere és 5.1.1 Photo Sphere/Lens Blur

- **Ütem:** Mag, részben; a többi későbbi lista.
- **Állapot:** A mostani rész nyitott; a későbbi rész halasztott.
- **Mostani rész:** 4.4.4 és 5.1.1 Photo Sphere irányított helyi felvétel, megszakítás, mentett kép és gömbnézet a már meglévő 7.1-es guided capture modell korabeli megfelelőjeként.
- **Mostani készfeltétel:** A módválasztóból végigjárható Photo Sphere; a mentett eredmény a könyvtárban megnyitható és megfelelő gömbnézetet kap; Cancel nem ment.
- **Későbbi rész:** 5.1.1 Lens Blur, mélység/szerkesztési folyamat, valamint bármilyen új illesztő- vagy mélységrekonstrukciós motor.
- **A következő eredeti terjedelem/készfeltétel a teljes jelöltet dokumentálja; nem bővíti a mostani részt.**
- **Verziók:** 4.4.4, 5.1.1.
- **Forráscsoportok:** 4.4.4-16, 5.1.1-19.
- **Elkészítendő és határ:** A gyári kamera vezetett Photo Sphere felvételi útja 4.4.4/5.1.1-en, Lens Blur 5.1.1-en: módhoz illő útmutatás, előrehaladás, megszakítás és helyi mentett eredmény; a meglevő 6/7 guided capture modell referenciaként. Nincs új fizikai szenzorfúzió, általános képfűző vagy valós mélységrekonstrukció. A mentett helyi kép és a módnak megfelelő nézeti/szerkesztési adatok igen.
- **Kész, ha:** A folyamat normál módválasztásból végigjárható; eredmény a könyvtárban megnyitható és a módhoz tartozó helyi megjelenítést kapja; Lens Blur hatása módosítható a mentett demóképen; Cancel nem ment. Nem elég a mód nevének átírása vagy sikerüzenet.

### Csoportonkénti döntések

Az azonosító a verzió és az eredeti audit adott verzión belüli sorszáma. Így a forrás és az eredeti részletes leírás a lenti bizonyítéktáblában egyértelműen visszakereshető. A „Meghagyott rész” minden sorban tudatos döntés; nem elfelejtett feladat.

#### Döntések — 2.1

| Csoport | App | Besorolás | Ütem | Javítandó rész / feladat | Meghagyott rész | Indok / pontosítás |
|---|---|---|---|---|---|---|
| 2.1-01 | Android Market | Szándékos korlát | Nincs aktuális funkciófeladat | — | Vásárlás | Valódi fizetés; szándékos szolgáltatási korlát. |
| 2.1-02 | Beállítások | Tartalékág | Később: T47 | Normál Settings-célok véges bejárása — T47 | Ismeretlen intent/típus védelmi renderer | Tartalékág, nem bizonyított aktív hiány. |
| 2.1-03 | Kezdőképernyő | Tartalékág | Később: T47 | Jegyzett widgetek ellenőrzése — T47 | Ismeretlen widget fallback | Tartalékág. |
| 2.1-04 | Rendszer | Tartalékág | Később: T47 | Jegyzett app/overlay célok ellenőrzése — T47 | Ismeretlen képernyő fallback | Moduljegyzék korábban rendben; általános guard megmarad. |
| 2.1-05 | Fiókok, Email, Facebook, böngésző | Szándékos korlát | Nincs aktuális funkciófeladat | — | Valódi belépés, élő internet/szolgáltatás | Offline korlát, nem új helyi funkciófeladat. |

#### Döntések — 2.3.6

| Csoport | App | Besorolás | Ütem | Javítandó rész / feladat | Meghagyott rész | Indok / pontosítás |
|---|---|---|---|---|---|---|
| 2.3.6-01 | Böngésző | Javítandó | Később: T08 | Böngésző Select text — T08 | — | Helyi működés; a generikus elutasítás nem indokolt. |
| 2.3.6-02 | Gmail | Vegyes | Mag: T04; Később: T08 | Gmail Settings; beszélgetés Select text — T04, T08 | Help | Vegyes: a helyi művelet javítandó, az online súgó korlát. |
| 2.3.6-03 | Email | Vegyes | Később: T09 | Incoming/Outgoing settings helyi szerkesztése — T09 | Valódi szerverkapcsolat | Helyi működés; a generikus elutasítás nem indokolt. |
| 2.3.6-04 | Email | Szándékos korlát | Nincs aktuális funkciófeladat | — | Új fiók Manual setup | Újfiókos belépési folyamat; az átadó fiókműveleti kizárása érvényes, a meglévő fiók helyi mezői T09. |
| 2.3.6-05 | Névjegyszerkesztő | Javítandó | Később: T10 | Take photo → névjegykép — T10 | — | Helyi működés; a generikus elutasítás nem indokolt. |
| 2.3.6-06 | Galéria | Javítandó | Később: T12 | Show on map → a helyi Maps megfelelő pontja — T12 | — | Helyi működés; a generikus elutasítás nem indokolt. |
| 2.3.6-07 | Üzenetek | Vegyes | Később: T13 | Video/audio választás és felvétel; slideshow — T13 | Valódi MMS-küldés | Helyi működés; a generikus elutasítás nem indokolt. |
| 2.3.6-08 | Üzenetek | Javítandó | Később: T13 | Csatolt kép View — T13 | — | Helyi működés; a generikus elutasítás nem indokolt. |
| 2.3.6-09 | Zene | Javítandó | Később: T14 | Use as ringtone; Delete — T14 | — | Helyi működés; a generikus elutasítás nem indokolt. |
| 2.3.6-10 | Óra | Vegyes | Később: T15 | Dock settings helyi preferenciák — T15 | Fizikai dokkoló kezelése | Helyi működés; a generikus elutasítás nem indokolt. |
| 2.3.6-11 | Beállítások | Szándékos korlát | Nincs aktuális funkciófeladat | — | Add account | Valódi rendszerszintű fiókművelet. |
| 2.3.6-12 | Beállítások | Szándékos korlát | Nincs aktuális funkciófeladat | — | Manage personalization webes fiókoldal | Google-fiók személyre szabás, nem a helyi keresőpreferenciák. |
| 2.3.6-13 | Google Voice | Vegyes | Később: T16 | Google Voice Settings helyi értékek — T16 | Balance; Help; aktiválás/fizetés | Vegyes: lokális prefsor igen, távoli egyenleg nem. |
| 2.3.6-14 | Car Home | Javítandó | Később: T15 | Car Home Settings — T15 | — | Helyi működés; a generikus elutasítás nem indokolt. |
| 2.3.6-15 | Talk | Vegyes | Később: T17 | Talk Settings; Add to chat helyi résztvevőkkel — T17 | Sign out; Help | Helyi működés; a generikus elutasítás nem indokolt. |
| 2.3.6-16 | Maps / Navigation | Vegyes | Később: T12 | Maps Labs/Cache settings; Navigation Settings helyi része — T12 | Help; Terms; tényleges térképletöltés | Helyi működés; a generikus elutasítás nem indokolt. |
| 2.3.6-17 | Maps / Latitude / Places | Vegyes | Később: T12 | Transit/Bicycling/Wikipedia helyi réteg; Places Add kategória — T12 | Latitude Add friends távoli kapcsolat | Helyi működés; a generikus elutasítás nem indokolt. |
| 2.3.6-18 | Books / Earth | Vegyes | Később: T18, T19 | Books About/Manage eBooks; Earth Settings — T18, T19 | Books Help; online könyvvásárlás | Helyi működés; a generikus elutasítás nem indokolt. |
| 2.3.6-19 | YouTube | Vegyes | Később: T20 | YouTube Settings — T20 | Flag | Helyi működés; a generikus elutasítás nem indokolt. |
| 2.3.6-20 | News & Weather | Szándékos korlát | Nincs aktuális funkciófeladat | — | News terms of service; Mobile privacy policy | Külső jogi tájékoztató linkek. |
| 2.3.6-21 | Android Market | Vegyes | Később: T21 | Developer Info helyi adatok; Sharing; Market content; PIN — T21 | Külső fejlesztői weboldal | A tárolt adatlap és helyi szűrés nem igényel online szolgáltatást. |
| 2.3.6-22 | Android Market | Szándékos korlát | Nincs aktuális funkciófeladat | — | Market Help | Online súgó. |
| 2.3.6-23 | Zárolás / Telefon | Szándékos korlát | Nincs aktuális funkciófeladat | — | Emergency call | Valódi telefonhálózat; offline korlát. |

#### Döntések — 4.0.4

| Csoport | App | Besorolás | Ütem | Javítandó rész / feladat | Meghagyott rész | Indok / pontosítás |
|---|---|---|---|---|---|---|
| 4.0.4-01 | Gmail | Vegyes | Mag: T04 | Gmail Settings; Manage labels; Label settings — T04 | Help; Send feedback | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.0.4-02 | Névjegyek | Vegyes | Mag: T11 kijelölt része | Share; ringtone; Home shortcut; lista szűrés/import/export/Settings — T11 | Accounts; Help; fizikai SIM-írás | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.0.4-03 | Kamera | Javítandó | Mag: T05 | Kamera Video; Panorama — T05 | — | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.0.4-04 | Billentyűzet / hangbevitel | Szándékos korlát | Nincs aktuális funkciófeladat | — | Kiegészítő/online beszédnyelv letöltése | Távoli csomagletöltés és beszédfelismerő szolgáltatás; meglévő helyi nyelvválasztás nem hiányzik. |
| 4.0.4-05 | Play Music | Vegyes | Később: T22 | Play Music Search music; Make instant mix; Settings — T22 | Help | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.0.4-06 | Play Store | Vegyes | Később: T21 | Play Store Content filtering/PIN — T21 | Accounts; Help | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.0.4-07 | Google+ | Javítandó | Később: T23 | Google+ New post helyi demóposzt — T23 | — | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.0.4-08 | Talk | Vegyes | Később: T17 | Talk Friend info; Add to chat; Display options; Settings — T17 | Voice/video chat; Sign out; Help; Feedback | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.0.4-09 | YouTube | Vegyes | Később: T20 | YouTube Search; Record helyben; Add to; Share; csatorna; Settings — T20 | Valódi upload; Feedback; Help | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.0.4-10 | Play Books | Vegyes | Később: T18 | Books Search; About the book; Share; offline jelölés; Read aloud; Refresh — T18 | Help; Accounts | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.0.4-11 | Play Movies | Vegyes | Később: T24 | Movies helyi offline lista; Settings; Retry natív hibaállapot — T24 | Accounts; Help; Contact us; Feedback; valódi kölcsönzés/stream | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.0.4-12 | Google keresés | Javítandó | Később: T25 | Searchable items — T25 | — | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.0.4-13 | Google+ Messenger | Vegyes | Később: T26 | Google+ Messenger szál; New conversation; Settings — T26 | Feedback; Help | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.0.4-14 | Movie Studio | Vegyes | Később: T27 | Movie Studio projekt és helyi szerkesztő — T27 | Új natív kodek/MP4 renderelő | Helyi szerkesztő; a nagyobb munkaigény nem szolgáltatási korlát. |
| 4.0.4-15 | Navigation / Places | Vegyes | Később: T28 | Navigation Contacts/Starred; Places keresés és kategóriák — T28 | Speak destination valódi hangfelismerés | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.0.4-16 | Maps / Earth | Vegyes | Később: T12, T19 | Maps Settings; Earth Search/Layers/North up/My Location/Settings — T12, T19 | Help; Terms; élő helyadat | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.0.4-17 | Beállítások | Vegyes | Később: T29 | System updates helyi állapot; TalkBack konfiguráció — T29 | OTA telepítés; Accounts Add/Remove; jogi weboldalak | Vegyes: helyi activity és valódi szolgáltatási művelet elkülönítve. |
| 4.0.4-18 | Beállítások / fejlesztői és Wi-Fi sorok | Vegyes | Később: T30 | Music effects választó; readonly/információs célok megfelelő kezelése — T30 | Host OS tanúsítványtár/hardver átállítása | Az eredeti példa pontosítva: a certs sor definíciója létezik, de az if(ICS) Advanced Wi-Fi visszatérés nem rajzolja ki. Ezért az ICS Wi-Fi tanúsítványsor nem új funkciófeladat. |
| 4.0.4-19 | Email | Vegyes | Később: T09 | Email Quick responses; Choose ringtone; Incoming/Outgoing settings — T09 | Remove account | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.0.4-20 | Zárolás / Telefon | Szándékos korlát | Nincs aktuális funkciófeladat | — | Emergency call | Telefonhálózati korlát. |
| 4.0.4-21 | News & Weather | Szándékos korlát | Nincs aktuális funkciófeladat | — | News & Weather jogi linkek | Külső tájékoztató linkek. |

#### Döntések — 4.3

| Csoport | App | Besorolás | Ütem | Javítandó rész / feladat | Meghagyott rész | Indok / pontosítás |
|---|---|---|---|---|---|---|
| 4.3-01 | Email | Kiszűrt találat | Mag: T02 | 4.3: az eddig elfedett helyi Email prefsorok a T02 részei — T02 | Remove account | 4.3-ban kiszűrt forráság volt, nem újabb konkrét korlátcsoport; a Settings megnyitásakor ezt is be kell kötni. |
| 4.3-02 | Chrome | Vegyes | Mag: T07 | A T07-ben felsorolt pontos kategóriák, továbbá DNT és 5.1 Touch to Search — T07 | Passwords; Autofill; Sign in; Help; Legal information | A Chrome szűkítését a korábbi átadó már megengedte. Passwords/Autofill technikailag lehetne helyi modell, itt tudatos terjedelmi kizárás, nem technikai lehetetlenség. |
| 4.3-03 | Chrome | Szándékos korlát | Nincs aktuális funkciófeladat | — | Help | 4.3-ban ez a csoport csak Help; Print/Home shortcut ebben a menüben nincs. |
| 4.3-04 | Gmail | Vegyes | Mag: T04 | Inbox sound & vibrate; Days of mail to sync; Manage labels — T04 | Tényleges szerveroldali sync/automatikus válasz | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.3-05 | Gmail | Vegyes | Később: T46 | A ténylegesen kirajzolt About Gmail helyi verzióoldala — T46 | Welcome/Learn more webes út | A gmail.js:68 headers tömbben az About Gmail ténylegesen szerepel; helyi információ, nem online tájékoztató. |
| 4.3-06 | Naptár | Vegyes | Mag: T03 | Settings; Calendars to display — T03 | Help/Feedback | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.3-07 | Hangouts | Vegyes | Később: T32 | Invites helyi lista; Settings; People & options; Add people — T32 | Help; Feedback | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.3-08 | Hangouts | Vegyes | Később: T10 | Take photo → helyi csatolmány — T10 | Google+ photos távoli könyvtár | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.3-09 | Email / Gmail | Vegyes | Mag: T02 | Sync options → meglévő helyi fiók szinkronpreferenciái — T02 | Help; Help & feedback; valódi szinkron | A helyi választó nem azonos egy szerverrel végzett szinkronizálással. |
| 4.3-10 | Névjegyek | Vegyes | Mag: T11 kijelölt része | Share; Home shortcut; lista szűrés/import/export/Settings; Set ringtone — T11 | Accounts; Help; fizikai SIM-írás | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.3-11 | Play Store | Vegyes | Később: T21 | Play Store Share — T21 | Redeem; Help; Open source licenses külső link; Flag | A jogi webes link a terv által szándékosan megtartott korlát, nem új jogi tartalomgyűjtési feladat. |
| 4.3-12 | Play Music / Movies / Books / Games | Vegyes | Később: T43 | A T43 zárt Music/Movies/Books/Games helyi műveletlistája — T43 | Cast; online keresés/beszerzés; külső játék tényleges indítása; Help/fiók | Nem minden pa-unsupported ugyanaz: helyi overflow és szolgáltatás külön döntést kapott. |
| 4.3-13 | Óra | Vegyes | Mag: T33 | Óra More options menü és Settings — T33 | Help | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.3-14 | Google Settings / Google keresés | Vegyes | Később: T23, T25 | Google keresés helyi fejléc-beállítások; Google+ belépés — T25, T23 | Ads by Google/Ads Settings/Learn more; Help; Feedback; távoli fiók | A gms-settings már működő kapcsolóit nem kell újraépíteni. |
| 4.3-15 | Email | Javítandó | Mag: T02 | Email Settings és helyi prefsorok — T02 | — | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.3-16 | Galéria | Javítandó | Később: T31 | Galéria videó Trim; Mute — T31 | — | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.3-17 | SMS/MMS | Javítandó | Később: T13 | MMS audio Play; a kirajzolt helyi mellékletforrások — T13 | — | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.3-18 | Drive | Vegyes | Később: T34 | Drive New/Search/mappa/overflow/Share helyi fájlműveletek — T34 | Felhőszinkron és online jogosultságkezelés | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.3-19 | Keep | Vegyes | Később: T35 | Keep New recording; Share; Settings — T35 | Send feedback; Help | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.3-20 | Google+ / YouTube / Earth | Vegyes | Később: T19, T20, T23 | Google+ helyi poszt/Settings; YouTube helyi lista/megosztás/értékelés/URL/Settings; Earth helyi eszközök — T23, T20, T19 | Online publikálás; YouTube Flag; webes Help/Feedback/Tutorial; Sign out | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.3-21 | Currents / Play Magazines | Vegyes | Később: T36 | Currents és Magazines helyi keresés/tartalom/Sync now/Refresh/offline/Settings — T36 | Manage subscriptions; Help; valódi friss tartalomletöltés | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.3-22 | Google+ Messenger / Wallet / Movie Studio | Vegyes | Később: T26, T27 | Messenger helyi szál/új szál/Settings; Movie Studio helyi projekt — T26, T27 | Wallet dashboard pénzügyi/fiókszolgáltatás | Vegyes három app: a Wallet nem szolgál ürügyül a két helyi app hiányának megtartására. |
| 4.3-23 | Sound Search | Szándékos korlát | Nincs aktuális funkciófeladat | — | Sound Search fiókválasztás | Valódi fiókművelet. |
| 4.3-24 | Beállítások | Tartalékág | Nincs aktuális funkciófeladat | — | Safety information offline tájékoztató renderút | Tartalék/nem igazolt normál menücél; nincs új javítási feladat. |
| 4.3-25 | Zárolás / Telefon | Szándékos korlát | Nincs aktuális funkciófeladat | — | Emergency call | Telefonhálózati korlát. |
| 4.3-26 | News & Weather | Szándékos korlát | Nincs aktuális funkciófeladat | — | News & Weather jogi linkek | Külső tájékoztatás. |
| 4.3-27 | Megosztott régi Settings-kód | Kiszűrt találat | Nincs aktuális funkciófeladat | — | ICS-only kód ág | Kiszűrt/inaktív; nem kell az ICS felületet Jelly Beanbe bevinni. |

#### Döntések — 4.4.4

| Csoport | App | Besorolás | Ütem | Javítandó rész / feladat | Meghagyott rész | Indok / pontosítás |
|---|---|---|---|---|---|---|
| 4.4.4-01 | Email | Vegyes | Később: T09 | Quick responses; Choose ringtone; Incoming/Outgoing settings — T09 | Valódi szerverkapcsolat | Helyi űrlapok és választók. |
| 4.4.4-02 | Chrome | Vegyes | Mag: T07 | A T07-ben felsorolt pontos kategóriák, továbbá DNT és 5.1 Touch to Search — T07 | Passwords; Autofill; Sign in; Help; Legal information | A Chrome szűkítését a korábbi átadó már megengedte. Passwords/Autofill technikailag lehetne helyi modell, itt tudatos terjedelmi kizárás, nem technikai lehetetlenség. |
| 4.4.4-03 | Chrome | Vegyes | Később: T45 | Print helyi előnézet/PDF; Add to homescreen — T45 | Help; inkognitó Learn more | A fizikai nyomtatás helyett a korabeli helyi PrintSpooler/PDF folyamat készül. |
| 4.4.4-04 | Gmail | Vegyes | Mag: T04 | Inbox sound & vibrate; Days of mail to sync; Manage labels — T04 | Tényleges szerveroldali sync/automatikus válasz | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.4.4-05 | Gmail | Vegyes | Később: T46 | A ténylegesen kirajzolt About Gmail helyi verzióoldala — T46 | Welcome/Learn more webes út | A gmail.js:68 headers tömbben az About Gmail ténylegesen szerepel; helyi információ, nem online tájékoztató. |
| 4.4.4-06 | Naptár | Vegyes | Mag: T03 | Settings; Calendars to display — T03 | Help/Feedback | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.4.4-07 | Hangouts | Vegyes | Később: T32 | Invites helyi lista; Settings; People & options; Add people — T32 | Help; Feedback | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.4.4-08 | Hangouts | Vegyes | Később: T10 | Take photo → helyi csatolmány — T10 | Google+ photos távoli könyvtár | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.4.4-09 | Email / Gmail | Vegyes | Később: T09 | Sync options → meglévő helyi fiók szinkronpreferenciái — T09 | Help; Help & feedback; valódi szinkron | A helyi választó nem azonos egy szerverrel végzett szinkronizálással. |
| 4.4.4-10 | Névjegyek | Vegyes | Mag: T11 kijelölt része | Share; Home shortcut; lista szűrés/import/export/Settings; Set ringtone — T11 | Accounts; Help; fizikai SIM-írás | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.4.4-11 | Play Store | Vegyes | Később: T21 | Play Store Share — T21 | Redeem; Help; Open source licenses külső link; Flag | A jogi webes link a terv által szándékosan megtartott korlát, nem új jogi tartalomgyűjtési feladat. |
| 4.4.4-12 | Play Music / Movies / Books / Games | Vegyes | Később: T43 | A T43 zárt Music/Movies/Books/Games helyi műveletlistája — T43 | Cast; online keresés/beszerzés; külső játék tényleges indítása; Help/fiók | Nem minden pa-unsupported ugyanaz: helyi overflow és szolgáltatás külön döntést kapott. |
| 4.4.4-13 | Óra | Vegyes | Mag: T33 | Óra More options menü és Settings — T33 | Help | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.4.4-14 | Google Settings / Google keresés | Vegyes | Később: T23, T25, T43 | Google keresés helyi fejléc-beállítások; Google+ belépés; Play Games helyi prefs-belépés — T25, T23, T43 | Ads by Google/Ads Settings/Learn more; Help; Feedback; távoli fiók | A gms-settings már működő kapcsolóit nem kell újraépíteni. |
| 4.4.4-15 | Galéria | Vegyes | Később: T31, T45 | Galéria Trim/Mute; Print helyi PDF-folyamat — T31, T45 | Fizikai nyomtatás | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.4.4-16 | Kamera | Vegyes | Mag: T49 kijelölt része | Photo Sphere helyi vezetett felvétel és mentés — T49 | Valódi szenzorfúzió/hardveres fotóillesztő | Helyi kameramód; részletes készfeltétel a T49 alatt. |
| 4.4.4-17 | Photos | Vegyes | Később: T38, T45 | Photos Slideshow/Download/Select photos/Settings; Print — T38, T45 | Feedback; Help; valódi felhős backup | Edit már működik, nem új feladat. |
| 4.4.4-18 | Google Now | Vegyes | Később: T37 | Google Now kártyamenü; Where; ismétlődés — T37 | Valódi háttér-geofencing | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.4.4-19 | Drive | Vegyes | Később: T34 | Drive Create/Refresh/Filter/Sort/Settings/helyi fájlműveletek — T34 | Product Tour; felhőszolgáltatás | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.4.4-20 | Keep / Google+ / YouTube / Earth | Vegyes | Később: T19, T20, T23, T35 | Keep Share/Settings; Google+ helyi közösségi műveletek/Settings; YouTube Settings; Earth hely/Share/Settings — T35, T23, T20, T19 | Help/Feedback/Tutorial; valódi publikálás/fiókművelet | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.4.4-21 | Newsstand | Vegyes | Később: T36 | Newsstand Search/My News/My Magazines/Saved/Explore/Settings/On device only — T36 | Help; távoli előfizetés | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.4.4-22 | Quickoffice | Vegyes | Később: T39 | Quickoffice helyi Drive/Device és helyi overflow — T39 | Valódi Drive-fiók és webes support | Helyi működés; a generikus elutasítás nem indokolt. |
| 4.4.4-23 | Wallet | Szándékos korlát | Nincs aktuális funkciófeladat | — | Wallet Send money/Transactions/Balance/Add card és fiókmenü | Valódi pénzügyi szolgáltatás; új pénzügyi demó-adatmodell nem része ennek a tervnek. |
| 4.4.4-24 | Beállítások | Tartalékág | Nincs aktuális funkciófeladat | — | Safety information offline renderút | Tartalék/nem igazolt menücél. |
| 4.4.4-25 | Zárolás / Telefon | Szándékos korlát | Nincs aktuális funkciófeladat | — | Emergency call | Telefonhálózati korlát. |
| 4.4.4-26 | News & Weather | Szándékos korlát | Nincs aktuális funkciófeladat | — | News & Weather jogi linkek | Külső tájékoztatás. |
| 4.4.4-27 | Megosztott régi Settings-kód | Kiszűrt találat | Nincs aktuális funkciófeladat | — | ICS-only ág | Kiszűrt/inaktív. |
| 4.4.4-28 | Launcher | Kiszűrt találat | Nincs aktuális funkciófeladat | — | Üres GEL_UNSIMULATED guard | Kiszűrt; jelenleg nem tilt appot. |

#### Döntések — 5.1.1

| Csoport | App | Besorolás | Ütem | Javítandó rész / feladat | Meghagyott rész | Indok / pontosítás |
|---|---|---|---|---|---|---|
| 5.1.1-01 | Email | Vegyes | Később: T09 | Quick responses; Choose ringtone; Incoming/Outgoing settings — T09 | Valódi szerverkapcsolat | Helyi űrlapok és választók. |
| 5.1.1-02 | Chrome | Vegyes | Mag: T07 | A T07-ben felsorolt pontos kategóriák, továbbá DNT és 5.1 Touch to Search — T07 | Passwords; Autofill; Sign in; Help; Legal information | A Chrome szűkítését a korábbi átadó már megengedte. Passwords/Autofill technikailag lehetne helyi modell, itt tudatos terjedelmi kizárás, nem technikai lehetetlenség. |
| 5.1.1-03 | Chrome | Vegyes | Később: T45 | Print helyi előnézet/PDF; Add to homescreen — T45 | Help; inkognitó Learn more | A fizikai nyomtatás helyett a korabeli helyi PrintSpooler/PDF folyamat készül. |
| 5.1.1-04 | Gmail | Vegyes | Mag: T04 | Inbox sound & vibrate; Days of mail to sync; Manage labels; Vacation responder — T04 | Tényleges szerveroldali sync/automatikus válasz | Helyi működés; a generikus elutasítás nem indokolt. |
| 5.1.1-05 | Gmail | Szándékos korlát | Nincs aktuális funkciófeladat | — | Welcome/Learn more | Az About Gmail csak a 4.3/4.4.4 headers tömbben szerepel. 5.1.1 gmail.js:61 general/account, ezért az eredeti feltételes audit itt nem jelent helyi About-hiányt. |
| 5.1.1-06 | Naptár | Vegyes | Mag: T03 | Settings — T03 | Help/Feedback | Helyi működés; a generikus elutasítás nem indokolt. |
| 5.1.1-07 | Hangouts | Vegyes | Később: T32 | Invites helyi lista; Settings; People & options; Add people; Blocked people — T32 | Help; Feedback; valódi Video call | Helyi működés; a generikus elutasítás nem indokolt. |
| 5.1.1-08 | Hangouts | Vegyes | Később: T10 | Take photo → helyi csatolmány — T10 | Google+ photos távoli könyvtár | Helyi működés; a generikus elutasítás nem indokolt. |
| 5.1.1-09 | Email / Gmail | Vegyes | Később: T09 | Sync options → meglévő helyi fiók szinkronpreferenciái — T09 | Help; Help & feedback; valódi szinkron | A helyi választó nem azonos egy szerverrel végzett szinkronizálással. |
| 5.1.1-10 | Névjegyek | Vegyes | Mag: T11 kijelölt része | Share; Home shortcut; lista szűrés/import/export/Settings — T11 | Accounts; Help; fizikai SIM-írás | Helyi működés; a generikus elutasítás nem indokolt. |
| 5.1.1-11 | Play Store | Vegyes | Később: T21 | Play Store Share — T21 | Redeem; Help; Open source licenses külső link; Flag | A jogi webes link a terv által szándékosan megtartott korlát, nem új jogi tartalomgyűjtési feladat. |
| 5.1.1-12 | Play Music / Movies / Books / Games | Vegyes | Később: T43 | A T43 zárt Music/Movies/Books/Games helyi műveletlistája — T43 | Cast; online keresés/beszerzés; külső játék tényleges indítása; Help/fiók | Nem minden pa-unsupported ugyanaz: helyi overflow és szolgáltatás külön döntést kapott. |
| 5.1.1-13 | Óra | Vegyes | Mag: T33 | Óra More options menü és Settings; Cities keresés (azonos az 5.1.1-23 tétellel) — T33 | Help | Helyi működés; a generikus elutasítás nem indokolt. |
| 5.1.1-14 | Google Settings / Google keresés | Vegyes | Később: T23, T25, T43 | Google keresés helyi fejléc-beállítások; Google+ belépés; Play Games helyi prefs-belépés — T25, T23, T43 | Ads by Google/Ads Settings/Learn more; Help; Feedback; távoli fiók | A gms-settings már működő kapcsolóit nem kell újraépíteni. |
| 5.1.1-15 | Telefon | Vegyes | Mag: T11 kijelölt része, T44 kijelölt része | Telefon Settings; Import/export közös helyi névjegyfolyamattal — T44, T11 | Valódi szolgáltatói beállítás és SIM-írás | Helyi működés; a generikus elutasítás nem indokolt. |
| 5.1.1-16 | Beállítások | Szándékos korlát | Nincs aktuális funkciófeladat | — | Open source licenses / Google legal külső tájékoztató út | A korábbi átadó jogi linkekre vonatkozó szándékos kizárása. Az újabb verziók jogi oldalai ettől még megmaradnak; itt nincs új tartalomgyűjtés. |
| 5.1.1-17 | Beállítások | Szándékos korlát | Nincs aktuális funkciófeladat | — | Accounts Add/Remove account | Valódi fiókművelet. |
| 5.1.1-18 | Beállítások | Vegyes | Később: T30 | Wi-Fi tanúsítványválasztó és helyi tárolás; readonly sorok kezelése — T30 | Host OS/hardver átállítása | Helyi működés; a generikus elutasítás nem indokolt. |
| 5.1.1-19 | Kamera | Vegyes | Mag: T49 kijelölt része | Photo Sphere és Lens Blur vezetett helyi felvételi mód — T49 | Valódi szenzorfúzió/mélységrekonstrukció | Helyi működés; a generikus elutasítás nem indokolt. |
| 5.1.1-20 | Kamera | Szándékos korlát | Nincs aktuális funkciófeladat | — | Kamera súgóikon | Online súgó. |
| 5.1.1-21 | Photos | Vegyes | Mag: T01; Később: T38, T45 | Photos saját Edit; Slideshow/Download/Select photos/Settings; Print — T01, T38, T45 | Feedback; Help; valódi felhős backup | Helyi működés; a generikus elutasítás nem indokolt. |
| 5.1.1-22 | Gmail | Vegyes | Mag: T06; Később: T45 | Gmail Attach file; Print helyi PDF-folyamat — T06, T45 | Fizikai nyomtatás | Helyi működés; a generikus elutasítás nem indokolt. |
| 5.1.1-23 | Óra | Javítandó | Mag: T33 | Cities keresés — T33 | — | Ugyanaz a vezérlő, mint az 5.1.1-13 csoport egyik része; nincs kétszer számolt munka. |
| 5.1.1-24 | Google Now | Vegyes | Később: T37 | Now kártyamenü; Where; ismétlődés — T37 | Valódi háttér-geofencing | Helyi működés; a generikus elutasítás nem indokolt. |
| 5.1.1-25 | Drive | Vegyes | Később: T34 | Drive Create/Refresh/Filter/Sort és új/keresés gombok — T34 | Felhőszolgáltatás | Helyi működés; a generikus elutasítás nem indokolt. |
| 5.1.1-26 | Keep | Javítandó | Később: T35 | Keep Make a copy; Send; New recording — T35 | — | Helyi működés; a generikus elutasítás nem indokolt. |
| 5.1.1-27 | Google+ / YouTube / Earth | Vegyes | Később: T19, T20, T23 | Google+ Settings; YouTube Settings; Earth hely/Share és helyi drawer/prefs — T23, T20, T19 | Feedback; Help; Sign out; távoli publikálás | Helyi működés; a generikus elutasítás nem indokolt. |
| 5.1.1-28 | News & Weather | Vegyes | Később: T42 | News & Weather Open in browser; Change editions; Manage sections — T42 | Új hírek hálózati letöltése | Helyi működés; a generikus elutasítás nem indokolt. |
| 5.1.1-29 | Docs / Sheets / Slides | Javítandó | Később: T40 | Docs/Sheets/Slides drawer/Grid/Sort/Open document/Refresh — T40 | — | Helyi működés; a generikus elutasítás nem indokolt. |
| 5.1.1-30 | Docs / Sheets / Slides | Vegyes | Később: T40, T45 | Docs/Sheets/Slides Share link/Send file/offline/Move/Home shortcut/Print — T40, T45 | Távoli jogosultság és fizikai nyomtatás | Helyi működés; a generikus elutasítás nem indokolt. |
| 5.1.1-31 | Fit | Vegyes | Később: T41 | Fit Add activity; Add your weight; Settings — T41 | Élő szenzor és Fit-felhő; Help | Helyi működés; a generikus elutasítás nem indokolt. |
| 5.1.1-32 | Newsstand | Vegyes | Később: T36 | Newsstand Search/My Library/Bookmarks/Explore/Settings — T36 | Help & Feedback; távoli tartalom/előfizetés | Helyi működés; a generikus elutasítás nem indokolt. |
| 5.1.1-33 | Wallet | Szándékos korlát | Nincs aktuális funkciófeladat | — | Wallet fiók/pénzügyi vezérlők és wal-finish | A köztes már működő helyi oldalak megmaradnak; valódi véglegesítés/új pénzügyi modell nincs. |
| 5.1.1-34 | Play Store | Vegyes | Később: T21 | Play READ MORE és Send email → helyi compose — T21 | Visit webpage; Privacy policy; People; My account | Tárolt leírás és helyi appátadás nem online szolgáltatás; a többi távoli út marad korlát. |
| 5.1.1-35 | Hangkeresés | Szándékos korlát | Nincs aktuális funkciófeladat | — | Voice search unavailable offline | Valódi hangfelismerő szolgáltatás; nem új helyi UI-hiány. |
| 5.1.1-36 | SMS/Messenger | Javítandó | Később: T32 | SMS/Messenger People & options értesítési beállítás — T32 | — | Helyi működés; a generikus elutasítás nem indokolt. |
| 5.1.1-37 | Zárolás / Telefon | Szándékos korlát | Nincs aktuális funkciófeladat | — | Emergency call | Telefonhálózati korlát. |
| 5.1.1-38 | Megosztott régi Settings-kód | Kiszűrt találat | Nincs aktuális funkciófeladat | — | ICS-only ág | Kiszűrt/inaktív. |
| 5.1.1-39 | Launcher | Kiszűrt találat | Nincs aktuális funkciófeladat | — | Üres GEL_UNSIMULATED guard | Kiszűrt; nem tilt appot. |

#### Döntések — 6.0.1

| Csoport | App | Besorolás | Ütem | Javítandó rész / feladat | Meghagyott rész | Indok / pontosítás |
|---|---|---|---|---|---|---|
| 6.0.1-01 | Rendszer | Tartalékág | Később: T47 | A jelenlegi jegyzék normál UI-céljainak egyszeri ellenőrzése — T47 | Ismeretlen cél/missing modul védelmi renderer | Tartalékág; nem bizonyított, elérhető funkcióhiány. |
| 6.0.1-02 | Beállítások | Tartalékág | Később: T47 | A jelenlegi jegyzék normál UI-céljainak egyszeri ellenőrzése — T47 | Ismeretlen cél/missing modul védelmi renderer | Tartalékág; nem bizonyított, elérhető funkcióhiány. |
| 6.0.1-03 | Widgetek | Tartalékág | Később: T47 | A jelenlegi jegyzék normál UI-céljainak egyszeri ellenőrzése — T47 | Ismeretlen cél/missing modul védelmi renderer | Tartalékág; nem bizonyított, elérhető funkcióhiány. |
| 6.0.1-04 | Gyorsbeállítások / Google Now | Tartalékág | Később: T47 | A jelenlegi jegyzék normál UI-céljainak egyszeri ellenőrzése — T47 | Ismeretlen cél/missing modul védelmi renderer | Tartalékág; nem bizonyított, elérhető funkcióhiány. |
| 6.0.1-05 | Documents / Downloads | Kiszűrt találat | Nincs aktuális funkciófeladat | — | Kiszűrt félrevezető akciónév/komment | 6.0.1 keresés már működik; 7.1.2 location megosztás már működik. Nincs új feladat. |

#### Döntések — 7.1.2

| Csoport | App | Besorolás | Ütem | Javítandó rész / feladat | Meghagyott rész | Indok / pontosítás |
|---|---|---|---|---|---|---|
| 7.1.2-01 | Rendszer | Tartalékág | Később: T47 | A jelenlegi jegyzék normál UI-céljainak egyszeri ellenőrzése — T47 | Ismeretlen cél/missing modul védelmi renderer | Tartalékág; nem bizonyított, elérhető funkcióhiány. |
| 7.1.2-02 | Beállítások | Tartalékág | Később: T47 | A jelenlegi jegyzék normál UI-céljainak egyszeri ellenőrzése — T47 | Ismeretlen cél/missing modul védelmi renderer | Tartalékág; nem bizonyított, elérhető funkcióhiány. |
| 7.1.2-03 | Widgetek | Tartalékág | Később: T47 | A jelenlegi jegyzék normál UI-céljainak egyszeri ellenőrzése — T47 | Ismeretlen cél/missing modul védelmi renderer | Tartalékág; nem bizonyított, elérhető funkcióhiány. |
| 7.1.2-04 | App-beállítások | Tartalékág | Később: T47 | A jelenlegi jegyzék normál UI-céljainak egyszeri ellenőrzése — T47 | Ismeretlen cél/missing modul védelmi renderer | Tartalékág; nem bizonyított, elérhető funkcióhiány. |
| 7.1.2-05 | Messenger | Kiszűrt találat | Nincs aktuális funkciófeladat | — | Kiszűrt félrevezető akciónév/komment | 6.0.1 keresés már működik; 7.1.2 location megosztás már működik. Nincs új feladat. |

### A besoroláskor konkretizált további Maps- és Settings-utak

Ezek a jelenlegi kód tényleges, korábban nem külön csoportosított elutasító helyi sorai. A forrás megnyitva ellenőrizve, nem egy másik verzióból feltételezve. N01–N03 a T12, N04–N05 a T30 része. Az ICS tanúsítványsor és az LP Music effects közös, de nem kirajzolt kódja nem kerül ide.

| Azonosító | Verzió | Javítandó rész | Meghagyott rész | Forrás |
|---|---|---|---|---|
| N01 | 4.3 | My Places és Maps Settings helyi oldalak — T12; későbbi lista | Help/Send feedback, távoli helyelőzmény/fiók; 5.1 mikrofon valódi hangfelismerése | [stock-apps.js:283](https://github.com/szabolevi98/android-time-machine/blob/3e1201b86eb457e49b7dd04e79c14c4d1c75e42a/versions/4.3/stock-apps.js#L283) |
| N02 | 4.4.4 | Maps Settings helyi oldalak — T12; későbbi lista | Help/Send feedback, távoli helyelőzmény/fiók; 5.1 mikrofon valódi hangfelismerése | [stock-apps.js:88](https://github.com/szabolevi98/android-time-machine/blob/3e1201b86eb457e49b7dd04e79c14c4d1c75e42a/versions/4.4.4/stock-apps.js#L88) |
| N03 | 5.1.1 | Your places és Maps Settings helyi oldalak — T12; későbbi lista | Help/Send feedback, távoli helyelőzmény/fiók; 5.1 mikrofon valódi hangfelismerése | [stock-apps.js:89](https://github.com/szabolevi98/android-time-machine/blob/3e1201b86eb457e49b7dd04e79c14c4d1c75e42a/versions/5.1.1/stock-apps.js#L89) |
| N04 | 4.3 | Music effects és Advanced Wi-Fi Install certificates helyi folyamat — T30; későbbi lista | Host OS tanúsítványtár/hardver átállítása | [settings-detail.js:29](https://github.com/szabolevi98/android-time-machine/blob/3e1201b86eb457e49b7dd04e79c14c4d1c75e42a/versions/4.3/settings-detail.js#L29); [settings-system.js:280](https://github.com/szabolevi98/android-time-machine/blob/3e1201b86eb457e49b7dd04e79c14c4d1c75e42a/versions/4.3/settings-system.js#L280) |
| N05 | 4.4.4 | Music effects és Advanced Wi-Fi Install certificates helyi folyamat — T30; későbbi lista | Host OS tanúsítványtár/hardver átállítása | [settings-detail.js:29](https://github.com/szabolevi98/android-time-machine/blob/3e1201b86eb457e49b7dd04e79c14c4d1c75e42a/versions/4.4.4/settings-detail.js#L29); [settings-system.js:282](https://github.com/szabolevi98/android-time-machine/blob/3e1201b86eb457e49b7dd04e79c14c4d1c75e42a/versions/4.4.4/settings-system.js#L282) |

### Minden most javított mag-út közös készfeltétele

1. A saját verzió gyári APK/AOSP forrása és a használt erőforrás/menü/sorrend azonosítva; nincs újabb UI indokolatlan visszamásolása.
2. A normál UI belépéstől végigjárható, asztali egérrel és telefonszélességű érintéssel; a toast hiányán túl pozitív eredményt is ellenőrzünk.
3. Mentést ígérő művelet újranyitás/újratöltés után visszaáll; Cancel és Back nem módosít adatot vagy veszít munkát észrevétlenül.
4. A megosztás/picker/nyomtatás helyes objektumot és metaadatot ad át. A valódi hálózati szolgáltatást nem színleljük.
5. A közös regressziós teszt konkrét esete és a változáshoz indokolt meglévő ellenőrzések átmentek. Az elutasító stringek megmaradó eseteire nincs általános „sehol nem lehet toast” követelmény.
6. E riport T-feladat státusza, commitja és ellenőrzési eredménye frissült. A régi bizonyítéksorok történeti tényként maradnak.

### A besorolás ellenőrzése

- Mind a 153 eredeti auditcsoport egyedi azonosítóval szerepel; ebből pontosan 125 volt konkrét korlát. Nincs besorolatlan vagy kétszer felvett eredeti sor.
- Minden javítandó/vegyes sor létező T-feladatra mutat; minden csomagnak van forráscsoportja, terjedelme és készfeltétele. Ez nem teszi a későbbi csomagokat aktuális vállalássá.
- Az 5.1.1 Cities keresés két eredeti audit sora egy T33 feladatra mutat. A 4.3 elfedett Email prefsorok T02-höz tartoznak. Így nincs felfújt feladatszám a kettős találatok miatt.
- A 4.3/4.4.4 About Gmail helyi oldal; az 5.1.1 headers nem tartalmazza. Az audit feltételes mondatát a döntési tábla pontosítja.
- A besorolás dokumentumellenőrzés és célzott forrásolvasás. Új teljes böngészős auditot és implementációs teszteredményt nem állít.

---

## Megállapítás

Van eltérés a verziók részletességében. Különösen a régebbi Gmail, Chrome, Naptár, Photos és egyes Google-alkalmazások menüi között vannak elutasító utak, miközben az újabb verziók megfelelő felületei helyi demóként meg vannak építve. A „kiadási checklist kész” ezért nem jelenti, hogy mind a nyolc verzió minden funkciója azonos mélységű.

## Összesítés

| Verzió | Konkrét korlátcsoport | Offline korlátcsoport | Tartalékág | Kiszűrt találat | Nyers forrássor |
|---|---:|---:|---:|---:|---:|
| 2.1 | 1 | 1 | 3 | 0 | 7 |
| 2.3.6 | 22 | 1 | 0 | 0 | 56 |
| 4.0.4 | 20 | 1 | 0 | 0 | 59 |
| 4.3 | 23 | 1 | 1 | 2 | 108 |
| 4.4.4 | 24 | 1 | 1 | 2 | 106 |
| 5.1.1 | 35 | 2 | 0 | 2 | 119 |
| 6.0.1 | 0 | 0 | 4 | 1 | 8 |
| 7.1.2 | 0 | 0 | 4 | 1 | 10 |

A számok az alábbi táblázat csoportosítását mutatják, nem százalékos készültséget.

## Legfontosabb verzióközi eltérések

| Funkció | Régebbi ág | Újabb megfelelő / eltérés |
|---|---|---|
| Gmail-beállítások | 2.3.6 és 4.0.4: Settings elutasítás; 4.3–5.1.1: több konkrét fiókbeállítás hiányzik | 6.0.1 és 7.1.2: saját beállításképernyők és helyi preferenciakezelés |
| Naptár beállításai | 4.3 és 4.4.4: Settings és Calendars to display elutasítás; 5.1.1: Settings elutasítás | Már a 2.3.6-ban van gbpref-open/calendar út; 6.0.1 és 7.1.2 saját beállításokat ad. Ez nem pusztán időrendi fejlődés. |
| Chrome beállításkategóriák | 4.3–5.1.1: a Privacy és About kivételével sok kategória elutasít | 6.0.1/7.1.2: részletes preferencia- és webhelybeállítások |
| Fotószerkesztés | 5.1.1 Google Photos Edit: elutasítás | 4.4.4-ben a Photos Edit már átad a Galéria szerkesztőjének; 6.0.1/7.1.2-ben saját Photos szerkesztő van. Ez konkrét visszalépés 4.4 és 5.1 között. |
| Kamera különleges módok | 4.4.4: Photo Sphere elutasítás; 5.1.1: Photo Sphere és Lens Blur elutasítás | A videó és panoráma ezekben külön működik; 6.0.1/7.1.2 több saját helyi felvételi/szerkesztési útvonalat ad. |
| Gmail fájlcsatolás | 5.1.1: Attach file elutasítás, Attach picture működik | 6.0.1/7.1.2: Documents-alapú fájlválasztó és csatolás |
| Email-beállítások | 4.3: a külön Email app Settings belépése is elutasít; 4.4.4/5.1.1: beállításlap van, bizonyos sorok hiányoznak | Az app és verzió együtt számít; az Email és Gmail nem csereszabatos. |
| Jogi oldalak | 4.0.4/5.1.1: több elutasító link; 4.3/4.4.4: egyes sorok egyszerű noop demófeliratok | 6.0.1/7.1.2: saját jogi/licencoldalak. A noop helyeket a nyers üzenetkeresés nem feltétlenül találja. |
| Widgetek | A 2.1/6.0.1/7.1.2 kódjában van Még nincs kész fallback | A futó 6.0.1 14 vizsgált widgetje nem érte el; 7.1.2 minden jegyzett providere implemented=true. Ez nem igazolt hiány. |

Az „újabb megfelelő” a helyi szimulált képernyő/modellezés meglétét jelenti. Nem állít valódi Google-bejelentkezést, felhőszinkront, telefonhálózatot vagy fizetést.

## Megtalált szövegváltozatok

| Kód | Pontos angol szöveg / szövegkulcs | Magyar megfelelő, ha azonosított |
|---|---|---|
| F | This feature is not part of the simulator. | Ez a funkció nem része a szimulátornak. |
| A | This app is not part of the simulator. | Ez az alkalmazás nem része a szimulátornak. |
| U | Unavailable in this simulator | Ebben a szimulátorban nem érhető el |
| N | Not available in this simulator | Angol változat: Not available in this simulator |
| D | Not available in this demo | Ebben a bemutatóban nem érhető el |
| V | Not available in the simulator | A szimulátorban nem érhető el |
| B | Not built yet | Még nincs kész |
| P | Photo Sphere capture is not simulated | A körpanorámakép készítése nincs szimulálva |
| L | Lens Blur capture is not simulated | Lens Blur capture is not simulated |
| E | Emergency calls are unavailable in this simulator. | Ebben a szimulátorban nem indítható segélyhívás. |
| C | Calendar settings are not part of this simulation. | Calendar settings are not part of this simulation. |
| H | Help is not available offline. | Help is not available offline. |
| S | Unavailable (Play saját szövegtáblájából) | Ebben a szimulátorban nem érhető el |
| O | Natív offline / hálózati hiba | Nem a generikus szimulátor-elutasítás |
| I | Nincs új látható üzenet | Inaktív vagy már másra használt ág |

A Calendar settings… és egyes Not available… változatok nem ugyanazt a közös fordításkulcsot használják; a szövegezés sem teljesen egységes.

## 2.1

| Típus | Alkalmazás / képernyő | Hol található | Mit csinál / korlátozás | Üzenet | Forrás |
|---|---|---|---|---|---|
| Konkrét korlát | Android Market | Fizetős alkalmazás adatlapja › Vásárlás | A fizetős vásárlás generikus elutasítást ad. A Market többi működését ez nem minősíti. | Unavailable in this simulator | [ec-market.js:217](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.1/ec-market.js#L217) |
| Tartalékág | Beállítások | Ismeretlen intent-cél / nem kezelt preferenciatípus | A feloldatlan targetClass és nem kezelt típus tud Még nincs kész képernyőt vagy párbeszédet rajzolni. A teljes Settings-fa kattintásos elérhetőségét ez a felmérés nem bizonyítja. | Not built yet | [ec-settings.js:263](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.1/ec-settings.js#L263) |
| Tartalékág | Kezdőképernyő | Ismeretlen widgettípus | Ismeretlen vagy nem regisztrált widget esetén kerül elő; nem jelenti, hogy a gyári widgetlista hiányos. | Not built yet | [ec-launcher.js:44](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.1/ec-launcher.js#L44) |
| Tartalékág | Rendszer | Nem regisztrált képernyő / overlay | Általános tartalék renderer. A 25 alkalmazás belépési pontján a modulregisztráció ellenőrzése nem talált hiányt. | Not built yet | [ec-core.js:130](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.1/ec-core.js#L130) |
| Offline korlát | Fiókok, Email, Facebook, böngésző | Valódi bejelentkezés / internet | Ezek a helyi modell helyett valódi szolgáltatást igénylő utak natív hálózati vagy belépési hibával zárulnak; külön kategória a Még nincs kész helyőrzőtől. | Natív offline / hálózati hiba | [ec-email.js:6](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.1/ec-email.js#L6) |

## 2.3.6

| Típus | Alkalmazás / képernyő | Hol található | Mit csinál / korlátozás | Üzenet | Forrás |
|---|---|---|---|---|---|
| Konkrét korlát | Böngésző | Menü › Továbbiak › Szöveg kijelölése | A Select text / select_dot menüpont generikus elutasítás. | Unavailable in this simulator | [gb-browser.js:87](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/gb-browser.js#L87) |
| Konkrét korlát | Gmail | Menü › Settings; Help; beszélgetés › Select text | A beállítások teljes belépési pontja, súgó és beszélgetésbeli szövegkijelölés ugyanarra a gm-unsupported ágra fut. | This feature is not part of the simulator. | [gb-gmail.js:324](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/gb-gmail.js#L324) |
| Konkrét korlát | Email | Fiókbeállítás › Incoming settings; Outgoing settings | A két szerverbeállítás toast: true. A többi beállítás között működő kapcsolók és listák is vannak. | Unavailable in this simulator | [gb-prefs.js:97](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/gb-prefs.js#L97) |
| Konkrét korlát | Email | Új fiók › Manual setup | A kézi szerverkonfiguráció nincs végigvezetve. | Unavailable in this simulator | [simulator.js:1650](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/simulator.js#L1650) |
| Konkrét korlát | Névjegyszerkesztő | Névjegykép › Take photo | Galériából képet választani lehet; az új fotó készítésének ez az ága elutasít. | Unavailable in this simulator | [simulator.js:1653](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/simulator.js#L1653) |
| Konkrét korlát | Galéria | Kép › Menü › Show on map | A térképen megjelenítés gbset-toast út. | Unavailable in this simulator | [gb-gallery.js:84](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/gb-gallery.js#L84) |
| Konkrét korlát | Üzenetek | Melléklet › Videó, videófelvétel, hang, hangfelvétel, diavetítés | Az Add attachment listában csak az attach_image kap konkrét akciót; a többi felsorolt típus alapértelmezett elutasítás. | Unavailable in this simulator | [gb-mms.js:106](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/gb-mms.js#L106) |
| Konkrét korlát | Üzenetek | Képmelléklet › View | A csatolt kép külön megtekintése elutasít; csere és törlés külön akció. | Unavailable in this simulator | [gb-mms.js:73](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/gb-mms.js#L73) |
| Konkrét korlát | Zene | Lejátszó / szám helyi menüje › Use as ringtone; Delete | Csengőhangnak beállítás és a szám törlése generikus elutasítás. A lejátszás és lejátszási listák ettől még működnek. | Unavailable in this simulator | [simulator.js:266](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/simulator.js#L266) |
| Konkrét korlát | Óra | Desk clock › Menü › Dock settings | A dokkoló beállítása nem kész; az ébresztő beállításai külön gbpref-open út. | Unavailable in this simulator | [gb-deskclock.js:73](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/gb-deskclock.js#L73) |
| Konkrét korlát | Beállítások | Accounts & sync › Add account | Új rendszerszintű fiók hozzáadása elutasít. | Unavailable in this simulator | [gb-settings-pages.js:111](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/gb-settings-pages.js#L111) |
| Konkrét korlát | Beállítások | Search / Google keresés › Manage personalization | A személyre szabás kezelése elutasító toast. | This feature is not part of the simulator. | [gb-settings.js:149](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/gb-settings.js#L149) |
| Konkrét korlát | Google Voice | Menü › Balance; Settings; Help | Három látható menüpont a gv-unsupported ágon. | This feature is not part of the simulator. | [gb-extra-apps.js:212](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/gb-extra-apps.js#L212) |
| Konkrét korlát | Car Home | Menü › Settings | Az autós indító beállításai elutasítanak; az appindítás külön működő út. | This feature is not part of the simulator. | [gb-extra-apps.js:193](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/gb-extra-apps.js#L193) |
| Konkrét korlát | Talk | Add to chat; Sign out; Settings; Help | A beszélgetésbe új résztvevő bevonása és a felsorolt fiók/súgó utak tk-unsupported. | This feature is not part of the simulator. | [gb-talk.js:177](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/gb-talk.js#L177) |
| Konkrét korlát | Maps / Navigation | Maps › Labs; Cache settings; Help; Terms; Navigation › Settings; Help; Terms | A menüpontok mp-unsupported akciót kapnak. | This feature is not part of the simulator. | [gb-maps.js:375](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/gb-maps.js#L375) |
| Konkrét korlát | Maps / Latitude / Places | Rétegek › Transit Lines; Bicycling; Wikipedia; Latitude › Add friends; Places › Add kategória | Az érintett rétegek és a bővítési/barátfelvételi ágak generikus elutasítások. | This feature is not part of the simulator. | [gb-maps.js:360](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/gb-maps.js#L360) |
| Konkrét korlát | Books / Earth | Books › About, Help, Manage eBooks; Earth › Settings | Ezek ga-unsupported utakon mennek; az olvasó és a többi lokális művelet külön van. | This feature is not part of the simulator. | [gb-google-apps.js:390](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/gb-google-apps.js#L390) |
| Konkrét korlát | YouTube | Menü › Settings; videó › Flag | A beállítás és jelentés elutasító ág. | This feature is not part of the simulator. | [gb-youtube.js:160](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/gb-youtube.js#L160) |
| Konkrét korlát | News & Weather | Beállítások › News terms of service; Mobile privacy policy | A két jogi link nwp-unsupported. | This feature is not part of the simulator. | [news-prefs.js:51](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/news-prefs.js#L51) |
| Konkrét korlát | Android Market | Alkalmazásadatlap › Developer Info; Sharing; Market content; szűrés › PIN | gbmk-unavailable út. A szöveg a Market saját Unavailable megjegyzése; a root generikus üzenetétől elkülönítve. | Unavailable (Play saját szövegtáblájából) | [gb-market.js:227](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/gb-market.js#L227) |
| Konkrét korlát | Android Market | Menü › Help | A menü súgója kifejezett szimulátor-korlátot ír. | Unavailable in this simulator | [gb-market.js:287](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/gb-market.js#L287) |
| Offline korlát | Zárolás / Telefon | Emergency call | A valódi segélyhívás nem indítható. Ez szolgáltatási korlát, nem egy más verzióban kész helyi beállítás hiánya. | Emergency calls are unavailable in this simulator. | [lockscreen.js:148](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/2.3.6/lockscreen.js#L148) |

## 4.0.4

| Típus | Alkalmazás / képernyő | Hol található | Mit csinál / korlátozás | Üzenet | Forrás |
|---|---|---|---|---|---|
| Konkrét korlát | Gmail | Settings; Help; Send feedback; Manage labels; Label settings | A g4-unsupported kezeli ezeket a beállítás/kezelés/súgó utakból. | This feature is not part of the simulator. | [ics-gmail.js:255](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.0.4/ics-gmail.js#L255) |
| Konkrét korlát | Névjegyek | Névjegy menü › Share; Set ringtone; Place on Home screen; lista › Contacts to display, Import/export, Accounts, Settings, Help | A lista és részlet néhány művelete generikus toast. Az Edit, Delete és voicemail kapcsoló ettől külön út. | Not available in this simulator | [simulator.js:995](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.0.4/simulator.js#L995) |
| Konkrét korlát | Kamera | Módválasztó › Video; Panorama | A camera-mode ág nem camera azonosító esetén elutasít; a fotó mód működik. | This feature is not part of the simulator. | [simulator.js:1549](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.0.4/simulator.js#L1549) |
| Konkrét korlát | Billentyűzet / hangbevitel | Kiegészítők; online nyelvek / letöltés | Az lng-addons és lng-online ág elutasító toast. | This feature is not part of the simulator. | [ics-language.js:201](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.0.4/ics-language.js#L201) |
| Konkrét korlát | Play Music | Search music; menü › Make instant mix; Settings; Help | pm4-unsupported utak. | This feature is not part of the simulator. | [ics-play-music.js:122](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.0.4/ics-play-music.js#L122) |
| Konkrét korlát | Play Store | Accounts; Help; beállítások › Content filtering és PIN-hez kötött nem kezelt sorok | icsp-unavailable; nem az alkalmazástelepítés egészének hiánya. | Unavailable (Play saját szövegtáblájából) | [ics-play.js:270](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.0.4/ics-play.js#L270) |
| Konkrét korlát | Google+ | New post | A posztíró indítása ga-unsupported. | This feature is not part of the simulator. | [ics-google-apps.js:158](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.0.4/ics-google-apps.js#L158) |
| Konkrét korlát | Talk | Video chat; Voice chat; Friend info; Add to chat; Display options; Sign out; Talk settings/help; Feedback | Ezek az ágak ga-unsupported akciókat kapnak. | This feature is not part of the simulator. | [ics-google-apps.js:174](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.0.4/ics-google-apps.js#L174) |
| Konkrét korlát | YouTube | Search; Record; Add to; Share; csatorna; Settings; Feedback; Help | A ga-unsupported alá kötött műveletek; a videó demója és értékelés nem mind elutasító. | This feature is not part of the simulator. | [ics-google-apps.js:221](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.0.4/ics-google-apps.js#L221) |
| Konkrét korlát | Play Books | Search; About the book; Share; Available offline; Read aloud; Help; Accounts; Refresh | ga-unsupported utak. Display options és olvasás külön működik. | This feature is not part of the simulator. | [ics-google-apps.js:227](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.0.4/ics-google-apps.js#L227) |
| Konkrét korlát | Play Movies | Manage offline rentals; Accounts; Settings; Help; Contact us; Send feedback; Retry | ga-unsupported utak; a natív hálózati lejátszási hiba önálló állapot. | This feature is not part of the simulator. | [ics-google-apps.js:229](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.0.4/ics-google-apps.js#L229) |
| Konkrét korlát | Google keresés | Searchable items | Az adott felület forrásválasztó sora ga-unsupported. | This feature is not part of the simulator. | [ics-google-apps.js:331](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.0.4/ics-google-apps.js#L331) |
| Konkrét korlát | Google+ Messenger | Beszélgetés megnyitása; New conversation; Settings; Feedback; Help | A kirajzolt beszélgetéslistában és menüben ezek kkx-unavailable műveletek. | This feature is not part of the simulator. | [ics-extra-apps.js:31](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.0.4/ics-extra-apps.js#L31) |
| Konkrét korlát | Movie Studio | Create new project | A projektlétrehozó csempe kkx-unavailable. | This feature is not part of the simulator. | [ics-extra-apps.js:39](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.0.4/ics-extra-apps.js#L39) |
| Konkrét korlát | Navigation / Places | Navigation kezdő csempék a Type destination kivételével; Places keresés | Az általános csempék / kereső kkx-unavailable. A Type destination külön mr-type-dest út. | This feature is not part of the simulator. | [ics-extra-apps.js:31](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.0.4/ics-extra-apps.js#L31) |
| Konkrét korlát | Maps / Earth | Maps › Settings, Help; Earth › Search, Layers, North up, My Location, Settings, Help, Terms | sa-unsupported utak. | This feature is not part of the simulator. | [stock-apps.js:123](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.0.4/stock-apps.js#L123) |
| Konkrét korlát | Beállítások | About phone › System updates; Legal › Open source licenses / Google legal; Accounts › Add account, Remove account; Accessibility › TalkBack | Az ICS-re engedett settings-system ágban konkrét elutasító sorok. | This feature is not part of the simulator. | [settings-system.js:236](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.0.4/settings-system.js#L236) |
| Konkrét korlát | Beállítások / fejlesztői és Wi-Fi sorok | dev-info akciót kapó sorok, pl. Wi-Fi › Install certificates | Ez az akció csak szimulátoros elutasítást mutat. A nyers melléklet tartalmazza a hivatkozásokat. | Not available in the simulator | [simulator.js:1350](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.0.4/simulator.js#L1350) |
| Konkrét korlát | Email | Settings › Quick responses; Choose ringtone; Incoming settings; Outgoing settings; Remove account | Az EmailPrefData ezen sorai emailpref-unsupported akciót kapnak. 4.3-ban a szokásos Email Settings belépés is elutasít, ezért a mögöttes sorokat nem számolom külön elérhető hiánynak. Más verziók többi kapcsolója, listája és szerkeszthető mezője működhet. | Not available in this simulator | [email-prefs.js:28](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.0.4/email-prefs.js#L28) |
| Offline korlát | Zárolás / Telefon | Emergency call | A valódi segélyhívás nem indítható. Ez szolgáltatási korlát, nem egy más verzióban kész helyi beállítás hiánya. | Emergency calls are unavailable in this simulator. | [lockscreen.js:139](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.0.4/lockscreen.js#L139) |
| Konkrét korlát | News & Weather | Settings › jogi linkek | News terms of service és Mobile privacy policy az nwp-unsupported ágon. | This feature is not part of the simulator. | [news-prefs.js:51](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.0.4/news-prefs.js#L51) |

## 4.3

| Típus | Alkalmazás / képernyő | Hol található | Mit csinál / korlátozás | Üzenet | Forrás |
|---|---|---|---|---|---|
| Kiszűrt találat | Email | Settings › Quick responses; Choose ringtone; Incoming settings; Outgoing settings; Remove account | Az EmailPrefData ezen sorai emailpref-unsupported akciót kapnak. 4.3-ban a szokásos Email Settings belépés is elutasít, ezért a mögöttes sorokat nem számolom külön elérhető hiánynak. Más verziók többi kapcsolója, listája és szerkeszthető mezője működhet. | Not available in this simulator | [email-prefs.js:28](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/email-prefs.js#L28) |
| Konkrét korlát | Chrome | Settings › a Privacy és About kivételével a fő kategóriák; About › Legal information; Help | A kategóriák nagy része chrome-unsupported. Például Search engine, Autofill, Passwords, Content/Site settings; a verzió saját menüjében szereplő további kategóriákkal. | This feature is not part of the simulator. | [chrome.js:107](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/chrome.js#L107) |
| Konkrét korlát | Chrome | Weboldal menü › Help | chrome-unsupported ág; a menü feltételei (oldal, inkognitó, native nézet) verziónként eltérnek. | This feature is not part of the simulator. | [chrome.js:128](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/chrome.js#L128) |
| Konkrét korlát | Gmail | Settings › fiók › Inbox sound & vibrate; Days of mail to sync; Manage labels | Konkrét unsupported sorok a fiókbeállítás-adatokban. Más általános Gmail-beállítások működnek. | This feature is not part of the simulator. | [gmail.js:55](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/gmail.js#L55) |
| Konkrét korlát | Gmail | Welcome / Learn more; About Gmail, ahol az adott verzió kiírja | A bevezető tájékoztató link gmail-unavailable; az About sor nem mindhárom verzióban jelenik meg. | This feature is not part of the simulator. | [gmail.js:117](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/gmail.js#L117) |
| Konkrét korlát | Naptár | Menü › Calendars to display; Send feedback; Settings; Help | 4.3/4.4: a négy felsorolt menüpont generikus elutasítás. 5.1: külön szimulátoros naptárbeállítás- és offline súgóüzenet. | Not available in this simulator | [calendar.js:186](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/calendar.js#L186) |
| Konkrét korlát | Hangouts | Invites; Settings; Feedback; Help; beszélgetés › People & options; Add people | hg-unsupported utak. A részletes lista a verzió menü- és melléklet-generátoránál található. | This feature is not part of the simulator. | [hangouts.js:78](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/hangouts.js#L78) |
| Konkrét korlát | Hangouts | Melléklet › Take photo; Google+ photos | A fényképezés és Google+ forrás elutasít; az Other photos helyi képválasztás külön működő ág. | This feature is not part of the simulator. | [hangouts.js:80](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/hangouts.js#L80) |
| Konkrét korlát | Email / Gmail | Help; Sync options; Gmail oldalsó menü › Help & feedback, ahol van | email-unavailable; a beállítások belépési pontjától elkülönülő menüműveletek. | Not available in this simulator | [simulator.js:1644](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/simulator.js#L1644) |
| Konkrét korlát | Névjegyek | Névjegylista / részlet › elutasító menüsorok | 4.3/4.4: Share, Set ringtone, Place on Home screen, Contacts to display, Import/export, Accounts, Settings, Help a megjelenő sorok szerint. 5.1: Share, Place on Home screen, Contacts to display, Import/export, Settings, Help; Accounts külön út. | Not available in this simulator | [simulator.js:1340](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/simulator.js#L1340) |
| Konkrét korlát | Play Store | Share; Redeem; Help; Open source licenses; adatlap › Flag as inappropriate | jbp-unavailable a Play saját Unavailable szövegével. Más oldal- és beállításműveletek nem ettől válnak hiányzóvá. | Unavailable (Play saját szövegtáblájából) | [simulator.js:1870](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/simulator.js#L1870) |
| Konkrét korlát | Play Music / Movies / Books / Games | pa-unsupported műveletek: overflow, letöltés/pin/cast; egyes Settings/Help utak; játék indítása | A közös Play-modul több apphoz használja a pa-unsupported és pa-game-play ágat. A kirajzolt listák és lejátszó/olvasó önmagában nem hiányzik. | This feature is not part of the simulator. | [simulator.js:2124](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/simulator.js#L2124) |
| Konkrét korlát | Óra | Menü › Settings; Help; városlista › az elutasító keresésgomb, ahol van | A jbclock-menu a Not available in this demo szöveget adja. Az 5.1 városkeresés gombja is közvetlenül ezt küldi. | Not available in this demo | [simulator.js:2395](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/simulator.js#L2395) |
| Konkrét korlát | Google Settings / Google keresés | sa-unsupported-hoz kötött beállítás- és súgólinkek | Például Ads by Google, Google Now egyes fejlécei és egyes súgó/visszajelzés utak. Nem az egész Google Settings alkalmazás hiányzik. | This feature is not part of the simulator. | [simulator.js:2061](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/simulator.js#L2061) |
| Konkrét korlát | Email | Menü › Settings | Ebben a verzióban a külön Email app Settings belépése is elutasít; a Gmail esetén ugyanaz az akció beállításképernyőt nyit. | Not available in this simulator | [simulator.js:1665](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/simulator.js#L1665) |
| Konkrét korlát | Galéria | Videó › Trim; Mute | A videóvágás és némítás generikus elutasítás. A képszerkesztő másik, működő út. | This feature is not part of the simulator. | [jb-gallery.js:98](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/jb-gallery.js#L98) |
| Konkrét korlát | SMS/MMS | Hangmelléklet › Play; nem kezelt mellékletforrások | A hangmelléklet szerkesztőjének Play gombja közvetlen generikus elutasítás; a további források kezelését az mms-attach-type ág szabályozza. | This feature is not part of the simulator. | [messaging.js:53](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/messaging.js#L53) |
| Konkrét korlát | Drive | Új; keresés; overflow; mappa; fájl › Share / overflow | Ezek sa-unsupported; a mintafájl megnyitása külön megvalósítás. | This feature is not part of the simulator. | [stock-apps.js:113](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/stock-apps.js#L113) |
| Konkrét korlát | Keep | New recording; Share; Settings; Send feedback; Help | sa-unsupported a felsorolt részeken; az új jegyzet/lista és több jegyzetművelet működik. | This feature is not part of the simulator. | [stock-apps.js:170](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/stock-apps.js#L170) |
| Konkrét korlát | Google+ / YouTube / Earth | Google+ új bejegyzés és kapcsolódó műveletek; YouTube Add to/Share/Settings/Help; Earth nem kezelt eszközök és menü | A konkrét gombok sa-unsupported akciót használnak. | This feature is not part of the simulator. | [stock-apps.js:285](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/stock-apps.js#L285) |
| Konkrét korlát | Currents / Play Magazines | Keresés, szinkron/beállítás/súgó műveletek; magazin megnyitása | A stock-apps menük és JBExtraApps magazincsempék elutasító ágakra vannak kötve. | This feature is not part of the simulator. | [stock-apps.js:273](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/stock-apps.js#L273) |
| Konkrét korlát | Google+ Messenger / Wallet / Movie Studio | Messenger sorok és új beszélgetés; Wallet dashboard gombok; Movie Studio új projekt | A JBExtraApps kirajzolja ezeket, de a gombok kkx-unavailable akciót kapnak. | This feature is not part of the simulator. | [jb-extra-apps.js:58](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/jb-extra-apps.js#L58) |
| Konkrét korlát | Sound Search | Fiókválasztás | Az ears-account még generikus elutasítás. | This feature is not part of the simulator. | [simulator.js:1830](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/simulator.js#L1830) |
| Tartalékág | Beállítások | Safety information út | A renderben külön offline biztonsági tájékoztató van. A normál menüből való elérhetőségét nem igazoltam. | Nexus 4 safety information is not available in this offline simulation. | [simulator.js:1155](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/simulator.js#L1155) |
| Offline korlát | Zárolás / Telefon | Emergency call | A valódi segélyhívás nem indítható. Ez szolgáltatási korlát, nem egy más verzióban kész helyi beállítás hiánya. | Emergency calls are unavailable in this simulator. | [lockscreen.js:142](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/lockscreen.js#L142) |
| Konkrét korlát | News & Weather | Settings › jogi linkek | News terms of service és Mobile privacy policy az nwp-unsupported ágon. | This feature is not part of the simulator. | [news-prefs.js:51](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/news-prefs.js#L51) |
| Kiszűrt találat | Megosztott régi Settings-kód | ICS-only System updates / TalkBack / jogi sorok | A settings-system.js ezen szakasza if(ICS) alatt van. A hasonló szöveg nem bizonyít ugyanilyen aktív menüpontot ezen a verzión; a valódi jogi oldal például a simulator.js másik renderútján jön. | Nincs új látható üzenet | [settings-system.js:233](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.3/settings-system.js#L233) |

## 4.4.4

| Típus | Alkalmazás / képernyő | Hol található | Mit csinál / korlátozás | Üzenet | Forrás |
|---|---|---|---|---|---|
| Konkrét korlát | Email | Settings › Quick responses; Choose ringtone; Incoming settings; Outgoing settings | Az EmailPrefData ezen sorai emailpref-unsupported akciót kapnak. 4.3-ban a szokásos Email Settings belépés is elutasít, ezért a mögöttes sorokat nem számolom külön elérhető hiánynak. Más verziók többi kapcsolója, listája és szerkeszthető mezője működhet. | Not available in this simulator | [email-prefs.js:28](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/email-prefs.js#L28) |
| Konkrét korlát | Chrome | Settings › a Privacy és About kivételével a fő kategóriák; About › Legal information; Help | A kategóriák nagy része chrome-unsupported. Például Search engine, Autofill, Passwords, Content/Site settings; a verzió saját menüjében szereplő további kategóriákkal. | This feature is not part of the simulator. | [chrome.js:111](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/chrome.js#L111) |
| Konkrét korlát | Chrome | Weboldal menü › Print; Add to homescreen; súgó; inkognitó tájékoztató link, ahol van | chrome-unsupported ág; a menü feltételei (oldal, inkognitó, native nézet) verziónként eltérnek. | This feature is not part of the simulator. | [chrome.js:132](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/chrome.js#L132) |
| Konkrét korlát | Gmail | Settings › fiók › Inbox sound & vibrate; Days of mail to sync; Manage labels | Konkrét unsupported sorok a fiókbeállítás-adatokban. Más általános Gmail-beállítások működnek. | This feature is not part of the simulator. | [gmail.js:55](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/gmail.js#L55) |
| Konkrét korlát | Gmail | Welcome / Learn more; About Gmail, ahol az adott verzió kiírja | A bevezető tájékoztató link gmail-unavailable; az About sor nem mindhárom verzióban jelenik meg. | This feature is not part of the simulator. | [gmail.js:117](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/gmail.js#L117) |
| Konkrét korlát | Naptár | Menü › Calendars to display; Send feedback; Settings; Help | 4.3/4.4: a négy felsorolt menüpont generikus elutasítás. 5.1: külön szimulátoros naptárbeállítás- és offline súgóüzenet. | Not available in this simulator | [calendar.js:186](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/calendar.js#L186) |
| Konkrét korlát | Hangouts | Invites; Settings; Feedback; Help; beszélgetés › People & options; Add people | hg-unsupported utak. A részletes lista a verzió menü- és melléklet-generátoránál található. | This feature is not part of the simulator. | [hangouts.js:79](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/hangouts.js#L79) |
| Konkrét korlát | Hangouts | Melléklet › Take photo; Google+ photos | A fényképezés és Google+ forrás elutasít; az Other photos helyi képválasztás külön működő ág. | This feature is not part of the simulator. | [hangouts.js:80](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/hangouts.js#L80) |
| Konkrét korlát | Email / Gmail | Help; Sync options; Gmail oldalsó menü › Help & feedback, ahol van | email-unavailable; a beállítások belépési pontjától elkülönülő menüműveletek. | Not available in this simulator | [simulator.js:2331](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/simulator.js#L2331) |
| Konkrét korlát | Névjegyek | Névjegylista / részlet › elutasító menüsorok | 4.3/4.4: Share, Set ringtone, Place on Home screen, Contacts to display, Import/export, Accounts, Settings, Help a megjelenő sorok szerint. 5.1: Share, Place on Home screen, Contacts to display, Import/export, Settings, Help; Accounts külön út. | Not available in this simulator | [simulator.js:1279](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/simulator.js#L1279) |
| Konkrét korlát | Play Store | Share; Redeem; Help; Open source licenses; adatlap › Flag as inappropriate | jbp-unavailable a Play saját Unavailable szövegével. Más oldal- és beállításműveletek nem ettől válnak hiányzóvá. | Unavailable (Play saját szövegtáblájából) | [simulator.js:1760](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/simulator.js#L1760) |
| Konkrét korlát | Play Music / Movies / Books / Games | pa-unsupported műveletek: overflow, letöltés/pin/cast; egyes Settings/Help utak; játék indítása | A közös Play-modul több apphoz használja a pa-unsupported és pa-game-play ágat. A kirajzolt listák és lejátszó/olvasó önmagában nem hiányzik. | This feature is not part of the simulator. | [simulator.js:2017](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/simulator.js#L2017) |
| Konkrét korlát | Óra | Menü › Settings; Help; városlista › az elutasító keresésgomb, ahol van | A jbclock-menu a Not available in this demo szöveget adja. Az 5.1 városkeresés gombja is közvetlenül ezt küldi. | Not available in this demo | [simulator.js:2299](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/simulator.js#L2299) |
| Konkrét korlát | Google Settings / Google keresés | sa-unsupported-hoz kötött beállítás- és súgólinkek | Például Ads by Google, Google Now egyes fejlécei és egyes súgó/visszajelzés utak. Nem az egész Google Settings alkalmazás hiányzik. | This feature is not part of the simulator. | [simulator.js:1960](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/simulator.js#L1960) |
| Konkrét korlát | Galéria | Videó › Trim; Mute; fotó › Print | A vágás/némítás generikus elutasítás, a nyomtatás Not available in this simulator. A fotószerkesztő és a slideshow külön működő ág. | This feature is not part of the simulator. | [kk-gallery.js:93](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/kk-gallery.js#L93) |
| Konkrét korlát | Kamera | Photo Sphere › exponálás | A panoráma és videó külön működő ág; a Photo Sphere felvétel elutasít. | Photo Sphere capture is not simulated | [kk-camera.js:279](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/kk-camera.js#L279) |
| Konkrét korlát | Photos | Print; Slideshow; Download; Select photos; Settings; Feedback; Help | A Photos menük photos-unsupported sorai. Az Edit ebben a verzióban működik: a Galéria szerkesztőjére adja át a képet. | This feature is not part of the simulator. | [simulator.js:2078](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/simulator.js#L2078) |
| Konkrét korlát | Google Now | Eseménykártya menü; emlékeztető › Where; One-time / ismétlés | Az alapértelmezett kártyamenü, hely és ismétlés sa-unsupported. Az időalapú emlékeztető létrehozás külön út. | This feature is not part of the simulator. | [gel-now.js:19](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/gel-now.js#L19) |
| Konkrét korlát | Drive | Create; Refresh; Filter by; Sort by; Settings; Product Tour; egyes fájlműveletek | sa-unsupported út a stock-apps menükben és eszközgombokon. | This feature is not part of the simulator. | [stock-apps.js:293](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/stock-apps.js#L293) |
| Konkrét korlát | Keep / Google+ / YouTube / Earth | Keep Share/Settings/Feedback/Help; Google+ közösségi műveletek; YouTube Settings/Feedback/Help; Earth My location/Share/Settings/Feedback/Help/Tutorial | Az apponkénti sa-unsupported menüpontok; működő jegyzet- és demóvideó-műveletektől elkülönítve. | This feature is not part of the simulator. | [stock-apps.js:295](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/stock-apps.js#L295) |
| Konkrét korlát | Newsstand | Search; My News; My Magazines; Saved; Explore; Settings; Help; On device only | A kkx-unavailable csempék, drawer és overflow. A Read Now visszalépés másik út. | This feature is not part of the simulator. | [kk-extra-apps.js:41](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/kk-extra-apps.js#L41) |
| Konkrét korlát | Quickoffice | Drive; Device; overflow | Ezek elutasítanak. A Create new file kifejezetten qo-new-ra átírt, működő út, ezért nem sorolom a hiányok közé. | This feature is not part of the simulator. | [kk-extra-apps.js:36](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/kk-extra-apps.js#L36) |
| Konkrét korlát | Wallet | Send money; Transactions; Wallet Balance; Add card; overflow | kkx-unavailable. A valódi fizetés szolgáltatási korlát is, a látható menüpontok kezelése ettől külön kérdés. | This feature is not part of the simulator. | [kk-extra-apps.js:56](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/kk-extra-apps.js#L56) |
| Tartalékág | Beállítások | Safety information út | A renderben külön offline biztonsági tájékoztató van. A normál menüből való elérhetőségét nem igazoltam. | Nexus 5 safety information is not available in this offline simulation. | [simulator.js:1107](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/simulator.js#L1107) |
| Offline korlát | Zárolás / Telefon | Emergency call | A valódi segélyhívás nem indítható. Ez szolgáltatási korlát, nem egy más verzióban kész helyi beállítás hiánya. | Emergency calls are unavailable in this simulator. | [lockscreen.js:143](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/lockscreen.js#L143) |
| Konkrét korlát | News & Weather | Settings › jogi linkek | News terms of service és Mobile privacy policy az nwp-unsupported ágon. | This feature is not part of the simulator. | [news-prefs.js:51](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/news-prefs.js#L51) |
| Kiszűrt találat | Megosztott régi Settings-kód | ICS-only System updates / TalkBack / jogi sorok | A settings-system.js ezen szakasza if(ICS) alatt van. A hasonló szöveg nem bizonyít ugyanilyen aktív menüpontot ezen a verzión; a valódi jogi oldal például a simulator.js másik renderútján jön. | Nincs új látható üzenet | [settings-system.js:235](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/settings-system.js#L235) |
| Kiszűrt találat | Launcher | This app is not part of the simulator őr | GEL_UNSIMULATED üres lista, ezért a jelenlegi appindító ebből nem tilt le egyetlen alkalmazást sem. | This app is not part of the simulator. | [simulator.js:187](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/4.4.4/simulator.js#L187) |

## 5.1.1

| Típus | Alkalmazás / képernyő | Hol található | Mit csinál / korlátozás | Üzenet | Forrás |
|---|---|---|---|---|---|
| Konkrét korlát | Email | Settings › Quick responses; Choose ringtone; Incoming settings; Outgoing settings | Az EmailPrefData ezen sorai emailpref-unsupported akciót kapnak. 4.3-ban a szokásos Email Settings belépés is elutasít, ezért a mögöttes sorokat nem számolom külön elérhető hiánynak. Más verziók többi kapcsolója, listája és szerkeszthető mezője működhet. | Not available in this simulator | [email-prefs.js:28](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/email-prefs.js#L28) |
| Konkrét korlát | Chrome | Settings › a Privacy és About kivételével a fő kategóriák; About › Legal information; Help | A kategóriák nagy része chrome-unsupported. Például Search engine, Autofill, Passwords, Content/Site settings; a verzió saját menüjében szereplő további kategóriákkal. | This feature is not part of the simulator. | [chrome.js:101](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/chrome.js#L101) |
| Konkrét korlát | Chrome | Weboldal menü › Print; Add to homescreen; súgó; inkognitó tájékoztató link, ahol van | chrome-unsupported ág; a menü feltételei (oldal, inkognitó, native nézet) verziónként eltérnek. | This feature is not part of the simulator. | [chrome.js:121](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/chrome.js#L121) |
| Konkrét korlát | Gmail | Settings › fiók › Inbox sound & vibrate; Days of mail to sync; Manage labels; Vacation responder | Konkrét unsupported sorok a fiókbeállítás-adatokban. Más általános Gmail-beállítások működnek. | This feature is not part of the simulator. | [gmail.js:48](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/gmail.js#L48) |
| Konkrét korlát | Gmail | Welcome / Learn more; About Gmail, ahol az adott verzió kiírja | A bevezető tájékoztató link gmail-unavailable; az About sor nem mindhárom verzióban jelenik meg. | This feature is not part of the simulator. | [gmail.js:109](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/gmail.js#L109) |
| Konkrét korlát | Naptár | Oldalsó menü › Settings; Help & feedback | 4.3/4.4: a négy felsorolt menüpont generikus elutasítás. 5.1: külön szimulátoros naptárbeállítás- és offline súgóüzenet. | Calendar settings are not part of this simulation. | [calendar.js:199](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/calendar.js#L199) |
| Konkrét korlát | Hangouts | Invites; Settings; Feedback; Help; beszélgetés › People & options; Add people; Blocked people; Video call | hg-unsupported utak. A részletes lista a verzió menü- és melléklet-generátoránál található. | This feature is not part of the simulator. | [hangouts.js:71](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/hangouts.js#L71) |
| Konkrét korlát | Hangouts | Melléklet › Take photo; Google+ photos | A fényképezés és Google+ forrás elutasít; az Other photos helyi képválasztás külön működő ág. | This feature is not part of the simulator. | [hangouts.js:89](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/hangouts.js#L89) |
| Konkrét korlát | Email / Gmail | Help; Sync options; Gmail oldalsó menü › Help & feedback, ahol van | email-unavailable; a beállítások belépési pontjától elkülönülő menüműveletek. | Not available in this simulator | [simulator.js:2736](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/simulator.js#L2736) |
| Konkrét korlát | Névjegyek | Névjegylista / részlet › elutasító menüsorok | 4.3/4.4: Share, Set ringtone, Place on Home screen, Contacts to display, Import/export, Accounts, Settings, Help a megjelenő sorok szerint. 5.1: Share, Place on Home screen, Contacts to display, Import/export, Settings, Help; Accounts külön út. | Not available in this simulator | [simulator.js:1499](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/simulator.js#L1499) |
| Konkrét korlát | Play Store | Share; Redeem; Help; Open source licenses; adatlap › Flag as inappropriate | jbp-unavailable a Play saját Unavailable szövegével. Más oldal- és beállításműveletek nem ettől válnak hiányzóvá. | Unavailable (Play saját szövegtáblájából) | [simulator.js:2085](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/simulator.js#L2085) |
| Konkrét korlát | Play Music / Movies / Books / Games | pa-unsupported műveletek: overflow, letöltés/pin/cast; egyes Settings/Help utak; játék indítása | A közös Play-modul több apphoz használja a pa-unsupported és pa-game-play ágat. A kirajzolt listák és lejátszó/olvasó önmagában nem hiányzik. | This feature is not part of the simulator. | [simulator.js:2409](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/simulator.js#L2409) |
| Konkrét korlát | Óra | Menü › Settings; Help; városlista › az elutasító keresésgomb, ahol van | A jbclock-menu a Not available in this demo szöveget adja. Az 5.1 városkeresés gombja is közvetlenül ezt küldi. | Not available in this demo | [simulator.js:2704](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/simulator.js#L2704) |
| Konkrét korlát | Google Settings / Google keresés | sa-unsupported-hoz kötött beállítás- és súgólinkek | Például Ads by Google, Google Now egyes fejlécei és egyes súgó/visszajelzés utak. Nem az egész Google Settings alkalmazás hiányzik. | This feature is not part of the simulator. | [simulator.js:2336](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/simulator.js#L2336) |
| Konkrét korlát | Telefon | Menü › Import/export; Settings | A Call History és New contact külön működő út, a két felsorolt elem toast. | This feature is not part of the simulator. | [lp-dialer.js:180](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/lp-dialer.js#L180) |
| Konkrét korlát | Beállítások | Legal information › Open source licenses; Google legal | A Lollipop renderSettings saját útján elutasító sorok. A közös ICS-only másolatokat nem számolom külön. | This feature is not part of the simulator. | [simulator.js:1309](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/simulator.js#L1309) |
| Konkrét korlát | Beállítások | Accounts › Add account; Sync account menü › Remove account | Hozzáadás és eltávolítás elutasít; a helyi szinkronkapcsolók működnek. | This feature is not part of the simulator. | [simulator.js:1320](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/simulator.js#L1320) |
| Konkrét korlát | Beállítások | dev-info-hoz kötött információs sorok, pl. nem kezelt tanúsítvány-telepítés | Az akció Not available in the simulator toastot mutat. | Not available in the simulator | [simulator.js:2237](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/simulator.js#L2237) |
| Konkrét korlát | Kamera | Photo Sphere; Lens Blur › exponálás | Két mód nem photo és nem a külön kezelt video/panorama ág; dinamikus capture is not simulated szöveg. A videó és panoráma működő ág. | Photo Sphere capture is not simulated / Lens Blur capture is not simulated | [lp-camera.js:151](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/lp-camera.js#L151) |
| Konkrét korlát | Kamera | Beállítások › súgóikon | A data-gcs-help kattintás a generikus elutasításra fut. | This feature is not part of the simulator. | [lp-camera.js:64](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/lp-camera.js#L64) |
| Konkrét korlát | Photos | Edit; Print; Slideshow; Download; Select photos; Settings; Feedback; Help | A photos-edit és photos-unsupported ugyanarra a generikus elutasításra fut. A fotó megjelenítése és háttérképként beállítása külön működik. | This feature is not part of the simulator. | [simulator.js:2469](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/simulator.js#L2469) |
| Konkrét korlát | Gmail | Csatolás › Attach file; levél › Print | Az Attach picture helyi képet tud választani, az általános fájlcsatolás és Print email-unavailable. | Not available in this simulator | [lp-email.js:250](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/lp-email.js#L250) |
| Konkrét korlát | Óra | Cities › keresésikon | A keresőgomb közvetlen Not available in this demo toast, nem városkereső. | Not available in this demo | [lp-deskclock.js:119](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/lp-deskclock.js#L119) |
| Konkrét korlát | Google Now | Eseménykártya menü; emlékeztető › Where; One-time / ismétlés | sa-unsupported; az idő és nap szerkesztése külön megvalósítás. | This feature is not part of the simulator. | [gel-now.js:18](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/gel-now.js#L18) |
| Konkrét korlát | Drive | Menü › Create; Refresh; Filter by; Sort by; egyes új/keresés gombok | A stock-apps megfelelő eszközei és menüpontjai sa-unsupported. Nem azonos a külön Docs/Sheets/Slides editorokkal. | This feature is not part of the simulator. | [stock-apps.js:332](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/stock-apps.js#L332) |
| Konkrét korlát | Keep | Jegyzet › Make a copy; Send; főképernyő › New recording | A felsorolt sorok sa-unsupported; a jegyzet, lista és kamera-kép hozzáadása külön működik. | This feature is not part of the simulator. | [stock-apps.js:334](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/stock-apps.js#L334) |
| Konkrét korlát | Google+ / YouTube / Earth | Google+ Feedback/Settings/Help/Sign out; YouTube Settings/Help & feedback; Earth My location/Share és drawer elemek | sa-unsupported ágak, nem az alkalmazások egészének hiánya. | This feature is not part of the simulator. | [stock-apps.js:330](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/stock-apps.js#L330) |
| Konkrét korlát | News & Weather | Open in browser; Change editions; Manage sections | A helyi téma és időjárás-beállítások működő ágak; a felsorolt három menüpont sa-unsupported. | This feature is not part of the simulator. | [stock-apps.js:339](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/stock-apps.js#L339) |
| Konkrét korlát | Docs / Sheets / Slides | Navigációs drawer; View as Grid; Sort by; Open document; Refresh | A dokumentumlista ezen vezérlői lpx-unavailable. A fájl megnyitása és szöveges demószerkesztése nem mind hiányzik. | This feature is not part of the simulator. | [lp-extra-apps.js:121](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/lp-extra-apps.js#L121) |
| Konkrét korlát | Docs / Sheets / Slides | Fájlmenü › Share link; Send file; Keep on device; Move; Add to home screen; Print | A Rename és Remove külön megvalósított kivétel, a többi ITEM_MENU elem lpx-unavailable. | This feature is not part of the simulator. | [lp-extra-apps.js:126](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/lp-extra-apps.js#L126) |
| Konkrét korlát | Fit | Add activity; Add your weight; Settings; Help & feedback | Statikus demó mellett ezek a menüpontok lpx-unavailable. | This feature is not part of the simulator. | [lp-extra-apps.js:111](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/lp-extra-apps.js#L111) |
| Konkrét korlát | Newsstand | Search; My Library; Bookmarks; Explore; Settings; Help & Feedback | A keresés és a Read Now-n túli drawer elemek lpx-unavailable. | This feature is not part of the simulator. | [lp-extra-apps.js:96](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/lp-extra-apps.js#L96) |
| Konkrét korlát | Wallet | Menü / nem kezelt vezérlők; wal-finish véglegesítés | A wal-finish is generikus elutasító toast; a felület több köztes oldala közben megvalósított. | This feature is not part of the simulator. | [simulator.js:2554](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/simulator.js#L2554) |
| Konkrét korlát | Play Store | READ MORE; Visit webpage; Send email; Privacy policy; People; My account | A közös Play korlátokon felüli Lollipop-specifikus jbp-unavailable sorok. Permission details külön működő út. | Unavailable (Play saját szövegtáblájából) | [lp-play.js:315](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/lp-play.js#L315) |
| Offline korlát | Hangkeresés | Kezdőképernyő / keresés › mikrofon | A voice-search akció csak offline elutasító üzenetet küld. | Voice search unavailable offline | [simulator.js:769](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/simulator.js#L769) |
| Konkrét korlát | SMS/Messenger | Beszélgetés › People & options | A menüpont csak azt közli, hogy az értesítések bekapcsolva maradnak; nem nyit külön beállításlapot. | Notifications for this conversation stay on. | [simulator.js:1545](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/simulator.js#L1545) |
| Offline korlát | Zárolás / Telefon | Emergency call | A valódi segélyhívás nem indítható. Ez szolgáltatási korlát, nem egy más verzióban kész helyi beállítás hiánya. | Emergency calls are unavailable in this simulator. | [lockscreen.js:144](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/lockscreen.js#L144) |
| Kiszűrt találat | Megosztott régi Settings-kód | ICS-only System updates / TalkBack / jogi sorok | A settings-system.js ezen szakasza if(ICS) alatt van. A hasonló szöveg nem bizonyít ugyanilyen aktív menüpontot ezen a verzión; a valódi jogi oldal például a simulator.js másik renderútján jön. | Nincs új látható üzenet | [settings-system.js:231](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/settings-system.js#L231) |
| Kiszűrt találat | Launcher | This app is not part of the simulator őr | GEL_UNSIMULATED üres lista, ezért a jelenlegi appindító ebből nem tilt le egyetlen alkalmazást sem. | This app is not part of the simulator. | [simulator.js:177](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/5.1.1/simulator.js#L177) |

## 6.0.1

| Típus | Alkalmazás / képernyő | Hol található | Mit csinál / korlátozás | Üzenet | Forrás |
|---|---|---|---|---|---|
| Tartalékág | Rendszer | Nem regisztrált képernyő / overlay | Általános Még nincs kész renderer. A jelenlegi alkalmazásjegyzékhez tartozó modulok regisztrációja a futó oldalon hiánytalan volt; ez nem teljes belső menübejárás.  | Not built yet | [mm-core.js:90](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/6.0.1/mm-core.js#L90) |
| Tartalékág | Beállítások | Ismeretlen fragment / intent / képernyőcél | Ismeretlen cél esetén missing: útvonal. Ezt a kódot nem azonosítom automatikusan elérhető hiányként; a teljes Settings-fa friss kattintásos bejárása nem része ennek a riportnak. | Not built yet | [mm-settings.js:88](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/6.0.1/mm-settings.js#L88) |
| Tartalékág | Widgetek | Ismeretlen widgettípus | A fallback kiírná, hogy Még nincs kész, de a 14 vizsgált gyári widget törzsének kirajzolása egyiken sem hozta ezt az ágat. | Not built yet | [mm-widgets.js:276](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/6.0.1/mm-widgets.js#L276) |
| Tartalékág | Gyorsbeállítások / Google Now | Ismeretlen detail típus vagy hiányzó Google Now modul | Feltételes c.missing hívások; a modul hiánya esetére vannak a kódban. | Not built yet | [mm-qsdetail.js:138](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/6.0.1/mm-qsdetail.js#L138) |
| Kiszűrt találat | Documents / Downloads | mmsa-missing nevű keresésgomb | Félrevezető akciónév: a kezelő keresési módra vált, nem elutasítást ír. Ezért nem számít hiánynak. | Nincs új látható üzenet | [mm-smallapps.js:120](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/6.0.1/mm-smallapps.js#L120) |

## 7.1.2

| Típus | Alkalmazás / képernyő | Hol található | Mit csinál / korlátozás | Üzenet | Forrás |
|---|---|---|---|---|---|
| Tartalékág | Rendszer | Nem regisztrált képernyő / overlay | Általános Még nincs kész renderer. A jelenlegi alkalmazásjegyzékhez tartozó modulok regisztrációja a futó oldalon hiánytalan volt; ez nem teljes belső menübejárás.  | Not built yet | [ng-core.js:88](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/7.1.2/ng-core.js#L88) |
| Tartalékág | Beállítások | Ismeretlen fragment / intent / képernyőcél | Ismeretlen cél esetén missing: útvonal. Ezt a kódot nem azonosítom automatikusan elérhető hiányként; a teljes Settings-fa friss kattintásos bejárása nem része ennek a riportnak. | Not built yet | [ng-settings.js:95](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/7.1.2/ng-settings.js#L95) |
| Tartalékág | Widgetek | Nem ismert provider / hiányzó renderer | A Még nincs kész feliratot tartalmazó feltételes fallback jelen van, de a jelenlegi providerjegyzék minden tagjához implemented=true eredményt kaptam. | Not built yet | [ng-widget-picker.js:19](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/7.1.2/ng-widget-picker.js#L19) |
| Tartalékág | App-beállítások | Ismeretlen preferencia XML / screen | Az app-prefs fallback c.missing hívás, ha nincs megfelelő XML és egyedi nézet sem. Nem talált konkrét aktív gomb ebben a felmérésben. | Not built yet | [ng-appprefs.js:152](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/7.1.2/ng-appprefs.js#L152) |
| Kiszűrt találat | Messenger | Régi megjegyzés a location megosztás hiányáról | A source header még not built yet állapotot említ, de ez régi komment; a jelenlegi Maps-integráció miatt nem veszem fel aktív hiánynak. | Nincs új látható üzenet | [ng-messenger.js:41](https://github.com/szabolevi98/android-time-machine/blob/f4a72fe404051cde4275aa982641104e38baee7f/versions/7.1.2/ng-messenger.js#L41) |

## Futó oldalon végzett célzott ellenőrzés

- 2.1: az alkalmazáslista minden belépési pontjához van regisztrált modul.
- 6.0.1: az alkalmazáslista moduljai megvannak; a 14 vizsgált widget renderelése nem adott Még nincs kész törzset.
- 7.1.2: az alkalmazáslista moduljai megvannak; a providerjegyzék minden tagjánál implemented=true.
- Ezek nem az összes képernyő, menü és beállítássor friss kattintásos bejárásai. A Settings-célok feltételes tartalékágai ezért megmaradnak ellenőrzendőként.

## Nyers melléklet

473 kommentektől szűrt forráspozíció a betöltött JavaScript-fájlokból. A JSON és a kereshető HTML tartalmazza a pontos fájlt, sort, talált jelet, kódrészletet és rögzített commitra mutató hivatkozást. A nyers találatok között segédek és inaktív ágak is maradnak; ezeket nem szabad automatikusan új hibának számolni.

A vizsgálat során alkalmazáskódot nem módosítottam.
