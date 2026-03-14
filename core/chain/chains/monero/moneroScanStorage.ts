import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

export type MoneroStoredOutput = {
  amount: string
  keyOffsetHex: string
  outputKeyHex: string
  commitmentMaskHex?: string
  globalIndex?: string
  height?: number
  keyImageHex?: string
  spent: boolean
  frozen?: boolean
  locked?: boolean
}

export type MoneroScanData = {
  address: string
  publicKeyEcdsa: string
  scanHeight: number | null
  scanTarget: number | null
  birthHeight: number | null
  birthdayScanDone: boolean
  balance: string
  totalOutputs?: number
  spentOutputs?: number
  spendDetectionMode?:
    | 'wallet'
    | 'wallet+local'
    | 'key-image-pending'
    | 'key-image+local'
  walletKeysData?: string
  walletCacheData?: string
  outputs?: MoneroStoredOutput[]
}

export type MoneroScanStorage = {
  load: (publicKeyEcdsa: string) => Promise<MoneroScanData | null>
  save: (data: MoneroScanData) => Promise<void>
}

let storage: MoneroScanStorage | null = null

export const setMoneroScanStorage = (s: MoneroScanStorage): void => {
  storage = s
}

export const getMoneroScanStorage = (): MoneroScanStorage =>
  shouldBePresent(storage, 'MoneroScanStorage')
