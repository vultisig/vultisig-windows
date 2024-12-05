import { match } from '../../lib/utils/match';
import { Chain, EvmChain } from '../../model/chain';
import { RpcServiceDydx } from './dydx/RpcServiceDydx';
import { RpcServiceEvm } from './evm/RpcServiceEvm';
import { RpcServiceZksync } from './evm/RpcServiceZkSyncEvm';
import { RpcServiceGaia } from './gaia/RpcServiceGaia';
import { IRpcService } from './IRpcService';
import { RpcServiceKujira } from './kurija/RpcServiceKurija';
import { RpcServiceMaya } from './maya/RpcServiceMaya';
import { RpcServiceNoble } from './noble/RpcServiceNoble';
import { RpcServiceOsmosis } from './osmosis/RpcServiceOsmosis';
import { RpcServicePolkadot } from './polkadot/RpcServicePolkadot';
import { RpcServiceSolana } from './solana/RpcServiceSolana';
import { RpcServiceSui } from './sui/RpcServiceSui';
import {
  RpcServiceTerraClassic,
  RpcServiceTerraV2,
} from './terra/RpcServiceTerra';
import { RpcServiceThorchain } from './thorchain/RpcServiceThorchain';
import { RpcServiceTon } from './ton/RpcServiceTon';
import { RpcServiceUtxo } from './utxo/RpcServiceUtxo';

export class RpcServiceFactory {
  static createRpcService(chain: Chain) {
    return match<Chain, IRpcService>(chain, {
      [Chain.Solana]: () => new RpcServiceSolana(),
      [Chain.Polkadot]: () => new RpcServicePolkadot(chain),
      [Chain.Ethereum]: () => new RpcServiceEvm(chain as EvmChain),
      [Chain.Optimism]: () => new RpcServiceEvm(chain as EvmChain),
      [Chain.Polygon]: () => new RpcServiceEvm(chain as EvmChain),
      [Chain.Arbitrum]: () => new RpcServiceEvm(chain as EvmChain),
      [Chain.Blast]: () => new RpcServiceEvm(chain as EvmChain),
      [Chain.Base]: () => new RpcServiceEvm(chain as EvmChain),
      [Chain.CronosChain]: () => new RpcServiceEvm(chain as EvmChain),
      [Chain.BSC]: () => new RpcServiceEvm(chain as EvmChain),
      [Chain.Zksync]: () => new RpcServiceZksync(),
      [Chain.THORChain]: () => new RpcServiceThorchain(),
      [Chain.MayaChain]: () => new RpcServiceMaya(),
      [Chain.Bitcoin]: () => new RpcServiceUtxo(chain),
      [Chain.BitcoinCash]: () => new RpcServiceUtxo(chain),
      [Chain.Litecoin]: () => new RpcServiceUtxo(chain),
      [Chain.Dash]: () => new RpcServiceUtxo(chain),
      [Chain.Dogecoin]: () => new RpcServiceUtxo(chain),
      [Chain.Avalanche]: () => new RpcServiceEvm(chain as EvmChain),
      [Chain.Sui]: () => new RpcServiceSui(chain),
      [Chain.Cosmos]: () => new RpcServiceGaia(),
      [Chain.Osmosis]: () => new RpcServiceOsmosis(),
      [Chain.Kujira]: () => new RpcServiceKujira(),
      [Chain.Dydx]: () => new RpcServiceDydx(),
      [Chain.Ton]: () => new RpcServiceTon(chain),
      [Chain.Terra]: () => new RpcServiceTerraV2(),
      [Chain.TerraClassic]: () => new RpcServiceTerraClassic(),
      [Chain.Noble]: () => new RpcServiceNoble(),
    });
  }
}
