import { Chain, EvmChain } from '@core/chain/Chain'
import { evmChainInfo } from '@core/chain/chains/evm/chainInfo'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { getEvmBaseFee } from '@core/chain/tx/fee/evm/baseFee'
import { deriveEvmGasLimit } from '@core/chain/tx/fee/evm/evmGasLimit'
import { getEvmMaxPriorityFeePerGas } from '@core/chain/tx/fee/evm/maxPriorityFeePerGas'
import { without } from '@lib/utils/array/without'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt, withFallback } from '@lib/utils/attempt'
import { bigIntMax } from '@lib/utils/bigint/bigIntMax'
import { isHex, stringToHex } from 'viem'
import { publicActionsL2 } from 'viem/zksync'

import { FeeQuoteResolver } from '../resolver'

const formatData = (data: string): `0x${string}` => {
  if (isHex(data)) return data
  return stringToHex(data)
}

export const getEvmFeeQuote: FeeQuoteResolver<'evm'> = async ({
  coin,
  amount,
  receiver,
  data,
  thirdPartyGasLimitEstimation,
}) => {
  const { chain } = coin
  const client = getEvmClient(chain)

  let zkEstimate:
    | {
        gasLimit?: bigint
        maxFeePerGas?: bigint
        maxPriorityFeePerGas?: bigint
      }
    | undefined

  const estimateGasLimit = async (): Promise<bigint> => {
    if (thirdPartyGasLimitEstimation && chain === Chain.Zksync) {
      const result = await attempt(
        client.extend(publicActionsL2()).estimateFee({
          chain: evmChainInfo[chain as EvmChain],
          account: coin.address as `0x${string}`,
          to: receiver
            ? (shouldBePresent(receiver) as `0x${string}`)
            : undefined,
          value: amount,
          data: data ? formatData(data) : undefined,
        })
      )
      if (result.data) {
        zkEstimate = {
          gasLimit: result.data.gasLimit,
          maxFeePerGas: result.data.maxFeePerGas,
          maxPriorityFeePerGas: result.data.maxPriorityFeePerGas,
        }
      }
    }

    const candidates = without<bigint | undefined>(
      [
        await withFallback(
          attempt(
            client.estimateGas({
              account: coin.address as `0x${string}`,
              to: receiver
                ? (shouldBePresent(receiver) as `0x${string}`)
                : undefined,
              value: amount,
              data: data ? formatData(data) : undefined,
            })
          ),
          undefined
        ),
        deriveEvmGasLimit({ coin: coin as any, data }),
        thirdPartyGasLimitEstimation ? zkEstimate?.gasLimit : undefined,
      ],
      undefined
    )

    return bigIntMax(...(candidates as bigint[]))
  }

  const [fallbackBaseFeePerGas, maxPriorityFeePerGas, gasLimit] =
    await Promise.all([
      getEvmBaseFee(chain as EvmChain),
      getEvmMaxPriorityFeePerGas(chain as EvmChain),
      estimateGasLimit(),
    ])

  const baseFeePerGas =
    zkEstimate?.maxFeePerGas && zkEstimate?.maxPriorityFeePerGas
      ? zkEstimate.maxFeePerGas - zkEstimate.maxPriorityFeePerGas
      : fallbackBaseFeePerGas

  return {
    baseFeePerGas,
    maxPriorityFeePerGas,
    gasLimit,
  }
}
