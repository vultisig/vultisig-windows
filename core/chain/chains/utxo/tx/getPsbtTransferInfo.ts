import {
  address,
  networks,
  opcodes,
  Psbt,
  script as bscript,
} from 'bitcoinjs-lib'

const isOpReturn = (script: Buffer): boolean => {
  const chunks = bscript.decompile(script)
  return chunks?.[0] === opcodes.OP_RETURN
}

/**
 * Extract OP_RETURN data as hex string
 */
const getOpReturnData = (script: Buffer): string | null => {
  const chunks = bscript.decompile(script)
  if (!chunks || chunks[0] !== opcodes.OP_RETURN) return null
  const dataChunks = chunks
    .slice(1)
    .filter((chunk): chunk is Buffer => Buffer.isBuffer(chunk))
  if (dataChunks.length === 0) return null

  return Buffer.concat(dataChunks).toString('hex')
}

export const getPsbtTransferInfo = (psbt: Psbt, senderAddress: string) => {
  const network = networks.bitcoin

  const allOutputs = psbt.txOutputs.map(o => {
    const value = BigInt(o.value)

    // Handle OP_RETURN outputs (they don't have addresses)
    if (isOpReturn(o.script)) {
      const opReturnData = getOpReturnData(o.script)
      return {
        value,
        addr: null,
        isOpReturn: true,
        opReturnData,
      }
    }

    // Handle regular outputs
    try {
      const addr = address.fromOutputScript(o.script, network)
      return {
        value,
        addr,
        isOpReturn: false,
        opReturnData: null,
      }
    } catch (error) {
      console.warn('Failed to parse output script:', error)
      return {
        value,
        addr: null,
        isOpReturn: false,
        opReturnData: null,
      }
    }
  })

  // Filter out OP_RETURN and null addresses, and sender's change address
  const recipients = allOutputs.filter(
    o => !o.isOpReturn && o.addr !== null && o.addr !== senderAddress
  )

  const outputsTotal = recipients.reduce((s, o) => s + o.value, 0n)

  // Find OP_RETURN data for memo/swap info
  const opReturnOutput = allOutputs.find(o => o.isOpReturn)
  const memo = opReturnOutput?.opReturnData || null

  return {
    sendAmount: outputsTotal,
    recipient: recipients.map(r => r.addr)[0],
    memo,
  }
}
