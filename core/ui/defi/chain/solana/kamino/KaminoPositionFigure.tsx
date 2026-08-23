import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'

type KaminoPositionFigureProps = {
  /** Left-hand copy, already carrying its amount ("Deposited: 1,000 USDC"). */
  label: string
  /**
   * The same amount in fiat, opposite. Omitted when the underlying token's
   * price could not be read — a figure is dropped rather than shown as zero.
   */
  fiat?: string
}

/**
 * One line of a Kamino position: the token figure on the left, its fiat value
 * on the right.
 */
export const KaminoPositionFigure = ({
  label,
  fiat,
}: KaminoPositionFigureProps) => (
  <HStack justifyContent="space-between" alignItems="center" gap={8}>
    <Text size={13}>{label}</Text>
    {fiat ? (
      <Text size={13} color="shy">
        {fiat}
      </Text>
    ) : null}
  </HStack>
)
