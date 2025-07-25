import {
  BlockaidTxScanInput,
  scanTxWithBlockaid,
} from '@core/chain/security/blockaid/tx/scan'
import {
  noPersistQueryOptions,
  noRefetchQueryOptions,
} from '@lib/ui/query/utils/options'

export const getBlockaidTxScanQuery = (input: BlockaidTxScanInput) => ({
  queryKey: ['blockaidTxScan', input],
  queryFn: () => scanTxWithBlockaid(input),
  ...noRefetchQueryOptions,
  ...noPersistQueryOptions,
})
