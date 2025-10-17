import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { FieldValues } from 'react-hook-form'

import { DepositForm } from './DepositForm'
import { DepositVerify } from './DepositVerify'
import { DepositDataProvider } from './state/data'

export const DepositPage = () => {
  return (
    <ValueTransfer<FieldValues>
      from={({ onFinish }) => <DepositForm onSubmit={onFinish} />}
      to={({ value, onBack }) => (
        <DepositDataProvider value={value}>
          <DepositVerify onBack={onBack} />
        </DepositDataProvider>
      )}
    />
  )
}
