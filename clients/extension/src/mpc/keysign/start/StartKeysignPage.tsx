import { KeysignResult } from '@core/mpc/keysign/KeysignResult'
import { KeysignActionProvider } from '@core/ui/mpc/keysign/action/KeysignActionProvider'
import {
  KeysignMutationListener,
  KeysignMutationListenerProvider,
} from '@core/ui/mpc/keysign/action/state/keysignMutationListener'
import { StartKeysignFlow } from '@core/ui/mpc/keysign/start/StartKeysignFlow'
import { StartKeysignProviders } from '@core/ui/mpc/keysign/start/StartKeysignProviders'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useAssertCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { useMemo } from 'react'

import { initializeMessenger } from '../../../messengers/initializeMessenger'
import { useUpdateTransactionMutation } from '../../../transactions/mutations/useUpdateTransactionMutation'
import { useCurrentVaultTransactionsQuery } from '../../../transactions/state/useTransactions'
import { ITransaction } from '../../../utils/interfaces'

const backgroundMessenger = initializeMessenger({ connect: 'background' })

export const StartKeysignPage = () => {
  const currentVaultId = useAssertCurrentVaultId()
  const { data: transactions } = useCurrentVaultTransactionsQuery()
  const { mutate: updateTransaction } = useUpdateTransactionMutation()
  const [{ isDAppSigning }] = useCoreViewState<'keysign'>()

  const keysignMutationListener: KeysignMutationListener = useMemo(
    () => ({
      onSuccess: result => {
        if (!isDAppSigning) {
          return
        }
        if (!transactions || !transactions.length) {
          throw new Error('No current transaction present')
        }
        const transaction = getLastItem(transactions)

        const newTransaction: ITransaction = {
          ...transaction,
          ...matchRecordUnion<KeysignResult, Partial<ITransaction>>(result, {
            signature: signature => ({ hash: signature }),
            txs: txs => getLastItem(txs),
          }),
          status: 'success',
        }

        updateTransaction({
          transaction: newTransaction,
          vaultId: currentVaultId,
        })

        backgroundMessenger.send(`tx_result_${transaction.id}`, newTransaction)
      },
    }),
    [currentVaultId, isDAppSigning, transactions, updateTransaction]
  )

  return (
    <StartKeysignProviders>
      <KeysignMutationListenerProvider value={keysignMutationListener}>
        <StartKeysignFlow keysignActionProvider={KeysignActionProvider} />
      </KeysignMutationListenerProvider>
    </StartKeysignProviders>
  )
}
