import { match } from '../../lib/utils/match';
import { Chain, EvmChain } from '../../model/chain';
import { RpcServiceCosmos } from './cosmos/RpcServiceCosmos';
import { RpcServiceEvm } from './evm/RpcServiceEvm';
import { RpcServiceZksync } from './evm/RpcServiceZkSyncEvm';
import { IRpcService } from './IRpcService';
import { RpcServiceMaya } from './maya/RpcServiceMaya';
import { RpcServicePolkadot } from './polkadot/RpcServicePolkadot';
import { RpcServiceRipple } from './ripple/RpcServiceRipple';
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
      [Chain.Cosmos]: () => new RpcServiceCosmos(Chain.Cosmos),
      [Chain.Osmosis]: () => new RpcServiceCosmos(Chain.Osmosis),
      [Chain.Kujira]: () => new RpcServiceCosmos(Chain.Kujira),
      [Chain.Dydx]: () => new RpcServiceCosmos(Chain.Dydx),
      [Chain.Ton]: () => new RpcServiceTon(chain),
      [Chain.Terra]: () => new RpcServiceTerraV2(Chain.Terra),
      [Chain.TerraClassic]: () =>
        new RpcServiceTerraClassic(Chain.TerraClassic),
      [Chain.Noble]: () => new RpcServiceCosmos(Chain.Noble),
      [Chain.Ripple]: () => new RpcServiceRipple(chain),
    });
  }
}
