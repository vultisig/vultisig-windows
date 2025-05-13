import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'

import { KeysignChainSpecificKey } from '../chainSpecific/KeysignChainSpecific'
import {
  isKeysignPayload,
  KeysignMessagePayload,
} from '../keysignPayload/KeysignMessagePayload'
import { refreshSolanaKeysignPayload } from './solana'

type KeysignPayloadRefresher = (
  payload: KeysignPayload
) => Promise<KeysignMessagePayload>

const refreshHandlers: Partial<
  Record<KeysignChainSpecificKey, KeysignPayloadRefresher>
> = {
  solanaSpecific: refreshSolanaKeysignPayload,
}

export const refreshKeysignPayload = async (
  payload: KeysignMessagePayload
): Promise<KeysignMessagePayload> => {
  if (!isKeysignPayload(payload)) return payload

  const caseKey = payload.keysign.blockchainSpecific
    ?.case as KeysignChainSpecificKey
  const handler = refreshHandlers[caseKey]
  if (!handler) return payload

  return handler(payload.keysign)
}
