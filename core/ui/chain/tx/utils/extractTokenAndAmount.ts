// TODO: move to the SDK. This is pure chain-level parsing with no React or
// UI dependencies, so the CLI agent and other SDK consumers could use it too.

export type TokenAndAmount = {
  tokenAddress: string
  rawAmount: string
}

type ExtractionStrategy =
  // Lending/staking pattern: supply(address asset, uint256 amount, ...)
  // Requires the address param to appear BEFORE the uint256 param to avoid
  // ERC-4626 deposit(uint256 assets, address receiver) collisions.
  | { kind: 'firstAddressBeforeFirstUint' }
  // ERC20 methods called on the token contract itself.
  // Token = toAddress of the tx, amount = first uint256 param.
  | { kind: 'contractIsToken' }
  // Token is the Nth address param (0-indexed).
  // e.g. Compound V3 supplyTo(address dst, address asset, uint256 amount) → 1
  | { kind: 'nthAddress'; index: number }

const strategyRegistry: Record<string, ExtractionStrategy> = {
  // Aave V3 / Spark / Radiant
  supply: { kind: 'firstAddressBeforeFirstUint' },
  supplyWithPermit: { kind: 'firstAddressBeforeFirstUint' },
  withdraw: { kind: 'firstAddressBeforeFirstUint' },
  borrow: { kind: 'firstAddressBeforeFirstUint' },
  repay: { kind: 'firstAddressBeforeFirstUint' },
  repayWithPermit: { kind: 'firstAddressBeforeFirstUint' },
  repayWithATokens: { kind: 'firstAddressBeforeFirstUint' },
  // Compound V3
  supplyTo: { kind: 'nthAddress', index: 1 },
  withdrawTo: { kind: 'nthAddress', index: 1 },
  transferAsset: { kind: 'nthAddress', index: 1 },
  // EigenLayer
  depositIntoStrategy: { kind: 'nthAddress', index: 1 },
  depositIntoStrategyWithSignature: { kind: 'nthAddress', index: 1 },
  // Across Protocol V3
  depositV3: { kind: 'nthAddress', index: 2 },
  // ERC20 methods on the token contract itself
  transfer: { kind: 'contractIsToken' },
  transferFrom: { kind: 'contractIsToken' },
  approve: { kind: 'contractIsToken' },
  increaseAllowance: { kind: 'contractIsToken' },
  decreaseAllowance: { kind: 'contractIsToken' },
}

// Split a param list on top-level commas only, respecting nested parentheses
// so that tuple types like `(uint256,uint256)` stay intact as one param.
const splitTopLevel = (params: string): string[] => {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const ch of params) {
    if (ch === '(') depth++
    else if (ch === ')') depth--
    if (ch === ',' && depth === 0) {
      parts.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  if (current.length > 0) parts.push(current.trim())
  return parts
}

const parseSignature = (
  signature: string
): { funcName: string; paramTypes: string[] } => {
  const funcName = signature.split('(')[0].trim()
  const paramsSrc = signature.slice(
    signature.indexOf('(') + 1,
    signature.lastIndexOf(')')
  )
  return { funcName, paramTypes: splitTopLevel(paramsSrc) }
}

const parseArgs = (argsJson: string): string[] | null => {
  try {
    const parsed = JSON.parse(argsJson)
    if (!Array.isArray(parsed)) return null
    // Reject arrays that contain non-primitive entries (nested tuples/bytes).
    // Such signatures can't be safely extracted with our simple strategies.
    if (!parsed.every(v => typeof v === 'string' || typeof v === 'number')) {
      return null
    }
    return parsed.map(String)
  } catch {
    return null
  }
}

const decimalIntegerPattern = /^\d+$/

const isValidDecimalAmount = (value: string): boolean =>
  decimalIntegerPattern.test(value)

const findNthTypeIndex = (
  paramTypes: string[],
  type: string,
  n: number
): number => {
  let count = 0
  for (let i = 0; i < paramTypes.length; i++) {
    if (paramTypes[i] === type) {
      if (count === n) return i
      count++
    }
  }
  return -1
}

export const extractTokenAndAmount = (
  signature: string,
  argsJson: string,
  toAddress?: string
): TokenAndAmount | null => {
  const { funcName, paramTypes } = parseSignature(signature)
  const strategy = strategyRegistry[funcName]
  if (!strategy) return null

  const args = parseArgs(argsJson)
  if (!args) return null

  const uint256Idx = paramTypes.indexOf('uint256')
  if (uint256Idx === -1 || uint256Idx >= args.length) return null
  const rawAmount = args[uint256Idx]
  if (!rawAmount || !isValidDecimalAmount(rawAmount)) return null

  if (strategy.kind === 'contractIsToken') {
    if (!toAddress) return null
    return { tokenAddress: toAddress, rawAmount }
  }

  if (strategy.kind === 'firstAddressBeforeFirstUint') {
    const addressIdx = paramTypes.indexOf('address')
    if (addressIdx === -1 || addressIdx >= uint256Idx) return null
    if (addressIdx >= args.length) return null
    const tokenAddress = args[addressIdx]
    if (!tokenAddress) return null
    return { tokenAddress, rawAmount }
  }

  if (strategy.kind === 'nthAddress') {
    const addressIdx = findNthTypeIndex(paramTypes, 'address', strategy.index)
    if (addressIdx === -1 || addressIdx >= args.length) return null
    const tokenAddress = args[addressIdx]
    if (!tokenAddress) return null
    return { tokenAddress, rawAmount }
  }

  return null
}
