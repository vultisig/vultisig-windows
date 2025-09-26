import { create } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import { evmChainInfo } from '@core/chain/chains/evm/chainInfo'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { getEvmBaseFee } from '@core/chain/tx/fee/evm/baseFee'
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

  const nonce = BigInt(
    await client.getTransactionCount({
      address: coin.address as `0x${string}`,
    })
  )

  const getGasLimit = async () => {
    const { gasLimit } = feeQuote
    if (gasLimit) {
      return gasLimit
    }

    return withFallback(
      attempt(async () => {
        if (chain === Chain.Zksync) {
          const { gasLimit } = await client
            .extend(publicActionsL2())
            .estimateFee({
              chain: evmChainInfo[chain],
              account: coin.address as `0x${string}`,
              to: shouldBePresent(receiver) as `0x${string}`,
              value: amount,
              data: data ? formatData(data) : undefined,
            })

          return gasLimit
        }

        return await client.estimateGas({
          account: coin.address as `0x${string}`,
          to: shouldBePresent(receiver) as `0x${string}`,
          value: amount,
          data: data ? formatData(data) : undefined,
        })
      }),
      deriveEvmGasLimit({ coin, data })
    )
  }

  // Resolve fee caps
  let maxPriorityFeePerGas: bigint
  let maxFeePerGas: bigint

  if (
    feeQuote.maxFeePerGas !== undefined &&
    feeQuote.maxPriorityFeePerGas !== undefined
  ) {
    maxPriorityFeePerGas = feeQuote.maxPriorityFeePerGas
    maxFeePerGas = feeQuote.maxFeePerGas
  } else {
    const priority =
      feeQuote.maxPriorityFeePerGas ?? (await getEvmMaxPriorityFeePerGas(chain))

    maxPriorityFeePerGas = priority

    if (feeQuote.maxFeePerGas !== undefined) {
      maxFeePerGas = feeQuote.maxFeePerGas
    } else {
      const baseFee = await getEvmBaseFee(chain)
      maxFeePerGas = bigIntMax(
        baseFeeMultiplier(baseFee) + priority,
        minMaxFeePerGas
      )
    }
  }

  const gasLimit = await getGasLimit()

  return create(EthereumSpecificSchema, {
    maxFeePerGasWei: maxFeePerGas.toString(),
    priorityFee: maxPriorityFeePerGas.toString(),
    nonce,
    gasLimit: gasLimit.toString(),
  })
}
