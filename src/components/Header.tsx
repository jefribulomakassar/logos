'use client'

export default function Header({ logoCount }: { logoCount: number }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo-mark">
          <span className="mark-dot" />
          <span className="mark-text">LogoFolio</span>
        </div>
        <nav className="header-nav">
          <a href="https://conversa2026.vercel.app" target="_blank" rel="noopener noreferrer" className="nav-link">
            Conversa AI ↗
          </a>
        </nav>
      </div>

      {/* Hero */}
      <div className="hero">
        <div className="hero-eyebrow">
          <span className="eyebrow-dot" />
          {logoCount} premium logos available
        </div>
        <h1 className="hero-title">
          Craft your brand with a<br />
          <em>distinctive mark.</em>
        </h1>
        <p className="hero-sub">
          Hand-crafted, unique logos ready for your brand — from technology to wildlife, each identity tells a story.
        </p>
        <div className="hero-scroll-hint">
          <span>Browse collection</span>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M8 3v10M3 9l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <style jsx>{`
        .header {
          position: relative;
          z-index: 1;
        }
        .header-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo-mark {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .mark-dot {
          width: 8px;
          height: 8px;
          background: var(--gradient-gold);
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(245, 200, 66, 0.6);
        }
        .mark-text {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 18px;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .header-nav {
          display: flex;
          gap: 24px;
          align-items: center;
        }
        .nav-link {
          font-size: 13px;
          color: var(--text-secondary);
          transition: color 0.2s;
          font-weight: 500;
        }
        .nav-link:hover { color: var(--accent-gold); }

        .hero {
          max-width: 1280px;
          margin: 0 auto;
          padding: 48px 24px 56px;
          position: relative;
        }
        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--accent-gold);
          background: var(--accent-gold-dim);
          border: 1px solid rgba(245, 200, 66, 0.2);
          padding: 6px 14px;
          border-radius: 100px;
          margin-bottom: 24px;
        }
        .eyebrow-dot {
          width: 5px;
          height: 5px;
          background: var(--accent-gold);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .hero-title {
          font-size: clamp(2.2rem, 5vw, 3.8rem);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.04em;
          color: var(--text-primary);
          margin-bottom: 20px;
          max-width: 640px;
        }
        .hero-title em {
          font-style: italic;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-size: 16px;
          color: var(--text-secondary);
          max-width: 480px;
          line-height: 1.7;
          margin-bottom: 32px;
        }

        .hero-scroll-hint {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted);
          animation: bounce 2.5s ease-in-out infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }

        /* Ambient glow behind hero */
        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: -10%;
          width: 60%;
          height: 100%;
          background: radial-gradient(ellipse at 30% 50%, rgba(79, 142, 247, 0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero::after {
          content: '';
          position: absolute;
          top: 20%;
          right: 5%;
          width: 40%;
          height: 80%;
          background: radial-gradient(ellipse at 70% 40%, rgba(245, 200, 66, 0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        @media (max-width: 640px) {
          .header-inner { padding: 18px 16px; }
          .hero { padding: 32px 16px 40px; }
        }
      `}</style>
    </header>
  )
}
