import { WalletCore } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { storage } from '../../../wailsjs/go/models';
import { getVaultPublicKey } from '../../vault/publicKey/getVaultPublicKey';
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

  async applyDefaultCoins(vault: storage.Vault, defaultChains: string[]) {
    const normalizedChains = new Set(
      defaultChains.map(chain => chain.toLowerCase())
    );

    let defaultTokens = Object.values(TokensStore.Token)
      .map(getToken => getToken())
      .filter(
        token =>
          normalizedChains.has(token.chain.toLowerCase()) && token.isNativeToken
      )
      .sort((a, b) => a.chain.localeCompare(b.chain));

    if (defaultTokens.length === 0) {
      defaultTokens = this.defaultTokens.map(getToken => getToken());
    }

    await Promise.all(
      defaultTokens.map(async token => {
        const coinService = CoinServiceFactory.createCoinService(
          token.chain,
          this.walletCore
        );
        const coin = await coinService.createCoin(
          token,
          getVaultPublicKey({
            chain: token.chain,
            vault,
          })
        );
        await coinService.saveCoin(coin, vault);
      })
    );
  }
}
