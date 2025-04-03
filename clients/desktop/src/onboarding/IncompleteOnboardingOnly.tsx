import { useAppNavigate } from '@lib/ui/navigation/hooks/useAppNavigate'
import { ChildrenProp } from '@lib/ui/props'
import { useEffect } from 'react'

import { useHasFinishedOnboarding } from './hooks/useHasFinishedOnboarding'

export const IncompleteOnboardingOnly = ({ children }: ChildrenProp) => {
  const [hasCompletedOnboarding] = useHasFinishedOnboarding()

  const navigate = useAppNavigate()

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
