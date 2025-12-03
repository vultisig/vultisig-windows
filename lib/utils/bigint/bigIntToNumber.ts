export const bigIntToNumber = (amount: bigint, decimals: number): number => {
  const amountString = amount.toString()
  const isNegative = amount < 0n
  const absoluteString = isNegative ? amountString.slice(1) : amountString

  if (absoluteString.length <= decimals) {
    const padded = absoluteString.padStart(decimals, '0')
    const decimalString = `0.${padded}`
    const result = Number(decimalString)
    return isNegative ? -result : result
  }

  const integerPart = absoluteString.slice(0, -decimals)
  const fractionalPart = absoluteString.slice(-decimals)
  const decimalString = `${integerPart}.${fractionalPart}`
  const result = Number(decimalString)

  return isNegative ? -result : result
}
