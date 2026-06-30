import { broadcastTx } from '@vultisig/core-chain/tx/broadcast'
import { attempt } from '@vultisig/lib-utils/attempt'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'

/**
 * Marks a failure that happened while broadcasting an already-signed
 * transaction to the chain's RPC, as opposed to an MPC device/session failure
 * during signing. Both land in the same keysign-mutation error branch, so the
 * UI needs this discriminator to headline an on-chain rejection (e.g.
 * "Transaction simulation failed", "Blockhash not found", "insufficient
 * lamports") as a network rejection instead of the device-timeout copy.
 *
 * The original RPC error is preserved as {@link cause} and its on-chain reason
 * (top-level message plus any program logs) is hoisted into `message`, so
 * `extractErrorMsg` surfaces the real reason under "Show exact error".
 */
export class BroadcastError extends Error {
  override readonly cause: unknown

  constructor(cause: unknown) {
    super(extractBroadcastReason(cause))
    this.name = 'BroadcastError'
    this.cause = cause
  }
}

/**
 * Broadcasts a signed keysign transaction, re-throwing any RPC rejection as a
 * {@link BroadcastError}. The signing step is already complete by the time this
 * runs, so a failure here is an on-chain rejection — never an MPC failure.
 */
export const broadcastKeysignTx = async (
  input: Parameters<typeof broadcastTx>[0]
): Promise<void> => {
  const result = await attempt(() => broadcastTx(input))
  if ('error' in result) {
    throw new BroadcastError(result.error)
  }
}

const extractBroadcastReason = (cause: unknown): string => {
  const message = extractErrorMsg(cause)
  const logs = extractOnChainLogs(cause)

  return logs && !message.includes(logs) ? `${message}\n${logs}` : message
}

/**
 * Solana's `SendTransactionError` carries the on-chain reason in `logs`, and
 * JSON-RPC rejections nest it under `data.logs`. Hoist whichever is present so
 * the program logs reach the "Show exact error" disclosure, not just the bare
 * top-level message.
 */
const extractOnChainLogs = (cause: unknown): string | undefined => {
  if (!cause || typeof cause !== 'object') {
    return undefined
  }

  const topLevel = readLogs(cause)
  if (topLevel) {
    return topLevel
  }

  if ('data' in cause) {
    return readLogs(cause.data)
  }

  return undefined
}

const readLogs = (value: unknown): string | undefined => {
  if (
    value &&
    typeof value === 'object' &&
    'logs' in value &&
    Array.isArray(value.logs) &&
    value.logs.length > 0
  ) {
    return value.logs.join('\n')
  }

  return undefined
}
