import { Chain } from '@core/chain/Chain'
import { VaultKeyGroup } from '@core/chain/signing/VaultKeyGroup'
import { Vault } from '@core/mpc/vault/Vault'

export const getVaultKeyGroupHasKeys = (
  vault: Vault,
  group: VaultKeyGroup
): boolean => {
  switch (group) {
    case 'ecdsa':
      return !!vault.publicKeys.ecdsa
    case 'eddsa':
      return !!vault.publicKeys.eddsa
    case 'frozt':
      return !!vault.chainPublicKeys?.[Chain.ZcashShielded]
    case 'mldsa':
      return !!vault.publicKeyMldsa
  }
}
