import { AnimatePresence, motion } from 'framer-motion'

import { useFocusedSendField } from '../../providers/FocusedSendFieldProvider'
import { ManageSendCoinCollapsedInputField } from './components/ManageSendCoinCollapsedInputField'
import { ManageSendCoinInputField } from './components/ManageSendCoinInputField'

const variants = {
  open: {
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  closed: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

export const ManageSendCoin = () => {
  const [{ field }] = useFocusedSendField()
  const isOpen = field === 'coin'

  return (
    <motion.div layout>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            key="open"
            variants={variants}
            initial="closed"
            animate="open"
            exit="closed"
            style={{
              overflow: 'hidden',
            }}
          >
            <ManageSendCoinInputField />
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            variants={variants}
            initial="closed"
            animate="open"
            exit="closed"
            style={{ overflow: 'hidden' }}
          >
            <ManageSendCoinCollapsedInputField />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
