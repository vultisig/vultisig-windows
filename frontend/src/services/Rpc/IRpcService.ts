import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';

export interface IRpcService {
  sendTransaction(encodedTransaction: string): Promise<string>;
  getBalance(coin: Coin): Promise<string>;
  broadcastTransaction(hex: string): Promise<string>;
  resolveENS?(ensName: string): Promise<string>;
}
