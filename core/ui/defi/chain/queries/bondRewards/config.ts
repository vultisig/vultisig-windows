import { Chain } from '@vultisig/core-chain/Chain'

/** Chains whose DeFi page lists bonded nodes with a reward history. */
export const bondChains = [Chain.THORChain, Chain.MayaChain] as const

/** A chain whose bond providers earn a per-churn node reward. */
export type BondChain = (typeof bondChains)[number]

/** How many past churns the reward history walks back at most. */
export const bondRewardHistoryLimit = 20

/** How many historical node reads the reward history runs in parallel. */
export const bondRewardHistoryBatchSize = 5
