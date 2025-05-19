import { useSetHasFinishedOnboardingMutation } from '@core/ui/storage/onboarding'
import { useEffect } from 'react'

import {
  CreateInstallMarker,
  IsFreshInstall,
} from '../../wailsjs/go/main/InstallMarkerService'

export const OnboardingResetter = () => {
  const { mutateAsync: setHasFinishedOnboarding } =
    useSetHasFinishedOnboardingMutation()

  useEffect(() => {
    const checkAndSetInstallMarker = async () => {
      try {
        const freshInstall = await IsFreshInstall()
        if (freshInstall) {
          await setHasFinishedOnboarding(false)
          await CreateInstallMarker()
        }
      } catch (error) {
        console.error(error)
      }
    }
    checkAndSetInstallMarker()
  }, [setHasFinishedOnboarding])

  return null
}
