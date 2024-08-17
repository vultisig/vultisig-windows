import { WalletCore } from '@trustwallet/wallet-core';
import { Chain } from '../../model/chain';
import { CoinService } from './CoinService';
import { ICoinService } from './ICoinService';

export class CoinServiceFactory {
  static createCoinService(chain: Chain, walletCore: WalletCore): ICoinService {
    return new CoinService(chain, walletCore);
  }
}
