import {
  useDisablePushNotificationsMutation,
  useEnablePushNotificationsMutation,
  usePushNotificationStatus,
} from '@clients/extension/src/notifications/usePushNotificationsRegistration'
import { ManagePushNotificationsView } from '@core/ui/notifications/ManagePushNotificationsView'

/** Extension-specific push notification toggle backed by Web Push registration hooks. */
export const ManagePushNotifications = () => {
  const { data: isRegistered } = usePushNotificationStatus()
  const { mutate: enable, isPending: isEnabling } =
    useEnablePushNotificationsMutation()
  const { mutate: disable, isPending: isDisabling } =
    useDisablePushNotificationsMutation()

  const isPending = isEnabling || isDisabling

  return (
    <ManagePushNotificationsView
      isRegistered={isRegistered}
      isPending={isPending}
      onToggle={() => {
        if (isRegistered) {
          disable()
        } else {
          enable()
        }
      }}
    />
  )
}
