import React, { useCallback } from 'react'
import { KeysignActionProvider } from '@core/ui/mpc/keysign/action/KeysignActionProvider'
import { StartKeysignFlow } from '@core/ui/mpc/keysign/start/StartKeysignFlow'
import { StartKeysignProviders } from '@core/ui/mpc/keysign/start/StartKeysignProviders'
import {
  getStoredTransactions,
  setStoredTransaction,
} from '../../../utils/storage'
import { ExecuteTxResultWithEncoded } from '@core/chain/tx/execute/ExecuteTxResolver'
import { parseTxResult } from '../../../utils/functions'

interface StartKeysignPageProps {
  isDAppSigning: boolean
}

export const StartKeysignPage: React.FC<StartKeysignPageProps> = ({
  isDAppSigning,
}) => {
  const onFinish = useCallback(
    async (txResult: string | ExecuteTxResultWithEncoded) => {
      const [transaction] = await getStoredTransactions()
      const { txHash, encoded } = parseTxResult(transaction, txResult)
      await setStoredTransaction({
        ...transaction,
        status: 'success',
        txHash,
        encoded,
      })

      window.close()
    },
    []
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
