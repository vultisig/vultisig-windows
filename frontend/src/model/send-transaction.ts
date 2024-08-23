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

export function getDefaultSendTransaction(): ISendTransaction {
  return {
    fromAddress: '',
    toAddress: '',
    amount: 0,
    amountInFiat: 0,
    memo: '',
    gas: 0,
    sendMaxAmount: false,
    coin: new Coin(),
    transactionType: '',
  };
}
