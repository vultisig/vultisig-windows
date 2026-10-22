// @vitest-environment happy-dom
/**
 * A save that rejected — from rendering the PNG or from writing the file —
 * used to end silently, so the user assumed the image was saved (#5199).
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  addToast: vi.fn(),
  saveFile: vi.fn(),
  toPng: vi.fn(),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('@lib/ui/toast/ToastProvider', () => ({
  useToast: () => ({ addToast: mocks.addToast }),
}))
vi.mock('@core/ui/state/core', () => ({
  useCore: () => ({ saveFile: mocks.saveFile }),
}))
vi.mock('html-to-image', () => ({ toPng: mocks.toPng }))

import { SaveAsImage } from './SaveAsImage'

const pngDataUrl = 'data:image/png;base64,iVBORw0KGgo='

const renderAndSave = async () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SaveAsImage
        value={<div />}
        fileName="vault-qr"
        renderTrigger={({ onClick }) => (
          <button type="button" onClick={onClick}>
            save
          </button>
        )}
      />
    </QueryClientProvider>
  )

  fireEvent.click(await screen.findByRole('button', { name: 'save' }))
}

describe('SaveAsImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.toPng.mockResolvedValue(pngDataUrl)
    mocks.saveFile.mockResolvedValue(undefined)
  })

  it('shows an error toast when rendering the image fails', async () => {
    mocks.toPng.mockRejectedValue(new Error('render failed'))

    await renderAndSave()

    await waitFor(() =>
      expect(mocks.addToast).toHaveBeenCalledWith({
        message: 'failed_to_save_image',
        status: 'error',
      })
    )
    expect(mocks.saveFile).not.toHaveBeenCalled()
  })

  it('shows an error toast when writing the file fails', async () => {
    mocks.saveFile.mockRejectedValue(new Error('permission denied'))

    await renderAndSave()

    await waitFor(() =>
      expect(mocks.addToast).toHaveBeenCalledWith({
        message: 'failed_to_save_image',
        status: 'error',
      })
    )
  })

  // A cancelled desktop dialog resolves the same way, so it stays silent too.
  it('shows nothing when the save resolves', async () => {
    await renderAndSave()

    await waitFor(() =>
      expect(mocks.saveFile).toHaveBeenCalledWith({
        name: 'vault-qr.png',
        blob: expect.any(Blob),
      })
    )
    // The mutation settles in microtasks; one macrotask flushes them all.
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(mocks.addToast).not.toHaveBeenCalled()
  })
})
