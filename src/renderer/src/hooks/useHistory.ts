import { useEffect, useState } from 'react'
import type { HistoryItem } from '@shared/history'

const PAGE = 200

/** History entries matching `search`, refreshed whenever the history changes. */
export function useHistory(search: string): HistoryItem[] | null {
  const [items, setItems] = useState<HistoryItem[] | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => window.vidsnare.on('history:changed', () => setVersion((v) => v + 1)), [])

  useEffect(() => {
    let alive = true
    // Wait for typing to pause before searching.
    const timer = setTimeout(
      () => {
        void window.vidsnare.invoke('history:list', { search, limit: PAGE }).then((list) => alive && setItems(list))
      },
      search ? 150 : 0
    )
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [search, version])

  return items
}
