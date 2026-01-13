import { changeFeeCoinKey } from './entries/changeFeeCoinKey'
import { removeDuplicateCoins } from './entries/removeDuplicateCoins'

export const storageMigrationKeys = [
  'changeFeeCoinKey',
  'removeDuplicateCoins',
] as const

export type StorageMigrationKey = (typeof storageMigrationKeys)[number]

export const storageMigrations: Record<
  StorageMigrationKey,
  () => Promise<void>
> = {
  changeFeeCoinKey,
  removeDuplicateCoins,
}
