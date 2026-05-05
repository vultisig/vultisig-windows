import type { Coin } from '@vultisig/core-chain/coin/Coin'

import type {
  BlockaidEvmBalanceChange,
  BlockaidEvmSimulationView,
} from './blockaidEvmSimulationView'

type ReadInput = {
  o: object
  k: string
}

const read = ({ o, k }: ReadInput): unknown => Reflect.get(o, k)

const isCoinLike = (v: unknown): v is Coin => {
  if (v === null || typeof v !== 'object') return false
  return (
    typeof read({ o: v, k: 'decimals' }) === 'number' &&
    typeof read({ o: v, k: 'ticker' }) === 'string' &&
    typeof read({ o: v, k: 'chain' }) === 'string'
  )
}

const isBlockaidEvmBalanceChange = (
  v: unknown
): v is BlockaidEvmBalanceChange => {
  if (v === null || typeof v !== 'object') return false
  const direction = read({ o: v, k: 'direction' })
  const amount = read({ o: v, k: 'amount' })
  const coin = read({ o: v, k: 'coin' })
  if (direction !== 'send' && direction !== 'receive') return false
  if (typeof amount !== 'bigint') return false
  if (!isCoinLike(coin)) return false
  const usd = read({ o: v, k: 'usdValue' })
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
  const swap = read({ o: v, k: 'swap' })
  if (swap === null || typeof swap !== 'object') return false
  return (
    isCoinLike(read({ o: swap, k: 'fromCoin' })) &&
    typeof read({ o: swap, k: 'fromAmount' }) === 'bigint' &&
    isCoinLike(read({ o: swap, k: 'toCoin' })) &&
    typeof read({ o: swap, k: 'toAmount' }) === 'bigint'
  )
}

const isTransferPayload = (
  v: object
): v is { transfer: { fromCoin: Coin; fromAmount: bigint } } => {
  const transfer = read({ o: v, k: 'transfer' })
  if (transfer === null || typeof transfer !== 'object') return false
  return (
    isCoinLike(read({ o: transfer, k: 'fromCoin' })) &&
    typeof read({ o: transfer, k: 'fromAmount' }) === 'bigint'
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

  const changesRaw = read({ o: parsed, k: 'changes' })
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
  const changes = read({ o: data, k: 'changes' })
  if (!Array.isArray(changes)) return false
  return changes.every(isBlockaidEvmBalanceChange)
}
