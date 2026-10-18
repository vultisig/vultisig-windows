import {
  FieldLabel,
  FieldRow,
  FieldValue,
} from '@core/inpage-provider/popup/view/resolvers/signMessage/styles'
import { FC } from 'react'

type LabeledValueRowProps = {
  label: string
  value: string
}

/**
 * A sign-message detail row. A single-line value that fits stays beside
 * its label; a longer or multi-line one goes below it as a left-aligned
 * block.
 */
export const LabeledValueRow: FC<LabeledValueRowProps> = ({ label, value }) => (
  <FieldRow>
    <FieldLabel as="span" color="shy" size={14} weight={500}>
      {label}
    </FieldLabel>
    <FieldValue as="span" size={14} weight={500} $block={value.includes('\n')}>
      {value}
    </FieldValue>
  </FieldRow>
)
