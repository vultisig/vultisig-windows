import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

/**
 * The limit form's price chart starts collapsed: it costs two market-chart
 * requests to draw, and the numeric entry above it answers the common case on
 * its own.
 */
export const isLimitPriceChartInitiallyExpanded = false

type GetIsLimitPriceChartExpandedFunction = () => Promise<boolean>
type SetIsLimitPriceChartExpandedFunction = (
  isExpanded: boolean
) => Promise<void>

export type LimitPriceChartExpansionStorage = {
  getIsLimitPriceChartExpanded: GetIsLimitPriceChartExpandedFunction
  setIsLimitPriceChartExpanded: SetIsLimitPriceChartExpandedFunction
}

const useIsLimitPriceChartExpandedQuery = () => {
  const { getIsLimitPriceChartExpanded } = useCore()

  return useQuery({
    queryKey: [StorageKey.isLimitPriceChartExpanded],
    queryFn: getIsLimitPriceChartExpanded,
    ...noRefetchQueryOptions,
  })
}

const useSetIsLimitPriceChartExpandedMutation = () => {
  const { setIsLimitPriceChartExpanded } = useCore()
  const refetchQueries = useRefetchQueries()

  const mutationFn: SetIsLimitPriceChartExpandedFunction = async input => {
    await setIsLimitPriceChartExpanded(input)
    await refetchQueries([StorageKey.isLimitPriceChartExpanded])
  }

  return useMutation({ mutationFn })
}

/**
 * Whether the limit form's price chart is expanded, remembered across reloads
 * so someone who trades on the chart is not made to open it every time.
 * Reads as collapsed until the stored value arrives, which is also what gates
 * the fetch — so a reload never fires the chart's requests speculatively.
 */
export const useIsLimitPriceChartExpanded = () => {
  const { data } = useIsLimitPriceChartExpandedQuery()
  const { mutateAsync } = useSetIsLimitPriceChartExpandedMutation()

  const value = data ?? isLimitPriceChartInitiallyExpanded

  const setValue = (next: boolean) => mutateAsync(next)

  return [value, setValue] as const
}
