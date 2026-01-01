import { getEvmChainId } from '@core/chain/chains/evm/chainInfo'

import { getChain } from '../utils'

export const getNetVersion = async (): Promise<string> => {
  const chain = await getChain()

  return parseInt(getEvmChainId(chain), 16).toString()
}
