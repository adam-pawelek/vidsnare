import type { Translate } from '@shared/i18n'
import type { DownloadJob } from '@shared/queue'

export interface NotifierDeps {
  show: (title: string, body: string) => void
  enabled: () => boolean
  translate: () => Translate
  /** Downloads finishing within this window are summarized in one notification. */
  delayMs?: number
}

const MAX_TITLES = 3

/**
 * Turns finished downloads into notifications. A playlist finishing forty
 * videos produces one summary, not forty pop-ups.
 */
export class Notifier {
  private completed: DownloadJob[] = []
  private failed: DownloadJob[] = []
  private timer: ReturnType<typeof setTimeout> | null = null

  constructor(private readonly deps: NotifierDeps) {}

  jobFinished(job: DownloadJob): void {
    if (job.status === 'completed') this.completed.push(job)
    else if (job.status === 'failed') this.failed.push(job)
    else return
    this.timer ??= setTimeout(() => this.flush(), this.deps.delayMs ?? 1500)
  }

  flush(): void {
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
    const completed = this.completed
    const failed = this.failed
    this.completed = []
    this.failed = []
    if (!this.deps.enabled()) return
    const t = this.deps.translate()

    if (completed.length === 1) {
      this.deps.show(t('notify.finishedTitle'), completed[0]!.title)
    } else if (completed.length > 1) {
      const titles = completed.slice(0, MAX_TITLES).map((j) => j.title)
      if (completed.length > MAX_TITLES) titles.push('…')
      this.deps.show(t('notify.allFinished', { count: completed.length }), titles.join('\n'))
    }

    if (failed.length === 1) {
      const job = failed[0]!
      const reason = job.error ? t(`errors.${job.error.code}`) : ''
      this.deps.show(t('notify.failedTitle'), reason ? `${job.title}\n${reason}` : job.title)
    } else if (failed.length > 1) {
      this.deps.show(t('notify.failedMany', { count: failed.length }), failed.slice(0, MAX_TITLES).map((j) => j.title).join('\n'))
    }
  }
}
