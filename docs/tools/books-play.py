"""Writes Google Play Books for the versions it is installed on from Play (docs/reports/simulator-limits-2026-10-23.md,
T54): versions/6.0.1/mm-books.js (Play Books 3.9.37) and versions/7.1.2/ng-books.js (Play Books 3.13.17) from
docs/templates/books-play.template.js, with each version's namespace, class prefix and icons (copied by
docs/tools/playapp-assets.py from _aosp/<device>/playapps/Books.apk as bk39- / bk313- files) and 5.1.1's demo books
(the BOOKS list of versions/5.1.1/play-apps.js, copied as it is). The texts are the table books
(docs/data/mm-strings.txt, ng-strings.txt).

    python docs/tools/books-play.py"""
import re
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
VERSIONS = [
    dict(version='6.0.1', out='mm-books.js', ns='MM', cls='mmbk', icons='bk39', device='bullhead', name='3.9.37', read='side_drawer_reading_now', lib='side_drawer_my_library', empty='empty_read_now', sort='ic_sort_white_24dp', purchases='action_bar_title_free_and_purchased'),
    dict(version='7.1.2', out='ng-books.js', ns='NG', cls='ngbk', icons='bk313', device='angler', name='3.13.17', read='side_drawer_home', lib='side_drawer_library', empty='empty_library', sort='', purchases='action_bar_title_free_and_purchased'),
]
ICONS = ['ic_drawer_white', 'ic_search_white', 'ic_arrow_back_white_24dp', 'ic_arrow_back_gray_24dp', 'ic_close_wht_24dp',
         'ic_toc_24dp', 'ic_toc_wht_24dp', 'ic_menu_moreoverflow_card_dark_normal', 'illo_empty_my_library']
play = open(ROOT + 'versions/5.1.1/play-apps.js', encoding='utf-8').read()
books = re.search(r'\n(  const BOOKS = \[.*?\n  \];\n.*?BOOKS\.forEach\([^\n]*\n)', play, re.S).group(1).strip()
src = open(ROOT + 'docs/templates/books-play.template.js', encoding='utf-8').read()
css_src = open(ROOT + 'docs/templates/books-play.template.css', encoding='utf-8').read()
for v in VERSIONS:
    out = (src.replace('__BOOKS__', books).replace('__K_READ__', v['read']).replace('__K_LIB__', v['lib']).replace('__K_EMPTY_READ__', v['empty']).replace('__SORT_ICON__', v['sort']).replace('__PURCHASES__', v['purchases']).replace('__VERSION__', v['name']).replace('__DEVICE__', v['device']).replace('__NS_LOWER__', v['ns'].lower())
           .replace('__NS__', v['ns']).replace('__CLS__', v['cls']).replace('__ICONS__', v['icons']))
    open(f"{ROOT}versions/{v['version']}/{v['out']}", 'w', encoding='utf-8', newline='\n').write(out)
    open(f"{ROOT}versions/{v['version']}/{v['out'].replace('.js', '.css')}", 'w', encoding='utf-8', newline='\n').write(css_src.replace('__CLS__', v['cls']))
    print(v['version'], v['out'], 'icons:', f"python docs/tools/playapp-assets.py {v['version']} Books {v['icons']} {' '.join(ICONS + ([v['sort']] if v['sort'] else []))}")
