import { useHasFinishedOnboarding } from '@clients/extension/src/components/onboarding/hooks/useHasFinishedOnboarading'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { ChildrenProp } from '@lib/ui/props'
import { useEffect } from 'react'

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
