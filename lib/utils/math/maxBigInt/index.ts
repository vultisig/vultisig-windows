export function maxBigInt(...args: bigint[]): bigint {
  if (args.length === 0) {
    throw new Error('maxBigInt: No arguments provided')
  }

  let maxValue = args[0]
  for (const value of args) {
    if (value > maxValue) {
      maxValue = value
    }
  }
  return maxValue
}
