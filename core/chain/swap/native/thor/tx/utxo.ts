import { ThorChainSwapEnabledUtxoChain } from '../../NativeSwapChain'
import { ThorchainSwapTxInputDataResolver } from './ThorchainSwapTxInputDataResolver'

export const getUtxoThorchainSwapTxInputData: ThorchainSwapTxInputDataResolver<
  ThorChainSwapEnabledUtxoChain
> = () => {
  throw new Error('Utxo Thorchain swap not implemented yet')
}
