import { useEffect, useState } from 'react'
import { renderFilename } from '@shared/filename'
import type { EngineStatus, EngineUpdateResult } from '@shared/ipc'
import { REPO_URL as SOURCE_URL } from '@shared/release'
import { MAX_CONCURRENT_LIMIT, type Settings } from '@shared/settings'
import { AppUpdateControls } from '../components/AppUpdate'
import { OptionsPanel } from '../components/OptionsPanel'
import { useUpdateStatus } from '../hooks/useUpdateStatus'
import { useI18n } from '../i18n'

const FIELDS = '{title} {id} {channel} {date} {index}'
const EXAMPLE = { title: 'Example video', id: 'dQw4w9WgXcQ', channel: 'Channel', uploadDate: '20240115', playlistIndex: 3, playlistCount: 25 }

function Toggle({ label, help, checked, onChange }: { label: string; help?: string; checked: boolean; onChange: (v: boolean) => void }): React.JSX.Element {
  return (
    <div className="setting">
      <label className="checkbox">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        {label}
      </label>
      {help && <p className="muted help">{help}</p>}
    </div>
  )
}

function FilenameTemplate({ value, onSave }: { value: string; onSave: (v: string) => void }): React.JSX.Element {
  const { t } = useI18n()
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])
  const valid = /\{(title|id)\}/.test(draft) && draft.trim().length > 0 && draft.length <= 200

  return (
    <div className="setting">
      <label className="field">
        <span className="field-label">{t('settings.filenameTemplate')}</span>
        <input
          type="text"
          className="text-input"
          spellCheck={false}
          value={draft}
          aria-invalid={!valid}
          onChange={(e) => {
            setDraft(e.target.value)
            if (/\{(title|id)\}/.test(e.target.value)) onSave(e.target.value)
          }}
        />
      </label>
      {valid ? (
        <p className="muted help">{t('settings.filenamePreview', { example: `${renderFilename(draft, EXAMPLE)}.mp4` })}</p>
      ) : (
        <p className="help error-text" role="alert">
          {t('settings.templateInvalid')}
        </p>
      )}
      <p className="muted help">{t('settings.filenameTemplateHelp', { fields: FIELDS })}</p>
    </div>
  )
}

function EngineSection(): React.JSX.Element {
  const { t, dateTime, percent } = useI18n()
  const [status, setStatus] = useState<EngineStatus | null>(null)
  const [updating, setUpdating] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [result, setResult] = useState<EngineUpdateResult | null>(null)

  useEffect(() => {
    void window.vidsnare.invoke('tools:get-status').then(setStatus)
    return window.vidsnare.on('tools:update-progress', ({ fraction }) => setProgress(fraction))
  }, [])

  const update = async (): Promise<void> => {
    setUpdating(true)
    setResult(null)
    setProgress(null)
    try {
      setResult(await window.vidsnare.invoke('tools:update-engine'))
      setStatus(await window.vidsnare.invoke('tools:get-status'))
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="setting">
      <span className="field-label">{t('settings.engine')}</span>
      <p className="muted help">{t('settings.engineHelp')}</p>
      <p>
        {status?.ytdlp ? t('settings.engineVersion', { version: status.ytdlp.version }) : t('errors.TOOL_MISSING')}
        {status && (
          <span className="muted">
            {' · '}
            {t('settings.lastChecked', { date: status.lastCheck ? dateTime(status.lastCheck) : t('settings.never') })}
          </span>
        )}
      </p>
      <div className="row">
        <button type="button" className="btn" disabled={updating} onClick={() => void update()}>
          {updating ? t('settings.checking') : t('settings.updateEngine')}
        </button>
        {updating && progress !== null && <span className="muted">{percent(progress)}</span>}
        {result?.status === 'updated' && (
          <span className="ok-text" role="status">
            {t('settings.engineUpdated', { version: result.version })}
          </span>
        )}
        {result?.status === 'up-to-date' && (
          <span className="muted" role="status">
            {t('settings.engineUpToDate')}
          </span>
        )}
        {result?.status === 'failed' && (
          <span className="error-text" role="alert">
            {t('settings.engineUpdateFailed')}
          </span>
        )}
      </div>
    </div>
  )
}

export function SettingsPage({ settings, update }: { settings: Settings; update: (patch: Partial<Settings>) => Promise<void> }): React.JSX.Element {
  const { t } = useI18n()
  const [defaultFolder, setDefaultFolder] = useState('')
  const [version, setVersion] = useState('')
  const updateStatus = useUpdateStatus()

  useEffect(() => {
    void window.vidsnare.invoke('queue:default-folder').then(setDefaultFolder)
  }, [settings.downloadDir])
  useEffect(() => {
    void window.vidsnare.invoke('app:get-info').then((info) => setVersion(info.version))
  }, [])

  const chooseFolder = async (): Promise<void> => {
    const picked = await window.vidsnare.invoke('dialog:choose-folder', defaultFolder)
    if (picked) await update({ downloadDir: picked })
  }

  return (
    <div className="page settings-page">
      <h1>{t('settings.title')}</h1>

      <section className="card" aria-labelledby="s-downloads">
        <h2 id="s-downloads">{t('settings.sections.downloads')}</h2>
        <div className="setting">
          <span className="field-label">{t('settings.downloadFolder')}</span>
          <div className="folder">
            <span className="folder-path" title={defaultFolder}>
              <bdi>{defaultFolder}</bdi>
            </span>
            <button type="button" className="btn" onClick={() => void chooseFolder()}>
              {t('common.changeFolder')}
            </button>
            {settings.downloadDir && (
              <button type="button" className="btn btn-ghost" onClick={() => void update({ downloadDir: '' })}>
                {t('settings.useSystemFolder')}
              </button>
            )}
          </div>
        </div>
        <label className="setting field">
          <span className="field-label">{t('settings.maxConcurrent')}</span>
          <select
            className="narrow"
            value={settings.maxConcurrent}
            onChange={(e) => void update({ maxConcurrent: Number(e.target.value) })}
          >
            {Array.from({ length: MAX_CONCURRENT_LIMIT }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <Toggle
          label={t('settings.skipDownloaded')}
          help={t('settings.skipDownloadedHelp')}
          checked={settings.skipDownloaded}
          onChange={(v) => void update({ skipDownloaded: v })}
        />
        <Toggle
          label={t('settings.playlistSubfolder')}
          checked={settings.playlistSubfolder}
          onChange={(v) => void update({ playlistSubfolder: v })}
        />
        <FilenameTemplate value={settings.filenameTemplate} onSave={(v) => void update({ filenameTemplate: v })} />
        <Toggle
          label={t('settings.notifications')}
          checked={settings.notifications}
          onChange={(v) => void update({ notifications: v })}
        />
      </section>

      <section className="card" aria-labelledby="s-defaults">
        <h2 id="s-defaults">{t('settings.sections.defaults')}</h2>
        <OptionsPanel options={settings.defaults} onChange={(defaults) => void update({ defaults })} />
      </section>

      <section className="card" aria-labelledby="s-appearance">
        <h2 id="s-appearance">{t('settings.sections.appearance')}</h2>
        <div className="row">
          <label className="field">
            <span className="field-label">{t('settings.theme')}</span>
            <select value={settings.theme} onChange={(e) => void update({ theme: e.target.value as Settings['theme'] })}>
              <option value="system">{t('settings.themeSystem')}</option>
              <option value="light">{t('settings.themeLight')}</option>
              <option value="dark">{t('settings.themeDark')}</option>
            </select>
          </label>
        </div>
      </section>

      <section className="card" aria-labelledby="s-updates">
        <h2 id="s-updates">{t('settings.sections.updates')}</h2>
        <p>
          <span className="field-label">{t('settings.appVersion')}</span> {version}
        </p>
        <AppUpdateControls status={updateStatus} />
        <Toggle label={t('settings.autoUpdate')} checked={settings.autoUpdateApp} onChange={(v) => void update({ autoUpdateApp: v })} />
        <EngineSection />
        <Toggle
          label={t('settings.autoUpdateEngine')}
          checked={settings.autoUpdateEngine}
          onChange={(v) => void update({ autoUpdateEngine: v })}
        />
      </section>

      <section className="card" aria-labelledby="s-about">
        <h2 id="s-about">{t('settings.sections.about')}</h2>
        <p className="muted">{t('settings.disclaimer')}</p>
        <div className="row">
          <a href={SOURCE_URL} target="_blank" rel="noreferrer">
            {t('settings.sourceCode')}
          </a>
          <a href={`${SOURCE_URL}/blob/main/docs/THIRD_PARTY.md`} target="_blank" rel="noreferrer">
            {t('settings.licenses')}
          </a>
        </div>
      </section>
    </div>
  )
}
