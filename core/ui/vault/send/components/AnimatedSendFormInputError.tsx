import { Text } from '@lib/ui/text'
import { AnimatePresence, motion } from 'framer-motion'

type Props = {
  error?: string
}

export const AnimatedSendFormInputError = ({ error }: Props) => (
  <AnimatePresence>
    {error && (
      <motion.div
        key="error"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <Text size={12} color="warning">
          {error}
        </Text>
      </motion.div>
    )}
  </AnimatePresence>
)
