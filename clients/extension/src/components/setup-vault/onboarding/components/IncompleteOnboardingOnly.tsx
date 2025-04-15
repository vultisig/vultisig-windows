import { ChildrenProp } from '@lib/ui/props'
import { useEffect } from 'react'

import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'
import { useHasFinishedOnboarding } from '../hooks/useHasFinishedOnboarading'

export const IncompleteOnboardingOnly = ({ children }: ChildrenProp) => {
  const { data: hasFinishedOnboarding } = useHasFinishedOnboarding()

  const navigate = useAppNavigate()

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
