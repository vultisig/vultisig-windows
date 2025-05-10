import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useHasFinishedOnboarding } from '@core/ui/storage/onboarding'
import { ChildrenProp } from '@lib/ui/props'
import { useEffect } from 'react'

export const IncompleteOnboardingOnly = ({ children }: ChildrenProp) => {
  const hasCompletedOnboarding = useHasFinishedOnboarding()

  const navigate = useCoreNavigate()

  useEffect(() => {
    if (hasCompletedOnboarding) {
      navigate({ id: 'vault' })
    }
  }, [hasCompletedOnboarding, navigate])

  if (hasCompletedOnboarding) {
    return null
  }

  return <>{children}</>
}
