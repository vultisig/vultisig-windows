import { OtherChain, UtxoBasedChain } from '@core/chain/Chain'

import { TxStatusResolver } from '../resolver'
import { getUtxoTxStatus } from './utxo'

export const getCardanoTxStatus: TxStatusResolver<
  OtherChain.Cardano
> = async input => {
  return getUtxoTxStatus(input as { chain: UtxoBasedChain; hash: string })
}
