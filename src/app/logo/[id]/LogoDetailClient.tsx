'use client'

import { useState, useEffect } from 'react'
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

export default function LogoDetailClient({ logo, imageUrl }: Props) {
  const router = useRouter()
  const [mockups, setMockups] = useState<MockupImage[]>([])
  const [loadingMockups, setLoadingMockups] = useState(false)
  const [activeImg, setActiveImg] = useState<string>(imageUrl)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (!logo.mockupFolderId) return
    setLoadingMockups(true)
    fetch('/api/mockups?folderId=' + logo.mockupFolderId)
      .then(r => r.json())
      .then(data => setMockups(data.images || []))
      .catch(console.error)
      .finally(() => setLoadingMockups(false))
  }, [logo.mockupFolderId])

  const allCategories = [logo.mainCategory, ...logo.secondCategories].filter(Boolean)
  const priceDisplay = logo.price ? '$' + logo.price.toLocaleString() : 'Contact'

  return (
    <main style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* Topbar */}
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '20px 40px', display: 'flex', alignItems: 'center', gap: 20, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
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
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '48px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
        
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ aspectRatio: '1/1', background: '#0D0D15', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!imgError && activeImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activeImg} alt={logo.title} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 32 }} />
            ) : (
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '5rem', fontWeight: 700, color: '#4A4A5A' }}>{logo.title.charAt(0)}</span>
            )}
          </div>

          {/* Thumbnail strip */}
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            <button
              onClick={() => setActiveImg(imageUrl)}
              style={{ flexShrink: 0, width: 72, background: '#12121A', border: activeImg === imageUrl ? '2px solid #F5C842' : '2px solid rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', padding: 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="logo" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain', background: '#0D0D15', padding: 4 }} />
              <span style={{ display: 'block', fontSize: 9, color: '#4A4A5A', textAlign: 'center', padding: '3px 0', fontFamily: 'Inter, sans-serif' }}>Logo</span>
            </button>

            {loadingMockups && (
              <div style={{ width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#12121A', border: '2px solid rgba(255,255,255,0.08)', borderRadius: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: '#4A4A5A' }}>...</span>
              </div>
            )}

            {mockups.map((m, i) => (
              <button
                key={m.id}
                onClick={() => setActiveImg(m.thumbnailUrl)}
                style={{ flexShrink: 0, width: 72, background: '#12121A', border: activeImg === m.thumbnailUrl ? '2px solid #F5C842' : '2px solid rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', padding: 0 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.thumbnailUrl} alt={'mockup ' + (i + 1)} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain', background: '#0D0D15', padding: 4 }} />
                <span style={{ display: 'block', fontSize: 9, color: '#4A4A5A', textAlign: 'center', padding: '3px 0', fontFamily: 'Inter, sans-serif' }}>#{i + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {allCategories.map(cat => (
              <span key={cat} style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#4F8EF7', background: 'rgba(79,142,247,0.15)', padding: '4px 10px', borderRadius: 4 }}>{cat}</span>
            ))}
          </div>

          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#F5F5F0', lineHeight: 1.1, fontFamily: 'Space Grotesk, sans-serif' }}>{logo.title}</h1>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem', fontWeight: 700, color: '#F5C842' }}>{priceDisplay}</span>
            <span style={{ fontSize: 13, color: '#4A4A5A', fontStyle: 'italic' }}>by {logo.creator}</span>
          </div>

          <p style={{ fontSize: 15, color: '#8A8A9A', lineHeight: 1.75, borderLeft: '2px solid rgba(245,200,66,0.3)', paddingLeft: 16 }}>{logo.description}</p>

          <div>
            <span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A4A5A', marginBottom: 10 }}>Keywords</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {logo.keywords.split(' ').filter(Boolean).map(kw => (
                <span key={kw} style={{ fontSize: 11, color: '#8A8A9A', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: 100 }}>{kw}</span>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 20, background: '#12121A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 11, color: '#4A4A5A', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Published</span>
              <span style={{ fontSize: 14, color: '#F5F5F0', fontWeight: 500 }}>{logo.published}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 11, color: '#4A4A5A', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Mockups</span>
              <span style={{ fontSize: 14, color: '#F5F5F0', fontWeight: 500 }}>{loadingMockups ? 'Loading...' : mockups.length + ' images'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {logo.logoUrl && (
              <a href={logo.logoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#F5C842,#E8A020)', color: '#0A0A0F', border: 'none', borderRadius: 14, padding: '13px 22px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 14, cursor: 'pointer', textDecoration: 'none' }}>
                View on LogoGround ↗
              </a>
            )}
            <button onClick={() => router.back()} style={{ background: '#12121A', color: '#8A8A9A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '13px 22px', fontFamily: 'Inter, sans-serif', fontSize: 14, cursor: 'pointer' }}>
              ← Back to Gallery
            </button>
          </div>
        </div>
      </div>

      {/* Mockup gallery */}
      {mockups.length > 0 && (
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 40px 80px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#F5F5F0', marginBottom: 24, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.08)', fontFamily: 'Space Grotesk, sans-serif' }}>Mockup Gallery</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {mockups.map((m, i) => (
              <a key={m.id} href={m.viewUrl} target="_blank" rel="noopener noreferrer" style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', display: 'block' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.thumbnailUrl} alt={'mockup ' + (i + 1)} loading="lazy" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
              </a>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
