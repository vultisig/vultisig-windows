import { borderRadius } from '@lib/ui/css/borderRadius'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const Description = styled(VStack)`
  border: 1px dashed ${getColor('foregroundExtra')};
  ${borderRadius.lg};
  gap: 8px;
  padding: 12px;
`

export const Divider = styled.div`
  background-image: linear-gradient(
    90deg,
    ${getColor('foreground')} 0%,
    ${getColor('foregroundExtra')} 49.5%,
    ${getColor('foreground')} 100%
  );
  height: 1px;
`

export const Image = styled.img`
  height: 36px;
  width: 36px;
`

/**
 * Right-aligned value cell of a nowrap label/value row. `min-width: 0` lets
 * the flex item shrink below its content, so long unbroken values (keys,
 * hashes, large amounts) wrap instead of widening the row into horizontal
 * scroll.
 */
export const RowValue = styled(Text)`
  min-width: 0;
  flex: 1;
  text-align: right;
`

export const Section = styled(VStack)`
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  ${borderRadius.lg};
`

export const Verify = styled(HStack)`
  background-color: ${getColor('background')};
  border: 1px solid ${getColor('foregroundExtra')};
  ${borderRadius.lg};
  height: 28px;
  padding-left: 6px;
  padding-right: 8px;
`
