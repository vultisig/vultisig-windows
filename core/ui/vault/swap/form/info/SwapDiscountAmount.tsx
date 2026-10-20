import { ValueProp } from '@lib/ui/props'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'

import { SwapFeeFiatValue } from './SwapTotalFeeFiatValue'

/**
 * What a discount takes off the swap fee row, in fiat and signed as a
 * reduction, so reading the rows top to bottom subtracts down to the charge.
 *
 * One span, so a row that lays its value out as flex items keeps the sign
 * against the amount instead of spacing them apart.
 */
export const SwapDiscountAmount = ({ value }: ValueProp<SwapFee>) => (
  <span>
    -<SwapFeeFiatValue value={[value]} />
  </span>
)
