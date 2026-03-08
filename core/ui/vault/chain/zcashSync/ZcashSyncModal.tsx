import { getZcashZAddress } from '@core/chain/chains/zcash/getZcashZAddress'
import {
  loadScanHeight,
  loadScanTarget,
} from '@core/chain/chains/zcash/scanProgress'
import { getZcashVaultData } from '@core/chain/chains/zcash/zcashVaultData'
import { initializeFrozt } from '@core/mpc/frozt/initialize'
import { VStack } from '@lib/ui/layout/Stack'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { frozt_keyshare_bundle_birthday } from 'frozt-wasm'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type ScanStatus = {
  birthday: number | null
  scannedHeight: number | null
  targetHeight: number | null
}

export const ZcashSyncModal = ({ onClose }: OnCloseProp) => {
  const { t } = useTranslation()
  const [status, setStatus] = useState<ScanStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const vaultData = getZcashVaultData()
    if (!vaultData) {
      setError('No Zcash vault data')
      return
    }

    let cancelled = false
    let intervalId: ReturnType<typeof setInterval> | undefined

    const poll = (zAddress: string, birthday: number | null) => {
      if (cancelled) return
      setStatus({
        birthday,
        scannedHeight: loadScanHeight(zAddress),
        targetHeight: loadScanTarget(zAddress),
      })
    }

    const setup = async () => {
      await initializeFrozt()
      const bundle = Buffer.from(vaultData.bundle, 'base64')
      const birthday = Number(frozt_keyshare_bundle_birthday(bundle))
      const zAddress = await getZcashZAddress(
        vaultData.pubKeyPackage,
        vaultData.saplingExtras
      )
      return { zAddress, birthday: birthday || null }
    }

    setup()
      .then(({ zAddress, birthday }) => {
        if (cancelled) return
        poll(zAddress, birthday)
        intervalId = setInterval(() => poll(zAddress, birthday), 2000)
      })
      .catch(err => {
        if (!cancelled) {
          setError(String(err))
        }
      })

    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

  const isScanning =
    status !== null &&
    status.targetHeight !== null &&
    status.scannedHeight !== null &&
    status.scannedHeight < status.targetHeight

  const blocksToGo =
    status?.targetHeight && status?.scannedHeight
      ? status.targetHeight - status.scannedHeight
      : null

  return (
    <ResponsiveModal grabbable isOpen onClose={onClose}>
      <VStack gap={16} style={{ padding: '24px 24px 32px' }}>
        <Text size={18} weight="600" color="contrast">
          {t('zcash_sync_status')}
        </Text>

        <VStack gap={4}>
          <Text size={13} color="shy">
            {t('zcash_wallet_birthday')}
          </Text>
          <Text size={14} color="contrast">
            {status?.birthday
              ? status.birthday.toLocaleString()
              : t('not_synced')}
          </Text>
        </VStack>

        <VStack gap={4}>
          <Text size={13} color="shy">
            {t('zcash_scan_progress')}
          </Text>
          <Text size={14} color={isScanning ? 'primary' : 'contrast'}>
            {error
              ? error
              : isScanning
                ? blocksToGo
                  ? `${blocksToGo.toLocaleString()} ${t('blocks_to_go')}`
                  : `${t('syncing')}...`
                : status?.scannedHeight
                  ? `${t('synced')}: ${status.scannedHeight.toLocaleString()}`
                  : t('not_synced')}
          </Text>
        </VStack>
      </VStack>
    </ResponsiveModal>
  )
}
