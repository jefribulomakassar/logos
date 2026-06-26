export interface Logo {
  id: string
  title: string
  description: string
  keywords: string
  price: number
  specialPrice: number | null
  startOn: string
  endOn: string
  mainCategory: string
  secondCategories: string[]
  logoShow: string
  mockupFolderId: string
  logoUrl: string
  creator: string
  published: string
}

export function getEffectivePrice(logo: Logo): { price: number; isSpecial: boolean } {
  if (!logo.specialPrice || !logo.startOn || !logo.endOn) {
    return { price: logo.price, isSpecial: false }
  }
  const now = new Date()
  const start = parseDate(logo.startOn)
  const end = parseDate(logo.endOn)

  console.log('price check:', logo.title, { now, start, end, specialPrice: logo.specialPrice })

  if (start && end && now >= start && now <= end) {
    return { price: logo.specialPrice, isSpecial: true }
  }
  return { price: logo.price, isSpecial: false }
}

function parseDate(raw: string): Date | null {
  if (!raw) return null

  // Format dari gviz: Date(2026,5,15) — bulan 0-indexed
  const gvizMatch = raw.match(/^Date\((\d+),(\d+),(\d+)\)/)
  if (gvizMatch) {
    return new Date(Number(gvizMatch[1]), Number(gvizMatch[2]), Number(gvizMatch[3]))
  }

  // MM/DD/YYYY
  const mdyMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (mdyMatch) {
    return new Date(Number(mdyMatch[3]), Number(mdyMatch[1]) - 1, Number(mdyMatch[2]))
  }

  // DD/MM/YYYY
  const dmyMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (dmyMatch) {
    return new Date(Number(dmyMatch[3]), Number(dmyMatch[2]) - 1, Number(dmyMatch[1]))
  }

  // YYYY-MM-DD
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]))
  }

  return null
}

export function formatDate(raw: string): string {
  if (!raw) return ''
  // Date(YYYY,MM,D) format dari Google Sheets gviz
  const dateMatch = raw.match(/^Date\((\d+),(\d+),(\d+)\)/)
  if (dateMatch) {
    const y = dateMatch[1]
    const m = String(Number(dateMatch[2]) + 1).padStart(2, '0')
    const d = String(dateMatch[3]).padStart(2, '0')
    return y + '-' + m + '-' + d
  }
  // DD/MM/YYYY
  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (slashMatch) {
    const y = slashMatch[3]
    const m = slashMatch[2].padStart(2, '0')
    const d = slashMatch[1].padStart(2, '0')
    return y + '-' + m + '-' + d
  }
  // YYYY-MM-DD sudah benar
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10)
  return raw
}

const SHEET_ID = '1PzZUFsoWL2wAvJGjBIzBpO_2lwRHbBSicys01rEDU_I'

/**
 * Mengambil File ID Google Drive dari berbagai kemungkinan format URL/string,
 * lalu mengubahnya menjadi URL thumbnail yang bisa langsung dipakai sebagai <img src>.
 *
 * Format yang didukung (tergantung akun/cara link di-copy bisa berbeda-beda):
 *  - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *  - https://drive.google.com/open?id=FILE_ID
 *  - https://drive.google.com/uc?id=FILE_ID&export=download
 *  - https://drive.google.com/uc?export=view&id=FILE_ID
 *  - https://drive.google.com/thumbnail?id=FILE_ID&sz=w600   (sudah benar, dipakai langsung)
 *  - https://lh3.googleusercontent.com/d/FILE_ID              (sudah valid, dipakai langsung)
 *  - FILE_ID polos (33+ karakter alfanumerik/-/_), tanpa URL sama sekali
 */
export function getGoogleDriveImageUrl(driveUrl: string): string {
  if (!driveUrl) return ''
  const raw = driveUrl.trim()

  // Sudah berupa link thumbnail Google Drive yang valid -> pakai langsung
  if (/drive\.google\.com\/thumbnail\?/.test(raw)) {
    return raw
  }

  // Sudah berupa link googleusercontent yang valid -> pakai langsung
  if (/lh3\.googleusercontent\.com\//.test(raw)) {
    return raw
  }

  // Coba ekstrak File ID dari berbagai pola URL Drive yang umum:
  //  /file/d/FILE_ID
  //  ?id=FILE_ID  atau  &id=FILE_ID
  //  /d/FILE_ID  (format googleusercontent)
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ]

  let fileId: string | null = null
  for (const pattern of patterns) {
    const match = raw.match(pattern)
    if (match) {
      fileId = match[1]
      break
    }
  }

  // Kalau tidak ada match sama sekali tapi string-nya sendiri "terlihat" seperti
  // File ID Google Drive polos (bukan URL), anggap itu File ID langsung.
  if (!fileId && /^[a-zA-Z0-9_-]{25,}$/.test(raw)) {
    fileId = raw
  }

  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`
  }

  // Tidak dikenali sama sekali -> kembalikan apa adanya (fallback lama),
  // supaya tidak menyembunyikan kasus baru yang belum ditangani.
  return raw
}

export function extractFolderId(driveUrl: string): string {
  if (!driveUrl) return ''
  // format: /drive/folders/FOLDER_ID atau ?id=FOLDER_ID
  const folderMatch = driveUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/)
  if (folderMatch) return folderMatch[1]
  const idMatch = driveUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (idMatch) return idMatch[1]
  return driveUrl
}

export async function fetchLogos(): Promise<Logo[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Sheet1`

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    const text = await res.text()

    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}') + 1
    const json = JSON.parse(text.slice(jsonStart, jsonEnd))

    const rows = json.table.rows as Array<{ c: Array<{ v: string | number | null } | null> }>

    return rows
      .filter(row => row.c && row.c[0]?.v != null)
      .map(row => {
        const cell = (i: number) => row.c[i]?.v ?? ''
        const secondCatRaw = String(cell(9)) // geser dari 6 ke 9
        return {
          id: String(cell(0)),
          title: String(cell(1)),
          description: String(cell(2)),
          keywords: String(cell(3)),
          price: Number(cell(4)) || 0,
          specialPrice: cell(5) ? Number(cell(5)) : null,
          startOn: String(cell(6)),
          endOn: String(cell(7)),
          mainCategory: String(cell(8)),
          secondCategories: secondCatRaw
            ? secondCatRaw.split(',').map((s: string) => s.trim()).filter(Boolean)
            : [],
          logoShow: String(cell(10)),
          mockupFolderId: extractFolderId(String(cell(11))),
          logoUrl: String(cell(12)),
          creator: String(cell(13)),
          published: formatDate(String(cell(14))),
        }
      })
  } catch (err) {
    console.error('Failed to fetch logos:', err)
    return []
  }
}

export function getAllCategories(logos: Logo[]): string[] {
  const cats = new Set<string>()
  logos.forEach(l => {
    if (l.mainCategory) cats.add(l.mainCategory.trim())
    l.secondCategories.forEach(c => cats.add(c))
  })
  return Array.from(cats).sort()
}
