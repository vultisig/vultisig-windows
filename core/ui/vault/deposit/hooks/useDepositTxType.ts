import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt } from '@lib/utils/attempt'
import { useMemo } from 'react'

import { useDepositAction } from '../providers/DepositActionProvider'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import { stakeModeById } from '../staking/config'
import { selectStakeId } from '../staking/resolvers'
import { useDepositData } from '../state/data'

export function useDepositTxType() {
  const [action] = useDepositAction()
  const depositData = useDepositData()

  const [coin] = useDepositCoin()

  const autocompound = Boolean(depositData['autoCompound'])

  return useMemo(() => {
    if (action === 'ibc_transfer') return TransactionType.IBC_TRANSFER
    if (action === 'merge') return TransactionType.THOR_MERGE
    if (action === 'unmerge') return TransactionType.THOR_UNMERGE

    const getIsStakeContractFlow = () => {
      const isStake = isOneOf(action, [
        'stake',
        'unstake',
        'withdraw_ruji_rewards',
      ])

      if (isStake) {
        const { data } = attempt(() => selectStakeId(coin, { autocompound }))
        if (data) {
          return stakeModeById[shouldBePresent(data)] === 'wasm'
        }
      }

      return false
    }

    if (action === 'mint' || action === 'redeem' || getIsStakeContractFlow()) {
      return TransactionType.GENERIC_CONTRACT
    }
  }, [action, autocompound, coin])
}
