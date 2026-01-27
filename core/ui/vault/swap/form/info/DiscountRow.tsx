import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { ReactNode } from 'react'
import styled from 'styled-components'

const DiscountRowContainer = styled(HStack)`
  align-items: center;
  gap: 4px;
`

const IconWrapper = styled.span`
  display: inline-flex;
  font-size: 16px;
`

export const DiscountRow = ({
  icon,
  children,
}: {
  icon: ReactNode
  children: ReactNode
}) => (
  <DiscountRowContainer>
    <IconWrapper>{icon}</IconWrapper>
    <Text size={12} color="shy">
      {children}
    </Text>
  </DiscountRowContainer>
)
