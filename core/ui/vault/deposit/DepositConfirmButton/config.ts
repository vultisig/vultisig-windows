import { Chain } from '@core/chain/Chain'
import { match } from '@lib/utils/match'

import { ChainAction } from '../ChainAction'
import { isStakeableChain, StakeableChain } from '../constants'

type TransactionConfig = {
  requiresAmount?: boolean
  requiresNodeAddress?: boolean
  requiresMemo?: boolean
  defaultAmount?: number
  defaultMemo?: string
}

export const transactionConfig = (
  chain: Chain
): Record<ChainAction, TransactionConfig> => ({
  bond: { requiresAmount: true, requiresNodeAddress: true },
  unbond: { requiresAmount: false, requiresNodeAddress: true },
  leave: { requiresNodeAddress: true, requiresAmount: false },
  custom: {},
  stake: isStakeableChain(chain)
    ? match(chain as StakeableChain, {
        Ton: () => ({
          requiresAmount: true,
          requiresNodeAddress: true,
        }),
        THORChain: () => ({
          requiresAmount: true,
        }),
      })
    : {},
  unstake: isStakeableChain(chain)
    ? match(chain as StakeableChain, {
        Ton: () => ({
          requiresAmount: true,
          requiresNodeAddress: true,
        }),
        THORChain: () => ({}),
      })
    : {},
  vote: { requiresAmount: false, requiresNodeAddress: false },
  bond_with_lp: { requiresAmount: false, requiresNodeAddress: true },
  unbond_with_lp: { requiresAmount: true, requiresNodeAddress: true },
  ibc_transfer: { requiresAmount: true, requiresNodeAddress: true },
  merge: { requiresAmount: true, requiresNodeAddress: true },
  switch: { requiresAmount: true, requiresNodeAddress: true },
})
