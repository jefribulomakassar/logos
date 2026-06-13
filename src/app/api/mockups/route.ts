import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const folderId = searchParams.get('folderId')

  if (!folderId) {
    return NextResponse.json({ error: 'folderId required' }, { status: 400 })
  }

  try {
    // Fetch Google Drive folder as JSON via gviz/tq trick
    const url = `https://drive.google.com/drive/folders/${folderId}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      next: { revalidate: 86400 }, // cache 24 jam
    })

    const html = await res.text()

    // Extract file IDs dari HTML response Drive
    // Pattern: "https://lh3.googleusercontent.com/..." atau file IDs dalam JSON embed
    const fileIdMatches = html.matchAll(/"([a-zA-Z0-9_-]{25,})".*?"application\/octet-stream|image\//g)

    // Cara lebih reliable: parse JSON data yang di-embed Drive di halaman HTML
    // Drive embed data pattern: ,["filename","fileId","mimeType",...]
    const imageIds: string[] = []

    // Match file entries dari Drive's internal JSON
    const driveDataMatch = html.match(/\[\[.*?\]\]/)

    // Fallback: cari semua file ID pattern dari anchor tags Drive
    const anchorMatches = html.matchAll(/\/file\/d\/([a-zA-Z0-9_-]{20,})\/view/g)
    for (const match of anchorMatches) {
      if (!imageIds.includes(match[1])) {
        imageIds.push(match[1])
      }
    }

    // Juga cari dari thumbnail URLs yang di-embed
    const thumbMatches = html.matchAll(/id=([a-zA-Z0-9_-]{20,})&/g)
    for (const match of thumbMatches) {
      if (!imageIds.includes(match[1])) {
        imageIds.push(match[1])
      }
    }

    const images = imageIds.slice(0, 20).map(id => ({
      id,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w800`,
      viewUrl: `https://drive.google.com/file/d/${id}/view`,
    }))

    return NextResponse.json({ images })
  } catch (err) {
    console.error('Mockup fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch mockups' }, { status: 500 })
  }
}
