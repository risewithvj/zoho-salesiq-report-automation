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
 *  This project is free to use, adapt, and deploy for your own
 *  organization. Attribution (this file, the email footer credit, and
 *  the "Support & Credits" sheet tab) must remain intact -- see LICENSE
 *  in the repo for the full terms.
 * =====================================================================
 */

/**
 * =====================================================================
 * SETUP SHEETS
 * Creates every tab this system needs, pre-labelled and ready to use.
 * Safe to run more than once — never wipes a tab that already exists,
 * so it never touches recipient emails or data you've already pasted.
 * =====================================================================
 */

function initializeSheetStructure() {
  verifyIntegrity_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  setupTopicsRawSheet_(ss, CONFIG.SHEETS.WEEKLY_TOPICS_RAW);
  setupTopicsRawSheet_(ss, CONFIG.SHEETS.MONTHLY_TOPICS_RAW);
  setupKpiSnapshotSheet_(ss, CONFIG.SHEETS.WEEKLY_KPI_RAW);
  setupKpiSnapshotSheet_(ss, CONFIG.SHEETS.MONTHLY_KPI_RAW);
  setupDashboardSheet_(ss, CONFIG.SHEETS.WEEKLY_DASHBOARD);
  setupDashboardSheet_(ss, CONFIG.SHEETS.MONTHLY_DASHBOARD);
  setupSourceMappingSheet_(ss);
  setupReportConfigSheet_(ss);
  setupReportHistorySheet_(ss);
  setupSupportSheet_(ss);

  // Tidy default tab order + remove the default blank "Sheet1" if unused
  reorderTabs_(ss);

  SpreadsheetApp.getUi().alert(
    'Setup complete',
    'Tabs created. Next steps:\n' +
    '1. In Config.gs: set BRAND.NAME/TAGLINE, DRIVE.FOLDER_ID, and SOURCE_RULES/BUCKET_ORDER ' +
    'to match your own company and chatbot tags (see README.md).\n' +
    '2. In the script editor: Services (+) -> add "Drive API" (needed to read the Drive files).\n' +
    '3. Fill in "Report Config" (recipient emails, company name).\n' +
    '4. Make sure your two Zoho SalesIQ exports are in your "Raw Data" Drive folder, named to ' +
    'match Config.gs\'s DRIVE settings, exported with this period\'s date range.\n' +
    '5. Run "Send Weekly Report Now" from the menu to test — it reads both files automatically.\n' +
    '6. Once happy, run "Install Automatic Schedule".',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function setupTopicsRawSheet_(ss, name) {
  if (ss.getSheetByName(name)) return;
  const sh = ss.insertSheet(name);
  sh.getRange('A1').setValue(
    'Auto-fetched from the "Raw Data" Drive folder every time a report is built or sent — ' +
    'nothing to paste here. Shown for visibility only. Make sure you have re-exported ' +
    'Operator_Reports.xlsx from Zoho SalesIQ with this period\'s date range and replaced the ' +
    'file in Drive before running a report.'
  ).setFontWeight('bold').setFontColor('#B54708').setWrap(true);
  sh.getRange('A1:H1').merge();
  sh.setRowHeight(1, 40);
  sh.getRange('A2').setValue('Source (Bucket / Channel)').setFontWeight('bold');
  sh.getRange('B2').setValue('Chats').setFontWeight('bold');
  sh.setFrozenRows(2);
  sh.setColumnWidths(1, 1, 320);
}

function setupKpiSnapshotSheet_(ss, name) {
  if (ss.getSheetByName(name)) return;
  const sh = ss.insertSheet(name);
  const labels = [
    ['Total Website Visitors',        'Brand Report > KPIs tab > "Total Visitors"'],
    ['New Visitors',                  'Brand Report > KPIs tab > "New Visitors"'],
    ['Total Sessions',                'Brand Report > KPIs tab > "Total Sessions"'],
    ['Avg. Session Duration',         'Brand Report > KPIs tab > "Avg. Session Duration"'],
    ['Bounce Rate %',                 'Brand Report > Session bounce tab > "Bounce Rate"'],
    ['Total Chats Picked Up',         'Operator Report > KPIs tab > "Picked up chats" (Total column)'],
    ['Missed Chats',                  'Operator Report > KPIs tab > "Missed chats" (Total column)'],
    ['Closed Chats',                  'Operator Report > KPIs tab > "Closed chats" (Total column)'],
    ['Total Chat Hours',              'Operator Report > KPIs tab > "Chats hours" (Total column)'],
    ['Active Operators (Avg)',        'Operator Report > KPIs tab > "Active operators" (Average column)'],
    ['Chats Moved to CRM',            'Operator Report > Chat actions tab > "Moved to CRM"'],
    ['Rated Chats',                   'Operator Report > Feedback and Rating tab > "Rated Chats"'],
    ['Good Rated Chats',              'Operator Report > Feedback and Rating tab > "Good Rated Chats"'],
    ['Ok Rated Chats',                'Operator Report > Feedback and Rating tab > "Ok Rated Chats"'],
    ['Bad Rated Chats',               'Operator Report > Feedback and Rating tab > "Bad Rated Chats"'],
    ['Chats Answered Under 30 sec',   'Operator Report > Initial response time tab > "< 30 sec" column'],
    ['Total Chats (Response Time)',   'Operator Report > Initial response time tab > "Total chats" column']
  ];
  sh.getRange('A1').setValue(
    'The Value column is auto-filled from the "Raw Data" Drive folder every time a report is ' +
    'built or sent — nothing to type here manually. A blank value means that metric wasn\'t ' +
    'found in the current export and is simply omitted from the report.'
  ).setFontWeight('bold').setFontColor('#B54708').setWrap(true);
  sh.getRange('A1:C1').merge();
  sh.setRowHeight(1, 34);
  sh.getRange('A2:C2').setValues([['Metric', 'Value', 'Where to find it in the Zoho export']]).setFontWeight('bold');
  sh.getRange(3, 1, labels.length, 2).setValues(labels.map(function(l) { return [l[0], '']; }));
  sh.getRange(3, 3, labels.length, 1).setValues(labels.map(function(l) { return [l[1]]; }));
  sh.getRange(3, 3, labels.length, 1).setFontColor('#667085').setFontStyle('italic');
  sh.setFrozenRows(2);
  sh.setColumnWidth(1, 220);
  sh.setColumnWidth(2, 110);
  sh.setColumnWidth(3, 420);
}

function setupDashboardSheet_(ss, name) {
  if (ss.getSheetByName(name)) return;
  const sh = ss.insertSheet(name);
  sh.getRange('A1').setValue('This tab is auto-generated — do not edit by hand. Use the menu to rebuild it.')
    .setFontStyle('italic').setFontColor('#667085');
}

function setupSourceMappingSheet_(ss) {
  if (ss.getSheetByName(CONFIG.SHEETS.SOURCE_MAPPING)) return;
  const sh = ss.insertSheet(CONFIG.SHEETS.SOURCE_MAPPING);
  sh.getRange('A1').setValue(
    'This tab is expected to be EMPTY most of the time — that\'s normal, not an error. The system ' +
    'auto-classifies tags by keyword using the rules in Config.gs\'s SOURCE_RULES (edit those to ' +
    'match your own chatbot\'s tags), including an "Other" bucket for whatever visitors selected ' +
    '"Other" in the chatbot menu, which is handled automatically. Only add a row here if a specific ' +
    'tag needs to be forced into a different bucket than the automatic keyword rule would pick.'
  ).setFontWeight('bold').setFontColor('#B54708').setWrap(true);
  sh.getRange('A1:B1').merge();
  sh.setRowHeight(1, 50);
  sh.getRange('A2:B2').setValues([['Raw Tag (exact text from Zoho)', 'Bucket to force it into']]).setFontWeight('bold');
  sh.setFrozenRows(2);
  sh.setColumnWidth(1, 380);
  sh.setColumnWidth(2, 260);
}

function setupReportConfigSheet_(ss) {
  if (ss.getSheetByName(CONFIG.SHEETS.REPORT_CONFIG)) return;
  const sh = ss.insertSheet(CONFIG.SHEETS.REPORT_CONFIG);
  const rows = [
    ['Setting', 'Value'],
    ['Company Name', CONFIG.BRAND.NAME],
    ['Sender Display Name', CONFIG.BRAND.NAME + ' - SalesIQ Reports'],
    ['Generated By', ''],
    ['Weekly — To Emails (comma separated)', ''],
    ['Weekly — CC Emails (comma separated)', ''],
    ['Monthly — To Emails (comma separated)', ''],
    ['Monthly — CC Emails (comma separated)', ''],
    ['Last Weekly Send', ''],
    ['Last Monthly Send', '']
  ];
  sh.getRange(1, 1, rows.length, 2).setValues(rows);
  sh.getRange('A1:B1').setFontWeight('bold');
  sh.getRange('B4').setNote('Optional — a real person\'s name to credit in the email footer for your own organization (separate from the template\'s creator attribution, which stays fixed).');
  sh.setFrozenRows(1);
  sh.setColumnWidth(1, 260);
  sh.setColumnWidth(2, 320);
}

/**
 * "Support & Credits" tab -- shows who built this template and how to get
 * help. Please keep this tab intact; it costs nothing and is how people
 * who find this useful can find the original source and get support.
 */
function setupSupportSheet_(ss) {
  if (ss.getSheetByName(CONFIG.SHEETS.SUPPORT)) return;
  const sh = ss.insertSheet(CONFIG.SHEETS.SUPPORT);
  sh.setColumnWidth(1, 260);
  sh.setColumnWidth(2, 460);

  sh.getRange('A1:B1').merge().setValue(CONFIG.REPORT_TITLE + ' Automation — Support & Credits')
    .setFontSize(16).setFontWeight('bold').setFontColor('#FFFFFF').setBackground(CONFIG.BRAND.COLOR_HEADER)
    .setVerticalAlignment('middle');
  sh.setRowHeight(1, 36);

  const rows = [
    ['Created by', CREATOR.NAME],
    ['GitHub', CREATOR.GITHUB],
    ['LinkedIn', CREATOR.LINKEDIN],
    ['Email', CREATOR.EMAIL],
    ['', ''],
    ['Found a bug or need help?', 'Open an issue on GitHub or email directly -- see contacts above.'],
    ['Want to customize this?', 'See the README.md in the GitHub repo for full setup, editing, and customization instructions.'],
    ['Like this project?', 'A star on the GitHub repo helps others find it. Thank you!']
  ];
  sh.getRange(3, 1, rows.length, 2).setValues(rows);
  sh.getRange(3, 1, rows.length, 1).setFontWeight('bold');

  // Hyperlink the GitHub/LinkedIn/Email rows
  sh.getRange('B4').setFormula('=HYPERLINK("' + CREATOR.GITHUB + '","' + CREATOR.GITHUB + '")');
  sh.getRange('B5').setFormula('=HYPERLINK("' + CREATOR.LINKEDIN + '","' + CREATOR.LINKEDIN + '")');
  sh.getRange('B6').setFormula('=HYPERLINK("mailto:' + CREATOR.EMAIL + '","' + CREATOR.EMAIL + '")');

  sh.getRange(3, 1, rows.length, 2).setWrap(true).setVerticalAlignment('middle');
  sh.setFrozenRows(2);
}

function setupReportHistorySheet_(ss) {
  if (ss.getSheetByName(CONFIG.SHEETS.REPORT_HISTORY)) return;
  const sh = ss.insertSheet(CONFIG.SHEETS.REPORT_HISTORY);
  sh.getRange('A1:E1').setValues([['Label', 'Period Start', 'Period End', 'Sent On', 'Data JSON']]).setFontWeight('bold');
  sh.getRange('A1').setNote('Auto-populated on every send — used to compute week-over-week / month-over-month trend arrows. Do not edit.');
  sh.setFrozenRows(1);
  sh.hideSheet();
}

/** Small helper other files use to read Report Config values by label. */
function getConfigValue_(label) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CONFIG.SHEETS.REPORT_CONFIG);
  if (!sh) throw new Error('Report Config tab not found. Run "Initialize Sheet Structure" first.');
  const data = sh.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (String(data[i][0]).trim() === label) return String(data[i][1] || '').trim();
  }
  return '';
}

function setConfigValue_(label, value) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CONFIG.SHEETS.REPORT_CONFIG);
  const data = sh.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (String(data[i][0]).trim() === label) { sh.getRange(i + 1, 2).setValue(value); return; }
  }
}

function formatDate_(d, fmt) {
  return d ? Utilities.formatDate(d, CONFIG.TIMEZONE, fmt) : '';
}

/** Sunday-to-Saturday window ending on the most recent completed Saturday. */
function computeWeeklyPeriod_() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun..6=Sat
  // Days since the most recent Saturday (6). If today IS Saturday, use today.
  const daysSinceSaturday = (day - 6 + 7) % 7;
  const end = new Date(now); end.setDate(now.getDate() - daysSinceSaturday);
  end.setHours(23, 59, 59, 999);
  const start = new Date(end); start.setDate(end.getDate() - 6); // back to that week's Sunday
  start.setHours(0, 0, 0, 0);
  return { start: start, end: end };
}

/** Previous full calendar month. */
function computeMonthlyPeriod_() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  return { start: start, end: end };
}

function reorderTabs_(ss) {
  const order = [
    CONFIG.SHEETS.REPORT_CONFIG,
    CONFIG.SHEETS.WEEKLY_TOPICS_RAW,
    CONFIG.SHEETS.WEEKLY_KPI_RAW,
    CONFIG.SHEETS.WEEKLY_DASHBOARD,
    CONFIG.SHEETS.MONTHLY_TOPICS_RAW,
    CONFIG.SHEETS.MONTHLY_KPI_RAW,
    CONFIG.SHEETS.MONTHLY_DASHBOARD,
    CONFIG.SHEETS.SOURCE_MAPPING,
    CONFIG.SHEETS.REPORT_HISTORY,
    CONFIG.SHEETS.SUPPORT
  ];
  order.forEach(function(name, i) {
    const sh = ss.getSheetByName(name);
    if (sh) ss.setActiveSheet(sh) && ss.moveActiveSheet(i + 1);
  });
  const blank = ss.getSheetByName('Sheet1');
  if (blank && ss.getSheets().length > 1) {
    try { ss.deleteSheet(blank); } catch (e) {}
  }
}
