import { MoneroStoredOutput } from './moneroScanStorage'

export const moneroBalanceFinaliseMethod = 'monero.finalize_balance_scan'

export type MoneroBalanceFinaliseMessage = {
  version: 1
  publicKeyEcdsa: string
  outputsDataBase64: string
  outputs: Array<Pick<MoneroStoredOutput, 'amount' | 'outputKeyHex'>>
  outputCount: number
  balanceAtomic: string
  scanHeight: number | null
  chainTip: number | null
}

type CreateMoneroBalanceFinaliseMessageInput = {
  publicKeyEcdsa: string
  outputs: Array<Pick<MoneroStoredOutput, 'amount' | 'outputKeyHex'>>
  outputsData: Uint8Array
  balanceAtomic: string
  scanHeight: number | null
  chainTip: number | null
}

export const createMoneroBalanceFinaliseMessage = ({
  publicKeyEcdsa,
  outputs,
  outputsData,
  balanceAtomic,
  scanHeight,
  chainTip,
}: CreateMoneroBalanceFinaliseMessageInput): MoneroBalanceFinaliseMessage => ({
  version: 1,
  publicKeyEcdsa,
  outputsDataBase64: Buffer.from(outputsData).toString('base64'),
  outputs: outputs.map(output => ({
    amount: output.amount,
    outputKeyHex: output.outputKeyHex,
  })),
  outputCount: outputs.length,
  balanceAtomic,
  scanHeight,
  chainTip,
})

const isMoneroBalanceFinaliseMessage = (
  value: unknown
): value is MoneroBalanceFinaliseMessage => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const message = value as Partial<MoneroBalanceFinaliseMessage>
  return (
    message.version === 1 &&
    typeof message.publicKeyEcdsa === 'string' &&
    typeof message.outputsDataBase64 === 'string' &&
    Array.isArray(message.outputs) &&
    message.outputs.every(
      output =>
        output &&
        typeof output === 'object' &&
        typeof output.amount === 'string' &&
        typeof output.outputKeyHex === 'string'
    ) &&
    typeof message.outputCount === 'number' &&
    typeof message.balanceAtomic === 'string'
  )
}

export const parseMoneroBalanceFinaliseMessage = (
  value: string
): MoneroBalanceFinaliseMessage | null => {
  try {
    const parsed = JSON.parse(value)
    return isMoneroBalanceFinaliseMessage(parsed) ? parsed : null
  } catch {
    return null
  }
}

export const getMoneroBalanceFinaliseOutputsData = (
  message: MoneroBalanceFinaliseMessage
): Uint8Array =>
  new Uint8Array(Buffer.from(message.outputsDataBase64, 'base64'))

export const isMoneroBalanceFinalisePayload = (value: {
  method: string
  message: string
}): boolean =>
  value.method === moneroBalanceFinaliseMethod &&
  parseMoneroBalanceFinaliseMessage(value.message) !== null

const piconeroPerXmr = BigInt(1_000_000_000_000)

export const formatMoneroAtomicAmount = (value: string | bigint): string => {
  const amount = typeof value === 'bigint' ? value : BigInt(value)
  const whole = amount / piconeroPerXmr
  const fraction = (amount % piconeroPerXmr).toString().padStart(12, '0')
  return `${whole}.${fraction} XMR`
}
