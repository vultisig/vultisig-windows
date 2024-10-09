/* eslint-disable */
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { SpecificTransactionInfo } from '../../../model/specific-transaction-info';
import { IRpcService } from '../IRpcService';

export class RpcServiceSui implements IRpcService {
  calculateFee(coin: Coin): Promise<number> {
    throw new Error('Method not implemented.');
  }
  sendTransaction(encodedTransaction: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  getBalance(coin: Coin): Promise<string> {
    throw new Error('Method not implemented.');
  }
  broadcastTransaction(hex: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  resolveENS?(ensName: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  getSpecificTransactionInfo(coin: Coin): Promise<SpecificTransactionInfo> {
    throw new Error('Method not implemented.');
  }
}
