// @vitest-environment happy-dom
/**
 * The chain RPC form leaves by popping the history. Since #5019 the Custom
 * RPCs list pops too, so when this form pushed a fresh list entry instead
 * (#5143) the two screens cycled: back from the list landed on the form
 * it had just pushed from, and Advanced was never reached.
 */
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Chain } from '@vultisig/core-chain/Chain'
import { beforeEach, describe, expect, it, vi } from 'vitest'

type MutateOptions = { onSuccess?: () => void }

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  goBack: vi.fn(),
  addToast: vi.fn(),
  overrides: {} as Partial<Record<string, string>>,
  setOverride: vi.fn((_input: unknown, options?: MutateOptions) =>
    options?.onSuccess?.()
  ),
  clearOverride: vi.fn((_chain: unknown, options?: MutateOptions) =>
    options?.onSuccess?.()
  ),
  probeRpcHealth: vi.fn(async () => ({
    status: 'reachable',
    latencyMs: 12,
    networkVerified: true,
  })),
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
vi.mock('@core/ui/navigation/hooks/useCoreNavigate', () => ({
  useCoreNavigate: () => mocks.navigate,
}))
vi.mock('@core/ui/navigation/hooks/useCoreViewState', () => ({
  useCoreViewState: () => [{ chain: 'Ethereum' }],
}))
vi.mock('@core/ui/state/core', () => ({
  useCore: () => ({ goBack: mocks.goBack, getClipboardText: async () => '' }),
}))
vi.mock('@core/ui/storage/customRpcOverrides', () => ({
  useCustomRpcOverrides: () => mocks.overrides,
  useSetCustomRpcOverrideMutation: () => ({
    mutate: mocks.setOverride,
    isPending: false,
  }),
  useClearCustomRpcOverrideMutation: () => ({
    mutate: mocks.clearOverride,
    isPending: false,
  }),
}))
vi.mock('@vultisig/core-chain/chains/customRpc/rpcHealthProbe', () => ({
  probeRpcHealth: mocks.probeRpcHealth,
}))

import { CustomRpcDetailPage } from './CustomRpcDetailPage'

const customUrl = 'https://rpc.example.org'

const renderPage = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider theme={darkTheme}>
        <CustomRpcDetailPage />
      </ThemeProvider>
    </QueryClientProvider>
  )

describe('CustomRpcDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.overrides = {}
  })

  it('pops the history on back instead of opening the chain list', () => {
    renderPage()

    fireEvent.click(screen.getByTestId('page-header-back'))

    expect(mocks.goBack).toHaveBeenCalledTimes(1)
    expect(mocks.navigate).not.toHaveBeenCalled()
  })

  it('pops the history once the endpoint is saved', async () => {
    renderPage()

    fireEvent.change(screen.getByPlaceholderText('custom_rpc_url_hint'), {
      target: { value: customUrl },
    })
    fireEvent.click(screen.getByText('custom_rpc_save_button'))

    await waitFor(() => expect(mocks.goBack).toHaveBeenCalledTimes(1))
    expect(mocks.setOverride).toHaveBeenCalledWith(
      { chain: Chain.Ethereum, url: customUrl },
      expect.anything()
    )
    expect(mocks.navigate).not.toHaveBeenCalled()
  })

  it('pops the history once the endpoint is reset', () => {
    mocks.overrides = { [Chain.Ethereum]: customUrl }
    renderPage()

    fireEvent.click(screen.getByText('custom_rpc_reset_button'))

    expect(mocks.clearOverride).toHaveBeenCalledWith(
      Chain.Ethereum,
      expect.anything()
    )
    expect(mocks.goBack).toHaveBeenCalledTimes(1)
    expect(mocks.navigate).not.toHaveBeenCalled()
  })
})
