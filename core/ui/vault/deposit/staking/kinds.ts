import { ChainAction } from '../ChainAction'
import { StakeKind } from './types'

export function toStakeKind(action: ChainAction): StakeKind | null {
  switch (action) {
    case 'stake':
    case 'stake_ruji':
      return 'stake'
    case 'unstake':
    case 'unstake_ruji':
      return 'unstake'
    case 'withdraw_ruji_rewards':
      return 'claim'
    default:
      return null
  }
}
