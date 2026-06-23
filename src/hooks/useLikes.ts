// src/hooks/useLikes.ts
'use client'

import { useState, useEffect, useCallback } from 'react'

// Buat atau ambil userId yang persistent di localStorage
function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return ''
  let uid = localStorage.getItem('vibe_uid')
  if (!uid) {
    uid = 'u_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('vibe_uid', uid)
  }
  return uid
}

// Cache likes dari server di memory (shared antar komponen dalam 1 sesi)
let serverLikesCache: Set<string> | null = null
let cachePromise: Promise<Set<string>> | null = null

async function fetchServerLikes(userId: string): Promise<Set<string>> {
  if (serverLikesCache) return serverLikesCache
  if (cachePromise) return cachePromise

  cachePromise = fetch('/api/like')
    .then(r => r.json())
    .then(data => {
      const rows: string[][] = data.rows || []
      const myLikes = new Set(
        rows.filter(r => r[1] === userId).map(r => r[0])
      )
      serverLikesCache = myLikes
      return myLikes
    })
    .catch(() => {
      // Fallback ke localStorage jika server error
      cachePromise = null
      return new Set<string>()
    })

  return cachePromise
}

export function useLikes() {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const uid = getOrCreateUserId()
    setUserId(uid)

    // Muat dari localStorage dulu (instant)
    const local = JSON.parse(localStorage.getItem('vibe_likes') || '[]') as string[]
    setLikedIds(new Set(local))

    // Kemudian sync dari server
    fetchServerLikes(uid).then(serverLikes => {
      // Merge: server adalah sumber kebenaran, tapi simpan ulang ke localStorage
      setLikedIds(serverLikes)
      localStorage.setItem('vibe_likes', JSON.stringify(Array.from(serverLikes)))
      setLoading(false)
    })
  }, [])

  const toggleLike = useCallback(async (logoId: string) => {
    if (!userId) return

    const isLiked = likedIds.has(logoId)
    const newSet = new Set(likedIds)

    if (isLiked) {
      newSet.delete(logoId)
    } else {
      newSet.add(logoId)
    }

    // Optimistic update
    setLikedIds(newSet)
    localStorage.setItem('vibe_likes', JSON.stringify(Array.from(newSet)))

    // Invalidate cache
    serverLikesCache = null
    cachePromise = null

    // Sync ke server
    try {
      if (isLiked) {
        await fetch('/api/like', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logoId, userId }),
        })
      } else {
        await fetch('/api/like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logoId, userId }),
        })
      }
    } catch (err) {
      // Rollback jika gagal
      console.error('Failed to sync like to server:', err)
      setLikedIds(likedIds)
      localStorage.setItem('vibe_likes', JSON.stringify(Array.from(likedIds)))
    }
  }, [userId, likedIds])

  return { likedIds, toggleLike, loading }
}
