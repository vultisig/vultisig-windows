import { create } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import { evmChainInfo } from '@core/chain/chains/evm/chainInfo'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { getEvmBaseFee } from '@core/chain/tx/fee/evm/baseFee'
import { EvmFeeQuote } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { deriveEvmGasLimit } from '@core/chain/tx/fee/evm/evmGasLimit'
import { getEvmMaxPriorityFeePerGas } from '@core/chain/tx/fee/evm/maxPriorityFeePerGas'
import {
  EthereumSpecific,
  EthereumSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt, withFallback } from '@lib/utils/attempt'
import { bigIntMax } from '@lib/utils/bigint/bigIntMax'
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
  EthereumSpecific
> = async ({ coin, feeQuote = {}, amount, receiver, data }) => {
  const { chain } = coin

  const client = getEvmClient(chain)

  const estimateFee = async (): Promise<EvmFeeQuote> => {
    if (chain === Chain.Zksync && !feeQuote.gasLimit) {
      const result = await attempt(
        client.extend(publicActionsL2()).estimateFee({
          chain: evmChainInfo[chain],
          account: coin.address as `0x${string}`,
          to: shouldBePresent(receiver) as `0x${string}`,
          value: amount,
          data: data ? formatData(data) : undefined,
        })
      )

      if (result.data) {
        return result.data
      }
    }

    const gasLimit =
      feeQuote.gasLimit ??
      (await withFallback(
        attempt(
          client.estimateGas({
            account: coin.address as `0x${string}`,
            to: shouldBePresent(receiver) as `0x${string}`,
            value: amount,
            data: data ? formatData(data) : undefined,
          })
        ),
        deriveEvmGasLimit({ coin, data })
      ))

    const maxPriorityFeePerGas =
      feeQuote.maxPriorityFeePerGas ?? (await getEvmMaxPriorityFeePerGas(chain))

    const maxFeePerGas =
      feeQuote.maxFeePerGas ??
      bigIntMax(
        baseFeeMultiplier(await getEvmBaseFee(chain)) + maxPriorityFeePerGas,
        minMaxFeePerGas
      )

    return {
      maxPriorityFeePerGas,
      maxFeePerGas,
      gasLimit,
    }
  }

  const nonce = BigInt(
    await client.getTransactionCount({
      address: coin.address as `0x${string}`,
    })
  )

  const { maxPriorityFeePerGas, maxFeePerGas, gasLimit } = await estimateFee()

  return create(EthereumSpecificSchema, {
    maxFeePerGasWei: maxFeePerGas.toString(),
    priorityFee: maxPriorityFeePerGas.toString(),
    nonce,
    gasLimit: gasLimit.toString(),
  })
}
