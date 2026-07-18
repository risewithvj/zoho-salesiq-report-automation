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
 * PARSER
 * Reads the raw pasted Zoho exports and turns them into the aggregated
 * shape the Dashboard/EmailTemplate builders need.
 * =====================================================================
 */

/**
 * Convenience wrapper for the old "paste it into this sheet" flow — looks
 * up a tab by name in THIS spreadsheet and parses it. Kept for anyone who
 * prefers manual paste over the Drive auto-fetch.
 */
function parseChatTopics_(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  return parseChatTopicsFromSheet_(sheet);
}

/**
 * Reads a "Chat topics and performance" tab (Tag | Chats | ... — Zoho's
 * export header) from any Sheet object, whether it's a tab in this
 * spreadsheet or a tab in a temp spreadsheet opened from Drive.
 * Returns:
 * {
 *   buckets: { bucketName: { website: n, whatsapp: n } },
 *   totals:  { website: n, whatsapp: n, grand: n },
 *   unmappedTags: [ 'Raw Tag Text (n chats)' ],
 *   rawTagCount: n
 * }
 */
function parseChatTopicsFromSheet_(sheet) {
  const result = {
    buckets: {},
    totals: { website: 0, whatsapp: 0, grand: 0 },
    unmappedTags: [],
    rawTagCount: 0
  };
  CONFIG.BUCKET_ORDER.concat([CONFIG.OTHER_BUCKET]).forEach(function(b) {
    if (!result.buckets[b]) result.buckets[b] = { website: 0, whatsapp: 0 };
  });

  if (!sheet) return result;
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return result;

  // Find the header row (the one containing "Tag" and "Chats")
  let headerRow = -1, tagCol = -1, chatsCol = -1;
  for (let r = 0; r < values.length; r++) {
    const row = values[r].map(function(c) { return String(c).trim().toLowerCase(); });
    const tCol = row.indexOf('tag');
    const cCol = row.indexOf('chats');
    if (tCol !== -1 && cCol !== -1) {
      headerRow = r; tagCol = tCol; chatsCol = cCol;
      break;
    }
  }
  if (headerRow === -1) return result; // nothing pasted yet, or header not found

  const overrideMap = readSourceMappingOverrides_();

  for (let r = headerRow + 1; r < values.length; r++) {
    const row = values[r];
    const tagRaw = row[tagCol];
    if (tagRaw === undefined || tagRaw === null || String(tagRaw).trim() === '') continue;
    const tag = String(tagRaw).trim();
    const tagLower = tag.toLowerCase();

    // Stop at the Zoho export's own footer block ("Conditions" / "Portal" rows)
    if (tagLower === 'conditions' || tagLower === 'portal' || tagLower === 'tag') break;

    // Safety-net redaction: never let a row mentioning the ex-employee
    // account through, regardless of which column it's in.
    if (rowContainsRedactedTerm_(row)) continue;

    const chats = Number(row[chatsCol]) || 0;
    if (chats === 0) continue; // skip zero-volume tags, nothing to report

    result.rawTagCount++;
    const channel = detectChannel_(tag);
    const classified = classifyTag_(tag, overrideMap);
    const bucket = classified.bucket;

    if (!result.buckets[bucket]) result.buckets[bucket] = { website: 0, whatsapp: 0 };
    if (channel === 'WhatsApp') {
      result.buckets[bucket].whatsapp += chats;
      result.totals.whatsapp += chats;
    } else {
      result.buckets[bucket].website += chats;
      result.totals.website += chats;
    }
    result.totals.grand += chats;

    // Only flag tags that matched NO rule and NO override at all — a
    // genuinely new/unrecognized topic tag. Normal "Other Lead"/"Other
    // Query" tags match the explicit "other" rule and are never flagged;
    // "Other Flow" is a real chatbot menu option, not an error state.
    if (!classified.matched) {
      result.unmappedTags.push(tag + ' (' + chats + ')');
    }
  }

  return result;
}

/**
 * Reads the "Source Mapping" sheet's manual override rows into a
 * lower-cased tag -> bucket lookup map. Blank Bucket cells are ignored.
 */
function readSourceMappingOverrides_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SOURCE_MAPPING);
  const map = {};
  if (!sheet) return map;
  const values = sheet.getDataRange().getValues();
  for (let r = 1; r < values.length; r++) { // row 0 = header
    const tag = String(values[r][0] || '').trim();
    const bucket = String(values[r][1] || '').trim();
    if (tag && bucket) map[tag.toLowerCase()] = bucket;
  }
  return map;
}

function detectChannel_(tag) {
  const t = tag.toLowerCase();
  if (t.indexOf(CONFIG.CHANNEL_KEYWORDS.WHATSAPP) !== -1) return 'WhatsApp';
  if (t.indexOf(CONFIG.CHANNEL_KEYWORDS.WEBSITE) !== -1) return 'Website';
  return CONFIG.DEFAULT_CHANNEL;
}

function classifyTag_(tag, overrideMap) {
  const tagLower = tag.toLowerCase();
  if (overrideMap && overrideMap[tagLower]) return { bucket: overrideMap[tagLower], matched: true };

  for (let i = 0; i < CONFIG.SOURCE_RULES.length; i++) {
    const rule = CONFIG.SOURCE_RULES[i];
    for (let k = 0; k < rule.keywords.length; k++) {
      if (tagLower.indexOf(rule.keywords[k]) !== -1) return { bucket: rule.bucket, matched: true };
    }
  }
  return { bucket: CONFIG.OTHER_BUCKET, matched: false };
}

function rowContainsRedactedTerm_(row) {
  for (let c = 0; c < row.length; c++) {
    const cell = String(row[c] || '').toLowerCase();
    for (let t = 0; t < CONFIG.REDACT_TERMS.length; t++) {
      if (cell.indexOf(CONFIG.REDACT_TERMS[t]) !== -1) return true;
    }
  }
  return false;
}

/**
 * Reads the "KPI Snapshot" tab: a fixed Label | Value two-column form.
 * Returns a plain { 'Total Website Visitors': 123456, ... } object with
 * numbers parsed where possible; text values (e.g. "00:05:52") pass
 * through as-is. Any row mentioning the redacted account is skipped.
 */
function parseKpiSnapshot_(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const kpis = {};
  if (!sheet) return kpis;
  const values = sheet.getDataRange().getValues();
  for (let r = 1; r < values.length; r++) { // row 0 = header
    const row = values[r];
    const label = String(row[0] || '').trim();
    if (!label) continue;
    if (rowContainsRedactedTerm_(row)) continue;
    const rawVal = row[1];
    const num = Number(rawVal);
    kpis[label] = (rawVal !== '' && !isNaN(num)) ? num : String(rawVal || '').trim();
  }
  return kpis;
}
