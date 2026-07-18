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
 * EMAIL HTML BUILDER
 * Table-based layout for maximum email-client compatibility. Uses the
 * same Gmail-safe patterns validated across this template family:
 * div-based rounded corners (not <table> border-radius), a white plate
 * behind the logo, nowrap table cells wrapped in an overflow-x scroller.
 * Plain text only, no emoji -- some 4-byte "astral plane" emoji can get
 * corrupted in transit through certain email pipelines.
 *
 * NOTE: the attribution footer line at the bottom of the email
 * ("Report template by ...") is intentionally part of this function's
 * output -- see LICENSE for why this stays in place.
 * =====================================================================
 */

function buildEmailHtml_(data, companyName, generatedBy) {
  const B = CONFIG.BRAND;
  const periodText = formatDate_(data.period.start, 'dd MMM yyyy') + ' – ' + formatDate_(data.period.end, 'dd MMM yyyy');
  const generatedOn = formatDate_(new Date(), 'dd MMM yyyy, hh:mm a');
  const k = data.kpis;

  const deltaTag = function(delta) {
    if (delta === null || delta === undefined) return '<span style="color:' + B.COLOR_GREY + ';font-size:11px;">&mdash;</span>';
    const color = delta >= 0 ? B.COLOR_GREEN : B.COLOR_RED;
    const arrow = delta >= 0 ? '&#9650;' : '&#9660;';
    return '<span style="color:' + color + ';font-size:11px;font-weight:bold;">' + arrow + ' ' + Math.abs(delta) + '%</span>';
  };
  // For KPI cards specifically: show nothing extra when there's no prior period to
  // compare against yet, rather than a distracting dash next to every number.
  const deltaSuffix = function(delta) {
    return (delta === null || delta === undefined) ? '' : ' ' + deltaTag(delta);
  };

  const kpiCard = function(label, value, color) {
    return '' +
      '<td class="kpi-cell" width="33.33%" style="padding:6px;" valign="top">' +
        '<div style="background:#FFFFFF;border:1px solid #E4E7EC;border-top:3px solid ' + color + ';border-radius:14px;padding:10px 14px;height:64px;box-sizing:border-box;overflow:hidden;">' +
          '<div style="height:14px;overflow:hidden;font-size:11px;line-height:14px;white-space:nowrap;text-overflow:ellipsis;color:' + B.COLOR_GREY + ';font-family:Arial,Helvetica,sans-serif;margin-bottom:5px;">' + label + '</div>' +
          '<div style="height:24px;overflow:hidden;font-size:19px;line-height:24px;font-weight:bold;color:' + B.COLOR_NAVY + ';font-family:Arial,Helvetica,sans-serif;white-space:nowrap;">' + value + '</div>' +
        '</div>' +
      '</td>';
  };

  const responseRate = (k['Chats Answered Under 30 sec'] !== undefined && k['Total Chats (Response Time)'])
    ? Math.round((k['Chats Answered Under 30 sec'] / k['Total Chats (Response Time)']) * 1000) / 10 + '%' : '—';

  const kpiRow1 = '<tr>' +
    kpiCard('Total Leads', data.topics.totals.grand + deltaSuffix(data.deltaTotals.grand), B.COLOR_HEADER) +
    kpiCard('Website Leads', data.topics.totals.website + deltaSuffix(data.deltaTotals.website), B.COLOR_BLUE) +
    kpiCard('WhatsApp Leads', data.topics.totals.whatsapp + deltaSuffix(data.deltaTotals.whatsapp), B.COLOR_WHATSAPP) +
    '</tr>';
  const kpiRow2 = '<tr>' +
    kpiCard('Website Visitors', k['Total Website Visitors'] || '—', B.COLOR_NAVY) +
    kpiCard('Bounce Rate', (k['Bounce Rate %'] !== undefined ? k['Bounce Rate %'] + '%' : '—'), B.COLOR_AMBER) +
    kpiCard('Response &lt; 30 sec', responseRate, B.COLOR_GREEN) +
    '</tr>';
  const kpiRow3 = '<tr>' +
    kpiCard('Chats Picked Up', k['Total Chats Picked Up'] || '—', B.COLOR_GREEN) +
    kpiCard('Missed Chats', k['Missed Chats'] || 0, B.COLOR_RED) +
    kpiCard('Moved to CRM', k['Chats Moved to CRM'] || '—', B.COLOR_BLUE) +
    '</tr>';
  const kpiRow4 = '<tr>' +
    kpiCard('Closed Chats', k['Closed Chats'] !== undefined ? k['Closed Chats'] : '—', B.COLOR_NAVY) +
    kpiCard('Active Operators (Avg)', k['Active Operators (Avg)'] !== undefined ? k['Active Operators (Avg)'] : '—', B.COLOR_BLUE) +
    kpiCard('CSAT (Good Rating)', data.csat.scorePct !== null ? data.csat.scorePct + '%' : 'No ratings', data.csat.scorePct === null ? B.COLOR_GREY : B.COLOR_GREEN) +
    '</tr>';

  const topMoverBox = data.topMover ? (function() {
    const tm = data.topMover;
    const up = tm.delta >= 0;
    const color = up ? B.COLOR_GREEN : B.COLOR_RED;
    const bg = up ? '#EAF9F0' : '#FDECEC';
    const border = up ? '#B7EBCB' : '#F6C9C9';
    return '<tr><td style="padding:0 24px 4px 24px;" class="mobile-pad">' +
      '<div style="background:' + bg + ';border:1px solid ' + border + ';border-radius:12px;padding:10px 16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:' + color + ';">' +
        '<strong>Biggest mover:</strong> "' + escapeHtml_(tm.bucket) + '" (' + tm.channel + ') ' + (up ? 'up' : 'down') + ' <strong>' + Math.abs(tm.delta) + '%</strong> vs last ' + data.periodWord + ' — now ' + tm.count + ' leads.' +
      '</div>' +
    '</td></tr>';
  })() : '';

  const csatSection = data.csat.total > 0 ? (function() {
    const c = data.csat;
    const seg = function(count, color) {
      const pct = Math.max(count > 0 ? 2 : 0, Math.round((count / c.total) * 100));
      return pct > 0 ? '<td style="background:' + color + ';" width="' + pct + '%">&nbsp;</td>' : '';
    };
    return '<tr><td style="padding:8px 24px 4px 24px;" class="mobile-pad">' +
      '<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:' + B.COLOR_NAVY + ';margin-bottom:8px;">Chat Satisfaction (' + c.total + ' rated)</div>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr style="height:14px;">' +
        seg(c.good, B.COLOR_GREEN) + seg(c.ok, B.COLOR_AMBER) + seg(c.bad, B.COLOR_RED) +
      '</tr></table>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
        '<td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:' + B.COLOR_GREEN + ';padding-top:4px;">&#9632; Good ' + c.good + '</td>' +
        '<td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:' + B.COLOR_AMBER + ';padding-top:4px;text-align:center;">&#9632; Ok ' + c.ok + '</td>' +
        '<td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:' + B.COLOR_RED + ';padding-top:4px;text-align:right;">&#9632; Bad ' + c.bad + '</td>' +
      '</tr></table>' +
    '</td></tr>';
  })() : '<tr><td style="padding:8px 24px 4px 24px;" class="mobile-pad">' +
      '<div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:' + B.COLOR_GREY + ';font-style:italic;">No chat ratings were recorded this ' + data.periodWord + '.</div>' +
    '</td></tr>';

  const barCell = function(count, total, color) {
    const pct = total ? Math.max(2, Math.round((count / total) * 100)) : 0;
    return '' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
        '<td style="background:#EEF1F6;border-radius:6px;" height="8">' +
          '<table role="presentation" width="' + pct + '%" cellpadding="0" cellspacing="0"><tr>' +
            '<td style="background:' + color + ';border-radius:6px;" height="8">&nbsp;</td>' +
          '</tr></table>' +
        '</td>' +
      '</tr></table>';
  };

  const channelTable = function(channelKey, title, headerColor) {
    const total = data.topics.totals[channelKey] || 0;
    const rows = CONFIG.BUCKET_ORDER.map(function(bucket, i) {
      const count = (data.topics.buckets[bucket] && data.topics.buckets[bucket][channelKey]) || 0;
      const share = total ? Math.round((count / total) * 1000) / 10 : 0;
      const delta = bucketDelta_(data, bucket, channelKey);
      const zebra = i % 2 === 0 ? '#FFFFFF' : '#F8F7FD';
      return '' +
        '<tr style="background:' + zebra + ';">' +
          '<td style="padding:9px 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:' + B.COLOR_NAVY + ';border-bottom:1px solid #EEF1F6;white-space:nowrap;">' + escapeHtml_(bucket) + '</td>' +
          '<td style="padding:9px 12px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;border-bottom:1px solid #EEF1F6;">' + count + '</td>' +
          '<td style="padding:9px 12px;width:110px;min-width:110px;white-space:nowrap;border-bottom:1px solid #EEF1F6;">' + barCell(count, total, headerColor) +
            '<div style="font-size:10px;color:' + B.COLOR_GREY + ';font-family:Arial,Helvetica,sans-serif;margin-top:3px;text-align:right;">' + share + '%</div></td>' +
          '<td style="padding:9px 12px;text-align:center;white-space:nowrap;border-bottom:1px solid #EEF1F6;">' + deltaTag(delta) + '</td>' +
        '</tr>';
    }).join('');

    return '' +
      '<tr><td style="padding:8px 24px 4px 24px;" class="mobile-pad">' +
        '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:' + B.COLOR_NAVY + ';margin-bottom:10px;">' + title + '</div>' +
      '</td></tr>' +
      '<tr><td style="padding:0 16px 20px 16px;" class="mobile-pad">' +
        '<div style="overflow-x:auto;border:1px solid #EEF1F6;border-radius:12px;">' +
        '<table role="presentation" class="data-table" width="100%" cellpadding="0" cellspacing="0" style="min-width:460px;">' +
          '<tr style="background:' + headerColor + ';">' +
            '<th align="left" style="padding:9px 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#FFFFFF;white-space:nowrap;">Source</th>' +
            '<th style="padding:9px 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#FFFFFF;white-space:nowrap;">Count</th>' +
            '<th style="padding:9px 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#FFFFFF;white-space:nowrap;">Share</th>' +
            '<th style="padding:9px 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#FFFFFF;white-space:nowrap;">Trend</th>' +
          '</tr>' +
          rows +
          '<tr style="background:' + B.COLOR_BLUE_LIGHT + ';">' +
            '<td style="padding:9px 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:' + B.COLOR_NAVY + ';white-space:nowrap;">Total</td>' +
            '<td style="padding:9px 12px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;white-space:nowrap;">' + total + '</td>' +
            '<td style="padding:9px 12px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;white-space:nowrap;">100%</td>' +
            '<td style="padding:9px 12px;text-align:center;white-space:nowrap;">' + deltaTag(channelKey === 'website' ? data.deltaTotals.website : data.deltaTotals.whatsapp) + '</td>' +
          '</tr>' +
        '</table>' +
        '</div>' +
      '</td></tr>';
  };

  const unmappedBanner = data.topics.unmappedTags.length ? (
    '<tr><td style="padding:0 24px 12px 24px;" class="mobile-pad">' +
      '<div style="background:#FFFAEB;border:1px solid #FEDF89;border-radius:12px;padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#B54708;">' +
        '<strong>Note:</strong> ' + data.topics.unmappedTags.length + ' genuinely new/unrecognized tag(s) — not the normal "Other Flow" category (which is handled automatically), but a topic never seen before: ' + escapeHtml_(data.topics.unmappedTags.join(', ')) +
      '</div>' +
    '</td></tr>'
  ) : '';

  const glossaryRows = CONFIG.BUCKET_ORDER.map(function(bucket) {
    return '<tr>' +
      '<td style="padding:6px 12px 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;color:' + B.COLOR_NAVY + ';white-space:nowrap;vertical-align:top;">' + escapeHtml_(bucket) + '</td>' +
      '<td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:' + B.COLOR_GREY + ';">' + escapeHtml_(CONFIG.BUCKET_DESCRIPTIONS[bucket] || '') + '</td>' +
    '</tr>';
  }).join('');

  return '' +
'<!DOCTYPE html><html><head><meta charset="UTF-8">' +
'<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
'<title>' + data.label + ' ' + CONFIG.REPORT_TITLE + '</title>' +
'<style>' +
  'body{margin:0;padding:0;background:' + B.COLOR_BG + ';}' +
  '.wrapper{width:100%;background:' + B.COLOR_BG + ';padding:24px 0;}' +
  '.container{max-width:640px;margin:0 auto;background:#FFFFFF;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(16,24,40,0.08);}' +
  'table{border-collapse:collapse;}' +
  '@media only screen and (max-width:480px){' +
    '.container{width:100% !important;border-radius:0 !important;}' +
    '.kpi-cell{display:block !important;width:100% !important;}' +
    '.data-table th, .data-table td{font-size:12px !important;padding:8px 6px !important;}' +
    '.mobile-pad{padding-left:14px !important;padding-right:14px !important;}' +
  '}' +
'</style></head>' +
'<body>' +
'<div class="wrapper">' +
'<table role="presentation" class="container" width="640" cellpadding="0" cellspacing="0" align="center">' +

  // Header
  '<tr><td style="background:' + B.COLOR_HEADER + ';padding:22px 24px;" class="mobile-pad">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
      '<td valign="middle" width="150">' +
        '<div style="background:#FFFFFF;border-radius:10px;padding:8px 14px;display:inline-block;">' +
          '<img src="cid:brandLogo" width="110" alt="' + companyName + '" style="display:block;border:0;max-width:110px;">' +
        '</div>' +
      '</td>' +
      '<td valign="middle" align="right">' +
        '<div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:20px;padding:3px 10px;font-family:Arial,Helvetica,sans-serif;color:#FFFFFF;font-size:10px;font-weight:bold;letter-spacing:0.5px;margin-bottom:4px;">' + data.label.toUpperCase() + ' REPORT</div>' +
        '<div style="font-family:Arial,Helvetica,sans-serif;color:#FFFFFF;font-size:16px;font-weight:bold;">' + CONFIG.REPORT_TITLE + '</div>' +
        '<div style="font-family:Arial,Helvetica,sans-serif;color:#DCD3F5;font-size:12px;margin-top:2px;">' + periodText + '</div>' +
      '</td>' +
    '</tr></table>' +
  '</td></tr>' +

  // Insight line
  '<tr><td style="padding:16px 24px 4px 24px;" class="mobile-pad">' +
    '<div style="background:#F5F4FB;border:1px solid #E0D9F7;border-radius:12px;padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:12.5px;color:' + B.COLOR_NAVY + ';line-height:1.5;">' +
      escapeHtml_(data.insight) +
    '</div>' +
  '</td></tr>' +

  topMoverBox +

  // KPI section
  '<tr><td style="padding:14px 16px 6px 16px;" class="mobile-pad">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed;">' + kpiRow1 + kpiRow2 + kpiRow3 + kpiRow4 + '</table>' +
  '</td></tr>' +

  csatSection +

  unmappedBanner +
  channelTable('website', 'Website — Lead Source Breakdown', B.COLOR_BLUE) +
  channelTable('whatsapp', 'WhatsApp — Lead Source Breakdown', B.COLOR_WHATSAPP) +

  // Glossary
  '<tr><td style="padding:4px 24px 4px 24px;" class="mobile-pad">' +
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:' + B.COLOR_NAVY + ';margin-bottom:6px;">What each source means</div>' +
  '</td></tr>' +
  '<tr><td style="padding:0 24px 6px 24px;" class="mobile-pad">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + glossaryRows + '</table>' +
  '</td></tr>' +
  '<tr><td style="padding:4px 24px 16px 24px;" class="mobile-pad">' +
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:10.5px;color:' + B.COLOR_GREY + ';font-style:italic;">' +
      'Trend column: shows how each source changed vs. your last report of the same type. Shows a dash (&mdash;) until a second report of that type has been sent — there is nothing to compare the very first report against.' +
    '</div>' +
  '</td></tr>' +

  // Footer
  '<tr><td style="padding:10px 24px 14px 24px;border-top:1px solid #EEF1F6;" class="mobile-pad">' +
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:' + B.COLOR_GREY + ';">' +
      companyName + ' &middot; Website and WhatsApp Chatbot Reporting System' +
      (generatedBy ? ' &middot; Generated by ' + escapeHtml_(generatedBy) : '') + ' : ' + generatedOn +
    '</div>' +
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:9.5px;color:#98A2B3;margin-top:4px;">' +
      'Report template by <a href="' + CREATOR.GITHUB + '" style="color:#98A2B3;text-decoration:underline;">' + CREATOR.NAME + '</a>' +
    '</div>' +
  '</td></tr>' +

'</table>' +
'</div>' +
'</body></html>';
}

function escapeHtml_(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
