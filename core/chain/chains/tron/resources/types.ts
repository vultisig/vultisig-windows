export type TronResourceType = 'BANDWIDTH' | 'ENERGY'

export type TronResourceUsage = {
  available: number
  total: number
  used: number
}

export type TronUnfreezingEntry = {
  unfreezeAmountSun: bigint
  expireTimeMs: number
}

export type TronAccountResources = {
  bandwidth: TronResourceUsage
  energy: TronResourceUsage
  frozenForBandwidthSun: bigint
  frozenForEnergySun: bigint
  unfreezingEntries: TronUnfreezingEntry[]
}
