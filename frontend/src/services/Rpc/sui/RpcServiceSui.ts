import { SuiCoin } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';
import { RpcService } from '../RpcService';

export class RpcServiceSui extends RpcService implements IRpcService {
  async calculateFee(_coin: Coin): Promise<number> {
    return await this.getReferenceGasPrice();
  }

  async broadcastTransaction(obj: string): Promise<string> {
    const objParsed = JSON.parse(obj);

    const result = await this.callRPC('sui_executeTransactionBlock', [
      objParsed.unsignedTransaction,
      [objParsed.signature],
    ]);

    return result.digest;
  }

  async getBalance(coin: Coin): Promise<string> {
    const result = await this.callRPC('suix_getBalance', [coin.address]);
    return result.totalBalance;
  }

  private async getReferenceGasPrice(): Promise<number> {
    const result = await this.callRPC('suix_getReferenceGasPrice', []);
    return Number(result);
  }

  async getAllCoins(coin: Coin): Promise<SuiCoin[]> {
    const result = await this.callRPC('suix_getAllCoins', [coin.address]);
    const rawCoins = result.data as SuiCoin[];
    const suiCoins: SuiCoin[] = rawCoins
      .filter(f => f.coinType == '0x2::sui::SUI')
      .map((coin: SuiCoin) => {
        const suiCoin = new SuiCoin();
        suiCoin.balance = coin.balance;
        suiCoin.coinType = coin.coinType;
        suiCoin.coinObjectId = coin.coinObjectId;
        suiCoin.digest = coin.digest;
        suiCoin.version = coin.version;
        suiCoin.previousTransaction = coin.previousTransaction;

        return suiCoin;
      });
    return suiCoins;
  }

  private async callRPC(method: string, params: any[]): Promise<any> {
    return await super.callRpc(Endpoint.suiServiceRpc, method, params);
  }
}
