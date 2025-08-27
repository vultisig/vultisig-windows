import { match } from '@lib/utils/match'
import { WalletCore } from '@trustwallet/wallet-core'

import { Chain } from '../../Chain'
import { getChainKind } from '../../ChainKind'
import { signatureAlgorithms } from '../../signing/SignatureAlgorithm'

type Input = {
  walletCore: WalletCore
  chain: Chain
}

export const getTwPublicKeyType = ({ walletCore, chain }: Input) =>
  match(signatureAlgorithms[getChainKind(chain)], {
    ecdsa: () => walletCore.PublicKeyType.secp256k1,
    eddsa: () =>
      chain === Chain.Cardano
        ? walletCore.PublicKeyType.ed25519Cardano
        : walletCore.PublicKeyType.ed25519,
  })
