import { WalletCore } from '@trustwallet/wallet-core';

import { Chain } from '../../model/chain';
import { CoinService } from './CoinService';
import { CoinServiceEvm } from './CoinServiceEvm';
import { CoinServiceSolana } from './CoinServiceSolana';
import { ICoinService } from './ICoinService';

export class CoinServiceFactory {
  static createCoinService(chain: Chain, walletCore: WalletCore): ICoinService {
    switch (chain) {
      case Chain.Solana:
        return new CoinServiceSolana(chain, walletCore);
      case Chain.Avalanche:
        return new CoinServiceEvm(chain, walletCore);
      case Chain.Ethereum:
        return new CoinServiceEvm(chain, walletCore);
      case Chain.Optimism:
        return new CoinServiceEvm(chain, walletCore);
      case Chain.Polygon:
        return new CoinServiceEvm(chain, walletCore);
      case Chain.Arbitrum:
        return new CoinServiceEvm(chain, walletCore);
      case Chain.Blast:
        return new CoinServiceEvm(chain, walletCore);
      case Chain.Base:
        return new CoinServiceEvm(chain, walletCore);
      case Chain.CronosChain:
        return new CoinServiceEvm(chain, walletCore);
      case Chain.BSC:
        return new CoinServiceEvm(chain, walletCore);
      case Chain.ZkSync:
        return new CoinServiceEvm(chain, walletCore);
      case Chain.Polkadot:
        return new CoinService(chain, walletCore);
      case Chain.THORChain:
        return new CoinService(chain, walletCore);
      case Chain.MayaChain:
        return new CoinService(chain, walletCore);
      case Chain.Bitcoin:
        return new CoinService(chain, walletCore);
      case Chain.BitcoinCash:
        return new CoinService(chain, walletCore);
      case Chain.Litecoin:
        return new CoinService(chain, walletCore);
      case Chain.Dash:
        return new CoinService(chain, walletCore);
      case Chain.Dogecoin:
        return new CoinService(chain, walletCore);
      case Chain.Sui:
        return new CoinService(chain, walletCore);
      case Chain.Gaia:
        return new CoinService(chain, walletCore);
      case Chain.Kujira:
        return new CoinService(chain, walletCore);
      case Chain.Dydx:
        return new CoinService(chain, walletCore);
      default:
        throw new Error(`Chain not supported ${chain}`);
    }
  }
}
