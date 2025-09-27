export const adjustByteFee = (byteFee: number, multiplier: number) => {
  return Math.ceil(byteFee * multiplier)
}
