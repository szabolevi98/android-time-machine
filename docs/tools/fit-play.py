"""Writes Google Fit for the versions it is installed on from Play (docs/reports/simulator-limits-2026-10-23.md, T53):
versions/6.0.1/mm-fit.js (Fit 1.58.09) and versions/7.1.2/ng-fit.js (Fit 1.68.00) from docs/templates/fit-play.template.js,
with each version's namespace, class prefix and icons (copied by docs/tools/playapp-assets.py from
_aosp/<device>/playapps/Fit.apk as fit58- / fit68- files). The texts are the table fit (docs/data/mm-strings.txt,
ng-strings.txt).

    python docs/tools/fit-play.py"""
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
VERSIONS = [
    dict(version='6.0.1', out='mm-fit.js', ns='MM', cls='mmfit', icons='fit58', device='bullhead', name='1.58.09', hint='activity_name_hint', add='add_activity_dialog_title', other=True),
    dict(version='7.1.2', out='ng-fit.js', ns='NG', cls='ngfit', icons='fit68', device='angler', name='1.68.00', hint='activity_desc_hint', add='add_activity_title', other=False),
]
# The types Add activity offers (1.68 has no ic_other, so no Other there): the three with their own colour first.
TYPES = ['walking', 'running', 'biking', 'aerobics', 'badminton', 'basketball', 'dancing', 'football', 'golf', 'hiking', 'pilates', 'rowing', 'skiing',
         'soccer', 'strength_training', 'swimming', 'tennis', 'volleyball', 'yoga']
ICONS = ['illo_header_myfit_single_walking_male_01', 'ic_steps_gray', 'ic_close_dark', 'quantum_ic_add_white_24', 'ic_white_running_24', 'ic_weight_white', 'ic_add_activity',
         'logo_fitness_color_24dp', 'ic_timeline_dark', 'quantum_ic_group_grey600_24', 'quantum_ic_settings_black_24', 'quantum_ic_help_black_24']
src = open(ROOT + 'docs/templates/fit-play.template.js', encoding='utf-8').read()
css_src = open(ROOT + 'docs/templates/fit-play.template.css', encoding='utf-8').read()
for v in VERSIONS:
    types = TYPES + (['other'] if v['other'] else [])
    out = (src.replace('__TYPES__', repr(types)).replace('__K_HINT__', v['hint']).replace('__K_ADD__', v['add']).replace('__VERSION__', v['name']).replace('__DEVICE__', v['device']).replace('__NS__', v['ns'])
           .replace('__CLS__', v['cls']).replace('__ICONS__', v['icons']))
    open(f"{ROOT}versions/{v['version']}/{v['out']}", 'w', encoding='utf-8', newline='\n').write(out)
    open(f"{ROOT}versions/{v['version']}/{v['out'].replace('.js', '.css')}", 'w', encoding='utf-8', newline='\n').write(css_src.replace('__CLS__', v['cls']))
    print(v['version'], v['out'], 'icons:', f"python docs/tools/playapp-assets.py {v['version']} Fit {v['icons']} {' '.join(ICONS + ['ic_' + x for x in types])}")
