import { Chain } from '@vultisig/core-chain/Chain'

type ResolveServerChainForKeyImportInput = {
  chain: Chain
  chainPublicKeys: Partial<Record<Chain, string>> | undefined
}

/**
 * At keygen time the extension sends one chain per derivation group to
 * Vultiserver (the representative, typically the first chain in the group),
 * so server-side `Vault.ChainPublicKeys` has an entry only for that
 * representative — not for the other chains sharing its derivation.
 *
 * At sign time Vultiserver looks up the chain by name in its stored
 * `ChainPublicKeys` to find the publicKey that pairs the MPC share
 * (keysign_dkls.go: `chainInfo.Chain == req.Chain`). Sending a
 * non-representative chain (e.g. `Ethereum` when the stored rep is
 * `Arbitrum`) causes the async worker to error with "public key for chain X
 * not found in vault" — which is never propagated back to the relay, so the
 * extension hangs polling for messages that never arrive.
 *
 * This helper rewrites `chain` to whichever local chain is the first entry
 * with the same publicKey. For extension-created KeyImport vaults that is
 * exactly the representative the server has stored. For iOS-created vaults
 * it's a no-op because the server has per-chain entries already.
 */
export const resolveServerChainForKeyImport = ({
  chain,
  chainPublicKeys,
}: ResolveServerChainForKeyImportInput): Chain => {
  if (!chainPublicKeys) return chain

  const ownPublicKey = chainPublicKeys[chain]
  if (!ownPublicKey) return chain

  for (const [candidateChain, candidatePublicKey] of Object.entries(
    chainPublicKeys
  )) {
    if (candidatePublicKey === ownPublicKey) {
      return candidateChain as Chain
    }
  }

  return chain
}
