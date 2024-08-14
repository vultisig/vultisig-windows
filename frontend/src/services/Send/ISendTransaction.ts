import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';

export interface ISendTransaction {
  fromAddress: string;
  toAddress: string;
  amount: string;
  amountInFiat: string;
  memo: string;
  gas: string;
  sendMaxAmount: boolean;
  coin: Coin;
  transactionType: string; // Used for deposits
}
