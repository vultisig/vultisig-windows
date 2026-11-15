import { describe, expect, it } from 'vitest'

import {
  formatSlippage,
  parseCustomSlippageInput,
  slippageToPercent,
  SlippageValue,
} from './slippage'

describe('formatSlippage', () => {
  it.each([
    [{ mode: 'auto', customPercent: 0 }, 'Auto'],
    [{ mode: '0.5', customPercent: 0 }, '0.5%'],
    [{ mode: '1', customPercent: 0 }, '1%'],
    [{ mode: '3', customPercent: 0 }, '3%'],
    [{ mode: 'custom', customPercent: 2.25 }, '2.25%'],
    [{ mode: 'custom', customPercent: 0 }, 'Auto'],
    [{ mode: 'custom', customPercent: -1 }, 'Auto'],
  ] satisfies Array<[SlippageValue, string]>)(
    'formats %j as %s',
    (slippage, label) => {
      expect(formatSlippage(slippage, 'Auto')).toBe(label)
    }
  )
})

describe('slippageToPercent', () => {
  it.each([
    [{ mode: 'auto', customPercent: 0 }, undefined],
    [{ mode: '0.5', customPercent: 0 }, 0.5],
    [{ mode: '1', customPercent: 0 }, 1],
    [{ mode: '3', customPercent: 0 }, 3],
    [{ mode: 'custom', customPercent: 2.25 }, 2.25],
    [{ mode: 'custom', customPercent: 0 }, undefined],
    [{ mode: 'custom', customPercent: -1 }, undefined],
  ] satisfies Array<[SlippageValue, number | undefined]>)(
    'maps %j to %s',
    (slippage, percent) => {
      expect(slippageToPercent(slippage)).toBe(percent)
    }
  )
})

describe('parseCustomSlippageInput', () => {
  it.each([
    ['0.5', '0.5', 0.5],
    ['2.25', '2.25', 2.25],
    ['', '', 0],
    ['.5', '0.5', 0.5],
    ['80', '80', 50],
  ])('parses %j as text %j and %s%%', (raw, text, percent) => {
    expect(parseCustomSlippageInput(raw)).toEqual({ text, percent })
  })

  it.each([
    ['0,5', '0.5', 0.5],
    ['1,5', '1.5', 1.5],
    [',5', '0.5', 0.5],
    ['3,', '3.', 3],
  ])(
    'reads the comma in %j as the decimal point (#5289)',
    (raw, text, percent) => {
      // Unparsed, `0,5` became 0, which slippageToPercent turns into Auto, so
      // the swap silently used the provider default instead of 0.5%.
      expect(parseCustomSlippageInput(raw)).toEqual({ text, percent })
      expect(
        slippageToPercent({ mode: 'custom', customPercent: percent })
      ).toBe(percent)
    }
  )

  it.each(['0,,', '0.,', '1,2,5', '1,2.5', '0.5.0', 'abc', '-1'])(
    'rejects %j so the field never fills with junk',
    raw => {
      expect(parseCustomSlippageInput(raw)).toBeUndefined()
    }
  )
})
