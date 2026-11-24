/**
 * Where an amount edit came from. Typing arrives one key at a time, so a
 * comma there can only be a decimal point being entered; a paste arrives
 * whole, so its comma may be either a decimal point or digit grouping.
 */
export type AmountInputSource = 'typing' | 'paste'

/**
 * A single comma with exactly three digits after it and nothing following:
 * the shape of one grouped thousand (`1,000`, `12,345`). A second separator
 * is already rejected by the parsers, so `1,000.50` and `1,000,000` never
 * reach this check.
 */
const groupedThousandPattern = /,\d{3}$/

type IsAmbiguousGroupedPasteInput = {
  value: string
  source: AmountInputSource
}

/**
 * True when a pasted amount's comma is as likely to be digit grouping as a
 * decimal point. Reading `1,000` as `1.000` would send a thousandth of the
 * intended amount with nothing on screen to say so, so such a paste is
 * refused outright and the field keeps what it had. Typing is left permissive:
 * a refused keystroke is what made `1,5` send as `15` (#5289).
 */
export const isAmbiguousGroupedPaste = ({
  value,
  source,
}: IsAmbiguousGroupedPasteInput) =>
  source === 'paste' && groupedThousandPattern.test(value)
