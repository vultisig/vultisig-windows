import { SuiCoin } from '../gen/vultisig/keysign/v1/blockchain_specific_pb';

export type SpecificTransactionInfo =
  | BasicSpecificTransactionInfo
  | SpecificEvm
  | SpecificCosmos
  | SpecificPolkadot
  | SpecificSolana
  | SpecificSui
  | SpecificThorchain
  | SpecificUtxo
  | SpecificTon
  | SpecificRipple;

export interface BasicSpecificTransactionInfo {
  gasPrice: number;
  fee: number;
}

export interface SpecificEvm extends BasicSpecificTransactionInfo {
  gasPrice: number;
  priorityFee: number;
  nonce: number;

  maxFeePerGasWei: number;
  priorityFeeWei: number;
  gasLimit: number;
}

export interface SpecificThorchain extends BasicSpecificTransactionInfo {
  accountNumber: number;
  sequence: number;
  isDeposit: boolean;
}

export interface SpecificUtxo extends BasicSpecificTransactionInfo {
  byteFee: number;
  sendMaxAmount: boolean;
  utxos: SpecificUtxoInfo[];
}

export interface SpecificUtxoInfo {
  hash: string;
  amount: bigint;
  index: number;
}

export interface SpecificCosmos extends BasicSpecificTransactionInfo {
  accountNumber: number;
  sequence: number;
  gas: number;
  transactionType: number;
}

export interface SpecificSolana extends BasicSpecificTransactionInfo {
  recentBlockHash: string;
  priorityFee: number;
  fromAddressPubKey: string | undefined;
  toAddressPubKey: string | undefined;
}

export interface SpecificSui extends BasicSpecificTransactionInfo {
  referenceGasPrice: number;
  coins: SuiCoin[];
}

export interface SpecificTon extends BasicSpecificTransactionInfo {
  sequenceNumber: number;
  expireAt: number;
  bounceable: boolean;
}

export interface SpecificPolkadot extends BasicSpecificTransactionInfo {
  recentBlockHash: string;
  nonce: number;
  currentBlockNumber: number;
  specVersion: number;
  transactionVersion: number;
  genesisHash: string;
}

export interface SpecificRipple extends BasicSpecificTransactionInfo {
  sequence: number;
}
