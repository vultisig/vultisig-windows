import { Chain } from '../../model/chain';
import { PriceService } from './PriceService';
import { IPriceService } from './IPriceService';
import { WalletCore } from '@trustwallet/wallet-core';
import { PriceServiceEvm } from './PriceServiceEvm';

export class PriceServiceFactory {
  static createPriceService(
    chain: Chain,
    walletCore: WalletCore
  ): IPriceService {
    switch (chain) {
      case Chain.Solana:
        return new PriceService(chain, walletCore);
      case Chain.Polkadot:
        return new PriceService(chain, walletCore);
      case Chain.Ethereum:
        return new PriceServiceEvm(chain, walletCore);
      case Chain.Optimism:
        return new PriceServiceEvm(chain, walletCore);
      case Chain.Polygon:
        return new PriceServiceEvm(chain, walletCore);
      case Chain.Arbitrum:
        return new PriceServiceEvm(chain, walletCore);
      case Chain.Blast:
        return new PriceServiceEvm(chain, walletCore);
      case Chain.Base:
        return new PriceServiceEvm(chain, walletCore);
      case Chain.CronosChain:
        return new PriceServiceEvm(chain, walletCore);
      case Chain.BSC:
        return new PriceServiceEvm(chain, walletCore);
      case Chain.ZkSync:
        return new PriceServiceEvm(chain, walletCore);
      case Chain.Avalanche:
        return new PriceServiceEvm(chain, walletCore);
      case Chain.THORChain:
        return new PriceService(chain, walletCore);
      case Chain.MayaChain:
        return new PriceService(chain, walletCore);
      case Chain.Bitcoin:
        return new PriceService(chain, walletCore);
      case Chain.BitcoinCash:
        return new PriceService(chain, walletCore);
      case Chain.Litecoin:
        return new PriceService(chain, walletCore);
      case Chain.Dash:
        return new PriceService(chain, walletCore);
      case Chain.Dogecoin:
        return new PriceService(chain, walletCore);
      case Chain.Sui:
        return new PriceService(chain, walletCore);
      case Chain.Gaia:
        return new PriceService(chain, walletCore);
      case Chain.Kujira:
        return new PriceService(chain, walletCore);
      case Chain.Dydx:
        return new PriceService(chain, walletCore);
      default:
        throw new Error(`Chain not supported ${chain}`);
    }
  }
}
