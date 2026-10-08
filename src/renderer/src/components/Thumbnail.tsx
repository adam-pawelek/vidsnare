import { useState } from 'react'

export function Thumbnail({ src, className }: { src: string | null; className?: string }): React.JSX.Element {
  const [failed, setFailed] = useState(false)
  return (
    <div className={`thumb ${className ?? ''}`}>
      {src && !failed && <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />}
    </div>
  )
}
