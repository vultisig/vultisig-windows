import { getSolanaClient } from '@core/chain/chains/solana/client'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'

import { SolanaSpecific } from '../../types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignMessagePayload } from '../keysignPayload/KeysignMessagePayload'

export const refreshSolanaKeysignPayload = async (
  payload: KeysignPayload
): Promise<KeysignMessagePayload> => {
  const client = getSolanaClient()
  const freshBlockhash = (
    await client.getLatestBlockhash().send()
  ).value.blockhash.toString()

  const updated: KeysignPayload = {
    ...payload,
    blockchainSpecific: {
      ...payload.blockchainSpecific,
      case: 'solanaSpecific',
      value: {
        ...payload.blockchainSpecific.value,
        recentBlockHash: freshBlockhash,
      } as SolanaSpecific,
    },
  }

  return { keysign: updated }
}
