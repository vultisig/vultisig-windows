import { ChainAction } from '../ChainAction'
import { StakeKind } from './types'

export function toStakeKind(action: ChainAction): StakeKind | null {
  switch (action) {
    case 'stake':
      return 'stake'
    case 'unstake':
      return 'unstake'
    case 'withdraw_ruji_rewards':
      return 'claim'
    default:
      return null
  }
}
