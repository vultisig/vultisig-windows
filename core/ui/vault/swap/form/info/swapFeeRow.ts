import { ReactNode } from 'react'

type SwapFeeRow = {
  label: ReactNode
  value: ReactNode
}

/**
 * Lays out a single row of the swap cost breakdown. The form, the verify screen
 * and the keysign overview each use different row primitives, so they own the
 * layout while the row set and its wording stay shared between them.
 *
 * A plain function rather than a component: an inline component would be a new
 * type on every render and remount each row's fiat query.
 */
export type SwapFeeRowRenderer = (row: SwapFeeRow) => ReactNode
