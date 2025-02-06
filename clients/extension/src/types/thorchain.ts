// THORNode types

export type ThorchainChain =
  | "BTC"
  | "DOGE"
  | "LTC"
  | "BCH"
  | "ETH"
  | "AVAX"
  | "BNB"
  | "GAIA"
  | "THOR"
  | "BSC"
  | "BASE";

type ThorNodeCoinSchema = {
  asset: string;
  amount: string;
  decimals?: number;
};

type ThorNodeTx = {
  id: string;
  chain: ThorchainChain;
  from_address: string;
  to_address: string;
  coins: ThorNodeCoinSchema[];
  gas: ThorNodeCoinSchema[];
  memo?: string;
};

export type ThornodeTxResponseSuccess = {
  observed_tx: {
    tx: ThorNodeTx;
    observed_pub_key?: string;
    external_observed_height?: number;
    external_confirmation_delay_height?: number;
    aggregator?: string;
    aggregator_target?: string;
    aggregator_target_limit?: string;
    signers?: string[];
    keysign_ms?: number;
    out_hashes?: string[];
    status?: "done" | "incomplete";
  };
  consensus_height?: number;
  finalised_height?: number;
  outbound_height?: number;
  keysign_metric?: {
    tx_id?: string;
    node_tss_times: { address?: string; tss_time?: number }[];
  };
};

type ThornodeResponseError = {
  code: number;
  message: string;
  details: string[];
};

export type ThornodeTxResponse =
  | ThornodeTxResponseSuccess
  | ThornodeResponseError;

export type ThornodeNetworkResponse = {
  bondRewardRune: string;
  totalBondUnits: string;
  effectiveSecurityBond: string;
  totalReserve: string;
  vaultsMigrating: boolean;
  gasSpentRune: string;
  gasWithheldRune: string;
  outboundFeeMultiplier: string;
  nativeOutboundFeeRune: string;
  nativeTxFeeRune: string;
  tnsRegisterFeeRune: string;
  tnsFeePerBlockRune: string;
  runeRriceInTor: string;
  torPriceInRune: string;
};

// Provider-specific types

export type ThorchainProviderMethod =
  | "request_accounts"
  | "get_accounts"
  | "send_transaction"
  | "deposit_transaction"
  | "get_transaction_by_hash";

export type ThorchainProviderMethodToParams = {
  request_accounts: never[];
  get_accounts: never[];
  send_transaction: any[]; // TODO: Request types for every method
  deposit_transaction: any[]; // TODO: Request types for every method
  get_transaction_by_hash: [{ hash: string }];
};

// Generic request type based on method
export type ThorchainProviderRequest<T extends ThorchainProviderMethod> = {
  method: T;
  params: ThorchainProviderMethodToParams[T];
};

export type ThorchainProviderResponse<T extends ThorchainProviderMethod> =
  T extends "get_transaction_by_hash"
    ? ThornodeTxResponse
    : // TODO: Response types for every method
      string | string[];
