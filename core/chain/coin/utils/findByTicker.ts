import { Coin } from '../Coin'

type FindByTickerInput<T extends Coin> = {
  coins: T[]
  ticker: string
}

export const findByTicker = <T extends Coin>({
  coins,
  ticker,
}: FindByTickerInput<T>): T | null =>
  coins.find(c => c.ticker === ticker) ?? null
