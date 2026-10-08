import { useEffect, useState } from 'react'
import type { AppInfo } from '@shared/ipc'

export function App(): React.JSX.Element {
  const [info, setInfo] = useState<AppInfo | null>(null)

  useEffect(() => {
    void window.vidsnare.invoke('app:get-info').then(setInfo)
  }, [])

  return (
    <main className="app">
      <h1>VidSnare</h1>
      {info && <p className="muted">v{info.version}</p>}
    </main>
  )
}
