import { Chain, createPublicClient, http, PublicClient } from 'viem';
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
} from 'viem/chains';

import { recordMap } from '../../lib/utils/record/recordMap';
import { EvmChain } from '../../model/chain';
import { Endpoint } from '../../services/Endpoint';

export const evmChainRpcUrls: Record<EvmChain, string> = {
  [EvmChain.Ethereum]: `${Endpoint.vultisigApiProxy}/eth/`,
  [EvmChain.Base]: `${Endpoint.vultisigApiProxy}/base/`,
  [EvmChain.Arbitrum]: `${Endpoint.vultisigApiProxy}/arb/`,
  [EvmChain.Polygon]: `${Endpoint.vultisigApiProxy}/polygon/`,
  [EvmChain.Optimism]: `${Endpoint.vultisigApiProxy}/opt/`,
  [EvmChain.CronosChain]: 'https://cronos-evm-rpc.publicnode.com',
  [EvmChain.Blast]: `${Endpoint.vultisigApiProxy}/blast/`,
  [EvmChain.BSC]: `${Endpoint.vultisigApiProxy}/bsc/`,
  [EvmChain.Zksync]: `${Endpoint.vultisigApiProxy}/zksync/`,
  [EvmChain.Avalanche]: 'https://avalanche-c-chain-rpc.publicnode.com',
};

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
};

export const evmChainInfo = recordMap(
  evmDefaultChainInfo,
  (chain, chainKey) => {
    const rpcUrl = evmChainRpcUrls[chainKey];

    return {
      ...chain,
      rpcUrls: {
        ...chain.rpcUrls,
        default: { http: [rpcUrl] },
      },
    };
  }
);

export const getEvmChainId = (chain: EvmChain): number => {
  return evmChainInfo[chain].id;
};

export const getEvmChainRpcUrl = (chain: EvmChain): string => {
  return evmChainRpcUrls[chain];
};

export const getEvmPublicClient = (chain: EvmChain): PublicClient => {
  return createPublicClient({
    chain: evmChainInfo[chain],
    transport: http(),
  });
};
