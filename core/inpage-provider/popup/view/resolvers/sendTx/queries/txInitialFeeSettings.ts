import { isChainOfKind } from '@core/chain/ChainKind'
import { getEvmGasLimit } from '@core/chain/tx/fee/evm/getEvmGasLimit'
import { getEvmMaxPriorityFeePerGas } from '@core/chain/tx/fee/evm/maxPriorityFeePerGas'
import { FeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'
import { noPersistQueryOptions } from '@lib/ui/query/utils/options'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useQuery } from '@tanstack/react-query'

import { usePopupInput } from '../../../state/input'

export const useTxInitialFeeSettings = () => {
  const transactionPayload = usePopupInput<'sendTx'>()

  return useQuery({
    queryKey: ['tx-initial-fee-settings', transactionPayload],
    queryFn: async (): Promise<FeeSettings | null> => {
      const { chain } = getRecordUnionValue(transactionPayload)
      if (isChainOfKind(chain, 'utxo')) {
        return { priority: 'fast' }
      }

      return matchRecordUnion(transactionPayload, {
        keysign: async transaction => {
          if (!isChainOfKind(chain, 'evm')) {
            return null
          }

          const { gasSettings } = transaction.transactionDetails

          const gasLimit =
            BigInt(gasSettings?.gasLimit ?? '') || getEvmGasLimit({ chain })

          const priorityFee =
            BigInt(gasSettings?.maxPriorityFeePerGas ?? '') ||
            (await getEvmMaxPriorityFeePerGas(chain))

          return { gasLimit, priorityFee }
        },
        serialized: () => null,
      })
    },
    ...noPersistQueryOptions,
  })
}
