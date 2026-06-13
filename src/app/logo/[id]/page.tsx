import { fetchLogos, getGoogleDriveImageUrl } from '@/lib/sheets'
import { notFound } from 'next/navigation'
import LogoDetailClient from './LogoDetailClient'

export const revalidate = 3600

export async function generateStaticParams() {
  const logos = await fetchLogos()
  return logos.map(logo => ({ id: logo.id }))
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const logos = await fetchLogos()
  const logo = logos.find(l => l.id === params.id)
  if (!logo) return { title: 'Logo Not Found' }
  return {
    title: logo.title + ' — LogoFolio',
    description: logo.description.slice(0, 155),
  }
}

export default async function LogoDetailPage({ params }: { params: { id: string } }) {
  const logos = await fetchLogos()
  const logo = logos.find(l => l.id === params.id)
  if (!logo) notFound()
  const imageUrl = getGoogleDriveImageUrl(logo!.logoShow)
  return <LogoDetailClient logo={logo!} imageUrl={imageUrl} />
}
