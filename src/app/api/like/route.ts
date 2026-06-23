// src/app/api/like/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID as string
const SHEET_NAME = 'favorites'

function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

// Urutan kolom di sheet: A=USER_EMAIL, B=LOGO_ID, C=LOGO_TITLE, D=TIMESTAMP

// GET: ambil semua rows dari sheet favorites
export async function GET() {
  try {
    const sheets = getSheets()
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:D`,
    })
    // Skip header row (baris pertama)
    const allRows = res.data.values || []
    const rows = allRows.length > 1 ? allRows.slice(1) : []
    return NextResponse.json({ rows })
  } catch (err) {
    console.error('GET /api/like error:', err)
    return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 })
  }
}

// POST: tambah like baru
export async function POST(req: NextRequest) {
  try {
    const { logoId, userId, logoTitle } = await req.json()
    if (!logoId || !userId) {
      return NextResponse.json({ error: 'logoId and userId required' }, { status: 400 })
    }
    const sheets = getSheets()
    // Cek duplikat (A=USER_EMAIL/userId, B=LOGO_ID/logoId)
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:B`,
    })
    const allRows = existing.data.values || []
    const rows = allRows.length > 1 ? allRows.slice(1) : []
    const alreadyLiked = rows.some(r => r[0] === userId && r[1] === logoId)
    if (alreadyLiked) {
      return NextResponse.json({ ok: true, skipped: true })
    }
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:D`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[userId, logoId, logoTitle ?? '', new Date().toISOString()]],
      },
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/like error:', err)
    return NextResponse.json({ error: 'Failed to add like' }, { status: 500 })
  }
}

// DELETE: hapus like
export async function DELETE(req: NextRequest) {
  try {
    const { logoId, userId } = await req.json()
    if (!logoId || !userId) {
      return NextResponse.json({ error: 'logoId and userId required' }, { status: 400 })
    }
    const sheets = getSheets()
    // Ambil semua baris (termasuk header) — A=USER_EMAIL/userId, B=LOGO_ID/logoId
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:B`,
    })
    const allRows = existing.data.values || []
    // Cari index baris yang cocok (0-based, termasuk header)
    const rowIndex = allRows.findIndex(r => r[0] === userId && r[1] === logoId)
    if (rowIndex === -1) {
      return NextResponse.json({ ok: true, skipped: true })
    }
    // Dapatkan sheetId
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID })
    const sheet = meta.data.sheets?.find(s => s.properties?.title === SHEET_NAME)
    const sheetId = sheet?.properties?.sheetId ?? 0
    // Hapus baris (rowIndex sudah 0-based sesuai Sheets API)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        }],
      },
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/like error:', err)
    return NextResponse.json({ error: 'Failed to remove like' }, { status: 500 })
  }
}
