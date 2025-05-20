import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { useChainSpecificQuery } from '@core/ui/chain/coin/queries/useChainSpecificQuery'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'

export const useDepositChainSpecificQuery = (
  transactionType?: TransactionType
) => {
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const coin = useCurrentVaultCoin(coinKey)

  return useChainSpecificQuery({
    coin,
    isDeposit: true,
    transactionType,
  })
}
