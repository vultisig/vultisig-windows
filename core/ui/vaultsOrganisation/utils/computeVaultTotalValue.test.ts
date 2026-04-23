import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { describe, expect, it } from 'vitest'

import { computeVaultTotalValue } from './computeVaultTotalValue'

const baseCoin = (overrides: Partial<AccountCoin> = {}): AccountCoin => ({
  chain: Chain.Ethereum,
  id: 'ETH',
  address: '0xabc',
  decimals: 18,
  ticker: 'ETH',
  logo: '',
  priceProviderId: 'ethereum',
  ...overrides,
})

describe('computeVaultTotalValue', () => {
  it('sums fiat value across coins using the expected key shapes', () => {
    const eth = baseCoin({
      chain: Chain.Ethereum,
      id: 'ETH',
      address: '0xwallet',
      decimals: 18,
    })
    const usdc = baseCoin({
      chain: Chain.Ethereum,
      id: '0xusdc',
      address: '0xwallet',
      decimals: 6,
    })

    // `accountCoinKeyToString` joins chain:id:address (dropping undefined),
    // `coinKeyToString` joins chain:id.
    const result = computeVaultTotalValue({
      coins: [eth, usdc],
      balances: {
        'Ethereum:ETH:0xwallet': 1_000_000_000_000_000_000n, // 1 ETH
        'Ethereum:0xusdc:0xwallet': 500_000_000n, // 500 USDC
      },
      prices: {
        'Ethereum:ETH': 2_000,
        'Ethereum:0xusdc': 1,
      },
    })

    expect(result).toBeCloseTo(2_500, 6)
  })

  it('returns 0 when balances and prices are empty', () => {
    expect(
      computeVaultTotalValue({
        coins: [baseCoin()],
        balances: {},
        prices: {},
      })
    ).toBe(0)
  })

  it('skips coins without a price or balance', () => {
    const eth = baseCoin({
      chain: Chain.Ethereum,
      id: 'ETH',
      address: '0xwallet',
      decimals: 18,
    })
    const missingPrice = baseCoin({
      chain: Chain.Bitcoin,
      id: 'BTC',
      address: 'bc1q',
      decimals: 8,
    })
    const zeroPrice = baseCoin({
      chain: Chain.Ethereum,
      id: 'ZERO',
      address: '0xwallet',
      decimals: 18,
    })

    const result = computeVaultTotalValue({
      coins: [eth, missingPrice, zeroPrice],
      balances: {
        'Ethereum:ETH:0xwallet': 2_000_000_000_000_000_000n, // 2 ETH
        'Bitcoin:BTC:bc1q': 100_000_000n, // 1 BTC, but no price entry
        'Ethereum:ZERO:0xwallet': 5_000_000_000_000_000_000n,
      },
      prices: {
        'Ethereum:ETH': 2_000,
        'Ethereum:ZERO': 0,
      },
    })

    // Only the ETH line contributes: 2 * 2000 = 4000
    expect(result).toBeCloseTo(4_000, 6)
  })

  it('treats missing balance as 0 rather than throwing', () => {
    const coin = baseCoin({
      chain: Chain.Ethereum,
      id: 'ETH',
      address: '0xwallet',
      decimals: 18,
    })

    expect(
      computeVaultTotalValue({
        coins: [coin],
        balances: {},
        prices: { 'Ethereum:ETH': 2_000 },
      })
    ).toBe(0)
  })
})
