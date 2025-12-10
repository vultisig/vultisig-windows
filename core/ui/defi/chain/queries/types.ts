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
  apr?: number
  estimatedReward?: number
  nextPayout?: Date
  rewards?: number
  rewardTicker?: string
  fiatValue: number
}

export type ThorchainDefiPositions = {
  bond: {
    totalBonded: bigint
    positions: ThorchainBondPosition[]
    availableNodes: string[]
    canUnbond: boolean
  }
  stake: {
    positions: ThorchainStakePosition[]
  }
  prices: Record<string, number>
}
