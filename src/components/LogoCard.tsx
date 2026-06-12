'use client'

import { useState } from 'react'
import { Logo, getGoogleDriveImageUrl } from '@/lib/sheets'

interface LogoCardProps {
  logo: Logo
}

export default function LogoCard({ logo }: LogoCardProps) {
  const [showMockup, setShowMockup] = useState(false)
  const [imgError, setImgError] = useState(false)

  const imageUrl = getGoogleDriveImageUrl(logo.logoShow)
  const mockupFolderUrl = logo.mockups

  const priceDisplay = logo.price
    ? `$${logo.price.toLocaleString()}`
    : 'Contact'

  const allCategories = [
    logo.mainCategory,
    ...logo.secondCategories,
  ].filter(Boolean).slice(0, 3)

  return (
    <article className="logo-card">
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
        <div className="card-shimmer" />
        <div className="card-overlay">
          <div className="card-actions">
            {logo.logoUrl && (
              <a
                href={logo.logoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                View Logo
              </a>
            )}
            {mockupFolderUrl && (
              <button
                className="btn-ghost"
                onClick={() => setShowMockup(!showMockup)}
              >
                {showMockup ? 'Hide' : 'Mockups'}
              </button>
            )}
          </div>
        </div>
      </div>

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
          position: relative;
          cursor: default;
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

        /* Golden shimmer sweep on hover */
        .card-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 30%,
            rgba(245, 200, 66, 0.08) 50%,
            transparent 70%
          );
          opacity: 0;
          transform: translateX(-100%);
          transition: none;
          pointer-events: none;
        }
        .logo-card:hover .card-shimmer {
          opacity: 1;
          transform: translateX(100%);
          transition: transform 0.6s ease, opacity 0.3s ease;
        }

        .card-overlay {
          position: absolute;
          inset: 0;
          background: var(--bg-overlay);
          display: flex;
          align-items: flex-end;
          padding: 16px;
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .logo-card:hover .card-overlay {
          opacity: 1;
        }

        .card-actions {
          display: flex;
          gap: 8px;
          width: 100%;
        }
        .btn-primary {
          flex: 1;
          background: var(--gradient-gold);
          color: #0A0A0F;
          border: none;
          border-radius: var(--radius-sm);
          padding: 9px 14px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          text-align: center;
          transition: opacity 0.2s;
        }
        .btn-primary:hover { opacity: 0.88; }
        .btn-ghost {
          background: rgba(255,255,255,0.08);
          color: var(--text-primary);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: var(--radius-sm);
          padding: 9px 14px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.14); }

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
