import { Chain } from '@vultisig/core-chain/Chain'
import { kaminoVaultRegistry } from '@vultisig/core-chain/chains/solana/kamino/registry'

import { kaminoEarnPositionId } from './positionId'

type ResolveKaminoEarnSelectionInput = {
  /** The chain list the DeFi tab shows rows for. */
  defiChains: Chain[]
  /** The selected DeFi positions, keyed by chain. */
  defiPositions: Record<string, string[]>
}

/**
 * What has to be written before Kamino Earn can show anything. A list is
 * `undefined` when the stored one already works, so a caller writes only what
 * it has to.
 */
type KaminoEarnSelection = {
  defiChains?: Chain[]
  defiPositions?: Record<string, string[]>
}

/**
 * Grows the DeFi selection until the Earn tab can show Kamino, without ever
 * shrinking it: Solana is appended to the chain list, and the curated vaults
 * are appended to Solana's positions.
 *
 * Having any one curated vault selected counts as done. A user who turned
 * individual vaults off still has an Earn tab with something in it, and
 * re-adding what they removed would quietly undo that choice.
 */
export const resolveKaminoEarnSelection = ({
  defiChains,
  defiPositions,
}: ResolveKaminoEarnSelectionInput): KaminoEarnSelection => {
  const kaminoPositionIds = kaminoVaultRegistry.map(({ address }) =>
    kaminoEarnPositionId(address)
  )
  const solanaPositions = defiPositions[Chain.Solana] ?? []
  const hasKaminoPosition = solanaPositions.some(id =>
    kaminoPositionIds.includes(id)
  )

  return {
    defiChains: defiChains.includes(Chain.Solana)
      ? undefined
      : [...defiChains, Chain.Solana],
    defiPositions: hasKaminoPosition
      ? undefined
      : {
          ...defiPositions,
          [Chain.Solana]: [...solanaPositions, ...kaminoPositionIds],
        },
  }
}
