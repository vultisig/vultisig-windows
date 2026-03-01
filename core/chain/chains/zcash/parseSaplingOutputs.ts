const readCompactSize = (
  data: Uint8Array,
  offset: number
): { value: number; bytesRead: number } => {
  const first = data[offset]
  if (first < 253) return { value: first, bytesRead: 1 }

  const view = new DataView(data.buffer, data.byteOffset)
  if (first === 253) {
    return { value: view.getUint16(offset + 1, true), bytesRead: 3 }
  }
  if (first === 254) {
    return { value: view.getUint32(offset + 1, true), bytesRead: 5 }
  }
  throw new Error('CompactSize too large')
}

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

type SaplingOutputFields = {
  ephemeralKey: Uint8Array
  encCiphertext: Uint8Array
}

export const parseSaplingOutputs = (
  rawTx: Uint8Array
): Map<string, SaplingOutputFields> => {
  let offset = 0

  // header(4) + versionGroupId(4) + consensusBranchId(4) + lockTime(4) + expiryHeight(4) = 20
  offset += 20

  // transparent inputs
  const { value: txInCount, bytesRead: txInCountBytes } = readCompactSize(
    rawTx,
    offset
  )
  offset += txInCountBytes
  for (let i = 0; i < txInCount; i++) {
    offset += 32 + 4 // prevHash + index
    const { value: scriptLen, bytesRead: scriptLenBytes } = readCompactSize(
      rawTx,
      offset
    )
    offset += scriptLenBytes + scriptLen + 4 // script + sequence
  }

  // transparent outputs
  const { value: txOutCount, bytesRead: txOutCountBytes } = readCompactSize(
    rawTx,
    offset
  )
  offset += txOutCountBytes
  for (let i = 0; i < txOutCount; i++) {
    offset += 8 // value
    const { value: scriptLen, bytesRead: scriptLenBytes } = readCompactSize(
      rawTx,
      offset
    )
    offset += scriptLenBytes + scriptLen
  }

  // sapling spends: each = cv(32) + nullifier(32) + rk(32) = 96 bytes
  const { value: spendCount, bytesRead: spendCountBytes } = readCompactSize(
    rawTx,
    offset
  )
  offset += spendCountBytes
  offset += spendCount * 96

  // sapling outputs: each = cv(32) + cmu(32) + ephemeralKey(32) + encCiphertext(580) + outCiphertext(80) = 756
  const { value: outputCount, bytesRead: outputCountBytes } = readCompactSize(
    rawTx,
    offset
  )
  offset += outputCountBytes

  const result = new Map<string, SaplingOutputFields>()

  for (let i = 0; i < outputCount; i++) {
    offset += 32 // cv
    const cmu = rawTx.slice(offset, offset + 32)
    offset += 32
    const ephemeralKey = rawTx.slice(offset, offset + 32)
    offset += 32
    const encCiphertext = rawTx.slice(offset, offset + 580)
    offset += 580
    offset += 80 // outCiphertext

    result.set(toHex(cmu), {
      ephemeralKey: new Uint8Array(ephemeralKey),
      encCiphertext: new Uint8Array(encCiphertext),
    })
  }

  return result
}
