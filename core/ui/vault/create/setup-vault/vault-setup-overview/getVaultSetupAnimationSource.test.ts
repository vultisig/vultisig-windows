import { describe, expect, it } from 'vitest'

import { getVaultSetupAnimationSource } from './getVaultSetupAnimationSource'

describe('getVaultSetupAnimationSource', () => {
  it('returns fast animation for zero or negative selected devices', () => {
    expect(getVaultSetupAnimationSource(0)).toBe('vault-setup-1device')
    expect(getVaultSetupAnimationSource(-2)).toBe('vault-setup-1device')
  })

  it('returns secure 2-device animation for one selected peer', () => {
    expect(getVaultSetupAnimationSource(1)).toBe('vault-setup-2devices')
  })

  it('returns secure 3-device animation for two selected peers', () => {
    expect(getVaultSetupAnimationSource(2)).toBe('vault-setup-3devices')
  })

  it('caps at secure 4-device animation for three or more selected peers', () => {
    expect(getVaultSetupAnimationSource(3)).toBe('vault-setup-4devices')
    expect(getVaultSetupAnimationSource(12)).toBe('vault-setup-4devices')
  })

  it('rounds down decimal selected-device values', () => {
    expect(getVaultSetupAnimationSource(1.9)).toBe('vault-setup-2devices')
    expect(getVaultSetupAnimationSource(2.4)).toBe('vault-setup-3devices')
  })
})
