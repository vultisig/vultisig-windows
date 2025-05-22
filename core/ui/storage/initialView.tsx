import { View } from '@lib/ui/navigation/View'
import { fixedDataQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export type GetInitialViewFunction = () => Promise<View>

export type InitialViewStorage = {
  getInitialView: GetInitialViewFunction
}

export const useInitialViewQuery = () => {
  const { getInitialView } = useCore()

  return useQuery({
    queryKey: [StorageKey.initialView],
    queryFn: getInitialView,
    ...fixedDataQueryOptions,
  })
}
