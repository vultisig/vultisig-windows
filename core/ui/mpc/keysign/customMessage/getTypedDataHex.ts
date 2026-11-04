import { stripHexPrefix } from '@vultisig/lib-utils/hex/stripHexPrefix'
import { TypedDataEncoder } from 'ethers'

import { getEip712SignedTypes } from './getEip712SignedTypes'

/**
 * The EIP-712 digest an `eth_signTypedData_v4` custom message signs, as hex
 * without `0x`. Like MetaMask, only the struct types reachable from
 * `primaryType` are encoded, so a payload that declares unused types still
 * signs. A payload whose `primaryType` is missing or is not the struct
 * those types root at is refused. Throws when the message is not typed data
 * ethers can hash.
 */
export const getTypedDataHex = (message: string) => {
  const { domain, types, primaryType, message: msg } = JSON.parse(message)
  const structTypes = getEip712SignedTypes({ types, primaryType })

  if (primaryType !== TypedDataEncoder.getPrimaryType(structTypes)) {
    throw new Error('The typed data primaryType is not the struct it signs')
  }

  return stripHexPrefix(TypedDataEncoder.hash(domain, structTypes, msg))
}
