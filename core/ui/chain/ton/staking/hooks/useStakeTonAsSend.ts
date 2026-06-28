import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { tonStakingWithdrawFee } from '@vultisig/core-chain/chains/ton/staking'
import { Coin, extractCoinKey } from '@vultisig/core-chain/coin/Coin'

type StakeTonAsSendInput = {
  coin: Coin
  /** Bounceable user-friendly (`EQ…`) pool address. */
  poolAddress: string
  /** Deposit or withdraw text comment (the pool-specific protocol token). */
  memo: string
  kind: 'stake' | 'unstake'
  /**
   * Deposit amount in nanotons (stake only). Unstake ignores it and sends the
   * fixed 0.2 TON withdraw fee — the pool returns the staked balance.
   */
  amount?: bigint
}

/**
 * Routes a TON nominator-pool stake/unstake into the existing send flow's verify
 * step. Both are plain TON transfers with a text comment to the bounceable pool
 * address — the send pipeline signs them via the standard TON path, and the
 * `EQ…` destination makes the chain-specific resolver mark the transfer
 * bounceable (a rejected deposit bounces back instead of being absorbed/lost).
 */
export const useStakeTonAsSend = () => {
  const navigate = useCoreNavigate()

  return ({ coin, poolAddress, memo, kind, amount }: StakeTonAsSendInput) => {
    const sendAmount = kind === 'unstake' ? tonStakingWithdrawFee : amount

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
