import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { ChildrenProp } from '@lib/ui/props'
import { useEffect } from 'react'

import { useHasFinishedOnboarding } from './hooks/useHasFinishedOnboarding'

export const IncompleteOnboardingOnly = ({ children }: ChildrenProp) => {
  const [hasCompletedOnboarding] = useHasFinishedOnboarding()

  const navigate = useCoreNavigate()

  useEffect(() => {
    if (hasCompletedOnboarding) {
      navigate('root')
    }
  }, [hasCompletedOnboarding, navigate])

  if (hasCompletedOnboarding) {
    return null
  }

  return <>{children}</>
}
