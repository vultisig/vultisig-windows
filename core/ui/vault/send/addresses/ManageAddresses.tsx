import { Match } from '@lib/ui/base/Match'
import { AnimatePresence } from 'framer-motion'

import { AnimatedFieldContainer } from '../amount/AnimatedFieldContainer'
import { useSendFormFieldState } from '../state/formFields'
import { ManageReceiverAddressInputField } from './components/ManageAddressesInputField'
import { ManageAddressesInputFieldCollapsed } from './components/ManageAddressesInputFieldCollapsed'

export const ManageAddresses = () => {
  const [{ field }] = useSendFormFieldState()
  const value = field == 'address' ? 'open' : 'closed'

  return (
    <AnimatePresence mode="wait">
      <Match
        value={value}
        open={() => (
          <AnimatedFieldContainer key="open">
            <ManageReceiverAddressInputField />
          </AnimatedFieldContainer>
        )}
        closed={() => (
          <AnimatedFieldContainer key="closed">
            <ManageAddressesInputFieldCollapsed />
          </AnimatedFieldContainer>
        )}
      />
    </AnimatePresence>
  )
}
