import Long from 'long'
export const numberToHex = (num: number) => `0x${num.toString(16)}`

export const numberToEvenHex = (amount: number | Long | bigint) => {
  let hex = amount.toString(16)
  if (hex.length % 2 !== 0) {
    hex = '0' + hex
  }
  return hex
}
