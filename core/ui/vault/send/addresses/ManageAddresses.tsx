import { Match } from '@lib/ui/base/Match'
import { motion } from 'framer-motion'

import { useFocusedSendField } from '../providers/FocusedSendFieldProvider'
import { ManageReceiverAddressInputField } from './components/ManageAddressesInputField'
import { ManageAddressesInputFieldCollapsed } from './components/ManageAddressesInputFieldCollapsed'

export const ManageAddresses = () => {
  const [{ field }] = useFocusedSendField()
  const value = field == 'address' ? 'open' : 'closed'

  return (
    <motion.div layout>
      <Match
        value={value}
        open={() => (
          <motion.div>
            <ManageReceiverAddressInputField />
          </motion.div>
        )}
        closed={() => <ManageAddressesInputFieldCollapsed />}
      />
    </motion.div>
  )
}
