import { setupValueProvider } from '@lib/ui/state/setupValueProvider'
import { FieldValues } from 'react-hook-form'

export const [DepositDataProvider, useDepositData] =
  setupValueProvider<FieldValues>('DepositData')
