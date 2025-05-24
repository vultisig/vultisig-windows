import { ExecuteTxResultWithEncoded } from '@core/chain/tx/execute/ExecuteTxResolver'
import { KeysignActionProvider } from '@core/ui/mpc/keysign/action/KeysignActionProvider'
import { StartKeysignFlow } from '@core/ui/mpc/keysign/start/StartKeysignFlow'
import { StartKeysignProviders } from '@core/ui/mpc/keysign/start/StartKeysignProviders'
import { useAssertCurrentVaultId } from '@core/ui/storage/currentVaultId'
import React, { useCallback } from 'react'

import { useAddOrUpdateTransactionMutation } from '../../../transactions/mutations/useAddOrUpdateTransactionMutation'
import { useCurrentVaultTransactionsQuery } from '../../../transactions/state/useTransactions'
import { parseTxResult } from '../../../utils/functions'

interface StartKeysignPageProps {
  isDAppSigning: boolean
}

export const StartKeysignPage: React.FC<StartKeysignPageProps> = ({
  isDAppSigning,
}) => {
  const currentVaultId = useAssertCurrentVaultId()
  const { data: transactions } = useCurrentVaultTransactionsQuery()
  const { mutateAsync: updateTransaction } = useAddOrUpdateTransactionMutation()

  const onFinish = useCallback(
    async (txResult: string | ExecuteTxResultWithEncoded) => {
      const transaction = transactions?.pop()
      if (!transaction) {
        throw new Error('No current transaction present')
      }
      const { txHash, encoded } = parseTxResult(transaction, txResult)

      await updateTransaction({
        transaction: { ...transaction, status: 'success', txHash, encoded },
        vaultId: currentVaultId,
      })

      window.close()
    },
    [currentVaultId, transactions, updateTransaction]
  )

  return (
    <StartKeysignProviders>
      <StartKeysignFlow
        keysignActionProvider={KeysignActionProvider}
        onFinish={isDAppSigning ? onFinish : undefined}
      />
    </StartKeysignProviders>
  )
}
