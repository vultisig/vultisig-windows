import { Chain } from '@vultisig/core-chain/Chain'
import { KeysignMessagePayload } from '@vultisig/core-mpc/keysign/keysignPayload/KeysignMessagePayload'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'

import { getCoinLogoSrc } from '../../../../chain/coin/icon/utils/getCoinLogoSrc'
import { getChainLogoSrc } from '../../../../chain/metadata/getChainLogoSrc'
import { customMessageDefaultChain } from '../../customMessage/chains'

/**
 * Returns the logo source URL for a keysign message payload.
 * For standard keysign payloads, uses the signing coin's logo when available,
 * falling back to the chain logo. For custom message payloads, uses the chain logo.
 */
export const getKeysignPayloadLogoSrc = (
  payload: KeysignMessagePayload
): string => {
  if ('keysign' in payload) {
    const { coin } = payload.keysign
    return coin?.logo
      ? getCoinLogoSrc(coin.logo)
      : getChainLogoSrc(getKeysignChain(payload.keysign))
  }

  const chain = (payload.custom.chain as Chain) ?? customMessageDefaultChain
  return getChainLogoSrc(chain)
}
