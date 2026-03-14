import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { VaultKeyGroup } from '@core/chain/signing/VaultKeyGroup'

export const getChainKeyGroup = (chain: Chain): VaultKeyGroup => {
  if (chain === Chain.ZcashSapling) {
    return 'frozt'
  }

  if (chain === Chain.Monero) {
    return 'fromt'
  }

  return signatureAlgorithms[getChainKind(chain)]
}
