'use client'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-dot" />
          <span>LogoFolio</span>
        </div>
        <p className="footer-text">
          Premium logos by{' '}
          <a
            href="https://www.logoground.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            jeflodesign
          </a>{' '}
          · Powered by{' '}
          <a
            href="https://conversa2026.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Conversa AI
          </a>
        </p>
      </div>
      <style jsx>{`
        .footer {
          border-top: 1px solid var(--border);
          margin-top: 20px;
        }
        .footer-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 28px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: var(--text-secondary);
        }
        .footer-dot {
          width: 6px;
          height: 6px;
          background: var(--accent-gold);
          border-radius: 50%;
          opacity: 0.6;
        }
        .footer-text {
          font-size: 13px;
          color: var(--text-muted);
        }
        .footer-link {
          color: var(--text-secondary);
          transition: color 0.2s;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .footer-link:hover { color: var(--accent-gold); }
      `}</style>
    </footer>
  )
}
