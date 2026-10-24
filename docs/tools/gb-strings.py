"""Generates versions/2.3.6/gb-strings-<app>.js from the string resources of the Nexus S GRK39F image's APKs (en, hu, de,
fr, es), as aapt compiled them; the image is unpacked in _aosp/crespo (docs/tools/image_res.py reads it).
Each output defines window.GBStrings[<app>] = {strings: {key: {en, hu, de, fr, es}}, arrays: {key: {en: [...], ...}}}; a
language the image does not translate is left out, so the reader falls back to English.
Usage: python docs/tools/gb-strings.py contacts   (see APPS below for each table's APKs and keys)."""
import sys, json
from image_res import ImageRes, ROOT

RES = ImageRes('crespo')
APPS = {
    'contacts': {
        'apks': ['Contacts', 'framework'],
        'keys': '''attachToContact take_photo pick_photo use_photo_as_primary removePicture changePicture contactsList search_settings_description account_phone nameLabelsGroup name_given name_family name_prefix name_middle name_suffix phoneLabelsGroup emailLabelsGroup
organizationLabelsGroup ghostData_company ghostData_title label_notes edit_secondary_collapse menu_done menu_doNotSave editContact_title_edit
editContact_title_insert contactSavedToast deleteConfirmation deleteConfirmation_title selectLabel postalLabelsGroup phoneTypeMobile phoneTypeHome
phoneTypeWork phoneTypeOther emailTypeHome emailTypeWork emailTypeOther emailTypeMobile
dialerIconLabel recentCallsIconLabel contactsIconLabel contactsFavoritesLabel favoritesFrquentSeparator noContacts noContactsHelpText
noFavoritesHelpText recentCalls_empty recentCalls_callNumber recentCalls_editNumberBeforeCall recentCalls_addToContact recentCalls_removeFromRecentList
recentCalls_deleteAll clearCallLogConfirmation_title clearCallLogConfirmation type_incoming type_outgoing type_missed callBack callAgain returnCall
callDetailTitle call_mobile call_home call_work call_other sms_mobile sms_home sms_work sms_other menu_search menu_newContact menu_displayGroup menu_accounts
menu_import_export menu_addStar menu_removeStar menu_editContact menu_deleteContact menu_share menu_call menu_sendSMS menu_sendEmail add_2sec_pause
add_wait searchHint viewContactTitle starredList frequentList dialer_addAnotherCall dialer_useDtmfDialpad dialer_returnToInCallScreen
callDetailsDurationFormat menu_viewContact menu_sendTextMessage email_home email_work email_other email email_custom'''.split(),
    },
    'phone': {
        'apks': ['Phone'],
        'keys': '''card_title_dialing card_title_in_progress card_title_call_ended card_title_on_hold card_title_hanging_up onscreenAddCallText
onscreenEndCallText onscreenShowDialpadText onscreenHideDialpadText onscreenMuteText onscreenSpeakerText onscreenBluetoothText onscreenHoldText
onscreenUnholdText unknown onHold notification_on_hold notification_ongoing_call_format contactPhoto'''.split(),
    },
    'mms': {
        'apks': ['Mms'],
        'keys': '''search_label search_hint search_setting_description app_label new_message create_new_message has_draft messagelist_sender_self sent_on type_to_compose_text_enter_to_send to_hint
send sending_message menu_compose_new menu_delete_all menu_preferences menu_call menu_view_contact add_subject add_attachment menu_insert_smiley
delete_thread discard all_threads menu_add_to_contacts message_options menu_forward copy_message_text view_message_details delete_message menu_lock
delete confirm_dialog_title confirm_delete_conversation confirm_delete_all_conversations confirm_delete_message no subject_hint menu_view menu_delete
message_details_title message_type_label text_message multimedia_message from_label to_address_label sent_label received_label search_hint
attach_image attach_take_photo attach_video attach_record_video attach_sound attach_record_sound attach_slideshow select_link_title
search_empty view replace_image remove inline_subject menu_unlock'''.split(),
        'arrays': ['default_smiley_names', 'default_smiley_texts'],
    },
    'calculator': {
        'apks': ['Calculator'],
        'keys': 'app_name error del clear basic advanced clear_history'.split(),
    },
    'deskclock': {
        'apks': ['DeskClockGoogle', 'framework'],
        'keys': '''app_label alarm_list_title add_alarm menu_desk_clock menu_edit_alarm delete_alarm enable_alarm disable_alarm delete_alarm_confirm
label default_label set_alarm alarm_vibrate alarm_repeat alert time alarm_alert_dismiss_text alarm_alert_snooze_text alarm_alert_snooze_set day days
hour hours minute minutes every_day never day_concat settings done revert delete alarm_button_description gallery_button_description
music_button_description nightmode_button_description home_button_description desk_clock_button_description menu_item_dock_settings
silent_alarm_summary date_time_set alarm_in_silent_mode_title alarm_in_silent_mode_summary alarm_volume_title
alarm_volume_summary snooze_duration_title volume_button_setting_title volume_button_setting_summary volume_button_dialog_title'''.split(),
        'arrays': ['alarm_set', 'snooze_duration_entries', 'volume_button_setting_entries'],
    },
    # Music: docs/tools/gb-music-strings.py reads them (and the plurals) from the image's MusicGoogle.apk.
    'browser': {
        'apks': ['Browser', 'framework'],
        'keys': '''pref_content_title pref_text_size pref_text_size_dialogtitle pref_default_zoom pref_default_zoom_dialogtitle pref_content_load_page
pref_content_load_page_summary pref_default_text_encoding pref_default_text_encoding_dialogtitle pref_content_block_popups pref_content_load_images
pref_content_load_images_summary pref_content_autofit pref_content_autofit_summary pref_content_landscape_only pref_content_landscape_only_summary
pref_content_javascript pref_content_plugins pref_content_open_in_background pref_content_open_in_background_summary pref_content_homepage
pref_privacy_title pref_privacy_clear_cache pref_privacy_clear_cache_summary pref_privacy_clear_cache_dlg pref_privacy_clear_history
pref_privacy_clear_history_summary pref_privacy_clear_history_dlg pref_security_accept_cookies pref_security_accept_cookies_summary
pref_privacy_clear_cookies pref_privacy_clear_cookies_summary pref_privacy_clear_cookies_dlg pref_security_save_form_data
pref_security_save_form_data_summary pref_privacy_clear_form_data pref_privacy_clear_form_data_summary pref_privacy_clear_form_data_dlg
pref_privacy_enable_geolocation pref_privacy_enable_geolocation_summary pref_privacy_clear_geolocation_access
pref_privacy_clear_geolocation_access_summary pref_privacy_clear_geolocation_access_dlg pref_security_title pref_security_remember_passwords
pref_security_remember_passwords_summary pref_privacy_clear_passwords pref_privacy_clear_passwords_summary pref_privacy_clear_passwords_dlg
pref_security_show_security_warning pref_security_show_security_warning_summary pref_extras_title pref_content_search_engine
pref_content_search_engine_summary pref_extras_website_settings pref_extras_website_settings_summary pref_extras_reset_default
pref_extras_reset_default_summary pref_extras_reset_default_dlg pref_extras_reset_default_dlg_title clear ok cancel
new_tab active_tabs tab_bookmarks tab_most_visited tab_history added_to_bookmarks removed_from_bookmarks title_bar_loading page_info
page_info_address stop reload back forward location name save_to_bookmarks edit_bookmark open_bookmark remove_bookmark bookmark_needs_title
delete_bookmark open_in_new_window goto_dot find_dot select_dot tab_picker_title tab_picker_remove_tab bookmarks history menu_view_download
copy_page_url share_page choosertitle_sharevia menu_preferences clear_history empty_history add_bookmark_short search_hint
bookmark_page switch_to_thumbnails switch_to_list set_as_homepage contextmenu_openlink contextmenu_openlink_newwindow contextmenu_sharelink
contextmenu_copylink remove_history_item create_shortcut_bookmark'''.split(),
        'arrays': ['pref_text_size_choices', 'pref_default_zoom_choices', 'pref_default_text_encoding_choices', 'pref_content_plugins_choices'],
    },
    # Google Mail 2.3.5.1's Settings (preferences_root.xml, preferences.xml, LabelsSynchronizationSettings,
    # LabelsNotificationSettings) for gb-prefs.js.
    'gmail': {
        'apks': ['Gmail'],
        'keys': '''activity_preferences global_preferences_title preferences_disable_snap_headers_title clear_history_title clear_history_summary
clear_display_images_whitelist_title clear_display_images_whitelist_summary activity_account_preferences add_account preferences_title
preferences_priority_inbox preferences_priority_inbox_summary preferences_signature_title preferences_signature_summary preferences_signature_dialog_title
preferences_confirm_actions_title preferences_confirm_actions_summary prefDialogTitle_confirmActions preferences_actionStrip_action_title
preferences_actionStrip_action_summary preferences_auto_advance_title preferences_auto_advance_summary preferences_message_text_size_title
preferences_allow_batch_title preferences_allow_batch_summary preferences_synchronization_title preferences_synchronization_summary
preferences_synchronization_settings preferences_notifications preferences_notifications_enable preferences_notifications_summary
preferences_label_notification_title preferences_label_notification_summary preferences_notification_settings preferences_synchronization labels
set_number_of_days sync_all sync_none not_synchronized preferences_ring_enable preferences_ring_summary preferences_ringtone preferences_vibrateWhen
prefDialogTitle_vibrateWhen prefDialogMessage_vibrateWhen preferences_unobtrusive_enable preferences_unobtrusive_summary silent_ringtone'''.split(),
        'arrays': ['prefEntries_snapHeader', 'prefEntries_confirmActions', 'prefEntries_autoAdvance', 'prefEntries_messageTextSize', 'prefEntries_vibrateWhen'],
        'plurals': ['sync_recent', 'number_of_days'],
    },
    'email': {
        'apks': ['EmailGoogle'],
        'keys': '''accounts_welcome account_setup_basics_title account_setup_basics_email_hint account_setup_basics_password_hint
account_setup_basics_default_label account_setup_basics_manual_setup_action next_action account_setup_check_settings_check_incoming_msg
account_setup_failed_dlg_title account_setup_failed_dlg_server_message account_setup_failed_dlg_edit_details_action exchange_name account_settings_title_fmt account_settings_description_label account_settings_name_label account_settings_signature_label
account_settings_signature_hint account_settings_mail_check_frequency_label account_settings_default_label account_settings_default_summary
account_settings_notifications account_settings_notify_label account_settings_notify_summary account_settings_ringtone
account_settings_vibrate_when_label account_settings_vibrate_when_summary account_settings_vibrate_when_dlg_title account_settings_servers
account_settings_incoming_label account_settings_outgoing_label account_settings_action okay_action cancel_action
app_name compose_title send_action reply_action reply_all_action delete_action forward_action discard_action save_draft_action
read_unread_action favorite_action set_star_action remove_star_action refresh_action add_account_action deselect_all_action compose_action
search_action open_action folders_action accounts_action mark_as_read_action mark_as_unread_action add_cc_bcc_action add_attachment_action
choose_attachment_dialog_title mailbox_name_display_inbox mailbox_name_display_outbox mailbox_name_display_drafts mailbox_name_display_trash
mailbox_name_display_sent account_folder_list_separator_accounts account_folder_list_summary_inbox account_folder_list_summary_starred
account_folder_list_summary_drafts account_folder_list_summary_outbox mailbox_list_title message_compose_to_hint message_compose_cc_hint
message_compose_bcc_hint message_compose_subject_hint message_compose_body_hint message_compose_reply_header_fmt message_compose_quoted_text_label
message_compose_error_no_recipients message_compose_error_invalid_email message_view_to_label message_view_cc_label message_discarded_toast
message_saved_toast notification_new_title okay_action cancel_action read_action unread_action status_network_error
account_settings_action account_setup_incoming_title account_setup_incoming_username_label account_setup_incoming_password_label
account_setup_incoming_imap_server_label account_setup_incoming_port_label account_setup_incoming_security_label
account_setup_incoming_security_none_label account_setup_incoming_security_ssl_label account_setup_incoming_security_ssl_trust_certificates_label
account_setup_incoming_security_tls_label account_setup_incoming_security_tls_trust_certificates_label account_setup_incoming_imap_path_prefix_label
account_setup_incoming_imap_path_prefix_hint account_setup_outgoing_title account_setup_outgoing_smtp_server_label account_setup_outgoing_port_label
account_setup_outgoing_security_label account_setup_outgoing_require_login_label account_setup_outgoing_username_label
account_setup_outgoing_password_label'''.split(),
        'plurals': ['message_deleted_toast'],
        'arrays': ['account_settings_check_frequency_entries', 'account_settings_vibrate_when_entries'],
    },
    'gallery': {
        'apks': ['Gallery3DGoogle'],
        'keys': '''app_name camera delete confirm_delete cancel share more select_all deselect_all slideshow menu details album_selected item_selected
albums_selected items_selected album location location_unknown title type taken_on added_on show_on_map rotate_left rotate_right crop set_as
set_as_wallpaper item items date_unknown details_ok no_items wallpaper camera_setas_wallpaper pick pick_prompt crop_label crop_save_text
crop_discard_text saving_image running_face_detection'''.split(),
    },
    'camera': {
        'apks': ['CameraGoogle'],
        'keys': '''camera_label video_camera_label confirm_restore_title confirm_restore_message switch_camera_id pref_camera_id_title
pref_camera_id_entry_back pref_camera_id_entry_front pref_camera_recordlocation_title pref_camera_recordlocation_entry_off
pref_camera_recordlocation_entry_on pref_video_quality_title pref_camera_settings_category pref_camcorder_settings_category
pref_camera_picturesize_title pref_camera_jpegquality_title pref_camera_focusmode_title pref_camera_flashmode_title
pref_camera_whitebalance_title pref_camera_coloreffect_title pref_camera_scenemode_title pref_restore_title pref_restore_detail
pref_exposure_title zoom_control_title switch_to_camera_lable switch_to_video_lable camera_gallery_photos_text'''.split(),
        'arrays': ['pref_camera_picturesize_entries', 'pref_camera_jpegquality_entries', 'pref_camera_focusmode_entries', 'pref_camera_flashmode_entries',
                   'pref_camera_whitebalance_entries', 'pref_camera_coloreffect_entries', 'pref_camera_scenemode_entries', 'pref_video_quality_entries',
                   'pref_camera_video_flashmode_entries'],
    },
    'framework': {
        'apks': ['framework'],
        'keys': 'recent_tasks_title no_recent_tasks ringtone_default ringtone_silent ringtone_picker_title ok cancel yes no volume_ringtone volume_music volume_call volume_alarm volume_notification volume_unknown volume_music_hint_silent_ringtone_selected'.split(),
    },
    'settings2': {
        'apks': ['Settings', 'framework'],
        'keys': '''manageapplications_settings_title runningservices_settings_title filter_apps_all filter_apps_third_party filter_apps_running
filter_apps_onsdcard no_applications sort_order_alpha sort_order_size internal_storage sd_card_storage service_background_processes
service_foreground_processes no_running_services running_processes_item_description_s_s running_processes_item_description_s_p
running_processes_item_description_p_s running_processes_item_description_p_p application_info_label storage_label total_size_label
application_size_label data_size_label clear_user_data_text cache_header_label cache_size_label clear_cache_btn_text auto_launch_label
auto_launch_disable_text clear_activities permissions_label security_settings_desc force_stop uninstall_text version_text computing_size
force_stop_dlg_title force_stop_dlg_text clear_data_dlg_title clear_data_dlg_text dlg_ok dlg_cancel move_app_to_sdcard
power_usage_summary_title battery_since_unplugged battery_stats_on_battery details_title details_subtitle controls_subtitle packages_subtitle
power_screen power_wifi power_bluetooth power_cell power_phone power_idle usage_type_cpu usage_type_cpu_foreground usage_type_wake_lock
usage_type_on_time usage_type_no_coverage battery_action_stop battery_action_app_details battery_action_display battery_action_wifi
process_kernel_label legal_information settings_license_activity_title settings_license_activity_loading master_clear_title
master_clear_desc erase_external_storage erase_external_storage_description master_clear_button_text master_clear_final_desc
master_clear_final_button_text master_clear_gesture_explanation'''.split(),
    },
    'accounts': {
        'apks': ['AccountAndSyncSettings', 'framework'],
        'keys': '''sync_settings background_data background_data_summary background_data_dialog_title background_data_dialog_message sync_automatically
sync_automatically_summary sync_menu_sync_now sync_menu_sync_cancel sync_one_time_sync sync_calendar sync_contacts header_manage_accounts
header_general_sync_settings sync_enabled sync_disabled add_account_label header_data_and_synchronization remove_account_label header_add_an_account
really_remove_account_title really_remove_account_message remove_account_failed sync_item_title ok cancel'''.split(),
    },
    'search': {
        'apks': ['GoogleQuickSearchBox'],
        'keys': '''app_name corpus_selection_heading corpus_selection_edit_items corpus_label_global corpus_label_web corpus_description_web
corpus_label_apps corpus_description_apps corpus_hint_apps menu_settings search_settings web_search_category_title system_search_category_title
search_sources search_sources_summary clear_shortcuts clear_shortcuts_summary clear_shortcuts_prompt agree disagree google_search_label
google_search_hint google_search_settings google_show_web_suggestions google_show_web_suggestions_summary_enabled
google_show_web_suggestions_summary_disabled'''.split(),
    },
    'downloads': {
        'apks': ['DownloadProviderUi', 'framework'],
        'keys': '''app_label download_title no_downloads missing_title download_menu_sort_by_size download_menu_sort_by_date download_queued
download_running download_success download_error dialog_title_not_available dialog_failed_body dialog_title_queued_body dialog_queued_body
dialog_file_missing_body download_no_application_title remove_download delete_download keep_queued_download cancel_running_download
retry_download deselect_all today yesterday last_month older'''.split(),
        'plurals': ['last_num_days'],
    },
    'wallpapers': {
        'apks': ['LiveWallpapersPicker', 'LiveWallpapers', 'VisualizationWallpapers', 'MagicSmokeWallpapers', 'Microbes', 'Maps'],
        'keys': '''live_wallpaper_picker_title live_wallpaper_preview_title configure_wallpaper wallpaper_instructions live_wallpaper_empty
live_wallpaper_loading wallpaper_grass wallpaper_grass_desc wallpaper_galaxy wallpaper_galaxy_desc wallpaper_fall wallpaper_fall_desc wallpaper_clock
wallpaper_clock_desc wallpaper_nexus wallpaper_nexus_desc clock_settings show_seconds variable_line_width palette palette_gray palette_violet
palette_matrix palette_white_c palette_black_c palette_halloween palette_zenburn palette_oceanic author wallpaper_vis2 wallpaper_vis3 wallpaper_vis4
wallpaper_vis5 vis2_desc vis3_desc vis4_desc vis5_desc wallpaper_magicsmoke magicsmoke_desc taptochange ok
wallpaper_microbes wallpaper_microbes_desc wallpaper_maps wallpaper_maps_desc maps_settings maps_map_mode maps_map_mode_summary maps_mode_normal
maps_mode_satellite maps_mode_terrain maps_show_traffic'''.split(),
        # Maps 5.4.0's MapWallpaper: the service label, wallpaper.xml's description and wallpaper_prefs.xml under Maps' own names.
        'aliases': {'wallpaper_maps': 'MAPS_APP_NAME', 'wallpaper_maps_desc': 'WALLPAPER_DESCRIPTION', 'maps_settings': 'WALLPAPER_SETTINGS',
                    'maps_map_mode': 'WALLPAPER_MAP_MODE', 'maps_map_mode_summary': 'WALLPAPER_MAP_MODE_SUMMARY', 'maps_mode_normal': 'WALLPAPER_MAP_MODE_NORMAL',
                    'maps_mode_satellite': 'WALLPAPER_MAP_MODE_SATELLITE', 'maps_mode_terrain': 'WALLPAPER_MAP_MODE_TERRAIN', 'maps_show_traffic': 'WALLPAPER_SHOW_TRAFFIC'},
    },
    'calendar': {
        'apks': ['CalendarGoogle'],
        'keys': '''calendars_title synced_visible synced_not_visible not_synced_not_visible preferences_general_title preferences_hide_declined_title preferences_use_home_tz_title preferences_use_home_tz_descrip
preferences_home_tz_title preferences_alerts_title preferences_alerts_type_title preferences_alerts_type_dialog preferences_alerts_ringtone_title
preferences_alerts_vibrateWhen_title preferences_alerts_vibrateWhen_summary prefDialogTitle_vibrateWhen preferences_default_reminder_title
preferences_default_reminder_dialog preferences_about_title preferences_build_version
app_label what_label where_label timezone_label attendees_label repeats_label no_title_label show_agenda_view show_day_view agenda_view
day_view week_view month_view event_view event_create event_edit event_delete goto_today menu_select_calendars menu_preferences calendars_title
event_edit_title hint_what hint_where hint_description hint_attendees creating_event saving_event event_info_title add_new_reminder
edit_event_to_label edit_event_from_label edit_event_all_day_label edit_event_calendar_label edit_event_show_extra_options edit_event_hide_extra_options
description_label presence_label privacy_label reminders_label view_event_calendar_label view_event_organizer_label view_event_timezone_label
view_event_response_label agenda_today loading show_older_events show_newer_events delete_label delete_event_label save_label discard_label
does_not_repeat daily every_weekday weekly monthly_on_day_count monthly yearly_plain monthly_on_day yearly modify_event modify_all
modify_all_following delete_this_event_title delete_title preferences_title synced_visible alert_title'''.split(),
        'arrays': ['preferences_alert_type_labels', 'prefEntries_alerts_vibrateWhen', 'preferences_default_reminder_labels', 'timezone_labels', 'timezone_values', 'reminder_minutes_labels', 'reminder_minutes_values', 'availability', 'visibility', 'ordinal_labels', 'delete_repeating_labels'],
    },
    # Settings' TetherSettings / WifiApSettings / WifiApDialog, VpnSettings / VpnTypeSelection / VpnEditor, ApnSettings /
    # ApnEditor and SecuritySettings' credential storage; the framework's VPN types, tether notification and alert title;
    # VpnServices' notification (not in the mirror: its strings come from the Nexus S image's VpnServices.apk).
    'network': {
        'apks': ['Settings', 'framework', 'VpnServices'],
        'keys': '''tether_settings_title_both usb_tethering_button_text usb_tethering_unavailable_subtext wifi_tether_checkbox_text
wifi_tether_enabled_subtext wifi_tether_settings_text wifi_tether_settings_subtext wifi_tether_settings_title wifi_tether_configure_ap_text
wifi_tether_configure_subtext tethering_help_button_text wifi_starting wifi_stopping wifi_ssid wifi_security wifi_password wifi_show_password
wifi_save wifi_cancel credentials_password_too_short
apn_settings apn_edit apn_not_set apn_name apn_apn apn_http_proxy apn_http_port apn_user apn_password apn_server apn_mmsc apn_mms_proxy
apn_mms_port apn_mcc apn_mnc apn_auth_type apn_type apn_protocol menu_delete menu_new menu_save menu_cancel error_title error_name_empty
error_apn_empty error_mcc_not3 error_mnc_not23 restore_default_apn menu_restore restore_default_apn_completed untitled_apn
vpn_settings_activity_title vpn_connect_to vpn_username_colon vpn_password_colon vpn_a_username vpn_a_password vpn_save_username
vpn_connect_button vpn_yes_button vpn_no_button vpn_back_button vpn_mistake_button vpn_menu_done vpn_menu_cancel vpn_menu_revert
vpn_menu_connect vpn_menu_disconnect vpn_menu_edit vpn_menu_delete vpn_error_miss_entering vpn_error_miss_selecting vpn_error_duplicate_name
vpn_confirm_profile_deletion vpn_confirm_add_profile_cancellation vpn_confirm_edit_profile_cancellation vpn_type_title vpn_add_new_vpn
vpn_edit_title_add vpn_edit_title_edit vpns vpn_connecting vpn_disconnecting vpn_connected vpn_connect_hint vpn_name vpn_a_name
vpn_profile_added vpn_profile_replaced vpn_user_certificate_title vpn_user_certificate vpn_a_user_certificate vpn_ca_certificate_title
vpn_ca_certificate vpn_a_ca_certificate vpn_l2tp_secret_string_title vpn_l2tp_secret vpn_a_l2tp_secret vpn_pptp_encryption_title
vpn_pptp_encryption vpn_ipsec_presharedkey_title vpn_ipsec_presharedkey vpn_a_ipsec_presharedkey vpn_vpn_server_title vpn_vpn_server
vpn_a_vpn_server vpn_dns_search_list_title vpn_dns_search_list vpn_field_is_set vpn_field_not_set vpn_field_not_set_optional
vpn_enable_field vpn_is_enabled vpn_is_disabled vpn_secret_unchanged vpn_secret_not_set vpn_secret_not_set_dialog_msg
credentials_category credentials_access credentials_access_summary credentials_unlock credentials_unlock_hint credentials_install_certificates
credentials_install_certificates_summary credentials_set_password credentials_set_password_summary credentials_reset credentials_reset_summary
credentials_reset_hint credentials_old_password credentials_new_password credentials_confirm_password credentials_first_time_hint
credentials_wrong_password credentials_reset_warning credentials_reset_warning_plural credentials_passwords_mismatch credentials_passwords_empty
credentials_password_empty credentials_erased credentials_enabled credentials_disabled
pptp_vpn_description l2tp_vpn_description l2tp_ipsec_psk_vpn_description l2tp_ipsec_crt_vpn_description tethered_notification_title
tethered_notification_message wifi_tether_configure_ssid_default dialog_alert_title ok cancel yes no vpn_notification_title_connected'''.split(),
        'arrays': ['wifi_ap_security', 'apn_auth_entries', 'apn_protocol_entries'],
    },
    # Phone's network settings (network_setting.xml, gsm_umts_options.xml) and NetworkSetting (carrier_select.xml).
    'phonenet': {
        'apks': ['Phone', 'framework'],
        'keys': '''settings_label mobile_networks data_enabled data_enable_summary roaming roaming_enable roaming_disable roaming_warning apn_settings prefer_2g
prefer_2g_summary networks sum_carrier_select label_available load_networks_progress empty_networks_list search_networks sum_search_networks
select_automatically sum_select_automatically register_automatically register_on_network not_allowed connect_later registration_done
dialog_alert_title yes no simContacts_emptyLoading simContacts_empty simContacts_title importSimEntry importAllSimEntries
importingSimContacts cancel'''.split(),
    },
    # Contacts' display options (ContactsPreferencesActivity), Import/Export (ImportVCardActivity, ExportVCardActivity) and
    # sharing; the image is a "nosdcard" build, so the USB storage variants come first in the files.
    'contactsio': {
        'apks': ['Contacts', 'framework'],
        'keys': '''displayGroups menu_done menu_doNotSave showFilterPhones showFilterPhonesDescrip headerContactGroups display_options_sort_list_by
display_options_sort_by_given_name display_options_sort_by_family_name display_options_view_names_as display_options_view_given_name_first
display_options_view_family_name_first display_ungrouped display_all_contacts display_more_groups menu_sync_remove dialog_sync_add
display_warn_remove_ungrouped dialog_import_export import_from_sim import_from_sdcard export_to_sdcard share_visible_contacts searching_vcard_title
searching_vcard_message scanning_sdcard_failed_title scanning_sdcard_failed_message fail_reason_no_vcard_file select_vcard_title
import_one_vcard_string import_multiple_vcard_string import_all_vcard_string reading_vcard_title reading_vcard_message reading_vcard_contacts
confirm_export_title confirm_export_message exporting_contact_list_title exporting_contact_list_message exporting_contact_list_progress
exporting_contact_failed_title exporting_contact_failed_message fail_reason_no_exportable_contact share_error whichApplication ok cancel'''.split(),
    },
}


def build(name):
    app, out, arrays = APPS[name], {}, {}
    for key in app['keys']:
        value = RES.string(app['apks'], app.get('aliases', {}).get(key, key))
        if value:
            out[key] = value
    for key in app.get('plurals', []):
        for lang, quantities in (RES.plurals(app['apks'], key) or {}).items():
            for quantity in ('one', 'other'):
                if quantity in quantities:
                    out.setdefault(f'{key}_{quantity}', {})[lang] = quantities[quantity]
    for key in app.get('arrays', []):
        value = RES.array(app['apks'], key)
        if value:
            arrays[key] = value
    missing = [k for k in app['keys'] if k not in out] + [k for k in app.get('arrays', []) if k not in arrays]
    js = ('/* Generated by docs/tools/gb-strings.py from the Nexus S GRK39F image (%s; en, hu, de, fr, es). Do not edit. */\n'
          'window.GBStrings = window.GBStrings || {};\n'
          'window.GBStrings[%s] = %s;\n' % (', '.join(a if a == 'framework' else a + '.apk' for a in app['apks']), json.dumps(name),
                                            json.dumps({'strings': out, **({'arrays': arrays} if arrays else {})}, ensure_ascii=False, indent=0)))
    open(f'{ROOT}versions/2.3.6/gb-strings-{name}.js', 'w', encoding='utf-8', newline='\n').write(js)
    print(name, 'keys', len(out), 'missing', missing)


if __name__ == '__main__':
    for name in sys.argv[1:] or APPS:
        build(name)
