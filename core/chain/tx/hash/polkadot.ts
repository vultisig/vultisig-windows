import { OtherChain } from '@core/chain/Chain'
import { ensureHexPrefix } from '@lib/utils/hex/ensureHexPrefix'

import { getPolkadotClient } from '../../chains/polkadot/client'
import { TxHashResolver } from './TxHashResolver'

export const getPolkadotTxHash: TxHashResolver<OtherChain.Polkadot> = async ({
  encoded,
}) => {
  const client = await getPolkadotClient()

  return client
    .createType(
      'Extrinsic',
      ensureHexPrefix(Buffer.from(encoded).toString('hex')),
      {
        isSigned: true,
        version: 4,
      }
    )
    .hash.toHex()
}
