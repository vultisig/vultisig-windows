import { Match } from '@lib/ui/base/Match'
import { AnimatePresence } from 'framer-motion'

import { useSendFormFieldState } from '../state/formFields'
import { AnimatedFieldContainer } from './AnimatedFieldContainer'
import { ManageAmountInputField } from './ManageAmountInputField'
import { ManageAmountInputFieldCollapsed } from './ManageAmountInputFieldCollapsed'

export const ManageAmount = () => {
  const [{ field }] = useSendFormFieldState()
  const value = field == 'amount' ? 'open' : 'closed'

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Match
        value={value}
        open={() => (
          <AnimatedFieldContainer key="open">
            <ManageAmountInputField />
          </AnimatedFieldContainer>
        )}
        closed={() => (
          <AnimatedFieldContainer key="closed">
            <ManageAmountInputFieldCollapsed />
          </AnimatedFieldContainer>
        )}
      />
    </AnimatePresence>
  )
}
