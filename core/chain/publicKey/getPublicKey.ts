import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { getCoinType } from '@core/chain/coin/coinType'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { match } from '@lib/utils/match'
import { WalletCore } from '@trustwallet/wallet-core'

import { derivePublicKey } from './ecdsa/derivePublicKey'
import { PublicKeys } from './PublicKeys'

type Input = {
  chain: Chain
  walletCore: WalletCore
  hexChainCode: string
  publicKeys: PublicKeys
}

export const getPublicKey = ({
  chain,
  walletCore,
  hexChainCode,
  publicKeys,
}: Input) => {
  const coinType = getCoinType({
    walletCore,
    chain,
  })

  const keysignType = signatureAlgorithms[getChainKind(chain)]

  const publicKeyType = match(keysignType, {
    ecdsa: () => walletCore.PublicKeyType.secp256k1,
    eddsa: () => walletCore.PublicKeyType.ed25519,
  })

  const derivedPublicKey = match(keysignType, {
    ecdsa: () =>
      derivePublicKey({
        hexRootPubKey: publicKeys.ecdsa,
        hexChainCode: hexChainCode,
        path: walletCore.CoinTypeExt.derivationPath(coinType),
      }),
    eddsa: () => publicKeys.eddsa,
  })

  const pubkey = walletCore.PublicKey.createWithData(
    Buffer.from(derivedPublicKey, 'hex'),
    publicKeyType
  )

  if (coinType == walletCore.CoinType.tron) {
    return pubkey.uncompressed()
  }

  return pubkey
}
