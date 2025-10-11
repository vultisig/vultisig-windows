import { isChainOfKind } from '@core/chain/ChainKind'
import { FeeSettings } from '@core/chain/fee-quote/settings/core'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'

import { ITransactionPayload } from '../interfaces'

export const getFeeSettings = (
  transactionPayload: ITransactionPayload
): FeeSettings | null => {
  const { chain } = getRecordUnionValue(transactionPayload)
  if (isChainOfKind(chain, 'utxo')) {
    return { priority: 'fast' }
  }

  return matchRecordUnion(transactionPayload, {
    keysign: transaction => {
      if (!isChainOfKind(chain, 'evm') && !isChainOfKind(chain, 'tron')) {
        return null
      }

      const { gasSettings } = transaction.transactionDetails

      if (!gasSettings) {
        return null
      }

      const { gasLimit, maxPriorityFeePerGas } = gasSettings

      if (gasLimit && isChainOfKind(chain, 'tron')) {
        return {
          gasLimit: BigInt(gasLimit),
        }
      }

      if (!gasLimit || !maxPriorityFeePerGas) {
        return null
      }

      return {
        gasLimit: BigInt(gasLimit),
        maxPriorityFeePerGas: BigInt(maxPriorityFeePerGas),
      }
    },
    serialized: () => null,
  })
}
