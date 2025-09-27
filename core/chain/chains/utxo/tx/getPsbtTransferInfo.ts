import { address, networks, Psbt } from 'bitcoinjs-lib'

const isOpReturn = (script: Buffer): boolean => {
  return script.length > 0 && script[0] === 0x6a // OP_RETURN opcode
}

/**
 * Extract OP_RETURN data as hex string
 */
const getOpReturnData = (script: Buffer): string | null => {
  if (!isOpReturn(script)) return null
  if (script.length < 2) return null

  const dataLength = script[1]
  if (script.length < 2 + dataLength) return null

  return script.slice(2, 2 + dataLength).toString('hex')
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
