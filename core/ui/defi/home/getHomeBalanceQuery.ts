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

/** `combined` adds only DeFi value the wallet total doesn't already hold, so receipt tokens never count twice. */
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
