import { Chain } from '@vultisig/core-chain/Chain'

import { getKeyImportDerivationGroups } from '../../../keygen/keyimport/utils/getKeyImportDerivationGroups'

type ResolveServerChainForKeyImportInput = {
  chain: Chain
  serverChains: readonly Chain[]
}

/**
 * Maps a sign-time chain to a chain Vultiserver actually has stored.
 *
 * The extension's KeyImport fast keygen sends one chain per derivation
 * group to Vultiserver (the representative), so the server's
 * `Vault.ChainPublicKeys` only has entries for those representatives. The
 * actual list is persisted in the vault as `keyImportServerChains`.
 *
 * If `chain` is in that list, it's a no-op. Otherwise, returns the
 * server-stored chain in the same derivation group, so the keysign
 * request hits an entry the server's `chainInfo.Chain == req.Chain`
 * lookup can match.
 */
export const resolveServerChainForKeyImport = ({
  chain,
  serverChains,
}: ResolveServerChainForKeyImportInput): Chain => {
  if (serverChains.includes(chain)) return chain
  const myGroup = getKeyImportDerivationGroups([...serverChains, chain]).find(
    g => g.chains.includes(chain)
  )
  return myGroup?.chains.find(c => serverChains.includes(c)) ?? chain
}
