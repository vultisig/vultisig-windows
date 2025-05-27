import { TxResult } from '@core/chain/tx/execute/ExecuteTxResolver'
import { KeysignActionProvider } from '@core/ui/mpc/keysign/action/KeysignActionProvider'
import { StartKeysignFlow } from '@core/ui/mpc/keysign/start/StartKeysignFlow'
import { StartKeysignProviders } from '@core/ui/mpc/keysign/start/StartKeysignProviders'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useAssertCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { useCallback } from 'react'

import { useUpdateTransactionMutation } from '../../../transactions/mutations/useUpdateTransactionMutation'
import { useCurrentVaultTransactionsQuery } from '../../../transactions/state/useTransactions'

export const StartKeysignPage = () => {
  const currentVaultId = useAssertCurrentVaultId()
  const { data: transactions } = useCurrentVaultTransactionsQuery()
  const { mutateAsync: updateTransaction } = useUpdateTransactionMutation()
  const [{ isDAppSigning }] = useCoreViewState<'keysign'>()
  const onFinish = useCallback(
    async (txResult: TxResult) => {
      if (!transactions || !transactions.length) {
        throw new Error('No current transaction present')
      }
      const transaction = getLastItem(transactions)

      await updateTransaction({
        transaction: {
          ...transaction,
          status: 'success',
          ...txResult,
        },
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
