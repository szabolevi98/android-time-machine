"""Android 7.1.2's locale and time zone data for Settings, written to versions/7.1.2/ng-locale-data.js:
NG.locales (LocaleStore over the image's framework): supported, the framework's supported_locales array without the
pseudo-locales (shown only with developer options' pseudo-locale switch); untranslated, those whose language and script
no framework-res values-* folder translates (LocaleStore.isTranslated: the drag cell's "May not be available in some
apps"). NG.zones (settingslib ZoneGetter over the image's ICU 56 data):
  - ids: SettingsGoogle's res/xml/timezones.xml in its order (read from ng-settings-data.js, which ng-prefs.py writes),
  - region: each zone's country (zoneinfo64's Regions: libcore TimeZoneNames.forLocale lists the zones of the locale's
    country, and ZoneGetter names those by their long names unless two of them share one),
  - names[lang][id] = [exemplar city, long standard name, long daylight name]: TimeZoneNames.getExemplarLocationName
    (the locale's 'ec', else ICU's default: the ID's last part with spaces) and getDisplayName(LONG_STANDARD /
    LONG_DAYLIGHT) through the zone's metazone; '' where ICU has none (ZoneGetter then shows the GMT string).
Run: python -E -X utf8 docs/tools/ng-locale-data.py"""
import json, re, sys
sys.path.insert(0, __file__.replace('\\', '/').rsplit('/', 1)[0])
from timezonepicker import read_image, image_file, Names, LOCALES
from icu_res import IcuData
from image_res import ROOT, ImageRes

DEVICE, OUT = 'angler', f'{ROOT}versions/7.1.2/ng-locale-data.js'


def default_city(zid):
    # TimeZoneNamesImpl.getDefaultExemplarLocationName: the part after the last '/', '_' as spaces.
    if '/' not in zid or zid.startswith('Etc/') or zid.startswith('SystemV/'):
        return ''
    return zid.rsplit('/', 1)[1].replace('_', ' ')


# The likely script of the languages written in more than one (ICU's likelySubtags for these).
SCRIPT = {'sr': 'Cyrl', 'uz': 'Latn', 'az': 'Latn', 'bs': 'Latn', 'pa': 'Guru', 'ms': 'Latn', 'mn': 'Cyrl', 'vai': 'Vaii', 'shi': 'Tfng', 'ha': 'Latn', 'ff': 'Latn'}
OLD = {'in': 'in', 'iw': 'iw', 'tl': 'fil'}


def lang_script(tag):
    parts = tag.replace('-r', '-').split('-')
    lang = OLD.get(parts[0], parts[0])
    script = next((p for p in parts[1:] if len(p) == 4), None)
    if not script and lang == 'zh':
        script = 'Hant' if any(p in ('TW', 'HK', 'MO') for p in parts[1:]) else 'Hans'
    return f'{lang}-{script or SCRIPT.get(lang, "")}'


ICU_LANG = {'iw': 'he', 'in': 'id'}


def native(icu, tag):
    """LocaleHelper.getDisplayName(locale, locale, true) over ICU's lang/ and region/ trees: the language, then the script
    and region in localeDisplayPattern ("English (United States)", "中文 (简体, 中国)"), sentence case."""
    parts = tag.split('-')
    lang = ICU_LANG.get(parts[0], parts[0])
    script = next((p for p in parts[1:] if len(p) == 4), None)
    region = next((p for p in parts[1:] if len(p) in (2, 3) and p.isupper() or p.isdigit()), None)
    loc = '_'.join([lang] + ([script] if script else []) + ([region] if region else []))
    name = icu.get('lang', loc, 'Languages', lang) or lang
    pattern = icu.get('lang', loc, 'localeDisplayPattern') or {'pattern': '{0} ({1})', 'separator': '{0}, {1}'}
    extra = [x for x in (script and icu.get('lang', loc, 'Scripts', script), region and icu.get('region', loc, 'Countries', region)) if x]
    if extra:
        inner = extra[0]
        for x in extra[1:]:
            inner = pattern['separator'].replace('{0}', inner).replace('{1}', x)
        name = pattern['pattern'].replace('{0}', name).replace('{1}', inner)
    country = region and icu.get('region', loc, 'Countries', region) or ''
    return name[:1].upper() + name[1:], country


def locales(icu):
    res = ImageRes(DEVICE)
    supported = [t for t in res.array(['framework'], 'supported_locales')['en'] if t not in ('en-XA', 'ar-XB')]
    _, _, strings = res._apk('framework')
    translated = {lang_script(k) for k in strings if k != 'DEFAULT'} | {lang_script('en')}
    # Each locale's own name and its country's, and each language level's (with its script where it has one).
    names = {t: list(native(icu, t)) for t in supported}
    parents = sorted({t.split('-')[0] + ('-' + t.split('-')[1] if len(t.split('-')) > 2 and len(t.split('-')[1]) == 4 else '') for t in supported})
    names.update({p: [native(icu, p)[0], ''] for p in parents})
    return {'supported': supported, 'untranslated': [t for t in supported if lang_script(t) not in translated], 'names': names}


def main():
    data = open(f'{ROOT}versions/7.1.2/ng-settings-data.js', encoding='utf-8').read()
    ids = re.findall(r'\{"t":"timezone","id":"([^"]+)"\}', data)
    icu = IcuData(read_image(DEVICE, '/usr/icu/' + image_file(DEVICE, '/usr/icu')))
    names = Names(icu)
    zone_names, regions = icu.raw('zoneinfo64', 'Names'), icu.raw('zoneinfo64', 'Regions')
    region = {z: regions[i] for i, z in enumerate(zone_names) if z in ids}
    out = {}
    for lang, locale in LOCALES.items():
        table = {}
        for zid in ids:
            key = names.canonical(zid)
            city = icu.get('zone', locale, 'zoneStrings', key, 'ec') or default_city(zid)
            table[zid] = [city, names.zone(zid, lang, False) or '', names.zone(zid, lang, True) or '']
        out[lang] = table
    body = json.dumps({'ids': ids, 'region': region, 'names': out}, ensure_ascii=False, separators=(',', ':'))
    loc = locales(icu)
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write('/* Android 7.1.2 locales (framework supported_locales) and time zone names (SettingsGoogle timezones.xml, ICU 56\n'
                '   of N2G48C), written by docs/tools/ng-locale-data.py. */\n')
        f.write(f'NG.locales = {json.dumps(loc, ensure_ascii=False, separators=(",", ":"))};\n')
        f.write(f'NG.zones = {body};\n')
    print(len(loc['supported']), 'locales,', len(loc['untranslated']), 'untranslated,', len(ids), 'zones ->', OUT)


main()
