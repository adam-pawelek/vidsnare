// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('shows the app version from the main process', async () => {
    window.vidsnare = {
      invoke: vi.fn(async () => ({ name: 'VidSnare', version: '1.2.3', platform: 'linux' })) as never,
      on: vi.fn(() => () => {})
    }
    render(<App />)
    expect(screen.getByRole('heading', { name: 'VidSnare' })).toBeInTheDocument()
    expect(await screen.findByText('v1.2.3')).toBeInTheDocument()
  })
})
