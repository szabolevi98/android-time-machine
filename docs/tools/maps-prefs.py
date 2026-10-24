"""Writes versions/<v>/maps-prefs.js (Google Maps' settings screens) from docs/templates/maps-prefs.template.js.

    python docs/tools/maps-prefs.py

Each version's block below is its Maps APK's screens: Maps 6.x (4.0.4, 4.3) take the rows of new_settings_preference.xml
and map_tile_settings.xml, whose titles came from Maps' downloaded language pack (not in the image), so those texts are
the simulator's own (i18n.js); Maps 7.5 (4.4.4) and 9.3 (5.1.1) take settings.xml with the APK's strings
(stock-strings.json, group maps)."""
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'

MAPS6 = r'''
  /* Maps __VERSION__ (__DEVICE__): Settings is new_settings_preference.xml. Of its rows the local ones are drawn: Switch
     account (the one account), Cache settings (map_tile_settings.xml: Use cached tiles only and Clear cache, which empties
     the tiles the map has shown and has nothing to clear until the map is shown again) and About. Sign in, Location
     settings (Latitude's server settings), Labs (a server list), What's new, Legal, Feedback stay out like Latitude's
     list item, their titles being server text too. */
  const VERSION = '__VERSION__';
  const DELETE_TITLE = ctx => S(ctx, 'Delete'), DELETE_MESSAGE = ctx => S(ctx, '<b>{0}</b> will be removed from My Places.');
  const SCREENS = {
    settings: ctx => ({title: S(ctx, 'Settings'), rows: [
      {kind: 'info', title: ctx.t('Switch account'), summary: ctx.account},
      {open: 'cache', title: ctx.t('Cache settings')},
      {kind: 'info', title: ctx.t('About'), summary: VERSION}]}),
    cache: ctx => ({title: ctx.t('Cache settings'), rows: [
      {kind: 'check', key: 'map_tile_settings_use_cached_tiles_only', title: ctx.t('Use cached tiles only'), def: false},
      {key: 'clear', title: ctx.t('Clear cache'), disabled: !ctx.data.mapsCache}]})__PLACES__
  };
  function act(key, ctx) {
    if (key === 'clear') { ctx.data.mapsCache = false; ctx.save(); return true; }
    if (key.startsWith('s:')) { const q = ctx.data.mapsStarred?.[Number(key.slice(2))]; ctx.ui.mapsPrefs = null; ctx.ui.mapsQuery = q || ''; return true; }
    return true;
  }'''

PLACES43 = r''',
    // My Places (MY_PLACES_COMMAND): the starred places (MY_PLACES_ITEM_IS_STARRED), a tap shows one on the map, × deletes
    // it after MY_PLACES_DELETE_CONFIRM; none gives MY_PLACES_NO_STARRED_ITEM_MESSAGE.
    places: ctx => ({title: S(ctx, 'My Places'), rows: (ctx.data.mapsStarred || []).length ? ctx.data.mapsStarred.map((q, i) => ({kind: 'item', key: `s:${i}`, del: `mapsStarred:${i}`, title: q, summary: S(ctx, 'Starred')})) : [{kind: 'empty', title: S(ctx, 'You have no starred places.')}]})'''

MAPS79 = r'''
  /* Maps __VERSION__ (__DEVICE__): Settings is settings.xml__LAYOUT__. Local rows work: Edit home or work (Home / Work and
     their SET_HOME_LOCATION / SET_WORK_LOCATION hints), Google location settings (Google Settings' location page), Maps
     history (the searches; a tap searches again, × deletes after MY_PLACES_DELETE_CONFIRM), Distance units
     (DISTANCE_UNIT_ENTRIES; the route's distances follow it), Shake to send feedback (on by default) and About, terms &
     privacy (VERSION with ABOUT_VERSION_SUMMARY). Help, feedback, offers, tips and the web's terms are Google's pages. */
  const VERSION = __VERSIONS__;
  const DELETE_TITLE = ctx => S(ctx, 'Delete'), DELETE_MESSAGE = ctx => S(ctx, '<b>%1$s</b> will be removed from Maps History.');
  const UNITS = __UNITS__;
  const homeWork = ctx => [
    {key: 'home', title: S(ctx, 'Home'), summary: ctx.data.mapsHome || S(ctx, 'Enter home address')},
    {key: 'work', title: S(ctx, 'Work'), summary: ctx.data.mapsWork || S(ctx, 'Enter work address')}];
  const history = ctx => (ctx.data.mapsHistory || []).map((q, i) => ({kind: 'item', key: `q:${i}`, del: `mapsHistory:${i}`, title: q}));
  const SCREENS = {
    settings: ctx => ({title: S(ctx, 'Settings'), rows: [
__ROWS__]}),
    homework: ctx => ({title: S(ctx, 'Edit home or work'), rows: homeWork(ctx)}),
    history: ctx => ({title: S(ctx, 'Maps history'), rows: history(ctx)}),
    about: ctx => ({title: S(ctx, 'About, terms & privacy'), rows: [
      {kind: 'info', title: S(ctx, 'Version'), summary: fmt(S(ctx, '{0} (#{1})'), ...VERSION)},
      ...['Terms of Service', 'Privacy Policy', 'Legal Notices', 'Web History'].map(key => ({remote: true, title: S(ctx, key)}))]})__PLACES__
  };
  function act(key, ctx) {
    if (key === 'location') { ctx.open('google-settings', 'gms-location'); return false; }
    if (key === 'home' || key === 'work') { const store = key === 'home' ? 'mapsHome' : 'mapsWork'; ctx.ui.mpsDialog = {kind: 'edit', store, title: S(ctx, key === 'home' ? 'Home' : 'Work'), hint: S(ctx, key === 'home' ? 'Enter home address' : 'Enter work address'), value: ctx.data[store] || ''}; return true; }
    if (key.startsWith('q:')) { const q = ctx.data.mapsHistory?.[Number(key.slice(2))]; ctx.ui.mapsPrefs = null; ctx.ui.mapsQuery = q || ''; return true; }
    return true;
  }'''

ROWS_75 = '''      {kind: 'info', title: S(ctx, 'Switch account'), summary: ctx.account},
      {open: 'homework', title: S(ctx, 'Edit home or work')},
      {key: 'location', title: S(ctx, 'Google location settings')},
      {remote: true, title: S(ctx, 'Location accuracy tips')},
      {open: 'history', title: S(ctx, 'Maps history')},
      {remote: true, title: S(ctx, 'Offer notifications')},
      {kind: 'list', key: 'distance_units', title: S(ctx, 'Distance units'), options: ['Automatic', 'Kilometers', 'Miles'].map(k => S(ctx, k)), values: UNITS, def: UNITS[0]},
      {remote: true, title: S(ctx, 'Send feedback')},
      {kind: 'check', key: 'shake_to_send_feedback', title: S(ctx, 'Shake to send feedback'), def: true},
      {remote: true, title: S(ctx, 'Tutorials & help')},
      {open: 'about', title: S(ctx, 'About, terms & privacy')}
'''
ROWS_93 = '''      {open: 'homework', title: S(ctx, 'Edit home or work')},
      {key: 'location', title: S(ctx, 'Google location settings')},
      {remote: true, title: S(ctx, 'Location accuracy tips')},
      {open: 'history', title: S(ctx, 'Maps history')},
      {remote: true, title: S(ctx, 'Location notifications')},
      {kind: 'list', key: 'distance_units', title: S(ctx, 'Distance units'), options: ['Automatic', 'Kilometers', 'Miles'].map(k => S(ctx, k)), values: UNITS, def: UNITS[0]},
      {remote: true, title: S(ctx, 'Navigation settings')},
      {kind: 'check', key: 'shake_to_send_feedback', title: S(ctx, 'Shake to send feedback'), def: true},
      {open: 'about', title: S(ctx, 'About, terms & privacy')}
'''
PLACES93 = r''',
    // Your places (YOUR_PLACES): Home and Work, then the searches of Maps history.
    places: ctx => ({title: S(ctx, 'Your places'), rows: [...homeWork(ctx), ...history(ctx)]})'''

VERSIONS = {
    '4.0.4': ('Google Maps 6.4.0 settings (Galaxy Nexus IMM76I)', MAPS6.replace('__VERSION__', '6.4.0').replace('__DEVICE__', 'maguro IMM76I').replace('__PLACES__', '')),
    '4.3': ('Google Maps 6.14.4 settings and My Places (Nexus 4 JWR66Y)', MAPS6.replace('__VERSION__', '6.14.4').replace('__DEVICE__', 'mako JWR66Y').replace('__PLACES__', PLACES43)),
    '4.4.4': ('Google Maps 7.5.0 settings (Nexus 5 KTU84P)', MAPS79.replace('__VERSION__', '7.5.0').replace('__DEVICE__', 'hammerhead KTU84P').replace('__LAYOUT__', ' (preference_multiline_internal rows); Sign in is not there for the signed-in phone')
              .replace('__VERSIONS__', "['7.5.0', '705001723']").replace('__UNITS__', "['UNKNOWN', 'KILOMETERS', 'MILES']").replace('__ROWS__', ROWS_75).replace('__PLACES__', '')),
    '5.1.1': ('Google Maps 9.3.0 settings and Your places (Nexus 6 LMY48Y)', MAPS79.replace('__VERSION__', '9.3.0').replace('__DEVICE__', 'shamu LMY48Y').replace('__LAYOUT__', '; its last row, Sign in, is not there for the signed-in phone')
              .replace('__VERSIONS__', "['9.3.0', '903008024']").replace('__UNITS__', "['', 'KILOMETERS', 'MILES']").replace('__ROWS__', ROWS_93).replace('__PLACES__', PLACES93)),
}
template = open(ROOT + 'docs/templates/maps-prefs.template.js', encoding='utf-8').read()
for v, (title, config) in VERSIONS.items():
    out = template.replace('__TITLE__', title + '.').replace('__CONFIG__', config.lstrip('\n'))
    open(f'{ROOT}versions/{v}/maps-prefs.js', 'w', encoding='utf-8', newline='\n').write(out)
    print('wrote', v)
