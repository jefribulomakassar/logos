'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/lib/sheets'
interface Props { logo: Logo; imageUrl: string }
interface MockupImage { id: string; thumbnailUrl: string; viewUrl: string }

function formatDate(raw: string): string {
  if (!raw) return ''
  const s = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (s) return s[3] + '-' + s[2].padStart(2,'0') + '-' + s[1].padStart(2,'0')
  const d = new Date(raw)
  if (!isNaN(d.getTime())) return d.toISOString().slice(0,10)
  return raw
}

function parsePromoDate(raw: string): Date | null {
  if (!raw) return null
  // Handle MM/DD/YYYY
  const mdy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (mdy) return new Date(`${mdy[3]}-${mdy[1].padStart(2,'0')}-${mdy[2].padStart(2,'0')}`)
  const d = new Date(raw)
  return isNaN(d.getTime()) ? null : d
}

function isPromoActive(startOn: string, endOn: string): boolean {
  const now = new Date()
  const start = parsePromoDate(startOn)
  const end = parsePromoDate(endOn)
  if (!start || !end) return false
  // Set end to end of day
  end.setHours(23, 59, 59, 999)
  return now >= start && now <= end
}

export default function LogoDetailClient({ logo, imageUrl }: Props) {
  const router = useRouter()
  const [mockups, setMockups] = useState<MockupImage[]>([])
  const [loadingMockups, setLoadingMockups] = useState(false)
  const [activeImg, setActiveImg] = useState(imageUrl)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (!logo.mockupFolderId) return
    setLoadingMockups(true)
    fetch('/api/mockups?folderId=' + logo.mockupFolderId)
      .then(r => r.json())
      .then(data => setMockups(data.images || []))
      .catch(console.error)
      .finally(() => setLoadingMockups(false))
  }, [logo.mockupFolderId])

  const allCategories = [logo.mainCategory, ...logo.secondCategories].filter(Boolean)
  const publishedDisplay = formatDate(logo.published)

  const promoActive = isPromoActive(logo.startOn ?? '', logo.endOn ?? '')
  const normalPrice = logo.price ?? 0
  const promoPrice = logo.specialPrice ?? 0
  const discountPct = normalPrice > 0 && promoPrice > 0
    ? Math.round((1 - promoPrice / normalPrice) * 100)
    : 0

  return (
    <div style={{minHeight:'100vh'}}>
      {/* Header */}
      <div style={{maxWidth:1600,margin:'0 auto',padding:'16px 24px',display:'flex',alignItems:'center',gap:16,borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <button onClick={() => router.back()} style={{display:'flex',alignItems:'center',gap:6,background:'#12121A',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,padding:'8px 14px',color:'#8A8A9A',fontFamily:'Inter,sans-serif',fontSize:13,cursor:'pointer'}}>
          Back
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{width:7,height:7,background:'#F5C842',borderRadius:'50%',display:'inline-block'}} />
          <span style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:16,color:'#F5F5F0'}}>VibeLogos</span>
        </div>
      </div>

      {/* Main grid */}
      <div style={{maxWidth:1600,margin:'0 auto',padding:'32px 24px',display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',gap:40,alignItems:'start'}}>

        {/* Left — image + thumbnails */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={{aspectRatio:'1/1',background:'#0D0D15',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
            {!imgError && activeImg
              ? <img src={activeImg} alt={logo.title} onError={() => setImgError(true)} style={{width:'100%',height:'100%',objectFit:'contain',padding:32}} />
              : <span style={{fontFamily:'Space Grotesk,sans-serif',fontSize:'5rem',fontWeight:700,color:'#4A4A5A'}}>{logo.title.charAt(0)}</span>
            }
          </div>
          <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:6}}>
            <button onClick={() => setActiveImg(imageUrl)} style={{flexShrink:0,width:68,background:'#12121A',border:activeImg===imageUrl?'2px solid #F5C842':'2px solid rgba(255,255,255,0.08)',borderRadius:8,overflow:'hidden',cursor:'pointer',padding:0}}>
              <img src={imageUrl} alt="logo" style={{width:'100%',aspectRatio:'1/1',objectFit:'contain',background:'#0D0D15',padding:4,display:'block'}} />
              <span style={{display:'block',fontSize:9,color:'#4A4A5A',textAlign:'center',padding:'3px 0',fontFamily:'Inter,sans-serif'}}>Logo</span>
            </button>
            {loadingMockups && (
              <div style={{flexShrink:0,width:68,height:80,display:'flex',alignItems:'center',justifyContent:'center',background:'#12121A',border:'2px solid rgba(255,255,255,0.08)',borderRadius:8}}>
                <span style={{fontSize:11,color:'#4A4A5A'}}>...</span>
              </div>
            )}
            {mockups.map((m, i) => (
              <button key={m.id} onClick={() => setActiveImg(m.thumbnailUrl)} style={{flexShrink:0,width:68,background:'#12121A',border:activeImg===m.thumbnailUrl?'2px solid #F5C842':'2px solid rgba(255,255,255,0.08)',borderRadius:8,overflow:'hidden',cursor:'pointer',padding:0}}>
                <img src={m.thumbnailUrl} alt={'mockup '+(i+1)} style={{width:'100%',aspectRatio:'1/1',objectFit:'cover',background:'#0D0D15',display:'block'}} />
                <span style={{display:'block',fontSize:9,color:'#4A4A5A',textAlign:'center',padding:'3px 0',fontFamily:'Inter,sans-serif'}}>#{i+1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right — info */}
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          {/* Categories */}
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {allCategories.map(cat => (
              <span key={cat} style={{fontSize:11,fontWeight:500,letterSpacing:'0.04em',textTransform:'uppercase',color:'#4F8EF7',background:'rgba(79,142,247,0.15)',padding:'4px 10px',borderRadius:4}}>{cat}</span>
            ))}
          </div>

          {/* Title */}
          <h1 style={{fontFamily:'Space Grotesk,sans-serif',fontSize:'clamp(1.6rem,4vw,2.6rem)',fontWeight:700,letterSpacing:'-0.03em',color:'#F5F5F0',lineHeight:1.15,margin:0}}>{logo.title}</h1>

          {/* Price block */}
          {promoActive && promoPrice > 0 ? (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {/* Promo badge */}
              <div style={{display:'inline-flex',alignItems:'center',gap:6,width:'fit-content',background:'linear-gradient(135deg,rgba(34,197,94,0.15),rgba(74,222,128,0.1))',border:'1px solid rgba(34,197,94,0.3)',borderRadius:100,padding:'4px 12px'}}>
                <span style={{fontSize:10,color:'#22C55E'}}>🔥</span>
                <span style={{fontSize:11,fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#22C55E'}}>June Promo — Limited Time</span>
              </div>
              {/* Prices */}
              <div style={{display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
                {/* Normal price coret */}
                <span style={{fontFamily:'Space Grotesk,sans-serif',fontSize:'1.3rem',fontWeight:500,color:'#4A4A5A',textDecoration:'line-through',textDecorationColor:'#6A6A7A',textDecorationThickness:2}}>
                  ${normalPrice.toLocaleString()}
                </span>
                {/* Promo price */}
                <span style={{fontFamily:'Space Grotesk,sans-serif',fontSize:'2.2rem',fontWeight:800,background:'linear-gradient(135deg,#22C55E,#4ADE80)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
                  ${promoPrice.toLocaleString()}
                </span>
                {/* Diskon persen */}
                {discountPct > 0 && (
                  <span style={{fontSize:12,fontWeight:700,color:'#22C55E',background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.25)',padding:'3px 10px',borderRadius:100}}>
                    -{discountPct}%
                  </span>
                )}
              </div>
              {/* End date info */}
              {logo.endOn && (
                <span style={{fontSize:11,color:'#6A6A7A',fontStyle:'italic'}}>
                  Promo ends {formatDate(logo.endOn)}
                </span>
              )}
              <span style={{fontSize:13,color:'#4A4A5A',fontStyle:'italic'}}>by {logo.creator}</span>
            </div>
          ) : (
            <div style={{display:'flex',alignItems:'baseline',gap:14,flexWrap:'wrap'}}>
              <span style={{fontFamily:'Space Grotesk,sans-serif',fontSize:'1.8rem',fontWeight:700,color:'#F5C842'}}>
                {normalPrice > 0 ? '$' + normalPrice.toLocaleString() : 'Contact'}
              </span>
              <span style={{fontSize:13,color:'#4A4A5A',fontStyle:'italic'}}>by {logo.creator}</span>
            </div>
          )}

          {/* Description */}
          <p style={{fontSize:14,color:'#8A8A9A',lineHeight:1.75,borderLeft:'2px solid rgba(245,200,66,0.3)',paddingLeft:14,margin:0}}>{logo.description}</p>

          {/* Keywords */}
          <div>
            <span style={{display:'block',fontSize:11,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',color:'#4A4A5A',marginBottom:8}}>Keywords</span>
            <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
              {logo.keywords.split(' ').filter(Boolean).map(kw => (
                <span key={kw} style={{fontSize:11,color:'#8A8A9A',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',padding:'3px 9px',borderRadius:100}}>{kw}</span>
              ))}
            </div>
          </div>

          {/* Meta info */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,padding:16,background:'#12121A',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14}}>
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              <span style={{fontSize:10,color:'#4A4A5A',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase'}}>Published</span>
              <span style={{fontSize:13,color:'#F5F5F0',fontWeight:500}}>{publishedDisplay}</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              <span style={{fontSize:10,color:'#4A4A5A',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase'}}>Mockups</span>
              <span style={{fontSize:13,color:'#F5F5F0',fontWeight:500}}>{loadingMockups ? 'Loading...' : mockups.length + ' images'}</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {logo.logoUrl && (
              <a href={logo.logoUrl} target="_blank" rel="noopener noreferrer" style={{flex:1,minWidth:140,display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,background:'linear-gradient(135deg,#F5C842,#E8A020)',color:'#0A0A0F',borderRadius:12,padding:'12px 20px',fontFamily:'Space Grotesk,sans-serif',fontWeight:600,fontSize:14,textDecoration:'none'}}>
                View on LogoGround
              </a>
            )}
            <button onClick={() => router.back()} style={{flex:1,minWidth:120,background:'#12121A',color:'#8A8A9A',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'12px 20px',fontFamily:'Inter,sans-serif',fontSize:14,cursor:'pointer'}}>
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Mockup gallery */}
      {mockups.length > 0 && (
        <div style={{maxWidth:1600,margin:'0 auto',padding:'0 24px 60px'}}>
          <h2 style={{fontFamily:'Space Grotesk,sans-serif',fontSize:'1.3rem',fontWeight:600,color:'#F5F5F0',marginBottom:20,paddingTop:28,borderTop:'1px solid rgba(255,255,255,0.08)'}}>
            Mockup Gallery ({mockups.length})
          </h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',gap:12}}>
            {mockups.map((m, i) => (
              <a key={m.id} href={m.viewUrl} target="_blank" rel="noopener noreferrer" style={{borderRadius:12,overflow:'hidden',border:'1px solid rgba(255,255,255,0.08)',display:'block'}}>
                <img src={m.thumbnailUrl} alt={'mockup '+(i+1)} loading="lazy" style={{width:'100%',aspectRatio:'4/3',objectFit:'cover',display:'block'}} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
