'use client'
import { useState, useMemo } from 'react'
<style jsx>{`
        .grid-section {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 40px 80px;
        }

        .controls {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .search-wrap {
          position: relative;
          flex: 1;
          min-width: 280px;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: var(--text-muted);
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 11px 40px 11px 40px;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .search-input::placeholder { color: var(--text-muted); }
        .search-input:focus { border-color: rgba(245, 200, 66, 0.35); }
        .search-clear {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 11px;
          padding: 4px;
        }
        .search-clear:hover { color: var(--text-primary); }

        .sort-select {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 11px 14px;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          outline: none;
          cursor: pointer;
          min-width: 180px;
        }
        .sort-select:focus { border-color: rgba(245, 200, 66, 0.35); }

        .cat-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
        }
        .cat-btn {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 7px 16px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .cat-btn:hover {
          border-color: rgba(245, 200, 66, 0.3);
          color: var(--text-primary);
        }
        .cat-btn.active {
          background: var(--accent-gold-dim);
          border-color: rgba(245, 200, 66, 0.5);
          color: var(--accent-gold);
          font-weight: 500;
        }

        .result-count {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 24px;
        }

        .logo-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: var(--text-muted);
        }
        .empty-icon {
          display: block;
          font-size: 3rem;
          margin-bottom: 16px;
          opacity: 0.3;
        }
        .empty-state p {
          margin-bottom: 20px;
          font-size: 15px;
        }
        .reset-btn {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 10px 20px;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .reset-btn:hover { border-color: var(--accent-gold); }

        @media (max-width: 1024px) {
          .logo-grid { grid-template-columns: repeat(2, 1fr); }
          .grid-section { padding: 0 24px 60px; }
        }
        @media (max-width: 640px) {
          .grid-section { padding: 0 16px 60px; }
          .logo-grid { grid-template-columns: 1fr; gap: 16px; }
          .controls { flex-direction: column; }
          .sort-select { min-width: unset; width: 100%; }
        }
      `}</style>
