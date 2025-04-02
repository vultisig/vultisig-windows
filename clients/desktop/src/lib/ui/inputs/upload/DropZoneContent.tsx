import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { ChildrenProp, IconProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { VStack } from '../../layout/Stack'
import { Text } from '../../text'

const IconContainer = styled(IconWrapper)`
  color: ${getColor('primary')};
  font-size: 60px;
`

export const DropZoneContent = ({
  children,
  icon,
}: ChildrenProp & IconProp) => {
  return (
    <VStack gap={16} alignItems="center">
      <IconContainer>{icon}</IconContainer>
      <Text color="regular" weight="600" size={14}>
        {children}
      </Text>
    </VStack>
  )
}
