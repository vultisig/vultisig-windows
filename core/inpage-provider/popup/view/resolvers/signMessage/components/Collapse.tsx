import { Section } from '@core/inpage-provider/popup/view/resolvers/signMessage/styles'
import { CollapsableStateIndicator } from '@lib/ui/layout/CollapsableStateIndicator'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { AnimatePresence, motion } from 'framer-motion'
import { FC, ReactNode, useEffect, useRef, useState } from 'react'

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
  const [isOpen, setIsOpen] = useState(collapsed)
  const [height, setHeight] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) setHeight(ref.current.scrollHeight)
  }, [isOpen])

  return (
    <Section onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
      <HStack alignItems="center" justifyContent="space-between" padding={24}>
        <Text as="span" size={14} weight={500}>
          {title}
        </Text>
        <CollapsableStateIndicator isOpen={isOpen} />
      </HStack>
      <AnimatePresence initial={false}>
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: isOpen ? height : 0 }}
          exit={{ height: 0 }}
          transition={{ duration: 0.3 }}
          style={{ overflow: 'hidden' }}
        >
          <VStack gap={12} padding="0 24px 24px" ref={ref}>
            {children}
          </VStack>
        </motion.div>
      </AnimatePresence>
    </Section>
  )
}
