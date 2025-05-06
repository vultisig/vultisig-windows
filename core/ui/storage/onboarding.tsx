import { hasFinishedOnboardingQueryKey } from '@core/ui/query/keys'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'

export const useHasFinishedOnboardingQuery = () => {
  const { getHasFinishedOnboarding } = useCore()

  return useQuery({
    queryKey: hasFinishedOnboardingQueryKey,
    queryFn: getHasFinishedOnboarding,
  })
}

export const useHasFinishedOnboarding = () => {
  const { data } = useHasFinishedOnboardingQuery()

  return shouldBeDefined(data)
}

export const useSetHasFinishedOnboardingMutation = () => {
  const { setHasFinishedOnboarding } = useCore()
  const invalidateQueries = useInvalidateQueries()

  return useMutation({
    mutationFn: setHasFinishedOnboarding,
    onSuccess: () => invalidateQueries(hasFinishedOnboardingQueryKey),
  })
}
