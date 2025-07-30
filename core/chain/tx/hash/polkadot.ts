import { OtherChain } from '@core/chain/Chain'
import { TypeRegistry } from '@polkadot/types'

import { GetTxHashResolver } from './GetTxHashResolver'

export const getPolkadotTxHash: GetTxHashResolver<OtherChain.Polkadot> = ({
  encoded,
}) =>
  new TypeRegistry()
    .createType('Extrinsic', Buffer.from(encoded).toString('hex'), {
      isSigned: true,
      version: 4,
    })
    .hash.toHex()
