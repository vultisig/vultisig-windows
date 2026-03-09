import {
  getSpendableBalance,
  scanBlocks,
} from '@core/chain/chains/zcash/scanner'
import { getZcashScanStorage } from '@core/chain/chains/zcash/zcashScanStorage'
import { getZcashVaultData } from '@core/chain/chains/zcash/zcashVaultData'
import { initializeFrozt } from '@core/mpc/frozt/initialize'
import { frozt_keyshare_bundle_birthday } from 'frozt-wasm'

import { CoinBalanceResolver } from '../resolver'

let activeScan: Promise<void> | null = null

export const getZcashShieldedCoinBalance: CoinBalanceResolver = async input => {
  const vaultData = getZcashVaultData()
  if (!vaultData) return BigInt(0)

  const zAddress = input.address

  if (!activeScan) {
    activeScan = (async () => {
      await initializeFrozt()

      const storage = getZcashScanStorage()
      const scanData = await storage.load(zAddress)

      if (!scanData?.birthHeight) {
        const bundle = Buffer.from(vaultData.bundle, 'base64')
        const birthday = Number(frozt_keyshare_bundle_birthday(bundle))
        if (birthday > 0) {
          const existing = scanData ?? {
            zAddress,
            publicKeyEcdsa: vaultData.publicKeyEcdsa,
            scanHeight: null,
            scanTarget: null,
            birthHeight: null,
            birthdayScanDone: false,
            pubKeyPackage: vaultData.pubKeyPackage,
            saplingExtras: vaultData.saplingExtras,
            notes: [],
          }
          await storage.save({ ...existing, birthHeight: birthday })
        }
      }

      await scanBlocks({
        zAddress,
        publicKeyEcdsa: vaultData.publicKeyEcdsa,
        pubKeyPackage: Buffer.from(vaultData.pubKeyPackage, 'base64'),
        saplingExtras: Buffer.from(vaultData.saplingExtras, 'base64'),
      })
    })()

    try {
      await activeScan
    } catch (error) {
      console.error('ZcashShielded scan failed:', error)
    } finally {
      activeScan = null
    }
  } else {
    await activeScan.catch(() => {})
  }

  return getSpendableBalance(zAddress)
}
