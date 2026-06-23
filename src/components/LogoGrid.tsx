'use client'

import { useState, useMemo, createContext, useContext } from 'react'
import { Logo } from '@/lib/sheets'
import LogoCard from './LogoCard'
import { useLikes } from '@/hooks/useLikes'

// Context agar LogoCard bisa akses likes tanpa prop drilling
interface LikesContextType {
  likedIds: Set<string>
  toggleLike: (id: string) => void
}
export const LikesContext = createContext<LikesContextType>({
  likedIds: new Set(),
  toggleLike: () => {},
})
export const useLikesContext = () => useContext(LikesContext)

interface LogoGridProps {
  logos: Logo[]
  categories: string[]
}

type Columns = 3 | 4 | 5

export default function LogoGrid({ logos, categories }: LogoGridProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest')
  const [columns, setColumns] = useState<Columns>(3)

  const { likedIds, toggleLike } = useLikes()

  const filtered = useMemo(() => {
    let result = logos

    if (activeCategory !== 'All') {
      result = result.filter(l =>
        l.mainCategory === activeCategory ||
        l.secondCategories.includes(activeCategory)
      )
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.keywords.toLowerCase().includes(q) ||
        l.mainCategory.toLowerCase().includes(q)
      )
    }

    if (sortBy === 'price-asc') result = [...result].sort((a, b) => a.price - b.price)
    if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.price - a.price)

    return result
  }, [logos, activeCategory, search, sortBy])

  const colIcons: { val: Columns; label: string }[] = [
    { val: 3, label: '⊞' },
    { val: 4, label: '⊟' },
    { val: 5, label: '≣' },
  ]

  return (
    <LikesContext.Provider value={{ likedIds, toggleLike }}>
      <section className="grid-section">
        <div className="controls">
          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search logos, keywords..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="sort-select"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>

          {/* Column toggle */}
          <div className="col-toggle">
            <span className="col-label">Grid</span>
            {colIcons.map(({ val, label }) => (
              <button
                key={val}
                className={`col-btn ${columns === val ? 'active' : ''}`}
                onClick={() => setColumns(val)}
                title={`${val} columns`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        <div className="cat-filter">
          <select
            value={activeCategory}
            onChange={e => setActiveCategory(e.target.value)}
            className="cat-select"
          >
            {['All', ...categories].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <p className="result-count">
          {filtered.length === logos.length
            ? `${logos.length} logos`
            : `${filtered.length} of ${logos.length} logos`}
          {activeCategory !== 'All' && ` in ${activeCategory}`}
        </p>

        {filtered.length > 0 ? (
          <div className="logo-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {filtered.map(logo => (
              <LogoCard key={logo.id} logo={logo} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">◎</span>
            <p>No logos match your search.</p>
            <button onClick={() => { setSearch(''); setActiveCategory('All') }} className="reset-btn">
              Clear filters
            </button>
          </div>
        )}

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
            align-items: center;
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

          .col-toggle {
            display: flex;
            align-items: center;
            gap: 4px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: 6px 10px;
          }
          .col-label {
            font-size: 11px;
            color: var(--text-muted);
            margin-right: 6px;
            font-family: 'Inter', sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.06em;
          }
          .col-btn {
            width: 30px;
            height: 30px;
            border-radius: 6px;
            border: 1px solid transparent;
            background: transparent;
            color: var(--text-secondary);
            font-family: 'Space Grotesk', sans-serif;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .col-btn:hover {
            background: rgba(255,255,255,0.06);
            color: var(--text-primary);
          }
          .col-btn.active {
            background: var(--accent-gold-dim);
            border-color: rgba(245, 200, 66, 0.4);
            color: var(--accent-gold);
          }

          .cat-filter {
            margin-bottom: 24px;
          }
          .cat-select {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: 11px 14px;
            color: var(--text-primary);
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            outline: none;
            cursor: pointer;
            min-width: 220px;
            width: 100%;
            max-width: 320px;
          }
          .cat-select:focus { border-color: rgba(245, 200, 66, 0.35); }
          .cat-select option { background: #12121A; color: #F5F5F0; }

          .result-count {
            font-size: 13px;
            color: var(--text-muted);
            margin-bottom: 24px;
          }

          .logo-grid {
            display: grid;
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
          .empty-state p { margin-bottom: 20px; font-size: 15px; }
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
            .grid-section { padding: 0 24px 60px; }
          }
          @media (max-width: 768px) {
            .logo-grid { grid-template-columns: 1fr !important; gap: 16px; }
            .col-toggle { display: none; }
          }
          @media (max-width: 480px) {
            .grid-section { padding: 0 16px 60px; }
            .controls { flex-direction: column; }
            .sort-select { min-width: unset; width: 100%; }
          }
        `}</style>
      </section>
    </LikesContext.Provider>
  )
}
