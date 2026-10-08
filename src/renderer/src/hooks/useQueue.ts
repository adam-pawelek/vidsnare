import { useEffect, useState } from 'react'
import type { DownloadJob } from '@shared/queue'

export function useQueue(): DownloadJob[] {
  const [jobs, setJobs] = useState<DownloadJob[]>([])
  useEffect(() => {
    let alive = true
    void window.vidsnare.invoke('queue:list').then((list) => alive && setJobs(list))
    const off = window.vidsnare.on('queue:changed', setJobs)
    return () => {
      alive = false
      off()
    }
  }, [])
  return jobs
}
