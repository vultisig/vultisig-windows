import { Chain, CosmosChain } from '@core/chain/Chain'
import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'

const MAYACHAIN_API_BASE_URL = `${cosmosRpcUrl[CosmosChain.MayaChain]}/mayachain`
export const MAYACHAIN_POOLS_ENDPOINT = `${MAYACHAIN_API_BASE_URL}/pools`

const STAKEABLE_CHAINS = [Chain.Ton, Chain.THORChain] as const
export type StakeableChain = (typeof STAKEABLE_CHAINS)[number]
export const STAKEABLE_ASSETS_TICKERS = ['TCY'] as const
export type StakeableAssetTicker = (typeof STAKEABLE_ASSETS_TICKERS)[number]

export const isStakeableChain = (c: Chain): c is StakeableChain =>
  STAKEABLE_CHAINS.includes(c as StakeableChain)
