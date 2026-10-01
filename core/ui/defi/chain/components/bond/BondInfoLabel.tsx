import { HStack } from '@lib/ui/layout/Stack'
import { ChildrenProp, IconProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${getColor('textShy')};
  font-size: 16px;
`

/** A bonded node card's icon-led field label, such as APY or Next Churn. */
export const BondInfoLabel = ({ icon, children }: ChildrenProp & IconProp) => (
  <HStack alignItems="center" gap={8}>
    <IconContainer>{icon}</IconContainer>
    <Text size={13} color="shy">
      {children}
    </Text>
  </HStack>
)
