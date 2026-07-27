import { describe, expect, it } from 'vitest'

import { getKeygenLoadingAnimationSource } from './getKeygenLoadingAnimationSource'

describe('getKeygenLoadingAnimationSource', () => {
  it('uses the supplied Station keygen animation in Station builds', () => {
    expect(getKeygenLoadingAnimationSource('station', 'fast')).toBe(
      '/core/animations/station-keygen-fast.riv'
    )
  })

  it('preserves the existing keygen animation in Vultisig builds', () => {
    expect(getKeygenLoadingAnimationSource('vultisig', 'fast')).toBe(
      '/core/animations/keygen-loading.riv'
    )
  })

  it('preserves the existing Station animation outside Fast Vault keygen', () => {
    expect(getKeygenLoadingAnimationSource('station', 'secure')).toBe(
      '/core/animations/keygen-loading.riv'
    )

    expect(getKeygenLoadingAnimationSource('station')).toBe(
      '/core/animations/keygen-loading.riv'
    )
  })
})
