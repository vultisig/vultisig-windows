import { HStack } from '@lib/ui/layout/Stack'
import { Text, TextColor } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'

const Container = styled(HStack)`
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 20px;
`

const Label = styled(Text)`
  flex-shrink: 0;
`

const Value = styled(Text)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  min-width: 0;
  text-align: right;
`

type ReviewRowProps = {
  label: ReactNode
  value: ReactNode
  /** `small` is the caption size used by the secondary swap rows. */
  size?: 'regular' | 'small'
  valueColor?: TextColor
}

/**
 * One detail line of a review sheet: a muted label on the left, the value
 * right-aligned. Rows are separated by {@link ReviewDivider}, not boxed.
 */
export const ReviewRow = ({
  label,
  value,
  size = 'regular',
  valueColor = 'regular',
}: ReviewRowProps) => (
  <Container>
    <Label
      as="span"
      variant={size === 'small' ? 'caption' : 'footnote'}
      color="shy"
    >
      {label}
    </Label>
    <Value
      as="div"
      variant={size === 'small' ? 'caption' : 'stationBodyS'}
      color={valueColor}
    >
      {value}
    </Value>
  </Container>
)

/** Hairline between review rows. */
export const ReviewDivider = styled.div`
  height: 1px;
  flex-shrink: 0;
  background: ${getColor('foregroundExtra')};
`
