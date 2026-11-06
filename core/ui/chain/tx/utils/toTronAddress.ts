import { sha256 } from '@noble/hashes/sha2.js'
import { hexToBytes } from '@noble/hashes/utils.js'
import { stripHexPrefix } from '@vultisig/lib-utils/hex/stripHexPrefix'
import base58 from 'bs58'

const tronAddressPrefix = 0x41

/**
 * Renders a 20-byte `0x…` address, the form ABI decoding returns, as the
 * Base58Check `T…` address TRON wallets and dApps show.
 */
export const toTronAddress = (evmAddress: string) => {
  const body = new Uint8Array([
    tronAddressPrefix,
    ...hexToBytes(stripHexPrefix(evmAddress)),
  ])
  const checksum = sha256(sha256(body)).slice(0, 4)

  return base58.encode(new Uint8Array([...body, ...checksum]))
}
