import { blocksPerYear } from '../config'
import { getCurrentHeight } from './getCurrentHeight'
import {
  getUserThorchainNameDetails,
  NameDetails,
} from './getUserThorchainNameDetails'
import { getUserThorchainNames } from './getUserThorchainNames'

export type ValidThorchainNameDetails = NameDetails & {
  remainingBlocks: number
  remainingYears: number
}

export const fetchUserValidName = async (
  address: string
): Promise<ValidThorchainNameDetails | undefined> => {
  const [currentHeight, names] = await Promise.all([
    getCurrentHeight(),
    getUserThorchainNames(address),
  ])

  if (!names.length) return undefined

  const details = await Promise.all(names.map(getUserThorchainNameDetails))

  const valid = details
    .filter(d => d.expire_block_height > currentHeight)
    .sort((a, b) => b.expire_block_height - a.expire_block_height)[0]

  if (!valid) return undefined

  const remainingBlocks = valid.expire_block_height - currentHeight

  return {
    ...valid,
    remainingBlocks,
    remainingYears: remainingBlocks / blocksPerYear,
  }
}
