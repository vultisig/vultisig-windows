import { ChainKey, Currency, Language } from "utils/constants";
import { TransactionResponse } from "ethers";
import { ThorchainProviderMethod } from "types/thorchain";
import { ThorchainProviderResponse } from "types/thorchain";

export namespace Messaging {
  export namespace Chain {
    export type Request = { method: string; params: Record<string, any>[] };
    export type Response = string | string[] | ThorchainProviderResponse<ThorchainProviderMethod> | TransactionResponse
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

export interface ChainProps {
  active?: boolean;
  address?: string;
  cmcId: number;
  decimals: number;
  derivationKey?: string;
  id: string;
  name: ChainKey;
  ticker: string;
}

export interface ChainObjRef {
  [ChainKey.ARBITRUM]: ChainProps;
  [ChainKey.AVALANCHE]: ChainProps;
  [ChainKey.BASE]: ChainProps;
  [ChainKey.BITCOIN]: ChainProps;
  [ChainKey.BITCOINCASH]: ChainProps;
  [ChainKey.BLAST]: ChainProps;
  [ChainKey.BSCCHAIN]: ChainProps;
  [ChainKey.CRONOSCHAIN]: ChainProps;
  [ChainKey.DASH]: ChainProps;
  [ChainKey.DOGECOIN]: ChainProps;
  [ChainKey.DYDX]: ChainProps;
  [ChainKey.ETHEREUM]: ChainProps;
  [ChainKey.GAIACHAIN]: ChainProps;
  [ChainKey.KUJIRA]: ChainProps;
  [ChainKey.LITECOIN]: ChainProps;
  [ChainKey.MAYACHAIN]: ChainProps;
  [ChainKey.OPTIMISM]: ChainProps;
  [ChainKey.OSMOSIS]: ChainProps;
  [ChainKey.POLYGON]: ChainProps;
  [ChainKey.SOLANA]: ChainProps;
  [ChainKey.THORCHAIN]: ChainProps;
}

export interface ChainStrRef {
  [ChainKey.ARBITRUM]: string;
  [ChainKey.AVALANCHE]: string;
  [ChainKey.BASE]: string;
  [ChainKey.BITCOIN]: string;
  [ChainKey.BITCOINCASH]: string;
  [ChainKey.BLAST]: string;
  [ChainKey.BSCCHAIN]: string;
  [ChainKey.CRONOSCHAIN]: string;
  [ChainKey.DASH]: string;
  [ChainKey.DOGECOIN]: string;
  [ChainKey.DYDX]: string;
  [ChainKey.ETHEREUM]: string;
  [ChainKey.GAIACHAIN]: string;
  [ChainKey.KUJIRA]: string;
  [ChainKey.LITECOIN]: string;
  [ChainKey.MAYACHAIN]: string;
  [ChainKey.OPTIMISM]: string;
  [ChainKey.OSMOSIS]: string;
  [ChainKey.POLKADOT]: string;
  [ChainKey.POLYGON]: string;
  [ChainKey.SOLANA]: string;
  [ChainKey.SUI]: string;
  [ChainKey.THORCHAIN]: string;
  [ChainKey.TERRA]: string;
  [ChainKey.TERRACLASSIC]: string;
  [ChainKey.TON]: string;
  [ChainKey.XRP]: string;
  [ChainKey.ZKSYNC]: string;
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
