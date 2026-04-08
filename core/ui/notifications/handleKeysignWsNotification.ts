import type { TFunction } from 'i18next'

import type { KeysignWsNotification } from './keysignNotificationWebSocket'
import type { NotificationBannerData } from './NotificationBannerProvider'
import { parseKeysignQrForNotificationBanner } from './parseKeysignQrForNotificationBanner'
import { shouldShowKeysignNotificationBannerForView } from './shouldShowKeysignNotificationBannerForView'

type HandleKeysignWsNotificationInput = {
  msg: KeysignWsNotification
  ws: WebSocket
  vaultId: string
  localPartyName: string
  t: TFunction
  /** Current navigation stack top view id (in-app banner blocked on keysign / joinKeysign / deeplink). */
  topView: { id: string }
  vaultBannerMeta: Map<string, { isFastVault: boolean }>
  navigateToKeysign: () => void
  showBanner: (data: NotificationBannerData) => void
  /** Desktop: bring Wails window forward. Extension: optional no-op. */
  bringAppToFront?: () => void
  /** Show a system notification when permitted (desktop / extension page). */
  showOsNotification?: (input: {
    title: string
    body: string
    /** Extension: used for chrome.notifications click. Desktop: native toast has no click hook. */
    onClick?: () => void
  }) => void
}

/**
 * Parses keysign QR data, suppresses initiator device (same party as
 * {@code vaultLocalPartyId} in payload), shows in-app banner on allowed views,
 * and triggers OS notification / window focus for recipients.
 */
export const handleKeysignWsNotification = async (
  input: HandleKeysignWsNotificationInput
): Promise<void> => {
  const {
    msg,
    ws,
    vaultId,
    localPartyName,
    t,
    topView,
    vaultBannerMeta,
    navigateToKeysign,
    showBanner,
    bringAppToFront,
    showOsNotification,
  } = input

  let parsed: Awaited<
    ReturnType<typeof parseKeysignQrForNotificationBanner>
  > | null = null
  try {
    parsed = await parseKeysignQrForNotificationBanner({
      qrCodeData: msg.qr_code_data,
      t: {
        foreground_notification_swap: v => t('foreground_notification_swap', v),
        foreground_notification_send: v => t('foreground_notification_send', v),
        foreground_notification_generic: () =>
          t('foreground_notification_generic'),
      },
    })
  } catch {
    parsed = null
  }

  const normalizedParty = (value: string) => value.trim()
  const initiatorId = parsed?.initiatorPartyId
  const suppressForInitiator =
    Boolean(initiatorId) &&
    normalizedParty(initiatorId ?? '') === normalizedParty(localPartyName)

  const meta = vaultBannerMeta.get(vaultId)
  const isFastVault = meta?.isFastVault ?? false

  const allowInAppBanner =
    shouldShowKeysignNotificationBannerForView(topView) && !suppressForInitiator

  const ack = () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ack', id: msg.id }))
    }
  }

  try {
    if (allowInAppBanner) {
      showBanner({
        title: t('join_transaction'),
        vaultName: msg.vault_name,
        description:
          parsed?.description ?? t('foreground_notification_generic'),
        isFastVault,
        onAction: navigateToKeysign,
      })
    }

    if (!suppressForInitiator) {
      showOsNotification?.({
        title: t('join_transaction'),
        body: `${t('vault')}: ${msg.vault_name}`,
        onClick: () => {
          navigateToKeysign()
        },
      })
    }

    if (!suppressForInitiator) {
      bringAppToFront?.()
    }
  } finally {
    ack()
  }
}
