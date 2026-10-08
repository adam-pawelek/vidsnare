import { useState } from 'react'
import type { AppError } from '@shared/errors'
import { useI18n } from '../i18n-context'

export function ErrorNotice({ error, onRetry }: { error: AppError; onRetry?: () => void }): React.JSX.Element {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const copy = (): void => {
    void navigator.clipboard?.writeText(`${error.code}: ${error.detail}`).then(() => setCopied(true))
  }
  return (
    <div className="notice notice-error" role="alert">
      <p>{t(`errors.${error.code}`)}</p>
      <div className="notice-actions">
        {error.retryable && onRetry && (
          <button type="button" className="btn" onClick={onRetry}>
            {t('common.retry')}
          </button>
        )}
        {error.detail && error.code !== 'INVALID_URL' && (
          <button type="button" className="btn btn-ghost" onClick={copy}>
            {copied ? t('common.copied') : t('common.copyDetails')}
          </button>
        )}
      </div>
    </div>
  )
}
