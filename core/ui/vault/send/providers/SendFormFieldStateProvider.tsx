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

export const initialSendFormFieldState: FocusedSendFieldContext = {
  field: 'amount',
  fieldsChecked: {
    coin: true,
    amount: false,
    address: false,
  },
}

export const {
  useState: useSendFormFieldState,
  provider: SendFormFieldStateProvider,
} = getStateProviderSetup<FocusedSendFieldContext>('SendFormFieldStateProvider')
