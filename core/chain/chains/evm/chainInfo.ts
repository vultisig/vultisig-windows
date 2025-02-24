import { EvmChain } from '@core/chain/Chain'
import { rootApiUrl } from '@core/config'
import { recordMap } from '@lib/utils/record/recordMap'
import { Chain } from 'viem'
import {
  arbitrum,
  avalanche,
  base,
  blast,
  bsc,
  cronos,
  mainnet,
  optimism,
  polygon,
  zksync,
} from 'viem/chains'

export const evmChainRpcUrls: Record<EvmChain, string> = {
  [EvmChain.Ethereum]: `${rootApiUrl}/eth/`,
  [EvmChain.Base]: `${rootApiUrl}/base/`,
  [EvmChain.Arbitrum]: `${rootApiUrl}/arb/`,
  [EvmChain.Polygon]: `${rootApiUrl}/polygon/`,
  [EvmChain.Optimism]: `${rootApiUrl}/opt/`,
  [EvmChain.CronosChain]: 'https://cronos-evm-rpc.publicnode.com',
  [EvmChain.Blast]: `${rootApiUrl}/blast/`,
  [EvmChain.BSC]: `${rootApiUrl}/bsc/`,
  [EvmChain.Zksync]: `${rootApiUrl}/zksync/`,
  [EvmChain.Avalanche]: `${rootApiUrl}/avax/`,
}

const evmDefaultChainInfo: Record<EvmChain, Chain> = {
  [EvmChain.Ethereum]: mainnet,
  [EvmChain.Base]: base,
  [EvmChain.Arbitrum]: arbitrum,
  [EvmChain.Polygon]: polygon,
  [EvmChain.Optimism]: optimism,
  [EvmChain.CronosChain]: cronos,
  [EvmChain.Blast]: blast,
  [EvmChain.BSC]: bsc,
  [EvmChain.Zksync]: zksync,
  [EvmChain.Avalanche]: avalanche,
}

export const evmChainInfo = recordMap(
  evmDefaultChainInfo,
  (chain, chainKey) => {
    const rpcUrl = evmChainRpcUrls[chainKey]

    return {
      ...chain,
      rpcUrls: {
        ...chain.rpcUrls,
        default: { http: [rpcUrl] },
      },
    }
  }
)

export const getEvmChainId = (chain: EvmChain): number => {
  return evmChainInfo[chain].id
}
