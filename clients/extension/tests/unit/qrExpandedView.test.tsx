// @vitest-environment happy-dom
import { create } from '@bufbuild/protobuf'
import { AppView } from '@clients/extension/src/navigation/AppView'
import { resolveInitialHistory } from '@clients/extension/src/navigation/resolveInitialHistory'
import { JoinKeygenView } from '@clients/extension/src/navigation/views/JoinKeygenView'
import { UploadQrView } from '@clients/extension/src/navigation/views/UploadQrView'
import { getInitialView } from '@clients/extension/src/storage/initialView'
import { NavigationProvider } from '@lib/ui/navigation/state'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { KeygenMessageSchema } from '@vultisig/core-mpc/types/vultisig/keygen/v1/keygen_message_pb'
import { afterEach, describe, expect, it, vi } from 'vitest'

const { isPopupView, openUrl, scanner, keygen } = vi.hoisted(() => ({
  isPopupView: vi.fn(),
  openUrl: vi.fn(),
  scanner: vi.fn(() => <div>Scanner</div>),
  keygen: vi.fn(() => <div>Keygen</div>),
}))

vi.mock('@clients/extension/src/utils/functions', () => ({ isPopupView }))
vi.mock('@core/ui/state/core', () => ({ useCore: () => ({ openUrl }) }))
vi.mock('@core/ui/qr/upload', () => ({ UploadQrPage: scanner }))
vi.mock('@clients/extension/src/mpc/keygen/join/JoinKeygenPage', () => ({
  JoinKeygenPage: keygen,
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

const scannerView: AppView = {
  id: 'uploadQr',
  state: { title: 'Scan QR' },
}
const joinView: AppView = {
  id: 'joinKeygen',
  state: {
    keygenOperation: { create: true },
    keygenMsg: create(KeygenMessageSchema, { sessionId: 'test-session' }),
  },
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe.each([
  {
    name: 'scanner',
    View: UploadQrView,
    view: scannerView,
    content: 'Scanner',
  },
  {
    name: 'keygen join',
    View: JoinKeygenView,
    view: joinView,
    content: 'Keygen',
  },
])('$name expanded view', ({ View, view, content }) => {
  const renderView = () =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ThemeProvider theme={darkTheme}>
          <NavigationProvider
            initialValue={{ history: [{ id: 'vault' }, view] }}
          >
            <View />
          </NavigationProvider>
        </ThemeProvider>
      </QueryClientProvider>
    )

  it.each(['Windows NT 10.0', 'Macintosh', 'Linux'])(
    'hands off the popup before mounting page work on %s',
    async userAgent => {
      vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent)
      isPopupView.mockReturnValue(true)

      renderView()

      await waitFor(() => expect(openUrl).toHaveBeenCalledOnce())
      expect(openUrl).toHaveBeenCalledWith(
        'chrome-extension://mock-id/index.html'
      )
      expect(scanner).not.toHaveBeenCalled()
      expect(keygen).not.toHaveBeenCalled()
      expect(screen.queryByText(content)).toBeNull()

      const initialView = await getInitialView()
      expect(initialView).toEqual(view)
      expect(
        resolveInitialHistory({
          initialView,
          persistedView: null,
          hasVaults: false,
        })
      ).toEqual([{ id: 'vault' }, view])
      expect(chrome.storage.local.set).not.toHaveBeenCalled()
    }
  )

  it('renders in an existing expanded tab without opening another tab', () => {
    isPopupView.mockReturnValue(false)

    renderView()

    expect(screen.getByText(content)).toBeTruthy()
    expect(openUrl).not.toHaveBeenCalled()
    expect(chrome.storage.session.set).not.toHaveBeenCalled()
  })
})
