import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { useChainSpecificQuery } from '@core/ui/chain/coin/queries/useChainSpecificQuery'

export const useDepositChainSpecificQuery = (
  coin: AccountCoin,
  transactionType?: TransactionType
) => {
  return useChainSpecificQuery({
    coin,
    isDeposit: true,
    transactionType,
  })
}
