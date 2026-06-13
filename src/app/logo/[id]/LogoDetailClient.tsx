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
    fetch(`/api/mockups?folderId=${logo.mockupFolderId}`)
      .then(r => r.json())
      .then(data => setMockups(data.images || []))
      .catch(console.error)
      .finally(() => setLoadingMockups(false))
  }, [logo.mockupFolderId])

  const allCategories = [logo.mainCategory, ...logo.secondCategories].filter(Boolean)
  const priceDisplay = logo.price ? '$' + logo.price.toLocaleString() : 'Contact'

  return (
    <main className="detail-page">
      {/* Back button */}
      <div className="topbar">
        <button className="back-btn" onClick={() => router.back()}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <div className="logo-mark">
          <span className="mark-dot" />
          <span className="mark-text">LogoFolio</span>
        </div>
      </div>

      <div className="detail-layout">
        {/* LEFT — image + mockup thumbnails */}
        <div className="detail-left">
          <div className="main-image-wrap">
            {!imgError && activeImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeImg}
                alt={logo.title}
                className="main-image"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="main-image-placeholder">
                {logo.title.charAt(0)}
              </div>
            )}
          </div>

          {/* Thumbnail strip: logo + mockups */}
          <div className="thumb-strip">
            <button
              className={`thumb-btn ${activeImg === imageUrl ? 'active' : ''}`}
              onClick={() => setActiveImg(imageUrl)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="logo" className="thumb-img" onError={() => {}} />
              <span className="thumb-label">Logo</span>
            </button>

            {loadingMockups && (
              <div className="thumb-loading">
                <span className="spinner" />
              </div>
            )}

            {mockups.map((m, i) => (
              <button
                key={m.id}
                className={`thumb-btn ${activeImg === m.thumbnailUrl ? 'active' : ''}`}
                onClick={() => setActiveImg(m.thumbnailUrl)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.thumbnailUrl} alt={`mockup ${i + 1}`} className="thumb-img" />
                <span className="thumb-label">#{i + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT — detail info */}
        <div className="detail-right">
          <div className="cats-row">
            {allCategories.map(cat => (
              <span key={cat} className="cat-badge">{cat}</span>
            ))}
          </div>

          <h1 className="detail-title">{logo.title}</h1>

          <div className="price-row">
            <span className="detail-price">{priceDisplay}</span>
            <span className="detail-creator">by {logo.creator}</span>
          </div>

          <p className="detail-desc">{logo.description}</p>

          <div className="keywords-wrap">
            <span className="section-label">Keywords</span>
            <div className="keywords-list">
              {logo.keywords.split(' ').filter(Boolean).map(kw => (
                <span key={kw} className="keyword-tag">{kw}</span>
              ))}
            </div>
          </div>

          <div className="meta-grid">
            <div className="meta-item">
              <span className="meta-label">Published</span>
              <span className="meta-value">{logo.published}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Mockups</span>
              <span className="meta-value">
                {loadingMockups ? 'Loading...' : `${mockups.length} images`}
              </span>
            </div>
          </div>

          <div className="cta-row">
            {logo.logoUrl && (
              
                href={logo.logoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                View on LogoGround
                <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                  <path d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3M10 2h4m0 0v4m0-4L7 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            )}
            <button className="btn-ghost" onClick={() => router.back()}>
              ← Back to Gallery
            </button>
          </div>
        </div>
      </div>

      {/* Full mockup gallery bawah */}
      {mockups.length > 0 && (
        <div className="mockup-gallery">
          <h2 className="gallery-title">Mockup Gallery</h2>
          <div className="gallery-grid">
            {mockups.map((m, i) => (
              <a key={m.id} href={m.viewUrl} target="_blank" rel="noopener noreferrer" className="gallery-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.thumbnailUrl} alt={`mockup ${i + 1}`} className="gallery-img" loading="lazy" />
              </a>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .detail-page {
          min-height: 100vh;
          position: relative;
          z-index: 1;
        }

        .topbar {
          max-width: 1600px;
          margin: 0 auto;
          padding: 20px 40px;
          display: flex;
          align-items: center;
          gap: 20px;
          border-bottom: 1px solid var(--border);
        }
        .back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 14px;
          color: var(--text-secondary);
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .back-btn:hover {
          border-color: rgba(245,200,66,0.3);
          color: var(--text-primary);
        }
        .logo-mark {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .mark-dot {
          width: 7px; height: 7px;
          background: var(--gradient-gold);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(245,200,66,0.5);
        }
        .mark-text {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .detail-layout {
          max-width: 1600px;
          margin: 0 auto;
          padding: 48px 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: start;
        }

        /* LEFT */
        .detail-left { display: flex; flex-direction: column; gap: 16px; }
        .main-image-wrap {
          aspect-ratio: 1 / 1;
          background: #0D0D15;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .main-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 32px;
        }
        .main-image-placeholder {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 5rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .thumb-strip {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: thin;
          scrollbar-color: var(--text-muted) transparent;
        }
        .thumb-strip::-webkit-scrollbar { height: 3px; }
        .thumb-strip::-webkit-scrollbar-thumb { background: var(--text-muted); border-radius: 2px; }

        .thumb-btn {
          flex-shrink: 0;
          width: 72px;
          background: var(--bg-card);
          border: 2px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: border-color 0.2s;
          padding: 0;
          display: flex;
          flex-direction: column;
        }
        .thumb-btn:hover { border-color: rgba(245,200,66,0.3); }
        .thumb-btn.active { border-color: var(--accent-gold); }
        .thumb-img {
          width: 100%;
          aspect-ratio: 1/1;
          object-fit: contain;
          background: #0D0D15;
          padding: 4px;
        }
        .thumb-label {
          font-size: 9px;
          color: var(--text-muted);
          text-align: center;
          padding: 3px 0;
          font-family: 'Inter', sans-serif;
        }
        .thumb-loading {
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-card);
          border: 2px solid var(--border);
          border-radius: 8px;
          flex-shrink: 0;
        }

        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.1);
          border-top-color: var(--accent-gold);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* RIGHT */
        .detail-right { display: flex; flex-direction: column; gap: 24px; }

        .cats-row { display: flex; flex-wrap: wrap; gap: 6px; }
        .cat-badge {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--accent-blue);
          background: var(--accent-blue-dim);
          padding: 4px 10px;
          border-radius: 4px;
        }

        .detail-title {
          font-size: clamp(1.8rem, 3vw, 2.8rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .price-row {
          display: flex;
          align-items: baseline;
          gap: 16px;
        }
        .detail-price {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: var(--accent-gold);
        }
        .detail-creator {
          font-size: 13px;
          color: var(--text-muted);
          font-style: italic;
        }

        .detail-desc {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.75;
          border-left: 2px solid rgba(245,200,66,0.3);
          padding-left: 16px;
        }

        .section-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 10px;
        }
        .keywords-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .keyword-tag {
          font-size: 11px;
          color: var(--text-secondary);
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          padding: 4px 10px;
          border-radius: 100px;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
        }
        .meta-item { display: flex; flex-direction: column; gap: 4px; }
        .meta-label {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .meta-value {
          font-size: 14px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .cta-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--gradient-gold);
          color: #0A0A0F;
          border: none;
          border-radius: var(--radius-md);
          padding: 13px 22px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: opacity 0.2s;
          text-decoration: none;
        }
        .btn-primary:hover { opacity: 0.88; }
        .btn-ghost {
          background: var(--bg-card);
          color: var(--text-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 13px 22px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-ghost:hover {
          border-color: rgba(245,200,66,0.3);
          color: var(--text-primary);
        }

        /* Full gallery */
        .mockup-gallery {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 40px 80px;
        }
        .gallery-title {
          font-size: 1.4rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 24px;
          padding-top: 8px;
          border-top: 1px solid var(--border);
          padding-top: 32px;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .gallery-item {
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border);
          transition: border-color 0.2s, transform 0.2s;
          display: block;
        }
        .gallery-item:hover {
          border-color: var(--border-hover);
          transform: translateY(-2px);
        }
        .gallery-img {
          width: 100%;
          aspect-ratio: 4 / 3;
          object-fit: cover;
          display: block;
        }

        @media (max-width: 1024px) {
          .detail-layout { grid-template-columns: 1fr; gap: 32px; padding: 32px 24px; }
          .topbar { padding: 16px 24px; }
          .mockup-gallery { padding: 0 24px 60px; }
        }
        @media (max-width: 480px) {
          .detail-layout { padding: 24px 16px; }
          .topbar { padding: 14px 16px; }
          .mockup-gallery { padding: 0 16px 40px; }
          .gallery-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </main>
  )
}
