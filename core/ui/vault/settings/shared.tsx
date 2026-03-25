import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const ListItemIconWrapper = styled(IconWrapper)`
  font-size: 20px;
  color: ${getColor('primaryAlt')};
`

export const DescriptionText = styled(Text)`
  color: ${getColor('textShyExtra')};
  font-size: 12px;
`
