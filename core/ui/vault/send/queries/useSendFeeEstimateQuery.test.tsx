// @vitest-environment happy-dom
/**
 * Max, the percentage chips, the spendable clamp and validation all reserve
 * the fee this query estimates, so it must price at the fee settings the
 * payload is built with, and stay exactly as before when none are chosen.
 */
import { queryClientDefaultOptions } from '@lib/ui/query/queryClientDefaultOptions'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { Chain } from '@vultisig/core-chain/Chain'
import type { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import type { FeeSettings } from '@vultisig/core-mpc/keysign/chainSpecific/FeeSettings'
import { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

type SendViewState = Record<string, unknown>

const send = vi.hoisted(() => ({
  coin: undefined as unknown as AccountCoin,
  viewState: {} as SendViewState,
  estimates: [] as { feeSettings?: unknown }[],
}))

vi.mock('../../../navigation/hooks/useCoreViewState', () => ({
  useCoreViewState: () => [send.viewState, () => {}],
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
  useSendReceiver: () => ['bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'],
}))
vi.mock('../state/memo', () => ({ useSendMemo: () => [''] }))
vi.mock('../state/destinationTag', () => ({
  useSendDestinationTag: () => ({ destinationTag: undefined }),
}))
vi.mock('../fee/tonGasless/useTonGaslessSend', () => ({
  useTonGaslessSend: () => ({ isEnabled: false }),
}))
vi.mock('../allowDeath/useSendAllowDeath', () => ({
  useSendAllowDeath: () => ({ isEnabled: false }),
}))
vi.mock('./useSendBalanceQuery', () => ({
  useSendBalanceQuery: () => ({ data: 1_000_000n }),
}))
vi.mock('../../../mpc/keysign/fee/tronMemoFee', () => ({
  getSendFeeEstimateWithTronMemo: async (input: { feeSettings?: unknown }) => {
    send.estimates.push(input)
    return 550n
  },
}))

import { useSendFeeEstimateQuery } from './useSendFeeEstimateQuery'

const higherByteFee: FeeSettings = { priority: 'fast' }

const estimate = async () => {
  const client = new QueryClient({ defaultOptions: queryClientDefaultOptions })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  const { result } = renderHook(() => useSendFeeEstimateQuery(), {
    wrapper,
  })
  await waitFor(() => expect(result.current.data).toBe(550n))

  return send.estimates[send.estimates.length - 1]
}

describe('useSendFeeEstimateQuery fee settings', () => {
  beforeEach(() => {
    send.coin = {
      ...chainFeeCoin[Chain.Bitcoin],
      address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    }
    send.viewState = { coin: { chain: Chain.Bitcoin } }
    send.estimates = []
  })

  it('prices at the default fee when no settings are chosen', async () => {
    expect((await estimate()).feeSettings).toBeUndefined()
  })

  it('prices at the settings chosen for the coin being sent', async () => {
    send.viewState = {
      ...send.viewState,
      feeSettings: { coin: { chain: Chain.Bitcoin }, value: higherByteFee },
    }

    expect((await estimate()).feeSettings).toEqual(higherByteFee)
  })

  it('ignores settings chosen for another coin', async () => {
    send.viewState = {
      ...send.viewState,
      feeSettings: { coin: { chain: Chain.Litecoin }, value: higherByteFee },
    }

    expect((await estimate()).feeSettings).toBeUndefined()
  })
})
