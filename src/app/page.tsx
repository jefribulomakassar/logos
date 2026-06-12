import { fetchLogos, getAllCategories } from '@/lib/sheets'
import Header from '@/components/Header'
import LogoGrid from '@/components/LogoGrid'
import Footer from '@/components/Footer'

export const revalidate = 3600 // ISR: revalidate every 1 hour

export default async function HomePage() {
  const logos = await fetchLogos()
  const categories = getAllCategories(logos)

  return (
    <main style={{ position: 'relative', zIndex: 1 }}>
      <Header logoCount={logos.length} />
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto 48px',
        padding: '0 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }} />
      <LogoGrid logos={logos} categories={categories} />
      <Footer />
    </main>
  )
}
