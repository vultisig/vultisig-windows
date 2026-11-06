const maxUint64 = 2n ** 64n - 1n

/** Accepts an amino sign doc's `timeout_height` only as absent or a canonical decimal uint64 string. */
export const parseAminoTimeoutHeight = (value: unknown): string | undefined => {
  if (value === undefined) return undefined

  if (
    typeof value !== 'string' ||
    !/^(0|[1-9]\d*)$/.test(value) ||
    BigInt(value) > maxUint64
  ) {
    throw new Error(
      `Unsupported amino timeout_height: ${JSON.stringify(value)}`
    )
  }

  return value
}
