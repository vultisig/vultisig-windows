import { EvmChain } from '../../model/chain';
import { Endpoint } from '../../services/Endpoint';

export const evmRpcUrl: Record<EvmChain, string> = {
  [EvmChain.Ethereum]: Endpoint.ethServiceRpcService,
  [EvmChain.Base]: Endpoint.baseServiceRpcService,
  [EvmChain.Arbitrum]: Endpoint.arbitrumOneServiceRpcService,
  [EvmChain.Polygon]: Endpoint.polygonServiceRpcService,
  [EvmChain.Optimism]: Endpoint.optimismServiceRpcService,
  [EvmChain.CronosChain]: Endpoint.cronosServiceRpcService,
  [EvmChain.Blast]: Endpoint.blastServiceRpcService,
  [EvmChain.BSC]: Endpoint.bscServiceRpcService,
  [EvmChain.Zksync]: Endpoint.zksyncServiceRpcService,
  [EvmChain.Avalanche]: Endpoint.avalancheServiceRpcService,
};
