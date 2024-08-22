import { Coin } from '../gen/vultisig/keysign/v1/coin_pb';

export interface ISendTransaction {
  fromAddress: string;
  toAddress: string;
  amount: number;
  amountInFiat: number;
  memo: string;
  gas: number;
  sendMaxAmount: boolean;
  coin: Coin;
  transactionType: string; // Used for deposits
}
