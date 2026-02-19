import { describe, expect, it } from 'vitest'

import { getVaultSetupAnimationSource } from './getVaultSetupAnimationSource'

describe('getVaultSetupAnimationSource', () => {
  it('returns fast animation for zero or negative selected devices', () => {
    expect(getVaultSetupAnimationSource(0)).toBe('vault_setup_device1')
    expect(getVaultSetupAnimationSource(-2)).toBe('vault_setup_device1')
  })

  it('returns secure 2-device animation for one selected peer', () => {
    expect(getVaultSetupAnimationSource(1)).toBe('vault_setup_device2')
  })

  it('returns secure 3-device animation for two selected peers', () => {
    expect(getVaultSetupAnimationSource(2)).toBe('vault_setup_device3')
  })

  it('caps at secure 4-device animation for three or more selected peers', () => {
    expect(getVaultSetupAnimationSource(3)).toBe('vault_setup_device4')
    expect(getVaultSetupAnimationSource(12)).toBe('vault_setup_device4')
  })

  it('rounds down decimal selected-device values', () => {
    expect(getVaultSetupAnimationSource(1.9)).toBe('vault_setup_device2')
    expect(getVaultSetupAnimationSource(2.4)).toBe('vault_setup_device3')
  })
})
