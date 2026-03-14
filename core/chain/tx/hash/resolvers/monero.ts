import { keccak_256 } from '@noble/hashes/sha3.js'

import { TxHashResolver } from '../resolver'

export const getMoneroTxHash: TxHashResolver = tx => {
  const txData = tx as unknown as {
    encoded?: Uint8Array
  }
  const encoded = txData.encoded ?? new Uint8Array()
  const hash = keccak_256(encoded)
  return Buffer.from(hash).toString('hex')
}
