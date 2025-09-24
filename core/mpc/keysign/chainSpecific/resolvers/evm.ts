import { create } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import { evmChainInfo } from '@core/chain/chains/evm/chainInfo'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { getEvmBaseFee } from '@core/chain/tx/fee/evm/baseFee'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { getEvmGasLimit } from '@core/chain/tx/fee/evm/getEvmGasLimit'
import { getEvmMaxPriorityFeePerGas } from '@core/chain/tx/fee/evm/maxPriorityFeePerGas'
import {
  EthereumSpecific,
  EthereumSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { bigIntMax } from '@lib/utils/bigint/bigIntMax'
import { publicActionsL2 } from 'viem/zksync'

import { ChainSpecificResolver } from '../resolver'

const baseFeeMultiplier = (value: bigint) => (value * 15n) / 10n
const minMaxFeePerGasWei = 1n

export const getEthereumSpecific: ChainSpecificResolver<
  EthereumSpecific,
  EvmFeeSettings
> = async ({ coin, feeSettings, amount, receiver, data }) => {
  const { chain } = coin

  const client = getEvmClient(chain)

  const nonce = BigInt(
    await client.getTransactionCount({
      address: coin.address as `0x${string}`,
    })
  )

  if (chain === Chain.Zksync) {
    const { maxFeePerGas, maxPriorityFeePerGas, gasLimit } = await client
      .extend(publicActionsL2())
      .estimateFee({
        chain: evmChainInfo[chain],
        account: coin.address as `0x${string}`,
        to: shouldBePresent(receiver) as `0x${string}`,
        value: amount,
        data: data as `0x${string}` | undefined,
      })

    return create(EthereumSpecificSchema, {
      maxFeePerGasWei: maxFeePerGas.toString(),
      priorityFee: maxPriorityFeePerGas.toString(),
      gasLimit: gasLimit.toString(),
      nonce,
    })
  }

  const gasLimit = feeSettings?.gasLimit ?? getEvmGasLimit(coin)

  const baseFee = await getEvmBaseFee(chain)
  const defaultPriorityFee = await getEvmMaxPriorityFeePerGas(chain)
  const priorityFee = feeSettings?.priorityFee ?? defaultPriorityFee

  const maxFeePerGasWei = bigIntMax(
    baseFeeMultiplier(baseFee) + priorityFee,
    minMaxFeePerGasWei
  )

  return create(EthereumSpecificSchema, {
    maxFeePerGasWei: maxFeePerGasWei.toString(),
    priorityFee: priorityFee.toString(),
    nonce,
    gasLimit: gasLimit.toString(),
  })
}
