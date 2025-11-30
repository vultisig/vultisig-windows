import { Chain } from '@core/chain/Chain'
import { DepositEnabledChain } from '@core/ui/vault/deposit/DepositEnabledChain'

const cacaoPoolActions = ['add_cacao_pool', 'remove_cacao_pool'] as const
type CacaoPoolAction = (typeof cacaoPoolActions)[number]

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
  | 'withdraw_ruji_rewards'
  | CacaoPoolAction

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
    'withdraw_ruji_rewards',
  ],
  [Chain.MayaChain]: [
    'bond_with_lp',
    'unbond_with_lp',
    'leave',
    'custom',
    ...cacaoPoolActions,
  ],
  [Chain.Dydx]: ['vote'],
  [Chain.Ton]: ['stake', 'unstake'],
  [Chain.Kujira]: ['ibc_transfer'],
  [Chain.Osmosis]: ['ibc_transfer'],
  [Chain.Cosmos]: ['ibc_transfer', 'switch'],
}
