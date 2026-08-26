import { create } from '@bufbuild/protobuf'
import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { balancePersistQueryOptions } from '@lib/ui/query/utils/options'
import { QueryClient, QueryObserver } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { CoinSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { describe, expect, it, vi } from 'vitest'

import { getKeysignAffectedCoinKeys } from './getKeysignAffectedCoinKeys'

vi.mock('@vultisig/core-chain/coin/balance', () => ({
  getCoinBalance: vi.fn(),
}))

vi.mock('@vultisig/core-chain/coin/balance/getEvmChainBalances', () => ({
  getEvmChainBalances: vi.fn(),
}))

const key = ['coinBalance', { chain: 'Ethereum', id: 'usdt', address: '0x1' }]

// The vault page stays mounted underneath the keysign flow, so its balance
// observer is live when a broadcast fires. Reading the chain at that moment
// re-caches the pre-transaction amount and restarts its freshness window,
// which pinned the stale figure for a whole `staleTime` (issue #4690).
describe('balance invalidation at broadcast', () => {
  const setup = () => {
    const onchain = { value: 0n }
    const queryFn = vi.fn().mockImplementation(async () => ({
      v: onchain.value,
    }))
    const options = { queryKey: key, queryFn, ...balancePersistQueryOptions }
    const queryClient = new QueryClient()

    return { onchain, queryFn, options, queryClient }
  }

  it('does not re-read the chain while the vault page is mounted', async () => {
    const { queryFn, options, queryClient } = setup()

    const observer = new QueryObserver(queryClient, options)
    const unsubscribe = observer.subscribe(() => {})
    await vi.waitFor(() =>
      expect(observer.getCurrentResult().isSuccess).toBe(true)
    )
    expect(queryFn).toHaveBeenCalledTimes(1)

    await queryClient.invalidateQueries({
      queryKey: key,
      refetchType: 'none',
    })

    expect(queryFn).toHaveBeenCalledTimes(1)
    expect(
      queryClient.getQueryCache().find({ queryKey: key })?.state.isInvalidated
    ).toBe(true)
    unsubscribe()
  })

  it('surfaces the post-transaction amount once confirmation refetches', async () => {
    const { onchain, options, queryClient } = setup()

    const observer = new QueryObserver(queryClient, options)
    const unsubscribe = observer.subscribe(() => {})
    await vi.waitFor(() =>
      expect(observer.getCurrentResult().isSuccess).toBe(true)
    )

    await queryClient.invalidateQueries({ queryKey: key, refetchType: 'none' })
    onchain.value = 500n

    await queryClient.invalidateQueries({ queryKey: key })
    await vi.waitFor(() =>
      expect(observer.getCurrentResult().data?.v).toBe(500n)
    )
    unsubscribe()
  })

  // Drives the keys the recorder derives from the payload through the same
  // `getBalanceQueryKey` the app caches balances under, so a key shape the
  // cache cannot match fails here rather than silently skipping a balance.
  it('marks both the spent token and the fee coin stale for a token send', async () => {
    const address = '0x1111111111111111111111111111111111111111'
    const usdcId = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    const queryClient = new QueryClient()
    const cachedKeys = [
      getBalanceQueryKey({ chain: Chain.Ethereum, id: usdcId, address }),
      getBalanceQueryKey({ chain: Chain.Ethereum, address }),
    ]
    cachedKeys.forEach(cachedKey =>
      queryClient.setQueryData(cachedKey, { v: 0n })
    )

    const payload = create(KeysignPayloadSchema, {
      coin: create(CoinSchema, {
        chain: Chain.Ethereum,
        ticker: 'USDC',
        contractAddress: usdcId,
        address,
        decimals: 6,
        isNativeToken: false,
      }),
    })

    await Promise.all(
      getKeysignAffectedCoinKeys(payload).map(coinKey =>
        queryClient.invalidateQueries({
          queryKey: getBalanceQueryKey(coinKey),
          refetchType: 'none',
        })
      )
    )

    cachedKeys.forEach(cachedKey =>
      expect(queryClient.getQueryState(cachedKey)?.isInvalidated).toBe(true)
    )
  })
})
