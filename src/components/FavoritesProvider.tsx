'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface FavoritesContextType {
  favorites: string[]
  toggleFavorite: (logoId: string, logoTitle?: string) => void
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  toggleFavorite: () => {},
})

export function useFavorites() {
  return useContext(FavoritesContext)
}

export default function FavoritesProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const userId = (session?.user?.email ?? session?.user?.name ?? '') as string

  const [favorites, setFavorites] = useState<string[]>([])
  const [synced, setSynced] = useState(false)

  // Load dari localStorage dulu (instant), lalu sync dari server
  useEffect(() => {
    // Selalu load localStorage dulu agar UI tidak kosong
    const local = JSON.parse(localStorage.getItem('vibe_likes') || '[]') as string[]
    setFavorites(local)

    if (!userId) return

    // Sync dari Google Sheet
    fetch('/api/like')
      .then(r => r.json())
      .then(data => {
        const rows: string[][] = data.rows || []
        // Ambil hanya likes milik user ini (kolom B = userId)
        const myLikes = rows
          .filter(r => r[1] === userId)
          .map(r => r[0])

        setFavorites(myLikes)
        localStorage.setItem('vibe_likes', JSON.stringify(myLikes))
        setSynced(true)
      })
      .catch(() => {
        // Kalau server error, tetap pakai localStorage
        setSynced(true)
      })
  }, [userId])

  const toggleFavorite = useCallback(async (logoId: string, logoTitle?: string) => {
    if (!userId) return

    const isLiked = favorites.includes(logoId)
    const newFavorites = isLiked
      ? favorites.filter(id => id !== logoId)
      : [...favorites, logoId]

    // Optimistic update
    setFavorites(newFavorites)
    localStorage.setItem('vibe_likes', JSON.stringify(newFavorites))

    try {
      if (isLiked) {
        // Hapus dari sheet
        const res = await fetch('/api/like', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logoId, userId }),
        })
        if (!res.ok) throw new Error('DELETE failed')
      } else {
        // Tambah ke sheet
        const res = await fetch('/api/like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logoId, userId, logoTitle }),
        })
        if (!res.ok) throw new Error('POST failed')
      }
    } catch (err) {
      // Rollback jika gagal
      console.error('Failed to sync like:', err)
      setFavorites(favorites)
      localStorage.setItem('vibe_likes', JSON.stringify(favorites))
    }
  }, [userId, favorites])

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}
