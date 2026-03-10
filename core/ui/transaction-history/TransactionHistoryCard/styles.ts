import { HStack, VStack } from '@lib/ui/layout/Stack'
import { getColor, matchColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

/** Card: foreground bg, foregroundExtra border, 16px padding, 16px radius. Figma: surface-1 #061b3a, borders/light #11284a */
export const Card = styled(VStack).attrs({
  direction: 'vertical',
  alignItems: 'stretch',
  gap: 12,
})`
  padding: 16px;
  border-radius: 16px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  width: 100%;
  max-width: 343px;
  box-sizing: border-box;
`

/** Row 1: tag (left) + status (right). Space-between, align center. */
export const TopRow = styled(HStack).attrs({
  direction: 'horizontal',
  alignItems: 'center',
  justifyContent: 'space-between',
})`
  width: 100%;
`

/** Status label: 12px caption. Successful = green, Pending = neutral, Error = red. */
export const StatusLabel = styled.span<{
  $status: 'successful' | 'pending' | 'error'
}>`
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.12px;
  color: ${matchColor('$status', {
    successful: 'success',
    pending: 'idle',
    error: 'danger',
  })};
`

/** Row 2: amount block (left) + address pill (right). Space-between. */
export const DetailsRow = styled(HStack).attrs({
  direction: 'horizontal',
  alignItems: 'center',
  justifyContent: 'space-between',
})`
  width: 100%;
`

/** Left block: optional icon (24px) + amount column. Gap 8px (Figma Receive/Swap); Send uses 12px icon-to-amount, we use 8 for consistency. */
export const AmountBlock = styled(HStack).attrs({
  direction: 'horizontal',
  alignItems: 'center',
  gap: 8,
})`
  min-width: 0;
  flex: 1;
`

/** Icon slot: 24x24. */
export const IconSlot = styled.div`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 12px;
`

/** USD + crypto stack. Minimal gap (Figma ~0 between lines in some frames). */
export const AmountTextStack = styled(VStack).attrs({
  direction: 'vertical',
  alignItems: 'start',
  gap: 0,
})``

/** Address pill: surface-2 bg, borders/normal border. px 16 py 8, radius 99px. Gap between prefix and address (Figma ~4px). */
export const AddressPill = styled(HStack).attrs({
  direction: 'horizontal',
  alignItems: 'center',
  gap: 4,
})`
  padding: 8px 16px;
  border-radius: 99px;
  background: ${getColor('buttonSecondary')};
  border: 1px solid ${getColor('foregroundSuper')};
  flex-shrink: 0;
`

/** Error message row: aligned to the right. */
export const ErrorMessageRow = styled(HStack).attrs({
  direction: 'horizontal',
  alignItems: 'center',
  justifyContent: 'flex-end',
})`
  width: 100%;
`
