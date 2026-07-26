import { Chain } from '@vultisig/core-chain/Chain'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { describe, expect, it } from 'vitest'

import { buildLimitSwapMemoForCoins } from './memo'

const ethCoin: Coin = { chain: Chain.Ethereum, ticker: 'ETH', decimals: 18 }
const btcCoin: Coin = { chain: Chain.Bitcoin, ticker: 'BTC', decimals: 8 }
const usdcCoin: Coin = {
  chain: Chain.Ethereum,
  ticker: 'USDC',
  decimals: 6,
  id: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
}

const btcAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
const evmAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'

describe('buildLimitSwapMemoForCoins', () => {
  // Mirrors the SDK fixture `eth-to-btc-12h`, which expresses 1 ETH as a
  // source_amount of 1e8. Feeding the same trade in native 18-decimal units has
  // to land on the identical memo -- if the rescale were wrong the LIM would
  // encode a completely different minimum received.
  it('matches the SDK fixture when given a native 18-decimal amount', () => {
    expect(
      buildLimitSwapMemoForCoins({
        fromCoin: ethCoin,
        toCoin: btcCoin,
        amount: 10n ** 18n,
        targetPrice: 0.04,
        expiryHours: 12,
        destinationAddress: btcAddress,
      })
    ).toBe(`=<:BTC.BTC:${btcAddress}:4000000/7200/0:v0:50`)
  })

  it.each([
    [24, 14400],
    [72, 43200],
  ] as const)('encodes a %sh expiry as %s blocks', (expiryHours, blocks) => {
    expect(
      buildLimitSwapMemoForCoins({
        fromCoin: ethCoin,
        toCoin: btcCoin,
        amount: 10n ** 18n,
        targetPrice: 0.04,
        expiryHours,
        destinationAddress: btcAddress,
      })
    ).toBe(`=<:BTC.BTC:${btcAddress}:4000000/${blocks}/0:v0:50`)
  })

  it('encodes an ERC20 target with its contract suffix', () => {
    const memo = buildLimitSwapMemoForCoins({
      fromCoin: ethCoin,
      toCoin: usdcCoin,
      amount: 10n ** 18n,
      targetPrice: 3_000,
      expiryHours: 24,
      destinationAddress: evmAddress,
    })

    expect(memo.startsWith(`=<:ETH.USDC-06EB48:${evmAddress}:`)).toBe(true)
  })

  // A UTXO source carries the memo in an OP_RETURN, capped at 80 bytes. A token
  // target plus a full EVM destination does not fit, and the SDK refuses rather
  // than silently truncating into a memo that would route somewhere else.
  it('rejects a UTXO-sourced order whose memo exceeds the OP_RETURN cap', () => {
    expect(() =>
      buildLimitSwapMemoForCoins({
        fromCoin: btcCoin,
        toCoin: usdcCoin,
        amount: 100_000_000n,
        targetPrice: 60_000,
        expiryHours: 24,
        destinationAddress: evmAddress,
      })
    ).toThrow(/exceeding utxo limit 80/)
  })

  it('rejects a chain THORChain cannot route', () => {
    expect(() =>
      buildLimitSwapMemoForCoins({
        fromCoin: { chain: Chain.Sui, ticker: 'SUI', decimals: 9 },
        toCoin: btcCoin,
        amount: 10n ** 9n,
        targetPrice: 0.04,
        expiryHours: 24,
        destinationAddress: btcAddress,
      })
    ).toThrow(/not routable through THORChain/)
  })

  it('rejects a trade too small to express as a limit order', () => {
    // A LIM of 0 would be read by THORChain as an unprotected market order.
    expect(() =>
      buildLimitSwapMemoForCoins({
        fromCoin: ethCoin,
        toCoin: btcCoin,
        amount: 1n,
        targetPrice: 0.04,
        expiryHours: 24,
        destinationAddress: btcAddress,
      })
    ).toThrow()
  })

  it('rejects a destination address that is not valid for the target chain', () => {
    expect(() =>
      buildLimitSwapMemoForCoins({
        fromCoin: ethCoin,
        toCoin: btcCoin,
        amount: 10n ** 18n,
        targetPrice: 0.04,
        expiryHours: 24,
        destinationAddress: evmAddress,
      })
    ).toThrow()
  })
})
