import { Chain } from '../../model/chain';
import { BalanceService } from './BalanceService';
import { BalanceServiceEvm } from './evm/BalanceServiceEvm';

export class BalanceServiceFactory {
  static createBalanceService(chain: Chain) {
    switch (chain) {
      case (Chain.Ethereum,
      Chain.Optimism,
      Chain.Polygon,
      Chain.Arbitrum,
      Chain.Blast,
      Chain.CronosChain,
      Chain.BSC,
      Chain.ZkSync,
      Chain.Base,
      Chain.Optimism):
        return new BalanceServiceEvm(chain);
      default:
        return new BalanceService(chain);
    }
  }
}
