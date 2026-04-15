import { EvmChain } from '@vultisig/core-chain/Chain'
import { deriveEvmGasLimit } from '@vultisig/core-chain/tx/fee/evm/evmGasLimit'
import { getEvmFeeQuote } from '@vultisig/core-mpc/keysign/fee/resolvers/evm/getEvmFeeQuote'
import { getKeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapPayload'
import { getKeysignCoin } from '@vultisig/core-mpc/keysign/utils/getKeysignCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

type EstimateEvmGasInput = {
  keysignPayload: KeysignPayload
}

/** Estimates the gas limit for an EVM transaction, returning null for native swaps. */
export const estimateEvmGas = async ({
  keysignPayload,
}: EstimateEvmGasInput): Promise<bigint | null> => {
  const coin = getKeysignCoin<EvmChain>(keysignPayload)
  const swapPayload = getKeysignSwapPayload(keysignPayload)

  const getData = () => {
    if (swapPayload && 'general' in swapPayload) {
      const value = swapPayload.general.quote?.tx?.data
      if (value) {
        return value
      }
    }
    return keysignPayload.memo
  }

  const minimumGasLimit = deriveEvmGasLimit({
    coin,
    data: getData(),
  })

  if (swapPayload) {
    return matchRecordUnion(swapPayload, {
      native: async () => null,
      general: async () => {
        const feeQuote = await getEvmFeeQuote({
          keysignPayload,
          minimumGasLimit,
        })
        return feeQuote.gasLimit
      },
    })
  }
  const feeQuote = await getEvmFeeQuote({
    keysignPayload,
    minimumGasLimit,
  })
  return feeQuote.gasLimit
}
