import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

function getDrive() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })
  return google.drive({ version: 'v3', auth })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const folderId = searchParams.get('folderId')

  if (!folderId) {
    return NextResponse.json({ error: 'folderId required' }, { status: 400 })
  }

  try {
    const drive = getDrive()

    const res = await drive.files.list({
      q: '"' + folderId + '" in parents and mimeType contains "image/" and trashed = false',
      fields: 'files(id, name, mimeType)',
      pageSize: 50,
    })

    const files = res.data.files || []

    const images = files.map(file => ({
      id: file.id,
      thumbnailUrl: 'https://drive.google.com/thumbnail?id=' + file.id + '&sz=w800',
      viewUrl: 'https://drive.google.com/file/d/' + file.id + '/view',
    }))

    return NextResponse.json({ images, total: images.length })
  } catch (err) {
    console.error('Drive API error:', err)
    return NextResponse.json({ error: 'Failed to fetch mockups', detail: String(err) }, { status: 500 })
  }
}
