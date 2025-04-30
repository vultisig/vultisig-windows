import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { ChildrenProp } from '@lib/ui/props'
import { useEffect } from 'react'

import { useHasFinishedOnboarding } from '../hooks/useHasFinishedOnboarading'

export const IncompleteOnboardingOnly = ({ children }: ChildrenProp) => {
  const { data: hasFinishedOnboarding } = useHasFinishedOnboarding()

  const navigate = useCoreNavigate()

  useEffect(() => {
    if (hasFinishedOnboarding) {
      navigate('root')
    }
  }, [hasFinishedOnboarding, navigate])

  if (hasFinishedOnboarding) {
    return null
  }

  return <>{children}</>
}
