import { stripHexPrefix } from '@vultisig/lib-utils/hex/stripHexPrefix'
import { omit } from '@vultisig/lib-utils/record/omit'
import { TypedDataEncoder } from 'ethers'

/**
 * The EIP-712 digest an `eth_signTypedData_v4` custom message signs, as hex
 * without `0x`. Throws when the message is not typed data ethers can hash.
 */
export const getTypedDataHex = (message: string) => {
  const { domain, types, message: msg } = JSON.parse(message)

  return stripHexPrefix(
    TypedDataEncoder.hash(domain, omit(types, 'EIP712Domain'), msg)
  )
}
