'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo, getGoogleDriveImageUrl } from '@/lib/sheets'
import { useFavorites } from './FavoritesProvider'
import { useSession, signIn } from 'next-auth/react'

interface LogoCardProps {
  logo: Logo
}

export default function LogoCard({ logo }: LogoCardProps) {
  const router = useRouter()
  const [imgError, setImgError] = useState(false)
  const [mockupImages, setMockupImages] = useState<{ id: string; thumbnailUrl: string }[]>([])
  const [showMockup, setShowMockup] = useState(false)
  const [loadingMockup, setLoadingMockup] = useState(false)

  const imageUrl = getGoogleDriveImageUrl(logo.logoShow)
  const priceDisplay = logo.price ? `$${logo.price.toLocaleString()}` : 'Contact'
  const allCategories = [logo.mainCategory, ...logo.secondCategories].filter(Boolean).slice(0, 3)

  const { favorites, toggleFavorite } = useFavorites()
  const { data: session } = useSession()
  const isLiked = favorites.includes(logo.id)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!session?.user) {
      signIn('google')
      return
    }
    toggleFavorite(logo.id, logo.title)
  }

  const handleToggleMockup = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (showMockup) {
      setShowMockup(false)
      return
    }
    if (mockupImages.length > 0) {
      setShowMockup(true)
      return
    }
    if (!logo.mockupFolderId) return
    setLoadingMockup(true)
    try {
      const res = await fetch(`/api/mockups?folderId=${logo.mockupFolderId}`)
      const data = await res.json()
      setMockupImages(data.images || [])
      setShowMockup(true)
    } catch {
      console.error('Failed to load mockups')
    } finally {
      setLoadingMockup(false)
    }
  }

  const handleCardClick = () => {
    router.push(`/logo/${logo.id}`)
  }

  const handleViewLogo = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (logo.logoUrl) window.open(logo.logoUrl, '_blank')
  }

  return (
    <article className="logo-card" onClick={handleCardClick}>
      <div className="card-image-wrap">
        {!imgError && imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={logo.title}
            className="card-image"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="card-image-placeholder">
            <span>{logo.title.charAt(0)}</span>
          </div>
        )}

        {/* Action buttons — muncul di pojok tanpa overlay gelap */}
        <div className="card-actions">
          {logo.logoUrl && (
            <button className="btn-action btn-view" onClick={handleViewLogo} title="View on LogoGround">
              <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                <path d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3M10 2h4m0 0v4m0-4L7 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              View
            </button>
          )}
          {logo.mockupFolderId && (
            <button
              className={`btn-action btn-mockup ${showMockup ? 'active' : ''}`}
              onClick={handleToggleMockup}
              title="Toggle mockups"
            >
              {loadingMockup ? (
                <span className="spinner" />
              ) : (
                <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                  <rect x="1" y="3" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M4 13h8M11 6h3v7H6v-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              )}
              {showMockup ? 'Hide' : 'Mockup'}
            </button>
          )}
        </div>
      </div>

      {/* Mockup strip */}
      {showMockup && mockupImages.length > 0 && (
        <div className="mockup-strip" onClick={e => e.stopPropagation()}>
          {mockupImages.map(img => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.id}
              src={img.thumbnailUrl}
              alt="mockup"
              className="mockup-thumb"
              loading="lazy"
            />
          ))}
        </div>
      )}
      {showMockup && mockupImages.length === 0 && !loadingMockup && (
        <div className="mockup-empty">No mockup images found</div>
      )}

      <div className="card-body">
        <div className="card-cats">
          {allCategories.map(cat => (
            <span key={cat} className="cat-badge">{cat}</span>
          ))}
        </div>
        <h3 className="card-title">{logo.title}</h3>
        <p className="card-desc">{logo.description}</p>
        <div className="card-footer">
          <span className="card-price">{priceDisplay}</span>
          <span className="card-creator">by {logo.creator}</span>
        </div>
      </div>

      <style jsx>{`
        .logo-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
          cursor: pointer;
        }
        .logo-card:hover {
          border-color: var(--border-hover);
          box-shadow: var(--shadow-card), var(--shadow-glow);
          transform: translateY(-3px);
        }

        .card-image-wrap {
          position: relative;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: #0D0D15;
        }
        .card-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 16px;
          transition: transform 0.4s ease;
        }
        .logo-card:hover .card-image {
          transform: scale(1.04);
        }
        .card-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 3rem;
          font-weight: 700;
          color: var(--text-muted);
          background: linear-gradient(135deg, #0D0D15, #14141F);
        }

        /* Action buttons pojok kanan atas — tanpa overlay gelap */
        .card-actions {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          gap: 6px;
          opacity: 0;
          transform: translateY(-4px);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .logo-card:hover .card-actions {
          opacity: 1;
          transform: translateY(0);
        }
        .btn-action {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 10px;
          border-radius: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          backdrop-filter: blur(8px);
          transition: background 0.2s;
          white-space: nowrap;
        }
        .btn-view {
          background: rgba(245, 200, 66, 0.9);
          color: #0A0A0F;
        }
        .btn-view:hover { background: rgba(245, 200, 66, 1); }
        .btn-mockup {
          background: rgba(20, 20, 30, 0.85);
          color: var(--text-primary);
          border: 1px solid rgba(255,255,255,0.15);
        }
        .btn-mockup:hover { background: rgba(40, 40, 55, 0.95); }
        .btn-mockup.active {
          background: rgba(79, 142, 247, 0.25);
          border-color: rgba(79, 142, 247, 0.5);
          color: var(--accent-blue);
        }

        .spinner {
          width: 10px;
          height: 10px;
          border: 1.5px solid rgba(255,255,255,0.2);
          border-top-color: var(--text-primary);
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Mockup horizontal scroll strip */
        .mockup-strip {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 10px 12px;
          background: #0D0D15;
          border-top: 1px solid var(--border);
          scrollbar-width: thin;
          scrollbar-color: var(--text-muted) transparent;
        }
        .mockup-strip::-webkit-scrollbar { height: 3px; }
        .mockup-strip::-webkit-scrollbar-thumb { background: var(--text-muted); border-radius: 2px; }
        .mockup-thumb {
          height: 72px;
          width: auto;
          border-radius: 6px;
          object-fit: cover;
          flex-shrink: 0;
          border: 1px solid var(--border);
          transition: transform 0.2s;
          cursor: zoom-in;
        }
        .mockup-thumb:hover { transform: scale(1.05); }
        .mockup-empty {
          padding: 12px 16px;
          font-size: 12px;
          color: var(--text-muted);
          background: #0D0D15;
          border-top: 1px solid var(--border);
          text-align: center;
        }

        .card-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .card-cats {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .cat-badge {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--accent-blue);
          background: var(--accent-blue-dim);
          padding: 3px 8px;
          border-radius: 4px;
        }
        .card-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .card-desc {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }
        .card-price {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: var(--accent-gold);
        }
        .card-creator {
          font-size: 11px;
          color: var(--text-muted);
          font-style: italic;
        }
      `}</style>
    </article>
  )
}
