"""String, string-array and plurals resources of a factory image's APKs, as aapt compiled them, read with androguard.
Used by the docs/ generators that build a version's text tables from its own image (see docs/tools/image-index.py for the
unpacked _aosp/<device>/system layout). An APK is named as in the image without .apk ('Contacts', 'CalendarGoogle');
'framework' is framework-res.apk. Lookups try the APKs in the order given and take the first that defines the resource.
    res = ImageRes('crespo')
    res.string(['Contacts', 'framework'], 'menu_search')  -> {'en': ..., 'hu': ..., ...} (languages it translates)"""
import os
from loguru import logger; logger.remove()
from androguard.core.apk import APK

ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
LANGS = ['en', 'hu', 'de', 'fr', 'es']
QUANTITY = {0x01000004: 'other', 0x01000006: 'one'}  # the ^other / ^one attribute ids of a plurals bag


class ImageRes:
    def __init__(self, device):
        self.device, self.apks = device, {}

    def _apk(self, name):
        if name not in self.apks:
            system = f'{ROOT}_aosp/{self.device}/system/'
            path = next(p for p in ([system + 'framework/framework-res.apk'] if name == 'framework' else
                                    [f'{system}{d}/{name}.apk' for d in ('app', 'priv-app')] + [f'{system}{d}/{name}/{name}.apk' for d in ('app', 'priv-app')] +
                                    # An app installed from Play on this phone (6.0.1 / 7.1.2: _aosp/<device>/playapps/).
                                    [f'{ROOT}_aosp/{self.device}/playapps/{name}.apk'])
                        if os.path.exists(p))
            r = APK(path).get_android_resources()
            names = r.get_packages_names()
            pkg = next((p for p in names if p != 'android'), names[0])  # old APKs carry an empty 'android' package first
            self.apks[name] = (r, pkg, r.get_resolved_strings().get(pkg, {}))
        return self.apks[name]

    def _find(self, apks, kind, key):
        for name in apks:
            r, pkg, strings = self._apk(name)
            rid = r.get_res_id_by_key(pkg, kind, key)
            if rid is not None:
                return r, strings, rid
        return None

    @staticmethod
    def _lang(config):
        q = config.get_qualifier() or ''
        return 'en' if q == '' else q if q in LANGS else None

    def string(self, apks, key):
        """{lang: text} for the languages the image has the string in (English always), or None."""
        found = self._find(apks, 'string', key)
        if not found:
            return None
        r, strings, rid = found
        # A string that is a reference to a framework string (6.0.1 Settings' zen_mode_settings_title) is that string.
        for config, entry in r.get_res_configs(rid):
            if self._lang(config) == 'en' and entry.key.data_type == 1 and entry.key.data >> 24 == 1 and 'framework' not in apks:
                fr = self._apk('framework')[0]
                name = (fr.get_resource_xml_name(entry.key.data) or '').split('/')[-1]
                if name: return self.string(['framework'], name)
        def text(rid, lang, depth=0):
            # A value that references another string (@string/other) reads that one in the same configuration.
            for config, entry in r.get_res_configs(rid):
                if self._lang(config) == lang and entry.key.data_type == 1 and depth < 8:
                    return text(entry.key.data, lang, depth + 1) if any(self._lang(c) == lang for c, _ in r.get_res_configs(entry.key.data)) else text(entry.key.data, 'en', depth + 1)
                # The configuration's own plain string: androguard's resolved table lets a network-qualified one
                # (GmailProvider's mcc234 / mcc262 "Google Mail" for the UK and Germany) replace the default.
                if self._lang(config) == lang and entry.key.data_type == 3:
                    return r.stringpool_main.getString(entry.key.data)
            return strings['DEFAULT' if lang == 'en' else lang].get(rid)
        out = {'en': text(rid, 'en')}
        out.update({lang: text(rid, lang) for lang in LANGS[1:] if rid in strings.get(lang, {})})
        # A string defined only under an API qualifier the phone meets (Google Play services' values-v19 Android Pay
        # texts on the 6.0.1 image): that configuration is its default.
        if self.device == 'bullhead' and (out['en'] is None or len(out) < len(LANGS)):
            import re as _re
            for config, entry in r.get_res_configs(rid):
                q = config.get_qualifier() or ''
                m = _re.fullmatch(r'(?:(\w\w)-)?v(\d+)', q)
                if m and int(m.group(2)) <= 23 and entry.key.data_type == 3:
                    lang = m.group(1) or 'en'
                    if lang in LANGS and out.get(lang) is None: out[lang] = r.stringpool_main.getString(entry.key.data)
            out = {k: v for k, v in out.items() if v is not None or k == 'en'}
        return out

    def array(self, apks, key):
        """{lang: [items]}: an item that references a string resolves in that language (English when untranslated); a
        language without its own array takes the default one only when that consists of references."""
        found = self._find(apks, 'array', key)
        if not found:
            return None
        r, strings, rid = found
        configs = {}
        for config, entry in r.get_res_configs(rid):
            lang = self._lang(config)
            if lang:
                configs[lang] = [value for _, value in entry.item.items]
        def text(value, lang):
            if value.data_type == 1:  # a reference to a string resource
                got = strings.get(lang, {}).get(value.data, strings['DEFAULT'].get(value.data))
                if got: return got
                # A string that is itself a reference (Settings' wifi_security_psk_generic): resolved as string() does.
                name = (r.get_resource_xml_name(value.data) or '').split('/')[-1]
                full = self.string(apks, name) if name else None
                return (full or {}).get(lang) or (full or {}).get('en') or ''
            return r.stringpool_main.getString(value.data)
        out = {}
        for lang in LANGS:
            items = configs.get(lang)
            if items is None and any(value.data_type == 1 for value in configs['en']):
                items = configs['en']
            if items is not None:
                out[lang] = [text(value, lang) for value in items]
        return out

    def plurals(self, apks, key):
        """{lang: {'one': ..., 'other': ...}} for the languages the image has the plurals in."""
        found = self._find(apks, 'plurals', key)
        if not found:
            return None
        r, _, rid = found
        out = {}
        for config, entry in r.get_res_configs(rid):
            lang = self._lang(config)
            if lang:
                out[lang] = {QUANTITY[k]: r.stringpool_main.getString(item.data) for k, item in entry.item.items if k in QUANTITY}
        return out
