import { Match } from '@lib/ui/base/Match'
import { motion } from 'framer-motion'

import { useFocusedSendField } from '../providers/FocusedSendFieldProvider'
import { ManageAmountInputField } from './ManageAmountInputField'
import { ManageAmountInputFieldCollapsed } from './ManageAmountInputFieldCollapsed'

export const ManageAmount = () => {
  const [{ field }] = useFocusedSendField()
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
