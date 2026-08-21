import { toChainAmount } from '@vultisig/core-chain/amount/toChainAmount'
import {
  KaminoShareAmount,
  kaminoTokenAmount,
  kaminoTokenToShareAmount,
} from '@vultisig/core-chain/chains/solana/kamino/amount'
import { KaminoSharePosition } from '@vultisig/core-chain/chains/solana/kamino/position'
import { KaminoRate } from '@vultisig/core-chain/chains/solana/kamino/rate'

type ResolveWithdrawSharesInput = {
  /** What the holder typed, in the underlying token. */
  tokenAmount: number
  tokenDecimals: number
  /** Underlying tokens per share, exact. */
  tokensPerShare: KaminoRate
  position: KaminoSharePosition
  /**
   * Whether the holder asked for everything. A max withdraw sends the held
   * share balance ITSELF rather than a share count derived from a token
   * figure: the derivation truncates, so it would leave dust behind, and
   * rounding the other way would ask for more than the position holds — which
   * Kamino rewrites to its withdraw-everything sentinel.
   */
  isMax: boolean
}

/**
 * The share count a withdrawal should burn.
 *
 * Every conversion is the chain package's exact integer arithmetic — no float
 * math here — and the result is capped at the position's spendable balance,
 * which already sits strictly below the reported total so the sentinel can
 * never be named. `undefined` when the amount cannot be converted at all.
 */
export const resolveWithdrawShares = ({
  tokenAmount,
  tokenDecimals,
  tokensPerShare,
  position,
  isMax,
}: ResolveWithdrawSharesInput): KaminoShareAmount | undefined => {
  if (isMax) return position.spendable

  const shares = kaminoTokenToShareAmount({
    tokens: kaminoTokenAmount(
      toChainAmount(tokenAmount, tokenDecimals),
      tokenDecimals
    ),
    tokensPerShare,
    shareDecimals: position.spendable.decimals,
  })
  if (!shares) return undefined

  // A typed amount can still outrun the balance — the rate moves between the
  // read and the keystroke — and asking for more than is held is the one
  // request Kamino answers by emptying the position.
  return shares.baseUnits > position.spendable.baseUnits
    ? position.spendable
    : shares
}
