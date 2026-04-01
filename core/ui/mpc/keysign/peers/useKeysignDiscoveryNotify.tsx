import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { notifyVaultDevices } from '@core/ui/notifications/pushNotificationApi'
import { notificationApiServerUrl } from '@core/ui/notifications/pushNotificationServerUrl'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { computeNotificationVaultId } from '@vultisig/sdk'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { KeysignNotificationSentToast } from './KeysignNotificationSentToast'

/**
 * Ensures at most one successful auto-notify per keysign session (survives Strict Mode remounts).
 * Manual resend is unaffected.
 */
const keysignAutoNotifySucceededSessions = new Set<string>()

/** Formats seconds as `m:ss` for the resend countdown label (e.g. `0:30`). */
export const formatResendCooldownTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

type UseKeysignDiscoveryNotifyInput = {
  qrCodeData: string | undefined
}

type UseKeysignDiscoveryNotifyResult = {
  cooldownSec: number
  isSending: boolean
  resendDisabled: boolean
  onResend: () => void
}

/**
 * Auto-sends keysign discovery push when `qrCodeData` is ready, shows success toast,
 * and manages a 30s resend cooldown matching iOS.
 */
export const useKeysignDiscoveryNotify = ({
  qrCodeData,
}: UseKeysignDiscoveryNotifyInput): UseKeysignDiscoveryNotifyResult => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const { addToast } = useToast()
  const sessionId = useMpcSessionId()
  const [cooldownSec, setCooldownSec] = useState(0)
  const [isSending, setIsSending] = useState(false)
  const notifyInFlightRef = useRef(false)

  useEffect(() => {
    if (cooldownSec <= 0) return
    const id = window.setTimeout(() => {
      setCooldownSec(c => Math.max(0, c - 1))
    }, 1000)
    return () => window.clearTimeout(id)
  }, [cooldownSec])

  const runNotifyRef = useRef<() => Promise<boolean>>(async () => false)

  runNotifyRef.current = async (): Promise<boolean> => {
    if (!qrCodeData) return false
    if (notifyInFlightRef.current) return false

    notifyInFlightRef.current = true
    setIsSending(true)
    try {
      const vaultId = await computeNotificationVaultId(
        vault.publicKeys.ecdsa,
        vault.hexChainCode
      )
      await notifyVaultDevices({
        serverUrl: notificationApiServerUrl,
        vaultId,
        vaultName: vault.name,
        localPartyId: vault.localPartyId,
        qrCodeData,
      })
      addToast({
        message: t('notification_sent_successfully'),
        // iOS uses ~1.5s; slightly longer so the toast stays visible after network latency.
        duration: 2000,
        renderContent: message => (
          <KeysignNotificationSentToast message={message} />
        ),
      })
      setCooldownSec(30)
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown'
      console.error('[Keysign] notify vault devices failed:', message)
      return false
    } finally {
      notifyInFlightRef.current = false
      setIsSending(false)
    }
  }

  useEffect(() => {
    if (!qrCodeData) return
    if (keysignAutoNotifySucceededSessions.has(sessionId)) return

    void (async () => {
      const ok = await runNotifyRef.current()
      if (ok) {
        keysignAutoNotifySucceededSessions.add(sessionId)
      }
    })()
  }, [qrCodeData, sessionId])

  const onResend = () => {
    if (cooldownSec > 0) return
    void runNotifyRef.current()
  }

  return {
    cooldownSec,
    isSending,
    resendDisabled: cooldownSec > 0 || isSending,
    onResend,
  }
}
