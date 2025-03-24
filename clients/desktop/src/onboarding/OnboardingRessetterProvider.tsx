import { FC, PropsWithChildren, useEffect } from 'react'

import {
  CreateInstallMarker,
  IsFreshInstall,
} from '../../wailsjs/go/main/InstallMarkerService'
import {
  PersistentStateKey,
  usePersistentState,
} from '../state/persistentState'

const OnboardingResetter: FC<PropsWithChildren> = ({ children }) => {
  const [, setCompletedOnboarding] = usePersistentState(
    PersistentStateKey.HasFinishedOnboarding,
    false
  )

  useEffect(() => {
    const checkAndSetInstallMarker = async () => {
      try {
        const freshInstall = await IsFreshInstall()
        if (freshInstall) {
          setCompletedOnboarding(false)
          await CreateInstallMarker()
        }
      } catch (error) {
        console.error(error)
      }
    }
    checkAndSetInstallMarker()
  }, [setCompletedOnboarding])

  return <>{children}</>
}

export default OnboardingResetter
