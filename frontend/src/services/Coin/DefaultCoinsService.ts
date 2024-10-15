import { WalletCore } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { storage } from '../../../wailsjs/go/models';
import { TokensStore } from './CoinList';
import { CoinServiceFactory } from './CoinServiceFactory';

export class DefaultCoinsService {
  private walletCore: WalletCore;
  constructor(walletCore: WalletCore) {
    this.walletCore = walletCore;
  }

  applyDefaultCoins(vault: storage.Vault, defaultChains: string[]) {
    const defaultTokens = defaultChains
      .map(chain => {
        return Object.entries(TokensStore.Token)
          .filter(
            ([_, getToken]) =>
              getToken().chain.toLowerCase() === chain.toLowerCase()
          )
          .map(([_, getToken]) => getToken);
      })
      .flat();

    defaultTokens.forEach(token => {
      const coinService = CoinServiceFactory.createCoinService(
        token().chain,
        this.walletCore
      );
      coinService
        .createCoin(
          token(),
          vault.public_key_ecdsa || '',
          vault.public_key_eddsa || '',
          vault.hex_chain_code || ''
        )
        .then(coin => {
          coinService.saveCoin(coin, vault);
        });
    });
  }
}
