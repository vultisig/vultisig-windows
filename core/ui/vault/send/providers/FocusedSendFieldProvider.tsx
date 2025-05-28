import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

type FocusedSendField = 'coin' | 'amount' | 'address' | null

type FocusedSendFieldContext = {
  field: FocusedSendField
  fieldsChecked: {
    coin: boolean
    amount: boolean
    address: boolean
  }
}

export const initialFocusedSendFieldValue: FocusedSendFieldContext = {
  field: 'address',
  fieldsChecked: {
    coin: false,
    amount: false,
    address: false,
  },
}

export const {
  useState: useFocusedSendField,
  provider: FocusedSendFieldProvider,
} = getStateProviderSetup<FocusedSendFieldContext>('FocusedSendFieldProvider')
