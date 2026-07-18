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
 * DASHBOARD
 * Assembles the combined report data (topics + KPIs + period + trend
 * deltas + an auto-written insight line) and writes it onto the
 * in-sheet dashboard tab. The same data object feeds the email.
 * =====================================================================
 */

function buildWeeklyDashboardNow() {
  verifyIntegrity_();
  const data = buildReportData_('Weekly');
  writeDashboard_(CONFIG.SHEETS.WEEKLY_DASHBOARD, data);
  SpreadsheetApp.getUi().alert('Weekly Dashboard updated');
  return data;
}

function buildMonthlyDashboardNow() {
  verifyIntegrity_();
  const data = buildReportData_('Monthly');
  writeDashboard_(CONFIG.SHEETS.MONTHLY_DASHBOARD, data);
  SpreadsheetApp.getUi().alert('Monthly Dashboard updated');
  return data;
}

/**
 * Pulls together everything needed for both the sheet dashboard and the
 * email: current-period topics + KPIs, the previous same-label period
 * from Report History (for trend arrows), the period date window, and
 * a plain-English auto-written insight line.
 */
function buildReportData_(label) {
  const isWeekly = label === 'Weekly';
  const topicsSheetName = isWeekly ? CONFIG.SHEETS.WEEKLY_TOPICS_RAW : CONFIG.SHEETS.MONTHLY_TOPICS_RAW;
  const kpiSheetName = isWeekly ? CONFIG.SHEETS.WEEKLY_KPI_RAW : CONFIG.SHEETS.MONTHLY_KPI_RAW;
  const period = isWeekly ? computeWeeklyPeriod_() : computeMonthlyPeriod_();

  // Pull straight from the two files in the Drive "Raw Data" folder —
  // no manual paste needed. See DriveSource.gs.
  const fetched = fetchSalesIqData_();
  const topics = fetched.topics;
  const kpis = fetched.kpis;
  const prev = readLastHistoryEntry_(label);

  // Write what was just fetched into the old raw tabs, purely as a visible
  // audit trail so you can see exactly what the last run pulled in.
  writeAuditCache_(topicsSheetName, kpiSheetName, fetched);

  const data = {
    label: label,
    periodWord: isWeekly ? 'week' : 'month',
    period: period,
    topics: topics,
    kpis: kpis,
    prev: prev,
    sourceFiles: fetched.sourceFiles,
    deltaTotals: {
      website: pctDelta_(topics.totals.website, prev ? prev.topics.totals.website : null),
      whatsapp: pctDelta_(topics.totals.whatsapp, prev ? prev.topics.totals.whatsapp : null),
      grand: pctDelta_(topics.totals.grand, prev ? prev.topics.totals.grand : null)
    }
  };
  data.insight = buildInsightText_(data);
  data.csat = computeCsat_(kpis);
  data.topMover = computeTopMover_(data);
  return data;
}

/** Good/Ok/Bad rating breakdown + satisfaction score, from the Feedback and Rating tab. */
function computeCsat_(k) {
  const good = Number(k['Good Rated Chats']) || 0;
  const ok = Number(k['Ok Rated Chats']) || 0;
  const bad = Number(k['Bad Rated Chats']) || 0;
  const total = good + ok + bad;
  return {
    good: good, ok: ok, bad: bad, total: total,
    scorePct: total ? Math.round((good / total) * 1000) / 10 : null
  };
}

/** The single bucket+channel combination that moved the most (up or down) vs the last same-type report. */
function computeTopMover_(data) {
  if (!data.prev) return null;
  let best = null;
  CONFIG.BUCKET_ORDER.forEach(function(bucket) {
    ['website', 'whatsapp'].forEach(function(ch) {
      const delta = bucketDelta_(data, bucket, ch);
      if (delta === null) return;
      const count = (data.topics.buckets[bucket] && data.topics.buckets[bucket][ch]) || 0;
      if (count < 3) return; // ignore noisy swings on tiny counts
      if (!best || Math.abs(delta) > Math.abs(best.delta)) {
        best = { bucket: bucket, channel: ch === 'website' ? 'Website' : 'WhatsApp', delta: delta, count: count };
      }
    });
  });
  return best;
}

/** Dumps the just-fetched topics + KPIs into the raw tabs for visibility. Auto-overwritten every run. */
function writeAuditCache_(topicsSheetName, kpiSheetName, fetched) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const topicsSheet = ss.getSheetByName(topicsSheetName);
  if (topicsSheet) {
    topicsSheet.getRange(3, 1, Math.max(topicsSheet.getMaxRows() - 2, 1), 2).clearContent();
    const rows = [];
    CONFIG.BUCKET_ORDER.forEach(function(bucket) {
      const b = fetched.topics.buckets[bucket];
      if (!b) return;
      if (b.website) rows.push([bucket + ' (Website)', b.website]);
      if (b.whatsapp) rows.push([bucket + ' (WhatsApp)', b.whatsapp]);
    });
    if (rows.length) topicsSheet.getRange(3, 1, rows.length, 2).setValues(rows);
    topicsSheet.getRange('A1').setValue(
      'Auto-fetched from Drive (' + fetched.sourceFiles.operator.name + ', last updated ' +
      formatDate_(fetched.sourceFiles.operator.lastUpdated, 'dd MMM yyyy, hh:mm a') +
      '). Read-only — do not edit, it is overwritten on every run.'
    );
  }

  const kpiSheet = ss.getSheetByName(kpiSheetName);
  if (kpiSheet) {
    const values = kpiSheet.getDataRange().getValues();
    for (let r = 2; r < values.length; r++) { // row index 2 = sheet row 3, first metric row
      const label = String(values[r][0] || '').trim();
      if (label && fetched.kpis[label] !== undefined) {
        kpiSheet.getRange(r + 1, 2).setValue(fetched.kpis[label]);
      }
    }
    kpiSheet.getRange('A1').setValue(
      'Auto-fetched from Drive (' + fetched.sourceFiles.brand.name + ' + ' + fetched.sourceFiles.operator.name +
      '). Read-only — do not edit, it is overwritten on every run.'
    );
  }
}

function pctDelta_(cur, prevVal) {
  if (prevVal === null || prevVal === undefined || prevVal === 0) return null;
  return Math.round(((cur - prevVal) / prevVal) * 1000) / 10;
}

function bucketDelta_(data, bucket, channelKey) {
  if (!data.prev) return null;
  const cur = data.topics.buckets[bucket] ? data.topics.buckets[bucket][channelKey] : 0;
  const prevBucket = data.prev.topics.buckets[bucket];
  const prevVal = prevBucket ? prevBucket[channelKey] : 0;
  return pctDelta_(cur, prevVal);
}

/** Largest bucket for a channel, used to write the auto-insight line. */
function topBucketForChannel_(data, channelKey) {
  let best = null;
  CONFIG.BUCKET_ORDER.forEach(function(bucket) {
    const count = (data.topics.buckets[bucket] && data.topics.buckets[bucket][channelKey]) || 0;
    if (!best || count > best.count) best = { bucket: bucket, count: count };
  });
  const total = data.topics.totals[channelKey] || 0;
  const share = (best && total) ? Math.round((best.count / total) * 1000) / 10 : 0;
  return { bucket: best ? best.bucket : null, count: best ? best.count : 0, share: share };
}

/** One-paragraph plain-English summary shown at the top of both the sheet and the email. */
function buildInsightText_(data) {
  const pw = data.periodWord;
  const topWeb = topBucketForChannel_(data, 'website');
  const topWa = topBucketForChannel_(data, 'whatsapp');

  let trendClause = ' — first report on record, no prior ' + pw + ' to compare against yet';
  if (data.deltaTotals.grand !== null) {
    const up = data.deltaTotals.grand >= 0;
    trendClause = ', ' + (up ? 'up' : 'down') + ' ' + Math.abs(data.deltaTotals.grand) + '% versus last ' + pw;
  }

  let text = 'This ' + pw + ', the chatbot captured ' + data.topics.totals.grand +
    ' total leads across Website and WhatsApp' + trendClause + '.';
  if (topWeb.bucket && topWeb.count > 0) {
    text += ' "' + topWeb.bucket + '" led Website traffic (' + topWeb.share + '% of ' + data.topics.totals.website + ' website leads)';
  }
  if (topWeb.bucket && topWeb.count > 0 && topWa.bucket && topWa.count > 0) text += ', while ';
  else if (topWa.bucket && topWa.count > 0) text += ' ';
  if (topWa.bucket && topWa.count > 0) {
    text += '"' + topWa.bucket + '" led WhatsApp (' + topWa.share + '% of ' + data.topics.totals.whatsapp + ' WhatsApp leads).';
  } else if (topWeb.bucket && topWeb.count > 0) {
    text += '.';
  }
  return text;
}

// ---- Report History (drives the trend arrows) ----------------------------

function readLastHistoryEntry_(label) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CONFIG.SHEETS.REPORT_HISTORY);
  if (!sh) return null;
  const values = sh.getDataRange().getValues();
  for (let r = values.length - 1; r >= 1; r--) {
    if (String(values[r][0]).trim() === label) {
      try { return JSON.parse(values[r][4]); } catch (e) { return null; }
    }
  }
  return null;
}

function appendHistoryEntry_(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CONFIG.SHEETS.REPORT_HISTORY);
  if (!sh) return;
  sh.appendRow([
    data.label,
    formatDate_(data.period.start, 'yyyy-MM-dd'),
    formatDate_(data.period.end, 'yyyy-MM-dd'),
    formatDate_(new Date(), 'yyyy-MM-dd HH:mm'),
    JSON.stringify({ topics: data.topics, kpis: data.kpis })
  ]);
}

// ---- In-sheet dashboard ----------------------------------------------------

function writeDashboard_(sheetName, data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(sheetName);
  if (!sh) sh = ss.insertSheet(sheetName);
  sh.clear(); sh.clearFormats();
  sh.getCharts().forEach(function(c) { sh.removeChart(c); });

  const B = CONFIG.BRAND;
  let row = 1;

  sh.getRange(row, 1, 1, 8).merge()
    .setValue(B.NAME + ' — ' + data.label + ' ' + CONFIG.REPORT_TITLE)
    .setFontSize(18).setFontWeight('bold').setFontColor('#FFFFFF').setBackground(B.COLOR_HEADER)
    .setVerticalAlignment('middle');
  sh.setRowHeight(row, 40);
  row++;

  sh.getRange(row, 1, 1, 8).merge()
    .setValue(formatDate_(data.period.start, 'dd MMM yyyy') + '  to  ' + formatDate_(data.period.end, 'dd MMM yyyy') +
      '   ·   Generated ' + formatDate_(new Date(), 'dd MMM yyyy, hh:mm a'))
    .setFontColor(B.COLOR_GREY).setFontStyle('italic');
  row += 2;

  // ---- Insight line -------------------------------------------------------
  sh.getRange(row, 1, 1, 8).merge().setValue(data.insight)
    .setFontSize(11).setFontColor(B.COLOR_NAVY).setBackground('#F5F4FB').setWrap(true)
    .setBorder(true, true, true, true, false, false, '#D0C9EF', SpreadsheetApp.BorderStyle.SOLID);
  sh.setRowHeight(row, 34);
  row += 2;

  if (data.topMover) {
    const tm = data.topMover;
    const upDown = tm.delta >= 0 ? 'up' : 'down';
    sh.getRange(row, 1, 1, 8).merge().setValue(
      'Biggest mover this ' + data.periodWord + ': "' + tm.bucket + '" (' + tm.channel + ') ' + upDown + ' ' + Math.abs(tm.delta) + '% vs last ' + data.periodWord + ' — now ' + tm.count + ' leads.'
    ).setFontSize(10.5).setFontColor(tm.delta >= 0 ? B.COLOR_GREEN : B.COLOR_RED).setBackground(tm.delta >= 0 ? '#EAF9F0' : '#FDECEC').setWrap(true);
    sh.setRowHeight(row, 28);
    row += 2;
  }

  // ---- KPI cards --------------------------------------------------------
  const k = data.kpis;
  const kpiList = [
    ['Total Leads (Website + WhatsApp)', data.topics.totals.grand, B.COLOR_HEADER],
    ['Website Leads', data.topics.totals.website, B.COLOR_BLUE],
    ['WhatsApp Leads', data.topics.totals.whatsapp, B.COLOR_WHATSAPP],
    ['Website Visitors', k['Total Website Visitors'] || '—', B.COLOR_NAVY],
    ['Bounce Rate', (k['Bounce Rate %'] !== undefined ? k['Bounce Rate %'] + '%' : '—'), B.COLOR_AMBER],
    ['Chats Picked Up', k['Total Chats Picked Up'] || '—', B.COLOR_GREEN],
    ['Missed Chats', k['Missed Chats'] || 0, B.COLOR_RED],
    ['Moved to CRM', k['Chats Moved to CRM'] || '—', B.COLOR_BLUE],
    ['Response < 30 sec', (k['Chats Answered Under 30 sec'] !== undefined && k['Total Chats (Response Time)'])
        ? Math.round((k['Chats Answered Under 30 sec'] / k['Total Chats (Response Time)']) * 1000) / 10 + '%' : '—', B.COLOR_GREEN],
    ['Closed Chats', k['Closed Chats'] !== undefined ? k['Closed Chats'] : '—', B.COLOR_NAVY],
    ['Active Operators (Avg)', k['Active Operators (Avg)'] !== undefined ? k['Active Operators (Avg)'] : '—', B.COLOR_BLUE],
    ['CSAT (Good Rating)', data.csat.scorePct !== null ? data.csat.scorePct + '%' : 'No ratings', data.csat.scorePct === null ? B.COLOR_GREY : B.COLOR_GREEN]
  ];
  const kpiStartRow = row;
  kpiList.forEach(function(kpi, i) {
    const c = 1 + (i % 3) * 3;
    const r = kpiStartRow + Math.floor(i / 3) * 3;
    sh.getRange(r, c, 2, 1).merge().setBackground(kpi[2]);
    sh.getRange(r, c + 1, 1, 2).merge().setValue(kpi[0]).setFontSize(9).setFontColor(B.COLOR_GREY)
      .setBackground('#F8FAFF').setWrap(true).setVerticalAlignment('bottom');
    sh.getRange(r + 1, c + 1, 1, 2).merge().setValue(kpi[1]).setFontSize(20).setFontWeight('bold')
      .setFontColor(B.COLOR_NAVY).setBackground('#F8FAFF').setVerticalAlignment('top');
  });
  row = kpiStartRow + 13;

  // ---- CSAT breakdown -----------------------------------------------------
  if (data.csat.total > 0) {
    sh.getRange(row, 1).setValue('Chat Satisfaction (' + data.csat.total + ' rated)').setFontSize(11).setFontWeight('bold').setFontColor(B.COLOR_NAVY);
    row++;
    sh.getRange(row, 1, 1, 3).setValues([['Good', 'Ok', 'Bad']]).setFontWeight('bold');
    sh.getRange(row + 1, 1, 1, 3).setValues([[data.csat.good, data.csat.ok, data.csat.bad]]);
    sh.getRange(row, 1).setFontColor(B.COLOR_GREEN);
    sh.getRange(row, 2).setFontColor(B.COLOR_AMBER);
    sh.getRange(row, 3).setFontColor(B.COLOR_RED);
    row += 3;
  } else {
    sh.getRange(row, 1, 1, 8).merge().setValue('No chat ratings were recorded this ' + data.periodWord + '.')
      .setFontColor(B.COLOR_GREY).setFontStyle('italic');
    row += 2;
  }

  if (data.topics.unmappedTags.length) {
    sh.getRange(row, 1, 1, 8).merge()
      .setValue('Note: ' + data.topics.unmappedTags.length + ' genuinely new/unrecognized tag(s) — not matched by any rule (this is different from the normal "Other Flow" category, which is handled automatically). Add an override in "Source Mapping" if these should count elsewhere: ' + data.topics.unmappedTags.join(', '))
      .setFontColor('#B54708').setBackground('#FFFAEB').setWrap(true);
    sh.setRowHeight(row, 34);
    row += 2;
  }

  // ---- Source tables (Website + WhatsApp) --------------------------------
  row = writeChannelTable_(sh, row, data, 'website', 'Website — Lead Source Breakdown', B.COLOR_BLUE);
  row += 1;
  row = writeChannelTable_(sh, row, data, 'whatsapp', 'WhatsApp — Lead Source Breakdown', B.COLOR_WHATSAPP);
  row += 1;

  // ---- Comparison chart ---------------------------------------------------
  const chartHeaderRow = row;
  const chartRows = [['Source', 'Website', 'WhatsApp']].concat(
    CONFIG.BUCKET_ORDER.map(function(bucket) {
      const b = data.topics.buckets[bucket] || { website: 0, whatsapp: 0 };
      return [bucket, b.website, b.whatsapp];
    })
  );
  sh.getRange(chartHeaderRow, 1, chartRows.length, 3).setValues(chartRows);
  const chartRange = sh.getRange(chartHeaderRow, 1, chartRows.length, 3);
  const chart = sh.newChart()
    .asColumnChart()
    .addRange(chartRange)
    .setNumHeaders(1)
    .setPosition(chartHeaderRow, 5, 0, 0)
    .setOption('title', 'Leads by Source — Website vs WhatsApp')
    .setOption('titleTextStyle', { color: B.COLOR_NAVY, fontSize: 13, bold: true })
    .setOption('colors', [B.COLOR_BLUE, B.COLOR_WHATSAPP])
    .setOption('legend', { position: 'top' })
    .setOption('width', 620)
    .setOption('height', 340)
    .build();
  sh.insertChart(chart);
  row = chartHeaderRow + chartRows.length + 18; // leave room for the chart

  // ---- Glossary -------------------------------------------------------
  sh.getRange(row, 1).setValue('Glossary — what each source means').setFontSize(12).setFontWeight('bold').setFontColor(B.COLOR_NAVY);
  row++;
  CONFIG.BUCKET_ORDER.forEach(function(bucket) {
    sh.getRange(row, 1).setValue(bucket).setFontWeight('bold').setFontColor(B.COLOR_NAVY);
    sh.getRange(row, 2, 1, 6).merge().setValue(CONFIG.BUCKET_DESCRIPTIONS[bucket] || '').setFontColor(B.COLOR_GREY).setWrap(true);
    row++;
  });
  row++;
  sh.getRange(row, 1, 1, 8).merge().setValue(
    'Trend column: shows how each source changed compared to your last report of the same type ' +
    '(Weekly compared to Weekly, Monthly compared to Monthly). It shows a dash (—) until you\'ve ' +
    'sent a second report of that type — there is nothing to compare the very first report against.'
  ).setFontStyle('italic').setFontColor(B.COLOR_GREY).setWrap(true);

  sh.autoResizeColumns(1, 4);
}

function writeChannelTable_(sh, row, data, channelKey, title, headerColor) {
  const B = CONFIG.BRAND;
  sh.getRange(row, 1).setValue(title).setFontSize(13).setFontWeight('bold').setFontColor(B.COLOR_NAVY);
  row++;
  const headers = ['Source', 'Count', 'Share of Channel', 'vs Last ' + data.periodWord];
  sh.getRange(row, 1, 1, 4).setValues([headers]).setFontWeight('bold').setFontColor('#FFFFFF').setBackground(headerColor);
  row++;
  const tableStart = row;
  const total = data.topics.totals[channelKey] || 0;

  CONFIG.BUCKET_ORDER.forEach(function(bucket) {
    const count = (data.topics.buckets[bucket] && data.topics.buckets[bucket][channelKey]) || 0;
    const share = total ? count / total : 0;
    const delta = bucketDelta_(data, bucket, channelKey);
    sh.getRange(row, 1, 1, 4).setValues([[bucket, count, share, delta === null ? '—' : (delta >= 0 ? '▲ ' : '▼ ') + Math.abs(delta) + '%']]);
    if (delta !== null) sh.getRange(row, 4).setFontColor(delta >= 0 ? B.COLOR_GREEN : B.COLOR_RED);
    else sh.getRange(row, 4).setFontColor(B.COLOR_GREY).setFontStyle('italic');
    row++;
  });
  const tableEnd = row - 1;
  sh.getRange(row, 1, 1, 4).setValues([['Total', total, total ? 1 : 0, '']]).setFontWeight('bold').setBackground(B.COLOR_BLUE_LIGHT);
  sh.getRange(tableStart, 3, tableEnd - tableStart + 2, 1).setNumberFormat('0.0%');

  const tableRange = sh.getRange(tableStart - 1, 1, tableEnd - tableStart + 3, 4);
  tableRange.setBorder(true, true, true, true, true, true, '#D0D5DD', SpreadsheetApp.BorderStyle.SOLID);
  try { sh.getRange(tableStart, 1, tableEnd - tableStart + 1, 4).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false); } catch (e) {}

  return row + 1;
}
