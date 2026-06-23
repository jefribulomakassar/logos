'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/lib/sheets'

interface Props {
  logo: Logo
  imageUrl: string
}

interface MockupImage {
  id: string
  thumbnailUrl: string
  viewUrl: string
}

function formatDate(raw: string): string {
  if (!raw) return ''
  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (slashMatch) {
    const d = new Date(Number(slashMatch[3]), Number(slashMatch[2]) - 1, Number(slashMatch[1]))
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  const d = new Date(raw)
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  return raw
}

export default function LogoDetailClient({ logo, imageUrl }: Props) {
  const router = useRouter()
  const [mockups, setMockups] = useState<MockupImage[]>([])
  const [loadingMockups, setLoadingMockups] = useState(false)
  const [activeImg, setActiveImg] = useState<string>(imageUrl)
  const [imgError, setImgError] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!logo.mockupFolderId) return
    setLoadingMockups(true)
    fetch('/api/mockups?folderId=' + logo.mockupFolderId)
      .then(r => r.json())
      .then(data => setMockups(data.images || []))
      .catch(console.error)
      .finally(() => setLoadingMockups(false))
  }, [logo.mockupFolderId])

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const prevImage = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + mockups.length) % mockups.length)
  }, [lightboxIndex, mockups.length])
  const nextImage = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % mockups.length)
  }, [lightboxIndex, mockups.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, prevImage, nextImage])

  const allCategories = [logo.mainCategory, ...logo.secondCategories].filter(Boolean)
  const priceDisplay = logo.price ? '$' + logo.price.toLocaleString() : 'Contact'
  const publishedDisplay = formatDate(logo.published)

  return (
    <main style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>

      {/* Topbar */}
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#12121A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 14px', color: '#8A8A9A', fontFamily: 'Inter, sans-serif', fontSize: 13, cursor: 'pointer' }}
        >
          ← Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, background: '#F5C842', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 10px rgba(245,200,66,0.5)' }} />
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, letterSpacing: '-0.03em', color: '#F5F5F0' }}>LogoFolio</span>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: 40, alignItems: 'start' }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Main image */}
          <div style={{ aspectRatio: '1/1', background: '#0D0D15', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!imgError && activeImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeImg}
                alt={logo.title}
                onError={() => setImgError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 32 }}
              />
            ) : (
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '5rem', fontWeight: 700, color: '#4A4A5A' }}>
                {logo.title.charAt(0)}
              </span>
            )}
          </div>

          {/* Thumbnail strip */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>

            {/* Logo thumb */}
            <button
              onClick={() => setActiveImg(imageUrl)}
              style={{ flexShrink: 0, width: 68, background: '#12121A', border: activeImg === imageUrl ? '2px solid #F5C842' : '2px solid rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', padding: 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="logo" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain', background: '#0D0D15', padding: 4, display: 'block' }} />
              <span style={{ display: 'block', fontSize: 9, color: '#4A4A5A', textAlign: 'center', padding: '3px 0', fontFamily: 'Inter, sans-serif' }}>Logo</span>
            </button>

            {loadingMockups && (
              <div style={{ flexShrink: 0, width: 68, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#12121A', border: '2px solid rgba(255,255,255,0.08)', borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: '#4A4A5A' }}>...</span>
              </div>
            )}

            {mockups.map((m, i) => (
              <button
                key={m.id}
                onClick={() => { setActiveImg(m.thumbnailUrl); openLightbox(i) }}
                style={{ flexShrink: 0, width: 68, background: '#12121A', border: activeImg === m.thumbnailUrl ? '2px solid #F5C842' : '2px solid rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', padding: 0 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.thumbnailUrl} alt={'mockup ' + (i + 1)} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', background: '#0D0D15', display: 'block' }} />
                <span style={{ display: 'block', fontSize: 9, color: '#4A4A5A', textAlign: 'center', padding: '3px 0', fontFamily: 'Inter, sans-serif' }}>#{i + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Categories */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {allCategories.map(cat => (
              <span key={cat} style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#4F8EF7', background: 'rgba(79,142,247,0.15)', padding: '4px 10px', borderRadius: 4 }}>
                {cat}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#F5F5F0', lineHeight: 1.15, margin: 0 }}>
            {logo.title}
          </h1>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.8rem', fontWeight: 700, color: '#F5C842' }}>
              {priceDisplay}
            </span>
            <span style={{ fontSize: 13, color: '#4A4A5A', fontStyle: 'italic' }}>by {logo.creator}</span>
          </div>

          {/* Description */}
          <p style={{ fontSize: 14, color: '#8A8A9A', lineHeight: 1.75, borderLeft: '2px solid rgba(245,200,66,0.3)', paddingLeft: 14, margin: 0 }}>
            {logo.description}
          </p>

          {/* Keywords */}
          <div>
            <span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A4A5A', marginBottom: 8 }}>Keywords</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {logo.keywords.split(' ').filter(Boolean).map(kw => (
                <span key={kw} style={{ fontSize: 11, color: '#8A8A9A', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '3px 9px', borderRadius: 100 }}>
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 16, background: '#12121A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 10, color: '#4A4A5A', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Published</span>
              <span style={{ fontSize: 13, color: '#F5F5F0', fontWeight: 500 }}>{publishedDisplay}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 10, color: '#4A4A5A', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Mockups</span>
              <span style={{ fontSize: 13, color: '#F5F5F0', fontWeight: 500 }}>{loadingMockups ? 'Loading...' : mockups.length + ' images'}</span>
            </div>
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {logo.logoUrl && (
              <a
                href={logo.logoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ flex: 1, minWidth: 140, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg,#F5C842,#E8A020)', color: '#0A0A0F', borderRadius: 12, padding: '12px 20px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
              >
                View on LogoGround ↗
              </a>
            )}
            <button
              onClick={() => router.back()}
              style={{ flex: 1, minWidth: 120, background: '#12121A', color: '#8A8A9A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 20px', fontFamily: 'Inter, sans-serif', fontSize: 14, cursor: 'pointer' }}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Mockup gallery */}
      {mockups.length > 0 && (
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 24px 60px' }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.3rem', fontWeight: 600, color: '#F5F5F0', marginBottom: 20, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            Mockup Gallery <span style={{ color: '#4A4A5A', fontSize: '1rem', fontWeight: 400 }}>({mockups.length})</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: 12 }}>
            {mockups.map((m, i) => (
              <button
                key={m.id}
                onClick={() => openLightbox(i)}
                style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', display: 'block', padding: 0, cursor: 'pointer', background: 'transparent', width: '100%' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.thumbnailUrl}
                  alt={'mockup ' + (i + 1)}
                  loading="lazy"
                  style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          onClick={closeLightbox}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            style={{ position: 'absolute', top: 20, right: 24, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#F5F5F0', fontSize: 22, width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}
          >
            ✕
          </button>

          {/* Counter */}
          <span style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8A8A9A' }}>
            {lightboxIndex + 1} / {mockups.length}
          </span>

          {/* Prev */}
          {mockups.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prevImage() }}
              style={{ position: 'absolute', left: 16, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#F5F5F0', fontSize: 22, width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}
            >
              ‹
            </button>
          )}

          {/* Image */}
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mockups[lightboxIndex].thumbnailUrl}
              alt={'mockup ' + (lightboxIndex + 1)}
              style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 8px 60px rgba(0,0,0,0.6)' }}
            />
          </div>

          {/* Next */}
          {mockups.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); nextImage() }}
              style={{ position: 'absolute', right: 16, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#F5F5F0', fontSize: 22, width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}
            >
              ›
            </button>
          )}
        </div>
      )}

    </main>
  )
}
