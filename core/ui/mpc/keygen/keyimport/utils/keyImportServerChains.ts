import { Chain } from '@vultisig/core-chain/Chain'
import { Vault } from '@vultisig/core-mpc/vault/Vault'

/**
 * Extension-only metadata: the chains the extension sent to Vultiserver
 * during KeyImport keygen (`representativeChains` — one per derivation
 * group). Persisted alongside the vault so sign-time chain rewrites can
 * pick a chain the server actually has stored.
 *
 * The SDK `Vault` type doesn't declare this field; we attach it directly
 * to the persisted vault object and read it through this typed accessor.
 */
const FIELD = 'keyImportServerChains' as const

type WithServerChains = { [FIELD]?: readonly Chain[] }

export const getKeyImportServerChains = (
  vault: Vault
): readonly Chain[] | undefined => (vault as Vault & WithServerChains)[FIELD]

export const withKeyImportServerChains = (
  vault: Vault,
  chains: readonly Chain[]
): Vault => ({ ...vault, [FIELD]: chains }) as Vault & WithServerChains
