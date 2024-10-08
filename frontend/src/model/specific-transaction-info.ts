export type SpecificTransactionInfo =
  | BasicSpecificTransactionInfo
  | SpecificEvm
  | SpecificCosmos
  | SpecificPolkadot
  | SpecificSolana
  | SpecificSui
  | SpecificThorchain
  | SpecificUtxo;

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
  coins: Map<string, string>[];
}

export interface SpecificPolkadot extends BasicSpecificTransactionInfo {
  recentBlockHash: string;
  nonce: number;
  currentBlockNumber: number;
  specVersion: number;
  transactionVersion: number;
  genesisHash: string;
}
