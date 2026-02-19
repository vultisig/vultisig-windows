import {
  keygenFastAnimationSource,
  keygenSecureAnimationSource,
  keygenSecurePairedDeviceAnimationSource,
} from '@core/ui/mpc/animations/onboardingMpcAnimationSources'
import { describe, expect, it } from 'vitest'

import { getKeygenLoadingAnimationSource } from './getKeygenLoadingAnimationSource'

describe('getKeygenLoadingAnimationSource', () => {
  it('returns fast animation when signer set includes server', () => {
    expect(
      getKeygenLoadingAnimationSource({
        isInitiatingDevice: false,
        signers: ['Server-1111', 'iPhone-2222'],
      })
    ).toBe(keygenFastAnimationSource)
  })

  it('prioritizes fast animation even when current device initiates', () => {
    expect(
      getKeygenLoadingAnimationSource({
        isInitiatingDevice: true,
        signers: ['Server-1111', 'Mac-2222'],
      })
    ).toBe(keygenFastAnimationSource)
  })

  it('returns paired-device secure animation for non-initiating secure device', () => {
    expect(
      getKeygenLoadingAnimationSource({
        isInitiatingDevice: false,
        signers: ['Mac-1111', 'iPhone-2222'],
      })
    ).toBe(keygenSecurePairedDeviceAnimationSource)
  })

  it('returns default secure animation for initiating secure device', () => {
    expect(
      getKeygenLoadingAnimationSource({
        isInitiatingDevice: true,
        signers: ['Mac-1111', 'iPhone-2222'],
      })
    ).toBe(keygenSecureAnimationSource)
  })
})
