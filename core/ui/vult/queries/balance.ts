import { vult } from '@core/chain/coin/knownTokens'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'

export const useVultBalanceQuery = () => {
  const address = useCurrentVaultAddress(vult.chain)

  return useBalanceQuery({
    chain: vult.chain,
    id: vult.id,
    address,
  })
}
