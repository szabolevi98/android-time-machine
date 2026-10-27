"""Writes Google+ for the versions it is installed on from Play (docs/reports/simulator-limits-2026-10-23.md, T56):
versions/6.0.1/mm-plus.js (Google+ 8.4.0) and versions/7.1.2/ng-plus.js (Google+ 9.14.0) from
docs/templates/plus-play.template.js, with each version's namespace, class prefix, the Android page's post of its year
and icons (copied by docs/tools/playapp-assets.py from _aosp/<device>/playapps/PlusOne.apk as gp84- / gp914- files).
The texts are the table plus (docs/data/mm-strings.txt, ng-strings.txt).

    python docs/tools/plus-play.py"""
import json
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
VERSIONS = [
    dict(version='6.0.1', out='mm-plus.js', ns='MM', cls='mmplus', icons='gp84', device='bullhead', name='8.4.0.128646069', year='2016',
         post='Android 6.0 Marshmallow: Now on Tap, app permissions you choose, and Doze for a longer-lasting battery.'),
    dict(version='7.1.2', out='ng-plus.js', ns='NG', cls='ngplus', icons='gp914', device='angler', name='9.14.0.158314320', year='2017',
         post='Android 7.1 Nougat: app shortcuts on the home screen, split-screen for two apps at once and replies right from the notification.'),
]
ICONS = ['quantum_ic_menu_white_24', 'quantum_ic_search_white_24', 'quantum_ic_notifications_none_white_24', 'quantum_ic_more_vert_grey600_24',
         'quantum_ic_share_grey600_24', 'quantum_ic_create_white_24', 'quantum_ic_close_white_24', 'quantum_ic_public_grey600_18',
         'quantum_ic_photo_library_grey600_24', 'quantum_ic_place_grey600_24', 'quantum_ic_home_grey600_24', 'quantum_ic_photo_album_grey600_24',
         'quantum_ic_people_grey600_24', 'quantum_ic_notifications_grey600_24']
src = open(ROOT + 'docs/templates/plus-play.template.js', encoding='utf-8').read()
css_src = open(ROOT + 'docs/templates/plus-play.template.css', encoding='utf-8').read()
for v in VERSIONS:
    out = (src.replace('__VERSION__', v['name']).replace('__DEVICE__', v['device']).replace('__YEAR__', v['year']).replace('__ANDROID_POST__', json.dumps(v['post'], ensure_ascii=False).replace('"', "'"))
           .replace('__NS__', v['ns']).replace('__CLS__', v['cls']).replace('__ICONS__', v['icons']))
    open(f"{ROOT}versions/{v['version']}/{v['out']}", 'w', encoding='utf-8', newline='\n').write(out)
    open(f"{ROOT}versions/{v['version']}/{v['out'].replace('.js', '.css')}", 'w', encoding='utf-8', newline='\n').write(css_src.replace('__CLS__', v['cls']))
    print(v['version'], v['out'], 'icons:', f"python docs/tools/playapp-assets.py {v['version']} PlusOne {v['icons']} {' '.join(ICONS)}")
