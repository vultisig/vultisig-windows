import { Text } from '@lib/ui/text'
import { ReactNode } from 'react'
import styled from 'styled-components'

const LabelContainer = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 4px;
`

const IconWrapper = styled.span`
  display: inline-flex;
  font-size: 16px;
`

type DiscountLabelProps = {
  icon: ReactNode
  children: ReactNode
}

/**
 * Label half of a discount row. Only the label — the surrounding row comes from
 * whichever surface is rendering, so a discount sits in the same primitive as
 * the fee rows above it instead of being a foreign element inside their list.
 */
export const DiscountLabel = ({ icon, children }: DiscountLabelProps) => (
  <LabelContainer>
    <IconWrapper>{icon}</IconWrapper>
    <Text as="span" size={12} color="shy">
      {children}
    </Text>
  </LabelContainer>
)
