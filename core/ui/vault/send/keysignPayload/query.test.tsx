// @vitest-environment happy-dom
/**
 * Fee settings moved from Verify's local state into the send state so the
 * amount step and Verify share them. These tests pin that the payload Verify
 * signs is built from exactly the same input either way, and that the amount
 * step's fee preview runs the same build without sharing Verify's cache.
 */
import { queryClientDefaultOptions } from '@lib/ui/query/queryClientDefaultOptions'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { Chain } from '@vultisig/core-chain/Chain'
import type { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import type { FeeSettings } from '@vultisig/core-mpc/keysign/chainSpecific/FeeSettings'
import type { BuildSendKeysignPayloadInput } from '@vultisig/core-mpc/keysign/send/build'
import { omit } from '@vultisig/lib-utils/record/omit'
import { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

type SendViewState = Record<string, unknown>

const send = vi.hoisted(() => ({
  coin: undefined as unknown as AccountCoin,
  viewState: {} as SendViewState,
  builds: [] as unknown[],
}))

vi.mock('../../../navigation/hooks/useCoreViewState', () => ({
  useCoreViewState: () => [
    send.viewState,
    (update: (prev: SendViewState) => SendViewState) => {
      send.viewState = update(send.viewState)
    },
  ],
}))
vi.mock('@core/ui/chain/providers/WalletCoreProvider', () => ({
  useAssertWalletCore: () => ({ walletCore: true }),
}))
vi.mock('@core/ui/vault/state/currentVault', () => ({
  useCurrentVault: () => ({ localPartyId: 'device-1' }),
  useCurrentVaultNullablePublicKey: () => ({ publicKey: true }),
}))
vi.mock('@vultisig/core-mpc/vault/Vault', () => ({
  getVaultId: () => 'vault-id',
}))
vi.mock('@vultisig/core-mpc/types/utils/libType', () => ({
  toKeysignLibType: () => 'DKLS',
}))
vi.mock('../state/sendCoin', () => ({ useCurrentSendCoin: () => send.coin }))
vi.mock('../state/receiver', () => ({
  useSendReceiver: () => ['0x1111111111111111111111111111111111111111'],
}))
vi.mock('../state/memo', () => ({ useSendMemo: () => [''] }))
vi.mock('../state/amount', () => ({
  useSendAmount: () => [1_000_000_000_000_000n],
}))
vi.mock('../state/destinationTag', () => ({
  useSendDestinationTag: () => ({ destinationTag: undefined }),
}))
vi.mock('../fee/tonGasless/useTonGaslessSend', () => ({
  useTonGaslessSend: () => ({ isEnabled: false }),
}))
vi.mock('../allowDeath/useSendAllowDeath', () => ({
  useSendAllowDeath: () => ({ isEnabled: false }),
}))
vi.mock('./useSendMaxAmount', () => ({ useSendMaxAmount: () => false }))
vi.mock('./reconcileUtxoPlanAmount', () => ({
  reconcileUtxoPlanAmount: ({ keysignPayload }: { keysignPayload: unknown }) =>
    keysignPayload,
}))
vi.mock('@vultisig/core-mpc/keysign/send/build', () => ({
  buildSendKeysignPayload: async (input: BuildSendKeysignPayloadInput) => {
    send.builds.push(input)
    return { builtFrom: omit(input, 'walletCore', 'publicKey') }
  },
}))

import { useSendFeeSettings } from '../state/feeSettings'
import { useSendKeysignPayloadQuery } from './query'

const evmFeeSettings: FeeSettings = {
  maxPriorityFeePerGas: 2_000_000_000n,
  gasLimit: 60_000n,
}

const createWrapper = (
  client = new QueryClient({ defaultOptions: queryClientDefaultOptions })
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )

  return Wrapper
}

const buildWithLocalSettings = async () => {
  const { result } = renderHook(
    () => useSendKeysignPayloadQuery({ feeSettings: evmFeeSettings }),
    { wrapper: createWrapper() }
  )
  await waitFor(() => expect(result.current.data).toBeDefined())

  return result.current.data
}

describe('useSendKeysignPayloadQuery with lifted fee settings', () => {
  beforeEach(() => {
    send.coin = {
      ...chainFeeCoin[Chain.Ethereum],
      address: '0x2222222222222222222222222222222222222222',
    }
    send.viewState = { coin: { chain: Chain.Ethereum } }
    send.builds = []
  })

  it('signs the payload Verify built from its own local settings before the lift', async () => {
    const before = await buildWithLocalSettings()
    const [inputBefore] = send.builds

    const { result, rerender } = renderHook(
      () => {
        const [feeSettings, setFeeSettings] = useSendFeeSettings()
        const query = useSendKeysignPayloadQuery({ feeSettings })
        return { setFeeSettings, query }
      },
      { wrapper: createWrapper() }
    )
    act(() => result.current.setFeeSettings(evmFeeSettings))
    rerender()
    await waitFor(() =>
      expect(result.current.query.data).toEqual(expect.anything())
    )
    await waitFor(() => expect(send.builds).toHaveLength(3))

    const inputAfter = send.builds[send.builds.length - 1]
    expect(inputAfter).toEqual(inputBefore)
    expect(result.current.query.data).toEqual(before)
  })

  it('builds the fee preview from the same input without reusing the signed payload', async () => {
    const client = new QueryClient({
      defaultOptions: queryClientDefaultOptions,
    })
    const wrapper = createWrapper(client)

    const preview = renderHook(
      () =>
        useSendKeysignPayloadQuery({
          feeSettings: evmFeeSettings,
          preview: { isPaused: false },
        }),
      { wrapper }
    )
    await waitFor(() => expect(preview.result.current.data).toBeDefined())

    const verify = renderHook(
      () => useSendKeysignPayloadQuery({ feeSettings: evmFeeSettings }),
      { wrapper }
    )
    await waitFor(() => expect(verify.result.current.data).toBeDefined())

    expect(send.builds).toHaveLength(2)
    expect(send.builds[1]).toEqual(send.builds[0])
    expect(verify.result.current.data).toEqual(preview.result.current.data)
  })

  it('does not build the fee preview while it is paused', async () => {
    const { result } = renderHook(
      () =>
        useSendKeysignPayloadQuery({
          feeSettings: evmFeeSettings,
          preview: { isPaused: true },
        }),
      { wrapper: createWrapper() }
    )

    await new Promise(resolve => setTimeout(resolve, 20))
    expect(result.current.fetchStatus).toBe('idle')
    expect(send.builds).toHaveLength(0)
  })

  it('never applies settings chosen for another coin', () => {
    send.viewState = {
      ...send.viewState,
      feeSettings: {
        coin: {
          chain: Chain.Ethereum,
          id: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        },
        value: evmFeeSettings,
      },
    }

    const { result } = renderHook(() => useSendFeeSettings())

    expect(result.current[0]).toBeUndefined()
  })
})
