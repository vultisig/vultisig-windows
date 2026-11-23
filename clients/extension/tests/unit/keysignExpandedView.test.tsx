// @vitest-environment happy-dom
import { create } from '@bufbuild/protobuf'
import { AppView } from '@clients/extension/src/navigation/AppView'
import { resolveInitialHistory } from '@clients/extension/src/navigation/resolveInitialHistory'
import { JoinKeysignView } from '@clients/extension/src/navigation/views/JoinKeysignView'
import { KeysignView } from '@clients/extension/src/navigation/views/KeysignView'
import { getInitialView } from '@clients/extension/src/storage/initialView'
import { NavigationProvider } from '@lib/ui/navigation/state'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { KeysignMessageSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { UtxoInfoSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/utxo_info_pb'
import { ComponentType } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const { isPopupView, openUrl, startKeysign, joinKeysign } = vi.hoisted(() => ({
  isPopupView: vi.fn(),
  openUrl: vi.fn(),
  startKeysign: vi.fn(() => <div>Start keysign</div>),
  joinKeysign: vi.fn(() => <div>Join keysign</div>),
}))

vi.mock('@clients/extension/src/utils/functions', () => ({ isPopupView }))
vi.mock('@core/ui/state/core', () => ({ useCore: () => ({ openUrl }) }))
vi.mock('@core/extension/keysign/start/StartKeysignView', () => ({
  StartKeysignView: startKeysign,
}))
vi.mock('@clients/extension/src/mpc/keysign/join/JoinKeysignPage', () => ({
  JoinKeysignPage: joinKeysign,
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

const keysignPayload = create(KeysignPayloadSchema, {
  toAddress: 'bc1qrecipient',
  toAmount: '1000',
  utxoInfo: [create(UtxoInfoSchema, { hash: 'abc', amount: 5000n, index: 1 })],
})

const getKeysignView = (securityType: 'secure' | 'fast'): AppView => ({
  id: 'keysign',
  state: {
    securityType,
    keysignPayload: { keysign: keysignPayload },
    toAddressLabel: 'Savings',
  },
})

const joinKeysignView: AppView = {
  id: 'joinKeysign',
  state: {
    vaultId: 'vault-id',
    keysignMsg: create(KeysignMessageSchema, {
      sessionId: 'test-session',
      keysignPayload,
    }),
  },
}

const userAgents = ['Windows NT 10.0', 'Macintosh', 'Linux']

const renderView = (View: ComponentType, view: AppView) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider theme={darkTheme}>
        <NavigationProvider initialValue={{ history: [{ id: 'vault' }, view] }}>
          <View />
        </NavigationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe.each([
  {
    name: 'secure keysign',
    View: KeysignView,
    view: getKeysignView('secure'),
    content: 'Start keysign',
  },
  {
    name: 'keysign join',
    View: JoinKeysignView,
    view: joinKeysignView,
    content: 'Join keysign',
  },
])('$name expanded view', ({ View, view, content }) => {
  it.each(userAgents)(
    'hands off the popup before mounting the flow on %s',
    async userAgent => {
      vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent)
      isPopupView.mockReturnValue(true)

      renderView(View, view)

      await waitFor(() => expect(openUrl).toHaveBeenCalledOnce())
      expect(openUrl).toHaveBeenCalledWith(
        'chrome-extension://mock-id/index.html'
      )
      expect(startKeysign).not.toHaveBeenCalled()
      expect(joinKeysign).not.toHaveBeenCalled()
      expect(screen.queryByText(content)).toBeNull()

      const stored = (await chrome.storage.session.get('initialView'))
        .initialView
      // Chrome storage serializes values as JSON, which rejects bigint.
      expect(JSON.parse(JSON.stringify(stored))).toEqual(stored)

      const initialView = await getInitialView()
      expect(initialView).toEqual(view)
      expect(
        resolveInitialHistory({
          initialView,
          persistedView: null,
          hasVaults: true,
        })
      ).toEqual([{ id: 'vault' }, view])
      expect(chrome.storage.local.set).not.toHaveBeenCalled()
    }
  )

  it('renders in an existing expanded tab without opening another tab', () => {
    isPopupView.mockReturnValue(false)

    renderView(View, view)

    expect(screen.getByText(content)).toBeTruthy()
    expect(openUrl).not.toHaveBeenCalled()
    expect(chrome.storage.session.set).not.toHaveBeenCalled()
  })
})

describe('fast keysign', () => {
  it.each(userAgents)('stays in the popup on %s', userAgent => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent)
    isPopupView.mockReturnValue(true)

    renderView(KeysignView, getKeysignView('fast'))

    expect(screen.getByText('Start keysign')).toBeTruthy()
    expect(openUrl).not.toHaveBeenCalled()
    expect(chrome.storage.session.set).not.toHaveBeenCalled()
  })
})
