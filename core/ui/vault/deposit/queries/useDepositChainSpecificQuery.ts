import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { useChainSpecificQuery } from '@core/ui/chain/coin/queries/useChainSpecificQuery'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'

export const useDepositChainSpecificQuery = (
  transactionType?: TransactionType,
  selectedCoin?: AccountCoin | null
) => {
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const defaultCoin = useCurrentVaultCoin(coinKey)
  const coin = selectedCoin || defaultCoin

  return useChainSpecificQuery({
    coin,
    isDeposit: true,
    transactionType,
  })
}
