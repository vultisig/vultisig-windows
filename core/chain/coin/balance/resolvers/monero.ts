import { getMoneroVaultData } from '@core/chain/chains/monero/moneroVaultData'
import {
  ensureMoneroScanDataSynced,
  getSpendableBalance,
} from '@core/chain/chains/monero/scanner'

import { CoinBalanceResolver } from '../resolver'

let activeScan: Promise<void> | null = null

export const getMoneroCoinBalance: CoinBalanceResolver = async _input => {
  const vaultData = getMoneroVaultData()
  if (!vaultData) return BigInt(0)

  if (!activeScan) {
    activeScan = ensureMoneroScanDataSynced({
      keyShareBase64: vaultData.keyShare,
      publicKeyEcdsa: vaultData.publicKeyEcdsa,
    })
      .then(() => undefined)
      .catch(error => {
        console.error('Monero scan failed:', error)
      })
      .finally(() => {
        activeScan = null
      })
  }

  if (activeScan) {
    await activeScan.catch(() => {})
  }

  return getSpendableBalance(vaultData.publicKeyEcdsa)
}
