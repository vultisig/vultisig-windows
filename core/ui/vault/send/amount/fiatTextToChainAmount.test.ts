import { bigIntToDecimalString } from '@vultisig/lib-utils/bigint/bigIntToDecimalString'
import { decimalStringToBigInt } from '@vultisig/lib-utils/bigint/decimalStringToBigInt'
import { describe, expect, it } from 'vitest'

import {
  chainAmountToFiatText,
  fiatTextToChainAmount,
  roundDownToSignificantDigits,
} from './fiatTextToChainAmount'

const trimmed = (amount: bigint, decimals: number) => {
  const value = bigIntToDecimalString(amount, decimals)

  return value.includes('.') ? value.replace(/\.?0+$/, '') : value
}

describe('roundDownToSignificantDigits', () => {
  it.each([
    ['0.000339871234', 12, '0.00033987'],
    ['0.00714285714', 11, '0.0071428'],
    ['25.000000', 6, '25'],
    ['1234.56789', 8, '1234.5'],
    ['1234567.89', 8, '1234567'],
    ['0.999999', 6, '0.99999'],
  ])('rounds %s down to %s', (value, decimals, expected) => {
    const amount = decimalStringToBigInt(value, decimals)

    expect(
      trimmed(
        roundDownToSignificantDigits({
          amount,
          decimals,
          significantDigits: 5,
        }),
        decimals
      )
    ).toBe(expected)
  })

  it('never keeps more decimals than the coin has', () => {
    expect(
      roundDownToSignificantDigits({
        amount: 123n,
        decimals: 2,
        significantDigits: 5,
      })
    ).toBe(123n)
  })

  it('leaves zero as zero', () => {
    expect(
      roundDownToSignificantDigits({
        amount: 0n,
        decimals: 18,
        significantDigits: 5,
      })
    ).toBe(0n)
  })
})

describe('fiatTextToChainAmount', () => {
  it('divides exactly where float division would round below the true value', () => {
    // 0.3 / 0.1 is 2.9999999999999996 in float64.
    expect(
      fiatTextToChainAmount({ text: '0.3', price: 0.1, decimals: 8 })
    ).toBe(300_000_000n)
  })

  it('rounds the derived amount down to five significant digits', () => {
    expect(
      trimmed(
        fiatTextToChainAmount({ text: '25', price: 3500, decimals: 18 }) ?? 0n,
        18
      )
    ).toBe('0.0071428')
  })

  it('keeps whole units of a large amount', () => {
    expect(
      fiatTextToChainAmount({ text: '1234567.89', price: 1, decimals: 6 })
    ).toBe(1_234_567_000_000n)
  })

  it('returns null for an empty field and undefined for non-numbers', () => {
    expect(
      fiatTextToChainAmount({ text: '', price: 1, decimals: 6 })
    ).toBeNull()
    expect(
      fiatTextToChainAmount({ text: '1e5', price: 1, decimals: 6 })
    ).toBeUndefined()
    expect(
      fiatTextToChainAmount({ text: '1.2.3', price: 1, decimals: 6 })
    ).toBeUndefined()
  })

  it('handles prices written in exponent form', () => {
    expect(fiatTextToChainAmount({ text: '1', price: 2e-7, decimals: 0 })).toBe(
      5_000_000n
    )
  })

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, 1e-40])(
    'gives no amount at a price of %s instead of throwing',
    price => {
      expect(fiatTextToChainAmount({ text: '25', price, decimals: 18 })).toBe(
        null
      )
    }
  )
})

describe('chainAmountToFiatText', () => {
  it('gives the exact fiat value where float multiplication would add digits', () => {
    // 123.4 * 0.1 is 12.340000000000002 in float64
    expect(
      chainAmountToFiatText({
        amount: 123_400_000n,
        decimals: 6,
        price: 0.1,
        fractionDigits: 2,
      })
    ).toBe('12.34')
  })

  it('truncates to the currency precision instead of rounding up', () => {
    expect(
      chainAmountToFiatText({
        amount: 1_999_999n,
        decimals: 6,
        price: 1,
        fractionDigits: 2,
      })
    ).toBe('1.99')
  })

  it('keeps whole units only for a currency without minor units', () => {
    expect(
      chainAmountToFiatText({
        amount: 1_999_999n,
        decimals: 6,
        price: 150,
        fractionDigits: 0,
      })
    ).toBe('299')
  })

  it('pads a value below one minor unit', () => {
    expect(
      chainAmountToFiatText({
        amount: 1n,
        decimals: 6,
        price: 1,
        fractionDigits: 2,
      })
    ).toBe('0.00')
  })

  it('gives null for a price that cannot convert', () => {
    expect(
      chainAmountToFiatText({
        amount: 1n,
        decimals: 6,
        price: NaN,
        fractionDigits: 2,
      })
    ).toBeNull()
  })
})
