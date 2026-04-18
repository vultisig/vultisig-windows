import { Chain } from '@vultisig/core-chain/Chain'
import { KeysignMessagePayload } from '@vultisig/core-mpc/keysign/keysignPayload/KeysignMessagePayload'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'

import { getCoinLogoSrc } from '../../../../chain/coin/icon/utils/getCoinLogoSrc'
import { getChainLogoSrc } from '../../../../chain/metadata/getChainLogoSrc'
import { customMessageDefaultChain } from '../../customMessage/chains'

/**
 * Resolves the logo source URL shown inside the keysign Rive animation.
 *
 * Standard keysign payloads prefer the signing coin's own logo; if the coin
 * or its logo is missing, the chain logo is used as a safe fallback.
 * Custom message payloads always use the specified chain logo (or the
 * default custom-message chain).
 */
export const getKeysignPayloadLogoSrc = (
  payload: KeysignMessagePayload
): string => {
  if ('keysign' in payload) {
    const coinLogo = payload.keysign.coin?.logo
    if (coinLogo) {
      return getCoinLogoSrc(coinLogo)
    }
    return getChainLogoSrc(getKeysignChain(payload.keysign))
  }

  const chain = (payload.custom.chain as Chain) ?? customMessageDefaultChain
  return getChainLogoSrc(chain)
}
