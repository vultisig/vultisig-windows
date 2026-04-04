import { ListItemIconWrapper } from '@core/ui/vault/settings'
import { BellIcon } from '@lib/ui/icons/BellIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { ListItem } from '@lib/ui/list/item'
import { useTranslation } from 'react-i18next'

/** Props for the shared push notification settings row (no platform hooks). */
type ManagePushNotificationsViewProps = {
  isRegistered: boolean | undefined
  isPending: boolean
  onToggle: () => void
}

/** Shared settings toggle for push notifications. */
export const ManagePushNotificationsView = ({
  isRegistered,
  isPending,
  onToggle,
}: ManagePushNotificationsViewProps) => {
  const { t } = useTranslation()

  return (
    <ListItem
      icon={
        <ListItemIconWrapper>
          <BellIcon />
        </ListItemIconWrapper>
      }
      extra={
        <Switch
          checked={isRegistered ?? false}
          disabled={isPending}
          data-testid="push-notifications-switch"
        />
      }
      onClick={() => {
        if (isPending) return
        onToggle()
      }}
      title={t('push_notifications')}
      hoverable
      data-testid="push-notifications-toggle"
    />
  )
}
