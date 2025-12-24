import { getEvmChainId } from '@core/chain/chains/evm/chainInfo'

import { EthereumResolver } from '../resolver'
import { getChain } from '../utils'

export const getNetVersion: EthereumResolver<void, string> = async () => {
  const chain = await getChain()

  return parseInt(getEvmChainId(chain), 16).toString()
}
