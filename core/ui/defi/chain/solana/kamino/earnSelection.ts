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
 * Seeds the DeFi selection so the Earn tab has something to show: Solana is
 * appended to the chain list, and the curated vaults become Solana's
 * positions.
 *
 * Positions are only ever seeded, never re-seeded. A vault the user turned off
 * is indistinguishable from one never offered, so the trigger is whether
 * Solana has a stored position list at all - once it has one, whatever it says
 * is the user's answer, including an answer of "no Kamino vaults". A user who
 * opted out that way lands on the Earn tab's own opt-in prompt instead of
 * having the vaults quietly put back.
 */
export const resolveKaminoEarnSelection = ({
  defiChains,
  defiPositions,
}: ResolveKaminoEarnSelectionInput): KaminoEarnSelection => {
  const hasSolanaPositions = defiPositions[Chain.Solana] !== undefined

  return {
    defiChains: defiChains.includes(Chain.Solana)
      ? undefined
      : [...defiChains, Chain.Solana],
    defiPositions: hasSolanaPositions
      ? undefined
      : {
          ...defiPositions,
          [Chain.Solana]: kaminoVaultRegistry.map(({ address }) =>
            kaminoEarnPositionId(address)
          ),
        },
  }
}
