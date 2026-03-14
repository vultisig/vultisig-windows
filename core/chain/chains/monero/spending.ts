import { MoneroStoredOutput } from './moneroScanStorage'

const moneroMinConfirmations = 10

export const isSpendableStoredMoneroOutput = (
  output: MoneroStoredOutput,
  chainHeight: number | null
): boolean => {
  if (output.spent || output.frozen || output.locked) {
    return false
  }

  if (output.height == null || chainHeight == null) {
    return true
  }

  return output.height <= chainHeight
}

export const getConfirmingMoneroOutputs = (
  outputs: MoneroStoredOutput[],
  chainTip: number | null
): MoneroStoredOutput[] =>
  outputs.filter(o => {
    if (o.spent || o.frozen) return false
    if (o.height == null || chainTip == null) return false
    return chainTip - o.height < moneroMinConfirmations
  })

export const getMoneroConfirmationsRemaining = (
  confirmingOutputs: MoneroStoredOutput[],
  chainTip: number | null
): number => {
  if (confirmingOutputs.length === 0) return 0
  if (chainTip == null) return moneroMinConfirmations
  let maxRemaining = 0
  for (const o of confirmingOutputs) {
    if (o.height == null) continue
    const confs = Math.max(0, chainTip - o.height)
    const remaining = Math.max(0, moneroMinConfirmations - confs)
    maxRemaining = Math.max(maxRemaining, remaining)
  }
  return maxRemaining
}
