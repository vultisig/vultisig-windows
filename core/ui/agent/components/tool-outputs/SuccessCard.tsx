import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, ReactNode } from 'react'
import styled from 'styled-components'

type SuccessCardProps = {
  title: string
  children?: ReactNode
}

export const SuccessCard: FC<SuccessCardProps> = ({ title, children }) => {
  return (
    <Container>
      <VStack gap={12}>
        <HStack gap={8} alignItems="center">
          <SuccessIcon>✓</SuccessIcon>
          <Text size={14} weight={600} color="regular">
            {title}
          </Text>
        </HStack>
        {children}
      </VStack>
    </Container>
  )
}

const Container = styled.div`
  padding: 12px 16px;
  background: ${getColor('foreground')};
  border-radius: 8px;
  border: 1px solid ${getColor('mist')};
`

const SuccessIcon = styled.span`
  color: ${getColor('primary')};
  font-size: 14px;
  font-weight: 600;
`
