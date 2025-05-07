import { AccountCoin } from '@core/chain/coin/AccountCoin'

export const adjustVaultChainCoinsLogos = (coin: AccountCoin): AccountCoin => ({
  ...coin,
  // Enrich raw logos for auto-discovered coins from IBC Transfer
  logo: coin.id.startsWith('thor') ? `${coin.logo}.png` : coin.logo,
})
