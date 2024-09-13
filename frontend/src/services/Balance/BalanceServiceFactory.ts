import { Chain } from '../../model/chain';
import { BalanceService } from './BalanceService';
import { BalanceServiceThorchain } from './thorchain/BalanceServiceThorchain';
import { BalanceServiceEvm } from './evm/BalanceServiceEvm';
import { BalanceServiceSolana } from './solana/BalanceServiceSolana';
import { BalanceServiceUtxo } from './utxo/BalanceServiceUtxo';

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
      case Chain.THORChain:
        return new BalanceServiceThorchain(chain);
      case Chain.Bitcoin:
        return new BalanceServiceUtxo(chain);
      case Chain.Dogecoin:
        return new BalanceServiceUtxo(chain);
      case Chain.Litecoin:
        return new BalanceServiceUtxo(chain);
      case Chain.BitcoinCash:
        return new BalanceServiceUtxo(chain);
      case Chain.Dash:
        return new BalanceServiceUtxo(chain);
      case Chain.Solana:
        return new BalanceServiceSolana(chain);
      default:
        return new BalanceService(chain);
    }
  }
}
