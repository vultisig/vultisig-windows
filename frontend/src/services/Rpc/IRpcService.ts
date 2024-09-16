import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { FeeMode } from '../../model/evm-fee-mode';
import { SpecificTransactionInfo } from '../../model/specific-transaction-info';

export interface IRpcService {
  // Common methods
  sendTransaction(encodedTransaction: string): Promise<string>;
  getBalance(coin: Coin): Promise<string>;
  broadcastTransaction(hex: string): Promise<string>;
  resolveENS?(ensName: string): Promise<string>;
  getSpecificTransactionInfo(coin: Coin, feeMode?: FeeMode): Promise<SpecificTransactionInfo>;
  calculateFee(coin?: Coin): Promise<number>;
}
