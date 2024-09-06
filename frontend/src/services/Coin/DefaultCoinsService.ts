import { WalletCore } from '@trustwallet/wallet-core/dist/src/wallet-core';
import { CoinServiceFactory } from './CoinServiceFactory';
import { storage } from '../../../wailsjs/go/models';
import { TokensStore } from './CoinList';

export class DefaultCoinsService {
  private defaultTokens = [
    TokensStore.Token.bitcoin,
    TokensStore.Token.ethereum,
    TokensStore.Token.bscChainBnb,
    TokensStore.Token.solana,
    TokensStore.Token.thorChain,
  ];
  private walletCore: WalletCore;
  constructor(walletCore: WalletCore) {
    this.walletCore = walletCore;
  }

  applyDefaultCoins(vault: storage.Vault) {
    this.defaultTokens.forEach(token => {
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
          coinService.saveCoin(coin, vault.public_key_ecdsa || '');
        });
    });
  }
}
