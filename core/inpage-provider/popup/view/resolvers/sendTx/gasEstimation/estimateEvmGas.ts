import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { getKeysignSwapPayload } from '@core/mpc/keysign/swap/getKeysignSwapPayload'
import { getKeysignAmount } from '@core/mpc/keysign/utils/getKeysignAmount'
import { getKeysignCoin } from '@core/mpc/keysign/utils/getKeysignCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { attempt, withFallback } from '@lib/utils/attempt'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { isHex, stringToHex } from 'viem'
import { encodeFunctionData } from 'viem'
import { erc20Abi } from 'viem'

type EstimateEvmGasInput = {
  keysignPayload: KeysignPayload
}

const formatData = (data: string): `0x${string}` => {
  if (isHex(data)) return data
  return stringToHex(data)
}

export const estimateEvmGas = async ({
  keysignPayload,
}: EstimateEvmGasInput): Promise<bigint | null> => {
  const coin = getKeysignCoin<EvmChain>(keysignPayload)
  const { chain, address } = coin
  const client = getEvmClient(chain)

  const swapPayload = getKeysignSwapPayload(keysignPayload)

  if (swapPayload) {
    return matchRecordUnion(swapPayload, {
      native: async () => null,
      general: async ({ quote }) => {
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

        return await withFallback(
          attempt(
            client.estimateGas({
              account: address as `0x${string}`,
              to: to as `0x${string}`,
              value: txValue,
              data: data as `0x${string}`,
            })
          ),
          null
        )
      },
    })
  }

  const amount = getKeysignAmount(keysignPayload)
  const receiver = keysignPayload.toAddress
  const data = keysignPayload.memo ? formatData(keysignPayload.memo) : undefined

  if (!receiver) {
    return null
  }

  if (coin.id) {
    const transferData = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [receiver as `0x${string}`, amount],
    })

    return withFallback(
      attempt(
        client.estimateGas({
          account: address as `0x${string}`,
          to: coin.id as `0x${string}`,
          value: 0n,
          data: transferData,
        })
      ),
      null
    )
  }

  const estimatedGas = await withFallback(
    attempt(
      client.estimateGas({
        account: address as `0x${string}`,
        to: receiver as `0x${string}`,
        value: amount,
        data,
      })
    ),
    null
  )

  return estimatedGas
}
