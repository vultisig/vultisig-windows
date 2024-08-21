import { Chain } from '../../model/chain';
import { BalanceService } from './BalanceService';
import { BalanceServiceEvm } from './evm/BalanceServiceEvm';

export class BalanceServiceFactory {
  static createBalanceService(chain: Chain) {
    switch (chain) {
      case Chain.Ethereum:
        return new BalanceServiceEvm(chain);
      case Chain.Optimism:
        return new BalanceServiceEvm(chain);
      case Chain.Polygon:
        return new BalanceServiceEvm(chain);
      case Chain.Arbitrum:
        return new BalanceServiceEvm(chain);
      case Chain.Blast:
        return new BalanceServiceEvm(chain);
      case Chain.CronosChain:
        return new BalanceServiceEvm(chain);
      case Chain.BSC:
        return new BalanceServiceEvm(chain);
      case Chain.ZkSync:
        return new BalanceServiceEvm(chain);
      case Chain.Base:
        return new BalanceServiceEvm(chain);
      default:
        return new BalanceService(chain);
    }
  }
}
