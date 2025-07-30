import { OtherChain } from '@core/chain/Chain'

import { getPolkadotClient } from '../../chains/polkadot/client'
import { TxHashResolver } from './TxHashResolver'

export const getPolkadotTxHash: TxHashResolver<OtherChain.Polkadot> = async ({
  encoded,
}) => {
  const client = await getPolkadotClient()

  return client
    .createType('Extrinsic', Buffer.from(encoded).toString('hex'), {
      isSigned: true,
      version: 4,
    })
    .hash.toHex()
}
