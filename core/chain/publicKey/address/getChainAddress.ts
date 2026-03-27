import { Chain } from '@core/chain/Chain'
import { getSignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { WalletCore } from '@trustwallet/wallet-core'

import { getPublicKey } from '../getPublicKey'
import { PublicKeys } from '../PublicKeys'
import { deriveAddress } from './deriveAddress'
import { deriveQbtcAddress } from './qbtc'

type GetChainAddressInput = {
  chain: Chain
  walletCore: WalletCore
  hexChainCode: string
  publicKeys: PublicKeys
  publicKeyMldsa?: string
  chainPublicKeys?: Partial<Record<Chain, string>>
}

/** Derives the on-chain address for any chain, including MLDSA-based chains like QBTC. */
export const getChainAddress = ({
  chain,
  walletCore,
  hexChainCode,
  publicKeys,
  publicKeyMldsa,
  chainPublicKeys,
}: GetChainAddressInput): string => {
  if (getSignatureAlgorithm(chain) === 'mldsa') {
    return deriveQbtcAddress(
      shouldBePresent(publicKeyMldsa, 'MLDSA public key')
    )
  }

  const publicKey = getPublicKey({
    chain,
    walletCore,
    hexChainCode,
    publicKeys,
    chainPublicKeys,
  })

  return deriveAddress({ chain, publicKey, walletCore })
}
