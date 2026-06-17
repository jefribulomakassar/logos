import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const folderId = searchParams.get('folderId')

  if (!folderId) {
    return NextResponse.json({ error: 'folderId required' }, { status: 400 })
  }

  try {
    // Gunakan Google Drive export sebagai gviz JSON — works untuk public folder
    const url = 'https://drive.google.com/embeddedfolderview?id=' + folderId + '#list'
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      next: { revalidate: 3600 },
    })

    const html = await res.text()
    const imageIds: string[] = []

    // Pattern dari embedded folder view
    const regex = /"([a-zA-Z0-9_-]{25,})","([^"]+\.(jpg|jpeg|png|webp|JPG|PNG))"/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(html)) !== null) {
      if (!imageIds.includes(match[1])) imageIds.push(match[1])
    }

    // Fallback pattern
    if (imageIds.length === 0) {
      const regex2 = /\["([a-zA-Z0-9_-]{25,})","[^"]*","(image\/jpeg|image\/png|image\/webp)"/g
      while ((match = regex2.exec(html)) !== null) {
        if (!imageIds.includes(match[1])) imageIds.push(match[1])
      }
    }

    // Fallback ke anchor /file/d/ pattern
    if (imageIds.length === 0) {
      const regex3 = /\/file\/d\/([a-zA-Z0-9_-]{20,})\/view/g
      while ((match = regex3.exec(html)) !== null) {
        if (!imageIds.includes(match[1])) imageIds.push(match[1])
      }
    }

    const images = imageIds.slice(0, 30).map(id => ({
      id,
      thumbnailUrl: 'https://drive.google.com/thumbnail?id=' + id + '&sz=w800',
      viewUrl: 'https://drive.google.com/file/d/' + id + '/view',
    }))

    return NextResponse.json({ images, debug: { total: imageIds.length, folderId } })
  } catch (err) {
    console.error('Mockup fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch mockups' }, { status: 500 })
  }
}
