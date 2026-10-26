"""Writes Google Docs, Sheets and Slides for the versions they are installed on from Play
(docs/reports/simulator-limits-2026-10-23.md, T52): versions/6.0.1/mm-editors.js (Docs 1.6.292.13, Sheets 1.6.502.06,
Slides 1.6.352.16) and versions/7.1.2/ng-editors.js (Docs 1.7.212.02, Sheets 1.7.212.03, Slides 1.7.212.01) from
docs/templates/editors-play.template.js, with each version's namespace, class prefix and icons (copied by
docs/tools/playapp-assets.py from _aosp/<device>/playapps/Docs.apk, and each app's launcher logo from its own APK, as
ed16- / ed17- files). The texts are the tables docs, sheets and slides (docs/data/mm-strings.txt, ng-strings.txt).

    python docs/tools/editors-play.py"""
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
VERSIONS = [
    dict(version='6.0.1', out='mm-editors.js', ns='MM', cls='mmeds', icons='ed16', device='bullhead', folder='ic_folder_white',
         names={'docs': '1.6.292.13', 'sheets': '1.6.502.06', 'slides': '1.6.352.16'}),
    dict(version='7.1.2', out='ng-editors.js', ns='NG', cls='ngeds', icons='ed17', device='angler', folder='quantum_ic_folder_white_24',
         names={'docs': '1.7.212.02', 'sheets': '1.7.212.03', 'slides': '1.7.212.01'}),
]
src = open(ROOT + 'docs/templates/editors-play.template.js', encoding='utf-8').read()
css_src = open(ROOT + 'docs/templates/editors-play.template.css', encoding='utf-8').read()
for v in VERSIONS:
    out = src
    for app, name in v['names'].items(): out = out.replace(f'__V_{app}__', name)
    out = (out.replace('__DEVICE__', v['device']).replace('__NS_LOWER__', v['ns'].lower()).replace('__NS__', v['ns'])
           .replace('__CLS__', v['cls']).replace('__ICONS__', v['icons']).replace('__FOLDER__', v['folder']))
    open(f"{ROOT}versions/{v['version']}/{v['out']}", 'w', encoding='utf-8', newline='\n').write(out)
    open(f"{ROOT}versions/{v['version']}/{v['out'].replace('.js', '.css')}", 'w', encoding='utf-8', newline='\n').write(css_src.replace('__CLS__', v['cls']))
    print(v['version'], v['out'], v['out'].replace('.js', '.css'))
