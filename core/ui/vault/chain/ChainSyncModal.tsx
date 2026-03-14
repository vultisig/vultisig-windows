import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

type ScanStatus = {
  birthday: number | null
  scannedHeight: number | null
  targetHeight: number | null
  chainTip: number | null
}

type ChainSyncSetupResult = {
  identifier: string
  birthday: number | null
  chainTip?: number | null
}

type ChainSyncModalProps = OnCloseProp & {
  title: string
  setup: () => Promise<ChainSyncSetupResult>
  loadScanHeight: (identifier: string) => Promise<number | null>
  loadScanTarget: (identifier: string) => Promise<number | null>
  resetScanHeight: (
    identifier: string,
    birthday: number | null
  ) => Promise<void>
  onSynced?: () => Promise<void> | void
}

export const ChainSyncModal = ({
  onClose,
  title,
  setup,
  loadScanHeight,
  loadScanTarget,
  resetScanHeight,
  onSynced,
}: ChainSyncModalProps) => {
  const { t } = useTranslation()
  const [status, setStatus] = useState<ScanStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [identifier, setIdentifier] = useState<string | null>(null)
  const hasNotifiedSynced = useRef(false)

  useEffect(() => {
    let cancelled = false
    let intervalId: ReturnType<typeof setInterval> | undefined

    const poll = async (
      identifier: string,
      birthday: number | null,
      chainTip: number | null
    ) => {
      if (cancelled) return
      const [scannedHeight, targetHeight] = await Promise.all([
        loadScanHeight(identifier),
        loadScanTarget(identifier),
      ])
      if (cancelled) return
      setStatus({
        birthday,
        scannedHeight,
        targetHeight,
        chainTip,
      })
    }

    setup()
      .then(({ identifier: id, birthday, chainTip = null }) => {
        if (cancelled) return
        setIdentifier(id)
        poll(id, birthday, chainTip)
        intervalId = setInterval(() => poll(id, birthday, chainTip), 2000)
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
  }, [loadScanHeight, loadScanTarget, setup])

  const scannedHeight = status?.scannedHeight ?? status?.birthday ?? null
  const total = status?.targetHeight ?? status?.chainTip ?? null
  const isSynced =
    scannedHeight !== null && total !== null && scannedHeight >= total
  const blocksRemaining =
    scannedHeight !== null && total !== null && !isSynced
      ? total - scannedHeight
      : null

  useEffect(() => {
    if (!onSynced) return

    if (!isSynced) {
      hasNotifiedSynced.current = false
      return
    }

    if (hasNotifiedSynced.current) return
    hasNotifiedSynced.current = true

    Promise.resolve(onSynced()).catch(err => {
      console.error('Failed to refresh balances after chain sync:', err)
    })
  }, [isSynced, onSynced])

  return (
    <ResponsiveModal grabbable isOpen onClose={onClose}>
      <VStack gap={16} style={{ padding: '24px 24px 32px' }}>
        <Text size={18} weight="600" color="contrast">
          {title}
        </Text>

        <VStack gap={4}>
          <Text size={13} color="shy">
            {t('chain_sync_wallet_birthday')}
          </Text>
          <Text size={14} color="contrast">
            {status?.birthday ? status.birthday.toLocaleString() : '—'}
          </Text>
        </VStack>

        {status?.chainTip && (
          <VStack gap={4}>
            <Text size={13} color="shy">
              {t('chain_sync_chain_tip')}
            </Text>
            <Text size={14} color="contrast">
              {status.chainTip.toLocaleString()}
            </Text>
          </VStack>
        )}

        {scannedHeight !== null && (
          <VStack gap={4}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text size={13} color="shy">
                {t('chain_sync_scanned_height')}
              </Text>
              {identifier && (
                <Text
                  size={12}
                  color="danger"
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    resetScanHeight(identifier, status?.birthday ?? null)
                  }
                >
                  {t('reset_sync')}
                </Text>
              )}
            </HStack>
            <Text size={14} color="contrast">
              {scannedHeight.toLocaleString()}
            </Text>
          </VStack>
        )}

        <VStack gap={4}>
          <Text size={13} color="shy">
            {t('chain_sync_scan_progress')}
          </Text>
          {error ? (
            <Text size={14} color="danger">
              {error}
            </Text>
          ) : isSynced ? (
            <Text size={14} color="contrast">
              {t('synced')}
            </Text>
          ) : (
            <HStack alignItems="center" gap={8}>
              <Spinner size={16} />
              <Text size={14} color="primary">
                {blocksRemaining
                  ? `${blocksRemaining.toLocaleString()} ${t('blocks_to_go')}`
                  : `${t('syncing')}...`}
              </Text>
            </HStack>
          )}
        </VStack>
      </VStack>
    </ResponsiveModal>
  )
}
