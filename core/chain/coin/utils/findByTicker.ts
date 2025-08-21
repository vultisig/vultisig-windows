import { AccountCoin } from '../AccountCoin'

type FindByTickerInput = {
  coins: readonly AccountCoin[]
  ticker: string
}

export const findByTicker = ({
  coins,
  ticker,
}: FindByTickerInput): AccountCoin | null =>
  coins.find(c => c.ticker === ticker) ?? null
