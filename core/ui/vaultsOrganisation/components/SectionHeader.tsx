import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { ReactNode } from 'react'
import styled from 'styled-components'

type SectionHeaderProps = {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}

export const SectionHeader = ({
  title,
  subtitle,
  actions,
}: SectionHeaderProps) => {
  if (!title && !subtitle) {
    return null
  }

  return (
    <Header gap={12} alignItems="center" justifyContent="space-between">
      <VStack gap={4} alignItems="flex-start">
        {title && (
          <Text size={18} weight={600} color="contrast">
            {title}
          </Text>
        )}
        {subtitle && (
          <Text size={13} weight={500} color="shy">
            {subtitle}
          </Text>
        )}
      </VStack>
      {actions && <Actions gap={12}>{actions}</Actions>}
    </Header>
  )
}

const Header = styled(HStack)`
  width: 100%;
`

const Actions = styled(HStack)`
  & > * {
    flex-shrink: 0;
  }
`
