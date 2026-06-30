import { DepositEnabledChain } from '@core/ui/vault/deposit/DepositEnabledChain'
import { Chain } from '@vultisig/core-chain/Chain'

const cacaoPoolActions = ['add_cacao_pool', 'remove_cacao_pool'] as const
type CacaoPoolAction = (typeof cacaoPoolActions)[number]

export const cosmosStakingActions = [
  'delegate',
  'undelegate',
  'redelegate',
  'claim_rewards',
] as const
export type CosmosStakingAction = (typeof cosmosStakingActions)[number]

/**
 * Solana native staking ops. Distinct names (not the generic `stake`/`unstake`)
 * keep routing unambiguous against THORChain/TON. Deactivate begins the
 * ~1-epoch cooldown on a stake account; withdraw moves the cooled-down lamports
 * back to the wallet (no claim path — rewards auto-compound). Delegate and the
 * guided move-stake ops land in later phases.
 */
export const solanaStakingActions = ['solana_unstake', 'solana_withdraw'] as const
export type SolanaStakingAction = (typeof solanaStakingActions)[number]

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
  | CosmosStakingAction
  | SolanaStakingAction

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
  [Chain.Solana]: [...solanaStakingActions],
  [Chain.Kujira]: ['ibc_transfer', 'add_thor_lp'],
  [Chain.Osmosis]: ['ibc_transfer'],
  [Chain.Cosmos]: ['ibc_transfer', 'switch', 'add_thor_lp'],
  [Chain.Terra]: ['ibc_transfer', ...cosmosStakingActions],
  [Chain.TerraClassic]: ['ibc_transfer', ...cosmosStakingActions],
  [Chain.QBTC]: [...cosmosStakingActions],
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
