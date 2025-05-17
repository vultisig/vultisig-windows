import { CosmosChain } from '@core/chain/Chain'
import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'

const MAYACHAIN_API_BASE_URL = `${cosmosRpcUrl[CosmosChain.MayaChain]}/mayachain`
export const MAYACHAIN_POOLS_ENDPOINT = `${MAYACHAIN_API_BASE_URL}/pools`

export type StakeableChain = 'Ton' | 'THORChain'
export const STAKEABLE_ASSETS_TICKERS = ['TCY'] as const
export type StakeableAssetTicker = (typeof STAKEABLE_ASSETS_TICKERS)[number]
