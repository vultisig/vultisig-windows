import { create } from '@bufbuild/protobuf'
import { Chain, EvmChain } from '@core/chain/Chain'
import { evmChainInfo } from '@core/chain/chains/evm/chainInfo'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { getEvmBaseFee } from '@core/chain/tx/fee/evm/baseFee'
import { deriveEvmGasLimit } from '@core/chain/tx/fee/evm/evmGasLimit'
import { getEvmMaxPriorityFeePerGas } from '@core/chain/tx/fee/evm/maxPriorityFeePerGas'
import { EthereumSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { without } from '@lib/utils/array/without'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt, withFallback } from '@lib/utils/attempt'
import { bigIntMax } from '@lib/utils/bigint/bigIntMax'
import { isHex, stringToHex } from 'viem'
import { publicActionsL2 } from 'viem/zksync'

import { getKeysignAmount } from '../../utils/getKeysignAmount'
import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../resolver'

const baseFeeMultiplier = (value: bigint) => (value * 15n) / 10n

const formatData = (data: string): `0x${string}` => {
  if (isHex(data)) return data
  return stringToHex(data)
}

export const getEvmChainSpecific: GetChainSpecificResolver<
  'ethereumSpecific'
> = async ({ keysignPayload, feeSettings, thirdPartyGasLimitEstimation }) => {
  const coin = getKeysignCoin<EvmChain>(keysignPayload)
  const { chain, address } = coin
  const client = getEvmClient(chain)
  const amount = getKeysignAmount(keysignPayload)
  const receiver = keysignPayload.toAddress
  const data = keysignPayload.memo ? formatData(keysignPayload.memo) : undefined

  const nonce = BigInt(
    await client.getTransactionCount({
      address: address as `0x${string}`,
    })
  )

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

  const getBaseFee = async () => baseFeeMultiplier(await getEvmBaseFee(chain))

  const getFeeData = async () => {
    if (feeSettings) {
      return {
        ...feeSettings,
        baseFeePerGas: await getBaseFee(),
      }
    }
    if (chain === Chain.Zksync) {
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
      gasLimit,
      baseFeePerGas,
      maxPriorityFeePerGas,
    }
  }

  const { gasLimit, baseFeePerGas, maxPriorityFeePerGas } = await getFeeData()

  const maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas

  return create(EthereumSpecificSchema, {
    nonce,
    maxFeePerGasWei: maxFeePerGas.toString(),
    priorityFee: maxPriorityFeePerGas.toString(),
    gasLimit: gasLimit.toString(),
  })
}
