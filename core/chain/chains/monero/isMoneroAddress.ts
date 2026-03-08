export const isMoneroAddress = (address: string): boolean =>
  address.startsWith('4') && address.length === 95
