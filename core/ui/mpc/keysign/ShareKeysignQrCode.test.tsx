// @vitest-environment happy-dom
import { darkTheme } from '@lib/ui/theme/darkTheme'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ShareKeysignQrCode } from './ShareKeysignQrCode'

const { addToast } = vi.hoisted(() => ({ addToast: vi.fn() }))

vi.mock('@lib/ui/toast/ToastProvider', () => ({
  useToast: () => ({ addToast }),
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  addToast.mockReset()
})

const openDialog = (value: string) => {
  const saveImage = vi.fn()
  render(
    <ThemeProvider theme={darkTheme}>
      <ShareKeysignQrCode value={value} onClick={saveImage} />
    </ThemeProvider>
  )
  fireEvent.click(screen.getByRole('button', { name: 'share_qr_code' }))
  expect(screen.getByRole('dialog', { name: 'share_qr_code' })).toBeDefined()
  return saveImage
}

describe('secure-sign link sharing', () => {
  it.each([
    'https://vultisig.com?type=SignTransaction&vault=test&jsonData=relay%2Bdata%3D',
    'https://vultisig.com?type=SignTransaction&vault=test&jsonData=local%2Bdata%3D',
    'https://vultisig.com?type=SignTransaction&vault=test&jsonData=payload-id%2Fdata%3D',
  ])('copies the opaque QR value unchanged: %s', async value => {
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue()
    const saveImage = openDialog(value)
    expect(saveImage).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'copy_link' }))
    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'link_copied' })
    )
    expect(writeText).toHaveBeenCalledExactlyOnceWith(value)
    expect(saveImage).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'share_qr_image' }))
    expect(saveImage).toHaveBeenCalledOnce()
  })

  it('reports a clipboard rejection without a success toast', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
      new Error('denied')
    )
    openDialog('https://vultisig.com?type=SignTransaction&jsonData=test')
    fireEvent.click(screen.getByRole('button', { name: 'copy_link' }))
    await waitFor(() =>
      expect(addToast).toHaveBeenCalledExactlyOnceWith({
        message: 'failed_to_copy_link',
        status: 'error',
      })
    )
  })
})
