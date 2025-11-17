import { getEvmFeeQuote } from '@core/mpc/keysign/fee/resolvers/evm/getEvmFeeQuote'
import { getKeysignSwapPayload } from '@core/mpc/keysign/swap/getKeysignSwapPayload'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

type EstimateEvmGasInput = {
  keysignPayload: KeysignPayload
}

export const estimateEvmGas = async ({
  keysignPayload,
}: EstimateEvmGasInput): Promise<bigint | null> => {
  const swapPayload = getKeysignSwapPayload(keysignPayload)

  if (swapPayload) {
    return matchRecordUnion(swapPayload, {
      native: async () => null,
      general: async () => {
        const feeQuote = await getEvmFeeQuote({
          keysignPayload,
        })
        return feeQuote.gasLimit
      },
    })
  }
  const feeQuote = await getEvmFeeQuote({
    keysignPayload,
  })
  return feeQuote.gasLimit
}
