import { chainInfos } from '@core/chain/coin/chainInfo'

export const getCoinOptions = () => {
  const coins = Object.values(chainInfos)
  return coins.map(({ chain, ticker, logo }, index) => ({
    value: chain,
    label: ticker,
    logo: logo,
    isLastOption: index === coins.length - 1,
  }))
}
