import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { CollapsableStateIndicator } from '@lib/ui/layout/CollapsableStateIndicator'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, ReactNode, useState } from 'react'
import styled from 'styled-components'

const CollapseWrapper = styled(VStack)`
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 16px;
  cursor: pointer;
`

type CollapseProps = {
  children: ReactNode
  title: string
}

export const Collapse: FC<CollapseProps> = ({ children, title }) => {
  const [isOpen, setIsOpen] = useState(false)
  const toggle = () => setIsOpen(prev => !prev)

  return (
    <CollapseWrapper
      onClick={toggle}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          toggle()
        }
      }}
      role="button"
      tabIndex={0}
      aria-expanded={isOpen}
    >
      <HStack alignItems="center" justifyContent="space-between" padding={24}>
        <Text as="span" size={14} weight={500}>
          {title}
        </Text>
        <CollapsableStateIndicator isOpen={isOpen} />
      </HStack>
      <AnimatedVisibility isOpen={isOpen} animationConfig="exitToTop">
        <VStack gap={12} padding="0 24px 24px">
          {children}
        </VStack>
      </AnimatedVisibility>
    </CollapseWrapper>
  )
}
