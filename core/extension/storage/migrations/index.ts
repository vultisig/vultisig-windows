import { changeFeeCoinKey } from './entries/changeFeeCoinKey'
import { removeDuplicateCoins } from './entries/removeDuplicateCoins'
import { removeUnapprovedKeplrSuggestedChains } from './entries/removeUnapprovedKeplrSuggestedChains'

export const storageMigrationKeys = [
  'changeFeeCoinKey',
  'removeDuplicateCoins',
  'removeUnapprovedKeplrSuggestedChains',
] as const

export type StorageMigrationKey = (typeof storageMigrationKeys)[number]

export const storageMigrations: Record<
  StorageMigrationKey,
  () => Promise<void>
> = {
  changeFeeCoinKey,
  removeDuplicateCoins,
  removeUnapprovedKeplrSuggestedChains,
}
