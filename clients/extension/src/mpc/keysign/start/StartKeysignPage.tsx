import { KeysignActionProvider } from '@core/ui/mpc/keysign/action/KeysignActionProvider'
import { StartKeysignFlow } from '@core/ui/mpc/keysign/start/StartKeysignFlow'
import { StartKeysignProviders } from '@core/ui/mpc/keysign/start/StartKeysignProviders'
import {
  getStoredTransactions,
  setStoredTransaction,
} from '../../../utils/storage'
import { ExecuteTxResultWithEncoded } from '@core/chain/tx/execute/ExecuteTxResolver'
import { Chain } from '@core/chain/Chain'

export const StartKeysignPage = (isDAppSigning: boolean) => {
  const onFinish = async (txResult: string | ExecuteTxResultWithEncoded) => {
    const [transaction] = await getStoredTransactions()
    let txHash: string
    let encoded = undefined
    if (transaction.chain === Chain.Solana) {
      const solanaResult = txResult as ExecuteTxResultWithEncoded
      txHash = solanaResult.result
      encoded = solanaResult.encoded as string
    } else {
      txHash = txResult as string
    }
    await setStoredTransaction({
      ...transaction,
      status: 'success',
      txHash,
      encoded,
    })
    window.close()
  }

  return (
    <StartKeysignProviders>
      <StartKeysignFlow
        keysignActionProvider={KeysignActionProvider}
        onFinish={isDAppSigning ? onFinish : undefined}
      />
    </StartKeysignProviders>
  )
}
