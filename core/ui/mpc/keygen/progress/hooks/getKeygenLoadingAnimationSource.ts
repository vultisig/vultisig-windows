import { hasServer } from '@core/mpc/devices/localPartyId'
import {
  keygenFastAnimationSource,
  keygenSecureAnimationSource,
  keygenSecurePairedDeviceAnimationSource,
  type OnboardingMpcAnimationSource,
} from '@core/ui/mpc/animations/onboardingMpcAnimationSources'

type GetKeygenLoadingAnimationSourceInput = {
  isInitiatingDevice: boolean
  signers: string[]
}

export const getKeygenLoadingAnimationSource = ({
  isInitiatingDevice,
  signers,
}: GetKeygenLoadingAnimationSourceInput): OnboardingMpcAnimationSource => {
  if (hasServer(signers)) {
    return keygenFastAnimationSource
  }

  if (!isInitiatingDevice) {
    return keygenSecurePairedDeviceAnimationSource
  }

  return keygenSecureAnimationSource
}
