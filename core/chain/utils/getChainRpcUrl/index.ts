import { Chain, OtherChain, UtxoChain } from '@core/chain/Chain'
import { rootApiUrl } from '@core/config'

import { cosmosRpcUrl } from '../../chains/cosmos/cosmosRpcUrl'
import { evmChainRpcUrls } from '../../chains/evm/chainInfo'

export const chainRpcUrl: Record<Chain, string> = {
  ...evmChainRpcUrls,
  ...cosmosRpcUrl,
  [UtxoChain.Bitcoin]: '',
  [UtxoChain.BitcoinCash]: '',
  [UtxoChain.Litecoin]: '',
  [UtxoChain.Dogecoin]: '',
  [UtxoChain.Dash]: '',
  [OtherChain.Sui]: '',
  [OtherChain.Solana]: `${rootApiUrl}/solana/`,
  [OtherChain.Polkadot]: 'https://polkadot-rpc.publicnode.com',
  [OtherChain.Ton]: '',
  [OtherChain.Ripple]: '',
  [OtherChain.Tron]: '',
}
