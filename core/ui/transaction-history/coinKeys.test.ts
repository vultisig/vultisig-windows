import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { QueryClient } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { describe, expect, it, vi } from 'vitest'

import { getFeeCoinKey, withoutDuplicateCoinKeys } from './coinKeys'

vi.mock('@vultisig/core-chain/coin/balance', () => ({
  getCoinBalance: vi.fn(),
}))

vi.mock('@vultisig/core-chain/coin/balance/getEvmChainBalances', () => ({
  getEvmChainBalances: vi.fn(),
}))

const address = '0x1111111111111111111111111111111111111111'

describe('getFeeCoinKey', () => {
  it('carries nothing beyond the fields a balance is cached under', () => {
    expect(getFeeCoinKey({ chain: Chain.Ethereum, address })).toEqual({
      chain: Chain.Ethereum,
      address,
    })
  })

  // Balance queries are cached under `extractAccountCoinKey` keys. An
  // invalidation filter only matches when every field it carries exists on the
  // cached key, so the fee key must be trimmed exactly the same way.
  it('matches the fee balance the way the app caches it', async () => {
    const queryClient = new QueryClient()
    const cachedKey = getBalanceQueryKey(
      extractAccountCoinKey({ ...chainFeeCoin[Chain.Ethereum], address })
    )
    queryClient.setQueryData(cachedKey, { eth: 1n })

    await queryClient.invalidateQueries({
      queryKey: getBalanceQueryKey(
        getFeeCoinKey({ chain: Chain.Ethereum, address })
      ),
      refetchType: 'none',
    })

    expect(queryClient.getQueryState(cachedKey)?.isInvalidated).toBe(true)
  })
})

describe('withoutDuplicateCoinKeys', () => {
  it('keeps one key per balance', () => {
    const eth = { chain: Chain.Ethereum, address }
    const usdc = { chain: Chain.Ethereum, id: 'usdc', address }

    expect(withoutDuplicateCoinKeys([eth, usdc, { ...eth }])).toEqual([
      eth,
      usdc,
    ])
  })
})
