export interface Logo {
  id: string
  title: string
  description: string
  keywords: string
  price: number
  mainCategory: string
  secondCategories: string[]
  logoShow: string
  mockups: string
  logoUrl: string
  creator: string
  published: string
}

const SHEET_ID = '1PzZUFsoWL2wAvJGjBIzBpO_2lwRHbBSicys01rEDU_I'

export function getGoogleDriveImageUrl(driveUrl: string): string {
  if (!driveUrl) return ''
  // Convert Google Drive share link to direct image URL
  const fileMatch = driveUrl.match(/\/file\/d\/([^/]+)/)
  if (fileMatch) {
    return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w400`
  }
  return driveUrl
}

export async function fetchLogos(): Promise<Logo[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Sheet1`
  
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    const text = await res.text()
    
    // Google returns JSON wrapped in a callback: google.visualization.Query.setResponse({...})
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}') + 1
    const json = JSON.parse(text.slice(jsonStart, jsonEnd))
    
    const rows = json.table.rows as Array<{ c: Array<{ v: string | number | null } | null> }>
    
    return rows
      .filter(row => row.c && row.c[0]?.v != null)
      .map(row => {
        const cell = (i: number) => row.c[i]?.v ?? ''
        const secondCatRaw = String(cell(6))
        return {
          id: String(cell(0)),
          title: String(cell(1)),
          description: String(cell(2)),
          keywords: String(cell(3)),
          price: Number(cell(4)) || 0,
          mainCategory: String(cell(5)),
          secondCategories: secondCatRaw
            ? secondCatRaw.split(',').map(s => s.trim()).filter(Boolean)
            : [],
          logoShow: String(cell(7)),
          mockups: String(cell(8)),
          logoUrl: String(cell(9)),
          creator: String(cell(10)),
          published: String(cell(11)),
        }
      })
  } catch (err) {
    console.error('Failed to fetch logos from Google Sheets:', err)
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
