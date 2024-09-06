export type SpecificGasInfo =
  | BasicGasInfo
  | SpecificEvm
  | SpecificCosmos
  | SpecificPolkadot
  | SpecificSolana
  | SpecificSui
  | SpecificThorchain
  | SpecificUtxo;

export interface BasicGasInfo {
  gasPrice: number;
  fee: number;
}

export interface SpecificEvm extends BasicGasInfo {
  gasPrice: number;
  priorityFee: number;
  nonce: number;
}

export interface SpecificThorchain extends BasicGasInfo {
  accountNumber: number;
  sequence: number;
  isDeposit: boolean;
}

export interface SpecificUtxo extends BasicGasInfo {
  byteFee: number;
  sendMaxAmount: boolean;
  utxos: SpecificUtxoInfo[];
}

export interface SpecificUtxoInfo {
  hash: string;
  amount: bigint;
  index: number;
}

export interface SpecificCosmos extends BasicGasInfo {
  accountNumber: number;
  sequence: number;
  gas: number;
  transactionType: number;
}

export interface SpecificSolana extends BasicGasInfo {
  recentBlockHash: string;
  priorityFee: number;
  fromAddressPubKey: string | undefined;
  toAddressPubKey: string | undefined;
}

export interface SpecificSui extends BasicGasInfo {
  referenceGasPrice: number;
  coins: Map<string, string>[];
}

export interface SpecificPolkadot extends BasicGasInfo {
  recentBlockHash: string;
  nonce: number;
  currentBlockNumber: number;
  specVersion: number;
  transactionVersion: number;
  genesisHash: string;
}
