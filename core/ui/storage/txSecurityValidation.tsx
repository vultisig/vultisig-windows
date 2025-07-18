import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import {
  noPersistQueryOptions,
  noRefetchQueryOptions,
} from '@lib/ui/query/utils/options'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export const isTxSecurityValidationEnabled = true

type SetIsTxSecurityValidationEnabledFunction = (
  isTxSecurityValidationEnabled: boolean
) => Promise<void>

type GetIsTxSecurityValidationEnabledFunction = () => Promise<boolean>

export type TxSecurityValidationStorage = {
  getIsTxSecurityValidationEnabled: GetIsTxSecurityValidationEnabledFunction
  setIsTxSecurityValidationEnabled: SetIsTxSecurityValidationEnabledFunction
}

export const useIsTxSecurityValidationEnabledQuery = () => {
  const { getIsTxSecurityValidationEnabled } = useCore()

  return useQuery({
    queryKey: [StorageKey.isTxSecurityValidationEnabled],
    queryFn: getIsTxSecurityValidationEnabled,
    ...noRefetchQueryOptions,
    ...noPersistQueryOptions,
  })
}

export const useIsTxSecurityValidationEnabled = () => {
  const { data } = useIsTxSecurityValidationEnabledQuery()

  return shouldBeDefined(data)
}

export const useSetIsTxSecurityValidationEnabledMutation = () => {
  const { setIsTxSecurityValidationEnabled } = useCore()
  const invalidateQueries = useInvalidateQueries()

  const mutationFn: SetIsTxSecurityValidationEnabledFunction = async input => {
    await setIsTxSecurityValidationEnabled(input)
    await invalidateQueries([StorageKey.isTxSecurityValidationEnabled])
  }

  return useMutation({
    mutationFn,
  })
}
