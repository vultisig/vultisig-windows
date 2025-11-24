import { getTxBlockaidValidation } from '@core/chain/security/blockaid/tx/validation'
import { parseBlockaidValidation } from '@core/chain/security/blockaid/tx/validation/api/core'
import { BlockaidTxValidationInput } from '@core/chain/security/blockaid/tx/validation/resolver'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'

export const getBlockaidTxValidationQuery = (
  input: BlockaidTxValidationInput
) => ({
  queryKey: ['blockaidTxValidation', input],
  queryFn: async () =>
    parseBlockaidValidation(await getTxBlockaidValidation(input)),
  ...noRefetchQueryOptions,
})
