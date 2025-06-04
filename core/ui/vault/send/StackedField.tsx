import { AnimatePresence, motion } from 'framer-motion'

export const StackedField = ({
  isOpen,
  OpenComponent,
  ClosedComponent,
}: {
  isOpen: boolean
  OpenComponent: React.ReactNode
  ClosedComponent: React.ReactNode
}) => {
  return (
    <div style={{ position: 'relative', minHeight: 1 }}>
      <AnimatePresence initial={false}>
        <motion.div
          key="open"
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{
            position: isOpen ? 'relative' : 'absolute',
            width: '100%',
          }}
        >
          {OpenComponent}
        </motion.div>

        <motion.div
          key="closed"
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{
            position: isOpen ? 'absolute' : 'relative',
            width: '100%',
          }}
        >
          {ClosedComponent}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
