import { KeysignActionProvider } from '@core/ui/mpc/keysign/action/KeysignActionProvider'
import { StartKeysignFlow } from '@core/ui/mpc/keysign/start/StartKeysignFlow'
import { StartKeysignProviders } from '@core/ui/mpc/keysign/start/StartKeysignProviders'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { TransactionPage } from '../../../pages/transaction'

export const StartKeysignPage = () => {
  return (
    <StartKeysignProviders>
      <ValueTransfer<string>
        from={({ onFinish }) => (
          <StartKeysignFlow
            keysignActionProvider={KeysignActionProvider}
            onFinish={onFinish}
          />
        )}
        to={({ value }) => <TransactionPage txHash={value} />}
      />
    </StartKeysignProviders>
  )
}
