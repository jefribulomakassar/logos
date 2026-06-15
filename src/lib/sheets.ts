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
  if (start && end && now >= start && now <= end) {
    return { price: logo.specialPrice, isSpecial: true }
  }
  return { price: logo.price, isSpecial: false }
}

function parseDate(raw: string): Date | null {
  if (!raw) return null
  // MM/DD/YYYY
  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (slashMatch) {
    return new Date(Number(slashMatch[3]), Number(slashMatch[1]) - 1, Number(slashMatch[2]))
  }
  // YYYY-MM-DD
  const d = new Date(raw)
  if (!isNaN(d.getTime())) return d
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

export function getGoogleDriveImageUrl(driveUrl: string): string {
  if (!driveUrl) return ''
  const fileMatch = driveUrl.match(/\/file\/d\/([^/]+)/)
  if (fileMatch) {
    return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w600`
  }
  return driveUrl
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
          startOn: formatDate(String(cell(6))),
          endOn: formatDate(String(cell(7))),
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
