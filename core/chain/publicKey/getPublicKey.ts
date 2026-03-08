import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { getCoinType } from '@core/chain/coin/coinType'
import { frostOnlyChains } from '@core/chain/froztChains'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { match } from '@lib/utils/match'
import { WalletCore } from '@trustwallet/wallet-core'

import { getCardanoPublicKeyData } from './cardano'
import { derivePublicKey } from './ecdsa/derivePublicKey'
import { PublicKeys } from './PublicKeys'
import { getTwPublicKeyType } from './tw/getTwPublicKeyType'

type Input = {
  chain: Chain
  walletCore: WalletCore
  hexChainCode: string
  publicKeys: PublicKeys
  chainPublicKeys?: Partial<Record<Chain, string>>
}

export const getPublicKey = ({
  chain,
  walletCore,
  hexChainCode,
  publicKeys,
  chainPublicKeys,
}: Input) => {
  const coinType = getCoinType({
    walletCore,
    chain,
  })

  const chainPublicKey = frostOnlyChains.includes(chain)
    ? undefined
    : chainPublicKeys?.[chain]

  const hasKeyImportEntries =
    chainPublicKeys !== undefined &&
    Object.keys(chainPublicKeys).some(
      k => !frostOnlyChains.includes(k as Chain)
    )

  if (
    hasKeyImportEntries &&
    !chainPublicKey &&
    !frostOnlyChains.includes(chain)
  ) {
    throw new Error('Chain public key not found')
  }

  const keysignType = signatureAlgorithms[getChainKind(chain)]

  const publicKeyType = getTwPublicKeyType({ walletCore, chain })

  const derivedPublicKey =
    chainPublicKey ??
    match(keysignType, {
      ecdsa: () =>
        derivePublicKey({
          hexRootPubKey: publicKeys.ecdsa,
          hexChainCode: hexChainCode,
          path: walletCore.CoinTypeExt.derivationPath(coinType),
        }),
      eddsa: () => publicKeys.eddsa,
    })

  const publicKeyData =
    chain === Chain.Cardano
      ? getCardanoPublicKeyData({
          publicKey: derivedPublicKey,
          hexChainCode,
        })
      : Buffer.from(derivedPublicKey, 'hex')

  const pubkey = walletCore.PublicKey.createWithData(
    publicKeyData,
    publicKeyType
  )

  if (coinType == walletCore.CoinType.tron) {
    return pubkey.uncompressed()
  }

  return pubkey
}
