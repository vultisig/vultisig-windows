import { Chain, CosmosChain } from '@vultisig/core-chain/Chain'
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { bruneBondConfig } from '@vultisig/core-chain/chains/cosmos/thor/brune-bond/config'

const mayachainApiBaseUrl = `${cosmosRpcUrl[CosmosChain.MayaChain]}/mayachain`
export const mayachainPoolsEndpoint = `${mayachainApiBaseUrl}/pools`

const stakeableChains = [Chain.Ton, Chain.THORChain] as const
/** A chain that exposes a native staking flow in the deposit UI. */
export type StakeableChain = (typeof stakeableChains)[number]
/** Tickers that can be staked through the deposit flow (exact match). */
const stakeableAssetsTickers = ['TCY', 'RUJI', 'GRAM'] as const

/** Whether `c` exposes a native staking flow. */
export const isStakeableChain = (c: Chain): c is StakeableChain =>
  stakeableChains.some(chain => chain === c)

/** Whether `ticker` is one of the ticker-identified stakeable assets. */
export const isStakeableCoin = (ticker: string): boolean =>
  stakeableAssetsTickers.some(t => t === ticker)

/**
 * Whether `coin` is stakeable bRUNE. bRUNE is identified by its canonical
 * liquid-bond denom (`x/brune`) on THORChain, never by ticker: the mixed-case
 * brand ticker (`bRUNE`) is spoofable — a look-alike token with the same
 * ticker but a different denom must not be routed into bRUNE staking, which
 * always spends the canonical `x/brune` funds.
 */
export const isBruneStakeCoin = (coin: {
  chain: Chain
  id?: string
}): boolean =>
  coin.chain === Chain.THORChain && coin.id === bruneBondConfig.depositDenom
