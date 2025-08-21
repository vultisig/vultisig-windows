import { AccountCoin } from '../AccountCoin'

export const findByTicker = (coins: AccountCoin[], ticker: string) =>
  (coins || []).find(c => c.ticker === ticker) ?? null
