import { Chain } from '@core/chain/Chain'
import { DepositEnabledChain } from '@core/ui/vault/deposit/DepositEnabledChain'

export type ChainAction =
  | 'bond'
  | 'unbond'
  | 'leave'
  | 'custom'
  | 'bond_with_lp'
  | 'unbond_with_lp'
  | 'vote'
  | 'stake'
  | 'unstake'
  | 'ibc_transfer'
  | 'merge'
  | 'switch'
  | 'unmerge'
  | 'mint'
  | 'redeem'
  | 'stake_ruji'
  | 'unstake_ruji'
  | 'withdraw_ruji_rewards'

export const chainActionsRecord: Record<DepositEnabledChain, ChainAction[]> = {
  [Chain.THORChain]: [
    'bond',
    'unbond',
    'leave',
    'custom',
    'merge',
    'stake',
    'unstake',
    'unmerge',
    'mint',
    'redeem',
    'stake_ruji',
    'unstake_ruji',
    'withdraw_ruji_rewards',
  ],
  [Chain.MayaChain]: ['bond_with_lp', 'unbond_with_lp', 'leave', 'custom'],
  [Chain.Dydx]: ['vote'],
  [Chain.Ton]: ['stake', 'unstake'],
  [Chain.Kujira]: ['ibc_transfer'],
  [Chain.Osmosis]: ['ibc_transfer'],
  [Chain.Cosmos]: ['ibc_transfer', 'switch'],
}
