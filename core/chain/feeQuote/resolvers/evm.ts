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

const baseFeeMultiplier = (value: bigint) => (value * 15n) / 10n

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

  const capGasLimit = (estimatedGasLimit: bigint | undefined): bigint =>
    bigIntMax(
      ...without(
        [
          estimatedGasLimit,
          thirdPartyGasLimitEstimation,
          deriveEvmGasLimit({ coin, data }),
        ],
        undefined
      )
    )

  if (chain === Chain.Zksync) {
    const result = await attempt(
      client.extend(publicActionsL2()).estimateFee({
        chain: evmChainInfo[chain as EvmChain],
        account: coin.address as `0x${string}`,
        to: receiver ? (shouldBePresent(receiver) as `0x${string}`) : undefined,
        value: amount,
        data: data ? formatData(data) : undefined,
      })
    )
    if (result.data) {
      const { gasLimit, maxFeePerGas, maxPriorityFeePerGas } = result.data
      return {
        gasLimit: capGasLimit(gasLimit),
        baseFeePerGas: maxFeePerGas - maxPriorityFeePerGas,
        maxPriorityFeePerGas,
      }
    }
  }

  const gasLimit = capGasLimit(
    await withFallback(
      attempt(
        client.estimateGas({
          account: coin.address as `0x${string}`,
        })
      ),
      undefined
    )
  )

  const baseFeePerGas = baseFeeMultiplier(await getEvmBaseFee(chain))

  const maxPriorityFeePerGas = await getEvmMaxPriorityFeePerGas(chain)

  return {
    baseFeePerGas,
    maxPriorityFeePerGas,
    gasLimit,
  }
}
