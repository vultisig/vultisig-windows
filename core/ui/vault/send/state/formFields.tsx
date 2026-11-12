import { ChildrenProp } from '@lib/ui/props'
import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { SendStep } from '../form/sendSteps'
import { SendAssetFilterProvider } from './assetFilter'

type SendStepContext = {
  field: SendStep
}

/** The step the send form shows; `SendFormFieldsStateProvider` sets where it starts. */
export const [InternalSendFormFieldsStateProvider, useSendFormFieldState] =
  setupStateProvider<SendStepContext>('SendFormFieldStateProvider')

/**
 * Holds the step the send form shows and the asset step's filter. A send
 * opened for a specific coin starts on the address unless the entry point
 * asked for the asset step.
 */
export const SendFormFieldsStateProvider = ({ children }: ChildrenProp) => {
  const [state] = useCoreViewState<'send'>()

  const initialSendFormFieldState: SendStepContext = {
    field: state.initialStep ?? ('coin' in state ? 'address' : 'coin'),
  }

  return (
    <InternalSendFormFieldsStateProvider
      initialValue={initialSendFormFieldState}
    >
      <SendAssetFilterProvider>{children}</SendAssetFilterProvider>
    </InternalSendFormFieldsStateProvider>
  )
}
