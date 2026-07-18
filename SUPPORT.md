# Support

## Get help

- **Issues / bugs:** [Open an issue on GitHub](https://github.com/risewithvj) describing what happened, which step you were on, and a screenshot if possible.
- **Setup questions:** Check [`README.md`](./README.md) first (Quick Start, Customizing, and FAQ/Troubleshooting sections) -- most first-time issues are covered there.
- **Direct contact:** risewithvj@gmail.com

## Before opening an issue, please check

1. Did you paste all 10 script files into an Apps Script project opened **from inside the Sheet** (Extensions > Apps Script), not a standalone project at script.google.com? (Standalone projects can't access the spreadsheet and most functions will fail.)
2. Did you run `onOpen` (or any menu item) once directly from the Apps Script editor's Run button first, to grant permissions? Menu items can't trigger the authorization popup themselves the first time.
3. Did you enable the **Drive API** advanced service (Services -> + -> Drive API)? This is required and is not on by default.
4. Did you set `DRIVE.FOLDER_ID` in `Config.gs` to your own Drive folder's ID, and confirm your two Zoho SalesIQ export files are sitting in it with matching names?
5. Have you customized `SOURCE_RULES` / `BUCKET_ORDER` in `Config.gs` (or added rows to the "Source Mapping" sheet tab) to match your own chatbot's tag names? The example categories shipped with this template are placeholders.
6. Is "Report Config" filled in with real recipient email addresses?

## Found this useful?

- Star the repo -- it helps others find it.
- Connect on [LinkedIn](https://www.linkedin.com/in/vijayakumarl/) or follow on [GitHub](https://github.com/risewithvj).
- Consider leaving the attribution footer/credit intact when you deploy your own copy (see [`LICENSE`](./LICENSE)) -- it's how a free, maintained template like this stays worth maintaining.

## Maintainer

**Vijaya Kumar L** (risewithvj)
[GitHub](https://github.com/risewithvj) - [LinkedIn](https://www.linkedin.com/in/vijayakumarl/) - risewithvj@gmail.com
