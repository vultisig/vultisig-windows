import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { useMemo } from 'react'

const MERGE_ACCEPTED_TOKENS = ['KUJI', 'RKUJI', 'FUZN', 'NSTK', 'WINK', 'LVN']

const TOKEN_MERGE_CONTRACTS: Record<string, string> = {
  KUJI: 'thor14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s3p2nzy',
  RKUJI: 'thor1yyca08xqdgvjz0psg56z67ejh9xms6l436u8y58m82npdqqhmmtqrsjrgh',
  FUZN: 'thor1suhgf5svhu4usrurvxzlgn54ksxmn8gljarjtxqnapv8kjnp4nrsw5xx2d',
  NSTK: 'thor1cnuw3f076wgdyahssdkd0g3nr96ckq8cwa2mh029fn5mgf2fmcmsmam5ck',
  WINK: 'thor1yw4xvtc43me9scqfr2jr2gzvcxd3a9y4eq7gaukreugw2yd2f8tsz3392y',
  LVN: 'thor1ltd0maxmte3xf4zshta9j5djrq9cl692ctsp9u5q0p9wss0f5lms7us4yf',
}

export const useMergeAcceptedTokens = () => {
  const coins = useCurrentVaultCoins()
  return useMemo(
    () =>
      coins
        .filter(coin =>
          MERGE_ACCEPTED_TOKENS.includes(coin.ticker.toUpperCase())
        )
        .map(coin => ({
          ...coin,
          thorchainContractAddress: TOKEN_MERGE_CONTRACTS[coin.ticker],
        })),
    [coins]
  )
}
