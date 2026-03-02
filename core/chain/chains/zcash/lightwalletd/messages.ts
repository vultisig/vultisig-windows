const writeVarint = (value: number): Uint8Array => {
  const bytes: number[] = []
  let v = value >>> 0
  while (v > 0x7f) {
    bytes.push((v & 0x7f) | 0x80)
    v >>>= 7
  }
  bytes.push(v & 0x7f)
  return new Uint8Array(bytes)
}

const readVarint = (
  data: Uint8Array,
  offset: number
): { value: number; bytesRead: number } => {
  let value = 0
  let shift = 0
  let bytesRead = 0
  while (offset + bytesRead < data.length) {
    const byte = data[offset + bytesRead]
    value |= (byte & 0x7f) << shift
    bytesRead++
    if ((byte & 0x80) === 0) break
    shift += 7
  }
  return { value: value >>> 0, bytesRead }
}

const writeLengthDelimited = (
  fieldNumber: number,
  data: Uint8Array
): Uint8Array => {
  const tag = writeVarint((fieldNumber << 3) | 2)
  const length = writeVarint(data.length)
  const result = new Uint8Array(tag.length + length.length + data.length)
  result.set(tag, 0)
  result.set(length, tag.length)
  result.set(data, tag.length + length.length)
  return result
}

const writeVarintField = (fieldNumber: number, value: number): Uint8Array => {
  const tag = writeVarint((fieldNumber << 3) | 0)
  const val = writeVarint(value)
  const result = new Uint8Array(tag.length + val.length)
  result.set(tag, 0)
  result.set(val, tag.length)
  return result
}

export type BlockID = {
  height: number
  hash: Uint8Array
}

export type TreeState = {
  network: string
  height: number
  hash: string
  time: number
  saplingTree: string
  orchardTree: string
}

export type SendResponse = {
  errorCode: number
  errorMessage: string
}

type CompactSaplingSpend = {
  nf: Uint8Array
}

type CompactSaplingOutput = {
  cmu: Uint8Array
  ephemeralKey: Uint8Array
  ciphertext: Uint8Array
}

export type CompactTx = {
  index: number
  hash: Uint8Array
  spends: CompactSaplingSpend[]
  outputs: CompactSaplingOutput[]
}

export type CompactBlock = {
  height: number
  hash: Uint8Array
  time: number
  vtx: CompactTx[]
}

export type RawTransaction = {
  data: Uint8Array
  height: number
}

export const encodeChainSpec = (): Uint8Array => {
  return new Uint8Array(0)
}

export const encodeBlockHeight = (height: number): Uint8Array => {
  return writeVarintField(1, height)
}

export const encodeRawTransaction = (data: Uint8Array): Uint8Array => {
  return writeLengthDelimited(1, data)
}

export const decodeBlockID = (data: Uint8Array): BlockID => {
  let height = 0
  let hash = new Uint8Array(0)
  let offset = 0

  while (offset < data.length) {
    const { value: tag, bytesRead: tagBytes } = readVarint(data, offset)
    offset += tagBytes
    const fieldNumber = tag >>> 3
    const wireType = tag & 0x07

    if (wireType === 0) {
      const { value, bytesRead } = readVarint(data, offset)
      offset += bytesRead
      if (fieldNumber === 1) height = value
    } else if (wireType === 2) {
      const { value: length, bytesRead } = readVarint(data, offset)
      offset += bytesRead
      const fieldData = data.slice(offset, offset + length)
      offset += length
      if (fieldNumber === 2) hash = fieldData
    }
  }

  return { height, hash }
}

export const decodeTreeState = (data: Uint8Array): TreeState => {
  let network = ''
  let height = 0
  let hash = ''
  let time = 0
  let saplingTree = ''
  let orchardTree = ''
  let offset = 0
  const decoder = new TextDecoder()

  while (offset < data.length) {
    const { value: tag, bytesRead: tagBytes } = readVarint(data, offset)
    offset += tagBytes
    const fieldNumber = tag >>> 3
    const wireType = tag & 0x07

    if (wireType === 0) {
      const { value, bytesRead } = readVarint(data, offset)
      offset += bytesRead
      if (fieldNumber === 2) height = value
      if (fieldNumber === 4) time = value
    } else if (wireType === 2) {
      const { value: length, bytesRead } = readVarint(data, offset)
      offset += bytesRead
      const fieldData = data.slice(offset, offset + length)
      offset += length
      const str = decoder.decode(fieldData)
      if (fieldNumber === 1) network = str
      if (fieldNumber === 3) hash = str
      if (fieldNumber === 5) saplingTree = str
      if (fieldNumber === 6) orchardTree = str
    }
  }

  return { network, height, hash, time, saplingTree, orchardTree }
}

export const decodeSendResponse = (data: Uint8Array): SendResponse => {
  let errorCode = 0
  let errorMessage = ''
  let offset = 0

  while (offset < data.length) {
    const { value: tag, bytesRead: tagBytes } = readVarint(data, offset)
    offset += tagBytes
    const fieldNumber = tag >>> 3
    const wireType = tag & 0x07

    if (wireType === 0) {
      const { value, bytesRead } = readVarint(data, offset)
      offset += bytesRead
      if (fieldNumber === 1) errorCode = value
    } else if (wireType === 2) {
      const { value: length, bytesRead } = readVarint(data, offset)
      offset += bytesRead
      const fieldData = data.slice(offset, offset + length)
      offset += length
      if (fieldNumber === 2) errorMessage = new TextDecoder().decode(fieldData)
    }
  }

  return { errorCode, errorMessage }
}

export const encodeBlockRange = (
  startHeight: number,
  endHeight: number
): Uint8Array => {
  const startBlock = writeVarintField(1, startHeight)
  const startMsg = writeLengthDelimited(1, startBlock)

  const endBlock = writeVarintField(1, endHeight)
  const endMsg = writeLengthDelimited(2, endBlock)

  const result = new Uint8Array(startMsg.length + endMsg.length)
  result.set(startMsg, 0)
  result.set(endMsg, startMsg.length)
  return result
}

export const encodeTxFilter = (txHash: Uint8Array): Uint8Array => {
  return writeLengthDelimited(3, txHash)
}

const decodeCompactSaplingSpend = (data: Uint8Array): CompactSaplingSpend => {
  let nf = new Uint8Array(0)
  let offset = 0

  while (offset < data.length) {
    const { value: tag, bytesRead: tagBytes } = readVarint(data, offset)
    offset += tagBytes
    const fieldNumber = tag >>> 3
    const wireType = tag & 0x07

    if (wireType === 2) {
      const { value: length, bytesRead } = readVarint(data, offset)
      offset += bytesRead
      const fieldData = data.slice(offset, offset + length)
      offset += length
      if (fieldNumber === 1) nf = fieldData
    } else if (wireType === 0) {
      const { bytesRead } = readVarint(data, offset)
      offset += bytesRead
    }
  }

  return { nf }
}

const decodeCompactSaplingOutput = (data: Uint8Array): CompactSaplingOutput => {
  let cmu = new Uint8Array(0)
  let ephemeralKey = new Uint8Array(0)
  let ciphertext = new Uint8Array(0)
  let offset = 0

  while (offset < data.length) {
    const { value: tag, bytesRead: tagBytes } = readVarint(data, offset)
    offset += tagBytes
    const fieldNumber = tag >>> 3
    const wireType = tag & 0x07

    if (wireType === 2) {
      const { value: length, bytesRead } = readVarint(data, offset)
      offset += bytesRead
      const fieldData = data.slice(offset, offset + length)
      offset += length
      if (fieldNumber === 1) cmu = fieldData
      else if (fieldNumber === 2) ephemeralKey = fieldData
      else if (fieldNumber === 3) ciphertext = fieldData
    } else if (wireType === 0) {
      const { bytesRead } = readVarint(data, offset)
      offset += bytesRead
    }
  }

  return { cmu, ephemeralKey, ciphertext }
}

// CompactTx proto fields:
//   1 = index (uint64), 2 = txid (bytes), 3 = fee (uint32),
//   4 = spends (repeated CompactSaplingSpend), 5 = outputs (repeated CompactSaplingOutput)
const decodeCompactTx = (data: Uint8Array): CompactTx => {
  let index = 0
  let hash = new Uint8Array(0)
  const spends: CompactSaplingSpend[] = []
  const outputs: CompactSaplingOutput[] = []
  let offset = 0

  while (offset < data.length) {
    const { value: tag, bytesRead: tagBytes } = readVarint(data, offset)
    offset += tagBytes
    const fieldNumber = tag >>> 3
    const wireType = tag & 0x07

    if (wireType === 0) {
      const { value, bytesRead } = readVarint(data, offset)
      offset += bytesRead
      if (fieldNumber === 1) index = value
    } else if (wireType === 2) {
      const { value: length, bytesRead } = readVarint(data, offset)
      offset += bytesRead
      const fieldData = data.slice(offset, offset + length)
      offset += length
      if (fieldNumber === 2) hash = fieldData
      else if (fieldNumber === 4)
        spends.push(decodeCompactSaplingSpend(fieldData))
      else if (fieldNumber === 5)
        outputs.push(decodeCompactSaplingOutput(fieldData))
    }
  }

  return { index, hash, spends, outputs }
}

// CompactBlock proto fields:
//   1 = protoVersion (uint32), 2 = height (uint64), 3 = hash (bytes),
//   4 = prevHash (bytes), 5 = time (uint32), 6 = header (bytes),
//   7 = vtx (repeated CompactTx)
export const decodeCompactBlock = (data: Uint8Array): CompactBlock => {
  let height = 0
  let hash = new Uint8Array(0)
  let time = 0
  const vtx: CompactTx[] = []
  let offset = 0

  while (offset < data.length) {
    const { value: tag, bytesRead: tagBytes } = readVarint(data, offset)
    offset += tagBytes
    const fieldNumber = tag >>> 3
    const wireType = tag & 0x07

    if (wireType === 0) {
      const { value, bytesRead } = readVarint(data, offset)
      offset += bytesRead
      if (fieldNumber === 2) height = value
      else if (fieldNumber === 5) time = value
    } else if (wireType === 2) {
      const { value: length, bytesRead } = readVarint(data, offset)
      offset += bytesRead
      const fieldData = data.slice(offset, offset + length)
      offset += length
      if (fieldNumber === 3) hash = fieldData
      else if (fieldNumber === 7) vtx.push(decodeCompactTx(fieldData))
    }
  }

  return { height, hash, time, vtx }
}

export const decodeRawTransaction = (data: Uint8Array): RawTransaction => {
  let txData = new Uint8Array(0)
  let height = 0
  let offset = 0

  while (offset < data.length) {
    const { value: tag, bytesRead: tagBytes } = readVarint(data, offset)
    offset += tagBytes
    const fieldNumber = tag >>> 3
    const wireType = tag & 0x07

    if (wireType === 0) {
      const { value, bytesRead } = readVarint(data, offset)
      offset += bytesRead
      if (fieldNumber === 2) height = value
    } else if (wireType === 2) {
      const { value: length, bytesRead } = readVarint(data, offset)
      offset += bytesRead
      const fieldData = data.slice(offset, offset + length)
      offset += length
      if (fieldNumber === 1) txData = fieldData
    }
  }

  return { data: txData, height }
}
