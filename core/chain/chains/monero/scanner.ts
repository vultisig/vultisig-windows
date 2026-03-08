import { initializeFromt } from '@core/mpc/fromt/initialize'
import { FromtWallet } from '@vultisig/fromt-sdk'

import { loadBirthHeight, saveBirthHeight } from './birthHeight'
import { getMoneroDaemonUrl } from './daemonRpc'
import {
  clearScanHeight,
  hasBirthdayScan,
  loadScanHeight,
  markBirthdayScan,
  saveScanHeight,
  saveScanTarget,
} from './scanProgress'

const balanceKey = (address: string): string => `monero-balance:${address}`

const saveBalance = (address: string, balance: bigint): void => {
  localStorage.setItem(balanceKey(address), String(balance))
}

const loadBalance = (address: string): bigint => {
  const raw = localStorage.getItem(balanceKey(address))
  if (!raw) return BigInt(0)
  return BigInt(raw)
}

export const getSpendableBalance = (address: string): bigint =>
  loadBalance(address)

type ScanParams = {
  keyShareBase64: string
  onProgress?: (current: number, total: number) => void
}

export const scanMoneroBlocks = async ({
  keyShareBase64,
  onProgress,
}: ScanParams): Promise<void> => {
  await initializeFromt()

  const keyShare = new Uint8Array(Buffer.from(keyShareBase64, 'base64'))
  const wallet = new FromtWallet(keyShare)
  const address = wallet.getAddress()
  const birthday = wallet.getBirthday()

  if (loadBirthHeight(address) === null && birthday > 0) {
    saveBirthHeight(address, birthday)
  }

  const birthHeight = loadBirthHeight(address)
  let savedHeight = loadScanHeight(address)

  const needsBirthdayRescan =
    birthHeight !== null &&
    !hasBirthdayScan(address) &&
    (savedHeight === null || savedHeight >= birthHeight)

  if (needsBirthdayRescan && savedHeight !== null) {
    clearScanHeight(address)
    savedHeight = null
  }

  const daemonUrl = getMoneroDaemonUrl()

  const result = await wallet.scanBalance(daemonUrl, progress => {
    saveScanTarget(address, progress.totalBlocks)
    saveScanHeight(address, progress.scannedBlocks)
    onProgress?.(progress.scannedBlocks, progress.totalBlocks)
  })

  saveBalance(address, BigInt(result.balance))
  saveScanHeight(address, result.scannedHeight)
  saveScanTarget(address, result.chainHeight)

  if (birthHeight !== null) {
    markBirthdayScan(address)
  }
}
