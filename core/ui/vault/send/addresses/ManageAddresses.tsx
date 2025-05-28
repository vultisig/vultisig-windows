import { Match } from '@lib/ui/base/Match'
import { motion } from 'framer-motion'

import { useFocusedSendField } from '../providers/FocusedSendFieldProvider'

export const ManageAddresses = () => {
  const [{ field }] = useFocusedSendField()
  const value = field == 'address' ? 'open' : 'closed'

  return (
    <motion.div layout>
      <Match value={value} open={() => {}} closed={() => {}} />
    </motion.div>
  )
}
