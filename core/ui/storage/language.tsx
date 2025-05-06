import { languageQueryKey } from '@core/ui/query/keys'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { SetLanguageFunction } from './CoreStorage'

export const useLanguageQuery = () => {
  const { getLanguage } = useCore()

  return useQuery({
    queryKey: languageQueryKey,
    queryFn: getLanguage,
  })
}

export const useLanguage = () => {
  const { data } = useLanguageQuery()

  return shouldBeDefined(data)
}

export const useSetLanguageMutation = () => {
  const { setLanguage } = useCore()
  const invalidateQueries = useInvalidateQueries()

  const mutationFn: SetLanguageFunction = async input => {
    await setLanguage(input)
    await invalidateQueries(languageQueryKey)
  }

  return useMutation({
    mutationFn,
  })
}
