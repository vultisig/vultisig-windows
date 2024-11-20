import { SwapQuote } from '../../../vault/swap/types';

export type SwapQuoteParams = {
  fromAsset: string;
  toAsset: string;
  amount: string;
  destination: string;
  fromAddress: string;
  toleranceBps: number;
  fromAssetDecimal: number;
  toAssetDecimal: number;
  ethAddress?: string;
};

export interface SwapQuoteResponse {
  maya: {
    error: string;
    quote: SwapQuote | null;
  };
  mayaStreaming: {
    error: string;
    quote: SwapQuote | null;
  };
  oneInch: {
    error: string;
    quote: SwapQuote | null;
  };
  thorchain: {
    base: {
      error: string | null;
      quote: SwapQuote | null;
    };
    streaming: {
      quote: SwapQuote | null;
      error: string;
    };
  };
}

export interface InboundAddress {
  address: string;
  chain: string;
  chain_lp_actions_paused: boolean;
  chain_trading_paused: boolean;
  dust_threshold: string;
  gas_rate: string;
  gas_rate_units: string;
  global_trading_paused: boolean;
  halted: boolean;
  outbound_fee: string;
  outbound_tx_size: string;
  pub_key: string;
  router: string;
}

export enum SwapPayloadType {
  MAYA = 'mayachainSwapPayload',
  THORCHAIN = 'thorchainSwapPayload',
  ONE_INCH = 'oneinchSwapPayload',
}
