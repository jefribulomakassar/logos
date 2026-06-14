import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { google } from 'googleapis'

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
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

// GET — ambil semua favorit user yang login
export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ favorites: [] })
  }

  try {
    const sheets = getSheets()
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_NAME + '!A:D',
    })

    const rows = res.data.values || []
    const userFavorites = rows
      .slice(1) // skip header
      .filter(row => row[0] === session.user!.email)
      .map(row => row[1]) // ambil LOGO_ID

    return NextResponse.json({ favorites: userFavorites })
  } catch (err) {
    console.error('GET favorites error:', err)
    return NextResponse.json({ favorites: [] })
  }
}

// POST — toggle favorit (add/remove)
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { logoId, logoTitle } = await request.json()
  if (!logoId) {
    return NextResponse.json({ error: 'logoId required' }, { status: 400 })
  }

  try {
    const sheets = getSheets()
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_NAME + '!A:D',
    })

    const rows = res.data.values || []
    const header = rows[0] || []
    const dataRows = rows.slice(1)

    // Cek apakah sudah difavorit
    const existingIndex = dataRows.findIndex(
      row => row[0] === session.user!.email && row[1] === logoId
    )

    if (existingIndex !== -1) {
      // Sudah ada — hapus (unlike)
      const sheetRowIndex = existingIndex + 2 // +1 header +1 karena sheets 1-indexed
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range: SHEET_NAME + '!A' + sheetRowIndex + ':D' + sheetRowIndex,
      })
      return NextResponse.json({ action: 'removed', logoId })
    } else {
      // Belum ada — tambah (like)
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: SHEET_NAME + '!A:D',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            session.user.email,
            logoId,
            logoTitle || '',
            new Date().toISOString(),
          ]],
        },
      })
      return NextResponse.json({ action: 'added', logoId })
    }
  } catch (err) {
    console.error('POST favorites error:', err)
    return NextResponse.json({ error: 'Failed to update favorites' }, { status: 500 })
  }
}
