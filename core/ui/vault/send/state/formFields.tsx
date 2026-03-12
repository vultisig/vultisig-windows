import { ChildrenProp } from '@lib/ui/props'
import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'

type FocusedSendField = 'coin' | 'amount' | 'address' | null

type FocusedSendFieldContext = {
  field: FocusedSendField
}

export const [InternalSendFormFieldsStateProvider, useSendFormFieldState] =
  setupStateProvider<FocusedSendFieldContext>('SendFormFieldStateProvider')

export const SendFormFieldsStateProvider = ({ children }: ChildrenProp) => {
  const [state] = useCoreViewState<'send'>()

  const initialSendFormFieldState: FocusedSendFieldContext = {
    field: 'coin' in state ? 'address' : 'coin',
  }

  return (
    <InternalSendFormFieldsStateProvider
      initialValue={initialSendFormFieldState}
    >
      {children}
    </InternalSendFormFieldsStateProvider>
  )
}
