import { Chain, CosmosChain } from '@vultisig/core-chain/Chain'
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'

const mayachainApiBaseUrl = `${cosmosRpcUrl[CosmosChain.MayaChain]}/mayachain`
export const mayachainPoolsEndpoint = `${mayachainApiBaseUrl}/pools`

const stakeableChains = [Chain.Ton, Chain.THORChain] as const
/** A chain that exposes a native staking flow in the deposit UI. */
export type StakeableChain = (typeof stakeableChains)[number]
/** Canonical (upper-case) tickers that can be staked through the deposit flow. */
const stakeableAssetsTickers = ['TCY', 'RUJI', 'GRAM', 'BRUNE'] as const

/** Whether `c` exposes a native staking flow. */
export const isStakeableChain = (c: Chain): c is StakeableChain =>
  stakeableChains.some(chain => chain === c)

/**
 * Whether `ticker` is stakeable. Matches case-insensitively so a mixed-case
 * brand ticker (e.g. `bRUNE`) still resolves against the upper-case tuple.
 */
export const isStakeableCoin = (ticker: string): boolean =>
  stakeableAssetsTickers.some(t => t === ticker.toUpperCase())
