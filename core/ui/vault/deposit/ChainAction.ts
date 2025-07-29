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
  | 'deposit_yRune'
  | 'deposit_yTcy'
  | 'withdraw_yRune'
  | 'withdraw_yTcy'

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
    'deposit_yRune',
    'deposit_yTcy',
    'withdraw_yRune',
    'withdraw_yTcy',
  ],
  [Chain.MayaChain]: ['bond_with_lp', 'unbond_with_lp', 'leave', 'custom'],
  [Chain.Dydx]: ['vote'],
  [Chain.Ton]: ['stake', 'unstake'],
  [Chain.Kujira]: ['ibc_transfer'],
  [Chain.Osmosis]: ['ibc_transfer'],
  [Chain.Cosmos]: ['ibc_transfer', 'switch'],
}
