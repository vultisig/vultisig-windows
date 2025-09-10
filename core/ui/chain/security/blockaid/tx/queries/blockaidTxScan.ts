import { getTxBlockaidValidation } from '@core/chain/security/blockaid/tx'
import { parseBlockaidValidation } from '@core/chain/security/blockaid/tx/api/core'
import { BlockaidTxValidationInput } from '@core/chain/security/blockaid/tx/resolver'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'

export const getBlockaidTxScanQuery = (input: BlockaidTxValidationInput) => ({
  queryKey: ['blockaidTxScan', input],
  queryFn: async () =>
    parseBlockaidValidation(await getTxBlockaidValidation(input)),
  ...noRefetchQueryOptions,
})
