'use client'

import { useEffect, useState, useCallback } from 'react'
import { Logo, getEffectivePrice } from '@/lib/sheets'

// ─── Config ───────────────────────────────────────────────────────────────────
const WA_NUMBER = '6282xxxxxxxxx' // ganti dengan nomor WA kamu
const GMAIL = 'jeflodesign@gmail.com'
// ──────────────────────────────────────────────────────────────────────────────

interface MockupImage {
  id: string
  thumbnailUrl: string
}

interface MockupLightboxProps {
  logo: Logo
  images: MockupImage[]
  onClose: () => void
}

export default function MockupLightbox({ logo, images, onClose }: MockupLightboxProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [zoomed, setZoomed] = useState(false)

  const { price: effectivePrice, isSpecial } = getEffectivePrice(logo)
  const savedAmount = isSpecial ? logo.price - effectivePrice : 0
  const priceDisplay = effectivePrice ? '$' + effectivePrice.toLocaleString() : 'Contact'

  // Keyboard navigation
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowRight') setActiveIdx(i => (i + 1) % images.length)
    if (e.key === 'ArrowLeft') setActiveIdx(i => (i - 1 + images.length) % images.length)
  }, [images.length, onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  const handleBuyOnLogoGround = () => {
    if (logo.logoUrl) window.open(logo.logoUrl, '_blank')
  }

  const handleOrderWa = () => {
    const msg = encodeURIComponent(
      `Hi! I'm interested in purchasing the *${logo.title}* logo (${priceDisplay}).\n\nListing: ${logo.logoUrl}\n\nIs it still available?`
    )
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank')
  }

  const handleEmail = () => {
    const subject = encodeURIComponent(`Logo Purchase Inquiry: ${logo.title}`)
    const body = encodeURIComponent(
      `Hi Jefri,\n\nI'd like to inquire about purchasing the "${logo.title}" logo (${priceDisplay}).\n\nListing: ${logo.logoUrl}\n\nPlease send me the payment details.\n\nThank you.`
    )
    window.open(`mailto:${GMAIL}?subject=${subject}&body=${body}`, '_blank')
  }

  const activeImage = images[activeIdx]

  return (
    <div className="mlb-backdrop" onClick={onClose}>
      <div className="mlb-panel" onClick={e => e.stopPropagation()}>

        {/* ── Close ── */}
        <button className="mlb-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>

        {/* ── Left: image viewer ── */}
        <div className="mlb-viewer">
          {/* Main image */}
          <div className={'mlb-main-wrap' + (zoomed ? ' zoomed' : '')} onClick={() => setZoomed(z => !z)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage.thumbnailUrl}
              alt={`${logo.title} mockup ${activeIdx + 1}`}
              className="mlb-main-img"
              draggable={false}
            />
            <div className="mlb-zoom-hint">
              {zoomed ? (
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M10 10l4 4M1 7h4M7 1v4M2.5 7a4.5 4.5 0 109 0 4.5 4.5 0 00-9 0z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              ) : (
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M10 10l4 4M5 3v4M3 5h4M2.5 7a4.5 4.5 0 109 0 4.5 4.5 0 00-9 0z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              )}
              {zoomed ? 'Click to zoom out' : 'Click to zoom in'}
            </div>
          </div>

          {/* Arrow nav */}
          {images.length > 1 && (
            <>
              <button
                className="mlb-arrow mlb-arrow-left"
                onClick={() => setActiveIdx(i => (i - 1 + images.length) % images.length)}
                aria-label="Previous"
              >
                <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                className="mlb-arrow mlb-arrow-right"
                onClick={() => setActiveIdx(i => (i + 1) % images.length)}
                aria-label="Next"
              >
                <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          )}

          {/* Counter */}
          <div className="mlb-counter">{activeIdx + 1} / {images.length}</div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="mlb-thumbs">
              {images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.thumbnailUrl}
                  alt={`mockup ${i + 1}`}
                  className={'mlb-thumb' + (i === activeIdx ? ' active' : '')}
                  onClick={() => setActiveIdx(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Right: info + CTA ── */}
        <div className="mlb-info">
          <div className="mlb-info-top">
            <div className="mlb-badge">Mockup Preview</div>
            <h2 className="mlb-title">{logo.title}</h2>
            <p className="mlb-desc">{logo.description}</p>

            {/* What's included */}
            <div className="mlb-includes">
              <p className="mlb-includes-label">What you get</p>
              <ul className="mlb-includes-list">
                {['Adobe Illustrator .AI source', 'Vector .SVG file', 'High-res .PNG (transparent)', 'Print-ready .PDF', '100% exclusive ownership', 'Full commercial rights'].map(item => (
                  <li key={item}>
                    <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                      <circle cx="6" cy="6" r="5.5" fill="rgba(37,211,102,0.15)" stroke="rgba(37,211,102,0.45)" strokeWidth="0.8"/>
                      <path d="M3.5 6l1.5 1.5 3-3" stroke="#25D366" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust signals */}
            <div className="mlb-trust">
              <span className="trust-pill">
                <svg viewBox="0 0 12 12" fill="none" width="11" height="11"><path d="M6 1l1.3 2.6L10 4.1 8 6.1l.5 2.9L6 7.6 3.5 9l.5-2.9L2 4.1l2.7-.5L6 1z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/></svg>
                Exclusive
              </span>
              <span className="trust-pill">
                <svg viewBox="0 0 12 12" fill="none" width="11" height="11"><path d="M6 1v5m0 0l-2-2m2 2l2-2M2 9h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Files in 24h
              </span>
              <span className="trust-pill">
                <svg viewBox="0 0 12 12" fill="none" width="11" height="11"><path d="M6 1a5 5 0 100 10A5 5 0 006 1zM4 6l1.5 1.5L8 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
                1 owner only
              </span>
            </div>
          </div>

          {/* Pricing + CTA */}
          <div className="mlb-cta-block">
            <div className="mlb-pricing">
              {isSpecial ? (
                <>
                  <div className="mlb-price-row">
                    <span className="mlb-price-now">{priceDisplay}</span>
                    <span className="mlb-price-was">${logo.price.toLocaleString()}</span>
                  </div>
                  {savedAmount > 0 && (
                    <div className="mlb-save-badge">You save ${savedAmount.toLocaleString()} — limited time offer</div>
                  )}
                </>
              ) : (
                <span className="mlb-price-now">{priceDisplay}</span>
              )}
              <p className="mlb-price-note">One-time payment · No recurring fees</p>
            </div>

            <div className="mlb-cta-btns">
              <button className="cta-lg" onClick={handleBuyOnLogoGround}>
                <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
                  <path d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3M10 2h4m0 0v4m0-4L7 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Buy on LogoGround
              </button>
              <div className="cta-secondary">
                <button className="cta-wa" onClick={handleOrderWa} title="Order via WhatsApp">
                  <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                    <path d="M8 1C4.13 1 1 4.13 1 8c0 1.26.33 2.45.9 3.48L1 15l3.62-.88A7 7 0 108 1zm0 12.5a5.5 5.5 0 110-11 5.5 5.5 0 010 11zm2.94-3.83c-.16-.08-.96-.47-1.1-.53-.15-.06-.26-.08-.37.08-.11.16-.43.53-.52.64-.1.11-.19.12-.35.04-.96-.48-1.6-1.07-2.09-2-.16-.28.16-.26.45-.86.05-.11.03-.21-.02-.29-.04-.08-.37-.89-.51-1.22-.13-.31-.27-.27-.37-.27-.1 0-.2-.01-.31-.01s-.29.04-.44.22c-.15.17-.58.57-.58 1.38s.6 1.6.68 1.71c.08.11 1.17 1.79 2.84 2.51 1.67.72 1.67.48 1.97.45.3-.03.96-.39 1.1-.77.14-.38.14-.7.1-.77-.05-.07-.16-.11-.33-.19z"/>
                  </svg>
                  WhatsApp
                </button>
                <button className="cta-email" onClick={handleEmail} title="Send email inquiry">
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                    <path d="M2 3h12a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M1 4l7 5 7-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  Email
                </button>
              </div>
            </div>

            <p className="mlb-creator">Designed by <strong>{logo.creator}</strong> · Once sold, removed from marketplace</p>
          </div>
        </div>

      </div>

      <style jsx>{`
        .mlb-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.88);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

        .mlb-panel {
          position: relative;
          width: 100%;
          max-width: 960px;
          max-height: 92vh;
          background: #0D0D15;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          display: grid;
          grid-template-columns: 1fr 340px;
          overflow: hidden;
          animation: slideUp 0.25s ease;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06);
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }

        .mlb-close {
          position: absolute;
          top: 14px; right: 14px;
          z-index: 10;
          width: 32px; height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: var(--text-secondary, #aaa);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .mlb-close:hover { background: rgba(255,255,255,0.15); color: #fff; }

        /* ── Viewer (left) ── */
        .mlb-viewer {
          position: relative;
          background: #060609;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .mlb-main-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: zoom-in;
          overflow: hidden;
          min-height: 0;
        }
        .mlb-main-wrap.zoomed { cursor: zoom-out; }
        .mlb-main-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          padding: 24px;
          transition: transform 0.3s ease;
          user-select: none;
        }
        .mlb-main-wrap.zoomed .mlb-main-img { transform: scale(1.55); }

        .mlb-zoom-hint {
          position: absolute;
          bottom: 12px; left: 50%;
          transform: translateX(-50%);
          display: flex; align-items: center; gap: 5px;
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          background: rgba(0,0,0,0.5);
          padding: 4px 10px;
          border-radius: 20px;
          pointer-events: none;
          white-space: nowrap;
        }

        .mlb-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 36px; height: 36px;
          border-radius: 50%;
          background: rgba(20,20,30,0.85);
          border: 1px solid rgba(255,255,255,0.12);
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(6px);
          transition: background 0.2s;
          z-index: 5;
        }
        .mlb-arrow:hover { background: rgba(40,40,55,0.95); }
        .mlb-arrow-left { left: 12px; }
        .mlb-arrow-right { right: 12px; }

        .mlb-counter {
          position: absolute;
          top: 12px; left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          color: rgba(255,255,255,0.45);
          background: rgba(0,0,0,0.5);
          padding: 3px 10px;
          border-radius: 20px;
          white-space: nowrap;
          pointer-events: none;
        }

        .mlb-thumbs {
          display: flex;
          gap: 6px;
          padding: 10px 14px;
          overflow-x: auto;
          background: rgba(0,0,0,0.4);
          border-top: 1px solid rgba(255,255,255,0.06);
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.15) transparent;
          flex-shrink: 0;
        }
        .mlb-thumbs::-webkit-scrollbar { height: 3px; }
        .mlb-thumbs::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
        .mlb-thumb {
          height: 60px;
          width: auto;
          flex-shrink: 0;
          border-radius: 6px;
          object-fit: cover;
          border: 2px solid transparent;
          cursor: pointer;
          opacity: 0.55;
          transition: opacity 0.2s, border-color 0.2s;
        }
        .mlb-thumb:hover { opacity: 0.85; }
        .mlb-thumb.active { opacity: 1; border-color: #F5C842; }

        /* ── Info (right) ── */
        .mlb-info {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 24px 20px 20px;
          border-left: 1px solid rgba(255,255,255,0.07);
          overflow-y: auto;
          gap: 20px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .mlb-info::-webkit-scrollbar { width: 3px; }
        .mlb-info::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

        .mlb-info-top {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .mlb-badge {
          display: inline-flex;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--accent-blue, #4F8EF7);
          background: rgba(79,142,247,0.12);
          border: 1px solid rgba(79,142,247,0.25);
          padding: 3px 10px;
          border-radius: 20px;
          width: fit-content;
        }
        .mlb-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary, #fff);
          line-height: 1.25;
        }
        .mlb-desc {
          font-size: 12.5px;
          color: var(--text-secondary, #888);
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .mlb-includes {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 14px;
        }
        .mlb-includes-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted, #555);
          margin-bottom: 10px;
        }
        .mlb-includes-list {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .mlb-includes-list li {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          color: var(--text-secondary, #888);
        }

        .mlb-trust {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .trust-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-secondary, #888);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 4px 10px;
          border-radius: 20px;
        }

        /* ── CTA block ── */
        .mlb-cta-block {
          display: flex;
          flex-direction: column;
          gap: 14px;
          border-top: 1px solid rgba(255,255,255,0.07);
          padding-top: 16px;
        }
        .mlb-pricing {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .mlb-price-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }
        .mlb-price-now {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #F5C842;
        }
        .mlb-price-was {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          color: var(--text-muted, #555);
          text-decoration: line-through;
        }
        .mlb-save-badge {
          font-size: 11px;
          font-weight: 600;
          color: #25D366;
          background: rgba(37,211,102,0.1);
          border: 1px solid rgba(37,211,102,0.25);
          padding: 4px 10px;
          border-radius: 6px;
          width: fit-content;
        }
        .mlb-price-note {
          font-size: 11px;
          color: var(--text-muted, #555);
        }

        .mlb-cta-btns {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cta-lg {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          background: #F5C842;
          color: #0A0A0F;
          transition: background 0.2s, transform 0.15s;
          letter-spacing: 0.01em;
        }
        .cta-lg:hover { background: #f0c030; transform: translateY(-1px); }

        .cta-secondary {
          display: flex;
          gap: 8px;
        }
        .cta-wa, .cta-email {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 12px;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .cta-wa {
          background: rgba(37,211,102,0.12);
          color: #25D366;
          border: 1px solid rgba(37,211,102,0.3);
        }
        .cta-wa:hover { background: rgba(37,211,102,0.22); }
        .cta-email {
          background: rgba(255,255,255,0.05);
          color: var(--text-secondary, #888);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .cta-email:hover { background: rgba(255,255,255,0.1); color: var(--text-primary, #fff); }

        .mlb-creator {
          font-size: 11px;
          color: var(--text-muted, #555);
          line-height: 1.5;
          text-align: center;
        }
        .mlb-creator strong { color: var(--text-secondary, #888); }

        /* ── Responsive ── */
        @media (max-width: 700px) {
          .mlb-panel {
            grid-template-columns: 1fr;
            grid-template-rows: 55vw 1fr;
            max-height: 95vh;
          }
          .mlb-viewer { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .mlb-info { padding: 16px; }
          .mlb-title { font-size: 17px; }
          .mlb-price-now { font-size: 22px; }
        }
      `}</style>
    </div>
  )
}
