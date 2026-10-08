import { useCallback, useEffect, useState } from 'react'
import type { Settings } from '@shared/settings'

export function useSettings(): { settings: Settings | null; update: (patch: Partial<Settings>) => Promise<void> } {
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    let alive = true
    void window.vidsnare.invoke('settings:get').then((s) => alive && setSettings(s))
    const off = window.vidsnare.on('settings:changed', setSettings)
    return () => {
      alive = false
      off()
    }
  }, [])

  const update = useCallback(async (patch: Partial<Settings>) => {
    setSettings(await window.vidsnare.invoke('settings:update', patch))
  }, [])

  return { settings, update }
}
