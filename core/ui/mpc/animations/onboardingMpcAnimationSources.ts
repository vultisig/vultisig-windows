export const keygenFastAnimationSource = 'keygen_fast' as const
export const keygenSecureAnimationSource = 'keygen_secure' as const
export const keygenSecurePairedDeviceAnimationSource =
  'keygen_secure_paired_device' as const
export const searchingDeviceAnimationSource = 'searching_device' as const
export const dotsIndicatorAnimationSource = 'dots_indicator' as const

type OnboardingMpcAnimationSource =
  | typeof dotsIndicatorAnimationSource
  | typeof keygenFastAnimationSource
  | typeof keygenSecureAnimationSource
  | typeof keygenSecurePairedDeviceAnimationSource
  | typeof searchingDeviceAnimationSource

export type { OnboardingMpcAnimationSource }

export const getOnboardingMpcAnimationPath = (
  source: OnboardingMpcAnimationSource
) => `/core/animations/${source}.riv`
