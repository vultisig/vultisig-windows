import { vult } from '@core/chain/coin/knownTokens'
import { getSwapAffiliateBps } from '@core/chain/swap/affiliate'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'

export const useSwapAffiliateBpsQuery = () => {
  const address = useCurrentVaultAddress(vult.chain)

  const balanceQuery = useBalanceQuery({
    chain: vult.chain,
    id: vult.id,
    address,
  })

  return useTransformQueryData(balanceQuery, getSwapAffiliateBps)
}
