export const bigIntToHex = (value: bigint): string => {
  let hexString = value.toString(16);
  if (hexString.length % 2 !== 0) {
    hexString = '0' + hexString;
  }
  return hexString;
};
