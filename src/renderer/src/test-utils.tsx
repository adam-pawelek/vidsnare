import { render, type RenderResult } from '@testing-library/react'
import { vi } from 'vitest'
import type { Locale } from '@shared/i18n'
import type { InvokeChannel, VidsnareApi } from '@shared/ipc'
import { I18nProvider } from './i18n'

type Handlers = Partial<Record<InvokeChannel, (...args: unknown[]) => unknown>>

/** Installs a fake `window.vidsnare` whose requests are answered by `handlers`. */
type MockedApi = Omit<VidsnareApi, 'invoke' | 'on'> & {
  invoke: ReturnType<typeof vi.fn>
  on: ReturnType<typeof vi.fn>
}

export function mockApi(handlers: Handlers = {}): MockedApi {
  const api = {
    invoke: vi.fn(async (channel: InvokeChannel, ...args: unknown[]) => {
      const handler = handlers[channel]
      if (!handler) throw new Error(`No mock for ${channel}`)
      return handler(...args)
    }),
    on: vi.fn(() => () => {})
  }
  window.vidsnare = api as unknown as VidsnareApi
  return api as never
}

export function renderWithI18n(ui: React.ReactElement, locale: Locale = 'en'): RenderResult {
  return render(<I18nProvider locale={locale}>{ui}</I18nProvider>)
}
