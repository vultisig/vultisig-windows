import { HomeDisplay } from '@core/ui/storage/homeDisplay'
import { HomeTab } from '@core/ui/vault/home/homeTab'
import { TotalBalanceQuery } from '@core/ui/vault/queries/resolveCoinsTotalBalance'

type DefiTotalQuery = {
  data: number | undefined
  isPending: boolean
  isUpdating: boolean
  error: unknown
}

type GetHomeBalanceQueryInput = {
  display: HomeDisplay
  tab: HomeTab
  wallet: TotalBalanceQuery
  defi: DefiTotalQuery
  /** DeFi value the wallet total already counts (wallet-held receipt tokens). */
  walletHeldDefiFiat: number
}

/**
 * The total the home header shows. `separate` shows the tab's own total;
 * `combined` adds to the wallet total only the DeFi value it does not
 * already hold, so receipt tokens are never counted twice.
 */
export const getHomeBalanceQuery = ({
  display,
  tab,
  wallet,
  defi,
  walletHeldDefiFiat,
}: GetHomeBalanceQueryInput): TotalBalanceQuery => {
  if (display === 'separate') {
    if (tab === 'wallet') return wallet

    return {
      data: defi.data,
      isPending: defi.isPending,
      error: defi.error ?? null,
      isUpdating: defi.isUpdating,
      isIncomplete: false,
    }
  }

  const isDefiMissing = defi.data === undefined && defi.error !== null
  const defiNotInWallet =
    defi.data === undefined ? 0 : defi.data - walletHeldDefiFiat

  return {
    data: wallet.data === undefined ? undefined : wallet.data + defiNotInWallet,
    isPending: wallet.isPending,
    error: wallet.error,
    isUpdating: wallet.isUpdating || defi.isUpdating,
    isIncomplete: wallet.isIncomplete || isDefiMissing,
  }
}
