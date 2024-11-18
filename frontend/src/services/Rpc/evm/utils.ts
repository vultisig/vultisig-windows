import { EvmChain } from '../../../model/chain';
import { Endpoint } from '../../Endpoint';

export const getRPCServiceEndpoint = (chain: EvmChain) => {
  switch (chain) {
    case EvmChain.Arbitrum:
      return Endpoint.arbitrumOneServiceRpcService;
    case EvmChain.Avalanche:
      return Endpoint.avalancheServiceRpcService;
    case EvmChain.Ethereum:
      return Endpoint.ethServiceRpcService;
    case EvmChain.BSC:
      return Endpoint.bscServiceRpcService;
    default:
      return Endpoint.ethServiceRpcService;
  }
};
