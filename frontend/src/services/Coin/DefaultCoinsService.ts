import { WalletCore } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { storage } from '../../../wailsjs/go/models';
import { TokensStore } from './CoinList';
import { CoinServiceFactory } from './CoinServiceFactory';

export class DefaultCoinsService {
  private walletCore: WalletCore;
  private defaultTokens = [
    TokensStore.Token.bitcoin,
    TokensStore.Token.bscChainBnb,
    TokensStore.Token.ethereum,
    TokensStore.Token.solana,
    TokensStore.Token.thorChain,
  ];

  constructor(walletCore: WalletCore) {
    this.walletCore = walletCore;
  }

  applyDefaultCoins(vault: storage.Vault, defaultChains: string[]) {
    let defaultTokens = defaultChains
      .map(chain => {
        return Object.entries(TokensStore.Token)
          .filter(([_, getToken]) => {
            const token = getToken();
            return (
              token.chain.toLowerCase() === chain.toLowerCase() &&
              token.isNativeToken === true
            );
          })
          .map(([_, getToken]) => getToken);
      })
      .flat()
      .sort((a, b) => a().chain.localeCompare(b().chain));

    if (defaultTokens.length === 0) {
      defaultTokens = this.defaultTokens;
    }

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
