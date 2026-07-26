import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { solanaStakingFloorFee } from '@core/ui/chain/solana/staking/getSolanaStakingFee'
import { useSolanaRentReserveQuery } from '@core/ui/chain/solana/staking/queries/useSolanaRentReserveQuery'
import { Chain } from '@vultisig/core-chain/Chain'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'

import { useDepositCoin } from '../providers/DepositCoinProvider'

/**
 * How much of the wallet's liquid SOL can actually be delegated, in lamports.
 *
 * A delegate creates a NEW stake account and funds it with the entered amount
 * PLUS the rent-exempt reserve, and the wallet also pays the transaction fee —
 * so the spendable ceiling is `balance − rentReserve − fee`, not the raw
 * balance. Staking the raw balance encodes a transfer the account cannot cover
 * and the network rejects it at simulation ("insufficient lamports"), after the
 * keysign ceremony has already signed it.
 *
 * Single source for the delegate form's displayed max, its percentage pills and
 * the schema bound the Continue CTA gates on, so all three agree to the lamport.
 */
export const useSolanaStakeableBalance = () => {
  const [coin] = useDepositCoin()
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))
  const rentReserveQuery = useSolanaRentReserveQuery({
    enabled: coin.chain === Chain.Solana,
  })

  const balance = balanceQuery.data ?? 0n
  const rentReserve = rentReserveQuery.data ?? 0n
  const reserved = rentReserve + solanaStakingFloorFee

  return {
    balance,
    rentReserve,
    stakeable: balance > reserved ? balance - reserved : 0n,
  }
}
