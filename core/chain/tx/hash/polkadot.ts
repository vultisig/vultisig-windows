import { OtherChain } from '@core/chain/Chain'
import { TypeRegistry } from '@polkadot/types'

import { TxHashResolver } from './TxHashResolver'

export const getPolkadotTxHash: TxHashResolver<OtherChain.Polkadot> = ({
  encoded,
}) =>
  new TypeRegistry()
    .createType('Extrinsic', Buffer.from(encoded).toString('hex'), {
      isSigned: true,
      version: 4,
    })
    .hash.toHex()
