import { OtherChain } from '@core/chain/Chain'
import { blake2AsHex } from '@polkadot/util-crypto'

import { TxHashResolver } from '../resolver'

export const getBittensorTxHash: TxHashResolver<
  OtherChain.Bittensor
> = async ({ encoded }) => {
  // encoded already includes the SCALE compact length prefix from assembleBittensorExtrinsic
  // Substrate tx hash = blake2b-256 of the full length-prefixed extrinsic
  return blake2AsHex(encoded, 256)
}
