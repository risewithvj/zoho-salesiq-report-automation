<div align="center">

# 💬 Zoho SalesIQ Chatbot Report Automation — Website + WhatsApp + Google Sheets + Apps Script

### Turn your Zoho SalesIQ Website & WhatsApp chatbot exports into branded, auto-emailed Weekly & Monthly lead-source reports — zero manual work, zero cost, 100% Google Sheets + Apps Script.

[![Made with Google Apps Script](https://img.shields.io/badge/Made%20with-Google%20Apps%20Script-4285F4?style=flat-square&logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853?style=flat-square&logo=googlesheets&logoColor=white)](https://sheets.google.com)
[![Zoho SalesIQ](https://img.shields.io/badge/Zoho%20SalesIQ-Compatible-F9B21D?style=flat-square)](https://www.zoho.com/salesiq/)
[![License: MIT+Attribution](https://img.shields.io/badge/License-MIT%20%2B%20Attribution-blue?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](./SUPPORT.md)
[![Maintained by risewithvj](https://img.shields.io/badge/Maintained%20by-risewithvj-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/vijayakumarl/)
[![Profile Views](https://komarev.com/ghpvc/?username=risewithvj&color=0A66C2&style=flat-square&label=Profile+Views&base=1500)](https://github.com/risewithvj)

**Keywords:** Zoho SalesIQ Report Automation · Chatbot Lead Report · Website Chatbot Analytics · WhatsApp Chatbot Report · Google Sheets Chatbot Dashboard · Apps Script Email Automation · Lead Source Report · Zoho SalesIQ Google Sheets Integration · Chatbot KPI Dashboard

<br>

<!-- REPLACE THE LINK BELOW with your own ready-to-copy Google Sheet template link -->
[![Get the Ready-Built Google Sheet](https://img.shields.io/badge/📊_Get_the_Ready--Built_Google_Sheet-Click_to_Copy_Template-0362FC?style=for-the-badge)](#)
<!-- Paste your published Google Sheet template link in place of the # above -->

[![Star this repo](https://img.shields.io/github/stars/risewithvj/salesiq-chatbot-report-automation?style=for-the-badge&color=FFD700)](https://github.com/risewithvj)
[![Report an Issue](https://img.shields.io/badge/Report_an_Issue-Contact_Creator-E5484D?style=for-the-badge)](https://github.com/risewithvj)
[![Email Support](https://img.shields.io/badge/Email_Support-risewithvj%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:risewithvj@gmail.com)

</div>

---

## What this is

If your team exports **Zoho SalesIQ Website & WhatsApp chatbot data** every week and manually builds a source-breakdown table (Sales / Support / Other — Website vs. WhatsApp counts) to email leadership — this replaces that entire manual process.

Drop your two Zoho SalesIQ exports (Operator Report + Brand Report) into a Drive folder. This system does the rest:

- Reads both `.xlsx` exports directly from Google Drive — no copy-pasting into cells
- Auto-classifies every chatbot tag into your own source categories (fully customizable — not hardcoded to any one business)
- Splits every source by channel — Website vs. WhatsApp — automatically, from Zoho's own tag naming convention
- Builds an in-sheet dashboard with a real native chart, KPI cards, and a CSAT satisfaction breakdown
- Auto-writes a plain-English insight line and a "Biggest Mover" callout each period
- Sends a branded, mobile-responsive HTML email report automatically
- Runs itself on schedule — **every Sunday** (weekly, Sunday–Saturday period) and **the 1st of every month** (monthly)
- Handles brand-new, never-seen chatbot tags automatically — flagged, never silently dropped
- 100% Google Sheets + Apps Script — no paid tools, no external hosting, no servers

---

## Preview

> Add screenshots of your own dashboard/email here once you've customized it —
> a picture converts way better than a wall of text.

| In-Sheet Dashboard | Emailed HTML Report |
|---|---|
| _add screenshot_ | _add screenshot_ |

---

## Table of Contents

- [Features](#features)
- [How it works](#how-it-works)
- [Quick Start](#quick-start)
- [Customizing your branding and source categories](#customizing-your-branding-and-source-categories)
- [Understanding the Zoho SalesIQ exports](#understanding-the-zoho-salesiq-exports)
- [Source Mapping — handling new chatbot tags](#source-mapping--handling-new-chatbot-tags)
- [FAQ & Troubleshooting](#faq--troubleshooting)
- [Tech stack](#tech-stack)
- [Roadmap](#roadmap)
- [Support & Contact](#support--contact)
- [License](#license)

---

## Features

| Feature | Details |
|---|---|
| **Direct Drive ingestion** | Reads `Operator_Reports.xlsx` and `Brand_Reports.xlsx` straight from a Drive folder — replace the two files each period, nothing to paste |
| **Fully customizable source categories** | Not tied to any one business's chatbot menu — edit `SOURCE_RULES` in `Config.gs` or use the no-code "Source Mapping" sheet tab |
| **Website + WhatsApp channel split** | Automatically detects channel from Zoho's own tag naming convention |
| **Self-healing parser** | Automatically detects and skips stray footer/header rows in Zoho's exports |
| **New/unrecognized tag handling** | A genuinely new chatbot tag is flagged (not dropped, not silently guessed) — normal "Other" tags are handled automatically |
| **Native chart** | Website-vs-WhatsApp column chart embedded directly in the Sheet dashboard |
| **CSAT breakdown** | Good/Ok/Bad chat satisfaction visual, wherever ratings exist for the period |
| **Auto-written insights** | A plain-English summary line plus a "Biggest Mover" callout, generated fresh every period |
| **Branded HTML email** | Rounded KPI cards, color-coded stats, progress bars, your logo, your brand colors |
| **Mobile-responsive email** | Table-based HTML built for Gmail/Outlook/Apple Mail compatibility, tested down to phone width |
| **Fully automatic scheduling** | Time-based triggers — Sunday 10 AM weekly, 1st-of-month 10 AM monthly |
| **Optional privacy redaction** | Scrub any name/email (e.g. a shared login) from every report automatically |
| **Zero cost, zero hosting** | Runs entirely inside your own Google account — no external server or subscription |

---

## How it works

```
Zoho SalesIQ (Operator Report + Brand Report)
      |  (export both as .xlsx)
      v
Google Drive "Raw Data" folder
      |  (you replace the 2 files each period -- that's the only manual step)
      v
Apps Script Parser  --->  classifies every tag into your source categories,
      |                    using "Source Mapping" + SOURCE_RULES in Config.gs
      |
      +--->  "Weekly/Monthly Dashboard" tab   (native chart, KPI cards, CSAT)
      |
      +--->  Branded HTML email  --->  sent via Gmail to "Report Config" recipients
                                        (automatically, on schedule)
```

---

## Quick Start

### 1. Create your Google Sheet
Go to [sheets.google.com](https://sheets.google.com) → Blank spreadsheet.

### 2. Add the Apps Script code
In the Sheet: **Extensions ▸ Apps Script**. Delete the default file content.

Create each of these files (drop the leading number and `.gs` when naming — e.g. `1_Config.gs` becomes a file literally named `Config`), and paste in the matching content from the [`apps-script/`](./apps-script) folder, **in this order**:

| # | File name to create | Source file |
|---|---|---|
| 0 | `Integrity` | [`0_Integrity.gs`](./apps-script/0_Integrity.gs) |
| 1 | `Config` | [`1_Config.gs`](./apps-script/1_Config.gs) |
| 2 | `Logo` | [`2_Logo.gs`](./apps-script/2_Logo.gs) |
| 3 | `SetupSheets` | [`3_SetupSheets.gs`](./apps-script/3_SetupSheets.gs) |
| 4 | `DriveSource` | [`4_DriveSource.gs`](./apps-script/4_DriveSource.gs) |
| 5 | `Parser` | [`5_Parser.gs`](./apps-script/5_Parser.gs) |
| 6 | `Dashboard` | [`6_Dashboard.gs`](./apps-script/6_Dashboard.gs) |
| 7 | `EmailTemplate` | [`7_EmailTemplate.gs`](./apps-script/7_EmailTemplate.gs) |
| 8 | `Send` | [`8_Send.gs`](./apps-script/8_Send.gs) |
| 9 | `Triggers` | [`9_Triggers.gs`](./apps-script/9_Triggers.gs) |

**Tip:** paste and save (Ctrl+S) one file at a time, checking for a red error marker before moving to the next — this makes any copy/paste issue instantly obvious instead of hunting through all 10 files at the end.

### 3. Create your Drive folder
Create a folder in Google Drive (e.g. "Raw Data") to hold your two Zoho SalesIQ exports. Open it and copy the folder ID out of the URL:
`https://drive.google.com/drive/folders/`**`THIS_PART_IS_THE_FOLDER_ID`**

### 4. Configure `Config.gs`
- Set `DRIVE.FOLDER_ID` to the folder ID from Step 3.
- Set `BRAND.NAME` / `BRAND.TAGLINE` to your own company.
- Set `SOURCE_RULES` / `BUCKET_ORDER` to match your own chatbot's tag names (see [Customizing](#customizing-your-branding-and-source-categories) below) — this is the #1 thing to edit.

### 5. Authorize the script
In the Apps Script editor, select `onOpen` from the function dropdown at the top → click **Run**. Approve the permissions prompt (click through "Advanced" → "Go to project (unsafe)" → "Allow" — this is normal for your own private script).

### 6. Enable the Drive API service
Left sidebar → **Services** → **+** → find **Drive API** → **Add** (defaults: Identifier `Drive`, Version `v3`). This is required — the script can't read your exports without it.

### 7. Initialize the sheet structure
Back in the Sheet, refresh the page. A new **SalesIQ Reports** menu appears.
Click **SalesIQ Reports ▸ 1. Initialize Sheet Structure**.

This creates 10 tabs: `Report Config`, `Weekly Chat Topics Raw`, `Weekly KPI Snapshot`, `Weekly Dashboard`, `Monthly Chat Topics Raw`, `Monthly KPI Snapshot`, `Monthly Dashboard`, `Source Mapping`, `Report History`, `Support & Credits`.

### 8. Configure it
- **Report Config** tab: set your Company Name, recipient emails, sender display name.
- Upload your two Zoho SalesIQ exports (named to match `Config.gs`'s `DRIVE.OPERATOR_FILE_NAME` / `DRIVE.BRAND_FILE_NAME`, default `Operator_Reports.xlsx` / `Brand_Reports.xlsx`) into your Drive folder.

### 9. Test it
- **SalesIQ Reports ▸ Build Weekly Dashboard Now** — check the dashboard tab.
- **SalesIQ Reports ▸ Send Weekly Report Now** — check your inbox for the real email.

### 10. Turn on autopilot
**SalesIQ Reports ▸ 2. Install Automatic Schedule** — from now on it sends itself every Sunday ~10 AM and the 1st of every month ~10 AM, using whatever is currently sitting in your Drive folder.

---

## Customizing your branding and source categories

Everything visual and structural lives in one place — edit the top of `Config.gs`:

```javascript
BRAND: {
  NAME: 'Your Company Name',
  TAGLINE: 'Your Tagline Here',
  COLOR_HEADER: '#0362FC',
  ...
}
```

**The #1 thing to customize — your source categories.** This template ships with generic example categories (Sales Inquiry / Support Inquiry / General Inquiry / Other). Your own Zoho SalesIQ chatbot has its own menu options with its own tag names. Edit `SOURCE_RULES` and `BUCKET_ORDER` in `Config.gs`:

```javascript
SOURCE_RULES: [
  { bucket: 'Sales Inquiry',   keywords: ['sales', 'pricing', 'quote', 'demo'] },
  { bucket: 'Support Inquiry', keywords: ['support', 'help', 'issue', 'complaint'] },
  { bucket: 'Other',           keywords: ['other'] }
],
BUCKET_ORDER: ['Sales Inquiry', 'Support Inquiry', 'Other'],
```

Prefer a no-code option? Leave `Config.gs` alone and use the in-sheet **"Source Mapping"** tab instead — map exact tag text to a bucket without ever touching code. Overrides there always win over the keyword rules.

**To use your own logo:** convert your logo PNG to base64 ([base64-image.de](https://www.base64-image.de/) or any base64 encoder), then replace the `LOGO_BASE64` constant in `Logo.gs` with your string. The email embeds it as an inline attachment (`cid:`), so it works with no external image hosting.

---

## Understanding the Zoho SalesIQ exports

This template reads two exports from Zoho SalesIQ, both placed in the same Drive folder:

| File | Tabs used |
|---|---|
| **Operator Report** (`Operator_Reports.xlsx`) | `Chat topics and performance` (the tag/count data), `KPIs`, `Chat actions`, `Feedback and Rating`, `Initial response time` |
| **Brand Report** (`Brand_Reports.xlsx`) | `KPIs`, `Session bounce` |

Zoho tags each chat topic with the channel name in the text itself (e.g. `"Sales Query - Website"`, `"Support Query - WhatsApp"`) — the parser detects Website vs. WhatsApp from that automatically. This is a Zoho platform convention, not something you need to configure.

Set the export's **Time Range** filter to match your reporting period (Sunday–Saturday for weekly, the full calendar month for monthly) before exporting — this template doesn't filter dates itself, it reads whatever range the export was generated with.

---

## Source Mapping — handling new chatbot tags

- **A normal "Other" tag appears:** handled automatically, no warning.
- **A genuinely new/unrecognized tag appears:** flagged in a warning banner in both the sheet and the email (not dropped, not silently guessed). Add a row to **Source Mapping** with the exact tag text and the bucket you want it forced into — the override always wins over the keyword rules in `Config.gs`.

---

## FAQ & Troubleshooting

<details>
<summary><b>Apps Script says "No functions" in the dropdown</b></summary>
<br>
A syntax error somewhere broke parsing for the whole project. Paste and save each file one at a time, checking for a red error marker before moving to the next.
</details>

<details>
<summary><b>"An unknown error has occurred, please try again later." when clicking a menu item</b></summary>
<br>
Usually a permissions issue — menu items can't trigger the OAuth consent screen the first time. Run the function directly from the Apps Script editor's Run button once to authorize, then the menu works normally.
</details>

<details>
<summary><b>Same error, but I already authorized</b></summary>
<br>
Check the browser tab URL. If your Apps Script project is a standalone project (created from script.google.com directly, title says "Untitled project," no spreadsheet icon), it can't access the Sheet. Always open Apps Script via <b>Extensions ▸ Apps Script</b> from inside the target Sheet.
</details>

<details>
<summary><b><code>Drive is not defined</code></b></summary>
<br>
The Drive API advanced service isn't enabled. Script editor → Services (+) → add Drive API (Identifier <code>Drive</code>, Version <code>v3</code>).
</details>

<details>
<summary><b>"Could not find [file] in the Raw Data Drive folder"</b></summary>
<br>
Either the file isn't there, or its name doesn't exactly match <code>DRIVE.OPERATOR_FILE_NAME</code> / <code>DRIVE.BRAND_FILE_NAME</code> in <code>Config.gs</code>. When you re-export each period, <b>replace</b> the existing file (don't upload a second copy) — Drive will otherwise create <code>Operator_Reports (1).xlsx</code>, which won't match.
</details>

<details>
<summary><b>Every number is identical to last period, and Trend shows 0% everywhere</b></summary>
<br>
This means the two periods being compared contain the same underlying data — almost always because the Drive files weren't actually replaced with a fresh export before the second send. Check the timestamp shown in cell A1 of "Weekly Chat Topics Raw" to confirm what was last read.
</details>

<details>
<summary><b>A source shows up under "Other" with a warning</b></summary>
<br>
Only happens for a genuinely new, never-seen-before tag — normal "Other" tags (the visitor picking "Other" in your chatbot menu) are handled automatically with no warning. Add an override row in "Source Mapping" if the new tag should count elsewhere.
</details>

<details>
<summary><b>Email corners look sharp instead of rounded</b></summary>
<br>
This template uses <code>&lt;div&gt;</code>-based boxes specifically because <code>border-radius</code> on <code>&lt;table&gt;</code>/<code>&lt;td&gt;</code> elements renders inconsistently in Gmail. If you've customized <code>EmailTemplate.gs</code> and lost the rounded corners, check that box styling is on a <code>&lt;div&gt;</code>, not a table cell.
</details>

<details>
<summary><b>I get a "Code Tampered / Modified" popup</b></summary>
<br>
The creator attribution constants in <code>Integrity.gs</code> were changed or removed. Restore the original <code>CREATOR</code> object, or re-download a fresh copy of that file from this repo.
</details>

---

## Tech stack

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=flat-square&logo=google&logoColor=white)
![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853?style=flat-square&logo=googlesheets&logoColor=white)
![Google Drive](https://img.shields.io/badge/Google%20Drive-4285F4?style=flat-square&logo=googledrive&logoColor=white)
![Gmail API](https://img.shields.io/badge/Gmail%20API-D14836?style=flat-square&logo=gmail&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)

- Google Sheets — data store + in-sheet dashboard
- Google Apps Script (V8 runtime) — all logic, no external server
- Drive Advanced Service — reads `.xlsx` exports directly, no manual paste
- `GmailApp` — email sending via the account owner's own Gmail
- Native Sheets Charts API — Website-vs-WhatsApp column chart
- Pure table-based HTML/CSS — no JS, no external assets (logo is base64-embedded)

---

## Roadmap

- [ ] Direct Zoho SalesIQ API integration (auto-fetch instead of manual Drive upload)
- [ ] Slack/Teams delivery option alongside email
- [ ] Multi-brand support (separate dashboards per Zoho SalesIQ brand)
- [ ] Configurable weekly period (currently fixed Sunday–Saturday)

Have an idea? [Open an issue](https://github.com/risewithvj) or reach out directly — see below.

---

## Support & Contact

<div align="center">

**Built and maintained by Vijaya Kumar L**

[![GitHub](https://img.shields.io/badge/GitHub-risewithvj-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/risewithvj)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-vijayakumarl-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/vijayakumarl/)
[![Email](https://img.shields.io/badge/Email-risewithvj%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:risewithvj@gmail.com)

Found a bug, need help setting this up, or want a custom version for your own chatbot platform?
Reach out — see [`SUPPORT.md`](./SUPPORT.md) for the full support guide.

If this saved you time, a star on the repo goes a long way.

</div>

---

## License

MIT License with an attribution requirement — free to use and customize for your own organization, with creator attribution kept intact. Full terms in [`LICENSE`](./LICENSE).

---

<div align="center">

*Built for teams who'd rather automate a Sunday-morning report than write one.*

</div>
