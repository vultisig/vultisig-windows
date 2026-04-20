import { Chain } from '@vultisig/core-chain/Chain'
import { isKeyImportVault, Vault } from '@vultisig/core-mpc/vault/Vault'
import { getRecordKeys } from '@vultisig/lib-utils/record/getRecordKeys'

import { getKeyImportDerivationGroups } from './getKeyImportDerivationGroups'

type GetKeyImportRepresentativeChainInput = {
  vault: Vault
  chain: Chain
}

/**
 * Returns the derivation-group representative chain that the fast vault
 * server stored the per-chain keyshare under during key import. Non-import
 * vaults don't share keyshares across chains, so the target chain is
 * returned unchanged.
 *
 * Why: key import groups chains by BIP44 path and uploads only one
 * keyshare per group to the server, labeled with the group's first chain.
 * Signing any other group member must reference that same label, otherwise
 * the server can't locate the keyshare and the MPC session never starts.
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
  const group = groups.find(g => g.chains.includes(chain))

  return group ? group.representativeChain : chain
}
