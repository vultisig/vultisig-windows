import { NativeSwapChain } from './NativeSwapChain'

export type NativeSwapQuote = {
  swapChain: NativeSwapChain
  dust_threshold?: string
  expected_amount_out: string
  expiry: number
  fees: NativeSwapFees
  inbound_address?: string
  inbound_confirmation_blocks?: number
  inbound_confirmation_seconds?: number
  memo: string
  notes: string
  outbound_delay_blocks: number
  outbound_delay_seconds: number
  recommended_min_amount_in: string
  slippage_bps?: number
  total_swap_seconds?: number
  warning: string
  router?: string
}

type NativeSwapFees = {
  affiliate: string
  asset: string
  outbound: string
  total: string
  total_bps?: number
}
