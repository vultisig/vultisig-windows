import { AccountCoin } from '@core/chain/coin/AccountCoin'

export type StakeKind = 'stake' | 'unstake' | 'claim'

export type StakeInput =
  | { kind: 'stake'; amount: number }
  | ({ kind: 'unstake' } & ({ amount: number } | { percentage: number }))
  | { kind: 'claim' }

export type StakeSpecific =
  | {
      kind: 'memo'
      memo: string
      toAddress?: string
      toAmount?: string
    }
  | {
      kind: 'wasm'
      contract: string
      executeMsg: unknown
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
  supports(coin: AccountCoin, ctx?: { autocompound?: boolean }): boolean
  buildIntent(
    kind: StakeKind,
    input: StakeInput,
    ctx: { coin: AccountCoin }
  ): StakeSpecific
}
