import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const folderId = searchParams.get('folderId')

  if (!folderId) {
    return NextResponse.json({ error: 'folderId required' }, { status: 400 })
  }

  const API_KEY = process.env.GOOGLE_API_KEY
  if (!API_KEY) {
    return NextResponse.json({ images: [], error: 'API key not configured' })
  }

  try {
    const query = `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)&pageSize=50&key=${API_KEY}`

    const res = await fetch(url, { next: { revalidate: 60 } })
    const data = await res.json()

    if (!res.ok) {
      console.error('Drive API error:', data)
      return NextResponse.json({ images: [], error: data.error?.message })
    }

    const images = (data.files || []).map((f: { id: string }) => ({
      id: f.id,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${f.id}&sz=w800`,
      viewUrl: `https://drive.google.com/file/d/${f.id}/view`,
    }))

    return NextResponse.json({ images, debug: { total: images.length, folderId } })
  } catch (err) {
    console.error('Mockup fetch error:', err)
    return NextResponse.json({ images: [], error: 'Failed to fetch mockups' })
  }
}
