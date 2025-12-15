export type ThorchainBondPosition = {
  id: string
  nodeAddress: string
  amount: bigint
  apy: number
  nextReward: number
  nextChurn?: Date
  status: string
  fiatValue: number
}

export type ThorchainStakePosition = {
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
  fiatValue: number
}

export type DefiChainPositions = {
  bond?: {
    totalBonded: bigint
    positions: ThorchainBondPosition[]
    availableNodes: string[]
    canUnbond: boolean
  }
  stake?: {
    positions: ThorchainStakePosition[]
  }
  prices: Record<string, number>
}
