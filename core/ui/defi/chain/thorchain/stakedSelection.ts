import { getDefaultStakePositionIds } from '@core/ui/storage/defiPositions'
import { Chain } from '@vultisig/core-chain/Chain'

type ResolveThorchainStakedSelectionInput = {
  /** The chain list the DeFi tab shows rows for. */
  defiChains: Chain[]
  /** The selected DeFi positions, keyed by chain. */
  defiPositions: Record<string, string[]>
}

/**
 * What has to be written before the THORChain Staked tab can show anything. A
 * list is `undefined` when the stored one already works, so a caller writes
 * only what it has to.
 */
type ThorchainStakedSelection = {
  defiChains?: Chain[]
  defiPositions?: Record<string, string[]>
}

/**
 * Seeds the DeFi selection so the THORChain Staked tab has something to show:
 * THORChain is appended to the chain list, and its stake positions (RUJI, TCY
 * and the rest) become THORChain's positions. Bond stays unseeded - a staking
 * entry point should not opt the user into node bonding.
 *
 * Positions are only ever seeded, never re-seeded. A position the user turned
 * off is indistinguishable from one never offered, so the trigger is whether
 * THORChain has a stored position list at all - once it has one, whatever it
 * says is the user's answer, including an answer of "no stake positions". A
 * user who opted out that way lands on the Staked tab's own opt-in prompt
 * instead of having the positions quietly put back.
 */
export const resolveThorchainStakedSelection = ({
  defiChains,
  defiPositions,
}: ResolveThorchainStakedSelectionInput): ThorchainStakedSelection => {
  const hasThorchainPositions = defiPositions[Chain.THORChain] !== undefined

  return {
    defiChains: defiChains.includes(Chain.THORChain)
      ? undefined
      : [...defiChains, Chain.THORChain],
    defiPositions: hasThorchainPositions
      ? undefined
      : {
          ...defiPositions,
          [Chain.THORChain]: getDefaultStakePositionIds(Chain.THORChain),
        },
  }
}
