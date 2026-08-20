import { Chain } from '@vultisig/core-chain/Chain'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { describe, expect, it } from 'vitest'

import {
  buildLimitSwapMemoForCoins,
  getLimitSwapExpectedToAmount,
} from './memo'
import { quantizeTargetPrice } from './price'
import { rateToSellUnitFiatValue, sellUnitFiatValueToRate } from './rate'

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

  // The form's display orientation must never leak into the signed order: the
  // same target entered in asset mode (the rate itself) or through its fiat
  // mirror has to land on a byte-identical memo.
  it('builds the same memo from an asset-mode and a fiat-mode entry', () => {
    const rate = 0.0295
    const btcFiatPrice = 64_260
    // Fixed independently of the conversion helpers (0.0295 x 64,260), so a
    // shared orientation bug in the fiat round trip cannot cancel itself out.
    const fiatValue = 1_895.67

    expect(
      shouldBePresent(
        rateToSellUnitFiatValue({ rate, buyCoinFiatPrice: btcFiatPrice })
      )
    ).toBeCloseTo(fiatValue, 2)

    const build = (targetPrice: number) =>
      buildLimitSwapMemoForCoins({
        fromCoin: ethCoin,
        toCoin: btcCoin,
        amount: 10n ** 18n,
        targetPrice,
        expiryHours: 12,
        destinationAddress: btcAddress,
      })

    const assetEntry = quantizeTargetPrice(rate)
    const fiatEntry = quantizeTargetPrice(
      shouldBePresent(
        sellUnitFiatValueToRate({ fiatValue, buyCoinFiatPrice: btcFiatPrice })
      )
    )

    expect(build(fiatEntry)).toBe(build(assetEntry))
    expect(build(assetEntry)).toBe(
      `=<:BTC.BTC:${btcAddress}:2950000/7200/0:v0:50`
    )
  })
})

describe('getLimitSwapExpectedToAmount', () => {
  // The SDK formats this field with getNativeSwapDecimals(toCoin) -- 8 for every
  // THORChain limit-swap target -- so it must be the memo's LIM in 1e8, not the
  // target coin's own units. Scaling to toCoin.decimals leaves the signed memo
  // right but shows the co-signer 100x low for USDC and 1e10x high for ETH.
  it.each([
    ['a 6-decimal target', usdcCoin],
    ['an 18-decimal target', ethCoin],
  ])('equals the LIM the memo encodes for %s', (_label, toCoin) => {
    const order = {
      fromCoin: btcCoin,
      amount: 100_000_000n,
      targetPrice: 0.5,
    } as const

    const memo = buildLimitSwapMemoForCoins({
      ...order,
      toCoin,
      expiryHours: 24,
      destinationAddress: evmAddress,
    })

    const [encodedLim] = shouldBePresent(memo.split(':')[3]).split('/')

    expect(getLimitSwapExpectedToAmount(order).toString()).toBe(encodedLim)
  })

  it('stays in 1e8 regardless of the source coin decimals', () => {
    // 1 ETH at 0.04 BTC/ETH -> 0.04 BTC, which is 4000000 in 1e8.
    expect(
      getLimitSwapExpectedToAmount({
        fromCoin: ethCoin,
        amount: 10n ** 18n,
        targetPrice: 0.04,
      })
    ).toBe(4_000_000n)
  })

  // A zero LIM is how THORChain spells "unprotected market order".
  it('throws when the LIM floors to zero', () => {
    expect(() =>
      getLimitSwapExpectedToAmount({
        fromCoin: ethCoin,
        amount: 1n,
        targetPrice: 0.04,
      })
    ).toThrow()
  })
})
