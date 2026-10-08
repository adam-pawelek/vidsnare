import { useEffect, useState } from 'react'
import type { EngineStatus } from '@shared/ipc'
import { REPO_URL as SOURCE_URL } from '@shared/release'
import { MAX_CONCURRENT_LIMIT, type Settings } from '@shared/settings'
import { AppUpdateControls } from '../components/AppUpdate'
import { OptionsPanel } from '../components/OptionsPanel'
import { useUpdateStatus } from '../hooks/useUpdateStatus'
import { useI18n } from '../i18n-context'


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

/** Versions and when the engine was last checked; updating itself is automatic. */
function EngineSection(): React.JSX.Element {
  const { t, dateTime } = useI18n()
  const [status, setStatus] = useState<EngineStatus | null>(null)

  useEffect(() => {
    void window.vidsnare.invoke('tools:get-status').then(setStatus)
  }, [])

  return (
    <div className="setting">
      <span className="field-label">{t('settings.engine')}</span>
      <p>
        {status?.ytdlp ? t('settings.engineVersion', { version: status.ytdlp.version }) : t('errors.TOOL_MISSING')}
        {status && (
          <span className="muted">
            {' · '}
            {t('settings.lastChecked', { date: status.lastCheck ? dateTime(status.lastCheck) : t('settings.never') })}
          </span>
        )}
      </p>
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
        <p className="muted help">{t('settings.engineHelp')}</p>
        <p>
          <span className="field-label">{t('settings.appVersion')}</span> {version}
        </p>
        <AppUpdateControls status={updateStatus} />
        <EngineSection />
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
