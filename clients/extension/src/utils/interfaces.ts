import { Currency, Language } from "./constants";
import { TransactionResponse } from "ethers";
import { ThorchainProviderMethod } from "../types/thorchain";
import { ThorchainProviderResponse } from "../types/thorchain";
import { ChainKey, ChainProps } from "@core/chain-utils";

export namespace Messaging {
  export namespace Chain {
    export type Request = { method: string; params: Record<string, any>[] };
    export type Response =
      | string
      | string[]
      | ThorchainProviderResponse<ThorchainProviderMethod>
      | TransactionResponse;
  }

  export namespace GetVaults {
    export type Request = any;
    export type Response = VaultProps[];
  }

  export namespace SetPriority {
    export type Request = { priority?: boolean };
    export type Response = any;
  }
}

export interface AccountsProps {
  chain: ChainKey;
  sender: string;
}

export interface CurrencyRef {
  [Currency.AUD]: string;
  [Currency.CAD]: string;
  [Currency.CNY]: string;
  [Currency.EUR]: string;
  [Currency.GBP]: string;
  [Currency.JPY]: string;
  [Currency.RUB]: string;
  [Currency.SEK]: string;
  [Currency.SGD]: string;
  [Currency.USD]: string;
}

export interface CustomMessage {
  address: string;
  message: string;
}

export interface SignatureProps {
  Msg: string;
  R: string;
  S: string;
  DerSignature: string;
  RecoveryID: string;
}

export interface LanguageRef {
  [Language.CROATIA]: string;
  [Language.DUTCH]: string;
  [Language.ENGLISH]: string;
  [Language.GERMAN]: string;
  [Language.ITALIAN]: string;
  [Language.PORTUGUESE]: string;
  [Language.RUSSIAN]: string;
  [Language.SPANISH]: string;
}

export interface ScreenProps {
  height: number;
  width: number;
}

export namespace ITransaction {
  export interface CTRL {
    amount: {
      amount: number;
      decimals: number;
    };
    // asset: {
    //   chain: string;
    //   symbol: string;
    //   ticker: string;
    // };
    from: string;
    gasLimit?: string;
    memo: string;
    recipient: string;
  }

  export interface METAMASK {
    chain: ChainProps;
    contract?: string;
    customMessage?: CustomMessage;
    customSignature?: string;
    data: string;
    from: string;
    id: string;
    status: "default" | "error" | "pending" | "success";
    memo?: string;
    to: string;
    value?: string;
    gas?: string;
    gasLimit?: string;
    gasPrice?: string;
    isDeposit?: boolean;
    isCustomMessage?: boolean;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    txHash?: string;
    windowId?: number;
    raw?: any;
  }
}

export interface VaultProps {
  active?: boolean;
  apps?: string[];
  chains: ChainProps[];
  hexChainCode: string;
  name: string;
  publicKeyEcdsa: string;
  publicKeyEddsa: string;
  selected?: boolean;
  transactions: ITransaction.METAMASK[];
  uid: string;
}

export interface ParsedMemo {
  signature: string;
  inputs: string;
}

export interface ThorchainAccountDataResponse {
  address: string;
  publicKey: {
    type: string;
    value: string;
  };
  accountNumber: string;
  sequence: string;
}

export interface MayaAccountDataResponse {
  address: string;
  publicKey: {
    type: string;
    value: string;
  };
  accountNumber: string;
  sequence: string;
}

export interface BaseSpecificTransactionInfo {
  gasPrice: number;
  fee: number;
}

export interface SpecificThorchain extends BaseSpecificTransactionInfo {
  accountNumber: number;
  sequence: number;
  isDeposit: boolean;
}

export interface SpecificCosmos extends BaseSpecificTransactionInfo {
  accountNumber: number;
  sequence: number;
  gas: number;
  transactionType: number;
}

export interface SpecificThorchain {
  fee: number;
  gasPrice: number;
  accountNumber: number;
  sequence: number;
  isDeposit: boolean;
}

export interface CosmosAccountData {
  accountNumber: string;
  sequence: string;
}

export interface CosmosAccountDataResponse {
  account: CosmosAccountData;
}

export interface SignedTransaction {
  inputData?: Uint8Array;
  signature: SignatureProps;
  transaction?: ITransaction.METAMASK;
  vault?: VaultProps;
}

export interface SpecificUtxoInfo {
  hash: string;
  amount: bigint;
  index: number;
}

export interface SpecificUtxo extends BaseSpecificTransactionInfo {
  byteFee: number;
  sendMaxAmount: boolean;
  utxos: SpecificUtxoInfo[];
}

export interface SpecificSolana extends BaseSpecificTransactionInfo {
  recentBlockHash: string;
  priorityFee: number;
  fromAddressPubKey: string | undefined;
  toAddressPubKey: string | undefined;
}

export interface FastSignInput {
  public_key: string;
  messages: string[];
  session: string;
  hex_encryption_key: string;
  derive_path: string;
  is_ecdsa: boolean;
  vault_password: string;
}
