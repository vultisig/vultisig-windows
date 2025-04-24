import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'

const ETHTicker = chainFeeCoin[Chain.Ethereum].ticker
export const shouldDisplayChainLogo = ({
  ticker,
  chain,
  isNative,
}: {
  ticker: string
  chain: Chain
  isNative: boolean
}): boolean => {
  return !isNative || (ticker === ETHTicker && chain !== Chain.Ethereum)
}
