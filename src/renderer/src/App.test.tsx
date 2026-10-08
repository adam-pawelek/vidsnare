// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'
import { mockApi } from './test-utils'

describe('App', () => {
  it('shows navigation and the app version', async () => {
    mockApi({ 'app:get-info': () => ({ name: 'VidSnare', version: '1.2.3', platform: 'linux' }) })
    render(<App />)
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(await screen.findByText('v1.2.3')).toBeInTheDocument()
  })

  it('switches pages', async () => {
    mockApi({ 'app:get-info': () => ({ name: 'VidSnare', version: '1.2.3', platform: 'linux' }) })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute('aria-current', 'page')
    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument()
  })
})
