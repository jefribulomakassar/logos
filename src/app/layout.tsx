import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LogoFolio — Premium Logo Showcase by jeflodesign',
  description: 'Browse and acquire premium, hand-crafted logos across technology, animals, general, and more categories. Professional logos by jeflodesign.',
  keywords: 'logo design, premium logos, brand identity, logo marketplace, jeflodesign',
  openGraph: {
    title: 'LogoFolio — Premium Logo Showcase',
    description: 'Browse premium hand-crafted logos by jeflodesign',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
