import { WalletCore } from '@trustwallet/wallet-core'

type Input = {
  tx: Uint8Array
  walletCore: WalletCore
}

export const getCardanoTxHash = ({ tx, walletCore }: Input) => {
  const transactionBodyData = extractCardanoTransactionBody(tx)

  return walletCore.HexCoding.encode(
    walletCore.Hash.blake2b(transactionBodyData, 32)
  )
}

function extractCardanoTransactionBody(
  transactionData: Uint8Array
): Uint8Array {
  const bytes = Array.from(transactionData)
  let index = 0

  if (index >= bytes.length) {
    throw new Error('Invalid CBOR: empty data')
  }

  const firstByte = bytes[index]
  index += 1

  const majorType = (firstByte >> 5) & 0x07
  if (majorType !== 4) {
    throw new Error(`Invalid CBOR: expected array, got major type ${majorType}`)
  }

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

  const bodyStartIndex = index
  const bodyEndIndex = findEndOfCBORItem(bytes, bodyStartIndex)

  return new Uint8Array(bytes.slice(bodyStartIndex, bodyEndIndex))
}

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
    case 0:
    case 1:
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

    case 2:
    case 3: {
      const length = readCBORLength(bytes, index, additionalInfo)
      index += getCBORLengthBytes(additionalInfo)
      return index + length.value
    }

    case 4: {
      const arrayLength = readCBORLength(bytes, index, additionalInfo)
      index += getCBORLengthBytes(additionalInfo)

      for (let i = 0; i < arrayLength.value; i++) {
        index = findEndOfCBORItem(bytes, index)
      }
      return index
    }

    case 5: {
      const mapLength = readCBORLength(bytes, index, additionalInfo)
      index += getCBORLengthBytes(additionalInfo)

      for (let i = 0; i < mapLength.value * 2; i++) {
        index = findEndOfCBORItem(bytes, index)
      }
      return index
    }

    case 6:
      index += getCBORLengthBytes(additionalInfo)
      return findEndOfCBORItem(bytes, index)

    case 7:
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
