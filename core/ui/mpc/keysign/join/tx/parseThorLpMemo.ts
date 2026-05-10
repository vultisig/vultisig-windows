export type ThorLpMemo =
  | { kind: 'add'; pool: string; pairedAddress?: string }
  | { kind: 'remove'; pool: string; basisPoints: number }

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
    if (!Number.isFinite(basisPoints)) return null
    return { kind: 'remove', pool, basisPoints }
  }

  return null
}
