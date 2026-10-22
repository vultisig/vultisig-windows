// @vitest-environment happy-dom
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { fireEvent, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ isTabletAndUp: false }))

vi.mock('@lib/ui/responsive/mediaQuery', async importOriginal => ({
  ...(await importOriginal<typeof import('@lib/ui/responsive/mediaQuery')>()),
  useIsTabletDeviceAndUp: () => mocks.isTabletAndUp,
}))

import { ResponsiveModal } from './ResponsiveModal'

const renderModal = (isOpen: boolean) => {
  const onClose = vi.fn()

  render(
    <ThemeProvider theme={darkTheme}>
      <ResponsiveModal isOpen={isOpen} onClose={onClose}>
        content
      </ResponsiveModal>
    </ThemeProvider>
  )

  return onClose
}

describe('ResponsiveModal', () => {
  beforeEach(() => {
    mocks.isTabletAndUp = false
  })

  it('closes the drawer on Escape', () => {
    const onClose = renderModal(true)

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes the tablet modal on Escape only once', () => {
    mocks.isTabletAndUp = true
    const onClose = renderModal(true)

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ignores Escape while closed', () => {
    const onClose = renderModal(false)

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(onClose).not.toHaveBeenCalled()
  })
})
