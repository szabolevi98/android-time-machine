/* Google Calendar 5.7 Goals (com.google.android.calendar.groove, decompiled in _aosp/ngcal), the screen
   'calendar-goal' (CreateGrooveActivity) the speed dial's Goal opens, and the sessions in Calendar (ng-calendar.js):
   - GrooveCategorySelectionFragment: the white action bar (the back arrow; "Goals" 20 sp #212121 at 72 dp once the
     list has scrolled 64 dp, with 4 dp elevation), the 112 dp store header ("Choose a goal" 16 sp #212121, the
     description 16 sp #757575, 16 dp in) and the five GrooveCategories as cards 8 dp apart: the category's picture
     (groove_exercise … groove_organize) with groove_category_view's 72 dp text over its foot (the title 20 sp white,
     the description 14 sp #a8ffffff, 16 dp in).
   - GrooveSubcategorySelectionFragment on the category's illustration colour with its picture at the bottom: the
     question (GrooveCreationWizardTitle: 24 sp black, 12 dp above, 44 dp below, 72 dp in), the first
     getNumSubcategoriesToDisplay subcategories (4; Me time and Organize my life 3) and Custom… as
     GrooveCreationWizardButton rows (16 sp black, 72 dp in), entering after 200 ms (195 ms, fade and 10 dp rise).
   - CustomGrooveFragment: the title field (the question as its hint), the 1 px #33000000 divider, the 52 dp mini button
     in the category's fab colour with quantum_ic_done_white_24 once there is text, and the suggestions: the rest of
     the subcategories, or for a subcategory with a question its text suggestions (languages, instruments, art, hobbies).
   - GrooveScheduleFragment's pages: How often? (Once a week, 3 times a week, 5 times a week, Every day, More options…;
     the monthly set for the activities GrooveFrequencySelectionView lists), For how long? (15 / 30 minutes, 1 / 2
     hours; monthly 30 minutes … Whole day), Best time? (Morning, Afternoon, Evening, Any time), then GrooveSummaryView:
     the name (34 sp down to 24 sp), the mini button over the divider, "Calendar will schedule:" with the frequency
     (groove_n_times_a_week) and "duration, time", the calendar and MORE OPTIONS (the goal's editor: Your goal,
     Smart notifications). Its button turns into the progress while groove_checking_schedule_array's lines change every
     2.5 s; the sessions are scheduled at free times in the chosen part of the day and Calendar shows the first one's
     post-creation sheet ("First time is …", Does this time work for you?, ADJUST TIME, LOOKS GOOD).
   - A session (screen_groove): When, the goal (quantum_ic_flag: "Session n this week", "n/m done", the frequency, the
     duration and time), the calendar, and groove_info_command_bar's LATER / DID IT: done gives
     goal_marked_as_done_week_complete or _incomplete ("Mark as not done" undoes it); later says "Finding another time…"
     and "Session moved to …". */
(() => {
  'use strict';
  const T = () => NG.text('calgoal');
  const t = k => T().t(k);
  const A = n => `assets/ca-${n}`;
  const CATS = [
    {id: 256, key: 'exercise', img: 'groove_exercise.jpg', bg: '#7989c7', fab: '#f7714f', show: 4},
    {id: 512, key: 'build_skill', img: 'groove_skill.jpg', bg: '#ffdeb5', fab: '#fa6949', show: 4},
    {id: 768, key: 'friends_and_family', img: 'groove_friends.jpg', bg: '#b7e1cb', fab: '#f8c379', show: 4},
    {id: 1024, key: 'me_time', img: 'groove_metime.jpg', bg: '#efd4c9', fab: '#f44b83', show: 3},
    {id: 1280, key: 'organize_life', img: 'groove_organize.jpg', bg: '#ffdd86', fab: '#f46952', show: 3}];
  // GrooveCategories: the subcategories in order, and the ones with a question of their own (text suggestions).
  const SUBS = {
    256: [[257, 'exercise_work_out'], [258, 'exercise_run'], [259, 'exercise_walk'], [260, 'exercise_yoga'], [261, 'exercise_hike'], [262, 'exercise_bike'], [263, 'exercise_swim'], [264, 'exercise_rock_climb'], [265, 'exercise_play_tennis'], [266, 'exercise_play_badminton'], [267, 'exercise_play_baseball'], [268, 'exercise_play_basketball'], [269, 'exercise_play_soccer'], [270, 'exercise_wiggle_ears']],
    512: [[513, 'build_skill_practice_language', 'build_skill_practice_language_question', 'build_skill_practice_language_suggestions'], [514, 'build_skill_learn_to_code'], [515, 'build_skill_learn_instrument', 'build_skill_learn_an_instrument_question', 'build_skill_learn_instrument_suggestions'], [516, 'build_skill_make_art', 'build_skill_make_art_question', 'build_skill_make_art_suggestions'], [517, 'build_skill_practice_photography'], [518, 'build_skill_hone_carpentry_skills'], [519, 'build_skill_sing'], [520, 'build_skill_learn_a_knot'], [521, 'build_skill_learn_new_software'], [522, 'build_skill_cook_something_new'], [523, 'build_skill_learn_to_drive'], [524, 'build_skill_learn_to_fly']],
    768: [[769, 'friends_and_family_reach_out'], [770, 'friends_and_family_meal_with_family'], [771, 'friends_and_family_call_mom'], [772, 'friends_and_family_call_dad'], [773, 'friends_and_family_plan_a_date'], [774, 'friends_and_family_dinner_with_friends'], [775, 'friends_and_family_visit_family'], [776, 'friends_and_family_bbq'], [777, 'friends_and_family_play_board_game'], [778, 'friends_and_family_plan_a_reunion'], [779, 'friends_and_family_plan_family_vacation'], [780, 'friends_and_family_walk_the_dog']],
    1024: [[1025, 'me_time_read'], [1026, 'me_time_meditate'], [1027, 'me_time_hobby', 'me_time_hobby_question', 'me_time_hobby_suggestions'], [1028, 'me_time_cook'], [1029, 'me_time_journal'], [1030, 'me_time_pray'], [1031, 'me_time_watch_movie'], [1032, 'me_time_take_a_nap'], [1033, 'me_time_get_a_massage'], [1034, 'me_time_sit_in_the_grass'], [1035, 'me_time_take_the_boat_out'], [1036, 'me_time_lie_in_a_hammock'], [1037, 'me_time_take_a_selfie']],
    1280: [[1281, 'organize_life_plan_my_day'], [1282, 'organize_life_clean'], [1283, 'organize_life_chores'], [1284, 'organize_make_a_todo_list'], [1285, 'organize_buy_groceries'], [1286, 'organize_study'], [1287, 'organize_do_laundry'], [1288, 'organize_do_finances'], [1289, 'organize_plan_the_week'], [1291, 'organize_clear_email_inbox'], [1292, 'organize_clean_the_house']]};
  // GrooveFrequencySelectionView: these types start on the monthly frequencies.
  const MONTHLY = [520, 522, 524, 769, 771, 772, 773, 774, 775, 776, 777, 778, 779, 1033, 1034, 1035];
  const subName = id => { for (const l of Object.values(SUBS)) { const s = l.find(x => x[0] === id); if (s) return t('groove_category_' + s[1]); } return ''; };
  const catOf = id => CATS.find(x => x.id === (id & 0xff00));
  const U = c => c.ui.goal ||= {step: 'category'};
  const goals = c => c.data.goals ||= [];
  const esc = (c, s) => c.safe(s);
  const fmt = (c, d, o) => new Intl.DateTimeFormat(c.locale(), o).format(d);
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const hm = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const back = c => `<button type="button" class="ngcg-back" data-action="ngcg-back" aria-label="${esc(c, t('accessibility_navigation_icon'))}"><img src="${A('quantum_ic_arrow_back_black_24.png')}" alt=""></button>`;
  const btn = (c, label, action, data = '') => `<button type="button" class="ngcg-opt" data-action="${action}"${data}>${esc(c, label)}</button>`;
  const fab = (c, cat, hidden) => `<button type="button" class="ngcg-fab${hidden ? ' hidden' : ''}" style="background:${cat.fab}" data-action="ngcg-create" aria-label="${esc(c, t('groove_schedule_sessions'))}"><img src="${A('quantum_ic_done_white_24.png')}" alt=""><i class="ngcg-spin"></i></button>`;

  // GrooveUtils: the frequency, the duration and the preferred time as the summary and the session show them.
  const freqText = g => g.count === 7 && g.interval === 2 ? t('every_day') : T().plural(g.interval === 3 ? 'groove_n_times_a_month' : 'groove_n_times_a_week', g.count);
  const DUR = {15: 'groove_duration_15_mins', 30: 'groove_duration_30_mins', 60: 'groove_duration_1_hour', 120: 'groove_duration_2_hours', 240: 'groove_duration_half_day', 600: 'groove_duration_whole_day'};
  const timeText = g => g.time === 'any' ? t('groove_preferred_times_any_time') : t({morning: 'groove_preferred_time_mornings', afternoon: 'groove_preferred_time_afternoons', evening: 'groove_preferred_time_evenings'}[g.time]);
  const durText = g => T().fmt('duration_preferred_times_concatenated', null, t(DUR[g.minutes]), timeText(g).toLowerCase());

  /* ---- the wizard --------------------------------------------------------------------------------------------- */
  function store(c) {
    const u = U(c);
    return `<div class="ngcg ngcg-store"><div class="ngcg-bar${u.scrolled ? ' raised' : ''}">${back(c)}<span class="ngcg-bartitle">${esc(c, t('groove_title'))}</span></div><div class="ngcg-scroll">
      <div class="ngcg-head"><b>${esc(c, t('groove_category_selection_title'))}</b><span>${esc(c, t('groove_category_selection_description'))}</span></div>
      ${CATS.map(k => `<button type="button" class="ngcg-cat" style="background-color:${k.bg}" data-action="ngcg-cat" data-cat="${k.id}"><img src="${A(k.img)}" alt=""><span class="ngcg-cattext"><b>${esc(c, t(`groove_category_${k.key}_title`))}</b><small>${esc(c, t(`groove_category_${k.key}_description`))}</small></span></button>`).join('')}</div></div>`;
  }
  function subcategories(c) {
    const u = U(c), cat = catOf(u.cat), list = SUBS[cat.id];
    return `<div class="ngcg ngcg-frame" style="background:${cat.bg}"><img class="ngcg-art" src="${A(cat.img)}" alt="">${back(c)}<div class="ngcg-text${u.entered ? '' : ' enter'}"><h1>${esc(c, t(`groove_category_${cat.key}_question`))}</h1>
      ${list.slice(0, cat.show).map(s => btn(c, t('groove_category_' + s[1]), 'ngcg-sub', ` data-sub="${s[0]}"`)).join('')}${btn(c, t('custom_groove_button_label'), 'ngcg-custom', ` data-sub="${cat.id}"`)}</div></div>`;
  }
  function custom(c) {
    const u = U(c), cat = catOf(u.custom), list = SUBS[cat.id], sub = list.find(s => s[0] === u.custom);
    const hint = sub?.[2] ? t('groove_category_' + sub[2]) : t(`groove_category_${cat.key}_question`);
    const sugg = sub?.[3] ? T().t('groove_category_' + sub[3]) : sub ? [] : list.slice(cat.show).map(s => t('groove_category_' + s[1]));
    return `<div class="ngcg ngcg-frame" style="background:${cat.bg}">${back(c)}<div class="ngcg-custom"><div class="ngcg-titlebox"><input class="ngcg-title" value="${esc(c, u.text || '')}" placeholder="${esc(c, hint)}" autocomplete="off"><i class="ngcg-divider"></i>${fab(c, cat, !(u.text || '').trim())}</div>
      <div class="ngcg-sugg">${sugg.map((s, i) => btn(c, s, 'ngcg-suggest', ` data-i="${i}"`)).join('')}</div></div></div>`;
  }
  function schedule(c) {
    const u = U(c), cat = catOf(u.type), g = u.draft, monthly = g.interval === 3;
    let page;
    if (u.page === 0) page = `<h1>${esc(c, t('groove_frequency_title'))}</h1>${(MONTHLY.includes(u.type)
      ? [[3, 1, 'groove_frequency_one_time_per_month'], [3, 2, 'groove_frequency_two_times_per_month'], [2, 1, 'groove_frequency_one_time_per_week']]
      : [[2, 1, 'groove_frequency_one_time_per_week'], [2, 3, 'groove_frequency_three_times_per_week'], [2, 5, 'groove_frequency_five_times_per_week'], [2, 7, 'every_day']])
      .map(([iv, n, k]) => btn(c, t(k), 'ngcg-freq', ` data-iv="${iv}" data-n="${n}"`)).join('')}${btn(c, t('groove_frequency_more_options'), 'ngcg-more-freq')}`;
    else if (u.page === 1) page = `<h1>${esc(c, t('groove_duration_title'))}</h1>${(monthly ? [30, 60, 120, 240, 600] : [15, 30, 60, 120]).map(m => btn(c, t(DUR[m]), 'ngcg-dur', ` data-m="${m}"`)).join('')}`;
    else if (u.page === 2) page = `<h1>${esc(c, t('groove_preferred_times_title'))}</h1>${['morning', 'afternoon', 'evening', 'any_time'].map(k => btn(c, t('groove_preferred_times_' + k), 'ngcg-time', ` data-k="${k === 'any_time' ? 'any' : k}"`)).join('')}`;
    else page = summary(c, cat, g);
    return `<div class="ngcg ngcg-frame" style="background:${cat.bg}"><img class="ngcg-art" src="${A(cat.img)}" alt="">${back(c)}<div class="ngcg-page" data-page="${u.page}">${page}</div></div>`;
  }
  function summary(c, cat, g) {
    const u = U(c);
    return `<div class="ngcg-summary${u.creating ? ' creating' : ''}"><div class="ngcg-titlebox"><h2 class="ngcg-sumtitle">${esc(c, g.name)}</h2><i class="ngcg-divider"></i>${fab(c, cat, false)}</div>
      <div class="ngcg-contract"><p>${esc(c, t('groove_let_calendar_suggest'))}</p><p>${esc(c, freqText(g))}</p><p>${esc(c, durText(g))}</p>
        <button type="button" class="ngcg-moreopt" data-action="ngcg-edit"><span>${esc(c, NG.account?.email || '')}</span><small>${esc(c, t('groove_edit_details'))}</small></button></div>
      <p class="ngcg-waiting">${esc(c, T().t('groove_checking_schedule_array')[u.wait || 0])}</p></div>`;
  }
  // GrooveFrequencyMoreOptionsFragment: the monthly then the weekly frequencies.
  function moreFrequencies(c) {
    const u = U(c), cat = catOf(u.type);
    const list = [[3, 1, 'groove_frequency_one_time_per_month'], [3, 2, 'groove_frequency_two_times_per_month'], [2, 1, 'groove_frequency_one_time_per_week'], [2, 2, 'groove_frequency_two_times_per_week'], [2, 3, 'groove_frequency_three_times_per_week'], [2, 4, 'groove_frequency_four_times_per_week'], [2, 5, 'groove_frequency_five_times_per_week'], [2, 6, 'groove_frequency_six_times_per_week'], [2, 7, 'every_day']];
    return `<div class="ngcg ngcg-frame" style="background:${cat.bg}">${back(c)}<div class="ngcg-page ngcg-scrollpage"><h1>${esc(c, t('groove_frequency_title'))}</h1>${list.map(([iv, n, k]) => btn(c, t(k), 'ngcg-freq', ` data-iv="${iv}" data-n="${n}"`)).join('')}</div></div>`;
  }
  // More options: the goal's editor (edit_segment_groove_contract, edit_segment_groove_notifications).
  function edit(c) {
    const u = U(c), g = u.draft, cat = catOf(u.type), sel = (k, opts, v) => `<select class="ngcg-sel" data-k="${k}">${opts.map(([val, lab]) => `<option value="${val}"${String(val) === String(v) ? ' selected' : ''}>${esc(c, lab)}</option>`).join('')}</select>`;
    const freqs = [['3:1', 'groove_frequency_one_time_per_month'], ['3:2', 'groove_frequency_two_times_per_month'], ['2:1', 'groove_frequency_one_time_per_week'], ['2:2', 'groove_frequency_two_times_per_week'], ['2:3', 'groove_frequency_three_times_per_week'], ['2:4', 'groove_frequency_four_times_per_week'], ['2:5', 'groove_frequency_five_times_per_week'], ['2:6', 'groove_frequency_six_times_per_week'], ['2:7', 'every_day']];
    return `<div class="ngcg ngcg-edit"><div class="ngcg-ehead" style="background:${cat.fab}"><div class="ngcg-ebar"><button type="button" class="ngcg-ebtn" data-action="ngcg-edit-cancel"><img src="assets/ca-ic_cancel_white.png" alt=""></button><i></i><button type="button" class="ngcg-esave" data-action="ngcg-edit-save">${esc(c, NG.text('calendar').t('edit_event_save'))}</button></div><input class="ngcg-ename" value="${esc(c, g.name)}"></div>
      <div class="ngcg-erow"><img src="${A('quantum_ic_flag_grey600_24.png')}" alt=""><div><b>${esc(c, t('groove_your_goal'))}</b>${sel('freq', freqs.map(([v, k]) => [v, t(k)]), `${g.interval}:${g.count}`)}${sel('minutes', [15, 30, 60, 120, 240, 600].map(m => [m, t(DUR[m])]), g.minutes)}${sel('time', [['morning', t('groove_preferred_times_morning')], ['afternoon', t('groove_preferred_times_afternoon')], ['evening', t('groove_preferred_times_evening')], ['any', t('groove_preferred_times_any_time')]], g.time)}</div></div>
      <div class="ngcg-erow"><img src="assets/ca-ic_notification.png" alt=""><div><button type="button" class="ngcg-switchrow" data-action="ngcg-smart"><span><b>${esc(c, t('groove_smart_notifications_label'))}</b><small>${esc(c, t('smart_notifications_description'))}</small></span>${NG.settingsSwitch ? NG.settingsSwitch(g.smart !== false) : ''}</button></div></div>
      <div class="ngcg-erow"><img src="assets/ca-ic_calendar.png" alt=""><div><span>${esc(c, NG.account?.email || '')}</span></div></div></div>`;
  }

  /* ---- scheduling (the goal service's part, done on the phone) ------------------------------------------------- */
  // The part of the day a session goes in (and its first start), then the next free start that fits.
  const WINDOW = {morning: [7 * 60, 11 * 60], afternoon: [12 * 60, 17 * 60], evening: [17 * 60 + 30, 21 * 60 + 30], any: [9 * 60, 21 * 60]};
  function freeStart(c, day, g) {
    const [from, to] = WINDOW[g.time], busy = NG.calendarEvents(c).filter(e => e.date === iso(day) && !e.allDay).map(e => { const [a, b] = [e.start, e.end || e.start].map(x => x.split(':').map(Number)); return [a[0] * 60 + a[1], b[0] * 60 + b[1]]; });
    const now = new Date(), today = iso(day) === iso(now), mins = Math.min(g.minutes, 600);
    for (let s = from; s + Math.min(mins, 240) <= to + 60; s += 30) {
      if (today && s <= now.getHours() * 60 + now.getMinutes()) continue;
      if (!busy.some(([a, b]) => s < b && s + mins > a)) return s;
    }
    return -1;
  }
  function scheduleSessions(c, g) {
    const out = [], now = new Date(), start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const days = g.interval === 3 ? 56 : 28, per = g.interval === 3 ? 28 : 7, spread = Array.from({length: g.count}, (_, i) => Math.floor(i * per / g.count + (per / g.count) / 2));
    for (let base = 0; base < days; base += per) for (const off of spread) {
      const day = new Date(start); day.setDate(day.getDate() + base + off);
      for (let tries = 0; tries < 3; tries++) {
        const s = freeStart(c, day, g);
        if (s >= 0) { out.push({id: Date.now() + out.length, title: g.name, date: iso(day), start: hm(s), end: hm(Math.min(s + g.minutes, 23 * 60 + 59)), allDay: false, where: '', note: '', goal: g.id}); break; }
        day.setDate(day.getDate() + 1);
      }
    }
    return out;
  }
  function create(c) {
    const u = U(c), g = {...u.draft, id: Date.now(), created: Date.now(), done: []};
    u.creating = true; u.wait = 0; c.render();
    const cycle = () => { if (!U(c).creating || c.ui.view !== 'calendar-goal') return; u.wait = (u.wait + 1) % 4; const p = c.el.viewport.querySelector('.ngcg-waiting'); if (p) p.textContent = T().t('groove_checking_schedule_array')[u.wait]; u.timer = NG.appTasks.later(c, 'calendar', cycle, 2500); };
    u.timer = NG.appTasks.later(c, 'calendar', cycle, 2500);
    // GrooveSyncTracker: the activity finishes once the first sessions have synced.
    NG.appTasks.later(c, 'calendar', () => {
      if (!U(c).creating || c.ui.view !== 'calendar-goal') return;
      clearTimeout(u.timer);
      goals(c).push(g);
      const sessions = scheduleSessions(c, g);
      NG.calendarEvents(c).push(...sessions); c.save();
      c.ui.goal = null;
      const first = sessions.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))[0];
      (c.ui.calendar ||= {screen: ''}).goalSheet = first ? first.id : null;
      c.back();
    }, 4200);
  }

  /* ---- the session (screen_groove) ----------------------------------------------------------------------------- */
  const weekKey = (c, d) => { const s = new Date(d); const first = (new Intl.Locale(c.locale()).weekInfo?.firstDay ?? 7) % 7; s.setDate(s.getDate() - ((s.getDay() - first + 7) % 7)); return iso(s); };
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  function sessionInfo(c, e) {
    const g = goals(c).find(x => x.id === e.goal); if (!g) return '';
    const wk = weekKey(c, parse(e.date)), same = NG.calendarEvents(c).filter(x => x.goal === g.id && weekKey(c, parse(x.date)) === wk).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
    const n = same.findIndex(x => x.id === e.id) + 1, done = same.filter(x => g.done.includes(x.id)).length;
    return `<div class="ngcl-row ngcg-info"><img class="ngcl-ic" src="${A('quantum_ic_flag_grey600_24.png')}" alt="${esc(c, t('describe_groove_contract_icon'))}"><span><b>${esc(c, T().fmt('session_number', null, n))}</b><small>${esc(c, T().fmt('done_this_week', null, done, same.length))}</small><b>${esc(c, freqText(g))}</b><small>${esc(c, durText(g))}</small></span></div>`;
  }
  function commandBar(c, e) {
    const g = goals(c).find(x => x.id === e.goal); if (!g) return '';
    const done = g.done.includes(e.id);
    return `<div class="ngcg-cmd">${done ? `<button type="button" data-action="ngcg-undone" data-id="${e.id}">${esc(c, t('action_mark_as_not_done'))}</button>` : `<button type="button" data-action="ngcg-later" data-id="${e.id}">${esc(c, t('action_later'))}</button><button type="button" data-action="ngcg-did" data-id="${e.id}">${esc(c, t('action_did_it'))}</button>`}</div>`;
  }
  function sessionAction(c, name, el) {
    const e = NG.calendarEvents(c).find(x => x.id === +el.dataset.id), g = e && goals(c).find(x => x.id === e.goal); if (!g) return false;
    if (name === 'ngcg-did') {
      g.done.push(e.id); c.save();
      const wk = weekKey(c, parse(e.date)), same = NG.calendarEvents(c).filter(x => x.goal === g.id && weekKey(c, parse(x.date)) === wk), done = same.filter(x => g.done.includes(x.id)).length;
      c.render(); NG.snackbar?.(c, done >= same.length ? t('goal_marked_as_done_week_complete') : T().fmt('goal_marked_as_done_week_incomplete', null, done, same.length));
      return true;
    }
    if (name === 'ngcg-undone') { g.done = g.done.filter(x => x !== e.id); c.save(); c.render(); return true; }
    if (name === 'ngcg-later') {
      NG.snackbar?.(c, t('goal_session_deferred'));
      NG.appTasks.later(c, 'calendar', () => {
        const day = parse(e.date); let s = -1;
        for (let i = 0; i < 7 && s < 0; i++) { day.setDate(day.getDate() + 1); s = freeStart(c, day, g); }
        if (s < 0) return;
        e.date = iso(day); e.start = hm(s); e.end = hm(Math.min(s + g.minutes, 23 * 60 + 59)); c.save();
        if (c.ui.view === 'calendar') { c.render(); NG.snackbar?.(c, T().fmt('goal_deferred', null, fmt(c, new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(s / 60), s % 60), {weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}))); }
      }, 1500);
      return true;
    }
    return false;
  }
  // GroovePostCreationBottomSheet over Calendar after a goal is made.
  function sheet(c, e) {
    const when = fmt(c, new Date(...e.date.split('-').map((x, i) => i === 1 ? x - 1 : +x), ...e.start.split(':').map(Number)), {weekday: 'long', hour: 'numeric', minute: '2-digit'});
    return `<div class="ngcg-sheetscrim" data-action="ngcg-sheet-ok"></div><div class="ngcg-sheet"><div class="ngcg-tile"><img src="${A('quantum_ic_flag_grey600_24.png')}" alt=""><span><b>${esc(c, T().fmt('async_scheduling_post_create_title', null, when))}</b><small>${esc(c, t('async_scheduling_post_create_body'))}</small></span></div>
      <div class="ngcg-sheetbtns"><button type="button" data-action="ngcg-sheet-adjust" data-id="${e.id}">${esc(c, t('async_scheduling_post_create_accept'))}</button><button type="button" data-action="ngcg-sheet-ok">${esc(c, t('async_scheduling_post_create_dismiss'))}</button></div></div>`;
  }
  NG.calendarGoals = {sessionInfo, commandBar, sessionAction, sheet, isGoal: e => !!e.goal};

  /* ---- the activity ------------------------------------------------------------------------------------------- */
  function render(c) {
    const u = U(c);
    if (u.step === 'sub') return subcategories(c);
    if (u.step === 'custom') return custom(c);
    if (u.step === 'schedule') return schedule(c);
    if (u.step === 'more-freq') return moreFrequencies(c);
    if (u.step === 'edit') return edit(c);
    return store(c);
  }
  function startSchedule(c, type, name) {
    const u = U(c);
    u.type = type; u.page = 0; u.step = 'schedule';
    u.draft = {type, name, cat: type & 0xff00, interval: 2, count: 1, minutes: 60, time: 'any', smart: true};
    if (MONTHLY.includes(type)) { u.draft.interval = 3; u.draft.minutes = 60; }
    c.render();
  }
  function goBack(c) {
    const u = U(c);
    if (u.creating) return true;
    if (u.step === 'edit' || u.step === 'more-freq') { u.step = 'schedule'; c.render(); return true; }
    if (u.step === 'schedule' && u.page > 0) { u.page--; c.render(); return true; }
    if (u.step === 'schedule') { u.step = u.from || 'sub'; c.render(); return true; }
    if (u.step === 'custom') { u.step = u.customFrom || 'sub'; c.render(); return true; }
    if (u.step === 'sub') { u.step = 'category'; u.entered = false; c.render(); return true; }
    c.ui.goal = null; return false;
  }
  NG.register('calendar-goal', {
    app: false, title: 'Calendar',
    statusColor: c => { const u = U(c); return u.step === 'category' ? '#fff' : u.step === 'edit' ? '#000' : catOf(u.cat || u.type || u.custom)?.bg || '#fff'; },
    lightStatus: c => U(c).step !== 'edit',
    page: c => { const u = U(c); return NG.page('goal', u.step, u.step === 'schedule' ? String(u.page) : ''); },
    render,
    mount(c, root) {
      const u = U(c);
      const sc = root.querySelector('.ngcg-store .ngcg-scroll');
      if (sc) { sc.scrollTop = u.scroll || 0; sc.addEventListener('scroll', () => { u.scroll = sc.scrollTop; const r = sc.scrollTop > 64 * (c.el.screen.clientWidth / 411.43); if (r !== !!u.scrolled) { u.scrolled = r; root.querySelector('.ngcg-bar')?.classList.toggle('raised', r); } }, {passive: true}); }
      if (u.step === 'sub' && !u.entered) setTimeout(() => { u.entered = true; }, 400);
      const title = root.querySelector('.ngcg-title');
      if (title) { title.addEventListener('input', () => { u.text = title.value; root.querySelector('.ngcg-fab')?.classList.toggle('hidden', !title.value.trim()); }); title.addEventListener('keydown', e => { if (e.key === 'Enter' && title.value.trim()) { u.customFrom = u.customFrom || 'sub'; u.from = 'custom'; startSchedule(c, u.custom, title.value.trim()); } }); setTimeout(() => title.focus(), 50); }
      for (const s of root.querySelectorAll('.ngcg-sel')) s.addEventListener('change', () => { const g = u.draft; if (s.dataset.k === 'freq') { const [iv, n] = s.value.split(':').map(Number); g.interval = iv; g.count = n; } else if (s.dataset.k === 'minutes') g.minutes = +s.value; else g.time = s.value; });
      const name = root.querySelector('.ngcg-ename'); if (name) name.addEventListener('input', () => { u.draft.name = name.value; });
    },
    unmount(c) { const u = c.ui.goal; if (u?.creating) { clearTimeout(u.timer); u.creating = false; } },
    back: c => goBack(c),
    action(name, el, event, c) {
      const u = U(c);
      switch (name) {
        case 'ngcg-back': if (!goBack(c)) c.back(); return true;
        case 'ngcg-cat': u.cat = +el.dataset.cat; u.step = 'sub'; u.entered = false; c.render(); return true;
        case 'ngcg-sub': { const id = +el.dataset.sub, s = SUBS[id & 0xff00].find(x => x[0] === id); if (s[2]) { u.custom = id; u.text = ''; u.customFrom = 'sub'; u.step = 'custom'; c.render(); return true; } u.from = 'sub'; startSchedule(c, id, subName(id)); return true; }
        case 'ngcg-custom': u.custom = +el.dataset.sub; u.text = ''; u.customFrom = 'sub'; u.step = 'custom'; c.render(); return true;
        case 'ngcg-suggest': { const cat = catOf(u.custom), sub = SUBS[cat.id].find(s => s[0] === u.custom); u.from = 'custom'; if (!sub) { const s = SUBS[cat.id].slice(cat.show)[+el.dataset.i]; startSchedule(c, s[0], t('groove_category_' + s[1])); } else startSchedule(c, u.custom, T().t('groove_category_' + sub[3])[+el.dataset.i]); return true; }
        case 'ngcg-create':
          if (u.step === 'custom') { const v = (u.text || '').trim(); if (v) { u.from = 'custom'; startSchedule(c, u.custom, v); } return true; }
          if (u.step === 'schedule' && !u.creating) create(c);
          return true;
        case 'ngcg-freq': u.draft.interval = +el.dataset.iv; u.draft.count = +el.dataset.n; if (u.draft.interval === 3 && u.draft.minutes < 30) u.draft.minutes = 30; u.step = 'schedule'; u.page = 1; c.render(); return true;
        case 'ngcg-more-freq': u.step = 'more-freq'; c.render(); return true;
        case 'ngcg-dur': u.draft.minutes = +el.dataset.m; u.page = 2; c.render(); return true;
        case 'ngcg-time': u.draft.time = el.dataset.k; u.page = 3; c.render(); return true;
        case 'ngcg-edit': u.step = 'edit'; u.saved = JSON.stringify(u.draft); c.render(); return true;
        case 'ngcg-edit-cancel': u.draft = JSON.parse(u.saved); u.step = 'schedule'; c.render(); return true;
        case 'ngcg-edit-save': u.step = 'schedule'; c.render(); return true;
        case 'ngcg-smart': u.draft.smart = u.draft.smart === false; c.render(); return true;
      }
      return false;
    }
  });
})();
