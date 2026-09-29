import { SwapArrivalStatusResult } from '@vultisig/core-chain/swap/utils/getSwapArrivalStatus'
import { TxStatusResult } from '@vultisig/core-chain/tx/status/resolver'
import { match } from '@vultisig/lib-utils/match'

/**
 * Where a swap stands once its source transaction and, for a tracked
 * provider, the provider's own status are read together: still in flight,
 * paid out, or over without paying out.
 */
export type SwapOutcome = 'pending' | 'success' | 'failed'

/** Reads the source transaction's verdict as a swap outcome. */
export const getSwapSourceOutcome = ({ status }: TxStatusResult): SwapOutcome =>
  match(status, {
    pending: () => 'pending',
    not_found: () => 'pending',
    success: () => 'success',
    error: () => 'failed',
    expired: () => 'failed',
  })

/**
 * Reads the provider's verdict as a swap outcome. A refund is a failure here:
 * the user got their funds back rather than the asset they asked for. A
 * partial LI.FI fill is a success: something was delivered, and a retry would
 * spend it again.
 */
export const getSwapArrivalOutcome = ({
  status,
}: SwapArrivalStatusResult): SwapOutcome =>
  match(status, {
    pending: () => 'pending',
    not_found: () => 'pending',
    success: () => 'success',
    partial: () => 'success',
    refunded: () => 'failed',
    error: () => 'failed',
  })
