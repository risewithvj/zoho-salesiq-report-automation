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
 * DRIVE SOURCE
 * Reads Operator_Reports.xlsx / Brand_Reports.xlsx directly out of the
 * "Raw Data" Drive folder — no manual copy-paste needed. Each .xlsx is
 * converted to a throwaway Google Sheet (Drive can only read xlsx tab
 * contents once it's in Sheets format), read, then trashed.
 *
 * Requires the "Drive API" Advanced Service enabled in this project
 * (Apps Script editor -> Services -> + -> Drive API). See README.md.
 * =====================================================================
 */

/**
 * Pulls both files and returns the same { topics, kpis } shape the rest
 * of the system (Dashboard.gs, EmailTemplate.gs) already expects.
 */
function fetchSalesIqData_() {
  const operatorFile = getLatestFileByName_(CONFIG.DRIVE.FOLDER_ID, CONFIG.DRIVE.OPERATOR_FILE_NAME);
  const opTemp = openXlsxAsTempSheet_(operatorFile);
  let topics, kOp;
  try {
    topics = parseChatTopicsFromSheet_(opTemp.spreadsheet.getSheetByName('Chat topics and performance'));

    const kpiSheet = opTemp.spreadsheet.getSheetByName('KPIs');
    const totalMap = readRowLabelMap_(kpiSheet, 'Total');
    const avgMap = readRowLabelMap_(kpiSheet, 'Average');
    const chatActions = readHeaderValueRow_(opTemp.spreadsheet.getSheetByName('Chat actions'));
    const feedback = readHeaderValueRow_(opTemp.spreadsheet.getSheetByName('Feedback and Rating'));
    const responseTime = readHeaderValueRow_(opTemp.spreadsheet.getSheetByName('Initial response time'));

    kOp = {
      'Total Chats Picked Up':        numOrBlank_(totalMap['Picked up chats']),
      'Missed Chats':                 numOrBlank_(totalMap['Missed chats']),
      'Closed Chats':                 numOrBlank_(totalMap['Closed chats']),
      'Total Chat Hours':             totalMap['Chats hours'],
      'Active Operators (Avg)':       numOrBlank_(avgMap['Active operators']),
      'Chats Moved to CRM':           numOrBlank_(chatActions['Moved to CRM']),
      'Rated Chats':                  numOrBlank_(feedback['Rated Chats']),
      'Good Rated Chats':             numOrBlank_(feedback['Good Rated Chats']),
      'Ok Rated Chats':               numOrBlank_(feedback['Ok Rated Chats']),
      'Bad Rated Chats':              numOrBlank_(feedback['Bad Rated Chats']),
      'Chats Answered Under 30 sec':  numOrBlank_(responseTime['< 30 sec']),
      'Total Chats (Response Time)':  numOrBlank_(responseTime['Total chats'])
    };
  } finally {
    closeTempSheet_(opTemp);
  }

  const brandFile = getLatestFileByName_(CONFIG.DRIVE.FOLDER_ID, CONFIG.DRIVE.BRAND_FILE_NAME);
  const brTemp = openXlsxAsTempSheet_(brandFile);
  let kBr;
  try {
    const brandKpis = readHeaderValueRow_(brTemp.spreadsheet.getSheetByName('KPIs'));
    const bounce = readHeaderValueRow_(brTemp.spreadsheet.getSheetByName('Session bounce'));
    kBr = {
      'Total Website Visitors': numOrBlank_(brandKpis['Total Visitors']),
      'New Visitors':           numOrBlank_(brandKpis['New Visitors']),
      'Total Sessions':         numOrBlank_(brandKpis['Total Sessions']),
      'Avg. Session Duration':  brandKpis['Avg. Session Duration'],
      'Bounce Rate %':          numOrBlank_(bounce['Bounce Rate'])
    };
  } finally {
    closeTempSheet_(brTemp);
  }

  const kpis = {};
  Object.keys(kOp).forEach(function(k) { if (kOp[k] !== undefined) kpis[k] = kOp[k]; });
  Object.keys(kBr).forEach(function(k) { if (kBr[k] !== undefined) kpis[k] = kBr[k]; });

  return { topics: topics, kpis: kpis, sourceFiles: {
    operator: { name: operatorFile.getName(), lastUpdated: operatorFile.getLastUpdated() },
    brand: { name: brandFile.getName(), lastUpdated: brandFile.getLastUpdated() }
  }};
}

/** Finds the file with this exact name in the folder (most recently modified if more than one). */
function getLatestFileByName_(folderId, fileName) {
  const folder = DriveApp.getFolderById(folderId);
  const it = folder.getFilesByName(fileName);
  let best = null;
  while (it.hasNext()) {
    const f = it.next();
    if (!best || f.getLastUpdated() > best.getLastUpdated()) best = f;
  }
  if (!best) {
    throw new Error('Could not find "' + fileName + '" in the "Raw Data" Drive folder. ' +
      'Make sure it is uploaded there with this exact file name.');
  }
  return best;
}

/** Converts an uploaded .xlsx Drive file into a temporary native Google Sheet so its tabs can be read. */
function openXlsxAsTempSheet_(driveFile) {
  const blob = driveFile.getBlob();
  const resource = {
    name: 'TMP__' + driveFile.getName() + '__' + new Date().getTime(),
    mimeType: MimeType.GOOGLE_SHEETS,
    parents: [CONFIG.DRIVE.FOLDER_ID]
  };
  const converted = Drive.Files.create(resource, blob);
  return { spreadsheet: SpreadsheetApp.openById(converted.id), fileId: converted.id };
}

/** Cleans up the temporary converted copy so the Drive folder doesn't fill up with clutter. */
function closeTempSheet_(temp) {
  try { DriveApp.getFileById(temp.fileId).setTrashed(true); } catch (e) { /* best-effort cleanup */ }
}

// ---- Generic small-table readers, used for every KPI-style tab -----------

/** Tabs shaped like: row1 = metric names as columns, row2 = their values. */
function readHeaderValueRow_(sheet) {
  if (!sheet) return {};
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return {};
  const headers = values[0].map(function(h) { return String(h).trim(); });
  const dataRow = values[1];
  const out = {};
  headers.forEach(function(h, i) { if (h) out[h] = dataRow[i]; });
  return out;
}

/** Tabs shaped like: col A = metric name per row, other columns = Total/Average/etc. */
function readRowLabelMap_(sheet, valueColumnHeader) {
  if (!sheet) return {};
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return {};
  const headers = values[0].map(function(h) { return String(h).trim().toLowerCase(); });
  const col = headers.indexOf(String(valueColumnHeader).toLowerCase());
  if (col === -1) return {};
  const out = {};
  for (let r = 1; r < values.length; r++) {
    const label = String(values[r][0] || '').trim();
    if (!label) continue;
    if (label.toLowerCase() === 'conditions') break;
    out[label] = values[r][col];
  }
  return out;
}

function numOrBlank_(v) {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  return isNaN(n) ? v : n;
}
