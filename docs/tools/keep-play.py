"""Writes Google Keep for the versions it is installed on from Play (docs/reports/simulator-limits-2026-10-23.md, T51):
versions/6.0.1/mm-keep.js (Keep 3.3.315.0) and versions/7.1.2/ng-keep.js (Keep 3.4.724.02) from
docs/templates/keep-play.template.js, with each version's namespace, class prefix, text names and icons (copied by
docs/tools/playapp-assets.py from the APK in _aosp/<device>/playapps/Keep.apk as kp33- / kp34- files).

    python docs/tools/keep-play.py"""
import json
SEND = {'MM': "// Send: the note's text; a recording goes along as an attachment (6.0.1: Gmail's draft takes it).\n  const sendNote = (c, n) => MM.share(c, {title: t('menu_send'), subject: n.title || '', text: plain(n), ...(n.audio ? {attach: [{name: 'Recording.wav', mime: 'audio/wav', size: 44 + 8000 * n.audio.sec}]} : {})});", 'NG': "// Send: the note's text; a recording goes along as the send model's document.\n  const sendNote = (c, n) => NG.share(c, {title: t('menu_send'), subject: n.title || '', text: plain(n), ...(n.audio ? {document: {name: 'Recording.wav', mime: 'audio/wav', type: 'audio', size: 44 + 8000 * n.audio.sec, duration: n.audio.sec}} : {})});"}
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
COMMON = {'list': 'ic_material_list_dark', 'ink': 'ic_ink_pen_black', 'mic': 'ic_material_mic_dark', 'camera': 'ic_material_camera_dark',
          'add': 'ic_add_box_black', 'action': 'ic_note_action_24dp', 'lightbulb': 'ic_material_lightbulb_light', 'reminders': 'ic_reminders_alt_black',
          'archiveBlack': 'ic_material_archive_black', 'trash': 'ic_material_trash_black', 'settings': 'ic_material_settings_black',
          'restore': 'ic_restore_black', 'forever': 'ic_delete_forever_black', 'menu': 'ic_menu_light', 'pinned': 'ic_material_pin',
          'back': 'ic_material_arrow_left_dark', 'back2': 'ic_material_arrow_left_light', 'backDark': 'ic_material_arrow_left_dark'}
VERSIONS = [
    # Keep 3.3: the white search on the yellow Toolbar, the dark editor icons on the note's colour.
    dict(version='6.0.1', out='mm-keep.js', ns='MM', cls='mmkp', icons='kp33', device='bullhead', name='3.3.315.0', audio='menu_new_recording',
         icon={**COMMON, 'search': 'ic_material_search_light', 'archive': 'ic_archive_dark', 'unarchive': 'ic_material_unarchive_dark',
               'pin': 'ic_material_pin', 'pinOn': 'ic_material_unpin_blue', 'reminder': 'ic_material_reminder_finger_dark'}),
    # Keep 3.4: the grey editor icons and the white search.
    dict(version='7.1.2', out='ng-keep.js', ns='NG', cls='ngkp', icons='kp34', device='angler', name='3.4.724.02', audio='menu_new_audio',
         icon={**COMMON, 'search': 'ic_search_white', 'archive': 'ic_archive_gray', 'unarchive': 'ic_unarchive_gray', 'pin': 'ic_pin_gray',
               'pinOn': 'ic_pin_blue_18dp', 'reminder': 'ic_reminder_finger_gray'}),
]
src = open(ROOT + 'docs/templates/keep-play.template.js', encoding='utf-8').read()
for v in VERSIONS:
    out = (src.replace('__VERSION__', v['name']).replace('__DEVICE__', v['device']).replace('__NS_LOWER__', v['ns'].lower()).replace('__NS__', v['ns'])
           .replace('__CLS__', v['cls']).replace('__ICONS__', v['icons']).replace('__AUDIO__', v['audio']).replace('__ICON_MAP__', json.dumps(v['icon'])).replace('__SEND__', SEND[v['ns']]))
    open(f"{ROOT}versions/{v['version']}/{v['out']}", 'w', encoding='utf-8', newline='\n').write(out)
    css = open(ROOT + 'docs/templates/keep-play.template.css', encoding='utf-8').read().replace('__CLS__', v['cls'])
    open(f"{ROOT}versions/{v['version']}/{v['out'].replace('.js', '.css')}", 'w', encoding='utf-8', newline='\n').write(css)
    print(v['version'], v['out'], v['out'].replace('.js', '.css'))
