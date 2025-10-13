import { getKeysignTxData } from '@core/mpc/keysign/txData'
import { KeysignTxDataResolverInput } from '@core/mpc/keysign/txData/resolver'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'

export const useKeysignTxDataQuery = (input: KeysignTxDataResolverInput) => {
  return useQuery({
    queryKey: ['keysignTxData', input],
    queryFn: () => getKeysignTxData(input),
    ...noRefetchQueryOptions,
  })
}
