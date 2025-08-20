import { Chain, CosmosChain } from '@core/chain/Chain'
import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'

const mayachainApiBaseUrl = `${cosmosRpcUrl[CosmosChain.MayaChain]}/mayachain`
export const mayachainPoolsEndpoint = `${mayachainApiBaseUrl}/pools`

const stakeableChains = [Chain.Ton, Chain.THORChain] as const
export type StakeableChain = (typeof stakeableChains)[number]
export const stakeableAssetsTickers = ['TCY'] as const
export type StakeableAssetTicker = (typeof stakeableAssetsTickers)[number]

export const isStakeableChain = (c: Chain): c is StakeableChain =>
  stakeableChains.includes(c as StakeableChain)

export const isStakeableCoin = (ticker: string): boolean => {
  return (
    !!ticker && stakeableAssetsTickers.includes(ticker as StakeableAssetTicker)
  )
}
