import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { SaplingNote } from './SaplingNote'

export const currentNullifierVersion = 1

export type ZcashScanData = {
  zAddress: string
  publicKeyEcdsa: string
  scanHeight: number | null
  scanTarget: number | null
  birthHeight: number | null
  birthdayScanDone: boolean
  pubKeyPackage: string
  saplingExtras: string
  notes: SaplingNote[]
  nullifierVersion?: number
}

export type ZcashScanStorage = {
  load: (publicKeyEcdsa: string) => Promise<ZcashScanData | null>
  save: (data: ZcashScanData) => Promise<void>
}

let storage: ZcashScanStorage | null = null

export const setZcashScanStorage = (s: ZcashScanStorage): void => {
  storage = s
}

export const getZcashScanStorage = (): ZcashScanStorage =>
  shouldBePresent(storage, 'ZcashScanStorage')
