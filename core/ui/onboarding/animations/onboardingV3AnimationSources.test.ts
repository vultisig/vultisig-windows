import { describe, expect, it } from 'vitest'

import {
  getOnboardingV3AnimationPath,
  onboardingSuccessAnimationSource,
  reviewDevicesAnimationSource,
} from './onboardingV3AnimationSources'

describe('onboardingV3AnimationSources', () => {
  it('builds path for success animation', () => {
    expect(getOnboardingV3AnimationPath(onboardingSuccessAnimationSource)).toBe(
      '/core/animations/onboarding_success.riv'
    )
  })

  it('builds path for review-devices animation', () => {
    expect(getOnboardingV3AnimationPath(reviewDevicesAnimationSource)).toBe(
      '/core/animations/review_devices.riv'
    )
  })
})
