import { Chain } from '@vultisig/core-chain/Chain'
import { KeysignMessagePayload } from '@vultisig/core-mpc/keysign/keysignPayload/KeysignMessagePayload'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'

import { getChainLogoSrc } from '../../../../chain/metadata/getChainLogoSrc'
import { customMessageDefaultChain } from '../../customMessage/chains'

/**
 * Extracts the chain logo source URL from a keysign message payload.
 * For standard keysign payloads, uses the transaction coin's chain.
 * For custom message payloads, uses the specified chain or the default.
 */
export const getKeysignPayloadChainLogoSrc = (
  payload: KeysignMessagePayload
): string => {
  if ('keysign' in payload) {
    return getChainLogoSrc(getKeysignChain(payload.keysign))
  }

  const chain = (payload.custom.chain as Chain) ?? customMessageDefaultChain
  return getChainLogoSrc(chain)
}
