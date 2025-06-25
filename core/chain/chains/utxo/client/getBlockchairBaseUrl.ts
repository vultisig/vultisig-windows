import { UtxoBasedChain } from '@core/chain/Chain'
import { rootApiUrl } from '@core/config'

export const getBlockchairBaseUrl = (chain: UtxoBasedChain) =>
  `${rootApiUrl}/blockchair/${chain.toLowerCase()}`
