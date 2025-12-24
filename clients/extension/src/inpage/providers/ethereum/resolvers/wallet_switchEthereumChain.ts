import { EthereumResolver } from '../resolver'
import { switchChainHandler } from '../utils'

export const switchEthereumChain: EthereumResolver<
  [{ chainId: string }],
  null
> = switchChainHandler
