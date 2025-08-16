import { OtherChain } from '@core/chain/Chain'
import { getPolkadotClient } from '@core/chain/chains/polkadot/client'

import { TxHashResolver } from '../resolver'

export const getPolkadotTxHash: TxHashResolver<OtherChain.Polkadot> = async ({
  encoded,
}) => {
  const client = await getPolkadotClient()

  return client
    .createType('Extrinsic', encoded, {
      isSigned: true,
      version: 4,
    })
    .hash.toHex()
}
