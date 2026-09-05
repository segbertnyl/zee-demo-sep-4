/**
 * NYL360 Copy Sheet Receiver
 * Deploy as: Web app → Execute as: Me → Who has access: Anyone
 *
 * Paste this entire file into Extensions → Apps Script in the Google Sheet,
 * then Deploy → New deployment → Web app. Copy the URL into .env as SHEET_URL.
 */

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents)
    const ss = SpreadsheetApp.getActiveSpreadsheet()

    // Write to "Copy" tab — create it if it doesn't exist yet
    let sheet = ss.getSheetByName('Copy')
    if (!sheet) {
      sheet = ss.insertSheet('Copy')
      // Move it to the first position
      ss.setActiveSheet(sheet)
      ss.moveActiveSheet(1)
    }

    sheet.clearContents()

    if (payload.rows && payload.rows.length > 0) {
      sheet.getRange(1, 1, payload.rows.length, payload.rows[0].length).setValues(payload.rows)

      // Freeze header row
      sheet.setFrozenRows(1)

      // Bold the header row
      sheet.getRange(1, 1, 1, payload.rows[0].length).setFontWeight('bold')
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true, rows: payload.rows.length - 1 })).setMimeType(
      ContentService.MimeType.JSON,
    )
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.message })).setMimeType(
      ContentService.MimeType.JSON,
    )
  }
}

// Lets you test the deployment is live by visiting the URL in a browser
function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, message: 'NYL360 copy receiver is live' }),
  ).setMimeType(ContentService.MimeType.JSON)
}
