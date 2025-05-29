import { Match } from '@lib/ui/base/Match'
import { AnimatePresence, motion } from 'framer-motion'

import { useSendFormFieldState } from '../../providers/SendFormFieldStateProvider'
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
  const [{ field }] = useSendFormFieldState()

  return (
    <motion.div layout>
      <AnimatePresence initial={false}>
        <Match
          value={field === 'coin' ? 'open' : 'closed'}
          open={() => (
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
          )}
          closed={() => (
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
        />
      </AnimatePresence>
    </motion.div>
  )
}
