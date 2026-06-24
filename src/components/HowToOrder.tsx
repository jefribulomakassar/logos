'use client'

import { useState } from 'react'
import ContactModal from './ContactModal'

// ─── Config — samakan dengan LogoCard.tsx ─────────────────────────────────────
// const WA_NUMBER = '6282xxxxxxxxx' // [DINONAKTIFKAN] ganti dengan nomor WA kamu (format internasional, tanpa +) — uncomment untuk reaktivasi WA
const LG_PORTFOLIO_URL = 'https://www.logoground.com/profile.php?id=jeflodesign' // URL profil LogoGround
const LG_TERMS_URL = 'https://www.logoground.com/user-agreement.php' // User Agreement resmi LogoGround
const LG_FAQ_URL = 'https://www.logoground.com/faq.php' // Buyer FAQ resmi LogoGround
// ──────────────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: '01',
    title: 'Browse & pick your logo',
    desc: 'Filter by category, preview mockups, and find the logo that fits your brand identity.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Contact via email or LogoGround',
    desc: 'Send us a quick message through our contact form, or click straight through to LogoGround.com to purchase the logo you like directly on the platform.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path d="M3 5h18v14H3V5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M3 5l9 7 9-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Logo processed by the LogoGround team',
    desc: 'Once your order and payment are confirmed, the LogoGround team takes it from there until completion — full ownership and copyright then transfer to you, in accordance with LogoGround\'s Terms & Conditions.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path d="M12 2v10m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 15v4a2 2 0 002 2h14a2 2 0 002-2v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
]

const INCLUDED = [
  '.SVG (Vector source file format)',
  '100% exclusive ownership',
  'Full copyright transfer',
]

export default function HowToOrder() {
  const [showContactModal, setShowContactModal] = useState(false)

  // [DINONAKTIFKAN] handleWa — uncomment untuk reaktivasi tombol WhatsApp
  // const handleWa = () => {
  //   const msg = encodeURIComponent("Hi! I'd like to order a logo from VibeLogos. Can you help me?")
  //   window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank')
  // }

  const handleEmail = () => {
    setShowContactModal(true)
  }

  const handleLogoGround = () => {
    window.open(LG_PORTFOLIO_URL, '_blank')
  }

  return (
    <>
    <section className="how-section">
      <div className="how-inner">
        <div className="how-header">
          <span className="how-label">Simple process</span>
          <h2 className="how-title">How to order</h2>
          <p className="how-subtitle">
            From browsing to owning your exclusive logo — done in three steps.
          </p>
        </div>

        {/* Steps */}
        <div className="steps-grid">
          {STEPS.map((step, i) => (
            <div key={step.num} className="step-card">
              <div className="step-top">
                <div className="step-icon">{step.icon}</div>
                <span className="step-num">{step.num}</span>
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
              {i < STEPS.length - 1 && <div className="step-connector" aria-hidden="true" />}
            </div>
          ))}
        </div>

        {/* What's included */}
        <div className="included-wrap">
          <p className="included-label">What's included in every purchase</p>
          <ul className="included-list">
            {INCLUDED.map(item => (
              <li key={item} className="included-item">
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14" className="check-icon">
                  <circle cx="8" cy="8" r="7" fill="rgba(37,211,102,0.15)" stroke="rgba(37,211,102,0.4)" strokeWidth="1"/>
                  <path d="M5 8l2 2 4-4" stroke="#25D366" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="how-cta">
          {/* [DINONAKTIFKAN] Tombol WhatsApp — uncomment untuk reaktivasi
          <button className="cta-wa" onClick={handleWa}>
            <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
              <path d="M8 1C4.13 1 1 4.13 1 8c0 1.26.33 2.45.9 3.48L1 15l3.62-.88A7 7 0 108 1zm0 12.5a5.5 5.5 0 110-11 5.5 5.5 0 010 11zm2.94-3.83c-.16-.08-.96-.47-1.1-.53-.15-.06-.26-.08-.37.08-.11.16-.43.53-.52.64-.1.11-.19.12-.35.04-.96-.48-1.6-1.07-2.09-2-.16-.28.16-.26.45-.86.05-.11.03-.21-.02-.29-.04-.08-.37-.89-.51-1.22-.13-.31-.27-.27-.37-.27-.1 0-.2-.01-.31-.01s-.29.04-.44.22c-.15.17-.58.57-.58 1.38s.6 1.6.68 1.71c.08.11 1.17 1.79 2.84 2.51 1.67.72 1.67.48 1.97.45.3-.03.96-.39 1.1-.77.14-.38.14-.7.1-.77-.05-.07-.16-.11-.33-.19z"/>
            </svg>
            Order via WhatsApp
          </button>
          */}
          <button className="cta-email" onClick={handleEmail}>
            <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
              <path d="M2 4h12v8H2V4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M2 4l6 4.5L14 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Contact via Email
          </button>
          <button className="cta-lg" onClick={handleLogoGround}>
            <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
              <path d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3M10 2h4m0 0v4m0-4L7 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Buy on LogoGround
          </button>
        </div>

        <div className="terms-note">
          <p className="terms-text">
            All logos shown here are listed on LogoGround.com. Final file formats, revision terms, and the copyright transfer process are determined by LogoGround's official policies — please read these before purchasing so you know exactly what you're getting.
          </p>
          <div className="terms-links">
            <a href={LG_FAQ_URL} target="_blank" rel="noopener noreferrer" className="terms-link">
              Buyer FAQ ↗
            </a>
            <a href={LG_TERMS_URL} target="_blank" rel="noopener noreferrer" className="terms-link">
              User Agreement &amp; Terms ↗
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .how-section {
          padding: 60px 20px;
          border-top: 1px solid var(--border);
          background: var(--bg-card);
        }
        .how-inner {
          max-width: 860px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        .how-header {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .how-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent-blue);
        }
        .how-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }
        .how-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 480px;
        }

        /* Steps grid */
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          position: relative;
        }
        .step-card {
          background: var(--bg-secondary, #0D0D15);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
          transition: border-color 0.2s;
        }
        .step-card:hover {
          border-color: var(--border-hover);
        }
        .step-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .step-icon {
          color: var(--accent-gold);
        }
        .step-num {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: var(--border-hover, rgba(255,255,255,0.08));
          line-height: 1;
          user-select: none;
        }
        .step-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.35;
        }
        .step-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        /* Connector arrow between steps (desktop only) */
        .step-connector {
          display: none;
        }

        /* What's included */
        .included-wrap {
          background: var(--bg-secondary, #0D0D15);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px 24px;
        }
        .included-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 14px;
        }
        .included-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px 24px;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .included-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .check-icon {
          flex-shrink: 0;
        }

        /* CTA */
        .how-cta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        /* [DINONAKTIFKAN] .cta-wa — uncomment untuk reaktivasi tombol WhatsApp
        .cta-wa {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 22px;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background: #25D366;
          color: #fff;
          transition: background 0.2s, transform 0.15s;
        }
        .cta-wa:hover {
          background: #1EBF5A;
          transform: translateY(-1px);
        }
        */
        .cta-email {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 22px;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background: var(--accent-gold);
          color: #0A0A0F;
          transition: background 0.2s, transform 0.15s;
        }
        .cta-email:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .cta-lg {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 22px;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          background: transparent;
          color: var(--text-primary);
          border: 1px solid var(--border-hover, rgba(255,255,255,0.2));
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
        }
        .cta-lg:hover {
          border-color: var(--accent-gold);
          color: var(--accent-gold);
          transform: translateY(-1px);
        }

        .terms-note {
          background: rgba(79,142,247,0.06);
          border: 1px solid rgba(79,142,247,0.2);
          border-radius: var(--radius-md);
          padding: 16px 20px;
          margin-top: -16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .terms-text {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.65;
        }
        .terms-links {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
        }
        .terms-link {
          font-size: 12px;
          font-weight: 600;
          color: var(--accent-blue);
          text-decoration: none;
        }
        .terms-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .how-section { padding: 40px 16px; }
          .how-title { font-size: 22px; }
          .steps-grid { grid-template-columns: 1fr; }
          .included-list { grid-template-columns: 1fr; }
          .how-cta { flex-direction: column; }
          .cta-email, .cta-lg { justify-content: center; }
        }
      `}</style>
    </section>

    {showContactModal && (
      <ContactModal onClose={() => setShowContactModal(false)} />
    )}
    </>
  )
}
