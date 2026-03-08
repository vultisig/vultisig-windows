export const isZcashShieldedAddress = (address: string): boolean =>
  (address.startsWith('zs1') && address.length >= 78) ||
  (address.startsWith('u1') && address.length >= 50)
