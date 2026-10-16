import { useDefiPortfolioBalance } from '@core/ui/defi/page/hooks/useDefiPortfolios'
import { HomeDisplay } from '@core/ui/storage/homeDisplay'
import { HomeTab } from '@core/ui/vault/home/homeTab'
import { RenderHomeBalance } from '@core/ui/vault/home/renderHomeBalance'
import { useVaultTotalBalanceQuery } from '@core/ui/vault/queries/useVaultTotalBalanceQuery'

import { getHomeBalanceQuery } from './getHomeBalanceQuery'
import { useWalletHeldDefiFiat } from './useWalletHeldDefiFiat'

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

  return (
    <>
      {children(
        getHomeBalanceQuery({ display, tab, wallet, defi, walletHeldDefiFiat })
      )}
    </>
  )
}
