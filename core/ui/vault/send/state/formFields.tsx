import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

import { SendFormShape, ValidationResult } from '../form/formShape'

type FocusedSendField = 'coin' | 'amount' | 'address' | null

type FocusedSendFieldContext = {
  field: FocusedSendField
  fieldsChecked: {
    coin: boolean
    amount: boolean
    address: boolean
  }
  errors: ValidationResult<SendFormShape>
}

export const initialSendFormFieldState: FocusedSendFieldContext = {
  field: 'coin',
  fieldsChecked: { coin: true, amount: false, address: false },
  errors: {},
}

export const {
  useState: useSendFormFieldState,
  provider: SendFormFieldStateProvider,
} = getStateProviderSetup<FocusedSendFieldContext>('SendFormFieldStateProvider')
