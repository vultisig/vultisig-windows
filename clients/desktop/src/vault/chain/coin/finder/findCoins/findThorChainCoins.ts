import { FindCoinsResolver } from './FindCoinsResolver'

export const findThorChainCoins: FindCoinsResolver = async ({ address }) => {
  console.log('findThorChainCoins', address)

  return []
}
