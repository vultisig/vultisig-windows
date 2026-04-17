import { Chain } from '@vultisig/core-chain/Chain'
import { KeysignMessagePayload } from '@vultisig/core-mpc/keysign/keysignPayload/KeysignMessagePayload'

import { getCoinLogoSrc } from '../../../../chain/coin/icon/utils/getCoinLogoSrc'
import { getChainLogoSrc } from '../../../../chain/metadata/getChainLogoSrc'
import { customMessageDefaultChain } from '../../customMessage/chains'

/**
 * Extracts the coin logo source URL from a keysign message payload.
 * For standard keysign payloads, uses the signing coin's logo.
 * For custom message payloads, uses the specified chain logo or the default.
 */
export const getKeysignPayloadCoinLogoSrc = (
  payload: KeysignMessagePayload
): string => {
  if ('keysign' in payload) {
    return getCoinLogoSrc(payload.keysign.coin?.logo ?? '')
  }

  const chain = (payload.custom.chain as Chain) ?? customMessageDefaultChain
  return getChainLogoSrc(chain)
}
