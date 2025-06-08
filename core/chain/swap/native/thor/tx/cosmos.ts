import { ThorChainSwapEnabledCosmosChain } from '../../NativeSwapChain'
import { ThorchainSwapTxInputDataResolver } from './ThorchainSwapTxInputDataResolver'

export const getCosmosThorchainSwapTxInputData: ThorchainSwapTxInputDataResolver<
  ThorChainSwapEnabledCosmosChain
> = () => {
  throw new Error('Cosmos Thorchain swap not implemented yet')
}
