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
  | 'freeze'
  | 'unfreeze'
  | 'ibc_transfer'
  | 'merge'
  | 'switch'
  | 'unmerge'
  | 'mint'
  | 'redeem'
  | 'withdraw_ruji_rewards'
  | 'add_thor_lp'
  | 'remove_thor_lp'
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
    'add_thor_lp',
    'remove_thor_lp',
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
  [Chain.Kujira]: ['ibc_transfer', 'add_thor_lp'],
  [Chain.Osmosis]: ['ibc_transfer'],
  [Chain.Cosmos]: ['ibc_transfer', 'switch', 'add_thor_lp'],
  [Chain.Tron]: ['freeze', 'unfreeze', 'add_thor_lp'],
  [Chain.Avalanche]: ['add_thor_lp'],
  [Chain.Base]: ['add_thor_lp'],
  [Chain.BitcoinCash]: ['add_thor_lp'],
  [Chain.BSC]: ['add_thor_lp'],
  [Chain.Bitcoin]: ['add_thor_lp'],
  [Chain.Dash]: ['add_thor_lp'],
  [Chain.Dogecoin]: ['add_thor_lp'],
  [Chain.Ethereum]: ['add_thor_lp'],
  [Chain.Litecoin]: ['add_thor_lp'],
  [Chain.Ripple]: ['add_thor_lp'],
  [Chain.Arbitrum]: ['add_thor_lp'],
  [Chain.Zcash]: ['add_thor_lp'],
}
