import { create } from '@bufbuild/protobuf'
import { EvmChain, UtxoChain } from '@core/chain/Chain'
import { getErc20Allowance } from '@core/chain/chains/evm/erc20/getErc20Allowance'
import { Erc20ApprovePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/erc20_approve_payload_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { assertField } from '@lib/utils/record/assertField'

import { assertChainField } from '../utils/assertChainField'
import { getUtxos } from '../utxo/tx/getUtxos'

export const processKeysignPayload = async (
  payload: KeysignPayload
): Promise<KeysignPayload> => {
  const result = create(KeysignPayloadSchema, payload)

  const coin = assertChainField(assertField(payload, 'coin'))
  const { chain } = coin

  if ('swapPayload' in payload && payload.swapPayload.value) {
    const evmChain = isOneOf(chain, Object.values(EvmChain))
    if (evmChain && !coin.isNativeToken) {
      const allowance = await getErc20Allowance({
        chain: evmChain,
        spenderAddress: payload.toAddress as `0x${string}`,
        ownerAddress: coin.address as `0x${string}`,
        address: coin.contractAddress as `0x${string}`,
      })

      if (allowance < BigInt(payload.toAmount)) {
        result.erc20ApprovePayload = create(Erc20ApprovePayloadSchema, {
          amount: payload.toAmount,
          spender: payload.toAddress,
        })
      }
    }
  }

  if (isOneOf(chain, Object.values(UtxoChain))) {
    result.utxoInfo = await getUtxos(assertChainField(coin))
  }

  return result
}
