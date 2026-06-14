'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface FavoritesContextType {
  favorites: string[]
  toggleFavorite: (logoId: string, logoTitle: string) => Promise<void>
  loading: boolean
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  toggleFavorite: async () => {},
  loading: false,
})

export function useFavorites() {
  return useContext(FavoritesContext)
}

export default function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session?.user) {
      setFavorites([])
      return
    }
    fetch('/api/favorites')
      .then(r => r.json())
      .then(data => setFavorites(data.favorites || []))
      .catch(console.error)
  }, [session])

  const toggleFavorite = async (logoId: string, logoTitle: string) => {
    if (!session?.user) return
    const isLiked = favorites.includes(logoId)

    // Optimistic update
    setFavorites(prev =>
      isLiked ? prev.filter(id => id !== logoId) : [...prev, logoId]
    )

    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoId, logoTitle }),
      })
    } catch {
      // Rollback kalau gagal
      setFavorites(prev =>
        isLiked ? [...prev, logoId] : prev.filter(id => id !== logoId)
      )
    }
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  )
}
