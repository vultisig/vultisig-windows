import { getTxBlockaidValidation } from '@core/chain/security/blockaid/tx/validation'
import { parseBlockaidValidation } from '@core/chain/security/blockaid/tx/validation/api/core'
import { BlockaidTxValidationInput } from '@core/chain/security/blockaid/tx/validation/resolver'
import {
  noPersistQueryOptions,
  noRefetchQueryOptions,
} from '@lib/ui/query/utils/options'

export const getBlockaidTxScanQuery = (input: BlockaidTxValidationInput) => ({
  queryKey: ['blockaidTxScan', input],
  queryFn: async () =>
    parseBlockaidValidation(await getTxBlockaidValidation(input)),
  ...noRefetchQueryOptions,
  ...noPersistQueryOptions,
})
