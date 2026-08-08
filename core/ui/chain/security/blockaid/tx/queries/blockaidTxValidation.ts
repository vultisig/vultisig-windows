import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { RiskLevel } from '@vultisig/core-chain/security/blockaid/core/riskLevel'
import { getTxBlockaidValidation } from '@vultisig/core-chain/security/blockaid/tx/validation'
import {
  BlockaidValidation,
  parseBlockaidValidation,
} from '@vultisig/core-chain/security/blockaid/tx/validation/api/core'
import { BlockaidTxValidationInput } from '@vultisig/core-chain/security/blockaid/tx/validation/resolver'

export type BlockaidTxScanResult = {
  level: RiskLevel
  description?: string
} | null

const getValidationDescription = ({
  description,
  features,
  extended_features,
}: BlockaidValidation): string | undefined => {
  if (description) {
    return description
  }

  return (
    [...(features ?? []), ...(extended_features ?? [])]
      .map(feature => feature.description)
      .filter(Boolean)
      .join(' ') || undefined
  )
}

export const getBlockaidTxValidationQuery = (
  input: BlockaidTxValidationInput
) => ({
  queryKey: ['blockaidTxValidation', input],
  queryFn: async (): Promise<BlockaidTxScanResult> => {
    const validation = await getTxBlockaidValidation(input)
    const result = parseBlockaidValidation(validation)

    if (!result) {
      return null
    }

    return { ...result, description: getValidationDescription(validation) }
  },
  ...noRefetchQueryOptions,
})
