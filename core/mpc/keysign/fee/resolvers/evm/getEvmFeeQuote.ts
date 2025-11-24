import { Chain, EvmChain } from '@core/chain/Chain'
import { evmChainInfo } from '@core/chain/chains/evm/chainInfo'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { getEvmBaseFee } from '@core/chain/tx/fee/evm/baseFee'
import { getEvmMaxPriorityFeePerGas } from '@core/chain/tx/fee/evm/maxPriorityFeePerGas'
import { FeeSettings } from '@core/mpc/keysign/chainSpecific/FeeSettings'
import { getKeysignSwapPayload } from '@core/mpc/keysign/swap/getKeysignSwapPayload'
import { KeysignSwapPayload } from '@core/mpc/keysign/swap/KeysignSwapPayload'
import { getKeysignAmount } from '@core/mpc/keysign/utils/getKeysignAmount'
import { getKeysignCoin } from '@core/mpc/keysign/utils/getKeysignCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { without } from '@lib/utils/array/without'
import { attempt, withFallback } from '@lib/utils/attempt'
import { bigIntMax } from '@lib/utils/bigint/bigIntMax'
import { formatDataToHex } from '@lib/utils/formatDataToHex'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { encodeFunctionData, erc20Abi } from 'viem'
import { publicActionsL2 } from 'viem/zksync'

const baseFeeMultiplier = (value: bigint) => (value * 15n) / 10n

type EvmFeeQuote = {
  gasLimit: bigint
  baseFeePerGas: bigint
  maxPriorityFeePerGas: bigint
}

type GetEvmFeeQuoteInput = {
  keysignPayload: KeysignPayload
  feeSettings?: FeeSettings<'evm'>
  thirdPartyGasLimitEstimation?: bigint
  minimumGasLimit?: bigint
}

export const getEvmFeeQuote = async ({
  keysignPayload,
  feeSettings,
  thirdPartyGasLimitEstimation,
  minimumGasLimit,
}: GetEvmFeeQuoteInput): Promise<EvmFeeQuote> => {
  const coin = getKeysignCoin<EvmChain>(keysignPayload)
  const { chain, address } = coin
  const client = getEvmClient(chain)
  const amount = getKeysignAmount(keysignPayload)
  const receiver = keysignPayload.toAddress
  const data = keysignPayload.memo
    ? formatDataToHex(keysignPayload.memo)
    : undefined

  const capGasLimit = (estimatedGasLimit: bigint | undefined): bigint =>
    bigIntMax(
      ...without(
        [estimatedGasLimit, thirdPartyGasLimitEstimation, minimumGasLimit],
        undefined
      )
    )

  const getBaseFee = async () => baseFeeMultiplier(await getEvmBaseFee(chain))

  const getEstimateGasParams = async () => {
    const swapPayload = getKeysignSwapPayload(keysignPayload)

    if (swapPayload) {
      return matchRecordUnion<
        KeysignSwapPayload,
        {
          to: `0x${string}`
          value: bigint
          data: `0x${string}`
        } | null
      >(swapPayload, {
        native: () => null,
        general: ({ quote }) => {
          if (!quote?.tx) {
            return null
          }

          const { to, data, value } = quote.tx

          if (!to || !data) {
            return null
          }

          const txValue = value?.startsWith('0x')
            ? BigInt(value)
            : value
              ? BigInt(value)
              : 0n

          return {
            to: to as `0x${string}`,
            value: txValue,
            data: data as `0x${string}`,
          }
        },
      })
    }

    if (!receiver) {
      return null
    }

    if (coin.id) {
      const transferData = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [receiver as `0x${string}`, amount],
      })

      return {
        to: coin.id as `0x${string}`,
        value: 0n,
        data: transferData,
      }
    }

    return {
      to: receiver as `0x${string}`,
      value: amount,
      data,
    }
  }

  const getFeeData = async () => {
    if (feeSettings) {
      return {
        gasLimit: feeSettings.gasLimit,
        baseFeePerGas: await getBaseFee(),
        maxPriorityFeePerGas: feeSettings.maxPriorityFeePerGas,
      }
    }

    if (chain === Chain.Zksync) {
      const estimateGasParams = await getEstimateGasParams()
      if (estimateGasParams) {
        const result = await attempt(
          client.extend(publicActionsL2()).estimateFee({
            chain: evmChainInfo[chain as EvmChain],
            account: coin.address as `0x${string}`,
            to: estimateGasParams.to,
            value: estimateGasParams.value,
            data: estimateGasParams.data,
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
    }
    const estimateGasParams = await getEstimateGasParams()

    const estimatedGasLimit = estimateGasParams
      ? await withFallback(
          attempt(
            client.estimateGas({
              account: address as `0x${string}`,
              to: estimateGasParams.to,
              value: estimateGasParams.value,
              data: estimateGasParams.data,
            })
          ),
          undefined
        )
      : undefined

    const gasLimit = capGasLimit(estimatedGasLimit)

    const baseFeePerGas = baseFeeMultiplier(await getEvmBaseFee(chain))

    const maxPriorityFeePerGas = await getEvmMaxPriorityFeePerGas(chain)

    return {
      gasLimit,
      baseFeePerGas,
      maxPriorityFeePerGas,
    }
  }

  return await getFeeData()
}
