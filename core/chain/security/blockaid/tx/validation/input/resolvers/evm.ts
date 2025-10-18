import { productRootDomain } from '@core/config'
import { getKeysignSwapPayload } from '@core/mpc/keysign/swap/getKeysignSwapPayload'
import { KeysignSwapPayload } from '@core/mpc/keysign/swap/KeysignSwapPayload'
import { getKeysignCoin } from '@core/mpc/keysign/utils/getKeysignCoin'
import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { encodeFunctionData, erc20Abi } from 'viem'

import { EvmChain } from '../../../../../../Chain'
import { BlockaidTxValidationInput } from '../../resolver'
import { BlockaidTxValidationInputResolver } from '../resolver'

export const getEvmBlockaidTxValidationInput: BlockaidTxValidationInputResolver<
  EvmChain
> = ({ payload, chain }) => {
  const coin = getKeysignCoin(payload)

  const toEvmBlockaidTxScanInput = ({
    to,
    value,
    data,
  }: {
    to: string
    value: string
    data: string
  }) => ({
    data: {
      method: 'eth_sendTransaction',
      params: [{ from: coin.address, to, value, data }],
    },
    chain: chain.toLowerCase(),
    metadata: {
      domain: productRootDomain,
    },
  })

  const swapPayload = getKeysignSwapPayload(payload)

  if (swapPayload) {
    return matchRecordUnion<
      KeysignSwapPayload,
      Pick<BlockaidTxValidationInput, 'data'> | null
    >(swapPayload, {
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
    })
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
