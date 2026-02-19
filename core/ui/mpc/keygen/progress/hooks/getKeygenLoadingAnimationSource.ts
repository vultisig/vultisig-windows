import { hasServer } from '@core/mpc/devices/localPartyId'
import {
  keygenFastAnimationSource,
  keygenSecureAnimationSource,
  keygenSecurePairedDeviceAnimationSource,
} from '@core/ui/mpc/animations/onboardingMpcAnimationSources'

type GetKeygenLoadingAnimationSourceInput = {
  isInitiatingDevice: boolean
  signers: string[]
}

export const getKeygenLoadingAnimationSource = ({
  isInitiatingDevice,
  signers,
}: GetKeygenLoadingAnimationSourceInput) => {
  if (hasServer(signers)) {
    return keygenFastAnimationSource
  }

  if (!isInitiatingDevice) {
    return keygenSecurePairedDeviceAnimationSource
  }

  return keygenSecureAnimationSource
}
