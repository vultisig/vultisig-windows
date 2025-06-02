import { Chain, EvmChain } from '@core/chain/Chain'
import { rootApiUrl } from '@core/config'
import { numberToHex } from '@lib/utils/hex/numberToHex'
import { mirrorRecord } from '@lib/utils/record/mirrorRecord'
import { recordMap } from '@lib/utils/record/recordMap'
import { Chain as ViemChain } from 'viem'
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

const evmDefaultChainInfo: Record<EvmChain, ViemChain> = {
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

const evmChainId: Record<EvmChain, string> = recordMap(
  evmDefaultChainInfo,
  chain => numberToHex(chain.id)
)

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

export const getEvmChainId = (chain: EvmChain): string => {
  return evmChainId[chain]
}

export const getEvmChainByChainId = (chainId: string): Chain | undefined => {
  return mirrorRecord(evmChainId)[chainId]
}
