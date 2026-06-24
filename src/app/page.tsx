import { fetchLogos, getAllCategories, getEffectivePrice } from '@/lib/sheets'
import Header from '@/components/Header'
import LogoGrid from '@/components/LogoGrid'
import Footer from '@/components/Footer'
import HowToOrder from '@/components/HowToOrder'
export const revalidate = 3600

export default async function HomePage() {
  const logos = await fetchLogos()
  const categories = getAllCategories(logos)

  const hasActiveSale = logos.some(l => getEffectivePrice(l).isSpecial)
  const saleEnd = logos.find(l => l.endOn)?.endOn || ''

  return (
    <main style={{ position: 'relative', zIndex: 1 }}>
      <Header logoCount={logos.length} hasActiveSale={hasActiveSale} saleEndDate={saleEnd} />
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto 48px',
        padding: '0 40px',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }} />
      <LogoGrid logos={logos} categories={categories} />
      <HowToOrder />
      <Footer />
    </main>
  )
}
