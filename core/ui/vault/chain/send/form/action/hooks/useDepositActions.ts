import { ComponentWithValueProps } from '@lib/ui/props/value'
import { useMemo } from 'react'

import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { DepositAction } from '../../DepositAction'

export const useDepositActions = ({
  value: actionOptions,
}: ComponentWithValueProps<DepositAction[]>) => {
  return useMemo(() => {
    return actionOptions.value.map((action) => {
      const actionMapping: Record<DepositAction, TransactionType> = {
        bond: TransactionType.BOND,
        unbond: TransactionType.UNBOND,
        leave: TransactionType.LEAVE,
        custom: TransactionType.SEND,
        unmerge: TransactionType.SEND, // Temporarily use SEND instead of THOR_UNMERGE
      }

      return {
        action,
        transactionType: actionMapping[action],
      }
    })
  }, [actionOptions.value])
} 
