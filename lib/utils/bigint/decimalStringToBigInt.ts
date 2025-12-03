export const decimalStringToBigInt = (
  decimalString: string,
  decimals: number
): bigint => {
  const trimmed = decimalString.trim()
  if (trimmed === '' || trimmed === '.') {
    throw new Error('Invalid decimal string')
  }

  const isNegative = trimmed.startsWith('-')
  const absoluteString = isNegative ? trimmed.slice(1) : trimmed

  const [integerPart, fractionalPart = ''] = absoluteString.split('.')

  if (fractionalPart.length > decimals) {
    throw new Error(
      `Fractional part exceeds ${decimals} decimals: ${fractionalPart.length}`
    )
  }

  const paddedFractional = fractionalPart.padEnd(decimals, '0')
  const combined = integerPart + paddedFractional

  if (combined === '' || !/^\d+$/.test(combined)) {
    throw new Error(`Invalid decimal string: ${decimalString}`)
  }

  const result = BigInt(combined)
  return isNegative ? -result : result
}
