import { getZcashZAddress } from '@core/chain/chains/zcash/getZcashZAddress'
import { getLatestBlock } from '@core/chain/chains/zcash/lightwalletd/client'
import { getZcashScanStorage } from '@core/chain/chains/zcash/zcashScanStorage'
import { getZcashVaultData } from '@core/chain/chains/zcash/zcashVaultData'
import { initializeFrozt } from '@core/mpc/frozt/initialize'
import { OnCloseProp } from '@lib/ui/props'
import { frozt_keyshare_bundle_birthday } from 'frozt-wasm'
import { useTranslation } from 'react-i18next'

import { ChainSyncModal } from '../ChainSyncModal'

export const ZcashSyncModal = ({ onClose }: OnCloseProp) => {
  const { t } = useTranslation()

  const setup = async () => {
    const vaultData = getZcashVaultData()
    if (!vaultData) throw new Error('No Zcash vault data')

    await initializeFrozt()
    const bundle = Buffer.from(vaultData.bundle, 'base64')
    const birthday = Number(frozt_keyshare_bundle_birthday(bundle))
    const identifier = await getZcashZAddress(
      vaultData.pubKeyPackage,
      vaultData.saplingExtras
    )
    let chainTip: number | null = null
    try {
      const latest = await getLatestBlock()
      chainTip = Number(latest.height)
    } catch {
      // chain tip fetch failed, continue without it
    }
    return { identifier, birthday: birthday || null, chainTip }
  }

  const loadScanHeight = async (zAddress: string) => {
    const data = await getZcashScanStorage().load(zAddress)
    return data?.scanHeight ?? null
  }

  const loadScanTarget = async (zAddress: string) => {
    const data = await getZcashScanStorage().load(zAddress)
    return data?.scanTarget ?? null
  }

  return (
    <ChainSyncModal
      onClose={onClose}
      title={t('zcash_sync_status')}
      setup={setup}
      loadScanHeight={loadScanHeight}
      loadScanTarget={loadScanTarget}
    />
  )
}
