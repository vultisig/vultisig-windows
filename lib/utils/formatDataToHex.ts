import { isHex, stringToHex } from 'viem'

export const formatDataToHex = (data: string): `0x${string}` => {
  if (isHex(data)) return data
  return stringToHex(data)
}
