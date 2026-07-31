import type { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import type { Resolver } from '@vultisig/lib-utils/types/Resolver'

export type StakeKind = 'stake' | 'unstake' | 'claim'
export type StakeId = 'ruji' | 'native-tcy' | 'stcy' | 'brune'

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
  | { kind: 'stake'; amount: string }
  | {
      // Auto-compounding (sRUJI) position — redeemed via `liquid.unbond`, so the
      // entered underlying amount is converted to receipt shares.
      kind: 'unstake'
      position: 'liquid'
      amount: string
      liquidShares: bigint
      liquidSize: bigint
    }
  | {
      // Bonded (yielding) position — withdrawn via `account.withdraw`.
      kind: 'unstake'
      position: 'bonded'
      amount: string
    }
  | { kind: 'claim' }

export type NativeTcyInput =
  | { kind: 'stake'; amount: string }
  | { kind: 'unstake'; percentage: number }
  | { kind: 'claim' }

export type StcyInput =
  | { kind: 'stake'; amount: string }
  | { kind: 'unstake'; amount: string }

/**
 * Input for a bRUNE liquid-bond op — amount-based auto-compounding stake
 * (`liquid.bond`) or unstake (`liquid.unbond`), same shape as {@link StcyInput}.
 */
export type BruneInput =
  | { kind: 'stake'; amount: string }
  | { kind: 'unstake'; amount: string }

export type RujiPayload = { coin: AccountCoin; input: RujiInput }
export type NativeTcyPayload = { coin: AccountCoin; input: NativeTcyInput }
export type StcyPayload = { input: StcyInput }
export type BrunePayload = { input: BruneInput }

type StakePayloadById = {
  ruji: RujiPayload
  'native-tcy': NativeTcyPayload
  stcy: StcyPayload
  brune: BrunePayload
}

export type StakeResolverMap = {
  [K in StakeId]: Resolver<StakePayloadById[K], StakeSpecific>
}

export type StakeContract = 'wasm' | 'memo'
