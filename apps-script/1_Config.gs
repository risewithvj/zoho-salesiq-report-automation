/**
 * =====================================================================
 *  Website & WhatsApp Chatbot Report Automation for Google Sheets + Apps Script
 * =====================================================================
 *  Created by   : Vijaya Kumar L
 *  Nickname     : risewithvj
 *  GitHub       : https://github.com/risewithvj
 *  LinkedIn     : https://www.linkedin.com/in/vijayakumarl/
 *  Email        : risewithvj@gmail.com
 * -----------------------------------------------------------------------
 *  CONFIGURATION
 *  Edit the BRAND, DRIVE, and SOURCE_RULES sections below to match your
 *  own company and your own Zoho SalesIQ chatbot's tag names. Everything
 *  else (recipient emails, source-mapping overrides) is managed inside
 *  the spreadsheet itself, in the "Report Config" and "Source Mapping"
 *  tabs -- no code editing needed for day-to-day use.
 * =====================================================================
 */

const CONFIG = {

  // ---- Sheet (tab) names ------------------------------------------------
  SHEETS: {
    WEEKLY_TOPICS_RAW:   'Weekly Chat Topics Raw',
    WEEKLY_KPI_RAW:      'Weekly KPI Snapshot',
    WEEKLY_DASHBOARD:    'Weekly Dashboard',
    MONTHLY_TOPICS_RAW:  'Monthly Chat Topics Raw',
    MONTHLY_KPI_RAW:     'Monthly KPI Snapshot',
    MONTHLY_DASHBOARD:   'Monthly Dashboard',
    SOURCE_MAPPING:      'Source Mapping',
    REPORT_CONFIG:       'Report Config',
    REPORT_HISTORY:      'Report History',
    SUPPORT:             'Support & Credits'
  },

  // ---- Brand -- EDIT THIS SECTION FOR YOUR OWN COMPANY -------------------
  BRAND: {
    NAME: 'Your Company Name',
    TAGLINE: 'Your Tagline Here',
    COLOR_HEADER: '#0362FC',   // header banner
    COLOR_NAVY:   '#1E1B4B',   // dark text / table header accents
    COLOR_BLUE:   '#0362FC',   // Website channel accent
    COLOR_BLUE_LIGHT: '#EEF0FF',
    COLOR_GREEN:  '#0F9D58',   // up / positive
    COLOR_RED:    '#E5484D',   // down / negative
    COLOR_AMBER:  '#F5A524',
    COLOR_GREY:   '#667085',
    COLOR_BG:     '#F5F4FB',
    COLOR_WHATSAPP: '#0D9488'  // WhatsApp channel accent
  },

  // ---- Channel detection (from the raw Zoho "Tag" text) ------------------
  // Zoho SalesIQ tags its chat topics with the channel name in the text
  // itself (e.g. "Sales Query - Website", "Support Query - WhatsApp").
  // This is a Zoho platform convention, not something you need to edit.
  CHANNEL_KEYWORDS: {
    WHATSAPP: 'whatsapp',
    WEBSITE:  'website'
  },
  DEFAULT_CHANNEL: 'Website', // used only if a tag matches neither keyword

  // ---- Source bucket classification -- EDIT THIS FOR YOUR OWN CHATBOT ----
  // THIS IS THE #1 THING YOU SHOULD CUSTOMIZE. These example rules exist
  // only to demonstrate the pattern -- your own Zoho SalesIQ chatbot will
  // have its own tag names ("Sales Query", "Billing Support", whatever
  // your bot's menu options are called). Replace the keywords/buckets
  // below to match your own tags, in priority order (first match wins).
  //
  // Prefer a no-code option? Leave this alone and use the in-sheet
  // "Source Mapping" tab instead -- it lets you map exact tag text to a
  // bucket without ever touching this file. Overrides there always win
  // over the keyword rules here.
  //
  // Whatever doesn't match any rule below AND has no override in
  // "Source Mapping" falls into OTHER_BUCKET and is flagged in a warning
  // banner (not silently guessed) so you always know when a brand-new,
  // unrecognized tag shows up in your chatbot.
  SOURCE_RULES: [
    { bucket: 'Sales Inquiry',   keywords: ['sales', 'pricing', 'quote', 'demo'] },
    { bucket: 'Support Inquiry', keywords: ['support', 'help', 'issue', 'complaint'] },
    { bucket: 'General Inquiry', keywords: ['general', 'info', 'enquiry', 'inquiry'] },
    { bucket: 'Other',           keywords: ['other'] }
  ],
  OTHER_BUCKET: 'Other',

  // Fixed display order for bucket rows in dashboard + email.
  // Must match the bucket names used in SOURCE_RULES above.
  BUCKET_ORDER: [
    'Sales Inquiry',
    'Support Inquiry',
    'General Inquiry',
    'Other'
  ],

  // One-line plain-English description per bucket, shown as a glossary at
  // the bottom of every report so stakeholders don't have to guess what
  // each category means. Update these to match your own BUCKET_ORDER.
  BUCKET_DESCRIPTIONS: {
    'Sales Inquiry':   'Example category -- edit SOURCE_RULES/BUCKET_ORDER in Config.gs (or use the "Source Mapping" tab) to match your own chatbot\u2019s tags.',
    'Support Inquiry': 'Example category -- edit SOURCE_RULES/BUCKET_ORDER in Config.gs (or use the "Source Mapping" tab) to match your own chatbot\u2019s tags.',
    'General Inquiry': 'Example category -- edit SOURCE_RULES/BUCKET_ORDER in Config.gs (or use the "Source Mapping" tab) to match your own chatbot\u2019s tags.',
    'Other':            'Visitor selected "Other" in the chatbot menu, or a genuinely new topic the system hasn\u2019t seen before.'
  },

  // ---- Source files in Google Drive -- EDIT FOLDER_ID FOR YOUR OWN DRIVE -
  // The two Zoho SalesIQ exports (Operator Report + Brand Report) live in
  // one Drive folder, always under these exact file names. Each period,
  // re-export from Zoho with the correct date range and REPLACE (not
  // duplicate) these two files -- everything downstream then runs
  // automatically. See the README for how to find your folder's ID.
  DRIVE: {
    FOLDER_ID: 'PASTE_YOUR_DRIVE_FOLDER_ID_HERE',
    OPERATOR_FILE_NAME: 'Operator_Reports.xlsx',
    BRAND_FILE_NAME: 'Brand_Reports.xlsx'
  },

  // ---- Privacy / redaction (optional) -------------------------------------
  // If your Zoho SalesIQ portal is accessed through a shared, generic, or
  // former-employee login, every export's footer will show that
  // account's name/email. Add any terms here (lowercase) that should
  // never appear in your reports -- any row mentioning them is silently
  // dropped by the parser, regardless of which tab it came from. Leave
  // empty if this doesn't apply to you.
  REDACT_TERMS: [],

  // ---- Report titles -----------------------------------------------------
  REPORT_TITLE: 'Website & WhatsApp Chatbot Lead Source Report',
  WEEKLY_SUBJECT_PREFIX:  'Weekly Website & WhatsApp Chatbot Lead Source Report',
  MONTHLY_SUBJECT_PREFIX: 'Monthly Website & WhatsApp Chatbot Lead Source Report',

  TIMEZONE: Session.getScriptTimeZone() || 'Asia/Kolkata'
};
