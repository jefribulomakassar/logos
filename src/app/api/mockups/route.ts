import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const folderId = searchParams.get('folderId')

  if (!folderId) {
    return NextResponse.json({ error: 'folderId required' }, { status: 400 })
  }

  try {
    const url = 'https://drive.google.com/drive/folders/' + folderId
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 86400 },
    })

    const html = await res.text()
    const imageIds: string[] = []

    const anchorRegex = /\/file\/d\/([a-zA-Z0-9_-]{20,})\/view/g
    let match: RegExpExecArray | null
    while ((match = anchorRegex.exec(html)) !== null) {
      if (!imageIds.includes(match[1])) imageIds.push(match[1])
    }

    const thumbRegex = /id=([a-zA-Z0-9_-]{20,})&/g
    while ((match = thumbRegex.exec(html)) !== null) {
      if (!imageIds.includes(match[1])) imageIds.push(match[1])
    }

    const images = imageIds.slice(0, 20).map(id => ({
      id,
      thumbnailUrl: 'https://drive.google.com/thumbnail?id=' + id + '&sz=w800',
      viewUrl: 'https://drive.google.com/file/d/' + id + '/view',
    }))

    return NextResponse.json({ images })
  } catch (err) {
    console.error('Mockup fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch mockups' }, { status: 500 })
  }
}
