/* eslint-disable */
import { SuiCoin } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { SpecificSui } from '../../../model/specific-transaction-info';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';
import { RpcService } from '../RpcService';

export class RpcServiceSui extends RpcService implements IRpcService {
  async calculateFee(_coin: Coin): Promise<number> {
    return await this.getReferenceGasPrice();
  }

  async sendTransaction(encodedTransaction: string): Promise<string> {
    return await this.broadcastTransaction(encodedTransaction);
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

  async getSpecificTransactionInfo(coin: Coin): Promise<SpecificSui> {
    console.log('getSpecificTransactionInfo::coin', coin);

    const gasPrice = await this.calculateFee(coin);

    console.log('getSpecificTransactionInfo::gasPrice', gasPrice);

    const allCoins = await this.getAllCoins(coin);

    console.log('getSpecificTransactionInfo::allCoins', allCoins);

    const specificTransactionInfo: SpecificSui = {
      gasPrice: gasPrice,
      referenceGasPrice: gasPrice,
      coins: allCoins,
    } as SpecificSui;

    console.log(
      'getSpecificTransactionInfo::specificTransactionInfo',
      specificTransactionInfo
    );

    return specificTransactionInfo;
  }

  private async getReferenceGasPrice(): Promise<number> {
    const result = await this.callRPC('suix_getReferenceGasPrice', []);
    return result;
  }

  private async getAllCoins(coin: Coin): Promise<SuiCoin[]> {
    const result = await this.callRPC('suix_getAllCoins', [coin.address]);
    const rawCoins = result.data as SuiCoin[];
    const suiCoins: SuiCoin[] = rawCoins.filter(
      f => f.coinType == '0x2::sui::SUI'
    );
    return suiCoins;
  }

  private async callRPC(method: string, params: any[]): Promise<any> {
    return await super.callRpc(Endpoint.suiServiceRpc, method, params);
  }
}
