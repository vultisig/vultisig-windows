import { useQuery } from '@tanstack/react-query'
import { tonAddressToBounceable } from '@vultisig/core-chain/chains/ton/address'
import {
  getTonNominatorPools,
  getTonStakingPoolInfo,
  TonNominatorPosition,
} from '@vultisig/core-chain/chains/ton/staking'

/**
 * A user's aggregated TON nominator-pool staking position, ready for the DeFi
 * card. A wallet stakes into a single nominator pool at a time, so the largest
 * position (active + pending deposit) wins. `null` means no stake.
 */
type TonStakePosition = {
  /** Bounceable user-friendly (`EQ…`) pool address for add-more / unstake sends. */
  poolAddress: string
  /** Pool implementation (`whales` / `tf`) — resolves the deposit/withdraw comment. */
  poolImplementation?: string
  poolName?: string
  /** Active stake plus a just-placed deposit awaiting the next cycle, in nanotons. */
  stakedAmount: bigint
  /** APY as a percentage (e.g. `13.27`), or undefined when unavailable. */
  apr?: number
  /** `false` while a withdrawal is pending (funds locked until the cycle ends). */
  canStake: boolean
  withdrawalPending: boolean
  /** Unix seconds the validation cycle ends — roughly when a withdrawal unlocks. */
  withdrawalUnlockTime?: number
}

const totalStake = (position: TonNominatorPosition): bigint =>
  position.amount + position.pendingDeposit

const fetchTonStakePosition = async (
  address: string
): Promise<TonStakePosition | null> => {
  const positions = await getTonNominatorPools(address)

  const primary = positions.reduce<TonNominatorPosition | undefined>(
    (largest, position) =>
      !largest || totalStake(position) > totalStake(largest)
        ? position
        : largest,
    undefined
  )

  if (!primary || totalStake(primary) === 0n) return null

  const poolInfo = await getTonStakingPoolInfo(primary.pool)

  // A nominator withdrawal is two-step/cyclic: the first unstake requests it and
  // funds stay locked until the validation cycle ends. While pending, block both
  // staking more and unstaking again, and surface roughly when funds unlock.
  const withdrawalPending =
    primary.pendingWithdraw > 0n || primary.readyWithdraw > 0n

  return {
    poolAddress: tonAddressToBounceable(primary.pool),
    poolImplementation: poolInfo?.implementation,
    poolName: poolInfo?.name,
    stakedAmount: totalStake(primary),
    // tonapi already reports `apy` as a percentage (13.27 = 13.27%) — the unit
    // `StakeCard` renders directly.
    apr: poolInfo?.apy,
    canStake: !withdrawalPending,
    withdrawalPending,
    withdrawalUnlockTime: withdrawalPending ? poolInfo?.cycleEnd : undefined,
  }
}

/**
 * Fetches the vault's aggregated TON nominator-pool staking position. Disabled
 * until the TON address is known; cached for 30s.
 */
export const useTonStakePositionQuery = (address: string | undefined) =>
  useQuery({
    queryKey: ['tonStakePosition', address] as const,
    queryFn: () => fetchTonStakePosition(address ?? ''),
    enabled: !!address,
    staleTime: 30_000,
  })
