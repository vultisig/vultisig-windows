import { attempt } from '@vultisig/lib-utils/attempt'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { omit } from '@vultisig/lib-utils/record/omit'
import { TypedDataEncoder } from 'ethers'

import { Eip712V4Payload } from './interface'

const bytesTypePattern = /^bytes(?:[1-9]|[12]\d|3[0-2])?$/
const arrayTypePattern = /^(.*)\[\d*\]$/

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/**
 * Dotted paths (rooted at `message`) of `bytes`/`bytesN` fields whose value
 * is an empty string, plus `domain.salt` when it is one. MetaMask's signer
 * tolerates `""` in bytes fields but ethers' `TypedDataEncoder` rejects it
 * with a cryptic `invalid BytesLike value` error, so these fields are the
 * usual reason a payload that works in other wallets cannot be hashed here.
 */
export const findEmptyEip712BytesFields = ({
  primaryType,
  domain,
  types,
  message,
}: Eip712V4Payload): string[] => {
  const result: string[] = []

  type VisitInput = {
    type: string
    value: unknown
    path: string
  }

  const visit = ({ type, value, path }: VisitInput) => {
    const arrayMatch = type.match(arrayTypePattern)
    if (arrayMatch) {
      if (Array.isArray(value)) {
        for (const [index, item] of value.entries()) {
          visit({ type: arrayMatch[1], value: item, path: `${path}[${index}]` })
        }
      }
      return
    }

    if (bytesTypePattern.test(type)) {
      if (value === '') {
        result.push(path)
      }
      return
    }

    const fields = types[type]
    if (fields && isRecord(value)) {
      for (const { name, type: fieldType } of fields) {
        visit({ type: fieldType, value: value[name], path: `${path}.${name}` })
      }
    }
  }

  visit({ type: primaryType, value: message, path: 'message' })

  if (domain.salt === '') {
    result.push('domain.salt')
  }

  return result
}

/**
 * Why the payload cannot be hashed for signing, or `undefined` when it can.
 * Runs the same ethers `TypedDataEncoder` hashing the keysign pipeline
 * performs (see `getCustomMessageHex`), so an unsignable dApp payload is
 * rejected at request time — with empty bytes fields called out by path —
 * instead of failing deep in keysign after the user has already approved.
 */
export const getEip712PayloadIssue = (
  payload: Eip712V4Payload
): string | undefined => {
  const result = attempt(() =>
    TypedDataEncoder.hash(
      payload.domain,
      omit(payload.types, 'EIP712Domain'),
      payload.message
    )
  )
  if ('data' in result) {
    return undefined
  }

  const emptyBytesFields = findEmptyEip712BytesFields(payload)
  if (emptyBytesFields.length > 0) {
    return `empty string in bytes field(s) ${emptyBytesFields.join(', ')}; encode empty bytes as "0x"`
  }

  return extractErrorMsg(result.error)
}
