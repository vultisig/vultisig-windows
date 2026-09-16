import { Chain } from '@vultisig/core-chain/Chain'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { handleSearchToken } from './searchToken'

vi.mock('@vultisig/lib-utils/query/queryUrl', () => ({
  queryUrl: vi.fn(async () => []),
}))
vi.mock('@vultisig/core-chain/coin/price/getCoinPrices', () => ({
  getCoinPrices: vi.fn(async () => ({})),
}))

const mint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const context = { vaultPubKey: 'test', vaultName: 'test', coins: [] }

describe('curated token address search', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns the canonical Solana mint unchanged', async () => {
    const result = await handleSearchToken(
      { query: mint, chain: Chain.Solana },
      context
    )
    expect(result.data.results).toEqual([
      expect.objectContaining({
        symbol: 'USDC',
        contract_address: mint,
        price_provider_id: 'usd-coin',
      }),
    ])
  })

  it('does not return genuine USDC for a case-mutated Solana mint', async () => {
    const result = await handleSearchToken(
      { query: mint.toLowerCase(), chain: Chain.Solana },
      context
    )
    expect(result.data.results).toEqual([])
  })
})
