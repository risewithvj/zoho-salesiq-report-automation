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
 * TRIGGERS + MENU
 * =====================================================================
 */

function onOpen() {
  try {
    verifyIntegrity_();
  } catch (e) {
    // verifyIntegrity_ already showed the alert; still build the menu so
    // the user can see something, but every action re-checks anyway.
  }

  SpreadsheetApp.getUi().createMenu('SalesIQ Reports')
    .addItem('1. Initialize Sheet Structure', 'initializeSheetStructure')
    .addSeparator()
    .addItem('Build Weekly Dashboard Now', 'buildWeeklyDashboardNow')
    .addItem('Send Weekly Report Now', 'sendWeeklyReport')
    .addSeparator()
    .addItem('Build Monthly Dashboard Now', 'buildMonthlyDashboardNow')
    .addItem('Send Monthly Report Now', 'sendMonthlyReport')
    .addSeparator()
    .addItem('2. Install Automatic Schedule (Sun 10AM + 1st 10AM)', 'installTriggers')
    .addItem('Remove Automatic Schedule', 'removeTriggers')
    .addSeparator()
    .addItem('About / Support', 'showAboutDialog')
    .addToUi();
}

function installTriggers() {
  verifyIntegrity_();
  removeTriggers(); // avoid duplicates if run more than once

  ScriptApp.newTrigger('sendWeeklyReport')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(10)
    .nearMinute(0)
    .inTimezone(CONFIG.TIMEZONE)
    .create();

  ScriptApp.newTrigger('sendMonthlyReport')
    .timeBased()
    .onMonthDay(1)
    .atHour(10)
    .nearMinute(0)
    .inTimezone(CONFIG.TIMEZONE)
    .create();

  SpreadsheetApp.getUi().alert(
    'Automatic schedule installed',
    '• Weekly report: every Sunday ~10:00 AM (' + CONFIG.TIMEZONE + '), covering the Sunday-to-Saturday period that just ended.\n' +
    '• Monthly report: 1st of every month ~10:00 AM (' + CONFIG.TIMEZONE + '), covering the previous calendar month.\n\n' +
    'Reports send using whatever is currently in the "Raw Data" Drive folder at trigger ' +
    'time — export from Zoho SalesIQ and replace the two files before the scheduled time each period.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function removeTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(t) {
    const fn = t.getHandlerFunction();
    if (fn === 'sendWeeklyReport' || fn === 'sendMonthlyReport') ScriptApp.deleteTrigger(t);
  });
}

function showAboutDialog() {
  const msg =
    CONFIG.REPORT_TITLE + ' Automation\n\n' +
    'Created by: ' + CREATOR.NAME + ' (' + CREATOR.NICKNAME + ')\n' +
    'GitHub: ' + CREATOR.GITHUB + '\n' +
    'LinkedIn: ' + CREATOR.LINKEDIN + '\n' +
    'Email: ' + CREATOR.EMAIL + '\n\n' +
    'For setup help, customization guides, or to report an issue, visit the ' +
    'GitHub repository or reach out directly using the contacts above. ' +
    'See the "Support & Credits" tab in this sheet too.';
  SpreadsheetApp.getUi().alert('About this template', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}
