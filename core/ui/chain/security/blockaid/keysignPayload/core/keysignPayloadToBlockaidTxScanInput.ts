import { EvmChain } from '@core/chain/Chain'
import { BlockaidTxScanInput } from '@core/chain/security/blockaid/tx/scan'
import { getKeysignSwapPayload } from '@core/mpc/keysign/swap/getKeysignSwapPayload'
import { KeysignSwapPayload } from '@core/mpc/keysign/swap/KeysignSwapPayload'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { getKeysignCoin } from '@core/mpc/keysign/utils/getKeysignCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { encodeFunctionData, erc20Abi } from 'viem'

export const keysignPayloadToBlockaidTxScanInput = (
  payload: KeysignPayload
): BlockaidTxScanInput | null => {
  const coin = getKeysignCoin(payload)
  const chain = getKeysignChain(payload)

  if (!isOneOf(chain, Object.values(EvmChain))) {
    return null
  }

  const toEvmBlockaidTxScanInput = ({
    to,
    value,
    data,
  }: {
    to: string
    value: string
    data: string
  }): BlockaidTxScanInput => ({
    chain,
    data: {
      method: 'eth_sendTransaction',
      params: [{ from: coin.address, to, value, data }],
    },
  })

  const swapPayload = getKeysignSwapPayload(payload)

  if (swapPayload) {
    return matchRecordUnion<KeysignSwapPayload, BlockaidTxScanInput | null>(
      swapPayload,
      {
        native: () => null,
        general: generalSwapPayload => {
          const { quote } = generalSwapPayload
          if (!quote?.tx) {
            return null
          }

          return toEvmBlockaidTxScanInput({
            to: quote.tx.to,
            value: quote.tx.value.startsWith('0x')
              ? quote.tx.value
              : `0x${bigIntToHex(BigInt(quote.tx.value))}`,
            data: quote.tx.data,
          })
        },
      }
    )
  }

  const amount = BigInt(payload.toAmount)
  const receiver = payload.toAddress as `0x${string}`

  if (!coin.id) {
    return toEvmBlockaidTxScanInput({
      to: receiver,
      value: `0x${bigIntToHex(amount)}`,
      data: payload.memo || '0x',
    })
  }

  return toEvmBlockaidTxScanInput({
    to: coin.id,
    value: `0x${bigIntToHex(amount)}`,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [receiver, amount],
    }),
  })
}
