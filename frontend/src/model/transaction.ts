import { Coin } from '../gen/vultisig/keysign/v1/coin_pb';
import { SpecificTransactionInfo } from './specific-transaction-info';

export enum TransactionType {
  SEND = 'send',
  SWAP = 'swap',
  DEPOSIT = 'deposit',
  VOTE = 'vote',
}

export interface ITransaction {
  fromAddress: string;
  toAddress: string;
  amount: number;
  memo: string;
  coin: Coin;
  transactionType: TransactionType;
  specificTransactionInfo?: SpecificTransactionInfo;
}

export interface ISendTransaction extends ITransaction {
  sendMaxAmount: boolean;
  transactionType: TransactionType.SEND;
}

// TODO: We will need to add more fields to this interface
export interface ISwapTransaction extends ITransaction {
  transactionType: TransactionType.SWAP;
  sendMaxAmount: boolean;
}

export function getDefaultSendTransaction(): ISendTransaction {
  return {
    fromAddress: '',
    toAddress: '',
    amount: 0,
    memo: '',
    sendMaxAmount: false,
    coin: new Coin(),
    transactionType: TransactionType.SEND,
    specificTransactionInfo: undefined,
  };
}

export function getDefaultSwapTransaction(): ISwapTransaction {
  return {
    fromAddress: '',
    toAddress: '',
    amount: 0,
    memo: '',
    transactionType: TransactionType.SWAP,
    specificTransactionInfo: undefined,
    sendMaxAmount: false,
    coin: new Coin(),
  };
}
