import { WalletCore } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { deriveAddress } from '@vultisig/core-chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@vultisig/core-chain/publicKey/getPublicKey'
import { PublicKeys } from '@vultisig/core-chain/publicKey/PublicKeys'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

import { deriveQbtcAddress } from './deriveQbtcAddress'

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
  if (String(chain) === 'QBTC') {
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
