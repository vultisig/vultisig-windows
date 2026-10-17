import { borderRadius } from '@lib/ui/css/borderRadius'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled, { css } from 'styled-components'

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

/**
 * Label/value row that keeps a value beside its label while it fits on that
 * line, and otherwise wraps it onto its own full-width line below the label,
 * so long text reads as a left-aligned block instead of a ragged right one.
 */
export const FieldRow = styled.div`
  align-items: baseline;
  column-gap: 8px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  row-gap: 4px;
`

/** Label cell of a `FieldRow`; breaks anywhere when longer than the row. */
export const FieldLabel = styled(Text)`
  max-width: 100%;
  overflow-wrap: anywhere;
`

/**
 * Value cell of a `FieldRow`. The auto margin pushes it right while it
 * shares the label's line; once it wraps onto its own line it spans the row
 * and its text runs left-aligned. Line breaks in the value are kept, and
 * `$block` always starts the value on its own line.
 */
export const FieldValue = styled(Text)<{ $block?: boolean }>`
  margin-left: auto;
  max-width: 100%;
  min-width: 0;
  overflow-wrap: anywhere;
  white-space: pre-wrap;

  ${({ $block }) =>
    $block &&
    css`
      flex-basis: 100%;
    `}
`

/** Fields of a nested struct or array, indented under their parent. */
export const NestedFields = styled(VStack)`
  border-left: 1px solid ${getColor('foregroundExtra')};
  padding-left: 12px;
`

/**
 * Label cell beside a `HexValue`, capped at half the row so a long field
 * name wraps instead of squeezing the value out.
 */
export const HexLabel = styled(Text)`
  max-width: 50%;
  overflow-wrap: anywhere;
`

/**
 * Single-line value cell holding a middle-truncated address or hex value
 * and its copy button. `min-width: 0` lets it shrink so the truncation, not
 * the row, absorbs a long value.
 */
export const HexValue = styled(HStack)`
  flex: 1;
  min-width: 0;
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
