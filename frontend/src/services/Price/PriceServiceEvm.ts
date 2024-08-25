import { WalletCore } from '@trustwallet/wallet-core';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../model/chain';
import { IPriceService } from './IPriceService';
import { PriceService } from './PriceService';
import { Rate } from '../../model/price-rate';

export class PriceServiceEvm extends PriceService implements IPriceService {
  chain: Chain;
  walletCore: WalletCore;

  constructor(chain: Chain, walletCore: WalletCore) {
    super(chain, walletCore);
    this.chain = chain;
    this.walletCore = walletCore;
  }

  getPriceRates(coin: Coin): Promise<Map<Coin, Rate>> {
    console.log('Fetching price rates for coin', coin);
    throw new Error('Method not implemented.');
  }

  getPriceProviderId(coin: Coin): string {
    if (coin.isNativeToken) {
      return coin.priceProviderId;
    } else {
      return coin.contractAddress;
    }
  }
}
