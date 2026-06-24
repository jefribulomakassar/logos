// src/hooks/useLikes.ts
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

// Cache likes dari server di memory (shared antar komponen dalam 1 sesi), per-email
let serverLikesCache: Set<string> | null = null
let cachePromise: Promise<Set<string>> | null = null
let cachedForEmail: string | null = null

async function fetchServerLikes(email: string): Promise<Set<string>> {
  if (serverLikesCache && cachedForEmail === email) return serverLikesCache
  if (cachePromise && cachedForEmail === email) return cachePromise
  cachedForEmail = email
  cachePromise = fetch('/api/like')
    .then(r => r.json())
    .then(data => {
      const rows: string[][] = data.rows || []
      // Urutan kolom sheet: A=USER_EMAIL, B=LOGO_ID
      const myLikes = new Set(
        rows.filter(r => r[0] === email).map(r => r[1])
      )
      serverLikesCache = myLikes
      return myLikes
    })
    .catch(() => {
      cachePromise = null
      return new Set<string>()
    })
  return cachePromise
}

export function useLikes() {
  const { data: session, status } = useSession()
  const email = session?.user?.email ?? null

  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!email) {
      // Belum login: tidak ada likes yang bisa ditampilkan
      setLikedIds(new Set())
      setLoading(false)
      return
    }
    setLoading(true)
    fetchServerLikes(email).then(serverLikes => {
      setLikedIds(serverLikes)
      setLoading(false)
    })
  }, [email, status])

  const toggleLike = useCallback(async (logoId: string, logoTitle?: string, logoUrl?: string) => {
    if (!email) return // pemanggil harus memicu signIn() dulu sebelum ini
    const isLiked = likedIds.has(logoId)
    const newSet = new Set(likedIds)
    if (isLiked) {
      newSet.delete(logoId)
    } else {
      newSet.add(logoId)
    }
    // Optimistic update
    setLikedIds(newSet)
    // Invalidate cache
    serverLikesCache = null
    cachePromise = null
    // Sync ke server — userId di body diisi email
    try {
      if (isLiked) {
        await fetch('/api/like', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logoId, userId: email }),
        })
      } else {
        await fetch('/api/like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logoId, userId: email, logoTitle, logoUrl }),
        })
      }
    } catch (err) {
      // Rollback jika gagal
      console.error('Failed to sync like to server:', err)
      setLikedIds(likedIds)
    }
  }, [email, likedIds])

  return { likedIds, toggleLike, loading, isLoggedIn: !!email }
}
