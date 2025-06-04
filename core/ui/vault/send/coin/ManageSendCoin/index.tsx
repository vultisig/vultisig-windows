import { Match } from '@lib/ui/base/Match'
import { AnimatePresence } from 'framer-motion'

import { AnimatedFieldContainer } from '../../amount/AnimatedFieldContainer'
import { useSendFormFieldState } from '../../state/formFields'
import { ManageSendCoinCollapsedInputField } from './components/ManageSendCoinCollapsedInputField'
import { ManageSendCoinInputField } from './components/ManageSendCoinInputField'

export const ManageSendCoin = () => {
  const [{ field }] = useSendFormFieldState()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Match
        value={field === 'coin' ? 'open' : 'closed'}
        open={() => (
          <AnimatedFieldContainer key="open">
            <ManageSendCoinInputField />
          </AnimatedFieldContainer>
        )}
        closed={() => (
          <AnimatedFieldContainer key="closed">
            <ManageSendCoinCollapsedInputField />
          </AnimatedFieldContainer>
        )}
      />
    </AnimatePresence>
  )
}
