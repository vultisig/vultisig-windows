import { match } from '../../lib/utils/match';
import { Chain, getChainKind } from '../../model/chain';
import { IPriceService } from './IPriceService';
import { PriceService } from './PriceService';
import { PriceServiceCosmos } from './PriceServiceCosmos';
import { PriceServiceEvm } from './PriceServiceEvm';
import { PriceServiceSolana } from './PriceServiceSolana';

export class PriceServiceFactory {
  static createPriceService(chain: Chain): IPriceService {
    const chainKind = getChainKind(chain);

    return match(chainKind, {
      solana: () => new PriceServiceSolana(chain),
      cosmos: () => new PriceServiceCosmos(chain),
      evm: () => new PriceServiceEvm(chain),
      utxo: () => new PriceService(chain),
      polkadot: () => new PriceService(chain),
      ripple: () => new PriceService(chain),
      sui: () => new PriceService(chain),
      ton: () => new PriceService(chain),
    });
  }
}
