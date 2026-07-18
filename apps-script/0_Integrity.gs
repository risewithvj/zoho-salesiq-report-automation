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
 *
 *  This file defines the creator/attribution constants and a runtime
 *  integrity check. If the attribution constants below are altered or
 *  removed, the script will refuse to run and will show a popup
 *  directing the user to contact the creator instead. This is a
 *  good-faith attribution safeguard, not unbreakable protection --
 *  anyone with edit access to Apps Script technically can bypass it.
 *  Please don't; it costs you nothing to leave it in place and it's
 *  how free templates like this stay maintained.
 * =====================================================================
 */

const CREATOR = {
  NAME: 'Vijaya Kumar L',
  NICKNAME: 'risewithvj',
  GITHUB: 'https://github.com/risewithvj',
  LINKEDIN: 'https://www.linkedin.com/in/vijayakumarl/',
  EMAIL: 'risewithvj@gmail.com'
};

/**
 * Verifies the attribution constants above have not been altered.
 * Call this at the start of every user-facing entry point (menu items,
 * onOpen, send functions). Throws and shows a blocking popup with a
 * clickable contact button if the signature has been tampered with
 * or removed.
 */
function verifyIntegrity_() {
  const valid =
    CREATOR && typeof CREATOR === 'object' &&
    CREATOR.NAME === 'Vijaya Kumar L' &&
    CREATOR.NICKNAME === 'risewithvj' &&
    CREATOR.GITHUB === 'https://github.com/risewithvj' &&
    CREATOR.LINKEDIN === 'https://www.linkedin.com/in/vijayakumarl/' &&
    CREATOR.EMAIL === 'risewithvj@gmail.com';

  if (!valid) {
    showTamperDialog_();
    throw new Error('Integrity check failed -- attribution constants altered. See https://github.com/risewithvj');
  }
  return true;
}

/**
 * Blocking popup shown when the integrity check fails. Uses an HTML
 * modal (not a plain alert) so it can include an actual clickable
 * button that opens the creator's GitHub in a new tab.
 */
function showTamperDialog_() {
  const html = HtmlService.createHtmlOutput(
    '<div style="font-family:Arial,Helvetica,sans-serif;padding:22px;text-align:center;">' +
      '<div style="font-size:32px;line-height:1;margin-bottom:10px;">&#9888;</div>' +
      '<div style="font-size:15px;font-weight:bold;color:#B42318;margin-bottom:10px;">Code Modified &mdash; Not Allowed</div>' +
      '<div style="font-size:12.5px;color:#344054;line-height:1.6;margin-bottom:20px;">' +
        'The creator attribution in this template has been changed or removed.<br>' +
        'This template is free to use on the condition that attribution stays intact.<br>' +
        'Please restore the original <code>Integrity</code> file, or grab a fresh copy from the source repository.' +
      '</div>' +
      '<a href="' + CREATOR.GITHUB + '" target="_blank" rel="noopener" ' +
        'style="display:inline-block;background:#1657FF;color:#FFFFFF;text-decoration:none;' +
        'font-weight:bold;font-size:13px;padding:11px 24px;border-radius:8px;">' +
        'Contact Creator / Get Original Template' +
      '</a>' +
      '<div style="font-size:11px;color:#98A2B3;margin-top:14px;">' + CREATOR.EMAIL + '</div>' +
    '</div>'
  ).setWidth(400).setHeight(260);

  try {
    SpreadsheetApp.getUi().showModalDialog(html, 'Code Tampered / Modified');
  } catch (e) {
    // No UI context available (e.g. running from an automatic time-based
    // trigger) -- log it instead so it still shows up in execution history.
    Logger.log(
      'Integrity check failed -- attribution constants altered. ' +
      'Contact: ' + CREATOR.GITHUB + ' / ' + CREATOR.EMAIL
    );
  }
}

/** Builds the standard "powered by" credit line used in the Sheet and email. */
function creatorCreditText_() {
  return CREATOR.NAME + ' (' + CREATOR.NICKNAME + ')  \u00B7  ' + CREATOR.GITHUB + '  \u00B7  ' + CREATOR.LINKEDIN;
}
