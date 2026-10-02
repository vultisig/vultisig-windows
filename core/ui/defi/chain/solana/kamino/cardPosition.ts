import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import {
  KaminoShareAmount,
  kaminoShareToTokenValue,
  KaminoTokenAmount,
} from '@vultisig/core-chain/chains/solana/kamino/amount'
import {
  KaminoRate,
  parseKaminoRate,
} from '@vultisig/core-chain/chains/solana/kamino/rate'

import { KaminoCardPosition } from './KaminoVaultCard'

type CardPositionInput = {
  /** The owner's shares and PnL in this vault; absent when it holds none. */
  holding?: {
    shares: KaminoShareAmount
    /** Lifetime PnL in the underlying token, as Kamino reported it. */
    pnlToken?: string
  }
  tokensPerShare: KaminoRate
  tokenDecimals: number
  isPending: boolean
  hasFailed: boolean
}

/**
 * What the card may claim about a position, from how far the balance read
 * got. A pending or failed read is never reported as an empty vault: telling
 * a depositor they hold nothing is the one wrong answer here, and zero is
 * indistinguishable from unread until the query settles. Shares that cannot
 * be valued are the same failure.
 *
 * The current value already contains the interest, so the deposit is the
 * value minus the lifetime PnL. Without a readable PnL the deposit falls back
 * to the value, so an outage never takes the holding off the card.
 */
export const cardPosition = ({
  holding,
  tokensPerShare,
  tokenDecimals,
  isPending,
  hasFailed,
}: CardPositionInput): KaminoCardPosition => {
  if (isPending) return { status: 'pending' }
  if (hasFailed) return { status: 'unavailable' }
  if (!holding) return { status: 'settled', tokenAmount: 0, deposited: 0 }

  const value = kaminoShareToTokenValue({
    shares: holding.shares,
    tokensPerShare,
    tokenDecimals,
  })
  if (!value) return { status: 'unavailable' }

  const tokenAmount = fromChainAmount(value.baseUnits, value.decimals)
  const { pnlToken } = holding
  const pnl = pnlToken === undefined ? undefined : parseKaminoRate(pnlToken)
  if (!pnl) return { status: 'settled', tokenAmount, deposited: tokenAmount }

  return {
    status: 'settled',
    tokenAmount,
    deposited: fromChainAmount(depositedBaseUnits(value, pnl), value.decimals),
    pnl: Number(pnlToken),
  }
}

/** `value − pnl` in exact integers, truncated toward zero at the value's scale. */
const depositedBaseUnits = (value: KaminoTokenAmount, pnl: KaminoRate) => {
  const scale = Math.max(value.decimals, pnl.scale)
  const valueAtScale = value.baseUnits * 10n ** BigInt(scale - value.decimals)
  const pnlAtScale = pnl.numerator * 10n ** BigInt(scale - pnl.scale)
  return (valueAtScale - pnlAtScale) / 10n ** BigInt(scale - value.decimals)
}
