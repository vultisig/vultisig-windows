import { Chain } from '../../model/chain';
import {
  RpcServiceArbitrum,
  RpcServiceBase,
  RpcServiceBlast,
  RpcServiceBsc,
  RpcServiceCronos,
  RpcServiceEthereum,
  RpcServiceOptimism,
  RpcServicePolygon,
  RpcServiceZksync,
} from './evm/RpcServiceEvmAllLayers';
import { RpcServiceSolana } from './solana/RpcServiceSolana';

export class RpcServiceFactory {
  static createRpcService(chain: Chain) {
    switch (chain) {
      case Chain.Solana:
        return new RpcServiceSolana();
      case Chain.Ethereum:
        return new RpcServiceEthereum();
      case Chain.Optimism:
        return new RpcServiceOptimism();
      case Chain.Polygon:
        return new RpcServicePolygon();
      case Chain.Arbitrum:
        return new RpcServiceArbitrum();
      case Chain.Blast:
        return new RpcServiceBlast();
      case Chain.Base:
        return new RpcServiceBase();
      case Chain.CronosChain:
        return new RpcServiceCronos();
      case Chain.BSC:
        return new RpcServiceBsc();
      case Chain.ZkSync:
        return new RpcServiceZksync();
      default:
        throw new Error('Chain not supported');
    }
  }
}
