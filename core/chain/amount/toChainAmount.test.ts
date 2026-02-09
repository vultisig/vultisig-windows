import { decimalStringToBigInt } from '@lib/utils/bigint/decimalStringToBigInt'
import { describe, expect, it } from 'vitest'

import { toChainAmount } from './toChainAmount'

describe('toChainAmount - Floating Point Bug', () => {
  it('should correctly convert 8.8852 USDT (6 decimals) to chain amount', () => {
    const result = toChainAmount(8.8852, 6)
    const expected = 8885200n
    console.log(`Input: 8.8852`)
    console.log(`Expected: ${expected}`)
    console.log(`Got: ${result}`)
    console.log(`Match: ${result === expected}`)

    // This FAILS due to floating-point error!
    // 8.8852 * 10^6 in JavaScript = 8885199.999999... not exactly 8885200
    expect(result).toBe(expected)
  })

  it('should show the floating-point precision loss with toChainAmount', () => {
    const decimals = 18
    const result = toChainAmount(28.57142857142857, decimals)
    const correctResult = decimalStringToBigInt('28.57142857142857', decimals) // Properly truncated

    console.log(`\ntoChainAmount precision loss:`)
    console.log(`toChainAmount result: ${result}`)
    console.log(`Correct truncated: ${correctResult}`)
    console.log(`Match: ${result === correctResult}`)

    // Show the precision loss
    expect(result).toBe(correctResult)
  })

  it('should fail with other problematic decimal amounts', () => {
    const testCases = [
      { input: 0.1, decimals: 1, expected: 1n },
      { input: 0.2, decimals: 1, expected: 2n },
      { input: 0.3, decimals: 1, expected: 3n },
      { input: 1.1, decimals: 1, expected: 11n },
      { input: 2.3, decimals: 1, expected: 23n },
    ]

    console.log(`\nTesting other problematic amounts:`)
    for (const { input, decimals, expected } of testCases) {
      const result = toChainAmount(input, decimals)
      const matches = result === expected
      console.log(
        `${input} with ${decimals} decimals: expected ${expected}, got ${result} ${matches ? '✓' : '✗'}`
      )
      expect(result).toBe(expected)
    }
  })

  it('should work correctly with the safe string-based conversion', () => {
    // This is the CORRECT way - using string input
    const result = decimalStringToBigInt('8.8852', 6)
    const expected = 8885200n

    console.log(`\nUsing safe string conversion:`)
    console.log(`Input: "8.8852"`)
    console.log(`Expected: ${expected}`)
    console.log(`Got: ${result}`)
    console.log(`Match: ${result === expected}`)

    // This PASSES!
    expect(result).toBe(expected)
  })

  it('should work with various decimal strings safely', () => {
    const testCases = [
      { input: '0.1', decimals: 1, expected: 1n },
      { input: '0.2', decimals: 1, expected: 2n },
      { input: '0.3', decimals: 1, expected: 3n },
      { input: '1.1', decimals: 1, expected: 11n },
      { input: '2.3', decimals: 1, expected: 23n },
      { input: '8.8852', decimals: 6, expected: 8885200n },
      { input: '123.456789', decimals: 6, expected: 123456789n },
      { input: '0.000001', decimals: 6, expected: 1n },
    ]

    console.log(`\nTesting safe string conversions:`)
    for (const { input, decimals, expected } of testCases) {
      const result = decimalStringToBigInt(input, decimals)
      const matches = result === expected
      console.log(
        `"${input}" with ${decimals} decimals: expected ${expected}, got ${result} ${matches ? '✓' : '✗'}`
      )
      expect(result).toBe(expected)
    }
  })

  it('should demonstrate the real-world impact: USDT payment', () => {
    // Real scenario: User wants to send 8.8852 USDT
    const userInput = 8.8852 // This is what AmountTextInput produces after parseFloat
    const decimals = 6 // USDT has 6 decimals

    const brokenAmount = toChainAmount(userInput, decimals)
    const correctAmount = decimalStringToBigInt('8.8852', decimals)

    console.log(`\nReal-world scenario - USDT payment:`)
    console.log(`User enters: 8.8852 USDT`)
    console.log(`Current code produces: ${brokenAmount}`)
    console.log(`Should be: ${correctAmount}`)
    console.log(`Difference: ${correctAmount - brokenAmount} (wei)`)

    expect(correctAmount).toBe(8885200n)
  })

  it('should expose the REAL problem: FiatSendAmountInput fiat→crypto conversion', () => {
    // The REAL issue: User enters fiat amount, gets converted through division by price
    // Example: User has $50 USD to spend, BTC price is $45,000
    // Expected: 50 / 45000 = 0.00111111... BTC (but how many decimals???)
    const fiatAmount = 50 // User enters $50
    const btcPrice = 45000 // BTC price in USD
    const btcDecimals = 8 // BTC has 8 decimals

    // This is what FiatSendAmountInput.tsx line 52 does:
    // onChange(value === null ? null : toChainAmount(value / price, decimals))
    const cryptoAmount = fiatAmount / btcPrice // 50 / 45000
    console.log(`\nFiat conversion issue:`)
    console.log(`Fiat amount: $${fiatAmount}`)
    console.log(`Price: $${btcPrice}/BTC`)
    console.log(`Crypto amount (floating-point): ${cryptoAmount}`)
    console.log(
      `Floating-point decimals: ${cryptoAmount.toString().split('.')[1]?.length || 0}`
    )

    // The problem: floating-point has 16+ decimal places, but token only supports 8!
    const result = toChainAmount(cryptoAmount, btcDecimals)
    console.log(`toChainAmount result: ${result}`)
    console.log(`As decimal: ${Number(result) / Math.pow(10, btcDecimals)}`)

    // The safe way: truncate to token decimals FIRST
    const truncatedString = cryptoAmount.toFixed(btcDecimals)
    const safeResult = decimalStringToBigInt(truncatedString, btcDecimals)

    console.log(`Safe truncated string: ${truncatedString}`)
    console.log(`Safe result: ${safeResult}`)
    console.log(`As decimal: ${Number(safeResult) / Math.pow(10, btcDecimals)}`)

    // The problem is revealed: floating-point division creates precision issues
    expect(result).toBe(safeResult) // Both should truncate the same way
  })

  it('should show precision loss in common price scenarios', () => {
    // Common problematic price conversions
    const testCases = [
      { fiat: 100, price: 3.5, decimals: 18 }, // $100 / $3.5 per token
      { fiat: 50, price: 1.05, decimals: 6 }, // $50 / $1.05 per token
      { fiat: 1000, price: 0.0001, decimals: 8 }, // $1000 / $0.0001 per token
    ]

    console.log(`\nPrecision loss in price divisions:`)
    for (const { fiat, price, decimals } of testCases) {
      const cryptoAmount = fiat / price
      const result = toChainAmount(cryptoAmount, decimals)

      console.log(
        `$${fiat} / $${price} = ${cryptoAmount} → ${result}n (may have floating-point error)`
      )
    }
  })
})
