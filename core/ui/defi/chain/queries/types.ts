/**
 * How a position's fiat value is derived from live prices at render time:
 * `fiatValue = amount × price(coinKey)`. `amount` is human-readable and
 * already includes any redemption-rate/NAV scaling (e.g. sTCY's underlying
 * TCY, ybRUNE's NAV-scaled bRUNE), so the join is a plain multiplication.
 */
export type PositionFiatBasis = {
  coinKey: string
  amount: number
}

/**
 * How a price-dependent APR is derived from live prices at render time:
 * `apy% = (annualRewardAmount × price(rewardCoinKey)) / fiatValue × 100`,
 * then converted to APR. Only positions whose APR depends on a price ratio
 * (TCY: RUNE rewards over staked TCY value) carry this.
 */
export type PositionAprBasis = {
  rewardCoinKey: string
  annualRewardAmount: number
}

/**
 * Bond position as cached: price-free chain data carrying the basis to join
 * fiat at render, so stale prices can never be snapshotted into the cache.
 */
export type RawThorchainBondPosition = {
  id: string
  nodeAddress: string
  amount: bigint
  apy: number
  nextReward: number
  nextChurn?: Date
  status: string
  fiatBasis: PositionFiatBasis
  canUnbond: boolean
}

/** Bond position with its fiat value joined from live prices. */
export type ThorchainBondPosition = Omit<
  RawThorchainBondPosition,
  'fiatBasis'
> & {
  fiatValue: number
}

/**
 * Stake position as cached: price-free chain data carrying the bases to join
 * fiat (and price-dependent APR) at render.
 */
export type RawThorchainStakePosition = {
  id: string
  ticker: string
  amount: bigint
  type?: 'stake' | 'compound' | 'index'
  canUnstake?: boolean
  unstakeAvailableDate?: Date
  apr?: number
  estimatedReward?: number
  nextPayout?: Date
  rewards?: number
  rewardTicker?: string
  fiatBasis: PositionFiatBasis
  aprBasis?: PositionAprBasis
}

/** Stake position with fiat value and APR joined from live prices. */
export type ThorchainStakePosition = Omit<
  RawThorchainStakePosition,
  'fiatBasis' | 'aprBasis'
> & {
  fiatValue: number
}

/**
 * DeFi positions as cached (keyed only by address): price-free by design —
 * fiat values are joined from the live price query at render via
 * `joinDefiPositionsWithPrices`, so a transient price failure or partial
 * price data can never poison the snapshot.
 */
export type RawDefiChainPositions = {
  bond?: {
    totalBonded: bigint
    positions: RawThorchainBondPosition[]
    availableNodes: string[]
  }
  stake?: {
    positions: RawThorchainStakePosition[]
  }
}

/** DeFi positions with fiat values joined from live prices. */
export type DefiChainPositions = {
  bond?: {
    totalBonded: bigint
    positions: ThorchainBondPosition[]
    availableNodes: string[]
  }
  stake?: {
    positions: ThorchainStakePosition[]
  }
}
