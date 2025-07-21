import { EvmChain } from '@core/chain/Chain'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { BlockaidTxScanInput } from '@core/chain/security/blockaid/tx/scan'
import { getKeysignSwapPayload } from '@core/mpc/keysign/swap/getKeysignSwapPayload'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { getKeysignCoin } from '@core/mpc/keysign/utils/getKeysignCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { encodeFunctionData, erc20Abi } from 'viem'

export const keysignPayloadToBlockaidTxScanInput = (
  payload: KeysignPayload
): BlockaidTxScanInput | null => {
  const coin = getKeysignCoin(payload)
  const chain = getKeysignChain(payload)

  if (!isOneOf(chain, Object.values(EvmChain))) {
    return null
  }

  const swapPayload = getKeysignSwapPayload(payload)

  if (swapPayload) {
    return null
  }

  const amount = BigInt(payload.toAmount)
  const receiver = payload.toAddress as `0x${string}`

  return {
    chain,
    data: {
      method: 'eth_sendTransaction',
      params: [
        {
          from: coin.address,
          to: isFeeCoin(coin) ? receiver : coin.id,
          value: `0x${isFeeCoin(coin) ? bigIntToHex(amount) : 0}`,
          data: isFeeCoin(coin)
            ? payload.memo || '0x'
            : encodeFunctionData({
                abi: erc20Abi,
                functionName: 'transfer',
                args: [receiver, amount],
              }),
        },
      ],
    },
  }
}
