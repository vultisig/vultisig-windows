import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { FieldValues } from 'react-hook-form'

export const { provider: DepositDataProvider, useValue: useDepositData } =
  getValueProviderSetup<FieldValues>('DepositData')
