import { changeFeeCoinKey } from './entries/changeFeeCoinKey'

export const storageMigrationKeys = ['changeFeeCoinKey'] as const

export type StorageMigrationKey = (typeof storageMigrationKeys)[number]

export const storageMigrations: Record<
  StorageMigrationKey,
  () => Promise<void>
> = {
  changeFeeCoinKey,
}
