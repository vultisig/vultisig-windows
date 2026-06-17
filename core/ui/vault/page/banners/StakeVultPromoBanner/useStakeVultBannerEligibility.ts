import { useStakedVultBalanceQuery } from '@core/ui/defi/protocols/vultStaking/queries/useStakedVultBalanceQuery'
import { useVultBalanceQuery } from '@core/ui/defi/protocols/vultStaking/queries/useVultBalanceQuery'
import {
  getVultDiscountTier,
  VultDiscountTier,
} from '@vultisig/core-chain/swap/affiliate'
import { vultDiscountTiers } from '@vultisig/core-chain/swap/affiliate/config'

const tierRank = (tier: VultDiscountTier | null): number =>
  tier === null ? -1 : vultDiscountTiers.indexOf(tier)

/**
 * Whether to nudge the vault to stake its held VULT: it holds unstaked VULT that
 * would raise its discount tier above what its already-staked balance reaches.
 * Returns false until both balances have loaded so the banner never flashes.
 * The Thorguard-NFT modifier is held constant (it shifts both tiers equally), so
 * the comparison isolates the gain from staking the held VULT.
 */
export const useStakeVultBannerEligibility = (): boolean => {
  const { data: unstakedBalance } = useVultBalanceQuery()
  const { data: stakedBalance } = useStakedVultBalanceQuery()

  if (unstakedBalance === undefined || stakedBalance === undefined) {
    return false
  }

  if (unstakedBalance <= 0n) {
    return false
  }

  const currentTier = getVultDiscountTier({
    vultBalance: stakedBalance,
    thorguardNftBalance: 0n,
  })
  const potentialTier = getVultDiscountTier({
    vultBalance: stakedBalance + unstakedBalance,
    thorguardNftBalance: 0n,
  })

  return tierRank(potentialTier) > tierRank(currentTier)
}
