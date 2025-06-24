import { TxResult } from '@core/chain/tx/execute/ExecuteTxResolver'
import { KeysignActionProvider } from '@core/ui/mpc/keysign/action/KeysignActionProvider'
import { StartKeysignFlow } from '@core/ui/mpc/keysign/start/StartKeysignFlow'
import { StartKeysignProviders } from '@core/ui/mpc/keysign/start/StartKeysignProviders'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useAssertCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { useCallback } from 'react'

import { initializeMessenger } from '../../../messengers/initializeMessenger'
import { useUpdateTransactionMutation } from '../../../transactions/mutations/useUpdateTransactionMutation'
import { useCurrentVaultTransactionsQuery } from '../../../transactions/state/useTransactions'

const backgroundMessenger = initializeMessenger({ connect: 'background' })
import { useRef } from 'react'

export const StartKeysignPage = () => {
  const currentVaultId = useAssertCurrentVaultId()
  const { data: transactions } = useCurrentVaultTransactionsQuery()
  const { mutateAsync: updateTransaction } = useUpdateTransactionMutation()
  const [{ isDAppSigning }] = useCoreViewState<'keysign'>()
  const hasFinishedRef = useRef(false)
  const onFinish = useCallback(
    async ({
      txHash,
      shouldClose,
      encoded,
    }: TxResult & { shouldClose: boolean }) => {
      if (hasFinishedRef.current) {
        if (shouldClose) {
          window.close()
        }
        return
      }
      hasFinishedRef.current = true

      if (!transactions || !transactions.length) return

      const transaction = getLastItem(transactions)
      if (!transaction?.id) return

      try {
        await backgroundMessenger.send(`tx_result_${transaction.id}`, {
          txHash,
          encoded,
        })
      } catch (err) {
        console.error('Failed to send background message:', err)
      }

      try {
        await updateTransaction({
          transaction: {
            ...transaction,
            status: 'success',
            txHash,
            encoded,
          },
          vaultId: currentVaultId,
        })
      } catch (err) {
        console.error('Failed to update transaction:', err)
      }

      if (shouldClose) {
        try {
          window.close()
        } catch {
          console.warn('Could not close window')
        }
      }
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
