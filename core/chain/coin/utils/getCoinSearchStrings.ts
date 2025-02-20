import { Coin } from '@core/chain/coin/Coin'

export const getCoinSearchString = ({ ticker }: Pick<Coin, 'ticker'>) => {
  return [ticker]
}
