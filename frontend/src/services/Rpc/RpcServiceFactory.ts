import { Chain } from '../../model/chain';
import {
  RpcServiceArbitrum,
  RpcServiceAvalanche,
  RpcServiceBase,
  RpcServiceBlast,
  RpcServiceBsc,
  RpcServiceCronos,
  RpcServiceEthereum,
  RpcServiceOptimism,
  RpcServicePolygon,
  RpcServiceZksync,
} from './evm/RpcServiceEvmAllLayers';
import { RpcServiceGaia } from './gaia/RpcServiceGaia';
import { RpcServiceKujira } from './kurija/RpcServiceKurija';
import { RpcServicePolkadot } from './polkadot/RpcServicePolkadot';
import { RpcServiceSolana } from './solana/RpcServiceSolana';
import { RpcServiceSui } from './sui/RpcServiceSui';
import { RpcServiceThorchain } from './thorchain/RpcServiceThorchain';
import { RpcServiceUtxo } from './utxo/RpcServiceUtxo';
import { RpcServiceDydx } from './dydx/RpcServiceDydx';

export class RpcServiceFactory {
  static createRpcService(chain: Chain) {
    switch (chain) {
      case Chain.Solana:
        return new RpcServiceSolana();
      case Chain.Polkadot:
        return new RpcServicePolkadot();
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
      case Chain.THORChain:
      case Chain.MayaChain:
        return new RpcServiceThorchain();
      case Chain.Bitcoin:
      case Chain.BitcoinCash:
      case Chain.Litecoin:
      case Chain.Dash:
      case Chain.Dogecoin:
        return new RpcServiceUtxo();
      case Chain.Avalanche:
        return new RpcServiceAvalanche();
      case Chain.Sui:
        return new RpcServiceSui();
      case Chain.Gaia:
        return new RpcServiceGaia();
      case Chain.Kujira:
        return new RpcServiceKujira();
      case Chain.Dydx:
        return new RpcServiceDydx();
      default:
        throw new Error(`Chain not supported ${chain}`);
    }
  }
}
