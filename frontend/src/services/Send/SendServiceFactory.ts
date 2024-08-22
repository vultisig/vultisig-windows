import { Chain } from '../../model/chain';
import { SendServiceCosmos } from './cosmos/SendServiceCosmos';
import { SendServiceEvm } from './evm/SendServiceEvm';
import { SendService } from './SendService';
import { SendServiceSolana } from './solana/SendServiceSolana';
import { SendServiceThorchain } from './thorchain/SendServiceThorchain';
import { SendServiceUtxo } from './utxo/SendServiceUtxo';

export class SendServiceFactory {
  static createSendService(chain: Chain) {
    switch (chain) {
      case Chain.THORChain:
        return new SendServiceThorchain(chain);
      case Chain.MayaChain:
        return new SendServiceThorchain(chain);
      case Chain.Arbitrum:
        return new SendServiceEvm(chain);
      case Chain.Avalanche:
        return new SendServiceEvm(chain);
      case Chain.Base:
        return new SendServiceEvm(chain);
      case Chain.CronosChain:
        return new SendServiceEvm(chain);
      case Chain.BSC:
        return new SendServiceEvm(chain);
      case Chain.Blast:
        return new SendServiceEvm(chain);
      case Chain.Ethereum:
        return new SendServiceEvm(chain);
      case Chain.Optimism:
        return new SendServiceEvm(chain);
      case Chain.Polygon:
        return new SendServiceEvm(chain);
      case Chain.ZkSync:
        return new SendServiceEvm(chain);
      case Chain.Bitcoin:
        return new SendServiceUtxo(chain);
      case Chain.BitcoinCash:
        return new SendServiceUtxo(chain);
      case Chain.Litecoin:
        return new SendServiceUtxo(chain);
      case Chain.Dogecoin:
        return new SendServiceUtxo(chain);
      case Chain.Dash:
        return new SendServiceUtxo(chain);
      case Chain.Solana:
        return new SendServiceSolana(chain);
      case Chain.Sui:
        return new SendService(chain); // TODO: implement Sui
      case Chain.Gaia:
        return new SendServiceCosmos(chain);
      case Chain.Kujira:
        return new SendServiceCosmos(chain);
      case Chain.Dydx:
        return new SendServiceCosmos(chain);
      case Chain.Polkadot:
        return new SendService(chain); // TODO: implement Polkadot
      default:
        throw new Error('Chain not supported');
    }
  }
}
