import { create } from '@bufbuild/protobuf'
import { Chain, EvmChain } from '@core/chain/Chain'
import { evmChainInfo } from '@core/chain/chains/evm/chainInfo'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
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

import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../resolver'

const baseFeeMultiplier = (value: bigint) => (value * 15n) / 10n

const formatData = (data: string): `0x${string}` => {
  if (isHex(data)) return data
  return stringToHex(data)
}

export const getEvmChainSpecific: GetChainSpecificResolver<
  'ethereumSpecific'
> = async ({ keysignPayload, feeSettings }) => {
  const coin = getKeysignCoin<EvmChain>(keysignPayload)
  const { chain, address } = coin
  const client = getEvmClient(chain)
  const amount = BigInt(shouldBePresent(keysignPayload.toAmount))
  const receiver = shouldBePresent(keysignPayload.toAddress)
  const data = keysignPayload.memo ? formatData(keysignPayload.memo) : undefined

  const nonce = BigInt(
    await client.getTransactionCount({
      address: address as `0x${string}`,
    })
  )

  const evmCoin = coin as AccountCoin<EvmChain>
  const capGasLimit = (estimatedGasLimit: bigint | undefined): bigint =>
    bigIntMax(
      ...without(
        [
          estimatedGasLimit,
          undefined,
          deriveEvmGasLimit({ coin: evmCoin, data }),
        ],
        undefined
      )
    )

  let gasLimit: bigint
  let baseFeePerGas: bigint
  let maxPriorityFeePerGas: bigint

  if (feeSettings) {
    gasLimit = feeSettings.gasLimit
    maxPriorityFeePerGas = feeSettings.maxPriorityFeePerGas
    baseFeePerGas = baseFeeMultiplier(await getEvmBaseFee(chain))
  } else if (chain === Chain.Zksync) {
    const result = await attempt(
      client.extend(publicActionsL2()).estimateFee({
        chain: evmChainInfo[chain],
        account: coin.address as `0x${string}`,
        to: receiver as `0x${string}`,
        value: amount,
        data: data,
      })
    )
    if ('data' in result && result.data) {
      const {
        gasLimit: limit,
        maxFeePerGas,
        maxPriorityFeePerGas: priorityFee,
      } = result.data
      gasLimit = capGasLimit(limit)
      baseFeePerGas = maxFeePerGas - priorityFee
      maxPriorityFeePerGas = priorityFee
    } else {
      gasLimit = capGasLimit(undefined)
      baseFeePerGas = baseFeeMultiplier(await getEvmBaseFee(chain))
      maxPriorityFeePerGas = await getEvmMaxPriorityFeePerGas(chain)
    }
  } else {
    gasLimit = capGasLimit(
      await withFallback(
        attempt(
          client.estimateGas({
            account: address as `0x${string}`,
          })
        ),
        undefined
      )
    )

    baseFeePerGas = baseFeeMultiplier(await getEvmBaseFee(chain))
    maxPriorityFeePerGas = await getEvmMaxPriorityFeePerGas(chain)
  }

  const maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas

  return create(EthereumSpecificSchema, {
    nonce,
    maxFeePerGasWei: maxFeePerGas.toString(),
    priorityFee: maxPriorityFeePerGas.toString(),
    gasLimit: gasLimit.toString(),
  })
}
