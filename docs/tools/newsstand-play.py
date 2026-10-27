"""Writes Play Newsstand for the versions it is installed on from Play (docs/reports/simulator-limits-2026-10-23.md,
T57): versions/6.0.1/mm-newsstand.js (Play Newsstand 3.5.2: the app_color_material bar, the drawer of Read Now, My
Library, Bookmarks and Explore) and versions/7.1.2/ng-newsstand.js (Play Newsstand 4.5.0, the 4.x redesign: the light
bar and the bottom bar of For You, Library, Read Later and Explore) from docs/templates/newsstand-play.template.js,
with each version's namespace, class prefix, icons (copied by docs/tools/playapp-assets.py from
_aosp/<device>/playapps/Newsstand.apk as ns35- / ns45- files) and the demo articles of news-reader.js (copied as they
are). The texts are the table newsstand (docs/data/mm-strings.txt, ng-strings.txt).

    python docs/tools/newsstand-play.py"""
import json, re
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
VERSIONS = [
    dict(version='6.0.1', out='mm-newsstand.js', ns='MM', cls='mmns', icons='ns35', device='bullhead', name='3.5.2', bar='#5363fe', text='#fff', accent='#5363fe',
         layout="NewsstandActivity: the Toolbar in app_color_material #5363FE with white text, home_activity_menu.xml's Search and the\n   overflow, and the drawer of Read Now, My Library, Bookmarks (Bookmark for Later) and Explore, then Settings.",
         cfg=dict(theme='dark', drawer=True, status='#3f51b5', help='', add='bookmark_for_later', remove='remove_from_bookmarks', added='added_to_bookmarks',
                  removed='removed_from_bookmarks', emptySaved='empty_list_caption_bookmarks',
                  views=[['home', 'read_now_title', 'ic_drawer_readnow'], ['library', 'my_library_title', 'ic_drawer_mylibrary'], ['saved', 'saved_title', 'ic_drawer_bookmarks'], ['explore', 'explore_title', 'ic_drawer_explore']],
                  icon=dict(menu='', back='abc_ic_ab_back_mtrl_am_alpha', search='ic_search_wht_24dp', share='ic_share_wht_24dp', save='ic_bookmark_outline_wht_24dp', saved='ic_bookmark_wht_24dp'))),
    dict(version='7.1.2', out='ng-newsstand.js', ns='NG', cls='ngns', icons='ns45', device='angler', name='4.5.0', bar='#fafafa', text='#000000de', accent='#972cb0',
         layout="The 4.x redesign (home_activity_menu_light.xml): the light Toolbar with Search and the overflow, and the bottom bar of\n   For You, Library, Read Later (Add to Read Later) and Explore; app_color_material #972CB0 marks the current one.",
         cfg=dict(theme='light', drawer=False, status='#bdbdbd', help='help_feedback', add='add_to_read_later', remove='remove_from_read_later', added='added_to_read_later',
                  removed='removed_from_read_later', emptySaved='empty_list_caption_read_later',
                  views=[['home', 'for_you_title', 'quantum_ic_play_newsstand_grey600_24'], ['library', 'following_title', 'ic_library_grid_icon'], ['saved', 'saved_tab_title', 'quantum_ic_bookmark_border_grey600_24'], ['explore', 'explore_title', 'quantum_ic_explore_grey600_24']],
                  icon=dict(menu='', back='quantum_ic_arrow_back_white_24', search='quantum_ic_search_grey600_24', share='quantum_ic_share_grey600_24', save='quantum_ic_bookmark_border_grey600_24', saved='quantum_ic_bookmark_grey600_24'))),
]
reader = open(ROOT + 'news-reader.js', encoding='utf-8').read()
articles = re.search(r'\n(  const ARTICLES = \{.*?\n  \};\n)', reader, re.S).group(1).strip()
src = open(ROOT + 'docs/templates/newsstand-play.template.js', encoding='utf-8').read()
css_src = open(ROOT + 'docs/templates/newsstand-play.template.css', encoding='utf-8').read()
for v in VERSIONS:
    out = (src.replace('__ARTICLES__', articles).replace('__CFG__', json.dumps(v['cfg'])).replace('__LAYOUT__', v['layout']).replace('__VERSION__', v['name'])
           .replace('__DEVICE__', v['device']).replace('__NS_LOWER__', v['ns'].lower()).replace('__NS__', v['ns']).replace('__CLS__', v['cls']).replace('__ICONS__', v['icons']))
    open(f"{ROOT}versions/{v['version']}/{v['out']}", 'w', encoding='utf-8', newline='\n').write(out)
    css = (css_src.replace('__CLS__', v['cls']).replace('__NS_LOWER__', v['ns'].lower()).replace('__BAR__', v['bar']).replace('__BAR_TEXT__', v['text']).replace('__ACCENT__', v['accent']))
    open(f"{ROOT}versions/{v['version']}/{v['out'].replace('.js', '.css')}", 'w', encoding='utf-8', newline='\n').write(css)
    icons = sorted({i for i in v['cfg']['icon'].values() if i} | {x[2] for x in v['cfg']['views']} | ({x[2] + '_selected' for x in v['cfg']['views']} if v['cfg']['drawer'] else set()) | {'ic_empty_bookmark'})
    print(v['version'], v['out'], 'icons:', f"python docs/tools/playapp-assets.py {v['version']} Newsstand {v['icons']} {' '.join(icons)}")
