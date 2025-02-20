import { getSuiClient } from '../../chains/sui/client'
import { CoinBalanceResolver } from './CoinBalanceResolver'

export const getSuiCoinBalance: CoinBalanceResolver = async input => {
  const rpcClient = getSuiClient()

  const { totalBalance } = await rpcClient.getBalance({
    owner: input.address,
  })

  return BigInt(totalBalance)
}
