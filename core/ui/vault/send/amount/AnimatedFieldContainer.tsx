import { ChildrenProp } from '@lib/ui/props'
import { motion } from 'framer-motion'

export const AnimatedFieldContainer = ({ children }: ChildrenProp) => (
  <motion.div
    layout
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.35, ease: 'easeInOut' }}
    style={{
      overflow: 'hidden',
    }}
  >
    {children}
  </motion.div>
)
