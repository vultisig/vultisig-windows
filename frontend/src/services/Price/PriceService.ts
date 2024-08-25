import { WalletCore } from '@trustwallet/wallet-core';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../model/chain';
import { Rate } from '../../model/price-rate';
import { IPriceService } from './IPriceService';

export class PriceService implements IPriceService {
  chain: Chain;
  walletCore: WalletCore;

  constructor(chain: Chain, walletCore: WalletCore) {
    this.chain = chain;
    this.walletCore = walletCore;
  }

  getPriceRates(coin: Coin): Promise<Map<Coin, Rate>> {
    throw new Error('Method not implemented.', coin);
  }

  getPriceProviderId(coin: Coin): string {
    return coin.priceProviderId;
  }
}
