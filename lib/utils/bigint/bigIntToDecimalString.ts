export const bigIntToDecimalString = (
  amount: bigint,
  decimals: number
): string => {
  const amountString = amount.toString()
  if (decimals === 0) {
    return amountString
  }
  const isNegative = amount < 0n
  const absoluteAmount = isNegative ? amountString.slice(1) : amountString

  if (absoluteAmount.length <= decimals) {
    const padded = absoluteAmount.padStart(decimals, '0')
    const result = `0.${padded}`
    return isNegative ? `-${result}` : result
  }

  const integerPart = absoluteAmount.slice(0, -decimals)
  const fractionalPart = absoluteAmount.slice(-decimals).padEnd(decimals, '0')
  const result = `${integerPart}.${fractionalPart}`

  return isNegative ? `-${result}` : result
}
