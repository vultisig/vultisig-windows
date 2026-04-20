import { Chain } from '@vultisig/core-chain/Chain'
import { isKeyImportVault, Vault } from '@vultisig/core-mpc/vault/Vault'
import { getRecordKeys } from '@vultisig/lib-utils/record/getRecordKeys'

import {
  getDerivationKey,
  getKeyImportDerivationGroups,
} from './getKeyImportDerivationGroups'

type GetKeyImportRepresentativeChainInput = {
  vault: Vault
  chain: Chain
}

/**
 * Returns the imported-vault chain label that stores the keyshare usable
 * for signing `chain`. Non-import vaults return `chain` unchanged.
 *
 * Why: key import groups chains by BIP44 path and uploads only one
 * keyshare per group to the fast vault server, labeled with the group's
 * first chain. The extension fans that keyshare out to every group-member
 * chain it explicitly imported, but NOT to other chains sharing the same
 * derivation path. A chain that shares a derivation path with an imported
 * chain (e.g. Ethereum when only Arbitrum was imported) can still be
 * signed using the imported chain's keyshare — this helper resolves the
 * lookup label for both client- and server-side keyshare access.
 *
 * Resolution order:
 * 1. If `chain` is itself imported, return its derivation-group
 *    representative (first-imported chain sharing the derivation path).
 * 2. Otherwise, return any imported chain that shares `chain`'s
 *    derivation key — its keyshare is valid for `chain`.
 * 3. If no imported chain matches, return `chain` unchanged.
 */
export const getKeyImportRepresentativeChain = ({
  vault,
  chain,
}: GetKeyImportRepresentativeChainInput): Chain => {
  if (!isKeyImportVault(vault) || !vault.chainPublicKeys) {
    return chain
  }

  const importedChains = getRecordKeys(vault.chainPublicKeys)

  const groups = getKeyImportDerivationGroups(importedChains)
  const ownGroup = groups.find(g => g.chains.includes(chain))
  if (ownGroup) {
    return ownGroup.representativeChain
  }

  const targetKey = getDerivationKey(chain)
  const compatibleChain = importedChains.find(
    c => getDerivationKey(c) === targetKey
  )

  return compatibleChain ?? chain
}
