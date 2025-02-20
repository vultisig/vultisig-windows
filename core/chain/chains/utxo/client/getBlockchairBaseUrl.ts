import { UtxoChain } from '@core/chain/Chain'
import { rootApiUrl } from '@core/config'

export const getBlockchairBaseUrl = (chain: UtxoChain) =>
  `${rootApiUrl}/blockchair/${chain.toLowerCase()}`
