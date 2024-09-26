import { storage } from '../../../wailsjs/go/models';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
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

        await Promise.all(
          tokens.map(async token =>
            convertedTokens.push(
              await super.createCoin(
                token,
                vault.public_key_ecdsa,
                vault.public_key_eddsa,
                vault.hex_chain_code
              )
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
