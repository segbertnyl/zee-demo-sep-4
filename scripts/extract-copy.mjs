// scripts/extract-copy.mjs
import { writeFileSync, existsSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { google } from 'googleapis'
import { HEADERS, SPREADSHEET_ID } from './copy/registry.mjs'
import { csvCell, csvRow } from './copy/utils.mjs'

import { rows as onboardingRows } from './copy/scenes/onboarding.mjs'
import { rows as briefingV55Rows } from './copy/scenes/briefing-v55.mjs'
import { rows as actionBoardRows } from './copy/scenes/action-board.mjs'
import { rows as advisorSegmentRows } from './copy/scenes/advisor-segments.mjs'
import { rows as briefingRows } from './copy/scenes/briefing.mjs'
import { rows as discoveryRows } from './copy/scenes/discovery.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const allRows = [
  ...onboardingRows(),
  ...briefingV55Rows(),
  ...actionBoardRows(),
  ...advisorSegmentRows(),
  ...briefingRows(),
  ...discoveryRows(),
]
  .filter(Boolean)
  .map((row, i) => ({ ...row, ID: i + 1 }))

// Load SHEET_URL from .env if present
const envPath = resolve(__dirname, '../.env')
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .forEach((line) => {
      const [k, ...v] = line.split('=')
      if (k && v.length && !process.env[k.trim()]) {
        process.env[k.trim()] = v.join('=').trim()
      }
    })
}

const SA_PATH = resolve(__dirname, 'service-account.json')

// Summary
const byScene = {}
allRows.forEach((r) => {
  byScene[r.Scene] = (byScene[r.Scene] || 0) + 1
})

if (existsSync(SA_PATH)) {
  // --- Service account path (no browser needed) ---
  const credentials = JSON.parse(readFileSync(SA_PATH, 'utf-8'))
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  const sheets = google.sheets({ version: 'v4', auth })

  // Build the 2D array Sheets API expects
  const matrix = [HEADERS, ...allRows.map((r) => HEADERS.map((h) => String(r[h] ?? '')))]

  // Ensure the "Copy" tab exists — create it if missing
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID })
  const tabNames = meta.data.sheets.map((s) => s.properties.title)
  if (!tabNames.includes('Copy')) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: [{ addSheet: { properties: { title: 'Copy', index: 0 } } }] },
    })
    console.log('  Created "Copy" tab')
  }

  // Clear then write
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Copy',
  })
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Copy!A1',
    valueInputOption: 'RAW',
    requestBody: { values: matrix },
  })

  // Freeze header row + bold it
  const sheetId =
    meta.data.sheets.find((s) => s.properties.title === 'Copy')?.properties.sheetId ??
    meta.data.sheets[0].properties.sheetId
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          updateSheetProperties: {
            properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
            fields: 'gridProperties.frozenRowCount',
          },
        },
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: { userEnteredFormat: { textFormat: { bold: true } } },
            fields: 'userEnteredFormat.textFormat.bold',
          },
        },
      ],
    },
  })

  console.log(`✓ Pushed ${allRows.length - 1} copy rows → Google Sheet / Copy tab`)
} else {
  // --- Fallback: write CSV locally ---
  const csv = [HEADERS.join(','), ...allRows.map(csvRow)].join('\n')
  const outPath = resolve(__dirname, 'copy-export.csv')
  writeFileSync(outPath, csv, 'utf-8')
  console.log(`✓ Exported ${allRows.length} rows → scripts/copy-export.csv`)
  console.log(`  Add scripts/service-account.json to push directly to Google Sheets`)
}

console.log('\nBatch breakdown:')
Object.entries(byScene)
  .sort((a, b) => b[1] - a[1])
  .forEach(([s, n]) => console.log(`  ${s}: ${n} rows`))
