import { Coin } from '../gen/vultisig/keysign/v1/coin_pb';
import { SpecificGasInfo } from './gas-info';

export enum TransactionType {
  SEND = 'send',
  SWAP = 'swap',
  DEPOSIT = 'deposit',
}

export interface ITransaction {
  fromAddress: string;
  toAddress: string;
  amount: number;
  amountInFiat: number;
  memo: string;
  coin: Coin;
  transactionType: TransactionType;
  specificGasInfo?: SpecificGasInfo;
}

export interface ISendTransaction extends ITransaction {
  sendMaxAmount: boolean;
  transactionType: TransactionType.SEND;
}

// TODO: We will need to add more fields to this interface
export interface ISwapTransaction extends ITransaction {
  swapCoin: Coin; // The coin being swapped to
  slippage: number; // Allowed slippage percentage for the swap
  transactionType: TransactionType.SWAP;
}

export function getDefaultSendTransaction(): ISendTransaction {
  return {
    fromAddress: '',
    toAddress: '',
    amount: 0,
    amountInFiat: 0,
    memo: '',
    sendMaxAmount: false,
    coin: new Coin(),
    transactionType: TransactionType.SEND,
    specificGasInfo: undefined,
  };
}

export function getDefaultSwapTransaction(): ISwapTransaction {
  return {
    fromAddress: '',
    toAddress: '',
    amount: 0,
    amountInFiat: 0,
    memo: '',
    coin: new Coin(),
    swapCoin: new Coin(),
    slippage: 0,
    transactionType: TransactionType.SWAP,
    specificGasInfo: undefined,
  };
}