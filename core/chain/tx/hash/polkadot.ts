import { OtherChain } from '@core/chain/Chain'
import { TypeRegistry } from '@polkadot/types'

import { GetTxHashResolver } from './GetTxHashResolver'

const registry = new TypeRegistry()

export const getPolkadotTxHash: GetTxHashResolver<OtherChain.Polkadot> = ({
  encoded,
}) =>
  registry
    .createType('Extrinsic', Buffer.from(encoded).toString('hex'), {
      isSigned: true,
      version: 4,
    })
    .hash.toHex()
