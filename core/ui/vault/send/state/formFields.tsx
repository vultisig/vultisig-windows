import { ChildrenProp } from '@lib/ui/props'
import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { SendFormShape, ValidationResult } from '../form/formShape'

type FocusedSendField = 'coin' | 'amount' | 'address' | null

type FocusedSendFieldContext = {
  field: FocusedSendField
  errors: ValidationResult<SendFormShape>
}

export const {
  useState: useSendFormFieldState,
  provider: InternalSendFormFieldsStateProvider,
} = getStateProviderSetup<FocusedSendFieldContext>('SendFormFieldStateProvider')

export const SendFormFieldsStateProvider = ({ children }: ChildrenProp) => {
  const [state] = useCoreViewState<'send'>()

  const initialSendFormFieldState: FocusedSendFieldContext = {
    field: 'coin' in state ? 'address' : 'coin',

    errors: {},
  }

  return (
    <InternalSendFormFieldsStateProvider
      initialValue={initialSendFormFieldState}
    >
      {children}
    </InternalSendFormFieldsStateProvider>
  )
}
