'use client'

import { useEffect } from 'react'
import { Logo, getGoogleDriveImageUrl, getEffectivePrice } from '@/lib/sheets'

interface LogoLightboxProps {
  logo: Logo
  onClose: () => void
  isLiked: boolean
  onToggleLike: (e: React.MouseEvent) => void
  canLike: boolean
}

export default function LogoLightbox({ logo, onClose, isLiked, onToggleLike, canLike }: LogoLightboxProps) {
  const imageUrl = getGoogleDriveImageUrl(logo.logoShow)
  const { price: effectivePrice, isSpecial } = getEffectivePrice(logo)
  const savedAmount = isSpecial ? logo.price - effectivePrice : 0
  const priceDisplay = effectivePrice ? '$' + effectivePrice.toLocaleString() : 'Contact'
  const allCategories = [logo.mainCategory, ...logo.secondCategories].filter(Boolean)

  // Tutup dengan tombol Escape, dan lock scroll body selagi terbuka
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-panel" onClick={e => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose} title="Close">
          <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="lightbox-image-wrap">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={logo.title} className="lightbox-image" />
          ) : (
            <div className="lightbox-image-placeholder">
              <span>{logo.title.charAt(0)}</span>
            </div>
          )}
          <button
            className={'lightbox-like' + (isLiked ? ' liked' : '')}
            onClick={onToggleLike}
            title={canLike ? (isLiked ? 'Unlike' : 'Like') : 'Sign in to like'}
          >
            <svg viewBox="0 0 16 16" fill={isLiked ? 'currentColor' : 'none'} width="16" height="16">
              <path d="M8 13.5S1.5 9.5 1.5 5.5a3.5 3.5 0 016.5-1.8A3.5 3.5 0 0114.5 5.5c0 4-6.5 8-6.5 8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="lightbox-body">
          <div className="lightbox-cats">
            {allCategories.map(cat => (
              <span key={cat} className="lightbox-cat-badge">{cat}</span>
            ))}
          </div>

          <h2 className="lightbox-title">{logo.title}</h2>
          <p className="lightbox-creator">by {logo.creator}</p>

          <p className="lightbox-desc">{logo.description}</p>

          {logo.keywords && (
            <p className="lightbox-keywords">{logo.keywords}</p>
          )}

          <div className="lightbox-price-row">
            {isSpecial && (
              <span className="lightbox-price-original">${logo.price.toLocaleString()}</span>
            )}
            <span className="lightbox-price" style={{ color: isSpecial ? '#F5C842' : 'var(--accent-gold)' }}>
              {priceDisplay}
            </span>
            {isSpecial && savedAmount > 0 && (
              <span className="lightbox-save-badge">Save ${savedAmount}</span>
            )}
          </div>

          {logo.logoUrl && (
            <a
              href={logo.logoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="lightbox-cta"
            >
              View Full Details
            </a>
          )}
        </div>
      </div>

      <style jsx>{`
        .lightbox-overlay {
          position: fixed;
          inset: 0;
          background: rgba(8, 8, 12, 0.82);
          backdrop-filter: blur(6px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: fadeIn 0.18s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .lightbox-panel {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          max-width: 920px;
          width: 100%;
          max-height: 88vh;
          overflow-y: auto;
          display: flex;
          position: relative;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }

        .lightbox-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(20,20,30,0.85);
          border: 1px solid rgba(255,255,255,0.15);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2;
          backdrop-filter: blur(8px);
          transition: background 0.2s;
        }
        .lightbox-close:hover { background: rgba(255,77,109,0.25); }

        .lightbox-image-wrap {
          position: relative;
          flex: 1 1 50%;
          min-width: 0;
          background: #0D0D15;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
        }
        .lightbox-image {
          max-width: 100%;
          max-height: 480px;
          object-fit: contain;
        }
        .lightbox-image-placeholder {
          width: 100%;
          aspect-ratio: 1/1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 4rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .lightbox-like {
          position: absolute;
          top: 16px;
          left: 16px;
          width: 38px; height: 38px;
          border-radius: 50%;
          background: rgba(20,20,30,0.85);
          border: 1px solid rgba(255,255,255,0.15);
          color: var(--text-muted);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: all 0.2s;
        }
        .lightbox-like.liked {
          color: #FF4D6D;
          border-color: rgba(255,77,109,0.4);
          background: rgba(255,77,109,0.15);
        }
        .lightbox-like:hover { transform: scale(1.1); color: #FF4D6D; }

        .lightbox-body {
          flex: 1 1 50%;
          min-width: 0;
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .lightbox-cats {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .lightbox-cat-badge {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--accent-blue);
          background: var(--accent-blue-dim);
          padding: 4px 10px;
          border-radius: 4px;
        }

        .lightbox-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.25;
          margin-top: 4px;
        }
        .lightbox-creator {
          font-size: 13px;
          color: var(--text-muted);
          font-style: italic;
        }

        .lightbox-desc {
          font-size: 14.5px;
          line-height: 1.65;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .lightbox-keywords {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .lightbox-price-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 8px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        .lightbox-price {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 26px;
        }
        .lightbox-price-original {
          font-size: 15px;
          color: var(--text-muted);
          text-decoration: line-through;
          font-family: 'Space Grotesk', sans-serif;
        }
        .lightbox-save-badge {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: #F5C842;
          background: rgba(245,200,66,0.12);
          border: 1px solid rgba(245,200,66,0.3);
          padding: 3px 9px;
          border-radius: 4px;
        }

        .lightbox-cta {
          margin-top: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-gold);
          color: #0A0A0F;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 14px;
          padding: 13px 24px;
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .lightbox-cta:hover { opacity: 0.88; }

        @media (max-width: 720px) {
          .lightbox-panel { flex-direction: column; max-height: 92vh; }
          .lightbox-image-wrap { padding: 24px; }
          .lightbox-body { padding: 24px 20px 28px; }
        }
      `}</style>
    </div>
  )
}
