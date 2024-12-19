import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { SpecificTransactionInfo } from '../../model/specific-transaction-info';

export interface IRpcService {
  // Common methods
  sendTransaction(encodedTransaction: string): Promise<string>;
  getBalance(coin: Coin): Promise<string>;
  broadcastTransaction(hex: string): Promise<string>;
  resolveENS?(ensName: string): Promise<string>;
  getSpecificTransactionInfo(
    coin: Coin,
    receiver: string,
    feeSettings?: any
  ): Promise<SpecificTransactionInfo>;
}
