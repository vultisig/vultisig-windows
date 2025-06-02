import { Chain, CosmosChain, EvmChain } from '@core/chain/Chain'
import { getCosmosChainId } from '@core/chain/chains/cosmos/chainInfo'
import { getEvmChainId } from '@core/chain/chains/evm/chainInfo'

const chainIdRecord: Record<CosmosChain | EvmChain, string> = {
  [EvmChain.Arbitrum]: `0x${getEvmChainId(EvmChain.Arbitrum).toString(16)}`,
  [EvmChain.Avalanche]: `0x${getEvmChainId(EvmChain.Avalanche).toString(16)}`,
  [EvmChain.Base]: `0x${getEvmChainId(EvmChain.Base).toString(16)}`,
  [EvmChain.CronosChain]: `0x${getEvmChainId(EvmChain.CronosChain).toString(16)}`,
  [EvmChain.BSC]: `0x${getEvmChainId(EvmChain.BSC).toString(16)}`,
  [EvmChain.Blast]: `0x${getEvmChainId(EvmChain.Blast).toString(16)}`,
  [EvmChain.Ethereum]: `0x${getEvmChainId(EvmChain.Ethereum).toString(16)}`,
  [EvmChain.Optimism]: `0x${getEvmChainId(EvmChain.Optimism).toString(16)}`,
  [EvmChain.Polygon]: `0x${getEvmChainId(EvmChain.Polygon).toString(16)}`,
  [EvmChain.Zksync]: `0x${getEvmChainId(EvmChain.Zksync).toString(16)}`,

  [CosmosChain.THORChain]: getCosmosChainId(CosmosChain.THORChain),
  [CosmosChain.Cosmos]: getCosmosChainId(CosmosChain.Cosmos),
  [CosmosChain.Osmosis]: getCosmosChainId(CosmosChain.Osmosis),
  [CosmosChain.MayaChain]: getCosmosChainId(CosmosChain.MayaChain),
  [CosmosChain.Dydx]: getCosmosChainId(CosmosChain.Dydx),
  [CosmosChain.Kujira]: getCosmosChainId(CosmosChain.Kujira),
  [CosmosChain.Terra]: getCosmosChainId(CosmosChain.Terra),
  [CosmosChain.TerraClassic]: getCosmosChainId(CosmosChain.TerraClassic),
  [CosmosChain.Noble]: getCosmosChainId(CosmosChain.Noble),
  [CosmosChain.Akash]: getCosmosChainId(CosmosChain.Akash),
}

export const getChainId = (chain: Chain): string | undefined => {
  return chainIdRecord[chain as CosmosChain | EvmChain]
}

export const getChainByChainId = (chainId: string): Chain | undefined => {
  const [chain] =
    Object.entries(chainIdRecord).find(([, id]) => id === chainId) || []

  return chain as Chain | undefined
}
