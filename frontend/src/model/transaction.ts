import { KeysignChainSpecific } from '../chain/keysign/KeysignChainSpecific';
import { Coin } from '../gen/vultisig/keysign/v1/coin_pb';
import { Erc20ApprovePayload } from '../gen/vultisig/keysign/v1/erc20_approve_payload_pb';
import { THORChainSwapPayload } from '../gen/vultisig/keysign/v1/thorchain_swap_payload_pb';

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
  chainSpecific: KeysignChainSpecific;
}

export interface ISendTransaction extends ITransaction {
  sendMaxAmount: boolean;
  transactionType: TransactionType.SEND;
}

export interface IDepositTransactionBase {
  fromAddress: string;
  toAddress?: string;
  memo: string;
  coin: Coin;
  chainSpecific: KeysignChainSpecific;
  transactionType: TransactionType.DEPOSIT;
  amount?: number;
}

export interface IDepositTransactionBond extends IDepositTransactionBase {
  toAddress: string;
  amount: number;
}

export interface IDepositTransactionLeave extends IDepositTransactionBase {
  toAddress: string;
  amount?: number;
}

export interface IDepositTransactionAddPool extends IDepositTransactionBase {
  amount: number;
}

export interface IDepositTransactionWithdrawPool
  extends IDepositTransactionBase {
  percentage: number;
  affiliateFee?: number;
}

export type IDepositTransactionVariant =
  | IDepositTransactionBond
  | IDepositTransactionLeave
  | IDepositTransactionAddPool
  | IDepositTransactionWithdrawPool;

export enum SwapPayloadType {
  MAYA = 'mayachainSwapPayload',
  THORCHAIN = 'thorchainSwapPayload',
  ONE_INCH = 'oneinchSwapPayload',
}

export type SwapPayload = {
  value: THORChainSwapPayload;
  case: SwapPayloadType;
};

export interface ISwapTransaction extends ITransaction {
  transactionType: TransactionType.SWAP;
  sendMaxAmount: boolean;
  swapPayload: SwapPayload;
  erc20ApprovePayload?: Erc20ApprovePayload;
}
