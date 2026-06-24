'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo, getGoogleDriveImageUrl, getEffectivePrice } from '@/lib/sheets'
import { useLikesContext } from './LogoGrid'
import { useSession, signIn } from 'next-auth/react'
import LogoLightbox from './LogoLightbox'

interface LogoCardProps {
  logo: Logo
  layout?: 'grid' | 'list'
}

export default function LogoCard({ logo, layout = 'grid' }: LogoCardProps) {
  const router = useRouter()
  const [imgError, setImgError] = useState(false)
  const [mockupImages, setMockupImages] = useState<{ id: string; thumbnailUrl: string }[]>([])
  const [showMockup, setShowMockup] = useState(false)
  const [loadingMockup, setLoadingMockup] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)
  const [lightboxMockup, setLightboxMockup] = useState<{ id: string; thumbnailUrl: string } | null>(null)

  const imageUrl = getGoogleDriveImageUrl(logo.logoShow)
  const { price: effectivePrice, isSpecial } = getEffectivePrice(logo)
  const savedAmount = isSpecial ? logo.price - effectivePrice : 0
  const priceDisplay = effectivePrice ? '$' + effectivePrice.toLocaleString() : 'Contact'
  const allCategories = [logo.mainCategory, ...logo.secondCategories].filter(Boolean).slice(0, 3)

  const { likedIds, toggleLike } = useLikesContext()
  const { data: session } = useSession()
  const isLiked = likedIds.has(logo.id)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!session?.user) {
      signIn('google')
      return
    }
    toggleLike(logo.id, logo.title, logo.logoUrl)
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
    if (layout === 'list') {
      setShowLightbox(true)
    } else {
      router.push(`/logo/${logo.id}`)
    }
  }

  const handleViewLogo = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (logo.logoUrl) window.open(logo.logoUrl, '_blank')
  }

  if (layout === 'list') {
    return (
      <>
        <article className={'logo-row' + (isSpecial ? ' on-sale' : '')} onClick={handleCardClick}>
          <div className="row-image-wrap">
            {!imgError && imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={logo.title}
                className="row-image"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            ) : (
              <div className="row-image-placeholder">
                <span>{logo.title.charAt(0)}</span>
              </div>
            )}
          </div>

          <div className="row-body">
            <div className="row-main">
              <h3 className="row-title">{logo.title}</h3>
              <p className="row-desc">{logo.description}</p>
              <span className="row-creator">by {logo.creator}</span>
            </div>

            <div className="row-side">
              <div className="price-wrap">
                {isSpecial && (
                  <span className="price-original">${logo.price.toLocaleString()}</span>
                )}
                <span className="row-price" style={{ color: isSpecial ? '#F5C842' : 'var(--accent-gold)' }}>
                  {priceDisplay}
                </span>
                {isSpecial && savedAmount > 0 && (
                  <span className="save-badge">Save ${savedAmount}</span>
                )}
              </div>
              <div className="row-actions">
                <button
                  className={'like-btn-row' + (isLiked ? ' liked' : '')}
                  onClick={handleLike}
                  title={session ? (isLiked ? 'Unlike' : 'Like') : 'Sign in to like'}
                >
                  <svg viewBox="0 0 16 16" fill={isLiked ? 'currentColor' : 'none'} width="14" height="14">
                    <path d="M8 13.5S1.5 9.5 1.5 5.5a3.5 3.5 0 016.5-1.8A3.5 3.5 0 0114.5 5.5c0 4-6.5 8-6.5 8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {logo.logoUrl && (
                  <button className="btn-action btn-view" onClick={handleViewLogo} title="View on LogoGround">
                    View
                  </button>
                )}
              </div>
            </div>
          </div>

          <style jsx>{`
            .logo-row {
              display: flex;
              gap: 20px;
              background: var(--bg-card);
              border: 1px solid var(--border);
              border-radius: var(--radius-lg);
              padding: 16px;
              cursor: pointer;
              transition: border-color 0.3s ease, box-shadow 0.3s ease;
            }
            .logo-row.on-sale {
              border-color: rgba(245,200,66,0.35);
              box-shadow: 0 0 16px rgba(245,200,66,0.06);
            }
            .logo-row:hover {
              border-color: var(--border-hover);
              box-shadow: var(--shadow-card);
            }
            .row-image-wrap {
              flex-shrink: 0;
              width: 110px;
              height: 110px;
              border-radius: var(--radius-md);
              overflow: hidden;
              background: #0D0D15;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .row-image {
              width: 100%;
              height: 100%;
              object-fit: contain;
              padding: 10px;
            }
            .row-image-placeholder {
              font-family: 'Space Grotesk', sans-serif;
              font-size: 2rem;
              font-weight: 700;
              color: var(--text-muted);
            }
            .row-body {
              flex: 1;
              display: flex;
              justify-content: space-between;
              gap: 16px;
              min-width: 0;
            }
            .row-main {
              display: flex;
              flex-direction: column;
              gap: 6px;
              min-width: 0;
              flex: 1;
            }
            .row-title {
              font-size: 16px;
              font-weight: 600;
              color: var(--text-primary);
              line-height: 1.3;
            }
            .row-desc {
              font-size: 13px;
              color: var(--text-secondary);
              line-height: 1.55;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            .row-creator {
              font-size: 11px;
              color: var(--text-muted);
              font-style: italic;
            }
            .row-side {
              flex-shrink: 0;
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              justify-content: space-between;
              gap: 10px;
              min-width: 120px;
            }
            .price-wrap {
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              gap: 4px;
            }
            .row-price {
              font-family: 'Space Grotesk', sans-serif;
              font-weight: 700;
              font-size: 18px;
            }
            .price-original {
              font-size: 12px;
              color: var(--text-muted);
              text-decoration: line-through;
              font-family: 'Space Grotesk', sans-serif;
            }
            .save-badge {
              font-size: 9px;
              font-weight: 600;
              letter-spacing: 0.06em;
              color: #F5C842;
              background: rgba(245,200,66,0.12);
              border: 1px solid rgba(245,200,66,0.3);
              padding: 2px 7px;
              border-radius: 4px;
            }
            .row-actions {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .like-btn-row {
              width: 30px; height: 30px;
              border-radius: 50%;
              background: rgba(20,20,30,0.85);
              border: 1px solid rgba(255,255,255,0.15);
              color: var(--text-muted);
              display: flex; align-items: center; justify-content: center;
              cursor: pointer;
              transition: all 0.2s;
            }
            .like-btn-row.liked {
              color: #FF4D6D;
              border-color: rgba(255,77,109,0.4);
              background: rgba(255,77,109,0.15);
            }
            .like-btn-row:hover { color: #FF4D6D; }
            .btn-action.btn-view {
              background: rgba(245, 200, 66, 0.9);
              color: #0A0A0F;
              font-family: 'Inter', sans-serif;
              font-size: 11px;
              font-weight: 600;
              padding: 7px 12px;
              border-radius: 6px;
              border: none;
              cursor: pointer;
              white-space: nowrap;
            }
            .btn-action.btn-view:hover { background: rgba(245, 200, 66, 1); }

            @media (max-width: 560px) {
              .logo-row { flex-wrap: wrap; }
              .row-image-wrap { width: 84px; height: 84px; }
              .row-body { flex-direction: column; gap: 10px; }
              .row-side { flex-direction: row; align-items: center; width: 100%; }
              .price-wrap { flex-direction: row; align-items: center; }
            }
          `}</style>
        </article>

        {lightboxMockup && (
          <div
            onClick={() => setLightboxMockup(null)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(8,8,12,0.9)',
              backdropFilter: 'blur(6px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxMockup.thumbnailUrl}
              alt="mockup full"
              onClick={e => e.stopPropagation()}
              style={{
                maxWidth: '90vw',
                maxHeight: '88vh',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              }}
            />
            <button
              onClick={() => setLightboxMockup(null)}
              style={{
                position: 'absolute', top: 20, right: 20,
                width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(20,20,30,0.9)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', fontSize: 20, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >×</button>
          </div>
        )}

        {showLightbox && (
          <LogoLightbox
            logo={logo}
            onClose={() => setShowLightbox(false)}
            isLiked={isLiked}
            onToggleLike={handleLike}
            canLike={!!session}
          />
        )}
      </>
    )
  }

  return (
    <article className={'logo-card' + (isSpecial ? ' on-sale' : '')} onClick={handleCardClick}>
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

        <button
          className={'like-btn' + (isLiked ? ' liked' : '')}
          onClick={handleLike}
          title={session ? (isLiked ? 'Unlike' : 'Like') : 'Sign in to like'}
        >
          <svg viewBox="0 0 16 16" fill={isLiked ? 'currentColor' : 'none'} width="14" height="14">
            <path d="M8 13.5S1.5 9.5 1.5 5.5a3.5 3.5 0 016.5-1.8A3.5 3.5 0 0114.5 5.5c0 4-6.5 8-6.5 8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

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
              onClick={() => setLightboxMockup(img)}  // ← tambah ini
            />
          ))}
        </div>
      )}
      {showMockup && mockupImages.length === 0 && !loadingMockup && (
        <div className="mockup-empty">No mockup images found</div>
      )}

      <div className="card-body">
        <h3 className="card-title">{logo.title}</h3>
        <p className="card-desc">{logo.description}</p>
        <div className="card-footer">
          <div className="price-wrap">
            {isSpecial && (
              <span className="price-original">${logo.price.toLocaleString()}</span>
            )}
            <span className="card-price" style={{ color: isSpecial ? '#F5C842' : 'var(--accent-gold)' }}>
              {priceDisplay}
            </span>
            {isSpecial && savedAmount > 0 && (
              <span className="save-badge">Save ${savedAmount}</span>
            )}
          </div>
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
        .logo-card.on-sale {
          border-color: rgba(245,200,66,0.35);
          box-shadow: 0 0 20px rgba(245,200,66,0.08);
        }
        .logo-card.on-sale:hover {
          border-color: rgba(245,200,66,0.7);
          box-shadow: 0 4px 24px rgba(0,0,0,0.4), 0 0 30px rgba(245,200,66,0.18);
        }
        .logo-card:hover {
          border-color: var(--border-hover);
          box-shadow: var(--shadow-card), var(--shadow-glow);
          transform: translateY(-3px);
        }
        .price-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .card-price {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: var(--accent-gold);
        }
        .price-original {
          font-size: 12px;
          color: var(--text-muted);
          text-decoration: line-through;
          font-family: 'Space Grotesk', sans-serif;
        }
        .save-badge {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: #F5C842;
          background: rgba(245,200,66,0.12);
          border: 1px solid rgba(245,200,66,0.3);
          padding: 2px 7px;
          border-radius: 4px;
        }
        .price-badge {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #FF4D6D;
          background: rgba(255,77,109,0.15);
          border: 1px solid rgba(255,77,109,0.3);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .like-btn {
          position: absolute;
          top: 10px; left: 10px;
          width: 32px; height: 32px;
          border-radius: 50%;
          background: rgba(20,20,30,0.85);
          border: 1px solid rgba(255,255,255,0.15);
          color: var(--text-muted);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: all 0.2s;
          opacity: 0;
        }
        .logo-card:hover .like-btn { opacity: 1; }
        .like-btn.liked {
          opacity: 1;
          color: #FF4D6D;
          border-color: rgba(255,77,109,0.4);
          background: rgba(255,77,109,0.15);
        }
        .like-btn:hover {
          transform: scale(1.1);
          color: #FF4D6D;
          border-color: rgba(255,77,109,0.4);
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
