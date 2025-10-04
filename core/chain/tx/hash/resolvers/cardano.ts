import { OtherChain } from '@core/chain/Chain'
import { blake2b } from '@noble/hashes/blake2'
import { decode, encode } from 'cbor-x'
import { toHex } from 'viem'

import { TxHashResolver } from '../resolver'

export const getCardanoTxHash: TxHashResolver<OtherChain.Cardano> = ({
  encoded,
}) => {
  const tx = decode(encoded)
  const bodyCbor = encode(tx[0])
  const digest = blake2b(bodyCbor, { dkLen: 32 })
  return toHex(digest)
}
