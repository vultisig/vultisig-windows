import { HStack, VStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { FC, ReactNode } from 'react'
import styled from 'styled-components'

type ResultRowProps = {
  icon?: ReactNode
  children: ReactNode
  extra?: ReactNode
}

export const ResultRow: FC<ResultRowProps> = ({ icon, children, extra }) => {
  return (
    <Container>
      <HStack gap={12} alignItems="center" fullWidth>
        {icon && <IconContainer>{icon}</IconContainer>}
        <VStack gap={2} flexGrow>
          {children}
        </VStack>
        {extra && <HStack gap={4}>{extra}</HStack>}
      </HStack>
    </Container>
  )
}

const Container = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${getColor('mist')};

  &:last-child {
    border-bottom: none;
  }
`

const IconContainer = styled.div`
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`
