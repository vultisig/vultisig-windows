import {
  BlockaidTxScanInput,
  scanTxWithBlockaid,
} from '@core/chain/security/blockaid/tx/scan'
import {
  noPersistQueryOptions,
  noRefetchQueryOptions,
} from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'

export const useBlockaidTxScanQuery = (input: BlockaidTxScanInput) => {
  return useQuery({
    queryKey: ['blockaidTxScan', input],
    queryFn: () => scanTxWithBlockaid(input),
    ...noRefetchQueryOptions,
    ...noPersistQueryOptions,
  })
}
