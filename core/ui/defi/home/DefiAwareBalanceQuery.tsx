import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import {
  mayaDefiCoins,
  thorchainDefiCoins,
} from '@core/ui/defi/chain/queries/tokens'
import { useDefiPortfolioBalance } from '@core/ui/defi/page/hooks/useDefiPortfolios'
import { HomeDisplay } from '@core/ui/storage/homeDisplay'
import { HomeTab } from '@core/ui/vault/home/homeTab'
import { RenderHomeBalance } from '@core/ui/vault/home/renderHomeBalance'
import { useVaultTotalBalanceQuery } from '@core/ui/vault/queries/useVaultTotalBalanceQuery'

import {
  getDefiNotInWalletFiat,
  getHomeBalanceQuery,
} from './getHomeBalanceQuery'
import { useWalletHeldDefiFiat } from './useWalletHeldDefiFiat'
import { useCacheVaultDefiNotInWalletFiat } from './vaultDefiNotInWalletFiat'

type DefiAwareBalanceQueryProps = {
  display: HomeDisplay
  tab: HomeTab
  children: RenderHomeBalance
}

/** Hands `children` the home total whenever it involves DeFi positions. */
export const DefiAwareBalanceQuery = ({
  display,
  tab,
  children,
}: DefiAwareBalanceQueryProps) => {
  const wallet = useVaultTotalBalanceQuery()
  const defi = useDefiPortfolioBalance()
  const walletHeldDefiFiat = useWalletHeldDefiFiat()
  // Positions value a missing or failed price at 0, and a failed read at 0, so only a clean, complete total is cached.
  const thorchainPricesQuery = useCoinPricesQuery({ coins: thorchainDefiCoins })
  const mayaPricesQuery = useCoinPricesQuery({ coins: mayaDefiCoins })
  const isSettled =
    !defi.isUpdating &&
    !defi.error &&
    [thorchainPricesQuery, mayaPricesQuery].every(
      ({ isPending, errors }) => !isPending && errors.length === 0
    )
  const settledDefiNotInWalletFiat = isSettled
    ? getDefiNotInWalletFiat({ defiFiat: defi.data, walletHeldDefiFiat })
    : undefined
  useCacheVaultDefiNotInWalletFiat(settledDefiNotInWalletFiat)

  return (
    <>
      {children(
        getHomeBalanceQuery({ display, tab, wallet, defi, walletHeldDefiFiat })
      )}
    </>
  )
}
