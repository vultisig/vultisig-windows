/**
 * Shared list styling for vault settings. Lives in a leaf module so `backup/index.tsx`
 * can use it without importing the settings page barrel (which imports backup).
 */
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
