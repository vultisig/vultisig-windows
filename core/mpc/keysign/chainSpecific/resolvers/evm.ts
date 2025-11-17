import { create } from '@bufbuild/protobuf'
import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { getEvmFeeQuote } from '@core/mpc/keysign/fee/resolvers/evm/getEvmFeeQuote'
import { EthereumSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../resolver'
import { deriveEvmGasLimit } from '@core/chain/tx/fee/evm/evmGasLimit'
import { formatDataToHex } from '@lib/utils/formatDataToHex'

export const getEvmChainSpecific: GetChainSpecificResolver<
  'ethereumSpecific'
> = async ({ keysignPayload, feeSettings, thirdPartyGasLimitEstimation }) => {
  const coin = getKeysignCoin<EvmChain>(keysignPayload)
  const { chain, address } = coin
  const client = getEvmClient(chain)

  const nonce = BigInt(
    await client.getTransactionCount({
      address: address as `0x${string}`,
    })
  )

  const { gasLimit, baseFeePerGas, maxPriorityFeePerGas } =
    await getEvmFeeQuote({
      keysignPayload,
      feeSettings,
      thirdPartyGasLimitEstimation,
      minimumGasLimit: deriveEvmGasLimit({
        coin,
        data: keysignPayload.memo
          ? formatDataToHex(keysignPayload.memo)
          : undefined,
      }),
    })

  const maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas

  return create(EthereumSpecificSchema, {
    nonce,
    maxFeePerGasWei: maxFeePerGas.toString(),
    priorityFee: maxPriorityFeePerGas.toString(),
    gasLimit: gasLimit.toString(),
  })
}
