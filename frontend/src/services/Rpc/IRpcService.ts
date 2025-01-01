import { KeysignChainSpecific } from '../../chain/keysign/KeysignChainSpecific';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';

export type GetChainSpecificInput<T = any> = {
  coin: Coin;
  receiver?: string;
  feeSettings?: T;
  isDeposit?: boolean;
  sendMaxAmount?: boolean;
};

export interface IRpcService {
  sendTransaction(encodedTransaction: string): Promise<string>;
  getBalance(coin: Coin): Promise<string>;
  broadcastTransaction(hex: string): Promise<string>;
  resolveENS?(ensName: string): Promise<string>;
  getChainSpecific(input: GetChainSpecificInput): Promise<KeysignChainSpecific>;
}
