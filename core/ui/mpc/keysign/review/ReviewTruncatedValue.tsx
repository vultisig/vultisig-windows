import { ValueProp } from '@lib/ui/props'
import { MiddleTruncate } from '@lib/ui/truncate'

/**
 * A review-row value that may be long — an address, a memo — truncated in the
 * middle to the room the row leaves it, so both ends stay readable.
 */
export const ReviewTruncatedValue = ({ value }: ValueProp<string>) => (
  <MiddleTruncate
    text={value}
    width="100%"
    justifyContent="flex-end"
    size={14}
    weight={500}
  />
)
