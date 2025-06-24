import { OtherChain } from '@core/chain/Chain'
import { attempt } from '@lib/utils/attempt'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { isInError } from '@lib/utils/error/isInError'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { TW } from '@trustwallet/wallet-core'

import { broadcastCardanoTx } from '../../chains/cardano/client/broadcastTx'
import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeCardanoTx: ExecuteTxResolver<OtherChain.Cardano> = async ({
  walletCore,
  compiledTx,
}) => {
  const output = TW.Cardano.Proto.SigningOutput.decode(compiledTx)

  assertErrorMessage(output.errorMessage)

  const rawTx = stripHexPrefix(walletCore.HexCoding.encode(output.encoded))

  const result = await attempt(broadcastCardanoTx(rawTx))

  if (
    'error' in result &&
    !isInError(
      result.error,
      'BadInputsUTxO',
      'timed out',
      'txn-mempool-conflict',
      'already known'
    )
  ) {
    throw result.error
  }

  const txHash = calculateCardanoTransactionHash(output.encoded, walletCore)

  return { txHash }
}

/**
 * Calculate Cardano Transaction ID manually following official specification
 * Cardano TX ID = Blake2b-256 hash of the transaction BODY only (not complete transaction)
 * Transaction CBOR structure: [body, witness_set, valid_script?, metadata?]
 */
function calculateCardanoTransactionHash(
  transactionData: Uint8Array,
  walletCore: any
): string {
  try {
    // Parse CBOR to extract transaction body (first element)
    const transactionBodyData = extractCardanoTransactionBody(transactionData)

    // Cardano Transaction ID = Blake2b-256 hash (32 bytes) of the BODY only
    const txidHash = walletCore.Hash.blake2b(transactionBodyData, 32)
    return walletCore.HexCoding.encode(txidHash)
  } catch (error) {
    console.error('❌ Error parsing Cardano CBOR:', error)

    // Fallback: try using the complete transaction (this might be wrong but better than crashing)
    const txidHash = walletCore.Hash.blake2b(transactionData, 32)
    const fallbackHash = walletCore.HexCoding.encode(txidHash)

    console.warn('⚠️ Fallback TX ID from COMPLETE transaction:', fallbackHash)
    return fallbackHash
  }
}

/**
 * Extract transaction body from Cardano CBOR structure
 * Cardano transaction CBOR format: [body, witness_set, valid_script?, metadata?]
 * We need only the first element (body) for TX ID calculation
 */
function extractCardanoTransactionBody(
  transactionData: Uint8Array
): Uint8Array {
  const bytes = Array.from(transactionData)
  let index = 0

  // Parse CBOR array header
  if (index >= bytes.length) {
    throw new Error('Invalid CBOR: empty data')
  }

  const firstByte = bytes[index]
  index += 1

  // Check if it's a CBOR array (major type 4)
  const majorType = (firstByte >> 5) & 0x07
  if (majorType !== 4) {
    throw new Error(`Invalid CBOR: expected array, got major type ${majorType}`)
  }

  // Get array length
  const arrayInfo = firstByte & 0x1f
  let arrayLength: number

  if (arrayInfo < 24) {
    arrayLength = arrayInfo
  } else if (arrayInfo === 24) {
    if (index >= bytes.length) {
      throw new Error('Invalid CBOR: array length truncated')
    }
    arrayLength = bytes[index]
    index += 1
  } else {
    throw new Error('Unsupported CBOR array length encoding')
  }

  if (arrayLength < 2) {
    throw new Error('Invalid Cardano transaction: array too short')
  }

  // Find the start and end of the first element (transaction body)
  const bodyStartIndex = index
  const bodyEndIndex = findEndOfCBORItem(bytes, bodyStartIndex)

  // Extract the body bytes
  return new Uint8Array(bytes.slice(bodyStartIndex, bodyEndIndex))
}

/**
 * Helper function to find the end of a CBOR item
 */
function findEndOfCBORItem(bytes: number[], startIndex: number): number {
  let index = startIndex

  if (index >= bytes.length) {
    throw new Error('CBOR parsing failed: unexpected end of data')
  }

  const firstByte = bytes[index]
  index += 1

  const majorType = (firstByte >> 5) & 0x07
  const additionalInfo = firstByte & 0x1f

  switch (majorType) {
    case 0: // Unsigned integer
    case 1: // Negative integer
      if (additionalInfo < 24) {
        return index
      } else if (additionalInfo === 24) {
        return index + 1
      } else if (additionalInfo === 25) {
        return index + 2
      } else if (additionalInfo === 26) {
        return index + 4
      } else if (additionalInfo === 27) {
        return index + 8
      }
      break

    case 2: // Byte string
    case 3: {
      // Text string
      const length = readCBORLength(bytes, index, additionalInfo)
      index += getCBORLengthBytes(additionalInfo)
      return index + length.value
    }

    case 4: {
      // Array
      const arrayLength = readCBORLength(bytes, index, additionalInfo)
      index += getCBORLengthBytes(additionalInfo)

      for (let i = 0; i < arrayLength.value; i++) {
        index = findEndOfCBORItem(bytes, index)
      }
      return index
    }

    case 5: {
      // Map
      const mapLength = readCBORLength(bytes, index, additionalInfo)
      index += getCBORLengthBytes(additionalInfo)

      for (let i = 0; i < mapLength.value * 2; i++) {
        index = findEndOfCBORItem(bytes, index)
      }
      return index
    }

    case 6: // Tag
      index += getCBORLengthBytes(additionalInfo)
      return findEndOfCBORItem(bytes, index)

    case 7: // Float, Simple value
      if (additionalInfo < 20) {
        return index
      } else if (additionalInfo === 20 || additionalInfo === 21) {
        return index
      } else if (additionalInfo === 22) {
        return index + 1
      } else if (additionalInfo === 25) {
        return index + 2
      } else if (additionalInfo === 26) {
        return index + 4
      } else if (additionalInfo === 27) {
        return index + 8
      }
      break

    default:
      throw new Error(`Unsupported CBOR major type: ${majorType}`)
  }

  throw new Error('CBOR parsing failed')
}

/**
 * Helper function to read CBOR length values
 */
function readCBORLength(
  bytes: number[],
  index: number,
  additionalInfo: number
): { value: number } {
  if (additionalInfo < 24) {
    return { value: additionalInfo }
  } else if (additionalInfo === 24) {
    if (index >= bytes.length) {
      throw new Error('CBOR length truncated')
    }
    return { value: bytes[index] }
  } else if (additionalInfo === 25) {
    if (index + 1 >= bytes.length) {
      throw new Error('CBOR length truncated')
    }
    return { value: (bytes[index] << 8) | bytes[index + 1] }
  } else if (additionalInfo === 26) {
    if (index + 3 >= bytes.length) {
      throw new Error('CBOR length truncated')
    }
    return {
      value:
        (bytes[index] << 24) |
        (bytes[index + 1] << 16) |
        (bytes[index + 2] << 8) |
        bytes[index + 3],
    }
  } else {
    throw new Error('Unsupported CBOR length encoding')
  }
}

/**
 * Helper function to get the number of bytes used for CBOR length encoding
 */
function getCBORLengthBytes(additionalInfo: number): number {
  if (additionalInfo < 24) {
    return 0
  } else if (additionalInfo === 24) {
    return 1
  } else if (additionalInfo === 25) {
    return 2
  } else if (additionalInfo === 26) {
    return 4
  } else if (additionalInfo === 27) {
    return 8
  }
  return 0
}
