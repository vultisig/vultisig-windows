import { OtherChain, UtxoChain } from '@core/chain/Chain'
import { rootApiUrl } from '@core/config'

export const getBlockchairBaseUrl = (chain: UtxoChain | OtherChain.Cardano) =>
  `${rootApiUrl}/blockchair/${chain.toLowerCase()}`
