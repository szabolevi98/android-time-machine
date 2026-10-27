"""Writes News & Weather for the versions it is installed on from Play (docs/reports/simulator-limits-2026-10-23.md,
T55): versions/6.0.1/mm-news.js (News & Weather 2.7.1) and versions/7.1.2/ng-news.js (News & Weather 3.1.4) from
docs/templates/news-play.template.js, with each version's namespace, class prefix and icons (copied by
docs/tools/playapp-assets.py from _aosp/<device>/playapps/News.apk as nw27- / nw31- files). The texts are the table
news (docs/data/mm-strings.txt, ng-strings.txt).

    python docs/tools/news-play.py"""
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
VERSIONS = [
    dict(version='6.0.1', out='mm-news.js', ns='MM', cls='mmnw', icons='nw27', device='bullhead', name='2.7.1', editions='Change editions…'),
    dict(version='7.1.2', out='ng-news.js', ns='NG', cls='ngnw', icons='nw31', device='angler', name='3.1.4', editions='Country & Language'),
]
ICONS = ['abc_ic_search_api_mtrl_alpha', 'ic_arrow_back_white_24dp', 'ic_more_horiz_white_18dp', 'weather_large_partly_cloudy']
src = open(ROOT + 'docs/templates/news-play.template.js', encoding='utf-8').read()
css_src = open(ROOT + 'docs/templates/news-play.template.css', encoding='utf-8').read()
for v in VERSIONS:
    out = (src.replace('__VERSION__', v['name']).replace('__DEVICE__', v['device']).replace('__EDITIONS__', v['editions'])
           .replace('__NS_LOWER__', v['ns'].lower()).replace('__NS__', v['ns']).replace('__CLS__', v['cls']).replace('__ICONS__', v['icons']))
    open(f"{ROOT}versions/{v['version']}/{v['out']}", 'w', encoding='utf-8', newline='\n').write(out)
    open(f"{ROOT}versions/{v['version']}/{v['out'].replace('.js', '.css')}", 'w', encoding='utf-8', newline='\n').write(css_src.replace('__CLS__', v['cls']).replace('__NS_LOWER__', v['ns'].lower()))
    print(v['version'], v['out'], 'icons:', f"python docs/tools/playapp-assets.py {v['version']} News {v['icons']} {' '.join(ICONS)}")
