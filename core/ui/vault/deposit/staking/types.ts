import type { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import type { Resolver } from '@vultisig/lib-utils/types/Resolver'

export type StakeKind = 'stake' | 'unstake' | 'claim'
export type StakeId = 'ruji' | 'native-tcy' | 'stcy'

export type StakeSpecific =
  | { kind: 'memo'; memo: string; toAddress?: string; toAmount?: string }
  | {
      kind: 'wasm'
      contract: string
      executeMsg: unknown
      funds: Array<{ denom: string; amount: string }>
    }

/**
 * Input for a RUJI staking op: `stake` (bond), position-specific `unstake`
 * (auto-compounding `liquid` via `liquid.unbond` vs `bonded` via
 * `account.withdraw`), or a rewards `claim`.
 */
export type RujiInput =
  | { kind: 'stake'; amount: number }
  | {
      // Auto-compounding (sRUJI) position — redeemed via `liquid.unbond`, so the
      // entered underlying amount is converted to receipt shares.
      kind: 'unstake'
      position: 'liquid'
      amount: number
      liquidShares: bigint
      liquidSize: bigint
    }
  | {
      // Bonded (yielding) position — withdrawn via `account.withdraw`.
      kind: 'unstake'
      position: 'bonded'
      amount: number
    }
  | { kind: 'claim' }

export type NativeTcyInput =
  | { kind: 'stake'; amount: number }
  | { kind: 'unstake'; percentage: number }
  | { kind: 'claim' }

export type StcyInput =
  | { kind: 'stake'; amount: number }
  | { kind: 'unstake'; amount: number }

export type RujiPayload = { coin: AccountCoin; input: RujiInput }
export type NativeTcyPayload = { coin: AccountCoin; input: NativeTcyInput }
export type StcyPayload = { input: StcyInput }

type StakePayloadById = {
  ruji: RujiPayload
  'native-tcy': NativeTcyPayload
  stcy: StcyPayload
}

export type StakeResolverMap = {
  [K in StakeId]: Resolver<StakePayloadById[K], StakeSpecific>
}

export type StakeContract = 'wasm' | 'memo'
