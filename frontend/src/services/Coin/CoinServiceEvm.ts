import { storage } from '../../../wailsjs/go/models';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { IRpcService } from '../Rpc/IRpcService';
import { RpcServiceFactory } from '../Rpc/RpcServiceFactory';
import { ITokenService } from '../Tokens/ITokenService';
import { CoinService } from './CoinService';
import { ICoinService } from './ICoinService';

export class CoinServiceEvm extends CoinService implements ICoinService {
  async saveCoin(coin: Coin, vault: storage.Vault): Promise<void> {
    try {
      const convertedTokens: Coin[] = [];
      convertedTokens.push(coin);

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
      console.log('save coin error: ', error);
    }
  }
}
