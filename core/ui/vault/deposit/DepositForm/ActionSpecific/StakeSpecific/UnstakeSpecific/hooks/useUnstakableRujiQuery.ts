import {
  fetchRujiUnstakeBalances,
  RujiUnstakeBalances,
} from '@core/ui/defi/chain/queries/services/thorchainStake/rujiStakeService'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { rujiraStakingConfig } from '@vultisig/core-chain/chains/cosmos/thor/rujira/config'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

/**
 * Amounts of staked RUJI available to unstake, per position. Reuses the DeFi
 * staking service so each unstake ceiling equals the amount shown on its Staked
 * RUJI card — the auto-compounding (`liquidSize`) value with the on-chain
 * receipt as a fallback, and the bonded (`bonded`) value. The caller picks the
 * balance matching the position being unstaked.
 */
export const useUnstakableRujiQuery = ({
  address,
  options,
}: {
  address?: string | null
  options?: Omit<
    Partial<UseQueryOptions<RujiUnstakeBalances>>,
    'queryKey' | 'queryFn' | 'select'
  >
}) =>
  useQuery({
    queryKey: ['unstakable-ruji', address],
    queryFn: () => fetchRujiUnstakeBalances(shouldBePresent(address)),
    ...options,
    select: ({ autoCompound, bonded }) => ({
      autoCompound: fromChainAmount(
        autoCompound,
        rujiraStakingConfig.bondDecimals
      ),
      bonded: fromChainAmount(bonded, rujiraStakingConfig.bondDecimals),
    }),
  })
