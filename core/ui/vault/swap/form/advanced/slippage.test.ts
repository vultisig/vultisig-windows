import { describe, expect, it } from 'vitest'

import { formatSlippage, slippageToPercent, SlippageValue } from './slippage'

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
