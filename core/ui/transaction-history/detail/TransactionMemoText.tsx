import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'

/**
 * A transaction's memo as a detail row's value. Text memos wrap at their
 * spaces; one with no spaces, such as EVM calldata, breaks between characters
 * so it wraps inside the card instead of running past its edge.
 */
export const TransactionMemoText = ({ value }: ValueProp<string>) => (
  <Text style={{ overflowWrap: 'anywhere', textAlign: 'right' }}>{value}</Text>
)
