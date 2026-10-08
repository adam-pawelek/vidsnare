/** How the running copy of the app can update itself. */
export type UpdateMode =
  /** Windows installer or AppImage: downloads and installs. */
  | 'auto'
  /** .deb package: we can only tell the user a new version exists. */
  | 'manual'
  /** Development build or unsupported package. */
  | 'disabled'

export type UpdateStatus =
  | { state: 'idle'; mode: UpdateMode }
  | { state: 'checking'; mode: UpdateMode }
  | { state: 'up-to-date'; mode: UpdateMode }
  | { state: 'available'; mode: UpdateMode; version: string }
  | { state: 'downloading'; mode: UpdateMode; version: string; fraction: number | null }
  | { state: 'ready'; mode: UpdateMode; version: string }
  | { state: 'error'; mode: UpdateMode; message: string }
