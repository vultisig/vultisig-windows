import { blocksPerYear, blockTimeSec } from '../config'
import { getCurrentHeight } from './getCurrentHeight'
import {
  getUserThorchainNameDetails,
  NameDetails,
} from './getUserThorchainNameDetails'
import { getUserThorchainNames } from './getUserThorchainNames'

export type ValidThorchainNameDetails = NameDetails & {
  remainingBlocks: number
  remainingYears: number
  collectedRune: number
  expiresOn: Date
}

export const fetchUserValidName = async (
  address: string
): Promise<ValidThorchainNameDetails | null> => {
  const [currentHeight, names] = await Promise.all([
    getCurrentHeight(),
    getUserThorchainNames(address),
  ])
  if (!names.length) return null

  const details = await Promise.all(names.map(getUserThorchainNameDetails))

  const valid = details
    .filter(d => d.expire_block_height > currentHeight)
    .sort((a, b) => b.expire_block_height - a.expire_block_height)[0]
  if (!valid) return null

  const remainingBlocks = valid.expire_block_height - currentHeight
  const remainingYears = remainingBlocks / blocksPerYear
  const collectedRune = parseFloat(valid.affiliate_collector_rune)
  const expiresOn = new Date(
    Date.now() + remainingBlocks * blockTimeSec * 1_000
  )

  return {
    ...valid,
    remainingBlocks,
    remainingYears,
    collectedRune,
    expiresOn,
  }
}
