/**
 * Parsed THORChain LP memo. Pool deposits are encoded as
 * `+:POOL[:PAIRED_ADDRESS]` (add) or `-:POOL:BASIS_POINTS` (remove).
 */
export type ThorLpMemo =
  | { kind: 'add'; pool: string; pairedAddress?: string }
  | { kind: 'remove'; pool: string; basisPoints: number }

/**
 * Parses a THORChain LP memo so the joiner can render Pool / Paired Address
 * rows even when the initiator wraps the deposit in a swap payload (which
 * iOS does for ERC20 LP adds because the EVM signing path needs it).
 *
 * @returns null when the memo is not an LP add/remove or is malformed.
 */
export const parseThorLpMemo = (memo: string): ThorLpMemo | null => {
  const [prefix, pool, third] = memo.split(':')

  if (!pool) return null

  if (prefix === '+') {
    return {
      kind: 'add',
      pool,
      pairedAddress: third || undefined,
    }
  }

  if (prefix === '-') {
    const basisPoints = Number(third)
    if (
      !Number.isInteger(basisPoints) ||
      basisPoints < 0 ||
      basisPoints > 10_000
    ) {
      return null
    }
    return { kind: 'remove', pool, basisPoints }
  }

  return null
}
