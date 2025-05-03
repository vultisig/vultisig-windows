import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'

const MERGE_ACCEPTED_TOKENS = ['KUJI', 'RKUJI', 'FUZN', 'NSTK', 'WINK', 'LVN']

export const useMergeAcceptedTokens = () => {
  const coins = useCurrentVaultCoins()
  return coins.filter(coin => MERGE_ACCEPTED_TOKENS.includes(coin.ticker))
}
