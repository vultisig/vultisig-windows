import { describe, expect, it } from 'vitest'

import { getKeygenFlowSuccessAnimationSource } from './getKeygenFlowSuccessAnimationSource'

describe('getKeygenFlowSuccessAnimationSource', () => {
  it('uses the supplied Station animation for Fast Vault keygen', () => {
    expect(
      getKeygenFlowSuccessAnimationSource({
        productBrand: 'station',
        securityType: 'fast',
      })
    ).toBe('station-keygen-fast')
  })

  it('preserves the existing Station Secure Vault animation', () => {
    expect(
      getKeygenFlowSuccessAnimationSource({
        productBrand: 'station',
        securityType: 'secure',
      })
    ).toBe('keygen-secure')
  })

  it('preserves the existing Vultisig Fast Vault animation', () => {
    expect(
      getKeygenFlowSuccessAnimationSource({
        productBrand: 'vultisig',
        securityType: 'fast',
      })
    ).toBe('keygen-fast')
  })
})
