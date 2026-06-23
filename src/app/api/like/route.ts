// src/app/api/like/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

const SPREADSHEET_ID = '1PzZUFsoWL2wAvJGjBIzBpO_2lwRHbBSicys01rEDU_I'
const SHEET_NAME = 'favorites'

function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

// GET: ambil semua baris dari sheet favorites
export async function GET() {
  try {
    const sheets = getSheets()
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:C`,
    })
    const rows = res.data.values || []
    // Format: [logoId, userId, timestamp]
    return NextResponse.json({ rows })
  } catch (err) {
    console.error('GET /api/like error:', err)
    return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 })
  }
}

// POST: tambah like baru
export async function POST(req: NextRequest) {
  try {
    const { logoId, userId } = await req.json()
    if (!logoId || !userId) {
      return NextResponse.json({ error: 'logoId and userId required' }, { status: 400 })
    }

    const sheets = getSheets()

    // Cek duplikat dulu
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:B`,
    })
    const rows = existing.data.values || []
    const alreadyLiked = rows.some(r => r[0] === logoId && r[1] === userId)
    if (alreadyLiked) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:C`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[logoId, userId, new Date().toISOString()]],
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

    // Ambil semua baris
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:C`,
    })
    const rows = existing.data.values || []

    // Cari index baris yang cocok (1-indexed untuk Sheets)
    const rowIndex = rows.findIndex(r => r[0] === logoId && r[1] === userId)
    if (rowIndex === -1) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    // Dapatkan sheetId dulu
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID })
    const sheet = meta.data.sheets?.find(s => s.properties?.title === SHEET_NAME)
    const sheetId = sheet?.properties?.sheetId ?? 0

    // Hapus baris (rowIndex adalah 0-based, Sheets API pakai 0-based juga)
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
