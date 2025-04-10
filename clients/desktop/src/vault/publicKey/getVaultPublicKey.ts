import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { getCoinType } from '@core/chain/coin/coinType'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { Vault } from '@core/ui/vault/Vault'
import { match } from '@lib/utils/match'
import { WalletCore } from '@trustwallet/wallet-core'

import { GetDerivedPubKey } from '../../../wailsjs/go/tss/TssService'

type Input = {
  chain: Chain
  walletCore: WalletCore
  vault: Pick<Vault, 'hexChainCode' | 'publicKeys'>
}

export const getVaultPublicKey = async ({
  chain,
  walletCore,
  vault,
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

  const derivedPublicKey = await match(keysignType, {
    ecdsa: () =>
      GetDerivedPubKey(
        vault.publicKeys.ecdsa,
        vault.hexChainCode,
        walletCore.CoinTypeExt.derivationPath(coinType),
        false
      ),
    eddsa: async () => vault.publicKeys.eddsa,
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
