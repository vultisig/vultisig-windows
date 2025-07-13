import { blocksPerYear } from '../constants'
import { getCurrentHeight } from './getCurrentHeight'
import { getUserThorchainNames } from './getUserThorchainNames'
import {
  getUserThorchainNameDetails,
  NameDetails,
} from './getUserThotchainNameDetails'

export type ValidThorchainNameDetails = NameDetails & {
  remainingBlocks: number
  remainingYears: number
}

export const fetchUserValidName = async (
  address: string
): Promise<ValidThorchainNameDetails> => {
  const [currentHeight, names] = await Promise.all([
    getCurrentHeight(),
    getUserThorchainNames(address),
  ])

  if (!names.length) throw new Error('User has no THORName')

  const details = await Promise.all(names.map(getUserThorchainNameDetails))

  const valid = details
    .filter(d => d.expire_block_height > currentHeight)
    .sort((a, b) => b.expire_block_height - a.expire_block_height)[0]

  if (!valid) throw new Error('All THORNames are expired')

  const remainingBlocks = valid.expire_block_height - currentHeight

  return {
    ...valid,
    remainingBlocks,
    remainingYears: remainingBlocks / blocksPerYear,
  }
}
