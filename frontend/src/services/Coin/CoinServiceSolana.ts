import { storage } from '../../../wailsjs/go/models';
import { createCoin } from '../../coin/utils/createCoin';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../model/chain';
import { getVaultPublicKey } from '../../vault/publicKey/getVaultPublicKey';
import { IRpcService } from '../Rpc/IRpcService';
import { RpcServiceFactory } from '../Rpc/RpcServiceFactory';
import { ITokenService } from '../Tokens/ITokenService';
import { CoinService } from './CoinService';
import { ICoinService } from './ICoinService';

export class CoinServiceSolana extends CoinService implements ICoinService {
  async saveTokens(coin: Coin, vault: storage.Vault): Promise<void> {
    return this.saveCoins(coin, vault, true);
  }

  async saveCoin(coin: Coin, vault: storage.Vault): Promise<void> {
    return this.saveCoins(coin, vault, false);
  }

  async saveCoins(
    coin: Coin,
    vault: storage.Vault,
    isToken: boolean
  ): Promise<void> {
    try {
      const convertedTokens: Coin[] = [];

      if (!isToken) {
        convertedTokens.push(coin);
      }
      if (coin.isNativeToken) {
        const factory = RpcServiceFactory.createRpcService(
          this.chain
        ) as IRpcService & ITokenService;
        const tokens = await factory.getTokens(coin);

        const publicKey = await getVaultPublicKey({
          vault,
          chain: coin.chain as Chain,
          walletCore: this.walletCore,
        });

        await Promise.all(
          tokens.map(async token =>
            convertedTokens.push(
              createCoin({
                coinMeta: token,
                publicKey,
                walletCore: this.walletCore,
              })
            )
          )
        );
      }

      for (const token of convertedTokens) {
        await super.saveCoin(token, vault);
      }
    } catch (error) {
      console.error('save coin error: ', error);
    }
  }
}
