import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { z } from 'zod'

export type StakeKind = 'stake' | 'unstake' | 'claim'

export type StakeInput =
  | { kind: 'stake'; amount: number }
  | { kind: 'unstake'; amount?: number; percentage?: number } // RUJI uses amount, TCY uses percentage
  | { kind: 'claim' }

export type StakeSpecific =
  | {
      kind: 'memo'
      memo: string
      toAddress?: string
      toAmount?: string // in chain units; e.g., amount for TCY stake. Unstake often 0.
    }
  | {
      kind: 'wasm'
      contract: string
      executeMsg: unknown // JSON or stringified JSON
      funds: Array<{ denom: string; amount: string }>
    }

export type FieldSpec = {
  name: string
  type: 'number' | 'text' | 'percentage' | 'boolean'
  label: string
  required?: boolean
  default?: unknown
}

export type StakeResolver = {
  id: 'native-tcy' | 'ruji' | 'stcy'
  // Minimal precheck to choose the provider
  supports(coin: AccountCoin, ctx?: { autocompound?: boolean }): boolean

  // UI contract (optional for Phase 1). If you plug this, your form becomes provider-driven.
  fields(kind: StakeKind, t: (k: string) => string): FieldSpec[]
  schema(
    kind: StakeKind,
    env: { balance: number; t: (k: string) => string }
  ): z.ZodTypeAny

  // The whole point: turn (kind + input) into a normalized tx intent.
  buildIntent(
    kind: StakeKind,
    input: StakeInput,
    ctx: { coin: AccountCoin }
  ): StakeSpecific
}
