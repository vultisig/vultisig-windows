import { Section } from '@core/inpage-provider/popup/view/resolvers/signMessage/styles'
import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { ChevronUpIcon } from '@lib/ui/icons/ChevronUpIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { AnimatePresence, motion } from 'framer-motion'
import { FC, ReactNode, useState } from 'react'

type CollapseProps = {
  children: ReactNode
  collapsed?: boolean
  title: string
}

export const Collapse: FC<CollapseProps> = ({
  children,
  collapsed = false,
  title,
}) => {
  const [open, setOpen] = useState(collapsed)

  return (
    <VStack position="relative">
      <AnimatePresence initial={open}>
        <motion.div
          animate={{ opacity: open ? 1 : 0 }}
          exit={{ opacity: 0 }}
          key="open"
          initial={{ opacity: 0 }}
          style={{
            position: open ? 'relative' : 'absolute',
            width: '100%',
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          layout
        >
          <Section
            gap={24}
            onClick={() => setOpen(!open)}
            style={{ cursor: 'pointer' }}
          >
            <HStack alignItems="center" justifyContent="space-between">
              <Text as="span" size={14} weight={500}>
                {title}
              </Text>
              <ChevronUpIcon fontSize={16} strokeWidth={2} />
            </HStack>
            <VStack gap={12}>{children}</VStack>
          </Section>
        </motion.div>
        <motion.div
          key="closed"
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: open ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{
            position: open ? 'absolute' : 'relative',
            width: '100%',
          }}
        >
          <Section onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}>
            <HStack alignItems="center" justifyContent="space-between">
              <Text as="span" size={14} weight={500}>
                {title}
              </Text>
              <ChevronDownIcon fontSize={16} strokeWidth={2} />
            </HStack>
          </Section>
        </motion.div>
      </AnimatePresence>
    </VStack>
  )
}
