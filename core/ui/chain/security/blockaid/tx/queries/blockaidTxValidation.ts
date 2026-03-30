import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { getTxBlockaidValidation } from '@vultisig/core-chain/security/blockaid/tx/validation'
import { parseBlockaidValidation } from '@vultisig/core-chain/security/blockaid/tx/validation/api/core'
import { BlockaidTxValidationInput } from '@vultisig/core-chain/security/blockaid/tx/validation/resolver'

export const getBlockaidTxValidationQuery = (
  input: BlockaidTxValidationInput
) => ({
  queryKey: ['blockaidTxValidation', input],
  queryFn: async () =>
    parseBlockaidValidation(await getTxBlockaidValidation(input)),
  ...noRefetchQueryOptions,
})
