import { Chain } from '@core/chain/Chain'
import {
  loadBirthHeight,
  saveBirthHeight,
} from '@core/chain/chains/zcash/birthHeight'
import {
  clearScanHeight,
  loadScanHeight,
  loadScanTarget,
} from '@core/chain/chains/zcash/scanProgress'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { Button } from '@lib/ui/buttons/Button'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const ZcashSyncModal = ({ onClose }: OnCloseProp) => {
  const { t } = useTranslation()
  const address = useCurrentVaultAddress(Chain.ZcashShielded)
  const currentBirthHeight = loadBirthHeight(address)
  const [scanHeight, setScanHeight] = useState(loadScanHeight(address))
  const [scanTarget, setScanTarget] = useState(loadScanTarget(address))
  const [birthHeightInput, setBirthHeightInput] = useState(
    String(currentBirthHeight ?? '')
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setScanHeight(loadScanHeight(address))
      setScanTarget(loadScanTarget(address))
    }, 1000)
    return () => clearInterval(interval)
  }, [address])

  const handleSave = () => {
    const height = parseInt(birthHeightInput, 10)
    if (isNaN(height) || height <= 0) return
    saveBirthHeight(address, height)
    clearScanHeight(address)
  }

  const isSynced =
    scanHeight && scanTarget && scanHeight > 0 && scanHeight >= scanTarget
  const blocksToGo =
    scanHeight && scanTarget && scanTarget > scanHeight
      ? scanTarget - scanHeight
      : null

  return (
    <ResponsiveModal grabbable isOpen onClose={onClose}>
      <VStack gap={16} style={{ padding: '24px 24px 32px' }}>
        <Text size={18} weight="600" color="contrast">
          {t('zcash_sync_status')}
        </Text>

        <VStack gap={4}>
          <Text size={13} color="shy">
            {t('zcash_scan_progress')}
          </Text>
          <Text size={14} color={isSynced ? 'contrast' : 'primary'}>
            {isSynced
              ? `${t('synced')}: ${scanHeight}`
              : blocksToGo
                ? `${blocksToGo.toLocaleString()} ${t('blocks_to_go')}`
                : scanTarget
                  ? `${t('syncing')}...`
                  : t('not_synced')}
          </Text>
        </VStack>

        <VStack gap={4}>
          <Text size={13} color="shy">
            {t('zcash_wallet_birthday')}
          </Text>
          <TextInput
            value={birthHeightInput}
            onValueChange={setBirthHeightInput}
            placeholder={t('zcash_wallet_birthday_placeholder')}
          />
        </VStack>

        <Button onClick={handleSave}>{t('save')}</Button>
      </VStack>
    </ResponsiveModal>
  )
}
