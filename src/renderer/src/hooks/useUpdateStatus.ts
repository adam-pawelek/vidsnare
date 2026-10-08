import { useEffect, useState } from 'react'
import type { UpdateStatus } from '@shared/update'

export function useUpdateStatus(): UpdateStatus | null {
  const [status, setStatus] = useState<UpdateStatus | null>(null)
  useEffect(() => {
    let alive = true
    void window.vidsnare.invoke('update:get-status').then((s) => alive && setStatus(s))
    const off = window.vidsnare.on('update:status', setStatus)
    return () => {
      alive = false
      off()
    }
  }, [])
  return status
}
