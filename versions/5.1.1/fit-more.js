/* Fit 1.51 (FitnessPrebuilt, LMY48Y): the overflow's Add activity, Add your weight and Settings, kept on the phone.
   SettingsEditor (settings_editor.xml, #f9f9f9) hosts one card fragment under the modal bar (menu/modal.xml: the
   close glyph ic_close_dark and Save, ifRoom|withText); Back or close with changes asks discard_changes_* first.
   - ActivityFragment (activity_fragment.xml): Date / Start time, the Activity type spinner (spinnerMode dialog;
     ActivitySpinnerAdapter: the last 7 picked types, newest first, then every type sorted by its name; a 24 dp circle
     in PrimaryColor - walking, running and biking their own, every other type other_icon_color_primary - under the
     22 dp white IconDrawable) and Duration h/m. Validation as ActivityFragment.b: hours 0-23 and minutes 0-59 else
     invalid_value, 1 min to 23 h else invalid_duration, the end in the future gives invalid_duration_activity_in_the_future.
   - EditWeightFragment (settings_weight.xml): Date, Time, Weight in the chosen unit (stone: st + lb), the unit spinner
     (array/weight_unit_labels: Pounds, Kilograms, Stone); "Weight saved".
   - EditHeightFragment (settings_height.xml) and EditGoalFragment (settings_edit_goal.xml: array/goal_types, active
     time 1 min to 24 h, steps); "Goal saved" / "Goal deleted".
   - SettingsFragment (settings_fragment.xml): the 200 dp profile header, then the goal, profile (Gender:
     array/gender_labels, Height, Weight, Weight history), units (height, weight, distance, energy) and notification
     cards. The Google Fit data card (connected apps, BLE sensors, Location Reporting, history) is the cloud service's
     and stays out; so do live sensors. The date and time pickers are the browser's own. */
(() => {
  'use strict';
  const e = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const F = (c, key) => { const row = window.StockStrings?.fit?.[key]; return row ? AndroidStrings.pick(row, String(c.locale || 'en').slice(0, 2), key) : c.t(key); };
  const icu = (c, key, args) => LPExtraApps.icu(F(c, key), args, c.locale);
  // ActivityDescription's types (string/activity_type_*); walking, running and biking keep their own PrimaryColor.
  const TYPES = ['aerobics', 'australian_football', 'backcountry_skiing', 'badminton', 'baseball', 'basketball', 'beach_volleyball', 'biathlon', 'biking', 'boxing', 'calisthenics', 'circuit_training', 'cricket', 'cross_country_skiing', 'cross_skating', 'curling', 'dancing', 'diving', 'downhill_skiing', 'elliptical', 'ergometer', 'fencing', 'fitness_walking', 'football', 'frisbee', 'gardening', 'golf', 'gymnastics', 'handball', 'handcycling', 'hiking', 'hockey', 'horseback_riding', 'housework', 'ice_skating', 'indoor_skating', 'indoor_volleyball', 'inline_skating', 'jogging', 'jumping_rope', 'kayaking', 'kettlebell', 'kickboxing', 'kite_skiing', 'kitesurfing', 'martial_arts', 'meditating', 'mixed_martial_arts', 'mountain_biking', 'nordic_walking', 'open_water_swimming', 'other', 'p90x', 'paddle_boarding', 'paragliding', 'pilates', 'polo', 'pool_swimming', 'racquetball', 'road_biking', 'rock_climbing', 'roller_skiing', 'rowing', 'rowing_machine', 'rugby', 'running', 'sailing', 'sand_running', 'scuba_diving', 'skateboarding', 'skating', 'skiing', 'sledding', 'snowboarding', 'snowmobiling', 'snowshoeing', 'soccer', 'spinning', 'squash', 'stair_climbing', 'stair_climbing_machine', 'stationary_biking', 'strength_training', 'surfing', 'swimming', 'table_tennis', 'team_sport', 'tennis', 'treadmill', 'treadmill_running', 'treadmill_walking', 'utility_biking', 'volleyball', 'wakeboarding', 'walking', 'water_polo', 'weight_lifting', 'wheelchair', 'windsurfing', 'yoga', 'zumba'];
  const COLOR = {walking: '#ff9000', running: '#c1175a', biking: '#4bc5ab'}, OTHER = '#5f7c8a';
  const color = type => COLOR[type] || OTHER;
  const KG_PER_LB = 0.45359237, CM_PER_IN = 2.54;
  const DAY = 864e5;
  const imperial = c => /^en(-US)?$/i.test(String(c.locale || 'en'));
  // The demo day of lp-extra-apps.js (FIT_SESSIONS), then what the user added.
  function state(c) {
    const s = c.data.fit ||= {};
    s.sessions ||= []; s.weights ||= []; s.recent ||= [];
    if (!('goal' in s)) s.goal = {type: 'duration', value: 30};
    s.units ||= imperial(c) ? {height: 1, weight: 0, distance: 1, energy: 0} : {height: 0, weight: 1, distance: 0, energy: 0};
    s.profile ||= {gender: 4};
    s.notify ||= {on: true, sound: true};
    return s;
  }
  const midnight = (t = Date.now()) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  // Today's and yesterday's sessions, newest first as TimelineAdapter lists them.
  function days(c, demo) {
    const s = state(c), today = midnight(), list = [...demo.map(x => ({...x, start: today + (x.at[0] * 60 + x.at[1]) * 6e4, demo: true})), ...s.sessions].sort((a, b) => b.start - a.start);
    return {today: list.filter(x => x.start >= today), yesterday: list.filter(x => x.start >= today - DAY && x.start < today), goal: s.goal};
  }
  const two = n => String(n).padStart(2, '0');
  const dateValue = t => { const d = new Date(t); return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`; };
  const timeValue = t => { const d = new Date(t); return `${two(d.getHours())}:${two(d.getMinutes())}`; };
  const dateLabel = (c, t) => { const day = midnight(t); return day === midnight() ? F(c, 'activity_dialog_today') : day === midnight() - DAY ? F(c, 'activity_dialog_yesterday') : new Date(t).toLocaleDateString(c.locale, {month: 'short', day: 'numeric', year: 'numeric'}); };
  const timeLabel = (c, t) => new Date(t).toLocaleTimeString(c.locale, {hour: 'numeric', minute: '2-digit'});
  const typeName = (c, type) => F(c, 'activity_type_' + type);
  // ActivitySpinnerAdapter's order: recent types (newest first), then all types by the locale's collation.
  function typeOrder(c) {
    const recent = state(c).recent.filter(t => TYPES.includes(t)), coll = new Intl.Collator(c.locale);
    return [...recent, ...[...TYPES].sort((a, b) => coll.compare(typeName(c, a), typeName(c, b))).filter(t => !recent.includes(t))];
  }
  // Weight and height in the chosen unit: [first field, second field] (stone: st + lb; feet: ft + in).
  function weightFields(kg, unit) {
    if (kg == null) return ['', ''];
    const lb = kg / KG_PER_LB, r = v => String(Math.round(v * 10) / 10);
    if (unit === 1) return ['', r(kg)];
    if (unit === 0) return ['', r(lb)];
    const st = Math.floor(lb / 14); return [String(st), r(lb - st * 14)];
  }
  function weightKg(f1, f2, unit) {
    const a = f1 === '' ? 0 : Number(f1), b = Number(f2);
    if (!/^\d*$/.test(f1) || !/^\d+([.,]\d+)?$/.test(String(f2).trim()) || !isFinite(a) || !isFinite(b)) return null;
    const v = Number(String(f2).replace(',', '.')), kg = unit === 1 ? v : unit === 0 ? v * KG_PER_LB : (a * 14 + v) * KG_PER_LB;
    return kg > 0 ? kg : null;
  }
  function heightFields(cm, unit) {
    if (cm == null) return ['', ''];
    if (unit === 0) return ['', String(Math.round(cm))];
    const inches = Math.round(cm / CM_PER_IN), ft = Math.floor(inches / 12); return [String(ft), String(inches - ft * 12)];
  }
  function heightCm(f1, f2, unit) {
    if (!/^\d*$/.test(f1) || !/^\d+$/.test(String(f2).trim())) return null;
    const cm = unit === 0 ? Number(f2) : ((Number(f1) || 0) * 12 + Number(f2)) * CM_PER_IN;
    return cm > 0 ? cm : null;
  }
  const weightText = (c, kg, unit) => { const [a, b] = weightFields(kg, unit); return unit === 2 ? `${a} ${F(c, 'unit_stone_short')} ${b} ${F(c, 'unit_pounds_short')}` : `${b} ${F(c, unit === 1 ? 'unit_kilograms_short' : 'unit_pounds_short')}`; };
  const latestWeight = s => [...s.weights].sort((a, b) => b.t - a.t)[0]?.kg;

  // ---- Editors (SettingsEditor) ----
  function open(c, kind) {
    const s = state(c), now = Date.now();
    if (kind === 'activity') c.ui.fitEdit = {kind, start: now - 30 * 6e4, type: s.recent[0] || 'walking', h: '0', m: '30'};
    else if (kind === 'weight') { const [a, b] = weightFields(latestWeight(s), s.units.weight); c.ui.fitEdit = {kind, start: now, unit: s.units.weight, a, b}; }
    else if (kind === 'height') { const [a, b] = heightFields(s.profile.heightCm, s.units.height); c.ui.fitEdit = {kind, unit: s.units.height, a, b}; }
    else if (kind === 'goal') { const g = s.goal || {type: 'duration', value: 30}; c.ui.fitEdit = {kind, goalType: g.type, a: g.type === 'steps' ? String(g.value) : String(Math.floor(g.value / 60)), b: g.type === 'steps' ? '' : String(g.value % 60)}; }
    c.ui.fitEdit.orig = JSON.stringify(c.ui.fitEdit);
  }
  const dirty = ed => { const {orig, errors, dialog, ...rest} = ed; return JSON.stringify(rest) !== orig; };
  const field = (ed, name, attrs = '') => `<span class="fitm-field"><input class="fitm-input" data-fitm-field="${name}" value="${e(ed[name])}" ${attrs}>${ed.errors?.[name] ? `<em class="fitm-error" role="alert">${e(ed.errors[name])}</em>` : ''}</span>`;
  const unitLabel = (c, key, long) => `<span class="fitm-unit"${long ? ` aria-label="${e(F(c, long))}"` : ''}>${e(F(c, key))}</span>`;
  const select = (name, labels, value) => `<select class="fitm-select" data-fitm-select="${name}">${labels.map((label, i) => `<option value="${i}"${i === value ? ' selected' : ''}>${e(label)}</option>`).join('')}</select>`;
  const WEIGHT_UNITS = ['preferences_weight_unit_pound_label', 'preferences_weight_unit_kilogram_label', 'preferences_weight_unit_stone_label'];
  const HEIGHT_UNITS = ['preferences_height_unit_metric_label', 'preferences_height_unit_imperial_label'];
  const dateTime = (c, ed, dateKey, timeKey) => `<div class="fitm-row"><label class="fitm-col"><span class="fitm-label">${e(F(c, dateKey))}</span><span class="fitm-picker"><b>${e(dateLabel(c, ed.start))}</b><input type="date" data-fitm-date value="${dateValue(ed.start)}" max="${dateValue(Date.now())}" aria-label="${e(F(c, dateKey))}"></span></label><label class="fitm-col"><span class="fitm-label">${e(F(c, timeKey))}</span><span class="fitm-picker"><b>${e(timeLabel(c, ed.start))}</b><input type="time" data-fitm-time value="${timeValue(ed.start)}" aria-label="${e(F(c, timeKey))}"></span></label></div>${ed.errors?.start ? `<em class="fitm-error fitm-error-line" role="alert">${e(ed.errors.start)}</em>` : ''}`;
  const typeIcon = type => `<i class="fitm-type-icon" style="background:${color(type)}"><img src="assets/fit-ic_${type}.png" alt=""></i>`;
  function editorBody(c, ed) {
    if (ed.kind === 'activity') return `<h2 class="fitm-title">${e(F(c, 'add_activity_dialog_title'))}</h2>${dateTime(c, ed, 'activity_dialog_date_label', 'activity_dialog_start_time_label')}<span class="fitm-label fitm-gap">${e(F(c, 'session_dialog_activity_type_label'))}</span><button class="fitm-spinner fitm-type" data-action="fitm-types" aria-label="${e(F(c, 'session_dialog_activity_type_label'))}: ${e(typeName(c, ed.type))}">${typeIcon(ed.type)}<span>${e(typeName(c, ed.type))}</span></button><span class="fitm-label fitm-gap">${e(F(c, 'session_dialog_duration_label'))}</span><div class="fitm-row fitm-values">${field(ed, 'h', 'inputmode="numeric" maxlength="2"')}${unitLabel(c, 'unit_hours_short', 'unit_hours_long')}${field(ed, 'm', 'inputmode="numeric" maxlength="2"')}${unitLabel(c, 'unit_minutes_short', 'unit_minutes_long')}</div>${ed.errors?.duration ? `<em class="fitm-error fitm-error-line" role="alert">${e(ed.errors.duration)}</em>` : ''}`;
    if (ed.kind === 'weight') return `<h2 class="fitm-title">${e(F(c, 'settings_profile_user_add_weight'))}</h2>${dateTime(c, ed, 'settings_profile_user_weight_date', 'settings_profile_user_weight_time')}<span class="fitm-label fitm-gap">${e(F(c, 'settings_profile_user_weight'))}</span><div class="fitm-row fitm-values">${ed.unit === 2 ? field(ed, 'a', 'inputmode="numeric" maxlength="3"') + unitLabel(c, 'unit_stone_short') : ''}${field(ed, 'b', 'inputmode="decimal" maxlength="5"')}${unitLabel(c, ed.unit === 1 ? 'unit_kilograms_short' : 'unit_pounds_short')}</div>${select('unit', WEIGHT_UNITS.map(k => F(c, k)), ed.unit)}`;
    if (ed.kind === 'height') return `<h2 class="fitm-title">${e(F(c, 'settings_profile_user_height'))}</h2><div class="fitm-row fitm-values">${ed.unit === 1 ? field(ed, 'a', 'inputmode="numeric" maxlength="1"') + unitLabel(c, 'unit_feet_short') : ''}${field(ed, 'b', 'inputmode="numeric" maxlength="3"')}${unitLabel(c, ed.unit === 1 ? 'unit_inches_short' : 'unit_centimetres_short')}</div>${select('unit', HEIGHT_UNITS.map(k => F(c, k)), ed.unit)}`;
    return `<h2 class="fitm-title">${e(F(c, 'settings_goal_card_title'))}</h2><span class="fitm-label">${e(F(c, 'settings_edit_goal_type'))}</span>${select('goalType', ['goal_type_duration', 'goal_type_steps'].map(k => F(c, k)), ed.goalType === 'steps' ? 1 : 0)}<div class="fitm-row fitm-values fitm-gap">${field(ed, 'a', 'inputmode="numeric"')}${ed.goalType === 'steps' ? unitLabel(c, 'unit_steps') : unitLabel(c, 'unit_hours_short', 'unit_hours_long') + field(ed, 'b', 'inputmode="numeric" maxlength="2"') + unitLabel(c, 'unit_minutes_short', 'unit_minutes_long')}</div>`;
  }
  function editor(c) {
    const ed = c.ui.fitEdit;
    const types = ed.dialog === 'types' ? `<button class="fitm-scrim" data-action="fitm-dialog-close" aria-label="${e(F(c, 'fitness_dialog_cancel_button'))}"></button><div class="fitm-dialog fitm-types" role="dialog" aria-label="${e(F(c, 'session_dialog_activity_type_label'))}"><div class="fitm-type-list">${typeOrder(c).map(type => `<button class="fitm-type-row${type === ed.type ? ' on' : ''}" data-action="fitm-type" data-id="${type}">${typeIcon(type)}<span>${e(typeName(c, type))}</span></button>`).join('')}</div></div>` : '';
    const discard = ed.dialog === 'discard' ? `<button class="fitm-scrim" data-action="fitm-dialog-close" aria-label="${e(F(c, 'discard_changes_negative'))}"></button><div class="fitm-dialog fitm-alert" role="alertdialog" aria-label="${e(F(c, 'discard_changes_title'))}"><h3>${e(F(c, 'discard_changes_title'))}</h3><p>${e(F(c, 'discard_changes_message'))}</p><div class="fitm-buttons"><button data-action="fitm-dialog-close">${e(F(c, 'discard_changes_negative'))}</button><button data-action="fitm-discard">${e(F(c, 'discard_changes_positive'))}</button></div></div>` : '';
    return `<div class="app-view lpx-app fitm-app fitm-editor" data-fit-more data-no-translate><header class="fitm-modal-bar"><button class="fitm-close" data-action="fitm-close" aria-label="${e(F(c, 'fitness_dialog_cancel_button'))}"><img src="assets/fit-ic_close_dark.png" alt=""></button><button class="fitm-save" data-action="fitm-save">${e(F(c, 'setting_editor_save'))}</button></header><div class="fitm-scroll"><div class="fitm-card">${editorBody(c, ed)}</div></div>${types}${discard}</div>`;
  }
  // ActivityFragment.a(EditText, min, max): invalid_value outside the range or when not a number.
  const ranged = (c, v, min, max) => /^\d+$/.test(String(v).trim()) && Number(v) >= min && Number(v) <= max ? null : F(c, 'invalid_value');
  function save(c) {
    const ed = c.ui.fitEdit, s = state(c), errors = {};
    if (ed.kind === 'activity') {
      const he = ranged(c, ed.h || '0', 0, 23), me = ranged(c, ed.m || '0', 0, 59);
      if (he) errors.h = he; if (me) errors.m = me;
      const min = (Number(ed.h) || 0) * 60 + (Number(ed.m) || 0);
      if (!he && !me && (min < 1 || min > 23 * 60)) errors.duration = AndroidStrings.format(F(c, 'invalid_duration'), 1, 23);
      else if (!he && !me && ed.start + min * 6e4 > Date.now()) errors.start = F(c, 'invalid_duration_activity_in_the_future');
      if (Object.keys(errors).length) { ed.errors = errors; return; }
      s.sessions.push({id: 'fs' + Date.now().toString(36), type: ed.type, start: ed.start, min});
      s.recent = [ed.type, ...s.recent.filter(t => t !== ed.type)].slice(0, 7);
    } else if (ed.kind === 'weight') {
      const kg = weightKg(ed.unit === 2 ? ed.a : '', ed.b, ed.unit);
      if (kg == null) { ed.errors = {b: F(c, 'invalid_value')}; return; }
      if (ed.start > Date.now()) { ed.errors = {start: F(c, 'invalid_value')}; return; }
      s.weights.push({kg: Math.round(kg * 1000) / 1000, t: ed.start}); s.units.weight = ed.unit;
      c.toast(F(c, 'add_weight_operation_success'));
    } else if (ed.kind === 'height') {
      const cm = heightCm(ed.unit === 1 ? ed.a : '', ed.b, ed.unit);
      if (cm == null) { ed.errors = {b: F(c, 'invalid_value')}; return; }
      s.profile.heightCm = Math.round(cm * 10) / 10; s.units.height = ed.unit;
    } else {
      if (ed.goalType === 'steps') { const err = ranged(c, ed.a, 1, 999999); if (err) { ed.errors = {a: err}; return; } s.goal = {type: 'steps', value: Number(ed.a)}; }
      else {
        const he = ranged(c, ed.a || '0', 0, 24), me = ranged(c, ed.b || '0', 0, 59);
        const min = (Number(ed.a) || 0) * 60 + (Number(ed.b) || 0);
        if (he || me || min < 1 || min > 24 * 60) { ed.errors = he || me ? {...(he && {a: he}), ...(me && {b: me})} : {b: AndroidStrings.format(F(c, 'invalid_duration'), 1, 24)}; return; }
        s.goal = {type: 'duration', value: min};
      }
      c.toast(F(c, 'settings_goal_card_saved'));
    }
    c.ui.fitEdit = null; c.save();
  }

  // ---- SettingsFragment ----
  const card = (title, body, extra = '') => `<section class="fitm-card fitm-settings-card"${extra}><h2 class="fitm-title">${e(title)}</h2>${body}</section>`;
  function goalText(c, g) {
    if (g.type === 'steps') return [[String(g.value), F(c, 'unit_steps')]];
    const h = Math.floor(g.value / 60), m = g.value % 60;
    return h ? [[String(h), F(c, 'unit_hours_short')], ...(m ? [[String(m), F(c, 'unit_minutes_short')]] : [])] : [[String(m), F(c, 'unit_minutes_short')]];
  }
  function settings(c) {
    const s = state(c), g = s.goal, kg = latestWeight(s), u = s.units;
    const goal = g ? `<div class="fitm-goal"><span class="fitm-label">${e(F(c, g.type === 'steps' ? 'goal_type_steps' : 'goal_type_duration'))}</span><div class="fitm-row"><button class="fitm-value" data-action="fitm-edit" data-id="goal">${goalText(c, g).map(([v, unit]) => `<b>${e(v)}</b><small>${e(unit)}</small>`).join('')}</button><button class="fitm-delete" data-action="fitm-goal-delete" aria-label="${e(F(c, 'settings_goal_card_delete_button'))}"><img src="assets/fit-ic_remove_graph.png" alt=""></button></div></div>` : `<button class="fitm-set-goal" data-action="fitm-edit" data-id="goal"><img src="assets/fit-ic_add_goal.png" alt="">${e(F(c, 'settings_set_a_goal_prompt'))}</button>`;
    const [h1, h2] = heightFields(s.profile.heightCm, u.height), [w1, w2] = weightFields(kg, u.weight);
    const height = `<button class="fitm-value" data-action="fitm-edit" data-id="height">${u.height === 1 ? `<b>${e(h1 || '–')}</b><small>${e(F(c, 'unit_feet_short'))}</small><b>${e(h2 || '–')}</b><small>${e(F(c, 'unit_inches_short'))}</small>` : `<b>${e(h2 || '–')}</b><small>${e(F(c, 'unit_centimetres_short'))}</small>`}</button>`;
    const weight = `<button class="fitm-value" data-action="fitm-edit" data-id="weight">${u.weight === 2 ? `<b>${e(w1 || '–')}</b><small>${e(F(c, 'unit_stone_short'))}</small>` : ''}<b>${e(w2 || '–')}</b><small>${e(F(c, u.weight === 1 ? 'unit_kilograms_short' : 'unit_pounds_short'))}</small></button>`;
    const genders = ['preferences_user_gender_female_label', 'preferences_user_gender_male_label', 'preferences_user_gender_other_label', 'preferences_user_gender_decline_label'].map(k => F(c, k)).concat('');
    const profile = `<span class="fitm-label">${e(F(c, 'settings_profile_user_gender'))}</span>${select('gender', genders, s.profile.gender)}<span class="fitm-label fitm-gap">${e(F(c, 'settings_profile_user_height'))}</span>${height}<span class="fitm-label fitm-gap">${e(F(c, 'settings_profile_user_weight'))}</span><div class="fitm-row">${weight}<button class="fitm-history" data-action="lpx-unavailable">${e(F(c, 'settings_profile_user_weight_history'))}</button></div>`;
    const units = [['height', 'preferences_height_unit_title', HEIGHT_UNITS], ['weight', 'preferences_weight_unit_title', WEIGHT_UNITS], ['distance', 'preferences_distance_unit_title', ['preferences_distance_unit_metric_label', 'preferences_distance_unit_imperial_label']], ['energy', 'preferences_energy_unit_title', ['preferences_energy_unit_calorie_label', 'preferences_energy_unit_kilojoule_label']]].map(([id, title, labels], i) => `<span class="fitm-label${i ? ' fitm-gap' : ''}">${e(F(c, title))}</span>${select('unit-' + id, labels.map(k => F(c, k)), u[id])}`).join('');
    const sw = (id, on, label, summary) => `<button class="fitm-switch-row" data-action="fitm-notify" data-id="${id}" role="switch" aria-checked="${on}"><span><b>${e(label)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span><i class="fitm-switch${on ? ' on' : ''}"></i></button>`;
    const notify = sw('on', s.notify.on, F(c, 'settings_fitness_api_notifications'), F(c, 'settings_fitness_api_notifications_description')) + sw('sound', s.notify.sound, F(c, 'settings_fitness_api_sound_notifications'));
    return `<div class="app-view lpx-app fitm-app fitm-settings" data-fit-more data-no-translate><div class="fitm-scroll"><div class="fitm-header"><button class="fitm-back" data-action="fitm-settings-back" aria-label="${e(F(c, 'preferences_navigate_back'))}"><img src="assets/fit-ic_arrow_back_dark.png" alt=""></button><i class="fitm-avatar"></i></div><h1 class="fitm-name">Nexus 6</h1>${card(F(c, 'settings_goal_card_title'), goal)}${card(F(c, 'settings_profile_card_title'), profile)}${card(F(c, 'settings_unit_card_title'), units)}${card(F(c, 'settings_notifications_card_title'), notify, ' data-switches')}</div></div>`;
  }

  function page(c) { if (c.ui.fitEdit) return editor(c); if (c.ui.fitSettings) return settings(c); return ''; }
  function close(c) { const ed = c.ui.fitEdit; if (ed && dirty(ed)) { ed.dialog = 'discard'; } else c.ui.fitEdit = null; c.render(); }
  function handle(action, id, c) {
    if (!action.startsWith('fitm-')) return false;
    c.ui.overlay = ''; c.renderOverlay?.();
    const ed = c.ui.fitEdit;
    if (action === 'fitm-add') open(c, 'activity');
    else if (action === 'fitm-weight') open(c, 'weight');
    else if (action === 'fitm-settings') c.ui.fitSettings = true;
    else if (action === 'fitm-settings-back') c.ui.fitSettings = false;
    else if (action === 'fitm-edit' && ['goal', 'height', 'weight'].includes(id)) open(c, id);
    else if (action === 'fitm-close') { close(c); return true; }
    else if (action === 'fitm-save' && ed) save(c);
    else if (action === 'fitm-types' && ed) ed.dialog = 'types';
    else if (action === 'fitm-type' && ed && TYPES.includes(id)) { ed.type = id; ed.dialog = ''; }
    else if (action === 'fitm-dialog-close' && ed) ed.dialog = '';
    else if (action === 'fitm-discard') c.ui.fitEdit = null;
    else if (action === 'fitm-goal-delete') { state(c).goal = null; c.save(); c.toast(F(c, 'settings_goal_card_deleted')); }
    else if (action === 'fitm-notify' && (id === 'on' || id === 'sound')) { const n = state(c).notify; n[id] = !n[id]; c.save(); }
    else return false;
    c.render(); return true;
  }
  function back(c) {
    if (c.ui.view !== 'fit') return false;
    const ed = c.ui.fitEdit;
    if (ed?.dialog) { ed.dialog = ''; c.render(); return true; }
    if (ed) { close(c); return true; }
    if (c.ui.fitSettings) { c.ui.fitSettings = false; c.render(); return true; }
    return false;
  }
  // Typing stays in the fields (no re-render); spinners, dates and times redraw the page.
  function attach(root, c) {
    const onInput = event => { const ed = c.ui.fitEdit, name = event.target.dataset.fitmField; if (ed && name) { ed[name] = event.target.value; if (ed.errors) delete ed.errors[name]; } };
    const onChange = event => {
      const t = event.target, ed = c.ui.fitEdit, s = state(c);
      if (t.matches('[data-fitm-date], [data-fitm-time]') && ed) {
        const d = new Date(ed.start);
        if (t.matches('[data-fitm-date]')) { const [y, mo, da] = t.value.split('-').map(Number); if (!y) return; d.setFullYear(y, mo - 1, da); }
        else { const [h, mi] = t.value.split(':').map(Number); if (isNaN(h)) return; d.setHours(h, mi, 0, 0); }
        ed.start = d.getTime(); if (ed.errors) delete ed.errors.start;
      } else if (t.matches('[data-fitm-select]')) {
        const key = t.dataset.fitmSelect, v = Number(t.value);
        if (ed && key === 'unit' && ed.kind === 'weight') { const kg = weightKg(ed.unit === 2 ? ed.a : '', ed.b, ed.unit); [ed.a, ed.b] = weightFields(kg, v); ed.unit = v; ed.errors = null; }
        else if (ed && key === 'unit' && ed.kind === 'height') { const cm = heightCm(ed.unit === 1 ? ed.a : '', ed.b, ed.unit); [ed.a, ed.b] = heightFields(cm, v); ed.unit = v; ed.errors = null; }
        else if (ed && key === 'goalType') { ed.goalType = v ? 'steps' : 'duration'; ed.a = v ? '10000' : '0'; ed.b = v ? '' : '30'; ed.errors = null; }
        else if (key === 'gender') { s.profile.gender = v; c.save(); }
        else if (key.startsWith('unit-')) { s.units[key.slice(5)] = v; c.save(); }
        else return;
      } else return;
      c.render();
    };
    const pick = event => { const input = event.target.closest('.fitm-picker')?.querySelector('input'); if (input && event.target !== input) { event.preventDefault(); try { input.showPicker(); } catch { input.focus(); } } };
    root.addEventListener('input', onInput); root.addEventListener('change', onChange); root.addEventListener('click', pick);
    return {destroy() { root.removeEventListener('input', onInput); root.removeEventListener('change', onChange); root.removeEventListener('click', pick); }};
  }
  const menu = c => [['fitm-add', 'Add activity'], ['fitm-weight', 'Add your weight'], ['fitm-settings', 'Settings'], ['lpx-unavailable', 'Help & feedback']].map(([action, key]) => ({action, title: F(c, key)}));
  window.FitMore = {TYPES, COLOR, OTHER, color, state, days, page, handle, back, attach, menu, weightKg, weightFields, heightCm, heightFields, weightText, typeOrder};
})();
