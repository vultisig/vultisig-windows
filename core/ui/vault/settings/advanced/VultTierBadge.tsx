import { borderRadius } from '@lib/ui/css/borderRadius'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

/** Pill marking a setting as a $VULT tier perk. */
export const VultTierBadge = styled(Text).attrs({
  as: 'span',
  variant: 'caption',
  nowrap: true,
})`
  background-color: ${getColor('foregroundDark')};
  border: 1px solid ${getColor('foregroundExtra')};
  ${borderRadius.pill}
  color: ${getColor('primaryAccentFour')};
  padding: 2px 7px;
`
