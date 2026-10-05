import { Coin } from '@vultisig/core-chain/coin/Coin'
import { describe, expect, it } from 'vitest'

import { getAmountCandidates } from './getAmountCandidates'

const near = { ticker: 'NEAR' } as Coin

describe('getAmountCandidates', () => {
  it('drops one fraction digit at a time, longest first', () => {
    expect(getAmountCandidates(0.8596191426558598, near)).toEqual([
      '0.85961914 NEAR',
      '0.8596191 NEAR',
      '0.859619 NEAR',
      '0.85961 NEAR',
      '0.8596 NEAR',
      '0.859 NEAR',
      '0.85 NEAR',
      '0.8 NEAR',
    ])
  })

  it('cuts instead of rounding', () => {
    expect(getAmountCandidates(1.99999999, near).slice(-1)[0]).toBe('1 NEAR')
  })

  it('does not let a non-zero amount read as zero', () => {
    expect(getAmountCandidates(0.0000001, near)).toEqual(['0.0000001 NEAR'])
  })

  it('keeps a whole amount as is', () => {
    expect(getAmountCandidates(5, near)).toEqual(['5 NEAR'])
  })

  it('keeps the M suffix after the fraction', () => {
    expect(getAmountCandidates(1_234_567, near)).toEqual([
      '1.234567M NEAR',
      '1.23456M NEAR',
      '1.2345M NEAR',
      '1.234M NEAR',
      '1.23M NEAR',
      '1.2M NEAR',
      '1M NEAR',
    ])
  })
})
