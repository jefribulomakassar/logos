'use client'

import { useState, useEffect } from 'react'

interface ContactModalProps {
  onClose: () => void
  logoId?: string
  logoTitle?: string
}

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function ContactModal({ onClose, logoId, logoTitle }: ContactModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(
    logoTitle ? `Hi! I'm interested in the "${logoTitle}" logo. Is it still available?` : ''
  )
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, logoId, logoTitle }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send message')
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className="contact-overlay" onClick={onClose}>
      <div className="contact-panel" onClick={e => e.stopPropagation()}>
        <button className="contact-close" onClick={onClose} title="Close">
          <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>

        {status === 'success' ? (
          <div className="contact-success">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
                <circle cx="12" cy="12" r="10" stroke="#25D366" strokeWidth="1.6"/>
                <path d="M7 12.5l3.2 3.2L17 9" stroke="#25D366" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Message sent!</h3>
            <p>Thanks for reaching out — we'll get back to you by email shortly.</p>
            <button className="contact-submit" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form">
            <h2 className="contact-title">Contact us</h2>
            <p className="contact-subtitle">
              {logoTitle
                ? `Ask about "${logoTitle}" — we'll reply to your email directly.`
                : "Send us a message and we'll reply to your email directly."}
            </p>

            <label className="contact-label">
              Your name
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="contact-input"
              />
            </label>

            <label className="contact-label">
              Your email
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                className="contact-input"
              />
            </label>

            <label className="contact-label">
              Message
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Tell us what you're looking for..."
                required
                rows={5}
                className="contact-textarea"
              />
            </label>

            {logoId && (
              <p className="contact-logo-tag">
                Re: <strong>{logoTitle || logoId}</strong>
              </p>
            )}

            {status === 'error' && (
              <p className="contact-error">{errorMsg}</p>
            )}

            <button type="submit" className="contact-submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending...' : 'Send message'}
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        .contact-overlay {
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

        .contact-panel {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          max-width: 440px;
          width: 100%;
          max-height: 88vh;
          overflow-y: auto;
          position: relative;
          padding: 32px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }

        .contact-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(20,20,30,0.85);
          border: 1px solid rgba(255,255,255,0.15);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .contact-close:hover { background: rgba(255,77,109,0.25); }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .contact-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .contact-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-top: -6px;
          margin-bottom: 4px;
        }
        .contact-label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .contact-input, .contact-textarea {
          background: var(--bg-secondary, #0D0D15);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 11px 14px;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 400;
          text-transform: none;
          letter-spacing: normal;
          outline: none;
          transition: border-color 0.2s;
          resize: vertical;
        }
        .contact-input::placeholder, .contact-textarea::placeholder { color: var(--text-muted); }
        .contact-input:focus, .contact-textarea:focus { border-color: rgba(245, 200, 66, 0.35); }

        .contact-logo-tag {
          font-size: 12px;
          color: var(--text-muted);
          background: var(--accent-blue-dim);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
        }
        .contact-logo-tag strong { color: var(--accent-blue); }

        .contact-error {
          font-size: 12.5px;
          color: #FF4D6D;
          background: rgba(255,77,109,0.1);
          border: 1px solid rgba(255,77,109,0.3);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
        }

        .contact-submit {
          margin-top: 6px;
          background: var(--accent-gold);
          color: #0A0A0F;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 14px;
          padding: 13px 20px;
          border-radius: var(--radius-md);
          border: none;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .contact-submit:hover { opacity: 0.88; }
        .contact-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .contact-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 8px;
          padding: 16px 0;
        }
        .success-icon { margin-bottom: 8px; }
        .contact-success h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 19px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .contact-success p {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 12px;
        }
        .contact-success .contact-submit { width: 100%; }
      `}</style>
    </div>
  )
}
