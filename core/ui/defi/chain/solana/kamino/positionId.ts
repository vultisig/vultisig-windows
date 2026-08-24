/**
 * DeFi position ids for the curated Kamino Earn vaults.
 *
 * Keyed by the vault's own address rather than a slug of its name: the id is
 * persisted in `defiPositions` storage, so it has to stay stable even if
 * Kamino renames a vault, and the address is the vault's real identity.
 */
const kaminoEarnPositionIdPrefix = 'solana-earn-kamino-'

/** The stored position id for one curated vault. */
export const kaminoEarnPositionId = (vaultAddress: string): string =>
  `${kaminoEarnPositionIdPrefix}${vaultAddress}`

/**
 * The vault address a Kamino position id names, or `undefined` for an id that
 * belongs to some other position type. Callers resolve the descriptor through
 * the registry rather than trusting the address this returns.
 */
export const kaminoVaultAddressFromPositionId = (
  positionId: string
): string | undefined =>
  positionId.startsWith(kaminoEarnPositionIdPrefix)
    ? positionId.slice(kaminoEarnPositionIdPrefix.length)
    : undefined
