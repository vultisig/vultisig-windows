import { describe, expect, it } from 'vitest'

import { getProductBrandInterpolation } from './productBrandInterpolation'

describe('getProductBrandInterpolation', () => {
  it('exposes Vultisig interpolation values', () => {
    expect(
      getProductBrandInterpolation({
        extensionName: 'Vultisig Extension',
        name: 'Vultisig',
        websiteUrl: 'https://vultisig.com',
      })
    ).toEqual({
      productExtensionName: 'Vultisig Extension',
      productName: 'Vultisig',
      productWebsiteHost: 'vultisig.com',
      productWebsiteUrl: 'https://vultisig.com',
    })
  })

  it('exposes Station interpolation values', () => {
    expect(
      getProductBrandInterpolation({
        extensionName: 'Station Wallet',
        name: 'Station',
        websiteUrl: 'https://station.money',
      })
    ).toEqual({
      productExtensionName: 'Station Wallet',
      productName: 'Station',
      productWebsiteHost: 'station.money',
      productWebsiteUrl: 'https://station.money',
    })
  })
})
