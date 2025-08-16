import { OtherChain } from '@core/chain/Chain'
import { hashes } from 'xrpl'

import { TxHashResolver } from '../resolver'

export const getRippleTxHash: TxHashResolver<OtherChain.Ripple> = ({
  encoded,
}) => hashes.hashSignedTx(Buffer.from(encoded).toString('hex'))
