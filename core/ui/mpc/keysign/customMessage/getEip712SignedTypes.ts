import { TypedDataField } from 'ethers'

const arraySuffixPattern = /(\[\d*\])+$/

type GetEip712SignedTypesInput = {
  types: Record<string, TypedDataField[]>
  primaryType: string
}

/**
 * The struct types an EIP-712 hash covers: `primaryType` and every struct it
 * references, directly or through arrays. Like MetaMask's signer, types
 * nothing reachable uses are dropped (ethers refuses them as ambiguous), and
 * `EIP712Domain` is left out because ethers builds it from the domain.
 * Throws when `primaryType` is not a struct the types define.
 */
export const getEip712SignedTypes = ({
  types,
  primaryType,
}: GetEip712SignedTypesInput): Record<string, TypedDataField[]> => {
  if (
    primaryType === 'EIP712Domain' ||
    !Object.prototype.hasOwnProperty.call(types, primaryType)
  ) {
    throw new Error(
      'The typed data primaryType is not a struct its types define'
    )
  }

  const result = new Map<string, TypedDataField[]>()

  const visit = (type: string) => {
    const structType = type.replace(arraySuffixPattern, '')
    if (
      structType === 'EIP712Domain' ||
      result.has(structType) ||
      !Object.prototype.hasOwnProperty.call(types, structType)
    ) {
      return
    }

    const fields = types[structType]
    result.set(structType, fields)
    for (const field of fields) {
      visit(field.type)
    }
  }

  visit(primaryType)

  return Object.fromEntries(result)
}
