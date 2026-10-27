"""Writes Google Fit for the versions it is installed on from Play (docs/reports/simulator-limits-2026-10-23.md, T53):
versions/6.0.1/mm-fit.js (Fit 1.58.09) and versions/7.1.2/ng-fit.js (Fit 1.68.00) from docs/templates/fit-play.template.js,
with each version's namespace, class prefix and icons (copied by docs/tools/playapp-assets.py from
_aosp/<device>/playapps/Fit.apk as fit58- / fit68- files). The texts are the table fit (docs/data/mm-strings.txt,
ng-strings.txt).

Every activity type of the APK (its activity_type_* strings) goes into the type list, and the ones with an ic_<type>
drawable get it copied; the rest show the colour circle alone.

    python docs/tools/fit-play.py"""
import re, zipfile
from loguru import logger; logger.remove()
from androguard.core.apk import APK
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
VERSIONS = [
    dict(version='6.0.1', out='mm-fit.js', ns='MM', cls='mmfit', icons='fit58', device='bullhead', name='1.58.09', hint='activity_name_hint', add='add_activity_dialog_title', type='session_dialog_activity_type_label', volume=False),
    dict(version='7.1.2', out='ng-fit.js', ns='NG', cls='ngfit', icons='fit68', device='angler', name='1.68.00', hint='activity_desc_hint', add='add_activity_title', type='activity_type_label', volume=True),
]


def types_of(device):
    # (every type, the types with an ic_<type> PNG) of the version's Fit.apk; 'still' is not something one adds.
    path = f'{ROOT}_aosp/{device}/playapps/Fit.apk'
    a = APK(path); r = a.get_android_resources(); pkg = a.get_package()
    s = r.get_resolved_strings()[pkg]; en = s.get('DEFAULT') or next(iter(s.values()))
    keys = {r.get_resource_xml_name(rid).split('/')[-1] for rid in en}
    every = sorted(k[14:] for k in keys if k.startswith('activity_type_') and not k.endswith('_verb') and k not in ('activity_type_title', 'activity_type_label', 'activity_type_still'))
    drawables = {re.sub(r'\.png$', '', n.split('/')[-1]) for n in zipfile.ZipFile(path).namelist() if n.startswith('res/drawable') and n.endswith('.png')}
    return every, [t for t in every if 'ic_' + t in drawables]
ICONS = ['illo_header_myfit_single_walking_male_01', 'ic_steps_gray', 'ic_overflow_dark_small', 'ic_close_dark', 'quantum_ic_add_white_24', 'ic_white_running_24', 'ic_weight_white', 'ic_add_activity',
         'logo_fitness_color_24dp', 'ic_timeline_dark', 'quantum_ic_group_grey600_24', 'quantum_ic_settings_black_24', 'quantum_ic_help_black_24']
src = open(ROOT + 'docs/templates/fit-play.template.js', encoding='utf-8').read()
css_src = open(ROOT + 'docs/templates/fit-play.template.css', encoding='utf-8').read()
for v in VERSIONS:
    every, types = types_of(v['device'])
    out = (src.replace('__ALLTYPES__', repr(every)).replace('__TYPES__', repr(types)).replace('__K_TYPE__', v['type'])
           .replace('__VOLUME__', 'true' if v['volume'] else 'false').replace('__VOLUME_NOTE__', ', hydration' if v['volume'] else '').replace('__K_HINT__', v['hint']).replace('__K_ADD__', v['add']).replace('__VERSION__', v['name']).replace('__DEVICE__', v['device']).replace('__NS__', v['ns'])
           .replace('__CLS__', v['cls']).replace('__ICONS__', v['icons']))
    open(f"{ROOT}versions/{v['version']}/{v['out']}", 'w', encoding='utf-8', newline='\n').write(out)
    open(f"{ROOT}versions/{v['version']}/{v['out'].replace('.js', '.css')}", 'w', encoding='utf-8', newline='\n').write(css_src.replace('__CLS__', v['cls']))
    print(v['version'], v['out'], 'icons:', f"python docs/tools/playapp-assets.py {v['version']} Fit {v['icons']} {' '.join(ICONS + ['ic_' + x for x in types])}")
