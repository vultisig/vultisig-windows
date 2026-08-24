import { KaminoCardPosition } from './KaminoVaultCard'

type CardPositionInput = {
  tokenAmount: number
  pnlToken?: number
  isPending: boolean
  hasFailed: boolean
}

/**
 * What the card may claim about a position, from how far the balance read
 * got. A pending or failed read is never reported as an empty vault: telling
 * a depositor they hold nothing is the one wrong answer here, and zero is
 * indistinguishable from unread until the query settles.
 */
export const cardPosition = ({
  tokenAmount,
  pnlToken,
  isPending,
  hasFailed,
}: CardPositionInput): KaminoCardPosition => {
  if (isPending) return { status: 'pending' }
  if (hasFailed) return { status: 'unavailable' }
  return { status: 'settled', tokenAmount, pnlToken }
}
