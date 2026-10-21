// @vitest-environment happy-dom
import { create } from '@bufbuild/protobuf'
import { getResolvedQuery } from '@lib/ui/query/Query'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { CustomMessagePayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const joinUrl =
  'https://vultisig.com?type=SignTransaction&vault=03abc&jsonData=GzA%2BAIyU'

const vault: Vault = {
  name: 'Main',
  publicKeys: { ecdsa: 'ecdsa', eddsa: 'eddsa' },
  keyShares: { ecdsa: 'share', eddsa: 'share' },
  hexChainCode: 'chain-code',
  signers: ['Mac-6001', 'iPhone-6002'],
  localPartyId: 'Mac-6001',
  libType: 'DKLS',
  isBackedUp: true,
  order: 0,
}

const mocks = vi.hoisted(() => ({
  client: 'extension' as 'extension' | 'desktop',
  saveImage: vi.fn(),
  addToast: vi.fn(),
  writeText: vi.fn(async (_text: string) => {}),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
// The button's spinner is a Rive animation whose runtime fetches its wasm on
// import; nothing here needs it.
vi.mock('@lib/ui/loaders/Spinner', () => ({ Spinner: () => null }))
vi.mock('@lib/ui/toast/ToastProvider', () => ({
  useToast: () => ({ addToast: mocks.addToast }),
}))
vi.mock('@core/ui/state/core', () => ({
  useCore: () => ({ client: mocks.client }),
}))
vi.mock('@core/ui/vault/state/currentVault', () => ({
  useCurrentVault: () => vault,
}))
vi.mock('@core/ui/mpc/keysign/queries/useJoinKeysignUrlQuery', () => ({
  useJoinKeysignUrlQuery: () => getResolvedQuery(joinUrl),
}))
// Rendering the PNG needs a real layout engine; the trigger wiring is what
// these tests cover.
vi.mock('@core/ui/file/SaveAsImage', () => ({
  SaveAsImage: ({
    renderTrigger,
  }: {
    renderTrigger: (props: { onClick: () => void }) => unknown
  }) => renderTrigger({ onClick: mocks.saveImage }),
}))

import { DownloadKeysignQrCode } from './DownloadKeysignQrCode'

const renderControl = () =>
  render(
    <ThemeProvider theme={darkTheme}>
      <DownloadKeysignQrCode
        value={{
          custom: create(CustomMessagePayloadSchema, {
            method: 'personal_sign',
            message: 'hello',
          }),
        }}
      />
    </ThemeProvider>
  )

const openDialog = () => {
  renderControl()
  fireEvent.click(screen.getByRole('button', { name: 'share_qr_code' }))
}

describe('DownloadKeysignQrCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.client = 'extension'
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mocks.writeText },
      configurable: true,
    })
  })

  it('opens the share dialog on the extension instead of saving', () => {
    openDialog()

    expect(screen.getByRole('dialog', { name: 'share_qr_code' })).toBeTruthy()
    expect(screen.getByText('copy_link')).toBeTruthy()
    expect(screen.getByText('share_qr_image')).toBeTruthy()
    expect(mocks.saveImage).not.toHaveBeenCalled()
  })

  it('copies exactly the URL the QR encodes and closes', async () => {
    openDialog()
    fireEvent.click(screen.getByText('copy_link'))

    await waitFor(() =>
      expect(mocks.addToast).toHaveBeenCalledWith({ message: 'link_copied' })
    )
    expect(mocks.writeText).toHaveBeenCalledTimes(1)
    expect(mocks.writeText).toHaveBeenCalledWith(joinUrl)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('keeps the dialog open and reports a clipboard failure', async () => {
    mocks.writeText.mockRejectedValueOnce(new Error('denied'))
    openDialog()
    fireEvent.click(screen.getByText('copy_link'))

    await waitFor(() =>
      expect(mocks.addToast).toHaveBeenCalledWith({
        message: 'failed_to_copy_link',
        status: 'error',
      })
    )
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('saves the QR image from the dialog and closes', () => {
    openDialog()
    fireEvent.click(screen.getByText('share_qr_image'))

    expect(mocks.saveImage).toHaveBeenCalledTimes(1)
    expect(mocks.writeText).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('saves the QR image straight away on desktop', () => {
    mocks.client = 'desktop'
    openDialog()

    expect(mocks.saveImage).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
