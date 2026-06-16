'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'

function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })

  useEffect(() => {
    const end = new Date(endDate)
    const tick = () => {
      const now = new Date()
      const diff = end.getTime() - now.getTime()
      if (diff <= 0) return
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endDate])

  const units = [
    { val: timeLeft.days, label: 'Days' },
    { val: timeLeft.hours, label: 'Hrs' },
    { val: timeLeft.mins, label: 'Min' },
    { val: timeLeft.secs, label: 'Sec' },
  ]

  return (
    <div className="countdown-wrapper">
      <span className="countdown-label-outer">Ends in</span>
      <div className="countdown">
        {units.map(({ val, label }, i) => (
          <span key={label} className="countdown-unit-wrap">
            {i > 0 && <span className="countdown-sep">:</span>}
            <span className="countdown-box">
              <span className="countdown-num">{String(val).padStart(2, '0')}</span>
              <span className="countdown-unit-label">{label}</span>
            </span>
          </span>
        ))}
      </div>
      <style jsx>{`
        .countdown-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(245, 200, 66, 0.07);
          border: 1px solid rgba(245, 200, 66, 0.22);
          border-radius: 12px;
          padding: 8px 14px;
          backdrop-filter: blur(6px);
        }
        .countdown-label-outer {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          white-space: nowrap;
        }
        .countdown {
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .countdown-unit-wrap {
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .countdown-sep {
          color: rgba(245, 200, 66, 0.5);
          font-weight: 700;
          font-size: 16px;
          line-height: 1;
          padding-bottom: 8px;
          display: inline-block;
        }
        .countdown-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(245, 200, 66, 0.1);
          border: 1px solid rgba(245, 200, 66, 0.2);
          border-radius: 8px;
          padding: 5px 9px 4px;
          min-width: 42px;
          position: relative;
          overflow: hidden;
        }
        .countdown-box::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(245,200,66,0.4), transparent);
        }
        .countdown-num {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 17px;
          color: var(--accent-gold);
          line-height: 1.15;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }
        .countdown-unit-label {
          font-size: 9px;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-top: 1px;
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  )
}

export default function Header({ logoCount, hasActiveSale, saleEndDate }: {
  logoCount: number
  hasActiveSale?: boolean
  saleEndDate?: string
}) {
  const { data: session } = useSession()

  return (
    <header className="header">

      {/* Announcement bar — marquee ticker */}
      {hasActiveSale && (
        <div className="announce-bar">
          <div className="marquee-wrap">
            <div className="marquee-track">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="marquee-item">
                  ⚡ Special Price — All logos now only <strong>$300</strong> &nbsp;·&nbsp; Limited time offer &nbsp;·&nbsp; Grab yours before it ends &nbsp;&nbsp;&nbsp;
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main topbar */}
      <div className="header-inner">
        <div className="logo-mark">
          <span className="mark-dot" />
          <span className="mark-text">VibeLogos</span>
        </div>

        <div className="header-right">
          {/* Countdown */}
          {hasActiveSale && saleEndDate && (
            <CountdownTimer endDate={saleEndDate} />
          )}

          {/* Auth */}
          {session?.user ? (
            <div className="user-info">
              {session.user.image && (
                <img src={session.user.image} alt="avatar" className="avatar" />
              )}
              <span className="user-name">{session.user.name}</span>
              <button className="btn-signout" onClick={() => signOut()}>Sign out</button>
            </div>
          ) : (
            <button className="btn-signin" onClick={() => signIn('google')}>
              <svg viewBox="0 0 24 24" width="15" height="15">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in
            </button>
          )}
        </div>
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
        {hasActiveSale && (
          <div className="hero-sale">
            <span className="hero-sale-icon">✦</span>
            All logos now only <strong>$300</strong> — special price this month only
          </div>
        )}
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
        .header { position: relative; z-index: 1; }

        /* Announcement bar */
        .announce-bar {
          background: linear-gradient(90deg, rgba(245,200,66,0.12), rgba(245,200,66,0.06), rgba(245,200,66,0.12));
          border-bottom: 1px solid rgba(245,200,66,0.2);
          overflow: hidden;
          padding: 8px 0;
        }
        .marquee-wrap { overflow: hidden; width: 100%; }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 28s linear infinite;
        }
        .marquee-track:hover { animation-play-state: paused; }
        .marquee-item {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: var(--text-secondary);
          white-space: nowrap;
          padding: 0 8px;
        }
        .marquee-item strong { color: var(--accent-gold); font-weight: 600; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Topbar */
        .header-inner {
          max-width: 1600px; margin: 0 auto;
          padding: 20px 40px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .logo-mark { display: flex; align-items: center; gap: 10px; }
        .mark-dot {
          width: 8px; height: 8px;
          background: var(--gradient-gold); border-radius: 50%;
          box-shadow: 0 0 12px rgba(245,200,66,0.6);
        }
        .mark-text {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700; font-size: 18px;
          letter-spacing: -0.03em; color: var(--text-primary);
        }

        .header-right { display: flex; align-items: center; gap: 16px; }

        .user-info { display: flex; align-items: center; gap: 10px; }
        .avatar {
          width: 30px; height: 30px; border-radius: 50%;
          border: 2px solid rgba(245,200,66,0.4); object-fit: cover;
        }
        .user-name {
          font-size: 13px; color: var(--text-secondary);
          font-family: 'Inter', sans-serif;
          max-width: 120px; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
        }
        .btn-signout {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 8px; padding: 7px 12px;
          color: var(--text-muted); font-family: 'Inter', sans-serif;
          font-size: 12px; cursor: pointer; transition: all 0.2s;
        }
        .btn-signout:hover { border-color: rgba(245,200,66,0.3); color: var(--text-primary); }
        .btn-signin {
          display: flex; align-items: center; gap: 8px;
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 10px; padding: 9px 16px;
          color: var(--text-primary); font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s;
        }
        .btn-signin:hover { border-color: rgba(245,200,66,0.4); background: var(--bg-card-hover); }

        /* Hero */
        .hero {
          max-width: 1600px; margin: 0 auto;
          padding: 48px 40px 56px; position: relative;
        }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 500;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--accent-gold); background: var(--accent-gold-dim);
          border: 1px solid rgba(245,200,66,0.2);
          padding: 6px 14px; border-radius: 100px; margin-bottom: 24px;
        }
        .eyebrow-dot {
          width: 5px; height: 5px; background: var(--accent-gold);
          border-radius: 50%; animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .hero-title {
          font-size: clamp(2.2rem, 5vw, 3.8rem);
          font-weight: 700; line-height: 1.1;
          letter-spacing: -0.04em; color: var(--text-primary);
          margin-bottom: 20px; max-width: 640px;
        }
        .hero-title em {
          font-style: italic;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Sale callout di hero */
        .hero-sale {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'Inter', sans-serif; font-size: 14px;
          color: var(--text-secondary);
          background: rgba(245,200,66,0.07);
          border: 1px solid rgba(245,200,66,0.2);
          border-radius: var(--radius-md);
          padding: 10px 18px; margin-bottom: 20px;
          animation: glow-pulse 3s ease-in-out infinite;
        }
        .hero-sale strong { color: var(--accent-gold); font-weight: 700; font-size: 16px; }
        .hero-sale-icon { color: var(--accent-gold); font-size: 12px; }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 0 rgba(245,200,66,0); border-color: rgba(245,200,66,0.2); }
          50% { box-shadow: 0 0 20px rgba(245,200,66,0.12); border-color: rgba(245,200,66,0.4); }
        }

        .hero-sub {
          font-size: 16px; color: var(--text-secondary);
          max-width: 480px; line-height: 1.7; margin-bottom: 32px;
        }
        .hero-scroll-hint {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 13px; color: var(--text-muted);
          animation: bounce 2.5s ease-in-out infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
        .hero::before {
          content: ''; position: absolute; top: 0; left: -10%;
          width: 60%; height: 100%;
          background: radial-gradient(ellipse at 30% 50%, rgba(79,142,247,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero::after {
          content: ''; position: absolute; top: 20%; right: 5%;
          width: 40%; height: 80%;
          background: radial-gradient(ellipse at 70% 40%, rgba(245,200,66,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .header-inner { padding: 16px; }
          .hero { padding: 32px 16px 40px; }
          .user-name { display: none; }
          .hero-sale { font-size: 12px; }
        }
      `}</style>
    </header>
  )
}
