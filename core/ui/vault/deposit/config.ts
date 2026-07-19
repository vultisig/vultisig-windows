import { Chain, CosmosChain } from '@vultisig/core-chain/Chain'
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'

const mayachainApiBaseUrl = `${cosmosRpcUrl[CosmosChain.MayaChain]}/mayachain`
export const mayachainPoolsEndpoint = `${mayachainApiBaseUrl}/pools`

const stakeableChains = [Chain.Ton, Chain.THORChain] as const
export type StakeableChain = (typeof stakeableChains)[number]
export const stakeableAssetsTickers = ['TCY', 'RUJI', 'GRAM', 'BRUNE'] as const
export type StakeableAssetTicker = (typeof stakeableAssetsTickers)[number]

export const isStakeableChain = (c: Chain): c is StakeableChain =>
  stakeableChains.includes(c as StakeableChain)

// Match case-insensitively: some THORChain tokens carry a mixed-case brand
// ticker (e.g. `bRUNE`) that must still resolve against the upper-case tuple.
export const isStakeableCoin = (ticker: string): boolean => {
  return (
    !!ticker &&
    stakeableAssetsTickers.includes(
      ticker.toUpperCase() as StakeableAssetTicker
    )
  )
}
