import { Chain } from '../../model/chain';
import { IPriceService } from './IPriceService';
import { PriceService } from './PriceService';
import { PriceServiceCosmos } from './PriceServiceCosmos';
import { PriceServiceEvm } from './PriceServiceEvm';
import { PriceServiceSolana } from './PriceServiceSolana';

export class PriceServiceFactory {
  static createPriceService(chain: Chain): IPriceService {
    switch (chain) {
      case Chain.Solana:
        return new PriceServiceSolana(chain);
      case Chain.Polkadot:
        return new PriceService(chain);
      case Chain.Ethereum:
        return new PriceServiceEvm(chain);
      case Chain.Optimism:
        return new PriceServiceEvm(chain);
      case Chain.Polygon:
        return new PriceServiceEvm(chain);
      case Chain.Arbitrum:
        return new PriceServiceEvm(chain);
      case Chain.Blast:
        return new PriceServiceEvm(chain);
      case Chain.Base:
        return new PriceServiceEvm(chain);
      case Chain.CronosChain:
        return new PriceServiceEvm(chain);
      case Chain.BSC:
        return new PriceServiceEvm(chain);
      case Chain.Zksync:
        return new PriceServiceEvm(chain);
      case Chain.Avalanche:
        return new PriceServiceEvm(chain);
      case Chain.THORChain:
        return new PriceService(chain);
      case Chain.MayaChain:
        return new PriceService(chain);
      case Chain.Bitcoin:
        return new PriceService(chain);
      case Chain.BitcoinCash:
        return new PriceService(chain);
      case Chain.Litecoin:
        return new PriceService(chain);
      case Chain.Dash:
        return new PriceService(chain);
      case Chain.Dogecoin:
        return new PriceService(chain);
      case Chain.Sui:
        return new PriceService(chain);
      case Chain.Cosmos:
        return new PriceServiceCosmos(chain);
      case Chain.Osmosis:
        return new PriceServiceCosmos(chain);
      case Chain.Kujira:
        return new PriceServiceCosmos(chain);
      case Chain.Dydx:
        return new PriceServiceCosmos(chain);
      case Chain.Terra:
        return new PriceServiceCosmos(chain);
      case Chain.TerraClassic:
        return new PriceServiceCosmos(chain);
      case Chain.Ton:
        return new PriceService(chain);
      default:
        throw new Error(`Chain not supported ${chain}`);
    }
  }
}
