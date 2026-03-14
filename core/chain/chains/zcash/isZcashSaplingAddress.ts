export const isZcashSaplingAddress = (address: string): boolean =>
  (address.startsWith('zs1') && address.length >= 78) ||
  (address.startsWith('u1') && address.length >= 50)

export const isZcashSaplingSpendAddress = (address: string): boolean =>
  isZcashSaplingAddress(address) ||
  ((address.startsWith('ur1') ||
    address.startsWith('t1') ||
    address.startsWith('t3')) &&
    address.length >= 34)
