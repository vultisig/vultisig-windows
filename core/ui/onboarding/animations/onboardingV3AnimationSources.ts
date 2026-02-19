export const reviewDevicesAnimationSource = 'review_devices' as const
export const onboardingSuccessAnimationSource = 'onboarding_success' as const

type OnboardingV3AnimationSource =
  | typeof onboardingSuccessAnimationSource
  | typeof reviewDevicesAnimationSource

export const getOnboardingV3AnimationPath = (
  source: OnboardingV3AnimationSource
) => `/core/animations/${source}.riv`
