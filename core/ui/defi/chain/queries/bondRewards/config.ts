import { Chain } from '@vultisig/core-chain/Chain'
import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'

/** Chains whose DeFi page lists bonded nodes with a reward history. */
export const bondChains = [Chain.THORChain, Chain.MayaChain] as const

/** A chain whose bond providers earn a per-churn node reward. */
export type BondChain = (typeof bondChains)[number]

/** How many past churns the reward history walks back at most. */
export const bondRewardHistoryLimit = 20

/** How many historical node reads the reward history runs in parallel. */
export const bondRewardHistoryBatchSize = 5

/** How old a churn can be and still be read from the node: liquify only keeps ~13 days of state. */
export const bondRewardFetchWindow = convertDuration(13, 'd', 'ms')
