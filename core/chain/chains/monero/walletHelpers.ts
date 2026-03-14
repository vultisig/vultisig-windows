export type MoneroWalletOutputLike = {
  getAmount: () => bigint | number | string
  getIsSpent?: () => boolean | undefined
  getIsFrozen?: () => boolean | undefined
  getIsLocked?: () => boolean | undefined
}

export const networkName = (
  network: number
): 'mainnet' | 'stagenet' | 'testnet' => {
  if (network === 1) return 'testnet'
  if (network === 2) return 'stagenet'
  return 'mainnet'
}

export const isSpendableMoneroOutput = (
  output: MoneroWalletOutputLike
): boolean =>
  output.getIsSpent?.() !== true &&
  output.getIsFrozen?.() !== true &&
  output.getIsLocked?.() !== true

const toBigIntAmount = (amount: bigint | number | string): bigint => {
  if (typeof amount === 'bigint') return amount
  if (typeof amount === 'number') return BigInt(amount)
  return BigInt(amount)
}

export const getSpendableBalanceFromMoneroOutputs = (
  outputs: MoneroWalletOutputLike[]
): bigint => {
  let total = BigInt(0)

  for (const output of outputs) {
    if (!isSpendableMoneroOutput(output)) continue
    total += toBigIntAmount(output.getAmount())
  }

  return total
}
