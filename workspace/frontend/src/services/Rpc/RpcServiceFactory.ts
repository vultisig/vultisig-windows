import { match } from '../../lib/utils/match';
import { Chain, EvmChain } from '../../model/chain';
import { RpcServiceCosmos } from './cosmos/RpcServiceCosmos';
import { RpcServiceEvm } from './evm/RpcServiceEvm';
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
      [Chain.Polkadot]: () => new RpcServicePolkadot(),
      [Chain.Ethereum]: () => new RpcServiceEvm(chain as EvmChain),
      [Chain.Optimism]: () => new RpcServiceEvm(chain as EvmChain),
      [Chain.Polygon]: () => new RpcServiceEvm(chain as EvmChain),
      [Chain.Arbitrum]: () => new RpcServiceEvm(chain as EvmChain),
      [Chain.Blast]: () => new RpcServiceEvm(chain as EvmChain),
      [Chain.Base]: () => new RpcServiceEvm(chain as EvmChain),
      [Chain.CronosChain]: () => new RpcServiceEvm(chain as EvmChain),
      [Chain.BSC]: () => new RpcServiceEvm(chain as EvmChain),
      [Chain.Zksync]: () => new RpcServiceEvm(chain as EvmChain),
      [Chain.THORChain]: () => new RpcServiceThorchain(),
      [Chain.MayaChain]: () => new RpcServiceMaya(),
      [Chain.Bitcoin]: () => new RpcServiceUtxo(),
      [Chain.BitcoinCash]: () => new RpcServiceUtxo(),
      [Chain.Litecoin]: () => new RpcServiceUtxo(),
      [Chain.Dash]: () => new RpcServiceUtxo(),
      [Chain.Dogecoin]: () => new RpcServiceUtxo(),
      [Chain.Avalanche]: () => new RpcServiceEvm(chain as EvmChain),
      [Chain.Sui]: () => new RpcServiceSui(),
      [Chain.Cosmos]: () => new RpcServiceCosmos(Chain.Cosmos),
      [Chain.Osmosis]: () => new RpcServiceCosmos(Chain.Osmosis),
      [Chain.Kujira]: () => new RpcServiceCosmos(Chain.Kujira),
      [Chain.Dydx]: () => new RpcServiceCosmos(Chain.Dydx),
      [Chain.Ton]: () => new RpcServiceTon(),
      [Chain.Terra]: () => new RpcServiceTerraV2(Chain.Terra),
      [Chain.TerraClassic]: () =>
        new RpcServiceTerraClassic(Chain.TerraClassic),
      [Chain.Noble]: () => new RpcServiceCosmos(Chain.Noble),
      [Chain.Ripple]: () => new RpcServiceRipple(),
      [Chain.Akash]: () => new RpcServiceCosmos(Chain.Akash),
    });
  }
}
