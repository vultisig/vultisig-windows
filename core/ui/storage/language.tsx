import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { useMutation, useQuery } from '@tanstack/react-query'

import { Language } from '../i18n/Language'
import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

type GetLanguageFunction = () => Promise<Language>

type SetLanguageFunction = (language: Language) => Promise<void>

export type LanguageStorage = {
  getLanguage: GetLanguageFunction
  setLanguage: SetLanguageFunction
}

export const useLanguageQuery = () => {
  const { getLanguage } = useCore()

  return useQuery({
    queryKey: [StorageKey.language],
    queryFn: getLanguage,
    ...noRefetchQueryOptions,
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
    await invalidateQueries([StorageKey.language])
  }

  return useMutation({
    mutationFn,
  })
}
