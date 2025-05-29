import { Match } from '@lib/ui/base/Match'
import { motion } from 'framer-motion'

import { useSendFormFieldState } from '../state/formFields'
import { ManageAmountInputField } from './ManageAmountInputField'
import { ManageAmountInputFieldCollapsed } from './ManageAmountInputFieldCollapsed'

export const ManageAmount = () => {
  const [{ field }] = useSendFormFieldState()
  const value = field == 'amount' ? 'open' : 'closed'

  return (
    <motion.div layout>
      <Match
        value={value}
        open={() => (
          <motion.div>
            <ManageAmountInputField />
          </motion.div>
        )}
        closed={() => <ManageAmountInputFieldCollapsed />}
      />
    </motion.div>
  )
}
