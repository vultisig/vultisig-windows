import { OtherChain } from '@core/chain/Chain'
import { TypeRegistry } from '@polkadot/types'

import { GetTxHashResolver } from './GetTxHashResolver'

const registry = new TypeRegistry()

export const getPolkadotTxHash: GetTxHashResolver<OtherChain.Polkadot> = ({
  encoded,
}) => {
  const rawTx = Buffer.from(encoded).toString('hex')
  const txHash = registry
    .createType('Extrinsic', rawTx, {
      isSigned: true,
      version: 4,
    })
    .hash.toHex()

  return txHash
}
