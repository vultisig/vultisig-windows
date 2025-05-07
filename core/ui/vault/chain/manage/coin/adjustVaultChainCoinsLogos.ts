import { Coin } from '@core/chain/coin/Coin'

export const adjustVaultChainCoinsLogos = <T extends Coin>(coin: T): T => ({
  ...coin,
  // Specific requirement for raw logos for auto-discovered coins from IBC Transfer
  logo:
    coin.id.startsWith('thor') &&
    coin.ticker !== 'KUJI' &&
    coin.ticker !== 'LVN'
      ? `${coin.logo}.png`
      : coin.logo,
})
