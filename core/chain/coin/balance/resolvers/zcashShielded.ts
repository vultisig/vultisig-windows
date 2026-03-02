import { getUnspentNotes } from '@core/chain/chains/zcash/SaplingNote'
import { scanBlocks } from '@core/chain/chains/zcash/scanner'
import { loadScannerKeys } from '@core/chain/chains/zcash/scannerKeys'

import { CoinBalanceResolver } from '../resolver'

let activeScan: Promise<void> | null = null

export const getZcashShieldedCoinBalance: CoinBalanceResolver = async ({
  address,
}) => {
  const keys = loadScannerKeys(address)
  if (keys) {
    if (activeScan) {
      await activeScan.catch(() => {})
    } else {
      const scanPromise = scanBlocks({
        zAddress: address,
        pubKeyPackage: new Uint8Array(
          Buffer.from(keys.pubKeyPackage, 'base64')
        ),
        saplingExtras: new Uint8Array(
          Buffer.from(keys.saplingExtras, 'base64')
        ),
      })
      activeScan = scanPromise
      try {
        await scanPromise
      } catch (error) {
        console.error('ZcashShielded scan failed:', error)
      } finally {
        activeScan = null
      }
    }
  }

  const notes = getUnspentNotes(address)
  const total = notes.reduce((sum, note) => sum + note.value, 0)
  return BigInt(total)
}
