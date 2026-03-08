import { getMoneroAddress } from '@core/chain/chains/monero/getMoneroAddress'
import { getMoneroVaultData } from '@core/chain/chains/monero/moneroVaultData'
import {
  loadScanHeight as loadMoneroScanHeight,
  loadScanTarget as loadMoneroScanTarget,
} from '@core/chain/chains/monero/scanProgress'
import { initializeFromt } from '@core/mpc/fromt/initialize'
import { VStack } from '@lib/ui/layout/Stack'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { fromt_keyshare_birthday } from 'fromt-wasm'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type ScanStatus = {
  birthday: number | null
  scannedHeight: number | null
  targetHeight: number | null
}

export const MoneroSyncModal = ({ onClose }: OnCloseProp) => {
  const { t } = useTranslation()
  const [status, setStatus] = useState<ScanStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const vaultData = getMoneroVaultData()
    if (!vaultData) {
      setError('No Monero vault data')
      return
    }

    let cancelled = false
    let intervalId: ReturnType<typeof setInterval> | undefined

    const poll = (address: string, birthday: number | null) => {
      if (cancelled) return
      setStatus({
        birthday,
        scannedHeight: loadMoneroScanHeight(address),
        targetHeight: loadMoneroScanTarget(address),
      })
    }

    const setup = async () => {
      await initializeFromt()
      const keyShare = new Uint8Array(Buffer.from(vaultData.keyShare, 'base64'))
      const birthday = Number(fromt_keyshare_birthday(keyShare))
      const address = await getMoneroAddress(vaultData.keyShare)
      return { address, birthday: birthday || null }
    }

    setup()
      .then(({ address, birthday }) => {
        if (cancelled) return
        poll(address, birthday)
        intervalId = setInterval(() => poll(address, birthday), 2000)
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
          {t('monero_sync_status')}
        </Text>

        <VStack gap={4}>
          <Text size={13} color="shy">
            {t('monero_wallet_birthday')}
          </Text>
          <Text size={14} color="contrast">
            {status?.birthday
              ? status.birthday.toLocaleString()
              : t('not_synced')}
          </Text>
        </VStack>

        <VStack gap={4}>
          <Text size={13} color="shy">
            {t('monero_scan_progress')}
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
