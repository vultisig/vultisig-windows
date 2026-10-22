import { stripHexPrefix } from '@vultisig/lib-utils/hex/stripHexPrefix'
import { omit } from '@vultisig/lib-utils/record/omit'
import { TypedDataEncoder } from 'ethers'

/**
 * The EIP-712 digest an `eth_signTypedData_v4` custom message signs, as hex
 * without `0x`. ethers infers the signed struct from `types` and ignores
 * `primaryType`, so a payload whose `primaryType` is missing or names another
 * struct is refused. Throws when the message is not typed data ethers can
 * hash.
 */
export const getTypedDataHex = (message: string) => {
  const { domain, types, primaryType, message: msg } = JSON.parse(message)
  const structTypes = omit(types, 'EIP712Domain')

  if (primaryType !== TypedDataEncoder.getPrimaryType(structTypes)) {
    throw new Error('The typed data primaryType is not the struct it signs')
  }

  return stripHexPrefix(TypedDataEncoder.hash(domain, structTypes, msg))
}
