import { Chain } from 'viem';
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

import { EvmChain } from '../../model/chain';
import { Endpoint } from '../../services/Endpoint';

const withCustomRpcUrl = (chain: Chain, rpcUrl: string): Chain => ({
  ...chain,
  rpcUrls: {
    ...chain.rpcUrls,
    default: { http: [rpcUrl] },
  },
});

const evmChainInfo: Record<EvmChain, Chain> = {
  [EvmChain.Ethereum]: withCustomRpcUrl(
    mainnet,
    `${Endpoint.vultisigApiProxy}/eth/`
  ),
  [EvmChain.Base]: withCustomRpcUrl(base, `${Endpoint.vultisigApiProxy}/base/`),
  [EvmChain.Arbitrum]: withCustomRpcUrl(
    arbitrum,
    `${Endpoint.vultisigApiProxy}/arb/`
  ),
  [EvmChain.Polygon]: withCustomRpcUrl(
    polygon,
    `${Endpoint.vultisigApiProxy}/polygon/`
  ),
  [EvmChain.Optimism]: withCustomRpcUrl(
    optimism,
    `${Endpoint.vultisigApiProxy}/opt/`
  ),
  [EvmChain.CronosChain]: withCustomRpcUrl(
    cronos,
    'https://cronos-evm-rpc.publicnode.com'
  ),
  [EvmChain.Blast]: withCustomRpcUrl(
    blast,
    `${Endpoint.vultisigApiProxy}/blast/`
  ),
  [EvmChain.BSC]: withCustomRpcUrl(bsc, `${Endpoint.vultisigApiProxy}/bsc/`),
  [EvmChain.Zksync]: withCustomRpcUrl(
    zksync,
    `${Endpoint.vultisigApiProxy}/zksync/`
  ),
  [EvmChain.Avalanche]: withCustomRpcUrl(
    avalanche,
    'https://avalanche-c-chain-rpc.publicnode.com'
  ),
};

export const getEvmChainId = (chain: EvmChain): number => {
  return evmChainInfo[chain].id;
};

export const getEvmChainRpcUrl = (chain: EvmChain): string => {
  return evmChainInfo[chain].rpcUrls.default.http[0];
};
