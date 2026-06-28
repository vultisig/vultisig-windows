import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { tonStakingWithdrawFee } from '@vultisig/core-chain/chains/ton/staking'
import { Coin, extractCoinKey } from '@vultisig/core-chain/coin/Coin'

type StakeTonAsSendBase = {
  coin: Coin
  /** Bounceable user-friendly (`EQ…`) pool address. */
  poolAddress: string
  /** Deposit or withdraw text comment (the pool-specific protocol token). */
  memo: string
}

/**
 * Stake requires an explicit deposit `amount` (nanotons). Unstake takes none —
 * it sends the fixed 0.2 TON withdraw fee and the pool returns the staked
 * balance. The discriminated union enforces this so a stake can never reach the
 * send state with an undefined amount.
 */
type StakeTonAsSendInput =
  | (StakeTonAsSendBase & { kind: 'stake'; amount: bigint })
  | (StakeTonAsSendBase & { kind: 'unstake' })

/**
 * Routes a TON nominator-pool stake/unstake into the existing send flow's verify
 * step. Both are plain TON transfers with a text comment to the bounceable pool
 * address — the send pipeline signs them via the standard TON path, and the
 * `EQ…` destination makes the chain-specific resolver mark the transfer
 * bounceable (a rejected deposit bounces back instead of being absorbed/lost).
 */
export const useStakeTonAsSend = () => {
  const navigate = useCoreNavigate()

  return (input: StakeTonAsSendInput) => {
    const { coin, poolAddress, memo, kind } = input
    const sendAmount = kind === 'unstake' ? tonStakingWithdrawFee : input.amount

    navigate({
      id: 'send',
      state: {
        coin: extractCoinKey(coin),
        address: poolAddress,
        amount: sendAmount,
        memo,
        skipToVerify: true,
      },
    })
  }
}
