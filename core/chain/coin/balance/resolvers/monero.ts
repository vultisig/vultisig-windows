import { getMoneroVaultData } from '@core/chain/chains/monero/moneroVaultData'
import {
  getSpendableBalance,
  scanMoneroBlocks,
} from '@core/chain/chains/monero/scanner'

import { CoinBalanceResolver } from '../resolver'

let activeScan: Promise<void> | null = null

export const getMoneroCoinBalance: CoinBalanceResolver = async input => {
  const vaultData = getMoneroVaultData()
  if (!vaultData) return BigInt(0)

  const address = input.address

  if (!activeScan) {
    activeScan = (async () => {
      await scanMoneroBlocks({
        keyShareBase64: vaultData.keyShare,
        publicKeyEcdsa: vaultData.publicKeyEcdsa,
      })
    })()

    try {
      await activeScan
    } catch (error) {
      console.error('Monero scan failed:', error)
    } finally {
      activeScan = null
    }
  } else {
    await activeScan.catch(() => {})
  }

  return getSpendableBalance(address)
}
