import { EthereumResolver } from '../resolver'
import { switchChainHandler } from '../utils'

export const addEthereumChain: EthereumResolver<[{ chainId: string }], null> =
  switchChainHandler
