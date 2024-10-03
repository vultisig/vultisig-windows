import { Chain } from '../../model/chain';
import { RpcServiceDydx } from './dydx/RpcServiceDydx';
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
} from './evm/RpcServiceEvmAllLayers';
import { RpcServiceZksync } from './evm/RpcServiceZkSyncEvm';
import { RpcServiceGaia } from './gaia/RpcServiceGaia';
import { RpcServiceKujira } from './kurija/RpcServiceKurija';
import { RpcServicePolkadot } from './polkadot/RpcServicePolkadot';
import { RpcServiceSolana } from './solana/RpcServiceSolana';
import { RpcServiceSui } from './sui/RpcServiceSui';
import { RpcServiceThorchain } from './thorchain/RpcServiceThorchain';
import { RpcServiceUtxo } from './utxo/RpcServiceUtxo';

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
      case Chain.Zksync:
        return new RpcServiceZksync();
      case Chain.THORChain:
        return new RpcServiceThorchain();
      case Chain.MayaChain:
        return new RpcServiceThorchain();
      case Chain.Bitcoin:
        return new RpcServiceUtxo(chain);
      case Chain.BitcoinCash:
        return new RpcServiceUtxo(chain);
      case Chain.Litecoin:
        return new RpcServiceUtxo(chain);
      case Chain.Dash:
        return new RpcServiceUtxo(chain);
      case Chain.Dogecoin:
        return new RpcServiceUtxo(chain);
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
