import {
  useDisablePushNotificationsMutation,
  useEnablePushNotificationsMutation,
  usePushNotificationStatus,
} from '@clients/extension/src/notifications/usePushNotificationsRegistration'
import { ListItemIconWrapper } from '@core/ui/vault/settings'
import { BellIcon } from '@lib/ui/icons/BellIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { ListItem } from '@lib/ui/list/item'
import { useTranslation } from 'react-i18next'

export const ManagePushNotifications = () => {
  const { t } = useTranslation()
  const { data: isRegistered } = usePushNotificationStatus()
  const { mutate: enable, isPending: isEnabling } =
    useEnablePushNotificationsMutation()
  const { mutate: disable, isPending: isDisabling } =
    useDisablePushNotificationsMutation()

  const isPending = isEnabling || isDisabling

  return (
    <ListItem
      icon={
        <ListItemIconWrapper>
          <BellIcon />
        </ListItemIconWrapper>
      }
      extra={<Switch checked={isRegistered ?? false} disabled={isPending} />}
      onClick={() => {
        if (isPending) return
        if (isRegistered) {
          disable()
        } else {
          enable()
        }
      }}
      title={t('push_notifications')}
      hoverable
    />
  )
}
