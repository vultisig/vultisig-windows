import type { Coin } from '@vultisig/core-chain/coin/Coin'

import type {
  BlockaidEvmBalanceChange,
  BlockaidEvmSimulationView,
} from './blockaidEvmSimulationView'

const read = (o: object, k: string): unknown => Reflect.get(o, k)

const isCoinLike = (v: unknown): v is Coin => {
  if (v === null || typeof v !== 'object') return false
  return (
    typeof read(v, 'decimals') === 'number' &&
    typeof read(v, 'ticker') === 'string' &&
    typeof read(v, 'chain') === 'string'
  )
}

const isBlockaidEvmBalanceChange = (
  v: unknown
): v is BlockaidEvmBalanceChange => {
  if (v === null || typeof v !== 'object') return false
  const direction = read(v, 'direction')
  const amount = read(v, 'amount')
  const coin = read(v, 'coin')
  if (direction !== 'send' && direction !== 'receive') return false
  if (typeof amount !== 'bigint') return false
  if (!isCoinLike(coin)) return false
  const usd = read(v, 'usdValue')
  if (usd !== undefined && typeof usd !== 'number') return false
  return true
}

const isSwapPayload = (
  v: object
): v is {
  swap: {
    fromCoin: Coin
    fromAmount: bigint
    toCoin: Coin
    toAmount: bigint
  }
} => {
  const swap = read(v, 'swap')
  if (swap === null || typeof swap !== 'object') return false
  return (
    isCoinLike(read(swap, 'fromCoin')) &&
    typeof read(swap, 'fromAmount') === 'bigint' &&
    isCoinLike(read(swap, 'toCoin')) &&
    typeof read(swap, 'toAmount') === 'bigint'
  )
}

const isTransferPayload = (
  v: object
): v is { transfer: { fromCoin: Coin; fromAmount: bigint } } => {
  const transfer = read(v, 'transfer')
  if (transfer === null || typeof transfer !== 'object') return false
  return (
    isCoinLike(read(transfer, 'fromCoin')) &&
    typeof read(transfer, 'fromAmount') === 'bigint'
  )
}

/**
 * Maps `parseBlockaidEvmSimulation` output (SDK `{ changes }` or legacy `{ swap|transfer }`)
 * into the UI union without type assertions.
 */
export const normalizeBlockaidEvmParsed = (
  parsed: unknown
): BlockaidEvmSimulationView => {
  if (parsed === null) return null
  if (typeof parsed !== 'object') return null

  const changesRaw = read(parsed, 'changes')
  if (changesRaw !== undefined) {
    if (!Array.isArray(changesRaw)) return null
    const changes: BlockaidEvmBalanceChange[] = []
    for (const item of changesRaw) {
      if (!isBlockaidEvmBalanceChange(item)) return null
      changes.push(item)
    }
    if (changes.length === 0) return null
    return { changes }
  }

  if (isSwapPayload(parsed)) {
    return { swap: parsed.swap }
  }
  if (isTransferPayload(parsed)) {
    return { transfer: parsed.transfer }
  }

  return null
}

/** Narrow Blockaid query data for the success-screen send summary (SDK `changes` only). */
export const hasBlockaidEvmChangesForSummary = (
  data: unknown
): data is { changes: BlockaidEvmBalanceChange[] } => {
  if (data === null || typeof data !== 'object') return false
  const changes = read(data, 'changes')
  if (!Array.isArray(changes)) return false
  return changes.every(isBlockaidEvmBalanceChange)
}
