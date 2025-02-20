import { Coin } from '@core/chain/coin/Coin'

export const sortCoinsAlphabetically = <T extends Pick<Coin, 'ticker'>>(
  coins: T[]
): T[] => {
  return [...coins].sort((a, b) => a.ticker.localeCompare(b.ticker))
}
