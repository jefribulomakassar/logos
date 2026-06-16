import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'VibeLogos — Premium Logo Showcase by jeflodesign',
  description: 'Browse and acquire premium, hand-crafted logos across technology, animals, general, and more categories.',
  keywords: 'logo design, premium logos, brand identity, logo marketplace, jeflodesign',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
