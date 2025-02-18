import { ChainAction } from '../ChainAction'

type TransactionConfig = {
  requiresAmount?: boolean
  requiresNodeAddress?: boolean
  requiresMemo?: boolean
  defaultAmount?: number
  defaultMemo?: string
}

export const transactionConfig: Record<ChainAction, TransactionConfig> = {
  bond: { requiresAmount: true, requiresNodeAddress: true },
  unbond: { requiresAmount: false, requiresNodeAddress: true },
  leave: { requiresNodeAddress: true, requiresAmount: false },
  custom: {},
  stake: { requiresAmount: true, requiresNodeAddress: true },
  unstake: { requiresAmount: true, requiresNodeAddress: true },
  vote: { requiresAmount: false, requiresNodeAddress: false },
  bond_with_lp: { requiresAmount: false, requiresNodeAddress: true },
  unbond_with_lp: { requiresAmount: true, requiresNodeAddress: true },
}
