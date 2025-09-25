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
import { NotImplementedError } from '@lib/utils/error/NotImplementedError'
import { asyncFallbackChain } from '@lib/utils/promise/asyncFallbackChain'
import { isHex, stringToHex } from 'viem'
import { publicActionsL2 } from 'viem/zksync'

import { ChainSpecificResolver } from '../resolver'

const baseFeeMultiplier = (value: bigint) => (value * 15n) / 10n
const minMaxFeePerGas = 1n

const formatData = (data: string): `0x${string}` => {
  if (isHex(data)) {
    return data
  }

  return stringToHex(data)
}

export const getEthereumSpecific: ChainSpecificResolver<
  EthereumSpecific,
  EvmFeeSettings
> = async ({ coin, feeSettings = {}, amount, receiver, data: stringData }) => {
  const { chain } = coin

  const client = getEvmClient(chain)

  const nonce = BigInt(
    await client.getTransactionCount({
      address: coin.address as `0x${string}`,
    })
  )

  const data = stringData ? formatData(stringData) : undefined

  const estimatedFee = await asyncFallbackChain(
    () => {
      if (chain === Chain.Zksync) {
        return client.extend(publicActionsL2()).estimateFee({
          chain: evmChainInfo[chain],
          account: coin.address as `0x${string}`,
          to: shouldBePresent(receiver) as `0x${string}`,
          value: amount,
          data: data as `0x${string}` | undefined,
        })
      }

      throw new NotImplementedError(`${chain} fee estimation`)
    },
    async () => {
      const baseFee = await getEvmBaseFee(chain)
      const maxPriorityFeePerGas = await getEvmMaxPriorityFeePerGas(chain)

      const maxFeePerGas = bigIntMax(
        baseFeeMultiplier(baseFee) + maxPriorityFeePerGas,
        minMaxFeePerGas
      )

      return {
        maxFeePerGas,
        maxPriorityFeePerGas,
        gasLimit: getEvmGasLimit(coin),
      }
    }
  )

  const { maxFeePerGas, maxPriorityFeePerGas, gasLimit } = {
    ...estimatedFee,
    ...feeSettings,
  }

  return create(EthereumSpecificSchema, {
    maxFeePerGasWei: maxFeePerGas.toString(),
    priorityFee: maxPriorityFeePerGas.toString(),
    nonce,
    gasLimit: gasLimit.toString(),
  })
}
