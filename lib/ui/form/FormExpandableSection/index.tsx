import { borderRadius } from '@lib/ui/css/borderRadius'
import { CheckCircleIcon } from '@lib/ui/icons/CheckCircleIcon'
import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { SquarePenIcon } from '@lib/ui/icons/SquarePenIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { AnimatePresence, motion } from 'framer-motion'
import { ReactNode } from 'react'
import styled from 'styled-components'

const Container = styled(VStack)`
  border: 1px solid ${getColor('foregroundExtra')};
  ${borderRadius.m};
  overflow: hidden;
`

const Header = styled(HStack)`
  padding: 16px;
  cursor: pointer;
  user-select: none;
  background: ${getColor('foreground')};
  transition: background 0.2s;

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`

const Content = styled(motion.div)`
  overflow: hidden;
`

const CollapsableStateIndicator = styled(IconWrapper)<{ isOpen?: boolean }>`
  transform: rotateZ(${({ isOpen }) => (isOpen ? '-180deg' : '0deg')});
  transition: transform 0.3s;
`

type FormExpandableSectionProps = {
  title: string
  isExpanded: boolean
  isValid: boolean
  valuePreview?: string
  onToggle: () => void
  children: ReactNode
}

export const FormExpandableSection = ({
  title,
  isExpanded,
  isValid,
  valuePreview,
  onToggle,
  children,
}: FormExpandableSectionProps) => {
  return (
    <Container>
      <Header
        alignItems="center"
        justifyContent="space-between"
        onClick={onToggle}
      >
        <HStack alignItems="center" gap={12} flexGrow>
          <Text size={14} weight={500} color="contrast">
            {title}
          </Text>
          {!isExpanded && isValid && valuePreview && (
            <Text size={12} color="shy" weight={400} nowrap cropped>
              {valuePreview}
            </Text>
          )}
        </HStack>
        <HStack alignItems="center" gap={12}>
          {!isExpanded && isValid && (
            <HStack alignItems="center" gap={8}>
              <IconWrapper color="success" size={20}>
                <CheckCircleIcon />
              </IconWrapper>
              <IconWrapper color="contrast" size={20}>
                <SquarePenIcon />
              </IconWrapper>
            </HStack>
          )}
          <CollapsableStateIndicator
            isOpen={isExpanded}
            size={16}
            color="contrast"
          >
            <ChevronDownIcon />
          </CollapsableStateIndicator>
        </HStack>
      </Header>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <Content
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <VStack
              padding={16}
              gap={20}
              style={{ borderTop: `1px solid ${getColor('foregroundExtra')}` }}
            >
              {children}
            </VStack>
          </Content>
        )}
      </AnimatePresence>
    </Container>
  )
}
