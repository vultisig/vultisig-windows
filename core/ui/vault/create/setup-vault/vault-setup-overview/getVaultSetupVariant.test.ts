import { describe, expect, it } from 'vitest'

import { getVaultSetupVariant } from './getVaultSetupVariant'

describe('getVaultSetupVariant', () => {
  it('returns fast setup for zero or negative selected device count', () => {
    expect(getVaultSetupVariant(0)).toEqual({
      key: 'fast',
      securityType: 'fast',
    })
    expect(getVaultSetupVariant(-1)).toEqual({
      key: 'fast',
      securityType: 'fast',
    })
  })

  it('returns secure2 for one selected peer', () => {
    expect(getVaultSetupVariant(1)).toEqual({
      key: 'secure2',
      securityType: 'secure',
    })
  })

  it('returns secure3 for two selected peers', () => {
    expect(getVaultSetupVariant(2)).toEqual({
      key: 'secure3',
      securityType: 'secure',
    })
  })

  it('caps at secure4 for three or more selected peers', () => {
    expect(getVaultSetupVariant(3)).toEqual({
      key: 'secure4',
      securityType: 'secure',
    })
    expect(getVaultSetupVariant(8)).toEqual({
      key: 'secure4',
      securityType: 'secure',
    })
  })
})
