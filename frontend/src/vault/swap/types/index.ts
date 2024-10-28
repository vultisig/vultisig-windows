export interface SwapQuoteFee {
  affiliate: string;
  asset: string;
  liquidity: string;
  outbound: string;
  slippage_bps: number;
  total: string;
  totalInUsd: string;
  total_bps: number;
}

export interface SwapQuote {
  affiliateInPercentage: string;
  expected_amount_out: string;
  expected_amount_out_streaming: string;
  expiry: number;
  fees: SwapQuoteFee;
  inbound_address: string;
  max_streaming_quantity: number;
  memo: string;
  notes: string;
  outbound_delay_blocks: number;
  outbound_delay_seconds: number;
  recommended_min_amount_in: string;
  router?: string;
  slippage_bps: number;
  streaming_slippage_bps: number;
  streaming_swap_blocks: number;
  streaming_swap_seconds?: number;
  total_swap_seconds?: number;
  warning: string;
}

export enum SwapProtocolType {
  THORPriceOptimised = 'priceOptimised',
  THORTimeOptimised = 'timeOptimised',
  MAYA = 'maya',
  MAYA_STREAMING = 'mayaStreaming',
}
