import { fetchRujiStakePosition } from '@core/ui/defi/chain/queries/services/thorchainStake/rujiStakeService'
import { ThorchainStakePosition } from '@core/ui/defi/chain/queries/types'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { rujiraStakingConfig } from '@vultisig/core-chain/chains/cosmos/thor/rujira/config'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

/**
 * Amount of staked RUJI available to unstake. Reuses the DeFi staking service so
 * the unstake ceiling equals the amount shown on the Staked RUJI card (the
 * auto-compounding `liquidSize` value, with the on-chain receipt / `bonded` as
 * fallbacks) rather than the API's `bonded` field, which is `0` for
 * auto-compounding stakers.
 */
export const useUnstakableRujiQuery = ({
  address,
  options,
}: {
  address?: string | null
  options?: Partial<UseQueryOptions<ThorchainStakePosition | null>>
}) =>
  useQuery({
    queryKey: ['unstakable-ruji', address],
    // `prices` only feeds the position's fiat value, which the unstake amount
    // doesn't use, so an empty price map is fine here.
    queryFn: () =>
      fetchRujiStakePosition({ address: shouldBePresent(address), prices: {} }),
    ...options,
    select: position => ({
      humanReadableBalance: position
        ? fromChainAmount(position.amount, rujiraStakingConfig.bondDecimals)
        : 0,
    }),
  })
